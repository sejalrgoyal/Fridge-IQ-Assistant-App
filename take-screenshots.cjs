// Run with: node take-screenshots.js
// Make sure the dev server is running at http://localhost:8087 first (npm run dev)

const { chromium } = require('@playwright/test');
const path = require('path');

const BASE = 'http://localhost:8087';
const OUT  = path.join(__dirname, 'demo-assets', 'screenshots');

const delay = ms => new Promise(r => setTimeout(r, ms));

async function shot(page, filename) {
  await delay(600);
  await page.screenshot({ path: path.join(OUT, filename), fullPage: false });
  console.log('  saved', filename);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx     = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page    = await ctx.newPage();

  // Dismiss guided tour and set a neutral name so no tour auto-launches
  await page.goto(BASE + '/');
  await delay(800);
  await page.evaluate(() => {
    localStorage.setItem('fridgeiq_tour_done', 'true');
    localStorage.setItem('fridgeiq_tour_step', '999');
    localStorage.setItem('fridgeiq_username', 'Friend');
  });

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  console.log('\n=== Dashboard ===');
  await page.goto(BASE + '/');
  await delay(1000);
  await shot(page, '15-dash-01-greeting.png');

  // Expand About FridgeIQ
  await page.locator('text=About FridgeIQ').first().click();
  await delay(400);
  await shot(page, '16-dash-02-about-open.png');

  await page.evaluate(() => window.scrollBy(0, 160));
  await shot(page, '17-dash-03-about-scrolled.png');

  // Collapse About, expand How to Use
  await page.locator('text=About FridgeIQ').first().click();
  await delay(300);
  await page.locator('text=How to Use FridgeIQ').first().click();
  await delay(400);
  await shot(page, '18-dash-04-howto-open.png');

  await page.evaluate(() => window.scrollBy(0, 220));
  await shot(page, '19-dash-05-howto-scrolled.png');

  // Collapse How to Use, expand Weekly Nutrition
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('text=How to Use FridgeIQ').first().click();
  await delay(300);
  await page.locator('text=Weekly Nutrition').first().click();
  await delay(400);
  await shot(page, '20-dash-06-weekly-nutrition.png');

  // Collapse, scroll to All Features grid
  await page.locator('text=Weekly Nutrition').first().click();
  await delay(300);
  await page.evaluate(() => window.scrollTo(0, 9999));
  await shot(page, '21-dash-07-feature-cards.png');

  // ── FOOD QUIZ ──────────────────────────────────────────────────────────────
  console.log('\n=== Food Quiz ===');
  await page.goto(BASE + '/food-quiz');
  await delay(1000);
  await shot(page, '01-quiz-01-landing.png');

  // Start quiz
  const startBtn = page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("Take")').first();
  if (await startBtn.isVisible()) {
    await startBtn.click();
    await delay(500);
  }
  await shot(page, '02-quiz-02-q1-diet-blank.png');

  // Select Vegetarian
  const vegBtn = page.locator('text=Vegetarian').first();
  if (await vegBtn.isVisible()) { await vegBtn.click(); await delay(300); }
  await shot(page, '03-quiz-03-q1-vegetarian-selected.png');

  // Safe click helper — won't throw if disabled or missing
  const safeClick = async (locator, opts = {}) => {
    try { await locator.click({ timeout: 5000, ...opts }); } catch {}
  };

  // Next
  const nextBtn = () => page.locator('button:has-text("Next"), button:has-text("Continue")').first();
  await safeClick(nextBtn(), { force: true }); await delay(500);
  await shot(page, '04-quiz-04-q2-allergies.png');

  const noneBtn = page.locator('text=None').first();
  if (await noneBtn.isVisible()) { await noneBtn.click(); await delay(300); }
  await shot(page, '05-quiz-05-q2-none-selected.png');

  await safeClick(nextBtn(), { force: true }); await delay(500);
  await shot(page, '06-quiz-06-q3-cuisines.png');

  for (const c of ['Italian', 'Japanese']) {
    await safeClick(page.locator(`text=${c}`).first());
    await delay(200);
  }
  await shot(page, '07-quiz-07-q3-cuisines-selected.png');

  await safeClick(nextBtn(), { force: true }); await delay(500);
  await shot(page, '08-quiz-08-q4-cooking-time.png');

  await safeClick(page.locator('text=Under 30').first()); await delay(300);
  await shot(page, '09-quiz-09-q4-selected.png');

  await safeClick(nextBtn(), { force: true }); await delay(500);
  await shot(page, '10-quiz-10-q5-skill.png');

  await safeClick(page.locator('text=Intermediate').first()); await delay(300);
  await shot(page, '11-quiz-11-q5-selected.png');

  await safeClick(nextBtn(), { force: true }); await delay(500);
  await shot(page, '12-quiz-12-q6-goals.png');

  await safeClick(page.locator('text=General Health').first()); await delay(300);
  await shot(page, '13-quiz-13-q6-selected.png');

  // Keep clicking next until quiz done
  for (let i = 0; i < 6; i++) {
    await safeClick(nextBtn(), { force: true }); await delay(500);
  }
  await shot(page, '14-quiz-14-complete.png');

  // ── FRIDGE SCAN ────────────────────────────────────────────────────────────
  console.log('\n=== Fridge Scan ===');
  await page.goto(BASE + '/scan');
  await delay(1000);
  await shot(page, '23-fridge-01-scan-tab.png');
  await shot(page, '24-fridge-02-upload-area.png');

  // Switch to Inventory tab
  const invTab = page.locator('text=Inventory').first();
  if (await invTab.isVisible()) { await invTab.click(); await delay(500); }
  await shot(page, '26-fridge-04-inventory.png');

  // Search for tofu
  const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
  if (await searchInput.isVisible()) { await searchInput.fill('tofu'); await delay(400); }
  await shot(page, '27-fridge-05-search-tofu.png');

  await searchInput.clear();
  // Open filter dropdown
  const filterBtn = page.locator('button:has-text("Filter"), button:has-text("All"), select').first();
  if (await filterBtn.isVisible()) { await filterBtn.click(); await delay(400); }
  await shot(page, '28-fridge-06-filter-dropdown.png');

  const vegFilter = page.locator('text=Vegetables').first();
  if (await vegFilter.isVisible()) { await vegFilter.click(); await delay(400); }
  await shot(page, '29-fridge-07-filtered-vegetables.png');

  // Open add item modal
  const addBtn = page.locator('button[aria-label*="add"], button:has-text("Add Item"), button:has-text("+")').first();
  if (await addBtn.isVisible()) { await addBtn.click(); await delay(500); }
  await shot(page, '32-fridge-10-add-item-modal.png');

  // Close modal
  await page.keyboard.press('Escape');
  await delay(400);

  // Scroll down to expiration calendar
  await page.evaluate(() => window.scrollTo(0, 9999));
  await delay(400);
  await shot(page, '33-fridge-11-expiry-calendar.png');

  // ── MEALS ──────────────────────────────────────────────────────────────────
  console.log('\n=== Meals ===');
  await page.goto(BASE + '/meals');
  await delay(1200);
  await shot(page, '35-meals-01-grid.png');

  const mealSearch = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
  if (await mealSearch.isVisible()) { await mealSearch.fill('paneer'); await delay(500); }
  await shot(page, '36-meals-02-search-paneer.png');

  await mealSearch.clear(); await delay(300);

  // Close any open overlay first
  await page.keyboard.press('Escape'); await delay(400);
  await safeClick(page.locator('button:has-text("All")').first(), { force: true }); await delay(400);
  await shot(page, '37-meals-03-filter-open.png');

  await safeClick(page.locator('text=Indian').first(), { force: true }); await delay(400);
  await shot(page, '38-meals-04-indian-filter.png');

  // Click a meal card
  await safeClick(page.locator('button.glass-elevated, [class*="glass"]').first(), { force: true }); await delay(600);
  await shot(page, '39-meals-10-liked.png');

  await page.keyboard.press('Escape'); await delay(400);

  // ── PLANNER ────────────────────────────────────────────────────────────────
  console.log('\n=== Planner ===');
  await page.goto(BASE + '/planner');
  await delay(1000);
  await shot(page, '41-planner-01-weekly.png');

  await page.evaluate(() => window.scrollBy(0, 300));
  await shot(page, '42-planner-02-weekly-scrolled.png');

  await safeClick(page.locator('text=Monthly').first(), { force: true }); await delay(500);
  await shot(page, '48-planner-08-monthly.png');

  // ── GROCERY ────────────────────────────────────────────────────────────────
  console.log('\n=== Grocery ===');
  await page.goto(BASE + '/grocery');
  await delay(1000);
  await shot(page, '50-grocery-01-overview.png');

  await safeClick(page.locator('text=Produce').first(), { force: true }); await delay(400);
  await shot(page, '51-grocery-02-produce-open.png');

  await safeClick(page.locator('text=Dairy').first(), { force: true }); await delay(400);
  await shot(page, '52-grocery-03-dairy-open.png');

  try {
    const groceryInput = page.locator('input[placeholder*="Add"], input[placeholder*="item"]').first();
    await groceryInput.fill('Paneer', { timeout: 4000 }); await delay(300);
  } catch {}
  await shot(page, '54-grocery-06-add-paneer.png');

  // ── HEALTH SCANNER ─────────────────────────────────────────────────────────
  console.log('\n=== Health Scanner ===');
  await page.goto(BASE + '/health-scan');
  await delay(1000);
  await shot(page, '61-health-01-overview.png');

  await safeClick(page.locator('text=Camera').first(), { force: true }); await delay(400);
  await shot(page, '62-health-02-camera-panel.png');

  await safeClick(page.locator('text=Barcode').first(), { force: true }); await delay(400);
  await shot(page, '63-health-03-barcode-panel.png');

  await safeClick(page.locator('text=Search').first(), { force: true }); await delay(400);
  try {
    const healthSearch = page.locator('input[placeholder*="Search"], input[placeholder*="product"], input[placeholder*="search"]').first();
    await healthSearch.fill('nutella', { timeout: 4000 }); await delay(300);
  } catch {}
  await shot(page, '66-health-06-search-panel.png');

  // ── CHAT ───────────────────────────────────────────────────────────────────
  console.log('\n=== Chat ===');
  await page.goto(BASE + '/chat');
  await delay(1000);
  await shot(page, '70-chat-01-greeting.png');

  await safeClick(page.locator('button').nth(1), { force: true }); await delay(600);
  await shot(page, '72-chat-03-action-clicked.png');

  try {
    const chatInput = page.locator('input[placeholder*="Ask"], input[placeholder*="message"], textarea').first();
    await chatInput.fill('What can I make with chicken and rice?', { timeout: 4000 }); await delay(300);
  } catch {}
  await shot(page, '73-chat-04-typed-question.png');

  // ── ACHIEVEMENTS ───────────────────────────────────────────────────────────
  console.log('\n=== Achievements ===');
  await page.goto(BASE + '/achievements');
  await delay(1000);
  await shot(page, '76-ach-01-overview.png');

  await page.evaluate(() => window.scrollBy(0, 300));
  await shot(page, '77-ach-02-badges-start.png');

  await safeClick(page.locator('[class*="glass"]').nth(3), { force: true }); await delay(400);
  await shot(page, '78-ach-03-badge-detail.png');

  await page.evaluate(() => window.scrollBy(0, 400));
  await shot(page, '79-ach-04-locked-badges.png');

  await page.evaluate(() => window.scrollTo(0, 9999));
  await shot(page, '80-ach-05-all-badges.png');

  // ── PROFILE ────────────────────────────────────────────────────────────────
  console.log('\n=== Profile ===');
  await page.goto(BASE + '/profile');
  await delay(1000);
  await shot(page, '81-profile-01-overview.png');

  await page.evaluate(() => window.scrollBy(0, 300));
  await shot(page, '82-profile-02-personal.png');

  await page.evaluate(() => window.scrollBy(0, 300));
  await shot(page, '83-profile-03-personal-fields.png');

  await page.evaluate(() => window.scrollBy(0, 300));
  await shot(page, '84-profile-04-diet.png');

  await page.evaluate(() => window.scrollBy(0, 300));
  await shot(page, '85-profile-05-cuisines.png');

  await page.evaluate(() => window.scrollBy(0, 300));
  await shot(page, '86-profile-06-cooking.png');

  await page.evaluate(() => window.scrollBy(0, 300));
  await shot(page, '87-profile-07-goals.png');

  await page.evaluate(() => window.scrollBy(0, 300));
  await shot(page, '88-profile-08-settings.png');

  await page.evaluate(() => window.scrollTo(0, 9999));
  await shot(page, '93-profile-13-bottom.png');

  // ── PRINT & SHARE ──────────────────────────────────────────────────────────
  console.log('\n=== Print & Share ===');
  await page.goto(BASE + '/print-share');
  await delay(1000);
  await shot(page, '94-share-01-overview.png');

  await page.evaluate(() => window.scrollBy(0, 400));
  await shot(page, '95-share-03-preview-open.png');

  await page.evaluate(() => window.scrollTo(0, 9999));
  await shot(page, '96-share-06-share-buttons.png');

  await browser.close();
  console.log('\nAll screenshots saved to demo-assets/screenshots/');
})().catch(err => { console.error(err); process.exit(1); });
