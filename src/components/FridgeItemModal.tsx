import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CalendarIcon, MapPin, Lightbulb, Barcode, Loader2 } from 'lucide-react';
import type { FridgeItem } from '@/data/mockData';
import { format, differenceInDays } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';

const categoryOptions = ['Vegetables', 'Fruits', 'Dairy', 'Protein', 'Beverages', 'Grains', 'Condiments', 'Snacks', 'Frozen', 'Other'];
const locationOptions = ['Fridge', 'Freezer', 'Pantry', 'Counter', 'Cabinet', 'Other'];

const STORAGE_TIPS: Record<string, string> = {
  broccoli: 'Store in fridge crisper unwashed; use within 5 days.',
  spinach: 'Keep in sealed bag with a paper towel to absorb moisture.',
  lettuce: 'Wrap in damp paper towel, store in crisper drawer.',
  tomato: 'Keep at room temperature until ripe; refrigerate after.',
  cucumber: 'Wrap in paper towel, keep in fridge; use within 1 week.',
  carrot: 'Remove tops, store in water in fridge for maximum crunch.',
  onion: 'Store in cool, dark, dry place. Refrigerate once cut.',
  garlic: 'Keep in a cool, dry place away from direct sunlight.',
  potato: 'Store in a cool, dark area. Do not refrigerate.',
  mushroom: 'Keep in paper bag in fridge; never store in plastic.',
  avocado: 'Ripen at room temp, then refrigerate. Add lemon to cut halves.',
  berry: "Don't wash until ready to eat; keep in ventilated container.",
  strawberry: "Don't wash until ready to eat; store in crisper drawer.",
  blueberry: 'Store unwashed in original container in fridge.',
  banana: 'Keep at room temperature; refrigerate when ripe.',
  apple: 'Store in fridge crisper; keeps crisp for weeks.',
  milk: 'Keep in main fridge body, not the door. Use within 7 days of opening.',
  cheese: 'Wrap tightly in parchment paper, then plastic. Store below 40°F.',
  butter: 'Refrigerate opened butter; freeze extra sticks for up to 6 months.',
  egg: 'Store in original carton in main fridge body, not the door.',
  yogurt: 'Keep sealed in main fridge; use within 1 week of opening.',
  chicken: 'Store in sealed container on bottom shelf. Use within 2 days or freeze.',
  beef: 'Keep in coldest part of fridge. Use within 3–5 days or freeze.',
  fish: 'Store on ice or bottom shelf. Use within 1–2 days.',
  salmon: 'Keep in coldest part of fridge. Use within 2 days of purchase.',
  tofu: 'Store in water in a sealed container; change water daily.',
  bread: 'Store at room temperature in a bread box; freeze for longer life.',
  pasta: 'Keep in airtight container; cooked pasta lasts 3–5 days in fridge.',
  rice: 'Store dry rice in airtight container. Cooked rice lasts 4–6 days in fridge.',
  coffee: 'Keep in airtight container away from light, heat, and moisture.',
  oil: 'Store away from heat and light; use within 6 months of opening.',
};

const getStorageTip = (itemName: string): string | null => {
  const lower = itemName.toLowerCase();
  for (const [key, tip] of Object.entries(STORAGE_TIPS)) {
    if (lower.includes(key) || key.includes(lower)) return tip;
  }
  return null;
};

const emojiMap: Record<string, string> = {
  Vegetables: '🥬', Fruits: '🍎', Dairy: '🧀', Protein: '🥩',
  Beverages: '🥤', Grains: '🌾', Condiments: '🧂', Snacks: '🍿',
  Frozen: '🧊', Other: '📦',
};

const locationEmoji: Record<string, string> = {
  Fridge: '❄️', Freezer: '🧊', Pantry: '🏠', Counter: '🍽️', Cabinet: '🗄️', Other: '📍',
};

interface FoodSuggestion {
  name: string;
  emoji: string;
  category: string;
  defaultQty: string;
}

