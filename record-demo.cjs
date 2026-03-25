// Run with: node record-demo.cjs
// Requires: npm run dev running at http://localhost:8087

const { chromium } = require('@playwright/test');
const path = require('path');
const fs   = require('fs');

const BASE    = 'http://localhost:8087';
const OUT_DIR = path.join(__dirname, 'demo-assets', 'video');
const TMP_DIR = path.join(__dirname, 'demo-assets', 'video-tmp');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const W = 390, H = 844;       // iPhone 14 viewport

const delay  = ms => new Promise(r => setTimeout(r, ms));
const smooth = async (page, dy, steps = 8) => {
  for (let i = 0; i < steps; i++) {
    await page.evaluate(d => window.scrollBy(0, d), Math.round(dy / steps));
    await delay(30);
  }
};
const safeClick = async (loc, opts = {}) => {
  try { await loc.click({ timeout: 3000, ...opts }); } catch {}
};

(async () => {
  console.log('Launching browser with video recording...');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport:    { width: W, height: H },
    recordVideo: { dir: TMP_DIR, size: { width: W, height: H } },
  });
  const page = await ctx.newPage();

  // ── SETUP: dismiss tour, set name ────────────────────────────────────────
  await page.goto(BASE + '/');
  await delay(400);
  await page.evaluate(() => {
    localStorage.setItem('fridgeiq_tour_done',  'true');
    localStorage.setItem('fridgeiq_tour_step',  '999');
    localStorage.setItem('fridgeiq_username',   'Friend');
    localStorage.setItem('fridgeiq_profile',    JSON.stringify({ name: 'Friend', avatarEmoji: '🙂' }));
  });

  // ── HOME ─────────────────────────────────────────────────────────────────
  console.log('Home...');
  await page.goto(BASE + '/');
  await delay(1000);

  // Expand About
  await safeClick(page.locator('text=About FridgeIQ').first());
  await delay(600);
  await smooth(page, 200);
  await delay(500);

  // Collapse, expand How to Use
  await safeClick(page.locator('text=About FridgeIQ').first());
  await delay(300);
  await safeClick(page.locator('text=How to Use FridgeIQ').first());
  await delay(600);
  await smooth(page, 220);
  await delay(500);

  // Collapse, scroll to feature grid
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await delay(400);
  await safeClick(page.locator('text=How to Use FridgeIQ').first());
  await delay(300);
  await smooth(page, 600);
  await delay(800);

  // ── FOOD QUIZ ────────────────────────────────────────────────────────────
  console.log('Food Quiz...');
  await page.goto(BASE + '/food-quiz');
  await delay(900);

  // Start
  await safeClick(page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("Take")').first());
  await delay(500);

  const steps = [
    { pick: 'Vegetarian' },
    { pick: 'None' },
    { picks: ['Italian', 'Japanese'] },
    { pick: 'Under 30' },
    { pick: 'Intermediate' },
    { pick: 'General Health' },
    { pick: 'Budget' },
    { pick: 'Muscle' },
  ];
  const nextBtn = () => page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Finish")').first();

  for (const s of steps) {
    if (s.picks) {
      for (const p of s.picks) { await safeClick(page.locator(`text=${p}`).first()); await delay(200); }
    } else if (s.pick) {
      await safeClick(page.locator(`text=${s.pick}`).first());
      await delay(300);
    }
    await safeClick(nextBtn(), { force: true });
    await delay(500);
  }
  await delay(800); // results screen

  // ── FRIDGE / SCAN ────────────────────────────────────────────────────────
  console.log('Fridge...');
  await page.goto(BASE + '/scan');
  await delay(900);

  // Switch to Inventory
  await safeClick(page.locator('text=Inventory').first());
  await delay(600);

  // Quick search
  const fSearch = page.locator('input[placeholder*="Search"], input[type="search"]').first();
  try { await fSearch.fill('chicken', { timeout: 3000 }); await delay(500); await fSearch.clear(); } catch {}

  // Open filter, pick Vegetables
  await safeClick(page.locator('button:has-text("All")').first(), { force: true }); await delay(400);
  await safeClick(page.locator('text=Vegetables').first(), { force: true }); await delay(500);

  // Clear filter, open Add Item modal
  await safeClick(page.locator('button:has-text("All"), button:has-text("Clear"), button:has-text("Reset")').first(), { force: true }); await delay(300);
  const addBtn = page.locator('button[aria-label*="add" i], button:has-text("Add Item"), button:has-text("+")').first();
  await safeClick(addBtn, { force: true }); await delay(800);
  await page.keyboard.press('Escape'); await delay(400);

  // Scroll to calendar
  await smooth(page, 600);
  await delay(800);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await delay(400);

  // ── MEALS ────────────────────────────────────────────────────────────────
  console.log('Meals...');
  await page.goto(BASE + '/meals');
  await delay(1000);
  await smooth(page, 250); await delay(400);

  // Search
  const mSearch = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
  try { await mSearch.fill('paneer', { timeout: 3000 }); await delay(600); await mSearch.clear(); await delay(300); } catch {}

  // Filter
  await page.keyboard.press('Escape'); await delay(300);
  await safeClick(page.locator('button:has-text("All")').first(), { force: true }); await delay(400);
  await safeClick(page.locator('text=Indian').first(), { force: true }); await delay(500);

  // Open recipe detail
  await safeClick(page.locator('button.glass-elevated').first(), { force: true }); await delay(700);
  await smooth(page, 300); await delay(400);
  await smooth(page, 300); await delay(300);
  await page.keyboard.press('Escape'); await delay(400);

  // ── PLANNER ──────────────────────────────────────────────────────────────
  console.log('Planner...');
  await page.goto(BASE + '/planner');
  await delay(900);
  await smooth(page, 300); await delay(400);
  await smooth(page, 300); await delay(400);

  // Monthly view
  await safeClick(page.locator('text=Monthly').first(), { force: true }); await delay(600);
  await smooth(page, 200); await delay(500);

  // Back to weekly
  await safeClick(page.locator('text=Weekly').first(), { force: true }); await delay(400);

  // ── GROCERY ──────────────────────────────────────────────────────────────
  console.log('Grocery...');
  await page.goto(BASE + '/grocery');
  await delay(900);

  await safeClick(page.locator('text=Produce').first(), { force: true }); await delay(500);
  await smooth(page, 150); await delay(300);
  await safeClick(page.locator('text=Dairy').first(), { force: true }); await delay(500);
  await smooth(page, 200); await delay(400);

  try {
    const gInput = page.locator('input[placeholder*="Add"], input[placeholder*="item"]').first();
    await gInput.fill('Paneer', { timeout: 3000 }); await delay(400);
    await gInput.clear();
  } catch {}
  await smooth(page, 300); await delay(400);

  // ── HEALTH SCANNER ───────────────────────────────────────────────────────
  console.log('Health Scanner...');
  await page.goto(BASE + '/health-scan');
  await delay(900);

  await safeClick(page.locator('text=Camera').first(), { force: true }); await delay(500);
  await safeClick(page.locator('text=Barcode').first(), { force: true }); await delay(500);
  await safeClick(page.locator('text=Search').first(), { force: true }); await delay(400);
  try {
    const hSearch = page.locator('input').first();
    await hSearch.fill('nutella', { timeout: 3000 }); await delay(500);
  } catch {}
  await smooth(page, 300); await delay(400);

  // ── CHAT ─────────────────────────────────────────────────────────────────
  console.log('Chat...');
  await page.goto(BASE + '/chat');
  await delay(900);

  await safeClick(page.locator('button').nth(2), { force: true }); await delay(800);

  try {
    const cInput = page.locator('input, textarea').last();
    await cInput.fill('What can I cook with eggs and spinach?', { timeout: 3000 }); await delay(500);
    await page.keyboard.press('Enter'); await delay(1000);
  } catch {}
  await smooth(page, 200); await delay(500);

  // ── ACHIEVEMENTS ─────────────────────────────────────────────────────────
  console.log('Achievements...');
  await page.goto(BASE + '/achievements');
  await delay(900);
  await smooth(page, 300); await delay(400);
  await smooth(page, 300); await delay(400);
  await smooth(page, 400); await delay(500);
  await smooth(page, 300); await delay(400);

  // ── PROFILE ──────────────────────────────────────────────────────────────
  console.log('Profile...');
  await page.goto(BASE + '/profile');
  await delay(900);
  await smooth(page, 280); await delay(400);
  await smooth(page, 280); await delay(400);
  await smooth(page, 280); await delay(400);
  await smooth(page, 280); await delay(400);
  await smooth(page, 280); await delay(400);
  await smooth(page, 280); await delay(500);

  // ── PRINT & SHARE ────────────────────────────────────────────────────────
  console.log('Print & Share...');
  await page.goto(BASE + '/print-share');
  await delay(900);
  await smooth(page, 300); await delay(400);
  await smooth(page, 400); await delay(500);
  await smooth(page, 300); await delay(400);

  // ── BACK TO HOME ─────────────────────────────────────────────────────────
  await page.goto(BASE + '/');
  await delay(1200);

  // ── DONE ─────────────────────────────────────────────────────────────────
  console.log('Closing browser and saving video...');
  const videoPath = await page.video().path();
  await browser.close();

  // Move/rename the video to the output dir
  const silent = path.join(OUT_DIR, 'FridgeIQ-demo-silent.webm');
  fs.copyFileSync(videoPath, silent);
  fs.rmSync(TMP_DIR, { recursive: true, force: true });

  console.log('\nVideo saved to:', silent);
  console.log('Duration: ~2 min walkthrough of all 11 tabs');
  console.log('\nNote: To create the music version, overlay background-music.wav using ffmpeg:');
  console.log('  ffmpeg -i FridgeIQ-demo-silent.webm -i ../background-music.wav -shortest -c:v copy -c:a libvorbis FridgeIQ-demo-walkthrough.webm');
})().catch(err => { console.error(err); process.exit(1); });
