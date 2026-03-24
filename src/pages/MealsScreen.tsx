import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Flame, Search, Sparkles, X, Plus, ChefHat, Heart, Globe, Check, Share2 } from 'lucide-react';
import { meals } from '@/data/mockData';
import type { Meal } from '@/data/mockData';
import RecipeDetail from '@/components/RecipeDetail';
import AddMealForm from '@/components/AddMealForm';
import { subscribeFridgeiqKeys } from '@/lib/fridgeiqStorage';
import { toast } from 'sonner';
import GreetingHeader from '@/components/GreetingHeader';
import { useNavigate } from 'react-router-dom';
import { getTabConfig } from '@/data/tabConfig';
import ShareModal from '@/components/ShareModal';

const nonVegKeywords = ['chicken', 'beef', 'pork', 'lamb', 'turkey', 'bacon', 'steak', 'meat', 'salmon', 'fish', 'shrimp', 'tuna', 'crab', 'lobster', 'anchovy'];


interface WebRecipe {
  id: string;
  name: string;
  source: string;
  time: string;
  calories: number;
  image: string;
  cuisine: string;
  rating: number;
}

const generateWebRecipes = (query: string): WebRecipe[] => {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const recipes: WebRecipe[] = [
    { id: 'web-1', name: `${query} Tikka Masala`, source: 'AllRecipes', time: '35 min', calories: 420, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', cuisine: 'Indian', rating: 4.7 },
    { id: 'web-2', name: `Creamy ${query} Pasta`, source: 'Food Network', time: '25 min', calories: 380, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop', cuisine: 'Italian', rating: 4.5 },
    { id: 'web-3', name: `${query} Stir Fry`, source: 'Tasty', time: '20 min', calories: 310, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop', cuisine: 'Asian', rating: 4.8 },
    { id: 'web-4', name: `Grilled ${query} Bowl`, source: 'YouTube Cooking', time: '30 min', calories: 350, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop', cuisine: 'Mediterranean', rating: 4.6 },
    { id: 'web-5', name: `${query} Curry`, source: 'Google Recipes', time: '40 min', calories: 390, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop', cuisine: 'Indian', rating: 4.4 },
  ];
  if (['paneer', 'chicken', 'tofu', 'shrimp', 'beef', 'salmon', 'mushroom', 'egg', 'potato', 'rice', 'pasta', 'lentil', 'bean'].some(kw => q.includes(kw))) {
    return recipes;
  }
  return recipes.slice(0, 3);
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

interface QuizPrefs {
  diet: string[];
  allergies: string[];
  cuisines: string[];
  cookingTime: string;
  skillLevel: string;
  goals: string[];
}

const isNonVeg = (meal: Meal): boolean => {
  const text = `${meal.name} ${meal.ingredients.join(' ')} ${meal.detailedIngredients.map(i => i.name).join(' ')}`.toLowerCase();
  return nonVegKeywords.some(kw => text.includes(kw));
};

const loadQuizPrefs = (): QuizPrefs | null => {
  try {
    const raw = localStorage.getItem('fridgeiq_prefs');
    if (raw) return JSON.parse(raw);
    const profileRaw = localStorage.getItem('fridgeiq_profile_prefs');
    if (profileRaw) {
      const p = JSON.parse(profileRaw);
      return { diet: p.diet ? [p.diet] : [], allergies: p.allergies || [], cuisines: p.favoriteCuisines || [], cookingTime: p.cookingTime || '', skillLevel: p.cookingSkill || '', goals: [] };
    }
  } catch { return null; }
  return null;
};

const getLikedMeals = (): Set<string> => {
  try {
    const saved = localStorage.getItem('fridgeiq_liked_meals');
    if (saved) return new Set(JSON.parse(saved));
  } catch {}
  return new Set();
};

const MealsScreen = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [personalized, setPersonalized] = useState(true);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [likedMeals, setLikedMeals] = useState<Set<string>>(getLikedMeals);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [addedWebRecipes, setAddedWebRecipes] = useState<Set<string>>(new Set());
  const [showShare, setShowShare] = useState(false);
  const [customMeals, setCustomMeals] = useState<Meal[]>(() => {
    try { const saved = localStorage.getItem('fridgeiq_custom_meals'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [prefs, setPrefs] = useState<QuizPrefs | null>(loadQuizPrefs);

  useEffect(() => {
    return subscribeFridgeiqKeys(['fridgeiq_prefs', 'fridgeiq_profile_prefs'], () => setPrefs(loadQuizPrefs()));
  }, []);

  useEffect(() => {
    if (!selectedMeal) setLikedMeals(getLikedMeals());
  }, [selectedMeal]);

  const allMeals = useMemo(() => [...meals, ...customMeals], [customMeals]);

  const baseFiltered = useMemo(() => {
    let result = [...allMeals];
    if (showFavoritesOnly) {
      result = result.filter(m => likedMeals.has(m.id));
    }
    if (personalized && prefs) {
      result = result.filter(m => {
        const dietLower = (prefs.diet || []).map(d => d.toLowerCase());
        if (dietLower.includes('vegetarian') || dietLower.includes('vegan')) {
          if (isNonVeg(m)) return false;
        }
        if (dietLower.includes('vegan')) {
          const text = `${m.name} ${m.ingredients.join(' ')}`.toLowerCase();
          if (['egg', 'dairy', 'milk', 'cheese', 'yogurt', 'butter', 'cream', 'honey'].some(kw => text.includes(kw))) return false;
        }
        if (prefs.diet.length > 0 && !prefs.diet.includes('No restrictions') && !dietLower.includes('vegetarian') && !dietLower.includes('vegan')) {
          const matchesDiet = prefs.diet.some(d => m.dietLabels.some(label => label.toLowerCase().includes(d.toLowerCase())) || m.tags.some(tag => tag.toLowerCase().includes(d.toLowerCase())));
          if (!matchesDiet) return false;
        }
        return true;
      });
      if (prefs.cuisines && prefs.cuisines.length > 0) {
        result.sort((a, b) => {
          const aMatch = prefs.cuisines.some(c => a.cuisine.toLowerCase().includes(c.toLowerCase())) ? 0 : 1;
          const bMatch = prefs.cuisines.some(c => b.cuisine.toLowerCase().includes(c.toLowerCase())) ? 0 : 1;
          return aMatch - bMatch;
        });
      }
    }
    return result;
  }, [allMeals, personalized, prefs, showFavoritesOnly, likedMeals]);

  // Filters now depend on baseFiltered which includes customMeals
  const filters = useMemo(() => {
    const candidates = ['All'];
    const possibleFilters = new Set<string>();
    if (prefs) {
      prefs.diet?.forEach(d => { if (d && d !== 'No restrictions') possibleFilters.add(d); });
      prefs.goals?.forEach(g => { if (g) possibleFilters.add(g); });
      if (prefs.cookingTime === 'Under 15 minutes' || prefs.cookingTime === 'Under 30 minutes') possibleFilters.add('Quick');
      prefs.cuisines?.forEach(c => { if (c) possibleFilters.add(c); });
    }
    ['Quick', 'High Protein', 'Vegetarian', 'Vegan', 'Budget', 'Breakfast', 'Low Calorie', 'Web Recipe'].forEach(d => possibleFilters.add(d));
    // Also add cuisine and tag from all meals (including custom)
    baseFiltered.forEach(m => {
      m.tags.forEach(t => possibleFilters.add(t));
    });
    possibleFilters.forEach(f => {
      const hasMatch = baseFiltered.some(m =>
        m.tags.some(t => t.toLowerCase().includes(f.toLowerCase())) ||
        m.dietLabels.some(l => l.toLowerCase().includes(f.toLowerCase()))
      );
      if (hasMatch) candidates.push(f);
    });
    return candidates;
  }, [prefs, baseFiltered]);

  const filtered = useMemo(() => {
    let result = [...baseFiltered];
    if (activeFilter !== 'All') {
      result = result.filter(m => m.tags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase())) || m.dietLabels.some(l => l.toLowerCase().includes(activeFilter.toLowerCase())));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.ingredients.some(i => i.toLowerCase().includes(q)) || m.cuisine.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q)));
    }
    return result;
  }, [activeFilter, searchQuery, baseFiltered]);

  const searchDropdownItems = useMemo(() => {
    if (!searchQuery.trim()) return { localMeals: [], webRecipes: [] };
    const q = searchQuery.toLowerCase();
    const localMeals = allMeals.filter(m =>
      m.name.toLowerCase().includes(q) || m.ingredients.some(i => i.toLowerCase().includes(q)) || m.cuisine.toLowerCase().includes(q)
    ).slice(0, 5);
    const webRecipes = generateWebRecipes(searchQuery);
    return { localMeals, webRecipes };
  }, [searchQuery, allMeals]);

  const handleAddCustomMeal = (meal: Meal) => {
    const updated = [...customMeals, meal];
    setCustomMeals(updated);
    localStorage.setItem('fridgeiq_custom_meals', JSON.stringify(updated));
    setShowAddMeal(false);
  };

  const addWebRecipeToMeals = (recipe: WebRecipe) => {
    const newMeal: Meal = {
      id: `custom-${Date.now()}-${recipe.id}`,
      name: recipe.name,
      image: '🍽️',
      photoUrl: recipe.image,
      time: recipe.time,
      calories: recipe.calories,
      tags: [recipe.cuisine, 'Web Recipe'],
      ingredients: [searchQuery],
      missingIngredients: [],
      detailedIngredients: [{ name: searchQuery, quantity: 'as needed', available: false }],
      servings: 2,
      nutrition: { protein: '20g', carbs: '30g', fat: '12g', fiber: '4g' },
      nutritionBenefits: ['Balanced meal'],
      instructions: [`Search "${recipe.name}" on ${recipe.source} for full instructions.`],
      cuisine: recipe.cuisine,
      dietLabels: [],
    };
    const updated = [...customMeals, newMeal];
    setCustomMeals(updated);
    localStorage.setItem('fridgeiq_custom_meals', JSON.stringify(updated));
    setAddedWebRecipes(prev => new Set(prev).add(recipe.id));
    setSearchQuery('');
    setShowSearchDropdown(false);
    toast.success(`"${recipe.name}" added to your meals!`);
  };

  return (
    <div className="px-5 pt-10 pb-24">
      {/* Greeting Header */}
      {(() => { const t = getTabConfig('/meals'); return t ? <GreetingHeader tabTitle={t.label} tabDescription={t.description} tabIcon={t.icon} tabGradient={t.headerGradient} /> : null; })()}

      {/* Search Bar with action buttons */}
      <div className="mb-4 relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search meals, ingredients, cuisines..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSearchDropdown(true); setAddedWebRecipes(new Set()); }}
              onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true); }}
              className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-secondary text-sm border-none outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <button onClick={() => setShowAddMeal(true)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-95 transition-transform shrink-0" title="Add custom meal">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => setShowShare(true)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center active:scale-95 transition-transform shrink-0" title="Share meals">
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all shrink-0 ${showFavoritesOnly ? 'bg-destructive text-destructive-foreground shadow-glow' : 'bg-secondary'}`}
            title={showFavoritesOnly ? 'Show all meals' : 'Show favorites only'}
          >
            <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          </button>
          {prefs && (
            <button
              onClick={() => setPersonalized(!personalized)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 transition-all shrink-0 ${personalized ? 'gradient-primary shadow-glow' : 'bg-secondary'}`}
              title={personalized ? 'Personalized mode ON' : 'Show all meals'}
            >
              <Sparkles className={`w-4 h-4 ${personalized ? 'text-primary-foreground' : ''}`} />
            </button>
          )}
        </div>

        {showSearchDropdown && searchQuery.trim() && (
          <div className="absolute z-30 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden max-h-[60vh] overflow-y-auto">
            {searchDropdownItems.localMeals.length > 0 && (
              <>
                <p className="px-3 py-2 text-[10px] text-muted-foreground font-semibold uppercase border-b border-border">
                  Your Recipes
                </p>
                {searchDropdownItems.localMeals.map(meal => (
                  <button
                    key={meal.id}
                    onClick={() => { setSelectedMeal(meal); setShowSearchDropdown(false); }}
                    className="w-full px-3 py-2.5 text-left hover:bg-accent/50 flex items-center gap-3 transition-colors border-b border-border/50"
                  >
                    <img src={meal.photoUrl} alt={meal.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{meal.name}</p>
                      <p className="text-[11px] text-muted-foreground">{meal.time} · {meal.calories} cal · {meal.cuisine}</p>
                    </div>
                  </button>
                ))}
              </>
            )}

            {searchDropdownItems.webRecipes.length > 0 && (
              <>
                <p className="px-3 py-2 text-[10px] text-muted-foreground font-semibold uppercase border-b border-border flex items-center gap-1.5">
                  <Globe className="w-3 h-3" /> Recipes from the Web
                </p>
                {searchDropdownItems.webRecipes.map(recipe => (
                  <div
                    key={recipe.id}
                    className="w-full px-3 py-2.5 hover:bg-accent/50 flex items-center gap-3 transition-colors border-b border-border/50 last:border-0"
                  >
                    <img src={recipe.image} alt={recipe.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{recipe.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {recipe.source} · {recipe.time} · {recipe.calories} cal · ⭐ {recipe.rating}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); addWebRecipeToMeals(recipe); }}
                      disabled={addedWebRecipes.has(recipe.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 active:scale-95 transition-all ${
                        addedWebRecipes.has(recipe.id)
                          ? 'bg-success/20 text-success'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                      title={addedWebRecipes.has(recipe.id) ? 'Added!' : 'Add to meals'}
                    >
                      {addedWebRecipes.has(recipe.id) ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {showSearchDropdown && (
        <div className="fixed inset-0 z-20" onClick={() => setShowSearchDropdown(false)} />
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 pb-1">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`text-xs font-medium px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeFilter === f ? 'gradient-warm text-warning-foreground shadow-glow' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">{showFavoritesOnly ? '❤️' : '🍽️'}</p>
          <p className="text-sm font-semibold">{showFavoritesOnly ? 'No favorites yet' : 'No meals found'}</p>
          <p className="text-xs text-muted-foreground mt-1">{showFavoritesOnly ? 'Like recipes to see them here' : 'Try a different filter or search term'}</p>
        </div>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {filtered.map(meal => (
          <motion.div
            key={meal.id}
            variants={item}
            className="glass-elevated overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:shadow-lg rounded-2xl"
            onClick={() => setSelectedMeal(meal)}
          >
            <div className="relative h-36 overflow-hidden">
              <img src={meal.photoUrl} alt={meal.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3">
                <h3 className="font-bold text-sm text-foreground drop-shadow-sm">{meal.name}</h3>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-info" />{meal.time}</span>
                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-destructive" />{meal.calories} cal</span>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5">
                {likedMeals.has(meal.id) && (
                  <span className="w-7 h-7 rounded-lg bg-destructive/80 backdrop-blur flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 text-destructive-foreground fill-current" />
                  </span>
                )}
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-card/80 backdrop-blur text-foreground">
                  {meal.cuisine}
                </span>
              </div>
            </div>
            <div className="p-3 pt-2">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {meal.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-accent text-accent-foreground">{tag}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {meal.detailedIngredients.slice(0, 5).map(ing => (
                  <span key={ing.name} className={`text-[11px] px-2 py-0.5 rounded-full ${ing.available ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {ing.name}
                  </span>
                ))}
                {meal.detailedIngredients.length > 5 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{meal.detailedIngredients.length - 5} more</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {selectedMeal && <RecipeDetail meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
      {showAddMeal && <AddMealForm onClose={() => setShowAddMeal(false)} onAdd={handleAddCustomMeal} />}
      <ShareModal
        open={showShare}
        onClose={() => setShowShare(false)}
        title="My Meals"
        accentGradient="gradient-warm"
        accentColor="text-warning"
        getText={() => {
          let text = '🍽️ My Meals\n\n';
          filtered.forEach(m => { text += `• ${m.name} | ${m.time}, ${m.calories} cal (${m.cuisine})\n`; });
          text += `\n${filtered.length} meals total\nGenerated with FridgeIQ 🧑‍🍳`;
          return text;
        }}
      />
    </div>
  );
};

export default MealsScreen;
