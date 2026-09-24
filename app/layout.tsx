import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, JetBrains_Mono, Source_Sans_3 } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";
import "./home.css";
import "./learning.css";
import "./timeline.css";
import "./explain.css";
import "./complexity.css";
import "./chapter-one.css";
import "./chapter-two.css";
import "./review.css";

const editorial = Fraunces({ subsets: ["latin"], variable: "--font-editorial", display: "swap" });
const reading = Source_Sans_3({ subsets: ["latin"], variable: "--font-reading", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "AgoCode — Learn algorithms by seeing them move", template: "%s · AgoCode" },
  description: "An interactive algorithm notebook for understanding, tracing, rebuilding, and applying algorithms.",
  icons: { icon: "/brand/agocode-mark.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${editorial.variable} ${reading.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="site-shell">AgoCode · an interactive algorithm notebook · built around understanding before memorization.</div>
        </footer>
      </body>
    </html>
  );
}
