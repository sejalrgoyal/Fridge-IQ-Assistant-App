import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensures tab title is FridgeIQ even if an older cached index.html still says "Lovable App"
document.title = "FridgeIQ";

createRoot(document.getElementById("root")!).render(<App />);
