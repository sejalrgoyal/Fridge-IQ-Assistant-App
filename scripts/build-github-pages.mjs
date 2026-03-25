/**
 * Production build for GitHub Pages project site:
 * https://<user>.github.io/<repo>/
 *
 * Edit REPO_SLUG if your GitHub repository name changes.
 */
import { execSync } from "node:child_process";
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const REPO_SLUG = "Fridge-IQ-Assistant-App";

process.env.VITE_BASE_PATH = `/${REPO_SLUG}/`;

execSync("npx vite build", { cwd: root, stdio: "inherit", env: process.env });

copyFileSync(join(root, "dist", "index.html"), join(root, "dist", "404.html"));
console.log("Wrote dist/404.html for GitHub Pages SPA routing.");
