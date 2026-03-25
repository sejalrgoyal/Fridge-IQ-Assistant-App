/**
 * FridgeIQ — Full Interactive Demo Capture
 *
 * Persona  : Sejal Goyal · 21 · Vegetarian Student · Coppell, TX
 * Coverage : Every tab in nav order; every collapsible, dropdown,
 *            input, filter, modal, and action button shown.
 * Outputs  :
 *   demo-assets/screenshots/  — numbered PNG screenshots (mobile 390×844 @2×)
 *   demo-assets/video/        — FridgeIQ-demo-walkthrough.webm  (with music)
 *
 * Usage:
 *   npm run dev          ← Terminal 1
 *   npm run demo         ← Terminal 2  (add --url=http://localhost:PORT if needed)
 */

import { chromium } from "playwright";
import { mkdir, copyFile, readdir, unlink, writeFile, rm } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL =
  process.argv.find((a) => a.startsWith("--url="))?.replace("--url=", "") ||
  process.env.DEMO_URL ||
  "http://localhost:5173";

const SKIP_VIDEO = process.argv.includes("--screenshots-only");
const VIEWPORT   = { width: 390, height: 844 };

const SCREENSHOTS_DIR = path.join(__dirname, "demo-assets", "screenshots");
const VIDEO_DIR       = path.join(__dirname, "demo-assets", "video");
const MUSIC_PATH      = path.join(__dirname, "demo-assets", "background-music.wav");

// ─── Persona: Sejal Goyal ─────────────────────────────────────────────────────

const today = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
};

const SEJAL_PROFILE = {
  name: "Sejal Goyal",
  age: "21",
  occupation: "Student",
  householdSize: "1",
  bio: "CS student 🌿 | Vegetarian | Eating healthy on a budget in Coppell",
  location: "Coppell, TX",
  avatarEmoji: "🌸",
};

const SEJAL_PREFS = {
  diet: "Vegetarian",
  fitnessGoal: "General Health",
  budget: "$60/week",
  cookingTime: "Under 30 min",
  allergies: [],
  dislikedFoods: [],
  favoriteCuisines: ["Indian", "Italian", "Thai", "Mediterranean"],
  mealPrepDays: ["Sun", "Wed"],
  planningTime: "10 min/day",
  cookingSkill: "Intermediate",
};

const SEJAL_QUIZ = {
  diet: ["Vegetarian"],
  allergies: ["None"],
  cuisines: ["Indian", "Italian", "Thai", "Mediterranean"],
  cookingTime: "15–30 min",
  skillLevel: "Intermediate 🍳",
  goals: ["Eat healthier", "Save money", "Reduce waste"],
};

const SEJAL_SETTINGS = {
  notifications: true,
  darkMode: false,
  soundEffects: true,
  emailUpdates: false,
  metricUnits: false,
  language: "English",
  timezone: "America/Chicago",
};

// 7 days of realistic vegetarian nutrition data
const NUTRITION_HISTORY = Array.from({ length: 7 }, (_, i) => ({
  date: today(-(6 - i)),
  protein:  [62, 71, 68, 74, 65, 78, 70][i],
  calories: [1720, 1850, 1640, 1910, 1780, 1960, 1830][i],
  fiber:    [22, 26, 20, 28, 23, 30, 25][i],
}));
const NUTRITION_GOALS = { protein: 75, calories: 1800, fiber: 25 };

// Pre-filled liked meals (vegetarian ones)
const LIKED_MEALS = ["1", "3"];  // Spinach Scramble, Veggie Pasta

