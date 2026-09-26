"use client";

import { useEffect, useState } from "react";

function shouldForceDocumentNavigation(event: MouseEvent) {
  if (navigator.onLine || event.defaultPrevented || event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (!(event.target instanceof Element)) return false;

  const anchor = event.target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.target && anchor.target !== "_self") return false;

  const rawHref = anchor.getAttribute("href");
  if (!rawHref || rawHref.startsWith("#")) return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  return url.protocol === "http:" || url.protocol === "https:";
}

export function ServiceWorkerRegistration() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const syncConnectivity = () => setOffline(!navigator.onLine);
    syncConnectivity();

    window.addEventListener("online", syncConnectivity);
    window.addEventListener("offline", syncConnectivity);

    const handleOfflineNavigation = (event: MouseEvent) => {
      if (!shouldForceDocumentNavigation(event)) return;
      const anchor = (event.target as Element).closest("a[href]") as HTMLAnchorElement;
      event.preventDefault();
      window.location.assign(anchor.href);
    };
    document.addEventListener("click", handleOfflineNavigation, true);

    let disposed = false;
    const register = async () => {
      if (disposed || process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (!disposed) void registration.update();
      } catch {
        // Offline learning still works from browser-local evidence even if SW registration is unavailable.
      }
    };

    if (document.readyState === "complete") {
      const timer = window.setTimeout(register, 0);
      return () => {
        disposed = true;
        window.clearTimeout(timer);
        window.removeEventListener("online", syncConnectivity);
        window.removeEventListener("offline", syncConnectivity);
        document.removeEventListener("click", handleOfflineNavigation, true);
      };
    }

    window.addEventListener("load", register, { once: true });
    return () => {
      disposed = true;
      window.removeEventListener("load", register);
      window.removeEventListener("online", syncConnectivity);
      window.removeEventListener("offline", syncConnectivity);
      document.removeEventListener("click", handleOfflineNavigation, true);
    };
  }, []);

  if (!offline) return null;

  return (
    <aside className="pwa-offline-status" role="status" aria-live="polite">
      <strong>Offline</strong>
      <span>Cached AgoCode pages and browser-local evidence remain available. Links use full cached-page navigation until connectivity returns.</span>
    </aside>
  );
}
