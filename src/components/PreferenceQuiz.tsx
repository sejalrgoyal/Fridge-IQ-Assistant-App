import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

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

interface Props {
  onComplete: (answers: QuizAnswers) => void;
  onClose: () => void;
}

const PreferenceQuiz = ({ onComplete, onClose }: Props) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    diet: [], allergies: [], cuisines: [], cookingTime: '', skillLevel: '', goals: [],
  });

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
    if (step < questions.length - 1) setStep(step + 1);
    else onComplete(answers);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full sm:max-w-md bg-card rounded-t-3xl sm:rounded-3xl border border-border overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="px-5 pt-4 flex items-center justify-between">
          <div className="flex gap-1 flex-1 mr-4">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'gradient-primary' : 'bg-muted'}`} />
            ))}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question */}
        <div className="px-5 pt-5 pb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-lg font-bold">{q.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">{q.subtitle}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {q.options.map(option => (
                  <button
                    key={option}
                    onClick={() => toggle(option)}
                    className={`text-sm font-medium px-3.5 py-2 rounded-xl transition-colors ${
                      isSelected(option)
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div className="px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            className={`flex items-center gap-1 text-sm font-medium ${step === 0 ? 'opacity-0 pointer-events-none' : 'text-muted-foreground'}`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button
            onClick={next}
            disabled={!canNext()}
            className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${
              canNext()
                ? 'gradient-primary text-primary-foreground active:scale-95'
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
      </motion.div>
    </motion.div>
  );
};

export default PreferenceQuiz;
