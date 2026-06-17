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
  .scan-title {
    font-size: 1.4rem; font-weight: 700;
    letter-spacing: -0.02em; color: #F0EEE9; margin: 0;
  }
  .scan-status { font-size: 0.85rem; color: #6B6880; margin: 0; min-height: 1.4em; }
  .scan-phase {
    font-size: 0.72rem; color: #4A4860; background: #111118;
    border: 1px solid #1E1E2A; border-radius: 99px;
    padding: 0.25rem 0.85rem; letter-spacing: 0.04em;
  }
  .scan-counter {
    font-size: 0.78rem; color: #6C63FF; font-weight: 600;
    background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.2);
    border-radius: 99px; padding: 0.3rem 1rem; letter-spacing: 0.02em;
  }
  .progress-wrap {
    width: 280px; height: 3px; background: #1E1E2A;
    border-radius: 99px; overflow: hidden;
  }
  .progress-bar {
    height: 100%; background: linear-gradient(90deg, #6C63FF, #A78BFA);
    border-radius: 99px; transition: width 0.4s ease;
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

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_EMAILS  = 5000; // ✅ Goal 1 — removed 500 limit
const PAGE_SIZE   = 50;   // Gmail API max per request
const META_CHUNK  = 10;   // Parallel metadata fetches
const BODY_CHUNK  = 5;    // Parallel body fetches (heavier)

// ── Classification signals ────────────────────────────────────────────────────
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function classify(from, subject, snippet) {
  const src             = `${from} ${subject} ${snippet}`.toLowerCase();
  const isNewsletter    = NEWSLETTER_SIGNALS.some((s) => src.includes(s));
  const isPromo         = !isNewsletter && PROMO_SIGNALS.some((s) => src.includes(s));
  const hasUnsub        = src.includes("unsubscribe");
  const isKnownMarketer = KNOWN_MARKETING_DOMAINS.some((d) => from.toLowerCase().includes(d));
  const isUnsubConfirm  = UNSUB_CONFIRMED_SIGNALS.some((s) => src.includes(s));
  return { isNewsletter, isPromo, hasUnsub, isKnownMarketer, isUnsubConfirm };
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
      atob(fixed)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
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
  let m;
  const cands = [];
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, "").toLowerCase().trim();
    const low  = href.toLowerCase();
    if (
      href.startsWith("#") ||
      href.startsWith("javascript") ||
      low.includes("track") ||
      low.includes("pixel")
    ) continue;
    const score = BODY_UNSUB_KEYWORDS.reduce((a, kw) => {
      if (text.includes(kw))                         return a + 2;
      if (low.includes(kw.replace(/ /g, "-")))       return a + 1;
      if (low.includes(kw.replace(/ /g, "")))        return a + 1;
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
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  if (!res.ok)            throw new Error(`API_ERROR_${res.status}`);
  return res.json();
}

async function fetchBodyUnsubUrl(messageId, token) {
  try {
    const msg   = await gmailFetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
      token
    );
    const parts = extractBodyParts(msg.payload);
    const html  = parts.find((p) => p.mimeType === "text/html");
    const txt   = parts.find((p) => p.mimeType === "text/plain");
    if (html) {
      const u = extractUnsubUrlFromBody(decodeBase64(html.data));
      if (u) return u;
    }
    if (txt) {
      const u = extractUnsubUrlFromText(decodeBase64(txt.data));
      if (u) return u;
    }
    return null;
  } catch { return null; }
}

function loadExcludedDomains() {
  const set = new Set();
  try {
    JSON.parse(localStorage.getItem("detachx_unsub_history") || "[]")
      .forEach((h) => set.add(h.domain));
  } catch {}
  try {
    JSON.parse(localStorage.getItem("detachx_block_history") || "[]")
      .forEach((h) => set.add(h.domain));
  } catch {}
  return set;
}

// ── Main scan function ────────────────────────────────────────────────────────
async function runGmailScan(token, onProgress, onStatus, onPhase, onCounter) {
  const excluded = loadExcludedDomains();

  // Load unsub history for verification
  let unsubHistory = [];
  try {
    unsubHistory = JSON.parse(localStorage.getItem("detachx_unsub_history") || "[]");
  } catch {}

  // Only verify domains not yet confirmed
  const unsubDomainMap = {};
  unsubHistory.forEach((h) => {
    if ((h.verificationStatus || "pending") !== "confirmed") {
      unsubDomainMap[h.domain] = h;
    }
  });
  const unsubDomainsToVerify = new Set(Object.keys(unsubDomainMap));

  // ════════════════════════════════════════════════════════
  // PHASE 1 — Paginated ID fetch (Goal 1)
  // ════════════════════════════════════════════════════════
  onPhase("Phase 1 — Fetching email list");
  onStatus("Connecting to Gmail…");
  onProgress(2);

  let pageToken = null;
  let allIds    = [];

  // ✅ Goal 1: paginate until no nextPageToken OR MAX_EMAILS reached
  while (allIds.length < MAX_EMAILS) {
    const params = new URLSearchParams({ maxResults: PAGE_SIZE });
    if (pageToken) params.set("pageToken", pageToken);

    const data = await gmailFetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
      token
    );

    if (!data.messages?.length) break;

    allIds     = allIds.concat(data.messages.map((m) => m.id));
    pageToken  = data.nextPageToken;

    // ✅ Goal 1: live counter during pagination
    onCounter(`${allIds.length.toLocaleString()} emails loaded`);
    onStatus(`Fetching emails… ${allIds.length.toLocaleString()} loaded`);

    if (!pageToken) break; // No more pages
  }

  const total = allIds.length;
  onCounter(`${total.toLocaleString()} emails found`);
  onStatus(`Found ${total.toLocaleString()} emails. Reading metadata…`);
  onProgress(8);

  // ════════════════════════════════════════════════════════
  // PHASE 2 — Metadata scan + frequency tracking (Goals 2 & 3)
  // ════════════════════════════════════════════════════════
  onPhase("Phase 2 — Analysing senders");

  let promos = 0, newsletters = 0;

  // candidateMap: domain → candidate data
  const candidateMap = {};

  // ✅ Goal 2: frequency map — domain → { count, firstReceived, lastReceived }
  const frequencyMap = {};

  // Verification tracking
  const verificationMap = {};

  for (let i = 0; i < total; i += META_CHUNK) {
    const chunk   = allIds.slice(i, i + META_CHUNK);
    const details = await Promise.all(
      chunk.map((id) =>
        gmailFetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}` +
          `?format=metadata` +
          `&metadataHeaders=From` +
          `&metadataHeaders=Subject` +
          `&metadataHeaders=List-Unsubscribe` +
          `&metadataHeaders=Date`,
          token
        )
      )
    );

    for (const msg of details) {
      const headers   = msg.payload?.headers || [];
      const from      = headers.find((h) => h.name === "From")?.value             || "";
      const subject   = headers.find((h) => h.name === "Subject")?.value          || "";
      const listUnsub = headers.find((h) => h.name === "List-Unsubscribe")?.value || "";
      const dateHdr   = headers.find((h) => h.name === "Date")?.value             || "";
      const snippet   = msg.snippet || "";
      const domain    = from.match(/@([\w.-]+)/)?.[1] || "";
      const emailDate = dateHdr ? new Date(dateHdr) : null;

      const {
        isNewsletter, isPromo, hasUnsub, isKnownMarketer, isUnsubConfirm,
      } = classify(from, subject, snippet);

      if (isNewsletter) newsletters++;
      if (isPromo)      promos++;

      // ✅ Goal 2: frequency tracking for ALL marketing/unsub senders
      const isMarketingEmail =
        isNewsletter || isPromo || hasUnsub || isKnownMarketer;

      if (domain && isMarketingEmail) {
        if (!frequencyMap[domain]) {
          frequencyMap[domain] = { count: 0, firstReceived: null, lastReceived: null };
        }
        frequencyMap[domain].count++;

        if (emailDate) {
          const fd = frequencyMap[domain];
          if (!fd.firstReceived || emailDate < new Date(fd.firstReceived)) {
            fd.firstReceived = emailDate.toISOString();
          }
          if (!fd.lastReceived || emailDate > new Date(fd.lastReceived)) {
            fd.lastReceived = emailDate.toISOString();
          }
        }
      }

      // ── Verification check ─────────────────────────────────────────────────
      if (domain && unsubDomainsToVerify.has(domain)) {
        const histEntry    = unsubDomainMap[domain];
        const unsubAt      = histEntry?.at ? new Date(histEntry.at) : null;
        const isAfterUnsub = unsubAt && emailDate && emailDate > unsubAt;

        if (isAfterUnsub) {
          if (!verificationMap[domain]) {
            verificationMap[domain] = { stillReceiving: false, confirmed: false };
          }
          if (isUnsubConfirm) {
            verificationMap[domain].confirmed = true;
          } else if (isNewsletter || isPromo || isKnownMarketer || hasUnsub) {
            verificationMap[domain].stillReceiving = true;
          }
        }
      }

      // ── Active candidate detection ─────────────────────────────────────────
      const headerUrl   = extractUnsubUrlFromHeader(listUnsub);
      const isCandidate = hasUnsub || listUnsub || isKnownMarketer || isNewsletter || isPromo;

      if (isCandidate && domain && !excluded.has(domain)) {
        if (!candidateMap[domain]) {
          candidateMap[domain] = {
            from,
            subject,
            domain,
            unsubUrl:  headerUrl,
            messageId: msg.id,
            needsBody: !headerUrl,
          };
        } else if (!candidateMap[domain].unsubUrl && headerUrl) {
          // Better URL found for existing candidate
          candidateMap[domain].unsubUrl  = headerUrl;
          candidateMap[domain].needsBody = false;
        }
      }
    }

    // ✅ Progress: phase 2 takes 8% → 55%
    const pct = 8 + Math.round(((i + META_CHUNK) / total) * 47);
    onProgress(Math.min(55, pct));
    onStatus(`Analysing senders… ${Math.min(i + META_CHUNK, total).toLocaleString()} / ${total.toLocaleString()}`);
    onCounter(`${Object.keys(candidateMap).length} candidates found`);
  }

  // ════════════════════════════════════════════════════════
  // PHASE 3 — Deep body scan for candidates without header URL
  // ════════════════════════════════════════════════════════
  const needsBody = Object.values(candidateMap).filter((c) => c.needsBody);

  onPhase("Phase 3 — Deep body scan");

  if (needsBody.length > 0) {
    onStatus(`Deep scanning ${needsBody.length} senders for unsub links…`);
    onProgress(57);
    onCounter(`${needsBody.length} senders need deep scan`);

    for (let i = 0; i < needsBody.length; i += BODY_CHUNK) {
      const chunk = needsBody.slice(i, i + BODY_CHUNK);
      const urls  = await Promise.all(
        chunk.map((c) => fetchBodyUnsubUrl(c.messageId, token))
      );
      chunk.forEach((c, idx) => {
        if (urls[idx]) {
          candidateMap[c.domain].unsubUrl  = urls[idx];
          candidateMap[c.domain].needsBody = false;
        }
      });
      const pct = 57 + Math.round(((i + BODY_CHUNK) / needsBody.length) * 33);
      onProgress(Math.min(90, pct));
      onStatus(
        `Deep scanning… ${Math.min(i + BODY_CHUNK, needsBody.length)} / ${needsBody.length}`
      );
    }
  } else {
    onProgress(90);
    onStatus("All candidates have header links — skipping body scan.");
    await new Promise((r) => setTimeout(r, 300));
  }

  // ════════════════════════════════════════════════════════
  // PHASE 4 — Apply verification results
  // ════════════════════════════════════════════════════════
  onPhase("Phase 4 — Finalising");
  onStatus("Applying verification results…");
  onProgress(92);

  const userEmail = JSON.parse(localStorage.getItem("detachx_user") || "{}").email || "";

  if (Object.keys(verificationMap).length > 0) {
    const updatedHistory = unsubHistory.map((entry) => {
      const v = verificationMap[entry.domain];
      if (!v) return entry;
      let newStatus = entry.verificationStatus || "pending";
      if (v.confirmed)           newStatus = "confirmed";
      else if (v.stillReceiving) newStatus = "still_receiving";
      return { ...entry, verificationStatus: newStatus };
    });

    localStorage.setItem("detachx_unsub_history", JSON.stringify(updatedHistory));

    // Sync to Supabase
    if (userEmail) {
      for (const [domain, v] of Object.entries(verificationMap)) {
        const newStatus = v.confirmed
          ? "confirmed"
          : v.stillReceiving
          ? "still_receiving"
          : "pending";
        await updateUnsubVerification(userEmail, domain, newStatus, v.stillReceiving);
      }
    }
    console.log("[DetachX] verification results:", verificationMap);
  }

  // ════════════════════════════════════════════════════════
  // PHASE 5 — Build enriched + sorted result (Goals 3 & 4)
  // ════════════════════════════════════════════════════════
  onStatus("Building results…");
  onProgress(96);

  // ✅ Goal 3: Enrich each candidate with frequency data
  const unsubList = Object.values(candidateMap).map((candidate) => {
    const freq = frequencyMap[candidate.domain] || {};
    return {
      from:          candidate.from,
      subject:       candidate.subject,
      domain:        candidate.domain,
      unsubUrl:      candidate.unsubUrl || null,
      // ✅ Goal 3: new enriched fields
      emailCount:    freq.count         || 1,
      lastReceived:  freq.lastReceived  || null,
      firstReceived: freq.firstReceived || null,
    };
  });

  // ✅ Goal 4: Sort by emailCount descending — highest volume first
  unsubList.sort((a, b) => b.emailCount - a.emailCount);

  // Cap at 100 results (sorted by frequency — most annoying first)
  const finalList = unsubList.slice(0, 100);

  onProgress(100);
  onStatus("Scan complete!");
  onCounter(`${finalList.length} senders found`);

  console.log("[DetachX] scan complete:", {
    total,
    candidates: finalList.length,
    topSender:  finalList[0]?.domain,
    topCount:   finalList[0]?.emailCount,
  });

  return {
    total,
    promos,
    newsletters,
    unsubCount: finalList.length,
    unsubList:  finalList,
    scannedAt:  new Date().toISOString(),
    userEmail:  userEmail,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ScanPage({ session }) {
  const navigate = useNavigate();
  const [status,   setStatus]   = useState("Initialising…");
  const [phase,    setPhase]    = useState("");
  const [progress, setProgress] = useState(0);
  const [counter,  setCounter]  = useState("");  // ✅ live counter
  const [error,    setError]    = useState(null);

  useEffect(() => { startScan(); }, []);

  async function startScan() {
    setError(null);
    setProgress(0);
    setPhase("");
    setCounter("");

    const token = localStorage.getItem("gmail_token");
    if (!token) { navigate("/login"); return; }

    localStorage.removeItem("scan_result");

    try {
      const result = await runGmailScan(
        token,
        setProgress,
        setStatus,
        setPhase,
        setCounter  // ✅ pass counter setter
      );
      localStorage.setItem("scan_result", JSON.stringify(result));
      setTimeout(() => navigate("/results"), 700);
    } catch (err) {
      if (err.message === "TOKEN_EXPIRED") {
        localStorage.removeItem("gmail_token");
        localStorage.removeItem("scan_result");
        navigate("/login");
      } else {
        setError("Something went wrong. Please try again.");
        console.error("[DetachX] scan error:", err);
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

          {/* Phase label */}
          {phase && <span className="scan-phase">{phase}</span>}

          {/* Status message */}
          <p className="scan-status">{status}</p>

          {/* ✅ Live counter — emails loaded / candidates found */}
          {counter && <span className="scan-counter">{counter}</span>}

          {/* Progress bar */}
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