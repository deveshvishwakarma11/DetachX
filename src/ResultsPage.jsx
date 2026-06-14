import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const S = `
  * { box-sizing: border-box; }
  .rp { position: relative; min-height: 100dvh; background: #0A0A0F; font-family: 'Space Grotesk', sans-serif; color: #F0EEE9; padding: 0 0 6rem; overflow-x: hidden; }
  .rp .top-bar { height: 1px; background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent); }

  /* Nav */
  .rnav { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 2.5rem; border-bottom: 1px solid #1E1E2A; }
  .rnav .wm { font-size: 1rem; font-weight: 600; letter-spacing: 0.08em; color: #F0EEE9; }
  .rnav .wm span { color: #6C63FF; }
  .rnav .nr { display: flex; align-items: center; gap: 0.75rem; }
  .rnav img { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #2A2A38; object-fit: cover; }
  .rnav .ne { font-size: 0.78rem; color: #6B6880; }
  .nbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 500; color: #4A4860; background: none; border: 1px solid #1E1E2A; border-radius: 6px; padding: 0.35rem 0.85rem; cursor: pointer; transition: color 0.2s, border-color 0.2s; }
  .nbtn:hover { color: #6B6880; border-color: #2A2A38; }

  /* Hero */
  .hero { text-align: center; padding: 3.5rem 2rem 0.5rem; animation: fu 0.5s ease forwards; }
  .hbadge { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #6C63FF; background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2); border-radius: 99px; padding: 0.35rem 1rem; margin-bottom: 1.25rem; }
  .hero h1 { font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 0.6rem; }
  .hero p  { font-size: 0.9rem; color: #6B6880; font-weight: 300; margin: 0; }
  .smeta   { font-size: 0.72rem; color: #4A4860; margin-top: 0.5rem; }

  /* Stats */
  .sgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; max-width: 900px; margin: 2.5rem auto 0; padding: 0 2rem; animation: fu 0.5s ease 0.1s both; }
  .scard { background: #111118; border: 1px solid #1E1E2A; border-radius: 14px; padding: 1.5rem 1.5rem 1.25rem; position: relative; overflow: hidden; transition: border-color 0.2s, transform 0.2s; }
  .scard:hover { border-color: #2A2A38; transform: translateY(-2px); }
  .scard .ac { position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 2px 2px 0 0; }
  .sico { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
  .slbl { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #4A4860; margin-bottom: 0.35rem; }
  .sval { font-size: 2.4rem; font-weight: 700; letter-spacing: -0.04em; color: #F0EEE9; line-height: 1; margin-bottom: 0.25rem; }
  .ssub { font-size: 0.73rem; color: #6B6880; font-weight: 300; }

  /* Section */
  .sec { max-width: 900px; margin: 3rem auto 0; padding: 0 2rem; animation: fu 0.5s ease 0.2s both; }
  .shead { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
  .stitle { font-size: 0.95rem; font-weight: 600; color: #F0EEE9; display: flex; align-items: center; gap: 0.5rem; }

  /* Tabs */
  .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
  .tab { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 600; padding: 0.4rem 1rem; border-radius: 99px; border: 1px solid #2A2A38; background: transparent; color: #6B6880; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem; }
  .tab:hover { color: #F0EEE9; border-color: #444; }
  .tab.active { background: rgba(108,99,255,0.12); border-color: rgba(108,99,255,0.35); color: #A89DFF; }
  .tab.t-green.active { background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.3);  color: #4ade80; }
  .tab.t-red.active   { background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.3);  color: #f87171; }
  .tab-count { font-size: 0.7rem; background: rgba(255,255,255,0.06); border-radius: 99px; padding: 0.1rem 0.5rem; }

  /* Bulk toolbar */
  .btbar { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; }
  .bbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; border-radius: 7px; padding: 0.38rem 0.9rem; border: 1px solid; cursor: pointer; transition: background 0.2s, border-color 0.2s; white-space: nowrap; }
  .bbtn.sa { color: #6C63FF; background: rgba(108,99,255,0.08); border-color: rgba(108,99,255,0.22); }
  .bbtn.sa:hover { background: rgba(108,99,255,0.16); border-color: rgba(108,99,255,0.4); }
  .bbtn.cl { color: #6B6880; background: transparent; border-color: #2A2A38; }
  .bbtn.cl:hover { color: #F0EEE9; border-color: #444; }
  .bbtn.us { color: #0A0A0F; background: #6C63FF; border-color: #6C63FF; }
  .bbtn.us:hover { background: #7C73FF; }
  .bbtn.us:disabled { opacity: 0.4; cursor: not-allowed; }
  .sc { font-size: 0.75rem; color: #fff; margin-left: 0.1rem; }

  /* Rows */
  .ulist { display: flex; flex-direction: column; gap: 0.5rem; }
  .urow { display: flex; align-items: center; gap: 0.85rem; background: #111118; border: 1px solid #1E1E2A; border-radius: 10px; padding: 0.85rem 1.1rem; transition: border-color 0.2s, background 0.2s; }
  .urow:hover:not(.done) { border-color: #2A2A38; }
  .urow.sel { border-color: rgba(108,99,255,0.35); background: rgba(108,99,255,0.04); }
  .urow.done { opacity: 0.5; }
  .urow.done-u { background: #0D150D; border-color: rgba(34,197,94,0.15); }
  .urow.done-b { background: #150D0D; border-color: rgba(239,68,68,0.15); }

  /* Checkbox */
  .uchk { appearance: none; -webkit-appearance: none; width: 17px; height: 17px; border-radius: 4px; border: 1.5px solid #3A3A4A; background: transparent; cursor: pointer; flex-shrink: 0; position: relative; transition: border-color 0.15s, background 0.15s; margin: 0; }
  .uchk:checked { background: #6C63FF; border-color: #6C63FF; }
  .uchk:checked::after { content: ''; position: absolute; left: 4px; top: 1.5px; width: 5px; height: 9px; border: 2px solid #fff; border-top: none; border-left: none; transform: rotate(42deg); }
  .uchk:disabled { opacity: 0.3; cursor: not-allowed; }

  /* Avatar letter */
  .ulet { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; text-transform: uppercase; }
  .ulet.purple { background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.15); color: #6C63FF; }
  .ulet.green  { background: rgba(34,197,94,0.08);  border: 1px solid rgba(34,197,94,0.2);  color: #22C55E; }
  .ulet.red    { background: rgba(239,68,68,0.08);  border: 1px solid rgba(239,68,68,0.2);  color: #EF4444; }

  .uinfo { flex: 1; min-width: 0; }
  .ufrom { font-size: 0.83rem; font-weight: 500; color: #F0EEE9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .usubj { font-size: 0.73rem; color: #4A4860; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
  .udate { font-size: 0.68rem; color: #3A3A4A; margin-top: 2px; }
  .uwarn { font-size: 0.68rem; color: #F59E0B; margin-top: 3px; display: flex; align-items: center; gap: 4px; }

  /* Action buttons */
  .abtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; border-radius: 99px; padding: 0.28rem 0.8rem; border: 1px solid; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 0.2s, transform 0.15s; line-height: 1.6; }
  .abtn.unsub  { color: #6C63FF; background: rgba(108,99,255,0.08); border-color: rgba(108,99,255,0.3); }
  .abtn.unsub:hover  { background: rgba(108,99,255,0.18); transform: scale(1.04); }
  .abtn.block  { color: #EF4444; background: rgba(239,68,68,0.08);  border-color: rgba(239,68,68,0.3); }
  .abtn.block:hover  { background: rgba(239,68,68,0.18);  transform: scale(1.04); }
  .abtn.done-u { color: #22C55E; background: rgba(34,197,94,0.08);  border-color: rgba(34,197,94,0.25);  cursor: default; }
  .abtn.done-b { color: #EF4444; background: rgba(239,68,68,0.08);  border-color: rgba(239,68,68,0.25);  cursor: default; }

  /* Empty */
  .empty { text-align: center; padding: 2.5rem 1rem; color: #4A4860; font-size: 0.85rem; line-height: 1.7; }
  .empty svg { margin-bottom: 0.75rem; opacity: 0.3; display: block; margin-left: auto; margin-right: auto; }

  /* Modal */
  .moverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.78); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fi 0.2s ease forwards; }
  @keyframes fi { from { opacity: 0; } to { opacity: 1; } }
  .mbox { background: #111118; border: 1px solid #2A2A38; border-radius: 16px; padding: 2.25rem 2rem 1.75rem; max-width: 440px; width: 100%; box-shadow: 0 32px 64px rgba(0,0,0,0.6); animation: mu 0.25s ease forwards; }
  @keyframes mu { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .mico { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.25rem; }
  .mico.purple { background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2); }
  .mico.red    { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.2); }
  .mtitle { font-size: 1.2rem; font-weight: 700; letter-spacing: -0.02em; color: #F0EEE9; margin: 0 0 0.5rem; }
  .mbody  { font-size: 0.85rem; color: #6B6880; font-weight: 300; line-height: 1.6; margin: 0 0 1rem; }
  .mcnt   { font-size: 0.8rem; color: #F0EEE9; background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.15); border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 1.25rem; }
  .mcnt strong { color: #A89DFF; }
  .msbox  { background: #16161F; border: 1px solid #1E1E2A; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem; }
  .msname { font-size: 0.85rem; font-weight: 600; color: #F0EEE9; margin-bottom: 2px; }
  .msmail { font-size: 0.75rem; color: #4A4860; }
  .mslist { max-height: 140px; overflow-y: auto; margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.35rem; scrollbar-width: thin; scrollbar-color: #2A2A38 transparent; }
  .msitem { font-size: 0.75rem; color: #6B6880; background: #16161F; border: 1px solid #1E1E2A; border-radius: 6px; padding: 0.4rem 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .macts  { display: flex; gap: 0.75rem; }
  .mcancel  { flex: 1; font-family: 'Space Grotesk', sans-serif; font-size: 0.88rem; font-weight: 600; color: #6B6880; background: transparent; border: 1px solid #2A2A38; border-radius: 8px; padding: 0.75rem; cursor: pointer; transition: color 0.2s, border-color 0.2s; }
  .mcancel:hover { color: #F0EEE9; border-color: #444; }
  .mconfirm { flex: 2; font-family: 'Space Grotesk', sans-serif; font-size: 0.88rem; font-weight: 700; color: #fff; border: none; border-radius: 8px; padding: 0.75rem; cursor: pointer; transition: opacity 0.2s; }
  .mconfirm:hover { opacity: 0.88; }
  .mconfirm.purple { background: #6C63FF; }
  .mconfirm.red    { background: #EF4444; }
  .mproc { display: flex; align-items: center; justify-content: center; gap: 0.6rem; font-size: 0.82rem; color: #6B6880; padding: 0.5rem 0; }
  .spin  { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #2A2A38; border-top-color: #6C63FF; animation: sp 0.7s linear infinite; }
  @keyframes sp { to { transform: rotate(360deg); } }

  /* Toast */
  .twrap { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 999; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; pointer-events: none; }
  .toast { font-family: 'Space Grotesk', sans-serif; font-size: 0.82rem; font-weight: 500; padding: 0.65rem 1.25rem; border-radius: 99px; border: 1px solid; white-space: nowrap; animation: ti 0.3s ease forwards; pointer-events: none; }
  .toast.success { color: #22C55E; background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.25); }
  .toast.warn    { color: #F59E0B; background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); }
  .toast.info    { color: #6C63FF; background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.25); }
  .toast.error   { color: #EF4444; background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.25); }
  @keyframes ti { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  /* Bottom actions */
  .arow { max-width: 900px; margin: 2rem auto 0; padding: 0 2rem; display: flex; gap: 0.85rem; flex-wrap: wrap; }
  .abtn2 { display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'Space Grotesk', sans-serif; font-size: 0.83rem; font-weight: 600; color: #6C63FF; background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.2); border-radius: 8px; padding: 0.65rem 1.2rem; cursor: pointer; transition: background 0.2s, border-color 0.2s; }
  .abtn2:hover { background: rgba(108,99,255,0.15); border-color: rgba(108,99,255,0.4); }

  @keyframes fu { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @media (max-width: 600px) {
    .rnav { padding: 1.25rem; } .rnav .ne { display: none; }
    .sgrid { grid-template-columns: repeat(2,1fr); padding: 0 1.25rem; }
    .sec   { padding: 0 1.25rem; } .arow { padding: 0 1.25rem; }
    .mbox  { padding: 1.75rem 1.25rem 1.5rem; }
  }
`;

