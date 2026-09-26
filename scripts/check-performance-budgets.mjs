import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const staticRoot = join(root, ".next", "static");
const KiB = 1024;
const MiB = 1024 * KiB;

const budgets = {
  js: {
    single: 1200 * KiB,
    total: 8 * MiB,
  },
  css: {
    single: 400 * KiB,
    total: 2 * MiB,
  },
};

if (!existsSync(staticRoot)) {
  console.error("Performance budget check requires a completed Next.js production build (.next/static missing).");
  process.exit(1);
}

function collectFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(absolute, files);
    else if (entry.isFile()) files.push(absolute);
  }
  return files;
}

function formatBytes(bytes) {
  if (bytes >= MiB) return `${(bytes / MiB).toFixed(2)} MiB`;
  return `${(bytes / KiB).toFixed(1)} KiB`;
}

const assets = collectFiles(staticRoot)
  .map((path) => ({ path, bytes: statSync(path).size, ext: extname(path).slice(1) }))
  .filter((asset) => asset.ext === "js" || asset.ext === "css");

const js = assets.filter((asset) => asset.ext === "js");
const css = assets.filter((asset) => asset.ext === "css");
const errors = [];

if (!js.length) errors.push("No JavaScript production assets were found; budget check may be running before build output is complete.");

for (const [kind, files] of [["js", js], ["css", css]]) {
  const budget = budgets[kind];
  const total = files.reduce((sum, asset) => sum + asset.bytes, 0);
  const largest = [...files].sort((a, b) => b.bytes - a.bytes)[0];

  if (total > budget.total) {
    errors.push(`${kind.toUpperCase()} total ${formatBytes(total)} exceeds ${formatBytes(budget.total)} budget.`);
  }
  if (largest && largest.bytes > budget.single) {
    errors.push(
      `${kind.toUpperCase()} asset ${relative(root, largest.path)} is ${formatBytes(largest.bytes)}, `
      + `above ${formatBytes(budget.single)} single-asset budget.`,
    );
  }

  console.log(
    `${kind.toUpperCase()}: ${files.length} assets · ${formatBytes(total)} total`
    + (largest ? ` · largest ${formatBytes(largest.bytes)} (${relative(root, largest.path)})` : ""),
  );
}

if (errors.length) {
  console.error(`Performance budgets failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Production asset budgets passed. These are regression guards, not substitutes for real-user performance measurement.");
