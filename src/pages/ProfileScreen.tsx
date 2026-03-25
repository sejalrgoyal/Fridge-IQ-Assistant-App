import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ChevronRight, ChevronDown,
  Bell, Shield, HelpCircle, Globe, Heart, Briefcase, Calendar,
  Check, Edit3, Save, MapPin, FileText, Camera, Moon, Volume2, Mail, Trash2, Send, MessageSquare, Lock, Eye, Database, Zap, Bug,
  Flame, Target, DollarSign, Clock, UtensilsCrossed, Leaf, ChefHat, Sparkles, AlertTriangle, ImagePlus, Pencil, X, RotateCcw, Trophy
} from 'lucide-react';
import { setFridgeiqItem, subscribeFridgeiqKeys } from '@/lib/fridgeiqStorage';
import { toast } from 'sonner';

import { getTabConfig } from '@/data/tabConfig';
import { timezoneOptions } from '@/hooks/useGreeting';

interface UserProfile {
  name: string;
  age: string;
  occupation: string;
  householdSize: string;
  bio: string;
  location: string;
  avatarEmoji: string;
  avatarPhoto?: string;
}

interface Preferences {
  diet: string;
  fitnessGoal: string;
  budget: string;
  cookingTime: string;
  allergies: string[];
  dislikedFoods: string[];
  favoriteCuisines: string[];
  mealPrepDays: string[];
  planningTime: string;
  cookingSkill: string;
}

interface SettingsState {
  notifications: boolean;
  darkMode: boolean;
  soundEffects: boolean;
  emailUpdates: boolean;
  metricUnits: boolean;
  language: string;
  timezone: string;
}

const dietOptions = ['Balanced', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'Pescatarian', 'Gluten-Free'];
const fitnessGoals = ['Weight Loss', 'Muscle Gain', 'Maintain Weight', 'General Health', 'Athletic Performance'];
const budgetOptions = ['$40/week', '$60/week', '$80/week', '$100/week', '$120+/week'];
const cookingTimeOptions = ['Under 15 min', 'Under 30 min', 'Under 45 min', 'Under 1 hour', 'No limit'];
const allergyOptions = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Fish', 'Sesame'];
const cuisineOptions = ['Italian', 'Japanese', 'Mexican', 'Indian', 'Chinese', 'Thai', 'Korean', 'American', 'Mediterranean', 'French', 'Middle Eastern', 'Vietnamese'];
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const planningTimeOptions = ['5 min/day', '10 min/day', '15 min/day', '30 min/day', 'Weekend batch'];
const skillOptions = ['Beginner', 'Intermediate', 'Advanced', 'Chef-level'];
const avatarEmojis = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '😊', '😎', '🤗', '🍕', '🥑', '🔥', '⭐', '🌿', '🎯', '🦊', '🐱', '🐶', '🦁', '🐸', '🦄', '🌸', '🎨'];
const languageOptions = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Portuguese'];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const loadProfile = (): UserProfile => {
  try {
    const saved = localStorage.getItem('fridgeiq_profile');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { name: 'Alex Johnson', age: '28', occupation: 'Software Engineer', householdSize: '2', bio: '', location: '', avatarEmoji: '👨‍🍳' };
};

const loadPrefs = (): Preferences => {
  try {
    const saved = localStorage.getItem('fridgeiq_profile_prefs');
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    diet: 'Balanced', fitnessGoal: 'Muscle Gain', budget: '$80/week', cookingTime: 'Under 30 min',
    allergies: ['Nuts'], dislikedFoods: ['Olives', 'Anchovies'], favoriteCuisines: ['Italian', 'Japanese', 'Mexican'],
    mealPrepDays: ['Sun', 'Wed'], planningTime: '10 min/day', cookingSkill: 'Intermediate',
  };
};

const defaultSettings: SettingsState = {
  notifications: true,
  darkMode: false,
  soundEffects: true,
  emailUpdates: false,
  metricUnits: true,
  language: 'English',
  timezone: 'Auto',
};

type BooleanSettingKey = Exclude<keyof SettingsState, 'language' | 'timezone'>;

const parseBoolean = (value: unknown, fallback: boolean): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  if (typeof value === 'number') return value === 1;
  return fallback;
};

const loadSettings = (): SettingsState => {
  try {
    const saved = localStorage.getItem('fridgeiq_settings');
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<SettingsState>;
      return {
        notifications: parseBoolean(parsed.notifications, defaultSettings.notifications),
        darkMode: parseBoolean(parsed.darkMode, defaultSettings.darkMode),
        soundEffects: parseBoolean(parsed.soundEffects, defaultSettings.soundEffects),
        emailUpdates: parseBoolean(parsed.emailUpdates, defaultSettings.emailUpdates),
        metricUnits: parseBoolean(parsed.metricUnits, defaultSettings.metricUnits),
        language: typeof parsed.language === 'string' && parsed.language.trim() ? parsed.language : defaultSettings.language,
        timezone: typeof parsed.timezone === 'string' && parsed.timezone.trim() ? parsed.timezone : defaultSettings.timezone,
      };
    }
  } catch {}
  return defaultSettings;
};

// ── Nutrition tracking ─────────────────────────────────────────────────────
interface NutritionCurrent {
  protein: number;
  calories: number;
  fiber: number;
  date: string;
}
interface NutritionGoals {
  protein: number;
  calories: number;
  fiber: number;
}

