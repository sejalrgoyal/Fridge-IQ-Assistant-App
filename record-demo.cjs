/**
 * Records a professional demo video that follows the in-app Guided Tour end-to-end.
 * Run: npm run dev (port 8087) then node record-demo.cjs
 * Then: node add-music.cjs
 */

const { chromium } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

const BASE    = process.env.DEMO_URL || 'http://localhost:8087';
const OUT_DIR = path.join(__dirname, 'demo-assets', 'video');
const TMP_DIR = path.join(__dirname, 'demo-assets', 'video-tmp');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const W = 390, H = 844;

const delay = ms => new Promise(r => setTimeout(r, ms));

/** Time to read modal copy before advancing */
const READ_MODAL = 2200;
/** Time to see each tab’s screen behind the spotlight before tapping continue */
const PEEK_TAB   = 1750;
/** Short pause after interactions */
const GLITCH     = 420;

const safeClick = async (page, selector, opts = {}) => {
  const loc = typeof selector === 'string' ? page.locator(selector) : selector;
  // Tour uses Framer Motion on nav buttons; force bypasses "not stable" actionability checks
  await loc.first().click({ timeout: 15000, force: true, ...opts });
};

(async () => {
  console.log('Recording guided tour demo from', BASE);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport:    { width: W, height: H },
    recordVideo: { dir: TMP_DIR, size: { width: W, height: H } },
  });
  const page = await ctx.newPage();

  // Fresh tour: clear completion flag and step, reload so GuidedTour mounts at welcome
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await delay(600);
  await page.evaluate(() => {
    localStorage.removeItem('fridgeiq_tour_done');
    localStorage.removeItem('fridgeiq_tour_step');
    localStorage.removeItem('fridgeiq_onboarded');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await delay(900);

  // ── Welcome ───────────────────────────────────────────────────────────────
  await page.waitForSelector('text=welcome to FridgeIQ', { timeout: 20000 });
  await delay(READ_MODAL);
  await safeClick(page, 'button:has-text("Let\'s get started")');

  // ── Setup: name ─────────────────────────────────────────────────────────
  await page.waitForSelector('input[placeholder="Your name..."]', { timeout: 15000 });
  await delay(GLITCH);
  await page.fill('input[placeholder="Your name..."]', 'Jordan');
  await delay(GLITCH);
  await safeClick(page, 'button:has-text("Nice to meet you")');

  // ── Setup: goal ─────────────────────────────────────────────────────────
  await delay(READ_MODAL * 0.85);
  await safeClick(page, 'button:has-text("Eat healthier")');
  await delay(GLITCH);
  await safeClick(page, 'button:has-text("Great choice")');

  // ── Setup: diet ─────────────────────────────────────────────────────────
  await delay(READ_MODAL * 0.85);
  await safeClick(page, 'button:has-text("Balanced")');
  await delay(GLITCH);
  await safeClick(page, 'button:has-text("Perfect")');

  // ── Nav: Home (spotlight) ─────────────────────────────────────────────
  await page.waitForSelector('button:has-text("Tap Home to continue")', { timeout: 20000 });
  await delay(PEEK_TAB);
  await safeClick(page, 'button:has-text("Tap Home to continue")');

  // ── Modal: Quiz CTA ─────────────────────────────────────────────────────
  await page.waitForSelector('button:has-text("Got it")', { timeout: 20000 });
  await delay(READ_MODAL);
  await safeClick(page, 'button:has-text("Got it")');

  // ── Nav steps: tap each highlighted tab instruction ──────────────────────
  const navContinues = [
    'Tap Quiz to continue',
    'Tap Chat to continue',
    'Tap Fridge to continue',
    'Tap Meals to continue',
    'Tap Planner to continue',
    'Tap Grocery to continue',
    'Tap Health to continue',
    'Tap Badges to continue',
    'Tap Profile to continue',
  ];

  for (const label of navContinues) {
    await page.waitForSelector(`button:has-text("${label}")`, { timeout: 20000 });
    await delay(PEEK_TAB);
    await safeClick(page, `button:has-text("${label}")`);
    await delay(450);
  }

  // ── Done modal ──────────────────────────────────────────────────────────
  await page.waitForSelector('text=You\'re all set', { timeout: 20000 });
  await delay(READ_MODAL * 1.15);
  await safeClick(page, 'button:has-text("Explore on my own")');
  await delay(700);

  // ── Clean ending: calm home dashboard (tour dismissed) ─────────────────
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(500);
  await page.evaluate(() => window.scrollTo({ top: 420, behavior: 'smooth' }));
  await delay(2000);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await delay(2600);

  const videoPath = await page.video().path();
  await browser.close();

  const silent = path.join(OUT_DIR, 'FridgeIQ-demo-silent.webm');
  fs.copyFileSync(videoPath, silent);
  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  console.log('\nSaved:', silent);
  console.log('Run: node add-music.cjs  (merges background-music.wav)');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
