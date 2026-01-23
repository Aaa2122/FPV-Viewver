/**
 * RotorBuilds Component Scraper
 * 
 * Scrapes component data from RotorBuilds.com builds
 * WARNING: Respect RotorBuilds' Terms of Service and rate limits
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
    MAX_BUILDS: 50, // Limiter pour ne pas surcharger le serveur
    DELAY_BETWEEN_REQUESTS: 2000, // 2 secondes entre chaque requête
    OUTPUT_DIR: './scraped-data',
    HEADLESS: true
};

class RotorBuildsScrap {
    constructor() {
        this.components = {
            frames: new Map(),
            motors: new Map(),
            stacks: new Map(),
            cameras: new Map(),
            vtx: new Map(),
            batteries: new Map(),
            props: new Map()
        };
        this.browser = null;
        this.page = null;
    }

    async init() {
        console.log('🚀 Initializing browser...');
        this.browser = await puppeteer.launch({
            headless: CONFIG.HEADLESS,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();

        // Set user agent to avoid blocking
        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        );
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async scrapeBuildsList() {
        console.log('📋 Fetching builds list from RotorBuilds...');

        try {
            await this.page.goto('https://rotorbuilds.com/builds', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Extract build URLs
            const buildUrls = await this.page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('a[href*="/build/"]'));
                return links
                    .map(link => link.href)
                    .filter((url, index, self) => self.indexOf(url) === index) // Remove duplicates
                    .slice(0, 50); // Limit to first 50
            });

            console.log(`✅ Found ${buildUrls.length} builds`);
            return buildUrls;
        } catch (error) {
            console.error('❌ Error fetching builds list:', error.message);
            return [];
        }
    }

    extractComponentData(element, category) {
        // Parse component information from build page
        // This will need to be adjusted based on actual RotorBuilds HTML structure

        const name = element.querySelector('.component-name')?.textContent?.trim();
        const manufacturer = element.querySelector('.manufacturer')?.textContent?.trim();
        const specs = {};

        // Extract specs based on category
        const specElements = element.querySelectorAll('.spec-item');
        specElements.forEach(spec => {
            const key = spec.querySelector('.spec-label')?.textContent?.trim();
            const value = spec.querySelector('.spec-value')?.textContent?.trim();
            if (key && value) {
                specs[key] = value;
            }
        });

        return { name, manufacturer, specs };
    }

    async scrapeBuild(buildUrl) {
        console.log(`🔍 Scraping build: ${buildUrl}`);

        try {
            await this.page.goto(buildUrl, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for content to load
            await this.delay(1000);

            // Extract components from the build
            const buildData = await this.page.evaluate(() => {
                const data = {
                    title: document.querySelector('h1')?.textContent?.trim() || '',
                    components: {}
                };

                // This is a template - adjust selectors based on actual RotorBuilds HTML
                const componentSections = {
                    frame: '.build-frame',
                    motors: '.build-motors',
                    stack: '.build-fc-esc',
                    camera: '.build-camera',
                    vtx: '.build-vtx',
                    battery: '.build-battery',
                    props: '.build-props'
                };

                Object.entries(componentSections).forEach(([category, selector]) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        const name = element.querySelector('.part-name')?.textContent?.trim();
                        const link = element.querySelector('a')?.href;

                        if (name) {
                            data.components[category] = {
                                name,
                                link,
                                raw: element.textContent.trim()
                            };
                        }
                    }
                });

                return data;
            });

            this.addComponents(buildData.components);

            return buildData;
        } catch (error) {
            console.error(`❌ Error scraping ${buildUrl}:`, error.message);
            return null;
        }
    }

    addComponents(components) {
        Object.entries(components).forEach(([category, component]) => {
            if (!component || !component.name) return;

            const categoryMap = this.components[category + 's'] || this.components[category];
            if (!categoryMap) return;

            const key = `${component.name}`.toLowerCase();

            if (!categoryMap.has(key)) {
                categoryMap.set(key, {
                    name: component.name,
                    link: component.link,
                    occurrences: 1,
                    rawData: [component.raw]
                });
            } else {
                const existing = categoryMap.get(key);
                existing.occurrences++;
                existing.rawData.push(component.raw);
            }
        });
    }

    async scrapeAll() {
        console.log('\n🕷️  Starting RotorBuilds Scraper\n');

        await this.init();

        // Get list of builds
        const buildUrls = await this.scrapeBuildsList();

        if (buildUrls.length === 0) {
            console.log('⚠️  No builds found. Exiting.');
            return;
        }

        // Scrape each build with rate limiting
        for (let i = 0; i < Math.min(buildUrls.length, CONFIG.MAX_BUILDS); i++) {
            console.log(`\n--- Build ${i + 1}/${Math.min(buildUrls.length, CONFIG.MAX_BUILDS)} ---`);

            await this.scrapeBuild(buildUrls[i]);

            // Respect rate limits
            if (i < buildUrls.length - 1) {
                console.log(`⏳ Waiting ${CONFIG.DELAY_BETWEEN_REQUESTS}ms...`);
                await this.delay(CONFIG.DELAY_BETWEEN_REQUESTS);
            }
        }

        await this.saveResults();
        await this.close();
    }

    async saveResults() {
        console.log('\n💾 Saving results...');

        // Create output directory
        await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

        // Convert Maps to Arrays and sort by popularity
        const results = {};

        Object.entries(this.components).forEach(([category, componentMap]) => {
            results[category] = Array.from(componentMap.values())
                .sort((a, b) => b.occurrences - a.occurrences)
                .map(comp => ({
                    name: comp.name,
                    link: comp.link,
                    popularity: comp.occurrences
                }));
        });

        // Save to JSON
        const outputPath = path.join(CONFIG.OUTPUT_DIR, 'components-rotorbuilds.json');
        await fs.writeFile(
            outputPath,
            JSON.stringify(results, null, 2),
            'utf-8'
        );

        console.log(`✅ Saved ${Object.keys(results).reduce((sum, cat) => sum + results[cat].length, 0)} components to ${outputPath}`);

        // Print summary
        console.log('\n📊 Summary:');
        Object.entries(results).forEach(([category, items]) => {
            console.log(`  ${category}: ${items.length} unique components`);
        });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('\n✅ Browser closed');
        }
    }
}

// Run scraper
if (require.main === module) {
    const scraper = new RotorBuildsScrap();

    scraper.scrapeAll()
        .then(() => {
            console.log('\n🎉 Scraping complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = RotorBuildsScrap;
