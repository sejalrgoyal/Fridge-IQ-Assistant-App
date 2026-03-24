export interface FridgeItem {
  id: string;
  name: string;
  emoji: string;
  quantity: string;
  daysLeft: number;
  category: string;
  location?: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
  available: boolean;
}

export interface Meal {
  id: string;
  name: string;
  image: string;
  photoUrl: string;
  time: string;
  calories: number;
  tags: string[];
  ingredients: string[];
  missingIngredients: string[];
  detailedIngredients: Ingredient[];
  servings: number;
  nutrition: { protein: string; carbs: string; fat: string; fiber: string };
  nutritionBenefits: string[];
  instructions: string[];
  sourceUrl?: string;
  sourceName?: string;
  videoUrl?: string;
  cuisine: string;
  dietLabels: string[];
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  price: number;
  checked: boolean;
  category: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: { label: string; type: string }[];
}

export interface SmartInsight {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: 'warning' | 'suggestion' | 'prediction';
}

export const fridgeItems: FridgeItem[] = [
  { id: '1', name: 'Eggs', emoji: '🥚', quantity: '8 pcs', daysLeft: 12, category: 'Dairy', location: 'Fridge' },
  { id: '2', name: 'Milk', emoji: '🥛', quantity: '1L', daysLeft: 2, category: 'Dairy', location: 'Fridge' },
  { id: '3', name: 'Spinach', emoji: '🥬', quantity: '200g', daysLeft: 1, category: 'Vegetables', location: 'Fridge' },
  { id: '4', name: 'Chicken Breast', emoji: '🍗', quantity: '500g', daysLeft: 3, category: 'Protein', location: 'Freezer' },
  { id: '5', name: 'Rice', emoji: '🍚', quantity: '2kg', daysLeft: 90, category: 'Grains', location: 'Pantry' },
  { id: '6', name: 'Tomatoes', emoji: '🍅', quantity: '4 pcs', daysLeft: 5, category: 'Vegetables', location: 'Counter' },
  { id: '7', name: 'Pasta', emoji: '🍝', quantity: '500g', daysLeft: 180, category: 'Grains', location: 'Pantry' },
  { id: '8', name: 'Greek Yogurt', emoji: '🥣', quantity: '500g', daysLeft: 4, category: 'Dairy', location: 'Fridge' },
  { id: '9', name: 'Avocado', emoji: '🥑', quantity: '2 pcs', daysLeft: 2, category: 'Vegetables', location: 'Counter' },
  { id: '10', name: 'Salmon', emoji: '🐟', quantity: '300g', daysLeft: 1, category: 'Protein', location: 'Freezer' },
];

