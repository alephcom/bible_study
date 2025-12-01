#!/usr/bin/env node
/**
 * Automated screenshot script for Bible Study Tool
 * Uses Playwright to capture screenshots of the application
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SCREENSHOT_DIR = join(__dirname, '..', 'docs', 'screenshots');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Ensure screenshot directory exists
if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Screenshot configurations
const screenshots = [
  {
    name: 'main-interface',
    url: BASE_URL,
    description: 'Main interface showing all three tabs',
    viewport: { width: 1920, height: 1080 },
    waitFor: 2000, // Wait for page to load
  },
  {
    name: 'lookup-reference',
    url: `${BASE_URL}/?tab=lookup&ref=John%203:16&bibles=kjv`,
    description: 'Lookup Reference tab with John 3:16',
    viewport: { width: 1920, height: 1080 },
    waitFor: 3000, // Wait for API call to complete
  },
  {
    name: 'search-results',
    url: `${BASE_URL}/?tab=search&q=love&bibles=kjv`,
    description: 'Keyword search results for "love"',
    viewport: { width: 1920, height: 1080 },
    waitFor: 3000, // Wait for search results
  },
  {
    name: 'parallel-view',
    url: `${BASE_URL}/?tab=lookup&ref=John%203:16&bibles=kjv,niv`,
    description: 'Parallel view comparing KJV and NIV',
    viewport: { width: 1920, height: 1080 },
    waitFor: 3000,
  },
  {
    name: 'browse-tab',
    url: `${BASE_URL}/?tab=browse&book=John&chapter=1&bibles=kjv`,
    description: 'Browse tab showing John chapter 1',
    viewport: { width: 1920, height: 1080 },
    waitFor: 3000,
  },
  {
    name: 'mobile-view',
    url: BASE_URL,
    description: 'Mobile responsive view',
    viewport: { width: 375, height: 667 }, // iPhone size
    waitFor: 2000,
    deviceScaleFactor: 2,
  },
];

async function checkServerRunning(browser) {
  try {
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 5000 });
    await page.close();
    return true;
  } catch (error) {
    return false;
  }
}

async function takeScreenshot(config, browser) {
  const { name, url, description, viewport, waitFor, deviceScaleFactor } = config;
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: deviceScaleFactor || 1,
  });

  try {
    console.log(`📸 Taking screenshot: ${name}...`);
    console.log(`   URL: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait additional time if specified
    if (waitFor) {
      await page.waitForTimeout(waitFor);
    }

    // Wait for content to be visible
    await page.waitForSelector('body', { timeout: 10000 });

    // Scroll to top in case page loaded scrolled
    await page.evaluate(() => window.scrollTo(0, 0));

    const screenshotPath = join(SCREENSHOT_DIR, `${name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: false, // Set to true if you want full page screenshots
      type: 'png',
    });

    console.log(`✅ Saved: ${screenshotPath}`);
  } catch (error) {
    console.error(`❌ Error capturing ${name}:`, error.message);
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🎬 Automated Screenshot Tool');
  console.log('============================\n');

  // Launch browser first to check server
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // Check if server is running
    console.log(`Checking if server is running at ${BASE_URL}...`);
    const serverRunning = await checkServerRunning(browser);
    
    if (!serverRunning) {
      console.error(`❌ Server is not running at ${BASE_URL}`);
      console.error('\nPlease start the dev server first:');
      console.error('  npm run dev');
      console.error('\nOr set BASE_URL environment variable:');
      console.error('  BASE_URL=http://your-url:port npm run screenshots');
      process.exit(1);
    }

    console.log('✅ Server is running!\n');
    // Take all screenshots
    for (const config of screenshots) {
      await takeScreenshot(config, browser);
      console.log(''); // Empty line between screenshots
    }

    console.log('============================');
    console.log('✅ All screenshots completed!');
    console.log(`📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();

