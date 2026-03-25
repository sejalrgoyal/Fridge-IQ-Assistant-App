/**
 * FridgeIQ Demo Capture Script — Detailed Walkthrough
 *
 * • Takes high-quality screenshots of every screen with expanded sections
 * • Records a detailed video walkthrough showing real interactions
 * • Adds upbeat background music to the video
 * • Uses Sejal Goyal (21, vegetarian student) as the demo persona
 *
 * Usage:
 *   1.  npm run dev          (Terminal 1 — start the app)
 *   2.  npm run demo         (Terminal 2 — capture; pass --url=http://localhost:PORT if needed)
 */

import { chromium } from "playwright";
import { mkdir, copyFile, readdir, unlink, writeFile, rm } from "fs/promises";
import { existsSync, createWriteStream } from "fs";
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

const VIEWPORT = { width: 390, height: 844 };

const SCREENSHOTS_DIR = path.join(__dirname, "demo-assets", "screenshots");
const VIDEO_DIR = path.join(__dirname, "demo-assets", "video");
const MUSIC_PATH = path.join(__dirname, "demo-assets", "background-music.wav");

// ─── Sejal's Demo Persona ─────────────────────────────────────────────────────

const SEJAL_PROFILE = {
  name: "Sejal Goyal",
  age: "21",
  occupation: "Student",
  householdSize: "1",
  bio: "Food-conscious CS student 🌿 | Vegetarian | Trying to eat healthy on a budget",
  location: "New York, NY",
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
  timezone: "America/New_York",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

let step = 0;
function log(icon, msg) {
  step++;
  console.log(`${icon}  ${String(step).padStart(2, "0")}. ${msg}`);
}
function logSub(msg) {
  console.log(`       ${msg}`);
}

async function ensureDirs() {
  // Always wipe screenshots so stale files from previous runs don't mix in
  await rm(SCREENSHOTS_DIR, { recursive: true, force: true });
  await mkdir(SCREENSHOTS_DIR, { recursive: true });
  await mkdir(VIDEO_DIR, { recursive: true });
  await mkdir(path.join(__dirname, "demo-assets"), { recursive: true });
}

async function waitForApp(page) {
  await page.waitForSelector("#root", { timeout: 20000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(400);
}

/** Inject Sejal's full profile + skip guided tour */
async function injectPersona(page) {
  await page.evaluate(
    ({ profile, prefs, quiz, settings }) => {
      localStorage.setItem("fridgeiq_tour_done", "true");
      localStorage.removeItem("fridgeiq_tour_step");
      localStorage.setItem("fridgeiq_profile", JSON.stringify(profile));
      localStorage.setItem("fridgeiq_profile_prefs", JSON.stringify(prefs));
      localStorage.setItem("fridgeiq_prefs", JSON.stringify(quiz));
      localStorage.setItem("fridgeiq_settings", JSON.stringify(settings));
    },
    {
      profile: SEJAL_PROFILE,
      prefs: SEJAL_PREFS,
      quiz: SEJAL_QUIZ,
      settings: SEJAL_SETTINGS,
    }
  );
}

/** Smooth scroll by `pixels` with ease, at `speed` ms per 60px */
async function smoothScroll(page, pixels, speed = 18) {
  const steps = Math.ceil(Math.abs(pixels) / 60);
  const dir = pixels > 0 ? 60 : -60;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((dy) => window.scrollBy(0, dy), dir);
    await page.waitForTimeout(speed);
  }
}

/** Click the first element matching selector, if visible */
async function tryClick(page, selector, waitAfter = 700) {
  try {
    const el = await page.$(selector);
    if (el && await el.isVisible()) {
      await el.scrollIntoViewIfNeeded();
      await el.click();
      await page.waitForTimeout(waitAfter);
      return true;
    }
  } catch {}
  return false;
}

/** Type text character by character (simulates real typing) */
async function typeSlowly(page, selector, text, delay = 80) {
  try {
    const el = await page.$(selector);
    if (el) {
      await el.click();
      await page.waitForTimeout(300);
      await el.type(text, { delay });
    }
  } catch {}
}

// ─── WAV Background Music Generator ──────────────────────────────────────────

/**
 * Generates an upbeat major-key backing track as a raw WAV file.
 * Uses a C–G–Am–F I–V–vi–IV chord progression at 120 BPM
 * with melody, harmony, and bass layers.
 */
function buildUniqueWav(durationSeconds = 120) {
  const sampleRate = 44100;
  const channels = 2;
  const bitsPerSample = 16;
  const numSamples = sampleRate * durationSeconds;
  const dataSize = numSamples * channels * 2;
  const buf = Buffer.alloc(44 + dataSize);

  // WAV header
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels, 22); buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * channels * 2, 28);
  buf.writeUInt16LE(channels * 2, 32); buf.writeUInt16LE(bitsPerSample, 34);
  buf.write("data", 36); buf.writeUInt32LE(dataSize, 40);

  const bpm = 126;
  const spb = sampleRate * 60 / bpm;   // samples per beat
  const spp = spb * 4;                  // samples per 4-beat phrase

  // Note frequencies
  const notes = {
    C3: 130.81, G3: 196.00, A3: 220.00, F3: 174.61,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
    G5: 783.99, A5: 880.00,
  };

  // Chord defs: [root, third, fifth]
  const chords = [
    [notes.C4, notes.E4, notes.G4],  // I  – C major
    [notes.G3, notes.B4, notes.D5],  // V  – G major (D5 used as 5th above)
    [notes.A3, notes.C4, notes.E4],  // vi – A minor
    [notes.F3, notes.A4, notes.C5],  // IV – F major
  ];

  // Melody phrases (8th-note quantised, C major scale)
  const melodies = [
    [notes.C5, notes.E5, notes.G5, notes.E5, notes.D5, notes.F5, notes.E5, notes.C5],
    [notes.G5, notes.A5, notes.G5, notes.E5, notes.F5, notes.G5, notes.A5, notes.G5],
    [notes.A5, notes.G5, notes.E5, notes.C5, notes.D5, notes.E5, notes.F5, notes.E5],
    [notes.F5, notes.E5, notes.D5, notes.C5, notes.E5, notes.G5, notes.A5, notes.G5],
  ];

  // Bass line root notes (one per phrase)
  const bassNotes = [notes.C3, notes.G3, notes.A3, notes.F3];

  const PI2 = 2 * Math.PI;
  const sine = (freq, t) => Math.sin(PI2 * freq * t / sampleRate);
  const clamp = (v) => Math.max(-32768, Math.min(32767, Math.round(v)));

  for (let i = 0; i < numSamples; i++) {
    const phrasePos = i % spp;
    const phraseIdx = Math.floor(i / spp) % chords.length;
    const chord = chords[phraseIdx];
    const melody = melodies[phraseIdx];
    const bass = bassNotes[phraseIdx];

    // --- Chord layer (plucked feel: fast attack, slow release)
    const beatPos = i % spb;
    const beatEnv = Math.exp(-beatPos / (spb * 0.5));
    let chordSample = 0;
    for (const f of chord) {
      chordSample += 0.18 * beatEnv * sine(f, i);
      chordSample += 0.06 * beatEnv * sine(f * 2, i); // 1st harmonic
    }

    // --- Melody layer (8th notes)
    const eighthNote = spb / 2;
    const melodyIdx = Math.floor(phrasePos / eighthNote) % melody.length;
    const melPos = phrasePos % eighthNote;
    const melEnv = melPos < eighthNote * 0.04
      ? melPos / (eighthNote * 0.04)
      : Math.exp(-(melPos - eighthNote * 0.04) / (eighthNote * 0.55));
    const melFreq = melody[melodyIdx];
    const melSample = 0.28 * melEnv * (
      0.7 * sine(melFreq, i) +
      0.2 * sine(melFreq * 2, i) +
      0.1 * sine(melFreq * 3, i)
    );

    // --- Bass layer (on beat 1 and beat 3)
    const beatNum = Math.floor(phrasePos / spb);
    const bassEnv = (beatNum === 0 || beatNum === 2)
      ? Math.exp(-beatPos / (spb * 0.8)) * 0.8
      : 0;
    const bassSample = bassEnv * (0.6 * sine(bass, i) + 0.3 * sine(bass * 2, i));

    // --- Hi-hat (16th note click for rhythm)
    const sixteenth = spb / 4;
    const hhPos = i % Math.round(sixteenth);
    const hhEnv = hhPos < sampleRate * 0.008 ? 1 - hhPos / (sampleRate * 0.008) : 0;
    const noise = (Math.random() * 2 - 1) * 0.04 * hhEnv;

    // --- Mix all layers
    const total = (chordSample + melSample + bassSample + noise) * 0.72 * 32767;
    const s = clamp(total);

    const off = 44 + i * 4;
    buf.writeInt16LE(s, off);     // L
    buf.writeInt16LE(s, off + 2); // R
  }

  return buf;
}