export const meals: Meal[] = [
  {
    id: '1', name: 'Spinach & Egg Scramble', image: '🍳',
    photoUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&q=80',
    time: '10 min', calories: 320, servings: 2,
    tags: ['Quick', 'High Protein', 'Low Carb'],
    cuisine: 'American',
    dietLabels: ['Vegetarian', 'Gluten-free', 'Keto'],
    ingredients: ['Eggs', 'Spinach', 'Salt', 'Pepper'],
    missingIngredients: [],
    detailedIngredients: [
      { name: 'Eggs', quantity: '4 large', available: true },
      { name: 'Fresh Spinach', quantity: '2 cups (60g)', available: true },
      { name: 'Butter', quantity: '1 tbsp', available: true },
      { name: 'Salt', quantity: '¼ tsp', available: true },
      { name: 'Black Pepper', quantity: '⅛ tsp', available: true },
    ],
    nutrition: { protein: '24g', carbs: '4g', fat: '22g', fiber: '2g' },
    nutritionBenefits: ['High in iron from spinach', 'Complete protein from eggs', 'Rich in Vitamin A & K', 'Low glycemic index'],
    instructions: [
      'Place a non-stick skillet (10-inch recommended) on the stove over medium heat (around 300°F/150°C). Add 1 tablespoon of unsalted butter and let it melt completely, swirling the pan to coat the entire surface evenly. Wait until the butter stops foaming — this means it\'s hot enough.',
      'Add 2 cups of fresh baby spinach leaves to the pan. Use tongs or a spatula to toss the spinach continuously for 1-2 minutes. The spinach should wilt down to about ¼ of its original volume and turn a deep, vibrant green. If there\'s excess liquid, let it evaporate for 30 seconds.',
      'While the spinach wilts, crack 4 large eggs into a bowl. Add ¼ tsp salt and ⅛ tsp freshly ground black pepper. Whisk vigorously with a fork for about 20 seconds until the yolks and whites are fully combined and slightly frothy.',
      'Pour the whisked eggs over the wilted spinach in the pan. Let the eggs sit undisturbed for about 15-20 seconds until you see the edges beginning to set. Then, using a silicone spatula, gently push the eggs from the edges toward the center, creating large, soft curds.',
      'Continue gently folding and pushing the eggs every 10-15 seconds. The key is NOT to stir constantly — let the curds form naturally. Total cooking time is about 2-3 minutes. Remove from heat when the eggs still look slightly wet and glossy (they\'ll continue cooking from residual heat).',
      'Transfer immediately to a warm plate. The eggs should be creamy, soft, and pillowy — never dry or rubbery. Garnish with an extra pinch of flaky salt if desired. Serve right away as scrambled eggs are best fresh.',
    ],
    sourceUrl: 'https://www.allrecipes.com/recipe/261770/spinach-egg-scramble/',
    sourceName: 'AllRecipes',
    videoUrl: 'https://www.youtube.com/watch?v=s9r-CxnCXkg',
  },
  {
    id: '2', name: 'Chicken Stir Fry', image: '🥘',
    photoUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
    time: '20 min', calories: 450, servings: 3,
    tags: ['High Protein', 'Balanced'],
    cuisine: 'Chinese',
    dietLabels: ['Gluten-free'],
    ingredients: ['Chicken Breast', 'Rice', 'Vegetables', 'Soy Sauce'],
    missingIngredients: ['Soy Sauce'],
    detailedIngredients: [
      { name: 'Chicken Breast', quantity: '500g, sliced thin', available: true },
      { name: 'Jasmine Rice', quantity: '1½ cups', available: true },
      { name: 'Mixed Vegetables', quantity: '2 cups', available: true },
      { name: 'Soy Sauce', quantity: '3 tbsp', available: false },
      { name: 'Sesame Oil', quantity: '1 tbsp', available: true },
      { name: 'Garlic', quantity: '3 cloves, minced', available: true },
    ],
    nutrition: { protein: '35g', carbs: '42g', fat: '12g', fiber: '3g' },
    nutritionBenefits: ['Lean protein for muscle recovery', 'Complex carbs for sustained energy', 'Rich in B vitamins', 'Anti-inflammatory ginger & garlic'],
    instructions: [
      'Rinse 1½ cups jasmine rice in cold water 3 times until the water runs mostly clear (this removes excess starch for fluffier rice). Add to a pot with 2¼ cups water. Bring to a boil, then reduce to lowest heat, cover tightly, and cook for 15 minutes. Remove from heat and let steam with the lid on for 5 more minutes. Fluff with a fork.',
      'While rice cooks, slice 500g chicken breast against the grain into thin strips (about ¼ inch thick). Cutting against the grain ensures tender pieces. Season with ½ tsp salt, ¼ tsp white pepper, and 1 tsp cornstarch. Toss to coat evenly — the cornstarch creates a velvety texture.',
      'Heat a wok or large skillet over HIGH heat until you see a wisp of smoke (about 2 minutes). Add 1 tbsp sesame oil and immediately swirl to coat. The oil should shimmer instantly.',
      'Add the seasoned chicken strips in a single layer — don\'t overcrowd (cook in 2 batches if needed). Let them sear undisturbed for 90 seconds until golden brown on the bottom, then flip and cook another 90 seconds. Remove to a clean plate.',
      'In the same wok, add a splash more oil if needed. Toss in 3 minced garlic cloves and stir for 10 seconds until fragrant (don\'t let it brown). Add 2 cups mixed vegetables (bell peppers, snap peas, broccoli florets) and toss vigorously for 2-3 minutes. They should be crisp-tender with bright colors.',
      'Return the chicken to the wok. Add 3 tbsp soy sauce, 1 tbsp oyster sauce, and ½ tsp sugar. Toss everything together over high heat for 30-45 seconds until the sauce glazes the ingredients evenly and everything is piping hot.',
      'Serve immediately over the fluffy jasmine rice. Garnish with sliced green onions and a sprinkle of toasted sesame seeds for extra flavor and visual appeal.',
    ],
    sourceUrl: 'https://www.budgetbytes.com/chicken-stir-fry/',
    sourceName: 'Budget Bytes',
  },
  {
    id: '3', name: 'Avocado Toast', image: '🥑',
    photoUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600&q=80',
    time: '5 min', calories: 280, servings: 1,
    tags: ['Quick', 'Vegetarian', 'Budget'],
    cuisine: 'American',
    dietLabels: ['Vegetarian', 'Vegan'],
    ingredients: ['Avocado', 'Bread', 'Lemon', 'Salt'],
    missingIngredients: ['Bread', 'Lemon'],
    detailedIngredients: [
      { name: 'Ripe Avocado', quantity: '1 medium', available: true },
      { name: 'Sourdough Bread', quantity: '2 slices', available: false },
      { name: 'Lemon Juice', quantity: '1 tsp', available: false },
      { name: 'Red Pepper Flakes', quantity: '¼ tsp', available: true },
      { name: 'Flaky Sea Salt', quantity: 'to taste', available: true },
    ],
    nutrition: { protein: '6g', carbs: '28g', fat: '18g', fiber: '7g' },
    nutritionBenefits: ['Heart-healthy monounsaturated fats', 'High in potassium', 'Good source of fiber', 'Contains Vitamin E'],
    instructions: [
      'Set your toaster or toaster oven to medium-high. Toast 2 thick slices of sourdough bread (about ¾ inch thick) until deep golden brown and fully crisp — about 3-4 minutes. The bread should be crunchy on the outside but still slightly soft inside. Alternatively, you can toast in a dry skillet over medium heat, about 2 minutes per side.',
      'Cut the avocado in half lengthwise by running a knife around the pit. Twist the two halves apart. Carefully strike the pit with the blade of your knife to lodge it in, then twist to remove. Use a large spoon to scoop the flesh out in one piece into a bowl.',
      'Using a fork, mash the avocado to your preferred consistency — some like it chunky with visible pieces, others prefer it smooth and creamy. Add 1 teaspoon fresh lemon juice (this prevents browning and adds brightness), a pinch of salt, and mix well.',
      'While the toast is still warm, spread the mashed avocado generously on each slice — about ¼ inch thick. The warmth of the bread slightly melts the avocado and makes it easier to spread. Push the avocado to the edges so every bite has full coverage.',
      'Finish with ¼ teaspoon red pepper flakes (adjust to your spice preference), a generous pinch of flaky sea salt (like Maldon), and optionally a drizzle of extra virgin olive oil. For extra protein, top with a soft-boiled egg or everything bagel seasoning. Serve immediately — avocado toast is best fresh!',
    ],
    sourceUrl: 'https://minimalistbaker.com/avocado-toast/',
    sourceName: 'Minimalist Baker',
  },
  {
    id: '4', name: 'Salmon Poke Bowl', image: '🐟',
    photoUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    time: '25 min', calories: 520, servings: 2,
    tags: ['High Protein', 'Omega-3'],
    cuisine: 'Japanese',
    dietLabels: ['Pescatarian', 'Gluten-free'],
    ingredients: ['Salmon', 'Rice', 'Avocado', 'Soy Sauce'],
    missingIngredients: ['Soy Sauce'],
    detailedIngredients: [
      { name: 'Fresh Salmon Fillet', quantity: '300g', available: true },
      { name: 'Sushi Rice', quantity: '1 cup', available: true },
      { name: 'Ripe Avocado', quantity: '1, sliced', available: true },
      { name: 'Soy Sauce', quantity: '2 tbsp', available: false },
      { name: 'Rice Vinegar', quantity: '1 tbsp', available: true },
      { name: 'Sesame Seeds', quantity: '1 tbsp', available: true },
    ],
    nutrition: { protein: '38g', carbs: '45g', fat: '20g', fiber: '5g' },
    nutritionBenefits: ['Rich in Omega-3 fatty acids', 'Supports brain health', 'Anti-inflammatory properties', 'Complete amino acid profile'],
    instructions: [
      'Rinse 1 cup sushi rice under cold water in a fine mesh strainer until water runs clear (about 5-6 rinses). Cook in a rice cooker or pot with 1¼ cups water. Once cooked, transfer to a wide bowl. While still hot, drizzle 1 tbsp rice vinegar mixed with ½ tsp sugar and a pinch of salt. Fold gently with a spatula (don\'t stir — you\'ll make it mushy). Fan the rice while folding to cool it and give it a glossy sheen.',
      'Pat the 300g salmon fillet dry with paper towels — this is crucial for a good sear. Season both sides generously with ½ tsp salt and ¼ tsp freshly ground black pepper. Let it sit at room temperature for 5 minutes.',
      'Heat a non-stick or cast-iron skillet over medium-high heat. Add 1 tsp neutral oil (avocado or vegetable). Place salmon skin-side down and press gently with a spatula for the first 30 seconds to prevent curling. Cook for 4 minutes without moving until the skin is ultra-crispy. Flip carefully and cook 3 more minutes for medium (still slightly pink in center) or 4 minutes for well done.',
      'While salmon rests, slice the avocado: cut in half, remove pit, then score the flesh in thin slices while still in the skin. Scoop out with a spoon and fan the slices elegantly.',
      'Divide the seasoned rice between 2 bowls as the base. Break the salmon into large, beautiful flakes (don\'t shred — keep pieces chunky). Arrange salmon and fanned avocado slices on top.',
      'Drizzle each bowl with 1 tbsp soy sauce (or coconut aminos for a lighter option). Sprinkle with 1 tbsp toasted sesame seeds, thinly sliced green onion, and optionally a small dollop of spicy mayo (mix mayo + sriracha). Serve immediately with chopsticks or a fork.',
    ],
    sourceUrl: 'https://www.foodnetwork.com/recipes/salmon-poke-bowl',
    sourceName: 'Food Network',
    videoUrl: 'https://www.youtube.com/watch?v=22x5-dW21WE',
  },
  {
    id: '5', name: 'Pasta Primavera', image: '🍝',
    photoUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80',
    time: '15 min', calories: 380, servings: 2,
    tags: ['Vegetarian', 'Quick', 'Budget'],
    cuisine: 'Italian',
    dietLabels: ['Vegetarian'],
    ingredients: ['Pasta', 'Tomatoes', 'Spinach', 'Olive Oil'],
    missingIngredients: ['Olive Oil'],
    detailedIngredients: [
      { name: 'Penne Pasta', quantity: '250g', available: true },
      { name: 'Cherry Tomatoes', quantity: '1 cup, halved', available: true },
      { name: 'Fresh Spinach', quantity: '2 cups', available: true },
      { name: 'Extra Virgin Olive Oil', quantity: '2 tbsp', available: false },
      { name: 'Garlic', quantity: '2 cloves, minced', available: true },
      { name: 'Parmesan Cheese', quantity: '¼ cup, grated', available: true },
    ],
    nutrition: { protein: '12g', carbs: '58g', fat: '10g', fiber: '4g' },
    nutritionBenefits: ['Good source of complex carbohydrates', 'Lycopene from tomatoes', 'Iron-rich spinach', 'Calcium from parmesan'],
    instructions: [
      'Bring a large pot of water to a rolling boil (at least 4 quarts). Add 1 tablespoon kosher salt — the water should taste like the sea. Add 250g penne and stir immediately to prevent sticking. Cook according to package directions minus 1 minute (usually 9 minutes total) for perfect al dente. Before draining, reserve ½ cup of the starchy pasta water — this is your secret weapon for the sauce.',
      'While pasta boils, heat 2 tbsp extra virgin olive oil in a large, wide skillet over medium heat. Don\'t use high heat or the olive oil will smoke and taste bitter. Wait about 1 minute until the oil shimmers.',
      'Add 2 finely minced garlic cloves to the oil. Stir constantly for exactly 30 seconds — you want it golden and fragrant, NOT brown. Burnt garlic tastes bitter and will ruin the dish.',
      'Immediately add the halved cherry tomatoes (cut-side down for better contact). Sprinkle with ¼ tsp salt. Let them cook undisturbed for 2 minutes, then gently stir. Cook another 1-2 minutes until they\'re softened and releasing their juices, creating a light sauce.',
      'Toss in 2 cups fresh spinach and stir gently for about 1 minute until just wilted. The residual moisture from the tomatoes will help steam the spinach. Season with a pinch of red pepper flakes if you like a little heat.',
      'Add the drained penne directly to the skillet. Toss everything together over medium heat. Add 2-3 tablespoons of the reserved pasta water and toss vigorously — the starch will create a silky, light sauce that clings to every piece. Top with ¼ cup freshly grated Parmigiano-Reggiano and a final drizzle of good olive oil. Serve in warm bowls.',
    ],
    sourceUrl: 'https://www.loveandlemons.com/pasta-primavera/',
    sourceName: 'Love & Lemons',
  },
  {
    id: '6', name: 'Greek Yogurt Parfait', image: '🥣',
    photoUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80',
    time: '5 min', calories: 220, servings: 1,
    tags: ['Quick', 'Low Calorie', 'Breakfast'],
    cuisine: 'Mediterranean',
    dietLabels: ['Vegetarian'],
    ingredients: ['Greek Yogurt', 'Honey', 'Granola'],
    missingIngredients: ['Honey', 'Granola'],
    detailedIngredients: [
      { name: 'Greek Yogurt', quantity: '1 cup (200g)', available: true },
      { name: 'Raw Honey', quantity: '1 tbsp', available: false },
      { name: 'Granola', quantity: '⅓ cup', available: false },
      { name: 'Mixed Berries', quantity: '½ cup', available: true },
    ],
    nutrition: { protein: '15g', carbs: '30g', fat: '5g', fiber: '2g' },
    nutritionBenefits: ['Probiotic-rich for gut health', 'High in calcium', 'Antioxidants from berries', 'Sustained energy release'],
    instructions: [
      'Choose a clear glass, mason jar, or deep bowl for a beautiful layered presentation. Spoon about half of the Greek yogurt (100g) into the bottom, spreading it evenly with the back of the spoon. Full-fat Greek yogurt works best for a richer, creamier texture, but 2% works too.',
      'Add a generous layer of ⅓ cup granola on top of the yogurt. Choose a granola with clusters for the best crunch contrast. Drizzle about half the honey (½ tbsp) in a zigzag pattern over the granola.',
      'Add the remaining Greek yogurt on top of the granola layer. Smooth it out gently. Then arrange ½ cup of mixed berries (strawberries, blueberries, raspberries) on top — place them artfully rather than dumping for a prettier result.',
      'Finish with a final artistic drizzle of honey and optionally a sprinkle of chia seeds or a few mint leaves for color. Serve immediately while the granola is still crunchy — if left too long, it will soften from the yogurt\'s moisture.',
    ],
    sourceUrl: 'https://www.eatingwell.com/recipe/yogurt-parfait/',
    sourceName: 'EatingWell',
  },
  {
    id: '7', name: 'Teriyaki Tofu Bowl', image: '🥗',
    photoUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    time: '20 min', calories: 360, servings: 2,
    tags: ['Vegetarian', 'High Protein', 'Budget'],
    cuisine: 'Japanese',
    dietLabels: ['Vegan', 'Vegetarian'],
    ingredients: ['Tofu', 'Rice', 'Broccoli'],
    missingIngredients: ['Tofu', 'Broccoli', 'Teriyaki Sauce'],
    detailedIngredients: [
      { name: 'Firm Tofu', quantity: '400g, cubed', available: false },
      { name: 'Brown Rice', quantity: '1 cup', available: true },
      { name: 'Broccoli Florets', quantity: '2 cups', available: false },
      { name: 'Teriyaki Sauce', quantity: '3 tbsp', available: false },
      { name: 'Sesame Oil', quantity: '1 tbsp', available: true },
    ],
    nutrition: { protein: '22g', carbs: '40g', fat: '14g', fiber: '6g' },
    nutritionBenefits: ['Plant-based protein', 'Rich in isoflavones', 'High in fiber from brown rice', 'Vitamin C from broccoli'],
    instructions: [
      'Remove the tofu from its package and drain the liquid. Wrap the tofu block in 2-3 layers of paper towels or a clean kitchen towel. Place on a plate, put another plate on top, and weigh it down with a heavy can or book. Press for 15 minutes — this removes excess moisture so the tofu will get properly crispy. After pressing, cut into 1-inch cubes.',
      'Rinse 1 cup brown rice, add to a pot with 2 cups water. Bring to a boil, reduce to low, cover, and simmer for 40-45 minutes until tender and all water is absorbed. Let rest covered for 5 minutes, then fluff. (Tip: start the rice first since it takes longest.)',
      'Heat 1 tbsp sesame oil in a large non-stick skillet or wok over medium-high heat. Arrange tofu cubes in a single layer — don\'t crowd the pan. Cook without moving for 3 minutes until the bottom is golden and crispy. Use tongs to flip each piece and repeat on all sides (about 8-10 minutes total). The goal is a crispy exterior with a soft, custardy center.',
      'While tofu cooks, bring 1 inch of water to a boil in a pot with a steamer basket. Add 2 cups broccoli florets (cut into bite-size pieces), cover, and steam for 3-4 minutes until bright green and tender-crisp. Immediately remove from heat to prevent overcooking. Season with a pinch of salt.',
      'Add 3 tbsp teriyaki sauce to the crispy tofu in the pan. Toss over medium heat for about 30 seconds until the sauce thickens and glazes every cube. The sauce should become sticky and caramelized — not watery.',
      'Divide rice between 2 bowls. Arrange the glazed tofu and steamed broccoli on top. Drizzle any remaining teriyaki sauce from the pan. Garnish with toasted sesame seeds, sliced green onions, and optionally a squeeze of lime juice for brightness.',
    ],
    sourceUrl: 'https://minimalistbaker.com/crispy-tofu-bowl/',
    sourceName: 'Minimalist Baker',
  },
  {
    id: '8', name: 'Mediterranean Wrap', image: '🌯',
    photoUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&q=80',
    time: '10 min', calories: 410, servings: 2,
    tags: ['Quick', 'Balanced', 'Budget'],
    cuisine: 'Mediterranean',
    dietLabels: ['Vegetarian'],
    ingredients: ['Tortilla', 'Hummus', 'Cucumber', 'Tomatoes'],
    missingIngredients: ['Tortilla', 'Hummus', 'Cucumber'],
    detailedIngredients: [
      { name: 'Large Flour Tortilla', quantity: '2', available: false },
      { name: 'Hummus', quantity: '4 tbsp', available: false },
      { name: 'Cucumber', quantity: '½, sliced', available: false },
      { name: 'Cherry Tomatoes', quantity: '½ cup, halved', available: true },
      { name: 'Feta Cheese', quantity: '¼ cup, crumbled', available: true },
      { name: 'Mixed Greens', quantity: '1 cup', available: true },
    ],
    nutrition: { protein: '14g', carbs: '48g', fat: '16g', fiber: '5g' },
    nutritionBenefits: ['Heart-healthy fats from hummus', 'Hydrating cucumber', 'Calcium from feta', 'High in dietary fiber'],
    instructions: [
      'Warm 2 large flour tortillas in a dry skillet over medium heat for about 30 seconds per side, or microwave between damp paper towels for 15 seconds. Warming makes them pliable and less likely to crack when rolling. Lay them flat on a clean cutting board.',
      'Spread 2 tablespoons of hummus on each tortilla using the back of a spoon, covering the entire surface except about 1 inch from the edges. Classic hummus works great, but roasted red pepper or garlic hummus add extra flavor dimension.',
      'Layer the fillings in the center third of each tortilla: start with sliced cucumber (about 6 thin rounds), then halved cherry tomatoes (about 5-6 per wrap), followed by 1 cup of mixed greens (arugula and spinach mix is ideal).',
      'Sprinkle 2 tbsp crumbled feta cheese over each wrap. For extra flavor, add a light squeeze of lemon juice, a pinch of dried oregano, and a few pitted kalamata olives if you have them.',
      'To roll: fold the bottom edge up over the fillings, then fold both sides inward tightly. Roll upward firmly, tucking as you go to create a tight cylinder. The hummus acts as a natural glue to hold everything together. Slice each wrap in half diagonally at a 45° angle for the cleanest presentation. Serve immediately or wrap tightly in foil for a packed lunch.',
    ],
    sourceUrl: 'https://www.loveandlemons.com/mediterranean-wrap/',
    sourceName: 'Love & Lemons',
  },
];

