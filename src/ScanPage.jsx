import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUnsubVerification } from "./lib/cloudStorage";

const scanStyles = `
  .scan-page {
    position: relative; min-height: 100dvh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 2rem; overflow: hidden;
    background: #0A0A0F; font-family: 'Space Grotesk', sans-serif;
  }
  .scan-page::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, #0A0A0F 100%);
    z-index: 1; pointer-events: none;
  }
  .scan-page .bg-x {
    position: absolute; inset: 0; display: flex;
    align-items: center; justify-content: center;
    pointer-events: none; z-index: 0;
  }
  .scan-page .bg-x svg {
    width: min(70vw, 600px); height: min(70vw, 600px);
    opacity: 0.025; animation: pulse-x 6s ease-in-out infinite;
  }
  .scan-page .top-bar {
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent);
    z-index: 10;
  }
  .scan-page .wordmark {
    position: absolute; top: 2rem; font-size: 1rem;
    font-weight: 600; letter-spacing: 0.08em; color: #F0EEE9; z-index: 10;
  }
  .scan-page .wordmark span { color: #6C63FF; }
  .scan-box {
    position: relative; z-index: 10; display: flex;
    flex-direction: column; align-items: center; gap: 1.5rem; text-align: center;
  }
  .radar-wrap { position: relative; width: 120px; height: 120px; }
  .radar-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 1px solid rgba(108,99,255,0.3);
    animation: radar-ping 2s ease-out infinite;
  }
  .radar-ring:nth-child(2) { animation-delay: 0.6s; }
  .radar-ring:nth-child(3) { animation-delay: 1.2s; }
  .radar-core {
    position: absolute; inset: 30px; border-radius: 50%;
    background: rgba(108,99,255,0.12); border: 1px solid rgba(108,99,255,0.4);
    display: flex; align-items: center; justify-content: center;
  }
  @keyframes radar-ping {
    0%   { transform: scale(0.6); opacity: 0.8; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  .scan-title { font-size: 1.4rem; font-weight: 700; letter-spacing: -0.02em; color: #F0EEE9; margin: 0; }
  .scan-status { font-size: 0.85rem; color: #6B6880; margin: 0; min-height: 1.4em; }
  .scan-phase {
    font-size: 0.72rem; color: #4A4860; background: #111118;
    border: 1px solid #1E1E2A; border-radius: 99px;
    padding: 0.25rem 0.85rem; letter-spacing: 0.04em;
  }
  .progress-wrap { width: 280px; height: 3px; background: #1E1E2A; border-radius: 99px; overflow: hidden; }
  .progress-bar {
    height: 100%; background: linear-gradient(90deg, #6C63FF, #A78BFA);
    border-radius: 99px; transition: width 0.5s ease;
  }
  .scan-error {
    color: #EF4444; font-size: 0.85rem; background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2); border-radius: 8px;
    padding: 0.75rem 1.25rem; max-width: 320px; text-align: center;
  }
  .retry-btn {
    font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem; font-weight: 600;
    color: #6C63FF; background: rgba(108,99,255,0.08);
    border: 1px solid rgba(108,99,255,0.2); border-radius: 8px;
    padding: 0.6rem 1.25rem; cursor: pointer; transition: background 0.2s;
  }
  .retry-btn:hover { background: rgba(108,99,255,0.15); }
  .scan-page .footer-note {
    position: absolute; bottom: 2rem; font-size: 0.72rem;
    color: #6B6880; letter-spacing: 0.05em; z-index: 10;
  }
  @keyframes pulse-x {
    0%, 100% { opacity: 0.025; transform: scale(1); }
    50%       { opacity: 0.04;  transform: scale(1.04); }
  }
`;

