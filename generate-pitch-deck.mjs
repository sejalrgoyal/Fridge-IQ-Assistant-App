import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";

const C = {
  emerald:   "16A34A",
  emeraldDk: "14532D",
  emeraldLt: "DCFCE7",
  teal:      "0D9488",
  white:     "FFFFFF",
  offWhite:  "F8FAFC",
  slate:     "1E293B",
  muted:     "64748B",
  accent:    "F59E0B",
  accentLt:  "FEF3C7",
  bgDark:    "0F172A",
  divider:   "E2E8F0",
};

const FONT = "Calibri";

function addSlide(opts = {}) {
  const slide = pptx.addSlide();
  if (opts.bg) slide.background = { color: opts.bg };
  return slide;
}

function topBar(slide, color = C.emerald, h = 0.08) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h,
    fill: { color }, line: { color },
  });
}

function pill(slide, text, x, y, color = C.emerald) {
  slide.addText(text.toUpperCase(), {
    x, y, w: 2.5, h: 0.28,
    fill: { color }, color: C.white,
    fontSize: 8, bold: true, align: "center", fontFace: FONT,
    shape: pptx.ShapeType.roundRect, rectRadius: 0.05,
  });
}

function heading(slide, text, x, y, w = 11, color = C.slate) {
  slide.addText(text, { x, y, w, h: 0.7, color, fontSize: 26, bold: true, fontFace: FONT });
}

function body(slide, text, x, y, w = 11, opts = {}) {
  slide.addText(text, {
    x, y, w, h: opts.h || 0.4,
    color: opts.color || C.slate,
    fontSize: opts.size || 13,
    fontFace: FONT,
    bold: opts.bold || false,
    italic: opts.italic || false,
    wrap: true, valign: "top",
    ...opts,
  });
}

function card(slide, emoji, title, desc, x, y, w = 3.6, color = C.emerald) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 1.5,
    fill: { color: C.white }, line: { color: C.divider, pt: 1 },
    shadow: { type: "outer", color: "94a3b8", opacity: 0.15, blur: 8, offset: 3, angle: 270 },
    rectRadius: 0.12,
  });
  slide.addText(emoji, { x: x + 0.18, y: y + 0.15, w: 0.55, h: 0.55, fontSize: 24, align: "center", fontFace: FONT });
  slide.addText(title, { x: x + 0.75, y: y + 0.15, w: w - 0.9, h: 0.35, color, fontSize: 12, bold: true, fontFace: FONT });
  slide.addText(desc,  { x: x + 0.75, y: y + 0.52, w: w - 0.9, h: 0.75, color: C.muted, fontSize: 10, fontFace: FONT, wrap: true, valign: "top" });
}

function stat(slide, value, label, x, y, w = 2.4, bgColor = C.emeraldLt, valColor = C.emeraldDk) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 1.3, fill: { color: bgColor }, line: { color: bgColor }, rectRadius: 0.1,
  });
  slide.addText(value, { x, y: y + 0.08, w, h: 0.65, color: valColor, fontSize: 30, bold: true, align: "center", fontFace: FONT });
  slide.addText(label, { x, y: y + 0.72, w, h: 0.45, color: C.muted, fontSize: 10, align: "center", fontFace: FONT, wrap: true });
}

function stepBox(slide, num, title, desc, x, y, color = C.emerald) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w: 2.35, h: 1.8,
    fill: { color: C.white }, line: { color, pt: 2 }, rectRadius: 0.12,
  });
  slide.addText(num,   { x, y: y + 0.12, w: 2.35, h: 0.5, color, fontSize: 22, bold: true, align: "center", fontFace: FONT });
  slide.addText(title, { x: x + 0.1, y: y + 0.6, w: 2.15, h: 0.38, color: C.slate, fontSize: 11, bold: true, align: "center", fontFace: FONT });
  slide.addText(desc,  { x: x + 0.1, y: y + 1.0, w: 2.15, h: 0.7, color: C.muted, fontSize: 9.5, align: "center", fontFace: FONT, wrap: true, valign: "top" });
}

// â”€â”€â”€ SLIDE 1: TITLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.bgDark });
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.06, h: "100%", fill: { color: C.emerald }, line: { color: C.emerald } });
  s.addShape(pptx.ShapeType.ellipse, { x: 9.5, y: -1.2, w: 5.5, h: 5.5, fill: { color: "1B4332" }, line: { color: "1B4332" } });
  s.addShape(pptx.ShapeType.ellipse, { x: 10.8, y: 3.5, w: 3.5, h: 3.5, fill: { color: "134E4A" }, line: { color: "134E4A" } });

  s.addText("FridgeIQ", { x: 0.5, y: 1.0, w: 9, h: 1.1, color: C.white, fontSize: 52, bold: true, fontFace: FONT });
  s.addText("The AI-Powered Kitchen & Meal Intelligence Assistant", { x: 0.5, y: 2.15, w: 9, h: 0.65, color: C.emerald, fontSize: 22, italic: true, fontFace: FONT });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2.95, w: 4, h: 0.04, fill: { color: C.emerald }, line: { color: C.emerald } });
  s.addText("Reduce food waste  |  Plan smarter meals  |  Shop with confidence", { x: 0.5, y: 3.15, w: 9, h: 0.45, color: "94A3B8", fontSize: 14, fontFace: FONT });
  s.addText("Business Case & Pitch Deck", { x: 0.5, y: 5.2, w: 4, h: 0.35, color: "64748B", fontSize: 11, italic: true, fontFace: FONT });
  s.addText("March 2026", { x: 0.5, y: 5.58, w: 4, h: 0.3, color: "475569", fontSize: 11, fontFace: FONT });
}

