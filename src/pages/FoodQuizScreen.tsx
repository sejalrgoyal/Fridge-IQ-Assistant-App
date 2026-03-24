import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setFridgeiqItem, subscribeFridgeiqKeys } from '@/lib/fridgeiqStorage';
import GreetingHeader from '@/components/GreetingHeader';
import { getTabConfig } from '@/data/tabConfig';
import { ClipboardList, CheckCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Map quiz answers → profile prefs format so Profile tab auto-updates
const DIET_MAP: Record<string, string> = {
  'No restrictions': 'Balanced', 'Vegetarian': 'Vegetarian', 'Vegan': 'Vegan',
  'Pescatarian': 'Pescatarian', 'Keto': 'Keto', 'Paleo': 'Paleo',
  'Gluten-free': 'Gluten-Free', 'Halal': 'Balanced', 'Kosher': 'Balanced',
};
const ALLERGY_MAP: Record<string, string> = {
  'Peanuts': 'Nuts', 'Tree nuts': 'Nuts', 'Dairy': 'Dairy',
  'Eggs': 'Eggs', 'Shellfish': 'Shellfish', 'Soy': 'Soy', 'Wheat': 'Gluten', 'Fish': 'Fish',
};
const COOKING_TIME_MAP: Record<string, string> = {
  'Under 15 min': 'Under 15 min', '15–30 min': 'Under 30 min',
  '30–60 min': 'Under 1 hour', '60+ min': 'No limit',
};
const mapSkill = (s: string) => {
  if (s.startsWith('Beginner')) return 'Beginner';
  if (s.startsWith('Intermediate')) return 'Intermediate';
  if (s.startsWith('Advanced')) return 'Advanced';
  if (s.startsWith('Pro')) return 'Chef-level';
  return '';
};
const mapGoalToFitness = (goals: string[]) => {
  if (goals.includes('Build muscle')) return 'Muscle Gain';
  if (goals.includes('Lose weight')) return 'Weight Loss';
  if (goals.includes('Eat healthier')) return 'General Health';
  if (goals.includes('Meal prep')) return 'Maintain Weight';
  return 'General Health';
};

interface QuizAnswers {
  diet: string[];
  allergies: string[];
  cuisines: string[];
  cookingTime: string;
  skillLevel: string;
  goals: string[];
}

const questions = [
  {
    key: 'diet' as const,
    title: 'Any dietary preferences?',
    subtitle: 'Select all that apply',
    multi: true,
    options: ['No restrictions', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo', 'Gluten-free', 'Halal', 'Kosher'],
  },
  {
    key: 'allergies' as const,
    title: 'Any food allergies?',
    subtitle: 'Select all that apply',
    multi: true,
    options: ['None', 'Peanuts', 'Tree nuts', 'Dairy', 'Eggs', 'Shellfish', 'Soy', 'Wheat', 'Fish'],
  },
  {
    key: 'cuisines' as const,
    title: 'Favorite cuisines?',
    subtitle: 'Pick your top choices',
    multi: true,
    options: ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mediterranean', 'American', 'Korean', 'French'],
  },
  {
    key: 'cookingTime' as const,
    title: 'How much time do you like to cook?',
    subtitle: 'Average weeknight meal',
    multi: false,
    options: ['Under 15 min', '15–30 min', '30–60 min', '60+ min'],
  },
  {
    key: 'skillLevel' as const,
    title: 'Your cooking skill level?',
    subtitle: 'Be honest, no judgment!',
    multi: false,
    options: ['Beginner 🌱', 'Intermediate 🍳', 'Advanced 👨‍🍳', 'Pro Chef 🔥'],
  },
  {
    key: 'goals' as const,
    title: 'What are your food goals?',
    subtitle: 'Select all that apply',
    multi: true,
    options: ['Eat healthier', 'Save money', 'Reduce waste', 'Try new recipes', 'Meal prep', 'Lose weight', 'Build muscle'],
  },
];

const FoodQuizScreen = () => {
  const [quizDone, setQuizDone] = useState(() => !!localStorage.getItem('fridgeiq_prefs'));
  const [step, setStep] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({
    diet: [], allergies: [], cuisines: [], cookingTime: '', skillLevel: '', goals: [],
  });

  useEffect(() => {
    return subscribeFridgeiqKeys(['fridgeiq_prefs'], () => {
      setQuizDone(!!localStorage.getItem('fridgeiq_prefs'));
    });
  }, []);

  // Load existing answers if quiz was done
  useEffect(() => {
    if (quizDone) {
      try {
        const saved = JSON.parse(localStorage.getItem('fridgeiq_prefs') || '{}');
        setAnswers(prev => ({ ...prev, ...saved }));
      } catch {}
    }
  }, []);

  const tabConfig = getTabConfig('/food-quiz');

  const q = questions[step];

  const toggle = (option: string) => {
    const key = q.key;
    if (q.multi) {
      const current = answers[key] as string[];
      const updated = current.includes(option) ? current.filter(o => o !== option) : [...current, option];
      setAnswers({ ...answers, [key]: updated });
    } else {
      setAnswers({ ...answers, [key]: option });
    }
  };

  const isSelected = (option: string) => {
    const val = answers[q.key];
    return Array.isArray(val) ? val.includes(option) : val === option;
  };

  const canNext = () => {
    const val = answers[q.key];
    return Array.isArray(val) ? val.length > 0 : val !== '';
  };

  const next = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Save raw quiz answers
      setFridgeiqItem('fridgeiq_prefs', JSON.stringify(answers));

      // Sync into profile prefs so Profile tab reflects quiz results
      try {
        const existing = JSON.parse(localStorage.getItem('fridgeiq_profile_prefs') || '{}');
        const mappedAllergies = [...new Set(
          answers.allergies.filter(a => a !== 'None').map(a => ALLERGY_MAP[a]).filter(Boolean)
        )];
        const synced = {
          ...existing,
          diet: DIET_MAP[answers.diet[0]] ?? existing.diet ?? 'Balanced',
          allergies: mappedAllergies.length ? mappedAllergies : existing.allergies ?? [],
          favoriteCuisines: answers.cuisines.length ? answers.cuisines : existing.favoriteCuisines ?? [],
          cookingTime: COOKING_TIME_MAP[answers.cookingTime] ?? existing.cookingTime ?? 'Under 30 min',
          cookingSkill: mapSkill(answers.skillLevel) || existing.cookingSkill || 'Intermediate',
          fitnessGoal: mapGoalToFitness(answers.goals),
          quizSyncedAt: new Date().toISOString(),
        };
        setFridgeiqItem('fridgeiq_profile_prefs', JSON.stringify(synced));
      } catch {}

      toast.success('✨ Profile updated from your quiz!');
      setQuizDone(true);
      setQuizStarted(false);
      setStep(0);
    }
  };

  return (
    <div className="px-5 pt-10 pb-6">
      {tabConfig && (
        <GreetingHeader
          tabTitle={tabConfig.label}
          tabDescription={tabConfig.description}
          tabIcon={tabConfig.icon}
          tabGradient={tabConfig.headerGradient}
        />
      )}

      {!quizStarted ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mt-8">
          <div className="w-20 h-20 rounded-3xl gradient-amber flex items-center justify-center mb-5">
            {quizDone ? <CheckCircle className="w-10 h-10 text-primary-foreground" /> : <ClipboardList className="w-10 h-10 text-primary-foreground" />}
          </div>
          <h2 className="text-xl font-bold mb-2">{quizDone ? 'Preferences Set!' : 'Take the Food Quiz'}</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            {quizDone
              ? 'Your dietary preferences are saved. Update them anytime to refine your personalized meals and grocery list.'
              : 'Answer a few quick questions to personalize your meal suggestions, grocery list, and recipe recommendations.'}
          </p>
          <button
            onClick={() => setQuizStarted(true)}
            className="gradient-amber text-primary-foreground px-8 py-3.5 rounded-2xl font-semibold text-sm active:scale-95 transition-transform shadow-glow"
          >
            {quizDone ? '✏️ Update Preferences' : '🚀 Start Quiz'}
          </button>
        </motion.div>
      ) : (
        /* Inline Carousel Quiz */
        <div className="mt-4">
          {/* Progress dots */}
          <div className="flex gap-1.5 mb-5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'gradient-amber' : 'bg-muted'}`}
              />
            ))}
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="glass-elevated p-5 rounded-2xl"
            >
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                Question {step + 1} of {questions.length}
              </p>
              <h2 className="text-lg font-bold mb-1">{q.title}</h2>
              <p className="text-xs text-muted-foreground mb-4">{q.subtitle}</p>

              <div className="flex flex-wrap gap-2">
                {q.options.map(option => (
                  <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={`text-sm font-medium px-3.5 py-2 rounded-xl transition-all ${
                      isSelected(option)
                        ? 'gradient-amber text-primary-foreground shadow-glow scale-105'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => step > 0 ? setStep(step - 1) : setQuizStarted(false)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4" /> {step === 0 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={next}
              disabled={!canNext()}
              className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${
                canNext()
                  ? 'gradient-amber text-primary-foreground active:scale-95 shadow-glow'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step === questions.length - 1 ? (
                <><Sparkles className="w-4 h-4" /> Finish</>
              ) : (
                <>Next <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodQuizScreen;
