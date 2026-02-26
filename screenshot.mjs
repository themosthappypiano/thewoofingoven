import puppeteer from 'puppeteer';
import { mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOT_DIR = './temporary screenshots';

// Ensure screenshots directory exists
if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Get next screenshot number
function getNextScreenshotNumber() {
  if (!existsSync(SCREENSHOT_DIR)) {
    return 1;
  }
  
  const files = readdirSync(SCREENSHOT_DIR)
    .filter(file => file.startsWith('screenshot-') && file.endsWith('.png'))
    .map(file => {
      const match = file.match(/screenshot-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
  
  return files.length > 0 ? Math.max(...files) + 1 : 1;
}

async function takeScreenshot(url, label) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  const screenshotNumber = getNextScreenshotNumber();
  const filename = label ? 
    `screenshot-${screenshotNumber}-${label}.png` : 
    `screenshot-${screenshotNumber}.png`;
  
  const filepath = join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath });
  
  console.log(`Screenshot saved: ${filepath}`);
  
  await browser.close();
  return filepath;
}

// Get URL and optional label from command line arguments
const url = process.argv[2];
const label = process.argv[3];

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label]');
  process.exit(1);
}

takeScreenshot(url, label).catch(console.error);