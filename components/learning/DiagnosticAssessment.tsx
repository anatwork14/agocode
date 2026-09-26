"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  completeDiagnostic,
  diagnosticQuestions,
  getLatestDiagnosticResult,
  placementSkillLabels,
  readDiagnosticState,
  recordDiagnosticAnswer,
  startDiagnostic,
  type DiagnosticAttempt,
  type DiagnosticResult,
} from "@/lib/learning/diagnostic";

function resultCopy(result: DiagnosticResult) {
  if (result.overall >= 75) return "The placement prior is strong enough to bypass some prerequisite review, but it still does not certify mastery.";
  if (result.overall >= 50) return "The diagnostic found a mixed starting point. AgoCode will combine these placement signals with objective exercise evidence.";
  return "The placement prior recommends rebuilding foundations first. This is a routing signal, not a permanent label.";
}

export function DiagnosticAssessment() {
  const [active, setActive] = useState<DiagnosticAttempt | null>(null);
  const [latest, setLatest] = useState<DiagnosticResult | undefined>();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const state = readDiagnosticState(window.localStorage);
    setActive(state.active ?? null);
    setLatest(getLatestDiagnosticResult(state));
    setHydrated(true);
  }, []);

  const currentIndex = useMemo(() => {
    if (!active) return -1;
    const firstUnanswered = diagnosticQuestions.findIndex((question) => !active.answers[question.id]);
    return firstUnanswered >= 0 ? firstUnanswered : diagnosticQuestions.length;
  }, [active]);

  if (!hydrated) return <div className="diagnostic__loading">Restoring diagnostic state…</div>;

  function begin(restart = false) {
    const attempt = startDiagnostic(window.localStorage, new Date(), restart);
    setActive(attempt);
  }

  function choose(questionId: string, optionId: string) {
    const next = recordDiagnosticAnswer(window.localStorage, questionId, optionId);
    if (next) setActive(next);
  }

  function finish() {
    const completed = completeDiagnostic(window.localStorage);
    if (!completed?.result) return;
    setLatest(completed.result);
    setActive(null);
  }

  if (!active) {
    return (
      <div className="diagnostic">
        {latest ? (
          <section className="diagnostic__result" aria-labelledby="diagnostic-result-title">
            <div className="diagnostic__result-hero">
              <div>
                <span className="eyebrow">Latest placement prior</span>
                <h2 id="diagnostic-result-title">{latest.overall}% · {latest.correct}/{latest.total} correct</h2>
                <p>{resultCopy(latest)}</p>
              </div>
              <div className="diagnostic__result-actions">
                <Link className="button button--primary" href="/plan">Build my curriculum plan →</Link>
                <button className="button" type="button" onClick={() => begin(true)}>Retake diagnostic</button>
              </div>
            </div>
            <div className="diagnostic__skill-grid">
              {latest.skills.map((skill) => (
                <article key={skill.id} className={`diagnostic__skill diagnostic__skill--${skill.band}`}>
                  <span className="mono">{placementSkillLabels[skill.id]}</span>
                  <strong>{skill.score}%</strong>
                  <small>{skill.correct}/{skill.total} · {skill.band.replace("-", " ")}</small>
                </article>
              ))}
            </div>
            <div className="diagnostic__boundary">
              <strong>Placement ≠ mastery.</strong>
              <p>A high diagnostic score may let AgoCode treat a prerequisite as already familiar, but only independent learning evidence can mark a curriculum module as mastered.</p>
            </div>
          </section>
        ) : (
          <section className="diagnostic__start">
            <div>
              <span className="eyebrow">Cold-start placement</span>
              <h2>16 objective questions · eight broad skills.</h2>
              <p>
                This assessment routes the beginning of your curriculum. It checks analysis, structures, recursion, graphs, correctness, greedy reasoning, dynamic programming, and modeling without asking you to rate yourself.
              </p>
            </div>
            <div className="diagnostic__start-meta">
              <strong>15–25 min</strong>
              <span>No penalty for guessing</span>
              <span>Saved locally in this browser</span>
              <button className="button button--primary" type="button" onClick={() => begin()}>Start diagnostic →</button>
            </div>
          </section>
        )}
      </div>
    );
  }

  if (currentIndex >= diagnosticQuestions.length) {
    return (
      <section className="diagnostic__finish">
        <span className="eyebrow">All questions answered</span>
        <h2>Commit this placement attempt?</h2>
        <p>The result becomes a routing prior for the curriculum planner. It will not overwrite or manufacture objective learning evidence.</p>
        <button className="button button--primary" type="button" onClick={finish}>Score diagnostic →</button>
      </section>
    );
  }

  const question = diagnosticQuestions[currentIndex];
  const answered = Object.keys(active.answers).length;

  return (
    <section className="diagnostic__question" aria-labelledby="diagnostic-question-title">
      <div className="diagnostic__progress-row">
        <span className="eyebrow">{placementSkillLabels[question.skill]}</span>
        <span className="mono">{answered}/{diagnosticQuestions.length} answered</span>
      </div>
      <progress max={diagnosticQuestions.length} value={answered} aria-label="Diagnostic completion progress" />
      <div className="diagnostic__question-number mono">Question {currentIndex + 1} / {diagnosticQuestions.length}</div>
      <h2 id="diagnostic-question-title">{question.prompt}</h2>
      <div className="diagnostic__options" role="group" aria-label={`Answers for question ${currentIndex + 1}`}>
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className="diagnostic__option"
            onClick={() => choose(question.id, option.id)}
          >
            <span className="mono">{option.id.toUpperCase()}</span>
            <strong>{option.label}</strong>
          </button>
        ))}
      </div>
      <p className="diagnostic__note">Answers are saved immediately. Explanations stay hidden until the assessment is scored so later questions remain diagnostic rather than coached.</p>
    </section>
  );
}
