"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCanonicalExercise } from "@/lib/knowledge/all-exercises";
import { readLearningEvidence } from "@/lib/learning/evidence";
import { buildProblemIndependenceProfile, readProblemRecognitionHistory } from "@/lib/learning/independence";
import {
  createProblemSet,
  deleteProblemSet,
  readProblemSets,
  renameProblemSet,
  toggleExerciseInProblemSet,
  toggleProblemBookmark,
  type ProblemSetState,
} from "@/lib/learning/problem-sets";
import { buildProblemReviewProfile, readProblemReviewHistory, type ProblemReviewStatus } from "@/lib/learning/problem-review";
import { readReasoningAttemptHistory } from "@/lib/learning/reasoning-attempts";
import { readRecommendationHistory } from "@/lib/learning/recommendations";

const REASONING_EVIDENCE_KEY = "agocode.progress.design.reasoning-notebooks";

type Snapshot = {
  sets: ProblemSetState;
  reviews: Record<string, ProblemReviewStatus>;
};

function collect(): Snapshot {
  const reasoning = readLearningEvidence(window.localStorage, REASONING_EVIDENCE_KEY)?.reasoning;
  const recognitionHistory = readProblemRecognitionHistory(window.localStorage);
  const independence = buildProblemIndependenceProfile({
    reasoning,
    reasoningAttempts: readReasoningAttemptHistory(window.localStorage),
    recommendationHistory: readRecommendationHistory(window.localStorage),
    recognitionHistory,
  });
  return {
    sets: readProblemSets(window.localStorage),
    reviews: buildProblemReviewProfile({
      independence,
      reviewHistory: readProblemReviewHistory(window.localStorage),
      recognitionHistory,
    }).statuses,
  };
}

function due(status: ProblemReviewStatus | undefined) {
  return status?.dueState === "due" || status?.dueState === "overdue";
}

export function ProblemSetManager() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [newName, setNewName] = useState("");

  function refreshSets(next?: ProblemSetState) {
    setSnapshot((current) => current ? { ...current, sets: next ?? readProblemSets(window.localStorage) } : collect());
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setSnapshot(collect()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const collections = useMemo(() => {
    if (!snapshot) return [];
    return [
      { id: "bookmarks", name: "Bookmarks", exerciseIds: snapshot.sets.bookmarks, builtin: true },
      ...snapshot.sets.sets.map((set) => ({ ...set, builtin: false })),
    ];
  }, [snapshot]);

  if (!snapshot) return <div className="sets-loading">Loading local learner collections…</div>;

  function createSet() {
    refreshSets(createProblemSet(window.localStorage, newName));
    setNewName("");
  }

  return (
    <div className="problem-sets">
      <section className="problem-sets__create">
        <div>
          <span className="eyebrow">Custom collection</span>
          <h2>Build a set around an interview, exam, weakness, or source.</h2>
        </div>
        <div className="problem-sets__create-controls">
          <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="e.g. Graph weaknesses" />
          <button className="button button--primary" type="button" disabled={!newName.trim()} onClick={createSet}>Create set</button>
        </div>
      </section>

      <div className="problem-sets__grid">
        {collections.map((collection) => {
          const dueIds = collection.exerciseIds.filter((id) => due(snapshot.reviews[id]));
          const firstDue = dueIds[0];
          return (
            <section className="problem-set-card" key={collection.id}>
              <div className="problem-set-card__head">
                <div>
                  <span className="mono">{collection.builtin ? "BUILT IN" : "CUSTOM SET"}</span>
                  <h2>{collection.name}</h2>
                  <p>{collection.exerciseIds.length} problem{collection.exerciseIds.length === 1 ? "" : "s"} · {dueIds.length} due for retrieval</p>
                </div>
                {!collection.builtin ? (
                  <div className="problem-set-card__admin">
                    <button
                      className="button button--quiet"
                      type="button"
                      onClick={() => {
                        const next = window.prompt("Rename set", collection.name);
                        if (next) refreshSets(renameProblemSet(window.localStorage, collection.id, next));
                      }}
                    >Rename</button>
                    <button
                      className="button button--quiet"
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete “${collection.name}”?`)) refreshSets(deleteProblemSet(window.localStorage, collection.id));
                      }}
                    >Delete</button>
                  </div>
                ) : null}
              </div>

              {firstDue ? (
                <div className="problem-set-card__review">
                  <span className="eyebrow">Set review</span>
                  <p>At least one problem in this collection is due. Start with the oldest scheduled retrieval rather than rereading the set.</p>
                  <Link className="button button--primary" href={`/review/retrieve/${firstDue}`}>Retrieve a due problem →</Link>
                </div>
              ) : null}

              {collection.exerciseIds.length ? (
                <div className="problem-set-card__items">
                  {collection.exerciseIds.map((exerciseId) => {
                    const exercise = getCanonicalExercise(exerciseId);
                    const status = snapshot.reviews[exerciseId];
                    return (
                      <div className="problem-set-item" key={exerciseId}>
                        <div>
                          <Link href={`/exercises/${exerciseId}`}>{exercise?.title ?? exerciseId}</Link>
                          <span>{status ? `${status.dueState.replace("-", " ")} · ${status.independenceStage}` : "not scheduled yet"}</span>
                        </div>
                        <button
                          className="atlas-reset"
                          type="button"
                          onClick={() => refreshSets(collection.builtin
                            ? toggleProblemBookmark(window.localStorage, exerciseId)
                            : toggleExerciseInProblemSet(window.localStorage, collection.id, exerciseId))}
                        >remove</button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="problem-set-card__empty">
                  <p>No problems yet. Open any canonical problem and add it to this set.</p>
                  <Link href="/exercises">Browse problems →</Link>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
