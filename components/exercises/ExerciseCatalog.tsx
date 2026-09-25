"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  canonicalExercises,
  exerciseDomains,
  sourceLabels,
  type ExerciseLevel,
  type ExerciseSource,
} from "@/lib/knowledge/all-exercises";

const sourceOptions: { value: "all" | ExerciseSource; label: string }[] = [
  { value: "all", label: "All sources" },
  { value: "goodrich", label: "Goodrich" },
  { value: "epi", label: "EPI" },
  { value: "skiena", label: "Skiena" },
];

const levelOptions: { value: "all" | ExerciseLevel; label: string }[] = [
  { value: "all", label: "All levels" },
  { value: "foundation", label: "Foundation" },
  { value: "core", label: "Core" },
  { value: "advanced", label: "Advanced" },
];

const INITIAL_VISIBLE = 80;

export function ExerciseCatalog() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"all" | ExerciseSource>("all");
  const [domain, setDomain] = useState("all");
  const [level, setLevel] = useState<"all" | ExerciseLevel>("all");
  const [interactiveOnly, setInteractiveOnly] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return canonicalExercises.filter((item) => {
      if (source !== "all" && item.source !== source) return false;
      if (domain !== "all" && item.domain !== domain) return false;
      if (level !== "all" && item.level !== level) return false;
      if (interactiveOnly && !item.route) return false;
      if (!needle) return true;
      const haystack = [item.title, item.sourceChapter, item.domain, item.tags.join(" "), item.lens].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [domain, interactiveOnly, level, query, source]);

  const visible = filtered.slice(0, visibleCount);

  const sourceCounts = useMemo(
    () => Object.fromEntries(sourceOptions.slice(1).map((option) => [option.value, canonicalExercises.filter((item) => item.source === option.value).length])),
    [],
  );

  const surpriseMe = () => {
    if (!filtered.length) return;
    const item = filtered[Math.floor(Math.random() * filtered.length)];
    router.push(`/exercises/${item.id}`);
  };

  const resetFilters = () => {
    setQuery("");
    setSource("all");
    setDomain("all");
    setLevel("all");
    setInteractiveOnly(false);
    setVisibleCount(INITIAL_VISIBLE);
  };

  return (
    <div className={blindMode ? "atlas atlas--blind" : "atlas"}>
      <div className="atlas-summary" aria-label="Canonical problem atlas summary">
        <div><strong>{canonicalExercises.length}</strong><span>named entries</span></div>
        <div><strong>3</strong><span>source perspectives</span></div>
        <div><strong>{exerciseDomains.length}</strong><span>problem domains</span></div>
        <div><strong>{canonicalExercises.filter((item) => item.route).length}</strong><span>connected learning slices</span></div>
      </div>

      <div className="atlas-source-strip" aria-label="Entries by source">
        {sourceOptions.slice(1).map((option) => (
          <button
            type="button"
            className={source === option.value ? "atlas-source atlas-source--active" : "atlas-source"}
            onClick={() => { setSource(source === option.value ? "all" : option.value); setVisibleCount(INITIAL_VISIBLE); }}
            key={option.value}
          >
            <span>{option.label}</span>
            <strong>{sourceCounts[option.value]}</strong>
          </button>
        ))}
      </div>

      <div className="atlas-practice-mode">
        <div>
          <span className="eyebrow">Recognition practice</span>
          <strong>{blindMode ? "Labels are hidden. Diagnose the structure yourself." : "The atlas currently shows structural clues."}</strong>
          <p>
            Blind mode removes the domain, tags, source chapter, and AgoCode lens. Use it after you know the techniques and need
            to practice deciding which one applies.
          </p>
        </div>
        <div className="atlas-practice-mode__actions">
          <button className={blindMode ? "button button--selected" : "button"} type="button" onClick={() => setBlindMode((value) => !value)}>
            {blindMode ? "Blind mode on" : "Turn on blind mode"}
          </button>
          <button className="button button--primary" type="button" onClick={surpriseMe} disabled={!filtered.length}>
            Surprise me →
          </button>
        </div>
      </div>

      <div className="atlas-controls">
        <label className="atlas-search">
          <span>Search the repertoire</span>
          <input
            value={query}
            onChange={(event) => { setQuery(event.target.value); setVisibleCount(INITIAL_VISIBLE); }}
            placeholder="heap, interval, shortest path, invariant…"
            type="search"
          />
        </label>

        <label>
          <span>Source</span>
          <select value={source} onChange={(event) => { setSource(event.target.value as "all" | ExerciseSource); setVisibleCount(INITIAL_VISIBLE); }}>
            {sourceOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label>
          <span>Domain</span>
          <select value={domain} onChange={(event) => { setDomain(event.target.value); setVisibleCount(INITIAL_VISIBLE); }}>
            <option value="all">All domains</option>
            {exerciseDomains.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>

        <label>
          <span>Level</span>
          <select value={level} onChange={(event) => { setLevel(event.target.value as "all" | ExerciseLevel); setVisibleCount(INITIAL_VISIBLE); }}>
            {levelOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="atlas-check">
          <input type="checkbox" checked={interactiveOnly} onChange={(event) => { setInteractiveOnly(event.target.checked); setVisibleCount(INITIAL_VISIBLE); }} />
          <span>Interactive now</span>
        </label>
      </div>

      <div className="atlas-result-line">
        <span className="mono">{filtered.length} result{filtered.length === 1 ? "" : "s"} · showing {Math.min(visible.length, filtered.length)}</span>
        <button className="atlas-reset" type="button" onClick={resetFilters}>reset filters</button>
      </div>

      <div className="atlas-list">
        {visible.map((item, index) => (
          <article className="atlas-row" key={item.id}>
            <div className="atlas-row__index mono">{String(index + 1).padStart(3, "0")}</div>
            <div className="atlas-row__main">
              <div className="atlas-row__meta">
                <span>{sourceLabels[item.source]}</span>
                {!blindMode ? <span>{item.sourceChapter}</span> : null}
                {!blindMode ? <span>{item.level}</span> : null}
              </div>
              <h2>{item.title}</h2>
              {!blindMode ? <p>{item.lens}</p> : <p className="atlas-blind-prompt">No structural hints. Restate the problem and build a baseline before naming a technique.</p>}
              {!blindMode ? (
                <div className="atlas-tags">
                  <span>{item.domain}</span>
                  {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              ) : null}
            </div>
            <div className="atlas-row__action">
              <span className={blindMode ? "atlas-state atlas-state--blind" : item.route ? "atlas-state atlas-state--live" : "atlas-state"}>
                {blindMode ? "recognize" : item.route ? "interactive" : "catalogued"}
              </span>
              {blindMode ? (
                <Link href={`/exercises/${item.id}`}>Open blind worksheet →</Link>
              ) : item.route ? (
                <Link href={item.route}>Open learning slice →</Link>
              ) : (
                <Link href={`/exercises/${item.id}`}>Open reasoning notebook →</Link>
              )}
            </div>
          </article>
        ))}
      </div>

      {visible.length < filtered.length ? (
        <div className="atlas-more">
          <button className="button" type="button" onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE)}>
            Show {Math.min(INITIAL_VISIBLE, filtered.length - visible.length)} more
          </button>
        </div>
      ) : null}

      {!filtered.length ? (
        <div className="empty-state">
          <h2>No entry matches that combination.</h2>
          <p>Try removing a source or domain filter. Structural clues often cross chapter boundaries.</p>
        </div>
      ) : null}
    </div>
  );
}