// â”€â”€â”€ SLIDE 2: AGENDA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s);
  pill(s, "Overview", 0.45, 0.22);
  heading(s, "What We'll Cover Today", 0.45, 0.62);

  const items = [
    ["01", "The Problem",            "Why food waste & poor planning cost households thousands"],
    ["02", "Product Vision",          "What FridgeIQ is and what it enables"],
    ["03", "Market Opportunity",      "A $10B+ addressable market ready to be disrupted"],
    ["04", "Solution & Architecture", "How FridgeIQ works under the hood"],
    ["05", "Go-to-Market",            "Launch strategy, monetization & distribution"],
    ["06", "Roadmap & Next Steps",    "Our 12-month plan and what we need to scale"],
  ];

  const colX = [0.45, 6.8];
  [[0,1,2],[3,4,5]].forEach((idxList, ci) => {
    idxList.forEach((idx, ri) => {
      const [num, title, sub] = items[idx];
      const x = colX[ci];
      const y = 1.6 + ri * 1.55;
      s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.8, h: 1.35, fill: { color: C.white }, line: { color: C.divider, pt: 1 }, rectRadius: 0.1 });
      s.addText(num,   { x: x + 0.15, y: y + 0.32, w: 0.55, h: 0.55, color: C.emerald, fontSize: 20, bold: true, fontFace: FONT });
      s.addText(title, { x: x + 0.8, y: y + 0.15, w: 4.8, h: 0.38, color: C.slate, fontSize: 13, bold: true, fontFace: FONT });
      s.addText(sub,   { x: x + 0.8, y: y + 0.55, w: 4.8, h: 0.55, color: C.muted, fontSize: 10, fontFace: FONT, wrap: true });
    });
  });
}

// â”€â”€â”€ SLIDE 3: THE PROBLEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s, "DC2626");
  pill(s, "The Problem", 0.45, 0.22, "DC2626");
  heading(s, "The Kitchen is Broken", 0.45, 0.62, 11, "DC2626");
  body(s, "Every household silently loses money, food, and time -- yet the tools to fix it barely exist.", 0.45, 1.38, 11, { size: 14, color: C.muted, italic: true });

  const problems = [
    ["$1,500+", "wasted per US household per year on discarded food (USDA)"],
    ["30%",     "of all food purchased in the US is thrown away uneaten"],
    ["4-in-1",  "apps needed today: inventory tracker, recipe finder, planner & grocery list"],
    ["Zero",    "mainstream apps combine fridge tracking + meal intelligence + smart shopping"],
  ];

  problems.forEach(([val, desc], i) => {
    const x = 0.45 + (i % 2) * 6.35;
    const y = 1.9 + Math.floor(i / 2) * 1.7;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.95, h: 1.5, fill: { color: C.white }, line: { color: "FECACA", pt: 1 }, rectRadius: 0.1 });
    s.addText(val,  { x: x + 0.25, y: y + 0.1, w: 5.45, h: 0.5, color: "DC2626", fontSize: 22, bold: true, fontFace: FONT });
    s.addText(desc, { x: x + 0.25, y: y + 0.65, w: 5.45, h: 0.6, color: C.muted, fontSize: 11, fontFace: FONT, wrap: true });
  });
}

// â”€â”€â”€ SLIDE 4: VISION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.bgDark });
  topBar(s, C.emerald);

  s.addText('"', { x: 0.3, y: 0.4, w: 1, h: 1.2, color: C.emerald, fontSize: 80, bold: true, fontFace: FONT });

  s.addText(
    "What if your fridge could think?\nFridgeIQ is the AI-powered kitchen assistant that tracks what you have, suggests what to cook, plans your week, and builds your grocery list -- all in one place.",
    { x: 0.45, y: 1.1, w: 12, h: 2.4, color: C.white, fontSize: 22, fontFace: FONT, lineSpacingMultiple: 1.5, wrap: true }
  );

  s.addShape(pptx.ShapeType.rect, { x: 0.45, y: 3.6, w: 3.5, h: 0.04, fill: { color: C.emerald }, line: { color: C.emerald } });
  s.addText("Our Vision", { x: 0.45, y: 3.8, w: 5, h: 0.35, color: C.emerald, fontSize: 12, bold: true, fontFace: FONT });
  s.addText(
    "To become the household OS for food intelligence -- reducing waste, improving nutrition, and saving families real money through smart, personalized guidance.",
    { x: 0.45, y: 4.2, w: 11, h: 0.75, color: "94A3B8", fontSize: 13, fontFace: FONT, wrap: true }
  );

  const vps = [
    ["Instant Value",  "Scan your fridge, get meal ideas in seconds"],
    ["Reduce Waste",   "Expiry alerts & use-what-you-have recipes"],
    ["Save Money",     "Smart grocery lists with price comparisons"],
  ];
  vps.forEach(([t, d], i) => {
    const x = 0.45 + i * 4.3;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 5.3, w: 3.9, h: 1.6, fill: { color: "1E293B" }, line: { color: C.emerald, pt: 1 }, rectRadius: 0.1 });
    s.addText(t, { x: x + 0.2, y: 5.45, w: 3.5, h: 0.38, color: C.emerald, fontSize: 12, bold: true, fontFace: FONT });
    s.addText(d, { x: x + 0.2, y: 5.85, w: 3.5, h: 0.75, color: "94A3B8", fontSize: 10, fontFace: FONT, wrap: true });
  });
}

