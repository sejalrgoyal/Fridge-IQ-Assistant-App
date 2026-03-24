import { Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tabConfigs } from '@/data/tabConfig';
import type { LucideIcon } from 'lucide-react';

interface NavTab {
  path: string;
  icon: LucideIcon;
  label: string;
  emoji: string;
  gradient: string;
  activeText: string;
}

// Explicit short labels — no ambiguity between "Scan" and "Scanner"
const SHORT_LABELS: Record<string, string> = {
  '/food-quiz': 'Quiz',
  '/chat': 'Chat',
  '/scan': 'Fridge',       // was "Scan"
  '/meals': 'Meals',
  '/planner': 'Planner',
  '/grocery': 'Grocery',
  '/health-scan': 'Health', // was "Scanner"
  '/print-share': 'Share',
  '/achievements': 'Achieve',
  '/profile': 'Profile',
};

// Per-tab text color when active — every tab a unique vibrant color
const ACTIVE_TEXT: Record<string, string> = {
  '/':             'text-emerald-500',  // Home — emerald green
  '/food-quiz':    'text-amber-500',    // Food Quiz — amber
  '/chat':         'text-orange-500',   // Chat — coral/orange
  '/scan':         'text-sky-500',      // Fridge Scan — sky blue
  '/meals':        'text-yellow-500',   // AI Meals — warm yellow
  '/planner':      'text-violet-500',   // Planner — violet
  '/grocery':      'text-lime-600',     // Grocery — lime green
  '/health-scan':  'text-rose-500',     // Health Scanner — rose
  '/print-share':  'text-indigo-500',   // Print & Share — indigo
  '/achievements': 'text-yellow-600',   // Achievements — gold
  '/profile':      'text-teal-500',     // Profile — teal
};

const INDICATOR_GRADIENT: Record<string, string> = {
  '/':             'gradient-primary',
  '/food-quiz':    'gradient-amber',
  '/chat':         'gradient-coral',
  '/scan':         'gradient-info',
  '/meals':        'gradient-warm',
  '/planner':      'gradient-violet',
  '/grocery':      'gradient-lime',
  '/health-scan':  'gradient-rose',
  '/print-share':  'gradient-indigo',
  '/achievements': 'gradient-gold',
  '/profile':      'gradient-teal',
};

const tabs: NavTab[] = [
  { path: '/', icon: Home, label: 'Home', emoji: '🏠', gradient: 'gradient-primary', activeText: ACTIVE_TEXT['/'] },
  ...tabConfigs.map(t => ({
    path: t.path,
    icon: t.icon,
    label: SHORT_LABELS[t.path] ?? t.label.split(' ').pop()!,
    emoji: t.emoji,
    gradient: t.gradient,
    activeText: ACTIVE_TEXT[t.path] ?? 'text-primary',
  })),
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-2xl border-t border-border/50 safe-bottom">
      <div className="flex items-center justify-between px-0.5 pt-1.5 pb-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const indicatorGradient = INDICATOR_GRADIENT[tab.path] ?? 'gradient-primary';

          return (
            <button
              key={tab.path}
              data-nav-route={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-0.5 flex-1 min-w-0 py-1 px-0.5"
            >
                {/* Active top indicator bar — uses each tab's own gradient */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className={`absolute -top-1.5 w-7 h-1 rounded-full ${indicatorGradient} shadow-glow`}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon — colored per tab when active */}
                <div className={`relative transition-all ${isActive ? 'scale-110' : 'scale-100'}`}>
                  <tab.icon
                    className={`w-[17px] h-[17px] sm:w-[19px] sm:h-[19px] transition-colors ${
                      isActive ? tab.activeText : 'text-muted-foreground'
                    }`}
                  />
                </div>

                {/* Label */}
                <span
                  className={`text-[8px] sm:text-[9px] font-semibold transition-colors truncate max-w-full leading-tight ${
                    isActive ? tab.activeText : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>

                {/* Active background pill — fixed subtle tint, never dark */}
                {isActive && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 rounded-xl bg-muted/60"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