const NEWSLETTER_SIGNALS = [
  "newsletter","digest","weekly","monthly","daily update",
  "roundup","bulletin","dispatch","briefing","subscription",
];
const PROMO_SIGNALS = [
  "% off","discount","sale","deal","offer","coupon","promo",
  "limited time","flash sale","exclusive","free shipping",
  "save now","shop now","buy now","order now","claim your",
];
const BODY_UNSUB_KEYWORDS = [
  "unsubscribe","manage preferences","email preferences",
  "notification settings","stop emails","opt out","opt-out",
  "mailing preferences","manage notifications","email settings",
  "update preferences","communication preferences",
  "manage subscriptions","remove me","stop receiving","no longer wish",
];
const KNOWN_MARKETING_DOMAINS = [
  "alibaba","amazon","linkedin","coursera","udemy","youtube",
  "netflix","spotify","twitter","facebook","instagram","reddit",
  "medium","substack","mailchimp","sendgrid","klaviyo","hubspot",
  "salesforce","marketo","constantcontact","flipkart","myntra",
  "swiggy","zomato","ola","uber","paytm","phonepe","nykaa",
  "meesho","ajio","hdfc","icici","sbi","kotak","axis",
  "notion","figma","github","gitlab","atlassian","slack",
  "zoom","dropbox","google","microsoft","apple","aws","adobe",
];
const UNSUB_CONFIRMED_SIGNALS = [
  "you have been unsubscribed",
  "you've been unsubscribed",
  "successfully unsubscribed",
  "unsubscribe successful",
  "subscription cancelled",
  "subscription canceled",
  "preferences updated",
  "email preferences changed",
  "email preferences updated",
  "you will no longer receive",
  "you'll no longer receive",
  "removed from our list",
  "removed from our mailing list",
  "opt-out confirmed",
  "opt out confirmed",
  "we've removed you",
  "we have removed you",
];

function classify(from, subject, snippet) {
  const src = `${from} ${subject} ${snippet}`.toLowerCase();
  const isNewsletter       = NEWSLETTER_SIGNALS.some((s) => src.includes(s));
  const isPromo            = !isNewsletter && PROMO_SIGNALS.some((s) => src.includes(s));
  const hasUnsub           = src.includes("unsubscribe");
  const isKnownMarketer    = KNOWN_MARKETING_DOMAINS.some((d) => from.toLowerCase().includes(d));
  const isUnsubConfirmation = UNSUB_CONFIRMED_SIGNALS.some((s) => src.includes(s));
  return { isNewsletter, isPromo, hasUnsub, isKnownMarketer, isUnsubConfirmation };
}

function extractUnsubUrlFromHeader(headerValue) {
  if (!headerValue) return null;
  const parts = headerValue.split(",").map((s) => s.trim());
  for (const part of parts) {
    const m = part.match(/<(https?:\/\/[^>]+)>/i);
    if (m) return m[1];
  }
  for (const part of parts) {
    const m = part.match(/<(mailto:[^>]+)>/i);
    if (m) return m[1];
  }
  return null;
}

function decodeBase64(data) {
  if (!data) return "";
  try {
    const fixed = data.replace(/-/g, "+").replace(/_/g, "/");
    return decodeURIComponent(
      atob(fixed).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
  } catch { return ""; }
}

function extractBodyParts(payload) {
  const parts = [];
  function walk(node) {
    if (!node) return;
    if (node.body?.data) parts.push({ mimeType: node.mimeType || "text/plain", data: node.body.data });
    if (node.parts) node.parts.forEach(walk);
  }
  walk(payload);
  return parts;
}

function extractUnsubUrlFromBody(html) {
  if (!html) return null;
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m; const cands = [];
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, "").toLowerCase().trim();
    const low  = href.toLowerCase();
    if (href.startsWith("#") || href.startsWith("javascript") ||
        low.includes("track") || low.includes("pixel")) continue;
    const score = BODY_UNSUB_KEYWORDS.reduce((a, kw) => {
      if (text.includes(kw)) return a + 2;
      if (low.includes(kw.replace(/ /g, "-"))) return a + 1;
      if (low.includes(kw.replace(/ /g, "")))  return a + 1;
      return a;
    }, 0);
    if (score > 0) cands.push({ href, score });
  }
  if (!cands.length) return null;
  cands.sort((a, b) => b.score - a.score);
  return cands[0].href;
}

function extractUnsubUrlFromText(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const kw of BODY_UNSUB_KEYWORDS) {
    const idx = lower.indexOf(kw);
    if (idx === -1) continue;
    const slice = text.slice(Math.max(0, idx - 50), idx + 300);
    const u = slice.match(/https?:\/\/[^\s<>"']+/i);
    if (u) return u[0];
  }
  return null;
}

async function gmailFetch(url, token) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  if (!res.ok)            throw new Error(`API_ERROR_${res.status}`);
  return res.json();
}

