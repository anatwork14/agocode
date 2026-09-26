import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function file(relativePath) {
  return path.join(root, relativePath);
}

function text(relativePath) {
  return readFileSync(file(relativePath), "utf8");
}

function pngDimensions(relativePath) {
  const buffer = readFileSync(file(relativePath));
  const signature = buffer.subarray(0, 8).toString("hex");
  assert.equal(signature, "89504e470d0a1a0a", `${relativePath} must be a PNG`);
  assert.equal(buffer.subarray(12, 16).toString("ascii"), "IHDR", `${relativePath} must contain IHDR first`);
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

const manifestModule = await import(pathToFileURL(file("app/manifest.ts")).href);
const manifest = manifestModule.default();

assert.equal(manifest.name, "AgoCode — Interactive Algorithm Notebook");
assert.equal(manifest.short_name, "AgoCode");
assert.equal(manifest.start_url, "/practice/session");
assert.equal(manifest.scope, "/");
assert.equal(manifest.display, "standalone");
assert.equal(manifest.background_color, "#fcfbf7");
assert.equal(manifest.theme_color, "#fcfbf7");
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, "manifest needs install icons");

const requiredIcons = new Map([
  ["/icons/agocode-192.png", 192],
  ["/icons/agocode-512.png", 512],
]);
for (const [src, size] of requiredIcons) {
  const icon = manifest.icons.find((entry) => entry.src === src);
  assert.ok(icon, `manifest must reference ${src}`);
  assert.equal(icon.type, "image/png");
  assert.equal(icon.sizes, `${size}x${size}`);
  const relative = `public${src}`;
  assert.ok(existsSync(file(relative)), `${relative} must exist`);
  assert.deepEqual(pngDimensions(relative), { width: size, height: size });
}

assert.ok(existsSync(file("app/offline/page.tsx")), "offline fallback route must exist");

const serviceWorker = text("public/sw.js");
for (const expected of [
  'const CACHE_PREFIX = "agocode-pwa-"',
  '"/offline"',
  'request.method !== "GET"',
  'url.pathname.startsWith("/api/")',
  'url.searchParams.has("_rsc")',
  'request.mode === "navigate"',
  "networkFirstNavigation",
  "cacheFirstWithRefresh",
  "caches.delete",
]) {
  assert.ok(serviceWorker.includes(expected), `service worker contract missing: ${expected}`);
}

const registrar = text("components/pwa/ServiceWorkerRegistration.tsx");
assert.ok(registrar.includes('navigator.serviceWorker.register("/sw.js"'), "root service worker must be registered");
assert.ok(registrar.includes('updateViaCache: "none"'), "service worker updates must bypass HTTP cache");
assert.ok(registrar.includes("window.location.assign(anchor.href)"), "offline links must fall back to full document navigation");
assert.ok(registrar.includes('window.addEventListener("offline"'), "offline state must be observable");

const layout = text("app/layout.tsx");
assert.ok(layout.includes("<ServiceWorkerRegistration />"), "root layout must mount service-worker registration");
assert.ok(layout.includes('import "./pwa.css"'), "root layout must load offline-status styles");

const nextConfig = text("next.config.ts");
assert.ok(nextConfig.includes('source: "/sw.js"'), "service worker response headers must be explicit");
assert.ok(nextConfig.includes('value: "no-cache, no-store, must-revalidate"'), "service worker script must not be persistently HTTP-cached");
assert.ok(nextConfig.includes('key: "Service-Worker-Allowed"'), "service-worker scope header must remain explicit");

console.log("PWA contracts validated: manifest, icons, offline shell, cache policy, registration, and update headers.");