// ── Storage helpers — strictly separate ──────────────────────────────────────
const loadUnsub = () => { try { return JSON.parse(localStorage.getItem("detachx_unsub_history") || "[]"); } catch { return []; } };
const saveUnsub = (d) => localStorage.setItem("detachx_unsub_history", JSON.stringify(d));
const loadBlock = () => { try { return JSON.parse(localStorage.getItem("detachx_block_history") || "[]"); } catch { return []; } };
const saveBlock = (d) => localStorage.setItem("detachx_block_history", JSON.stringify(d));

// ── Gmail filter creation ────────────────────────────────────────────────────
function extractEmail(from) {
  const m = from.match(/<([^>]+)>/);
  return m ? m[1] : from.trim();
}

async function createBlockFilter(token, fromEmail) {
  /*
    ✅ FIXED: Do NOT use SPAM label — Gmail API rejects it.
    Correct approach: remove from INBOX + move to TRASH.
    This effectively blocks the sender — emails arrive but go to Trash silently.
  */
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        criteria: { from: fromEmail },
        action: {
          removeLabelIds: ["INBOX"],
          addLabelIds:    ["TRASH"],
        },
      }),
    }
  );
  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  if (res.status === 403) throw new Error("PERMISSION_DENIED");
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || `FILTER_ERROR_${res.status}`);
  }
  return res.json();
}