// Planner data (Sun–Sat with vegetarian meals)
const WEEKLY_PLAN = {
  Mon: { breakfast: "Spinach & Egg Scramble", lunch: "Pasta Primavera", dinner: "Vegetable Curry" },
  Tue: { breakfast: "Avocado Toast",          lunch: "Greek Salad",     dinner: "Stir Fry Tofu" },
  Wed: { breakfast: "Greek Yogurt Bowl",       lunch: "Lentil Soup",    dinner: "Pasta Primavera" },
  Thu: { breakfast: "Spinach & Egg Scramble", lunch: "Caprese Salad",  dinner: "Dal Tadka" },
  Fri: { breakfast: "Oatmeal",                lunch: "Veggie Wrap",    dinner: "Palak Paneer" },
  Sat: { breakfast: "Smoothie Bowl",          lunch: "Quinoa Bowl",    dinner: "Paneer Tikka Masala" },
  Sun: { breakfast: "Pancakes",               lunch: "Veggie Burger",  dinner: "Vegetable Biryani" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

let logStep = 0;
function log(icon, msg) { console.log(`\n${icon}  ${++logStep}. ${msg}`); }
function sub(msg)        { console.log(`       ${msg}`); }

async function ensureDirs() {
  await rm(SCREENSHOTS_DIR, { recursive: true, force: true });
  await mkdir(SCREENSHOTS_DIR, { recursive: true });
  await mkdir(VIDEO_DIR,        { recursive: true });
  await mkdir(path.join(__dirname, "demo-assets"), { recursive: true });
}

async function waitFor(page, ms = 500) {
  await page.waitForTimeout(ms);
}

async function waitLoad(page) {
  await page.waitForSelector("#root", { timeout: 20000 });
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await waitFor(page, 400);
}

/** Inject the full Sejal persona into localStorage */
async function injectPersona(page) {
  await page.evaluate(
    ({ profile, prefs, quiz, settings, nutritionHistory, nutritionGoals, likedMeals, weeklyPlan }) => {
      // Tour / first-run skips
      localStorage.setItem("fridgeiq_tour_done", "true");
      localStorage.removeItem("fridgeiq_tour_step");
      // Profile
      localStorage.setItem("fridgeiq_profile",       JSON.stringify(profile));
      localStorage.setItem("fridgeiq_profile_prefs", JSON.stringify(prefs));
      localStorage.setItem("fridgeiq_prefs",         JSON.stringify(quiz));
      localStorage.setItem("fridgeiq_settings",      JSON.stringify(settings));
      // Nutrition
      localStorage.setItem("fridgeiq_nutrition_history", JSON.stringify(nutritionHistory));
      localStorage.setItem("fridgeiq_nutrition_goals",   JSON.stringify(nutritionGoals));
      // Likes
      localStorage.setItem("fridgeiq_liked_meals", JSON.stringify(likedMeals));
      // Planner
      localStorage.setItem("fridgeiq_weekly_plan", JSON.stringify(weeklyPlan));
      // Location
      localStorage.setItem("fridgeiq_grocery_location", JSON.stringify({
        address: "Coppell, TX 75019",
        lat: 32.9546,
        lng: -97.0098,
      }));
    },
    {
      profile: SEJAL_PROFILE, prefs: SEJAL_PREFS, quiz: SEJAL_QUIZ,
      settings: SEJAL_SETTINGS, nutritionHistory: NUTRITION_HISTORY,
      nutritionGoals: NUTRITION_GOALS, likedMeals: LIKED_MEALS,
      weeklyPlan: WEEKLY_PLAN,
    }
  );
}

/** Smooth pixel scroll */
async function scroll(page, px, msPerStep = 18) {
  const steps = Math.ceil(Math.abs(px) / 50);
  const dy = px > 0 ? 50 : -50;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((d) => window.scrollBy(0, d), dy);
    await waitFor(page, msPerStep);
  }
}

/** Click the first visible element matching a selector */
async function tap(page, sel, pause = 600) {
  try {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 })) {
      await el.scrollIntoViewIfNeeded();
      await el.click();
      await waitFor(page, pause);
      return true;
    }
  } catch {}
  return false;
}

/** Type into a visible input */
async function typeIn(page, sel, text, delay = 75) {
  try {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 2000 })) {
      await el.click();
      await waitFor(page, 250);
      await el.fill(text);
      await waitFor(page, delay * text.length * 0.5);
      return true;
    }
  } catch {}
  return false;
}

// ─── Shot counter ─────────────────────────────────────────────────────────────

