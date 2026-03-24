import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Flame, Users, Check, XCircle, ShoppingCart, ExternalLink, Play, Heart, Share2, Leaf, Download, Link2 } from 'lucide-react';
import type { Meal } from '@/data/mockData';
import { toast } from 'sonner';

interface Props {
  meal: Meal | null;
  onClose: () => void;
}

const getFridgeItems = (): Set<string> => {
  try {
    const saved = localStorage.getItem('fridgeiq_fridge_items');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Items are stored as FridgeItem objects — extract names as lowercase strings
        return new Set(
          parsed
            .map((item: unknown) =>
              typeof item === 'string'
                ? item.toLowerCase()
                : (item as { name?: string }).name?.toLowerCase() ?? ''
            )
            .filter(Boolean)
        );
      }
    }
  } catch {}
  return new Set(['eggs', 'milk', 'spinach', 'chicken breast', 'rice', 'tomatoes', 'pasta', 'greek yogurt', 'avocado', 'salmon']);
};

// Saves checked-off ingredient state for this recipe session only (separate key)
const saveFridgeItems = (items: Set<string>) => {
  localStorage.setItem('fridgeiq_recipe_checked', JSON.stringify([...items]));
};

const getLikedMeals = (): Set<string> => {
  try {
    const saved = localStorage.getItem('fridgeiq_liked_meals');
    if (saved) return new Set(JSON.parse(saved));
  } catch {}
  return new Set();
};

const saveLikedMeals = (liked: Set<string>) => {
  localStorage.setItem('fridgeiq_liked_meals', JSON.stringify([...liked]));
};

