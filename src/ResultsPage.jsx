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
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 1.5rem 2.5rem;
    border-bottom: 1px solid #1E1E2A;
  }
  .results-nav .wordmark {
    font-size: 1rem; font-weight: 600;
    letter-spacing: 0.08em; color: #F0EEE9;
  }
  .results-nav .wordmark span { color: #6C63FF; }
  .nav-right { display: flex; align-items: center; gap: 0.75rem; }
  .nav-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid #2A2A38; object-fit: cover;
  }
  .nav-email { font-size: 0.78rem; color: #6B6880; }
  .nav-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.78rem; font-weight: 500; color: #4A4860;
    background: none; border: 1px solid #1E1E2A;
    border-radius: 6px; padding: 0.35rem 0.85rem;
    cursor: pointer; transition: color 0.2s, border-color 0.2s;
  }
  .nav-btn:hover { color: #6B6880; border-color: #2A2A38; }

  /* Hero */
  .results-hero {
    text-align: center; padding: 3.5rem 2rem 0.5rem;
    animation: fade-up 0.5s ease forwards;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 0.4rem;
    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: #6C63FF;
    background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2);
    border-radius: 99px; padding: 0.35rem 1rem; margin-bottom: 1.25rem;
  }
  .results-hero h1 {
    font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 700;
    letter-spacing: -0.03em; margin: 0 0 0.6rem;
  }
  .results-hero p { font-size: 0.9rem; color: #6B6880; font-weight: 300; margin: 0; }
  .scan-meta { font-size: 0.72rem; color: #4A4860; margin-top: 0.5rem; }

  /* Stats */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem; max-width: 900px;
    margin: 2.5rem auto 0; padding: 0 2rem;
    animation: fade-up 0.5s ease 0.1s both;
  }
  .stat-card {
    background: #111118; border: 1px solid #1E1E2A;
    border-radius: 14px; padding: 1.5rem 1.5rem 1.25rem;
    position: relative; overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
  }
  .stat-card:hover { border-color: #2A2A38; transform: translateY(-2px); }
  .stat-card .accent {
    position: absolute; top: 0; left: 0; right: 0;
    height: 2px; border-radius: 2px 2px 0 0;
  }
  .stat-icon {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1rem;
  }
  .stat-label {
    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: #4A4860; margin-bottom: 0.35rem;
  }
  .stat-value {
    font-size: 2.4rem; font-weight: 700; letter-spacing: -0.04em;
    color: #F0EEE9; line-height: 1; margin-bottom: 0.25rem;
  }
  .stat-sub { font-size: 0.73rem; color: #6B6880; font-weight: 300; }

  /* Section */
  .section {
    max-width: 900px; margin: 3rem auto 0; padding: 0 2rem;
    animation: fade-up 0.5s ease 0.2s both;
  }
  .section-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;
  }
  .section-title {
    font-size: 0.95rem; font-weight: 600; color: #F0EEE9;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .section-pill {
    font-size: 0.72rem; color: #6B6880;
    background: #1A1A25; border: 1px solid #2A2A38;
    border-radius: 99px; padding: 0.2rem 0.75rem;
  }

  /* Filter tabs */
  .filter-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
  .filter-tab {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.78rem; font-weight: 600;
    padding: 0.4rem 1rem; border-radius: 99px;
    border: 1px solid #2A2A38; background: transparent;
    color: #6B6880; cursor: pointer; transition: all 0.2s;
  }
  .filter-tab:hover { color: #F0EEE9; border-color: #444; }
  .filter-tab.active {
    background: rgba(108,99,255,0.12);
    border-color: rgba(108,99,255,0.35); color: #A89DFF;
  }

  /* Bulk toolbar */
  .bulk-toolbar { display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; }
  .bulk-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em;
    border-radius: 7px; padding: 0.38rem 0.9rem; border: 1px solid;
    cursor: pointer; transition: background 0.2s, border-color 0.2s, color 0.2s;
    white-space: nowrap;
  }
  .bulk-btn.select-all {
    color: #6C63FF; background: rgba(108,99,255,0.08);
    border-color: rgba(108,99,255,0.22);
  }
  .bulk-btn.select-all:hover { background: rgba(108,99,255,0.16); border-color: rgba(108,99,255,0.4); }
  .bulk-btn.clear { color: #6B6880; background: transparent; border-color: #2A2A38; }
  .bulk-btn.clear:hover { color: #F0EEE9; border-color: #444; }
  .bulk-btn.unsub-selected {
    color: #0A0A0F; background: #EF4444; border-color: #EF4444;
  }
  .bulk-btn.unsub-selected:hover { background: #f87171; border-color: #f87171; }
  .bulk-btn.unsub-selected:disabled { opacity: 0.4; cursor: not-allowed; }
  .selected-count { font-size: 0.75rem; color: #0A0A0F; margin-left: 0.1rem; }

  /* List rows */
  .unsub-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .unsub-item {
    display: flex; align-items: center; gap: 0.85rem;
    background: #111118; border: 1px solid #1E1E2A;
    border-radius: 10px; padding: 0.85rem 1.1rem;
    transition: border-color 0.2s, background 0.2s;
  }
  .unsub-item:hover:not(.done):not(.no-action) { border-color: #2A2A38; }
  .unsub-item.selected {
    border-color: rgba(108,99,255,0.35);
    background: rgba(108,99,255,0.04);
  }
  .unsub-item.done {
    opacity: 0.5; background: #0D150D; border-color: rgba(34,197,94,0.15);
  }
  .unsub-item.no-action { border-color: #1A1A1A; }

  /* Checkbox */
  .unsub-checkbox {
    appearance: none; -webkit-appearance: none;
    width: 17px; height: 17px; border-radius: 4px;
    border: 1.5px solid #3A3A4A; background: transparent;
    cursor: pointer; flex-shrink: 0; position: relative;
    transition: border-color 0.15s, background 0.15s; margin: 0;
  }
  .unsub-checkbox:checked { background: #6C63FF; border-color: #6C63FF; }
  .unsub-checkbox:checked::after {
    content: ''; position: absolute;
    left: 4px; top: 1.5px; width: 5px; height: 9px;
    border: 2px solid #fff; border-top: none; border-left: none;
    transform: rotate(42deg);
  }
  .unsub-checkbox:disabled { opacity: 0.3; cursor: not-allowed; }

  .unsub-letter {
    width: 36px; height: 36px; border-radius: 8px;
    background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.85rem; font-weight: 700; color: #6C63FF;
    flex-shrink: 0; text-transform: uppercase;
  }
  .unsub-letter.done-letter {
    background: rgba(34,197,94,0.08); border-color: rgba(34,197,94,0.2); color: #22C55E;
  }
  .unsub-letter.blocked-letter {
    background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); color: #EF4444;
  }
  .unsub-letter.archived-letter {
    background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.2); color: #3B82F6;
  }
  .unsub-letter.deleted-letter {
    background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); color: #F59E0B;
  }

  .unsub-info { flex: 1; min-width: 0; }
  .unsub-from {
    font-size: 0.83rem; font-weight: 500; color: #F0EEE9;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .unsub-subject {
    font-size: 0.73rem; color: #4A4860;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px;
  }
  .unsub-date { font-size: 0.68rem; color: #3A3A4A; margin-top: 2px; }
  .still-receiving-warn {
    font-size: 0.68rem; color: #F59E0B; margin-top: 3px;
    display: flex; align-items: center; gap: 4px;
  }

  /* Action buttons area — for no-link rows */
  .action-group {
    display: flex; gap: 0.4rem; flex-shrink: 0; flex-wrap: wrap;
    justify-content: flex-end;
  }

  /* Individual row buttons */
  .unsub-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.62rem; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; border-radius: 99px;
    padding: 0.25rem 0.75rem; border: 1px solid; cursor: pointer;
    white-space: nowrap; flex-shrink: 0;
    transition: background 0.2s, transform 0.15s; line-height: 1.6;
  }
  .unsub-btn.active {
    color: #EF4444; background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.25);
  }
  .unsub-btn.active:hover { background: rgba(239,68,68,0.18); transform: scale(1.04); }
  .unsub-btn.done-btn {
    color: #22C55E; background: rgba(34,197,94,0.08);
    border-color: rgba(34,197,94,0.25); cursor: default;
  }
  .unsub-btn.blocked-btn {
    color: #EF4444; background: rgba(239,68,68,0.08);
    border-color: rgba(239,68,68,0.2); cursor: default;
  }
  .unsub-btn.archived-btn {
    color: #3B82F6; background: rgba(59,130,246,0.08);
    border-color: rgba(59,130,246,0.2); cursor: default;
  }
  .unsub-btn.deleted-btn {
    color: #F59E0B; background: rgba(245,158,11,0.08);
    border-color: rgba(245,158,11,0.2); cursor: default;
  }

  /* No-link action buttons */
  .nl-btn {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.05em;
    text-transform: uppercase; border-radius: 6px;
    padding: 0.22rem 0.6rem; border: 1px solid; cursor: pointer;
    white-space: nowrap; transition: background 0.2s, transform 0.15s; line-height: 1.6;
  }
  .nl-btn.block {
    color: #EF4444; background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.2);
  }
  .nl-btn.block:hover { background: rgba(239,68,68,0.16); transform: scale(1.04); }
  .nl-btn.archive {
    color: #3B82F6; background: rgba(59,130,246,0.07); border-color: rgba(59,130,246,0.2);
  }
  .nl-btn.archive:hover { background: rgba(59,130,246,0.16); transform: scale(1.04); }
  .nl-btn.autodel {
    color: #F59E0B; background: rgba(245,158,11,0.07); border-color: rgba(245,158,11,0.2);
  }
  .nl-btn.autodel:hover { background: rgba(245,158,11,0.16); transform: scale(1.04); }

  /* Empty state */
  .empty-state {
    text-align: center; padding: 2.5rem 1rem;
    color: #4A4860; font-size: 0.85rem; line-height: 1.7;
  }
  .empty-state svg { margin-bottom: 0.75rem; opacity: 0.3; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.78);
    z-index: 100; display: flex; align-items: center;
    justify-content: center; padding: 1.5rem;
    animation: fade-in 0.2s ease forwards;
  }
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  .modal-box {
    background: #111118; border: 1px solid #2A2A38;
    border-radius: 16px; padding: 2.25rem 2rem 1.75rem;
    max-width: 440px; width: 100%;
    box-shadow: 0 32px 64px rgba(0,0,0,0.6);
    animation: modal-up 0.25s ease forwards;
  }
  @keyframes modal-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .modal-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.25rem;
  }
  .modal-icon.red   { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.2); }
  .modal-icon.blue  { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2); }
  .modal-icon.amber { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); }
  .modal-icon.purple{ background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2); }
  .modal-title {
    font-size: 1.2rem; font-weight: 700; letter-spacing: -0.02em;
    color: #F0EEE9; margin: 0 0 0.5rem;
  }
  .modal-body {
    font-size: 0.85rem; color: #6B6880; font-weight: 300;
    line-height: 1.6; margin: 0 0 1rem;
  }
  .modal-sender-box {
    background: #16161F; border: 1px solid #1E1E2A;
    border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.5rem;
  }
  .modal-sender-name {
    font-size: 0.85rem; font-weight: 600; color: #F0EEE9; margin-bottom: 2px;
  }
  .modal-sender-email { font-size: 0.75rem; color: #4A4860; }
  .modal-sender-list {
    max-height: 140px; overflow-y: auto; margin-bottom: 1.5rem;
    display: flex; flex-direction: column; gap: 0.35rem;
    scrollbar-width: thin; scrollbar-color: #2A2A38 transparent;
  }
  .modal-sender-item {
    font-size: 0.75rem; color: #6B6880; background: #16161F;
    border: 1px solid #1E1E2A; border-radius: 6px;
    padding: 0.4rem 0.75rem; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }
  .modal-count {
    font-size: 0.8rem; color: #F0EEE9;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15);
    border-radius: 8px; padding: 0.6rem 0.9rem; margin-bottom: 1.25rem;
  }
  .modal-count strong { color: #EF4444; }
  .modal-actions { display: flex; gap: 0.75rem; }
  .modal-cancel {
    flex: 1; font-family: 'Space Grotesk', sans-serif;
    font-size: 0.88rem; font-weight: 600; color: #6B6880;
    background: transparent; border: 1px solid #2A2A38;
    border-radius: 8px; padding: 0.75rem; cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
  }
  .modal-cancel:hover { color: #F0EEE9; border-color: #444; }
  .modal-confirm {
    flex: 2; font-family: 'Space Grotesk', sans-serif;
    font-size: 0.88rem; font-weight: 700; color: #fff;
    border: none; border-radius: 8px; padding: 0.75rem;
    cursor: pointer; transition: opacity 0.2s;
  }
  .modal-confirm:hover { opacity: 0.88; }
  .modal-confirm.red   { background: #EF4444; }
  .modal-confirm.blue  { background: #3B82F6; }
  .modal-confirm.amber { background: #F59E0B; }
  .modal-confirm.purple{ background: #6C63FF; }

  /* Processing spinner inside modal */
  .modal-processing {
    display: flex; align-items: center; justify-content: center;
    gap: 0.6rem; font-size: 0.82rem; color: #6B6880;
    padding: 0.5rem 0;
  }
  .spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid #2A2A38; border-top-color: #6C63FF;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Toast */
  .toast-wrap {
    position: fixed; bottom: 2rem; left: 50%;
    transform: translateX(-50%); z-index: 999;
    display: flex; flex-direction: column;
    align-items: center; gap: 0.5rem; pointer-events: none;
  }
  .toast {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.82rem; font-weight: 500;
    padding: 0.65rem 1.25rem; border-radius: 99px; border: 1px solid;
    white-space: nowrap; animation: toast-in 0.3s ease forwards; pointer-events: none;
  }
  .toast.success { color: #22C55E; background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.25); }
  .toast.warn    { color: #F59E0B; background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.25); }
  .toast.info    { color: #6C63FF; background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.25); }
  .toast.error   { color: #EF4444; background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.25); }
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Actions row */
  .actions-row {
    max-width: 900px; margin: 2rem auto 0;
    padding: 0 2rem; display: flex; gap: 0.85rem; flex-wrap: wrap;
  }
  .action-btn {
    display: inline-flex; align-items: center; gap: 0.5rem;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.83rem; font-weight: 600; color: #6C63FF;
    background: rgba(108,99,255,0.08); border: 1px solid rgba(108,99,255,0.2);
    border-radius: 8px; padding: 0.65rem 1.2rem; cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .action-btn:hover { background: rgba(108,99,255,0.15); border-color: rgba(108,99,255,0.4); }

  @keyframes fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 600px) {
    .results-nav { padding: 1.25rem; }
    .nav-email   { display: none; }
    .stats-grid  { grid-template-columns: repeat(2,1fr); padding: 0 1.25rem; }
    .section     { padding: 0 1.25rem; }
    .actions-row { padding: 0 1.25rem; }
    .modal-box   { padding: 1.75rem 1.25rem 1.5rem; }
    .action-group { gap: 0.3rem; }
    .nl-btn { font-size: 0.55rem; padding: 0.2rem 0.5rem; }
  }
`;

// ── localStorage helpers ─────────────────────────────────────────────────────
function loadHistory() {
  try { return JSON.parse(localStorage.getItem("detachx_unsub_history") || "[]"); }
  catch { return []; }
}
function saveHistory(entries) {
  localStorage.setItem("detachx_unsub_history", JSON.stringify(entries));
}

// ── Gmail API — create filter ────────────────────────────────────────────────
async function createGmailFilter(token, fromEmail, action) {
  /*
    action: "block" | "archive" | "delete"
    Gmail Filters API: POST /gmail/v1/users/me/settings/filters
  */
  const criteria = { from: fromEmail };
  const actionObj = {};

  if (action === "block") {
    // Mark as spam
    actionObj.addLabelIds    = ["SPAM"];
    actionObj.removeLabelIds = ["INBOX"];
  } else if (action === "archive") {
    // Skip inbox (archive)
    actionObj.removeLabelIds = ["INBOX"];
  } else if (action === "delete") {
    // Move to trash
    actionObj.addLabelIds    = ["TRASH"];
    actionObj.removeLabelIds = ["INBOX"];
  }

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/settings/filters",
    {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ criteria, action: actionObj }),
    }
  );

  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `FILTER_ERROR_${res.status}`);
  }
  return res.json();
}

// ── Extract sender email from "Name <email>" format ──────────────────────────
function extractEmail(from) {
  const match = from.match(/<([^>]+)>/);
  return match ? match[1] : from.trim();
}

// ── Toast counter ────────────────────────────────────────────────────────────
let toastId = 0;

// ── Action config ────────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  block: {
    label:       "Block Sender",
    btnClass:    "red",
    iconColor:   "#EF4444",
    confirmColor:"red",
    historyKey:  "blocked",
    btnLabel:    "Blocked",
    letterClass: "blocked-letter",
    badgeClass:  "blocked-btn",
    description: "Future emails from this sender will be marked as spam and removed from your inbox.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="#EF4444" strokeWidth="1.6"/>
        <path d="M4 4l14 14" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  archive: {
    label:       "Archive Future Emails",
    btnClass:    "blue",
    iconColor:   "#3B82F6",
    confirmColor:"blue",
    historyKey:  "archived",
    btnLabel:    "Archived",
    letterClass: "archived-letter",
    badgeClass:  "archived-btn",
    description: "Future emails from this sender will skip your inbox and go straight to All Mail.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 7h16v11a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm0 0l1-3h14l1 3" stroke="#3B82F6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12h4" stroke="#3B82F6" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  delete: {
    label:       "Auto Delete Future Emails",
    btnClass:    "amber",
    iconColor:   "#F59E0B",
    confirmColor:"amber",
    historyKey:  "deleted",
    btnLabel:    "Auto Delete",
    letterClass: "deleted-letter",
    badgeClass:  "deleted-btn",
    description: "Future emails from this sender will be automatically moved to Trash.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 6h14M9 6V4h4v2M10 11v5M12 11v5" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 6l1 13h10L17 6" stroke="#F59E0B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("detachx_user") || "null");

  const [result,    setResult]    = useState(null);
  const [history,   setHistory]   = useState([]);
  const [selected,  setSelected]  = useState(new Set());
  const [activeTab, setActiveTab] = useState("active");
  const [toasts,    setToasts]    = useState([]);

  // Modal state
  const [modal, setModal] = useState({
    open:        false,
    type:        null,   // "unsub-bulk" | "block" | "archive" | "delete"
    item:        null,   // single item
    processing:  false,
  });

  // ── Load ─────────────────────────────────────────────────────────────────────
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
    setHistory(loadHistory());
  }, []);

  // ── Toast ─────────────────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = ++toastId;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), duration);
  }, []);

  // ── Derived: domains already in history ──────────────────────────────────────
  const historyDomainMap = Object.fromEntries(history.map((h) => [h.domain, h]));

  // ── Checkbox logic ────────────────────────────────────────────────────────────
  const toggleOne = useCallback((domain) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(domain) ? next.delete(domain) : next.add(domain);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!result) return;
    const eligible = result.unsubList
      .filter((i) => !historyDomainMap[i.domain] && i.unsubUrl)
      .map((i) => i.domain);
    setSelected(new Set(eligible));
    showToast(`${eligible.length} senders selected`, "info", 2000);
  }, [result, history, showToast]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  // ── Individual unsub ─────────────────────────────────────────────────────────
  const handleUnsubOne = useCallback((item) => {
    if (historyDomainMap[item.domain]) return;
    if (!item.unsubUrl) {
      showToast(`No unsubscribe link for ${item.domain}`, "warn");
      return;
    }
    window.open(item.unsubUrl, "_blank", "noopener,noreferrer");
    const newEntry = {
      domain: item.domain, from: item.from, subject: item.subject,
      unsubUrl: item.unsubUrl, action: "unsubscribed",
      unsubscribedAt: new Date().toISOString(),
    };
    const updated = [...history, newEntry];
    setHistory(updated);
    saveHistory(updated);
    setSelected((prev) => { const n = new Set(prev); n.delete(item.domain); return n; });
    showToast(`Unsubscribed from ${item.domain} ✓`, "success");
  }, [history, showToast]);

  // ── Bulk unsub ───────────────────────────────────────────────────────────────
  const eligibleSelected = result
    ? [...selected].filter((d) => {
        const item = result.unsubList.find((i) => i.domain === d);
        return item && item.unsubUrl && !historyDomainMap[d];
      })
    : [];

  const selectedItems = result
    ? result.unsubList.filter((i) => selected.has(i.domain))
    : [];

  const handleBulkClick = () => {
    if (eligibleSelected.length === 0) {
      showToast("Select at least one sender with a link first", "warn");
      return;
    }
    setModal({ open: true, type: "unsub-bulk", item: null, processing: false });
  };

  const handleBulkConfirm = useCallback(() => {
    setModal((m) => ({ ...m, processing: true }));
    if (!result) return;
    const toProcess = result.unsubList.filter(
      (i) => selected.has(i.domain) && i.unsubUrl && !historyDomainMap[i.domain]
    );
    toProcess.forEach((item, idx) => {
      setTimeout(() => {
        window.open(item.unsubUrl, "_blank", "noopener,noreferrer");
      }, idx * 300);
    });
    const newEntries = toProcess.map((item) => ({
      domain: item.domain, from: item.from, subject: item.subject,
      unsubUrl: item.unsubUrl, action: "unsubscribed",
      unsubscribedAt: new Date().toISOString(),
    }));
    const updated = [...history, ...newEntries];
    setHistory(updated);
    saveHistory(updated);
    setSelected(new Set());
    setModal({ open: false, type: null, item: null, processing: false });
    showToast(`Unsubscribed from ${toProcess.length} sender${toProcess.length > 1 ? "s" : ""} ✓`, "success", 4000);
  }, [result, selected, history, showToast]);

  // ── No-link actions: open modal ──────────────────────────────────────────────
  const handleNoLinkAction = useCallback((item, actionType) => {
    setModal({ open: true, type: actionType, item, processing: false });
  }, []);

  // ── No-link action confirm ───────────────────────────────────────────────────
  const handleActionConfirm = useCallback(async () => {
    const { type, item } = modal;
    if (!item || !type) return;
    setModal((m) => ({ ...m, processing: true }));

    const token       = localStorage.getItem("gmail_token");
    const senderEmail = extractEmail(item.from);
    const cfg         = ACTION_CONFIG[type];

    try {
      await createGmailFilter(token, senderEmail, type);

      const newEntry = {
        domain:    item.domain,
        from:      item.from,
        subject:   item.subject,
        unsubUrl:  null,
        action:    cfg.historyKey,          // "blocked" | "archived" | "deleted"
        filteredEmail: senderEmail,
        unsubscribedAt: new Date().toISOString(),
      };
      const updated = [...history, newEntry];
      setHistory(updated);
      saveHistory(updated);
      setModal({ open: false, type: null, item: null, processing: false });
      showToast(`${cfg.label} applied for ${item.domain} ✓`, "success");
    } catch (err) {
      setModal((m) => ({ ...m, processing: false }));
      if (err.message === "TOKEN_EXPIRED") {
        localStorage.removeItem("gmail_token");
        navigate("/login");
        return;
      }
      // Graceful degradation — permission missing or API error
      if (err.message.includes("403") || err.message.includes("insufficientPermissions")) {
        showToast(
          "Permission needed. Please log out and log in again to grant Gmail filter access.",
          "error", 5000
        );
      } else {
        showToast(`Failed to apply filter: ${err.message}`, "error", 5000);
      }
    }
  }, [modal, history, navigate, showToast]);

  const closeModal = () => {
    if (!modal.processing)
      setModal({ open: false, type: null, item: null, processing: false });
  };

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("detachx_user");
    localStorage.removeItem("gmail_token");
    localStorage.removeItem("scan_result");
    navigate("/");
  };

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }) : "";

  const formatShortDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }) : "";

  // Label for history action badge
  const actionBadge = (action) => {
    if (action === "unsubscribed") return { cls: "done-btn",     label: "Done ✓" };
    if (action === "blocked")      return { cls: "blocked-btn",  label: "Blocked" };
    if (action === "archived")     return { cls: "archived-btn", label: "Archived" };
    if (action === "deleted")      return { cls: "deleted-btn",  label: "Auto Delete" };
    return { cls: "done-btn", label: "Done ✓" };
  };

  const actionLetterClass = (action) => {
    if (action === "blocked")  return "blocked-letter";
    if (action === "archived") return "archived-letter";
    if (action === "deleted")  return "deleted-letter";
    return "done-letter";
  };

  if (!result) return null;

  // Current modal config
  const modalCfg = modal.type && modal.type !== "unsub-bulk"
    ? ACTION_CONFIG[modal.type]
    : null;

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
          {result.scannedAt && <p className="scan-meta">Scanned on {formatDate(result.scannedAt)}</p>}
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
            <div className="accent" style={{ background: "#22C55E" }} />
            <div className="stat-icon" style={{ background: "rgba(34,197,94,0.12)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9l4 4 8-8" stroke="#22C55E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="stat-label">Cleaned</div>
            <div className="stat-value">{history.length}</div>
            <div className="stat-sub">senders handled</div>
          </div>
        </div>

        {/* Unsubscribe section */}
        <div className="section">
          <div className="section-head">
            <span className="section-title">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1L9 5.5H14L10 8.5L11.5 13L7.5 10.5L3.5 13L5 8.5L1 5.5H6L7.5 1Z"
                  stroke="#6C63FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Candidates
            </span>
            {activeTab === "active" && (
              <div className="bulk-toolbar">
                <button className="bulk-btn select-all" onClick={selectAll}>Select All</button>
                {selected.size > 0 && (
                  <button className="bulk-btn clear" onClick={clearSelection}>Clear</button>
                )}
                <button
                  className="bulk-btn unsub-selected"
                  onClick={handleBulkClick}
                  disabled={eligibleSelected.length === 0}
                >
                  Unsubscribe Selected
                  {eligibleSelected.length > 0 && (
                    <span className="selected-count">({eligibleSelected.length})</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Filter tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab${activeTab === "active" ? " active" : ""}`}
              onClick={() => setActiveTab("active")}
            >
              Active Candidates
              <span style={{ marginLeft: "0.4rem", opacity: 0.6 }}>({result.unsubList.length})</span>
            </button>
            <button
              className={`filter-tab${activeTab === "history" ? " active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              Already Unsubscribed
              <span style={{ marginLeft: "0.4rem", opacity: 0.6 }}>({history.length})</span>
            </button>
          </div>

          {/* ── Active tab ── */}
          {activeTab === "active" && (
            <div className="unsub-list">
              {result.unsubList.length === 0 ? (
                <div className="empty-state">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="#6C63FF" strokeWidth="1.5"/>
                    <path d="M10 16l4 4 8-8" stroke="#6C63FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p>No active candidates. Your inbox looks clean!</p>
                </div>
              ) : (
                result.unsubList.map((item, i) => {
                  const histEntry  = historyDomainMap[item.domain];
                  const isDone     = !!histEntry;
                  const isSelected = selected.has(item.domain);
                  const hasLink    = !!item.unsubUrl;

                  // Already handled via any action
                  if (isDone) {
                    const badge = actionBadge(histEntry.action);
                    return (
                      <div className="unsub-item done" key={i}>
                        <input type="checkbox" className="unsub-checkbox" disabled checked={false} onChange={() => {}}/>
                        <div className={`unsub-letter ${actionLetterClass(histEntry.action)}`}>
                          {(item.domain?.[0] || "?").toUpperCase()}
                        </div>
                        <div className="unsub-info">
                          <div className="unsub-from">{item.from}</div>
                          <div className="unsub-subject">{item.subject || "No subject"}</div>
                        </div>
                        <button className={`unsub-btn ${badge.cls}`} disabled>{badge.label}</button>
                      </div>
                    );
                  }

                  return (
                    <div
                      className={`unsub-item${isSelected ? " selected" : ""}${!hasLink ? " no-action" : ""}`}
                      key={i}
                    >
                      {/* Checkbox — only for items with unsub link */}
                      <input
                        type="checkbox"
                        className="unsub-checkbox"
                        checked={isSelected}
                        disabled={!hasLink}
                        onChange={() => toggleOne(item.domain)}
                        title={!hasLink ? "Use action buttons below" : undefined}
                      />

                      <div className="unsub-letter">
                        {(item.domain?.[0] || "?").toUpperCase()}
                      </div>

                      <div className="unsub-info">
                        <div className="unsub-from">{item.from}</div>
                        <div className="unsub-subject">{item.subject || "No subject"}</div>
                      </div>

                      {/* ── Has link: show Unsub button ── */}
                      {hasLink && (
                        <button
                          className="unsub-btn active"
                          onClick={() => handleUnsubOne(item)}
                          title={item.unsubUrl}
                        >
                          Unsub
                        </button>
                      )}

                      {/* ── No link: show 3 action buttons ── */}
                      {!hasLink && (
                        <div className="action-group">
                          <button
                            className="nl-btn block"
                            onClick={() => handleNoLinkAction(item, "block")}
                            title="Block this sender"
                          >
                            Block
                          </button>
                          <button
                            className="nl-btn archive"
                            onClick={() => handleNoLinkAction(item, "archive")}
                            title="Archive future emails"
                          >
                            Archive
                          </button>
                          <button
                            className="nl-btn autodel"
                            onClick={() => handleNoLinkAction(item, "delete")}
                            title="Auto delete future emails"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── History tab ── */}
          {activeTab === "history" && (
            <div className="unsub-list">
              {history.length === 0 ? (
                <div className="empty-state">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="14" stroke="#6B6880" strokeWidth="1.5"/>
                    <path d="M16 10v6l4 2" stroke="#6B6880" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <p>No history yet.<br/>Unsubscribe or block senders to see them here.</p>
                </div>
              ) : (
                [...history].reverse().map((item, i) => {
                  const badge = actionBadge(item.action);
                  return (
                    <div className="unsub-item done" key={i}>
                      <div className={`unsub-letter ${actionLetterClass(item.action)}`}>
                        {(item.domain?.[0] || "?").toUpperCase()}
                      </div>
                      <div className="unsub-info">
                        <div className="unsub-from">{item.from}</div>
                        <div className="unsub-subject">{item.subject || "No subject"}</div>
                        <div className="unsub-date">
                          {badge.label} on {formatShortDate(item.unsubscribedAt)}
                        </div>
                        {item.stillReceiving && (
                          <div className="still-receiving-warn">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <circle cx="5" cy="5" r="4" stroke="#F59E0B" strokeWidth="1.2"/>
                              <path d="M5 3v2M5 6.5h.01" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round"/>
                            </svg>
                            Still receiving emails — may need to re-unsubscribe
                          </div>
                        )}
                      </div>
                      <button className={`unsub-btn ${badge.cls}`} disabled>{badge.label}</button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Bottom actions */}
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

      {/* ══ MODALS ══ */}

      {/* Bulk unsub modal */}
      {modal.open && modal.type === "unsub-bulk" && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon purple">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 4v7M11 15h.01" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="11" cy="11" r="9" stroke="#6C63FF" strokeWidth="1.6"/>
              </svg>
            </div>
            <h2 className="modal-title">Confirm Unsubscribe</h2>
            <p className="modal-body">
              Each unsubscribe page will open in a new tab and senders will be saved to your history.
            </p>
            <div className="modal-count">
              <strong>{eligibleSelected.length} sender{eligibleSelected.length > 1 ? "s" : ""}</strong> will be processed
            </div>
            <div className="modal-sender-list">
              {selectedItems
                .filter((i) => i.unsubUrl && !historyDomainMap[i.domain])
                .map((item, i) => (
                  <div className="modal-sender-item" key={i}>{item.from}</div>
                ))}
            </div>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="modal-confirm purple" onClick={handleBulkConfirm}>
                Yes, Unsubscribe {eligibleSelected.length}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block / Archive / Delete modal */}
      {modal.open && modalCfg && modal.item && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-icon ${modalCfg.btnClass}`}>
              {modalCfg.icon}
            </div>
            <h2 className="modal-title">{modalCfg.label}</h2>
            <p className="modal-body">{modalCfg.description}</p>

            <div className="modal-sender-box">
              <div className="modal-sender-name">
                {modal.item.domain}
              </div>
              <div className="modal-sender-email">
                {extractEmail(modal.item.from)}
              </div>
            </div>

            {modal.processing ? (
              <div className="modal-processing">
                <div className="spinner" />
                Applying Gmail filter…
              </div>
            ) : (
              <div className="modal-actions">
                <button className="modal-cancel" onClick={closeModal}>Cancel</button>
                <button
                  className={`modal-confirm ${modalCfg.confirmColor}`}
                  onClick={handleActionConfirm}
                >
                  Confirm — {modalCfg.label}
                </button>
              </div>
            )}
          </div>
        </div> 
      )}

      {/* Toasts */}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
        ))}
      </div>
    </>
  );
}