import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Search, ExternalLink, Globe } from 'lucide-react';

interface RecipeCard {
  name: string;
  image: string;
  source: string;
  url: (q: string) => string;
  description: string;
}

const recipeCards: RecipeCard[] = [
  {
    name: 'Google Recipes',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    source: 'google.com',
    url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q + ' recipe')}`,
    description: 'Search millions of recipes across the web',
  },
  {
    name: 'AllRecipes',
    image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=300&fit=crop',
    source: 'allrecipes.com',
    url: (q: string) => `https://www.allrecipes.com/search?q=${encodeURIComponent(q)}`,
    description: 'Community-tested home cooking recipes',
  },
  {
    name: 'Food Network',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop',
    source: 'foodnetwork.com',
    url: (q: string) => `https://www.foodnetwork.com/search/${encodeURIComponent(q)}-`,
    description: 'Celebrity chef recipes & cooking shows',
  },
  {
    name: 'Tasty',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    source: 'tasty.co',
    url: (q: string) => `https://tasty.co/search?q=${encodeURIComponent(q)}`,
    description: 'Quick & fun video recipes',
  },
  {
    name: 'BBC Good Food',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop',
    source: 'bbcgoodfood.com',
    url: (q: string) => `https://www.bbcgoodfood.com/search?q=${encodeURIComponent(q)}`,
    description: 'Trusted recipes from the UK',
  },
  {
    name: 'Epicurious',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    source: 'epicurious.com',
    url: (q: string) => `https://www.epicurious.com/search/${encodeURIComponent(q)}`,
    description: 'Gourmet recipes & expert tips',
  },
  {
    name: 'YouTube Cooking',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    source: 'youtube.com',
    url: (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' recipe')}`,
    description: 'Video tutorials & cooking channels',
  },
  {
    name: 'Pinterest Recipes',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
    source: 'pinterest.com',
    url: (q: string) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q + ' recipe')}`,
    description: 'Visual recipe inspiration & ideas',
  },
];

interface Props {
  onClose: () => void;
}

const WebRecipeSearch = ({ onClose }: Props) => {
  const [query, setQuery] = useState('');

  const searchTerm = query.trim() || 'dinner ideas';

  const openSearch = (card: RecipeCard) => {
    window.open(card.url(searchTerm), '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute inset-x-0 bottom-0 h-[90vh] overflow-hidden bg-card rounded-t-3xl border-t border-border flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Fixed header */}
        <div className="px-5 pt-4 pb-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Search Recipes
            </h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="What do you want to cook? (e.g. 'chicken tikka masala')"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary text-sm border-none outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>
          {query.trim() && (
            <p className="text-xs text-muted-foreground mt-2">
              Searching for "<span className="text-foreground font-medium">{query}</span>". Tap a site below
            </p>
          )}
        </div>

        {/* Scrollable recipe source cards */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {recipeCards.map(card => (
              <button
                key={card.name}
                onClick={() => openSearch(card)}
                className="group rounded-2xl overflow-hidden bg-secondary border border-border text-left active:scale-[0.97] transition-transform"
              >
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs font-bold text-white drop-shadow-sm">{card.name}</p>
                  </div>
                  <div className="absolute top-2 right-2">
                    <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{card.description}</p>
                  <p className="text-[9px] text-primary font-medium mt-1">{card.source}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WebRecipeSearch;
