/* global self, caches, Response */

const CACHE_PREFIX = "agocode-pwa-";
const CACHE_VERSION = "v1";
const SHELL_CACHE = `${CACHE_PREFIX}${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_PREFIX}${CACHE_VERSION}-runtime`;

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/practice",
  "/practice/session",
  "/plan",
  "/review",
  "/review/weekly",
  "/progress",
  "/settings/data",
  "/brand/agocode-mark.svg",
  "/icons/agocode-192.png",
  "/icons/agocode-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== SHELL_CACHE && name !== RUNTIME_CACHE)
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

function isNextRouterPayload(request, url) {
  return (
    url.searchParams.has("_rsc") ||
    request.headers.get("RSC") === "1" ||
    request.headers.has("Next-Router-State-Tree") ||
    request.headers.has("Next-Router-Prefetch")
  );
}

function isCacheableAsset(request, url) {
  if (url.origin !== self.location.origin) return false;
  if (url.pathname === "/sw.js" || url.pathname.startsWith("/api/")) return false;
  return ["script", "style", "image", "font"].includes(request.destination);
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const shellMatch = await caches.match(request, { ignoreSearch: true });
    if (shellMatch) return shellMatch;
    const fallback = await caches.match("/offline");
    return fallback ?? new Response("AgoCode is offline and this page is not cached yet.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirstWithRefresh(request, event) {
  const cached = await caches.match(request);
  const refresh = fetch(request).then(async (response) => {
    if (response.ok && response.type === "basic") {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  });

  if (cached) {
    event.waitUntil(refresh.catch(() => undefined));
    return cached;
  }

  try {
    return await refresh;
  } catch {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js" || url.pathname.startsWith("/api/")) return;

  // Next.js RSC/router payloads are build-sensitive and intentionally remain network-only.
  // Offline same-origin link clicks are converted to full document navigations by the client registrar.
  if (isNextRouterPayload(request, url)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isCacheableAsset(request, url)) {
    event.respondWith(cacheFirstWithRefresh(request, event));
  }
});