async function ensureMusic() {
  if (existsSync(MUSIC_PATH)) {
    log("🎵", "Reusing existing background music");
    return true;
  }

  log("🎵", "Generating upbeat background music…");
  try {
    const wav = buildUniqueWav(120);
    await writeFile(MUSIC_PATH, wav);
    logSub("✅  background-music.wav written (120 s, C–G–Am–F progression)");
    return true;
  } catch (err) {
    logSub(`⚠️  Could not write music file: ${err.message}`);
    return false;
  }
}

// ─── Mux video + audio via fluent-ffmpeg ─────────────────────────────────────

async function mixAudio(videoIn, audioIn, videoOut) {
  try {
    const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
    const ffmpeg = require("fluent-ffmpeg");
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoIn)
        .input(audioIn)
        .outputOptions([
          "-c:v copy",           // keep original video codec
          "-c:a libopus",        // WebM-compatible audio codec
          "-b:a 128k",
          "-shortest",           // trim to shorter stream
          "-map 0:v:0",
          "-map 1:a:0",
        ])
        .output(videoOut)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
  } catch (err) {
    throw new Error(`ffmpeg mix failed: ${err.message}`);
  }
}

// ─── Per-screen interaction scripts ──────────────────────────────────────────

const SCREEN_SCRIPTS = {

  /** Dashboard — open all three collapsible sections */
  async dashboard(page) {
    logSub("scrolling dashboard…");
    await smoothScroll(page, 180, 22);
    await page.waitForTimeout(600);

    logSub("opening 'What is FridgeIQ?' section…");
    const aboutBtn = await page.$("button:has-text('What is FridgeIQ')");
    if (aboutBtn) { await aboutBtn.click(); await page.waitForTimeout(900); }

    await smoothScroll(page, 120, 22);
    await page.waitForTimeout(500);

    logSub("opening 'How to use' section…");
    const howBtn = await page.$("button:has-text('How to use')");
    if (howBtn) { await howBtn.click(); await page.waitForTimeout(900); }

    await smoothScroll(page, 200, 20);
    await page.waitForTimeout(600);

    logSub("opening 'Weekly Nutrition' section…");
    const nutritionBtn = await page.$("button:has-text('Weekly Nutrition')");
    if (nutritionBtn) { await nutritionBtn.click(); await page.waitForTimeout(900); }

    await smoothScroll(page, 160, 22);
    await page.waitForTimeout(500);
    await smoothScroll(page, -660, 18);
    await page.waitForTimeout(400);
  },

  /** Food Quiz — answer all questions as Sejal */
  async foodQuiz(page) {
    logSub("starting quiz…");
    const startBtn = await page.$("button:has-text('Start Quiz')");
    if (startBtn) {
      await startBtn.click();
      await page.waitForTimeout(900);
    }

    const answerStep = async (labels) => {
      for (const label of labels) {
        const el = await page.$(`button:has-text('${label}')`);
        if (el) { await el.click(); await page.waitForTimeout(320); }
      }
      await page.waitForTimeout(400);
      const nextBtn = await page.$("button:has-text('Next')");
      if (nextBtn) { await nextBtn.click(); await page.waitForTimeout(700); }
    };

    await answerStep(["Vegetarian"]);          // diet
    await answerStep(["None"]);                 // allergies
    await answerStep(["Indian", "Italian", "Thai"]); // cuisines
    await answerStep(["15–30 min"]);            // cooking time
    await answerStep(["Intermediate 🍳"]);      // skill level

    // Goals (last step — has "Save Preferences" button)
    for (const g of ["Eat healthier", "Save money", "Reduce waste"]) {
      const el = await page.$(`button:has-text('${g}')`);
      if (el) { await el.click(); await page.waitForTimeout(280); }
    }
    await page.waitForTimeout(400);
    const saveBtn = await page.$("button:has-text('Save Preferences')");
    if (saveBtn) { await saveBtn.click(); await page.waitForTimeout(1200); }
  },

  /** Fridge Scan — explore items, expand one, open add-item panel */
  async fridgeScan(page) {
    logSub("scrolling through fridge items…");
    await smoothScroll(page, 220, 20);
    await page.waitForTimeout(500);

    logSub("expanding a fridge item detail…");
    const items = await page.$$("[class*='rounded'][class*='border']");
    if (items.length > 0) {
      await items[0].scrollIntoViewIfNeeded();
      await items[0].click();
      await page.waitForTimeout(900);
    }

    await smoothScroll(page, 180, 20);
    await page.waitForTimeout(600);

    logSub("opening search bar…");
    await tryClick(page, "button[aria-label*='search'], button:has(svg[data-lucide='search'])", 700);

    logSub("scrolling to bottom of fridge…");
    await smoothScroll(page, 300, 20);
    await page.waitForTimeout(600);
    await smoothScroll(page, -700, 16);
    await page.waitForTimeout(400);
  },

  /** Meals — scroll feed, open a recipe card */
  async meals(page) {
    logSub("scrolling meals grid…");
    await smoothScroll(page, 280, 20);
    await page.waitForTimeout(600);

    logSub("tapping a recipe card…");
    const cards = await page.$$("[class*='rounded-2xl'], [class*='rounded-xl']");
    for (const card of cards) {
      if (await card.isVisible()) {
        await card.scrollIntoViewIfNeeded();
        await card.click();
        await page.waitForTimeout(1200);
        break;
      }
    }

    logSub("scrolling recipe detail…");
    await smoothScroll(page, 360, 18);
    await page.waitForTimeout(600);
    await smoothScroll(page, -360, 18);
    await page.waitForTimeout(400);

    logSub("closing recipe detail…");
    // Close modal/overlay — try multiple close-button patterns
    await tryClick(page, "button[aria-label='close'], button:has(svg[data-lucide='x'])", 600);
    await page.waitForTimeout(400);
  },

  /** Meal Planner — switch views, click a day slot */
  async planner(page) {
    logSub("scrolling through weekly planner…");
    await smoothScroll(page, 260, 20);
    await page.waitForTimeout(600);

    logSub("switching to Monthly view…");
    const monthBtn = await page.$("button:has-text('Monthly'), button:has-text('Month')");
    if (monthBtn) { await monthBtn.click(); await page.waitForTimeout(1000); }

    await smoothScroll(page, 180, 22);
    await page.waitForTimeout(500);

    logSub("switching back to Weekly view…");
    const weekBtn = await page.$("button:has-text('Weekly'), button:has-text('Week')");
    if (weekBtn) { await weekBtn.click(); await page.waitForTimeout(900); }

    logSub("clicking a day to add a meal…");
    const plusBtns = await page.$$("button:has(svg[data-lucide='plus'])");
    if (plusBtns.length > 0) {
      await plusBtns[0].scrollIntoViewIfNeeded();
      await plusBtns[0].click();
      await page.waitForTimeout(1000);
      await tryClick(page, "button[aria-label='close'], button:has(svg[data-lucide='x'])", 700);
    }

    await smoothScroll(page, -440, 18);
    await page.waitForTimeout(400);
  },

  /** Grocery — expand categories, check items, open store selector */
  async grocery(page) {
    logSub("expanding grocery categories…");
    const catBtns = await page.$$("button[class*='flex'][class*='w-full']");
    for (const btn of catBtns.slice(0, 3)) {
      if (await btn.isVisible()) {
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        await page.waitForTimeout(550);
      }
    }

    logSub("checking off a grocery item…");
    const checkboxes = await page.$$("button:has(svg[data-lucide='circle']), button:has(svg[data-lucide='check-circle'])");
    if (checkboxes.length > 0) {
      await checkboxes[0].scrollIntoViewIfNeeded();
      await checkboxes[0].click();
      await page.waitForTimeout(500);
    }

    logSub("scrolling grocery list…");
    await smoothScroll(page, 280, 20);
    await page.waitForTimeout(600);

    logSub("opening store selector…");
    const storeBtn = await page.$("button:has-text('Find Stores'), button:has-text('Store'), button:has(svg[data-lucide='map-pin'])");
    if (storeBtn) { await storeBtn.click(); await page.waitForTimeout(900); }

    await smoothScroll(page, -560, 18);
    await page.waitForTimeout(400);
  },

  /** Health Scan — open each scan option, type a product search */
  async healthScan(page) {
    logSub("opening section panels…");
    const panels = await page.$$("button[class*='flex'][class*='justify-between']");
    for (const p of panels.slice(0, 3)) {
      if (await p.isVisible()) {
        await p.click();
        await page.waitForTimeout(700);
        await smoothScroll(page, 120, 20);
        await page.waitForTimeout(400);
      }
    }

    logSub("typing 'paneer' in product search…");
    const searchInput = await page.$("input[placeholder*='product'], input[placeholder*='search'], input[type='text']");
    if (searchInput) {
      await searchInput.click();
      await page.waitForTimeout(300);
      await searchInput.type("paneer", { delay: 90 });
      await page.waitForTimeout(700);
      const searchBtn = await page.$("button:has-text('Analyse'), button:has-text('Search'), button:has-text('Check')");
      if (searchBtn) { await searchBtn.click(); await page.waitForTimeout(1200); }
    }

    await smoothScroll(page, 200, 20);
    await page.waitForTimeout(500);
    await smoothScroll(page, -320, 18);
    await page.waitForTimeout(400);
  },

  /** AI Chat — type and send a vegetarian meal suggestion message */
  async chat(page) {
    logSub("typing a chat message as Sejal…");
    const input = await page.$("input[placeholder], textarea[placeholder]");
    if (input) {
      await input.click();
      await page.waitForTimeout(300);
      await input.type("Suggest a quick vegetarian dinner under 30 minutes", { delay: 75 });
      await page.waitForTimeout(600);
      const sendBtn = await page.$("button[type='submit'], button:has(svg[data-lucide='send'])");
      if (sendBtn) {
        await sendBtn.click();
        await page.waitForTimeout(1500);
      }
    }
    await smoothScroll(page, 200, 22);
    await page.waitForTimeout(600);
  },

  /** Achievements — scroll through all badges */
  async achievements(page) {
    logSub("scrolling achievements…");
    await smoothScroll(page, 300, 18);
    await page.waitForTimeout(700);
    await smoothScroll(page, 300, 18);
    await page.waitForTimeout(700);

    logSub("clicking an achievement badge…");
    const badges = await page.$$("[class*='rounded'][class*='p-3'], [class*='rounded-2xl']");
    for (const badge of badges) {
      if (await badge.isVisible()) {
        await badge.scrollIntoViewIfNeeded();
        await badge.click();
        await page.waitForTimeout(900);
        break;
      }
    }
    await smoothScroll(page, -600, 18);
    await page.waitForTimeout(400);
  },

  /** Profile — expand every settings section */
  async profile(page) {
    logSub("scrolling to profile sections…");
    await smoothScroll(page, 100, 22);
    await page.waitForTimeout(500);

    const sectionTitles = ["Personal", "Diet", "Cuisine", "Cooking", "Goals", "Settings", "Privacy", "Help"];
    for (const title of sectionTitles) {
      logSub(`expanding ${title} section…`);
      const btn = await page.$(`button:has-text('${title}')`);
      if (btn && await btn.isVisible()) {
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        await page.waitForTimeout(700);
        await smoothScroll(page, 100, 22);
        await page.waitForTimeout(300);
      }
    }

    await smoothScroll(page, 300, 18);
    await page.waitForTimeout(600);
    await smoothScroll(page, -900, 16);
    await page.waitForTimeout(400);
  },

  /** Print & Share — open export options */
  async printShare(page) {
    logSub("expanding print sections…");
    const btns = await page.$$("button:has(svg[data-lucide='chevron-down'])");
    for (const btn of btns.slice(0, 2)) {
      if (await btn.isVisible()) {
        await btn.scrollIntoViewIfNeeded();
        await btn.click();
        await page.waitForTimeout(700);
      }
    }

    logSub("scrolling through share options…");
    await smoothScroll(page, 240, 20);
    await page.waitForTimeout(600);
    await smoothScroll(page, -240, 18);
    await page.waitForTimeout(400);
  },
};

