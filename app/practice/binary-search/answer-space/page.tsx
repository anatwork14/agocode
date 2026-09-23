import Link from "next/link";
import { AnswerSpaceTransferPractice } from "@/components/binary-search/AnswerSpaceTransferPractice";

export const metadata = { title: "Answer-Space Search Practice" };

export default function AnswerSpacePracticePage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Practice · Mixed transfer</div>
        <h1 className="editorial-title editorial-title--compact">Search a space of possible answers.</h1>
        <p className="lede">
          The input itself is not the sorted thing anymore. This final rung tests whether you can recognize the deeper
          binary-search requirement: an ordered candidate space plus a monotonic decision that safely removes a region.
        </p>

        <section className="section" style={{ paddingTop: 44 }}>
          <AnswerSpaceTransferPractice />
          <div className="action-row">
            <Link className="button" href="/practice/binary-search/rotated">
              ← Previous rung
            </Link>
            <Link className="button" href="/practice">
              View completed ladder
            </Link>
            <Link className="button button--primary" href="/review">
              Schedule recall →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
