import { useState, useMemo, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, MapPin, Check, ShoppingBag, Route, DollarSign, ArrowRight, Search, Loader2 } from 'lucide-react';
import type { GroceryItem } from '@/data/mockData';

interface StoreInfo {
  id: string;
  name: string;
  chain: string;
  logo: string;
  priceMultiplier: number;
  distance: string;
  address: string;
  lat?: number;
  lng?: number;
}

interface StoreAssignment {
  storeId: string;
  itemIds: string[];
}

interface Props {
  items: GroceryItem[];
  stores: StoreInfo[];
  homeAddress: string;
  onClose: () => void;
  userCoords?: { lat: number; lng: number } | null;
  onSearchStore?: (query: string) => Promise<StoreInfo[]>;
}

const MultiStoreRoute = ({ items, stores: initialStores, homeAddress, onClose, userCoords, onSearchStore }: Props) => {
  const [allStores, setAllStores] = useState<StoreInfo[]>(initialStores);
  const uncheckedItems = items.filter(i => !i.checked);

  // Auto-optimize: assign each item to its cheapest store
  const autoOptimized = useMemo(() => {
    const assignments: Record<string, string[]> = {};
    uncheckedItems.forEach(item => {
      let cheapestPrice = Infinity;
      let cheapestStoreId = allStores[0]?.id || '';
      allStores.forEach(store => {
        const price = item.price * store.priceMultiplier;
        if (price < cheapestPrice) {
          cheapestPrice = price;
          cheapestStoreId = store.id;
        }
      });
      if (!assignments[cheapestStoreId]) assignments[cheapestStoreId] = [];
      assignments[cheapestStoreId].push(item.id);
    });
    return assignments;
  }, [uncheckedItems, allStores]);

  const [assignments, setAssignments] = useState<Record<string, string[]>>(autoOptimized);
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  // Store search state for manual mode
  const [searchingItemId, setSearchingItemId] = useState<string | null>(null);
  const [storeQuery, setStoreQuery] = useState('');
  const [storeResults, setStoreResults] = useState<StoreInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeStores = allStores.filter(s => assignments[s.id]?.length > 0);

  const toggleItemStore = (itemId: string, storeId: string) => {
    setAssignments(prev => {
      const next = { ...prev };
      // Remove from current store
      Object.keys(next).forEach(sid => {
        next[sid] = (next[sid] || []).filter(id => id !== itemId);
      });
      // Add to new store
      if (!next[storeId]) next[storeId] = [];
      next[storeId].push(itemId);
      return next;
    });
  };

  const getStoreTotal = (storeId: string) => {
    const store = allStores.find(s => s.id === storeId);
    if (!store) return 0;
    return (assignments[storeId] || []).reduce((sum, itemId) => {
      const item = uncheckedItems.find(i => i.id === itemId);
      return sum + (item ? Math.round(item.price * store.priceMultiplier * 100) / 100 : 0);
    }, 0);
  };

  const grandTotal = activeStores.reduce((sum, s) => sum + getStoreTotal(s.id), 0);
  const singleStoreTotal = allStores.length > 0
    ? uncheckedItems.reduce((sum, item) => sum + Math.round(item.price * allStores[0].priceMultiplier * 100) / 100, 0)
    : 0;
  const savings = singleStoreTotal - grandTotal;

  const handleStoreSearch = async () => {
    if (!storeQuery.trim() || !onSearchStore) return;
    setIsSearching(true);
    try {
      const results = await onSearchStore(storeQuery);
      setStoreResults(results);
    } catch {
      setStoreResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchedStore = (itemId: string, store: StoreInfo) => {
    // Add store to allStores if not already present
    setAllStores(prev => {
      if (prev.find(s => s.id === store.id)) return prev;
      return [...prev, store];
    });
    // Reassign item to this store
    toggleItemStore(itemId, store.id);
    // Close search
    setSearchingItemId(null);
    setStoreQuery('');
    setStoreResults([]);
  };

  const formatCoord = (v: number) => v.toFixed(7);

  // Build exact Google Maps /maps/dir/ URL with coordinates
  const getRouteUrl = (originLat?: number, originLng?: number, roundTrip = true) => {
    const oLat = originLat ?? userCoords?.lat;
    const oLng = originLng ?? userCoords?.lng;
    const originPart = (oLat != null && oLng != null)
      ? `${formatCoord(oLat)},${formatCoord(oLng)}`
      : '';

    const storeParts = activeStores
      .filter(s => s.lat != null && s.lng != null)
      .map(s => `${formatCoord(s.lat!)},${formatCoord(s.lng!)}`);

    // Round trip: origin → stores → back to origin
    const allParts = [originPart, ...storeParts, ...(roundTrip && originPart ? [originPart] : [])].filter(Boolean);
    const path = allParts.join('/');

    // Center on midpoint
    const lastStore = activeStores[activeStores.length - 1];
    const cLat = oLat != null && lastStore?.lat != null ? (oLat + lastStore.lat) / 2 : lastStore?.lat ?? 0;
    const cLng = oLng != null && lastStore?.lng != null ? (oLng + lastStore.lng) / 2 : lastStore?.lng ?? 0;

    return `https://www.google.com/maps/dir/${path}/@${formatCoord(cLat)},${formatCoord(cLng)},12z/data=!3m1!4b1!4m5!4m4!1m1!4e1!1m0!3e0!11m1!6b1?entry=ttu`;
  };

  const openRouteInNewTab = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const openedTab = window.open('about:blank', '_blank');

    const navigate = (url: string) => {
      if (openedTab) {
        openedTab.opener = null;
        openedTab.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    };

    if (userCoords) {
      navigate(getRouteUrl(userCoords.lat, userCoords.lng));
      return;
    }

    if (!navigator.geolocation) {
      navigate(getRouteUrl());
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => navigate(getRouteUrl(pos.coords.latitude, pos.coords.longitude)),
      () => navigate(getRouteUrl()),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
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
            <h3 className="text-base font-bold flex items-center gap-1.5">
              <Route className="w-4 h-4 text-primary" /> Multi-Store Route
            </h3>
            <p className="text-xs text-muted-foreground">
              {activeStores.length} store{activeStores.length !== 1 ? 's' : ''} · {uncheckedItems.length} items
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="px-5 pt-3 pb-2 flex gap-2 shrink-0">
          <button
            onClick={() => { setMode('auto'); setAssignments(autoOptimized); }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'auto' ? 'gradient-primary text-primary-foreground' : 'glass-card text-muted-foreground'
            }`}
          >
            <DollarSign className="w-3 h-3 inline mr-1" /> Auto-optimize
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              mode === 'manual' ? 'gradient-primary text-primary-foreground' : 'glass-card text-muted-foreground'
            }`}
          >
    <ShoppingBag className="w-3 h-3 inline mr-1" /> Custom
          </button>
        </div>

        {/* Savings banner */}
        {savings > 0.5 && (
          <div className="mx-5 mt-2 p-3 rounded-xl bg-primary/10 flex items-center gap-2">
            <span className="text-lg">💰</span>
            <div>
              <p className="text-xs font-bold text-primary">Save ${savings.toFixed(2)} with multi-store shopping!</p>
              <p className="text-[10px] text-muted-foreground">vs. buying everything at {allStores[0]?.chain}</p>
            </div>
          </div>
        )}

        {/* Route visualization */}
        <div className="px-5 py-3 shrink-0">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Your Route</p>
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar pb-1">
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-6 h-6 rounded-full bg-info/10 flex items-center justify-center">
                <MapPin className="w-3 h-3 text-info" />
              </div>
              <span className="text-[10px] font-medium">Home</span>
            </div>
            {activeStores.map((store, i) => (
              <div key={store.id} className="flex items-center gap-1 shrink-0">
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/50">
                  <span className="text-sm">{store.logo}</span>
                  <span className="text-[10px] font-medium">{store.chain}</span>
                  <span className="text-[9px] text-muted-foreground">${getStoreTotal(store.id).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store details with items */}
        <div className="overflow-y-auto flex-1 px-5 pb-4 space-y-3">
          {activeStores.map(store => {
            const storeItems = (assignments[store.id] || []).map(id => uncheckedItems.find(i => i.id === id)).filter(Boolean) as GroceryItem[];
            return (
              <div key={store.id} className="glass-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{store.logo}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{store.name}</p>
              <p className="text-[10px] text-muted-foreground">{store.distance} · {storeItems.length} item{storeItems.length !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">${getStoreTotal(store.id).toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  {storeItems.map(item => (
                    <div key={item.id}>
                    <div className="flex items-center gap-2 text-xs py-1">
                      <Check className="w-3 h-3 text-primary" />
                      <span className="flex-1">{item.name}</span>
                      <span className="text-muted-foreground">${(Math.round(item.price * store.priceMultiplier * 100) / 100).toFixed(2)}</span>
                      {mode === 'manual' && (
                        <button
                          onClick={() => {
                            setSearchingItemId(searchingItemId === item.id ? null : item.id);
                            setStoreQuery('');
                            setStoreResults([]);
                            setTimeout(() => searchInputRef.current?.focus(), 100);
                          }}
                          className="text-[10px] bg-secondary rounded-lg px-2 py-0.5 font-medium text-primary flex items-center gap-0.5"
                        >
                          <Search className="w-2.5 h-2.5" /> Move
                        </button>
                      )}
                    </div>
                    {/* Inline store search for this item */}
                    <AnimatePresence>
                      {mode === 'manual' && searchingItemId === item.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-1.5 pb-1 space-y-1.5">
                            <div className="flex gap-1.5">
                              <div className="flex-1 relative">
                                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                  ref={searchInputRef}
                                  value={storeQuery}
                                  onChange={e => setStoreQuery(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && handleStoreSearch()}
                                  placeholder="Search any store..."
                                  className="w-full bg-secondary/70 text-[11px] pl-7 pr-2 py-1.5 rounded-lg outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary/30"
                                />
                              </div>
                              <button
                                onClick={handleStoreSearch}
                                disabled={!storeQuery.trim() || isSearching}
                                className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-semibold disabled:opacity-50 shrink-0"
                              >
                                {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
                              </button>
                            </div>
                            {/* Search results */}
                            {storeResults.length > 0 && (
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {storeResults.map(sr => (
                                  <button
                                    key={sr.id}
                                    onClick={() => selectSearchedStore(item.id, sr)}
                                    className="w-full text-left px-2 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center gap-2 transition-colors"
                                  >
                                    <span className="text-sm">{sr.logo}</span>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-medium truncate">{sr.name}</p>
                                      <p className="text-[9px] text-muted-foreground truncate">{sr.distance} · {sr.address}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="px-5 py-4 border-t border-border space-y-2 shrink-0">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="font-medium text-muted-foreground">Grand Total</span>
            <span className="font-bold text-lg">${grandTotal.toFixed(2)}</span>
          </div>
          <a
            href={getRouteUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={openRouteInNewTab}
            className="w-full gradient-primary text-primary-foreground py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <Navigation className="w-4 h-4" />
            Open Round Trip in Google Maps
          </a>
          <p className="text-[9px] text-muted-foreground/60 text-center">💡 Right-click → Open link in new tab</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MultiStoreRoute;
