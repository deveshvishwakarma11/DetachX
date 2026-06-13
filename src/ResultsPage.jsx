import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const resultsStyles = `
  * { box-sizing: border-box; }

  .results-page {
    position: relative;
    min-height: 100dvh;
    background: #0A0A0F;
    font-family: 'Space Grotesk', sans-serif;
    color: #F0EEE9;
    padding: 0 0 6rem;
    overflow-x: hidden;
  }
  .results-page .top-bar {
    height: 1px;
    background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent);
  }

  /* Nav */
  .results-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2.5rem;
    border-bottom: 1px solid #1E1E2A;
  }
  .results-nav .wordmark {
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #F0EEE9;
  }
  .results-nav .wordmark span { color: #6C63FF; }
  .nav-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .nav-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    border: 1px solid #2A2A38;
    object-fit: cover;
  }
  .nav-email { font-size: 0.78rem; color: #6B6880; }
  .nav-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.78rem;
    font-weight: 500;
    color: #4A4860;
    background: none;
    border: 1px solid #1E1E2A;
    border-radius: 6px;
    padding: 0.35rem 0.85rem;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .nav-btn:hover { color: #6B6880; border-color: #2A2A38; }

  /* Hero */
  .results-hero {
    text-align: center;
    padding: 3.5rem 2rem 0.5rem;
    animation: fade-up 0.5s ease forwards;
  }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #6C63FF;
    background: rgba(108,99,255,0.1);
    border: 1px solid rgba(108,99,255,0.2);
    border-radius: 99px;
    padding: 0.35rem 1rem;
    margin-bottom: 1.25rem;
  }
  .results-hero h1 {
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    margin: 0 0 0.6rem;
  }
  .results-hero p { font-size: 0.9rem; color: #6B6880; font-weight: 300; margin: 0; }
  .scan-meta { font-size: 0.72rem; color: #4A4860; margin-top: 0.5rem; }

  /* Stats */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    max-width: 900px;
    margin: 2.5rem auto 0;
    padding: 0 2rem;
    animation: fade-up 0.5s ease 0.1s both;
  }
  .stat-card {
    background: #111118;
    border: 1px solid #1E1E2A;
    border-radius: 14px;
    padding: 1.5rem 1.5rem 1.25rem;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
  }
  .stat-card:hover { border-color: #2A2A38; transform: translateY(-2px); }
  .stat-card .accent {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    border-radius: 2px 2px 0 0;
  }
  .stat-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  .stat-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #4A4860;
    margin-bottom: 0.35rem;
  }
  .stat-value {
    font-size: 2.4rem;
    font-weight: 700;
    letter-spacing: -0.04em;
    color: #F0EEE9;
    line-height: 1;
    margin-bottom: 0.25rem;
  }
  .stat-sub { font-size: 0.73rem; color: #6B6880; font-weight: 300; }

  /* Section */
  .section {
    max-width: 900px;
    margin: 3rem auto 0;
    padding: 0 2rem;
    animation: fade-up 0.5s ease 0.2s both;
  }
  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  .section-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #F0EEE9;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .section-pill {
    font-size: 0.72rem;
    color: #6B6880;
    background: #1A1A25;
    border: 1px solid #2A2A38;
    border-radius: 99px;
    padding: 0.2rem 0.75rem;
  }

  /* Unsub list */
  .unsub-list { display: flex; flex-direction: column; gap: 0.5rem; }

  .unsub-item {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    background: #111118;
    border: 1px solid #1E1E2A;
    border-radius: 10px;
    padding: 0.85rem 1.1rem;
    transition: border-color 0.2s;
  }
  .unsub-item:hover { border-color: #2A2A38; }
  .unsub-item.done {
    opacity: 0.45;
    border-color: #1A2A1A;
    background: #0F1A0F;
  }

  .unsub-letter {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: rgba(108,99,255,0.1);
    border: 1px solid rgba(108,99,255,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 700;
    color: #6C63FF;
    flex-shrink: 0;
    text-transform: uppercase;
  }
  .unsub-info { flex: 1; min-width: 0; }
  .unsub-from {
    font-size: 0.83rem;
    font-weight: 500;
    color: #F0EEE9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .unsub-subject {
    font-size: 0.73rem;
    color: #4A4860;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  /* ✅ UNSUB button — actual clickable button now */
  .unsub-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-radius: 99px;
    padding: 0.25rem 0.75rem;
    border: 1px solid;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: background 0.2s, transform 0.15s, opacity 0.2s;
    line-height: 1.6;
  }
  .unsub-btn.active {
    color: #EF4444;
    background: rgba(239,68,68,0.08);
    border-color: rgba(239,68,68,0.25);
  }
  .unsub-btn.active:hover {
    background: rgba(239,68,68,0.18);
    transform: scale(1.04);
  }
  .unsub-btn.no-link {
    color: #4A4860;
    background: transparent;
    border-color: #2A2A38;
    cursor: not-allowed;
  }
  .unsub-btn.done-btn {
    color: #22C55E;
    background: rgba(34,197,94,0.08);
    border-color: rgba(34,197,94,0.25);
    cursor: default;
  }

  /* Toast */
  .toast-wrap {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    pointer-events: none;
  }
  .toast {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    padding: 0.65rem 1.25rem;
    border-radius: 99px;
    border: 1px solid;
    white-space: nowrap;
    animation: toast-in 0.3s ease forwards;
    pointer-events: none;
  }
  .toast.success {
    color: #22C55E;
    background: rgba(34,197,94,0.1);
    border-color: rgba(34,197,94,0.25);
  }
  .toast.warn {
    color: #F59E0B;
    background: rgba(245,158,11,0.1);
    border-color: rgba(245,158,11,0.25);
  }
  .toast.info {
    color: #6C63FF;
    background: rgba(108,99,255,0.1);
    border-color: rgba(108,99,255,0.25);
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Actions */
  .actions-row {
    max-width: 900px;
    margin: 2rem auto 0;
    padding: 0 2rem;
    display: flex;
    gap: 0.85rem;
    flex-wrap: wrap;
  }
  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.83rem;
    font-weight: 600;
    color: #6C63FF;
    background: rgba(108,99,255,0.08);
    border: 1px solid rgba(108,99,255,0.2);
    border-radius: 8px;
    padding: 0.65rem 1.2rem;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .action-btn:hover { background: rgba(108,99,255,0.15); border-color: rgba(108,99,255,0.4); }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 600px) {
    .results-nav  { padding: 1.25rem; }
    .nav-email    { display: none; }
    .stats-grid   { grid-template-columns: repeat(2,1fr); padding: 0 1.25rem; }
    .section      { padding: 0 1.25rem; }
    .actions-row  { padding: 0 1.25rem; }
    .unsub-item   { flex-wrap: wrap; }
  }
`;