const FOOD_SUGGESTIONS: FoodSuggestion[] = [
  // Vegetables
  { name: 'Broccoli', emoji: '🥦', category: 'Vegetables', defaultQty: '1 head' },
  { name: 'Spinach', emoji: '🥬', category: 'Vegetables', defaultQty: '200g' },
  { name: 'Kale', emoji: '🥬', category: 'Vegetables', defaultQty: '200g' },
  { name: 'Lettuce', emoji: '🥬', category: 'Vegetables', defaultQty: '1 head' },
  { name: 'Romaine Lettuce', emoji: '🥬', category: 'Vegetables', defaultQty: '1 head' },
  { name: 'Tomato', emoji: '🍅', category: 'Vegetables', defaultQty: '3 pcs' },
  { name: 'Cherry Tomatoes', emoji: '🍅', category: 'Vegetables', defaultQty: '250g' },
  { name: 'Cucumber', emoji: '🥒', category: 'Vegetables', defaultQty: '2 pcs' },
  { name: 'Bell Pepper', emoji: '🫑', category: 'Vegetables', defaultQty: '2 pcs' },
  { name: 'Red Pepper', emoji: '🫑', category: 'Vegetables', defaultQty: '2 pcs' },
  { name: 'Green Pepper', emoji: '🫑', category: 'Vegetables', defaultQty: '2 pcs' },
  { name: 'Jalapeño', emoji: '🌶️', category: 'Vegetables', defaultQty: '4 pcs' },
  { name: 'Carrot', emoji: '🥕', category: 'Vegetables', defaultQty: '4 pcs' },
  { name: 'Celery', emoji: '🥬', category: 'Vegetables', defaultQty: '1 bunch' },
  { name: 'Onion', emoji: '🧅', category: 'Vegetables', defaultQty: '2 pcs' },
  { name: 'Red Onion', emoji: '🧅', category: 'Vegetables', defaultQty: '2 pcs' },
  { name: 'Green Onion', emoji: '🌱', category: 'Vegetables', defaultQty: '1 bunch' },
  { name: 'Garlic', emoji: '🧄', category: 'Vegetables', defaultQty: '1 head' },
  { name: 'Ginger', emoji: '🫚', category: 'Vegetables', defaultQty: '1 piece' },
  { name: 'Zucchini', emoji: '🥒', category: 'Vegetables', defaultQty: '2 pcs' },
  { name: 'Eggplant', emoji: '🍆', category: 'Vegetables', defaultQty: '1 pc' },
  { name: 'Corn', emoji: '🌽', category: 'Vegetables', defaultQty: '2 ears' },
  { name: 'Mushroom', emoji: '🍄', category: 'Vegetables', defaultQty: '200g' },
  { name: 'Portobello Mushroom', emoji: '🍄', category: 'Vegetables', defaultQty: '3 pcs' },
  { name: 'Cauliflower', emoji: '🥦', category: 'Vegetables', defaultQty: '1 head' },
  { name: 'Asparagus', emoji: '🥦', category: 'Vegetables', defaultQty: '1 bunch' },
  { name: 'Sweet Potato', emoji: '🍠', category: 'Vegetables', defaultQty: '2 pcs' },
  { name: 'Potato', emoji: '🥔', category: 'Vegetables', defaultQty: '4 pcs' },
  { name: 'Beetroot', emoji: '🫐', category: 'Vegetables', defaultQty: '2 pcs' },
  { name: 'Peas', emoji: '🟢', category: 'Vegetables', defaultQty: '200g' },
  { name: 'Green Beans', emoji: '🥦', category: 'Vegetables', defaultQty: '200g' },
  { name: 'Radish', emoji: '🌸', category: 'Vegetables', defaultQty: '1 bunch' },
  { name: 'Leek', emoji: '🥬', category: 'Vegetables', defaultQty: '2 stalks' },
  { name: 'Artichoke', emoji: '🥦', category: 'Vegetables', defaultQty: '2 pcs' },
  { name: 'Bok Choy', emoji: '🥬', category: 'Vegetables', defaultQty: '2 heads' },
  { name: 'Cabbage', emoji: '🥬', category: 'Vegetables', defaultQty: '1 head' },
  { name: 'Brussels Sprouts', emoji: '🥦', category: 'Vegetables', defaultQty: '300g' },
  { name: 'Fennel', emoji: '🌿', category: 'Vegetables', defaultQty: '1 bulb' },
  { name: 'Parsnip', emoji: '🥕', category: 'Vegetables', defaultQty: '3 pcs' },
  { name: 'Turnip', emoji: '🥔', category: 'Vegetables', defaultQty: '2 pcs' },
  // Fruits
  { name: 'Apple', emoji: '🍎', category: 'Fruits', defaultQty: '4 pcs' },
  { name: 'Green Apple', emoji: '🍏', category: 'Fruits', defaultQty: '4 pcs' },
  { name: 'Banana', emoji: '🍌', category: 'Fruits', defaultQty: '6 pcs' },
  { name: 'Orange', emoji: '🍊', category: 'Fruits', defaultQty: '4 pcs' },
  { name: 'Clementine', emoji: '🍊', category: 'Fruits', defaultQty: '6 pcs' },
  { name: 'Strawberry', emoji: '🍓', category: 'Fruits', defaultQty: '250g' },
  { name: 'Blueberry', emoji: '🫐', category: 'Fruits', defaultQty: '200g' },
  { name: 'Raspberry', emoji: '🍓', category: 'Fruits', defaultQty: '150g' },
  { name: 'Blackberry', emoji: '🫐', category: 'Fruits', defaultQty: '150g' },
  { name: 'Grape', emoji: '🍇', category: 'Fruits', defaultQty: '500g' },
  { name: 'Mango', emoji: '🥭', category: 'Fruits', defaultQty: '2 pcs' },
  { name: 'Pineapple', emoji: '🍍', category: 'Fruits', defaultQty: '1 pc' },
  { name: 'Watermelon', emoji: '🍉', category: 'Fruits', defaultQty: '1/4 slice' },
  { name: 'Lemon', emoji: '🍋', category: 'Fruits', defaultQty: '4 pcs' },
  { name: 'Lime', emoji: '🍋', category: 'Fruits', defaultQty: '4 pcs' },
  { name: 'Avocado', emoji: '🥑', category: 'Fruits', defaultQty: '2 pcs' },
  { name: 'Kiwi', emoji: '🥝', category: 'Fruits', defaultQty: '4 pcs' },
  { name: 'Peach', emoji: '🍑', category: 'Fruits', defaultQty: '3 pcs' },
  { name: 'Pear', emoji: '🍐', category: 'Fruits', defaultQty: '3 pcs' },
  { name: 'Plum', emoji: '🍑', category: 'Fruits', defaultQty: '4 pcs' },
  { name: 'Cherry', emoji: '🍒', category: 'Fruits', defaultQty: '200g' },
  { name: 'Pomegranate', emoji: '🍎', category: 'Fruits', defaultQty: '1 pc' },
  { name: 'Coconut', emoji: '🥥', category: 'Fruits', defaultQty: '1 pc' },
  { name: 'Papaya', emoji: '🍈', category: 'Fruits', defaultQty: '1 pc' },
  { name: 'Dragon Fruit', emoji: '🍈', category: 'Fruits', defaultQty: '1 pc' },
  { name: 'Passion Fruit', emoji: '🍈', category: 'Fruits', defaultQty: '3 pcs' },
  { name: 'Guava', emoji: '🍈', category: 'Fruits', defaultQty: '3 pcs' },
  { name: 'Melon', emoji: '🍈', category: 'Fruits', defaultQty: '1/2 pc' },
  { name: 'Fig', emoji: '🍈', category: 'Fruits', defaultQty: '4 pcs' },
  // Dairy
  { name: 'Milk', emoji: '🥛', category: 'Dairy', defaultQty: '1L' },
  { name: 'Whole Milk', emoji: '🥛', category: 'Dairy', defaultQty: '1L' },
  { name: 'Skim Milk', emoji: '🥛', category: 'Dairy', defaultQty: '1L' },
  { name: 'Eggs', emoji: '🥚', category: 'Dairy', defaultQty: '12 pcs' },
  { name: 'Butter', emoji: '🧈', category: 'Dairy', defaultQty: '250g' },
  { name: 'Cheese', emoji: '🧀', category: 'Dairy', defaultQty: '200g' },
  { name: 'Cheddar Cheese', emoji: '🧀', category: 'Dairy', defaultQty: '200g' },
  { name: 'Mozzarella', emoji: '🧀', category: 'Dairy', defaultQty: '125g' },
  { name: 'Parmesan', emoji: '🧀', category: 'Dairy', defaultQty: '100g' },
  { name: 'Brie', emoji: '🧀', category: 'Dairy', defaultQty: '125g' },
  { name: 'Feta Cheese', emoji: '🧀', category: 'Dairy', defaultQty: '200g' },
  { name: 'Cream Cheese', emoji: '🧀', category: 'Dairy', defaultQty: '200g' },
  { name: 'Ricotta', emoji: '🧀', category: 'Dairy', defaultQty: '250g' },
  { name: 'Yogurt', emoji: '🥛', category: 'Dairy', defaultQty: '500g' },
  { name: 'Greek Yogurt', emoji: '🥛', category: 'Dairy', defaultQty: '500g' },
  { name: 'Sour Cream', emoji: '🥛', category: 'Dairy', defaultQty: '200g' },
  { name: 'Heavy Cream', emoji: '🥛', category: 'Dairy', defaultQty: '250ml' },
  { name: 'Whipping Cream', emoji: '🥛', category: 'Dairy', defaultQty: '250ml' },
  { name: 'Almond Milk', emoji: '🥛', category: 'Dairy', defaultQty: '1L' },
  { name: 'Oat Milk', emoji: '🥛', category: 'Dairy', defaultQty: '1L' },
  { name: 'Soy Milk', emoji: '🥛', category: 'Dairy', defaultQty: '1L' },
  { name: 'Coconut Milk', emoji: '🥥', category: 'Dairy', defaultQty: '400ml' },
  // Protein
  { name: 'Chicken Breast', emoji: '🍗', category: 'Protein', defaultQty: '500g' },
  { name: 'Chicken Thighs', emoji: '🍗', category: 'Protein', defaultQty: '500g' },
  { name: 'Chicken Wings', emoji: '🍗', category: 'Protein', defaultQty: '500g' },
  { name: 'Ground Beef', emoji: '🥩', category: 'Protein', defaultQty: '500g' },
  { name: 'Ground Turkey', emoji: '🥩', category: 'Protein', defaultQty: '500g' },
  { name: 'Steak', emoji: '🥩', category: 'Protein', defaultQty: '300g' },
  { name: 'Pork Chops', emoji: '🥩', category: 'Protein', defaultQty: '400g' },
  { name: 'Bacon', emoji: '🥓', category: 'Protein', defaultQty: '200g' },
  { name: 'Sausage', emoji: '🌭', category: 'Protein', defaultQty: '400g' },
  { name: 'Turkey', emoji: '🍗', category: 'Protein', defaultQty: '500g' },
  { name: 'Salmon', emoji: '🐟', category: 'Protein', defaultQty: '400g' },
  { name: 'Tuna', emoji: '🐟', category: 'Protein', defaultQty: '2 cans' },
  { name: 'Shrimp', emoji: '🦐', category: 'Protein', defaultQty: '300g' },
  { name: 'Cod', emoji: '🐟', category: 'Protein', defaultQty: '400g' },
  { name: 'Tilapia', emoji: '🐟', category: 'Protein', defaultQty: '400g' },
  { name: 'Tofu', emoji: '🧊', category: 'Protein', defaultQty: '400g' },
  { name: 'Tempeh', emoji: '🫘', category: 'Protein', defaultQty: '300g' },
  { name: 'Black Beans', emoji: '🫘', category: 'Protein', defaultQty: '1 can' },
  { name: 'Chickpeas', emoji: '🫘', category: 'Protein', defaultQty: '1 can' },
  { name: 'Lentils', emoji: '🫘', category: 'Protein', defaultQty: '400g' },
  { name: 'Edamame', emoji: '🫘', category: 'Protein', defaultQty: '300g' },
  { name: 'Lamb Chops', emoji: '🥩', category: 'Protein', defaultQty: '400g' },
  { name: 'Duck Breast', emoji: '🍗', category: 'Protein', defaultQty: '300g' },
  // Beverages
  { name: 'Orange Juice', emoji: '🍊', category: 'Beverages', defaultQty: '1L' },
  { name: 'Apple Juice', emoji: '🍎', category: 'Beverages', defaultQty: '1L' },
  { name: 'Grape Juice', emoji: '🍇', category: 'Beverages', defaultQty: '1L' },
  { name: 'Sparkling Water', emoji: '💧', category: 'Beverages', defaultQty: '6 bottles' },
  { name: 'Coconut Water', emoji: '🥥', category: 'Beverages', defaultQty: '1L' },
  { name: 'Soda', emoji: '🥤', category: 'Beverages', defaultQty: '6 cans' },
  { name: 'Beer', emoji: '🍺', category: 'Beverages', defaultQty: '6 cans' },
  { name: 'Wine', emoji: '🍷', category: 'Beverages', defaultQty: '1 bottle' },
  { name: 'Kombucha', emoji: '🥤', category: 'Beverages', defaultQty: '2 bottles' },
  { name: 'Iced Tea', emoji: '🧋', category: 'Beverages', defaultQty: '1L' },
  { name: 'Lemonade', emoji: '🍋', category: 'Beverages', defaultQty: '1L' },
  { name: 'Sports Drink', emoji: '🥤', category: 'Beverages', defaultQty: '6 bottles' },
  // Grains
  { name: 'Bread', emoji: '🍞', category: 'Grains', defaultQty: '1 loaf' },
  { name: 'Sourdough Bread', emoji: '🍞', category: 'Grains', defaultQty: '1 loaf' },
  { name: 'Whole Wheat Bread', emoji: '🍞', category: 'Grains', defaultQty: '1 loaf' },
  { name: 'Tortillas', emoji: '🫓', category: 'Grains', defaultQty: '10 pcs' },
  { name: 'Rice', emoji: '🍚', category: 'Grains', defaultQty: '1kg' },
  { name: 'Brown Rice', emoji: '🍚', category: 'Grains', defaultQty: '1kg' },
  { name: 'Pasta', emoji: '🍝', category: 'Grains', defaultQty: '500g' },
  { name: 'Spaghetti', emoji: '🍝', category: 'Grains', defaultQty: '500g' },
  { name: 'Oats', emoji: '🌾', category: 'Grains', defaultQty: '500g' },
  { name: 'Bagel', emoji: '🥯', category: 'Grains', defaultQty: '4 pcs' },
  { name: 'Pita Bread', emoji: '🫓', category: 'Grains', defaultQty: '6 pcs' },
  { name: 'Quinoa', emoji: '🌾', category: 'Grains', defaultQty: '500g' },
  { name: 'Naan', emoji: '🫓', category: 'Grains', defaultQty: '4 pcs' },
  { name: 'Croissant', emoji: '🥐', category: 'Grains', defaultQty: '4 pcs' },
  { name: 'Muffin', emoji: '🧁', category: 'Grains', defaultQty: '4 pcs' },
  { name: 'Couscous', emoji: '🌾', category: 'Grains', defaultQty: '500g' },
  { name: 'Farro', emoji: '🌾', category: 'Grains', defaultQty: '500g' },
  // Condiments
  { name: 'Ketchup', emoji: '🍅', category: 'Condiments', defaultQty: '1 bottle' },
  { name: 'Mustard', emoji: '🌭', category: 'Condiments', defaultQty: '1 jar' },
  { name: 'Mayonnaise', emoji: '🫙', category: 'Condiments', defaultQty: '1 jar' },
  { name: 'Hot Sauce', emoji: '🌶️', category: 'Condiments', defaultQty: '1 bottle' },
  { name: 'Soy Sauce', emoji: '🍶', category: 'Condiments', defaultQty: '1 bottle' },
  { name: 'Olive Oil', emoji: '🫙', category: 'Condiments', defaultQty: '500ml' },
  { name: 'Vegetable Oil', emoji: '🫙', category: 'Condiments', defaultQty: '500ml' },
  { name: 'Honey', emoji: '🍯', category: 'Condiments', defaultQty: '1 jar' },
  { name: 'Maple Syrup', emoji: '🍯', category: 'Condiments', defaultQty: '250ml' },
  { name: 'Jam', emoji: '🍓', category: 'Condiments', defaultQty: '1 jar' },
  { name: 'Strawberry Jam', emoji: '🍓', category: 'Condiments', defaultQty: '1 jar' },
  { name: 'Peanut Butter', emoji: '🥜', category: 'Condiments', defaultQty: '1 jar' },
  { name: 'Almond Butter', emoji: '🥜', category: 'Condiments', defaultQty: '1 jar' },
  { name: 'Salsa', emoji: '🍅', category: 'Condiments', defaultQty: '1 jar' },
  { name: 'Hummus', emoji: '🫘', category: 'Condiments', defaultQty: '200g' },
  { name: 'Ranch Dressing', emoji: '🥗', category: 'Condiments', defaultQty: '1 bottle' },
  { name: 'Balsamic Vinegar', emoji: '🫙', category: 'Condiments', defaultQty: '250ml' },
  { name: 'Worcestershire Sauce', emoji: '🍶', category: 'Condiments', defaultQty: '1 bottle' },
  { name: 'Tahini', emoji: '🫙', category: 'Condiments', defaultQty: '1 jar' },
  { name: 'Sriracha', emoji: '🌶️', category: 'Condiments', defaultQty: '1 bottle' },
  // Snacks
  { name: 'Almonds', emoji: '🥜', category: 'Snacks', defaultQty: '200g' },
  { name: 'Cashews', emoji: '🥜', category: 'Snacks', defaultQty: '200g' },
  { name: 'Walnuts', emoji: '🥜', category: 'Snacks', defaultQty: '200g' },
  { name: 'Peanuts', emoji: '🥜', category: 'Snacks', defaultQty: '200g' },
  { name: 'Pistachios', emoji: '🥜', category: 'Snacks', defaultQty: '200g' },
  { name: 'Dark Chocolate', emoji: '🍫', category: 'Snacks', defaultQty: '100g' },
  { name: 'Milk Chocolate', emoji: '🍫', category: 'Snacks', defaultQty: '100g' },
  { name: 'Chips', emoji: '🍿', category: 'Snacks', defaultQty: '1 bag' },
  { name: 'Crackers', emoji: '🍘', category: 'Snacks', defaultQty: '1 box' },
  { name: 'Granola Bar', emoji: '🍫', category: 'Snacks', defaultQty: '6 bars' },
  { name: 'Popcorn', emoji: '🍿', category: 'Snacks', defaultQty: '1 bag' },
  { name: 'Rice Cakes', emoji: '🍘', category: 'Snacks', defaultQty: '1 pack' },
  { name: 'Trail Mix', emoji: '🥜', category: 'Snacks', defaultQty: '200g' },
  { name: 'Protein Bar', emoji: '🍫', category: 'Snacks', defaultQty: '4 bars' },
  { name: 'Pretzels', emoji: '🥨', category: 'Snacks', defaultQty: '1 bag' },
  { name: 'Cheese Crackers', emoji: '🍘', category: 'Snacks', defaultQty: '1 box' },
  // Frozen
  { name: 'Ice Cream', emoji: '🍦', category: 'Frozen', defaultQty: '500ml' },
  { name: 'Frozen Peas', emoji: '🟢', category: 'Frozen', defaultQty: '500g' },
  { name: 'Frozen Pizza', emoji: '🍕', category: 'Frozen', defaultQty: '1 pc' },
  { name: 'Frozen Berries', emoji: '🫐', category: 'Frozen', defaultQty: '500g' },
  { name: 'Frozen Edamame', emoji: '🫘', category: 'Frozen', defaultQty: '400g' },
  { name: 'Frozen Broccoli', emoji: '🥦', category: 'Frozen', defaultQty: '500g' },
  { name: 'Frozen Corn', emoji: '🌽', category: 'Frozen', defaultQty: '500g' },
  { name: 'Frozen Spinach', emoji: '🥬', category: 'Frozen', defaultQty: '400g' },
  { name: 'Frozen Waffles', emoji: '🧇', category: 'Frozen', defaultQty: '8 pcs' },
  { name: 'Frozen Burritos', emoji: '🌯', category: 'Frozen', defaultQty: '4 pcs' },
  { name: 'Popsicle', emoji: '🍡', category: 'Frozen', defaultQty: '6 pcs' },
  { name: 'Sorbet', emoji: '🍧', category: 'Frozen', defaultQty: '500ml' },
  { name: 'Frozen Shrimp', emoji: '🦐', category: 'Frozen', defaultQty: '400g' },
  { name: 'Frozen Chicken Nuggets', emoji: '🍗', category: 'Frozen', defaultQty: '500g' },
];

