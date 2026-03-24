import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import ChatScreen from "./pages/ChatScreen";
import MealsScreen from "./pages/MealsScreen";
import PlannerScreen from "./pages/PlannerScreen";
import GroceryScreen from "./pages/GroceryScreen";
import ProfileScreen from "./pages/ProfileScreen";
import FridgeScanScreen from "./pages/FridgeScanScreen";
import YukaScanScreen from "./pages/YukaScanScreen";
import FoodQuizScreen from "./pages/FoodQuizScreen";
import PrintShareScreen from "./pages/PrintShareScreen";
import AchievementsScreen from "./pages/AchievementsScreen";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * Routes are defined WITHOUT a key on <Routes> and WITHOUT wrapping
 * AnimatePresence here.  AppLayout is persistent across navigations —
 * it never remounts — so GuidedTour state survives every route change.
 * Page-level AnimatePresence lives inside AppLayout (around <Outlet>).
 */
const AppRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/"             element={<Dashboard />} />
      <Route path="/chat"         element={<ChatScreen />} />
      <Route path="/meals"        element={<MealsScreen />} />
      <Route path="/planner"      element={<PlannerScreen />} />
      <Route path="/grocery"      element={<GroceryScreen />} />
      <Route path="/profile"      element={<ProfileScreen />} />
      <Route path="/scan"         element={<FridgeScanScreen />} />
      <Route path="/health-scan"  element={<YukaScanScreen />} />
      <Route path="/food-quiz"    element={<FoodQuizScreen />} />
      <Route path="/print-share"  element={<PrintShareScreen />} />
      <Route path="/achievements" element={<AchievementsScreen />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
