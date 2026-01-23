# FPV Configurator - Scraper Setup

## Quick Start Guide

### Prerequisites
```bash
npm install --save-dev puppeteer cheerio axios dotenv
```

### Environment Variables
Create `.env` file in root:
```env
# Optional: Google Images API (for better image quality)
GOOGLE_API_KEY=your_api_key_here
GOOGLE_CSE_ID=your_search_engine_id_here
```

## Usage

### Step 1: Scrape Components from RotorBuilds
```bash
node scraper/rotorbuilds-scraper.js
```
Output: `scraped-data/components-rotorbuilds.json`

### Step 2: Download Component Images
```bash
node scraper/image-downloader.js
```
Output: 
- `scraped-data/components-with-images.json`
- `public/images/components/*.jpg`

### Step 3: Fetch Prices from Multiple Sites
```bash
node scraper/price-scraper.js
```
Output: `scraped-data/components-with-prices.json`

## Data Flow

```
RotorBuilds → Components List
     ↓
Google API → Images Downloaded
     ↓
Ali/Banggood/GetFPV → Prices Added
     ↓
Final JSON with all data
```

## Final Data Structure

```json
{
  "motors": [
    {
      "id": "xing2-2207-1855",
      "name": "iFlight XING2 2207 1855KV",
      "popularity": 15,
      "image": "/images/components/xing2-2207-1855.jpg",
      "prices": {
        "aliexpress": { "price": 22.50, "currency": "EUR", "url": "..." },
        "banggood": { "price": 24.99, "currency": "EUR", "url": "..." },
        "getfpv": { "price": 26.99, "currency": "USD", "url": "..." }
      },
      "bestPrice": { "site": "aliexpress", "price": 22.50, "currency": "EUR" },
      "lastUpdated": "2026-01-23T14:00:00Z"
    }
  ]
}
```

## Notes

- **Rate Limiting**: Scrapers include delays to respect servers
- **Legal**: Check Terms of Service for each site
- **API Keys**: Google Images API is optional but recommended
- **Testing**: Start with small batches (5-10 components) before full run

## Next Steps

After data collection:
1. Import JSON into configurator UI
2. Build backend API for real-time price updates
3. Implement caching and CDN for images
