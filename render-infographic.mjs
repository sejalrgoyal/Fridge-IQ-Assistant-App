import { chromium } from 'playwright';
import { resolve } from 'path';

const file = resolve('demo-assets/infographic.html');
const outPng = resolve('demo-assets/infographic.png');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1600, height: 880 });
await page.goto(`file:///${file.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
await page.screenshot({ path: outPng, fullPage: false });
console.log('✅  infographic.png saved →', outPng);
await browser.close();