const RecipeDetail = ({ meal, onClose }: Props) => {
  const [fridgeItems, setFridgeItems] = useState<Set<string>>(getFridgeItems);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [likedMeals, setLikedMeals] = useState<Set<string>>(getLikedMeals);
  const [servingScale, setServingScale] = useState(1);

  if (!meal) return null;

  const isLiked = likedMeals.has(meal.id);

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = new Set(likedMeals);
    if (isLiked) {
      updated.delete(meal.id);
      toast('Removed from favorites');
    } else {
      updated.add(meal.id);
      toast('Added to favorites ❤️');
    }
    setLikedMeals(updated);
    saveLikedMeals(updated);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: meal.name,
      text: `Check out this recipe: ${meal.name} (${meal.time}, ${meal.calories} cal)`,
      url: meal.sourceUrl || window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast('Recipe link copied to clipboard! 📋');
      }
    } catch {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      toast('Recipe link copied to clipboard! 📋');
    }
  };

  const isInFridge = (ingredientName: string) => {
    const name = ingredientName.toLowerCase();
    return [...fridgeItems].some(fi => name.includes(fi) || fi.includes(name));
  };

  const toggleFridgeItem = (ingredientName: string) => {
    const name = ingredientName.toLowerCase();
    const updated = new Set(fridgeItems);
    if (isInFridge(ingredientName)) {
      updated.forEach(fi => {
        if (name.includes(fi) || fi.includes(name)) updated.delete(fi);
      });
    } else {
      updated.add(name);
    }
    setFridgeItems(updated);
    saveFridgeItems(updated);
  };

  const toggleStep = (i: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto bg-card rounded-t-3xl border-t border-border"
          onClick={e => e.stopPropagation()}
        >
          {/* Header image */}
          <div className="relative h-44 overflow-hidden rounded-t-3xl">
            <img src={meal.photoUrl} alt={meal.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
            <div className="absolute top-3 left-3 flex gap-2">
              <button
                onClick={toggleLike}
                className={`w-8 h-8 rounded-full backdrop-blur flex items-center justify-center transition-all ${isLiked ? 'bg-destructive text-destructive-foreground scale-110' : 'bg-card/80'}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : 'text-destructive'}`} />
              </button>
              <button
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center active:scale-95 transition-transform"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-5 pb-28 -mt-4 relative">
            <h2 className="text-xl font-bold">{meal.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-info" />{meal.time}</span>
              <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-destructive" />{Math.round(meal.calories * servingScale)} cal</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" />{Math.round(meal.servings * servingScale)} servings</span>
            </div>

            {/* Serving size scaler */}
            <div className="flex items-center gap-3 mt-3 bg-secondary/50 rounded-xl px-3 py-2">
              <Users className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-medium flex-1">Servings</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setServingScale(s => Math.max(0.5, +(s - 0.5).toFixed(1)))}
                  className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center active:scale-90 transition-transform"
                >−</button>
                <span className="text-sm font-bold w-12 text-center">
                  {Math.round(meal.servings * servingScale)}× ({servingScale}x)
                </span>
                <button
                  onClick={() => setServingScale(s => Math.min(8, +(s + 0.5).toFixed(1)))}
                  className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center active:scale-90 transition-transform"
                >+</button>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {meal.tags.map(tag => (
                <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{tag}</span>
              ))}
              {meal.dietLabels.map(label => (
                <span key={label} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{label}</span>
              ))}
            </div>

            {/* Nutrition */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">
                Nutrition {servingScale !== 1 ? `(×${servingScale} scaled)` : 'per serving'}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Protein', value: meal.nutrition.protein, color: 'text-info' },
                  { label: 'Carbs', value: meal.nutrition.carbs, color: 'text-warning' },
                  { label: 'Fat', value: meal.nutrition.fat, color: 'text-destructive' },
                  { label: 'Fiber', value: meal.nutrition.fiber, color: 'text-primary' },
                ].map(n => {
                  const raw = n.value;
                  const num = parseFloat(raw);
                  const scaled = servingScale !== 1 && !isNaN(num)
                    ? `${Math.round(num * servingScale)}${raw.replace(/[\d.]+/, '').trim()}`
                    : raw;
                  return (
                    <div key={n.label} className="glass-card p-2.5 text-center">
                      <p className={`text-sm font-bold ${n.color}`}>{scaled}</p>
                      <p className="text-[10px] text-muted-foreground">{n.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Health Benefits */}
            {meal.nutritionBenefits && meal.nutritionBenefits.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-primary" /> Health Benefits
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {meal.nutritionBenefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <span className="text-primary mt-0.5">✦</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients with fridge status */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">
                Ingredients
                <span className="text-[10px] font-normal ml-2">({meal.detailedIngredients.length} items)</span>
              </h3>
              <p className="text-[11px] text-muted-foreground mb-2">Tap an ingredient to toggle fridge status</p>
              <div className="space-y-1.5">
                {meal.detailedIngredients.map(ing => {
                  const inFridge = isInFridge(ing.name);
                  return (
                    <div
                      key={ing.name}
                      onClick={() => toggleFridgeItem(ing.name)}
                      className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      {inFridge ? (
                        <Check className="w-4 h-4 shrink-0 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 shrink-0 text-destructive" />
                      )}
                      <span className={`flex-1 ${!inFridge ? 'text-muted-foreground' : ''}`}>{ing.name}</span>
                      <span className="text-xs text-muted-foreground">{ing.quantity}</span>
                      {inFridge ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success/10 text-success font-medium">In Fridge</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive flex items-center gap-0.5 font-medium">
                          <ShoppingCart className="w-2.5 h-2.5" /> Need to Buy
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Instructions */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Step-by-step Instructions</h3>
              <p className="text-[11px] text-muted-foreground mb-3">Tap a step to mark it complete</p>
              <div className="space-y-3">
                {meal.instructions.map((step, i) => (
                  <div
                    key={i}
                    onClick={() => toggleStep(i)}
                    className={`flex gap-3 cursor-pointer transition-all rounded-xl p-2 -mx-2 ${
                      completedSteps.has(i) ? 'opacity-50 bg-muted/30' : 'hover:bg-muted/20'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      completedSteps.has(i) ? 'bg-success text-success-foreground' : 'gradient-primary'
                    }`}>
                      {completedSteps.has(i) ? (
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      ) : (
                        <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed pt-1 ${completedSteps.has(i) ? 'line-through' : ''}`}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Source */}
            {meal.sourceUrl && (
              <div className="mt-5">
                <a href={meal.sourceUrl} target="_blank" rel="noopener noreferrer"
                  className="glass-card p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5 text-info" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Full Recipe on {meal.sourceName}</p>
                    <p className="text-xs text-muted-foreground">View original recipe with more tips</p>
                  </div>
                </a>
              </div>
            )}

            {/* Video */}
            {meal.videoUrl && (
              <div className="mt-3">
                <a href={meal.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="glass-card p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Watch Video Tutorial</p>
                    <p className="text-xs text-muted-foreground">Step-by-step video guide</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecipeDetail;
