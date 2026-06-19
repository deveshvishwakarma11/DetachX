import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import {
  loadUserSettings,
  saveUserSettings,
  resetUserSettings,
  loadScanHistory,
  fetchAllUserData,
  convertToCSV,
  deleteUserData,
  deleteAccount,
  getUserStatistics,
} from "./lib/userStorage";


// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const S = `
  *, *::before, *::after { box-sizing: border-box; }
  .sp { position: relative; min-height: 100dvh; background: #0A0A0F; font-family: 'Space Grotesk', sans-serif; color: #F0EEE9; padding: 0 0 6rem; overflow-x: hidden; }
  .sp .top-bar { height: 1px; background: linear-gradient(90deg, transparent, #1E1E2A 30%, #6C63FF 50%, #1E1E2A 70%, transparent); }
  .snv { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2rem; border-bottom: 1px solid #1E1E2A; }
  .snv .wm { font-size: 1rem; font-weight: 600; letter-spacing: 0.08em; color: #F0EEE9; }
  .snv .wm span { color: #6C63FF; }
  .snv .nr { display: flex; align-items: center; gap: 0.6rem; }
  .snv img { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #2A2A38; object-fit: cover; }
  .snv .ne { font-size: 0.75rem; color: #6B6880; }
  .nbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.75rem; font-weight: 500; color: #4A4860; background: none; border: 1px solid #1E1E2A; border-radius: 6px; padding: 0.3rem 0.75rem; cursor: pointer; transition: color 0.2s, border-color 0.2s; }
  .nbtn:hover { color: #6B6880; border-color: #2A2A38; }
  .shero { text-align: center; padding: 2.5rem 2rem 1rem; animation: fa 0.5s ease forwards; }
  .shero h1 { font-size: clamp(1.4rem, 3vw, 1.8rem); font-weight: 700; letter-spacing: -0.03em; margin: 0 0 0.3rem; }
  .shero p  { font-size: 0.82rem; color: #6B6880; font-weight: 300; margin: 0; }

  /* ── Tabs ── */
  .stabs { display: flex; gap: 0.35rem; max-width: 960px; margin: 1.5rem auto 0; padding: 0 2rem; flex-wrap: wrap; animation: fa 0.5s ease 0.1s both; }
  .stab { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 600; padding: 0.45rem 1.1rem; border-radius: 99px; border: 1px solid #2A2A38; background: transparent; color: #6B6880; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem; }
  .stab:hover { color: #F0EEE9; border-color: #444; }
  .stab.active { background: rgba(108,99,255,0.12); border-color: rgba(108,99,255,0.35); color: #A89DFF; }
  .stab .scnt { font-size: 0.65rem; background: rgba(255,255,255,0.06); border-radius: 99px; padding: 0.05rem 0.4rem; }

  /* ── Content sections ── */
  .ssec { max-width: 660px; margin: 1.5rem auto 0; padding: 0 2rem; animation: fa 0.5s ease 0.15s both; }
  .scard { background: #111118; border: 1px solid #1E1E2A; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; }
  .scard h3 { font-size: 0.85rem; font-weight: 600; color: #F0EEE9; margin: 0 0 0.25rem; }
  .scard .sd { font-size: 0.75rem; color: #6B6880; margin: 0 0 1rem; line-height: 1.5; }
  .srow { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #1E1E2A; }
  .srow:last-child { border-bottom: none; }
  .srow .sl { font-size: 0.8rem; color: #F0EEE9; }
  .srow .sv { font-size: 0.75rem; color: #6B6880; }
  .srow .sr { display: flex; align-items: center; gap: 0.5rem; }

  /* ── Toggle switch ── */
  .tog { position: relative; width: 38px; height: 20px; background: #2A2A38; border-radius: 99px; cursor: pointer; transition: background 0.2s; border: none; padding: 0; flex-shrink: 0; }
  .tog.on { background: #6C63FF; }
  .tog .tk { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #F0EEE9; transition: transform 0.2s; }
  .tog.on .tk { transform: translateX(18px); }

  /* ── Profile section ── */
  .phead { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
  .pav { width: 64px; height: 64px; border-radius: 50%; border: 2px solid #2A2A38; object-fit: cover; }
  .pinfo .pn { font-size: 1.1rem; font-weight: 600; color: #F0EEE9; }
  .pinfo .pe { font-size: 0.8rem; color: #6B6880; }
  .pinl { display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; }
  .pinl .dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
  .pinl .dot.on { background: #22C55E; }
  .pinl .dot.off { background: #6B6880; }

  /* ── Stats grid ── */
  .sgrd { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 0.6rem; margin-top: 1rem; }
  .sit { background: #0F0F16; border: 1px solid #1E1E2A; border-radius: 8px; padding: 0.75rem; text-align: center; }
  .sit .svl { font-size: 1.4rem; font-weight: 700; color: #F0EEE9; line-height: 1; margin-bottom: 2px; }
  .sit .slb { font-size: 0.65rem; color: #4A4860; text-transform: uppercase; letter-spacing: 0.06em; }

  /* ── Danger button ── */
  .dbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 600; padding: 0.55rem 1.1rem; border-radius: 6px; border: 1px solid rgba(239,68,68,0.3); background: rgba(239,68,68,0.08); color: #EF4444; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
  .dbtn:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.5); }
  .dbtn:disabled { opacity: 0.5; cursor: not-allowed; }
  .pbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 600; padding: 0.55rem 1.1rem; border-radius: 6px; border: 1px solid rgba(108,99,255,0.3); background: rgba(108,99,255,0.08); color: #6C63FF; cursor: pointer; transition: background 0.15s; }
  .pbtn:hover { background: rgba(108,99,255,0.15); }
  .pbtn:disabled { opacity: 0.5; cursor: not-allowed; }
  .sbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 600; padding: 0.55rem 1.1rem; border-radius: 6px; border: 1px solid #2A2A38; background: transparent; color: #6B6880; cursor: pointer; transition: color 0.2s; }
  .sbtn:hover { color: #F0EEE9; }

  /* ── Scan history ── */
  .shr { display: flex; align-items: center; gap: 0.7rem; padding: 0.65rem 0; border-bottom: 1px solid #0F0F16; }
  .shr:last-child { border-bottom: none; }
  .shd { flex: 1; }
  .shd .sht { font-size: 0.78rem; color: #F0EEE9; }
  .shd .shs { font-size: 0.68rem; color: #4A4860; }
  .shb { font-size: 0.68rem; padding: 2px 8px; border-radius: 99px; font-weight: 500; }
  .shb.inbox { background: rgba(108,99,255,0.1); color: #6C63FF; border: 1px solid rgba(108,99,255,0.2); }
  .shb.footprint { background: rgba(34,197,94,0.1); color: #22C55E; border: 1px solid rgba(34,197,94,0.2); }

  /* ── Export buttons ── */
  .exbtns { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .exbtn { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 600; padding: 0.55rem 1rem; border-radius: 6px; border: 1px solid rgba(108,99,255,0.3); background: rgba(108,99,255,0.06); color: #6C63FF; cursor: pointer; transition: background 0.15s; display: inline-flex; align-items: center; gap: 0.4rem; }
  .exbtn:hover { background: rgba(108,99,255,0.12); }
  .exbtn:disabled { opacity: 0.5; cursor: not-allowed; }
  .exbtn svg { flex-shrink: 0; }

  /* ── Confirmation modal ── */
  .moverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fi 0.2s ease forwards; }
  @keyframes fi { from { opacity:0; } to { opacity:1; } }
  .mbox { background: #111118; border: 1px solid #2A2A38; border-radius: 16px; padding: 2rem; max-width: 400px; width: 100%; box-shadow: 0 32px 64px rgba(0,0,0,0.65); animation: mu 0.25s ease forwards; }
  @keyframes mu { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  .mico { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }
  .mico.red { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); }
  .mico.purple { background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.2); }
  .mt { font-size: 1.05rem; font-weight: 700; color: #F0EEE9; margin: 0 0 0.4rem; }
  .mm { font-size: 0.82rem; color: #6B6880; margin: 0 0 1.25rem; line-height: 1.6; }
  .macts { display: flex; gap: 0.6rem; }
  .mcancel { flex: 1; font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem; font-weight: 600; color: #6B6880; background: transparent; border: 1px solid #2A2A38; border-radius: 8px; padding: 0.7rem; cursor: pointer; transition: color 0.2s; text-align: center; }
  .mcancel:hover { color: #F0EEE9; }
  .mconf { flex: 2; font-family: 'Space Grotesk', sans-serif; font-size: 0.85rem; font-weight: 700; border: none; border-radius: 8px; padding: 0.7rem; cursor: pointer; transition: opacity 0.2s; text-align: center; }
  .mconf:hover { opacity: 0.88; }
  .mconf.red { background: #EF4444; color: #fff; }
  .mconf.purple { background: #6C63FF; color: #fff; }
  .mproc { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.7rem 0; font-size: 0.8rem; color: #6B6880; }
  .spin { width: 14px; height: 14px; border-radius: 50%; border: 2px solid #2A2A38; border-top-color: #6C63FF; animation: sp 0.7s linear infinite; }
  @keyframes sp { to { transform:rotate(360deg); } }

  /* ── Success toast ── */
  .toast-wrap { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 999; }
  .toast { font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 500; padding: 0.6rem 1.2rem; border-radius: 99px; border: 1px solid; white-space: nowrap; animation: ti 0.3s ease forwards; }
  .toast.success { color: #22C55E; background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.25); }
  .toast.error { color: #EF4444; background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.25); }
  .toast.info { color: #6C63FF; background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.25); }
  @keyframes ti { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .ftn { position: absolute; bottom: 2rem; left: 0; right: 0; text-align: center; font-size: 0.7rem; color: #6B6880; }
  .ftn a { color: #6C63FF; text-decoration: none; }
  .ftn a:hover { text-decoration: underline; }
  @keyframes fa { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 600px) {
    .snv { padding: 1rem 1.25rem; } .snv .ne { display: none; }
    .ssec { padding: 0 1.25rem; } .stabs { padding: 0 1.25rem; }
    .sgrd { grid-template-columns: repeat(2,1fr); }
  }
`;

const TABS = [
  { key: "profile",  label: "Profile" },
  { key: "settings", label: "Settings" },
  { key: "data",     label: "Data" },
  { key: "history",  label: "Scan History" },
  { key: "account",  label: "Account" },
];

function fmt(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function SettingsPage({ session }) {
  const navigate = useNavigate();
  const user = session?.user;
  const userEmail = user?.email || "";
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || "User";
  const userPic = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  const memberSince = user?.created_at || "";
  const lastSignIn = user?.last_sign_in_at || "";
  const [activeTab, setActiveTab] = useState("profile");

  // Settings state
  const [settings, setSettings] = useState(() => loadUserSettings());

  // Statistics
  const [stats, setStats] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Export / Delete state
  const [exporting, setExporting] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Modal
  const [modal, setModal] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Load data on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!userEmail) return;
    loadData();
  }, [userEmail]);

  async function loadData() {
    setLoadingStats(true);
    try {
      const [statsData, scanData] = await Promise.all([
        getUserStatistics(userEmail),
        loadScanHistory(userEmail),
      ]);
      setStats(statsData);
      setScanHistory(scanData);
    } catch (err) {
      console.error("[DetachX Settings] load error:", err);
    }
    setLoadingStats(false);
  }

  // ── Settings handlers ────────────────────────────────────────────────────
  const toggleSetting = useCallback((key) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveUserSettings(next);
      return next;
    });
  }, []);

  const handleResetSettings = useCallback(() => {
    const defaults = resetUserSettings();
    setSettings(defaults);
    showToast("Settings reset to defaults", "info");
  }, [showToast]);

  // ── Export handlers ──────────────────────────────────────────────────────
  const handleExportJSON = useCallback(async () => {
    setExporting(true);
    try {
      const data = await fetchAllUserData(userEmail);
      if (!data) { showToast("No data to export", "error"); setExporting(false); return; }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `detachx-export-${userEmail.replace(/[@.]/g, "-")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("JSON export downloaded");
    } catch (err) {
      showToast("Export failed: " + err.message, "error");
    }
    setExporting(false);
  }, [userEmail, showToast]);

  const handleExportCSV = useCallback(async () => {
    setExporting(true);
    try {
      const data = await fetchAllUserData(userEmail);
      if (!data) { showToast("No data to export", "error"); setExporting(false); return; }
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `detachx-export-${userEmail.replace(/[@.]/g, "-")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("CSV export downloaded");
    } catch (err) {
      showToast("Export failed: " + err.message, "error");
    }
    setExporting(false);
  }, [userEmail, showToast]);

  // ── Data deletion handlers ───────────────────────────────────────────────
  const confirmClearHistory = useCallback(() => {
    setModal({ type: "clear-history" });
  }, []);

  const confirmClearFootprint = useCallback(() => {
    setModal({ type: "clear-footprint" });
  }, []);

  const confirmDeleteAccount = useCallback(() => {
    setModal({ type: "delete-account" });
  }, []);

  const executeModalAction = useCallback(async () => {
    if (!modal) return;
    setProcessing(true);

    try {
      if (modal.type === "clear-history") {
        await deleteUserData(userEmail, { clearScanHistory: true, clearUnsub: true, clearBlock: true });
        setScanHistory([]);
        showToast("Scan history cleared");
      } else if (modal.type === "clear-footprint") {
        await deleteUserData(userEmail, { clearFootprint: true });
        showToast("Footprint results deleted");
      } else if (modal.type === "delete-account") {
        const result = await deleteAccount(userEmail);
        if (result.success) {
          // Sign out already happened in deleteAccount
          navigate("/");
          return;
        } else {
          showToast("Account deletion failed: " + result.details, "error");
          setProcessing(false);
          setModal(null);
          return;
        }
      }

      // Reload stats after deletion
      const [statsData, scanData] = await Promise.all([
        getUserStatistics(userEmail),
        loadScanHistory(userEmail),
      ]);
      setStats(statsData);
      setScanHistory(scanData);
    } catch (err) {
      showToast("Operation failed: " + err.message, "error");
    }

    setProcessing(false);
    setModal(null);
  }, [modal, userEmail, navigate, showToast]);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/");
  }, [navigate]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{S}</style>
      <div className="sp">
        <div className="top-bar" />
        <nav className="snv">
          <div className="wm">Detach<span>X</span></div>
          <div className="nr">
            {userPic && <img src={userPic} alt="" referrerPolicy="no-referrer" />}
            <span className="ne">{userEmail}</span>
            <button className="nbtn" onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button className="nbtn" onClick={handleLogout}>Log out</button>
          </div>
        </nav>

        <div className="shero">
          <h1>Settings &amp; Profile</h1>
          <p>Manage your account, preferences, and data</p>
        </div>

        {/* Tabs */}
        <div className="stabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`stab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════
            TAB: PROFILE
           ════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="ssec">
            {/* Profile info */}
            <div className="scard">
              <div className="phead">
                {userPic ? (
                  <img src={userPic} alt="" referrerPolicy="no-referrer" className="pav" />
                ) : (
                  <div className="pav" style={{ background: "#1E1E2A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 700, color: "#6C63FF" }}>
                    {userName?.[0] || "?"}
                  </div>
                )}
                <div className="pinfo">
                  <div className="pn">{userName}</div>
                  <div className="pe">{userEmail}</div>
                  <div className="pinl" style={{ marginTop: "4px" }}>
                    <span className="dot on" />
                    Gmail connected
                  </div>
                </div>
              </div>
              <div className="srow">
                <span className="sl">Member since</span>
                <span className="sv">{fmt(memberSince)}</span>
              </div>
              <div className="srow">
                <span className="sl">Last login</span>
                <span className="sv">{fmt(lastSignIn)}</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="scard">
              <h3>Account Statistics</h3>
              <p className="sd">Your activity across all DetachX features.</p>
              {loadingStats ? (
                <div className="mproc"><div className="spin" />Loading…</div>
              ) : (
                <div className="sgrd">
                  <div className="sit">
                    <div className="svl">{stats?.totalScans ?? 0}</div>
                    <div className="slb">Scans</div>
                  </div>
                  <div className="sit">
                    <div className="svl">{stats?.totalUnsubscribed ?? 0}</div>
                    <div className="slb">Unsubscribed</div>
                  </div>
                  <div className="sit">
                    <div className="svl">{stats?.totalBlocked ?? 0}</div>
                    <div className="slb">Filtered</div>
                  </div>
                  <div className="sit">
                    <div className="svl">{stats?.totalDiscovered ?? 0}</div>
                    <div className="slb">Discovered</div>
                  </div>
                  {stats?.lastScan && (
                    <div className="sit" style={{ gridColumn: "1 / -1" }}>
                      <div className="svl" style={{ fontSize: "0.8rem" }}>{fmt(stats.lastScan)}</div>
                      <div className="slb">Last Scan</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            TAB: SETTINGS
           ════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="ssec">
            <div className="scard">
              <h3>Notification Preferences</h3>
              <p className="sd">Control which notifications you receive.</p>
              <div className="srow">
                <span className="sl">New feature announcements</span>
                <button className={`tog ${settings.notifyNewFeatures ? "on" : ""}`} onClick={() => toggleSetting("notifyNewFeatures")}>
                  <span className="tk" />
                </button>
              </div>
              <div className="srow">
                <span className="sl">Scan complete notification</span>
                <button className={`tog ${settings.notifyScanComplete ? "on" : ""}`} onClick={() => toggleSetting("notifyScanComplete")}>
                  <span className="tk" />
                </button>
              </div>
              <div className="srow">
                <span className="sl">Unsubscribe confirmation prompt</span>
                <button className={`tog ${settings.notifyUnsubConfirm ? "on" : ""}`} onClick={() => toggleSetting("notifyUnsubConfirm")}>
                  <span className="tk" />
                </button>
              </div>
            </div>

            <div className="scard">
              <h3>Scan Preferences</h3>
              <p className="sd">Customize how scans behave.</p>
              <div className="srow">
                <span className="sl">Auto-navigate to results after scan</span>
                <button className={`tog ${settings.scanAutoNavigate ? "on" : ""}`} onClick={() => toggleSetting("scanAutoNavigate")}>
                  <span className="tk" />
                </button>
              </div>
              <div className="srow">
                <span className="sl">Max emails to scan</span>
                <span className="sv">{settings.scanMaxResults.toLocaleString()}</span>
              </div>
            </div>

            <div className="scard">
              <h3>Privacy Preferences</h3>
              <p className="sd">Control how your data is handled.</p>
              <div className="srow">
                <span className="sl">Anonymize data in exports</span>
                <button className={`tog ${settings.anonymizeExports ? "on" : ""}`} onClick={() => toggleSetting("anonymizeExports")}>
                  <span className="tk" />
                </button>
              </div>
              <div className="srow">
                <span className="sl">Share anonymized diagnostics</span>
                <button className={`tog ${settings.shareDiagnostics ? "on" : ""}`} onClick={() => toggleSetting("shareDiagnostics")}>
                  <span className="tk" />
                </button>
              </div>
            </div>

            <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
              <button className="sbtn" onClick={handleResetSettings}>Reset all settings to defaults</button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            TAB: DATA
           ════════════════════════════════════ */}
        {activeTab === "data" && (
          <div className="ssec">
            <div className="scard">
              <h3>Export Your Data</h3>
              <p className="sd">Download all your DetachX data — unsub history, block history, discovered accounts, and scan history.</p>
              <div className="exbtns">
                <button className="exbtn" onClick={handleExportJSON} disabled={exporting}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v9M3 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 11v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {exporting ? "Exporting…" : "Export as JSON"}
                </button>
                <button className="exbtn" onClick={handleExportCSV} disabled={exporting}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v9M3 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 11v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {exporting ? "Exporting…" : "Export as CSV"}
                </button>
              </div>
            </div>

            <div className="scard">
              <h3>Clear Scan History</h3>
              <p className="sd">Delete all your inbox scan records. Unsubscribed and filtered senders will be preserved.</p>
              <button className="dbtn" onClick={confirmClearHistory}>Clear Scan History</button>
            </div>

            <div className="scard">
              <h3>Delete Footprint Results</h3>
              <p className="sd">Remove all discovered accounts and evidence from the Digital Footprint feature.</p>
              <button className="dbtn" onClick={confirmClearFootprint}>Delete Footprint Results</button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            TAB: SCAN HISTORY
           ════════════════════════════════════ */}
        {activeTab === "history" && (
          <div className="ssec">
            <div className="scard">
              <h3>Latest Scan Snapshots</h3>
              <p className="sd">Each scan type keeps one snapshot — re-scanning overwrites the previous result.</p>
              {scanHistory.length === 0 ? (
                <p style={{ textAlign: "center", padding: "1.5rem", color: "#4A4860", fontSize: "0.82rem" }}>
                  No scans recorded yet.
                </p>
              ) : (
                scanHistory.map((s, i) => (
                  <div className="shr" key={s.scanType || i}>
                    <span className={`shb ${s.scanType}`}>{s.scanType}</span>
                    <div className="shd">
                      <div className="sht">Last scanned: {fmt(s.scannedAt)}</div>
                      <div className="shs">
                        {s.scanType === "inbox"
                          ? `${s.totalEmails} emails · ${s.activeFound} active`
                          : `${s.servicesFound || 0} services discovered`
                        }
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            TAB: ACCOUNT
           ════════════════════════════════════ */}
        {activeTab === "account" && (
          <div className="ssec">
            <div className="scard" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
              <h3 style={{ color: "#EF4444" }}>Danger Zone</h3>
              <p className="sd">Permanently delete your account and all associated data. This action cannot be undone.</p>
              <button className="dbtn" onClick={confirmDeleteAccount}>Delete My Account</button>
            </div>
          </div>
        )}

        <p className="ftn">
          © 2026 DetachX · All rights reserved
          <br />
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/privacy"); }}>Privacy Policy</a>
          <span> · </span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/terms"); }}>Terms of Service</a>
          <span> · </span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/contact"); }}>Contact</a>
          <span> · </span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/about"); }}>About</a>
        </p>
      </div>

      {/* ══ MODALS ══ */}
      {modal && (
        <div className="moverlay" onClick={() => !processing && setModal(null)}>
          <div className="mbox" onClick={(e) => e.stopPropagation()}>
            <div className={`mico ${modal.type === "delete-account" ? "red" : "purple"}`}>
              {modal.type === "delete-account" ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 5h12v12a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm3 0V3a1 1 0 011-1h4a1 1 0 011 1v2" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 9v5M12 9v5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#6C63FF" strokeWidth="1.5"/>
                  <path d="M6 10l3 3 5-5" stroke="#6C63FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <h2 className="mt">
              {modal.type === "clear-history" && "Clear Scan History?"}
              {modal.type === "clear-footprint" && "Delete Footprint Results?"}
              {modal.type === "delete-account" && "Delete Your Account?"}
            </h2>
            <p className="mm">
              {modal.type === "clear-history" && "This will delete all scan records from history. Your unsubscribed and filtered sender lists will not be affected."}
              {modal.type === "clear-footprint" && "All discovered accounts and evidence messages will be permanently removed. You can run a new scan later."}
              {modal.type === "delete-account" && "All your data will be permanently deleted — unsub history, blocks, scan records, footprint data, and your account. You'll be signed out. This cannot be undone."}
            </p>
            {processing ? (
              <div className="mproc"><div className="spin" />Processing…</div>
            ) : (
              <div className="macts">
                <button className="mcancel" onClick={() => setModal(null)}>Cancel</button>
                <button className={`mconf ${modal.type === "delete-account" ? "red" : "purple"}`} onClick={executeModalAction}>
                  {modal.type === "delete-account" ? "Delete Forever" : "Confirm"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toasts */}
      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}
    </>
  );
}
