import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Leaf, Flame, Package, Recycle, ShoppingBag, CalendarCheck, Lock, MapPin } from 'lucide-react';
import { fridgeItems as defaultFridgeItems } from '@/data/mockData';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

// ── Level system ──────────────────────────────────────────────────────────────
const LEVELS = [
  { min: 0,   label: 'Novice',     emoji: '🌱', color: 'text-emerald-500',  bg: 'bg-emerald-500/10',  ring: 'border-emerald-400' },
  { min: 50,  label: 'Explorer',   emoji: '🔍', color: 'text-sky-500',      bg: 'bg-sky-500/10',      ring: 'border-sky-400' },
  { min: 120, label: 'Cook',       emoji: '🍳', color: 'text-amber-500',    bg: 'bg-amber-500/10',    ring: 'border-amber-400' },
  { min: 250, label: 'Chef',       emoji: '👨‍🍳', color: 'text-orange-500',  bg: 'bg-orange-500/10',   ring: 'border-orange-400' },
  { min: 450, label: 'Master',     emoji: '🌟', color: 'text-violet-500',   bg: 'bg-violet-500/10',   ring: 'border-violet-400' },
];

const getLevel = (xp: number) => {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return { ...LEVELS[i], idx: i, nextMin: LEVELS[i + 1]?.min ?? null };
  }
  return { ...LEVELS[0], idx: 0, nextMin: LEVELS[1]?.min ?? null };
};

// ── Badge definitions ─────────────────────────────────────────────────────────
interface BadgeDef {
  id: string; emoji: string; label: string; desc: string; how: string;
  category: 'starter' | 'eco' | 'cook' | 'shop';
  icon: React.ElementType; gradient: string; xp: number;
  check: (d: AchievData) => { unlocked: boolean; progress: number; goal: number };
}

interface AchievData {
  fridgeLen: number; usedCount: number; wastedCount: number;
  hasQuiz: boolean; hasMealPlan: boolean; hasGrocery: boolean; streakDays: number;
  hasTourDone: boolean;
}