export const weeklyPlan: Record<string, { breakfast: string; lunch: string; dinner: string }> = {
  Mon: { breakfast: 'Greek Yogurt Parfait', lunch: 'Avocado Toast', dinner: 'Chicken Stir Fry' },
  Tue: { breakfast: 'Spinach & Egg Scramble', lunch: 'Pasta Primavera', dinner: 'Salmon Poke Bowl' },
  Wed: { breakfast: 'Avocado Toast', lunch: 'Mediterranean Wrap', dinner: 'Pasta Primavera' },
  Thu: { breakfast: 'Greek Yogurt Parfait', lunch: 'Salmon Poke Bowl', dinner: 'Spinach & Egg Scramble' },
  Fri: { breakfast: 'Spinach & Egg Scramble', lunch: 'Avocado Toast', dinner: 'Chicken Stir Fry' },
  Sat: { breakfast: 'Avocado Toast', lunch: 'Teriyaki Tofu Bowl', dinner: 'Salmon Poke Bowl' },
  Sun: { breakfast: 'Greek Yogurt Parfait', lunch: 'Chicken Stir Fry', dinner: 'Pasta Primavera' },
};

export const groceryItems: GroceryItem[] = [
  { id: '1', name: 'Soy Sauce', quantity: '1 bottle', price: 3.49, checked: false, category: 'Condiments' },
  { id: '2', name: 'Bread (Whole Wheat)', quantity: '1 loaf', price: 4.29, checked: false, category: 'Bakery' },
  { id: '3', name: 'Lemon', quantity: '3 pcs', price: 1.99, checked: false, category: 'Produce' },
  { id: '4', name: 'Olive Oil', quantity: '500ml', price: 7.99, checked: true, category: 'Oils' },
  { id: '5', name: 'Honey', quantity: '1 jar', price: 5.49, checked: false, category: 'Condiments' },
  { id: '6', name: 'Granola', quantity: '1 bag', price: 4.99, checked: false, category: 'Cereals' },
  { id: '7', name: 'Milk', quantity: '2L', price: 3.99, checked: false, category: 'Dairy' },
  { id: '8', name: 'Spinach', quantity: '300g', price: 2.99, checked: false, category: 'Produce' },
];

export const smartInsights: SmartInsight[] = [
  { id: '1', icon: '⚠️', title: 'Spinach expires tomorrow', description: 'Use it in tonight\'s dinner — try a spinach egg scramble!', type: 'warning' },
  { id: '2', icon: '🔮', title: 'You\'ll run out of milk in 2 days', description: 'Added to your grocery list automatically.', type: 'prediction' },
  { id: '3', icon: '💡', title: 'Best meal for you right now', description: 'Salmon Bowl — uses expiring salmon & avocado.', type: 'suggestion' },
];

export const chatSuggestions = [
  "What can I make with eggs and rice?",
  "High-protein meal under 15 min",
  "I don't feel like cooking",
  "What's expiring soon?",
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hey! 👋 I'm your FridgeIQ assistant. I can help you figure out what to cook, plan your meals, or manage your grocery list. What can I help you with?",
  },
];
