import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const S = `
  * { box-sizing: border-box; }
  .rp { position: relative; min-height: 100dvh; background: #0A0A0F; font-family: 'Space Grotesk', sans-serif; color: #F0EEE9; padding: 0 0 6rem; overflow-x: hidden; }
  .rp .top-bar { height: 1px; background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent); }
  .rnav { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 2.5rem; border-bottom: 1px solid #1E1E2A; }
  .rnav .wm { font-size: 1rem; font-weight: 600; letter-spacing: 0.08em; color: #F0EEE9; }
  .rnav .wm span { color: #6C63FF; }
  .rnav .nr { display: flex; align-items: center; gap: 0.75rem; }
  .rnav img { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #2A2A38; object-fit: cover; }
  .rnav .ne { font-size: 0.78rem; color: #6B6880; }
  .nbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 500; color: #4A4860; background: none; border: 1px solid #1E1E2A; border-radius: 6px; padding: 0.35rem 0.85rem; cursor: pointer; transition: color 0.2s, border-color 0.2s; }
  .nbtn:hover { color: #6B6880; border-color: #2A2A38; }
  .hero { text-align: center; padding: 3.5rem 2rem 0.5rem; animation: fu 0.5s ease forwards; }
  .hbadge { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6C63FF; background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2); border-radius: 99px; padding: 0.35rem 1rem; margin-bottom: 1.25rem; }
  .hero h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 0.6rem; }
  .hero p  { font-size: 0.9rem; color: #6B6880; font-weight: 300; margin: 0; }
  .smeta   { font-size: 0.72rem; color: #4A4860; margin-top: 0.5rem; }
  .sgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 1rem; max-width: 900px; margin: 2.5rem auto 0; padding: 0 2rem; animation: fu 0.5s ease 0.1s both; }
  .scard { background: #111118; border: 1px solid #1E1E2A; border-radius: 14px; padding: 1.5rem 1.5rem 1.25rem; position: relative; overflow: hidden; transition: border-color 0.2s, transform 0.2s; }
  .scard:hover { border-color: #2A2A38; transform: translateY(-2px); }
  .scard .ac { position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 2px 2px 0 0; }
  .sico { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
  .slbl { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #4A4860; margin-bottom: 0.35rem; }
  .sval { font-size: 2.4rem; font-weight: 700; letter-spacing: -0.04em; color: #F0EEE9; line-height: 1; margin-bottom: 0.25rem; }
  .ssub { font-size: 0.73rem; color: #6B6880; font-weight: 300; }
  .sec { max-width: 900px; margin: 3rem auto 0; padding: 0 2rem; animation: fu 0.5s ease 0.2s both; }
  .shead { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
  .stitle { font-size: 0.95rem; font-weight: 600; color: #F0EEE9; display: flex; align-items: center; gap: 0.5rem; }
  .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
  .tab { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 99px; border: 1px solid #2A2A38; background: transparent; color: #6B6880; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem; }
  .tab:hover { color: #F0EEE9; border-color: #444; }
  .tab.active         { background: rgba(108,99,255,0.12); border-color: rgba(108,99,255,0.35); color: #A89DFF; }
  .tab.t-green.active { background: rgba(34,197,94,0.1);   border-color: rgba(34,197,94,0.3);   color: #4ade80; }
  .tab.t-red.active   { background: rgba(239,68,68,0.1);   border-color: rgba(239,68,68,0.3);   color: #f87171; }
  .tab-count { font-size: 0.7rem; background: rgba(255,255,255,0.06); border-radius: 99px; padding: 0.1rem 0.5rem; }
  .btbar { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; }
  .bbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; border-radius: 7px; padding: 0.38rem 0.9rem; border: 1px solid; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
  .bbtn.sa { color: #6C63FF; background: rgba(108,99,255,0.08); border-color: rgba(108,99,255,0.22); }
  .bbtn.sa:hover { background: rgba(108,99,255,0.16); }
  .bbtn.cl { color: #6B6880; background: transparent; border-color: #2A2A38; }
  .bbtn.cl:hover { color: #F0EEE9; border-color: #444; }
  .bbtn.us { color: #fff; background: #6C63FF; border-color: #6C63FF; }
  .bbtn.us:hover { background: #7C73FF; }
  .bbtn.us:disabled { opacity: 0.4; cursor: not-allowed; }
  .sc { font-size: 0.75rem; margin-left: 0.1rem; }
  .ulist { display: flex; flex-direction: column; gap: 0.5rem; }
  .urow { display: flex; align-items: center; gap: 0.85rem; background: #111118; border: 1px solid #1E1E2A; border-radius: 10px; padding: 0.85rem 1.1rem; transition: border-color 0.2s, background 0.2s; }
  .urow:hover:not(.done) { border-color: #2A2A38; }
  .urow.sel    { border-color: rgba(108,99,255,0.35); background: rgba(108,99,255,0.04); }
  .urow.done   { opacity: 0.55; }
  .urow.done-u { background: #0D150D; border-color: rgba(34,197,94,0.15); }
  .urow.done-b { background: #150D0D; border-color: rgba(239,68,68,0.15); }
  .urow.invalid-b { background: #1A1208; border-color: rgba(245,158,11,0.2); opacity: 0.5; }
  .uchk { appearance: none; -webkit-appearance: none; width: 17px; height: 17px; border-radius: 4px; border: 1.5px solid #3A3A4A; background: transparent; cursor: pointer; flex-shrink: 0; position: relative; transition: border-color 0.15s, background 0.15s; margin: 0; }
  .uchk:checked { background: #6C63FF; border-color: #6C63FF; }
  .uchk:checked::after { content: ''; position: absolute; left: 4px; top: 1.5px; width: 5px; height: 9px; border: 2px solid #fff; border-top: none; border-left: none; transform: rotate(42deg); }
  .uchk:disabled { opacity: 0.3; cursor: not-allowed; }
  .ulet { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; text-transform: uppercase; }
  .ulet.purple { background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.15); color: #6C63FF; }
  .ulet.green  { background: rgba(34,197,94,0.08);  border: 1px solid rgba(34,197,94,0.2);  color: #22C55E; }
  .ulet.red    { background: rgba(239,68,68,0.08);  border: 1px solid rgba(239,68,68,0.2);  color: #EF4444; }
  .ulet.amber  { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); color: #F59E0B; }
  .uinfo { flex: 1; min-width: 0; }
  .ufrom { font-size: 0.83rem; font-weight: 500; color: #F0EEE9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .usubj { font-size: 0.73rem; color: #4A4860; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .umeta { font-size: 0.68rem; color: #3A3A4A; margin-top: 3px; }
  .uwarn { font-size: 0.68rem; color: #F59E0B; margin-top: 3px; display: flex; align-items: center; gap: 4px; }
  .rbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border-radius: 99px; padding: 0.28rem 0.85rem; border: 1px solid; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 0.2s, transform 0.15s; line-height: 1.6; }
  .rbtn.unsub  { color: #6C63FF; background: rgba(108,99,255,0.08); border-color: rgba(108,99,255,0.3); }
  .rbtn.unsub:hover { background: rgba(108,99,255,0.18); transform: scale(1.04); }
  .rbtn.block  { color: #EF4444; background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.3); }
  .rbtn.block:hover { background: rgba(239,68,68,0.18); transform: scale(1.04); }
  .rbtn.done-u { color: #22C55E; background: rgba(34,197,94,0.08);  border-color: rgba(34,197,94,0.2);  cursor: default; }
  .rbtn.done-b { color: #EF4444; background: rgba(239,68,68,0.08);  border-color: rgba(239,68,68,0.2);  cursor: default; }
  .rbtn.invalid { color: #F59E0B; background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); cursor: default; font-size: 0.58rem; }
  .empty { text-align: center; padding: 2.5rem 1rem; color: #4A4860; font-size: 0.85rem; line-height: 1.7; }
  .empty svg { margin: 0 auto 0.75rem; display: block; opacity: 0.3; }
  .moverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fi 0.2s ease forwards; }
  @keyframes fi { from { opacity:0; } to { opacity:1; } }
  .mbox { background: #111118; border: 1px solid #2A2A38; border-radius: 16px; padding: 2.25rem 2rem 1.75rem; max-width: 440px; width: 100%; box-shadow: 0 32px 64px rgba(0,0,0,0.65); animation: mu 0.25s ease forwards; }
  @keyframes mu { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .mico { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
  .mico.purple { background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2); }
  .mico.red    { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.2); }
  .mico.amber  { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); }
  .mico.green  { background: rgba(34,197,94,0.1);  border: 1px solid rgba(34,197,94,0.2); }
  .mtitle { font-size: 1.15rem; font-weight: 700; letter-spacing: -0.02em; color: #F0EEE9; margin: 0 0 0.5rem; }
  .mbody  { font-size: 0.85rem; color: #6B6880; font-weight: 300; line-height: 1.65; margin: 0 0 1.25rem; }
  .msbox  { background: #16161F; border: 1px solid #1E1E2A; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; }
  .msname { font-size: 0.85rem; font-weight: 600; color: #F0EEE9; margin-bottom: 2px; }
  .msmail { font-size: 0.75rem; color: #6B6880; }
  .mslist { max-height: 130px; overflow-y: auto; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.35rem; scrollbar-width: thin; scrollbar-color: #2A2A38 transparent; }
  .msitem { font-size: 0.75rem; color: #6B6880; background: #16161F; border: 1px solid #1E1E2A; border-radius: 6px; padding: 0.4rem 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mcnt   { font-size: 0.8rem; color: #F0EEE9; background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.15); border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 1.25rem; }
  .mcnt strong { color: #A89DFF; }
  .macts  { display: flex; gap: 0.75rem; }
  .macts.col { flex-direction: column; }
  .mcancel  { flex: 1; font-family: 'Space Grotesk', sans-serif; font-size: 0.88rem; font-weight: 600; color: #6B6880; background: transparent; border: 1px solid #2A2A38; border-radius: 8px; padding: 0.75rem; cursor: pointer; transition: color 0.2s, border-color 0.2s; text-align: center; }
  .mcancel:hover { color: #F0EEE9; border-color: #444; }
  .mconfirm { font-family: 'Space Grotesk', sans-serif; font-size: 0.88rem; font-weight: 700; color: #fff; border: none; border-radius: 8px; padding: 0.75rem 1.25rem; cursor: pointer; transition: opacity 0.2s; text-align: center; }
  .mconfirm:hover { opacity: 0.88; }
  .mconfirm.purple { background: #6C63FF; flex: 2; }
  .mconfirm.red    { background: #EF4444; flex: 2; }
  .mproc { display: flex; align-items: center; justify-content: center; gap: 0.6rem; font-size: 0.82rem; color: #6B6880; padding: 0.75rem 0; }
  .spin  { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #2A2A38; border-top-color: #6C63FF; animation: sp 0.7s linear infinite; }
  @keyframes sp { to { transform:rotate(360deg); } }
  .verify-q   { font-size: 1rem; font-weight: 600; color: #F0EEE9; margin: 0 0 0.6rem; }
  .verify-sub { font-size: 0.82rem; color: #6B6880; margin: 0 0 1.5rem; line-height: 1.6; }
  .vbtn { width: 100%; font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem; font-weight: 700; border: none; border-radius: 10px; padding: 0.85rem; cursor: pointer; transition: opacity 0.2s, transform 0.15s; text-align: center; margin-bottom: 0.6rem; }
  .vbtn:hover { opacity: 0.88; transform: translateY(-1px); }
  .vbtn.yes { background: #22C55E; color: #fff; }
  .vbtn.no  { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
  .vbtn.blk { background: #EF4444; color: #fff; }
  .twrap { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 999; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; pointer-events: none; }
  .toast { font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem; font-weight: 500; padding: 0.65rem 1.25rem; border-radius: 99px; border: 1px solid; white-space: nowrap; animation: ti 0.3s ease forwards; pointer-events: none; }
  .toast.success { color: #22C55E; background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.25); }
  .toast.warn    { color: #F59E0B; background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); }
  .toast.info    { color: #6C63FF; background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.25); }
  .toast.error   { color: #EF4444; background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.25); }
  @keyframes ti { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  .arow { max-width: 900px; margin: 2rem auto 0; padding: 0 2rem; display: flex; gap: 0.85rem; flex-wrap: wrap; }
  .abtn2 { display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'Space Grotesk', sans-serif; font-size: 0.83rem; font-weight: 600; color: #6C63FF; background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.2); border-radius: 8px; padding: 0.65rem 1.2rem; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
  .abtn2:hover { background: rgba(108,99,255,0.15); border-color: rgba(108,99,255,0.4); }
  @keyframes fu { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @media (max-width: 600px) {
    .rnav { padding: 1.25rem; } .rnav .ne { display: none; }
    .sgrid { grid-template-columns: repeat(2,1fr); padding: 0 1.25rem; }
    .sec { padding: 0 1.25rem; } .arow { padding: 0 1.25rem; }
    .mbox { padding: 1.75rem 1.25rem 1.5rem; }
  }
`;

