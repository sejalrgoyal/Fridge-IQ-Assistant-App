import { ClipboardList, MessageCircle, ScanLine, UtensilsCrossed, Calendar, ShoppingCart, Shield, User, Share2, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TabConfig {
  path: string;
  label: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  headerGradient: string;
  emoji: string;
  /** HSL base color for theming page content accents */
  accentClass: string;
}

export const tabConfigs: TabConfig[] = [
  {
    path: '/food-quiz',
    label: 'Food Quiz',
    description: 'Personalize your meals & grocery list',
    icon: ClipboardList,
    gradient: 'gradient-amber',
    headerGradient: 'var(--gradient-amber)',
    emoji: '📋',
    accentClass: 'amber',
  },
  {
    path: '/chat',
    label: 'AI Chat',
    description: 'Ask what to cook from your fridge',
    icon: MessageCircle,
    gradient: 'gradient-coral',
    headerGradient: 'var(--gradient-coral)',
    emoji: '💬',
    accentClass: 'coral',
  },
  {
    path: '/scan',
    label: 'Fridge Scan',
    description: 'Scan your fridge & barcodes to detect items',
    icon: ScanLine,
    gradient: 'gradient-info',
    headerGradient: 'var(--gradient-info)',
    emoji: '📸',
    accentClass: 'info',
  },
  {
    path: '/meals',
    label: 'AI Meals',
    description: 'Browse & search personalized recipes',
    icon: UtensilsCrossed,
    gradient: 'gradient-warm',
    headerGradient: 'var(--gradient-warm)',
    emoji: '🍽️',
    accentClass: 'warm',
  },
  {
    path: '/planner',
    label: 'Meal Plan',
    description: 'Weekly & monthly calendar planner',
    icon: Calendar,
    gradient: 'gradient-violet',
    headerGradient: 'var(--gradient-violet)',
    emoji: '📅',
    accentClass: 'violet',
  },
  {
    path: '/grocery',
    label: 'Grocery List',
    description: 'Auto-generated shopping list with prices',
    icon: ShoppingCart,
    gradient: 'gradient-lime',
    headerGradient: 'var(--gradient-lime)',
    emoji: '🛒',
    accentClass: 'lime',
  },
  {
    path: '/health-scan',
    label: 'Health Scanner',
    description: 'Scan or search products for health analysis',
    icon: Shield,
    gradient: 'gradient-rose',
    headerGradient: 'var(--gradient-rose)',
    emoji: '🛡️',
    accentClass: 'rose',
  },
  {
    path: '/print-share',
    label: 'Print & Share',
    description: 'Print or share content from any tab',
    icon: Share2,
    gradient: 'gradient-indigo',
    headerGradient: 'var(--gradient-indigo)',
    emoji: '🖨️',
    accentClass: 'indigo',
  },
  {
    path: '/achievements',
    label: 'Achievements',
    description: 'Badges, progress stats & activity log',
    icon: Trophy,
    gradient: 'gradient-gold',
    headerGradient: 'var(--gradient-gold)',
    emoji: '🏆',
    accentClass: 'gold',
  },
  {
    path: '/profile',
    label: 'Profile',
    description: 'Your preferences, stats & settings',
    icon: User,
    gradient: 'gradient-teal',
    headerGradient: 'var(--gradient-teal)',
    emoji: '👤',
    accentClass: 'teal',
  },
];

export const getTabConfig = (path: string): TabConfig | undefined =>
  tabConfigs.find((t) => t.path === path);