let tid = 0;

export default function ResultsPage() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("detachx_user") || "null");

  const [result,      setResult]      = useState(null);
  const [unsubHist,   setUnsubHist]   = useState([]);
  const [blockHist,   setBlockHist]   = useState([]);
  const [selected,    setSelected]    = useState(new Set());
  const [activeTab,   setActiveTab]   = useState("active");
  const [toasts,      setToasts]      = useState([]);
  const [modal,       setModal]       = useState({ open: false, type: null, item: null, processing: false });

  // ── Load ──────────────────────────────────────────────────────────────────
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
    setBlockHist(loadBlock());
  }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const toast = useCallback((msg, type = "info", dur = 3500) => {
    const id = ++tid;
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), dur);
  }, []);

  // ── Domain sets ───────────────────────────────────────────────────────────
  const unsubDomains  = new Set(unsubHist.map((h) => h.domain));
  const blockDomains  = new Set(blockHist.map((h) => h.domain));
  const handledDomains = new Set([...unsubDomains, ...blockDomains]);

  // ── Checkboxes (only for senders with unsub link) ─────────────────────────
  const toggleOne = useCallback((domain) => {
    setSelected((p) => { const n = new Set(p); n.has(domain) ? n.delete(domain) : n.add(domain); return n; });
  }, []);

  const selectAll = useCallback(() => {
    if (!result) return;
    const el = result.unsubList.filter((i) => !handledDomains.has(i.domain) && i.unsubUrl).map((i) => i.domain);
    setSelected(new Set(el));
    toast(`${el.length} senders selected`, "info", 2000);
  }, [result, unsubHist, blockHist]);

  const clearSel = useCallback(() => setSelected(new Set()), []);

  // ── Individual unsub ──────────────────────────────────────────────────────
  const doUnsub = useCallback((item) => {
    if (handledDomains.has(item.domain) || !item.unsubUrl) return;
    window.open(item.unsubUrl, "_blank", "noopener,noreferrer");
    const entry = { domain: item.domain, from: item.from, subject: item.subject, unsubUrl: item.unsubUrl, at: new Date().toISOString() };
    const upd   = [...unsubHist, entry];
    setUnsubHist(upd); saveUnsub(upd);
    setSelected((p) => { const n = new Set(p); n.delete(item.domain); return n; });
    toast(`Unsubscribed from ${item.domain} ✓`, "success");
  }, [unsubHist, blockHist]);

  // ── Bulk unsub ────────────────────────────────────────────────────────────
  const eligibleSel = result
    ? [...selected].filter((d) => { const i = result.unsubList.find((x) => x.domain === d); return i && i.unsubUrl && !handledDomains.has(d); })
    : [];

  const openBulkModal = () => {
    if (!eligibleSel.length) { toast("Select at least one sender", "warn"); return; }
    setModal({ open: true, type: "bulk", item: null, processing: false });
  };

  const confirmBulk = useCallback(() => {
    if (!result) return;
    const toProc = result.unsubList.filter((i) => selected.has(i.domain) && i.unsubUrl && !handledDomains.has(i.domain));
    toProc.forEach((item, idx) => setTimeout(() => window.open(item.unsubUrl, "_blank", "noopener,noreferrer"), idx * 300));
    const entries = toProc.map((i) => ({ domain: i.domain, from: i.from, subject: i.subject, unsubUrl: i.unsubUrl, at: new Date().toISOString() }));
    const upd = [...unsubHist, ...entries];
    setUnsubHist(upd); saveUnsub(upd);
    setSelected(new Set());
    setModal({ open: false, type: null, item: null, processing: false });
    toast(`Unsubscribed from ${toProc.length} sender${toProc.length > 1 ? "s" : ""} ✓`, "success", 4000);
  }, [result, selected, unsubHist, blockHist]);

  // ── Block ──────────────────────────────────────────────────────────────────
  const openBlockModal = useCallback((item) => {
    setModal({ open: true, type: "block", item, processing: false });
  }, []);

  const confirmBlock = useCallback(async () => {
    const { item } = modal;
    if (!item) return;
    setModal((m) => ({ ...m, processing: true }));
    const token = localStorage.getItem("gmail_token");
    try {
      await createBlockFilter(token, extractEmail(item.from));
      const entry = { domain: item.domain, from: item.from, subject: item.subject, email: extractEmail(item.from), at: new Date().toISOString() };
      const upd   = [...blockHist, entry];
      setBlockHist(upd); saveBlock(upd);
      setModal({ open: false, type: null, item: null, processing: false });
      toast(`${item.domain} blocked — future emails go to Trash ✓`, "success");
    } catch (err) {
      setModal((m) => ({ ...m, processing: false }));
      if (err.message === "TOKEN_EXPIRED") { localStorage.removeItem("gmail_token"); navigate("/login"); return; }
      if (err.message === "PERMISSION_DENIED") {
        toast("Permission denied. Log out and log in again to grant Gmail filter access.", "error", 6000);
      } else {
        toast(`Block failed: ${err.message}`, "error", 5000);
      }
    }
  }, [modal, blockHist, navigate]);

  const closeModal = () => { if (!modal.processing) setModal({ open: false, type: null, item: null, processing: false }); };

  const handleLogout = () => {
    localStorage.removeItem("detachx_user");
    localStorage.removeItem("gmail_token");
    localStorage.removeItem("scan_result");
    navigate("/");
  };

  const fmtS = (iso) => iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
  const fmt  = (iso) => iso ? new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

  if (!result) return null;

  // Active = not yet handled
  const activeList  = result.unsubList.filter((i) => !handledDomains.has(i.domain));
  const pendingCount = activeList.length;

  return (
    <>
      <style>{S}</style>
      <div className="rp">
        <div className="top-bar" />

        {/* Nav */}
        <nav className="rnav">
          <div className="wm">Detach<span>X</span></div>
          <div className="nr">
            {user && <><img src={user.picture} alt="" referrerPolicy="no-referrer" /><span className="ne">{user.email}</span></>}
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

        {/* ── Stats: 5 cards ── */}
        <div className="sgrid">
          {/* Total */}
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
          {/* Active */}
          <div className="scard">
            <div className="ac" style={{ background: "#F59E0B" }} />
            <div className="sico" style={{ background: "rgba(245,158,11,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="#F59E0B" strokeWidth="1.4"/>
                <path d="M9 6v3.5l2 2" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="slbl">Active</div>
            <div className="sval">{pendingCount}</div>
            <div className="ssub">pending action</div>
          </div>
          {/* Newsletters */}
          <div className="scard">
            <div className="ac" style={{ background: "#3B82F6" }} />
            <div className="sico" style={{ background: "rgba(59,130,246,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 5h12M3 9h12M3 13h7" stroke="#3B82F6" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="slbl">Newsletters</div>
            <div className="sval">{result.newsletters}</div>
            <div className="ssub">detected</div>
          </div>
          {/* Unsubscribed */}
          <div className="scard">
            <div className="ac" style={{ background: "#22C55E" }} />
            <div className="sico" style={{ background: "rgba(34,197,94,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9l4 4 8-8" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="slbl">Unsubscribed</div>
            <div className="sval">{unsubHist.length}</div>
            <div className="ssub">all time</div>
          </div>
          {/* Blocked */}
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
            <div className="ssub">filtered to Trash</div>
          </div>
        </div>

        {/* ── Main section ── */}
        <div className="sec">
          <div className="shead">
            <span className="stitle">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1L9 5.5H14L10 8.5L11.5 13L7.5 10.5L3.5 13L5 8.5L1 5.5H6L7.5 1Z" stroke="#6C63FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Sender Management
            </span>

            {/* Bulk toolbar — active tab only */}
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

          {/* ── 3 tabs ── */}
          <div className="tabs">
            <button className={`tab${activeTab === "active" ? " active" : ""}`} onClick={() => setActiveTab("active")}>
              Active
              <span className="tab-count">{pendingCount}</span>
            </button>
            <button className={`tab t-green${activeTab === "unsub" ? " active" : ""}`} onClick={() => setActiveTab("unsub")}>
              Unsubscribed
              <span className="tab-count">{unsubHist.length}</span>
            </button>
            <button className={`tab t-red${activeTab === "blocked" ? " active" : ""}`} onClick={() => setActiveTab("blocked")}>
              Blocked
              <span className="tab-count">{blockHist.length}</span>
            </button>
          </div>

          {/* ══ ACTIVE TAB ══ */}
          {activeTab === "active" && (
            <div className="ulist">
              {activeList.length === 0 ? (
                <div className="empty">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="#6C63FF" strokeWidth="1.5"/>
                    <path d="M10 16l4 4 8-8" stroke="#6C63FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>All senders handled! Inbox is clean.</p>
                </div>
              ) : (
                activeList.map((item, i) => {
                  const hasLink    = !!item.unsubUrl;
                  const isSelected = selected.has(item.domain);
                  return (
                    <div className={`urow${isSelected ? " sel" : ""}`} key={i}>
                      {/* Checkbox only when unsub link exists */}
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
                      </div>
                      {/* ✅ Has link → UNSUB | No link → BLOCK */}
                      {hasLink
                        ? <button className="abtn unsub" onClick={() => doUnsub(item)}>Unsub</button>
                        : <button className="abtn block" onClick={() => openBlockModal(item)}>Block</button>
                      }
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ══ UNSUBSCRIBED TAB ══ — only unsub actions, never blocked */}
          {activeTab === "unsub" && (
            <div className="ulist">
              {unsubHist.length === 0 ? (
                <div className="empty">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="#22C55E" strokeWidth="1.5"/>
                    <path d="M10 16l4 4 8-8" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>No unsubscriptions yet.<br/>Click Unsub on senders with a link.</p>
                </div>
              ) : (
                [...unsubHist].reverse().map((item, i) => (
                  <div className="urow done done-u" key={i}>
                    <div className="ulet green">{(item.domain?.[0] || "?").toUpperCase()}</div>
                    <div className="uinfo">
                      <div className="ufrom">{item.from}</div>
                      <div className="usubj">{item.subject || "No subject"}</div>
                      <div className="udate">Unsubscribed on {fmtS(item.at)}</div>
                      {item.stillReceiving && (
                        <div className="uwarn">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="4" stroke="#F59E0B" strokeWidth="1.2"/>
                            <path d="M5 3v2M5 6.5h.01" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                          Still receiving emails — may need to re-unsubscribe
                        </div>
                      )}
                    </div>
                    <button className="abtn done-u" disabled>Done ✓</button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ══ BLOCKED TAB ══ — only block actions, never unsubscribed */}
          {activeTab === "blocked" && (
            <div className="ulist">
              {blockHist.length === 0 ? (
                <div className="empty">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="#EF4444" strokeWidth="1.5"/>
                    <path d="M5 5l22 22" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <p>No blocked senders yet.<br/>Click Block on senders with no unsubscribe link.</p>
                </div>
              ) : (
                [...blockHist].reverse().map((item, i) => (
                  <div className="urow done done-b" key={i}>
                    <div className="ulet red">{(item.domain?.[0] || "?").toUpperCase()}</div>
                    <div className="uinfo">
                      <div className="ufrom">{item.from}</div>
                      <div className="usubj">{item.email}</div>
                      <div className="udate">Blocked on {fmtS(item.at)}</div>
                    </div>
                    <button className="abtn done-b" disabled>Blocked</button>
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

      {/* ══ Bulk Unsub Modal ══ */}
      {modal.open && modal.type === "bulk" && (
        <div className="moverlay" onClick={closeModal}>
          <div className="mbox" onClick={(e) => e.stopPropagation()}>
            <div className="mico purple">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 4v7M11 15h.01" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="11" cy="11" r="9" stroke="#6C63FF" strokeWidth="1.6"/>
              </svg>
            </div>
            <h2 className="mtitle">Confirm Bulk Unsubscribe</h2>
            <p className="mbody">Each unsubscribe page opens in a new tab. These senders move to the Unsubscribed tab.</p>
            <div className="mcnt"><strong>{eligibleSel.length} sender{eligibleSel.length > 1 ? "s" : ""}</strong> will be processed</div>
            <div className="mslist">
              {result.unsubList
                .filter((i) => eligibleSel.includes(i.domain))
                .map((item, i) => <div className="msitem" key={i}>{item.from}</div>)}
            </div>
            <div className="macts">
              <button className="mcancel" onClick={closeModal}>Cancel</button>
              <button className="mconfirm purple" onClick={confirmBulk}>Yes, Unsubscribe {eligibleSel.length}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Block Modal ══ */}
      {modal.open && modal.type === "block" && modal.item && (
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
              A Gmail filter will be created. Future emails from this sender will be moved to Trash automatically and will never appear in your Inbox.
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
                  <button className="mconfirm red" onClick={confirmBlock}>Confirm — Block Sender</button>
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