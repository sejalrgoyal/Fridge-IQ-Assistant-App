import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Barcode, Camera, X, AlertCircle, Shield, ShieldAlert, ShieldCheck, ShieldX, Search, ChevronRight, ExternalLink, ChevronDown } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import GreetingHeader from '@/components/GreetingHeader';
import { useNavigate } from 'react-router-dom';
import { getTabConfig } from '@/data/tabConfig';

interface IngredientInfo {
  name: string;
  risk: 'green' | 'yellow' | 'orange' | 'red';
  effects: ('carcinogen' | 'endocrine_disruptor' | 'allergen' | 'irritant' | 'other_health' | 'pollutant')[];
  description: string;
}

const ingredientDB: Record<string, IngredientInfo> = {
  'water': { name: 'Water', risk: 'green', effects: [], description: 'Essential hydration, no health concerns.' },
  'sugar': { name: 'Sugar', risk: 'yellow', effects: ['other_health'], description: 'Excessive intake linked to obesity, diabetes, and tooth decay.' },
  'salt': { name: 'Salt (Sodium Chloride)', risk: 'yellow', effects: ['other_health'], description: 'Essential in moderation. High intake linked to hypertension.' },
  'citric acid': { name: 'Citric Acid (E330)', risk: 'green', effects: [], description: 'Naturally occurring acid. Generally safe.' },
  'natural flavors': { name: 'Natural Flavors', risk: 'green', effects: [], description: 'Derived from natural sources. Generally considered safe.' },
  'high fructose corn syrup': { name: 'High Fructose Corn Syrup', risk: 'orange', effects: ['other_health'], description: 'Linked to obesity, insulin resistance, and metabolic syndrome.' },
  'aspartame': { name: 'Aspartame (E951)', risk: 'orange', effects: ['carcinogen'], description: 'Artificial sweetener. IARC classified as possibly carcinogenic to humans.' },
  'sodium benzoate': { name: 'Sodium Benzoate (E211)', risk: 'orange', effects: ['allergen', 'other_health'], description: 'Preservative. Can form benzene when combined with vitamin C. May trigger allergies.' },
  'red 40': { name: 'Red 40 (Allura Red, E129)', risk: 'red', effects: ['carcinogen', 'allergen'], description: 'Artificial color linked to hyperactivity in children. Banned in some countries.' },
  'yellow 5': { name: 'Yellow 5 (Tartrazine, E102)', risk: 'red', effects: ['allergen', 'other_health'], description: 'Artificial color. Can cause allergic reactions and hyperactivity.' },
  'yellow 6': { name: 'Yellow 6 (Sunset Yellow, E110)', risk: 'red', effects: ['allergen', 'carcinogen'], description: 'Artificial color. Linked to allergic reactions and potential carcinogenicity.' },
  'bha': { name: 'BHA (E320)', risk: 'red', effects: ['carcinogen', 'endocrine_disruptor'], description: 'Antioxidant preservative. Reasonably anticipated as a human carcinogen.' },
  'bht': { name: 'BHT (E321)', risk: 'orange', effects: ['endocrine_disruptor'], description: 'Preservative with potential endocrine-disrupting properties.' },
  'sodium nitrite': { name: 'Sodium Nitrite (E250)', risk: 'red', effects: ['carcinogen'], description: 'Preservative in processed meats. Forms carcinogenic nitrosamines.' },
  'msg': { name: 'Monosodium Glutamate (E621)', risk: 'yellow', effects: ['other_health'], description: 'Flavor enhancer. May cause headaches in sensitive individuals.' },
  'palm oil': { name: 'Palm Oil', risk: 'yellow', effects: ['other_health', 'pollutant'], description: 'High in saturated fat. Environmental concerns with deforestation.' },
  'partially hydrogenated oil': { name: 'Partially Hydrogenated Oil', risk: 'red', effects: ['carcinogen', 'other_health'], description: 'Contains trans fats. Strongly linked to heart disease and inflammation.' },
  'potassium sorbate': { name: 'Potassium Sorbate (E202)', risk: 'green', effects: [], description: 'Common preservative. Generally recognized as safe.' },
  'soy lecithin': { name: 'Soy Lecithin (E322)', risk: 'green', effects: ['allergen'], description: 'Emulsifier. Allergen for soy-sensitive individuals but generally safe.' },
  'carrageenan': { name: 'Carrageenan (E407)', risk: 'orange', effects: ['irritant', 'other_health'], description: 'Thickener from seaweed. May cause gastrointestinal inflammation.' },
  'titanium dioxide': { name: 'Titanium Dioxide (E171)', risk: 'red', effects: ['carcinogen'], description: 'Whitening agent. Banned in EU as food additive due to genotoxicity concerns.' },
  'sucralose': { name: 'Sucralose (E955)', risk: 'yellow', effects: ['other_health'], description: 'Artificial sweetener. May affect gut microbiome and glucose metabolism.' },
  'calcium propionate': { name: 'Calcium Propionate (E282)', risk: 'yellow', effects: ['irritant'], description: 'Bread preservative. May cause irritability and restlessness in children.' },
  'whole grain wheat flour': { name: 'Whole Grain Wheat Flour', risk: 'green', effects: ['allergen'], description: 'Good source of fiber and nutrients. Contains gluten allergen.' },
  'enriched wheat flour': { name: 'Enriched Wheat Flour', risk: 'yellow', effects: ['allergen', 'other_health'], description: 'Refined flour with added nutrients. High glycemic index.' },
  'vitamin c': { name: 'Vitamin C (Ascorbic Acid)', risk: 'green', effects: [], description: 'Essential nutrient. Powerful antioxidant.' },
  'niacin': { name: 'Niacin (Vitamin B3)', risk: 'green', effects: [], description: 'Essential B vitamin for metabolism.' },
  'iron': { name: 'Iron', risk: 'green', effects: [], description: 'Essential mineral for blood health.' },
  'caramel color': { name: 'Caramel Color (E150d)', risk: 'orange', effects: ['carcinogen'], description: 'Contains 4-MEI, a potentially carcinogenic byproduct.' },
  'phosphoric acid': { name: 'Phosphoric Acid (E338)', risk: 'yellow', effects: ['other_health'], description: 'Acidity regulator. High intake may affect bone health.' },
  'acesulfame k': { name: 'Acesulfame K (E950)', risk: 'yellow', effects: ['carcinogen'], description: 'Artificial sweetener. Some studies suggest potential carcinogenicity.' },
};

