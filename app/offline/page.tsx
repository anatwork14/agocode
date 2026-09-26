import Link from "next/link";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="page">
      <div className="site-shell">
        <div className="eyebrow">Offline shell</div>
        <h1 className="editorial-title editorial-title--compact">Your evidence is local. Keep working with what this browser already has.</h1>
        <p className="lede">
          AgoCode could not reach the network for this destination. Core learning surfaces are cached for offline use, and your learning evidence remains in browser storage rather than depending on a server connection.
        </p>

        <section className="section">
          <div className="section-heading">
            <span className="section-heading__index mono">01</span>
            <div>
              <h2>Offline-ready core</h2>
              <p>These routes are part of the install shell. Other pages become available offline after they have been visited successfully on this device.</p>
            </div>
          </div>
          <div className="action-row">
            <Link className="button button--primary" href="/practice/session">Today&apos;s practice</Link>
            <Link className="button" href="/plan">Curriculum plan</Link>
            <Link className="button" href="/review/weekly">Weekly review</Link>
            <Link className="button" href="/progress">Progress evidence</Link>
            <Link className="button" href="/settings/data">Data &amp; recovery</Link>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <span className="section-heading__index mono">02</span>
            <div>
              <h2>What remains safe offline</h2>
              <p>
                Reasoning attempts, diagnostic state, daily sessions, weekly missions, review history, bookmarks, and other AgoCode browser-local records continue to use localStorage. The service worker caches HTTP responses only; it does not rewrite learning evidence.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
