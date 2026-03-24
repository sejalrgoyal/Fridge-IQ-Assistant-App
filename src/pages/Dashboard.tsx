import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen, ChevronDown, MapPin, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GreetingHeader from '@/components/GreetingHeader';
import { tabConfigs } from '@/data/tabConfig';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemAnim = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const HOW_TO_STEPS = [
  {
    emoji: '📋',
    title: '1. Start with the Food Quiz',
    desc: 'Go to the Quiz tab and answer 8 questions about your diet, allergies, cooking skill level, available cooking time, budget, and health goals. Every other feature adapts to your answers including recipe filters, grocery prices, and nutrition goals.',
    path: '/food-quiz',
  },
  {
    emoji: '📸',
    title: '2. Scan or add items to your fridge',
    desc: 'Open the Fridge tab and tap the camera button to photograph your open fridge. AI detects food items and estimates their expiry dates automatically. You can also add items manually, scan barcodes, or tap the pencil icon to edit any item and update its name, quantity, storage location, or expiry date.',
    path: '/scan',
  },
  {
    emoji: '🍽️',
    title: '3. Browse personalised meal suggestions',
    desc: 'The Meals tab shows recipes filtered to your diet and sorted by how many ingredients you already own. Each recipe card shows ingredient availability at a glance. Tap a recipe to see the full instructions, a serving size scaler that recalculates all quantities and calories, and a full nutrition breakdown.',
    path: '/meals',
  },
  {
    emoji: '📅',
    title: '4. Plan your meals for the week',
    desc: 'The Planner tab has a weekly and monthly calendar. Assign breakfast, lunch, and dinner for each day. Swap meals between days, auto-fill the whole week with one tap, or move individual meals. Tap "Generate Grocery List" to instantly turn your week plan into a ready-to-shop list.',
    path: '/planner',
  },
  {
    emoji: '🛒',
    title: '5. Shop smarter with the Grocery List',
    desc: 'After setting your location the Grocery tab shows estimated prices at nearby stores. Items already in your fridge show a green "In Fridge" badge so you never buy duplicates. Tap the "Restock" button on the Fridge tab to automatically move expiring items onto the grocery list.',
    path: '/grocery',
  },
  {
    emoji: '🛡️',
    title: '6. Check any product for health info',
    desc: 'The Health Scanner tab lets you scan a barcode or type any product name to get a nutritional breakdown, ingredient list, and health rating. Useful when checking packaged foods at home or while shopping.',
    path: '/health-scan',
  },
  {
    emoji: '♻️',
    title: '7. Log used and wasted items',
    desc: 'When you delete a fridge item a dialog asks whether you used it or it went to waste. Tap "I Used It" to log a positive outcome. Over time this builds your personal waste rate and unlocks achievement badges as your habits improve.',
    path: '/scan',
  },
  {
    emoji: '🏆',
    title: '8. Track your achievements',
    desc: 'Open the Achievements tab to see all badges, your current level, XP points, and progress toward each badge. Badges unlock automatically as you use the app.',
    path: '/achievements',
  },
  {
    emoji: '👤',
    title: '9. Manage your profile and settings',
    desc: 'The Profile tab lets you edit personal details, adjust daily nutrition goals, edit activity stats, change dietary preferences, set meal prep days, and enable push notifications for expiring items.',
    path: '/profile',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showHowTo, setShowHowTo] = useState(false);

  const startTour = () => window.dispatchEvent(new Event('fridgeiq-start-tour'));

  const [showWeeklyNutrition, setShowWeeklyNutrition] = useState(false);
  const weeklyNutrition = useMemo(() => {
    try {
      const history: { date: string; protein: number; calories: number; fiber: number }[] =
        JSON.parse(localStorage.getItem('fridgeiq_nutrition_history') || '[]');
      const goals: { protein: number; calories: number; fiber: number } =
        JSON.parse(localStorage.getItem('fridgeiq_nutrition_goals') || '{"protein":120,"calories":2200,"fiber":25}');

      const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const entry = history.find(h => h.date === dateStr);
        return { date: dateStr, label: d.toLocaleDateString('en', { weekday: 'short' }), ...(entry ?? { protein: 0, calories: 0, fiber: 0 }) };
      }).reverse();

      const avg = {
        protein:  Math.round(last7.reduce((s, d) => s + d.protein,  0) / 7),
        calories: Math.round(last7.reduce((s, d) => s + d.calories, 0) / 7),
        fiber:    Math.round(last7.reduce((s, d) => s + d.fiber,    0) / 7),
      };
      const daysGoalMet = {
        protein:  last7.filter(d => d.protein  >= goals.protein).length,
        calories: last7.filter(d => d.calories >= goals.calories * 0.85 && d.calories <= goals.calories * 1.1).length,
        fiber:    last7.filter(d => d.fiber    >= goals.fiber).length,
      };

      return { last7, avg, goals, daysGoalMet };
    } catch {
      return null;
    }
  }, [showWeeklyNutrition]);

  return (
    <div className="px-4 sm:px-5 pt-8 pb-6">

      {/* Greeting */}
      <motion.div variants={itemAnim} initial="hidden" animate="show" className="mb-1">
        <GreetingHeader onAvatarClick={() => navigate('/profile')} />
      </motion.div>

      <motion.div variants={container} initial="hidden" animate="show">

        {/* How to Use collapsible */}
        <motion.div variants={itemAnim} className="mb-4 glass-elevated rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowHowTo(v => !v)}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <div className="w-8 h-8 rounded-xl gradient-violet flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">How to Use FridgeIQ</p>
              <p className="text-[11px] text-muted-foreground">9-step guide to every feature</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showHowTo ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {showHowTo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2.5">
                  <p className="text-[11px] text-muted-foreground">Tap any step to open that feature directly.</p>
                  {HOW_TO_STEPS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(s.path)}
                      className="w-full flex items-start gap-3 bg-secondary/40 rounded-2xl p-3 text-left active:scale-[0.98] transition-transform"
                    >
                      <div className="w-9 h-9 rounded-xl bg-card flex items-center justify-center text-xl shrink-0 border border-border/50 mt-0.5">
                        {s.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold mb-0.5">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Guided Tour card */}
        <motion.div variants={itemAnim} className="mb-4">
          <button
            onClick={startTour}
            className="w-full glass-elevated rounded-2xl p-4 flex items-center gap-4 text-left active:scale-[0.98] transition-transform group"
          >
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shrink-0 shadow-glow">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">Take the Guided Tour</p>
              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                Interactive walkthrough of every tab. Tap each highlighted section to move forward.
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>

        {/* Weekly Nutrition Summary */}
        <motion.div variants={itemAnim} className="mb-4 glass-elevated rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowWeeklyNutrition(v => !v)}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <div className="w-8 h-8 rounded-xl gradient-warm flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Weekly Nutrition</p>
              <p className="text-[11px] text-muted-foreground">
                {weeklyNutrition
                  ? `Protein goal met ${weeklyNutrition.daysGoalMet.protein}/7 days this week`
                  : 'Track your daily intake in Profile'}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${showWeeklyNutrition ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {showWeeklyNutrition && weeklyNutrition && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {/* Avg stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { label: 'Avg Protein', val: `${weeklyNutrition.avg.protein}g`, goal: `${weeklyNutrition.goals.protein}g`, pct: Math.min(100, (weeklyNutrition.avg.protein / weeklyNutrition.goals.protein) * 100), bar: 'gradient-teal',  days: weeklyNutrition.daysGoalMet.protein },
                      { label: 'Avg Calories', val: weeklyNutrition.avg.calories.toLocaleString(), goal: weeklyNutrition.goals.calories.toLocaleString(), pct: Math.min(100, (weeklyNutrition.avg.calories / weeklyNutrition.goals.calories) * 100), bar: 'gradient-amber', days: weeklyNutrition.daysGoalMet.calories },
                      { label: 'Avg Fiber', val: `${weeklyNutrition.avg.fiber}g`, goal: `${weeklyNutrition.goals.fiber}g`, pct: Math.min(100, (weeklyNutrition.avg.fiber / weeklyNutrition.goals.fiber) * 100), bar: 'gradient-info',  days: weeklyNutrition.daysGoalMet.fiber },
                    ]).map(n => (
                      <div key={n.label} className="bg-secondary/50 rounded-xl p-2.5 text-center">
                        <p className="text-[9px] text-muted-foreground font-medium">{n.label}</p>
                        <p className="text-sm font-bold mt-0.5">{n.val}</p>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${n.pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full ${n.bar} rounded-full`}
                          />
                        </div>
                        <p className="text-[8px] text-muted-foreground mt-1">goal: {n.goal}</p>
                        <p className="text-[8px] font-semibold text-primary mt-0.5">{n.days}/7 days</p>
                      </div>
                    ))}
                  </div>

                  {/* 7-day bar chart for calories */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Daily Calories (last 7 days)</p>
                    <div className="flex items-end gap-1 h-16">
                      {weeklyNutrition.last7.map(day => {
                        const pct = weeklyNutrition.goals.calories > 0
                          ? Math.min(100, (day.calories / weeklyNutrition.goals.calories) * 100)
                          : 0;
                        const isToday = day.date === new Date().toISOString().split('T')[0];
                        return (
                          <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5">
                            <div className="w-full flex flex-col justify-end" style={{ height: 48 }}>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(pct, pct > 0 ? 8 : 0)}%` }}
                                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
                                className={`w-full rounded-t-sm ${isToday ? 'gradient-amber' : 'bg-secondary'}`}
                                style={{ minHeight: pct > 0 ? 4 : 0 }}
                              />
                            </div>
                            <span className={`text-[8px] font-medium ${isToday ? 'text-amber-500' : 'text-muted-foreground'}`}>{day.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-[8px] text-muted-foreground">goal: {weeklyNutrition.goals.calories.toLocaleString()} cal</span>
                    </div>
                  </div>

                  <button onClick={() => navigate('/profile')} className="w-full text-[11px] font-semibold text-primary py-2 rounded-xl bg-primary/8 active:scale-[0.98] transition-transform">
                    Update today's intake in Profile
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* All Features */}
        <motion.div variants={itemAnim} className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2.5 px-0.5">All Features</h2>
          <div className="space-y-2">
            {tabConfigs.map(box => (
              <motion.button
                key={box.path}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(box.path)}
                className="w-full glass-elevated p-3.5 flex items-center gap-3 text-left rounded-2xl active:scale-[0.98] transition-transform"
              >
                <div className={`w-10 h-10 rounded-xl ${box.gradient} flex items-center justify-center shrink-0`}>
                  <box.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{box.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{box.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemAnim} className="flex items-center justify-center gap-2 py-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] text-muted-foreground font-medium">All data saved locally on your device</p>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