let shotN = 0;
async function shot(page, name) {
  shotN++;
  const file = path.join(SCREENSHOTS_DIR, `${String(shotN).padStart(2, "0")}-${name}.png`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await waitFor(page, 300);
  await page.screenshot({ path: file, fullPage: false });
  sub(`📸  ${path.basename(file)}`);
}

/** Go to a route, wait for render, run interaction fn, then reset scroll */
async function visit(page, route, label, fn) {
  log("🔵", label);
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded" });
  await waitLoad(page);
  await waitFor(page, 900);
  if (fn) await fn(page).catch((e) => sub(`⚠ ${e.message.slice(0, 80)}`));
}

// ─── Tab Scripts ──────────────────────────────────────────────────────────────

// ── 1. Food Quiz ─────────────────────────────────────────────────────────────
async function doFoodQuiz(page) {
  // Clear prefs so we see the "Start Quiz" landing
  await page.evaluate(() => localStorage.removeItem("fridgeiq_prefs"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitFor(page, 800);

  sub("landing: Start Quiz screen");
  await shot(page, "quiz-01-landing");

  sub("clicking Start Quiz");
  await tap(page, "button:has-text('Start Quiz'), button:has-text('Update Preferences')");
  await waitFor(page, 400);
  await shot(page, "quiz-02-q1-diet-blank");

  sub("Q1 – selecting Vegetarian");
  await tap(page, "button:has-text('Vegetarian')", 400);
  await shot(page, "quiz-03-q1-vegetarian-selected");
  await tap(page, "button:has-text('Next')");

  sub("Q2 – allergies: None");
  await shot(page, "quiz-04-q2-allergies");
  await tap(page, "button:has-text('None')", 400);
  await shot(page, "quiz-05-q2-none-selected");
  await tap(page, "button:has-text('Next')");

  sub("Q3 – cuisines: Indian, Italian, Thai, Mediterranean");
  await shot(page, "quiz-06-q3-cuisines");
  for (const c of ["Indian", "Italian", "Thai", "Mediterranean"]) {
    await tap(page, `button:has-text('${c}')`, 280);
  }
  await shot(page, "quiz-07-q3-cuisines-selected");
  await tap(page, "button:has-text('Next')");

  sub("Q4 – cooking time: 15–30 min");
  await shot(page, "quiz-08-q4-cooking-time");
  await tap(page, "button:has-text('15')", 400);
  await shot(page, "quiz-09-q4-selected");
  await tap(page, "button:has-text('Next')");

  sub("Q5 – skill: Intermediate");
  await shot(page, "quiz-10-q5-skill");
  await tap(page, "button:has-text('Intermediate')", 400);
  await shot(page, "quiz-11-q5-selected");
  await tap(page, "button:has-text('Next')");

  sub("Q6 – goals: Eat healthier, Save money, Reduce waste");
  await shot(page, "quiz-12-q6-goals");
  for (const g of ["Eat healthier", "Save money", "Reduce waste"]) {
    await tap(page, `button:has-text('${g}')`, 280);
  }
  await shot(page, "quiz-13-q6-selected");

  sub("clicking Finish");
  await tap(page, "button:has-text('Finish')", 1200);
  // Re-inject persona so subsequent tabs have prefs restored
  await injectPersona(page);
  await shot(page, "quiz-14-complete");
}

// ── 2. Dashboard ─────────────────────────────────────────────────────────────
async function doDashboard(page) {
  sub("greeting header with Sejal's name");
  await shot(page, "dash-01-greeting");

  sub("opening 'About FridgeIQ' section");
  await tap(page, "button:has-text('About FridgeIQ')", 700);
  await shot(page, "dash-02-about-open");

  sub("scrolling inside About section");
  await scroll(page, 180, 20);
  await shot(page, "dash-03-about-scrolled");

  sub("collapsing About → opening 'How to Use FridgeIQ'");
  await page.evaluate(() => window.scrollTo(0, 0));
  await tap(page, "button:has-text('About FridgeIQ')", 400);
  await tap(page, "button:has-text('How to Use FridgeIQ')", 700);
  await shot(page, "dash-04-howto-open");

  sub("scrolling through all 9 how-to steps");
  await scroll(page, 400, 18);
  await shot(page, "dash-05-howto-scrolled");

  sub("collapsing How to Use → opening 'Weekly Nutrition'");
  await page.evaluate(() => window.scrollTo(0, 0));
  await tap(page, "button:has-text('How to Use FridgeIQ')", 400);
  await tap(page, "button:has-text('Weekly Nutrition')", 700);
  await shot(page, "dash-06-weekly-nutrition");

  sub("scrolling to feature cards grid");
  await scroll(page, 500, 18);
  await shot(page, "dash-07-feature-cards");

  sub("clicking 'Take the Guided Tour' card");
  await page.evaluate(() => window.scrollTo(0, 0));
  await tap(page, "button:has-text('Take the Guided Tour'), button:has-text('Guided Tour')", 800);
  await shot(page, "dash-08-guided-tour-start");
  // Dismiss tour overlay
  await tap(page, "button:has-text('Skip'), button:has(svg[data-lucide='x'])", 600);
  // Re-set tour done flag
  await page.evaluate(() => localStorage.setItem("fridgeiq_tour_done", "true"));
}

// ── 3. Fridge Scan ───────────────────────────────────────────────────────────
async function doFridgeScan(page) {
  sub("Scan tab – initial state");
  await shot(page, "fridge-01-scan-tab");

  sub("showing Upload Photo button area");
  await scroll(page, 80, 22);
  await shot(page, "fridge-02-upload-area");

  sub("clicking 'Barcode' mode toggle");
  await tap(page, "button:has-text('Barcode'), button:has(svg[data-lucide='barcode'])", 700);
  await shot(page, "fridge-03-barcode-mode");
  await tap(page, "button:has-text('Back'), button:has-text('Cancel'), button:has(svg[data-lucide='x'])", 500);

  sub("switching to Inventory tab");
  await tap(page, "button:has-text('Inventory'), [role='tab']:has-text('Inventory')", 700);
  await shot(page, "fridge-04-inventory");

  sub("opening search");
  await tap(page, "button:has(svg[data-lucide='search'])", 500);
  await typeIn(page, "input[placeholder*='earch'], input[placeholder*='item']", "tofu");
  await shot(page, "fridge-05-search-tofu");

  sub("clearing search → filter by Vegetables");
  await tap(page, "button:has(svg[data-lucide='x']), button:has-text('Clear')", 400);
  await waitFor(page, 300);
  await tap(page, "button:has(svg[data-lucide='filter']), button:has-text('Filter')", 700);
  await shot(page, "fridge-06-filter-dropdown");
  await tap(page, "button:has-text('Vegetables'), [role='option']:has-text('Vegetables')", 700);
  await shot(page, "fridge-07-filtered-vegetables");

  sub("clearing filter → expanding an item");
  await tap(page, "button:has-text('All'), button:has(svg[data-lucide='x'])", 500);
  await waitFor(page, 300);
  // Click first fridge item to expand
  const firstItem = page.locator("[class*='rounded'][class*='border'], [class*='glass']").first();
  if (await firstItem.isVisible({ timeout: 2000 })) {
    await firstItem.click();
    await waitFor(page, 700);
    await shot(page, "fridge-08-item-expanded");
  }

  sub("clicking edit (pencil) on an item");
  await tap(page, "button:has(svg[data-lucide='pencil'])", 700);
  await shot(page, "fridge-09-edit-modal");
  await tap(page, "button:has-text('Cancel'), button:has(svg[data-lucide='x'])", 500);

  sub("clicking 'Add Item' (+) button");
  await tap(page, "button:has(svg[data-lucide='plus']):not([disabled])", 700);
  await shot(page, "fridge-10-add-item-modal");
  await tap(page, "button:has-text('Cancel'), button:has(svg[data-lucide='x'])", 500);

  sub("scrolling to Expiry Calendar");
  await scroll(page, 400, 18);
  await shot(page, "fridge-11-expiry-calendar");

  sub("Restock Expiring Items button");
  await tap(page, "button:has-text('Restock'), button:has(svg[data-lucide='shopping-cart'])", 700);
  await shot(page, "fridge-12-restock-toast");
}

// ── 4. Meals ─────────────────────────────────────────────────────────────────
async function doMeals(page) {
  sub("meals grid – vegetarian filter active");
  await shot(page, "meals-01-grid");

  sub("opening search → typing 'paneer'");
  await tap(page, "button:has(svg[data-lucide='search'])", 400);
  await typeIn(page, "input[placeholder*='earch'], input[placeholder*='recipe'], input[type='text']", "paneer");
  await waitFor(page, 800);
  await shot(page, "meals-02-search-paneer");

  sub("clearing search → opening filter");
  await tap(page, "button:has(svg[data-lucide='x']), button:has-text('Clear')", 400);
  await tap(page, "button:has(svg[data-lucide='filter']), button:has-text('Filter'), button:has(svg[data-lucide='sliders'])", 700);
  await shot(page, "meals-03-filter-open");
  // Try selecting Indian filter
  await tap(page, "button:has-text('Indian'), [role='option']:has-text('Indian')", 600);
  await shot(page, "meals-04-indian-filter");
  await tap(page, "button:has-text('All'), button:has-text('Clear'), button:has(svg[data-lucide='x'])", 500);

  sub("tapping first recipe card");
  await waitFor(page, 600);
  // Recipe cards contain a time string ("min") and calories – use that to find them
  const card = page.locator("button:has-text('min'), [role='button']:has-text('min'), div[class*='glass']:has-text('min')").first();
  if (await card.isVisible({ timeout: 3000 }).catch(() => false)) {
    await card.click();
    await waitFor(page, 900);
    await shot(page, "meals-05-recipe-detail");

    sub("scrolling recipe – ingredients");
    await scroll(page, 180, 18);
    await shot(page, "meals-06-ingredients");

    sub("scrolling recipe – instructions");
    await scroll(page, 260, 18);
    await shot(page, "meals-07-instructions");

    sub("scrolling recipe – nutrition");
    await scroll(page, 280, 18);
    await shot(page, "meals-08-nutrition");

    sub("adjusting serving scaler");
    await tap(page, "button:has-text('+'), button[aria-label*='increase'], button:has(svg[data-lucide='plus'])", 500);
    await tap(page, "button:has-text('+'), button[aria-label*='increase']", 500);
    await shot(page, "meals-09-serving-scaled");

    sub("closing recipe detail");
    await tap(page, "button:has(svg[data-lucide='x']), button:has-text('Close'), button:has-text('Back')", 600);
  }

  sub("liking a recipe");
  await tap(page, "button:has(svg[data-lucide='heart'])", 600);
  await shot(page, "meals-10-liked");

  sub("opening 'Add Custom Meal' form");
  await tap(page, "button:has-text('Add Meal'), button:has-text('Add Recipe'), button:has(svg[data-lucide='plus'])", 700);
  await shot(page, "meals-11-add-meal-form");
  await tap(page, "button:has-text('Cancel'), button:has(svg[data-lucide='x'])", 500);
}

// ── 5. Meal Planner ───────────────────────────────────────────────────────────
async function doPlanner(page) {
  sub("weekly planner – Sejal's plan loaded");
  await shot(page, "planner-01-weekly");

  sub("scrolling to see all days");
  await scroll(page, 200, 18);
  await shot(page, "planner-02-weekly-scrolled");

  sub("clicking a meal slot (Monday breakfast)");
  await tap(page, "button:has(svg[data-lucide='plus'])", 800);
  await shot(page, "planner-03-meal-picker");
  await typeIn(page, "input[placeholder*='earch'], input[placeholder*='meal']", "Spinach");
  await waitFor(page, 600);
  await shot(page, "planner-04-meal-picker-search");
  await tap(page, "button:has-text('Cancel'), button:has(svg[data-lucide='x'])", 600);

  sub("clicking Auto-fill Week");
  await tap(page, "button:has-text('Auto-fill'), button:has(svg[data-lucide='refresh-cw'])", 900);
  await shot(page, "planner-05-autofill");

  sub("clicking Generate Grocery List");
  await tap(page, "button:has-text('Generate Grocery'), button:has(svg[data-lucide='shopping-cart'])", 900);
  await shot(page, "planner-06-grocery-generated");

  sub("opening Share / Export panel");
  await tap(page, "button:has(svg[data-lucide='share-2']), button:has-text('Share'), button:has(svg[data-lucide='download'])", 700);
  await shot(page, "planner-07-share-panel");
  await tap(page, "button:has-text('Cancel'), button:has(svg[data-lucide='x'])", 400);

  sub("switching to Monthly view");
  await tap(page, "button:has-text('Monthly'), button:has-text('Month'), button:has(svg[data-lucide='calendar-days'])", 900);
  await shot(page, "planner-08-monthly");

  sub("navigating to next month");
  await tap(page, "button:has(svg[data-lucide='chevron-right'])", 700);
  await shot(page, "planner-09-next-month");

  sub("going back to Weekly view");
  await tap(page, "button:has-text('Weekly'), button:has-text('Week')", 700);
}

// ── 6. Grocery ────────────────────────────────────────────────────────────────
async function doGrocery(page) {
  sub("grocery list – overview");
  await shot(page, "grocery-01-overview");

  sub("expanding Produce category");
  await tap(page, "button:has-text('Produce'), button:has-text('🥬')", 600);
  await shot(page, "grocery-02-produce-open");

  sub("expanding Dairy category");
  await tap(page, "button:has-text('Dairy'), button:has-text('🥛')", 600);
  await shot(page, "grocery-03-dairy-open");

  sub("checking off an item");
  const checkBtn = page.locator("button:has(svg[data-lucide='circle']), button:has(svg[data-lucide='check-circle-2'])").first();
  if (await checkBtn.isVisible({ timeout: 1500 })) {
    await checkBtn.click();
    await waitFor(page, 500);
    await shot(page, "grocery-04-item-checked");
  }

  sub("clicking + Add Item");
  await tap(page, "button:has-text('Add Item'), button:has(svg[data-lucide='plus'])", 700);
  await shot(page, "grocery-05-add-item");
  await typeIn(page, "input[placeholder*='tem'], input[placeholder*='dd'], input[type='text']", "Paneer");
  await waitFor(page, 500);
  await shot(page, "grocery-06-add-paneer");
  await tap(page, "button:has-text('Add'), button[type='submit']", 700);

  sub("location search – Coppell TX already set");
  await tap(page, "button:has(svg[data-lucide='map-pin']), button:has-text('Location'), button:has-text('Find Store')", 800);
  await shot(page, "grocery-07-location-search");
  await typeIn(page, "input[placeholder*='earch'], input[placeholder*='ocation'], input[type='text']", "Coppell, TX");
  await waitFor(page, 600);
  await shot(page, "grocery-08-coppell-search");
  await tap(page, "button:has-text('Cancel'), button:has(svg[data-lucide='x'])", 500);

  sub("opening Price Comparison / Store panel");
  await tap(page, "button:has-text('Compare'), button:has-text('Stores'), button:has(svg[data-lucide='store'])", 800);
  await shot(page, "grocery-09-price-compare");
  await tap(page, "button:has-text('Close'), button:has(svg[data-lucide='x'])", 400);

  sub("opening Barcode scanner");
  await tap(page, "button:has(svg[data-lucide='barcode']), button:has-text('Barcode')", 700);
  await shot(page, "grocery-10-barcode-scanner");
  await tap(page, "button:has-text('Close'), button:has(svg[data-lucide='x']), button:has-text('Cancel')", 400);

  sub("scrolling grocery list");
  await scroll(page, 300, 18);
  await shot(page, "grocery-11-scrolled");

  sub("opening Multi-Store Route planner");
  await tap(page, "button:has-text('Route'), button:has(svg[data-lucide='route']), button:has(svg[data-lucide='navigation'])", 800);
  await shot(page, "grocery-12-route-planner");
  await tap(page, "button:has-text('Close'), button:has(svg[data-lucide='x'])", 400);
}

// ── 7. Health Scan ────────────────────────────────────────────────────────────
async function doHealthScan(page) {
  sub("health scan – three collapsed panels");
  await shot(page, "health-01-overview");

  // Use text-matching on the toggle buttons (Lucide SVGs don't carry data-lucide in React)
  const panelSelectors = [
    "button:has-text('Camera'), button:has-text('Scan with Camera')",
    "button:has-text('Barcode'), button:has-text('Enter Barcode')",
    "button:has-text('Search'), button:has-text('Product Name'), button:has-text('by Name')",
  ];

  sub("expanding Camera Scan panel");
  if (await tap(page, panelSelectors[0], 700)) {
    await shot(page, "health-02-camera-panel");
    // Collapse it so next panels are visible
    await tap(page, panelSelectors[0], 500);
  }

  sub("expanding Barcode Entry panel");
  if (await tap(page, panelSelectors[1], 700)) {
    await shot(page, "health-03-barcode-panel");
    sub("typing barcode: 0038000138416 (Kellogg's Corn Flakes)");
    await typeIn(page, "input[type='text'], input[placeholder*='arcode'], input[placeholder*='digit']", "0038000138416");
    await waitFor(page, 400);
    await tap(page, "button:has-text('Scan'), button:has-text('Analyse'), button:has-text('Look'), button[type='submit']", 1000);
    await shot(page, "health-04-barcode-result");
    await scroll(page, 200, 18);
    await shot(page, "health-05-barcode-ingredients");
    await page.evaluate(() => window.scrollTo(0, 0));
    await tap(page, panelSelectors[1], 400); // collapse
  }

  sub("expanding Search by Name panel");
  if (await tap(page, panelSelectors[2], 700)) {
    await shot(page, "health-06-search-panel");
    sub("typing 'Nutella'");
    await typeIn(page, "input[type='text'], input[placeholder*='roduct'], input[placeholder*='earch']", "Nutella");
    await waitFor(page, 400);
    await tap(page, "button:has-text('Search'), button:has-text('Analyse'), button[type='submit']", 1200);
    await shot(page, "health-07-nutella-result");
    await scroll(page, 250, 18);
    await shot(page, "health-08-nutella-score");
    sub("opening Alternatives section");
    await tap(page, "button:has-text('Alternative'), button:has-text('Healthier')", 700);
    await shot(page, "health-09-alternatives");
  }
}

// ── 8. AI Chat ────────────────────────────────────────────────────────────────
async function doChat(page) {
  sub("chat screen greeting: Hey Sejal!");
  await shot(page, "chat-01-greeting");

  sub("clicking suggestion chip: What's expiring soon?");
  await tap(page, "button:has-text(\"What's expiring soon?\")", 300);
  await waitFor(page, 1600);
  await shot(page, "chat-02-expiring-response");

  sub("clicking action button from AI response");
  await tap(page, "button:has-text('Plan'), button[class*='rounded-full']", 700);
  await shot(page, "chat-03-action-clicked");

  sub("typing custom vegetarian question");
  const input = page.locator("input[placeholder*='sk'], input[placeholder*='eal'], textarea").first();
  if (await input.isVisible({ timeout: 2000 })) {
    await input.click();
    await waitFor(page, 250);
    await input.fill("What vegetarian dishes can I make with paneer this week?");
    await waitFor(page, 400);
    await shot(page, "chat-04-typed-question");
    await tap(page, "button:has(svg[data-lucide='send']), button[type='submit']", 300);
    await waitFor(page, 1600);
    await shot(page, "chat-05-paneer-response");
  }

  sub("scrolling full chat history");
  await scroll(page, 300, 18);
  await shot(page, "chat-06-full-chat");
}

// ── 9. Achievements ───────────────────────────────────────────────────────────
async function doAchievements(page) {
  sub("achievements overview – level & XP");
  await shot(page, "ach-01-overview");

  sub("scrolling to badge grid");
  await scroll(page, 200, 18);
  await shot(page, "ach-02-badges-start");

  sub("clicking first badge to see details");
  const badge = page.locator("[class*='rounded-xl'][class*='p-'], [class*='rounded-2xl']").nth(2);
  if (await badge.isVisible({ timeout: 2000 })) {
    await badge.click();
    await waitFor(page, 800);
    await shot(page, "ach-03-badge-detail");
    await tap(page, "button:has-text('Close'), button:has(svg[data-lucide='x'])", 500);
  }

  sub("scrolling to locked badges");
  await scroll(page, 400, 18);
  await shot(page, "ach-04-locked-badges");

  sub("scrolling to all badges bottom");
  await scroll(page, 400, 18);
  await shot(page, "ach-05-all-badges");
}

// ── 10. Profile ────────────────────────────────────────────────────────────────
async function doProfile(page) {
  sub("profile overview – Sejal Goyal, Coppell TX");
  await shot(page, "profile-01-overview");

  sub("expanding Personal Info");
  await tap(page, "button:has-text('Personal')", 700);
  await shot(page, "profile-02-personal");
  await scroll(page, 100, 20);
  await shot(page, "profile-03-personal-fields");

  sub("expanding Diet & Allergies (shows Vegetarian)");
  await tap(page, "button:has-text('Diet')", 700);
  await shot(page, "profile-04-diet");

  sub("expanding Cuisine Preferences");
  await tap(page, "button:has-text('Cuisine')", 700);
  await shot(page, "profile-05-cuisines");

  sub("expanding Cooking Preferences");
  await tap(page, "button:has-text('Cooking')", 700);
  await shot(page, "profile-06-cooking");

  sub("expanding Goals & Fitness");
  await tap(page, "button:has-text('Goals'), button:has-text('Fitness')", 700);
  await shot(page, "profile-07-goals");

  sub("expanding App Settings → toggle notifications");
  await tap(page, "button:has-text('Settings'), button:has-text('App')", 700);
  await shot(page, "profile-08-settings");
  await tap(page, "button[role='switch'], button:has-text('Notifications')", 600);
  await shot(page, "profile-09-settings-toggled");

  sub("expanding Privacy section");
  await tap(page, "button:has-text('Privacy')", 700);
  await shot(page, "profile-10-privacy");

  sub("expanding Help & Support → open a FAQ");
  await tap(page, "button:has-text('Help'), button:has-text('Support')", 700);
  await shot(page, "profile-11-help");
  // Open first FAQ details element
  const faq = page.locator("details").first();
  if (await faq.isVisible({ timeout: 2000 })) {
    const summary = faq.locator("summary");
    await summary.click();
    await waitFor(page, 600);
    await shot(page, "profile-12-faq-open");
  }

  sub("scrolling to bottom of profile");
  await scroll(page, 500, 18);
  await shot(page, "profile-13-bottom");
}

// ── 11. Print & Share ─────────────────────────────────────────────────────────
async function doPrintShare(page) {
  sub("print & share overview");
  await shot(page, "share-01-overview");

  sub("expanding Fridge Inventory option");
  const expandBtns = page.locator("button:has(svg[data-lucide='chevron-down'])");
  const n = await expandBtns.count();
  if (n > 0) {
    await expandBtns.nth(0).click();
    await waitFor(page, 700);
    await shot(page, "share-02-fridge-export");
  }

  sub("toggling preview");
  await tap(page, "button:has(svg[data-lucide='eye']), button:has-text('Preview')", 800);
  await shot(page, "share-03-preview-open");
  await tap(page, "button:has(svg[data-lucide='eye']), button:has-text('Preview'), button:has(svg[data-lucide='eye-off'])", 400);

  sub("expanding Meal Plan export");
  if (n > 1) {
    await expandBtns.nth(1).click();
    await waitFor(page, 700);
    await shot(page, "share-04-meal-plan-export");
  }

  sub("expanding Grocery List export");
  if (n > 2) {
    await expandBtns.nth(2).click();
    await waitFor(page, 700);
    await shot(page, "share-05-grocery-export");
  }

  sub("scrolling to share buttons row");
  await scroll(page, 300, 18);
  await shot(page, "share-06-share-buttons");

  sub("clicking WhatsApp share button");
  await tap(page, "button:has(svg[data-lucide='message-circle']), button:has-text('WhatsApp')", 700);
  await shot(page, "share-07-whatsapp-share");
  await tap(page, "button:has-text('Cancel'), button:has(svg[data-lucide='x'])", 400);

  sub("clicking Copy Link button");
  await tap(page, "button:has(svg[data-lucide='link-2']), button:has-text('Copy Link')", 700);
  await shot(page, "share-08-link-copied");

  sub("scrolling to bottom");
  await scroll(page, 200, 18);
  await shot(page, "share-09-bottom");
}

// ─── Ordered Tab List ─────────────────────────────────────────────────────────

const TABS = [
  { route: "/food-quiz",    label: "Tab 1 · Food Quiz",      fn: doFoodQuiz    },
  { route: "/",             label: "Tab 2 · Dashboard",       fn: doDashboard   },
  { route: "/scan",         label: "Tab 3 · Fridge Scan",     fn: doFridgeScan  },
  { route: "/meals",        label: "Tab 4 · Meals",           fn: doMeals       },
  { route: "/planner",      label: "Tab 5 · Meal Planner",    fn: doPlanner     },
  { route: "/grocery",      label: "Tab 6 · Grocery",         fn: doGrocery     },
  { route: "/health-scan",  label: "Tab 7 · Health Scan",     fn: doHealthScan  },
  { route: "/chat",         label: "Tab 8 · AI Chat",         fn: doChat        },
  { route: "/achievements", label: "Tab 9 · Achievements",    fn: doAchievements},
  { route: "/profile",      label: "Tab 10 · Profile",        fn: doProfile     },
  { route: "/print-share",  label: "Tab 11 · Print & Share",  fn: doPrintShare  },
];

// ─── Screenshot pass ──────────────────────────────────────────────────────────

async function captureScreenshots(browser) {
  log("📸", "Starting screenshot pass…");

  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "light",
    geolocation: { latitude: 32.9546, longitude: -97.0098 },
    permissions: ["geolocation"],
  });
  const page = await ctx.newPage();

  // Boot with persona
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await waitLoad(page);
  await injectPersona(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitFor(page, 800);

  for (const tab of TABS) {
    await visit(page, tab.route, tab.label, tab.fn);
  }

  await ctx.close();
  console.log(`\n✅  ${shotN} screenshots saved → demo-assets/screenshots/\n`);
}

// ─── Video pass ───────────────────────────────────────────────────────────────

async function captureVideo(browser) {
  log("🎬", "Starting video recording pass…");

  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: "light",
    recordVideo: { dir: VIDEO_DIR, size: VIEWPORT },
    geolocation: { latitude: 32.9546, longitude: -97.0098 },
    permissions: ["geolocation"],
  });
  const page = await ctx.newPage();

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await waitLoad(page);
  await injectPersona(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await waitFor(page, 1500);

  for (const tab of TABS) {
    log("🎥", tab.label);
    await page.goto(`${BASE_URL}${tab.route}`, { waitUntil: "domcontentloaded" });
    await waitLoad(page);
    await waitFor(page, 1200);
    if (tab.fn) await tab.fn(page).catch((e) => sub(`⚠ ${e.message.slice(0, 80)}`));
    await page.evaluate(() => window.scrollTo(0, 0));
    await waitFor(page, 800);
  }

  // End on dashboard
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await waitFor(page, 1500);

  const rawPath = await page.video()?.path();
  await ctx.close();

  const silentPath = path.join(VIDEO_DIR, "FridgeIQ-demo-silent.webm");
  if (rawPath && existsSync(rawPath)) {
    await copyFile(rawPath, silentPath);
    await unlink(rawPath).catch(() => {});
  } else {
    const files = await readdir(VIDEO_DIR);
    const webms = files.filter((f) => f.endsWith(".webm") && !f.startsWith("FridgeIQ"));
    if (webms.length > 0) {
      await copyFile(path.join(VIDEO_DIR, webms[0]), silentPath);
      for (const f of webms) await unlink(path.join(VIDEO_DIR, f)).catch(() => {});
    }
  }
  sub(`✅  silent video saved`);
  return silentPath;
}

// ─── WAV Music Generator ──────────────────────────────────────────────────────

function buildWav(durationSec = 120) {
  const sr = 44100, ch = 2, bps = 16;
  const N = sr * durationSec, dataSize = N * ch * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF",0); buf.writeUInt32LE(36+dataSize,4);
  buf.write("WAVE",8); buf.write("fmt ",12);
  buf.writeUInt32LE(16,16); buf.writeUInt16LE(1,20);
  buf.writeUInt16LE(ch,22); buf.writeUInt32LE(sr,24);
  buf.writeUInt32LE(sr*ch*2,28); buf.writeUInt16LE(ch*2,32);
  buf.writeUInt16LE(bps,34); buf.write("data",36); buf.writeUInt32LE(dataSize,40);

  const PI2 = 2 * Math.PI;
  const bpm = 128, spb = sr*60/bpm, spp = spb*4;
  const n = { C3:130.81,G3:196,A3:220,F3:174.61,C4:261.63,D4:293.66,E4:329.63,
               F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,
               F5:698.46,G5:783.99,A5:880 };
  const chords = [[n.C4,n.E4,n.G4],[n.G3,n.B4,n.D5],[n.A3,n.C4,n.E4],[n.F3,n.A4,n.C5]];
  const melody = [[n.C5,n.E5,n.G5,n.E5,n.D5,n.F5,n.E5,n.C5],[n.G5,n.A5,n.G5,n.E5,n.F5,n.G5,n.A5,n.G5],
                   [n.A5,n.G5,n.E5,n.C5,n.D5,n.E5,n.F5,n.E5],[n.F5,n.E5,n.D5,n.C5,n.E5,n.G5,n.A5,n.G5]];
  const bass = [n.C3,n.G3,n.A3,n.F3];
  const sin = (f,i) => Math.sin(PI2*f*i/sr);
  const clamp = v => Math.max(-32768,Math.min(32767,Math.round(v)));

  for (let i = 0; i < N; i++) {
    const pi = Math.floor(i/spp)%4, bp = i%spb, pp = i%spp;
    const bEnv = Math.exp(-bp/(spb*0.5));
    let cs = 0; for (const f of chords[pi]) cs += 0.15*bEnv*(sin(f,i)+0.05*sin(f*2,i));
    const en = spb/2, mi = Math.floor(pp/en)%8, mp = pp%en;
    const mEnv = mp<en*0.04 ? mp/(en*0.04) : Math.exp(-(mp-en*0.04)/(en*0.55));
    const mf = melody[pi][mi];
    const ms = 0.26*mEnv*(0.7*sin(mf,i)+0.2*sin(mf*2,i)+0.1*sin(mf*3,i));
    const bn = Math.floor(pp/spb);
    const bassEnv = (bn===0||bn===2) ? Math.exp(-bp/(spb*0.8))*0.75 : 0;
    const bs = bassEnv*(0.6*sin(bass[pi],i)+0.3*sin(bass[pi]*2,i));
    const hh = (i%Math.round(spb/4)) < sr*0.007 ? (Math.random()*2-1)*0.035*(1-(i%Math.round(spb/4))/(sr*0.007)) : 0;
    const s = clamp((cs+ms+bs+hh)*0.7*32767);
    buf.writeInt16LE(s, 44+i*4); buf.writeInt16LE(s, 44+i*4+2);
  }
  return buf;
}

async function ensureMusic() {
  if (existsSync(MUSIC_PATH)) { log("🎵","Reusing existing music"); return true; }
  log("🎵","Generating background music…");
  await writeFile(MUSIC_PATH, buildWav(120));
  sub("✅  background-music.wav  (120 s, C–G–Am–F @ 128 BPM)");
  return true;
}

async function mixAudio(videoIn, audioIn, videoOut) {
  const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
  const ffmpeg = require("fluent-ffmpeg");
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoIn).input(audioIn)
      .outputOptions(["-c:v copy","-c:a libopus","-b:a 128k","-shortest","-map 0:v:0","-map 1:a:0"])
      .output(videoOut)
      .on("end", resolve)
      .on("error", (e, _s, err) => { sub(`⚠  ffmpeg: ${err?.slice(0,120)}`); reject(e); })
      .run();
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║  FridgeIQ Full Demo  ·  Sejal Goyal · Coppell TX  ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");

  // Check server
  const { default: http } = await import("http");
  const up = await new Promise(res => {
    const r = http.get(BASE_URL, (s) => { s.destroy(); res(true); });
    r.on("error", () => res(false));
    r.setTimeout(3000, () => { r.destroy(); res(false); });
  });
  if (!up) { console.error(`❌  Dev server not found at ${BASE_URL}\n    Run: npm run dev\n`); process.exit(1); }

  await ensureDirs();
  const browser = await chromium.launch({ headless: true });

  try {
    await captureScreenshots(browser);

    if (!SKIP_VIDEO) {
      const silentPath = await captureVideo(browser);
      const musicReady = await ensureMusic();
      const finalPath = path.join(VIDEO_DIR, "FridgeIQ-demo-walkthrough.webm");
      if (musicReady && existsSync(silentPath)) {
        log("🎶", "Mixing music into video…");
        try {
          await mixAudio(silentPath, MUSIC_PATH, finalPath);
          await unlink(silentPath).catch(() => {});
          sub(`✅  FridgeIQ-demo-walkthrough.webm`);
        } catch {
          sub("⚠  Mix failed — keeping silent video");
          await copyFile(silentPath, finalPath).catch(() => {});
        }
      }
    }
  } finally {
    await browser.close();
  }

  // Cleanup leftover hash files
  const remaining = await readdir(VIDEO_DIR);
  for (const f of remaining)
    if (f.endsWith(".webm") && !f.startsWith("FridgeIQ"))
      await unlink(path.join(VIDEO_DIR, f)).catch(() => {});

  console.log("\n╔═══════════════════════════════════════════════════╗");
  console.log("║  Done! 🎉                                          ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");
  console.log(`  📸  demo-assets/screenshots/  — ${shotN} screenshots`);
  console.log("  🎬  demo-assets/video/         — FridgeIQ-demo-walkthrough.webm\n");
}

main().catch(e => { console.error("\n❌", e.message); process.exit(1); });
