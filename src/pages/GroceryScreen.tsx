import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, MapPin, Plus, Trash2, Navigation, X, LocateFixed, Search, ChevronDown, Star, Store, Barcode, BarChart3, Route, ShoppingCart, Pencil, StickyNote, CheckCircle, ChevronRight } from 'lucide-react';

// Collapsible category component
const CollapsibleCategory = ({ category, items, renderItem }: { category: string; items: any[]; renderItem: (gi: any) => React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const categoryEmojis: Record<string, string> = {
    Produce: '🥬', Dairy: '🥛', Protein: '🥩', Grains: '🌾', Bakery: '🍞', Cereals: '🥣',
    Baking: '🧁', Condiments: '🧂', Oils: '🫒', Spices: '🌶️', Beverages: '☕', Snacks: '🍿',
    Frozen: '🧊', Canned: '🥫', Household: '🧹', Other: '📦',
  };
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-2 px-1 text-left active:scale-[0.99] transition-transform"
      >
        <span className="text-base">{categoryEmojis[category] || '📦'}</span>
        <span className="text-xs font-bold text-foreground flex-1">{category}</span>
        <span className="text-[10px] text-muted-foreground font-medium">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-2">
          {items.map(gi => renderItem(gi))}
        </div>
      )}
    </div>
  );
};
import { groceryItems as initialItems, type GroceryItem } from '@/data/mockData';
import { useGooglePlacesAutocomplete, type GoogleStore } from '@/hooks/useGooglePlacesAutocomplete';
import BarcodeScanner from '@/components/BarcodeScanner';
import PriceComparisonTable from '@/components/PriceComparisonTable';
import GreetingHeader from '@/components/GreetingHeader';
import { useNavigate } from 'react-router-dom';
import { getTabConfig } from '@/data/tabConfig';
import MultiStoreRoute from '@/components/MultiStoreRoute';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemAnim = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

function matchChain(storeName: string): { chain: string; logo: string; priceMultiplier: number; websiteUrl: string; cartUrl: string } {
  const name = storeName.toLowerCase();
  if (name.includes('whole foods')) return { chain: 'Whole Foods', logo: '🏪', priceMultiplier: 1.0, websiteUrl: 'https://www.wholefoodsmarket.com', cartUrl: 'https://www.amazon.com/alm/storefront?almBrandId=QW1hem9uIEZyZXNo' };
  if (name.includes("trader joe")) return { chain: "Trader Joe's", logo: '🛒', priceMultiplier: 0.82, websiteUrl: 'https://www.traderjoes.com', cartUrl: 'https://www.traderjoes.com/home/products' };
  if (name.includes('walmart')) return { chain: 'Walmart', logo: '🏬', priceMultiplier: 0.65, websiteUrl: 'https://www.walmart.com', cartUrl: 'https://www.walmart.com/grocery' };
  if (name.includes('costco')) return { chain: 'Costco', logo: '📦', priceMultiplier: 0.55, websiteUrl: 'https://www.costco.com', cartUrl: 'https://www.costco.com/grocery-household.html' };
  if (name.includes('aldi')) return { chain: 'ALDI', logo: '🛍️', priceMultiplier: 0.60, websiteUrl: 'https://www.aldi.us', cartUrl: 'https://shop.aldi.us' };
  if (name.includes('kroger')) return { chain: 'Kroger', logo: '🟦', priceMultiplier: 0.72, websiteUrl: 'https://www.kroger.com', cartUrl: 'https://www.kroger.com/shop/cart' };
  if (name.includes('target')) return { chain: 'Target', logo: '🎯', priceMultiplier: 0.78, websiteUrl: 'https://www.target.com', cartUrl: 'https://www.target.com/c/grocery/-/N-5xt1a' };
  if (name.includes('publix')) return { chain: 'Publix', logo: '🟢', priceMultiplier: 0.85, websiteUrl: 'https://www.publix.com', cartUrl: 'https://delivery.publix.com' };
  if (name.includes('h-e-b') || name.includes('heb')) return { chain: 'H-E-B', logo: '🔴', priceMultiplier: 0.70, websiteUrl: 'https://www.heb.com', cartUrl: 'https://www.heb.com/shop' };
  if (name.includes('safeway')) return { chain: 'Safeway', logo: '🔵', priceMultiplier: 0.80, websiteUrl: 'https://www.safeway.com', cartUrl: 'https://www.safeway.com/shop/deals.html' };
  if (name.includes('albertsons')) return { chain: 'Albertsons', logo: '🔵', priceMultiplier: 0.78, websiteUrl: 'https://www.albertsons.com', cartUrl: 'https://www.albertsons.com/shop/deals.html' };
  if (name.includes('vons')) return { chain: 'Vons', logo: '🔵', priceMultiplier: 0.80, websiteUrl: 'https://www.vons.com', cartUrl: 'https://www.vons.com/shop/deals.html' };
  if (name.includes('ralph')) return { chain: "Ralphs", logo: '🔴', priceMultiplier: 0.75, websiteUrl: 'https://www.ralphs.com', cartUrl: 'https://www.ralphs.com/shop/cart' };
  if (name.includes('wegmans')) return { chain: 'Wegmans', logo: '🟠', priceMultiplier: 0.88, websiteUrl: 'https://www.wegmans.com', cartUrl: 'https://shop.wegmans.com' };
  if (name.includes('sprouts')) return { chain: 'Sprouts', logo: '🌱', priceMultiplier: 0.85, websiteUrl: 'https://www.sprouts.com', cartUrl: 'https://shop.sprouts.com' };
  if (name.includes('food lion')) return { chain: 'Food Lion', logo: '🦁', priceMultiplier: 0.68, websiteUrl: 'https://www.foodlion.com', cartUrl: 'https://shop.foodlion.com' };
  if (name.includes('piggly')) return { chain: 'Piggly Wiggly', logo: '🐷', priceMultiplier: 0.70, websiteUrl: 'https://www.pigglywiggly.com', cartUrl: 'https://www.pigglywiggly.com' };
  if (name.includes('stop & shop') || name.includes('stop and shop')) return { chain: 'Stop & Shop', logo: '🛑', priceMultiplier: 0.78, websiteUrl: 'https://stopandshop.com', cartUrl: 'https://stopandshop.com/shop' };
  if (name.includes('meijer')) return { chain: 'Meijer', logo: '🟡', priceMultiplier: 0.72, websiteUrl: 'https://www.meijer.com', cartUrl: 'https://www.meijer.com/shopping/cart.html' };
  if (name.includes('winco')) return { chain: 'WinCo', logo: '💛', priceMultiplier: 0.58, websiteUrl: 'https://www.wincofoods.com', cartUrl: 'https://www.wincofoods.com' };
  return { chain: 'Grocery Store', logo: '🏪', priceMultiplier: 0.80, websiteUrl: '', cartUrl: '' };
}

