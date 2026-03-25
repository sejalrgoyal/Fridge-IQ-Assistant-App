import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * GitHub Pages project sites live under /REPO_NAME/. Set when building for deploy:
 *   VITE_BASE_PATH=/Fridge-IQ-Assistant-App/ npm run build
 * (Trailing slash required.) Leave unset for local dev and root hosting.
 */
const pagesBase = process.env.VITE_BASE_PATH?.trim();
const base =
  pagesBase && pagesBase !== "/"
    ? pagesBase.endsWith("/")
      ? pagesBase
      : `${pagesBase}/`
    : "/";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