// ─── Ordered screens ──────────────────────────────────────────────────────────

const SCREENS = [
  { route: "/food-quiz",    name: "01-food-quiz",      title: "Food Quiz",          script: "foodQuiz",    waitMs: 1800 },
  { route: "/",             name: "02-dashboard",      title: "Dashboard",          script: "dashboard",   waitMs: 1800 },
  { route: "/scan",         name: "03-fridge-scan",    title: "Fridge Scan",        script: "fridgeScan",  waitMs: 2000 },
  { route: "/meals",        name: "04-meals",          title: "Meals",              script: "meals",       waitMs: 2000 },
  { route: "/planner",      name: "05-meal-planner",   title: "Meal Planner",       script: "planner",     waitMs: 2000 },
  { route: "/grocery",      name: "06-grocery",        title: "Grocery List",       script: "grocery",     waitMs: 2000 },
  { route: "/health-scan",  name: "07-health-scan",    title: "Health Scan",        script: "healthScan",  waitMs: 2000 },
  { route: "/chat",         name: "08-ai-chat",        title: "AI Chat",            script: "chat",        waitMs: 2000 },
  { route: "/achievements", name: "09-achievements",   title: "Achievements",       script: "achievements",waitMs: 1800 },
  { route: "/profile",      name: "10-profile",        title: "Profile (Sejal)",    script: "profile",     waitMs: 2000 },
  { route: "/print-share",  name: "11-print-share",    title: "Print & Share",      script: "printShare",  waitMs: 1800 },
];

