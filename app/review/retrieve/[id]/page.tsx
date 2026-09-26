import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectiveProblemRetrieval } from "@/components/review/ObjectiveProblemRetrieval";
import { getCanonicalExercise } from "@/lib/knowledge/all-exercises";
import { classifiedAtlasExercises } from "@/lib/practice/atlas-recognition";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProblemRetrievalPage({ params }: PageProps) {
  const { id } = await params;
  const exercise = getCanonicalExercise(id);
  const classified = classifiedAtlasExercises.some((item) => item.exercise.id === id);
  if (!exercise || !classified) notFound();

  return (
    <main className="page">
      <div className="site-shell">
        <Link className="back-link" href="/review">← Review queue</Link>
        <div className="eyebrow">Closed-loop retrieval</div>
        <h1 className="editorial-title editorial-title--compact">Retrieve the structure before reopening the explanation.</h1>
        <p className="lede">
          This session writes objective first-try recognition evidence directly into AgoCode&apos;s problem history. A correct first response expands spacing; a miss shortens the next interval without erasing historical independence.
        </p>
        <section className="section">
          <ObjectiveProblemRetrieval exerciseId={id} />
        </section>
      </div>
    </main>
  );
}