type EnrichedStore = GoogleStore & ReturnType<typeof matchChain>;

// Smart categorization and pricing
const categoryMap: Record<string, { category: string; price: number; quantity: string }> = {
  // Produce
  apple: { category: 'Produce', price: 1.49, quantity: '1 lb' },
  banana: { category: 'Produce', price: 0.69, quantity: '1 bunch' },
  orange: { category: 'Produce', price: 1.29, quantity: '1 lb' },
  lemon: { category: 'Produce', price: 0.79, quantity: '3 pcs' },
  lime: { category: 'Produce', price: 0.59, quantity: '3 pcs' },
  avocado: { category: 'Produce', price: 1.99, quantity: '2 pcs' },
  tomato: { category: 'Produce', price: 2.49, quantity: '1 lb' },
  onion: { category: 'Produce', price: 1.29, quantity: '3 lb bag' },
  garlic: { category: 'Produce', price: 0.79, quantity: '1 head' },
  potato: { category: 'Produce', price: 3.99, quantity: '5 lb bag' },
  carrot: { category: 'Produce', price: 1.49, quantity: '1 lb' },
  broccoli: { category: 'Produce', price: 2.49, quantity: '1 head' },
  spinach: { category: 'Produce', price: 2.99, quantity: '5 oz' },
  lettuce: { category: 'Produce', price: 1.99, quantity: '1 head' },
  cucumber: { category: 'Produce', price: 0.99, quantity: '1 pc' },
  pepper: { category: 'Produce', price: 1.49, quantity: '1 pc' },
  mushroom: { category: 'Produce', price: 2.99, quantity: '8 oz' },
  celery: { category: 'Produce', price: 1.99, quantity: '1 bunch' },
  ginger: { category: 'Produce', price: 1.49, quantity: '1 pc' },
  berry: { category: 'Produce', price: 4.99, quantity: '6 oz' },
  strawberry: { category: 'Produce', price: 3.99, quantity: '1 lb' },
  blueberry: { category: 'Produce', price: 4.99, quantity: '6 oz' },
  grape: { category: 'Produce', price: 3.49, quantity: '1 lb' },
  mango: { category: 'Produce', price: 1.99, quantity: '1 pc' },
  // Dairy
  milk: { category: 'Dairy', price: 3.99, quantity: '1 gal' },
  cheese: { category: 'Dairy', price: 4.99, quantity: '8 oz' },
  yogurt: { category: 'Dairy', price: 1.79, quantity: '5.3 oz' },
  butter: { category: 'Dairy', price: 4.49, quantity: '1 lb' },
  cream: { category: 'Dairy', price: 3.99, quantity: '16 oz' },
  egg: { category: 'Dairy', price: 3.49, quantity: '12 pcs' },
  // Protein
  chicken: { category: 'Protein', price: 7.99, quantity: '1 lb' },
  beef: { category: 'Protein', price: 9.99, quantity: '1 lb' },
  salmon: { category: 'Protein', price: 11.99, quantity: '1 lb' },
  shrimp: { category: 'Protein', price: 9.99, quantity: '1 lb' },
  pork: { category: 'Protein', price: 5.99, quantity: '1 lb' },
  turkey: { category: 'Protein', price: 6.99, quantity: '1 lb' },
  tofu: { category: 'Protein', price: 2.99, quantity: '14 oz' },
  bacon: { category: 'Protein', price: 6.49, quantity: '16 oz' },
  fish: { category: 'Protein', price: 8.99, quantity: '1 lb' },
  tuna: { category: 'Protein', price: 1.99, quantity: '5 oz can' },
  // Grains
  rice: { category: 'Grains', price: 4.99, quantity: '2 lb' },
  pasta: { category: 'Grains', price: 1.89, quantity: '16 oz' },
  bread: { category: 'Bakery', price: 3.99, quantity: '1 loaf' },
  tortilla: { category: 'Bakery', price: 3.49, quantity: '10 ct' },
  oat: { category: 'Cereals', price: 4.99, quantity: '18 oz' },
  cereal: { category: 'Cereals', price: 4.49, quantity: '12 oz' },
  flour: { category: 'Baking', price: 3.49, quantity: '5 lb' },
  // Condiments
  'soy sauce': { category: 'Condiments', price: 3.49, quantity: '15 oz' },
  ketchup: { category: 'Condiments', price: 3.99, quantity: '20 oz' },
  mustard: { category: 'Condiments', price: 2.49, quantity: '12 oz' },
  mayo: { category: 'Condiments', price: 4.49, quantity: '30 oz' },
  vinegar: { category: 'Condiments', price: 2.99, quantity: '16 oz' },
  honey: { category: 'Condiments', price: 5.99, quantity: '12 oz' },
  oil: { category: 'Oils', price: 7.99, quantity: '500ml' },
  salt: { category: 'Spices', price: 1.49, quantity: '26 oz' },
  sugar: { category: 'Baking', price: 3.49, quantity: '4 lb' },
  // Beverages
  coffee: { category: 'Beverages', price: 8.99, quantity: '12 oz' },
  tea: { category: 'Beverages', price: 4.99, quantity: '20 ct' },
  juice: { category: 'Beverages', price: 3.99, quantity: '64 oz' },
  water: { category: 'Beverages', price: 4.99, quantity: '24 pk' },
  soda: { category: 'Beverages', price: 6.99, quantity: '12 pk' },
  // Snacks
  chips: { category: 'Snacks', price: 4.49, quantity: '10 oz' },
  crackers: { category: 'Snacks', price: 3.99, quantity: '8 oz' },
  nuts: { category: 'Snacks', price: 7.99, quantity: '16 oz' },
  granola: { category: 'Cereals', price: 4.99, quantity: '12 oz' },
  // Frozen
  'ice cream': { category: 'Frozen', price: 5.99, quantity: '1 pt' },
  pizza: { category: 'Frozen', price: 6.99, quantity: '1 pc' },
  // Canned
  beans: { category: 'Canned', price: 1.29, quantity: '15 oz' },
  corn: { category: 'Canned', price: 1.29, quantity: '15 oz' },
  soup: { category: 'Canned', price: 2.49, quantity: '10.5 oz' },
  // Household
  'paper towel': { category: 'Household', price: 8.99, quantity: '6 rolls' },
  'toilet paper': { category: 'Household', price: 9.99, quantity: '12 rolls' },
  detergent: { category: 'Household', price: 11.99, quantity: '64 oz' },
  soap: { category: 'Household', price: 4.99, quantity: '3 pk' },
};

