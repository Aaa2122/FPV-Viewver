/**
 * Test Runner for Scrapers
 * Quick test with limited data to validate everything works
 */

const RotorBuildsScrap = require('./rotorbuilds-scraper');

async function testScraper() {
    console.log('🧪 Testing RotorBuilds Scraper (Limited Mode)\n');

    const scraper = new RotorBuildsScrap();

    // Override config for testing
    scraper.constructor.prototype.MAX_BUILDS = 3; // Only 3 builds for testing

    try {
        await scraper.scrapeAll();
        console.log('\n✅ Test completed successfully!');
        console.log('\n📁 Check ./scraped-data/components-rotorbuilds.json for results');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        process.exit(1);
    }
}

testScraper();
