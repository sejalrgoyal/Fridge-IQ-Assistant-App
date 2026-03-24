import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowUpDown, Check, TrendingDown } from 'lucide-react';
import type { GroceryItem } from '@/data/mockData';

interface StoreInfo {
  id: string;
  name: string;
  chain: string;
  logo: string;
  priceMultiplier: number;
  distance: string;
}

interface Props {
  items: GroceryItem[];
  stores: StoreInfo[];
  onClose: () => void;
  onSelectStore: (storeId: string) => void;
}

const PriceComparisonTable = ({ items, stores, onClose, onSelectStore }: Props) => {
  const [sortBy, setSortBy] = useState<'name' | 'savings'>('savings');
  const uncheckedItems = items.filter(i => !i.checked);

  const storeTotals = useMemo(() => {
    return stores.map(store => ({
      ...store,
      total: uncheckedItems.reduce((sum, item) => sum + Math.round(item.price * store.priceMultiplier * 100) / 100, 0),
      items: uncheckedItems.map(item => ({
        ...item,
        storePrice: Math.round(item.price * store.priceMultiplier * 100) / 100,
      })),
    }));
  }, [stores, uncheckedItems]);

  const cheapestTotal = Math.min(...storeTotals.map(s => s.total));
  const mostExpensiveTotal = Math.max(...storeTotals.map(s => s.total));

  const sortedStores = [...storeTotals].sort((a, b) => a.total - b.total);

  const sortedItems = [...uncheckedItems].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    // Sort by max price difference
    const diffA = Math.max(...stores.map(s => a.price * s.priceMultiplier)) - Math.min(...stores.map(s => a.price * s.priceMultiplier));
    const diffB = Math.max(...stores.map(s => b.price * s.priceMultiplier)) - Math.min(...stores.map(s => b.price * s.priceMultiplier));
    return diffB - diffA;
  });

  const getCheapestForItem = (item: GroceryItem) => {
    let cheapest = Infinity;
    let cheapestStoreId = '';
    stores.forEach(s => {
      const price = Math.round(item.price * s.priceMultiplier * 100) / 100;
      if (price < cheapest) {
        cheapest = price;
        cheapestStoreId = s.id;
      }
    });
    return cheapestStoreId;
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
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute inset-x-0 bottom-0 max-h-[90vh] bg-card rounded-t-3xl border-t border-border overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-border shrink-0">
          <div>
            <h3 className="text-base font-bold">Price Comparison</h3>
            <p className="text-xs text-muted-foreground">{uncheckedItems.length} items across {stores.length} stores</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Store totals summary */}
        <div className="px-5 py-3 border-b border-border shrink-0">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Total by Store</p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {sortedStores.map((store, i) => (
              <button
                key={store.id}
                onClick={() => { onSelectStore(store.id); onClose(); }}
                className={`min-w-[100px] shrink-0 glass-card p-2.5 text-center active:scale-[0.98] transition-transform ${
                  i === 0 ? 'ring-2 ring-primary/30' : ''
                }`}
              >
                <span className="text-lg">{store.logo}</span>
                <p className="text-[11px] font-medium mt-1 truncate">{store.chain}</p>
                <p className={`text-sm font-bold mt-0.5 ${i === 0 ? 'text-primary' : ''}`}>
                  ${store.total.toFixed(2)}
                </p>
                {i === 0 && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary mt-1 inline-block">
                    BEST
                  </span>
                )}
                {i > 0 && (
                  <span className="text-[9px] text-destructive mt-1 inline-block">
                    +${(store.total - cheapestTotal).toFixed(2)}
                  </span>
                )}
                <p className="text-[9px] text-muted-foreground mt-0.5">{store.distance}</p>
              </button>
            ))}
          </div>
          {mostExpensiveTotal - cheapestTotal > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="font-semibold">You could save up to ${(mostExpensiveTotal - cheapestTotal).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Sort controls */}
        <div className="px-5 py-2 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setSortBy(sortBy === 'name' ? 'savings' : 'name')}
            className="text-[11px] font-medium text-muted-foreground flex items-center gap-1"
          >
            <ArrowUpDown className="w-3 h-3" />
            Sort by: {sortBy === 'name' ? 'Name' : 'Biggest savings'}
          </button>
        </div>

        {/* Comparison table */}
        <div className="overflow-y-auto flex-1 px-5 pb-6">
          <div className="space-y-2">
            {sortedItems.map(item => {
              const cheapestStoreId = getCheapestForItem(item);
              return (
                <div key={item.id} className="glass-card p-3">
                  <p className="text-sm font-semibold mb-2">{item.name} <span className="text-xs text-muted-foreground font-normal">({item.quantity})</span></p>
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                    {sortedStores.map(store => {
                      const price = Math.round(item.price * store.priceMultiplier * 100) / 100;
                      const isCheapest = store.id === cheapestStoreId;
                      return (
                        <div
                          key={store.id}
                          className={`min-w-[70px] shrink-0 p-2 rounded-lg text-center ${
                            isCheapest ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted/50'
                          }`}
                        >
                          <span className="text-sm">{store.logo}</span>
                          <p className={`text-xs font-bold mt-1 ${isCheapest ? 'text-primary' : ''}`}>
                            ${price.toFixed(2)}
                          </p>
                          {isCheapest && <Check className="w-3 h-3 text-primary mx-auto mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PriceComparisonTable;
