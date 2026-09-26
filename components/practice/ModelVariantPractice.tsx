"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildModelVariantProfile,
  readModelVariantHistory,
  recordModelVariantAttempt,
  type ModelVariantProfile,
} from "@/lib/learning/variant-practice";
import {
  buildMixedModelVariantSession,
  buildModelVariants,
  type ModelVariantDecision,
} from "@/lib/practice/model-variants";

const decisionLabels: Record<ModelVariantDecision, string> = {
  "same-family": "Same family",
  "new-family": "New family",
  depends: "Depends on constraints",
};

const emptyProfile: ModelVariantProfile = { attempts: 0, correct: 0, accuracy: 0, families: [] };

export function ModelVariantPractice({ exerciseId, sessionSize = 8 }: { exerciseId?: string; sessionSize?: number }) {
  const [mix, setMix] = useState(0);
  const [index, setIndex] = useState(0);
  const [decision, setDecision] = useState<ModelVariantDecision | null>(null);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState<ModelVariantProfile>(emptyProfile);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProfile(buildModelVariantProfile(readModelVariantHistory(window.localStorage)));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const variants = useMemo(() => {
    const seed = exerciseId ? `exercise:${exerciseId}:${mix}` : `mixed:${mix}`;
    return exerciseId
      ? buildModelVariants(exerciseId, 4, seed)
      : buildMixedModelVariantSession(seed, sessionSize);
  }, [exerciseId, mix, sessionSize]);

  const current = variants[Math.min(index, Math.max(0, variants.length - 1))];
  const noteReady = note.trim().length >= 20;
  const canSubmit = Boolean(current && decision && noteReady && !submitted);

  function resetAnswer() {
    setDecision(null);
    setNote("");
    setSubmitted(false);
  }

  function submit() {
    if (!current || !decision || !noteReady || submitted) return;
    const history = recordModelVariantAttempt(window.localStorage, {
      exerciseId: current.exerciseId,
      variantId: current.id,
      familyId: current.sourceFamilyId,
      expectedDecision: current.expectedDecision,
      decision,
      correct: decision === current.expectedDecision,
      noteLength: note.trim().length,
      attemptedAt: new Date().toISOString(),
    });
    setProfile(buildModelVariantProfile(history));
    setSubmitted(true);
  }

  function nextVariant() {
    if (index + 1 < variants.length) {
      setIndex((value) => value + 1);
      resetAnswer();
      return;
    }
    setIndex(0);
    resetAnswer();
    setMix((value) => value + 1);
  }

  function remix() {
    setIndex(0);
    resetAnswer();
    setMix((value) => value + 1);
  }

  if (!current) {
    return (
      <div className="model-variant-empty">
        <strong>No structural variant is available for this exercise yet.</strong>
        <p>Use an Atlas-classified problem so AgoCode has a structural family to mutate.</p>
      </div>
    );
  }

  const correct = submitted && decision === current.expectedDecision;

  return (
    <div className="model-variant-practice">
      <div className="model-variant-status">
        <div>
          <span>Session</span>
          <strong>{index + 1}/{variants.length}</strong>
        </div>
        <div>
          <span>Recorded attempts</span>
          <strong>{profile.attempts}</strong>
        </div>
        <div>
          <span>First decisions correct</span>
          <strong>{profile.attempts ? `${Math.round(profile.accuracy * 100)}%` : "—"}</strong>
        </div>
        <button className="atlas-reset" type="button" onClick={remix}>different mutations</button>
      </div>

      <section className="model-variant-card">
        <div className="model-variant-card__head">
          <div>
            <span className="eyebrow">Model mutation · {current.difficulty}</span>
            <h3>{current.title}</h3>
          </div>
          <span className="mono">{current.sourceFamilyLabel}</span>
        </div>

        <div className="model-variant-base">
          <span className="mono">BASE PROBLEM</span>
          <strong>{current.exerciseTitle}</strong>
          <Link href={`/exercises/${current.exerciseId}`}>open source notebook →</Link>
        </div>

        <div className="model-variant-change">
          <span className="eyebrow">Changed assumption</span>
          <p>{current.changedAssumption}</p>
          <strong>{current.prompt}</strong>
        </div>

        <div className="model-variant-decisions" aria-label="Choose how the structural model changes">
          {(Object.keys(decisionLabels) as ModelVariantDecision[]).map((value) => (
            <button
              type="button"
              aria-pressed={decision === value}
              className={decision === value ? "model-variant-decision model-variant-decision--selected" : "model-variant-decision"}
              disabled={submitted}
              onClick={() => setDecision(value)}
              key={value}
            >
              <span className="mono">{value.replaceAll("-", " ")}</span>
              <strong>{decisionLabels[value]}</strong>
            </button>
          ))}
        </div>

        <label className="model-variant-note">
          <span>Before revealing the answer, write what property survives or breaks.</span>
          <textarea
            value={note}
            disabled={submitted}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Example: the old invariant relied on equal edge costs, so layer order no longer proves minimum path cost…"
            rows={4}
          />
          <small>{note.trim().length}/20 minimum characters · this note is used as a commitment gate, not graded as mastery.</small>
        </label>

        {!submitted ? (
          <button className="button button--primary" type="button" disabled={!canSubmit} onClick={submit}>
            Commit model decision →
          </button>
        ) : (
          <div className={correct ? "model-variant-result model-variant-result--correct" : "model-variant-result model-variant-result--miss"}>
            <span className="eyebrow">{correct ? "Model decision supported" : "Re-model before implementing"}</span>
            <h4>Expected: {decisionLabels[current.expectedDecision]}</h4>
            <p>{current.explanation}</p>
            <div className="model-variant-next-question">
              <span className="mono">NEXT QUESTION</span>
              <strong>{current.nextQuestion}</strong>
            </div>
            <div className="action-row">
              {current.targetFamilyId ? <Link className="button" href={`/patterns/${current.targetFamilyId}`}>Study {current.targetFamilyLabel ?? "target family"}</Link> : null}
              <button className="button button--primary" type="button" onClick={nextVariant}>Next mutation →</button>
            </div>
          </div>
        )}
      </section>

      <p className="model-variant-boundary">
        Variant decisions are stored as transfer-practice history only. They do not promote problem independence or mastery without objective solve/retrieval evidence.
      </p>
    </div>
  );
}
