import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const scanStyles = `
  .scan-page {
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    overflow: hidden;
    background: #0A0A0F;
    font-family: 'Space Grotesk', sans-serif;
  }
  .scan-page::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, #0A0A0F 100%);
    z-index: 1;
    pointer-events: none;
  }
  .scan-page .bg-x {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 0;
  }
  .scan-page .bg-x svg {
    width: min(70vw, 600px);
    height: min(70vw, 600px);
    opacity: 0.025;
    animation: pulse-x 6s ease-in-out infinite;
  }
  .scan-page .top-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent);
    z-index: 10;
  }
  .scan-page .wordmark {
    position: absolute;
    top: 2rem;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #F0EEE9;
    z-index: 10;
  }
  .scan-page .wordmark span { color: #6C63FF; }
  .scan-box {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }
  .radar-wrap {
    position: relative;
    width: 120px;
    height: 120px;
  }
  .radar-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(108,99,255,0.3);
    animation: radar-ping 2s ease-out infinite;
  }
  .radar-ring:nth-child(2) { animation-delay: 0.6s; }
  .radar-ring:nth-child(3) { animation-delay: 1.2s; }
  .radar-core {
    position: absolute;
    inset: 30px;
    border-radius: 50%;
    background: rgba(108,99,255,0.12);
    border: 1px solid rgba(108,99,255,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @keyframes radar-ping {
    0%   { transform: scale(0.6); opacity: 0.8; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  .scan-title {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #F0EEE9;
    margin: 0;
  }
  .scan-status {
    font-size: 0.85rem;
    color: #6B6880;
    margin: 0;
    min-height: 1.4em;
  }
  .progress-wrap {
    width: 280px;
    height: 3px;
    background: #1E1E2A;
    border-radius: 99px;
    overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #6C63FF, #A78BFA);
    border-radius: 99px;
    transition: width 0.5s ease;
  }
  .scan-error {
    color: #EF4444;
    font-size: 0.85rem;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px;
    padding: 0.75rem 1.25rem;
    max-width: 320px;
    text-align: center;
  }
  .retry-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    color: #6C63FF;
    background: rgba(108,99,255,0.08);
    border: 1px solid rgba(108,99,255,0.2);
    border-radius: 8px;
    padding: 0.6rem 1.25rem;
    cursor: pointer;
    transition: background 0.2s;
  }
  .retry-btn:hover { background: rgba(108,99,255,0.15); }
  .scan-page .footer-note {
    position: absolute;
    bottom: 2rem;
    font-size: 0.72rem;
    color: #6B6880;
    letter-spacing: 0.05em;
    z-index: 10;
  }
  @keyframes pulse-x {
    0%, 100% { opacity: 0.025; transform: scale(1); }
    50%       { opacity: 0.04;  transform: scale(1.04); }
  }
`;

const NEWSLETTER_SIGNALS = [
  "newsletter","digest","weekly","monthly","daily update",
  "roundup","bulletin","dispatch","briefing",
];
const PROMO_SIGNALS = [
  "% off","discount","sale","deal","offer","coupon","promo",
  "limited time","flash sale","exclusive","free shipping","save now",
  "shop now","buy now","order now","get started","claim your",
];

function classify(from, subject, snippet) {
  const src = `${from} ${subject} ${snippet}`.toLowerCase();
  const isNewsletter = NEWSLETTER_SIGNALS.some((s) => src.includes(s));
  const isPromo      = !isNewsletter && PROMO_SIGNALS.some((s) => src.includes(s));
  const hasUnsub     = src.includes("unsubscribe");
  return { isNewsletter, isPromo, hasUnsub };
}

// ✅ Extract HTTP unsubscribe URL from List-Unsubscribe header
function extractUnsubUrl(headerValue) {
  if (!headerValue) return null;
  // Header format: <https://...>, <mailto:...>
  // We want the https link, not mailto
  const parts = headerValue.split(",").map((s) => s.trim());
  for (const part of parts) {
    const match = part.match(/<(https?:\/\/[^>]+)>/i);
    if (match) return match[1];
  }
  // Fallback: try mailto
  for (const part of parts) {
    const match = part.match(/<(mailto:[^>]+)>/i);
    if (match) return match[1];
  }
  return null;
}

async function gmailFetch(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  if (!res.ok)            throw new Error(`API_ERROR_${res.status}`);
  return res.json();
}