const BADGES: BadgeDef[] = [
  {
    id: 'tour-done',   emoji: '🗺️', label: 'Guided Tour', category: 'starter',
    desc: 'You know your way around FridgeIQ!',
    how: 'Complete the guided tour from the Home screen.',
    icon: MapPin, gradient: 'gradient-violet', xp: 15,
    check: d => ({ unlocked: d.hasTourDone, progress: d.hasTourDone ? 1 : 0, goal: 1 }),
  },
  {
    id: 'quiz-done',   emoji: '🎯', label: 'Food Quiz', category: 'starter',
    desc: 'FridgeIQ is now personalized for your lifestyle.',
    how: 'Complete the Food Quiz.',
    icon: Star, gradient: 'gradient-info', xp: 30,
    check: d => ({ unlocked: d.hasQuiz, progress: d.hasQuiz ? 1 : 0, goal: 1 }),
  },
  {
    id: 'first-scan',  emoji: '📸', label: 'First Scan', category: 'starter',
    desc: 'Your fridge is officially smart.',
    how: 'Add at least 1 item to your fridge.',
    icon: Flame, gradient: 'gradient-coral', xp: 20,
    check: d => ({ unlocked: d.fridgeLen >= 1, progress: Math.min(d.fridgeLen, 1), goal: 1 }),
  },
  {
    id: 'stocked',     emoji: '📦', label: 'Stocked Up', category: 'starter',
    desc: 'A well-stocked kitchen is a happy kitchen.',
    how: 'Have 10 or more items in your fridge at the same time.',
    icon: Package, gradient: 'gradient-teal', xp: 40,
    check: d => ({ unlocked: d.fridgeLen >= 10, progress: Math.min(d.fridgeLen, 10), goal: 10 }),
  },
  {
    id: 'eco-start',   emoji: '🌿', label: 'Zero Waste Start', category: 'eco',
    desc: 'Small steps lead to big changes.',
    how: 'Mark 5 items as "I Used It" when deleting.',
    icon: Leaf, gradient: 'gradient-teal', xp: 50,
    check: d => ({ unlocked: d.usedCount >= 5, progress: Math.min(d.usedCount, 5), goal: 5 }),
  },
  {
    id: 'eco-champ',   emoji: '🔥', label: 'Waste Warrior', category: 'eco',
    desc: 'Your kitchen habits are inspiring.',
    how: 'Mark 10 items as "I Used It" in total.',
    icon: Flame, gradient: 'gradient-amber', xp: 80,
    check: d => ({ unlocked: d.usedCount >= 10, progress: Math.min(d.usedCount, 10), goal: 10 }),
  },
  {
    id: 'eco-star',    emoji: '♻️', label: 'Eco Star', category: 'eco',
    desc: 'More used than wasted. The planet thanks you!',
    how: 'Have more items logged as "Used" than "Wasted" (at least 1 used).',
    icon: Recycle, gradient: 'gradient-teal', xp: 60,
    check: d => ({ unlocked: d.usedCount > 0 && d.usedCount > d.wastedCount, progress: d.usedCount > 0 && d.usedCount > d.wastedCount ? 1 : 0, goal: 1 }),
  },
  {
    id: 'streak-3',    emoji: '⚡', label: '3-Day Streak', category: 'eco',
    desc: 'Three days in a row? Habit forming!',
    how: 'Open the app on 3 consecutive days.',
    icon: Zap, gradient: 'gradient-amber', xp: 35,
    check: d => ({ unlocked: d.streakDays >= 3, progress: Math.min(d.streakDays, 3), goal: 3 }),
  },
  {
    id: 'meal-plan',   emoji: '🧑‍🍳', label: 'Meal Planner', category: 'cook',
    desc: 'Planning ahead keeps grocery bills low.',
    how: 'Save at least one weekly meal plan in the Planner tab.',
    icon: CalendarCheck, gradient: 'gradient-violet', xp: 45,
    check: d => ({ unlocked: d.hasMealPlan, progress: d.hasMealPlan ? 1 : 0, goal: 1 }),
  },
  {
    id: 'grocery',     emoji: '🛒', label: 'Smart Shopper', category: 'shop',
    desc: 'Never overbuy again.',
    how: 'Add items to your Grocery List.',
    icon: ShoppingBag, gradient: 'gradient-info', xp: 25,
    check: d => ({ unlocked: d.hasGrocery, progress: d.hasGrocery ? 1 : 0, goal: 1 }),
  },
];

const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  starter: { label: 'Getting Started', emoji: '🚀', color: 'text-sky-500' },
  eco:     { label: 'Eco & Waste',     emoji: '🌿', color: 'text-emerald-500' },
  cook:    { label: 'Cooking',         emoji: '🍳', color: 'text-amber-500' },
  shop:    { label: 'Shopping',        emoji: '🛒', color: 'text-violet-500' },
};

// ── Motivational quotes ───────────────────────────────────────────────────────
const QUOTES = [
  'Every saved ingredient is a small victory. 🌱',
  'The best fridge is an organized fridge. 📦',
  'Waste less, enjoy more. ♻️',
  'Great chefs plan ahead. 📅',
  'Your habits are changing the planet. 🌍',
];

