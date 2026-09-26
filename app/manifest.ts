import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AgoCode — Interactive Algorithm Notebook",
    short_name: "AgoCode",
    description: "Understand, model, trace, rebuild, transfer, and recall algorithms with evidence-driven practice.",
    start_url: "/practice/session",
    scope: "/",
    display: "standalone",
    background_color: "#fcfbf7",
    theme_color: "#fcfbf7",
    icons: [
      {
        src: "/icons/agocode-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/agocode-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
