import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, JetBrains_Mono, Source_Sans_3 } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";
import "./home.css";
import "./source-home.css";
import "./learning.css";
import "./practice-transfer.css";
import "./timeline.css";
import "./explain.css";
import "./complexity.css";
import "./chapter-one.css";
import "./chapter-two.css";
import "./chapter-three.css";
import "./chapter-four.css";
import "./chapter-five.css";
import "./chapter-six.css";
import "./chapter-six-extra.css";
import "./chapter-seven.css";
import "./chapter-eight.css";
import "./chapter-nine.css";
import "./chapter-ten.css";
import "./chapter-eleven.css";
import "./review.css";
import "./progress.css";
import "./source-progress.css";
import "./mastery.css";
import "./knowledge.css";
import "./knowledge-workbook.css";
import "./calibration.css";
import "./independence.css";
import "./attempt-history.css";
import "./practice-progression.css";
import "./solve.css";
import "./adt-workbench.css";
import "./invariant-workbench.css";
import "./amortization-workbench.css";
import "./graph-modeling-workbench.css";
import "./dp-state-workbench.css";
import "./transformation-workbench.css";
import "./special-case-ladder.css";
import "./casebook.css";
import "./optimization-strategy-workbench.css";
import "./project-workspace.css";
import "./syllabus-atlas.css";
import "./atlas-recognition.css";
import "./contextual-help.css";
import "./reasoning-help.css";
import "./pattern-library.css";
import "./friction-progress.css";
import "./next-problem.css";
import "./completion-features.css";
import "./advanced-workbenches.css";
import "./workspace-completion.css";

const editorial = Fraunces({ subsets: ["latin"], variable: "--font-editorial", display: "swap" });
const reading = Source_Sans_3({ subsets: ["latin"], variable: "--font-reading", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "AgoCode — Learn algorithms by seeing them move", template: "%s · AgoCode" },
  description: "An interactive algorithm notebook for understanding, modeling, tracing, rebuilding, and applying algorithms.",
  icons: { icon: "/brand/agocode-mark.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${editorial.variable} ${reading.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <div className="site-shell">AgoCode · an interactive algorithm notebook · understand, model, build, transfer, recall.</div>
        </footer>
      </body>
    </html>
  );
}
