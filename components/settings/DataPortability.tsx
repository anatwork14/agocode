"use client";

import { useEffect, useState } from "react";
import {
  collectAgoCodeData,
  collectSealedAgoCodeData,
  parseAgoCodeDataForImport,
  resetAgoCodeData,
  serializeAgoCodeData,
  type AgoCodeDataExport,
  type AgoCodeImportIntegrity,
} from "@/lib/learning/data-portability";
import {
  auditAgoCodeStorage,
  createAgoCodeStorageRecoveryPoint,
  importAgoCodeDataSafely,
  migrateAgoCodeStorage,
  previewAgoCodeDataImport,
  restoreAgoCodeStorageRecoveryPoint,
  type AgoCodeImportConflictPolicy,
  type AgoCodeStorageAudit,
  type AgoCodeStorageImportPreview,
} from "@/lib/learning/storage-reliability";

type PendingImport = {
  fileName: string;
  data: AgoCodeDataExport;
  integrity: AgoCodeImportIntegrity;
  preview: AgoCodeStorageImportPreview;
  localBasis: string;
};

function localImportBasis() {
  const entries = collectAgoCodeData(window.localStorage).entries;
  return JSON.stringify(Object.entries(entries).sort(([left], [right]) => left.localeCompare(right)));
}

export function DataPortability() {
  const [entryCount, setEntryCount] = useState(0);
  const [audit, setAudit] = useState<AgoCodeStorageAudit | null>(null);
  const [message, setMessage] = useState("");
  const [replace, setReplace] = useState(false);
  const [conflictPolicy, setConflictPolicy] = useState<AgoCodeImportConflictPolicy>("preserve-local");
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

  function refresh() {
    setEntryCount(Object.keys(collectAgoCodeData(window.localStorage).entries).length);
    setAudit(auditAgoCodeStorage(window.localStorage));
  }

  function buildPendingImport(
    data: AgoCodeDataExport,
    fileName: string,
    integrity: AgoCodeImportIntegrity,
    nextReplace = replace,
    nextConflictPolicy = conflictPolicy,
  ): PendingImport {
    return {
      fileName,
      data,
      integrity,
      preview: previewAgoCodeDataImport(window.localStorage, data, nextReplace, nextConflictPolicy),
      localBasis: localImportBasis(),
    };
  }

  useEffect(() => {
    const timer = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function exportData() {
    try {
      const data = await collectSealedAgoCodeData(window.localStorage);
      const blob = new Blob([serializeAgoCodeData(data)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `agocode-learning-data-${data.exportedAt.slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage(`Exported ${Object.keys(data.entries).length} learner-owned AgoCode storage entries with a SHA-256 integrity manifest. Internal recovery metadata stays browser-local.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create an integrity-sealed export.");
    }
  }

  async function stageImportFile(file: File | undefined) {
    if (!file) return;
    try {
      const parsed = await parseAgoCodeDataForImport(await file.text());
      setPendingImport(buildPendingImport(parsed.data, file.name, parsed.integrity));
      setMessage("");
    } catch (error) {
      setPendingImport(null);
      setMessage(error instanceof Error ? error.message : "Could not preview this import file.");
    }
  }

  function updateReplace(nextReplace: boolean) {
    setReplace(nextReplace);
    if (pendingImport) {
      setPendingImport(buildPendingImport(
        pendingImport.data,
        pendingImport.fileName,
        pendingImport.integrity,
        nextReplace,
        conflictPolicy,
      ));
    }
  }

  function updateConflictPolicy(nextConflictPolicy: AgoCodeImportConflictPolicy) {
    setConflictPolicy(nextConflictPolicy);
    if (pendingImport) {
      setPendingImport(buildPendingImport(
        pendingImport.data,
        pendingImport.fileName,
        pendingImport.integrity,
        replace,
        nextConflictPolicy,
      ));
    }
  }

  function applyPendingImport() {
    if (!pendingImport) return;
    if (pendingImport.localBasis !== localImportBasis()) {
      setPendingImport(buildPendingImport(
        pendingImport.data,
        pendingImport.fileName,
        pendingImport.integrity,
      ));
      setMessage("Local AgoCode data changed after this preview was created. The preview was refreshed; review the new impact before applying the import.");
      return;
    }

    try {
      const sourceIntegrity = pendingImport.integrity;
      const result = importAgoCodeDataSafely(
        window.localStorage,
        pendingImport.data,
        replace,
        new Date().toISOString(),
        conflictPolicy,
      );
      refresh();
      setPendingImport(null);
      const skippedMessage = result.skippedConflictKeys.length
        ? ` Kept ${result.skippedConflictKeys.length} local conflict${result.skippedConflictKeys.length === 1 ? "" : "s"} unchanged by explicit merge policy.`
        : "";
      const integrityMessage = sourceIntegrity.status === "verified"
        ? " Source bundle SHA-256 integrity was verified before staging."
        : " Source bundle was a compatible legacy export without an integrity manifest, so original-file integrity could not be verified.";
      const policyWarning = result.policyConsistency.fallbackRequired
        ? " Recommendation-policy metadata contains a critical contradiction, so the planner remains fail-closed on baseline-v1 until you use the explicit repair control in Progress."
        : result.policyConsistency.warnings
          ? ` Recommendation-policy metadata is usable with ${result.policyConsistency.warnings} bounded-history warning${result.policyConsistency.warnings === 1 ? "" : "s"}.`
          : " Recommendation-policy metadata passed its consistency audit.";
      setMessage(
        `Imported ${result.importedKeys.length} AgoCode entr${result.importedKeys.length === 1 ? "y" : "ies"} in ${result.mode} mode. A complete pre-import recovery point was created and every applied value was verified after writing.${integrityMessage}${skippedMessage}${policyWarning}`,
      );
    } catch (error) {
      refresh();
      setMessage(error instanceof Error ? error.message : "Could not import this file safely.");
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
      setPendingImport(null);
      setMessage(`Restored ${count} AgoCode learner-data entries from the latest recovery point.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not restore the recovery point.");
    }
  }

  function reset() {
    if (!window.confirm("Delete all AgoCode learning data stored in this browser? Export first if you may need it later.")) return;
    const count = resetAgoCodeData(window.localStorage);
    refresh();
    setPendingImport(null);
    setMessage(`Deleted ${count} AgoCode storage entries from this browser.`);
  }

  const invalidEntries = audit?.entries.filter((entry) => entry.classification === "invalid-known-evidence") ?? [];
  const importPreview = pendingImport?.preview;

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
                  : "Any schema migration or learning-data import will refuse to start unless a complete learner-data recovery snapshot can be serialized first."}
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
          <p>Download one versioned JSON bundle before changing browsers, clearing storage, or testing a migration. New exports include a SHA-256 integrity manifest so accidental backup damage can be detected before import.</p>
          <button className="button button--primary" type="button" onClick={() => void exportData()}>Export learning data</button>
        </section>

        <section>
          <span className="mono">IMPORT</span>
          <h2>Preview first, then restore or merge.</h2>
          <p>Selecting a file never changes browser state. AgoCode verifies integrity when the bundle provides a manifest, then shows additions, conflicts, unchanged values, removals, and the projected policy-consistency result. Applying the reviewed plan is still transactional and recoverable.</p>
          <label className="data-portability__replace">
            <input type="checkbox" checked={replace} onChange={(event) => updateReplace(event.target.checked)} />
            <span>Replace existing AgoCode data before import</span>
          </label>
          <label className="button data-portability__file">
            Choose AgoCode JSON
            <input type="file" accept="application/json,.json" onChange={(event) => void stageImportFile(event.target.files?.[0])} />
          </label>

          {pendingImport && importPreview ? (
            <div className="storage-health__recovery" data-testid="import-preflight" style={{ marginTop: 16 }}>
              <div>
                <span className="mono">IMPORT PREVIEW</span>
                <strong>{pendingImport.fileName}</strong>
              </div>
              <p>No AgoCode browser data has changed yet. Review the projected transaction before applying it.</p>

              {pendingImport.integrity.status === "verified" ? (
                <p data-testid="import-integrity-status">
                  <strong>Verified SHA-256 integrity.</strong> The manifest covers {pendingImport.integrity.entryCount} portable entr{pendingImport.integrity.entryCount === 1 ? "y" : "ies"}; these bytes match the bundle digest. This is corruption detection, not an authenticity signature.
                </p>
              ) : (
                <div className="storage-health__warning" data-testid="import-integrity-status">
                  <strong>Legacy bundle — no integrity manifest.</strong>
                  <p>This compatible v1 export can still be previewed and imported, but AgoCode cannot prove that its bytes match the original backup. Consider exporting a fresh integrity-sealed copy after restoration.</p>
                </div>
              )}

              <div className="storage-health__metrics" style={{ marginTop: 12 }}>
                <article data-testid="import-preflight-additions">
                  <span>Add</span>
                  <strong>{importPreview.additions.length}</strong>
                  <small>new learner-data keys</small>
                </article>
                <article data-testid="import-preflight-conflicts">
                  <span>Conflicts</span>
                  <strong>{importPreview.conflicts.length}</strong>
                  <small>same key, different bytes</small>
                </article>
                <article data-testid="import-preflight-identical">
                  <span>Unchanged</span>
                  <strong>{importPreview.identical.length}</strong>
                  <small>byte-identical values</small>
                </article>
                <article data-testid="import-preflight-removals">
                  <span>Remove</span>
                  <strong>{importPreview.removals.length}</strong>
                  <small>{replace ? "local keys absent from file" : "merge removes nothing"}</small>
                </article>
              </div>

              {!replace && importPreview.conflicts.length ? (
                <fieldset style={{ marginTop: 14 }}>
                  <legend><strong>For conflicting keys</strong></legend>
                  <label className="data-portability__replace">
                    <input
                      type="radio"
                      name="import-conflict-policy"
                      checked={conflictPolicy === "preserve-local"}
                      onChange={() => updateConflictPolicy("preserve-local")}
                    />
                    <span>Keep local values — skip {importPreview.conflicts.length} conflicting imported key{importPreview.conflicts.length === 1 ? "" : "s"}</span>
                  </label>
                  <label className="data-portability__replace">
                    <input
                      type="radio"
                      name="import-conflict-policy"
                      checked={conflictPolicy === "overwrite"}
                      onChange={() => updateConflictPolicy("overwrite")}
                    />
                    <span>Use imported values — overwrite the conflicting local keys</span>
                  </label>
                </fieldset>
              ) : null}

              {replace ? (
                <p><strong>Replace mode:</strong> imported values win, and {importPreview.removals.length} local learner-data key{importPreview.removals.length === 1 ? "" : "s"} absent from this file will be removed after the recovery point is created.</p>
              ) : importPreview.skippedConflictKeys.length ? (
                <p><strong>Merge policy:</strong> {importPreview.skippedConflictKeys.length} conflict{importPreview.skippedConflictKeys.length === 1 ? "" : "s"} will keep the current local value.</p>
              ) : null}

              {importPreview.policyConsistency.fallbackRequired ? (
                <div className="storage-health__warning" role="status" data-testid="import-preflight-policy-warning">
                  <strong>Projected policy state requires baseline fallback.</strong>
                  <p>The import would preserve the learner data, but recommendation-policy metadata has {importPreview.policyConsistency.criticalIssues} critical consistency issue{importPreview.policyConsistency.criticalIssues === 1 ? "" : "s"}. After import, the planner will remain on baseline-v1 until the explicit Progress repair flow is used.</p>
                </div>
              ) : (
                <p data-testid="import-preflight-policy-ok">Projected recommendation-policy state is internally usable{importPreview.policyConsistency.warnings ? ` with ${importPreview.policyConsistency.warnings} bounded-history warning${importPreview.policyConsistency.warnings === 1 ? "" : "s"}` : ""}.</p>
              )}

              <div className="storage-health__actions" style={{ marginTop: 14 }}>
                <button className="button button--primary" type="button" onClick={applyPendingImport}>Apply reviewed import</button>
                <button className="button" type="button" onClick={() => { setPendingImport(null); setMessage(""); }}>Cancel preview</button>
              </div>
            </div>
          ) : null}
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