const GOALS_BY_FITNESS: Record<string, NutritionGoals> = {
  'Weight Loss':          { protein: 100, calories: 1600, fiber: 28 },
  'Muscle Gain':          { protein: 180, calories: 2800, fiber: 25 },
  'Maintain Weight':      { protein: 120, calories: 2200, fiber: 25 },
  'General Health':       { protein: 130, calories: 2000, fiber: 30 },
  'Athletic Performance': { protein: 200, calories: 3000, fiber: 30 },
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const loadNutritionGoals = (fitnessGoal: string): NutritionGoals => {
  try {
    const saved = localStorage.getItem('fridgeiq_nutrition_goals');
    if (saved) return JSON.parse(saved);
  } catch {}
  return GOALS_BY_FITNESS[fitnessGoal] ?? { protein: 120, calories: 2200, fiber: 25 };
};

const loadNutritionCurrent = (): NutritionCurrent => {
  try {
    const saved = localStorage.getItem('fridgeiq_nutrition_current');
    if (saved) {
      const parsed = JSON.parse(saved) as NutritionCurrent;
      if (parsed.date === todayStr()) return parsed;
    }
  } catch {}
  return { protein: 0, calories: 0, fiber: 0, date: todayStr() };
};

const ProfileScreen = () => {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);
  const [prefs, setPrefs] = useState<Preferences>(loadPrefs);
  const [settings, setSettings] = useState<SettingsState>(loadSettings);
  const [editingProfile, setEditingProfile] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [subSection, setSubSection] = useState<string | null>(null);
  const [dislikedInput, setDislikedInput] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [feedbackForm, setFeedbackForm] = useState({ subject: '', message: '' });
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [notifPhone, setNotifPhone] = useState('');
  const [notifPhoneConfirmed, setNotifPhoneConfirmed] = useState(false);

  // Nutrition tracking state
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>(() => loadNutritionGoals(loadPrefs().fitnessGoal));
  const [nutritionCurrent, setNutritionCurrent] = useState<NutritionCurrent>(loadNutritionCurrent);
  const [editingNutrition, setEditingNutrition] = useState(false);
  const [goalDraft, setGoalDraft] = useState<NutritionGoals>(() => loadNutritionGoals(loadPrefs().fitnessGoal));
  const [currentDraft, setCurrentDraft] = useState<NutritionCurrent>(loadNutritionCurrent);

  const [showResetDialog, setShowResetDialog] = useState(false);

  // Activity stats — editable/resettable
  interface ActivityStats { mealsCoooked: number; wasteSavedKg: number; streakDays: number }
  const loadActivityStats = (): ActivityStats => {
    try {
      const saved = localStorage.getItem('fridgeiq_activity_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { mealsCoooked: 47, wasteSavedKg: 2.1, streakDays: 3 };
  };
  const [activityStats, setActivityStatsState] = useState<ActivityStats>(loadActivityStats);
  const [editingStats, setEditingStats] = useState(false);
  const [statsDraft, setStatsDraft] = useState<ActivityStats>(loadActivityStats);
  const saveActivityStats = (s: ActivityStats) => {
    setActivityStatsState(s);
    setFridgeiqItem('fridgeiq_activity_stats', JSON.stringify(s));
    setEditingStats(false);
  };
  const resetActivityStats = () => {
    const reset: ActivityStats = { mealsCoooked: 0, wasteSavedKg: 0, streakDays: 0 };
    setActivityStatsState(reset);
    setFridgeiqItem('fridgeiq_activity_stats', JSON.stringify(reset));
    setStatsDraft(reset);
    toast.success('Activity stats reset');
  };

  // kept for potential future use
  const _wasteLog = null; void _wasteLog;

  // Push notifications for expiring items
  useEffect(() => {
    if (!settings.notifications) return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'denied') return;

    const checkAndNotify = async () => {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      if (Notification.permission !== 'granted') return;
      try {
        const fridgeItems: { name: string; emoji: string; daysLeft: number }[] = JSON.parse(localStorage.getItem('fridgeiq_fridge_items') || '[]');
        const expiring = fridgeItems.filter(i => i.daysLeft <= 2);
        if (expiring.length === 0) return;
        const lastNotif = localStorage.getItem('fridgeiq_last_expiry_notif');
        const today = new Date().toISOString().slice(0, 10);
        if (lastNotif === today) return;
        localStorage.setItem('fridgeiq_last_expiry_notif', today);
        new Notification('FridgeIQ: Items Expiring Soon! 🚨', {
          body: `${expiring.map(i => i.emoji + ' ' + i.name).slice(0, 3).join(', ')}${expiring.length > 3 ? ` and ${expiring.length - 3} more` : ''} need attention.`,
          icon: '/favicon.ico',
        });
      } catch {}
    };

    const timer = setTimeout(checkAndNotify, 2000);
    return () => clearTimeout(timer);
  }, [settings.notifications]);

  const handleFeedbackSubmit = () => {
    if (!feedbackForm.subject.trim() || !feedbackForm.message.trim()) return;
    setFeedbackSent(true);
    setFeedbackForm({ subject: '', message: '' });
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setProfile(p => ({ ...p, avatarPhoto: dataUrl, avatarEmoji: '' }));
      setShowAvatarPicker(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectEmoji = (emoji: string) => {
    setProfile(p => ({ ...p, avatarEmoji: emoji, avatarPhoto: undefined }));
    setShowAvatarPicker(false);
  };

  const saveName = () => {
    if (nameDraft.trim()) {
      setProfile(p => ({ ...p, name: nameDraft.trim() }));
    } else {
      setNameDraft(profile.name);
    }
    setEditingName(false);
  };

  const startEditingName = () => {
    setNameDraft(profile.name);
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  useEffect(() => { setFridgeiqItem('fridgeiq_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { setFridgeiqItem('fridgeiq_profile_prefs', JSON.stringify(prefs)); }, [prefs]);
  useEffect(() => { setFridgeiqItem('fridgeiq_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { setFridgeiqItem('fridgeiq_username', profile.name); }, [profile.name]);
  useEffect(() => { setFridgeiqItem('fridgeiq_nutrition_goals', JSON.stringify(nutritionGoals)); }, [nutritionGoals]);
  useEffect(() => {
    setFridgeiqItem('fridgeiq_nutrition_current', JSON.stringify(nutritionCurrent));
    // Save a daily snapshot for the weekly summary
    try {
      const existing: { date: string; protein: number; calories: number; fiber: number }[] =
        JSON.parse(localStorage.getItem('fridgeiq_nutrition_history') || '[]');
      const today = todayStr();
      const filtered = existing.filter(e => e.date !== today);
      const updated = [...filtered, { date: today, protein: nutritionCurrent.protein, calories: nutritionCurrent.calories, fiber: nutritionCurrent.fiber }]
        .slice(-14); // keep 14 days max
      localStorage.setItem('fridgeiq_nutrition_history', JSON.stringify(updated));
    } catch {}
  }, [nutritionCurrent]);

  // Re-load profile prefs when quiz syncs them
  useEffect(() => {
    return subscribeFridgeiqKeys(['fridgeiq_profile_prefs'], () => {
      const fresh = loadPrefs();
      setPrefs(fresh);
      // If no custom goals saved yet, update goals to match new fitness goal
      const hasSavedGoals = !!localStorage.getItem('fridgeiq_nutrition_goals');
      if (!hasSavedGoals && GOALS_BY_FITNESS[fresh.fitnessGoal]) {
        setNutritionGoals(GOALS_BY_FITNESS[fresh.fitnessGoal]);
      }
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
    setFridgeiqItem('fridgeiq_theme', settings.darkMode ? 'dark' : 'light');
  }, [settings.darkMode]);

  const toggleSection = (s: string) => setExpandedSection(prev => prev === s ? null : s);

  const toggleMulti = (field: keyof Preferences, value: string) => {
    setPrefs(prev => {
      const arr = prev[field] as string[];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const addDisliked = () => {
    if (!dislikedInput.trim()) return;
    setPrefs(prev => ({ ...prev, dislikedFoods: [...prev.dislikedFoods, dislikedInput.trim()] }));
    setDislikedInput('');
  };

  const removeDisliked = (food: string) => {
    setPrefs(prev => ({ ...prev, dislikedFoods: prev.dislikedFoods.filter(f => f !== food) }));
  };

  const toggleSetting = (key: BooleanSettingKey) => {
    setSettings(prev => ({
      ...prev,
      [key]: !parseBoolean(prev[key], defaultSettings[key]),
    }));
  };

  const resetNutritionDay = () => {
    const reset = { protein: 0, calories: 0, fiber: 0, date: todayStr() };
    setNutritionCurrent(reset);
    setCurrentDraft(reset);
    toast.success('Daily intake reset to zero!');
  };

  // Get quiz sync timestamp from prefs if available
  const quizSyncedAt: string | undefined = (prefs as (typeof prefs & { quizSyncedAt?: string })).quizSyncedAt;

  const tabConfig = getTabConfig('/profile');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="px-4 sm:px-5 pt-8 sm:pt-10 pb-6">

      {/* Profile Header — photo/emoji + editable name */}
      <motion.div variants={item} className="relative rounded-3xl overflow-hidden mb-4 p-5 sm:p-6" style={{ background: 'var(--gradient-teal)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
        <div className="relative flex flex-col items-center">
          {/* Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center text-3xl sm:text-4xl border-2 border-primary-foreground/20 shadow-lg active:scale-95 transition-transform overflow-hidden"
            >
              {profile.avatarPhoto ? (
                <img src={profile.avatarPhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.avatarEmoji || '👨‍🍳'
              )}
            </button>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-card border-2 border-[hsl(var(--teal))] flex items-center justify-center shadow-md pointer-events-none">
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[hsl(var(--teal))]" />
            </div>
          </div>

          {/* Avatar picker: emojis + upload photo */}
          <AnimatePresence>
            {showAvatarPicker && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden w-full">
                <div className="flex gap-2 mt-3 flex-wrap justify-center max-w-[300px] mx-auto">
                  {/* Upload photo button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-card/50 hover:bg-card/70 transition-all border border-dashed border-primary-foreground/30"
                    title="Upload photo"
                  >
                    <ImagePlus className="w-4 h-4 text-primary-foreground/80" />
                  </button>
                  {/* Remove photo (show current photo thumbnail if set) */}
                  {profile.avatarPhoto && (
                    <button
                      onClick={() => setProfile(p => ({ ...p, avatarPhoto: undefined, avatarEmoji: '👨‍🍳' }))}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-destructive/20 hover:bg-destructive/30 transition-all"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4 text-primary-foreground/80" />
                    </button>
                  )}
                  {avatarEmojis.map(e => (
                    <button
                      key={e}
                      onClick={() => handleSelectEmoji(e)}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl transition-all ${
                        !profile.avatarPhoto && profile.avatarEmoji === e ? 'bg-card scale-110 shadow-md ring-2 ring-primary-foreground/40' : 'bg-card/30 hover:bg-card/50'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Editable name */}
          {editingName ? (
            <div className="flex items-center gap-2 mt-3">
              <input
                ref={nameInputRef}
                value={nameDraft}
                onChange={e => setNameDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="bg-card/20 backdrop-blur-sm text-primary-foreground text-lg sm:text-xl font-bold text-center rounded-xl px-3 py-1 outline-none border border-primary-foreground/20 w-40 sm:w-48"
                maxLength={30}
              />
              <button onClick={saveName} className="w-7 h-7 rounded-full bg-card/30 flex items-center justify-center">
                <Check className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          ) : (
            <button onClick={startEditingName} className="flex items-center gap-1.5 mt-3 group">
              <h1 className="text-lg sm:text-xl font-bold text-primary-foreground">{profile.name}</h1>
              <Pencil className="w-3.5 h-3.5 text-primary-foreground/50 group-hover:text-primary-foreground/80 transition-colors" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Activity Stats — editable + resettable */}
      <motion.div variants={item} className="glass-elevated rounded-2xl mb-3 overflow-hidden">
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Activity Stats
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={resetActivityStats}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground flex items-center gap-1 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button
              onClick={() => { setStatsDraft(activityStats); setEditingStats(e => !e); }}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-transform ${editingStats ? 'bg-primary text-primary-foreground' : 'gradient-amber text-primary-foreground'}`}
            >
              <Pencil className="w-3 h-3" /> {editingStats ? 'Close' : 'Edit'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 px-3 pb-3">
          {[
            { label: 'Meals Cooked', value: activityStats.mealsCoooked, display: String(activityStats.mealsCoooked), icon: Flame, gradient: 'gradient-coral', key: 'mealsCoooked' as const },
            { label: 'Waste Saved', value: activityStats.wasteSavedKg, display: `${activityStats.wasteSavedKg}kg`, icon: Leaf, gradient: 'gradient-teal', key: 'wasteSavedKg' as const },
            { label: 'Day Streak', value: activityStats.streakDays, display: `${activityStats.streakDays}d`, icon: Zap, gradient: 'gradient-amber', key: 'streakDays' as const },
          ].map(stat => (
            <div key={stat.label} className="bg-secondary/50 p-2.5 sm:p-3 text-center rounded-xl">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${stat.gradient} flex items-center justify-center mx-auto mb-1.5`}>
                <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
              </div>
              <p className="text-base sm:text-lg font-bold leading-none">{stat.display}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <AnimatePresence initial={false}>
          {editingStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'mealsCoooked' as const, label: 'Meals Cooked', unit: '', step: 1 },
                    { key: 'wasteSavedKg' as const, label: 'Waste Saved (kg)', unit: 'kg', step: 0.1 },
                    { key: 'streakDays' as const, label: 'Day Streak', unit: 'd', step: 1 },
                  ].map(f => (
                    <div key={f.key} className="bg-card/70 rounded-xl p-2 text-center">
                      <p className="text-[9px] text-muted-foreground mb-1">{f.label}</p>
                      <input
                        type="number" min="0" step={f.step}
                        value={statsDraft[f.key]}
                        onChange={e => setStatsDraft(prev => ({ ...prev, [f.key]: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        className="w-full text-center text-sm font-bold bg-transparent outline-none"
                      />
                      {f.unit && <p className="text-[8px] text-muted-foreground">{f.unit}</p>}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => saveActivityStats(statsDraft)}
                  className="w-full py-2.5 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
                >
                  <Check className="w-3.5 h-3.5" /> Save Stats
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Nutrition KPIs — dynamic, resettable, goal-editable */}
      <motion.div variants={item} className="glass-elevated rounded-2xl mb-3 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
          <div>
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Today's Nutrition
            </p>
            {quizSyncedAt && (
              <p className="text-[9px] text-primary flex items-center gap-1 mt-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Synced from quiz
              </p>
            )}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={resetNutritionDay}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground flex items-center gap-1 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button
              onClick={() => { setEditingNutrition(e => !e); setGoalDraft(nutritionGoals); setCurrentDraft(nutritionCurrent); }}
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 active:scale-95 transition-transform ${editingNutrition ? 'bg-primary text-primary-foreground' : 'gradient-warm text-primary-foreground'}`}
            >
              <Pencil className="w-3 h-3" /> {editingNutrition ? 'Close' : 'Edit'}
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-2 px-3 pb-3">
          {([
            { key: 'protein' as const, label: 'Protein', unit: 'g', gradient: 'gradient-teal' },
            { key: 'calories' as const, label: 'Calories', unit: '', gradient: 'gradient-amber' },
            { key: 'fiber' as const, label: 'Fiber', unit: 'g', gradient: 'gradient-info' },
          ]).map(n => {
            const current = nutritionCurrent[n.key];
            const goal = nutritionGoals[n.key];
            const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
            const display = n.key === 'calories' ? current.toLocaleString() : `${current}${n.unit}`;
            const goalDisplay = n.key === 'calories' ? goal.toLocaleString() : `${goal}${n.unit}`;
            return (
              <motion.div key={n.label} className="bg-secondary/50 p-2.5 sm:p-3 text-center rounded-xl" whileTap={{ scale: 0.97 }}>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium">{n.label}</p>
                <p className="text-base sm:text-lg font-bold leading-tight mt-0.5">{display}</p>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1.5 mx-auto">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full ${n.gradient} rounded-full`}
                  />
                </div>
                <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-1">of {goalDisplay}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Expanded edit panel */}
        <AnimatePresence>
          {editingNutrition && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3 space-y-3">

                {/* Today's intake inputs */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Today's Intake</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { key: 'protein' as const, label: 'Protein', unit: 'g' },
                      { key: 'calories' as const, label: 'Calories', unit: 'kcal' },
                      { key: 'fiber' as const, label: 'Fiber', unit: 'g' },
                    ]).map(f => (
                      <div key={f.key} className="bg-secondary/60 rounded-xl p-2 text-center">
                        <p className="text-[9px] text-muted-foreground mb-1">{f.label}</p>
                        <input
                          type="number" min="0"
                          value={currentDraft[f.key]}
                          onChange={e => setCurrentDraft(prev => ({ ...prev, [f.key]: Math.max(0, parseInt(e.target.value) || 0) }))}
                          className="w-full text-center text-sm font-bold bg-transparent outline-none"
                        />
                        <p className="text-[8px] text-muted-foreground">{f.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goals editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Daily Goals</p>
                    {GOALS_BY_FITNESS[prefs.fitnessGoal] && (
                      <button
                        onClick={() => setGoalDraft(GOALS_BY_FITNESS[prefs.fitnessGoal])}
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary active:scale-95 transition-transform"
                      >
                        ✨ Auto: {prefs.fitnessGoal}
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {([
                      { key: 'protein' as const, label: 'Protein', unit: 'g', step: 5 },
                      { key: 'calories' as const, label: 'Calories', unit: 'kcal', step: 50 },
                      { key: 'fiber' as const, label: 'Fiber', unit: 'g', step: 2 },
                    ]).map(f => (
                      <div key={f.key} className="flex items-center gap-2">
                        <span className="text-xs text-foreground font-medium w-14 shrink-0">{f.label}</span>
                        <button
                          onClick={() => setGoalDraft(prev => ({ ...prev, [f.key]: Math.max(f.step, prev[f.key] - f.step) }))}
                          className="w-7 h-7 rounded-lg bg-secondary text-sm font-bold flex items-center justify-center active:scale-90 transition-transform shrink-0"
                        >−</button>
                        <input
                          type="number" min={f.step} step={f.step}
                          value={goalDraft[f.key]}
                          onChange={e => setGoalDraft(prev => ({ ...prev, [f.key]: Math.max(f.step, parseInt(e.target.value) || f.step) }))}
                          className="flex-1 text-center text-sm font-bold bg-secondary/60 rounded-lg outline-none py-1"
                        />
                        <button
                          onClick={() => setGoalDraft(prev => ({ ...prev, [f.key]: prev[f.key] + f.step }))}
                          className="w-7 h-7 rounded-lg bg-secondary text-sm font-bold flex items-center justify-center active:scale-90 transition-transform shrink-0"
                        >+</button>
                        <span className="text-[10px] text-muted-foreground w-6 shrink-0">{f.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save / Cancel */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setNutritionCurrent({ ...currentDraft, date: todayStr() });
                      setNutritionGoals(goalDraft);
                      setEditingNutrition(false);
                      toast.success('Nutrition updated!');
                    }}
                    className="flex-1 gradient-primary text-primary-foreground py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                  <button
                    onClick={() => { setEditingNutrition(false); setGoalDraft(nutritionGoals); setCurrentDraft(nutritionCurrent); }}
                    className="flex-1 bg-secondary text-secondary-foreground py-2.5 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>


      {/* PERSONAL INFO */}
      <motion.div variants={item} className="glass-card overflow-hidden mb-3">
        <button onClick={() => toggleSection('personal')} className="w-full flex items-center gap-3 p-3 sm:p-3.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-info flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-info-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">Personal Info</p>
            <p className="text-[10px] text-muted-foreground">Name, age, occupation & more</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'personal' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {expandedSection === 'personal' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-3 sm:px-3.5 pb-3.5 space-y-2">
                {editingProfile ? (
                  <>
                    {[
                      { icon: User, label: 'Name', field: 'name' as const, gradient: 'gradient-primary' },
                      { icon: Calendar, label: 'Age', field: 'age' as const, gradient: 'gradient-info' },
                      { icon: Briefcase, label: 'Occupation', field: 'occupation' as const, gradient: 'gradient-violet' },
                      { icon: Heart, label: 'Household Size', field: 'householdSize' as const, gradient: 'gradient-coral' },
                      { icon: MapPin, label: 'Location', field: 'location' as const, gradient: 'gradient-warm' },
                    ].map((f, i) => (
                      <motion.div key={f.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-secondary/60">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${f.gradient} flex items-center justify-center shrink-0`}>
                          <f.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase">{f.label}</p>
                          <input
                            value={profile[f.field]}
                            onChange={e => setProfile(prev => ({ ...prev, [f.field]: e.target.value }))}
                            placeholder={`Enter ${f.label.toLowerCase()}...`}
                            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/50"
                          />
                        </div>
                      </motion.div>
                    ))}
                    <div className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl bg-secondary/60">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-violet flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase">Bio</p>
                        <textarea
                          value={profile.bio}
                          onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="w-full bg-transparent text-sm font-medium outline-none resize-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="w-full gradient-primary text-primary-foreground py-2.5 sm:py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-glow"
                    >
                      <Save className="w-4 h-4" /> Save Profile
                    </button>
                  </>
                ) : (
                  <>
                    {[
                      { icon: User, label: 'Name', value: profile.name, gradient: 'gradient-primary' },
                      { icon: Calendar, label: 'Age', value: profile.age, gradient: 'gradient-info' },
                      { icon: Briefcase, label: 'Occupation', value: profile.occupation, gradient: 'gradient-violet' },
                      { icon: Heart, label: 'Household', value: `${profile.householdSize} people`, gradient: 'gradient-coral' },
                      { icon: MapPin, label: 'Location', value: profile.location || 'Not set', gradient: 'gradient-warm' },
                      { icon: FileText, label: 'Bio', value: profile.bio || 'Not set', gradient: 'gradient-violet' },
                    ].map((f, i) => (
                      <motion.div key={f.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-secondary/60">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${f.gradient} flex items-center justify-center shrink-0`}>
                          <f.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase">{f.label}</p>
                          <p className={`text-sm font-semibold truncate ${f.value === 'Not set' ? 'text-muted-foreground' : ''}`}>{f.value}</p>
                        </div>
                      </motion.div>
                    ))}
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="w-full bg-secondary text-secondary-foreground py-2.5 sm:py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <Edit3 className="w-4 h-4" /> Edit Profile
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* DIETARY PREFERENCES */}
      <motion.div variants={item} className="glass-card overflow-hidden mb-3">
        <button onClick={() => toggleSection('diet')} className="w-full flex items-center gap-3 p-3 sm:p-3.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">Diet & Restrictions</p>
            <p className="text-[10px] text-muted-foreground">Diet type, allergies & dislikes</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'diet' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {expandedSection === 'diet' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-3 sm:px-3.5 pb-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Diet Type</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {dietOptions.map(d => (
                      <button key={d} onClick={() => setPrefs(prev => ({ ...prev, diet: d }))}
                        className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all ${prefs.diet === d ? 'gradient-primary text-primary-foreground shadow-glow scale-105' : 'bg-secondary/80 text-secondary-foreground'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-destructive" /> Allergies</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {allergyOptions.map(a => (
                      <button key={a} onClick={() => toggleMulti('allergies', a)}
                        className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all flex items-center gap-1 ${prefs.allergies.includes(a) ? 'bg-destructive/15 text-destructive border border-destructive/20' : 'bg-secondary/80 text-secondary-foreground'}`}>
                        {prefs.allergies.includes(a) && <Check className="w-3 h-3" />}{a}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">🚫 Foods I Don't Like</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {prefs.dislikedFoods.map(f => (
                      <span key={f} className="text-xs bg-secondary/80 text-secondary-foreground px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                        {f}
                        <button onClick={() => removeDisliked(f)} className="text-muted-foreground hover:text-destructive transition-colors">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={dislikedInput} onChange={e => setDislikedInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDisliked()} maxLength={50}
                      placeholder="Add a food..." className="flex-1 min-w-0 bg-secondary/60 rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
                    <button onClick={addDisliked} className="gradient-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-semibold shrink-0">Add</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CUISINE PREFERENCES */}
      <motion.div variants={item} className="glass-card overflow-hidden mb-3">
        <button onClick={() => toggleSection('cuisine')} className="w-full flex items-center gap-3 p-3 sm:p-3.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-warm flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-4 h-4 text-warning-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">Cuisine Preferences</p>
            <p className="text-[10px] text-muted-foreground">Your favorite cuisines</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'cuisine' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {expandedSection === 'cuisine' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-1.5 sm:gap-2 px-3 sm:px-3.5 pb-4">
                {cuisineOptions.map(c => (
                  <button key={c} onClick={() => toggleMulti('favoriteCuisines', c)}
                    className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all flex items-center gap-1 ${prefs.favoriteCuisines.includes(c) ? 'gradient-primary text-primary-foreground shadow-glow scale-105' : 'bg-secondary/80 text-secondary-foreground'}`}>
                    {prefs.favoriteCuisines.includes(c) && <Check className="w-3 h-3" />}{c}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* COOKING & PLANNING */}
      <motion.div variants={item} className="glass-card overflow-hidden mb-3">
        <button onClick={() => toggleSection('cooking')} className="w-full flex items-center gap-3 p-3 sm:p-3.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-coral flex items-center justify-center shrink-0">
            <ChefHat className="w-4 h-4 text-coral-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">Cooking & Planning</p>
            <p className="text-[10px] text-muted-foreground">Time, skill level & prep days</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'cooking' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {expandedSection === 'cooking' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-3 sm:px-3.5 pb-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-info" /> Max Cooking Time</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {cookingTimeOptions.map(t => (
                      <button key={t} onClick={() => setPrefs(prev => ({ ...prev, cookingTime: t }))}
                        className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all ${prefs.cookingTime === t ? 'gradient-info text-info-foreground' : 'bg-secondary/80 text-secondary-foreground'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-violet" /> Planning Time</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {planningTimeOptions.map(t => (
                      <button key={t} onClick={() => setPrefs(prev => ({ ...prev, planningTime: t }))}
                        className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all ${prefs.planningTime === t ? 'gradient-violet text-violet-foreground' : 'bg-secondary/80 text-secondary-foreground'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-warning" /> Cooking Skill</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {skillOptions.map(s => (
                      <button key={s} onClick={() => setPrefs(prev => ({ ...prev, cookingSkill: s }))}
                        className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all ${prefs.cookingSkill === s ? 'gradient-warm text-warning-foreground' : 'bg-secondary/80 text-secondary-foreground'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">📅 Meal Prep Days</p>
                  <div className="flex gap-1 sm:gap-1.5">
                    {daysOfWeek.map(d => (
                      <button key={d} onClick={() => toggleMulti('mealPrepDays', d)}
                        className={`flex-1 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-semibold transition-all ${prefs.mealPrepDays.includes(d) ? 'gradient-primary text-primary-foreground shadow-sm' : 'bg-secondary/80 text-secondary-foreground'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* FITNESS & BUDGET */}
      <motion.div variants={item} className="glass-card overflow-hidden mb-3">
        <button onClick={() => toggleSection('goals')} className="w-full flex items-center gap-3 p-3 sm:p-3.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-violet flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-violet-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">Goals & Budget</p>
            <p className="text-[10px] text-muted-foreground">Fitness goals & weekly budget</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'goals' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {expandedSection === 'goals' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-3 sm:px-3.5 pb-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-violet" /> Fitness Goal</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {fitnessGoals.map(g => (
                      <button key={g} onClick={() => setPrefs(prev => ({ ...prev, fitnessGoal: g }))}
                        className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all ${prefs.fitnessGoal === g ? 'gradient-violet text-violet-foreground' : 'bg-secondary/80 text-secondary-foreground'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-success" /> Weekly Budget</p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {budgetOptions.map(b => (
                      <button key={b} onClick={() => setPrefs(prev => ({ ...prev, budget: b }))}
                        className={`text-xs font-medium px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all ${prefs.budget === b ? 'gradient-primary text-primary-foreground' : 'bg-secondary/80 text-secondary-foreground'}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Settings — with teal background tint */}
      <motion.div variants={item} className="rounded-2xl overflow-hidden mb-3 border border-border bg-card">
        <button onClick={() => toggleSection('settings')} className="w-full flex items-center gap-3 p-3 sm:p-3.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-teal flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">Settings</p>
            <p className="text-[10px] text-muted-foreground">Theme, notifications & more</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSection === 'settings' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {expandedSection === 'settings' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-3 sm:px-3.5 pb-4 space-y-2">
                {[
                  { icon: Moon, label: 'Dark Mode', description: 'Switch between light and dark themes', key: 'darkMode' as const, gradient: 'gradient-violet' },
                  { icon: Volume2, label: 'Sound Effects', description: 'Play sounds for actions and alerts', key: 'soundEffects' as const, gradient: 'gradient-info' },
                  { icon: Globe, label: 'Metric Units', description: 'Use grams/kg instead of oz/lbs', key: 'metricUnits' as const, gradient: 'gradient-primary' },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => toggleSetting(s.key)}
                    className="w-full p-2.5 sm:p-3 rounded-xl bg-card/80 flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                  >
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${s.gradient} flex items-center justify-center shrink-0`}>
                      <s.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{s.label}</p>
                      <p className="text-[10px] text-muted-foreground hidden sm:block">{s.description}</p>
                    </div>
                    <div className={`w-10 h-5.5 sm:w-11 sm:h-6 rounded-full flex items-center transition-colors shrink-0 ${settings[s.key] ? 'bg-[hsl(var(--teal))]' : 'bg-muted'}`}>
                      <motion.div
                        layout
                        className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-card shadow-md mx-0.5"
                        animate={{ x: settings[s.key] ? 18 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </button>
                ))}

                {/* Notifications opt-in */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-card/80 space-y-2">
                  <button
                    onClick={() => toggleSetting('notifications')}
                    className="w-full flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-coral flex items-center justify-center shrink-0">
                      <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">Push Notifications</p>
                      <p className="text-[10px] text-muted-foreground">Alerts for expiring food & meal reminders</p>
                    </div>
                    <div className={`w-10 h-5.5 sm:w-11 sm:h-6 rounded-full flex items-center transition-colors shrink-0 ${settings.notifications ? 'bg-[hsl(var(--teal))]' : 'bg-muted'}`}>
                      <motion.div layout className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-card shadow-md mx-0.5" animate={{ x: settings.notifications ? 18 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    </div>
                  </button>
                  {settings.notifications && (
                    <div className="ml-10 sm:ml-11 p-2.5 rounded-lg bg-secondary/60 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={notifPhone}
                          onChange={e => setNotifPhone(e.target.value)}
                          placeholder="Phone number for text alerts (optional)"
                          className="flex-1 text-xs bg-secondary rounded-lg px-2.5 py-2 outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      {notifPhone.trim() && !notifPhoneConfirmed && (
                        <button
                          onClick={() => { setNotifPhoneConfirmed(true); toast.success('Text notifications enabled! 📱'); }}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" /> Confirm Phone
                        </button>
                      )}
                      {notifPhoneConfirmed && (
                        <p className="text-[10px] text-[hsl(var(--teal))] flex items-center gap-1"><Check className="w-3 h-3" /> Text alerts enabled</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Email Updates opt-in */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-card/80 space-y-2">
                  <button
                    onClick={() => {
                      if (settings.emailUpdates) {
                        if (window.confirm('Are you sure you want to unsubscribe from email updates?')) {
                          toggleSetting('emailUpdates');
                          setEmailConfirmed(false);
                          setEmailInput('');
                        }
                      } else {
                        toggleSetting('emailUpdates');
                      }
                    }}
                    className="w-full flex items-center gap-3 active:scale-[0.98] transition-all text-left"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-warm flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">Email Updates</p>
                      <p className="text-[10px] text-muted-foreground">Weekly meal plan summaries via email</p>
                    </div>
                    <div className={`w-10 h-5.5 sm:w-11 sm:h-6 rounded-full flex items-center transition-colors shrink-0 ${settings.emailUpdates ? 'bg-[hsl(var(--teal))]' : 'bg-muted'}`}>
                      <motion.div layout className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-card shadow-md mx-0.5" animate={{ x: settings.emailUpdates ? 18 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    </div>
                  </button>
                  {settings.emailUpdates && (
                    <div className="ml-10 sm:ml-11 p-2.5 rounded-lg bg-secondary/60 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={e => setEmailInput(e.target.value)}
                          placeholder="Enter your email address"
                          className="flex-1 text-xs bg-secondary rounded-lg px-2.5 py-2 outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      {emailInput.trim() && !emailConfirmed && (
                        <button
                          onClick={() => {
                            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
                              toast.error('Please enter a valid email address');
                              return;
                            }
                            setEmailConfirmed(true);
                            toast.success(`Confirmation sent to ${emailInput}! Check your inbox 📧`);
                          }}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" /> Send Confirmation
                        </button>
                      )}
                      {emailConfirmed && (
                        <p className="text-[10px] text-[hsl(var(--teal))] flex items-center gap-1"><Check className="w-3 h-3" /> Email confirmed: {emailInput}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Language selector — dropdown */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-card/80">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-info flex items-center justify-center shrink-0">
                      <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-info-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">Language</p>
                    </div>
                    <select
                      value={settings.language}
                      onChange={e => setSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-secondary text-foreground outline-none border border-border appearance-none cursor-pointer min-w-[110px]"
                    >
                      <option value="Auto">🌐 Auto Detect</option>
                      {languageOptions.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Timezone selector — dropdown */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-card/80">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-warm flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">Time Zone</p>
                    </div>
                    <select
                      value={settings.timezone}
                      onChange={e => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg bg-secondary text-foreground outline-none border border-border appearance-none cursor-pointer min-w-[140px]"
                    >
                      {timezoneOptions.map(tz => (
                        <option key={tz} value={tz}>{tz === 'Auto' ? '🌐 Auto' : tz.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-destructive/5 border border-destructive/10 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-destructive">Reset Everything</p>
                      <p className="text-[10px] text-muted-foreground">Wipes all fridge items, settings, quiz answers, waste logs, and achievements. The guided tour will restart on next open.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResetDialog(true)}
                    className="w-full text-xs font-semibold py-2.5 rounded-xl bg-destructive text-destructive-foreground active:scale-[0.98] transition-transform"
                  >
                    Reset Everything
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Privacy Policy — separate card */}
      <motion.div variants={item} className="glass-card overflow-hidden mb-3">
        <button
          onClick={() => setSubSection(prev => prev === 'privacy' ? null : 'privacy')}
          className="w-full p-3 sm:p-3.5 flex items-center gap-3 active:scale-[0.98] transition-all text-left"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-violet flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-violet-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Privacy Policy</p>
            <p className="text-[10px] text-muted-foreground">How we handle your data</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${subSection === 'privacy' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {subSection === 'privacy' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-3 sm:px-3.5 pb-4 space-y-2.5">
                {[
                  { icon: Lock, label: 'Local Storage Only', desc: 'All your data stays on your device. Nothing is sent to external servers.', gradient: 'gradient-primary' },
                  { icon: Eye, label: 'No Tracking', desc: 'Zero cookies, analytics, or third-party trackers.', gradient: 'gradient-info' },
                  { icon: Database, label: 'No Data Collection', desc: 'We never collect, share, or sell personal information.', gradient: 'gradient-coral' },
                  { icon: Trash2, label: 'Full Control', desc: 'Delete all stored data anytime with one tap.', gradient: 'gradient-warm' },
                ].map(p => (
                  <motion.div key={p.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl bg-secondary/60">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${p.gradient} flex items-center justify-center shrink-0 mt-0.5`}>
                      <p.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground">{p.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Help & Support — separate card */}
      <motion.div variants={item} className="glass-card overflow-hidden mb-4">
        <button
          onClick={() => setSubSection(prev => prev === 'help' ? null : 'help')}
          className="w-full p-3 sm:p-3.5 flex items-center gap-3 active:scale-[0.98] transition-all text-left"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-info flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4 text-info-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Help & Support</p>
            <p className="text-[10px] text-muted-foreground">FAQ, contact us, report issues</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${subSection === 'help' ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence>
          {subSection === 'help' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-3 sm:px-3.5 pb-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-warning" /> Quick Answers
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { q: 'How do I scan my fridge?', a: 'Go to the Scan tab and use your camera to identify items.' },
                      { q: 'Can I customize my meal plan?', a: 'Yes! Drag and swap meals in the Planner tab.' },
                      { q: 'How is my grocery list generated?', a: "It's based on your planned meals and what's already in your fridge." },
                      { q: 'Is my data stored online?', a: 'No, all data is stored locally on your device.' },
                      { q: 'How do I change diet preferences?', a: 'Open "Diet & Restrictions" section above to update anytime.' },
                      { q: 'Can I share my meal plan?', a: 'Not yet. Sharing features are coming soon!' },
                      { q: 'Why are some recipes unavailable?', a: 'Results come from the web; availability depends on the source.' },
                      { q: 'How do I reset everything?', a: 'Use "Clear All Data" in Settings to start fresh.' },
                    ].map((faq, i) => (
                      <motion.details
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group rounded-xl bg-secondary/60 overflow-hidden"
                      >
                        <summary className="flex items-center justify-between px-3 py-2.5 cursor-pointer text-xs font-medium text-foreground list-none [&::-webkit-details-marker]:hidden">
                          {faq.q}
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform group-open:rotate-180 shrink-0 ml-2" />
                        </summary>
                        <p className="px-3 pb-2.5 text-[11px] text-muted-foreground leading-relaxed">{faq.a}</p>
                      </motion.details>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl p-3 text-center" style={{ background: 'var(--gradient-primary)' }}>
                    <Mail className="w-5 h-5 text-primary-foreground mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-primary-foreground">Contact Us</p>
                    <p className="text-[10px] text-primary-foreground/80 mt-0.5">support@fridgeiq.app</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="rounded-xl p-3 text-center" style={{ background: 'var(--gradient-coral)' }}>
                    <Bug className="w-5 h-5 text-coral-foreground mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-coral-foreground">Report a Bug</p>
                    <p className="text-[10px] text-coral-foreground/80 mt-0.5">Use feedback below</p>
                  </motion.div>
                </div>

                <div className="rounded-xl bg-secondary/60 p-3">
                  <p className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Send Feedback
                  </p>
                  {feedbackSent ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2 text-success py-3 justify-center">
                      <Check className="w-4 h-4" />
                      <span className="font-medium text-sm">Thanks for your feedback!</span>
                    </motion.div>
                  ) : (
                    <div className="space-y-2">
                      <select
                        value={feedbackForm.subject}
                        onChange={e => setFeedbackForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full bg-secondary text-secondary-foreground text-xs rounded-xl px-3 py-2 outline-none appearance-none"
                      >
                        <option value="">Select a topic...</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="general">General Feedback</option>
                        <option value="other">Other</option>
                      </select>
                      <textarea
                        value={feedbackForm.message}
                        onChange={e => setFeedbackForm(prev => ({ ...prev, message: e.target.value.slice(0, 500) }))}
                        placeholder="Tell us what's on your mind..."
                        rows={3}
                        maxLength={500}
                        className="w-full bg-secondary text-secondary-foreground text-xs rounded-xl px-3 py-2 outline-none resize-none placeholder:text-muted-foreground"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">{feedbackForm.message.length}/500</span>
                        <button
                          onClick={handleFeedbackSubmit}
                          disabled={!feedbackForm.subject || !feedbackForm.message.trim()}
                          className="gradient-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Send className="w-3 h-3" /> Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Reset Everything Confirmation Dialog */}
      <AnimatePresence>
        {showResetDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6"
            onClick={() => setShowResetDialog(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-sm glass-elevated rounded-3xl p-6 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-3">⚠️</div>
              <h3 className="text-base font-bold mb-1">Reset Everything?</h3>
              <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                This permanently deletes:
              </p>
              <ul className="text-sm text-muted-foreground mb-5 space-y-1 text-left bg-secondary/40 rounded-xl px-4 py-3">
                {[
                  'All fridge items and inventory',
                  'Food quiz answers and preferences',
                  'Waste tracking logs and stats',
                  'Nutrition goals and daily intake',
                  'Profile information and settings',
                  'Meal plans and grocery list',
                  'Achievements and unlock progress',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mb-5">The guided tour will restart the next time you open the app. This cannot be undone.</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowResetDialog(false)}
                  className="py-3 rounded-2xl bg-secondary text-secondary-foreground text-sm font-semibold active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    setShowResetDialog(false);
                    toast.success('App reset. Starting fresh!');
                    setTimeout(() => window.location.reload(), 600);
                  }}
                  className="py-3 rounded-2xl bg-destructive text-destructive-foreground text-sm font-bold active:scale-95 transition-transform"
                >
                  Yes, Reset All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileScreen;