// â”€â”€â”€ SLIDE 5: MARKET OPPORTUNITY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s);
  pill(s, "Market Opportunity", 0.45, 0.22);
  heading(s, "A Multi-Billion Dollar Market Ready for Disruption", 0.45, 0.62);
  body(s, "FridgeIQ sits at the intersection of three massive, fast-growing markets.", 0.45, 1.38, 11, { size: 13, color: C.muted });

  const markets = [
    ["$15.7B", "Food Waste\nReduction Tech",    "Global market by 2030 (CAGR 6.8%)"],
    ["$8.3B",  "Meal Planning\nApps & Services", "US meal-kit & planning apps 2025"],
    ["$4.1B",  "Smart Grocery\n& Shopping Tools","AI-powered grocery & retail-tech 2025"],
    ["150M+",  "US Households",                  "Primary addressable market"],
  ];
  markets.forEach(([val, mkt, src], i) => {
    const x = 0.45 + i * 3.18;
    const isPrimary = i === 0;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 2.0, w: 2.95, h: 2.0, fill: { color: isPrimary ? C.emerald : C.white }, line: { color: isPrimary ? C.emerald : C.divider, pt: 1 }, rectRadius: 0.12 });
    s.addText(val, { x, y: 2.18, w: 2.95, h: 0.7, color: isPrimary ? C.white : C.emeraldDk, fontSize: 26, bold: true, align: "center", fontFace: FONT });
    s.addText(mkt, { x: x + 0.1, y: 2.9, w: 2.75, h: 0.55, color: isPrimary ? C.emeraldLt : C.slate, fontSize: 11, bold: true, align: "center", fontFace: FONT, wrap: true });
    s.addText(src, { x: x + 0.1, y: 3.48, w: 2.75, h: 0.4, color: isPrimary ? "A7F3D0" : C.muted, fontSize: 9, align: "center", fontFace: FONT, wrap: true });
  });

  heading(s, "Market Sizing (US Focus)", 0.45, 4.3, 11, C.slate);
  const sizes = [
    ["TAM", "$28B",  "All US food planning, grocery & waste-reduction spend"],
    ["SAM", "$4.2B", "Tech-forward US households using food/meal apps"],
    ["SOM", "$210M", "5% capture within 5 years via freemium + subscriptions"],
  ];
  sizes.forEach(([label, val, desc], i) => {
    const x = 0.45 + i * 4.28;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 5.1, w: 3.95, h: 1.7, fill: { color: C.white }, line: { color: C.divider, pt: 1 }, rectRadius: 0.1 });
    s.addText(`${label}: ${val}`, { x: x + 0.2, y: 5.25, w: 3.55, h: 0.45, color: C.emeraldDk, fontSize: 15, bold: true, fontFace: FONT });
    s.addText(desc, { x: x + 0.2, y: 5.72, w: 3.55, h: 0.75, color: C.muted, fontSize: 10, fontFace: FONT, wrap: true });
  });
}

// â”€â”€â”€ SLIDE 6: TARGET USERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s);
  pill(s, "Target Users", 0.45, 0.22);
  heading(s, "Who Uses FridgeIQ?", 0.45, 0.62);

  const personas = [
    { name: "The Busy Parent",               age: "30-45", pain: "Meal planning chaos, frequent food spoilage, overspending on groceries", gain: "Weekly meal plans auto-generated from fridge contents, expiry alerts, smart grocery lists", tag: "Primary" },
    { name: "The Health-Conscious Millennial",age: "24-35", pain: "Wants to eat healthier but lacks time; wastes fresh produce; doesn't know what to cook", gain: "Nutrition-aware meal suggestions, Yuka-style health scanning, personalized food quiz", tag: "Primary" },
    { name: "The Budget-Focused Household",   age: "Any",   pain: "Rising grocery costs, duplicate purchases, no visibility into what's already home", gain: "Price comparison across stores, multi-store routing, prevent over-buying", tag: "Secondary" },
    { name: "The Young Adult / Student",      age: "18-28", pain: "Limited cooking skills, impulsive buying, small fridge, frequent food waste", gain: "Simple gamified interface, beginner-friendly recipes, onboarding quiz & achievements", tag: "Secondary" },
  ];

  personas.forEach((p, i) => {
    const x = 0.45 + (i % 2) * 6.35;
    const y = 1.6 + Math.floor(i / 2) * 2.55;
    const isPrimary = p.tag === "Primary";
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.95, h: 2.35, fill: { color: C.white }, line: { color: isPrimary ? C.emerald : C.divider, pt: isPrimary ? 2 : 1 }, rectRadius: 0.12 });
    s.addText(p.name,  { x: x + 0.2, y: y + 0.12, w: 4.0, h: 0.38, color: C.slate, fontSize: 13, bold: true, fontFace: FONT });
    s.addText(`Age: ${p.age}`, { x: x + 0.2, y: y + 0.52, w: 2, h: 0.28, color: C.muted, fontSize: 9.5, fontFace: FONT });
    s.addText(p.tag, { x: x + 4.45, y: y + 0.12, w: 1.25, h: 0.3, fill: { color: isPrimary ? C.emeraldLt : C.accentLt }, color: isPrimary ? C.emeraldDk : "92400E", fontSize: 8.5, bold: true, align: "center", fontFace: FONT, shape: pptx.ShapeType.roundRect, rectRadius: 0.05 });
    s.addText("Pain: ", { x: x + 0.2, y: y + 0.88, w: 0.65, h: 0.28, color: "DC2626", fontSize: 10, bold: true, fontFace: FONT });
    s.addText(p.pain,  { x: x + 0.85, y: y + 0.88, w: 4.85, h: 0.5, color: C.muted, fontSize: 9.5, fontFace: FONT, wrap: true });
    s.addText("Gain: ", { x: x + 0.2, y: y + 1.52, w: 0.65, h: 0.28, color: C.emerald, fontSize: 10, bold: true, fontFace: FONT });
    s.addText(p.gain,  { x: x + 0.85, y: y + 1.52, w: 4.85, h: 0.6, color: C.muted, fontSize: 9.5, fontFace: FONT, wrap: true });
  });
}

