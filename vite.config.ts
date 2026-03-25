import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// GitHub project Pages: set VITE_BASE_PATH=/Your-Repo-Name/ in CI or when building
const base =
  process.env.VITE_BASE_PATH?.trim() ||
  "/";

// https://vitejs.dev/config/
export default defineConfig({
  base: base.endsWith("/") || base === "/" ? base : `${base}/`,
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
});