async function runGmailScan(token, onProgress, onStatus) {
  onStatus("Connecting to Gmail…");
  onProgress(5);

  const MAX   = 500;
  const BATCH = 50;
  let pageToken = null;
  let allIds    = [];

  while (allIds.length < MAX) {
    const params = new URLSearchParams({ maxResults: BATCH });
    if (pageToken) params.set("pageToken", pageToken);
    const data = await gmailFetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
      token
    );
    if (!data.messages?.length) break;
    allIds = allIds.concat(data.messages.map((m) => m.id));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  onStatus(`Found ${allIds.length} emails. Analysing…`);
  onProgress(15);

  let promos = 0, newsletters = 0;
  const unsubMap = {};
  const CHUNK    = 10;
  const total    = allIds.length;

  for (let i = 0; i < total; i += CHUNK) {
    const chunk   = allIds.slice(i, i + CHUNK);
    const details = await Promise.all(
      chunk.map((id) =>
        gmailFetch(
          // ✅ Added List-Unsubscribe to metadataHeaders
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}` +
          `?format=metadata` +
          `&metadataHeaders=From` +
          `&metadataHeaders=Subject` +
          `&metadataHeaders=List-Unsubscribe`,
          token
        )
      )
    );

    for (const msg of details) {
      const headers   = msg.payload?.headers || [];
      const from      = headers.find((h) => h.name === "From")?.value             || "";
      const subject   = headers.find((h) => h.name === "Subject")?.value          || "";
      const listUnsub = headers.find((h) => h.name === "List-Unsubscribe")?.value || "";
      const snippet   = msg.snippet || "";

      const { isNewsletter, isPromo, hasUnsub } = classify(from, subject, snippet);
      if (isNewsletter) newsletters++;
      if (isPromo)      promos++;

      if (hasUnsub || listUnsub) {
        const domain = from.match(/@([\w.-]+)/)?.[1] || from;
        if (!unsubMap[domain]) {
          unsubMap[domain] = {
            from,
            subject,
            domain,
            // ✅ Store the actual unsubscribe URL
            unsubUrl: extractUnsubUrl(listUnsub),
          };
        }
      }
    }

    const pct = 15 + Math.round(((i + CHUNK) / total) * 80);
    onProgress(Math.min(95, pct));
    onStatus(`Analysing… ${Math.min(i + CHUNK, total)} / ${total}`);
  }

  onProgress(100);
  onStatus("Scan complete!");

  const unsubList = Object.values(unsubMap).slice(0, 60);
  return {
    total,
    promos,
    newsletters,
    unsubCount: unsubList.length,
    unsubList,
    scannedAt:  new Date().toISOString(),
    userEmail:  JSON.parse(localStorage.getItem("detachx_user") || "{}").email || "",
  };
}

export default function ScanPage() {
  const navigate = useNavigate();
  const [status,   setStatus]   = useState("Initialising…");
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState(null);

  useEffect(() => { startScan(); }, []);

  async function startScan() {
    setError(null);
    setProgress(0);
    const token = localStorage.getItem("gmail_token");
    if (!token) { navigate("/login"); return; }
    localStorage.removeItem("scan_result");
    try {
      const result = await runGmailScan(token, setProgress, setStatus);
      localStorage.setItem("scan_result", JSON.stringify(result));
      setTimeout(() => navigate("/results"), 700);
    } catch (err) {
      if (err.message === "TOKEN_EXPIRED") {
        localStorage.removeItem("gmail_token");
        localStorage.removeItem("scan_result");
        navigate("/login");
      } else {
        setError("Something went wrong while scanning. Please try again.");
        console.error(err);
      }
    }
  }

  return (
    <>
      <style>{scanStyles}</style>
      <div className="scan-page">
        <div className="top-bar" />
        <div className="bg-x" aria-hidden="true">
          <svg viewBox="0 0 200 200" fill="none">
            <line x1="20" y1="20" x2="180" y2="180" stroke="#6C63FF" strokeWidth="14" strokeLinecap="round"/>
            <line x1="180" y1="20" x2="20"  y2="180" stroke="#6C63FF" strokeWidth="14" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="wordmark">Detach<span>X</span></div>
        <div className="scan-box">
          <div className="radar-wrap">
            <div className="radar-ring" />
            <div className="radar-ring" />
            <div className="radar-ring" />
            <div className="radar-core">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 4l16 16M20 4L4 20" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <h1 className="scan-title">Scanning your Gmail</h1>
          <p className="scan-status">{status}</p>
          <div className="progress-wrap">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          {error && (
            <>
              <p className="scan-error">{error}</p>
              <button className="retry-btn" onClick={startScan}>Try Again</button>
            </>
          )}
        </div>
        <p className="footer-note">© 2026 DetachX · All rights reserved</p>
      </div>
    </>
  );
}