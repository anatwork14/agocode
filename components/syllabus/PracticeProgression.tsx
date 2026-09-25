import Link from "next/link";
import { practiceStages } from "@/lib/knowledge/practice-framework";

export function PracticeProgression() {
  return (
    <section className="practice-progression" aria-labelledby="practice-progression-title">
      <div className="practice-progression__head">
        <div>
          <span className="eyebrow">Practice architecture</span>
          <h2 id="practice-progression-title">Coverage is not mastery. Change the kind of work.</h2>
          <p>
            The sources use different forms of practice for a reason. AgoCode turns that into a progression from executing a
            known mechanism to designing, recognizing, varying, and retrieving it without labels.
          </p>
        </div>
        <Link className="button button--primary" href="/exercises">Open the Problem Atlas →</Link>
      </div>

      <div className="practice-progression__rail">
        {practiceStages.map((stage) => (
          <article className="practice-stage" key={stage.id}>
            <div className="practice-stage__number">{stage.number}</div>
            <div className="practice-stage__body">
              <span className="eyebrow">{stage.sourcePerspective}</span>
              <h3>{stage.title}</h3>
              <p>{stage.purpose}</p>
              <blockquote>{stage.learnerPrompt}</blockquote>
              <div className="practice-stage__evidence">
                {stage.evidence.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
