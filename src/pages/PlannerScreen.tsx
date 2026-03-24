import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Pencil, X, Search, ChevronRight, GripVertical, ArrowRightLeft, CalendarDays, Share2, Download, Link2, Globe, ChevronDown, ChevronLeft, ShoppingCart, CheckSquare, Square, Plus, Trash2, Printer, Filter, Mail, MessageCircle, Send } from 'lucide-react';
import { format, addDays, startOfWeek, nextSunday, previousSunday, isSunday } from 'date-fns';
import { weeklyPlan as defaultPlan, meals, fridgeItems } from '@/data/mockData';
import type { Meal } from '@/data/mockData';
import RecipeDetail from '@/components/RecipeDetail';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import GreetingHeader from '@/components/GreetingHeader';
import { getTabConfig } from '@/data/tabConfig';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const fullDayNames: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
const mealTypes = [
  { key: 'breakfast' as const, emoji: '🌅', label: 'Breakfast', gradient: 'from-warning/20 to-warning/5' },
  { key: 'lunch' as const, emoji: '☀️', label: 'Lunch', gradient: 'from-info/20 to-info/5' },
  { key: 'dinner' as const, emoji: '🌙', label: 'Dinner', gradient: 'from-primary/20 to-primary/5' },
];

type MealSlot = { day: string; type: 'breakfast' | 'lunch' | 'dinner' };
interface PrepTask { id: string; task: string; day: string; category: string; custom?: boolean }

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const recipeCards = [
  { name: 'Google', url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q + ' recipe')}` },
  { name: 'AllRecipes', url: (q: string) => `https://www.allrecipes.com/search?q=${encodeURIComponent(q)}` },
  { name: 'YouTube', url: (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' recipe')}` },
];

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const generateMealPrepChecklist = (plan: Record<string, { breakfast: string; lunch: string; dinner: string }>, prepDays: string[]): PrepTask[] => {
  const checklist: PrepTask[] = [];
  prepDays.forEach(day => {
    const dayPlan = plan[day];
    if (!dayPlan) return;
    checklist.push({ id: `${day}-review`, task: `Review ${fullDayNames[day] || day}'s recipes & ingredients`, day, category: 'Planning' });
    (['breakfast', 'lunch', 'dinner'] as const).forEach(type => {
      const mealName = dayPlan[type];
      const found = meals.find(m => m.name === mealName);
      if (found) {
        checklist.push({ id: `${day}-${type}-prep`, task: `Prep ingredients for ${found.name}`, day, category: mealTypes.find(mt => mt.key === type)?.label || type });
        if (found.detailedIngredients.some(i => !i.available)) {
          checklist.push({ id: `${day}-${type}-shop`, task: `Buy missing items for ${found.name}`, day, category: 'Shopping' });
        }
      }
    });
    checklist.push({ id: `${day}-containers`, task: `Prepare storage containers for ${fullDayNames[day] || day}`, day, category: 'Setup' });
    checklist.push({ id: `${day}-cleanup`, task: `Clean kitchen & organize fridge`, day, category: 'Cleanup' });
  });
  return checklist;
};

