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
  .radar-wrap { position: relative; width: 120px; height: 120px; }
  .radar-ring {
    position: absolute; inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(108,99,255,0.3);
    animation: radar-ping 2s ease-out infinite;
  }
  .radar-ring:nth-child(2) { animation-delay: 0.6s; }
  .radar-ring:nth-child(3) { animation-delay: 1.2s; }
  .radar-core {
    position: absolute; inset: 30px; border-radius: 50%;
    background: rgba(108,99,255,0.12);
    border: 1px solid rgba(108,99,255,0.4);
    display: flex; align-items: center; justify-content: center;
  }
  @keyframes radar-ping {
    0%   { transform: scale(0.6); opacity: 0.8; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  .scan-title {
    font-size: 1.4rem; font-weight: 700;
    letter-spacing: -0.02em; color: #F0EEE9; margin: 0;
  }
  .scan-status {
    font-size: 0.85rem; color: #6B6880; margin: 0; min-height: 1.4em;
  }
  .scan-phase {
    font-size: 0.72rem; color: #4A4860;
    background: #111118; border: 1px solid #1E1E2A;
    border-radius: 99px; padding: 0.25rem 0.85rem;
    letter-spacing: 0.04em;
  }
  .progress-wrap {
    width: 280px; height: 3px;
    background: #1E1E2A; border-radius: 99px; overflow: hidden;
  }
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #6C63FF, #A78BFA);
    border-radius: 99px; transition: width 0.5s ease;
  }
  .scan-error {
    color: #EF4444; font-size: 0.85rem;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 8px; padding: 0.75rem 1.25rem;
    max-width: 320px; text-align: center;
  }
  .retry-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.85rem; font-weight: 600; color: #6C63FF;
    background: rgba(108,99,255,0.08);
    border: 1px solid rgba(108,99,255,0.2);
    border-radius: 8px; padding: 0.6rem 1.25rem;
    cursor: pointer; transition: background 0.2s;
  }
  .retry-btn:hover { background: rgba(108,99,255,0.15); }
  .scan-page .footer-note {
    position: absolute; bottom: 2rem;
    font-size: 0.72rem; color: #6B6880;
    letter-spacing: 0.05em; z-index: 10;
  }
  @keyframes pulse-x {
    0%, 100% { opacity: 0.025; transform: scale(1); }
    50%       { opacity: 0.04;  transform: scale(1.04); }
  }
