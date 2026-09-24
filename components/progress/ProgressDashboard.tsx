"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { readLearningEvidence, type LearningEvidence } from "@/lib/learning/evidence";
import { bookProgressChapters, progressEvidenceKeys, transferProgressItems } from "@/lib/learning/progressCatalog";

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

  if (!snapshot) {
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
          <span>Code attempts</span>
          <strong>{snapshot.codeAttempts}</strong>
          <small>{snapshot.noHintPasses} successful attempts without hints</small>
        </div>
      </section>

      <div className="progress-context">
        <div>
          <span className="eyebrow">Latest evidence</span>
          <strong>{formatActivity(snapshot.latestActivity)}</strong>
        </div>
        <p>
          AgoCode records evidence in this browser for the current MVP. These counts describe completed learning actions;
          they are not a mastery score and they do not claim that a concept is permanently learned.
        </p>
      </div>

      <section className="progress-section">
        <div className="section-heading">
          <div className="section-heading__index">BOOK TRACK</div>
          <div>
            <h2>Chapter progress is a ledger of evidence.</h2>
            <p>Each row asks whether you have produced the retrieval, explanation, or reconstruction evidence attached to that chapter.</p>
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
              A later checkpoint will use this evidence to prioritize weak techniques instead of only showing a single aggregate score.
            </p>
            <Link className="button button--quiet" href="/practice/mixed">Run mixed recognition →</Link>
          </div>
        ) : null}
      </section>

      <section className="progress-section progress-next">
        <div>
          <span className="eyebrow">Next checkpoint</span>
          <h2>Progress should become diagnostic, not merely descriptive.</h2>
          <p>
            The next implementation step will retain technique-level misses from mixed recognition and use them to build an adaptive retry set after spacing.
          </p>
        </div>
        <div className="action-row">
          <Link className="button" href="/review">Open spaced review</Link>
          <Link className="button button--primary" href="/practice">Continue Transfer Track →</Link>
        </div>
      </section>
    </div>
  );
}
