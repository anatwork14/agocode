import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyReader } from "@/components/casebook/CaseStudyReader";
import { caseStudies, getCaseStudy } from "@/lib/knowledge/casebook";

type CaseStudyPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return caseStudies.map((caseStudy) => ({ slug: caseStudy.slug }));
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) notFound();

  return (
    <main className="page">
      <div className="site-shell case-study-page">
        <Link className="back-link" href="/casebook">← Algorithm Design Casebook</Link>

        <header className="case-study-hero">
          <div className="case-study-hero__number">{caseStudy.number}</div>
          <div>
            <div className="eyebrow">Original AgoCode case · {caseStudy.domain}</div>
            <h1 className="editorial-title editorial-title--compact">{caseStudy.title}</h1>
            <p className="lede">{caseStudy.thesis}</p>
            <div className="case-study-hero__meta">
              <span className="mono">{caseStudy.scale}</span>
              <div className="atlas-tags">{caseStudy.concepts.map((concept) => <span key={concept}>{concept}</span>)}</div>
            </div>
          </div>
        </header>

        <section className="case-constraints">
          <span className="eyebrow">Given constraints</span>
          <div>{caseStudy.constraints.map((constraint) => <span key={constraint}>{constraint}</span>)}</div>
        </section>

        <CaseStudyReader caseStudy={caseStudy} />

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">Do the design work yourself</span>
            <h2>Use the same trace structure on an unfamiliar problem.</h2>
            <p>Write the baseline and the reason a candidate approach fails before browsing for a familiar problem name.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/casebook">More cases</Link>
            <Link className="button button--primary" href="/solve">Open blank design canvas →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
