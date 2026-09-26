"use client";

import { useEffect, useState } from "react";
import {
  collectAgoCodeData,
  importAgoCodeData,
  parseAgoCodeData,
  resetAgoCodeData,
  serializeAgoCodeData,
} from "@/lib/learning/data-portability";
import {
  auditAgoCodeStorage,
  createAgoCodeStorageRecoveryPoint,
  migrateAgoCodeStorage,
  restoreAgoCodeStorageRecoveryPoint,
  type AgoCodeStorageAudit,
} from "@/lib/learning/storage-reliability";

export function DataPortability() {
  const [entryCount, setEntryCount] = useState(0);
  const [audit, setAudit] = useState<AgoCodeStorageAudit | null>(null);
  const [message, setMessage] = useState("");
  const [replace, setReplace] = useState(false);

  function refresh() {
    setEntryCount(Object.keys(collectAgoCodeData(window.localStorage).entries).length);
    setAudit(auditAgoCodeStorage(window.localStorage));
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
    setMessage(`Exported ${Object.keys(data.entries).length} learner-owned AgoCode storage entries. Internal recovery metadata stays browser-local.`);
  }

  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      const data = parseAgoCodeData(await file.text());
      const count = importAgoCodeData(window.localStorage, data, replace);
      refresh();
      setMessage(`Imported ${count} AgoCode entries${replace ? " after clearing existing AgoCode data" : ""}. Storage health was re-audited; safe legacy evidence can be migrated below.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not import this file.");
    }
  }

  function createRecoveryPoint() {
    try {
      const recovery = createAgoCodeStorageRecoveryPoint(window.localStorage, "manual");
      refresh();
      setMessage(`Created a recovery point containing ${Object.keys(recovery.entries).length} learner-data entries.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create a recovery point.");
    }
  }

  function migrateStorage() {
    try {
      const result = migrateAgoCodeStorage(window.localStorage);
      refresh();
      setMessage(result.migratedKeys.length
        ? `Migrated ${result.migratedKeys.length} safe legacy evidence entr${result.migratedKeys.length === 1 ? "y" : "ies"}. A full pre-migration recovery point was created first.`
        : "No safe legacy evidence migrations are currently needed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Storage migration could not be completed safely.");
    }
  }

  function restoreRecoveryPoint() {
    if (!window.confirm("Restore the latest AgoCode recovery point? Current AgoCode-owned local state will be replaced, while unrelated browser storage remains untouched.")) return;
    try {
      const count = restoreAgoCodeStorageRecoveryPoint(window.localStorage);
      refresh();
      setMessage(`Restored ${count} AgoCode learner-data entries from the latest recovery point.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not restore the recovery point.");
    }
  }

  function reset() {
    if (!window.confirm("Delete all AgoCode learning data stored in this browser? Export first if you may need it later.")) return;
    const count = resetAgoCodeData(window.localStorage);
    refresh();
    setMessage(`Deleted ${count} AgoCode storage entries from this browser.`);
  }

  const invalidEntries = audit?.entries.filter((entry) => entry.classification === "invalid-known-evidence") ?? [];

  return (
    <div className="data-portability">
      <div className="data-portability__summary">
        <span className="eyebrow">Browser-local evidence</span>
        <strong>{entryCount} learner-data entr{entryCount === 1 ? "y" : "ies"}</strong>
        <p>Exports include learning evidence, reasoning attempts, review scheduling, bookmarks, sets, and other learner-owned AgoCode state. Recovery metadata is intentionally kept out of portable bundles.</p>
      </div>

      <section className="storage-health" aria-labelledby="storage-health-title">
        <div className="storage-health__heading">
          <div>
            <span className="eyebrow">Storage reliability</span>
            <h2 id="storage-health-title">Audit first. Back up before migration. Never guess at unknown state.</h2>
          </div>
          <span className="mono">schema v1</span>
        </div>

        {audit ? (
          <>
            <div className="storage-health__metrics">
              <article>
                <span>Current evidence</span>
                <strong>{audit.currentEvidence}</strong>
                <small>recognized schema-v1 learning records</small>
              </article>
              <article>
                <span>Safe legacy</span>
                <strong>{audit.legacyEvidence}</strong>
                <small>eligible for deterministic migration</small>
              </article>
              <article>
                <span>Unmanaged</span>
                <strong>{audit.unmanaged}</strong>
                <small>preserved byte-for-byte, never rewritten</small>
              </article>
              <article>
                <span>Needs inspection</span>
                <strong>{audit.invalidKnownEvidence}</strong>
                <small>known evidence keys with unreadable or unfamiliar shapes</small>
              </article>
            </div>

            <div className="storage-health__actions">
              <button className="button" type="button" onClick={createRecoveryPoint}>Create recovery point</button>
              <button className="button button--primary" type="button" onClick={migrateStorage} disabled={audit.legacyEvidence === 0}>
                Migrate {audit.legacyEvidence || "safe"} legacy entr{audit.legacyEvidence === 1 ? "y" : "ies"}
              </button>
              <button className="button" type="button" onClick={restoreRecoveryPoint} disabled={!audit.recoveryPoint}>Restore latest recovery</button>
            </div>

            <div className="storage-health__recovery">
              <div>
                <span className="mono">RECOVERY</span>
                <strong>{audit.recoveryPoint ? new Date(audit.recoveryPoint.createdAt).toLocaleString() : "No recovery point yet"}</strong>
              </div>
              <p>
                {audit.recoveryPoint
                  ? `${Object.keys(audit.recoveryPoint.entries).length} learner-data entries are preserved in the latest browser-local recovery snapshot.`
                  : "Any schema migration will refuse to start until a complete learner-data recovery snapshot has been serialized successfully."}
              </p>
            </div>

            {invalidEntries.length ? (
              <div className="storage-health__warning" role="status">
                <strong>{invalidEntries.length} known evidence entr{invalidEntries.length === 1 ? "y has" : "ies have"} an unfamiliar shape.</strong>
                <p>AgoCode will not rewrite or delete these entries automatically. Export your data before manual troubleshooting.</p>
                <ul>
                  {invalidEntries.slice(0, 6).map((entry) => <li key={entry.key}><code>{entry.key}</code></li>)}
                </ul>
              </div>
            ) : null}
          </>
        ) : <p className="storage-health__loading">Auditing AgoCode-owned browser state…</p>}
      </section>

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
          <p>Only portable AgoCode-prefixed keys are accepted. Foreign and internal recovery keys inside a file are ignored.</p>
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
          <p>This removes AgoCode-prefixed local state, including internal recovery metadata. It does not affect unrelated browser storage.</p>
          <button className="button" type="button" onClick={reset}>Reset local AgoCode data</button>
        </section>
      </div>

      {message ? <div className="data-portability__message" role="status">{message}</div> : null}

      <div className="problem-review-boundary">
        <span className="eyebrow">Privacy boundary</span>
        <p>
          This portability and migration layer is intentionally browser-local and transparent. It is the reliability boundary AgoCode needs before any optional account or cross-device synchronization layer is introduced.
        </p>
      </div>
    </div>
  );
}
