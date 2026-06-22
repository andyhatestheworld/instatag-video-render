// Copies gif.js's web worker into /public so it can be loaded at runtime
// for client-side GIF export. Runs automatically after `npm install`.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const src = "node_modules/gif.js/dist/gif.worker.js";
const dest = "public/gif.worker.js";

try {
  if (existsSync(src)) {
    if (!existsSync(dirname(dest))) mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    console.log("[instatag] gif.worker.js copied to /public");
  } else {
    console.warn("[instatag] gif.js worker not found (skipped, GIF export may be unavailable)");
  }
} catch (err) {
  console.warn("[instatag] could not copy gif worker:", err?.message ?? err);
}
// Never fail install because of this optional step.
process.exit(0);
