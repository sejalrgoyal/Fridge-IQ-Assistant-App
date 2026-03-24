import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Plus, Sparkles, ScanLine, Lightbulb, Barcode, AlertTriangle, ChevronDown, Package, Pencil, Search, MapPin, SwitchCamera, Trash2, ShoppingCart, Check } from 'lucide-react';

import GreetingHeader from '@/components/GreetingHeader';
import { getTabConfig } from '@/data/tabConfig';
import ExpiryCalendar from '@/components/ExpiryCalendar';
import { fridgeItems as defaultFridgeItems } from '@/data/mockData';
import type { FridgeItem } from '@/data/mockData';
import { Html5Qrcode } from 'html5-qrcode';
import FridgeItemModal from '@/components/FridgeItemModal';
import { toast } from 'sonner';

interface DetectedItem {
  name: string;
  emoji: string;
  confidence: number;
  quantity: string;
  category: string;
  daysLeft?: number;
  nutritionInfo?: string;
  storeTip?: string;
}

const simulatedDetections: DetectedItem[] = [
  { name: 'Broccoli', emoji: '🥦', confidence: 96, quantity: '1 head', category: 'Vegetables', daysLeft: 5, nutritionInfo: 'High in Vitamin C, K & fiber', storeTip: 'Keep in fridge crisper drawer, unwashed' },
  { name: 'Bell Pepper', emoji: '🫑', confidence: 93, quantity: '2 pcs', category: 'Vegetables', daysLeft: 7, nutritionInfo: 'Rich in Vitamin A & antioxidants', storeTip: 'Store in fridge, use within a week' },
  { name: 'Cheddar Cheese', emoji: '🧀', confidence: 89, quantity: '200g', category: 'Dairy', daysLeft: 14, nutritionInfo: 'Good source of calcium & protein', storeTip: 'Wrap tightly, keep below 40°F' },
  { name: 'Butter', emoji: '🧈', confidence: 87, quantity: '1 stick', category: 'Dairy', daysLeft: 30, nutritionInfo: 'Source of Vitamin A, high in saturated fat', storeTip: 'Refrigerate; freezes well for months' },
  { name: 'Carrots', emoji: '🥕', confidence: 84, quantity: '3 pcs', category: 'Vegetables', daysLeft: 10, nutritionInfo: 'Rich in beta-carotene & fiber', storeTip: 'Remove greens, store in water for crunch' },
  { name: 'Orange Juice', emoji: '🍊', confidence: 78, quantity: '1L', category: 'Beverages', daysLeft: 4, nutritionInfo: 'High in Vitamin C, natural sugars', storeTip: 'Refrigerate after opening, use within 7 days' },
  { name: 'Strawberries', emoji: '🍓', confidence: 72, quantity: '250g', category: 'Fruits', daysLeft: 3, nutritionInfo: 'Excellent Vitamin C source, low calorie', storeTip: "Don't wash until ready to eat" },
  { name: 'Tofu', emoji: '🧊', confidence: 65, quantity: '1 block', category: 'Protein', daysLeft: 5, nutritionInfo: 'Complete protein, iron & calcium', storeTip: 'Store in water in fridge, change daily' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemAnim = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const FridgeScanScreen = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'scan' | 'inventory'>('scan');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [photoCameraOpen, setPhotoCameraOpen] = useState(false);
  const [photoCameraReady, setPhotoCameraReady] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const [items, setItems] = useState<FridgeItem[]>(() => {
    try {
      const saved = localStorage.getItem('fridgeiq_fridge_items');
      return saved ? JSON.parse(saved) : defaultFridgeItems;
    } catch {
      return defaultFridgeItems;
    }
  });
  const [modalItem, setModalItem] = useState<FridgeItem | null | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [showNoFoodDialog, setShowNoFoodDialog] = useState(false);
  const [showDetectionDialog, setShowDetectionDialog] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set());
  // Waste tracking
  const [wasteDialog, setWasteDialog] = useState<{ items: FridgeItem[] } | null>(null);

  useEffect(() => {
    localStorage.setItem('fridgeiq_fridge_items', JSON.stringify(items));
  }, [items]);

  const logWaste = (itemsToLog: FridgeItem[], action: 'used' | 'wasted') => {
    try {
      const existing = JSON.parse(localStorage.getItem('fridgeiq_waste_log') || '[]');
      const newEntries = itemsToLog.map(item => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        action,
        date: new Date().toISOString(),
      }));
      localStorage.setItem('fridgeiq_waste_log', JSON.stringify([...existing, ...newEntries]));
    } catch {}
  };

  const deleteItems = (itemIds: string[], action: 'used' | 'wasted') => {
    const itemsBeingDeleted = items.filter(i => itemIds.includes(i.id));
    logWaste(itemsBeingDeleted, action);
    setItems(prev => prev.filter(i => !itemIds.includes(i.id)));
    const msg = action === 'used'
      ? `✅ ${itemsBeingDeleted.length} item${itemsBeingDeleted.length !== 1 ? 's' : ''} marked as used!`
      : `🗑️ ${itemsBeingDeleted.length} item${itemsBeingDeleted.length !== 1 ? 's' : ''} removed (wasted)`;
    toast(msg);
  };

  const addExpiringToGrocery = () => {
    const expiring = items.filter(i => i.daysLeft <= 3);
    if (expiring.length === 0) return;
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('fridgeiq_restock_list') || '[]');
      const toAdd = expiring.map(i => i.name).filter(n => !existing.includes(n));
      if (toAdd.length === 0) {
        toast('All expiring items already in grocery list!');
        return;
      }
      localStorage.setItem('fridgeiq_restock_list', JSON.stringify([...existing, ...toAdd]));
      toast.success(`🛒 Added ${toAdd.length} item${toAdd.length !== 1 ? 's' : ''} to Grocery List!`);
    } catch {}
  };

  const categories = [...new Set(items.map(i => i.category))].sort();
  const locations = [...new Set(items.map(i => i.location || 'Fridge'))].sort();

  const filteredItems = items.filter(i => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || i.name.toLowerCase().includes(query) || i.category.toLowerCase().includes(query) || (i.location || 'Fridge').toLowerCase().includes(query);
    const matchesCategory = !filterCategory || i.category === filterCategory;
    const matchesLocation = !filterLocation || (i.location || 'Fridge') === filterLocation;
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const expiringSoon = filteredItems.filter(i => i.daysLeft <= 3).sort((a, b) => a.daysLeft - b.daysLeft);
  const allFridgeItems = [...filteredItems].sort((a, b) => a.daysLeft - b.daysLeft);

  const stopPhotoCamera = () => {
    cameraStreamRef.current?.getTracks().forEach(track => track.stop());
    cameraStreamRef.current = null;
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
    setPhotoCameraOpen(false);
    setPhotoCameraReady(false);
  };

  const startPhotoCamera = async (mode?: 'environment' | 'user') => {
    const activeMode = mode ?? facingMode;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: activeMode } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      setPhotoCameraOpen(true);
      setPhotoCameraReady(false);
      requestAnimationFrame(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          cameraVideoRef.current.play().catch(() => {});
        }
      });
    } catch {
      toast.error('Camera access was blocked. You can still upload a photo.');
      fileRef.current?.click();
    }
  };

  const flipCamera = async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    cameraStreamRef.current = null;
    setPhotoCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: newMode } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play().catch(() => {});
      }
    } catch {
      toast.error('Could not switch camera.');
    }
  };

  const capturePhoto = () => {
    const video = cameraVideoRef.current;
    const canvas = cameraCanvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setImagePreview(dataUrl);
    setDetected([]);
    setSelected(new Set());
    stopPhotoCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setDetected([]);
      setSelected(new Set());
    };
    reader.readAsDataURL(file);
  };

  const analyzeImageForFood = (imageDataUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(true); return; }
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const pixelCount = size * size;

        let skinPixels = 0;
        let greenFoodPixels = 0;
        let vividYellowOrangePixels = 0;
        let deepRedPixels = 0;
        let berryPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const delta = max - min;
          const rn = r / 255, gn = g / 255, bn = b / 255;
          const maxn = max / 255;
          const saturation = max > 0 ? delta / max : 0;
          const brightness = maxn;

          // Compute hue (0-360)
          let hue = 0;
          if (delta > 8) {
            if (max === r) hue = (((gn - bn) / (delta / 255)) % 6) * 60;
            else if (max === g) hue = ((bn - rn) / (delta / 255) + 2) * 60;
            else hue = ((rn - gn) / (delta / 255) + 4) * 60;
            if (hue < 0) hue += 360;
          }

          // Skin detection: dual RGB + HSV check (covers all ethnicities)
          // RGB: R dominates, specific ratios
          const rgbSkin = r > 95 && g > 40 && b > 20 &&
            delta > 15 && r > g && r > b && Math.abs(r - g) > 15 &&
            !(r > 220 && g > 215 && b > 210); // exclude near-white
          // HSV: warm hue, moderate saturation (skin is never hyper-saturated)
          const hsvSkin = (hue <= 28 || hue >= 340) &&
            saturation >= 0.12 && saturation <= 0.72 &&
            brightness >= 0.30 && brightness <= 0.96;

          const isSkin = rgbSkin && hsvSkin;
          if (isSkin) { skinPixels++; continue; } // skip food checks for skin pixels

          // Deep greens: broccoli, lettuce, cucumber, herbs (hue 80-165°)
          if (hue >= 80 && hue <= 165 && saturation > 0.22 && brightness > 0.08 && g > r) {
            greenFoodPixels++;
          }
          // Vivid yellows / oranges: banana, carrot, cheese, corn (hue 30-75°)
          // Needs high saturation to distinguish from skin
          else if (hue >= 30 && hue <= 75 && saturation > 0.55 && brightness > 0.25) {
            vividYellowOrangePixels++;
          }
          // Deep vivid reds: tomato, strawberry, red pepper (hue 0-18° or 342-360°)
          // High saturation to separate from skin
          else if ((hue <= 18 || hue >= 342) && saturation > 0.58 && brightness > 0.12) {
            deepRedPixels++;
          }
          // Purples / blues: grapes, blueberries, eggplant (hue 200-315°)
          else if (hue >= 200 && hue <= 315 && saturation > 0.28 && brightness > 0.08) {
            berryPixels++;
          }
        }

        const skinRatio = skinPixels / pixelCount;
        const foodScore = (greenFoodPixels + vividYellowOrangePixels + deepRedPixels + berryPixels) / pixelCount;

        // Selfie / portrait: face skin typically covers 15-60% of the frame
        if (skinRatio > 0.13) {
          resolve(false);
          return;
        }

        // Require a meaningful presence of food-specific colors (>6%)
        resolve(foodScore > 0.06);
      };
      img.onerror = () => resolve(true);
      img.src = imageDataUrl;
    });
  };

  const addSelectedToFridge = () => {
    const itemsToAdd = detected.filter(det => selected.has(det.name));
    if (itemsToAdd.length === 0) return;
    const newItems: FridgeItem[] = itemsToAdd.map(det => ({
      id: crypto.randomUUID(),
      name: det.name,
      emoji: det.emoji,
      quantity: det.quantity,
      daysLeft: det.daysLeft ?? 7,
      category: det.category,
      location: 'Fridge',
    }));
    setItems(prev => [...prev, ...newItems]);
    toast.success(`Added ${newItems.length} item${newItems.length !== 1 ? 's' : ''} to your fridge!`);
    setImagePreview(null);
    setDetected([]);
    setSelected(new Set());
    setShowDetectionDialog(false);
  };

  const toggleBulkItem = (id: string) => {
    setBulkSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleScan = async () => {
    if (!imagePreview) return;
    setScanning(true);
    setDetected([]);
    setSelected(new Set());

    const hasFood = await analyzeImageForFood(imagePreview);
    if (!hasFood) {
      setScanning(false);
      setShowNoFoodDialog(true);
      return;
    }

    simulatedDetections.forEach((det, i) => {
      setTimeout(() => {
        setDetected(prev => [...prev, det]);
        setSelected(prev => {
          const next = new Set(prev);
          if (det.confidence >= 70) next.add(det.name);
          return next;
        });
        if (i === simulatedDetections.length - 1) {
          setScanning(false);
          setTimeout(() => setShowDetectionDialog(true), 500);
        }
      }, 600 + i * 350);
    });
  };

  const toggleSelect = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const startBarcodeCamera = async () => {
    setBarcodeScanning(true);
    try {
      const html5QrCode = new Html5Qrcode('fridge-barcode-reader');
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          setManualBarcode(decodedText);
          html5QrCode.stop().catch(() => {});
          setBarcodeScanning(false);
        },
        () => {}
      );
    } catch {
      setBarcodeScanning(false);
    }
  };

  const stopBarcodeCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setBarcodeScanning(false);
  };

  useEffect(() => {
    return () => {
      stopBarcodeCamera();
      stopPhotoCamera();
    };
  }, []);

  const confidenceColor = (c: number) => {
    if (c >= 90) return 'text-primary';
    if (c >= 75) return 'text-info';
    if (c >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const confidenceBg = (c: number) => {
    if (c >= 90) return 'bg-primary';
    if (c >= 75) return 'bg-info';
    if (c >= 60) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="px-5 pt-10 pb-6">
      {(() => { const t = getTabConfig('/scan'); return t ? <GreetingHeader tabTitle={t.label} tabDescription={t.description} tabIcon={t.icon} tabGradient={t.headerGradient} /> : null; })()}

      {/* Tabs: Scan | Inventory */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'scan' ? 'gradient-info text-info-foreground shadow-glow' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          📸 Scan
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'inventory' ? 'gradient-info text-info-foreground shadow-glow' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          📦 Inventory
        </button>
      </div>

      {activeTab === 'scan' ? (
        <>
          {/* Scan mode toggle: Photo vs Barcode */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setBarcodeMode(false); stopBarcodeCamera(); }}
              className={`flex-1 glass-elevated p-3 flex items-center justify-center gap-2 active:scale-[0.98] transition-all rounded-xl ${!barcodeMode ? 'ring-2 ring-primary' : ''}`}
            >
              <Camera className="w-4 h-4" />
              <span className="text-xs font-semibold">Photo Scan</span>
            </button>
            <button
              onClick={() => { setBarcodeMode(true); }}
              className={`flex-1 glass-elevated p-3 flex items-center justify-center gap-2 active:scale-[0.98] transition-all rounded-xl ${barcodeMode ? 'ring-2 ring-primary' : ''}`}
            >
              <Barcode className="w-4 h-4" />
              <span className="text-xs font-semibold">Barcode Scan</span>
            </button>
          </div>

          {!barcodeMode ? (
            <>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <canvas ref={cameraCanvasRef} className="hidden" />

              {!imagePreview && !photoCameraOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-elevated border-2 border-dashed border-primary/20 rounded-3xl p-8 flex flex-col items-center gap-4 mb-6"
                >
                  <div className="w-16 h-16 rounded-2xl gradient-info flex items-center justify-center">
                    <Camera className="w-8 h-8 text-info-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold mb-1">Take a photo or upload</p>
                    <p className="text-xs text-muted-foreground">Snap your fridge, pantry, or countertop</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={startPhotoCamera}
                      className="gradient-info text-info-foreground px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform shadow-glow"
                    >
                      <Camera className="w-4 h-4" /> Take Photo
                    </button>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="bg-secondary text-secondary-foreground px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform"
                    >
                      <Upload className="w-4 h-4" /> Upload
                    </button>
                  </div>
                </motion.div>
              ) : photoCameraOpen ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
                  <div className="glass-elevated rounded-3xl p-3 mb-4">
                    <div className="relative overflow-hidden rounded-2xl bg-secondary/40 aspect-[4/3]">
                      <video
                        ref={cameraVideoRef}
                        autoPlay
                        playsInline
                        muted
                        onLoadedMetadata={() => setPhotoCameraReady(true)}
                        className="h-full w-full object-cover"
                      />
                      {!photoCameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                          <span className="text-sm font-medium text-foreground">Starting camera…</span>
                        </div>
                      )}
                      {/* Camera flip button */}
                      <button
                        onClick={flipCamera}
                        className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-background/60 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform shadow"
                        title={facingMode === 'environment' ? 'Switch to front camera' : 'Switch to rear camera'}
                      >
                        <SwitchCamera className="w-5 h-5 text-foreground" />
                      </button>
                      <div className="absolute bottom-3 left-3 bg-background/60 backdrop-blur-sm rounded-lg px-2 py-0.5">
                        <span className="text-[10px] font-medium text-foreground">{facingMode === 'environment' ? '🔭 Rear' : '🤳 Front'}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={capturePhoto}
                        disabled={!photoCameraReady}
                        className="flex-1 gradient-info text-info-foreground py-3 rounded-2xl text-sm font-semibold active:scale-[0.98] transition-transform shadow-glow disabled:opacity-50"
                      >
                        Capture Photo
                      </button>
                      <button
                        onClick={stopPhotoCamera}
                        className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl text-sm font-semibold active:scale-[0.98] transition-transform"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
                  <div className="relative rounded-2xl overflow-hidden mb-4">
                    <img src={imagePreview} alt="Fridge" className="w-full h-52 object-cover" />
                    <button
                      onClick={() => { setImagePreview(null); setDetected([]); setSelected(new Set()); }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-foreground/60 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-background" />
                    </button>
                    {scanning && (
                      <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
                        <div className="glass-elevated px-5 py-3 flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                          <span className="text-sm font-semibold">Analyzing...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {detected.length === 0 && !scanning && (
                    <button
                      onClick={handleScan}
                      className="w-full gradient-info text-info-foreground py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mb-4 shadow-glow"
                    >
                      <Sparkles className="w-4 h-4" /> Detect Ingredients with AI
                    </button>
                  )}

                  {/* Detected items with expandable detail */}
                  {(detected.length > 0 || scanning) && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg gradient-info flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-info-foreground" />
                          </div>
                          Detected Items {detected.length > 0 && `(${detected.length})`}
                        </h2>
                        {detected.length > 0 && (
                          <span className="text-xs text-muted-foreground">{selected.size} selected</span>
                        )}
                      </div>

                      <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                        <AnimatePresence>
                          {detected.map(det => (
                            <motion.div
                              key={det.name}
                              variants={itemAnim}
                              initial="hidden"
                              animate="show"
                              layout
                              className="glass-elevated overflow-hidden rounded-2xl"
                            >
                              <div
                                className={`p-3.5 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all ${
                                  selected.has(det.name) ? 'ring-2 ring-primary/40 shadow-glow rounded-2xl' : ''
                                }`}
                                onClick={() => toggleSelect(det.name)}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  selected.has(det.name) ? 'bg-primary border-primary' : 'border-border'
                                }`}>
                                  {selected.has(det.name) && (
                                    <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-2xl">{det.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium">{det.name}</p>
                                  <p className="text-[11px] text-muted-foreground">{det.quantity} · {det.category}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex flex-col items-end gap-1">
                                    <span className={`text-xs font-bold ${confidenceColor(det.confidence)}`}>
                                      {det.confidence}%
                                    </span>
                                    <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full ${confidenceBg(det.confidence)}`} style={{ width: `${det.confidence}%` }} />
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setExpandedItem(expandedItem === det.name ? null : det.name); }}
                                    className="p-1"
                                  >
                                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedItem === det.name ? 'rotate-180' : ''}`} />
                                  </button>
                                </div>
                              </div>
                              <AnimatePresence>
                                {expandedItem === det.name && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="px-4 pb-3 pt-1 space-y-2 border-t border-border/50">
                                      {det.daysLeft !== undefined && (
                                        <div className="flex items-center gap-2">
                                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                            det.daysLeft <= 3 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                                          }`}>
                                            {det.daysLeft <= 1 ? 'Expires today!' : `~${det.daysLeft} days left`}
                                          </span>
                                        </div>
                                      )}
                                      {det.nutritionInfo && (
                                        <p className="text-xs text-muted-foreground">🥗 {det.nutritionInfo}</p>
                                      )}
                                      {det.storeTip && (
                                        <p className="text-xs text-muted-foreground">💡 {det.storeTip}</p>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>

                      {detected.length > 0 && !scanning && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-2.5">
                          <button
                            onClick={addSelectedToFridge}
                            disabled={selected.size === 0}
                            className="w-full gradient-info text-info-foreground py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-glow disabled:opacity-50"
                          >
                            <Plus className="w-4 h-4" /> Add {selected.size} Items to Fridge
                          </button>
                          <button
                            onClick={() => { setImagePreview(null); setDetected([]); setSelected(new Set()); }}
                            className="w-full bg-secondary text-secondary-foreground py-3 rounded-2xl font-semibold text-sm active:scale-[0.98] transition-transform"
                          >
                            Scan Another Photo
                          </button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tips */}
              {!imagePreview && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg gradient-warm flex items-center justify-center">
                      <Lightbulb className="w-3 h-3 text-warning-foreground" />
                    </div>
                    Tips for best results
                  </h2>
                  <div className="space-y-2">
                    {[
                      { emoji: '💡', tip: 'Good lighting helps AI detect items accurately' },
                      { emoji: '📐', tip: 'Open the fridge door fully for a clear view' },
                      { emoji: '🏷️', tip: 'Labels facing forward improve detection' },
                    ].map((t, i) => (
                      <div key={i} className="glass-card p-3.5 flex items-center gap-3 rounded-2xl">
                        <span className="text-lg">{t.emoji}</span>
                        <p className="text-xs text-muted-foreground">{t.tip}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            /* Barcode scanning mode */
            <div className="space-y-4">
              <div className="glass-elevated p-4 rounded-2xl">
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={startBarcodeCamera}
                    disabled={barcodeScanning}
                    className="flex-1 gradient-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-glow disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" /> Open Camera
                  </button>
                  <button
                    onClick={stopBarcodeCamera}
                    disabled={!barcodeScanning}
                    className="bg-secondary text-secondary-foreground py-2.5 px-4 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
                  >
                    Stop
                  </button>
                </div>

                {barcodeScanning && (
                  <div id="fridge-barcode-reader" className="w-full rounded-2xl overflow-hidden bg-foreground/5 min-h-[220px] mb-3" />
                )}

                <p className="text-xs font-semibold text-muted-foreground mb-2">Or enter barcode manually:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Barcode className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={manualBarcode}
                      onChange={e => setManualBarcode(e.target.value)}
                      placeholder="e.g. 0012000001536"
                      className="w-full bg-secondary/50 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    disabled={!manualBarcode.trim()}
                    className="gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Inventory tab */
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Expiry Calendar */}
          <motion.div variants={itemAnim}>
            <ExpiryCalendar items={items} />
          </motion.div>

          {/* Search bar */}
          <motion.div variants={itemAnim} className="mb-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or category..."
                className="w-full bg-secondary/50 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
          </motion.div>

          {/* Filter chips */}
          <motion.div variants={itemAnim} className="mb-3 space-y-2">
            {/* Category filters */}
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
              <button
                onClick={() => setFilterCategory(null)}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0 transition-all ${!filterCategory ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0 transition-all ${filterCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {/* Location filters */}
            <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
              <button
                onClick={() => setFilterLocation(null)}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0 transition-all flex items-center gap-1 ${!filterLocation ? 'bg-info text-info-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                <MapPin className="w-3 h-3" /> All Locations
              </button>
              {locations.map(loc => (
                <button
                  key={loc}
                  onClick={() => setFilterLocation(filterLocation === loc ? null : loc)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0 transition-all ${filterLocation === loc ? 'bg-info text-info-foreground' : 'bg-secondary text-secondary-foreground'}`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Add Item Button */}
          <motion.div variants={itemAnim} className="mb-4">
            <button
              onClick={() => setModalItem(null)}
              className="w-full glass-elevated p-3.5 flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-primary active:scale-[0.98] transition-transform border-2 border-dashed border-primary/20"
            >
              <Plus className="w-4 h-4" /> Add New Item
            </button>
          </motion.div>

          {/* Expiring Soon */}
          {expiringSoon.length > 0 && (
            <motion.div variants={itemAnim} className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-destructive/15 flex items-center justify-center">
                    <AlertTriangle className="w-3 h-3 text-destructive" />
                  </div>
                  Expiring Soon
                </h2>
                <button
                  onClick={addExpiringToGrocery}
                  className="flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full active:scale-95 transition-transform"
                >
                  <ShoppingCart className="w-3 h-3" /> Restock
                </button>
              </div>
              <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
                {expiringSoon.map(fItem => (
                  <div
                    key={fItem.id}
                    onClick={() => setModalItem(fItem)}
                    className="glass-card p-3 min-w-[100px] flex flex-col items-center gap-1 shrink-0 rounded-xl cursor-pointer active:scale-[0.97] transition-transform"
                  >
                    <span className="text-2xl">{fItem.emoji}</span>
                    <p className="text-[11px] font-semibold text-center">{fItem.name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      fItem.daysLeft <= 1 ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                    }`}>
                      {fItem.daysLeft <= 1 ? 'Today!' : `${fItem.daysLeft}d left`}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* All fridge items */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg gradient-info flex items-center justify-center">
                <Package className="w-3 h-3 text-info-foreground" />
              </div>
              All Items ({allFridgeItems.length})
            </h2>
            <button
              onClick={() => { setBulkMode(b => !b); setBulkSelected(new Set()); }}
              className={`text-[11px] px-3 py-1.5 rounded-full font-semibold transition-all ${
                bulkMode ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {bulkMode ? 'Exit Bulk' : 'Bulk Edit'}
            </button>
          </div>

          {/* Bulk actions bar */}
          {bulkMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-elevated p-3 rounded-2xl mb-3 flex items-center gap-2 flex-wrap"
            >
              <span className="text-xs font-semibold flex-1 text-foreground min-w-0">
                {bulkSelected.size} selected
              </span>
              <button
                onClick={() => setBulkSelected(new Set(allFridgeItems.map(i => i.id)))}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-medium active:scale-95 transition-transform"
              >
                Select All
              </button>
              <button
                onClick={() => setBulkSelected(new Set())}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-medium active:scale-95 transition-transform"
              >
                Clear
              </button>
              {bulkSelected.size > 0 && (
                <button
                  onClick={() => {
                    const selected = items.filter(i => bulkSelected.has(i.id));
                    setWasteDialog({ items: selected });
                  }}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive font-medium flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <Trash2 className="w-3 h-3" /> Delete {bulkSelected.size}
                </button>
              )}
            </motion.div>
          )}

          <div className="space-y-2">
            {allFridgeItems.map(fItem => (
              <motion.div
                key={fItem.id}
                variants={itemAnim}
                className={`glass-elevated p-3.5 flex items-center gap-3 rounded-2xl cursor-pointer active:scale-[0.98] transition-all ${
                  bulkMode && bulkSelected.has(fItem.id) ? 'ring-2 ring-primary/50 shadow-glow' : ''
                }`}
                onClick={() => bulkMode ? toggleBulkItem(fItem.id) : setModalItem(fItem)}
              >
                {bulkMode && (
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    bulkSelected.has(fItem.id) ? 'bg-primary border-primary' : 'border-border'
                  }`}>
                    {bulkSelected.has(fItem.id) && (
                      <svg className="w-3.5 h-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}
                <span className="text-2xl">{fItem.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{fItem.name}</p>
                  <p className="text-[11px] text-muted-foreground">{fItem.quantity} · {fItem.category}{fItem.location ? ` · 📍${fItem.location}` : ''}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                  fItem.daysLeft <= 1 ? 'bg-destructive/10 text-destructive' :
                  fItem.daysLeft <= 3 ? 'bg-warning/10 text-warning' :
                  'bg-success/10 text-success'
                }`}>
                  {fItem.daysLeft <= 1 ? 'Today!' : `${fItem.daysLeft}d left`}
                </span>
                {!bulkMode && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); setModalItem(fItem); }}
                      className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                    >
                      <Pencil className="w-3.5 h-3.5 text-primary" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setWasteDialog({ items: [fItem] }); }}
                      className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No Food Detected Dialog */}
      <AnimatePresence>
        {showNoFoodDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6"
            onClick={() => setShowNoFoodDialog(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-sm glass-elevated rounded-3xl p-6 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-base font-bold mb-1">No Food Items Detected</h3>
              <p className="text-sm text-muted-foreground mb-5">
                This photo doesn't appear to contain recognizable food items. Try a clearer photo of your fridge, pantry, or countertop with food visible.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => { setShowNoFoodDialog(false); setImagePreview(null); }}
                  className="w-full gradient-info text-info-foreground py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
                >
                  Try Another Photo
                </button>
                <button
                  onClick={() => setShowNoFoodDialog(false)}
                  className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detection Confirmation Dialog */}
      <AnimatePresence>
        {showDetectionDialog && detected.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6"
            onClick={() => setShowDetectionDialog(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-sm glass-elevated rounded-3xl p-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-base font-bold">{selected.size} Food Item{selected.size !== 1 ? 's' : ''} Detected!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {detected.slice(0, 3).map(d => d.name).join(', ')}
                  {detected.length > 3 ? ` and ${detected.length - 3} more` : ''}
                </p>
              </div>
              <div className="space-y-2">
                <button
                  onClick={addSelectedToFridge}
                  className="w-full gradient-info text-info-foreground py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-glow"
                >
                  <Plus className="w-4 h-4" /> Add {selected.size} Items to Fridge
                </button>
                <button
                  onClick={() => setShowDetectionDialog(false)}
                  className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
                >
                  Review & Edit First
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waste Tracking Dialog */}
      <AnimatePresence>
        {wasteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] bg-background/80 backdrop-blur-sm flex items-end justify-center p-4 pb-6"
            onClick={() => setWasteDialog(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-sm glass-elevated rounded-3xl p-6 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl mb-2">🤔</div>
              <h3 className="text-base font-bold mb-1">
                Remove {wasteDialog.items.length === 1 ? `"${wasteDialog.items[0].name}"` : `${wasteDialog.items.length} items`}?
              </h3>
              <p className="text-sm text-muted-foreground mb-5">
                How were {wasteDialog.items.length === 1 ? 'it' : 'they'} removed? This helps track your waste and improve suggestions.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const ids = wasteDialog.items.map(i => i.id);
                    deleteItems(ids, 'used');
                    setBulkSelected(new Set());
                    setBulkMode(false);
                    setWasteDialog(null);
                  }}
                  className="flex flex-col items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-transform"
                >
                  <Check className="w-6 h-6" />
                  <span>I Used It</span>
                  <span className="text-[10px] font-normal opacity-70">Good job! 🌿</span>
                </button>
                <button
                  onClick={() => {
                    const ids = wasteDialog.items.map(i => i.id);
                    deleteItems(ids, 'wasted');
                    setBulkSelected(new Set());
                    setBulkMode(false);
                    setWasteDialog(null);
                  }}
                  className="flex flex-col items-center gap-2 bg-destructive/10 border border-destructive/30 text-destructive py-4 rounded-2xl font-semibold text-sm active:scale-95 transition-transform"
                >
                  <Trash2 className="w-6 h-6" />
                  <span>It Got Wasted</span>
                  <span className="text-[10px] font-normal opacity-70">We'll help next time 💡</span>
                </button>
              </div>
              <button
                onClick={() => setWasteDialog(null)}
                className="mt-3 text-xs text-muted-foreground underline"
              >Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalItem !== undefined && (
          <FridgeItemModal
            item={modalItem}
            onSave={(saved) => {
              setItems(prev => {
                const exists = prev.find(i => i.id === saved.id);
                if (exists) return prev.map(i => i.id === saved.id ? saved : i);
                return [...prev, saved];
              });
              toast.success(modalItem ? 'Item updated!' : 'Item added to fridge!');
              setModalItem(undefined);
            }}
            onDelete={(id) => {
              const item = items.find(i => i.id === id);
              if (item) setWasteDialog({ items: [item] });
              setModalItem(undefined);
            }}
            onClose={() => setModalItem(undefined)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FridgeScanScreen;