// ─── Screenshot capture ───────────────────────────────────────────────────────

async function captureScreenshots(browser) {
  log("📸", "Starting screenshot capture…\n");

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await injectPersona(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);

  for (const screen of SCREENS) {
    logSub(`→ ${screen.title}`);
    await page.goto(`${BASE_URL}${screen.route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(screen.waitMs);

    // Run the interaction script to get a more interesting state
    if (SCREEN_SCRIPTS[screen.script]) {
      try { await SCREEN_SCRIPTS[screen.script](page); } catch {}
    }

    // Scroll back to top for the screenshot
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const out = path.join(SCREENSHOTS_DIR, `${screen.name}.png`);
    await page.screenshot({ path: out, fullPage: false });
    logSub(`   ✅ saved ${screen.name}.png`);
  }

  await context.close();
  console.log();
  log("📂", `Screenshots saved → demo-assets/screenshots/\n`);
}

// ─── Video walkthrough ────────────────────────────────────────────────────────

async function captureVideo(browser) {
  log("🎬", "Starting video recording…\n");

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: "light",
    recordVideo: { dir: VIDEO_DIR, size: VIEWPORT },
  });
  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await waitForApp(page);
  await injectPersona(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000); // opening pause on dashboard

  for (const screen of SCREENS) {
    logSub(`🎥  Recording: ${screen.title}`);
    await page.goto(`${BASE_URL}${screen.route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(screen.waitMs);

    if (SCREEN_SCRIPTS[screen.script]) {
      try { await SCREEN_SCRIPTS[screen.script](page); } catch {}
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
  }

  // End back on dashboard
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const rawVideoPath = await page.video()?.path();
  await context.close();

  // Find and rename the video file
  const finalSilentPath = path.join(VIDEO_DIR, "FridgeIQ-demo-silent.webm");
  if (rawVideoPath && existsSync(rawVideoPath)) {
    await copyFile(rawVideoPath, finalSilentPath);
    await unlink(rawVideoPath).catch(() => {});
  } else {
    const files = await readdir(VIDEO_DIR);
    const webms = files.filter((f) => f.endsWith(".webm") && !f.startsWith("FridgeIQ"));
    if (webms.length > 0) {
      await copyFile(path.join(VIDEO_DIR, webms[0]), finalSilentPath);
      await unlink(path.join(VIDEO_DIR, webms[0])).catch(() => {});
    }
  }

  logSub(`✅  Silent video: demo-assets/video/FridgeIQ-demo-silent.webm`);
  return finalSilentPath;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   FridgeIQ Demo Capture  ·  Sejal Goyal       ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // Check dev server
  const { default: http } = await import("http");
  const serverUp = await new Promise((resolve) => {
    const req = http.get(BASE_URL, (res) => { res.destroy(); resolve(true); });
    req.on("error", () => resolve(false));
    req.setTimeout(3000, () => { req.destroy(); resolve(false); });
  });

  if (!serverUp) {
    console.error(
      "❌  Dev server not reachable at " + BASE_URL + "\n" +
      "    Run  npm run dev  in another terminal first.\n"
    );
    process.exit(1);
  }

  await ensureDirs();

  const browser = await chromium.launch({ headless: true });

  try {
    await captureScreenshots(browser);
    const silentVideoPath = await captureVideo(browser);

    // Add background music
    console.log();
    const musicReady = await ensureMusic();

    const finalVideoPath = path.join(VIDEO_DIR, "FridgeIQ-demo-walkthrough.webm");

    if (musicReady && existsSync(silentVideoPath)) {
      log("🎶", "Mixing background music into video…");
      try {
        await mixAudio(silentVideoPath, MUSIC_PATH, finalVideoPath);
        await unlink(silentVideoPath).catch(() => {});
        logSub(`✅  Final video: demo-assets/video/FridgeIQ-demo-walkthrough.webm`);
      } catch (err) {
        logSub(`⚠️  Audio mix failed (${err.message}) — keeping silent video`);
        await copyFile(silentVideoPath, finalVideoPath).catch(() => {});
      }
    } else if (existsSync(silentVideoPath)) {
      await copyFile(silentVideoPath, finalVideoPath);
    }

  } finally {
    await browser.close();
  }

  // Clean up any leftover hash-named files
  const remaining = await readdir(VIDEO_DIR);
  for (const f of remaining) {
    if (f.endsWith(".webm") && !f.startsWith("FridgeIQ")) {
      await unlink(path.join(VIDEO_DIR, f)).catch(() => {});
    }
  }

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   Done! 🎉                                    ║");
  console.log("╚══════════════════════════════════════════════╝\n");
  console.log("Outputs:");
  console.log("  📸  demo-assets/screenshots/  — 11 screenshots (Sejal persona)");
  console.log("  🎬  demo-assets/video/         — FridgeIQ-demo-walkthrough.webm");
  console.log("\nTo embed in PowerPoint:");
  console.log("  • Insert → Pictures for screenshots");
  console.log("  • Insert → Video → This Device for the WebM walkthrough\n");
}

main().catch((err) => {
  console.error("\n❌  Demo capture failed:", err.message, "\n");
  process.exit(1);
});
