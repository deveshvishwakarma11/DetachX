import { describe, it, expect, beforeEach } from "vitest";
import {
  loadUserSettings,
  saveUserSettings,
  resetUserSettings,
  convertToCSV,
} from "../userStorage";

// ═══════════════════════════════════════════════════════════════════════════════
// NOTE: Tests for Supabase-dependent functions (recordScanHistory, loadScanHistory,
// fetchAllUserData, getUserStatistics, deleteUserData, deleteAccount) require
// a running Supabase instance and are not covered in unit tests.
//
// recordScanHistory now uses .upsert() with onConflict — each user has at most
// one snapshot per scan type (inbox / footprint). The scan_history PK is
// (user_email, scan_type) — no more auto-increment id column.
// ═══════════════════════════════════════════════════════════════════════════════

describe("loadUserSettings / saveUserSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns defaults when no settings saved", () => {
    const s = loadUserSettings();
    expect(s.notifyNewFeatures).toBe(true);
    expect(s.notifyScanComplete).toBe(true);
    expect(s.notifyUnsubConfirm).toBe(false);
    expect(s.scanMaxResults).toBe(500);
    expect(s.scanAutoNavigate).toBe(true);
    expect(s.anonymizeExports).toBe(false);
    expect(s.shareDiagnostics).toBe(false);
  });

  it("saves and loads settings correctly", () => {
    const custom = {
      notifyNewFeatures: false,
      notifyScanComplete: true,
      scanMaxResults: 200,
    };
    saveUserSettings(custom);

    const loaded = loadUserSettings();
    expect(loaded.notifyNewFeatures).toBe(false);
    expect(loaded.notifyScanComplete).toBe(true);
    expect(loaded.scanMaxResults).toBe(200);
  });

  it("merges with defaults for missing keys (future-proofing)", () => {
    const partial = { notifyNewFeatures: false };
    saveUserSettings(partial);

    const loaded = loadUserSettings();
    expect(loaded.notifyNewFeatures).toBe(false);
    expect(loaded.notifyScanComplete).toBe(true); // From defaults
    expect(loaded.shareDiagnostics).toBe(false);   // From defaults
    expect(loaded.scanAutoNavigate).toBe(true);     // From defaults
  });

  it("returns defaults on corrupted localStorage", () => {
    localStorage.setItem("detachx_user_settings", "{invalid-json");
    const s = loadUserSettings();
    expect(s.notifyNewFeatures).toBe(true);
  });

  it("returns defaults on empty localStorage value", () => {
    localStorage.setItem("detachx_user_settings", "");
    const s = loadUserSettings();
    expect(s.notifyNewFeatures).toBe(true);
  });

  it("saveUserSettings returns true on success", () => {
    const result = saveUserSettings({ test: true });
    expect(result).toBe(true);
  });
});

describe("resetUserSettings", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("removes saved settings from localStorage", () => {
    saveUserSettings({ notifyNewFeatures: false });
    resetUserSettings();
    expect(localStorage.getItem("detachx_user_settings")).toBeNull();
  });

  it("returns default settings object", () => {
    const defaults = resetUserSettings();
    expect(defaults.notifyNewFeatures).toBe(true);
    expect(defaults.scanMaxResults).toBe(500);
  });
});

describe("convertToCSV", () => {
  it("returns empty string for null input", () => {
    expect(convertToCSV(null)).toBe("");
  });

  it("returns empty string for undefined input", () => {
    expect(convertToCSV(undefined)).toBe("");
  });

  it("generates CSV with header rows and data", () => {
    const data = {
      exportedAt: "2026-06-19T12:00:00.000Z",
      userEmail: "test@example.com",
      unsubHistory: [
        {
          domain: "newsletter.com",
          from_addr: "news@newsletter.com",
          email: "news@newsletter.com",
          subject: "Weekly Digest",
          action: "unsubscribed",
          verification_status: "user_unsubscribed",
          action_at: "2026-06-01T00:00:00.000Z",
        },
      ],
      blockHistory: [
        {
          domain: "spam.com",
          from_addr: "spam@spam.com",
          email: "spam@spam.com",
          filter_id: "abc123",
          action: "blocked",
          action_at: "2026-06-02T00:00:00.000Z",
        },
      ],
      discoveredAccounts: [
        {
          service_name: "GitHub",
          domain: "github.com",
          category: "Developer Tools",
          confidence_score: 96,
          risk_score: 15,
          risk_level: "low",
          status: "active",
          first_seen: "2024-01-01T00:00:00.000Z",
          last_seen: "2026-06-01T00:00:00.000Z",
        },
      ],
    };

    const csv = convertToCSV(data);

    // Should contain header rows
    expect(csv).toContain("# DetachX Data Export");
    expect(csv).toContain("# Unsub History");
    expect(csv).toContain("# Block History");
    expect(csv).toContain("# Discovered Accounts");

    // Should contain data
    expect(csv).toContain("newsletter.com");
    expect(csv).toContain("spam.com");
    expect(csv).toContain("GitHub");
    expect(csv).toContain("github.com");

    // Should contain column headers
    expect(csv).toContain("domain,from_addr,email,subject,action,verification_status,action_at");
    expect(csv).toContain("service_name,domain,category,confidence_score,risk_score,risk_level,status,first_seen,last_seen");
  });

  it("escapes commas and quotes in CSV values", () => {
    const data = {
      exportedAt: "2026-06-19T12:00:00.000Z",
      userEmail: "test@example.com",
      unsubHistory: [
        {
          domain: "test,com",
          from_addr: '"quoted" <test@test.com>',
          email: "test@test.com",
          subject: "Hello, world",
          action: "unsubscribed",
          verification_status: "user_unsubscribed",
          action_at: "2026-06-01T00:00:00.000Z",
        },
      ],
      blockHistory: [],
      discoveredAccounts: [],
    };

    const csv = convertToCSV(data);
    expect(csv).toContain('"test,com"');
  });
});
