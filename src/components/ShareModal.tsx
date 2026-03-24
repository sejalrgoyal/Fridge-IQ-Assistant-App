import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, Link2, Printer, X, Send, Mail, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

type ShareMethod = 'share' | 'link' | 'download' | 'print' | 'whatsapp' | 'email' | 'sms' | 'facebook' | 'instagram';

export const doShare = async (title: string, text: string, method: ShareMethod) => {
  const encoded = encodeURIComponent(text);
  const encodedTitle = encodeURIComponent(title);
  if (method === 'print') {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>${title}</title><style>body{font-family:system-ui,sans-serif;padding:40px;max-width:700px;margin:0 auto;white-space:pre-wrap;line-height:1.6;font-size:14px}h1{font-size:20px;margin-bottom:20px}</style></head><body><h1>${title}</h1><pre>${text}</pre></body></html>`);
      printWindow.document.close();
      printWindow.print();
    }
  } else if (method === 'share') {
    try { if (navigator.share) { await navigator.share({ title, text }); return; } } catch {}
    await navigator.clipboard.writeText(text); toast('Copied to clipboard! 📋');
  } else if (method === 'link') {
    await navigator.clipboard.writeText(text); toast('Copied to clipboard! 📋');
  } else if (method === 'download') {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Downloaded! 📥');
  } else if (method === 'whatsapp') {
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  } else if (method === 'email') {
    window.open(`mailto:?subject=${encodedTitle}&body=${encoded}`, '_blank');
  } else if (method === 'sms') {
    window.open(`sms:?body=${encoded}`, '_blank');
  } else if (method === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encoded}`, '_blank');
  } else if (method === 'instagram') {
    await navigator.clipboard.writeText(text); toast('Copied! Paste into Instagram 📋');
  }
};

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  getText: () => string;
  accentGradient?: string;
  accentColor?: string;
}

const ShareModal = ({ open, onClose, title, getText, accentGradient = 'gradient-violet', accentColor = 'text-[hsl(var(--violet))]' }: ShareModalProps) => {
  const handle = (method: ShareMethod) => { doShare(title, getText(), method); onClose(); };

  const quickOptions: { method: ShareMethod; label: string; emoji?: string; icon?: typeof Mail; bg: string }[] = [
    { method: 'whatsapp', label: 'WhatsApp', emoji: '💬', bg: 'bg-[#25D366]/15 text-[#25D366]' },
    { method: 'email', label: 'Email', icon: Mail, bg: 'bg-info/15 text-info' },
    { method: 'sms', label: 'Messages', icon: MessageCircle, bg: 'bg-success/15 text-success' },
    { method: 'facebook', label: 'Facebook', emoji: '📘', bg: 'bg-[#1877F2]/15 text-[#1877F2]' },
    { method: 'instagram', label: 'Instagram', emoji: '📷', bg: 'bg-[#E4405F]/15 text-[#E4405F]' },
  ];

  const listOptions: { method: ShareMethod; label: string; desc: string; icon: typeof Mail }[] = [
    { method: 'share', label: 'Share via Device', desc: "Use your device's share menu", icon: Send },
    { method: 'link', label: 'Copy to Clipboard', desc: 'Copy as text', icon: Link2 },
    { method: 'download', label: 'Download as File', desc: 'Save as .txt file', icon: Download },
    { method: 'print', label: 'Print', desc: 'Open print dialog', icon: Printer },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-elevated overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold flex items-center gap-2"><Share2 className={`w-4 h-4 ${accentColor}`} /> Share {title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto">
              <div className="grid grid-cols-5 gap-2 pb-3 border-b border-border mb-2">
                {quickOptions.map(opt => (
                  <button key={opt.method} onClick={() => handle(opt.method)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-secondary active:scale-95 transition-all">
                    <div className={`w-10 h-10 rounded-full ${opt.bg} flex items-center justify-center`}>
                      {opt.emoji ? <span className="text-lg">{opt.emoji}</span> : opt.icon && <opt.icon className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{opt.label}</span>
                  </button>
                ))}
              </div>
              {listOptions.map(opt => (
                <button key={opt.method} onClick={() => handle(opt.method)} className="w-full bg-secondary/60 hover:bg-secondary p-3 flex items-center gap-3 active:scale-[0.98] transition-all text-left rounded-xl">
                  <div className={`w-9 h-9 rounded-lg ${accentGradient} flex items-center justify-center shrink-0`}><opt.icon className="w-4 h-4 text-primary-foreground" /></div>
                  <div><p className="text-sm font-semibold">{opt.label}</p><p className="text-[11px] text-muted-foreground">{opt.desc}</p></div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
