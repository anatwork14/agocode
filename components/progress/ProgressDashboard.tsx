"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readLearningEvidence, type LearningEvidence } from "@/lib/learning/evidence";
import { buildMasterySnapshot } from "@/lib/learning/mastery";
import { bookProgressChapters, progressEvidenceKeys, transferProgressItems } from "@/lib/learning/progressCatalog";
import { transferTechniques } from "@/lib/practice/transfer";

type EvidenceMap = Record<string, LearningEvidence | null>;

type ProgressSnapshot = {
  evidence: EvidenceMap;
  bookCompleted: number;
  bookTotal: number;
  chaptersComplete: number;
  transferCompleted: number;
  transferTotal: number;
  codeAttempts: number;
  noHintPasses: number;
  latestActivity: string | null;
};

function getLatestTimestamp(evidence: EvidenceMap) {
  let latest = 0;

  for (const item of Object.values(evidence)) {
    if (!item) continue;
    if (item.completedAt) latest = Math.max(latest, new Date(item.completedAt).getTime());
    if (item.prediction?.lastAnsweredAt) latest = Math.max(latest, new Date(item.prediction.lastAnsweredAt).getTime());
    if (item.explanation?.lastCompletedAt) latest = Math.max(latest, new Date(item.explanation.lastCompletedAt).getTime());
    if (item.recall?.lastReviewedAt) latest = Math.max(latest, new Date(item.recall.lastReviewedAt).getTime());
    for (const reasoning of Object.values(item.reasoning?.byExercise ?? {})) {
      latest = Math.max(latest, new Date(reasoning.updatedAt).getTime());
    }
    for (const project of Object.values(item.project?.byExercise ?? {})) {
      latest = Math.max(latest, new Date(project.updatedAt).getTime());
    }
    for (const attempt of item.attempts) {
      latest = Math.max(latest, new Date(attempt.attemptedAt).getTime());
    }
  }

  return latest > 0 ? new Date(latest).toISOString() : null;
}

function collectSnapshot(): ProgressSnapshot {
  const evidence: EvidenceMap = {};
  for (const key of progressEvidenceKeys) evidence[key] = readLearningEvidence(localStorage, key);

  const bookItems = bookProgressChapters.flatMap((chapter) => chapter.evidence);
  const bookCompleted = bookItems.filter((item) => Boolean(evidence[item.key]?.completedAt)).length;
  const chaptersComplete = bookProgressChapters.filter((chapter) =>
    chapter.evidence.every((item) => Boolean(evidence[item.key]?.completedAt)),
  ).length;
  const transferCompleted = transferProgressItems.filter((item) => Boolean(evidence[item.key]?.completedAt)).length;
  const codeAttempts = Object.values(evidence).reduce((count, item) => count + (item?.attempts.length ?? 0), 0);
  const noHintPasses = Object.values(evidence).reduce(
    (count, item) => count + (item?.attempts.filter((attempt) => attempt.passed && attempt.hintCount === 0).length ?? 0),
    0,
  );

  return {
    evidence,
    bookCompleted,
    bookTotal: bookItems.length,
    chaptersComplete,
    transferCompleted,
    transferTotal: transferProgressItems.length,
    codeAttempts,
    noHintPasses,
    latestActivity: getLatestTimestamp(evidence),
  };
}

