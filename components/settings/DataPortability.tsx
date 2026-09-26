"use client";

import { useEffect, useState } from "react";
import {
  collectAgoCodeData,
  importAgoCodeData,
  parseAgoCodeData,
  resetAgoCodeData,
  serializeAgoCodeData,
} from "@/lib/learning/data-portability";

export function DataPortability() {
  const [entryCount, setEntryCount] = useState(0);
  const [message, setMessage] = useState("");
  const [replace, setReplace] = useState(false);

  function refresh() {
    setEntryCount(Object.keys(collectAgoCodeData(window.localStorage).entries).length);
  }

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function exportData() {
    const data = collectAgoCodeData(window.localStorage);
    const blob = new Blob([serializeAgoCodeData(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `agocode-learning-data-${data.exportedAt.slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(`Exported ${Object.keys(data.entries).length} AgoCode storage entries.`);
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      const data = parseAgoCodeData(await file.text());
      const count = importAgoCodeData(window.localStorage, data, replace);
      refresh();
      setMessage(`Imported ${count} AgoCode entries${replace ? " after clearing existing AgoCode data" : ""}. Reload any open learning pages to refresh their local snapshots.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not import this file.");
    }
  }

  function reset() {
    if (!window.confirm("Delete all AgoCode learning data stored in this browser? Export first if you may need it later.")) return;
    const count = resetAgoCodeData(window.localStorage);
    refresh();
    setMessage(`Deleted ${count} AgoCode storage entries from this browser.`);
  }

  return (
    <div className="data-portability">
      <div className="data-portability__summary">
        <span className="eyebrow">Browser-local evidence</span>
        <strong>{entryCount} AgoCode storage entr{entryCount === 1 ? "y" : "ies"}</strong>
        <p>Exports include learning evidence, reasoning attempts, review scheduling, bookmarks, sets, and other AgoCode-prefixed local state.</p>
      </div>

      <div className="data-portability__grid">
        <section>
          <span className="mono">EXPORT</span>
          <h2>Make your learning history portable.</h2>
          <p>Download one versioned JSON bundle before changing browsers, clearing storage, or testing a migration.</p>
          <button className="button button--primary" type="button" onClick={exportData}>Export learning data</button>
        </section>

        <section>
          <span className="mono">IMPORT</span>
          <h2>Restore or merge a prior export.</h2>
          <p>Only AgoCode-prefixed keys are accepted. Other localStorage keys inside a file are ignored.</p>
          <label className="data-portability__replace">
            <input type="checkbox" checked={replace} onChange={(event) => setReplace(event.target.checked)} />
            <span>Replace existing AgoCode data before import</span>
          </label>
          <label className="button data-portability__file">
            Choose AgoCode JSON
            <input type="file" accept="application/json,.json" onChange={(event) => void importFile(event.target.files?.[0])} />
          </label>
        </section>

        <section className="data-portability__danger">
          <span className="mono">RESET</span>
          <h2>Start over on this browser.</h2>
          <p>This removes AgoCode-prefixed local state only. It does not affect unrelated browser storage.</p>
          <button className="button" type="button" onClick={reset}>Reset local AgoCode data</button>
        </section>
      </div>

      {message ? <div className="data-portability__message" role="status">{message}</div> : null}

      <div className="problem-review-boundary">
        <span className="eyebrow">Privacy boundary</span>
        <p>
          This portability layer is intentionally browser-local and transparent. It is the migration boundary AgoCode needs before any optional account or cross-device synchronization layer is introduced.
        </p>
      </div>
    </div>
  );
}