// Shared share/print helper
type ShareMethod = 'share' | 'link' | 'download' | 'print' | 'whatsapp' | 'email' | 'sms' | 'facebook' | 'instagram';
const shareContent = async (title: string, text: string, method: ShareMethod) => {
  const encoded = encodeURIComponent(text);
  const encodedTitle = encodeURIComponent(title);
  if (method === 'print') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:system-ui,sans-serif;padding:40px;max-width:700px;margin:0 auto;white-space:pre-wrap;line-height:1.6;font-size:14px}h1{font-size:20px;margin-bottom:20px}</style></head><body><h1>${title}</h1><pre>${text}</pre></body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
    return;
  }
  if (method === 'share') {
    try { if (navigator.share) { await navigator.share({ title, text }); return; } } catch {}
    await navigator.clipboard.writeText(text); toast('Copied to clipboard! 📋');
  } else if (method === 'link') {
    await navigator.clipboard.writeText(text); toast('Copied to clipboard! 📋');
  } else if (method === 'download') {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded! 📥');
  } else if (method === 'whatsapp') {
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  } else if (method === 'email') {
    window.open(`mailto:?subject=${encodedTitle}&body=${encoded}`, '_blank');
  } else if (method === 'sms') {
    window.open(`sms:?body=${encoded}`, '_blank');
  } else if (method === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encoded}`, '_blank');
  } else if (method === 'instagram') {
    await navigator.clipboard.writeText(text); toast('Copied! Paste into Instagram 📋');
  }
};

const PlannerScreen = () => {
  const navigate = useNavigate();
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [plan, setPlan] = useState({ ...defaultPlan });
  const [editing, setEditing] = useState<MealSlot | null>(null);
  const [mealSearch, setMealSearch] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [swapSource, setSwapSource] = useState<MealSlot | null>(null);
  const [moveTarget, setMoveTarget] = useState<MealSlot | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState<'weekly' | 'monthly' | 'checklist' | 'grocery' | null>(null);
  const [showGroceryPreview, setShowGroceryPreview] = useState(false);
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [showMonthlyPlan, setShowMonthlyPlan] = useState(false);
  const [showMealPrep, setShowMealPrep] = useState(false);
  const [monthlyCalendarMonth, setMonthlyCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Sunday week filter for checklist
  const getUpcomingSundays = () => {
    const sundays: Date[] = [];
    const today = new Date();
    let next = isSunday(today) ? today : nextSunday(today);
    for (let i = 0; i < 6; i++) {
      sundays.push(next);
      next = addDays(next, 7);
    }
    return sundays;
  };
  const upcomingSundays = useMemo(getUpcomingSundays, []);
  const [selectedPrepSunday, setSelectedPrepSunday] = useState<string>(() => format(upcomingSundays[0], 'yyyy-MM-dd'));

  // Drag and drop for custom tasks
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    setCustomTasks(prev => {
      const arr = [...prev];
      const [removed] = arr.splice(dragItem.current!, 1);
      arr.splice(dragOverItem.current!, 0, removed);
      return arr;
    });
    dragItem.current = null;
    dragOverItem.current = null;
  };
  const [selectedMonthDay, setSelectedMonthDay] = useState<number | null>(null);
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const [customTasks, setCustomTasks] = useState<PrepTask[]>([]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newTaskDay, setNewTaskDay] = useState('');

  const [mealPrepDays, setMealPrepDays] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fridgeiq_profile_prefs');
      if (saved) { const parsed = JSON.parse(saved); return parsed.mealPrepDays || ['Sun', 'Wed']; }
    } catch {}
    return ['Sun', 'Wed'];
  });

  useEffect(() => {
    const handler = () => {
      try {
        const saved = localStorage.getItem('fridgeiq_profile_prefs');
        if (saved) { const parsed = JSON.parse(saved); if (parsed.mealPrepDays) setMealPrepDays(parsed.mealPrepDays); }
      } catch {}
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Set default newTaskDay
  useEffect(() => {
    if (mealPrepDays.length > 0 && !newTaskDay) setNewTaskDay(mealPrepDays[0]);
  }, [mealPrepDays, newTaskDay]);

  const [monthlyPlan, setMonthlyPlan] = useState<Record<number, { breakfast: string; lunch: string; dinner: string }>>(() => {
    const mp: Record<number, { breakfast: string; lunch: string; dinner: string }> = {};
    const mealNames = meals.map(m => m.name);
    for (let d = 1; d <= 31; d++) {
      mp[d] = {
        breakfast: mealNames[Math.floor(Math.random() * mealNames.length)],
        lunch: mealNames[Math.floor(Math.random() * mealNames.length)],
        dinner: mealNames[Math.floor(Math.random() * mealNames.length)],
      };
    }
    return mp;
  });

  const monthGrid = useMemo(() => {
    const { year, month } = monthlyCalendarMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const cells: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthlyCalendarMonth]);

  const autoGroceryList = useMemo(() => {
    const fridgeSet = new Set(fridgeItems.map(fi => fi.name.toLowerCase()));
    const neededMap = new Map<string, { name: string; quantity: string; meals: string[] }>();
    days.forEach(day => {
      (['breakfast', 'lunch', 'dinner'] as const).forEach(type => {
        const mealName = plan[day][type];
        const found = meals.find(m => m.name === mealName);
        if (!found) return;
        found.detailedIngredients.forEach(ing => {
          const key = ing.name.toLowerCase();
          const inFridge = [...fridgeSet].some(fi => key.includes(fi) || fi.includes(key));
          if (!inFridge) {
            if (neededMap.has(key)) {
              const existing = neededMap.get(key)!;
              if (!existing.meals.includes(mealName)) existing.meals.push(mealName);
            } else {
              neededMap.set(key, { name: ing.name, quantity: ing.quantity, meals: [mealName] });
            }
          }
        });
      });
    });
    return Array.from(neededMap.values());
  }, [plan]);

  const generatedChecklist = useMemo(() => generateMealPrepChecklist(plan, mealPrepDays), [plan, mealPrepDays]);
  const allChecklist = useMemo(() => [...generatedChecklist, ...customTasks], [generatedChecklist, customTasks]);
  const totalTasks = allChecklist.length;
  const completedCount = allChecklist.filter(t => checkedTasks.has(t.id)).length;

  const toggleCheckTask = (id: string) => {
    setCheckedTasks(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const addCustomTask = () => {
    if (!newTaskInput.trim() || !newTaskDay) return;
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setCustomTasks(prev => [...prev, { id, task: newTaskInput.trim(), day: newTaskDay, category: 'Custom', custom: true }]);
    setNewTaskInput('');
    toast.success('Task added! ✅');
  };

  const removeCustomTask = (id: string) => {
    setCustomTasks(prev => prev.filter(t => t.id !== id));
    setCheckedTasks(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const moveTask = (id: string, direction: 'up' | 'down') => {
    setCustomTasks(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx < 0) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  const currentPlan = plan[selectedDay];

  const handleEdit = (day: string, type: 'breakfast' | 'lunch' | 'dinner') => { setEditing({ day, type }); setMealSearch(''); };
  const selectMeal = (mealName: string) => { if (!editing) return; setPlan(prev => ({ ...prev, [editing.day]: { ...prev[editing.day], [editing.type]: mealName } })); setEditing(null); };

  const startSwap = (day: string, type: 'breakfast' | 'lunch' | 'dinner') => {
    if (!swapSource) { setSwapSource({ day, type }); } else {
      const srcMeal = plan[swapSource.day][swapSource.type];
      const destMeal = plan[day][type];
      setPlan(prev => ({ ...prev, [swapSource.day]: { ...prev[swapSource.day], [swapSource.type]: destMeal }, [day]: { ...prev[day], [type]: srcMeal } }));
      setSwapSource(null);
    }
  };

  const startMove = (day: string, type: 'breakfast' | 'lunch' | 'dinner') => { setMoveTarget({ day, type }); setShowMoveModal(true); };

  const moveToDay = (targetDay: string, targetType: 'breakfast' | 'lunch' | 'dinner') => {
    if (!moveTarget) return;
    const srcMeal = plan[moveTarget.day][moveTarget.type];
    const destMeal = plan[targetDay][targetType];
    setPlan(prev => ({ ...prev, [moveTarget.day]: { ...prev[moveTarget.day], [moveTarget.type]: destMeal }, [targetDay]: { ...prev[targetDay], [targetType]: srcMeal } }));
    setMoveTarget(null); setShowMoveModal(false);
  };

  const filteredMeals = mealSearch.trim()
    ? meals.filter(m => m.name.toLowerCase().includes(mealSearch.toLowerCase()) || m.tags.some(t => t.toLowerCase().includes(mealSearch.toLowerCase())))
    : meals;

  const viewRecipe = (mealName: string) => { const found = meals.find(m => m.name === mealName); if (found) setSelectedMeal(found); };

  const regenerate = () => {
    const mealNames = meals.map(m => m.name);
    const newPlan: Record<string, { breakfast: string; lunch: string; dinner: string }> = {};
    days.forEach(day => { newPlan[day] = { breakfast: mealNames[Math.floor(Math.random() * mealNames.length)], lunch: mealNames[Math.floor(Math.random() * mealNames.length)], dinner: mealNames[Math.floor(Math.random() * mealNames.length)] }; });
    setPlan(newPlan);
  };

  const regenerateMonthly = () => {
    const mealNames = meals.map(m => m.name);
    const mp: Record<number, { breakfast: string; lunch: string; dinner: string }> = {};
    for (let d = 1; d <= 31; d++) { mp[d] = { breakfast: mealNames[Math.floor(Math.random() * mealNames.length)], lunch: mealNames[Math.floor(Math.random() * mealNames.length)], dinner: mealNames[Math.floor(Math.random() * mealNames.length)] }; }
    setMonthlyPlan(mp);
    toast.success('Monthly plan refreshed! 📆');
  };

  const regenerateChecklist = () => {
    setCheckedTasks(new Set());
    setCustomTasks([]);
    toast.success('Checklist reset! ✅');
  };

  const isSwapActive = (day: string, type: string) => swapSource?.day === day && swapSource?.type === type;

  // Text generators
  const getWeeklyPlanText = () => {
    let text = '🍽️ My Weekly Meal Plan\n\n';
    days.forEach(day => { text += `📅 ${day}\n  🌅 Breakfast: ${plan[day].breakfast}\n  ☀️ Lunch: ${plan[day].lunch}\n  🌙 Dinner: ${plan[day].dinner}\n\n`; });
    text += 'Generated with FridgeIQ 🧑‍🍳';
    return text;
  };

  const getMonthlyPlanText = () => {
    let text = `📆 Monthly Meal Plan: ${monthNames[monthlyCalendarMonth.month]} ${monthlyCalendarMonth.year}\n\n`;
    const daysInMonth = new Date(monthlyCalendarMonth.year, monthlyCalendarMonth.month + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const mp = monthlyPlan[d];
      if (mp) text += `Day ${d}\n  🌅 ${mp.breakfast}\n  ☀️ ${mp.lunch}\n  🌙 ${mp.dinner}\n\n`;
    }
    text += 'Generated with FridgeIQ 🧑‍🍳';
    return text;
  };

  const getChecklistText = () => {
    let text = '🧑‍🍳 Meal Prep Checklist\n\n';
    mealPrepDays.forEach(day => {
      const dayTasks = allChecklist.filter(t => t.day === day);
      if (dayTasks.length === 0) return;
      text += `📅 ${fullDayNames[day] || day}\n`;
      dayTasks.forEach(t => { text += `  ${checkedTasks.has(t.id) ? '✅' : '⬜'} ${t.task} [${t.category}]\n`; });
      text += '\n';
    });
    text += `Progress: ${completedCount}/${totalTasks}\nGenerated with FridgeIQ 🧑‍🍳`;
    return text;
  };

  const getGroceryText = () => {
    let text = '🛒 Grocery List (from Weekly Meal Plan)\n\n';
    if (autoGroceryList.length === 0) { text += 'You have everything! ✅\n'; }
    else { autoGroceryList.forEach(gi => { text += `• ${gi.name}: ${gi.quantity} (for: ${gi.meals.join(', ')})\n`; }); }
    text += `\n${autoGroceryList.length} items total\nGenerated with FridgeIQ 🧑‍🍳`;
    return text;
  };

  const getShareTitle = () => {
    if (showShareModal === 'weekly') return 'Weekly Meal Plan';
    if (showShareModal === 'monthly') return `Monthly Meal Plan: ${monthNames[monthlyCalendarMonth.month]}`;
    if (showShareModal === 'checklist') return 'Meal Prep Checklist';
    if (showShareModal === 'grocery') return 'Grocery List';
    return '';
  };

  const getShareText = () => {
    if (showShareModal === 'weekly') return getWeeklyPlanText();
    if (showShareModal === 'monthly') return getMonthlyPlanText();
    if (showShareModal === 'checklist') return getChecklistText();
    if (showShareModal === 'grocery') return getGroceryText();
    return '';
  };

  // Share/refresh button row component
  const ActionButtons = ({ onShare, onRefresh, showChevron, isOpen }: { onShare: () => void; onRefresh: () => void; showChevron?: boolean; isOpen?: boolean }) => (
    <div className="flex gap-1.5 items-center">
      <button onClick={(e) => { e.stopPropagation(); onShare(); }} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center active:scale-95 transition-transform" title="Share / Print">
        <Share2 className="w-3 h-3" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); onRefresh(); }} className="w-7 h-7 rounded-lg gradient-violet flex items-center justify-center active:scale-95 transition-transform shadow-glow" title="Refresh">
        <RefreshCw className="w-3 h-3 text-violet-foreground" />
      </button>
      {showChevron && <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
    </div>
  );

  return (
    <div className="px-5 pt-10 pb-24">
      {(() => { const t = getTabConfig('/planner'); return t ? <GreetingHeader tabTitle={t.label} tabDescription={t.description} tabIcon={t.icon} tabGradient={t.headerGradient} /> : null; })()}

      {/* Weekly Meal Plan — Collapsible */}
      <motion.div variants={item} className="mb-4">
        <button
          onClick={() => setShowWeeklyPlan(!showWeeklyPlan)}
          className="w-full glass-elevated p-4 flex items-center gap-3 active:scale-[0.98] transition-transform rounded-2xl"
        >
          <div className="w-10 h-10 rounded-xl gradient-violet flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-violet-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">{swapSource ? '🔄 Tap another meal to swap' : '📅 Weekly Meal Plan'}</p>
            <p className="text-xs text-muted-foreground">7-day plan with breakfast, lunch & dinner</p>
          </div>
          <div className="flex gap-1.5 items-center">
            {swapSource && (
              <button onClick={(e) => { e.stopPropagation(); setSwapSource(null); }} className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center active:scale-95 transition-transform">
                <X className="w-3 h-3 text-destructive" />
              </button>
            )}
            <ActionButtons onShare={() => setShowShareModal('weekly')} onRefresh={regenerate} showChevron isOpen={showWeeklyPlan} />
          </div>
        </button>

        <AnimatePresence>
          {showWeeklyPlan && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-3">
                <div className="glass-elevated rounded-2xl p-3 mb-5">
                  <div className="grid grid-cols-7 gap-1">
                    {days.map(day => (
                      <button key={day} onClick={() => setSelectedDay(day)}
                        className={`flex flex-col items-center py-2 rounded-xl transition-all ${selectedDay === day ? 'gradient-violet text-violet-foreground shadow-glow' : 'hover:bg-secondary'}`}>
                        <span className="text-[10px] font-medium opacity-70">{day}</span>
                        <span className="text-lg font-bold mt-0.5">
                          {(() => { const now = new Date(); const dayIdx = days.indexOf(day); const currentDayIdx = (now.getDay() + 6) % 7; const diff = dayIdx - currentDayIdx; const d = new Date(now); d.setDate(d.getDate() + diff); return d.getDate(); })()}
                        </span>
                        <div className="flex gap-0.5 mt-1">
                          {mealTypes.map(mt => (<span key={mt.key} className={`w-1.5 h-1.5 rounded-full ${selectedDay === day ? 'bg-primary-foreground/50' : 'bg-primary/40'}`} />))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{fullDayNames[selectedDay]}'s Meals</p>

                <motion.div variants={container} initial="hidden" animate="show" key={selectedDay} className="space-y-3">
                  {mealTypes.map(mt => (
                    <motion.div key={mt.key} variants={item}
                      className={`glass-elevated p-4 flex items-center gap-3 bg-gradient-to-r ${mt.gradient} rounded-2xl ${isSwapActive(selectedDay, mt.key) ? 'ring-2 ring-primary' : ''} ${swapSource && !isSwapActive(selectedDay, mt.key) ? 'cursor-pointer hover:ring-2 hover:ring-primary/50' : ''}`}
                      onClick={() => swapSource && !isSwapActive(selectedDay, mt.key) ? startSwap(selectedDay, mt.key) : undefined}>
                      <span className="text-2xl">{mt.emoji}</span>
                      <div className="flex-1 min-w-0" onClick={() => !swapSource && viewRecipe(currentPlan[mt.key])}>
                        <p className="text-[10px] uppercase font-semibold text-muted-foreground">{mt.label}</p>
                        <p className="text-sm font-semibold mt-0.5 cursor-pointer hover:text-primary transition-colors">{currentPlan[mt.key]}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={(e) => { e.stopPropagation(); startMove(selectedDay, mt.key); }} className="text-xs text-muted-foreground p-1.5 rounded-lg hover:bg-muted/50 active:scale-95 transition-all" title="Move"><GripVertical className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); startSwap(selectedDay, mt.key); }}
                          className={`text-xs p-1.5 rounded-lg active:scale-95 transition-all ${isSwapActive(selectedDay, mt.key) ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`} title="Swap">
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(selectedDay, mt.key); }} className="text-xs text-primary font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 active:scale-95 transition-transform">
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Monthly Meal Plan */}
      <motion.div variants={item} className="mb-4">
        <button onClick={() => setShowMonthlyPlan(!showMonthlyPlan)}
          className="w-full glass-elevated p-4 flex items-center gap-3 active:scale-[0.98] transition-transform rounded-2xl">
          <div className="w-10 h-10 rounded-xl gradient-violet flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-violet-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">📆 Monthly Meal Plan</p>
            <p className="text-xs text-muted-foreground">Monthly plan view with daily meals</p>
          </div>
          <ActionButtons onShare={() => setShowShareModal('monthly')} onRefresh={regenerateMonthly} showChevron isOpen={showMonthlyPlan} />
        </button>

        <AnimatePresence>
          {showMonthlyPlan && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-3 glass-elevated rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setMonthlyCalendarMonth(p => { const m = p.month - 1; return m < 0 ? { year: p.year - 1, month: 11 } : { ...p, month: m }; })} className="p-1.5 rounded-lg hover:bg-secondary active:scale-95 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-sm font-bold">{monthNames[monthlyCalendarMonth.month]} {monthlyCalendarMonth.year}</span>
                  <button onClick={() => setMonthlyCalendarMonth(p => { const m = p.month + 1; return m > 11 ? { year: p.year + 1, month: 0 } : { ...p, month: m }; })} className="p-1.5 rounded-lg hover:bg-secondary active:scale-95 transition-all"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {days.map(d => (<div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthGrid.map((day, i) => (
                    <button key={i} disabled={!day} onClick={() => day && setSelectedMonthDay(selectedMonthDay === day ? null : day)}
                      className={`aspect-square rounded-lg text-xs font-medium flex flex-col items-center justify-center transition-all ${!day ? 'invisible' : selectedMonthDay === day ? 'gradient-primary text-primary-foreground shadow-glow' : 'hover:bg-secondary text-foreground'}`}>
                      {day && (<><span className="font-bold">{day}</span><div className="flex gap-0.5 mt-0.5"><span className="w-1 h-1 rounded-full bg-warning/60" /><span className="w-1 h-1 rounded-full bg-info/60" /><span className="w-1 h-1 rounded-full bg-primary/60" /></div></>)}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {selectedMonthDay && monthlyPlan[selectedMonthDay] && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t border-border space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{monthNames[monthlyCalendarMonth.month]} {selectedMonthDay}'s Meals</p>
                        {mealTypes.map(mt => (
                          <div key={mt.key} className={`flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r ${mt.gradient}`}>
                            <span className="text-2xl">{mt.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] uppercase font-semibold text-muted-foreground">{mt.label}</p>
                              <p className="text-sm font-semibold mt-0.5">{monthlyPlan[selectedMonthDay][mt.key]}</p>
                            </div>
                            <button onClick={() => viewRecipe(monthlyPlan[selectedMonthDay!][mt.key])} className="text-xs text-primary font-medium px-2.5 py-1.5 rounded-lg bg-primary/10 active:scale-95 transition-transform">View</button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Meal Prep Checklist */}
      {mealPrepDays.length > 0 && (
        <motion.div variants={item} className="mb-4">
          <button onClick={() => setShowMealPrep(!showMealPrep)}
            className="w-full glass-elevated p-4 flex items-center gap-3 active:scale-[0.98] transition-transform rounded-2xl">
            <div className="w-10 h-10 rounded-xl gradient-violet flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5 text-violet-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">🧑‍🍳 Meal Prep Checklist</p>
              <p className="text-xs text-muted-foreground">
                Weekly checklist for the current week • {completedCount}/{totalTasks} done
              </p>
            </div>
            <ActionButtons onShare={() => setShowShareModal('checklist')} onRefresh={regenerateChecklist} showChevron isOpen={showMealPrep} />
          </button>

          <AnimatePresence>
            {showMealPrep && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-3 glass-elevated rounded-2xl p-4 space-y-4">

                  {/* Sunday week filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-[hsl(var(--violet))]" />
                    <p className="text-xs font-semibold text-foreground">Prepping for week of:</p>
                    <select value={selectedPrepSunday} onChange={e => setSelectedPrepSunday(e.target.value)}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-secondary text-foreground outline-none border border-border appearance-none cursor-pointer">
                      {upcomingSundays.map(sun => (
                        <option key={format(sun, 'yyyy-MM-dd')} value={format(sun, 'yyyy-MM-dd')}>
                          Sunday, {format(sun, 'MMM d')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold text-foreground">Progress</p>
                      <p className="text-xs font-bold text-[hsl(var(--violet))]">{totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0}%</p>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} className="h-full gradient-violet rounded-full" />
                    </div>
                  </div>

                  {/* Add custom task */}
                  <div className="p-3 rounded-xl bg-secondary/60 space-y-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Plus className="w-3.5 h-3.5 text-[hsl(var(--violet))]" /> Add Custom Step</p>
                    <div className="flex gap-2">
                      <select value={newTaskDay} onChange={e => setNewTaskDay(e.target.value)}
                        className="text-xs bg-secondary rounded-lg px-2 py-2 outline-none border border-border appearance-none cursor-pointer min-w-[70px]">
                        {mealPrepDays.map(d => (<option key={d} value={d}>{d}</option>))}
                      </select>
                      <input value={newTaskInput} onChange={e => setNewTaskInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomTask()}
                        placeholder="e.g. Marinate chicken overnight" maxLength={100}
                        className="flex-1 min-w-0 text-xs bg-secondary rounded-lg px-2.5 py-2 outline-none placeholder:text-muted-foreground" />
                      <button onClick={addCustomTask} disabled={!newTaskInput.trim()}
                        className="gradient-violet text-violet-foreground px-3 py-2 rounded-lg text-xs font-semibold shrink-0 disabled:opacity-40">
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Tasks grouped by day */}
                  {mealPrepDays.map(day => {
                    const dayGenerated = generatedChecklist.filter(t => t.day === day);
                    const dayCustom = customTasks.filter(t => t.day === day);
                    const dayTasks = [...dayGenerated, ...dayCustom];
                    if (dayTasks.length === 0) return null;
                    return (
                      <div key={day}>
                        <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                          📅 {fullDayNames[day] || day}
                          <span className="text-[10px] font-normal text-muted-foreground">
                            ({dayTasks.filter(t => checkedTasks.has(t.id)).length}/{dayTasks.length})
                          </span>
                        </p>
                        <div className="space-y-1.5">
                          {dayTasks.map((task, i) => (
                            <motion.div key={task.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                              draggable={!!task.custom}
                              onDragStart={() => { const customIdx = customTasks.findIndex(t => t.id === task.id); handleDragStart(customIdx); }}
                              onDragEnter={() => { const customIdx = customTasks.findIndex(t => t.id === task.id); if (customIdx >= 0) handleDragEnter(customIdx); }}
                              onDragEnd={handleDragEnd}
                              onDragOver={e => e.preventDefault()}
                              className={`w-full flex items-center gap-2 p-2.5 rounded-xl transition-all ${task.custom ? 'cursor-grab active:cursor-grabbing' : ''} ${checkedTasks.has(task.id) ? 'bg-[hsl(var(--violet))]/10' : 'bg-secondary/60'}`}>
                              {task.custom && (
                                <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              )}
                              <button onClick={() => toggleCheckTask(task.id)} className="shrink-0">
                                {checkedTasks.has(task.id) ? <CheckSquare className="w-4 h-4 text-[hsl(var(--violet))]" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium ${checkedTasks.has(task.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.task}</p>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
                                task.category === 'Shopping' ? 'bg-warning/15 text-warning' :
                                task.category === 'Planning' ? 'bg-[hsl(var(--violet))]/15 text-[hsl(var(--violet))]' :
                                task.category === 'Cleanup' ? 'bg-destructive/15 text-destructive' :
                                task.category === 'Custom' ? 'bg-[hsl(var(--violet))]/15 text-[hsl(var(--violet))]' :
                                'bg-[hsl(var(--violet))]/10 text-[hsl(var(--violet))]'
                              }`}>{task.category}</span>
                              {task.custom && (
                                <button onClick={() => removeCustomTask(task.id)} className="p-1 rounded hover:bg-destructive/10 active:scale-90 transition-all shrink-0"><Trash2 className="w-3 h-3 text-destructive" /></button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Grocery List — Collapsible with share/refresh */}
      <motion.div variants={item} className="mb-4">
        <button onClick={() => setShowGroceryPreview(!showGroceryPreview)}
          className="w-full glass-elevated p-4 flex items-center gap-3 active:scale-[0.98] transition-transform rounded-2xl">
          <div className="w-10 h-10 rounded-xl gradient-violet flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5 text-violet-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">🛒 Grocery List</p>
            <p className="text-xs text-muted-foreground">{autoGroceryList.length} items needed based on weekly plan</p>
          </div>
          <ActionButtons
            onShare={() => setShowShareModal('grocery')}
            onRefresh={() => toast.success('Grocery list updated from weekly plan! 🛒')}
            showChevron isOpen={showGroceryPreview}
          />
        </button>

        <AnimatePresence>
          {showGroceryPreview && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="mt-3 glass-elevated rounded-2xl p-4 space-y-2">
                {autoGroceryList.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-3xl mb-2">✅</p>
                    <p className="text-sm font-semibold">You have everything!</p>
                    <p className="text-xs text-muted-foreground">All meal plan ingredients are in your fridge</p>
                  </div>
                ) : autoGroceryList.map((gi, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-secondary/60">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5"><ShoppingCart className="w-3.5 h-3.5 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{gi.name}</p>
                      <p className="text-[10px] text-muted-foreground">{gi.quantity}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {gi.meals.map(m => (<span key={m} className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">{m}</span>))}
                      </div>
                    </div>
                  </div>
                ))}
                {autoGroceryList.length > 0 && (
                  <button onClick={() => navigate('/grocery')} className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform shadow-glow mt-2">
                    Go to Full Grocery List
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Unified Share/Print Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowShareModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-elevated overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold flex items-center gap-2"><Share2 className="w-4 h-4 text-[hsl(var(--violet))]" /> Share {getShareTitle()}</h3>
                <button onClick={() => setShowShareModal(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto">
                {/* Quick share icons row */}
                <div className="grid grid-cols-5 gap-2 pb-3 border-b border-border mb-2">
                  {[
                    { method: 'whatsapp' as ShareMethod, label: 'WhatsApp', emoji: '💬', bg: 'bg-[#25D366]/15 text-[#25D366]' },
                    { method: 'email' as ShareMethod, label: 'Email', icon: Mail, bg: 'bg-info/15 text-info' },
                    { method: 'sms' as ShareMethod, label: 'Messages', icon: MessageCircle, bg: 'bg-success/15 text-success' },
                    { method: 'facebook' as ShareMethod, label: 'Facebook', emoji: '📘', bg: 'bg-[#1877F2]/15 text-[#1877F2]' },
                    { method: 'instagram' as ShareMethod, label: 'Instagram', emoji: '📷', bg: 'bg-[#E4405F]/15 text-[#E4405F]' },
                  ].map(opt => (
                    <button key={opt.method} onClick={() => { shareContent(getShareTitle(), getShareText(), opt.method); setShowShareModal(null); }}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-secondary active:scale-95 transition-all">
                      <div className={`w-10 h-10 rounded-full ${opt.bg} flex items-center justify-center`}>
                        {opt.emoji ? <span className="text-lg">{opt.emoji}</span> : opt.icon && <opt.icon className="w-4.5 h-4.5" />}
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{opt.label}</span>
                    </button>
                  ))}
                </div>

                <button onClick={() => { shareContent(getShareTitle(), getShareText(), 'share'); setShowShareModal(null); }} className="w-full bg-secondary/60 hover:bg-secondary p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left rounded-xl">
                  <div className="w-9 h-9 rounded-lg gradient-violet flex items-center justify-center shrink-0"><Send className="w-4 h-4 text-violet-foreground" /></div>
                  <div><p className="text-sm font-semibold">Share via Device</p><p className="text-[11px] text-muted-foreground">Use your device's share menu</p></div>
                </button>
                <button onClick={() => { shareContent(getShareTitle(), getShareText(), 'link'); setShowShareModal(null); }} className="w-full bg-secondary/60 hover:bg-secondary p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left rounded-xl">
                  <div className="w-9 h-9 rounded-lg gradient-violet flex items-center justify-center shrink-0"><Link2 className="w-4 h-4 text-violet-foreground" /></div>
                  <div><p className="text-sm font-semibold">Copy to Clipboard</p><p className="text-[11px] text-muted-foreground">Copy as text</p></div>
                </button>
                <button onClick={() => { shareContent(getShareTitle(), getShareText(), 'download'); setShowShareModal(null); }} className="w-full bg-secondary/60 hover:bg-secondary p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left rounded-xl">
                  <div className="w-9 h-9 rounded-lg gradient-violet flex items-center justify-center shrink-0"><Download className="w-4 h-4 text-violet-foreground" /></div>
                  <div><p className="text-sm font-semibold">Download as File</p><p className="text-[11px] text-muted-foreground">Save as .txt file</p></div>
                </button>
                <button onClick={() => { shareContent(getShareTitle(), getShareText(), 'print'); setShowShareModal(null); }} className="w-full bg-secondary/60 hover:bg-secondary p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left rounded-xl">
                  <div className="w-9 h-9 rounded-lg gradient-violet flex items-center justify-center shrink-0"><Printer className="w-4 h-4 text-violet-foreground" /></div>
                  <div><p className="text-sm font-semibold">Print</p><p className="text-[11px] text-muted-foreground">Open print dialog</p></div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Meal Picker */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setEditing(null)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="absolute inset-x-0 bottom-0 max-h-[75vh] bg-card rounded-t-3xl border-t border-border overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-5 pt-4 pb-3 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold">Choose {editing.type} for {editing.day}</h3>
                  <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search meals..." value={mealSearch} onChange={e => setMealSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary text-sm border-none outline-none focus:ring-2 focus:ring-primary/30" autoFocus />
                </div>
                {mealSearch.trim() && (
                  <div className="flex gap-2 mt-2">
                    {recipeCards.map(card => (
                      <button key={card.name} onClick={() => window.open(card.url(mealSearch), '_blank', 'noopener,noreferrer')} className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary flex items-center gap-1 active:scale-95 transition-transform">
                        <Globe className="w-3 h-3" /> {card.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="overflow-y-auto max-h-[50vh] p-3 space-y-2">
                {filteredMeals.map(m => (
                  <button key={m.id} onClick={() => selectMeal(m.name)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 active:scale-[0.98] transition-all text-left">
                    <img src={m.photoUrl} alt={m.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.time} · {m.calories} cal · {m.cuisine}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move to day modal */}
      <AnimatePresence>
        {showMoveModal && moveTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => { setShowMoveModal(false); setMoveTarget(null); }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="absolute inset-x-0 bottom-0 bg-card rounded-t-3xl border-t border-border overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-5 pt-4 pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold">Move "{plan[moveTarget.day][moveTarget.type]}" to...</h3>
                  <button onClick={() => { setShowMoveModal(false); setMoveTarget(null); }} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                {days.map(day => (
                  <div key={day}>
                    <p className="text-xs font-bold text-muted-foreground mb-1.5">{day}</p>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {mealTypes.map(mt => (
                        <button key={mt.key} onClick={() => moveToDay(day, mt.key)} disabled={day === moveTarget.day && mt.key === moveTarget.type}
                          className={`p-2.5 rounded-xl text-left transition-all ${day === moveTarget.day && mt.key === moveTarget.type ? 'opacity-30 cursor-not-allowed bg-muted' : 'hover:bg-primary/10 active:scale-[0.98] bg-secondary'}`}>
                          <span className="text-sm">{mt.emoji}</span>
                          <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{mt.label}</p>
                          <p className="text-[11px] font-semibold truncate mt-0.5">{plan[day][mt.key]}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedMeal && <RecipeDetail meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
    </div>
  );
};

export default PlannerScreen;
