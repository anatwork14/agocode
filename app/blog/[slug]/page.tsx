import Link from "next/link";
import { notFound } from "next/navigation";
import { fieldNotes, getFieldNote } from "@/lib/knowledge/blog";
import { getDiagnosesForFieldNote } from "@/lib/knowledge/stuck-router";

type FieldNotePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return fieldNotes.map((post) => ({ slug: post.slug }));
}

export default async function FieldNotePage({ params }: FieldNotePageProps) {
  const { slug } = await params;
  const post = getFieldNote(slug);
  if (!post) notFound();
  const contexts = getDiagnosesForFieldNote(slug);

  return (
    <main className="page">
      <div className="site-shell field-note-page">
        <Link className="back-link" href="/blog">← Ways of Solving</Link>
        <header className="field-note-hero">
          <div className="field-note-hero__number">{post.number}</div>
          <div>
            <div className="eyebrow">Field note · {post.sources.join(" · ")} · {post.readingMinutes} min</div>
            <h1 className="editorial-title editorial-title--compact">{post.title}</h1>
            <p className="lede">{post.thesis}</p>
          </div>
        </header>

        <div className="field-note-layout">
          <article className="field-note-article">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
          </article>

          <aside className="field-note-questions">
            <span className="eyebrow">Questions to ask</span>
            <ol>
              {post.questions.map((question) => <li key={question}>{question}</li>)}
            </ol>

            {contexts.length ? (
              <div className="field-note-context">
                <span className="eyebrow">When this note matches</span>
                {contexts.map((context) => (
                  <div className="field-note-context__route" key={context.id}>
                    <strong>{context.label}</strong>
                    <div className="field-note-context__actions">
                      {context.actions.filter((action) => action.kind !== "read").map((action) => (
                        <Link href={action.href} key={`${context.id}-${action.href}`}>
                          <span>{action.label}</span><span aria-hidden="true">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="action-row">
              <Link className="button" href="/blog#diagnose">Diagnose another obstacle</Link>
              <Link className="button button--primary" href="/exercises">Try this on a problem →</Link>
            </div>
          </aside>
        </div>

        <section className="worksheet-next">
          <div>
            <span className="eyebrow">Do, do not only read</span>
            <h2>Choose a problem where the technique is not labeled.</h2>
            <p>Use the field note as a question set, then record which hypothesis failed and why.</p>
          </div>
          <div className="action-row">
            <Link className="button" href="/practice/atlas">Run mixed recognition</Link>
            <Link className="button button--primary" href="/exercises">Open Problem Atlas →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