interface Props {
  item?: FridgeItem | null;
  onSave: (item: FridgeItem) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const FridgeItemModal = ({ item, onSave, onDelete, onClose }: Props) => {
  const initialCategory = item?.category || 'Other';
  const initialLocation = item?.location || 'Fridge';
  const initialCustomCategory = categoryOptions.includes(initialCategory) ? '' : initialCategory;
  const initialCustomLocation = locationOptions.includes(initialLocation) ? '' : initialLocation;

  const [name, setName] = useState(item?.name || '');
  const [selectedEmoji, setSelectedEmoji] = useState(item?.emoji || emojiMap[initialCategory] || '📦');
  const [quantity, setQuantity] = useState(item?.quantity || '');
  const [category, setCategory] = useState(categoryOptions.includes(initialCategory) ? initialCategory : 'Other');
  const [customCategory, setCustomCategory] = useState(initialCustomCategory);
  const [location, setLocation] = useState(locationOptions.includes(initialLocation) ? initialLocation : 'Other');
  const [customLocation, setCustomLocation] = useState(initialCustomLocation);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(() => {
    if (item?.daysLeft !== undefined) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + item.daysLeft);
      return d;
    }
    return undefined;
  });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Barcode scanner state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const barcodeScannerRef = useRef<Html5Qrcode | null>(null);
  const barcodeContainerId = 'barcode-scanner-modal';

  const stopBarcodeScanner = () => {
    barcodeScannerRef.current?.stop().catch(() => {}).finally(() => {
      barcodeScannerRef.current = null;
      setScannerOpen(false);
      setScannerLoading(false);
    });
  };

  const lookupBarcode = async (code: string) => {
    stopBarcodeScanner();
    setScannerLoading(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const productName = p.product_name_en || p.product_name || '';
        if (productName) {
          setName(productName);
          // Map category from product categories
          const cats = (p.categories || '').toLowerCase();
          const catMap: [string, string][] = [
            ['dairy', 'Dairy'], ['milk', 'Dairy'], ['cheese', 'Dairy'], ['yogurt', 'Dairy'],
            ['meat', 'Protein'], ['chicken', 'Protein'], ['fish', 'Protein'], ['seafood', 'Protein'],
            ['vegetable', 'Vegetables'], ['fruit', 'Fruits'],
            ['beverage', 'Beverages'], ['drink', 'Beverages'], ['juice', 'Beverages'],
            ['bread', 'Grains'], ['cereal', 'Grains'], ['pasta', 'Grains'], ['rice', 'Grains'],
            ['sauce', 'Condiments'], ['condiment', 'Condiments'],
            ['snack', 'Snacks'], ['chip', 'Snacks'], ['cookie', 'Snacks'],
            ['frozen', 'Frozen'],
          ];
          for (const [kw, cat] of catMap) {
            if (cats.includes(kw)) { setCategory(cat); break; }
          }
          // Auto-fill quantity from serving size
          const serving = p.serving_size || p.quantity || '';
          if (serving && !quantity.trim()) setQuantity(serving);
          toast.success(`Found: ${productName}`);
        } else {
          toast.error('Product found but name is missing. Please type it manually.');
        }
      } else {
        toast.error('Product not found. Please type the name manually.');
      }
    } catch {
      toast.error('Could not look up barcode. Check your connection.');
    } finally {
      setScannerLoading(false);
    }
  };

  const openBarcodeScanner = () => {
    setScannerOpen(true);
    setTimeout(() => {
      const scanner = new Html5Qrcode(barcodeContainerId);
      barcodeScannerRef.current = scanner;
      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 100 } },
        (decodedText) => lookupBarcode(decodedText),
        () => {}
      ).catch(() => {
        toast.error('Camera access denied. Please allow camera and try again.');
        setScannerOpen(false);
      });
    }, 200);
  };

  useEffect(() => {
    return () => { barcodeScannerRef.current?.stop().catch(() => {}); };
  }, []);

  const today = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const finalCategory = category === 'Other' ? customCategory.trim() : category;
  const finalLocation = location === 'Other' ? customLocation.trim() : location;
  const daysLeft = expirationDate ? Math.max(0, differenceInDays(expirationDate, today)) : 7;
  const isEditing = !!item;

  // Filter suggestions based on current name input
  const suggestions = useMemo(() => {
    const q = name.trim().toLowerCase();
    if (!q) return [];
    const startsWith = FOOD_SUGGESTIONS.filter(s => s.name.toLowerCase().startsWith(q));
    const contains = FOOD_SUGGESTIONS.filter(s => !s.name.toLowerCase().startsWith(q) && s.name.toLowerCase().includes(q));
    return [...startsWith, ...contains].slice(0, 7);
  }, [name]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        nameInputRef.current && !nameInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const applySuggestion = (s: FoodSuggestion) => {
    setName(s.name);
    setSelectedEmoji(s.emoji);
    if (categoryOptions.includes(s.category)) {
      setCategory(s.category);
      setCustomCategory('');
    }
    setShowSuggestions(false);
    // Auto-fill quantity only if empty
    if (!quantity.trim()) setQuantity(s.defaultQty);
  };

  const handleSave = () => {
    if (!name.trim() || !quantity.trim() || !finalCategory || !finalLocation) return;
    onSave({
      id: item?.id || crypto.randomUUID(),
      name: name.trim(),
      emoji: selectedEmoji,
      quantity: quantity.trim(),
      daysLeft,
      category: finalCategory,
      location: finalLocation,
    });
  };

  // Highlight the matching part of a suggestion name
  const highlightMatch = (text: string, query: string) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1 || !query) return <span>{text}</span>;
    return (
      <>
        <span>{text.slice(0, idx)}</span>
        <span className="text-primary font-bold">{text.slice(idx, idx + query.length)}</span>
        <span>{text.slice(idx + query.length)}</span>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/80 p-3 pb-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div className="flex h-full items-end justify-center sm:items-center">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elegant"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-xl">{selectedEmoji}</div>
              <div>
                <h3 className="text-base font-bold">{isEditing ? 'Edit Item' : 'Add Item'}</h3>
                <p className="text-xs text-muted-foreground">Update the details and save below</p>
              </div>
            </div>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">

            {/* Item Name with autocomplete */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Item Name</label>
                <button
                  type="button"
                  onClick={openBarcodeScanner}
                  disabled={scannerLoading}
                  className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground active:scale-95 transition-transform disabled:opacity-50"
                >
                  {scannerLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Barcode className="w-3 h-3" />}
                  {scannerLoading ? 'Looking up...' : 'Scan Barcode'}
                </button>
              </div>

              {/* Barcode scanner overlay */}
              <AnimatePresence>
                {scannerOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-3"
                  >
                    <div className="rounded-2xl overflow-hidden bg-black relative">
                      <div id={barcodeContainerId} className="w-full" style={{ minHeight: 160 }} />
                      <button
                        type="button"
                        onClick={stopBarcodeScanner}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center text-sm"
                      >×</button>
                      <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/80">
                        Point camera at a barcode
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
              <input
                  ref={nameInputRef}
                value={name}
                  onChange={(e) => {
                    setName(e.target.value.slice(0, 80));
                    setShowSuggestions(true);
                  }}
                  onFocus={() => { if (name.trim()) setShowSuggestions(true); }}
                  onKeyDown={(e) => { if (e.key === 'Escape') setShowSuggestions(false); }}
                placeholder="e.g. Broccoli"
                  autoComplete="off"
                className="w-full rounded-xl bg-secondary/50 px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
              />

                {/* Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      ref={dropdownRef}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 right-0 top-full z-10 mt-1.5 overflow-hidden rounded-2xl border border-border bg-card shadow-elegant"
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={s.name}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault(); // prevent input blur before click fires
                            applySuggestion(s);
                          }}
                          className={cn(
                            'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors active:bg-secondary/80',
                            'hover:bg-secondary/60',
                            i !== suggestions.length - 1 && 'border-b border-border/40'
                          )}
                        >
                          <span className="text-xl shrink-0">{s.emoji}</span>
                          <span className="flex-1 min-w-0 text-sm">
                            {highlightMatch(s.name, name.trim())}
                          </span>
                          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {s.category}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Quantity</label>
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value.slice(0, 40))}
                placeholder="e.g. 2 heads, 500g, 1L"
                className="w-full rounded-xl bg-secondary/50 px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category</label>
              <div className="flex flex-wrap gap-1.5">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      category === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {emojiMap[cat]} {cat}
                  </button>
                ))}
              </div>
              {category === 'Other' && (
                <input
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value.slice(0, 40))}
                  placeholder="Type a custom category"
                  className="mt-2 w-full rounded-xl bg-secondary/50 px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>

            {/* Location */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <MapPin className="h-3 w-3" /> Location
              </label>
              <div className="flex flex-wrap gap-1.5">
                {locationOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLocation(option)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      location === option ? 'bg-info text-info-foreground' : 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {locationEmoji[option]} {option}
                  </button>
                ))}
              </div>
              {location === 'Other' && (
                <input
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value.slice(0, 40))}
                  placeholder="Type a custom location"
                  className="mt-2 w-full rounded-xl bg-secondary/50 px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>

            {/* Expiration Date */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Expiration Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5 text-left text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20',
                      !expirationDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {expirationDate ? format(expirationDate, 'PPP') : 'Pick an expiration date'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[80]" align="start">
                  <Calendar
                    mode="single"
                    selected={expirationDate}
                    onSelect={setExpirationDate}
                    disabled={(date) => date < today}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
              {expirationDate && (
                <p className={cn('mt-1 text-xs', daysLeft <= 3 ? 'text-destructive' : 'text-muted-foreground')}>
                  {daysLeft === 0 ? 'Expires today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                </p>
              )}
            </div>

            {/* Storage tip */}
            {name.trim() && getStorageTip(name) && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-500/8 border border-amber-500/20 p-3">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  <span className="font-semibold">Storage tip: </span>{getStorageTip(name)}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-border bg-card px-5 pb-5 pt-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              {isEditing && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item!.id)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive transition-transform active:scale-95"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={!name.trim() || !quantity.trim() || !finalCategory || !finalLocation}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-info-foreground transition-transform active:scale-[0.98] disabled:opacity-50 gradient-info shadow-glow"
              >
                {isEditing ? 'Update Item' : 'Add to Fridge'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FridgeItemModal;
