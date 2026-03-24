import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Share2, CheckSquare, Square, ChevronDown, Mail, MessageCircle, Send, Link2, Download, X, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import GreetingHeader from '@/components/GreetingHeader';
import { getTabConfig } from '@/data/tabConfig';
import { weeklyPlan, meals, fridgeItems, groceryItems } from '@/data/mockData';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const fullDayNames: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };
const mealTypesMeta = [
  { key: 'breakfast' as const, emoji: '🌅', label: 'Breakfast', color: '#F59E0B' },
  { key: 'lunch' as const, emoji: '☀️', label: 'Lunch', color: '#3B82F6' },
  { key: 'dinner' as const, emoji: '🌙', label: 'Dinner', color: '#8B5CF6' },
];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

type ShareMethod = 'share' | 'link' | 'download' | 'print' | 'pdf' | 'whatsapp' | 'email' | 'sms' | 'facebook' | 'instagram';

// --- Styled HTML generators per section ---
const sectionColors: Record<string, { accent: string; light: string; gradient: string }> = {
  Meals: { accent: '#F59E0B', light: '#FEF3C7', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
  Plan: { accent: '#8B5CF6', light: '#EDE9FE', gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' },
  'Grocery List': { accent: '#6366F1', light: '#E0E7FF', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)' },
  Fridge: { accent: '#06B6D4', light: '#CFFAFE', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)' },
};

interface ContentSection {
  id: string;
  tabGroup: string;
  label: string;
  emoji: string;
  description: string;
  getText: () => string;
  getHtml: () => string;
}

const cardStyle = (borderColor: string) => `border-radius:12px;border:1px solid ${borderColor}20;padding:12px 16px;margin-bottom:8px;background:white;`;
const tagStyle = (bg: string, color: string) => `display:inline-block;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;background:${bg};color:${color};margin-right:4px;margin-bottom:4px;`;

const buildSections = (): ContentSection[] => {
  const now = new Date();
  const currentMonth = monthNames[now.getMonth()];
  const year = now.getFullYear();

  return [
    {
      id: 'meals-all', tabGroup: 'Meals', label: 'All Recipes', emoji: '🍽️',
      description: `${meals.length} recipes with time, calories & cuisine`,
      getText: () => { let t = ''; meals.forEach(m => { t += `• ${m.name} | ${m.time}, ${m.calories} cal (${m.cuisine})\n`; }); return t; },
      getHtml: () => {
        const c = sectionColors.Meals;
        let html = `<div style="margin-bottom:24px;">`;
        html += `<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:${c.gradient};display:flex;align-items:center;justify-content:center;"><span style="font-size:18px;">🍽️</span></div><div><h2 style="margin:0;font-size:18px;color:#1a1a1a;">All Recipes</h2><p style="margin:0;font-size:12px;color:#888;">${meals.length} recipes</p></div></div>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">`;
        meals.forEach(m => {
          html += `<div style="${cardStyle(c.accent)}">
            <div style="font-weight:700;font-size:13px;color:#1a1a1a;margin-bottom:4px;">${m.name}</div>
            <div style="font-size:11px;color:#666;">⏱ ${m.time} · 🔥 ${m.calories} cal</div>
            <div style="margin-top:6px;"><span style="${tagStyle(c.light, c.accent)}">${m.cuisine}</span>${m.tags.slice(0, 2).map(t => `<span style="${tagStyle('#f3f4f6', '#555')}">${t}</span>`).join('')}</div>
          </div>`;
        });
        html += `</div></div>`;
        return html;
      },
    },
    {
      id: 'meals-favorites', tabGroup: 'Meals', label: 'Favorite Recipes', emoji: '❤️',
      description: 'Your liked/favorited recipes',
      getText: () => {
        try {
          const saved = localStorage.getItem('fridgeiq_liked_meals');
          const liked = saved ? new Set(JSON.parse(saved)) : new Set();
          const favs = meals.filter(m => liked.has(m.id));
          if (favs.length === 0) return 'No favorites yet.';
          return favs.map(m => `• ${m.name} | ${m.time}, ${m.calories} cal (${m.cuisine})`).join('\n');
        } catch { return 'No favorites found.'; }
      },
      getHtml: () => {
        const c = sectionColors.Meals;
        let favs: typeof meals = [];
        try { const saved = localStorage.getItem('fridgeiq_liked_meals'); const liked = saved ? new Set(JSON.parse(saved)) : new Set(); favs = meals.filter(m => liked.has(m.id)); } catch {}
        let html = `<div style="margin-bottom:24px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#EF4444,#DC2626);display:flex;align-items:center;justify-content:center;"><span style="font-size:18px;">❤️</span></div><div><h2 style="margin:0;font-size:18px;color:#1a1a1a;">Favorite Recipes</h2><p style="margin:0;font-size:12px;color:#888;">${favs.length} favorites</p></div></div>`;
        if (favs.length === 0) { html += `<p style="text-align:center;color:#999;padding:20px;">No favorites yet</p>`; }
        else { favs.forEach(m => { html += `<div style="${cardStyle(c.accent)}"><span style="font-weight:700;font-size:13px;">${m.name}</span> <span style="font-size:11px;color:#666;">${m.time}, ${m.calories} cal (${m.cuisine})</span></div>`; }); }
        html += `</div>`;
        return html;
      },
    },
    {
      id: 'plan-weekly', tabGroup: 'Plan', label: 'Weekly Meal Plan', emoji: '📅',
      description: '7-day plan with breakfast, lunch & dinner',
      getText: () => { let t = ''; days.forEach(day => { t += `${day}: B: ${weeklyPlan[day].breakfast} | L: ${weeklyPlan[day].lunch} | D: ${weeklyPlan[day].dinner}\n`; }); return t; },
      getHtml: () => {
        const c = sectionColors.Plan;
        let html = `<div style="margin-bottom:24px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:${c.gradient};display:flex;align-items:center;justify-content:center;"><span style="font-size:18px;">📅</span></div><div><h2 style="margin:0;font-size:18px;color:#1a1a1a;">Weekly Meal Plan</h2><p style="margin:0;font-size:12px;color:#888;">7-day plan</p></div></div>`;
        html += `<table style="width:100%;border-collapse:collapse;font-size:12px;"><thead><tr style="background:${c.light};"><th style="padding:8px 10px;text-align:left;font-weight:700;border-bottom:2px solid ${c.accent};color:${c.accent};">Day</th>`;
        mealTypesMeta.forEach(mt => { html += `<th style="padding:8px 10px;text-align:left;font-weight:700;border-bottom:2px solid ${c.accent};color:${mt.color};">${mt.emoji} ${mt.label}</th>`; });
        html += `</tr></thead><tbody>`;
        days.forEach((day, i) => {
          const bg = i % 2 === 0 ? '#fafafa' : 'white';
          html += `<tr style="background:${bg};"><td style="padding:8px 10px;font-weight:700;border-bottom:1px solid #eee;color:#333;">${fullDayNames[day]}</td>`;
          mealTypesMeta.forEach(mt => { html += `<td style="padding:8px 10px;border-bottom:1px solid #eee;">${weeklyPlan[day][mt.key]}</td>`; });
          html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        return html;
      },
    },
    {
      id: 'plan-monthly', tabGroup: 'Plan', label: 'Monthly Meal Plan', emoji: '📆',
      description: `Monthly plan view with daily meals for ${currentMonth} ${year}`,
      getText: () => {
        const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
        const mealNames = meals.map(m => m.name);
        let t = '';
        for (let d = 1; d <= daysInMonth; d++) { t += `Day ${d}: ${mealNames[d % mealNames.length]} | ${mealNames[(d + 3) % mealNames.length]} | ${mealNames[(d + 7) % mealNames.length]}\n`; }
        return t;
      },
      getHtml: () => {
        const c = sectionColors.Plan;
        const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
        const mealNames = meals.map(m => m.name);
        let html = `<div style="margin-bottom:24px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:${c.gradient};display:flex;align-items:center;justify-content:center;"><span style="font-size:18px;">📆</span></div><div><h2 style="margin:0;font-size:18px;color:#1a1a1a;">Monthly Meal Plan</h2><p style="margin:0;font-size:12px;color:#888;">${currentMonth} ${year}</p></div></div>`;
        html += `<table style="width:100%;border-collapse:collapse;font-size:11px;"><thead><tr style="background:${c.light};"><th style="padding:6px 8px;text-align:left;font-weight:700;border-bottom:2px solid ${c.accent};color:${c.accent};width:40px;">Day</th><th style="padding:6px 8px;text-align:left;border-bottom:2px solid ${c.accent};color:#F59E0B;">🌅 Breakfast</th><th style="padding:6px 8px;text-align:left;border-bottom:2px solid ${c.accent};color:#3B82F6;">☀️ Lunch</th><th style="padding:6px 8px;text-align:left;border-bottom:2px solid ${c.accent};color:#8B5CF6;">🌙 Dinner</th></tr></thead><tbody>`;
        for (let d = 1; d <= daysInMonth; d++) {
          const bg = d % 2 === 0 ? '#fafafa' : 'white';
          html += `<tr style="background:${bg};"><td style="padding:5px 8px;font-weight:700;border-bottom:1px solid #eee;color:#333;">${d}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;">${mealNames[d % mealNames.length]}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;">${mealNames[(d + 3) % mealNames.length]}</td><td style="padding:5px 8px;border-bottom:1px solid #eee;">${mealNames[(d + 7) % mealNames.length]}</td></tr>`;
        }
        html += `</tbody></table></div>`;
        return html;
      },
    },
    {
      id: 'plan-checklist', tabGroup: 'Plan', label: 'Meal Prep Checklist', emoji: '🧑‍🍳',
      description: 'Weekly checklist for the current week',
      getText: () => {
        let prepDays = ['Sun', 'Wed'];
        try { const saved = localStorage.getItem('fridgeiq_profile_prefs'); if (saved) { const p = JSON.parse(saved); if (p.mealPrepDays) prepDays = p.mealPrepDays; } } catch {}
        let t = '';
        prepDays.forEach(day => {
          t += `${fullDayNames[day] || day}:\n`;
          t += `  ☐ Review recipes & ingredients\n`;
          (['breakfast', 'lunch', 'dinner'] as const).forEach(type => { const mn = weeklyPlan[day]?.[type]; if (mn) t += `  ☐ Prep ingredients for ${mn}\n`; });
          t += `  ☐ Prepare storage containers\n  ☐ Clean kitchen\n\n`;
        });
        return t;
      },
      getHtml: () => {
        const c = sectionColors.Plan;
        let prepDays = ['Sun', 'Wed'];
        try { const saved = localStorage.getItem('fridgeiq_profile_prefs'); if (saved) { const p = JSON.parse(saved); if (p.mealPrepDays) prepDays = p.mealPrepDays; } } catch {}
        let html = `<div style="margin-bottom:24px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:${c.gradient};display:flex;align-items:center;justify-content:center;"><span style="font-size:18px;">🧑‍🍳</span></div><div><h2 style="margin:0;font-size:18px;color:#1a1a1a;">Meal Prep Checklist</h2><p style="margin:0;font-size:12px;color:#888;">Weekly checklist</p></div></div>`;
        prepDays.forEach(day => {
          html += `<div style="margin-bottom:16px;"><div style="font-weight:700;font-size:14px;color:${c.accent};margin-bottom:8px;padding-bottom:4px;border-bottom:2px solid ${c.light};">📅 ${fullDayNames[day] || day}</div>`;
          const tasks = [`Review ${fullDayNames[day]}'s recipes & ingredients`];
          (['breakfast', 'lunch', 'dinner'] as const).forEach(type => { const mn = weeklyPlan[day]?.[type]; if (mn) tasks.push(`Prep ingredients for ${mn}`); });
          tasks.push('Prepare storage containers', 'Clean kitchen & organize fridge');
          tasks.forEach(task => {
            html += `<div style="${cardStyle(c.accent)}display:flex;align-items:center;gap:10px;"><div style="width:18px;height:18px;border-radius:4px;border:2px solid ${c.accent};flex-shrink:0;"></div><span style="font-size:13px;color:#333;">${task}</span></div>`;
          });
          html += `</div>`;
        });
        html += `</div>`;
        return html;
      },
    },
    {
      id: 'list-grocery', tabGroup: 'Grocery List', label: 'Full Grocery List', emoji: '🛒',
      description: `${groceryItems.length} items with categories & prices`,
      getText: () => {
        const total = groceryItems.reduce((sum, gi) => sum + gi.price, 0);
        let storeName = 'Your Store';
        try { const saved = localStorage.getItem('fridgeiq_selected_store'); if (saved) { const s = JSON.parse(saved); storeName = s.name || storeName; } } catch {}
        let t = `🛒 Grocery List: ${groceryItems.length} items\n📍 Store: ${storeName}\n💰 Total: $${total.toFixed(2)}\n${'─'.repeat(30)}\n\n`;
        groceryItems.forEach(gi => { t += `☐ ${gi.name} | ${gi.quantity} ($${gi.price.toFixed(2)}) [${gi.category}]\n`; });
        return t;
      },
      getHtml: () => {
        const c = sectionColors['Grocery List'];
        const total = groceryItems.reduce((sum, gi) => sum + gi.price, 0);
        const categories = [...new Set(groceryItems.map(gi => gi.category))];
        let storeName = 'Your Store';
        let storeAddress = '';
        try { const saved = localStorage.getItem('fridgeiq_selected_store'); if (saved) { const s = JSON.parse(saved); storeName = s.name || storeName; storeAddress = s.address || ''; } } catch {}
        let html = `<div style="margin-bottom:24px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:${c.gradient};display:flex;align-items:center;justify-content:center;"><span style="font-size:18px;">🛒</span></div><div><h2 style="margin:0;font-size:18px;color:#1a1a1a;">Grocery List</h2><p style="margin:0;font-size:12px;color:#888;">${groceryItems.length} items · $${total.toFixed(2)} total</p></div></div>`;
        html += `<div style="${cardStyle(c.accent)}background:${c.light};display:flex;align-items:center;gap:10px;margin-bottom:16px;"><span style="font-size:20px;">📍</span><div><div style="font-weight:700;font-size:13px;color:#1a1a1a;">${storeName}</div>${storeAddress ? `<div style="font-size:11px;color:#666;">${storeAddress}</div>` : ''}<div style="font-size:12px;font-weight:700;color:${c.accent};margin-top:2px;">Total: $${total.toFixed(2)}</div></div></div>`;
        categories.forEach(cat => {
          const catItems = groceryItems.filter(gi => gi.category === cat);
          const catTotal = catItems.reduce((sum, gi) => sum + gi.price, 0);
          html += `<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-weight:700;font-size:13px;color:${c.accent};">${cat}</span><span style="font-size:11px;color:#888;">${catItems.length} items · $${catTotal.toFixed(2)}</span></div>`;
          catItems.forEach(gi => {
            html += `<div style="${cardStyle(c.accent)}display:flex;align-items:center;gap:10px;"><div style="width:18px;height:18px;border-radius:4px;border:2px solid ${c.accent};flex-shrink:0;"></div><span style="flex:1;font-size:13px;color:#333;">${gi.name}</span><span style="font-size:11px;color:#888;">${gi.quantity}</span><span style="font-size:12px;font-weight:700;color:${c.accent};">$${gi.price.toFixed(2)}</span></div>`;
          });
          html += `</div>`;
        });
        html += `</div>`;
        return html;
      },
    },
    {
      id: 'list-missing', tabGroup: 'Grocery List', label: 'Missing Ingredients', emoji: '🔍',
      description: 'Items needed based on your weekly meal plan',
      getText: () => {
        const fridgeSet = new Set(fridgeItems.map(fi => fi.name.toLowerCase()));
        const neededMap = new Map<string, { name: string; quantity: string; meals: string[] }>();
        days.forEach(day => { (['breakfast', 'lunch', 'dinner'] as const).forEach(type => { const mealName = weeklyPlan[day][type]; const found = meals.find(m => m.name === mealName); if (!found) return; found.detailedIngredients.forEach(ing => { const key = ing.name.toLowerCase(); const inFridge = [...fridgeSet].some(fi => key.includes(fi) || fi.includes(key)); if (!inFridge) { if (neededMap.has(key)) { const ex = neededMap.get(key)!; if (!ex.meals.includes(mealName)) ex.meals.push(mealName); } else { neededMap.set(key, { name: ing.name, quantity: ing.quantity, meals: [mealName] }); } } }); }); });
        const list = Array.from(neededMap.values());
        if (list.length === 0) return 'You have everything! ✅';
        return list.map(gi => `• ${gi.name}: ${gi.quantity} (for: ${gi.meals.join(', ')})`).join('\n');
      },
      getHtml: () => {
        const c = sectionColors['Grocery List'];
        const fridgeSet = new Set(fridgeItems.map(fi => fi.name.toLowerCase()));
        const neededMap = new Map<string, { name: string; quantity: string; meals: string[] }>();
        days.forEach(day => { (['breakfast', 'lunch', 'dinner'] as const).forEach(type => { const mealName = weeklyPlan[day][type]; const found = meals.find(m => m.name === mealName); if (!found) return; found.detailedIngredients.forEach(ing => { const key = ing.name.toLowerCase(); const inFridge = [...fridgeSet].some(fi => key.includes(fi) || fi.includes(key)); if (!inFridge) { if (neededMap.has(key)) { const ex = neededMap.get(key)!; if (!ex.meals.includes(mealName)) ex.meals.push(mealName); } else { neededMap.set(key, { name: ing.name, quantity: ing.quantity, meals: [mealName] }); } } }); }); });
        const list = Array.from(neededMap.values());
        let html = `<div style="margin-bottom:24px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:${c.gradient};display:flex;align-items:center;justify-content:center;"><span style="font-size:18px;">🔍</span></div><div><h2 style="margin:0;font-size:18px;color:#1a1a1a;">Missing Ingredients</h2><p style="margin:0;font-size:12px;color:#888;">${list.length} items needed from weekly plan</p></div></div>`;
        if (list.length === 0) { html += `<div style="text-align:center;padding:24px;color:#22C55E;font-weight:600;">✅ You have everything!</div>`; }
        else { list.forEach(gi => { html += `<div style="${cardStyle(c.accent)}"><div style="font-weight:600;font-size:13px;color:#1a1a1a;">${gi.name} <span style="font-weight:400;color:#888;font-size:11px;">${gi.quantity}</span></div><div style="margin-top:4px;">${gi.meals.map(m => `<span style="${tagStyle(c.light, c.accent)}">${m}</span>`).join('')}</div></div>`; }); }
        html += `</div>`;
        return html;
      },
    },
    {
      id: 'fridge-items', tabGroup: 'Fridge', label: 'Fridge Inventory', emoji: '🧊',
      description: `${fridgeItems.length} items currently in your fridge`,
      getText: () => { return fridgeItems.map(fi => `${fi.emoji} ${fi.name} | ${fi.quantity} (${fi.category}) | ${fi.daysLeft} days left`).join('\n'); },
      getHtml: () => {
        const c = sectionColors.Fridge;
        let html = `<div style="margin-bottom:24px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;"><div style="width:36px;height:36px;border-radius:10px;background:${c.gradient};display:flex;align-items:center;justify-content:center;"><span style="font-size:18px;">🧊</span></div><div><h2 style="margin:0;font-size:18px;color:#1a1a1a;">Fridge Inventory</h2><p style="margin:0;font-size:12px;color:#888;">${fridgeItems.length} items</p></div></div>`;
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">`;
        fridgeItems.forEach(fi => {
          const urgency = fi.daysLeft <= 2 ? '#EF4444' : fi.daysLeft <= 5 ? '#F59E0B' : '#22C55E';
          html += `<div style="${cardStyle(c.accent)}display:flex;align-items:center;gap:10px;"><span style="font-size:20px;">${fi.emoji}</span><div style="flex:1;"><div style="font-weight:600;font-size:13px;color:#1a1a1a;">${fi.name}</div><div style="font-size:11px;color:#888;">${fi.quantity} · ${fi.category}</div></div><div style="text-align:right;"><span style="font-size:12px;font-weight:700;color:${urgency};">${fi.daysLeft}d</span></div></div>`;
        });
        html += `</div></div>`;
        return html;
      },
    },
  ];
};

// Build full styled HTML report
const buildReportHtml = (title: string, selectedHtmlSections: string[]) => {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;max-width:800px;margin:0 auto;padding:40px 32px;}
@media print{body{padding:20px;max-width:100%;}}
.report-header{text-align:center;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #8B5CF6;}
.report-header h1{font-size:26px;font-weight:800;background:linear-gradient(135deg,#8B5CF6,#6366F1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:4px;}
.report-header p{font-size:13px;color:#888;}
.section-divider{height:1px;background:linear-gradient(90deg,transparent,#ddd,transparent);margin:24px 0;}
table{border-radius:8px;overflow:hidden;}
</style></head><body>
<div class="report-header"><h1>${title}</h1><p>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
${selectedHtmlSections.join('<div class="section-divider"></div>')}
</body></html>`;
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const PrintShareScreen = () => {
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Meals', 'Plan', 'Grocery List', 'Fridge']));
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const sections = useMemo(buildSections, []);
  const groups = useMemo(() => {
    const g: Record<string, ContentSection[]> = {};
    sections.forEach(s => { if (!g[s.tabGroup]) g[s.tabGroup] = []; g[s.tabGroup].push(s); });
    return g;
  }, [sections]);

  const toggleSection = (id: string) => { setSelectedSections(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
  const toggleGroup = (group: string) => { const ids = groups[group].map(s => s.id); const all = ids.every(id => selectedSections.has(id)); setSelectedSections(prev => { const n = new Set(prev); ids.forEach(id => { if (all) n.delete(id); else n.add(id); }); return n; }); };
  const selectAll = () => { if (selectedSections.size === sections.length) setSelectedSections(new Set()); else setSelectedSections(new Set(sections.map(s => s.id))); };
  const toggleExpand = (group: string) => { setExpandedGroups(prev => { const n = new Set(prev); if (n.has(group)) n.delete(group); else n.add(group); return n; }); };

  const selected = useMemo(() => sections.filter(s => selectedSections.has(s.id)), [sections, selectedSections]);

  const getTitle = () => {
    if (selected.length === 0) return '';
    if (selected.length === 1) return selected[0].label;
    const groupNames = [...new Set(selected.map(s => s.tabGroup))];
    if (groupNames.length === 1) return groupNames[0];
    return groupNames.join(' + ');
  };

  const getPlainText = () => {
    if (selected.length === 0) return '';
    let t = `${getTitle()}\n${'─'.repeat(40)}\n\n`;
    selected.forEach(s => { t += `${s.emoji} ${s.label}\n${s.getText()}\n\n`; });
    return t.trim();
  };

  const getReportHtml = () => buildReportHtml(getTitle(), selected.map(s => s.getHtml()));

  const openStyledWindow = (mode: 'print' | 'pdf') => {
    if (selected.length === 0) { toast.error('Select at least one section'); return; }
    const pw = window.open('', '_blank');
    if (!pw) return;
    pw.document.write(getReportHtml());
    pw.document.close();
    if (mode === 'print') {
      setTimeout(() => pw.print(), 300);
    } else {
      toast.success('Use "Save as PDF" in the print dialog 📄');
      setTimeout(() => pw.print(), 300);
    }
  };

  const handleShare = (method: ShareMethod) => {
    if (selected.length === 0) { toast.error('Select at least one section'); return; }
    const title = getTitle();
    const text = getPlainText();
    const encoded = encodeURIComponent(text);
    const encodedTitle = encodeURIComponent(title);

    if (method === 'print') { openStyledWindow('print'); }
    else if (method === 'pdf') { openStyledWindow('pdf'); }
    else if (method === 'share') {
      (async () => { try { if (navigator.share) { await navigator.share({ title, text }); return; } } catch {} await navigator.clipboard.writeText(text); toast('Copied to clipboard! 📋'); })();
    } else if (method === 'link') {
      navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard! 📋'));
    } else if (method === 'download') {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`; a.click();
      URL.revokeObjectURL(url); toast('Downloaded! 📥');
    } else if (method === 'whatsapp') { window.open(`https://wa.me/?text=${encoded}`, '_blank'); }
    else if (method === 'email') { window.open(`mailto:?subject=${encodedTitle}&body=${encoded}`, '_blank'); }
    else if (method === 'sms') { window.open(`sms:?body=${encoded}`, '_blank'); }
    else if (method === 'facebook') { window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encoded}`, '_blank'); }
    else if (method === 'instagram') { navigator.clipboard.writeText(text).then(() => toast('Copied! Paste into Instagram 📋')); }
    setShowShareOptions(false);
  };

  const groupEmojis: Record<string, string> = { Meals: '🍽️', Plan: '📅', 'Grocery List': '🛒', Fridge: '🧊' };
  const groupGradients: Record<string, string> = { Meals: 'gradient-warm', Plan: 'gradient-violet', 'Grocery List': 'gradient-lime', Fridge: 'gradient-info' };

  const quickShareOptions: { method: ShareMethod; label: string; emoji?: string; icon?: typeof Mail; bg: string }[] = [
    { method: 'whatsapp', label: 'WhatsApp', emoji: '💬', bg: 'bg-[#25D366]/15 text-[#25D366]' },
    { method: 'email', label: 'Email', icon: Mail, bg: 'bg-info/15 text-info' },
    { method: 'sms', label: 'Messages', icon: MessageCircle, bg: 'bg-success/15 text-success' },
    { method: 'facebook', label: 'Facebook', emoji: '📘', bg: 'bg-[#1877F2]/15 text-[#1877F2]' },
    { method: 'instagram', label: 'Instagram', emoji: '📷', bg: 'bg-[#E4405F]/15 text-[#E4405F]' },
  ];

  const listShareOptions: { method: ShareMethod; label: string; desc: string; icon: typeof Mail }[] = [
    { method: 'share', label: 'Share via Device', desc: "Use your device's share menu", icon: Send },
    { method: 'link', label: 'Copy to Clipboard', desc: 'Copy as text', icon: Link2 },
    { method: 'download', label: 'Download as File', desc: 'Save as .txt file', icon: Download },
    { method: 'pdf', label: 'Export as PDF', desc: 'Save as styled PDF report', icon: FileText },
    { method: 'print', label: 'Print', desc: 'Open print dialog with styled report', icon: Printer },
  ];

  // Live preview HTML (inline, styled for dark/light)
  const previewHtml = useMemo(() => {
    if (selected.length === 0) return '';
    return selected.map(s => s.getHtml()).join('<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">');
  }, [selected]);

  return (
    <div className="px-5 pt-10 pb-32">
      {(() => { const t = getTabConfig('/print-share'); return t ? <GreetingHeader tabTitle={t.label} tabDescription={t.description} tabIcon={t.icon} tabGradient={t.headerGradient} /> : null; })()}

      {/* Select All */}
      <motion.div variants={item} className="mb-4">
        <button onClick={selectAll} className="w-full glass-elevated p-4 flex items-center gap-3 active:scale-[0.98] transition-transform rounded-2xl">
          <div className="w-10 h-10 rounded-xl gradient-rose flex items-center justify-center shrink-0">
            {selectedSections.size === sections.length ? <CheckSquare className="w-5 h-5 text-primary-foreground" /> : <Square className="w-5 h-5 text-primary-foreground" />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">{selectedSections.size === sections.length ? '✅ All Sections Selected' : '📋 Select All Sections'}</p>
            <p className="text-xs text-muted-foreground">{selectedSections.size} of {sections.length} sections selected</p>
          </div>
        </button>
      </motion.div>

      {/* Tab groups */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        {Object.entries(groups).map(([group, groupSections]) => {
          const allGroupSelected = groupSections.every(s => selectedSections.has(s.id));
          const someGroupSelected = groupSections.some(s => selectedSections.has(s.id));
          const isExpanded = expandedGroups.has(group);
          return (
            <motion.div key={group} variants={item}>
              <button onClick={() => toggleExpand(group)} className="w-full glass-elevated p-4 flex items-center gap-3 active:scale-[0.98] transition-transform rounded-2xl">
                <div className={`w-10 h-10 rounded-xl ${groupGradients[group] || 'gradient-indigo'} flex items-center justify-center shrink-0`}><span className="text-lg">{groupEmojis[group] || '📄'}</span></div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">{group}</p>
                  <p className="text-xs text-muted-foreground">{groupSections.length} section{groupSections.length > 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); toggleGroup(group); }} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${allGroupSelected ? 'bg-primary/20' : someGroupSelected ? 'bg-primary/10' : 'bg-secondary'}`}>
                    {allGroupSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="mt-2 space-y-1.5 pl-2">
                      {groupSections.map(section => (
                        <button key={section.id} onClick={() => toggleSection(section.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] ${selectedSections.has(section.id) ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/60 hover:bg-secondary'}`}>
                          {selectedSections.has(section.id) ? <CheckSquare className="w-4 h-4 text-primary shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground shrink-0" />}
                          <span className="text-base shrink-0">{section.emoji}</span>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs font-semibold">{section.label}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{section.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Live Preview Pane */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
            <div className="glass-elevated rounded-2xl overflow-hidden">
              <button onClick={() => setShowPreview(!showPreview)} className="w-full p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-xl gradient-indigo flex items-center justify-center shrink-0"><Eye className="w-5 h-5 text-primary-foreground" /></div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">📄 Live Preview</p>
                  <p className="text-xs text-muted-foreground">{selected.length} section{selected.length > 1 ? 's' : ''}: {getTitle()}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showPreview ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showPreview && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="border-t border-border">
                      <div className="p-1">
                        <div className="bg-white rounded-xl overflow-hidden shadow-inner max-h-[50vh] overflow-y-auto">
                          <div className="p-4 text-center border-b border-gray-100">
                            <h2 className="text-lg font-extrabold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}>{getTitle()}</h2>
                            <p className="text-[11px] text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                          <div className="p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky action bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-5 pb-2">
        <div className="max-w-lg mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-elevated rounded-2xl p-3 shadow-elevated border border-border">
            <div className="flex gap-2">
              <button onClick={() => { if (selected.length === 0) { toast.error('Select at least one section'); return; } setShowShareOptions(true); }}
                className="flex-1 gradient-indigo text-primary-foreground py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-glow disabled:opacity-40"
                disabled={selected.length === 0}>
                <Share2 className="w-4 h-4" /> Share ({selected.length})
              </button>
              <button onClick={() => openStyledWindow('pdf')}
                className="px-4 py-3 rounded-xl text-sm font-bold bg-secondary flex items-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
                disabled={selected.length === 0}>
                <FileText className="w-4 h-4" /> PDF
              </button>
              <button onClick={() => openStyledWindow('print')}
                className="px-4 py-3 rounded-xl text-sm font-bold bg-secondary flex items-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-40"
                disabled={selected.length === 0}>
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Share modal */}
      <AnimatePresence>
        {showShareOptions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowShareOptions(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-elevated overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between shrink-0">
                <h3 className="text-base font-bold flex items-center gap-2"><Share2 className="w-4 h-4 text-primary" /> Share {getTitle()}</h3>
                <button onClick={() => setShowShareOptions(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto">
                <div className="bg-secondary/60 rounded-xl p-3 mb-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Included sections</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.map(s => (<span key={s.id} className="text-[10px] font-medium px-2 py-1 rounded-lg bg-primary/10 text-primary">{s.emoji} {s.label}</span>))}
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 pb-3 border-b border-border mb-2">
                  {quickShareOptions.map(opt => (
                    <button key={opt.method} onClick={() => handleShare(opt.method)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-secondary active:scale-95 transition-all">
                      <div className={`w-10 h-10 rounded-full ${opt.bg} flex items-center justify-center`}>
                        {opt.emoji ? <span className="text-lg">{opt.emoji}</span> : opt.icon && <opt.icon className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{opt.label}</span>
                    </button>
                  ))}
                </div>
                {listShareOptions.map(opt => (
                  <button key={opt.method} onClick={() => handleShare(opt.method)} className="w-full bg-secondary/60 hover:bg-secondary p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left rounded-xl">
                    <div className="w-9 h-9 rounded-lg gradient-indigo flex items-center justify-center shrink-0"><opt.icon className="w-4 h-4 text-primary-foreground" /></div>
                    <div><p className="text-sm font-semibold">{opt.label}</p><p className="text-[11px] text-muted-foreground">{opt.desc}</p></div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PrintShareScreen;