// â”€â”€â”€ SLIDE 7: SOLUTION OVERVIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s);
  pill(s, "Solution Overview", 0.45, 0.22);
  heading(s, "How FridgeIQ Works", 0.45, 0.62);
  body(s, "A complete kitchen intelligence loop -- from what's in your fridge to what's on your plate.", 0.45, 1.35, 11, { size: 13, color: C.muted, italic: true });

  const steps = [
    ["1", "Take the\nFood Quiz",    "Set dietary preferences, health goals & allergens for personalized results"],
    ["2", "Scan Your\nFridge",      "Photo scan or manual add. Barcode lookup via Open Food Facts API"],
    ["3", "Get Meal\nIdeas",        "AI suggests recipes from your current inventory with nutrition shown per meal"],
    ["4", "Plan Your\nWeek",        "Drag meals onto a weekly calendar. Share to WhatsApp or print"],
    ["5", "Shop\nSmarter",          "Auto-generated grocery list with store price estimates & multi-store routing"],
  ];

  const startX = 0.35;
  const spacing = 2.52;
  steps.forEach(([num, title, desc], i) => {
    stepBox(s, num, title, desc, startX + i * spacing, 1.85, C.emerald);
    if (i < steps.length - 1) {
      s.addText("->", { x: startX + i * spacing + 2.38, y: 2.62, w: 0.28, h: 0.3, color: C.muted, fontSize: 14, bold: true, fontFace: FONT });
    }
  });

  body(s, "Plus bonus features:", 0.45, 3.82, 11, { size: 11, bold: true, color: C.slate });

  const extras = [
    ["Health Scanner",    "Yuka-style product scoring & ingredient review"],
    ["Achievements",       "Gamified XP system rewards healthy, waste-free habits"],
    ["Expiry Calendar",   "Visual calendar view of upcoming expirations"],
    ["Nutrition Tracking", "Weekly nutrition goals, daily summaries & progress charts"],
  ];
  extras.forEach(([t, d], i) => {
    card(s, ["??","??","??","??"][i] || ">>", t, d, 0.38 + i * 3.25, 4.15, 3.1, C.teal);
  });
}

