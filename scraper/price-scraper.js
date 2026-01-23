/**
 * Price Scraper - Multi-Site Price Comparison
 * 
 * Fetches prices from:
 * - AliExpress (via search scraping, no API key needed for basic search)
 * - Banggood
 * - GetFPV
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const CONFIG = {
    DELAY_BETWEEN_REQUESTS: 2000,
    TIMEOUT: 30000,
    HEADLESS: true
};

class PriceScraper {
    constructor() {
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
        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        );
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Search AliExpress for component price
     */
    async searchAliExpress(componentName) {
        console.log(`🛒 Searching AliExpress: "${componentName}"`);

        const searchUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(componentName)}`;

        try {
            await this.page.goto(searchUrl, {
                waitUntil: 'networkidle2',
                timeout: CONFIG.TIMEOUT
            });

            await this.delay(2000); // Wait for dynamic content

            const products = await this.page.evaluate(() => {
                const items = [];

                // AliExpress uses dynamic selectors, these may need adjustment
                const productCards = document.querySelectorAll('[data-product-id]');

                productCards.slice(0, 3).forEach(card => {
                    const titleEl = card.querySelector('h1, h2, h3, .title');
                    const priceEl = card.querySelector('.price, [class*="price"]');
                    const linkEl = card.querySelector('a');
                    const imgEl = card.querySelector('img');

                    if (titleEl && priceEl) {
                        const priceText = priceEl.textContent.trim();
                        const priceMatch = priceText.match(/[\d.,]+/);

                        items.push({
                            name: titleEl.textContent.trim(),
                            price: priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : null,
                            currency: priceText.includes('€') ? 'EUR' : priceText.includes('$') ? 'USD' : 'USD',
                            url: linkEl ? linkEl.href : null,
                            image: imgEl ? imgEl.src : null
                        });
                    }
                });

                return items;
            });

            if (products.length > 0) {
                console.log(`  ✅ Found ${products.length} products`);
                return products[0]; // Return best match
            } else {
                console.log('  ⚠️  No products found');
                return null;
            }
        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
            return null;
        }
    }

    /**
     * Search Banggood for component price
     */
    async searchBanggood(componentName) {
        console.log(`🛒 Searching Banggood: "${componentName}"`);

        const searchUrl = `https://www.banggood.com/search/${encodeURIComponent(componentName)}.html`;

        try {
            await this.page.goto(searchUrl, {
                waitUntil: 'networkidle2',
                timeout: CONFIG.TIMEOUT
            });

            await this.delay(2000);

            const product = await this.page.evaluate(() => {
                const firstProduct = document.querySelector('.product-item, [class*="product"]');

                if (!firstProduct) return null;

                const titleEl = firstProduct.querySelector('.title, h3, a');
                const priceEl = firstProduct.querySelector('.price, [class*="price"]');
                const linkEl = firstProduct.querySelector('a');
                const imgEl = firstProduct.querySelector('img');

                if (titleEl && priceEl) {
                    const priceText = priceEl.textContent.trim();
                    const priceMatch = priceText.match(/[\d.,]+/);

                    return {
                        name: titleEl.textContent.trim(),
                        price: priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : null,
                        currency: priceText.includes('€') ? 'EUR' : 'USD',
                        url: linkEl ? linkEl.href : null,
                        image: imgEl ? imgEl.src : null
                    };
                }

                return null;
            });

            if (product) {
                console.log(`  ✅ Found: ${product.name} - ${product.price}${product.currency}`);
                return product;
            } else {
                console.log('  ⚠️  No product found');
                return null;
            }
        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
            return null;
        }
    }

    /**
     * Search GetFPV for component price
     */
    async searchGetFPV(componentName) {
        console.log(`🛒 Searching GetFPV: "${componentName}"`);

        const searchUrl = `https://www.getfpv.com/catalogsearch/result/?q=${encodeURIComponent(componentName)}`;

        try {
            await this.page.goto(searchUrl, {
                waitUntil: 'networkidle2',
                timeout: CONFIG.TIMEOUT
            });

            await this.delay(1500);

            const product = await this.page.evaluate(() => {
                const firstProduct = document.querySelector('.product-item, .item');

                if (!firstProduct) return null;

                const titleEl = firstProduct.querySelector('.product-name, .title');
                const priceEl = firstProduct.querySelector('.price, [data-price-type="finalPrice"]');
                const linkEl = firstProduct.querySelector('a');
                const imgEl = firstProduct.querySelector('img');

                if (titleEl && priceEl) {
                    const priceText = priceEl.textContent.trim();
                    const priceMatch = priceText.match(/[\d.,]+/);

                    return {
                        name: titleEl.textContent.trim(),
                        price: priceMatch ? parseFloat(priceMatch[0].replace(',', '')) : null,
                        currency: 'USD',
                        url: linkEl ? linkEl.href : null,
                        image: imgEl ? imgEl.src : null
                    };
                }

                return null;
            });

            if (product) {
                console.log(`  ✅ Found: ${product.name} - $${product.price}`);
                return product;
            } else {
                console.log('  ⚠️  No product found');
                return null;
            }
        } catch (error) {
            console.error(`  ❌ Error: ${error.message}`);
            return null;
        }
    }

    /**
     * Get prices from all sources for a component
     */
    async getPricesForComponent(component) {
        console.log(`\n💰 Fetching prices for: ${component.name}`);

        const prices = {};

        // AliExpress
        const aliPrice = await this.searchAliExpress(component.name);
        if (aliPrice) prices.aliexpress = aliPrice;
        await this.delay(CONFIG.DELAY_BETWEEN_REQUESTS);

        // Banggood
        const bgPrice = await this.searchBanggood(component.name);
        if (bgPrice) prices.banggood = bgPrice;
        await this.delay(CONFIG.DELAY_BETWEEN_REQUESTS);

        // GetFPV
        const getfpvPrice = await this.searchGetFPV(component.name);
        if (getfpvPrice) prices.getfpv = getfpvPrice;

        // Find best price
        const validPrices = Object.entries(prices)
            .filter(([_, p]) => p && p.price)
            .map(([site, p]) => ({ site, ...p }));

        const bestPrice = validPrices.length > 0
            ? validPrices.sort((a, b) => a.price - b.price)[0]
            : null;

        return {
            prices,
            bestPrice: bestPrice ? { site: bestPrice.site, price: bestPrice.price, currency: bestPrice.currency } : null,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Process all components
     */
    async processComponents(componentsData) {
        console.log('\n💵 Starting Price Scraping\n');

        await this.init();

        const results = { ...componentsData };

        for (const [category, components] of Object.entries(componentsData)) {
            console.log(`\n=== ${category.toUpperCase()} ===`);

            for (let i = 0; i < Math.min(components.length, 5); i++) { // Limit to 5 per category for testing
                const component = components[i];

                const priceData = await this.getPricesForComponent(component);

                results[category][i] = {
                    ...component,
                    ...priceData
                };

                console.log(`  Best price: ${priceData.bestPrice ? `${priceData.bestPrice.site} - ${priceData.bestPrice.price} ${priceData.bestPrice.currency}` : 'Not found'}`);
            }
        }

        await this.close();
        return results;
    }

    async saveResults(data) {
        const outputPath = path.join('./scraped-data', 'components-with-prices.json');
        await fs.mkdir('./scraped-data', { recursive: true });
        await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`\n💾 Saved to ${outputPath}`);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('\n✅ Browser closed');
        }
    }
}

// Run scraper
async function main() {
    const scraper = new PriceScraper();

    try {
        const rawData = await fs.readFile('./scraped-data/components-with-images.json', 'utf-8');
        const componentsData = JSON.parse(rawData);

        const enrichedData = await scraper.processComponents(componentsData);
        await scraper.saveResults(enrichedData);

        console.log('\n🎉 Price scraping complete!');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('❌ Components file not found. Run previous scrapers first.');
        } else {
            console.error('❌ Error:', error.message);
        }
        await scraper.close();
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = PriceScraper;