function formatActivity(value: string | null) {
  if (!value) return "No evidence yet";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function evidenceStatus(completed: number, total: number) {
  if (completed === 0) return "not started";
  if (completed === total) return "complete";
  return "active";
}

export function ProgressDashboard() {
  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setSnapshot(collectSnapshot()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const mixedRecognition = useMemo(() => {
    if (!snapshot) return null;
    return snapshot.evidence["agocode.progress.transfer.mixed-recognition"]?.recognition ?? null;
  }, [snapshot]);

  const mastery = useMemo(() => {
    if (!snapshot) return null;
    return buildMasterySnapshot(snapshot.evidence);
  }, [snapshot]);

  const recognitionDiagnosis = useMemo(() => {
    const byTechnique = mixedRecognition?.byTechnique;
    if (!byTechnique) return [];

    return Object.entries(byTechnique)
      .map(([id, evidence]) => ({
        id,
        label: transferTechniques.find((item) => item.id === id)?.label ?? id,
        totalSeen: evidence.totalSeen,
        firstTryCorrect: evidence.firstTryCorrect,
        accuracy: evidence.totalSeen ? evidence.firstTryCorrect / evidence.totalSeen : 0,
      }))
      .sort((a, b) => a.accuracy - b.accuracy || b.totalSeen - a.totalSeen);
  }, [mixedRecognition]);

  if (!snapshot || !mastery) {
    return <div className="progress-loading">Reading learning evidence from this browser…</div>;
  }

  return (
    <div className="progress-dashboard">
      <section className="progress-metrics" aria-label="Learning evidence summary">
        <div>
          <span>Book evidence</span>
          <strong>{snapshot.bookCompleted}/{snapshot.bookTotal}</strong>
          <small>completed retrieval or reconstruction signals</small>
        </div>
        <div>
          <span>Chapters</span>
          <strong>{snapshot.chaptersComplete}/11</strong>
          <small>chapters with every tracked evidence item complete</small>
        </div>
        <div>
          <span>Transfer</span>
          <strong>{snapshot.transferCompleted}/{snapshot.transferTotal}</strong>
          <small>cross-context evidence items complete</small>
        </div>
        <div>
          <span>Evidence strength</span>
          <strong>{mastery.overall}%</strong>
          <small>{snapshot.codeAttempts} code attempts · {snapshot.noHintPasses} no-hint passes</small>
        </div>
      </section>

      <div className="progress-context">
        <div>
          <span className="eyebrow">Latest evidence</span>
          <strong>{formatActivity(snapshot.latestActivity)}</strong>
        </div>
        <p>
          AgoCode records evidence in this browser for the current MVP. Reasoning notebooks and engineering workspaces now
          contribute bounded design evidence, but self-authored notes and checklist state are not treated as certification.
          Independent reconstruction, first-try prediction, transfer, and delayed recall remain stronger signals.
        </p>
      </div>

      <section className="progress-section progress-mastery">
        <div className="section-heading">
          <div className="section-heading__index">MASTERY MAP</div>
          <div>
            <h2>One completion percentage hides the skill that actually needs work.</h2>
            <p>AgoCode separates conceptual understanding from tracing, prediction, rebuilding, explanation, transfer, and delayed recall.</p>
          </div>
        </div>

        <div className="mastery-summary">
          <div className="mastery-summary__score">
            <span className="eyebrow">Evidence-weighted strength</span>
            <strong>{mastery.overall}%</strong>
            <small>across seven learning dimensions</small>
          </div>
          <div className="mastery-summary__diagnosis">
            <div><span>Strongest evidence</span><strong>{mastery.strongest.label} · {mastery.strongest.score}%</strong></div>
            <div><span>Priority gap</span><strong>{mastery.weakest.label} · {mastery.weakest.score}%</strong></div>
            <Link className="button button--quiet" href={mastery.weakest.id === "transfer" ? "/practice" : mastery.weakest.id === "recall" ? "/review" : "/learn"}>
              Work the weakest dimension →
            </Link>
          </div>
        </div>

        <div className="mastery-grid" aria-label="Mastery dimensions">
          {mastery.dimensions.map((dimension) => (
            <article className={`mastery-row mastery-row--${dimension.band}`} key={dimension.id}>
              <div className="mastery-row__heading">
                <div>
                  <strong>{dimension.label}</strong>
                  <span>{dimension.evidenceCount} evidence source{dimension.evidenceCount === 1 ? "" : "s"} · {dimension.completedCount} completed</span>
                </div>
                <span className="mono">{dimension.score}%</span>
              </div>
              <div className="mastery-row__bar" aria-label={`${dimension.label}: ${dimension.score}% evidence strength`}>
                <span style={{ width: `${dimension.score}%` }} />
              </div>
              <span className="mastery-row__band mono">{dimension.band.replace("-", " ")}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="progress-section">
        <div className="section-heading">
          <div className="section-heading__index">BOOK TRACK</div>
          <div>
            <h2>Chapter progress is a ledger of evidence.</h2>
            <p>Each row asks whether you have produced the retrieval, explanation, prediction, or reconstruction evidence attached to that chapter.</p>
          </div>
        </div>

        <div className="progress-ledger">
          {bookProgressChapters.map((chapter) => {
            const completed = chapter.evidence.filter((item) => Boolean(snapshot.evidence[item.key]?.completedAt)).length;
            const total = chapter.evidence.length;
            const percentage = Math.round((completed / total) * 100);
            const status = evidenceStatus(completed, total);
            const next = chapter.evidence.find((item) => !snapshot.evidence[item.key]?.completedAt);

            return (
              <article className={`progress-ledger-row progress-ledger-row--${status.replace(" ", "-")}`} key={chapter.number}>
                <div className="progress-ledger-row__number">{String(chapter.number).padStart(2, "0")}</div>
                <div className="progress-ledger-row__body">
                  <div className="progress-ledger-row__heading">
                    <div>
                      <h3>{chapter.title}</h3>
                      <span>{completed}/{total} evidence items</span>
                    </div>
                    <span className="progress-ledger-row__status">{status}</span>
                  </div>
                  <div className="progress-line" aria-label={`${percentage}% of tracked evidence complete`}>
                    <span style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="progress-ledger-row__action">
                    <span>{next ? `Next missing evidence: ${next.title}` : "All tracked chapter evidence is present."}</span>
                    <Link href={next?.href ?? chapter.href}>{next ? "Continue →" : "Revisit →"}</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="progress-section">
        <div className="section-heading">
          <div className="section-heading__index">TRANSFER TRACK</div>
          <div>
            <h2>Can the mental model survive a changed surface story?</h2>
            <p>Direct coding transfers test reconstruction; mixed recognition tests whether you can choose the technique before a chapter label gives it away.</p>
          </div>
        </div>

        <div className="progress-transfer-ledger">
          {transferProgressItems.map((item) => {
            const evidence = snapshot.evidence[item.key];
            const done = Boolean(evidence?.completedAt);
            const passedAttempts = evidence?.attempts.filter((attempt) => attempt.passed).length ?? 0;
            const hintFloor = evidence?.lowestHintCountOnPass;

            return (
              <Link className={`progress-transfer-row ${done ? "progress-transfer-row--done" : ""}`} href={item.href} key={item.key}>
                <span className="mono">{item.number}</span>
                <div>
                  <strong>{item.title}</strong>
                  <span>
                    {item.technique}
                    {item.kind === "code" && evidence ? ` · ${passedAttempts} passing attempt${passedAttempts === 1 ? "" : "s"}` : ""}
                    {item.kind === "code" && hintFloor === 0 ? " · no-hint pass" : ""}
                    {item.kind === "recognition" && evidence?.recognition
                      ? ` · best ${evidence.recognition.bestFirstTryCorrect}/${evidence.recognition.totalScenarios}`
                      : ""}
                  </span>
                </div>
                <span className="progress-transfer-row__state mono">{done ? "evidence" : "open"}</span>
              </Link>
            );
          })}
        </div>

        {mixedRecognition ? (
          <div className="progress-recognition-note">
            <div>
              <span className="eyebrow">Mixed recognition</span>
              <strong>{mixedRecognition.bestFirstTryCorrect}/{mixedRecognition.totalScenarios} best first-try</strong>
            </div>
            <p>
              Latest session: {mixedRecognition.lastFirstTryCorrect}/{mixedRecognition.totalScenarios} · {mixedRecognition.sessions} session{mixedRecognition.sessions === 1 ? "" : "s"} recorded.
              {mixedRecognition.recentMissedScenarioIds?.length
                ? ` The next mixed session will begin with ${mixedRecognition.recentMissedScenarioIds.length} scenario${mixedRecognition.recentMissedScenarioIds.length === 1 ? "" : "s"} missed on the latest first attempt.`
                : " The latest session has no first-try misses to prioritize."}
            </p>
            <Link className="button button--quiet" href="/practice/mixed">Run mixed recognition →</Link>
          </div>
        ) : null}

        {recognitionDiagnosis.length ? (
          <div className="progress-diagnosis">
            <div className="progress-diagnosis__heading">
              <div>
                <span className="eyebrow">Technique diagnosis</span>
                <h3>First-try recognition across sessions</h3>
              </div>
              <span className="mono">weakest evidence first</span>
            </div>
            <div className="progress-diagnosis__rows">
              {recognitionDiagnosis.map((item) => {
                const percentage = Math.round(item.accuracy * 100);
                return (
                  <div className="progress-diagnosis__row" key={item.id}>
                    <div><strong>{item.label}</strong><span>{item.firstTryCorrect}/{item.totalSeen} first-try</span></div>
                    <div className="progress-diagnosis__bar" aria-label={`${percentage}% first-try recognition`}><span style={{ width: `${percentage}%` }} /></div>
                    <span className="mono">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <section className="progress-section progress-next">
        <div>
          <span className="eyebrow">Adaptive retrieval</span>
          <h2>The next session should be shaped by the evidence you already produced.</h2>
          <p>
            First-try prediction, no-hint reconstruction, mixed recognition, bounded design artifacts, and delayed recall feed the same evidence model.
            The product can therefore direct you toward the skill that is weak, not merely the next unchecked chapter.
          </p>
        </div>
        <div className="action-row">
          <Link className="button" href="/review">Open spaced review</Link>
          <Link className="button button--primary" href="/practice/mixed">Retry weak patterns →</Link>
        </div>
      </section>
    </div>
  );
}