const allCategories = ['Produce', 'Dairy', 'Protein', 'Grains', 'Bakery', 'Cereals', 'Baking', 'Condiments', 'Oils', 'Spices', 'Beverages', 'Snacks', 'Frozen', 'Canned', 'Household', 'Other'];

function smartCategorize(name: string): { category: string; price: number; quantity: string } {
  const lower = name.toLowerCase();
  // Exact match first
  if (categoryMap[lower]) return categoryMap[lower];
  // Partial match
  for (const [key, val] of Object.entries(categoryMap)) {
    if (lower.includes(key) || key.includes(lower)) return val;
  }
  // Default
  return { category: 'Other', price: Math.round((Math.random() * 6 + 1.5) * 100) / 100, quantity: '1' };
}

const GroceryScreen = () => {
  const navigate = useNavigate();
  // Load fridge items for "already have" cross-check
  const fridgeNames = (() => {
    try {
      const raw = localStorage.getItem('fridgeiq_fridge_items');
      if (!raw) return new Set<string>();
      const arr: { name: string }[] = JSON.parse(raw);
      return new Set(arr.map(i => i.name.toLowerCase()));
    } catch { return new Set<string>(); }
  })();

  const hasInFridge = (itemName: string) => {
    const n = itemName.toLowerCase();
    for (const fn of fridgeNames) {
      if (fn.includes(n) || n.includes(fn)) return true;
    }
    return false;
  };

  // Load restock suggestions from expiring items
  const [items, setItems] = useState<GroceryItem[]>(() => {
    const restockRaw = localStorage.getItem('fridgeiq_restock_list');
    if (!restockRaw) return initialItems;
    try {
      const restockNames: string[] = JSON.parse(restockRaw);
      const newItems = restockNames
        .filter(name => !initialItems.some(i => i.name.toLowerCase() === name.toLowerCase()))
        .map(name => {
          const smart = smartCategorize(name);
          return {
            id: `restock-${name}`,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            quantity: smart.quantity,
            price: smart.price,
            checked: false,
            category: smart.category,
            notes: '🔁 Restock',
          };
        });
      return [...initialItems, ...newItems];
    } catch { return initialItems; }
  });
  const [selectedStore, setSelectedStore] = useState<EnrichedStore | null>(null);
  const [showStoreSelector, setShowStoreSelector] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [showMultiStoreRoute, setShowMultiStoreRoute] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [storeConfirmed, setStoreConfirmed] = useState(false);

  // Location state
  const [userAddress, setUserAddress] = useState('');
  const [locationSet, setLocationSet] = useState(false);
  const [locating, setLocating] = useState(false);
  const [nearbyStores, setNearbyStores] = useState<EnrichedStore[]>([]);

  // Google Places autocomplete
  const { predictions, getPlacePredictions, clearPredictions, searchNearbyStores, searchByCurrentLocation, searchStoreByName } = useGooglePlacesAutocomplete();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [searchingStore, setSearchingStore] = useState(false);
  const [storeSearchResults, setStoreSearchResults] = useState<EnrichedStore[]>([]);
  const [showStoreSearch, setShowStoreSearch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const userCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAddressChange = (value: string) => {
    setUserAddress(value);
    if (value.trim().length >= 3) {
      getPlacePredictions(value);
      setShowSuggestions(true);
    } else {
      clearPredictions();
      setShowSuggestions(false);
    }
  };

  const enrichStores = (googleStores: GoogleStore[]) => {
    return googleStores.map(s => ({ ...s, ...matchChain(s.name) }));
  };

  const selectAddress = (address: string) => {
    setUserAddress(address);
    setShowSuggestions(false);
    clearPredictions();
    findStores(address);
  };

  const findStores = async (address: string) => {
    setLocating(true);
    try {
      const googleStores = await searchNearbyStores(address);
      const enriched = enrichStores(googleStores);
      setNearbyStores(enriched);
      setSelectedStore(enriched[0] || null);
      setLocationSet(true);
    } catch (err) {
      console.error('Failed to find stores:', err);
    } finally {
      setLocating(false);
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const { address, stores } = await searchByCurrentLocation();
      setUserAddress(`📍 ${address}`);
      const enriched = enrichStores(stores);
      setNearbyStores(enriched);
      setSelectedStore(enriched[0] || null);
      setLocationSet(true);
      // Save user coords from geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => { userCoordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
          () => {},
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
        );
      }
    } catch (err) {
      console.error('Location failed:', err);
    } finally {
      setLocating(false);
    }
  };

  const searchAddress = () => {
    if (!userAddress.trim()) return;
    setShowSuggestions(false);
    findStores(userAddress);
  };

  const handleStoreSearch = async () => {
    if (!storeSearchQuery.trim() || !userAddress.trim()) return;
    setSearchingStore(true);
    try {
      const results = await searchStoreByName(storeSearchQuery, userAddress);
      setStoreSearchResults(enrichStores(results));
    } catch (err) {
      console.error('Store search failed:', err);
    } finally {
      setSearchingStore(false);
    }
  };

  const selectSearchedStore = (store: EnrichedStore) => {
    setNearbyStores(prev => {
      const exists = prev.find(s => s.id === store.id);
      if (exists) return prev;
      return [...prev, store].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    });
    setSelectedStore(store);
    setShowStoreSearch(false);
    setStoreSearchQuery('');
    setStoreSearchResults([]);
  };

  const formatCoord = (value: number) => value.toFixed(7);

  const buildExactDirectionsUrl = (
    originLat: number,
    originLng: number,
    destinationLat: number,
    destinationLng: number
  ) => {
    const origin = `${formatCoord(originLat)},${formatCoord(originLng)}`;
    const destination = `${formatCoord(destinationLat)},${formatCoord(destinationLng)}`;
    const centerLat = formatCoord((originLat + destinationLat) / 2);
    const centerLng = formatCoord((originLng + destinationLng) / 2);

    return `https://www.google.com/maps/dir/${origin}/${destination}/@${centerLat},${centerLng},14z/data=!3m1!4b1!4m5!4m4!1m1!4e1!1m0!3e0!11m1!6b1?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D`;
  };

  const getDirectionsUrl = (store: EnrichedStore) =>
    userCoordsRef.current
      ? buildExactDirectionsUrl(userCoordsRef.current.lat, userCoordsRef.current.lng, store.lat, store.lng)
      : buildExactDirectionsUrl(store.lat, store.lng, store.lat, store.lng);

  const openDirectionsInExactFormat = (event: ReactMouseEvent<HTMLAnchorElement>, store: EnrichedStore) => {
    event.preventDefault();
    event.stopPropagation();

    const openedTab = window.open('about:blank', '_blank');
    const fallbackUrl = userCoordsRef.current
      ? buildExactDirectionsUrl(userCoordsRef.current.lat, userCoordsRef.current.lng, store.lat, store.lng)
      : buildExactDirectionsUrl(store.lat, store.lng, store.lat, store.lng);

    const navigateOpenedTab = (url: string) => {
      if (openedTab) {
        openedTab.opener = null;
        openedTab.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    };

    if (!navigator.geolocation) {
      navigateOpenedTab(fallbackUrl);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const exactUrl = buildExactDirectionsUrl(latitude, longitude, store.lat, store.lng);
        navigateOpenedTab(exactUrl);
      },
      () => {
        navigateOpenedTab(fallbackUrl);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  };

  const getStoreWebsiteUrl = (store: EnrichedStore) => {
    const storeWebsites: Record<string, string> = {
      Walmart: 'https://www.walmart.com',
      Target: 'https://www.target.com',
      Kroger: 'https://www.kroger.com',
      'Whole Foods': 'https://www.wholefoodsmarket.com',
      'Trader Joe\'s': 'https://www.traderjoes.com',
      Costco: 'https://www.costco.com',
      ALDI: 'https://www.aldi.us',
      Publix: 'https://www.publix.com',
      Safeway: 'https://www.safeway.com',
      'H-E-B': 'https://www.heb.com',
      Meijer: 'https://www.meijer.com',
      "Sam's Club": 'https://www.samsclub.com',
      'Food Lion': 'https://www.foodlion.com',
      Wegmans: 'https://www.wegmans.com',
      Sprouts: 'https://www.sprouts.com',
      Albertsons: 'https://www.albertsons.com',
      Vons: 'https://www.vons.com',
      Ralphs: 'https://www.ralphs.com',
      'Stop & Shop': 'https://www.stopandshop.com',
      WinCo: 'https://www.wincofoods.com',
      'Piggly Wiggly': 'https://www.pigglywiggly.com',
    };

    const chain = (store.chain || '').trim();
    return store.websiteUrl
      || storeWebsites[chain]
      || `https://www.google.com/search?q=${encodeURIComponent(`${store.name} official website`)}`;
  };

  const toggleItem = (id: string) => setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const addItem = () => {
    if (!newItemName.trim()) return;
    const smart = smartCategorize(newItemName.trim());
    setItems(prev => [...prev, {
      id: Date.now().toString(), name: newItemName.trim(), quantity: smart.quantity,
      price: smart.price, checked: false, category: smart.category,
    }]);
    setNewItemName('');
    setShowAddItem(false);
    setItemSearch('');
    setSearchSuggestions([]);
  };

  const addSearchItem = (name: string) => {
    const smart = smartCategorize(name);
    setItems(prev => [...prev, {
      id: Date.now().toString(), name, quantity: smart.quantity,
      price: smart.price, checked: false, category: smart.category,
    }]);
    setItemSearch('');
    setSearchSuggestions([]);
  };

  const handleItemSearch = (query: string) => {
    setItemSearch(query);
    setNewItemName(query);
    if (query.trim().length < 2) { setSearchSuggestions([]); return; }
    const q = query.toLowerCase();
    const matches = Object.keys(categoryMap).filter(k => k.includes(q) || q.includes(k)).slice(0, 6);
    setSearchSuggestions(matches.map(m => m.charAt(0).toUpperCase() + m.slice(1)));
  };

  const updateItem = (id: string, updates: Partial<GroceryItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const addScannedItem = (product: { name: string; category: string; price: number; quantity: string }) => {
    setItems(prev => [...prev, {
      id: Date.now().toString(), name: product.name, quantity: product.quantity,
      price: product.price, checked: false, category: product.category,
    }]);
    setShowBarcodeScanner(false);
  };

  const storePrice = (basePrice: number) => selectedStore ? Math.round(basePrice * selectedStore.priceMultiplier * 100) / 100 : basePrice;
  const total = items.filter(i => !i.checked).reduce((s, i) => s + storePrice(i.price), 0);
  const checkedCount = items.filter(i => i.checked).length;
  const cheapestStore = nearbyStores.length > 0 ? nearbyStores.reduce((a, b) => a.priceMultiplier < b.priceMultiplier ? a : b) : null;
  const cheapestTotal = cheapestStore ? items.filter(i => !i.checked).reduce((s, i) => s + Math.round(i.price * cheapestStore.priceMultiplier * 100) / 100, 0) : total;
  const savings = total - cheapestTotal;


  const renderItem = (gi: GroceryItem) => {
    const alreadyHave = hasInFridge(gi.name);
    return (
      <motion.div key={gi.id} variants={itemAnim} layout className={`glass-card p-3 flex items-center gap-3 transition-opacity ${gi.checked ? 'opacity-50' : ''} ${alreadyHave && !gi.checked ? 'border border-emerald-500/20' : ''}`}>
        <button
          onClick={() => toggleItem(gi.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
            gi.checked ? 'bg-primary border-primary' : 'border-border'
          }`}
        >
          {gi.checked && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className={`text-sm font-medium ${gi.checked ? 'line-through' : ''}`}>{gi.name}</p>
            {alreadyHave && !gi.checked && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                ✓ In Fridge
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {gi.quantity} · {gi.category}
            {gi.notes && <span className="ml-1 italic text-muted-foreground/70">· {gi.notes}</span>}
          </p>
        </div>
        <span className="text-sm font-semibold text-muted-foreground">${storePrice(gi.price).toFixed(2)}</span>
        <button onClick={() => setEditingItem({ ...gi })} className="text-muted-foreground/50 hover:text-primary transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => removeItem(gi.id)} className="text-muted-foreground/50 hover:text-destructive transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  };

  return (
    <div className="px-5 pt-10 pb-6">
      {(() => { const t = getTabConfig('/grocery'); return t ? <GreetingHeader tabTitle={t.label} tabDescription={t.description} tabIcon={t.icon} tabGradient={t.headerGradient} /> : null; })()}

      {/* Location input - always visible */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-elevated p-4 mb-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">Find nearby stores</p>
          </div>
          {locationSet && (
            <button onClick={() => { setLocationSet(false); setNearbyStores([]); setSelectedStore(null); setStoreConfirmed(false); }} className="text-[11px] text-primary font-medium">
              Change
            </button>
          )}
        </div>

        {locationSet ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LocateFixed className="w-3 h-3 text-primary shrink-0" />
            <span className="font-medium truncate">{userAddress}</span>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">Enter your address or use your location to find the nearest grocery stores.</p>

            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    value={userAddress}
                    onChange={e => handleAddressChange(e.target.value)}
                    onFocus={() => { if (predictions.length > 0) setShowSuggestions(true); }}
                    onKeyDown={e => e.key === 'Enter' && searchAddress()}
                    placeholder="Enter address, city, or zip..."
                    className="w-full bg-secondary/50 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <button
                  onClick={searchAddress}
                  disabled={!userAddress.trim() || locating}
                  className="gradient-lime text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 shrink-0"
                >
                  Search
                </button>
              </div>

              <AnimatePresence>
                {showSuggestions && predictions.length > 0 && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute z-50 left-0 right-12 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    {predictions.map((pred, i) => (
                      <button
                        key={pred.place_id || i}
                        onClick={() => selectAddress(pred.description)}
                        className="w-full px-3 py-2.5 text-left text-sm hover:bg-accent/50 flex items-center gap-2.5 transition-colors border-b border-border/50 last:border-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{pred.description}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={useMyLocation}
              disabled={locating}
              className="w-full glass-card p-3 flex items-center justify-center gap-2 text-sm font-medium text-primary active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {locating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  Finding stores near you...
                </>
              ) : (
                <>
                  <LocateFixed className="w-4 h-4" />
                  Use my current location
                </>
              )}
            </button>
          </>
        )}
      </motion.div>

      {/* Store details - only when location is set */}
      {locationSet && (
        <>
          {selectedStore && (
            <div className="mb-4 space-y-2">
              <button
                onClick={() => setShowStoreSelector(!showStoreSelector)}
                className="w-full glass-elevated p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform"
              >
                <span className="text-2xl">{selectedStore.logo}</span>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{selectedStore.name}</p>
                    {selectedStore.rating && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                        <Star className="w-3 h-3 fill-amber-500" />{selectedStore.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{selectedStore.distance} · {selectedStore.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${total.toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground">est. total</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showStoreSelector ? 'rotate-180' : ''}`} />
              </button>

              <div className="space-y-1">
              <div className="flex gap-2">
                <a
                  href={getDirectionsUrl(selectedStore)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => openDirectionsInExactFormat(event, selectedStore)}
                  className="flex-1 glass-card p-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-info active:scale-[0.98] transition-transform"
                >
                  <Navigation className="w-3.5 h-3.5" /> Get Directions
                </a>
                <a
                  href={getStoreWebsiteUrl(selectedStore)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 glass-card p-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary active:scale-[0.98] transition-transform"
                >
                  <Store className="w-3.5 h-3.5" /> Store Website
                </a>
              </div>
              <p className="text-[9px] text-muted-foreground/60 text-center">💡 Right-click → Open link in new tab</p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showStoreSelector && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                <div className="space-y-2">
                  {nearbyStores.map(store => {
                    const storeTotal = items.filter(i => !i.checked).reduce((s, i) => s + Math.round(i.price * store.priceMultiplier * 100) / 100, 0);
                    return (
                      <button
                        key={store.id}
                        onClick={() => { setSelectedStore(store); setShowStoreSelector(false); }}
                        className={`w-full glass-card p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-all ${
                          store.id === selectedStore?.id ? 'ring-2 ring-primary/30' : ''
                        }`}
                      >
                        <span className="text-xl">{store.logo}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{store.name}</p>
                            {store.rating && (
                              <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                                <Star className="w-2.5 h-2.5 fill-amber-500" />{store.rating}
                              </span>
                            )}
                            {store.isOpen !== undefined && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${store.isOpen ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                {store.isOpen ? 'OPEN' : 'CLOSED'}
                              </span>
                            )}
                            {cheapestStore && store.id === cheapestStore.id && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">BEST PRICE</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Navigation className="w-3 h-3" />{store.distance} · {store.address}
                          </p>
                        </div>
                        <span className="text-sm font-bold">${storeTotal.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowStoreSearch(!showStoreSearch)}
            className="w-full glass-card p-2.5 mb-4 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground active:scale-[0.98] transition-transform"
          >
            <Search className="w-3.5 h-3.5" />
            {showStoreSearch ? 'Close store search' : 'Search for a specific store'}
          </button>

          <AnimatePresence>
            {showStoreSearch && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                <div className="glass-elevated p-3 space-y-3">
                  <p className="text-xs text-muted-foreground">Search for any store near your location (e.g. "Costco", "Trader Joe's")</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        value={storeSearchQuery}
                        onChange={e => setStoreSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleStoreSearch()}
                        placeholder="Store name..."
                        className="w-full bg-secondary/50 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <button
                      onClick={handleStoreSearch}
                      disabled={!storeSearchQuery.trim() || searchingStore}
                      className="gradient-lime text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 shrink-0"
                    >
                      {searchingStore ? 'Searching...' : 'Find'}
                    </button>
                  </div>
                  {storeSearchResults.length > 0 && (
                    <div className="space-y-2">
                      {storeSearchResults.map(store => (
                        <button
                          key={store.id}
                          onClick={() => selectSearchedStore(store)}
                          className="w-full glass-card p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-all"
                        >
                          <span className="text-xl">{store.logo}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{store.name}</p>
                              {store.rating && (
                                <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                                  <Star className="w-2.5 h-2.5 fill-amber-500" />{store.rating}
                                </span>
                              )}
                              {store.isOpen !== undefined && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${store.isOpen ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                  {store.isOpen ? 'OPEN' : 'CLOSED'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Navigation className="w-3 h-3" />{store.distance} · {store.address}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {cheapestStore && savings > 0.5 && selectedStore?.id !== cheapestStore.id && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-elevated p-3 mb-4 flex items-center gap-3">
              <span className="text-xl">💡</span>
              <div className="flex-1">
                <p className="text-xs font-semibold">Save ${savings.toFixed(2)} at {cheapestStore.name}</p>
                <p className="text-[11px] text-muted-foreground">Same items, {cheapestStore.distance} away</p>
              </div>
              <button onClick={() => setSelectedStore(cheapestStore)} className="text-xs font-medium text-primary">Switch</button>
            </motion.div>
          )}

          {/* Toolbar */}
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar pb-1">
            <button
              onClick={() => setShowBarcodeScanner(true)}
              className="py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 glass-card text-muted-foreground whitespace-nowrap active:scale-95 transition-transform"
            >
              <Barcode className="w-3 h-3" /> Scan
            </button>
            {nearbyStores.length > 1 && (
              <button
                onClick={() => setShowPriceComparison(true)}
                className="py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 glass-card text-muted-foreground whitespace-nowrap active:scale-95 transition-transform"
              >
                <BarChart3 className="w-3 h-3" /> Compare
              </button>
            )}
            {nearbyStores.length > 1 && (
              <button
                onClick={() => setShowMultiStoreRoute(true)}
                className="py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 glass-card text-muted-foreground whitespace-nowrap active:scale-95 transition-transform"
              >
                <Route className="w-3 h-3" /> Multi-Store
              </button>
            )}
          </div>

          {/* Continue to shopping button */}
          {!storeConfirmed && selectedStore && (
            <button
              onClick={() => setStoreConfirmed(true)}
              className="w-full gradient-lime text-primary-foreground py-3.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform shadow-glow flex items-center justify-center gap-2 mb-4"
            >
              <ShoppingCart className="w-4 h-4" /> Continue to Shopping List
            </button>
          )}
        </>
      )}

      {/* Items, Add, Progress - only after store is confirmed */}
      {storeConfirmed && (
        <>
          {/* Add item with smart search */}
          {showAddItem ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-elevated p-3 mb-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={itemSearch}
                    onChange={e => handleItemSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addItem()}
                    placeholder="Search items (e.g. chicken, milk, rice...)"
                    className="w-full bg-secondary/50 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>
                <button onClick={addItem} disabled={!newItemName.trim()} className="gradient-lime text-primary-foreground px-3 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50">Add</button>
                <button onClick={() => { setShowAddItem(false); setNewItemName(''); setItemSearch(''); setSearchSuggestions([]); }} className="text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
              {searchSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {searchSuggestions.map(s => {
                    const smart = smartCategorize(s);
                    return (
                      <button
                        key={s}
                        onClick={() => addSearchItem(s)}
                        className="text-[11px] px-2.5 py-1.5 rounded-lg bg-accent text-accent-foreground font-medium active:scale-95 transition-transform flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> {s}
                        <span className="text-muted-foreground">· {smart.category} · ${smart.price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {itemSearch.trim() && searchSuggestions.length === 0 && (
                <p className="text-[11px] text-muted-foreground">Press Add or Enter to add "{itemSearch}" as a custom item</p>
              )}
            </motion.div>
          ) : (
            <button
              onClick={() => setShowAddItem(true)}
              className="w-full glass-card p-3 mb-4 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground active:scale-[0.98] transition-transform"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          )}

          {/* Cart total summary */}
          {items.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="glass-elevated rounded-2xl p-3.5 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Estimated Total</p>
                  <p className="text-2xl font-bold">${total.toFixed(2)}</p>
                  {selectedStore && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">at {selectedStore.chain || selectedStore.name}</p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] text-muted-foreground">{items.filter(i => !i.checked).length} items left</span>
                    <span className="text-[10px] font-semibold text-emerald-600">{checkedCount} done</span>
                  </div>
                  {(() => {
                    const inFridgeCount = items.filter(i => !i.checked && hasInFridge(i.name)).length;
                    return inFridgeCount > 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                        ✓ {inFridgeCount} already in fridge
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
              {checkedCount > 0 && (
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Remaining after checked</span>
                  <span className="font-semibold text-foreground">
                    ${items.filter(i => !i.checked).reduce((s, i) => s + storePrice(i.price), 0).toFixed(2)}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Items list grouped by category */}
          {(() => {
            const categories = new Map<string, typeof items>();
            items.forEach(gi => {
              const cat = gi.category || 'Other';
              if (!categories.has(cat)) categories.set(cat, []);
              categories.get(cat)!.push(gi);
            });
            return Array.from(categories.entries()).map(([cat, catItems]) => (
              <CollapsibleCategory key={cat} category={cat} items={catItems} renderItem={renderItem} />
            ));
          })()}

          {/* Progress */}
          {items.length > 0 && (
            <div className="glass-card p-4 mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">{checkedCount}/{items.length} items</span>
                <span className="text-xs text-muted-foreground">{Math.round((checkedCount / items.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full gradient-lime rounded-full transition-all" style={{ width: `${(checkedCount / items.length) * 100}%` }} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl max-h-[80vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-primary" /> Edit Item
                </h3>
                <button onClick={() => setEditingItem(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Item Name</label>
                  <input
                    value={editingItem.name}
                    onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                {/* Quantity */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Quantity</label>
                  <input
                    value={editingItem.quantity}
                    onChange={e => setEditingItem({ ...editingItem, quantity: e.target.value })}
                    placeholder="e.g. 2 lbs, 1 gal, 3 pcs"
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
                  <div className="flex flex-wrap gap-1.5">
                    {allCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setEditingItem({ ...editingItem, category: cat })}
                        className={`text-[11px] px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                          editingItem.category === cat
                            ? 'gradient-lime text-primary-foreground shadow-glow'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes</label>
                  <textarea
                    value={editingItem.notes || ''}
                    onChange={e => setEditingItem({ ...editingItem, notes: e.target.value })}
                    placeholder="e.g. Get organic, brand preference, specific size..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>
              {/* Save button - pinned outside scroll area */}
              <div className="px-5 pb-8 pt-3 border-t border-border">
                <button
                  onClick={() => {
                    updateItem(editingItem.id, {
                      name: editingItem.name,
                      quantity: editingItem.quantity,
                      category: editingItem.category,
                      notes: editingItem.notes,
                    });
                    setEditingItem(null);
                    setShowSaveConfirm(true);
                    setTimeout(() => setShowSaveConfirm(false), 2500);
                  }}
                  className="w-full gradient-lime text-primary-foreground py-3.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform shadow-glow flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Save & Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Confirmation Popup */}
      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-primary text-primary-foreground px-8 py-5 rounded-2xl shadow-2xl flex flex-col items-center gap-2"
          >
            <CheckCircle className="w-8 h-8" />
            <span className="text-base font-bold">Item Updated!</span>
            <span className="text-xs opacity-80">Changes saved successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showBarcodeScanner && (
          <BarcodeScanner onAdd={addScannedItem} onClose={() => setShowBarcodeScanner(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPriceComparison && nearbyStores.length > 0 && (
          <PriceComparisonTable
            items={items}
            stores={nearbyStores}
            onClose={() => setShowPriceComparison(false)}
            onSelectStore={(storeId) => {
              const store = nearbyStores.find(s => s.id === storeId);
              if (store) setSelectedStore(store);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMultiStoreRoute && nearbyStores.length > 0 && (
          <MultiStoreRoute
            items={items}
            stores={nearbyStores}
            homeAddress={userAddress}
            userCoords={userCoordsRef.current}
            onClose={() => setShowMultiStoreRoute(false)}
            onSearchStore={async (query: string) => {
              const results = await searchStoreByName(query, userAddress);
              return enrichStores(results);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroceryScreen;
