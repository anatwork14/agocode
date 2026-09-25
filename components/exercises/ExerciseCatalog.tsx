"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  canonicalExercises,
  exerciseDomains,
  sourceLabels,
  type ExerciseLevel,
  type ExerciseSource,
} from "@/lib/knowledge/exercises";

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

export function ExerciseCatalog() {
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"all" | ExerciseSource>("all");
  const [domain, setDomain] = useState("all");
  const [level, setLevel] = useState<"all" | ExerciseLevel>("all");
  const [interactiveOnly, setInteractiveOnly] = useState(false);

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

  const sourceCounts = useMemo(
    () => Object.fromEntries(sourceOptions.slice(1).map((option) => [option.value, canonicalExercises.filter((item) => item.source === option.value).length])),
    [],
  );

  return (
    <div className="atlas">
      <div className="atlas-summary" aria-label="Canonical problem atlas summary">
        <div><strong>{canonicalExercises.length}</strong><span>catalogued entries</span></div>
        <div><strong>3</strong><span>source perspectives</span></div>
        <div><strong>{exerciseDomains.length}</strong><span>problem domains</span></div>
        <div><strong>{canonicalExercises.filter((item) => item.route).length}</strong><span>already connected to AgoCode</span></div>
      </div>

      <div className="atlas-source-strip" aria-label="Entries by source">
        {sourceOptions.slice(1).map((option) => (
          <button
            type="button"
            className={source === option.value ? "atlas-source atlas-source--active" : "atlas-source"}
            onClick={() => setSource(source === option.value ? "all" : option.value)}
            key={option.value}
          >
            <span>{option.label}</span>
            <strong>{sourceCounts[option.value]}</strong>
          </button>
        ))}
      </div>

      <div className="atlas-controls">
        <label className="atlas-search">
          <span>Search the repertoire</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="heap, interval, shortest path, invariant…"
            type="search"
          />
        </label>

        <label>
          <span>Source</span>
          <select value={source} onChange={(event) => setSource(event.target.value as "all" | ExerciseSource)}>
            {sourceOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label>
          <span>Domain</span>
          <select value={domain} onChange={(event) => setDomain(event.target.value)}>
            <option value="all">All domains</option>
            {exerciseDomains.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>

        <label>
          <span>Level</span>
          <select value={level} onChange={(event) => setLevel(event.target.value as "all" | ExerciseLevel)}>
            {levelOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>

        <label className="atlas-check">
          <input type="checkbox" checked={interactiveOnly} onChange={(event) => setInteractiveOnly(event.target.checked)} />
          <span>Interactive now</span>
        </label>
      </div>

      <div className="atlas-result-line">
        <span className="mono">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
        <button
          className="atlas-reset"
          type="button"
          onClick={() => { setQuery(""); setSource("all"); setDomain("all"); setLevel("all"); setInteractiveOnly(false); }}
        >
          reset filters
        </button>
      </div>

      <div className="atlas-list">
        {filtered.map((item, index) => (
          <article className="atlas-row" key={item.id}>
            <div className="atlas-row__index mono">{String(index + 1).padStart(3, "0")}</div>
            <div className="atlas-row__main">
              <div className="atlas-row__meta">
                <span>{sourceLabels[item.source]}</span>
                <span>{item.sourceChapter}</span>
                <span>{item.level}</span>
              </div>
              <h2>{item.title}</h2>
              <p>{item.lens}</p>
              <div className="atlas-tags">
                <span>{item.domain}</span>
                {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>
            <div className="atlas-row__action">
              <span className={item.route ? "atlas-state atlas-state--live" : "atlas-state"}>{item.route ? "interactive" : "catalogued"}</span>
              {item.route ? (
                <Link href={item.route}>Open learning slice →</Link>
              ) : (
                <Link href={`/exercises/${item.id}`}>Open design worksheet →</Link>
              )}
            </div>
          </article>
        ))}
      </div>

      {!filtered.length ? (
        <div className="empty-state">
          <h2>No entry matches that combination.</h2>
          <p>Try removing a source or domain filter. Structural clues often cross chapter boundaries.</p>
        </div>
      ) : null}
    </div>
  );
}