// ── Toast helper ─────────────────────────────────────────────────────────────
let toastId = 0;

export default function ResultsPage() {
  const navigate = useNavigate();
  const [result,   setResult]   = useState(null);
  const [doneSet,  setDoneSet]  = useState(new Set());   // tracks unsubbed domains
  const [toasts,   setToasts]   = useState([]);
  const user = JSON.parse(localStorage.getItem("detachx_user") || "null");

  useEffect(() => {
    const raw = localStorage.getItem("scan_result");
    if (!raw) { navigate("/dashboard"); return; }
    const data = JSON.parse(raw);
    const currentEmail = user?.email || "";
    if (data.userEmail && data.userEmail !== currentEmail) {
      localStorage.removeItem("scan_result");
      navigate("/dashboard");
      return;
    }
    setResult(data);
  }, []);

  // ── Toast system ────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  // ── ✅ UNSUB click handler ──────────────────────────────────────────────────
  const handleUnsub = useCallback((item) => {
    // Already done
    if (doneSet.has(item.domain)) return;

    if (!item.unsubUrl) {
      // No link found
      showToast(`No unsubscribe link found for ${item.domain}`, "warn");
      return;
    }

    if (item.unsubUrl.startsWith("mailto:")) {
      // Mailto — open mail client
      window.open(item.unsubUrl, "_blank");
      setDoneSet((prev) => new Set([...prev, item.domain]));
      showToast(`Opened mail client for ${item.domain}`, "info");
      return;
    }

    // HTTP unsubscribe link — open in new tab
    window.open(item.unsubUrl, "_blank", "noopener,noreferrer");
    setDoneSet((prev) => new Set([...prev, item.domain]));
    showToast(`Opened unsubscribe page for ${item.domain} ✓`, "success");
  }, [doneSet, showToast]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (!result) return null;

  return (
    <>
      <style>{resultsStyles}</style>
      <div className="results-page">
        <div className="top-bar" />

        {/* Nav */}
        <nav className="results-nav">
          <div className="wordmark">Detach<span>X</span></div>
          <div className="nav-right">
            {user && (
              <>
                <img src={user.picture} alt="" referrerPolicy="no-referrer" className="nav-avatar" />
                <span className="nav-email">{user.email}</span>
              </>
            )}
            <button className="nav-btn" onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button className="nav-btn" onClick={handleLogout}>Log out</button>
          </div>
        </nav>

        {/* Hero */}
        <div className="results-hero">
          <div className="hero-badge">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
            Scan Complete
          </div>
          <h1>Your Digital Footprint</h1>
          <p>Real results from your Gmail inbox — {user?.email}</p>
          {result.scannedAt && (
            <p className="scan-meta">Scanned on {formatDate(result.scannedAt)}</p>
          )}
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="accent" style={{ background: "#6C63FF" }} />
            <div className="stat-icon" style={{ background: "rgba(108,99,255,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 4h14v10a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 0l7 5.5L16 4" stroke="#6C63FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-label">Total Emails</div>
            <div className="stat-value">{result.total}</div>
            <div className="stat-sub">scanned from inbox</div>
          </div>

          <div className="stat-card">
            <div className="accent" style={{ background: "#3B82F6" }} />
            <div className="stat-icon" style={{ background: "rgba(59,130,246,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2l1.8 4.9H16l-4.1 3 1.5 4.9L9 12l-4.4 2.8 1.5-4.9L2 7h5.2L9 2z" stroke="#3B82F6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-label">Promotional</div>
            <div className="stat-value">{result.promos}</div>
            <div className="stat-sub">marketing emails</div>
          </div>

          <div className="stat-card">
            <div className="accent" style={{ background: "#F59E0B" }} />
            <div className="stat-icon" style={{ background: "rgba(245,158,11,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5h12M3 9h12M3 13h7" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="stat-label">Newsletters</div>
            <div className="stat-value">{result.newsletters}</div>
            <div className="stat-sub">subscription emails</div>
          </div>

          <div className="stat-card">
            <div className="accent" style={{ background: "#EF4444" }} />
            <div className="stat-icon" style={{ background: "rgba(239,68,68,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3v6M9 13h.01" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="9" cy="9" r="7" stroke="#EF4444" strokeWidth="1.4"/>
              </svg>
            </div>
            <div className="stat-label">Unsubscribe</div>
            <div className="stat-value">{result.unsubCount}</div>
            <div className="stat-sub">unique senders</div>
          </div>
        </div>

        {/* Unsub list */}
        <div className="section">
          <div className="section-head">
            <span className="section-title">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1L9 5.5H14L10 8.5L11.5 13L7.5 10.5L3.5 13L5 8.5L1 5.5H6L7.5 1Z"
                  stroke="#6C63FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Unsubscribe Candidates
            </span>
            <span className="section-pill">{result.unsubList.length} senders</span>
          </div>

          <div className="unsub-list">
            {result.unsubList.length === 0 ? (
              <p style={{ color: "#4A4860", fontSize: "0.85rem", padding: "1rem 0" }}>
                No unsubscribe candidates found.
              </p>
            ) : (
              result.unsubList.map((item, i) => {
                const isDone    = doneSet.has(item.domain);
                const hasLink   = !!item.unsubUrl;

                return (
                  <div
                    className={`unsub-item${isDone ? " done" : ""}`}
                    key={i}
                  >
                    <div className="unsub-letter">
                      {(item.domain?.[0] || item.from?.[0] || "?").toUpperCase()}
                    </div>

                    <div className="unsub-info">
                      <div className="unsub-from">{item.from}</div>
                      <div className="unsub-subject">{item.subject || "No subject"}</div>
                    </div>

                    {/* ✅ Smart UNSUB button */}
                    {isDone ? (
                      <button className="unsub-btn done-btn" disabled>
                        Done ✓
                      </button>
                    ) : hasLink ? (
                      <button
                        className="unsub-btn active"
                        onClick={() => handleUnsub(item)}
                        title={item.unsubUrl}
                      >
                        Unsub
                      </button>
                    ) : (
                      <button
                        className="unsub-btn no-link"
                        onClick={() => showToast(`No unsubscribe link available for ${item.domain}`, "warn")}
                        title="No unsubscribe link found"
                      >
                        No Link
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="actions-row">
          <button className="action-btn" onClick={() => navigate("/scan")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 7A6 6 0 1 1 7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13 1v6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Scan Again
          </button>
          <button className="action-btn" onClick={() => navigate("/dashboard")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 7H1M6 2L1 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* ✅ Toast notifications */}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.message}
          </div>
        ))}
      </div>
    </>
  );
}