// â”€â”€â”€ SLIDE 8: ARCHITECTURE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s);
  pill(s, "Architecture", 0.45, 0.22);
  heading(s, "Solution Architecture", 0.45, 0.62);

  const layers = [
    { color: "EFF6FF", border: "BFDBFE", label: "Presentation Layer", items: ["React 18 + TypeScript", "Tailwind CSS + shadcn/ui", "Framer Motion animations", "Recharts (nutrition graphs)"] },
    { color: "F0FDF4", border: "BBF7D0", label: "Application Layer",  items: ["React Router 6 (SPA)", "TanStack Query (data cache)", "Custom hooks & localStorage", "Barcode via html5-qrcode"] },
    { color: "FEFCE8", border: "FDE68A", label: "Integration Layer",  items: ["Open Food Facts API (barcodes)", "Google Maps + Places API", "Google Fonts CDN", "Unsplash (product images)"] },
  ];

  layers.forEach((layer, i) => {
    const y = 1.5 + i * 1.8;
    s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y, w: 6.5, h: 1.6, fill: { color: layer.color }, line: { color: layer.border, pt: 2 }, rectRadius: 0.1 });
    s.addText(layer.label, { x: 0.65, y: y + 0.1, w: 3.5, h: 0.35, color: C.slate, fontSize: 11, bold: true, fontFace: FONT });
    layer.items.forEach((item, j) => {
      s.addText(`- ${item}`, { x: 0.65 + (j % 2) * 3.1, y: y + 0.5 + Math.floor(j / 2) * 0.45, w: 2.9, h: 0.4, color: C.muted, fontSize: 9.5, fontFace: FONT });
    });
  });

  s.addText("Data Flow", { x: 7.4, y: 1.45, w: 5, h: 0.38, color: C.slate, fontSize: 14, bold: true, fontFace: FONT });

  const flows = [
    ["User",          "Interacts via mobile-first web UI"],
    ["localStorage",  "Fridge items, preferences & nutrition goals persisted in browser"],
    ["External APIs", "Open Food Facts (nutrition) + Google Maps (stores, routing)"],
    ["UI Engine",     "React re-renders with fresh data; TanStack Query caches API calls"],
  ];

  flows.forEach(([title, desc], i) => {
    const y = 1.92 + i * 1.32;
    s.addShape(pptx.ShapeType.roundRect, { x: 7.4, y, w: 5.3, h: 1.1, fill: { color: C.white }, line: { color: C.divider, pt: 1 }, rectRadius: 0.1 });
    s.addText(title, { x: 7.6, y: y + 0.08, w: 4.9, h: 0.32, color: C.emeraldDk, fontSize: 11, bold: true, fontFace: FONT });
    s.addText(desc,  { x: 7.6, y: y + 0.42, w: 4.9, h: 0.5, color: C.muted, fontSize: 9.5, fontFace: FONT, wrap: true });
    if (i < flows.length - 1) {
      s.addText("v", { x: 9.8, y: y + 1.12, w: 0.5, h: 0.3, color: C.emerald, fontSize: 14, bold: true, align: "center", fontFace: FONT });
    }
  });

  s.addShape(pptx.ShapeType.roundRect, { x: 0.45, y: 6.7, w: 12.45, h: 0.55, fill: { color: C.emeraldLt }, line: { color: C.emerald, pt: 1 }, rectRadius: 0.08 });
  s.addText("Current: 100% client-side (zero backend cost, instant deploy)  |  Next: Add Node.js/Python AI backend + PostgreSQL for multi-device sync & true LLM integration", {
    x: 0.65, y: 6.76, w: 12.1, h: 0.4, color: C.emeraldDk, fontSize: 9.5, fontFace: FONT,
  });
}

// â”€â”€â”€ SLIDE 9: COMPETITIVE LANDSCAPE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s);
  pill(s, "Competitive Landscape", 0.45, 0.22);
  heading(s, "Why FridgeIQ Wins", 0.45, 0.62);

  const cols = ["Fridge\nTracking", "AI Meal\nSuggestions", "Meal\nPlanning", "Smart\nGrocery", "Health\nScanning", "Gamification"];
  const rows = [
    { name: "FridgeIQ", primary: true,  vals: [true, true, true, true, true, true]  },
    { name: "Mealime",  primary: false, vals: [false, true, true, false, false, false] },
    { name: "Yuka",     primary: false, vals: [false, false, false, false, true, false] },
    { name: "OurGroceries", primary: false, vals: [false, false, false, true, false, false] },
    { name: "Paprika",  primary: false, vals: [false, false, true, false, false, false] },
    { name: "NoWaste",  primary: false, vals: [true, false, false, false, false, false] },
  ];

  const tableX = 0.45;
  const tableY = 1.55;
  const colW = 1.75;
  const rowH = 0.72;
  const labelW = 2.0;

  s.addShape(pptx.ShapeType.rect, { x: tableX, y: tableY, w: labelW, h: rowH, fill: { color: C.emerald }, line: { color: C.emerald } });
  s.addText("Product", { x: tableX + 0.1, y: tableY + 0.2, w: labelW - 0.2, h: 0.35, color: C.white, fontSize: 11, bold: true, fontFace: FONT });

  cols.forEach((col, ci) => {
    const x = tableX + labelW + ci * colW;
    s.addShape(pptx.ShapeType.rect, { x, y: tableY, w: colW, h: rowH, fill: { color: C.emeraldDk }, line: { color: C.emerald, pt: 0.5 } });
    s.addText(col, { x: x + 0.05, y: tableY + 0.05, w: colW - 0.1, h: 0.6, color: C.white, fontSize: 9, bold: true, align: "center", fontFace: FONT, wrap: true });
  });

  rows.forEach((row, ri) => {
    const y = tableY + rowH + ri * rowH;
    const bg = row.primary ? C.emeraldLt : (ri % 2 === 0 ? C.white : "F8FAFC");
    s.addShape(pptx.ShapeType.rect, { x: tableX, y, w: labelW, h: rowH, fill: { color: bg }, line: { color: C.divider, pt: 0.5 } });
    s.addText(row.name, { x: tableX + 0.1, y: y + 0.2, w: labelW - 0.2, h: 0.35, color: row.primary ? C.emeraldDk : C.slate, fontSize: row.primary ? 11 : 10, bold: row.primary, fontFace: FONT });
    row.vals.forEach((v, ci) => {
      const x = tableX + labelW + ci * colW;
      s.addShape(pptx.ShapeType.rect, { x, y, w: colW, h: rowH, fill: { color: bg }, line: { color: C.divider, pt: 0.5 } });
      s.addText(v ? "YES" : "-", { x, y: y + 0.2, w: colW, h: 0.35, fontSize: 10, align: "center", fontFace: FONT, color: v ? C.emeraldDk : C.muted, bold: v });
    });
  });

  s.addText("FridgeIQ is the only product combining all six capabilities in a single, free-to-start app.", {
    x: 0.45, y: 6.72, w: 12.4, h: 0.4, color: C.emeraldDk, fontSize: 11, bold: true, italic: true, fontFace: FONT,
  });
}

