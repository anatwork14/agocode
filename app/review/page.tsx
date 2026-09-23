import { ReviewQueue } from "@/components/review/ReviewQueue";

export const metadata = { title: "Review" };

export default function ReviewPage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Recall mode</div>
        <h1 className="editorial-title editorial-title--compact">Return after the explanation is gone.</h1>
        <p className="lede">
          Review is where apparent familiarity becomes durable knowledge. AgoCode schedules short retrieval tasks from
          evidence you already produced in the lesson and transfer exercises.
        </p>
        <section className="section">
          <ReviewQueue />
        </section>
      </div>
    </main>
  );
}
