import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';
import GuidedTour from './GuidedTour';

/**
 * AppLayout is a PERSISTENT layout — it never remounts across route changes.
 * Only the <Outlet> (page content) swaps out, wrapped in AnimatePresence so
 * pages still animate in/out.  This means GuidedTour state survives every
 * navigation.
 */
const AppLayout = () => {
  const location = useLocation();
  const [showTour, setShowTour] = useState(() => !localStorage.getItem('fridgeiq_tour_done'));

  // Listen for the "replay tour" event dispatched by Dashboard's ? button
  useEffect(() => {
    const handler = () => {
      localStorage.removeItem('fridgeiq_tour_done');
      localStorage.removeItem('fridgeiq_tour_step');
      setShowTour(true);
    };
    window.addEventListener('fridgeiq-start-tour', handler);
    return () => window.removeEventListener('fridgeiq-start-tour', handler);
  }, []);

  return (
    <div className="w-full min-h-[100dvh] bg-background relative">
      {/* Page content — AnimatePresence keyed on pathname for slide transitions */}
      <main className="pb-20 sm:pb-24">
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            <Outlet />
          </div>
        </AnimatePresence>
      </main>

      <BottomNav />

      <AnimatePresence>
        {showTour && (
          <GuidedTour onDone={() => {
            setShowTour(false);
            localStorage.removeItem('fridgeiq_tour_step');
          }} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppLayout;
