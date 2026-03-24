import { motion } from 'framer-motion';
import { useGreeting } from '@/hooks/useGreeting';
import type { LucideIcon } from 'lucide-react';

interface GreetingHeaderProps {
  onAvatarClick?: () => void;
  /** If provided, shows tab-specific header instead of user greeting */
  tabTitle?: string;
  tabDescription?: string;
  tabIcon?: LucideIcon;
  tabGradient?: string;
}

const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const GreetingHeader = ({ onAvatarClick, tabTitle, tabDescription, tabIcon: TabIcon, tabGradient }: GreetingHeaderProps) => {
  const { firstName, avatarEmoji, greeting, greetingEmoji, timeString } = useGreeting();

  const isTabHeader = !!tabTitle;

  return (
    <motion.div
      variants={item}
      initial="hidden"
      animate="show"
      className="relative rounded-3xl overflow-hidden mb-6 p-5"
      style={{ background: isTabHeader && tabGradient ? tabGradient : 'var(--gradient-primary)' }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 40%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative flex items-center justify-between">
        <div>
          {isTabHeader ? (
            <>
              <p className="text-xs text-primary-foreground/70">{tabDescription}</p>
              <h1 className="text-2xl font-bold tracking-tight text-primary-foreground">{tabTitle}</h1>
            </>
          ) : (
            <>
              <p className="text-xs text-primary-foreground/70 flex items-center gap-1">
                {greeting} {greetingEmoji}
                <span className="ml-1.5 text-primary-foreground/50">· {timeString}</span>
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-primary-foreground">{firstName}</h1>
            </>
          )}
        </div>
        {isTabHeader && TabIcon ? (
          <div className="w-12 h-12 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/20 shadow-lg">
            <TabIcon className="w-6 h-6 text-primary-foreground" />
          </div>
        ) : (
          <button
            onClick={onAvatarClick}
            className="w-12 h-12 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center text-2xl border border-primary-foreground/20 shadow-lg active:scale-95 transition-transform"
          >
            {avatarEmoji}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default GreetingHeader;
