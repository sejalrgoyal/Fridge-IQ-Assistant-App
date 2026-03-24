import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Save } from 'lucide-react';
import type { Meal } from '@/data/mockData';

interface Props {
  onClose: () => void;
  onAdd: (meal: Meal) => void;
}

const AddMealForm = ({ onClose, onAdd }: Props) => {
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [time, setTime] = useState('');
  const [calories, setCalories] = useState('');
  const [servings, setServings] = useState('2');
  const [cuisine, setCuisine] = useState('');
  const [tags, setTags] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', available: true }]);
  const [instructions, setInstructions] = useState(['']);
  const [sourceUrl, setSourceUrl] = useState('');

  const addIngredient = () => setIngredients(prev => [...prev, { name: '', quantity: '', available: true }]);
  const removeIngredient = (i: number) => setIngredients(prev => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: string, val: string | boolean) =>
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));

  const addStep = () => setInstructions(prev => [...prev, '']);
  const removeStep = (i: number) => setInstructions(prev => prev.filter((_, idx) => idx !== i));
  const updateStep = (i: number, val: string) =>
    setInstructions(prev => prev.map((s, idx) => idx === i ? val : s));

  const handleSubmit = () => {
    if (!name.trim()) return;
    const meal: Meal = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      image: '🍽️',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80',
      time: time || '30 min',
      calories: parseInt(calories) || 0,
      servings: parseInt(servings) || 2,
      cuisine: cuisine || 'Custom',
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      dietLabels: [],
      ingredients: ingredients.map(i => i.name).filter(Boolean),
      missingIngredients: ingredients.filter(i => !i.available).map(i => i.name).filter(Boolean),
      detailedIngredients: ingredients.filter(i => i.name.trim()).map(i => ({
        name: i.name.trim(),
        quantity: i.quantity.trim() || 'to taste',
        available: i.available,
      })),
      nutrition: { protein: '0g', carbs: '0g', fat: '0g', fiber: '0g' },
      nutritionBenefits: [],
      instructions: instructions.filter(s => s.trim()),
      sourceUrl: sourceUrl || undefined,
      sourceName: sourceUrl ? new URL(sourceUrl).hostname.replace('www.', '') : undefined,
    };
    onAdd(meal);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto bg-card rounded-t-3xl border-t border-border"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-bold">Add Custom Meal</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Basic info */}
          <div className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Meal name *"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="Photo URL (optional)"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="grid grid-cols-3 gap-2">
              <input value={time} onChange={e => setTime(e.target.value)} placeholder="Time (e.g. 20 min)"
                className="px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={calories} onChange={e => setCalories(e.target.value)} placeholder="Calories" type="number"
                className="px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={servings} onChange={e => setServings(e.target.value)} placeholder="Servings" type="number"
                className="px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={cuisine} onChange={e => setCuisine(e.target.value)} placeholder="Cuisine (e.g. Italian)"
                className="px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma separated)"
                className="px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="Recipe source URL (optional)"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </div>

          {/* Ingredients */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ingredients</p>
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => updateIngredient(i, 'available', !ing.available)}
                    className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                      ing.available ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {ing.available ? '✓' : '✗'}
                  </button>
                  <input value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} placeholder="Ingredient"
                    className="flex-1 px-2.5 py-2 rounded-lg bg-secondary text-sm outline-none" />
                  <input value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)} placeholder="Qty"
                    className="w-24 px-2.5 py-2 rounded-lg bg-secondary text-sm outline-none" />
                  {ingredients.length > 1 && (
                    <button onClick={() => removeIngredient(i)} className="text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addIngredient} className="text-xs text-primary font-medium flex items-center gap-1 mt-2">
              <Plus className="w-3 h-3" /> Add ingredient
            </button>
          </div>

          {/* Instructions */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Instructions</p>
            <div className="space-y-2">
              {instructions.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-2">
                    <span className="text-[10px] font-bold text-primary-foreground">{i + 1}</span>
                  </div>
                  <textarea value={step} onChange={e => updateStep(i, e.target.value)} placeholder={`Step ${i + 1}...`}
                    rows={2} className="flex-1 px-2.5 py-2 rounded-lg bg-secondary text-sm outline-none resize-none" />
                  {instructions.length > 1 && (
                    <button onClick={() => removeStep(i)} className="text-destructive mt-2">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addStep} className="text-xs text-primary font-medium flex items-center gap-1 mt-2">
              <Plus className="w-3 h-3" /> Add step
            </button>
          </div>

          <button onClick={handleSubmit} disabled={!name.trim()}
            className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" /> Save Meal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddMealForm;