// â”€â”€â”€ SLIDE 10: BUSINESS MODEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s);
  pill(s, "Business Model", 0.45, 0.22);
  heading(s, "How We Make Money", 0.45, 0.62);

  const tiers = [
    {
      name: "Free",
      price: "$0 / mo",
      color: C.divider,
      features: ["Up to 30 fridge items", "5 meal suggestions/week", "Basic grocery list", "Guided onboarding tour"],
      dark: false,
    },
    {
      name: "FridgeIQ Pro",
      price: "$4.99 / mo",
      color: C.emerald,
      features: ["Unlimited items & history", "Unlimited AI meal plans", "Full nutrition dashboard", "Health scanner (Yuka-style)", "Multi-store price comparison", "Meal plan sharing & print"],
      dark: true,
    },
    {
      name: "FridgeIQ Family",
      price: "$9.99 / mo",
      color: C.emeraldDk,
      features: ["Everything in Pro", "Up to 5 household members", "Shared fridge & grocery list", "Family nutrition goals", "Priority support"],
      dark: true,
    },
  ];

  tiers.forEach((t, i) => {
    const x = 0.45 + i * 4.38;
    const fillColor = i === 1 ? C.emerald : (i === 2 ? C.emeraldDk : C.white);
    const lineColor = i === 0 ? C.divider : fillColor;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.5, w: 4.1, h: 4.2, fill: { color: fillColor }, line: { color: lineColor, pt: i === 1 ? 3 : 1 }, rectRadius: 0.15 });
    if (i === 1) {
      s.addShape(pptx.ShapeType.roundRect, { x: x + 0.8, y: 1.22, w: 2.5, h: 0.38, fill: { color: C.accent }, line: { color: C.accent }, rectRadius: 0.08 });
      s.addText("Most Popular", { x: x + 0.8, y: 1.26, w: 2.5, h: 0.3, color: C.white, fontSize: 9.5, bold: true, align: "center", fontFace: FONT });
    }
    s.addText(t.name,  { x, y: 1.65, w: 4.1, h: 0.45, color: t.dark ? C.white : C.slate, fontSize: 14, bold: true, align: "center", fontFace: FONT });
    s.addText(t.price, { x, y: 2.12, w: 4.1, h: 0.55, color: t.dark ? "A7F3D0" : C.emerald, fontSize: 24, bold: true, align: "center", fontFace: FONT });
    s.addShape(pptx.ShapeType.rect, { x: x + 0.5, y: 2.72, w: 3.1, h: 0.03, fill: { color: t.dark ? "A7F3D0" : C.divider }, line: { color: t.dark ? "A7F3D0" : C.divider } });
    t.features.forEach((f, fi) => {
      s.addText(`+ ${f}`, { x: x + 0.25, y: 2.82 + fi * 0.42, w: 3.6, h: 0.38, color: t.dark ? C.white : C.slate, fontSize: 10, fontFace: FONT });
    });
  });

  body(s, "Additional Revenue Streams", 0.45, 5.9, 11, { bold: true, color: C.slate, size: 12 });
  const streams = [
    ["Affiliate Links", "Grocery delivery partners (Instacart, Walmart+, Amazon Fresh)"],
    ["White-Label B2B", "License to meal-kit companies, dieticians, wellness apps"],
    ["Anonymized Data", "Aggregated food trend insights to CPG brands (privacy-first)"],
  ];
  streams.forEach(([t, d], i) => {
    s.addText(t, { x: 0.45 + i * 4.38, y: 6.3, w: 3.9, h: 0.35, color: C.emeraldDk, fontSize: 11, bold: true, fontFace: FONT });
    s.addText(d, { x: 0.45 + i * 4.38, y: 6.65, w: 4.0, h: 0.55, color: C.muted, fontSize: 9.5, fontFace: FONT, wrap: true });
  });
}