// ── Component ─────────────────────────────────────────────────────────────────
const AchievementsScreen = () => {

  const data = useMemo<AchievData>(() => {
    const fridgeItems = (() => { try { return JSON.parse(localStorage.getItem('fridgeiq_fridge_items') || '[]'); } catch { return []; } })();
    const wasteLog: { action: string }[] = (() => { try { return JSON.parse(localStorage.getItem('fridgeiq_waste_log') || '[]'); } catch { return []; } })();
    const streakDays = (() => { try { return parseInt(localStorage.getItem('fridgeiq_streak') || '0'); } catch { return 0; } })();
    return {
      fridgeLen:    fridgeItems.length,
      usedCount:    wasteLog.filter(w => w.action === 'used').length,
      wastedCount:  wasteLog.filter(w => w.action === 'wasted').length,
      hasQuiz:      !!localStorage.getItem('fridgeiq_prefs'),
      hasMealPlan:  !!localStorage.getItem('fridgeiq_meal_plan'),
      hasGrocery:   !!localStorage.getItem('fridgeiq_grocery_items'),
      hasTourDone:  !!localStorage.getItem('fridgeiq_tour_done'),
      streakDays,
    };
  }, []);

  const wasteLog: { action: string; name?: string; date?: string }[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('fridgeiq_waste_log') || '[]').slice().reverse().slice(0, 20); }
    catch { return []; }
  }, []);

  // Compute badge statuses
  const badges = useMemo(() =>
    BADGES.map(b => ({ ...b, ...b.check(data) })),
    [data]
  );

  const totalXP = badges.filter(b => b.unlocked).reduce((s, b) => s + b.xp, 0);
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const lvl = getLevel(totalXP);
  const xpToNext = lvl.nextMin ? lvl.nextMin - totalXP : 0;
  const xpPct = lvl.nextMin
    ? Math.round(((totalXP - lvl.min) / (lvl.nextMin - lvl.min)) * 100)
    : 100;

  const quote = QUOTES[unlockedCount % QUOTES.length];

  // Group badges by category
  const categories = Array.from(new Set(BADGES.map(b => b.category)));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 sm:px-5 pt-8 pb-6">

      {/* ── Page header (rounded rectangle, gradient) ─────────────── */}
      <motion.div variants={fadeUp} className="relative rounded-3xl overflow-hidden mb-4 p-5 sm:p-6" style={{ background: 'var(--gradient-gold)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
        <div className="relative">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground">Achievements</h1>
              <p className="text-xs text-primary-foreground/70 mt-0.5">Track XP, unlock badges, and level up</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl bg-card/25 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-primary-foreground/30 shrink-0`}>
              <span className="text-2xl">{lvl.emoji}</span>
              <span className="text-[9px] font-bold text-primary-foreground/75 mt-0.5 leading-none">{lvl.label}</span>
            </div>
          </div>
          {/* XP row */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-lg font-bold text-primary-foreground">{totalXP} XP</span>
            <span className="text-xs text-primary-foreground/70">{unlockedCount}/{badges.length} badges</span>
          </div>
          <div className="w-full h-2.5 bg-primary-foreground/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="h-full bg-primary-foreground rounded-full"
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-primary-foreground/60">{lvl.label}</span>
            {lvl.nextMin && <span className="text-[9px] text-primary-foreground/60">{xpToNext} XP to {LEVELS[lvl.idx + 1]?.label}</span>}
          </div>
        </div>
      </motion.div>

      {/* ── Level road ──────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="glass-elevated rounded-2xl p-4 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Level Progress</p>
        <div className="flex items-center gap-1">
          {LEVELS.map((lv, i) => {
            const reached = totalXP >= lv.min;
            const isCurrent = lvl.idx === i;
            return (
              <div key={lv.label} className="flex items-center flex-1">
                <div className={`relative flex flex-col items-center flex-1`}>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
                      reached
                        ? `${lv.bg} ${lv.ring} shadow-sm`
                        : 'bg-secondary border-border opacity-40'
                    } ${isCurrent ? 'ring-2 ring-offset-1 ring-primary scale-110' : ''}`}
                  >
                    <span className="text-lg leading-none">{lv.emoji}</span>
                  </motion.div>
                  <p className={`text-[8px] font-semibold mt-1 leading-none ${reached ? lv.color : 'text-muted-foreground'}`}>{lv.label}</p>
                  <p className="text-[7px] text-muted-foreground">{lv.min} XP</p>
                </div>
                {i < LEVELS.length - 1 && (
                  <div className={`h-0.5 w-3 rounded-full mx-0.5 mb-3 ${totalXP >= LEVELS[i + 1].min ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Motivational quote ────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="mb-4 px-1">
        <p className="text-xs text-center text-muted-foreground italic">{quote}</p>
      </motion.div>

      {/* ── Stats row ─────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2.5 mb-5">
        {[
          { label: 'Items Used', value: data.usedCount,   emoji: '✅', color: 'text-emerald-500' },
          { label: 'Items Wasted', value: data.wastedCount, emoji: '🗑️', color: 'text-rose-500'    },
          { label: 'In Fridge',  value: data.fridgeLen,   emoji: '🧊', color: 'text-sky-500'     },
        ].map(s => (
          <div key={s.label} className="glass-elevated p-3 rounded-2xl text-center">
            <span className="text-2xl">{s.emoji}</span>
            <p className={`text-lg font-bold leading-tight mt-0.5 ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Badge categories ──────────────────────────────────────── */}
      {categories.map(cat => {
        const catBadges = badges.filter(b => b.category === cat);
        const catMeta = CATEGORY_META[cat];
        return (
          <motion.div key={cat} variants={fadeUp} className="mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-base">{catMeta.emoji}</span>
              <p className={`text-xs font-bold uppercase tracking-wide ${catMeta.color}`}>{catMeta.label}</p>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {catBadges.filter(b => b.unlocked).length}/{catBadges.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {catBadges.map(b => {
                const pct = b.goal > 1 ? Math.round((b.progress / b.goal) * 100) : (b.unlocked ? 100 : 0);
                return (
                  <motion.div
                    key={b.id}
                    whileTap={{ scale: 0.98 }}
                    className={`glass-elevated rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden transition-all ${b.unlocked ? '' : 'opacity-65'}`}
                  >
                    {/* Subtle gradient bg on unlocked */}
                    {b.unlocked && (
                      <div className={`absolute inset-0 ${b.gradient} opacity-[0.06] pointer-events-none`} />
                    )}
                    {/* Badge icon */}
                    <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 shrink-0 ${
                      b.unlocked ? `border-primary/20 bg-primary/5 shadow-glow` : 'border-border/50 bg-secondary grayscale'
                    }`}>
                      {b.unlocked ? b.emoji : <Lock className="w-5 h-5 text-muted-foreground" />}
                      {b.unlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm"
                        >
                          <span className="text-[9px] text-white font-bold">✓</span>
                        </motion.div>
                      )}
                    </div>
                    {/* Text + progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-bold">{b.label}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.unlocked ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-secondary text-muted-foreground'}`}>
                          +{b.xp} XP
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug mb-2">
                        {b.unlocked ? b.desc : b.how}
                      </p>
                      {!b.unlocked && b.goal > 1 && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] text-muted-foreground">{b.progress}/{b.goal}</span>
                            <span className="text-[9px] font-semibold text-primary">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.7, ease: 'easeOut' }}
                              className={`h-full ${b.gradient} rounded-full`}
                            />
                          </div>
                        </div>
                      )}
                      {b.unlocked && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Badge unlocked!
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {/* ── Recent Activity ─────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="glass-elevated rounded-2xl p-4">
        <p className="text-xs font-bold mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-500" /> Recent Activity
        </p>
        {wasteLog.length > 0 ? (
          <div className="space-y-2.5">
            {wasteLog.map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="text-lg shrink-0">{log.action === 'used' ? '✅' : '🗑️'}</span>
                <div className="flex-1">
                  <span className="font-semibold">{log.name ?? 'Item'}</span>
                  <span className="text-muted-foreground"> was {log.action === 'used' ? 'used up' : 'wasted'}</span>
                </div>
                {log.date && (
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-3xl mb-2">🌱</p>
            <p className="text-sm font-semibold mb-1">No activity yet</p>
            <p className="text-[11px] text-muted-foreground">Start scanning your fridge and logging food usage to earn XP and unlock badges.</p>
          </div>
        )}
      </motion.div>

      {/* ── Footer XP reminder ────────────────────────────────── */}
      <motion.div variants={fadeUp} className="mt-4 text-center">
        <p className="text-[10px] text-muted-foreground">
          You have <span className="font-bold text-foreground">{totalXP} XP</span> total.
          {lvl.nextMin
            ? ` Earn ${xpToNext} more to reach ${LEVELS[lvl.idx + 1]?.label}!`
            : " You've reached the highest level!"
          }
        </p>
      </motion.div>

    </motion.div>
  );
};

export default AchievementsScreen;