interface ProductData {
  name: string;
  brand: string;
  category: string;
  image: string;
  ingredients: string[];
  servingSize: string;
  nutritionPer100g: { calories: number; fat: number; saturatedFat: number; sugar: number; salt: number; protein: number; fiber: number };
}

const productDB: Record<string, ProductData> = {
  '0049000006346': { name: 'Classic Instant Coffee', brand: 'Nescafé', category: 'Beverages', image: '☕', ingredients: ['water', 'natural flavors'], servingSize: '1 tsp (2g)', nutritionPer100g: { calories: 2, fat: 0, saturatedFat: 0, sugar: 0, salt: 0.05, protein: 0.1, fiber: 0 } },
  '0012000001536': { name: 'Cola', brand: 'Pepsi', category: 'Beverages', image: '🥤', ingredients: ['water', 'high fructose corn syrup', 'caramel color', 'phosphoric acid', 'natural flavors', 'citric acid'], servingSize: '355ml', nutritionPer100g: { calories: 42, fat: 0, saturatedFat: 0, sugar: 11, salt: 0.01, protein: 0, fiber: 0 } },
  '0038000138416': { name: 'Corn Flakes', brand: "Kellogg's", category: 'Cereals', image: '🥣', ingredients: ['enriched wheat flour', 'sugar', 'salt', 'iron', 'niacin', 'vitamin c', 'bht'], servingSize: '30g', nutritionPer100g: { calories: 357, fat: 0.4, saturatedFat: 0.1, sugar: 8, salt: 1.1, protein: 7, fiber: 1.2 } },
  '0041331092609': { name: 'Tomato Ketchup', brand: 'Heinz', category: 'Condiments', image: '🍅', ingredients: ['water', 'sugar', 'natural flavors', 'salt', 'citric acid'], servingSize: '17g', nutritionPer100g: { calories: 112, fat: 0.1, saturatedFat: 0, sugar: 22, salt: 3.3, protein: 1.2, fiber: 0.3 } },
  '4099100179552': { name: 'Hazelnut Spread', brand: 'Nutella', category: 'Spreads', image: '🍫', ingredients: ['sugar', 'palm oil', 'soy lecithin', 'natural flavors'], servingSize: '15g', nutritionPer100g: { calories: 539, fat: 30, saturatedFat: 10.6, sugar: 56.3, salt: 0.1, protein: 6.3, fiber: 3.4 } },
  '0030000311707': { name: 'Old Fashioned Oats', brand: 'Quaker', category: 'Cereals', image: '🥣', ingredients: ['whole grain wheat flour', 'iron', 'niacin'], servingSize: '40g', nutritionPer100g: { calories: 379, fat: 6.5, saturatedFat: 1.1, sugar: 1, salt: 0.01, protein: 13, fiber: 10 } },
  '0054400000047': { name: 'Macaroni & Cheese', brand: 'Kraft', category: 'Prepared Foods', image: '🧀', ingredients: ['enriched wheat flour', 'salt', 'yellow 5', 'yellow 6', 'sodium benzoate', 'citric acid'], servingSize: '70g', nutritionPer100g: { calories: 371, fat: 3.6, saturatedFat: 1.4, sugar: 5.7, salt: 2.1, protein: 12.9, fiber: 1.4 } },
  '0021130126026': { name: 'Greek Yogurt', brand: 'Chobani', category: 'Dairy', image: '🥛', ingredients: ['water', 'natural flavors', 'citric acid', 'potassium sorbate'], servingSize: '150g', nutritionPer100g: { calories: 59, fat: 0.7, saturatedFat: 0.4, sugar: 3.2, salt: 0.04, protein: 10, fiber: 0 } },
  '0011110838995': { name: 'Whole Milk', brand: 'Kroger', category: 'Dairy', image: '🥛', ingredients: ['water', 'vitamin c'], servingSize: '240ml', nutritionPer100g: { calories: 61, fat: 3.3, saturatedFat: 1.9, sugar: 5, salt: 0.04, protein: 3.2, fiber: 0 } },
  '0051500255162': { name: 'Strawberry Jam', brand: "Smucker's", category: 'Spreads', image: '🍓', ingredients: ['sugar', 'citric acid', 'potassium sorbate', 'natural flavors'], servingSize: '20g', nutritionPer100g: { calories: 250, fat: 0, saturatedFat: 0, sugar: 60, salt: 0.02, protein: 0.3, fiber: 0.5 } },
};

