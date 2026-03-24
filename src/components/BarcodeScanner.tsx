import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Barcode, Package, AlertCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

// A small product database for barcode lookups
const barcodeProducts: Record<string, { name: string; category: string; price: number; quantity: string }> = {
  '0011110838995': { name: 'Kroger Whole Milk', category: 'Dairy', price: 3.99, quantity: '1 gal' },
  '0078742370903': { name: 'Great Value Butter', category: 'Dairy', price: 3.48, quantity: '1 lb' },
  '0041331092609': { name: 'Heinz Ketchup', category: 'Condiments', price: 4.29, quantity: '38 oz' },
  '0041196910759': { name: 'Barilla Penne Pasta', category: 'Grains', price: 1.89, quantity: '16 oz' },
  '0041130000553': { name: 'Del Monte Sweet Corn', category: 'Canned', price: 1.29, quantity: '15.25 oz' },
  '0012000001536': { name: 'Pepsi Cola', category: 'Beverages', price: 2.49, quantity: '2L' },
  '0049000006346': { name: 'Nescafe Instant Coffee', category: 'Beverages', price: 7.99, quantity: '7 oz' },
  '0038000138416': { name: 'Kelloggs Corn Flakes', category: 'Cereals', price: 4.49, quantity: '18 oz' },
  '0030000311707': { name: 'Quaker Oats', category: 'Cereals', price: 5.29, quantity: '42 oz' },
  '0051500255162': { name: 'Smucker\'s Strawberry Jam', category: 'Condiments', price: 3.99, quantity: '18 oz' },
  '4099100179552': { name: 'Nutella Hazelnut Spread', category: 'Condiments', price: 5.49, quantity: '13 oz' },
  '0036800440432': { name: 'French\'s Yellow Mustard', category: 'Condiments', price: 2.79, quantity: '14 oz' },
  '0054400000047': { name: 'Kraft Mac & Cheese', category: 'Grains', price: 1.49, quantity: '7.25 oz' },
  '0021130126026': { name: 'Chobani Greek Yogurt', category: 'Dairy', price: 1.79, quantity: '5.3 oz' },
  '0070470450407': { name: 'Glad Cling Wrap', category: 'Household', price: 3.99, quantity: '200 sq ft' },
};

interface Props {
  onAdd: (product: { name: string; category: string; price: number; quantity: string }) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onAdd, onClose }: Props) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [scannedProduct, setScannedProduct] = useState<{ name: string; category: string; price: number; quantity: string } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lookupBarcode = (code: string) => {
    const cleaned = code.replace(/[^0-9]/g, '');
    const product = barcodeProducts[cleaned];
    if (product) {
      setScannedProduct(product);
      setError('');
    } else {
      // Generate a generic product for unknown barcodes
      setScannedProduct({
        name: `Product (${cleaned.slice(-6)})`,
        category: 'Other',
        price: Math.round((Math.random() * 8 + 1) * 100) / 100,
        quantity: '1',
      });
      setError('');
    }
  };

  const startCamera = async () => {
    setError('');
    setScanning(true);
    try {
      const html5QrCode = new Html5Qrcode('barcode-reader');
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 } },
        (decodedText) => {
          lookupBarcode(decodedText);
          html5QrCode.stop().catch(() => {});
          setScanning(false);
        },
        () => {} // ignore scan failures
      );
    } catch {
      setError('Camera access denied. You can enter the barcode manually below.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const handleManualLookup = () => {
    if (manualCode.trim()) {
      lookupBarcode(manualCode.trim());
    }
  };

  const handleAddProduct = () => {
    if (scannedProduct) {
      onAdd(scannedProduct);
      setScannedProduct(null);
      setManualCode('');
    }
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
        className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-card rounded-t-3xl border-t border-border overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-coral flex items-center justify-center">
              <Barcode className="w-4 h-4 text-coral-foreground" />
            </div>
            <h3 className="text-base font-bold">Scan Barcode</h3>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Camera scanner area */}
          <div ref={containerRef} className="relative">
            <div
              id="barcode-reader"
              className={`w-full rounded-2xl overflow-hidden bg-foreground/5 ${scanning ? 'min-h-[240px]' : 'min-h-0'}`}
            />
            {!scanning && !scannedProduct && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Point your camera at a product barcode to add it to your list
                </p>
                <button
                  onClick={startCamera}
                  className="gradient-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                >
                  <Camera className="w-4 h-4 inline mr-1.5" /> Open Camera
                </button>
              </div>
            )}
            {scanning && (
              <button
                onClick={stopCamera}
                className="absolute bottom-3 right-3 bg-card/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                Stop
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Manual barcode entry */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Or enter barcode number manually:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Barcode className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualLookup()}
                  placeholder="e.g. 0041331092609"
                  className="w-full bg-secondary/50 text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button
                onClick={handleManualLookup}
                disabled={!manualCode.trim()}
                className="gradient-primary text-primary-foreground px-4 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                Look Up
              </button>
            </div>
          </div>

          {/* Sample barcodes */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Try these sample barcodes:</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(barcodeProducts).slice(0, 6).map(([code, product]) => (
                <button
                  key={code}
                  onClick={() => { setManualCode(code); lookupBarcode(code); }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium active:scale-95 transition-transform"
                >
                  {product.name.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Scanned product result */}
          <AnimatePresence>
            {scannedProduct && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-elevated p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{scannedProduct.name}</p>
                    <p className="text-xs text-muted-foreground">{scannedProduct.quantity} · {scannedProduct.category}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">${scannedProduct.price.toFixed(2)}</p>
                </div>
                <button
                  onClick={handleAddProduct}
                  className="w-full gradient-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform"
                >
                  Add to Grocery List
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BarcodeScanner;