// ── Normalized schema ────────────────────────────────────────────────────────
/*
  UNSUB entry: { domain, from, email, subject, unsubUrl, action:"unsubscribed",
                 needsVerification?:bool, stillReceiving?:bool, at:ISO }

  BLOCK entry: { domain, from, email, subject, action:"blocked",
                 filterId:string,   ← REQUIRED — never saved without this
                 filterEmail:string, at:ISO }
*/

const loadUnsub = () => {
  try { return JSON.parse(localStorage.getItem("detachx_unsub_history") || "[]"); }
  catch { return []; }
};
const saveUnsub = (d) => localStorage.setItem("detachx_unsub_history", JSON.stringify(d));

const loadBlock = () => {
  try { return JSON.parse(localStorage.getItem("detachx_block_history") || "[]"); }
  catch { return []; }
};
const saveBlock = (d) => localStorage.setItem("detachx_block_history", JSON.stringify(d));

// ── Migrate + clean old block history entries ────────────────────────────────
// Removes any entry that was saved without a confirmed filterId
function cleanBlockHistory() {
  const raw = loadBlock();
  const valid   = [];
  const invalid = [];

  raw.forEach((entry) => {
    // ✅ Valid = has a real filterId string (not null/undefined/empty)
    const hasId = entry.filterId && typeof entry.filterId === "string" && entry.filterId.length > 0;
    if (hasId) {
      // Normalize schema while we're here
      valid.push({
        domain:      entry.domain      || "",
        from:        entry.from        || "",
        // ✅ Normalize: old "filteredEmail" or "email" → always "email"
        email:       entry.email       || entry.filteredEmail || "",
        subject:     entry.subject     || "",
        action:      "blocked",
        filterId:    entry.filterId,
        filterEmail: entry.filterEmail || entry.email || entry.filteredEmail || "",
        // ✅ Normalize: old "blockedAt" → always "at"
        at:          entry.at          || entry.blockedAt || new Date().toISOString(),
      });
    } else {
      invalid.push(entry);
    }
  });

  if (invalid.length > 0) {
    console.warn(
      `[DetachX] cleanBlockHistory: removed ${invalid.length} unverified block entries (no filterId):`,
      invalid.map((e) => e.domain || e.email || "unknown")
    );
    saveBlock(valid);
  }

  return valid;
}

