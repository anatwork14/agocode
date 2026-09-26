import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const scanRoots = [join(root, "app"), join(root, "components")];
const errors = [];

function collectFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) collectFiles(absolute, files);
    else if (entry.isFile() && [".tsx", ".ts"].includes(extname(entry.name))) files.push(absolute);
  }
  return files;
}

function extractOpeningTags(source, tagName) {
  const tags = [];
  const matcher = new RegExp(`<${tagName}\\b`, "g");
  let match;

  while ((match = matcher.exec(source))) {
    let braceDepth = 0;
    let quote = null;
    let escaped = false;
    let closed = false;

    for (let index = match.index; index < source.length; index += 1) {
      const char = source[index];

      if (quote) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === quote) quote = null;
        continue;
      }

      if (char === '"' || char === "'" || char === "`") {
        quote = char;
        continue;
      }
      if (char === "{") {
        braceDepth += 1;
        continue;
      }
      if (char === "}" && braceDepth > 0) {
        braceDepth -= 1;
        continue;
      }
      if (char === ">" && braceDepth === 0) {
        tags.push(source.slice(match.index, index + 1));
        matcher.lastIndex = index + 1;
        closed = true;
        break;
      }
    }

    if (!closed) break;
  }

  return tags;
}

function hasAccessibleName(tag) {
  return /\baria-label\s*=/.test(tag) || /\baria-labelledby\s*=/.test(tag);
}

for (const scanRoot of scanRoots) {
  for (const file of collectFiles(scanRoot)) {
    const source = readFileSync(file, "utf8");
    const display = relative(root, file);

    for (const tag of extractOpeningTags(source, "input")) {
      if (/\btype\s*=\s*["']range["']/.test(tag) && !hasAccessibleName(tag)) {
        errors.push(`${display}: range input requires aria-label or aria-labelledby.`);
      }
    }

    for (const tag of extractOpeningTags(source, "svg")) {
      if (/\brole\s*=\s*["']img["']/.test(tag) && !hasAccessibleName(tag)) {
        errors.push(`${display}: SVG with role=img requires aria-label or aria-labelledby.`);
      }
    }

    if (/href\s*=\s*["']#["']/.test(source)) {
      errors.push(`${display}: placeholder href="#" is not an accessible navigation target.`);
    }
  }
}

const layout = readFileSync(join(root, "app", "layout.tsx"), "utf8");
if (!layout.includes('className="skip-link"') || !layout.includes('href="#main-content"')) {
  errors.push("app/layout.tsx: root layout must expose a keyboard skip link to #main-content.");
}
if (!layout.includes('id="main-content"')) {
  errors.push("app/layout.tsx: root layout must expose the #main-content skip target.");
}

const siteHeader = readFileSync(join(root, "components", "SiteHeader.tsx"), "utf8");
if (!/<nav\b/.test(siteHeader) || !/aria-label\s*=/.test(siteHeader)) {
  errors.push("components/SiteHeader.tsx: primary navigation requires a labeled nav landmark.");
}

if (errors.length) {
  console.error(`Accessibility contract check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Accessibility contracts passed.");
