/**
 * Image Downloader for FPV Components
 * 
 * Downloads component images from multiple sources:
 * - Google Images API (primary)
 * - Merchant sites (GetFPV, Banggood)
 * - Manufacturer websites
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

require('dotenv').config();

const CONFIG = {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY, // Get from https://console.cloud.google.com
    GOOGLE_CSE_ID: process.env.GOOGLE_CSE_ID,   // Custom Search Engine ID
    OUTPUT_DIR: './public/images/components',
    DELAY_BETWEEN_REQUESTS: 1000
};

class ImageDownloader {
    constructor() {
        this.downloadedImages = new Map();
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Search for component image using Google Custom Search API
     */
    async searchGoogleImages(componentName, manufacturer) {
        if (!CONFIG.GOOGLE_API_KEY || !CONFIG.GOOGLE_CSE_ID) {
            console.log('⚠️  Google API credentials not set. Skipping Google search.');
            return null;
        }

        const query = `${manufacturer} ${componentName} FPV drone component`;
        const url = 'https://www.googleapis.com/customsearch/v1';

        try {
            console.log(`🔍 Searching Google Images: "${query}"`);

            const response = await axios.get(url, {
                params: {
                    key: CONFIG.GOOGLE_API_KEY,
                    cx: CONFIG.GOOGLE_CSE_ID,
                    q: query,
                    searchType: 'image',
                    num: 1,
                    imgSize: 'medium',
                    fileType: 'jpg,png',
                    safe: 'active'
                }
            });

            if (response.data.items && response.data.items.length > 0) {
                return response.data.items[0].link;
            }

            return null;
        } catch (error) {
            console.error('❌ Google Images API error:', error.message);
            return null;
        }
    }

    /**
     * Alternative: Search GetFPV for component image
     */
    async searchGetFPVImage(componentName) {
        // This would require Puppeteer scraping
        // Placeholder for now
        console.log(`🔍 Searching GetFPV: "${componentName}"`);
        return null;
    }

    /**
     * Download image from URL
     */
    async downloadImage(imageUrl, componentId) {
        try {
            console.log(`📥 Downloading: ${imageUrl}`);

            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            // Detect file extension
            const contentType = response.headers['content-type'];
            let ext = 'jpg';
            if (contentType) {
                if (contentType.includes('png')) ext = 'png';
                else if (contentType.includes('webp')) ext = 'webp';
            }

            // Create unique filename
            const filename = `${componentId}.${ext}`;
            const filepath = path.join(CONFIG.OUTPUT_DIR, filename);

            // Ensure directory exists
            await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

            // Save image
            await fs.writeFile(filepath, response.data);

            console.log(`✅ Saved: ${filename}`);
            return filename;
        } catch (error) {
            console.error(`❌ Download failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Generate a unique ID for component
     */
    generateComponentId(componentName, manufacturer) {
        const text = `${manufacturer}-${componentName}`.toLowerCase();
        return text
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Process components and download images
     */
    async processComponents(componentsData) {
        console.log('\n🖼️  Starting Image Download Process\n');

        const results = { ...componentsData };

        for (const [category, components] of Object.entries(componentsData)) {
            console.log(`\n--- Processing ${category} ---`);

            for (let i = 0; i < components.length; i++) {
                const component = components[i];
                console.log(`\n[${i + 1}/${components.length}] ${component.name}`);

                // Generate component ID
                const componentId = this.generateComponentId(
                    component.name,
                    component.manufacturer || ''
                );

                // Try Google Images first
                let imageUrl = await this.searchGoogleImages(
                    component.name,
                    component.manufacturer || ''
                );

                // Fallback: Try GetFPV
                if (!imageUrl) {
                    imageUrl = await this.searchGetFPVImage(component.name);
                }

                // Download if found
                let imagePath = null;
                if (imageUrl) {
                    imagePath = await this.downloadImage(imageUrl, componentId);
                }

                // Update component data
                results[category][i] = {
                    ...component,
                    id: componentId,
                    image: imagePath ? `/images/components/${imagePath}` : '/images/placeholder.jpg',
                    imageSource: imageUrl || null
                };

                // Rate limiting
                if (i < components.length - 1) {
                    await this.delay(CONFIG.DELAY_BETWEEN_REQUESTS);
                }
            }
        }

        return results;
    }

    /**
     * Save results with image metadata
     */
    async saveResults(data, filename = 'components-with-images.json') {
        const outputPath = path.join('./scraped-data', filename);

        await fs.mkdir('./scraped-data', { recursive: true });
        await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf-8');

        console.log(`\n💾 Saved results to ${outputPath}`);
    }
}

// Example usage
async function main() {
    const downloader = new ImageDownloader();

    // Load previously scraped components
    const componentsPath = './scraped-data/components-rotorbuilds.json';

    try {
        const rawData = await fs.readFile(componentsPath, 'utf-8');
        const componentsData = JSON.parse(rawData);

        console.log('📂 Loaded components data');

        // Process and download images
        const enrichedData = await downloader.processComponents(componentsData);

        // Save enriched data
        await downloader.saveResults(enrichedData);

        console.log('\n🎉 Image download complete!');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('❌ Components file not found. Run rotorbuilds-scraper.js first.');
        } else {
            console.error('❌ Error:', error.message);
        }
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

module.exports = ImageDownloader;
