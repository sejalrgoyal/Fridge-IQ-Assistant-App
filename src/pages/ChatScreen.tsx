import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';
import { chatSuggestions, initialChatMessages, type ChatMessage } from '@/data/mockData';
import { useGreeting } from '@/hooks/useGreeting';

const ChatScreen = () => {
  const { firstName, greeting, greetingEmoji, timeString } = useGreeting();

  const aiResponses: Record<string, { content: string; actions?: { label: string; type: string }[] }> = useMemo(() => ({
    "What can I make with eggs and rice?": {
      content: `Great combo, ${firstName}! Here are your best options:\n\n🍳 **Egg Fried Rice** (10 min, 380 cal)\nUse your eggs, rice, and any veggies you have.\n\n🍛 **Rice Bowl with Scrambled Eggs** (8 min, 320 cal)\nSimple, nutritious, and satisfying.\n\n🥘 **Egg Drop Soup with Rice** (12 min, 250 cal)\nComforting and light.`,
      actions: [{ label: 'Add Egg Fried Rice to plan', type: 'plan' }],
    },
    "High-protein meal under 15 min": {
      content: `Here are high-protein meals you can make quickly, ${firstName}:\n\n🍗 **Chicken & Spinach Scramble** (10 min, 420 cal, 38g protein)\nUses your chicken breast and spinach.\n\n🐟 **Quick Salmon Bowl** (12 min, 480 cal, 42g protein)\nYour salmon expires today. Perfect time!\n\n🥚 **Protein-Packed Egg Wrap** (8 min, 350 cal, 28g protein)`,
      actions: [{ label: 'Add to meal plan', type: 'plan' }],
    },
    "I don't feel like cooking": {
      content: `No worries, ${firstName}! Here are zero-effort options:\n\n🥣 **Greek Yogurt Parfait** (2 min)\nLayer yogurt with any toppings you have.\n\n🥑 **Avocado Toast** (3 min)\nSimple, filling, and delicious.\n\n💡 **Pro tip:** Your avocados are perfectly ripe today!`,
    },
    "What's expiring soon?": {
      content: `Here's what needs attention, ${firstName}:\n\n🚨 **Today:** Spinach (200g), Salmon (300g)\n⚠️ **In 2 days:** Milk (1L), Avocado (2 pcs)\n\n💡 I recommend making a **Salmon Bowl** tonight. It uses both the salmon and avocado!`,
      actions: [{ label: 'Plan Salmon Bowl tonight', type: 'plan' }],
    },
  }), [firstName]);

  const personalizedInitialMessages = useMemo(() => {
    const msgs = [...initialChatMessages];
    if (msgs.length > 0 && msgs[0].role === 'assistant') {
      msgs[0] = {
        ...msgs[0],
        content: `Hey ${firstName}! 👋 I'm your FridgeIQ assistant. I can help you figure out what to cook, suggest meals based on what's in your fridge, and reduce food waste. What are you in the mood for?`,
      };
    }
    return msgs;
  }, [firstName]);

  const [messages, setMessages] = useState<ChatMessage[]>(personalizedInitialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(prev => (prev.length <= 1 ? personalizedInitialMessages : prev));
  }, [personalizedInitialMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = aiResponses[text] || {
        content: `Great question, ${firstName}! Based on your fridge inventory, I'd suggest trying a **Spinach & Egg Scramble**. It's quick, uses expiring ingredients, and packs 320 calories with high protein. Want me to add it to your meal plan?`,
        actions: [{ label: 'Add to meal plan', type: 'plan' }],
      };
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        actions: response.actions,
      };
      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-5 pt-10 pb-3">
        <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: 'var(--gradient-coral)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-card/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70">{greeting} {greetingEmoji} · {timeString}</p>
              <h1 className="text-lg font-bold text-primary-foreground">Hey {firstName}!</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 pb-4 hide-scrollbar">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'gradient-coral text-primary-foreground rounded-br-md'
                  : 'glass-card rounded-bl-md'
              }`}>
                <div className="whitespace-pre-line">{msg.content.split('**').map((part, i) =>
                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                )}</div>
                {msg.actions && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {msg.actions.map((action, i) => (
                      <button key={i} className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary">
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-4 py-3 glass-card w-fit rounded-2xl rounded-bl-md mb-3">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
          </motion.div>
        )}

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 space-y-2">
            {chatSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSend(suggestion)}
                className="w-full text-left glass-elevated px-4 py-3 text-sm font-medium active:scale-[0.98] transition-all hover:shadow-md rounded-2xl"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-5 pb-6 pt-2">
        <div className="glass-elevated flex items-center gap-2 px-4 py-2.5 rounded-2xl">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask about meals, ingredients..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl gradient-coral flex items-center justify-center disabled:opacity-40 transition-all shadow-glow disabled:shadow-none"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