function calculateYukaScore(ingredients: string[]): { score: number; details: { ingredient: IngredientInfo; penalty: number }[] } {
  const resolved = ingredients.map(i => ingredientDB[i]).filter(Boolean) as IngredientInfo[];
  const details: { ingredient: IngredientInfo; penalty: number }[] = [];
  const fewIngredients = ingredients.length <= 3;
  const hasRed = resolved.some(i => i.risk === 'red');
  const hasOrange = resolved.some(i => i.risk === 'orange');

  if (!hasRed && !hasOrange) {
    let score = 100;
    for (const ing of resolved) {
      let penalty = 0;
      if (ing.risk === 'yellow') {
        const isCarcinogenOrED = ing.effects.some(e => e === 'carcinogen' || e === 'endocrine_disruptor');
        const otherEffects = ing.effects.filter(e => e !== 'carcinogen' && e !== 'endocrine_disruptor');
        if (isCarcinogenOrED) penalty = 10;
        else if (otherEffects.length > 1) penalty = 7;
        else if (otherEffects.length === 1) penalty = 2;
      }
      if (penalty > 0) { score -= penalty; details.push({ ingredient: ing, penalty }); }
      else { details.push({ ingredient: ing, penalty: 0 }); }
    }
    return { score: Math.max(50, score), details };
  }

  let maxRank = hasRed ? 24 : 49;
  let score = maxRank;
  for (const ing of resolved) {
    let penalty = 0;
    const isCarcinogenOrED = ing.effects.some(e => e === 'carcinogen' || e === 'endocrine_disruptor');
    const otherRisks = ing.effects.filter(e => e !== 'carcinogen' && e !== 'endocrine_disruptor').length > 0;
    if (ing.risk === 'red') { penalty = isCarcinogenOrED ? 12 : (otherRisks ? 8 : 0); }
    else if (ing.risk === 'orange') { penalty = isCarcinogenOrED ? 6 : (otherRisks ? 4 : 0); }
    else if (ing.risk === 'yellow') { penalty = isCarcinogenOrED ? 3 : (otherRisks ? 2 : 0); }
    if (penalty > 0 && ing !== resolved.find(r => r.risk === (hasRed ? 'red' : 'orange'))) {
      if (fewIngredients) penalty = Math.ceil(penalty * 1.5);
      score -= penalty;
    }
    details.push({ ingredient: ing, penalty });
  }
  return { score: Math.max(0, Math.min(maxRank, score)), details };
}

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-success';
  if (score >= 50) return 'text-warning';
  if (score >= 25) return 'text-[hsl(var(--coral))]';
  return 'text-destructive';
}
function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-success/15';
  if (score >= 50) return 'bg-warning/15';
  if (score >= 25) return 'bg-[hsl(var(--coral))]/15';
  return 'bg-destructive/15';
}
function getScoreLabel(score: number): string {
  if (score >= 75) return 'Excellent';
  if (score >= 50) return 'Good';
  if (score >= 25) return 'Mediocre';
  return 'Poor';
}
function getScoreIcon(score: number) {
  if (score >= 75) return <ShieldCheck className="w-8 h-8 text-success" />;
  if (score >= 50) return <Shield className="w-8 h-8 text-warning" />;
  if (score >= 25) return <ShieldAlert className="w-8 h-8 text-[hsl(var(--coral))]" />;
  return <ShieldX className="w-8 h-8 text-destructive" />;
}
function getRiskBadge(risk: 'green' | 'yellow' | 'orange' | 'red') {
  const map = {
    green: { label: 'No Risk', cls: 'bg-success/15 text-success' },
    yellow: { label: 'Low Risk', cls: 'bg-warning/15 text-warning' },
    orange: { label: 'Moderate', cls: 'bg-[hsl(var(--coral))]/15 text-[hsl(var(--coral))]' },
    red: { label: 'Hazardous', cls: 'bg-destructive/15 text-destructive' },
  };
  const { label, cls } = map[risk];
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

const alternatives: Record<string, { name: string; brand: string; why: string; image: string; link: string }[]> = {
  'Beverages': [
    { name: 'Sparkling Water with Lemon', brand: 'LaCroix', why: 'Zero sugar, no artificial colors or sweeteners', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop', link: 'https://www.lacroixwater.com/' },
    { name: 'Green Tea', brand: 'Ito En', why: 'Rich in antioxidants, no added sugar', image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=200&h=200&fit=crop', link: 'https://www.itoen.com/' },
  ],
  'Cereals': [
    { name: 'Steel Cut Oats', brand: "Bob's Red Mill", why: 'Whole grain, no additives, high fiber', image: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=200&h=200&fit=crop', link: 'https://www.bobsredmill.com/steel-cut-oats.html' },
    { name: 'Muesli', brand: 'Alpen', why: 'Low sugar, whole grains, no artificial ingredients', image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=200&h=200&fit=crop', link: 'https://www.alpen.co.uk/' },
  ],
  'Prepared Foods': [
    { name: 'Organic Mac & Cheese', brand: "Annie's", why: 'No artificial colors, real cheese, organic pasta', image: 'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=200&h=200&fit=crop', link: 'https://www.annies.com/products/mac-and-cheese' },
  ],
  'Spreads': [
    { name: 'Almond Butter', brand: "Justin's", why: 'No palm oil, less sugar, heart-healthy fats', image: 'https://images.unsplash.com/photo-1612187209234-c0e7e0a0790c?w=200&h=200&fit=crop', link: 'https://www.justins.com/almond-butters' },
    { name: 'Fruit Preserves (No Sugar Added)', brand: 'Bonne Maman', why: 'Only fruit and pectin, no refined sugar', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=200&h=200&fit=crop', link: 'https://www.bonnemaman.us/' },
  ],
  'Condiments': [
    { name: 'Organic Ketchup (Low Sugar)', brand: 'Primal Kitchen', why: 'No high fructose corn syrup, less sugar', image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=200&h=200&fit=crop', link: 'https://www.primalkitchen.com/products/organic-unsweetened-ketchup' },
  ],
};

const containerAnim = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemAnim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const YukaScanScreen = () => {
  const navigate = useNavigate();
  const [manualCode, setManualCode] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [error, setError] = useState('');
  const [product, setProduct] = useState<ProductData | null>(null);
  const [scoreResult, setScoreResult] = useState<ReturnType<typeof calculateYukaScore> | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [expandedBox, setExpandedBox] = useState<'scan' | 'barcode' | 'search' | null>(null);
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const lookupProduct = (code: string) => {
    const cleaned = code.replace(/[^0-9]/g, '');
    const found = productDB[cleaned];
    if (found) {
      setProduct(found);
      setScoreResult(calculateYukaScore(found.ingredients));
      setError('');
    } else {
      setError('Product not found. Try one of the sample barcodes or search by name.');
      setProduct(null);
      setScoreResult(null);
    }
  };

  const startCamera = async () => {
    setError('');
    setBarcodeScanning(true);
    // Small delay to ensure the DOM element is rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
      const html5QrCode = new Html5Qrcode('yuka-reader');
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => { lookupProduct(decodedText); html5QrCode.stop().catch(() => {}); setBarcodeScanning(false); },
        () => {}
      );
    } catch {
      setError('Camera access denied. Please allow camera permissions in your browser settings, or use Enter Barcode / Search instead.');
      setBarcodeScanning(false);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) { scannerRef.current.stop().catch(() => {}); scannerRef.current = null; }
    setBarcodeScanning(false);
  };

  useEffect(() => () => { stopCamera(); }, []);

  const resetScan = () => {
    setProduct(null);
    setScoreResult(null);
    setManualCode('');
    setProductSearch('');
    setError('');
    setShowAlternatives(false);
    setExpandedBox(null);
  };

  const productAlts = product ? alternatives[product.category] || [] : [];

  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const liveSearchResults = useMemo(() => {
    if (!productSearch.trim()) return [];
    return Object.entries(productDB).filter(([, p]) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch]);

  const toggleBox = (box: 'scan' | 'barcode' | 'search') => {
    if (expandedBox === box) {
      if (box === 'scan') stopCamera();
      setExpandedBox(null);
    } else {
      if (expandedBox === 'scan') stopCamera();
      setExpandedBox(box);
      if (box === 'scan') {
        // Will start camera after render
        setTimeout(() => startCamera(), 200);
      }
    }
  };

  return (
    <motion.div variants={containerAnim} initial="hidden" animate="show" className="px-5 pt-10 pb-6">
      {(() => { const t = getTabConfig('/health-scan'); return t ? <GreetingHeader tabTitle={t.label} tabDescription={t.description} tabIcon={t.icon} tabGradient={t.headerGradient} /> : null; })()}

      {!product ? (
        <>
          {/* Scan Barcode - collapsible */}
          <motion.div variants={itemAnim} className="glass-elevated mb-3 overflow-hidden rounded-2xl">
            <button
              onClick={() => toggleBox('scan')}
              className="w-full p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl gradient-coral flex items-center justify-center shrink-0">
                <Camera className="w-6 h-6 text-coral-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Scan Barcode</p>
                <p className="text-xs text-muted-foreground">Use your camera to scan a product barcode</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expandedBox === 'scan' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedBox === 'scan' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <div id="yuka-reader" className="w-full rounded-2xl overflow-hidden bg-foreground/5 min-h-[220px] mb-3" />
                    {barcodeScanning && (
                      <button onClick={() => { stopCamera(); }} className="w-full bg-secondary text-secondary-foreground py-2 rounded-xl text-sm font-medium">
                        Stop Scanning
                      </button>
                    )}
                    {!barcodeScanning && expandedBox === 'scan' && (
                      <button onClick={startCamera} className="w-full gradient-primary text-primary-foreground py-2 rounded-xl text-sm font-semibold">
                        Start Camera
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Enter Barcode - collapsible */}
          <motion.div variants={itemAnim} className="glass-elevated mb-3 overflow-hidden rounded-2xl">
            <button
              onClick={() => toggleBox('barcode')}
              className="w-full p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
                <Barcode className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Enter Barcode</p>
                <p className="text-xs text-muted-foreground">Type in the barcode number manually</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expandedBox === 'barcode' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedBox === 'barcode' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Barcode className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          value={manualCode}
                          onChange={e => setManualCode(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && lookupProduct(manualCode)}
                          placeholder="e.g. 0012000001536"
                          className="w-full bg-secondary/50 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                          autoFocus
                        />
                      </div>
                      <button onClick={() => lookupProduct(manualCode)} disabled={!manualCode.trim()} className="gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50">
                        Analyze
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Search Products - collapsible */}
          <motion.div variants={itemAnim} className="glass-elevated mb-5 overflow-visible rounded-2xl relative">
            <button
              onClick={() => toggleBox('search')}
              className="w-full p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl gradient-info flex items-center justify-center shrink-0">
                <Search className="w-6 h-6 text-info-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Search Products</p>
                <p className="text-xs text-muted-foreground">Find a product by name or brand</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expandedBox === 'search' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedBox === 'search' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-visible">
                  <div className="px-4 pb-4 relative">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g. Cola, Oats, Ketchup..."
                        value={productSearch}
                        onChange={e => { setProductSearch(e.target.value); setShowProductDropdown(true); }}
                        onFocus={() => { if (productSearch.trim()) setShowProductDropdown(true); }}
                        className="w-full bg-secondary/50 text-sm pl-9 pr-10 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                      {productSearch && (
                        <button onClick={() => { setProductSearch(''); setShowProductDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      )}
                    </div>

                    {/* Search results - positioned to overflow */}
                    {showProductDropdown && productSearch.trim() && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setShowProductDropdown(false)} />
                        <div className="absolute z-30 left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-[50vh] overflow-y-auto">
                          {liveSearchResults.length > 0 ? (
                            <>
                              <p className="px-3 py-2 text-[10px] text-muted-foreground font-semibold uppercase border-b border-border">
                                Products Found
                              </p>
                              {liveSearchResults.map(([code, p]) => (
                                <button
                                  key={code}
                                  onClick={() => { setManualCode(code); lookupProduct(code); setShowProductDropdown(false); }}
                                  className="w-full px-3 py-2.5 text-left hover:bg-accent/50 flex items-center gap-3 transition-colors border-b border-border/50 last:border-0"
                                >
                                  <span className="text-2xl">{p.image}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{p.name}</p>
                                    <p className="text-[11px] text-muted-foreground">{p.brand} · {p.category}</p>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </button>
                              ))}
                            </>
                          ) : (
                            <div className="px-3 py-4 text-center">
                              <p className="text-sm text-muted-foreground">No products found for "{productSearch}"</p>
                              <p className="text-xs text-muted-foreground mt-1">Try scanning the barcode instead</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {error && (
            <motion.div variants={itemAnim} className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </motion.div>
          )}
        </>
      ) : scoreResult && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className={`glass-elevated p-5 ${getScoreBg(scoreResult.score)} border-2`} style={{ borderColor: 'transparent' }}>
              <div className="flex items-start gap-4 mb-3">
                <span className="text-5xl">{product.image}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-foreground">{product.name}</h2>
                  <p className="text-xs text-muted-foreground">{product.brand} · {product.category}</p>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(product.brand + ' ' + product.name)}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary font-medium flex items-center gap-1 mt-1">
                    <ExternalLink className="w-3 h-3" /> Verify product info
                  </a>
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-1">{getScoreIcon(scoreResult.score)}</div>
                <div className={`text-5xl font-extrabold ${getScoreColor(scoreResult.score)}`}>
                  {scoreResult.score}<span className="text-lg font-semibold text-muted-foreground">/100</span>
                </div>
                <p className={`text-sm font-bold mt-1 ${getScoreColor(scoreResult.score)}`}>{getScoreLabel(scoreResult.score)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {scoreResult.score >= 75 ? 'This product has minimal health concerns.' :
                   scoreResult.score >= 50 ? 'This product has some ingredients worth monitoring.' :
                   scoreResult.score >= 25 ? 'This product contains several concerning ingredients.' :
                   'This product contains multiple hazardous ingredients.'}
                </p>
              </div>
            </div>

            <div className="glass-elevated p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="text-lg">{product.image}</span> Nutrition (per 100g)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Calories', value: `${product.nutritionPer100g.calories}`, color: 'text-foreground' },
                  { label: 'Fat', value: `${product.nutritionPer100g.fat}g`, color: product.nutritionPer100g.fat > 15 ? 'text-destructive' : 'text-foreground' },
                  { label: 'Sat. Fat', value: `${product.nutritionPer100g.saturatedFat}g`, color: product.nutritionPer100g.saturatedFat > 5 ? 'text-destructive' : 'text-foreground' },
                  { label: 'Sugar', value: `${product.nutritionPer100g.sugar}g`, color: product.nutritionPer100g.sugar > 15 ? 'text-destructive' : product.nutritionPer100g.sugar > 5 ? 'text-warning' : 'text-success' },
                  { label: 'Salt', value: `${product.nutritionPer100g.salt}g`, color: product.nutritionPer100g.salt > 1.5 ? 'text-destructive' : 'text-foreground' },
                  { label: 'Protein', value: `${product.nutritionPer100g.protein}g`, color: 'text-info' },
                ].map(n => (
                  <div key={n.label} className="glass-card p-2.5 text-center">
                    <p className={`text-sm font-bold ${n.color}`}>{n.value}</p>
                    <p className="text-[10px] text-muted-foreground">{n.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-elevated p-4">
              <h3 className="text-sm font-semibold mb-3">🔬 Ingredient Analysis</h3>
              <div className="space-y-2">
                {scoreResult.details.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-secondary/50">
                    <div className="mt-0.5">{getRiskBadge(d.ingredient.risk)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{d.ingredient.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.ingredient.description}</p>
                      {d.ingredient.effects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {d.ingredient.effects.map(e => (
                            <span key={e} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium capitalize">{e.replace('_', ' ')}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {d.penalty > 0 && <span className="text-xs font-bold text-destructive shrink-0">-{d.penalty}</span>}
                  </div>
                ))}
              </div>
            </div>

            {productAlts.length > 0 && scoreResult.score < 75 && (
              <div className="glass-elevated overflow-hidden">
                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="w-full p-4 flex items-center justify-between active:scale-[0.99] transition-transform"
                >
                  <h3 className="text-sm font-semibold flex items-center gap-2">🌿 Healthier Alternatives</h3>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showAlternatives ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showAlternatives && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2">
                        {productAlts.map((alt, i) => (
                          <a key={i} href={alt.link} target="_blank" rel="noopener noreferrer" className="w-full flex items-start gap-3 p-3 rounded-xl bg-success/5 border border-success/20 text-left active:scale-[0.98] transition-transform block">
                            <img src={alt.image} alt={alt.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold">{alt.name}</p>
                              <p className="text-[11px] text-muted-foreground">{alt.brand}</p>
                              <p className="text-xs text-success mt-1">✦ {alt.why}</p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button onClick={resetScan} className="w-full gradient-primary text-primary-foreground py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform shadow-glow">
              <Barcode className="w-4 h-4 inline mr-1.5" /> Scan Another Product
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default YukaScanScreen;