async function fetchBodyUnsubUrl(messageId, token) {
  try {
    const msg   = await gmailFetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, token
    );
    const parts = extractBodyParts(msg.payload);
    const html  = parts.find((p) => p.mimeType === "text/html");
    const txt   = parts.find((p) => p.mimeType === "text/plain");
    if (html) { const u = extractUnsubUrlFromBody(decodeBase64(html.data)); if (u) return u; }
    if (txt)  { const u = extractUnsubUrlFromText(decodeBase64(txt.data));  if (u) return u; }
    return null;
  } catch { return null; }
}

function loadExcludedDomains() {
  const set = new Set();
  try { JSON.parse(localStorage.getItem("detachx_unsub_history") || "[]").forEach((h) => set.add(h.domain)); } catch {}
  try { JSON.parse(localStorage.getItem("detachx_block_history") || "[]").forEach((h) => set.add(h.domain)); } catch {}
  return set;
}

async function runGmailScan(token, onProgress, onStatus, onPhase) {
  const excluded = loadExcludedDomains();

  let unsubHistory = [];
  try { unsubHistory = JSON.parse(localStorage.getItem("detachx_unsub_history") || "[]"); } catch {}

  // Only verify domains that are not already confirmed
  const unsubDomainMap = {};
  unsubHistory.forEach((h) => {
    if ((h.verificationStatus || "pending") !== "confirmed") {
      unsubDomainMap[h.domain] = h;
    }
  });
  const unsubDomainsToVerify = new Set(Object.keys(unsubDomainMap));

  onPhase("Pass 1 of 2 — Metadata scan");
  onStatus("Connecting to Gmail…");
  onProgress(3);

  const MAX = 500, BATCH = 50;
  let pageToken = null, allIds = [];
  while (allIds.length < MAX) {
    const params = new URLSearchParams({ maxResults: BATCH });
    if (pageToken) params.set("pageToken", pageToken);
    const data = await gmailFetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`, token
    );
    if (!data.messages?.length) break;
    allIds = allIds.concat(data.messages.map((m) => m.id));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  onStatus(`Found ${allIds.length} emails. Reading metadata…`);
  onProgress(10);

  let promos = 0, newsletters = 0;
  const candidateMap   = {};
  const verificationMap = {};
  const CHUNK = 10, total = allIds.length;

  for (let i = 0; i < total; i += CHUNK) {
    const chunk   = allIds.slice(i, i + CHUNK);
    const details = await Promise.all(
      chunk.map((id) =>
        gmailFetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}` +
          `?format=metadata&metadataHeaders=From&metadataHeaders=Subject` +
          `&metadataHeaders=List-Unsubscribe&metadataHeaders=Date`,
          token
        )
      )
    );

    for (const msg of details) {
      const headers   = msg.payload?.headers || [];
      const from      = headers.find((h) => h.name === "From")?.value             || "";
      const subject   = headers.find((h) => h.name === "Subject")?.value          || "";
      const listUnsub = headers.find((h) => h.name === "List-Unsubscribe")?.value || "";

    console.log("FROM:",from);
    console.log("LIST_UNSUB:",listUnsub);

      const dateHdr   = headers.find((h) => h.name === "Date")?.value             || "";
      const snippet   = msg.snippet || "";
      const domain    = from.match(/@([\w.-]+)/)?.[1] || "";

      const { isNewsletter, isPromo, hasUnsub, isKnownMarketer, isUnsubConfirmation } =
        classify(from, subject, snippet);

      if (isNewsletter) newsletters++;
      if (isPromo)      promos++;

      // ── Verification check ────────────────────────────────────────────────
      if (domain && unsubDomainsToVerify.has(domain)) {
        const histEntry = unsubDomainMap[domain];
        const unsubAt   = histEntry?.at ? new Date(histEntry.at) : null;
        const emailDate = dateHdr ? new Date(dateHdr) : null;
        const isAfterUnsub = unsubAt && emailDate && emailDate > unsubAt;

        if (isAfterUnsub) {
          if (!verificationMap[domain]) {
            verificationMap[domain] = { stillReceiving: false, confirmed: false };
          }
          if (isUnsubConfirmation) {
            verificationMap[domain].confirmed = true;
          } else if (isNewsletter || isPromo || isKnownMarketer || hasUnsub) {
            verificationMap[domain].stillReceiving = true;
          }
        }
      }

      // ── Active candidates ─────────────────────────────────────────────────
      const headerUrl   = extractUnsubUrlFromHeader(listUnsub);
      const isCandidate = hasUnsub || listUnsub || isKnownMarketer || isNewsletter || isPromo;

      if (isCandidate && domain && !excluded.has(domain)) {
        if (!candidateMap[domain]) {
          candidateMap[domain] = {
            from, subject, domain,
            unsubUrl:  headerUrl,
            messageId: msg.id,
            needsBody: !headerUrl,
          };
        } else if (!candidateMap[domain].unsubUrl && headerUrl) {
          candidateMap[domain].unsubUrl  = headerUrl;
          candidateMap[domain].needsBody = false;
        }
      }
    }

    const pct = 10 + Math.round(((i + CHUNK) / total) * 40);
    onProgress(Math.min(50, pct));
    onStatus(`Reading metadata… ${Math.min(i + CHUNK, total)} / ${total}`);
  }

  // Pass 2 — body scan
  const needsBody = Object.values(candidateMap).filter((c) => c.needsBody);
  onPhase("Pass 2 of 2 — Deep body scan");
  if (needsBody.length > 0) {
    onStatus(`Deep scanning ${needsBody.length} senders…`);
    onProgress(52);
    const BC = 5;
    for (let i = 0; i < needsBody.length; i += BC) {
      const chunk = needsBody.slice(i, i + BC);
      const urls  = await Promise.all(chunk.map((c) => fetchBodyUnsubUrl(c.messageId, token)));
      chunk.forEach((c, idx) => {
        if (urls[idx]) {
          candidateMap[c.domain].unsubUrl  = urls[idx];
          candidateMap[c.domain].needsBody = false;
        }
      });
      onProgress(Math.min(90, 52 + Math.round(((i + BC) / needsBody.length) * 38)));
      onStatus(`Deep scanning… ${Math.min(i + BC, needsBody.length)} / ${needsBody.length}`);
    }
  } else {
    onProgress(90);
    onStatus("Header links found — skipping body scan.");
    await new Promise((r) => setTimeout(r, 300));
  }

  // ── Apply verification results ────────────────────────────────────────────
