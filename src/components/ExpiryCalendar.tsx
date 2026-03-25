import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays, AlertCircle } from 'lucide-react';
import type { FridgeItem } from '@/data/mockData';

interface Props { items: FridgeItem[] }

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const urgencyConfig = (days: number) => {
  if (days <= 2)  return { bg: 'bg-red-500',     text: 'text-red-500',     badge: 'bg-red-500/15 text-red-600',     label: 'Expires soon!' };
  if (days <= 5)  return { bg: 'bg-orange-400',  text: 'text-orange-500',  badge: 'bg-orange-400/15 text-orange-600', label: 'Use this week' };
  if (days <= 14) return { bg: 'bg-yellow-400',  text: 'text-yellow-600',  badge: 'bg-yellow-400/15 text-yellow-700', label: 'Coming up' };
  return             { bg: 'bg-emerald-400', text: 'text-emerald-600', badge: 'bg-emerald-400/15 text-emerald-700', label: 'All good' };
};

const ExpiryCalendar: React.FC<Props> = ({ items }) => {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear]   = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const expiryMap = useMemo(() => {
    const map: Record<string, { items: FridgeItem[]; minDays: number }> = {};
    items.forEach(item => {
      const d = new Date(today);
      d.setDate(d.getDate() + item.daysLeft);
      if (d.getMonth() === month && d.getFullYear() === year) {
        const key = d.getDate().toString();
        if (!map[key]) map[key] = { items: [], minDays: item.daysLeft };
        map[key].items.push(item);
        map[key].minDays = Math.min(map[key].minDays, item.daysLeft);
      }
    });
    return map;
  }, [items, month, year, today]);

  const urgentThisMonth = Object.values(expiryMap).filter(v => v.minDays <= 2).reduce((acc, v) => acc + v.items.length, 0);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDay(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDay(null); };

  const selectedItems = selectedDay ? (expiryMap[selectedDay]?.items ?? []) : [];

  return (
    <div className="glass-elevated rounded-2xl p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-amber flex items-center justify-center shrink-0">
            <CalendarDays className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Expiration Calendar</p>
            {urgentThisMonth > 0 && (
              <p className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">
                <AlertCircle className="w-2.5 h-2.5" /> {urgentThisMonth} item{urgentThisMonth > 1 ? 's' : ''} expiring soon
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center active:scale-95 transition-transform">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-semibold w-28 text-center">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center active:scale-95 transition-transform">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => <p key={d} className="text-center text-[9px] font-semibold text-muted-foreground py-0.5">{d}</p>)}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: totalCells }).map((_, idx) => {
          const dayNum = idx - firstDay + 1;
          if (dayNum < 1 || dayNum > daysInMonth) return <div key={idx} className="aspect-square" />;

          const dayStr  = dayNum.toString();
          const expiry  = expiryMap[dayStr];
          const isToday = dayNum === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isPast  = new Date(year, month, dayNum) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const isSelected = selectedDay === dayStr;
          const cfg = expiry ? urgencyConfig(expiry.minDays) : null;

          return (
            <button
              key={idx}
              onClick={() => expiry ? setSelectedDay(isSelected ? null : dayStr) : undefined}
              disabled={!expiry}
              className={[
                'relative aspect-square flex flex-col items-center justify-start pt-0.5 rounded-lg transition-all text-[11px] font-medium',
                isPast ? 'opacity-40' : '',
                isSelected ? 'ring-2 ring-primary/60 bg-primary/10' : isToday ? 'bg-primary/8' : expiry ? 'hover:bg-secondary/60 cursor-pointer' : '',
                isToday ? 'font-bold text-primary' : '',
              ].join(' ')}
            >
              <span className="leading-none mt-1">{dayNum}</span>
              {cfg && (
                <div className={`w-3.5 h-1 rounded-full mt-0.5 ${cfg.bg}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        {([
          { bg: 'bg-red-500',     label: '0-2 days' },
          { bg: 'bg-orange-400',  label: '3-5 days' },
          { bg: 'bg-yellow-400',  label: '6-14 days' },
          { bg: 'bg-emerald-400', label: '15+ days' },
        ] as const).map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded-full ${l.bg}`} />
            <span className="text-[9px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Selected day item list */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-3 mb-1.5">
              Items expiring on {MONTHS[month]} {selectedDay}
            </p>
            <div className="space-y-1.5">
              {selectedItems.map(it => {
                const cfg = urgencyConfig(it.daysLeft);
                return (
                  <div key={it.id} className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2">
                    <span className="text-base">{it.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{it.name}</p>
                      <p className="text-[10px] text-muted-foreground">{it.quantity}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${cfg.badge}`}>
                      {it.daysLeft === 0 ? 'Today!' : `${it.daysLeft}d left`}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpiryCalendar;
