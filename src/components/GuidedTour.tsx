/**
 * GuidedTour — interactive spotlight tour with inline profile setup.
 *
 * Setup steps ask for name, goal, and diet before the nav walkthrough.
 * A quiz CTA step prompts the user to take the Food Quiz mid-tour.
 * Nav-spotlight steps let users tap the highlighted tab to advance.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, ArrowDown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props { onDone: () => void }

type StepKind =
  | 'modal'      // welcome / done / quiz-cta
  | 'setup-name' // text input for name
  | 'setup-goal' // tap-to-pick goal
  | 'setup-diet' // tap-to-pick diet
  | 'nav';       // spotlight a nav tab

interface Step {
  id: string;
  kind: StepKind;
  title: string;
  body: string;
  route: string;
  navRoute: string | null;
  tapLabel: string;
}

const STEPS: Step[] = [
  { id: 'welcome',      kind: 'modal',      navRoute: null,            route: '/',            tapLabel: '',
    title: '👋 Hey there, welcome to FridgeIQ!',
    body:  'Your smart kitchen companion is ready to go. Before we explore every feature, let\'s get you set up in under 60 seconds. Ready? Let\'s do this!' },

  { id: 'setup-name',   kind: 'setup-name', navRoute: null,            route: '/',            tapLabel: '',
    title: '😊 First things first...',
    body:  'What should FridgeIQ call you?' },

  { id: 'setup-goal',   kind: 'setup-goal', navRoute: null,            route: '/',            tapLabel: '',
    title: '🎯 What brings you here?',
    body:  'Pick your main goal so FridgeIQ can tailor everything for you.' },

  { id: 'setup-diet',   kind: 'setup-diet', navRoute: null,            route: '/',            tapLabel: '',
    title: '🥗 How do you eat?',
    body:  'Choose the option that fits best. You can always update this in Profile.' },

  { id: 'home',         kind: 'nav',        navRoute: '/',             route: '/',            tapLabel: 'Home',
    title: '🏠 This is your Home',
    body:  'Your dashboard lives here. Browse all features, read the How-to guide, and replay this tour any time. Tap the Home tab below to confirm!' },

  { id: 'quiz-cta',     kind: 'modal',      navRoute: null,            route: '/food-quiz',   tapLabel: '',
    title: '📋 Coming up: the Food Quiz',
    body:  "We'll visit the Food Quiz tab next. It has 8 quick questions that personalize your recipes, grocery prices, and nutrition goals. You can take it any time after the tour too. Let's keep going!" },

  { id: 'quiz',         kind: 'nav',        navRoute: '/food-quiz',    route: '/food-quiz',   tapLabel: 'Quiz',
    title: '📋 Quiz tab',
    body:  'The Food Quiz tab is always here if you want to retake it or update your preferences. Tap the Quiz tab to continue.' },

  { id: 'chat',         kind: 'nav',        navRoute: '/chat',         route: '/chat',        tapLabel: 'Chat',
    title: '💬 Ask the AI anything',
    body:  'Type any question like "What can I make with the chicken in my fridge?" and get instant ideas based on what you actually have. Tap Chat!' },

  { id: 'fridge',       kind: 'nav',        navRoute: '/scan',         route: '/scan',        tapLabel: 'Fridge',
    title: '📸 Your smart fridge',
    body:  'Snap a photo of your open fridge and AI detects the food automatically. Add items manually or by barcode too. Delete an item and log whether you used it or wasted it. Tap Fridge!' },

  { id: 'meals',        kind: 'nav',        navRoute: '/meals',        route: '/meals',       tapLabel: 'Meals',
    title: '🍽️ Recipes just for you',
    body:  'Every recipe is filtered to your diet and sorted by ingredients you already own. Tap any recipe for a serving scaler and full nutrition breakdown. Tap Meals!' },

  { id: 'planner',      kind: 'nav',        navRoute: '/planner',      route: '/planner',     tapLabel: 'Planner',
    title: '📅 Plan your whole week',
    body:  'Drag meals onto each day, auto-fill the week in one tap, then hit "Generate Grocery List" to build your shopping list instantly. Tap Planner!' },

  { id: 'grocery',      kind: 'nav',        navRoute: '/grocery',      route: '/grocery',     tapLabel: 'Grocery',
    title: '🛒 Never over-shop again',
    body:  'Your list shows estimated prices at nearby stores. Items already in your fridge get a green badge so you skip the duplicate buys. Tap Grocery!' },

  { id: 'health',       kind: 'nav',        navRoute: '/health-scan',  route: '/health-scan', tapLabel: 'Health',
    title: '🛡️ Know what you eat',
    body:  'Scan any barcode or search a product name to get a full nutrition breakdown, ingredient list, and health rating. Tap Health!' },

  { id: 'achievements', kind: 'nav',        navRoute: '/achievements', route: '/achievements',tapLabel: 'Badges',
    title: '🏆 Earn XP and level up',
    body:  'Every action earns XP. Unlock badges, climb from Novice to Master, and track your eco streak. Tap Badges to check your level!' },

  { id: 'profile',      kind: 'nav',        navRoute: '/profile',      route: '/profile',     tapLabel: 'Profile',
    title: '👤 All about you',
    body:  'Edit your name, adjust daily nutrition goals, reset activity stats, change preferences, and turn on push notifications for expiring items. Tap Profile!' },

  { id: 'done',         kind: 'modal',      navRoute: null,            route: '/',            tapLabel: '',
    title: "🎉 You're all set!",
    body:  "FridgeIQ is now personalized just for you. Your first mission: take the Food Quiz if you haven't yet, then scan your fridge to unlock recipe suggestions and your smart grocery list. Have fun!" },
];

const GOALS = [
  { id: 'health',   label: '🥦 Eat healthier' },
  { id: 'waste',    label: '♻️ Reduce food waste' },
  { id: 'money',    label: '💰 Save money' },
  { id: 'mealprep', label: '📦 Meal prep smarter' },
];

const DIETS = [
  { id: 'Balanced',     label: '⚖️ Balanced' },
  { id: 'Vegetarian',   label: '🥕 Vegetarian' },
  { id: 'Vegan',        label: '🌱 Vegan' },
  { id: 'Keto',         label: '🥩 Keto' },
  { id: 'Gluten-Free',  label: '🌾 Gluten-Free' },
  { id: 'Pescatarian',  label: '🐟 Pescatarian' },
];

interface SpotRect { top: number; left: number; right: number; bottom: number; width: number; height: number }

const GuidedTour = ({ onDone }: Props) => {
  const navigate = useNavigate();

  const [step, setStepRaw] = useState(() => {
    const s = localStorage.getItem('fridgeiq_tour_step');
    return s ? parseInt(s, 10) : 0;
  });
  const setStep = (n: number | ((p: number) => number)) =>
    setStepRaw(prev => {
      const next = typeof n === 'function' ? n(prev) : n;
      localStorage.setItem('fridgeiq_tour_step', String(next));
      return next;
    });

  // Setup answers
  const [userName,  setUserName]  = useState(() => localStorage.getItem('fridgeiq_username') || '');
  const [userGoal,  setUserGoal]  = useState('');
  const [userDiet,  setUserDiet]  = useState('');

  const [spotRect,  setSpotRect]  = useState<SpotRect | null>(null);
  const [winW,      setWinW]      = useState(window.innerWidth);
  const [winH,      setWinH]      = useState(window.innerHeight);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const current = STEPS[step];
  const total   = STEPS.length;
  const isNav   = current.kind === 'nav';
  const isModal = !isNav;

  const measure = useCallback(() => {
    if (!current.navRoute) { setSpotRect(null); return; }
    const el = document.querySelector<HTMLElement>(`[data-nav-route="${current.navRoute}"]`);
    if (!el) { setSpotRect(null); return; }
    const r = el.getBoundingClientRect();
    setSpotRect({ top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height });
  }, [current.navRoute]);

  useEffect(() => {
    navigate(current.route);
    setSpotRect(null);
    timers.current.forEach(clearTimeout);
    timers.current = [setTimeout(measure, 80), setTimeout(measure, 300)];
    return () => timers.current.forEach(clearTimeout);
  }, [step]); // eslint-disable-line

  useEffect(() => {
    const onResize = () => { setWinW(window.innerWidth); setWinH(window.innerHeight); measure(); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  const saveSetup = () => {
    // Persist name
    if (userName.trim()) {
      localStorage.setItem('fridgeiq_username', userName.trim());
      try {
        const prof = JSON.parse(localStorage.getItem('fridgeiq_profile') || '{}');
        localStorage.setItem('fridgeiq_profile', JSON.stringify({ ...prof, name: userName.trim() }));
      } catch {}
    }
    // Persist goal + diet into prefs
    if (userGoal || userDiet) {
      try {
        const prefs = JSON.parse(localStorage.getItem('fridgeiq_profile_prefs') || '{}');
        if (userGoal) {
          const goalMap: Record<string, string> = {
            health: 'General Health', waste: 'General Health', money: 'Maintain Weight', mealprep: 'Maintain Weight'
          };
          prefs.fitnessGoal = goalMap[userGoal] ?? 'General Health';
        }
        if (userDiet) prefs.diet = userDiet;
        localStorage.setItem('fridgeiq_profile_prefs', JSON.stringify(prefs));
        window.dispatchEvent(new Event('fridgeiq-storage-updated'));
      } catch {}
    }
  };

  const goNext = () => {
    // Save setup data when leaving setup steps
    if (['setup-name', 'setup-goal', 'setup-diet'].includes(current.kind)) saveSetup();
    setStep(s => Math.min(total - 1, s + 1));
  };
  const goPrev = () => setStep(s => Math.max(0, s - 1));

  const dismiss = (toQuiz = false) => {
    saveSetup();
    localStorage.setItem('fridgeiq_tour_done', '1');
    localStorage.setItem('fridgeiq_onboarded', '1');
    localStorage.removeItem('fridgeiq_tour_step');
    onDone();
    navigate(toQuiz ? '/food-quiz' : '/');
  };

  // ── Callout geometry ─────────────────────────────────────────────────────
  const CARD_W = Math.min(320, winW * 0.86);
  const MARGIN = 12;
  let cardLeft = MARGIN;
  let arrowOff = CARD_W / 2 - 8;
  if (spotRect) {
    const cx = spotRect.left + spotRect.width / 2;
    const preferred = Math.max(MARGIN, Math.min(cx - CARD_W / 2, winW - CARD_W - MARGIN));
    cardLeft = preferred;
    arrowOff = Math.max(10, Math.min(cx - preferred - 8, CARD_W - 28));
  }
  const cardBottom = spotRect ? winH - spotRect.top + 16 : 100;

  // ── Progress dots ────────────────────────────────────────────────────────
  const Dots = ({ onClick }: { onClick?: (i: number) => void }) => (
    <div className="flex gap-1 flex-wrap justify-center">
      {STEPS.map((_, i) => (
        <button key={i} onClick={() => onClick?.(i)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === step ? 'w-5 bg-primary' : i < step ? 'w-1.5 bg-primary/45' : 'w-1.5 bg-border'
          }`}
        />
      ))}
    </div>
  );

  // ── Shared nav row (prev + next) ─────────────────────────────────────────
  const NavRow = ({ nextLabel = 'Next', nextDisabled = false }: { nextLabel?: string; nextDisabled?: boolean }) => (
    <div className="flex gap-2 mt-4">
      {step > 0 && (
        <button onClick={goPrev}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 active:scale-90 transition-transform">
          <ChevronLeft className="w-4 h-4 text-secondary-foreground" />
        </button>
      )}
      <button onClick={goNext} disabled={nextDisabled}
        className={`flex-1 gradient-primary text-primary-foreground text-sm font-bold py-3 rounded-2xl shadow-glow flex items-center justify-center gap-2 transition-all ${nextDisabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-[0.98]'}`}>
        {nextLabel}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[95] pointer-events-none select-none">

      {/* ══ MODAL steps (welcome, setup, quiz-cta, done) ══════════════════ */}
      {isModal && (
        <div className="absolute inset-0 bg-black/75 pointer-events-auto flex items-center justify-center px-4">
          <motion.div key={current.id}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.96          }}
            transition={{ duration: 0.22 }}
            className="bg-card rounded-3xl border border-border shadow-2xl p-6 w-full"
            style={{ maxWidth: 420 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {step + 1} of {total}
              </span>
              <button onClick={() => dismiss(false)}
                className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <h2 className="text-xl font-bold mb-2">{current.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{current.body}</p>

            {/* ── SETUP: Name ── */}
            {current.kind === 'setup-name' && (
              <div className="mb-1">
                <input
                  autoFocus
                  type="text"
                  placeholder="Your name..."
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && userName.trim() && goNext()}
                  className="w-full text-lg font-semibold bg-secondary rounded-2xl px-4 py-3 outline-none border border-border/50 focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                  maxLength={30}
                />
                <NavRow nextLabel={userName.trim() ? `Nice to meet you, ${userName.trim().split(' ')[0]}! Next →` : 'Enter your name first'} nextDisabled={!userName.trim()} />
              </div>
            )}

            {/* ── SETUP: Goal ── */}
            {current.kind === 'setup-goal' && (
              <div className="mb-1">
                <div className="grid grid-cols-2 gap-2.5 mb-1">
                  {GOALS.map(g => (
                    <button key={g.id} onClick={() => setUserGoal(g.id)}
                      className={`py-3 px-3 rounded-2xl text-sm font-semibold border-2 text-left transition-all active:scale-95 ${
                        userGoal === g.id
                          ? 'border-primary bg-primary/10 text-primary shadow-glow'
                          : 'border-border bg-secondary/50 text-foreground hover:border-primary/40'
                      }`}>
                      {g.label}
                    </button>
                  ))}
                </div>
                <NavRow nextLabel={userGoal ? 'Great choice! Next →' : 'Pick one to continue'} nextDisabled={!userGoal} />
              </div>
            )}

            {/* ── SETUP: Diet ── */}
            {current.kind === 'setup-diet' && (
              <div className="mb-1">
                <div className="grid grid-cols-2 gap-2.5 mb-1">
                  {DIETS.map(d => (
                    <button key={d.id} onClick={() => setUserDiet(d.id)}
                      className={`py-3 px-3 rounded-2xl text-sm font-semibold border-2 text-left transition-all active:scale-95 ${
                        userDiet === d.id
                          ? 'border-primary bg-primary/10 text-primary shadow-glow'
                          : 'border-border bg-secondary/50 text-foreground hover:border-primary/40'
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
                <NavRow nextLabel={userDiet ? 'Perfect! Let\'s explore →' : 'Pick one to continue'} nextDisabled={!userDiet} />
              </div>
            )}

            {/* ── QUIZ CTA ── */}
            {current.kind === 'modal' && current.id === 'quiz-cta' && (
              <>
                <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 mb-4 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-primary font-semibold leading-relaxed">
                    Completing the quiz unlocks personalized recipes, accurate nutrition goals, and the Food Quiz badge. You can take it from the Quiz tab any time!
                  </p>
                </div>
                <Dots onClick={setStep} />
                <NavRow nextLabel="Got it, let's continue the tour →" />
              </>
            )}

            {/* ── WELCOME ── */}
            {current.kind === 'modal' && current.id === 'welcome' && (
              <>
                <Dots onClick={setStep} />
                <NavRow nextLabel="Let's get started!" />
              </>
            )}

            {/* ── DONE ── */}
            {current.kind === 'modal' && current.id === 'done' && (
              <>
                <Dots onClick={setStep} />
                <button onClick={() => dismiss(true)}
                  className="w-full gradient-primary text-primary-foreground text-sm font-bold py-3.5 rounded-2xl shadow-glow mb-2.5 mt-4 active:scale-[0.98] transition-transform">
                  Take the Food Quiz 📋
                </button>
                <button onClick={() => dismiss(false)}
                  className="w-full text-xs text-muted-foreground py-1.5 text-center">
                  Explore on my own
                </button>
              </>
            )}

            {/* Skip link (not on setup/quiz-cta/done steps) */}
            {current.kind === 'modal' && !['setup-name','setup-goal','setup-diet','quiz-cta','done'].includes(current.id) && (
              <button onClick={() => dismiss(false)} className="w-full text-xs text-muted-foreground py-1.5 text-center mt-1">
                Skip tour
              </button>
            )}
          </motion.div>
        </div>
      )}

      {/* ══ NAV-SPOTLIGHT steps ══════════════════════════════════════════════ */}
      {isNav && spotRect && (
        <>
          {/* Top overlay */}
          <div className="fixed pointer-events-auto bg-black/72"
            style={{ top: 0, left: 0, right: 0, height: spotRect.top }} onClick={goNext} />
          {/* Left of tab */}
          {spotRect.left > 0 && (
            <div className="fixed pointer-events-auto bg-black/72"
              style={{ top: spotRect.top, left: 0, width: spotRect.left, bottom: 0 }} onClick={goNext} />
          )}
          {/* Right of tab */}
          {spotRect.right < winW && (
            <div className="fixed pointer-events-auto bg-black/72"
              style={{ top: spotRect.top, left: spotRect.right, right: 0, bottom: 0 }} onClick={goNext} />
          )}

          {/* Glowing ring */}
          <motion.div key={`ring-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.22 }}
            className="fixed pointer-events-none"
            style={{
              top: spotRect.top, left: spotRect.left, width: spotRect.width, height: spotRect.height,
              borderRadius: '10px 10px 0 0',
              border: '2.5px solid hsl(var(--primary))', borderBottom: 'none',
              boxShadow: '0 0 20px 6px hsl(var(--primary) / 0.5), inset 0 0 12px 2px hsl(var(--primary) / 0.18)',
            }}
          />

          {/* Pulsing dot */}
          <motion.div key={`dot-${step}`}
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="fixed pointer-events-none rounded-full bg-primary"
            style={{ width: 10, height: 10, top: spotRect.top - 16, left: spotRect.left + spotRect.width / 2 - 5 }}
          />

          {/* Click interceptor over spotlight */}
          <div className="fixed pointer-events-auto cursor-pointer"
            style={{ top: spotRect.top, left: spotRect.left, width: spotRect.width, height: spotRect.height, zIndex: 2 }}
            onClick={goNext}
          />

          {/* Callout card */}
          <AnimatePresence mode="wait">
            <motion.div key={`card-${step}`}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.18 }}
              className="fixed pointer-events-auto"
              style={{ bottom: cardBottom, left: cardLeft, width: CARD_W, zIndex: 3 }}
            >
              <div className="bg-card rounded-2xl border border-border shadow-2xl p-4 relative">
                {/* Arrow */}
                <div className="absolute w-4 h-4 bg-card border-r border-b border-border rotate-45"
                  style={{ bottom: -9, left: Math.max(12, Math.min(arrowOff, CARD_W - 28)) }}
                />

                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    {step + 1} / {total}
                  </span>
                  <button onClick={() => dismiss(false)}
                    className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center active:scale-90 transition-transform">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>

                <h3 className="text-sm font-bold mb-1">{current.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">{current.body}</p>

                <div className="mb-3"><Dots onClick={setStep} /></div>

                <div className="flex gap-2 mb-1.5">
                  <button onClick={goPrev}
                    className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 active:scale-90 transition-transform">
                    <ChevronLeft className="w-4 h-4 text-secondary-foreground" />
                  </button>
                  <motion.button
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                    className="flex-1 gradient-primary text-primary-foreground text-[11px] font-bold py-2.5 rounded-xl shadow-glow flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                    onClick={goNext}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    Tap {current.tapLabel} to continue
                  </motion.button>
                </div>
                <button onClick={() => dismiss(false)}
                  className="w-full text-center text-[10px] text-muted-foreground py-1 hover:text-foreground transition-colors">
                  Skip tour
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </>
      )}

      {/* Measuring fallback */}
      {isNav && !spotRect && (
        <div className="fixed inset-0 pointer-events-auto bg-black/65 flex items-end justify-center pb-32" onClick={goNext}>
          <div className="bg-card rounded-2xl px-5 py-3 text-sm font-semibold animate-pulse">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default GuidedTour;