`;

// ── Classification signals ───────────────────────────────────────────────────
const NEWSLETTER_SIGNALS = [
  "newsletter","digest","weekly","monthly","daily update",
  "roundup","bulletin","dispatch","briefing","subscription",
];
const PROMO_SIGNALS = [
  "% off","discount","sale","deal","offer","coupon","promo",
  "limited time","flash sale","exclusive","free shipping",
  "save now","shop now","buy now","order now","claim your",
];

// ── Unsubscribe keywords to search in email BODY ─────────────────────────────
const BODY_UNSUB_KEYWORDS = [
  "unsubscribe",
  "manage preferences",
  "email preferences",
  "notification settings",
  "stop emails",
  "opt out",
  "opt-out",
  "mailing preferences",
  "manage notifications",
  "email settings",
  "update preferences",
  "communication preferences",
  "manage subscriptions",
  "remove me",
  "stop receiving",
  "no longer wish",
];

// ── Known sender patterns for major platforms ────────────────────────────────
// These senders almost always have unsub links even if header is missing
const KNOWN_MARKETING_DOMAINS = [
  "alibaba","amazon","linkedin","coursera","udemy","youtube",
  "netflix","spotify","twitter","facebook","instagram","reddit",
  "medium","substack","mailchimp","sendgrid","klaviyo","hubspot",
  "salesforce","marketo","constantcontact","campaignmonitor",
  "flipkart","myntra","swiggy","zomato","ola","uber","paytm",
  "phonepe","nykaa","meesho","ajio","tatacliq","snapdeal",
  "bankofamerica","chase","hdfc","icici","sbi","kotak","axis",
  "notion","figma","github","gitlab","atlassian","jira","slack",
  "zoom","webex","teams","dropbox","google","microsoft","apple",
];

function classify(from, subject, snippet) {
  const src = `${from} ${subject} ${snippet}`.toLowerCase();
  const isNewsletter = NEWSLETTER_SIGNALS.some((s) => src.includes(s));
  const isPromo      = !isNewsletter && PROMO_SIGNALS.some((s) => src.includes(s));
  const hasUnsub     = src.includes("unsubscribe");
  const isKnownMarketer = KNOWN_MARKETING_DOMAINS.some((d) =>
    from.toLowerCase().includes(d)
  );
  return { isNewsletter, isPromo, hasUnsub, isKnownMarketer };
}

// ── Extract URL from List-Unsubscribe header ─────────────────────────────────
function extractUnsubUrlFromHeader(headerValue) {
  if (!headerValue) return null;
  const parts = headerValue.split(",").map((s) => s.trim());
  for (const part of parts) {
    const match = part.match(/<(https?:\/\/[^>]+)>/i);
    if (match) return match[1];
  }
  for (const part of parts) {
    const match = part.match(/<(mailto:[^>]+)>/i);
    if (match) return match[1];
  }
  return null;
}

// ── Decode base64url Gmail body ──────────────────────────────────────────────
function decodeBase64(data) {
  if (!data) return "";
  try {
    // Gmail uses base64url — replace chars before decoding
    const fixed = data.replace(/-/g, "+").replace(/_/g, "/");
    return decodeURIComponent(
      atob(fixed)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    return "";
  }
}

// ── Recursively extract body parts from Gmail payload ───────────────────────
function extractBodyParts(payload) {
  const parts = [];
  function walk(node) {
    if (!node) return;
    if (node.body?.data) {
      parts.push({ mimeType: node.mimeType || "text/plain", data: node.body.data });
    }
    if (node.parts) node.parts.forEach(walk);
  }
  walk(payload);
  return parts;
}

// ── Extract unsubscribe URL from email HTML body ─────────────────────────────
function extractUnsubUrlFromBody(htmlBody) {
  if (!htmlBody) return null;

  // Find all anchor tags in HTML
  const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  const candidates = [];

  while ((match = anchorRegex.exec(htmlBody)) !== null) {
    const href    = match[1];
    const text    = match[2].replace(/<[^>]+>/g, "").toLowerCase().trim();
    const hrefLow = href.toLowerCase();

    // Skip mailto, javascript, anchors, trackers
    if (
      href.startsWith("#") ||
      href.startsWith("javascript") ||
      hrefLow.includes("track") ||
      hrefLow.includes("pixel") ||
      hrefLow.includes("open.php") ||
      hrefLow.includes("click.php")
    ) continue;

    const score = BODY_UNSUB_KEYWORDS.reduce((acc, kw) => {
      if (text.includes(kw))    return acc + 2; // link text match = stronger signal
      if (hrefLow.includes(kw.replace(/ /g, "-"))) return acc + 1;
      if (hrefLow.includes(kw.replace(/ /g, "")))  return acc + 1;
      return acc;
    }, 0);

    if (score > 0) candidates.push({ href, text, score });
  }

  if (candidates.length === 0) return null;

  // Return highest-scoring candidate
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].href;
}

// ── Plain-text fallback: find unsub URL in text emails ──────────────────────
function extractUnsubUrlFromText(textBody) {
  if (!textBody) return null;
  const lower = textBody.toLowerCase();

  for (const kw of BODY_UNSUB_KEYWORDS) {
    const idx = lower.indexOf(kw);
    if (idx === -1) continue;

    // Look for a URL near the keyword (within 300 chars)
    const slice = textBody.slice(Math.max(0, idx - 50), idx + 300);
    const urlMatch = slice.match(/https?:\/\/[^\s<>"']+/i);
    if (urlMatch) return urlMatch[0];
  }
  return null;
}

// ── Gmail API fetch with auth ────────────────────────────────────────────────
async function gmailFetch(url, token) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  if (!res.ok)            throw new Error(`API_ERROR_${res.status}`);
  return res.json();
}

// ── Fetch full message body for a single email ───────────────────────────────
async function fetchBodyUnsubUrl(messageId, token) {
  try {
    const msg = await gmailFetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      token
    );

    const bodyParts = extractBodyParts(msg.payload);

    // Prefer HTML part
    const htmlPart  = bodyParts.find((p) => p.mimeType === "text/html");
    const textPart  = bodyParts.find((p) => p.mimeType === "text/plain");

    if (htmlPart) {
      const html = decodeBase64(htmlPart.data);
      const url  = extractUnsubUrlFromBody(html);
      if (url) return url;
    }

    if (textPart) {
      const text = decodeBase64(textPart.data);
      const url  = extractUnsubUrlFromText(text);
      if (url) return url;
    }

    return null;
  } catch {
    return null; // never crash the whole scan for one email
  }
}

// ── Re-verify history: check if excluded domains still send emails ────────────
function checkStillReceiving(allMessages, historyDomains) {
  // allMessages = array of { from, domain }
  const stillReceiving = new Set();
  for (const msg of allMessages) {
    if (historyDomains.has(msg.domain)) {
      stillReceiving.add(msg.domain);
    }
  }
  return stillReceiving; // domains in history that are still sending
}

// ── Main scan orchestrator ───────────────────────────────────────────────────
async function runGmailScan(token, onProgress, onStatus, onPhase) {
  // Load history
  let history = [];
  try { history = JSON.parse(localStorage.getItem("detachx_unsub_history") || "[]"); }
  catch { history = []; }
  const historyDomains  = new Set(history.map((h) => h.domain));

  // ════════════════════════════════════════════
  // PASS 1 — Metadata scan (fast, 500 emails)
  // ════════════════════════════════════════════
  onPhase("Pass 1 of 2 — Metadata scan");
  onStatus("Connecting to Gmail…");
  onProgress(3);

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

  onStatus(`Found ${allIds.length} emails. Reading metadata…`);
  onProgress(10);

  let promos = 0, newsletters = 0;
  const candidateMap    = {}; // domain → candidate object
  const allSeenMessages = []; // for history re-verification
  const CHUNK           = 10;
  const total           = allIds.length;

  for (let i = 0; i < total; i += CHUNK) {
    const chunk   = allIds.slice(i, i + CHUNK);
    const details = await Promise.all(
      chunk.map((id) =>
        gmailFetch(
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
      const domain    = from.match(/@([\w.-]+)/)?.[1] || "";

      if (domain) allSeenMessages.push({ from, domain, id: msg.id });

      const { isNewsletter, isPromo, hasUnsub, isKnownMarketer } =
        classify(from, subject, snippet);

      if (isNewsletter) newsletters++;
      if (isPromo)      promos++;

      const headerUrl  = extractUnsubUrlFromHeader(listUnsub);
      const isCandidate =
        hasUnsub || listUnsub || isKnownMarketer || isNewsletter || isPromo;

      if (isCandidate && domain && !historyDomains.has(domain)) {
        if (!candidateMap[domain]) {
          candidateMap[domain] = {
            from, subject, domain,
            unsubUrl:   headerUrl,      // may be null — will be filled in Pass 2
            messageId:  msg.id,         // save for body fetch
            hasHeader:  !!headerUrl,
            needsBody:  !headerUrl,     // flag: needs body scan
          };
        } else if (!candidateMap[domain].unsubUrl && headerUrl) {
          candidateMap[domain].unsubUrl  = headerUrl;
          candidateMap[domain].hasHeader = true;
          candidateMap[domain].needsBody = false;
        }
      }
    }

    const pct = 10 + Math.round(((i + CHUNK) / total) * 40);
    onProgress(Math.min(50, pct));
    onStatus(`Reading metadata… ${Math.min(i + CHUNK, total)} / ${total}`);
  }

  // ════════════════════════════════════════════
  // PASS 2 — Body scan (only candidates without header URL)
  // ════════════════════════════════════════════
  const needsBodyScan = Object.values(candidateMap).filter((c) => c.needsBody);

  if (needsBodyScan.length > 0) {
    onPhase("Pass 2 of 2 — Deep body scan");
    onStatus(`Scanning email bodies for ${needsBodyScan.length} senders…`);
    onProgress(52);

    const BODY_CHUNK = 5; // smaller chunks — full body is heavier
    for (let i = 0; i < needsBodyScan.length; i += BODY_CHUNK) {
      const chunk = needsBodyScan.slice(i, i + BODY_CHUNK);
      const urls  = await Promise.all(
        chunk.map((c) => fetchBodyUnsubUrl(c.messageId, token))
      );
      chunk.forEach((c, idx) => {
        if (urls[idx]) {
          candidateMap[c.domain].unsubUrl  = urls[idx];
          candidateMap[c.domain].hasHeader = false; // came from body
        }
      });

      const pct = 52 + Math.round(((i + BODY_CHUNK) / needsBodyScan.length) * 38);
      onProgress(Math.min(90, pct));
      onStatus(
        `Deep scanning… ${Math.min(i + BODY_CHUNK, needsBodyScan.length)} / ${needsBodyScan.length} senders`
      );
    }
  } else {
    onPhase("Pass 2 of 2 — Deep body scan");
    onProgress(90);
    onStatus("All senders have header links — skipping body scan.");
    await new Promise((r) => setTimeout(r, 400));
  }

  // ════════════════════════════════════════════
  // Re-verify history senders
  // ════════════════════════════════════════════
  const stillReceiving = checkStillReceiving(allSeenMessages, historyDomains);

  onProgress(96);
  onStatus("Finalising results…");

  // Build final list — include senders even if no URL found (user should know)
  const unsubList = Object.values(candidateMap)
    .filter((c) => c.domain) // must have domain
    .slice(0, 80);

  onProgress(100);
  onStatus("Scan complete!");

  return {
    total:      total,
    promos,
    newsletters,
    unsubCount: unsubList.length,
    unsubList,
    stillReceiving: [...stillReceiving], // domains in history still sending emails
    scannedAt:  new Date().toISOString(),
    userEmail:  JSON.parse(localStorage.getItem("detachx_user") || "{}").email || "",
  };
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ScanPage() {
  const navigate        = useNavigate();
  const [status,   setStatus]   = useState("Initialising…");
  const [phase,    setPhase]    = useState("");
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState(null);

  useEffect(() => { startScan(); }, []);

  async function startScan() {
    setError(null);
    setProgress(0);
    setPhase("");
    const token = localStorage.getItem("gmail_token");
    if (!token) { navigate("/login"); return; }
    localStorage.removeItem("scan_result");
    try {
      const result = await runGmailScan(token, setProgress, setStatus, setPhase);

      // ── Smart history re-verification ──
      // If senders from history are still sending, flag them in history
      if (result.stillReceiving?.length > 0) {
        try {
          const history = JSON.parse(
            localStorage.getItem("detachx_unsub_history") || "[]"
          );
          const updated = history.map((h) =>
            result.stillReceiving.includes(h.domain)
              ? { ...h, stillReceiving: true }
              : { ...h, stillReceiving: false }
          );
          localStorage.setItem("detachx_unsub_history", JSON.stringify(updated));
        } catch { /* ignore */ }
      }

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
          {phase && <span className="scan-phase">{phase}</span>}
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