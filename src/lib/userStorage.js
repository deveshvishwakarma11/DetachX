// ──────────────────────────────────────────────────────────────────────────────
// DetachX — User Data & Settings Storage
//
// Handles:
//   - User settings (localStorage-based preferences)
//   - Scan history (Supabase CRUD)
//   - Data export (JSON / CSV download)
//   - Data deletion (clear history, footprint, full account)
// ──────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";

// ═══════════════════════════════════════════════════════════════════════════════
// SETTINGS (localStorage)
// ═══════════════════════════════════════════════════════════════════════════════

const SETTINGS_KEY = "detachx_user_settings";

const DEFAULT_SETTINGS = {
  // Notifications
  notifyNewFeatures: true,
  notifyScanComplete: true,
  notifyUnsubConfirm: false,

  // Scan preferences
  scanMaxResults: 500,
  scanAutoNavigate: true,

  // Privacy
  anonymizeExports: false,
  shareDiagnostics: false,
};

/**
 * Load saved user settings.
 * Merges with defaults to handle new keys added in future versions.
 */
export function loadUserSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const saved = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Save user settings to localStorage.
 */
export function saveUserSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

/**
 * Reset settings to defaults.
 */
export function resetUserSettings() {
  localStorage.removeItem(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCAN HISTORY (Supabase)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Record (or update) the latest scan snapshot for this user + scan type.
 * Uses UPSERT so each user has at most one row per scan type.
 * Overwrites the previous summary rather than creating a new history entry.
 *
 * @param {string} userEmail
 * @param {Object} summary - { scanType, totalEmails, activeFound, unsubscribed, blocked, riskSummary, servicesFound }
 */
export async function recordScanHistory(userEmail, summary) {
  if (!userEmail) return false;

  const { error } = await supabase.from("scan_history").upsert({
    user_email:    userEmail,
    scan_type:     summary.scanType || "inbox",
    scanned_at:    new Date().toISOString(),
    total_emails:  summary.totalEmails || 0,
    active_found:  summary.activeFound || 0,
    unsubscribed:  summary.unsubscribed || 0,
    blocked:       summary.blocked || 0,
    risk_summary:  summary.riskSummary || {},
    services_found: summary.servicesFound || 0,
  }, { onConflict: "user_email,scan_type" });

  if (error) {
    console.error("[DetachX] recordScanHistory error:", error.message);
    return false;
  }
  return true;
}

/**
 * Load the latest scan snapshots for a user.
 * Returns at most one row per scan type (inbox + footprint).
 *
 * @param {string} userEmail
 * @returns {Promise<Object[]>}
 */
export async function loadScanHistory(userEmail) {
  if (!userEmail) return [];

  const { data, error } = await supabase
    .from("scan_history")
    .select("*")
    .eq("user_email", userEmail);

  if (error) {
    console.error("[DetachX] loadScanHistory error:", error.message);
    return [];
  }

  return data.map((row) => ({
    scannedAt:     row.scanned_at,
    scanType:      row.scan_type,
    totalEmails:   row.total_emails,
    activeFound:   row.active_found,
    unsubscribed:  row.unsubscribed,
    blocked:       row.blocked,
    riskSummary:   row.risk_summary || {},
    servicesFound: row.services_found,
  }));
}

/**
 * Delete all scan history for a user.
 *
 * @param {string} userEmail
 * @returns {Promise<boolean>}
 */
export async function deleteScanHistory(userEmail) {
  if (!userEmail) return false;

  const { error } = await supabase
    .from("scan_history")
    .delete()
    .eq("user_email", userEmail);

  if (error) {
    console.error("[DetachX] deleteScanHistory error:", error.message);
    return false;
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch all user data from Supabase for export.
 *
 * @param {string} userEmail
 * @returns {Promise<Object>} { exportedAt, userEmail, unsubHistory, blockHistory, discoveredAccounts, scanHistory }
 */
export async function fetchAllUserData(userEmail) {
  if (!userEmail) return null;

  const [unsubData, blockData, footprintData, scanData] = await Promise.all([
    supabase.from("unsub_history").select("*").eq("user_email", userEmail),
    supabase.from("block_history").select("*").eq("user_email", userEmail),
    supabase.from("discovered_accounts").select("*").eq("user_email", userEmail),
    supabase.from("scan_history").select("*").eq("user_email", userEmail).order("scanned_at", { ascending: false }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    userEmail,
    unsubHistory: unsubData.data || [],
    blockHistory: blockData.data || [],
    discoveredAccounts: footprintData.data || [],
    scanHistory: scanData.data || [],
  };
}

/**
 * Convert user data object to CSV string.
 *
 * @param {Object} data - Output of fetchAllUserData()
 * @returns {string} CSV content
 */
export function convertToCSV(data) {
  if (!data) return "";

  const lines = [];

  // Header row
  lines.push("# DetachX Data Export");
  lines.push(`# Exported at: ${data.exportedAt}`);
  lines.push(`# User: ${data.userEmail}`);
  lines.push("");

  // Unsub history
  lines.push("# Unsub History");
  lines.push("domain,from_addr,email,subject,action,verification_status,action_at");
  for (const row of data.unsubHistory) {
    lines.push(
      [
        escapeCSV(row.domain),
        escapeCSV(row.from_addr),
        escapeCSV(row.email),
        escapeCSV(row.subject),
        escapeCSV(row.action),
        escapeCSV(row.verification_status),
        escapeCSV(row.action_at),
      ].join(",")
    );
  }
  lines.push("");

  // Block history
  lines.push("# Block History");
  lines.push("domain,from_addr,email,filter_id,action,action_at");
  for (const row of data.blockHistory) {
    lines.push(
      [
        escapeCSV(row.domain),
        escapeCSV(row.from_addr),
        escapeCSV(row.email),
        escapeCSV(row.filter_id),
        escapeCSV(row.action),
        escapeCSV(row.action_at),
      ].join(",")
    );
  }
  lines.push("");

  // Discovered accounts
  lines.push("# Discovered Accounts");
  lines.push("service_name,domain,category,confidence_score,risk_score,risk_level,status,first_seen,last_seen");
  for (const row of data.discoveredAccounts) {
    lines.push(
      [
        escapeCSV(row.service_name),
        escapeCSV(row.domain),
        escapeCSV(row.category),
        row.confidence_score,
        row.risk_score,
        escapeCSV(row.risk_level),
        escapeCSV(row.status),
        escapeCSV(row.first_seen),
        escapeCSV(row.last_seen),
      ].join(",")
    );
  }

  return lines.join("\n");
}

function escapeCSV(val) {
  if (val == null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA DELETION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Delete ALL of a user's data from all tables.
 * This is used for "Clear Scan History" and "Delete All Footprint Results".
 *
 * @param {string} userEmail
 * @param {Object} [options] - Which data to delete
 * @param {boolean} [options.clearScanHistory]
 * @param {boolean} [options.clearFootprint]
 * @returns {Promise<{success: boolean, details: string}>}
 */
export async function deleteUserData(userEmail, options = {}) {
  if (!userEmail) return { success: false, details: "No user email" };

  const results = [];

  // Clear scan history
  if (options.clearScanHistory) {
    const ok = await deleteScanHistory(userEmail);
    results.push(`scan_history: ${ok ? "cleared" : "failed"}`);
  }

  // Clear footprint (discovered_accounts cascades to evidence_messages)
  if (options.clearFootprint) {
    const { error } = await supabase
      .from("discovered_accounts")
      .delete()
      .eq("user_email", userEmail);

    results.push(`discovered_accounts: ${error ? "failed" : "cleared"}`);
  }

  // Clear unsub history
  if (options.clearUnsub) {
    const { error } = await supabase
      .from("unsub_history")
      .delete()
      .eq("user_email", userEmail);

    results.push(`unsub_history: ${error ? "failed" : "cleared"}`);
  }

  // Clear block history
  if (options.clearBlock) {
    const { error } = await supabase
      .from("block_history")
      .delete()
      .eq("user_email", userEmail);

    results.push(`block_history: ${error ? "failed" : "cleared"}`);
  }

  return { success: true, details: results.join("; ") };
}

/**
 * Delete the user's entire account — all data + auth.
 * Calls Supabase Admin RPC to delete auth user, then signs out.
 *
 * @param {string} userEmail
 * @returns {Promise<{success: boolean, details: string}>}
 */
export async function deleteAccount(userEmail) {
  try {
    // 1. Delete all user data from all tables
    await deleteUserData(userEmail, {
      clearScanHistory: true,
      clearFootprint: true,
      clearUnsub: true,
      clearBlock: true,
    });

    // 2. Remove local storage
    localStorage.removeItem("detachx_user");
    localStorage.removeItem("detachx_unsub_history");
    localStorage.removeItem("detachx_block_history");
    localStorage.removeItem("detachx_user_settings");
    localStorage.removeItem("detachx_migrated");
    localStorage.removeItem("detachx_supabase_migrated");
    localStorage.removeItem("scan_result");
    localStorage.removeItem("scan_checkpoint");
    sessionStorage.removeItem("gmail_token");

    // 3. Sign out of Supabase
    await supabase.auth.signOut();

    return { success: true, details: "Account deleted and signed out" };
  } catch (err) {
    console.error("[DetachX] deleteAccount error:", err);
    return { success: false, details: err.message };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGGREGATE STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get aggregate statistics for the user's dashboard / profile page.
 *
 * @param {string} userEmail
 * @returns {Promise<Object>} { totalScans, totalUnsubscribed, totalBlocked, totalDiscovered, lastScan, memberSince }
 */
export async function getUserStatistics(userEmail) {
  if (!userEmail) return null;

  const counts = { totalScans: 0, totalUnsubscribed: 0, totalBlocked: 0, totalDiscovered: 0, lastScan: null };

  try {
    const results = await Promise.all([
      supabase.from("scan_history").select("scanned_at", { count: "exact", head: true }).eq("user_email", userEmail),
      supabase.from("unsub_history").select("*", { count: "exact", head: true }).eq("user_email", userEmail),
      supabase.from("block_history").select("*", { count: "exact", head: true }).eq("user_email", userEmail),
      supabase.from("discovered_accounts").select("*", { count: "exact", head: true }).eq("user_email", userEmail),
      supabase.from("scan_history").select("scanned_at").eq("user_email", userEmail).order("scanned_at", { ascending: false }).limit(1),
    ]);

    // totalScans = unique scan types (at most 2 — inbox + footprint)
    counts.totalScans = Math.min(results[0].count || 0, 2);
    counts.totalUnsubscribed = results[1].count || 0;
    counts.totalBlocked = results[2].count || 0;
    counts.totalDiscovered = results[3].count || 0;
    counts.lastScan = results[4].data?.[0]?.scanned_at || null;
  } catch (err) {
    console.error("[DetachX] getUserStatistics error:", err);
  }

  return counts;
}