function extractEmail(from) {
  const m = from.match(/<([^>]+)>/);
  return m ? m[1] : from.trim();
}

// ── Gmail Filter API — strict verification ───────────────────────────────────
async function createGmailFilter(token, filterEmail) {
  const payload = {
    criteria: { from: filterEmail },
    action: {
      removeLabelIds: ["INBOX"],
      addLabelIds:    ["TRASH"],
    },
  };

  // ✅ Log 1: request
  console.log("[DetachX] createGmailFilter → REQUEST", {
    url:     "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters",
    payload,
  });

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters",
    {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  // ✅ Log 2: raw HTTP status
  console.log("[DetachX] createGmailFilter → HTTP STATUS", res.status, res.statusText);

  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  if (res.status === 403) throw new Error("PERMISSION_DENIED");

  const data = await res.json();

  // ✅ Log 3: full API response
  console.log("[DetachX] createGmailFilter → RESPONSE BODY", data);

  if (!res.ok) {
    const msg = data?.error?.message || `FILTER_ERROR_${res.status}`;
    console.error("[DetachX] createGmailFilter → API ERROR", msg);
    throw new Error(msg);
  }

  // ✅ Strict check — filterId must be a non-empty string
  if (!data.id || typeof data.id !== "string" || data.id.trim() === "") {
    console.error("[DetachX] createGmailFilter → NO FILTER ID IN RESPONSE", data);
    throw new Error("FILTER_ID_MISSING");
  }

  // ✅ Log 4: confirmed filter ID
  console.log("[DetachX] createGmailFilter → CONFIRMED FILTER ID:", data.id);
  return data; // { id, criteria, action }
}

let tid = 0;

export default function ResultsPage() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("detachx_user") || "null");

  const [result,    setResult]    = useState(null);
  const [unsubHist, setUnsubHist] = useState([]);
  const [blockHist, setBlockHist] = useState([]);
  const [selected,  setSelected]  = useState(new Set());
  const [activeTab, setActiveTab] = useState("active");
  const [toasts,    setToasts]    = useState([]);
  const [modal,     setModal]     = useState({
    open: false, type: null, item: null, processing: false,
  });

  // ── Load + clean on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("scan_result");
    if (!raw) { navigate("/dashboard"); return; }
    const data = JSON.parse(raw);
    if (data.userEmail && data.userEmail !== (user?.email || "")) {
      localStorage.removeItem("scan_result");
      navigate("/dashboard");
      return;
    }
    setResult(data);
    setUnsubHist(loadUnsub());

    // ✅ Clean invalid block entries on every load
    const cleanedBlock = cleanBlockHistory();
    setBlockHist(cleanedBlock);
  }, []);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const toast = useCallback((msg, type = "info", dur = 3500) => {
    const id = ++tid;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), dur);
  }, []);

  const closeModal = () => {
    if (!modal.processing)
      setModal({ open: false, type: null, item: null, processing: false });
  };

  // ── Domain sets ────────────────────────────────────────────────────────────
  const unsubDomains   = new Set(unsubHist.map((h) => h.domain));
  const blockDomains   = new Set(blockHist.map((h) => h.domain));
  const handledDomains = new Set([...unsubDomains, ...blockDomains]);

  // ── Checkbox ───────────────────────────────────────────────────────────────
  const toggleOne = useCallback((domain) => {
    setSelected((p) => {
      const n = new Set(p);
      n.has(domain) ? n.delete(domain) : n.add(domain);
      return n;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!result) return;
    const el = result.unsubList
      .filter((i) => !handledDomains.has(i.domain) && i.unsubUrl)
      .map((i) => i.domain);
    setSelected(new Set(el));
    toast(`${el.length} senders selected`, "info", 2000);
  }, [result, unsubHist, blockHist]);

  const clearSel = () => setSelected(new Set());

  // ── UNSUB flow ─────────────────────────────────────────────────────────────
  const clickUnsub = useCallback((item) => {
    setModal({ open: true, type: "unsub-confirm", item, processing: false });
  }, []);

  const proceedUnsub = useCallback((item) => {
    window.open(item.unsubUrl, "_blank", "noopener,noreferrer");
    // ✅ Do NOT save to history yet
    setModal({ open: true, type: "unsub-verify", item, processing: false });
  }, []);

  const confirmUnsubSuccess = useCallback((item) => {
  const entry = {
    domain:   item.domain,
    from:     item.from,
    email:    extractEmail(item.from),
    subject:  item.subject,
    unsubUrl: item.unsubUrl,
    action:   "unsubscribed",
    // ✅ Always start as pending — scan will upgrade to confirmed/still_receiving
    verificationStatus: "pending",
    at: new Date().toISOString(),
  };
  console.log("[DetachX] saveUnsubHistory → SAVING ENTRY (pending)", entry);
  const upd = [...unsubHist, entry];
  setUnsubHist(upd);
  saveUnsub(upd);
  setSelected((p) => { const n = new Set(p); n.delete(item.domain); return n; });
  setModal({ open: false, type: null, item: null, processing: false });
  toast(`${item.domain} unsubscribed — verifying on next scan`, "success");
}, [unsubHist]);

  const reportUnsubFailed = useCallback((item) => {
    setModal({ open: true, type: "unsub-failed", item, processing: false });
  }, []);

  const switchToBlock = useCallback((item) => {
    setModal({ open: true, type: "block-confirm", item, processing: false });
  }, []);

  // ── Bulk unsub ─────────────────────────────────────────────────────────────
  const eligibleSel = result
    ? [...selected].filter((d) => {
        const i = result.unsubList.find((x) => x.domain === d);
        return i && i.unsubUrl && !handledDomains.has(d);
      })
    : [];

  const openBulkModal = () => {
    if (!eligibleSel.length) { toast("Select at least one sender", "warn"); return; }
    setModal({ open: true, type: "unsub-bulk", item: null, processing: false });
  };

  const confirmBulk = useCallback(() => {
    if (!result) return;
    const toProc = result.unsubList.filter(
      (i) => selected.has(i.domain) && i.unsubUrl && !handledDomains.has(i.domain)
    );
    toProc.forEach((item, idx) =>
      setTimeout(() => window.open(item.unsubUrl, "_blank", "noopener,noreferrer"), idx * 350)
    );
    const entries = toProc.map((i) => ({
  domain:             i.domain,
  from:               i.from,
  email:              extractEmail(i.from),
  subject:            i.subject,
  unsubUrl:           i.unsubUrl,
  action:             "unsubscribed",
  verificationStatus: "pending",  // ✅ always pending initially
  needsVerification:  true,
  at:                 new Date().toISOString(),
}));
    console.log("[DetachX] bulk unsub → SAVING ENTRIES", entries.map((e) => e.domain));
    const upd = [...unsubHist, ...entries];
    setUnsubHist(upd);
    saveUnsub(upd);
    setSelected(new Set());
    setModal({ open: false, type: null, item: null, processing: false });
    toast(`${toProc.length} pages opened — verify each one manually`, "info", 5000);
  }, [result, selected, unsubHist, blockHist]);

  // ── BLOCK flow ─────────────────────────────────────────────────────────────
  const clickBlock = useCallback((item) => {
    setModal({ open: true, type: "block-confirm", item, processing: false });
  }, []);

  const confirmBlock = useCallback(async () => {
    const { item } = modal;
    if (!item) return;

    setModal((m) => ({ ...m, processing: true }));
    const token       = localStorage.getItem("gmail_token");
    const filterEmail = extractEmail(item.from);

    try {
      // ✅ API call with full logging inside createGmailFilter
      const filterResult = await createGmailFilter(token, filterEmail);

      // ✅ Double-check filterId before saving (belt + suspenders)
      if (!filterResult.id) {
        throw new Error("FILTER_ID_MISSING_POST_CHECK");
      }

      // ✅ Normalized block entry — consistent schema
      const entry = {
        domain:      item.domain,
        from:        item.from,
        email:       filterEmail,             // ← always "email", never "filteredEmail"
        subject:     item.subject || "",
        action:      "blocked",
        filterId:    filterResult.id,         // ← REQUIRED field
        filterEmail: filterEmail,
        at:          new Date().toISOString(), // ← always "at", never "blockedAt"
      };

      // ✅ Log 6: save to block history
      console.log("[DetachX] saveBlockHistory → SAVING ENTRY", entry);

      const upd = [...blockHist, entry];
      setBlockHist(upd);
      saveBlock(upd);

      setModal({ open: false, type: null, item: null, processing: false });
      toast(`${item.domain} blocked ✓ — Gmail filter ID: ${filterResult.id}`, "success", 5000);

    } catch (err) {
      // ✅ On ANY error — do NOT save to block history
      setModal((m) => ({ ...m, processing: false }));
      console.error("[DetachX] confirmBlock → FAILED, not saving to history. Error:", err.message);

      if (err.message === "TOKEN_EXPIRED") {
        localStorage.removeItem("gmail_token");
        navigate("/login");
        return;
      }
      if (err.message === "PERMISSION_DENIED") {
        toast(
          "Gmail filter permission denied. Log out and log in again to grant access.",
          "error", 6000
        );
      } else if (err.message === "FILTER_ID_MISSING" || err.message === "FILTER_ID_MISSING_POST_CHECK") {
        toast(
          "Gmail did not confirm filter creation. Sender remains Active.",
          "error", 5000
        );
      } else {
        toast(`Block failed: ${err.message} — sender remains Active.`, "error", 5000);
      }
      // ✅ Sender stays in Active — not moved to Blocked
    }
  }, [modal, blockHist, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("detachx_user");
    localStorage.removeItem("gmail_token");
    localStorage.removeItem("scan_result");
    navigate("/");
  };

  const fmtS = (iso) => iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const fmt = (iso) => iso
    ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

  if (!result) return null;

  const activeList = result.unsubList.filter((i) => !handledDomains.has(i.domain));
// ── Verification status helpers ──────────────────────────────────────────────
function getVerificationStatus(item) {
  // Backward compatible — old entries without field default to "pending"
  return item.verificationStatus || "pending";
}

function VerificationBadge({ status }) {
  if (status === "confirmed") return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontSize: "0.68rem", fontWeight: "600", color: "#22C55E",
      marginTop: "4px",
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="4.5" fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="0.8"/>
        <path d="M2.5 5l2 2 3-3" stroke="#22C55E" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Confirmed
    </div>
  );

  if (status === "still_receiving") return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontSize: "0.68rem", fontWeight: "600", color: "#F59E0B",
      marginTop: "4px",
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="4.5" fill="rgba(245,158,11,0.12)" stroke="#F59E0B" strokeWidth="0.8"/>
        <path d="M5 2.5v3M5 7h.01" stroke="#F59E0B" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
      Still Receiving
    </div>
  );

  // "pending" — default
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      fontSize: "0.68rem", fontWeight: "500", color: "#6B6880",
      marginTop: "4px",
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="4.5" fill="rgba(107,104,128,0.1)" stroke="#6B6880" strokeWidth="0.8"/>
        <path d="M5 3v2.2l1.3 1.3" stroke="#6B6880" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Pending Verification
    </div>
  );
}
  return (
    <>
      <style>{S}</style>
      <div className="rp">
        <div className="top-bar" />

        {/* Nav */}
        <nav className="rnav">
          <div className="wm">Detach<span>X</span></div>
          <div className="nr">
            {user && (
              <>
                <img src={user.picture} alt="" referrerPolicy="no-referrer" />
                <span className="ne">{user.email}</span>
              </>
            )}
            <button className="nbtn" onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button className="nbtn" onClick={handleLogout}>Log out</button>
          </div>
        </nav>

        {/* Hero */}
        <div className="hero">
          <div className="hbadge">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
            Scan Complete
          </div>
          <h1>Your Digital Footprint</h1>
          <p>Real results — {user?.email}</p>
          {result.scannedAt && <p className="smeta">Scanned on {fmt(result.scannedAt)}</p>}
        </div>

        {/* Stats */}
        <div className="sgrid">
          <div className="scard">
            <div className="ac" style={{ background: "#6C63FF" }} />
            <div className="sico" style={{ background: "rgba(108,99,255,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 4h14v10a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 0l7 5.5L16 4" stroke="#6C63FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="slbl">Total Scanned</div>
            <div className="sval">{result.total}</div>
            <div className="ssub">emails</div>
          </div>
          <div className="scard">
            <div className="ac" style={{ background: "#F59E0B" }} />
            <div className="sico" style={{ background: "rgba(245,158,11,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#F59E0B" strokeWidth="1.4"/>
                <path d="M9 6v3.5l2 2" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="slbl">Active</div>
            <div className="sval">{activeList.length}</div>
            <div className="ssub">pending action</div>
          </div>
          <div className="scard">
            <div className="ac" style={{ background: "#22C55E" }} />
            <div className="sico" style={{ background: "rgba(34,197,94,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9l4 4 8-8" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="slbl">Unsubscribed</div>
            <div className="sval">{unsubHist.length}</div>
            <div className="ssub">confirmed</div>
          </div>
          <div className="scard">
            <div className="ac" style={{ background: "#EF4444" }} />
            <div className="sico" style={{ background: "rgba(239,68,68,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#EF4444" strokeWidth="1.4"/>
                <path d="M4 4l10 10" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="slbl">Blocked</div>
            <div className="sval">{blockHist.length}</div>
            <div className="ssub">Gmail filtered</div>
          </div>
        </div>

        {/* Section */}
        <div className="sec">
          <div className="shead">
            <span className="stitle">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1L9 5.5H14L10 8.5L11.5 13L7.5 10.5L3.5 13L5 8.5L1 5.5H6L7.5 1Z" stroke="#6C63FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sender Management
            </span>
            {activeTab === "active" && (
              <div className="btbar">
                <button className="bbtn sa" onClick={selectAll}>Select All</button>
                {selected.size > 0 && <button className="bbtn cl" onClick={clearSel}>Clear</button>}
                <button className="bbtn us" onClick={openBulkModal} disabled={!eligibleSel.length}>
                  Unsubscribe Selected
                  {eligibleSel.length > 0 && <span className="sc">({eligibleSel.length})</span>}
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab${activeTab === "active" ? " active" : ""}`} onClick={() => setActiveTab("active")}>
              Active <span className="tab-count">{activeList.length}</span>
            </button>
            <button className={`tab t-green${activeTab === "unsub" ? " active" : ""}`} onClick={() => setActiveTab("unsub")}>
              Unsubscribed <span className="tab-count">{unsubHist.length}</span>
            </button>
            <button className={`tab t-red${activeTab === "blocked" ? " active" : ""}`} onClick={() => setActiveTab("blocked")}>
              Blocked <span className="tab-count">{blockHist.length}</span>
            </button>
          </div>

          {/* ══ ACTIVE ══ */}
          {activeTab === "active" && (
            <div className="ulist">
              {activeList.length === 0 ? (
                <div className="empty">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="#6C63FF" strokeWidth="1.5"/>
                    <path d="M10 16l4 4 8-8" stroke="#6C63FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>All senders handled! Inbox looks clean.</p>
                </div>
              ) : (
                activeList.map((item, i) => {
                  const hasLink    = !!item.unsubUrl;
                  const isSelected = selected.has(item.domain);
                  return (
                    <div className={`urow${isSelected ? " sel" : ""}`} key={i}>
                      <input
                        type="checkbox"
                        className="uchk"
                        checked={isSelected}
                        disabled={!hasLink}
                        onChange={() => toggleOne(item.domain)}
                        title={!hasLink ? "No unsubscribe link — use Block" : undefined}
                      />
                      <div className="ulet purple">{(item.domain?.[0] || "?").toUpperCase()}</div>
                      <div className="uinfo">
                        <div className="ufrom">{item.from}</div>
                        <div className="usubj">{item.subject || "No subject"}</div>
                        {!hasLink && (
                          <div className="umeta" style={{ color: "#4A4860" }}>
                            No unsubscribe link — block to filter future emails
                          </div>
                        )}
                      </div>
                      {hasLink
                        ? <button className="rbtn unsub" onClick={() => clickUnsub(item)}>Unsub</button>
                        : <button className="rbtn block" onClick={() => clickBlock(item)}>Block</button>
                      }
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ══ UNSUBSCRIBED ══ */}
{activeTab === "unsub" && (
  <div className="ulist">
    {unsubHist.length === 0 ? (
      <div className="empty">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="14" stroke="#22C55E" strokeWidth="1.5"/>
          <path d="M10 16l4 4 8-8" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>No confirmed unsubscriptions yet.</p>
      </div>
    ) : (
      [...unsubHist].reverse().map((item, i) => {
        const vstatus = getVerificationStatus(item);
        return (
          <div className="urow done done-u" key={i}>
            <div className="ulet green">{(item.domain?.[0] || "?").toUpperCase()}</div>
            <div className="uinfo">
              <div className="ufrom">{item.from}</div>
              <div className="usubj">{item.email || extractEmail(item.from)}</div>
              <div className="umeta">
                Unsubscribed on {fmtS(item.at)}
                {item.needsVerification && (
                  <span style={{ color: "#4A4860" }}> · Bulk</span>
                )}
              </div>
              {/* ✅ Status line — always shown, 3 possible states */}
              <VerificationBadge status={vstatus} />
            </div>
            <button className="rbtn done-u" disabled>Done ✓</button>
          </div>
        );
      })
    )}
  </div>
)}

          {/* ══ BLOCKED ══ — only shows entries with confirmed filterId */}
          {activeTab === "blocked" && (
            <div className="ulist">
              {blockHist.length === 0 ? (
                <div className="empty">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="#EF4444" strokeWidth="1.5"/>
                    <path d="M5 5l22 22" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <p>No verified blocked senders yet.<br/>Block a sender to create a Gmail filter.</p>
                </div>
              ) : (
                [...blockHist].reverse().map((item, i) => (
                  <div className="urow done done-b" key={i}>
                    <div className="ulet red">{(item.domain?.[0] || "?").toUpperCase()}</div>
                    <div className="uinfo">
                      {/* ✅ Sender name, email, timestamp as required */}
                      <div className="ufrom">{item.from}</div>
                      <div className="usubj">{item.email}</div>
                      <div className="umeta">
                        Blocked on {fmtS(item.at)}
                        {" · "}
                        <span style={{ color: "#22C55E" }}>
                          Gmail Filter: {item.filterId}
                        </span>
                      </div>
                    </div>
                    <button className="rbtn done-b" disabled>Blocked ✓</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="arow">
          <button className="abtn2" onClick={() => navigate("/scan")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 7A6 6 0 1 1 7 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M13 1v6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Scan Again
          </button>
          <button className="abtn2" onClick={() => navigate("/dashboard")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 7H1M6 2L1 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* ══ MODALS ══ */}

      {/* 1. Pre-unsub confirm */}
      {modal.open && modal.type === "unsub-confirm" && modal.item && (
        <div className="moverlay" onClick={closeModal}>
          <div className="mbox" onClick={(e) => e.stopPropagation()}>
            <div className="mico purple">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M2 6h18v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6zm0 0l9 7 9-7" stroke="#6C63FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="mtitle">Open Unsubscribe Page</h2>
            <p className="mbody">
              The sender's unsubscribe page will open in a new tab. Complete the process there, then come back and confirm if it worked.
            </p>
            <div className="msbox">
              <div className="msname">{modal.item.domain}</div>
              <div className="msmail">{extractEmail(modal.item.from)}</div>
            </div>
            <div className="macts">
              <button className="mcancel" onClick={closeModal}>Cancel</button>
              <button className="mconfirm purple" onClick={() => proceedUnsub(modal.item)}>
                Open Unsubscribe Page →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Post-unsub verify */}
      {modal.open && modal.type === "unsub-verify" && modal.item && (
        <div className="moverlay">
          <div className="mbox">
            <div className="mico amber">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 4v7M11 15h.01" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="11" cy="11" r="9" stroke="#F59E0B" strokeWidth="1.6"/>
              </svg>
            </div>
            <p className="verify-q">Did the unsubscribe work?</p>
            <p className="verify-sub">
              Check the tab that just opened. If you saw a success message, click Yes. 
              If there was an error (like HDFC Sky's "could not retrieve email"), click No.
            </p>
            <div className="msbox">
              <div className="msname">{modal.item.domain}</div>
              <div className="msmail">{extractEmail(modal.item.from)}</div>
            </div>
            <button className="vbtn yes" onClick={() => confirmUnsubSuccess(modal.item)}>
              ✓ Yes, I unsubscribed successfully
            </button>
            <button className="vbtn no" onClick={() => reportUnsubFailed(modal.item)}>
              ✗ No, the page showed an error
            </button>
          </div>
        </div>
      )}

      {/* 3. Unsub failed — offer block */}
      {modal.open && modal.type === "unsub-failed" && modal.item && (
        <div className="moverlay" onClick={closeModal}>
          <div className="mbox" onClick={(e) => e.stopPropagation()}>
            <div className="mico red">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#EF4444" strokeWidth="1.6"/>
                <path d="M4 4l14 14" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="mtitle">Unsubscribe Failed</h2>
            <p className="mbody">
              The unsubscribe page didn't work for <strong style={{ color: "#F0EEE9" }}>{modal.item.domain}</strong>. 
              You can block this sender instead — a Gmail filter will move their future emails to Trash automatically.
            </p>
            <div className="macts col">
              <button className="vbtn blk" onClick={() => switchToBlock(modal.item)}>
                Block Sender Instead
              </button>
              <button className="mcancel" onClick={closeModal}>
                Keep Active (try again later)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bulk unsub */}
      {modal.open && modal.type === "unsub-bulk" && (
        <div className="moverlay" onClick={closeModal}>
          <div className="mbox" onClick={(e) => e.stopPropagation()}>
            <div className="mico purple">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 4v7M11 15h.01" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="11" cy="11" r="9" stroke="#6C63FF" strokeWidth="1.6"/>
              </svg>
            </div>
            <h2 className="mtitle">Bulk Unsubscribe</h2>
            <p className="mbody">
              All pages open in new tabs. These will be marked with a verification reminder — please check each one manually.
            </p>
            <div className="mcnt">
              <strong>{eligibleSel.length} sender{eligibleSel.length > 1 ? "s" : ""}</strong> will be processed
            </div>
            <div className="mslist">
              {result?.unsubList
                .filter((i) => eligibleSel.includes(i.domain))
                .map((item, i) => <div className="msitem" key={i}>{item.from}</div>)}
            </div>
            <div className="macts">
              <button className="mcancel" onClick={closeModal}>Cancel</button>
              <button className="mconfirm purple" onClick={confirmBulk}>
                Open All {eligibleSel.length} Pages
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Block confirm */}
      {modal.open && modal.type === "block-confirm" && modal.item && (
        <div className="moverlay" onClick={closeModal}>
          <div className="mbox" onClick={(e) => e.stopPropagation()}>
            <div className="mico red">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#EF4444" strokeWidth="1.6"/>
                <path d="M4 4l14 14" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="mtitle">Block Sender</h2>
            <p className="mbody">
              A Gmail filter will be created. Future emails from this sender will be moved to Trash automatically. This sender will only appear in Blocked after Gmail confirms the filter.
            </p>
            <div className="msbox">
              <div className="msname">{modal.item.domain}</div>
              <div className="msmail">{extractEmail(modal.item.from)}</div>
            </div>
            {modal.processing
              ? <div className="mproc"><div className="spin" />Creating Gmail filter…</div>
              : (
                <div className="macts">
                  <button className="mcancel" onClick={closeModal}>Cancel</button>
                  <button className="mconfirm red" onClick={confirmBlock}>
                    Confirm — Block Sender
                  </button>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="twrap">
        {toasts.map((t) => <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>
    </>
  );
}