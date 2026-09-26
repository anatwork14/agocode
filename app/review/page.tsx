import Link from "next/link";
import { ProblemReviewQueue } from "@/components/review/ProblemReviewQueue";
import { ReviewQueue } from "@/components/review/ReviewQueue";

export const metadata = { title: "Review" };

export default function ReviewPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Recall mode</div>
        <h1 className="editorial-title editorial-title--compact">Return after the explanation is gone.</h1>
        <p className="lede">
          Review is where apparent familiarity becomes durable knowledge. AgoCode now combines adaptive problem retrieval from
          your own independent-solve evidence with the existing curriculum recall schedule.
        </p>
        <div className="action-row" style={{ marginTop: 22 }}>
          <Link className="button button--primary" href="/review/weekly">Open weekly evidence review →</Link>
          <Link className="button" href="/plan">View curriculum plan</Link>
        </div>

        <section className="section review-section">
          <div className="section-heading">
            <div className="section-heading__index">ADAPTIVE RETRIEVAL</div>
            <div>
              <h2>Review when evidence becomes stale—not just because a chapter says so.</h2>
              <p>Independent, transferred, and recalled problems receive explicit spacing intervals that expand with successful retrieval and contract after failure.</p>
            </div>
          </div>
          <ProblemReviewQueue />
        </section>

        <section className="section review-section review-section--curriculum">
          <div className="section-heading">
            <div className="section-heading__index">CURRICULUM RECALL</div>
            <div>
              <h2>Keep the designed chapter and transfer checkpoints too.</h2>
              <p>These fixed review items preserve the deliberate Book Track sequence while the adaptive queue handles problem-specific forgetting risk.</p>
            </div>
          </div>
          <ReviewQueue />
        </section>
      </div>
    </main>
  );
}