// â”€â”€â”€ SLIDE 11: GO-TO-MARKET â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s);
  pill(s, "Go-to-Market", 0.45, 0.22);
  heading(s, "Launch Strategy", 0.45, 0.62);

  const phases = [
    {
      phase: "Phase 1", period: "Months 1-3", title: "Validate & Launch", color: C.emerald,
      items: [
        "Launch as a PWA on the web (zero App Store friction)",
        "Target eco-conscious & health communities on Reddit, TikTok, Instagram",
        "Onboard 500 beta users through food-waste advocacy groups",
        "Iterate weekly based on in-app usage analytics",
        "Collect testimonials and real food-saved stories",
      ],
    },
    {
      phase: "Phase 2", period: "Months 4-7", title: "Grow & Monetize", color: C.teal,
      items: [
        "Launch iOS & Android native apps (React Native)",
        "Activate freemium -> Pro upsell in-app prompts",
        "Partner with Instacart / Walmart+ for grocery affiliate commissions",
        "Influencer partnerships with healthy-eating creators",
        "A/B test onboarding funnels for activation rate improvements",
      ],
    },
    {
      phase: "Phase 3", period: "Months 8-12", title: "Scale & Expand", color: C.accent,
      items: [
        "Add true AI backend (GPT-4 or open-source LLM) for personalized chat",
        "B2B pilot: license FridgeIQ to nutritionists & dietitian practices",
        "Expand to Canada & UK (localize pricing, stores, units)",
        "Introduce family & household plan tier",
        "Explore CPG brand partnerships for sponsored product placement",
      ],
    },
  ];

  phases.forEach((p, i) => {
    const x = 0.45 + i * 4.38;
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.45, w: 4.1, h: 5.7, fill: { color: C.white }, line: { color: p.color, pt: 2 }, rectRadius: 0.12 });
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.45, w: 4.1, h: 0.9, fill: { color: p.color }, line: { color: p.color }, rectRadius: 0.12 });
    s.addShape(pptx.ShapeType.rect, { x, y: 1.9, w: 4.1, h: 0.45, fill: { color: p.color }, line: { color: p.color } });
    s.addText(`${p.phase}: ${p.period}`, { x: x + 0.15, y: 1.5, w: 3.8, h: 0.35, color: C.white, fontSize: 10, bold: true, fontFace: FONT });
    s.addText(p.title, { x: x + 0.15, y: 1.85, w: 3.8, h: 0.38, color: C.white, fontSize: 13, bold: true, fontFace: FONT });
    p.items.forEach((item, ii) => {
      s.addText(`- ${item}`, { x: x + 0.18, y: 2.5 + ii * 0.82, w: 3.75, h: 0.72, color: C.muted, fontSize: 9.5, fontFace: FONT, wrap: true, valign: "top" });
    });
  });
}

// â”€â”€â”€ SLIDE 12: ROADMAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s);
  pill(s, "Roadmap", 0.45, 0.22);
  heading(s, "12-Month Product Roadmap", 0.45, 0.62);

  s.addShape(pptx.ShapeType.rect, { x: 0.45, y: 2.25, w: 12.45, h: 0.06, fill: { color: C.emerald }, line: { color: C.emerald } });

  const milestones = [
    { q: "Q1 2026", x: 0.45,  items: ["PWA public launch", "Food Quiz + Fridge tracking", "Beta user cohort (500)"] },
    { q: "Q2 2026", x: 3.6,   items: ["iOS / Android apps", "Pro subscription live", "Affiliate partnerships"] },
    { q: "Q3 2026", x: 6.75,  items: ["Real AI chat backend", "Family plan launch", "UK / Canada expansion"] },
    { q: "Q4 2026", x: 9.9,   items: ["B2B white-label pilot", "CPG brand integrations", "10,000 paying users"] },
  ];
  milestones.forEach((m) => {
    s.addShape(pptx.ShapeType.ellipse, { x: m.x + 1.1, y: 2.07, w: 0.35, h: 0.35, fill: { color: C.emerald }, line: { color: C.emerald } });
    s.addText(m.q, { x: m.x, y: 1.55, w: 2.9, h: 0.38, color: C.emeraldDk, fontSize: 12, bold: true, align: "center", fontFace: FONT });
    s.addShape(pptx.ShapeType.roundRect, { x: m.x, y: 2.5, w: 2.9, h: 1.9, fill: { color: C.white }, line: { color: C.divider, pt: 1 }, rectRadius: 0.1 });
    m.items.forEach((item, ii) => {
      s.addText(`* ${item}`, { x: m.x + 0.15, y: 2.62 + ii * 0.57, w: 2.6, h: 0.5, color: C.slate, fontSize: 10, fontFace: FONT, wrap: true });
    });
  });

  heading(s, "Key Success Metrics", 0.45, 4.65, 11, C.slate);

  const kpis = [
    ["500",  "Beta Users\n(Month 1)"],
    ["5K",   "MAU\n(Month 6)"],
    ["10%",  "Free -> Pro\nConversion"],
    ["$50K", "MRR\n(Month 12)"],
    ["<3%",  "Monthly\nChurn Target"],
  ];
  kpis.forEach(([val, label], i) => {
    stat(s, val, label, 0.45 + i * 2.55, 5.2, 2.3);
  });
}

