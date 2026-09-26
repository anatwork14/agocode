import Link from "next/link";
import { DiagnosticAssessment } from "@/components/learning/DiagnosticAssessment";

export const metadata = { title: "Diagnostic placement" };

export default function DiagnosticPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/plan">← Adaptive curriculum plan</Link>
        <div className="eyebrow">Placement diagnostic</div>
        <h1 className="editorial-title editorial-title--compact">Start from evidence, not from a self-rating.</h1>
        <p className="lede">
          A short objective diagnostic gives AgoCode a cold-start placement prior. It may bypass familiar prerequisites, but it can never certify mastery; independent work inside AgoCode remains the stronger evidence source.
        </p>
        <section className="section">
          <DiagnosticAssessment />
        </section>
      </div>
    </main>
  );
}