if (Object.keys(verificationMap).length > 0) {
  const userEmail = JSON.parse(localStorage.getItem("detachx_user") || "{}").email || "";

  const updatedHistory = unsubHistory.map((entry) => {
    const v = verificationMap[entry.domain];
    if (!v) return entry;
    let newStatus = entry.verificationStatus || "pending";
    if (v.confirmed)           newStatus = "confirmed";
    else if (v.stillReceiving) newStatus = "still_receiving";
    return { ...entry, verificationStatus: newStatus };
  });

  // ✅ Update localStorage cache
  localStorage.setItem("detachx_unsub_history", JSON.stringify(updatedHistory));

  // ✅ Sync changed entries to Supabase
  if (userEmail) {
    for (const [domain, v] of Object.entries(verificationMap)) {
      const newStatus = v.confirmed ? "confirmed"
        : v.stillReceiving ? "still_receiving"
        : "pending";
      await updateUnsubVerification(userEmail, domain, newStatus, v.stillReceiving);
    }
  }

  console.log("[DetachX] verification results:", verificationMap);
}

  onProgress(100);
  onStatus("Scan complete!");

  const unsubList = Object.values(candidateMap).slice(0, 80);
  return {
    total, promos, newsletters,
    unsubCount: unsubList.length,
    unsubList,
    scannedAt: new Date().toISOString(),
    userEmail: JSON.parse(localStorage.getItem("detachx_user") || "{}").email || "",
  };
}

export default function ScanPage() {
  const navigate = useNavigate();
  const [status,   setStatus]   = useState("Initialising…");
  const [phase,    setPhase]    = useState("");
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState(null);

  useEffect(() => { startScan(); }, []);

  async function startScan() {
    setError(null); setProgress(0); setPhase("");
    const token = localStorage.getItem("gmail_token");
    if (!token) { navigate("/login"); return; }
    localStorage.removeItem("scan_result");
    try {
      const result = await runGmailScan(token, setProgress, setStatus, setPhase);
      localStorage.setItem("scan_result", JSON.stringify(result));
      setTimeout(() => navigate("/results"), 700);
    } catch (err) {
      if (err.message === "TOKEN_EXPIRED") {
        localStorage.removeItem("gmail_token");
        localStorage.removeItem("scan_result");
        navigate("/login");
      } else {
        setError("Something went wrong. Please try again.");
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
            <div className="radar-ring" /><div className="radar-ring" /><div className="radar-ring" />
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