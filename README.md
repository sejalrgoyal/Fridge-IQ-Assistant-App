# FridgeIQ

**AI-powered fridge assistant. Scan food, track expiration dates, get personalized recipes, plan meals, and reduce waste.**

FridgeIQ is a smart kitchen companion that helps you make the most of what you already have at home. It reduces food waste, saves money, and takes the stress out of meal planning. All your data stays on your device.

---

## What FridgeIQ Does

| Feature | Description |
|---|---|
| Smart Fridge Tracking | Scan or add items, track expiration dates, and get alerts before food goes off. |
| Personalized Recipes | Meal suggestions built around your diet, allergies, and what is actually in your fridge. |
| Smarter Grocery Trips | Auto-generated lists from your meal plan with estimated prices and duplicate checks. |
| Habit Building | Track waste, earn achievement badges, and level up your kitchen skills over time. |

Best for anyone who wants to eat healthier, waste less, and spend less time deciding what to cook.

---

## How to Use FridgeIQ

### 1. Start with the Food Quiz
Go to the **Quiz** tab and answer 8 questions about your diet, allergies, cooking skill level, available cooking time, budget, and health goals. Every other feature adapts to your answers including recipe filters, grocery prices, and nutrition goals.

### 2. Scan or Add Items to Your Fridge
Open the **Fridge** tab and tap the camera button to photograph your open fridge. AI detects food items and estimates their expiration dates automatically. You can also add items manually, scan barcodes, or tap the pencil icon to edit any item and update its name, quantity, storage location, or expiration date.

### 3. Browse Personalized Meal Suggestions
The **Meals** tab shows recipes filtered to your diet and sorted by how many ingredients you already own. Each recipe card shows ingredient availability at a glance. Tap a recipe to see the full instructions, a serving size scaler that recalculates all quantities and calories, and a full nutrition breakdown.

### 4. Plan Your Meals for the Week
The **Planner** tab has a weekly and monthly calendar. Assign breakfast, lunch, and dinner for each day. Swap meals between days, auto-fill the whole week with one tap, or move individual meals. Tap "Generate Grocery List" to instantly turn your week plan into a ready-to-shop list.

### 5. Shop Smarter with the Grocery List
After setting your location the **Grocery** tab shows estimated prices at nearby stores. Items already in your fridge show a green "In Fridge" badge so you never buy duplicates. Tap the "Restock" button on the Fridge tab to automatically move expiring items onto the grocery list.

### 6. Check Any Product for Health Info
The **Health Scanner** tab lets you scan a barcode or type any product name to get a nutritional breakdown, ingredient list, and health rating. Useful when checking packaged foods at home or while shopping.

### 7. Log Used and Wasted Items
When you delete a fridge item a dialog asks whether you used it or it went to waste. Tap "I Used It" to log a positive outcome. Over time this builds your personal waste rate and unlocks achievement badges as your habits improve.

### 8. Track Your Achievements
Open the **Achievements** tab to see all badges, your current level, XP points, and progress toward each badge. Badges unlock automatically as you use the app.

### 9. Manage Your Profile and Settings
The **Profile** tab lets you edit personal details, adjust daily nutrition goals, edit activity stats, change dietary preferences, set meal prep days, and enable push notifications for expiring items.

---

## Tech Stack

- **React + TypeScript + Vite**
- **Tailwind CSS** with custom gradients
- **Framer Motion** for animations
- **Shadcn UI** components
- **html5-qrcode** for barcode scanning
- **Open Food Facts API** for product lookup
- **localStorage** for all data persistence (no backend required)

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:8087](http://localhost:8087) in your browser.

---

## GitHub Pages

1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow **Deploy to GitHub Pages** builds and publishes the site.
4. The live URL is `https://<your-username>.github.io/Fridge-IQ-Assistant-App/` (the path must match your repository name).

Local build matching Pages: `npm run build:gh-pages` (writes `dist/` and copies `index.html` to `404.html` via `scripts/build-github-pages.mjs`). If you rename the repo, update `REPO_SLUG` in that script and `VITE_BASE_PATH` in `.github/workflows/deploy-github-pages.yml`.

---