// â”€â”€â”€ SLIDE 13: TRACTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.offWhite });
  topBar(s);
  pill(s, "Traction & Validation", 0.45, 0.22);
  heading(s, "What We Have Already Built", 0.45, 0.62);
  body(s, "FridgeIQ is a fully functional, deployable prototype -- not a wireframe.", 0.45, 1.35, 11, { size: 13, color: C.muted, italic: true });

  const achievements = [
    ["10 Feature Screens",  "Dashboard, Fridge Scan, Meals, Planner, Grocery, Health Scanner, Achievements, Profile, Quiz & Print"],
    ["Open Food Facts",     "Live barcode scanning and nutritional data lookup integrated"],
    ["Google Maps API",     "Live nearby grocery store discovery, address autocomplete & multi-store routing"],
    ["Smart Personalization","Food preference quiz, gamification with XP/achievements, expiry calendar, nutrition goals"],
    ["PWA-Ready",           "Mobile-first, responsive layout built with Tailwind CSS & shadcn/ui -- installable on any device"],
    ["Zero Backend Cost",   "100% client-side -- instant deploy, $0 infrastructure to start"],
  ];

  achievements.forEach(([t, d], i) => {
    const x = 0.45 + (i % 2) * 6.35;
    const y = 1.88 + Math.floor(i / 2) * 1.72;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.95, h: 1.55, fill: { color: C.white }, line: { color: C.divider, pt: 1 }, rectRadius: 0.1 });
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 0.08, h: 1.55, fill: { color: C.emerald }, line: { color: C.emerald }, rectRadius: 0.05 });
    s.addText(t, { x: x + 0.25, y: y + 0.12, w: 5.45, h: 0.38, color: C.emeraldDk, fontSize: 12, bold: true, fontFace: FONT });
    s.addText(d, { x: x + 0.25, y: y + 0.55, w: 5.45, h: 0.7, color: C.muted, fontSize: 9.5, fontFace: FONT, wrap: true });
  });
}

// â”€â”€â”€ SLIDE 14: THE ASK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.bgDark });
  topBar(s, C.emerald);
  s.addShape(pptx.ShapeType.ellipse, { x: 8.5, y: -1.5, w: 6, h: 6, fill: { color: "1A3C2A" }, line: { color: "1A3C2A" } });
  s.addShape(pptx.ShapeType.ellipse, { x: -1, y: 4, w: 4.5, h: 4.5, fill: { color: "134040" }, line: { color: "134040" } });

  s.addText("The Opportunity Is Now", { x: 0.5, y: 0.5, w: 12, h: 0.65, color: C.emerald, fontSize: 14, bold: true, fontFace: FONT });
  s.addText("Let's Stop Wasting\nFood Together.", { x: 0.5, y: 1.1, w: 10, h: 2.0, color: C.white, fontSize: 40, bold: true, fontFace: FONT, lineSpacingMultiple: 1.3 });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 3.12, w: 3.8, h: 0.04, fill: { color: C.emerald }, line: { color: C.emerald } });
  s.addText(
    "FridgeIQ is ready to launch. With the right support, we can reach 10,000 active households within 12 months, save families real money, and make a meaningful dent in residential food waste.",
    { x: 0.5, y: 3.3, w: 10.5, h: 0.9, color: "94A3B8", fontSize: 13, fontFace: FONT, wrap: true }
  );

  const asks = [
    ["Deploy",     "Help taking the app to production with a custom domain & CDN"],
    ["AI Backend", "Backend LLM integration for real conversational meal AI"],
    ["Marketing",  "Budget for first user acquisition campaigns (target: 500 beta)"],
    ["Partners",   "Connections to grocery chains, meal-kit brands & wellness platforms"],
  ];
  asks.forEach((a, i) => {
    const x = 0.5 + (i % 2) * 6.35;
    const y = 4.5 + Math.floor(i / 2) * 1.25;
    s.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.95, h: 1.08, fill: { color: "1E293B" }, line: { color: C.emerald, pt: 1 }, rectRadius: 0.1 });
    s.addText(a[0], { x: x + 0.2, y: y + 0.1, w: 5.5, h: 0.35, color: C.emerald, fontSize: 12, bold: true, fontFace: FONT });
    s.addText(a[1], { x: x + 0.2, y: y + 0.5, w: 5.5, h: 0.46, color: "94A3B8", fontSize: 10, fontFace: FONT, wrap: true });
  });
}

// â”€â”€â”€ SLIDE 15: CLOSING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
{
  const s = addSlide({ bg: C.bgDark });
  s.addShape(pptx.ShapeType.ellipse, { x: 4.5, y: 1.0, w: 4.5, h: 4.5, fill: { color: "162A1E" }, line: { color: "162A1E" } });

  s.addText("FridgeIQ", { x: 0.5, y: 2.1, w: 12.35, h: 1.0, color: C.white, fontSize: 52, bold: true, align: "center", fontFace: FONT });
  s.addText("Your Kitchen. Smarter.", { x: 0.5, y: 3.1, w: 12.35, h: 0.55, color: C.emerald, fontSize: 22, align: "center", italic: true, fontFace: FONT });

  s.addShape(pptx.ShapeType.rect, { x: 5.2, y: 3.82, w: 3.0, h: 0.04, fill: { color: C.emerald }, line: { color: C.emerald } });

  s.addText("Reducing food waste  |  Saving families money  |  Making healthy eating effortless", {
    x: 0.5, y: 4.05, w: 12.35, h: 0.42, color: "64748B", fontSize: 12, align: "center", fontFace: FONT,
  });
  s.addText("Thank you.", { x: 0.5, y: 5.1, w: 12.35, h: 0.55, color: "94A3B8", fontSize: 18, align: "center", bold: true, fontFace: FONT });
  s.addText("Questions & Discussion Welcome", { x: 0.5, y: 5.7, w: 12.35, h: 0.4, color: "475569", fontSize: 12, align: "center", fontFace: FONT });
}

// â”€â”€â”€ SAVE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const outPath = "FridgeIQ_Pitch_Deck.pptx";
await pptx.writeFile({ fileName: outPath });
console.log(`\nSaved: ${outPath}\n`);
