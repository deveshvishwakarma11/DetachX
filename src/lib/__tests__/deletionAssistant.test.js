import { describe, it, expect } from "vitest";
import {
  lookupDeletionInfo,
  getDeletionUrl,
  getSupportUrl,
  getPrivacyUrl,
  getBestActionLink,
  getAllDeletionInfo,
} from "../deletionAssistant";

describe("lookupDeletionInfo", () => {
  it("returns deletion info for a known domain", () => {
    const info = lookupDeletionInfo("github.com");
    expect(info).not.toBeNull();
    expect(info.homepage).toBe("https://github.com");
    expect(info.deletionUrl).toBe("https://github.com/settings/admin");
    expect(info.category).toBe("Developer Tools");
  });

  it("returns null for an unknown domain", () => {
    const info = lookupDeletionInfo("completely-fake-domain-12345.xyz");
    expect(info).toBeNull();
  });

  it("returns null for null/undefined input", () => {
    expect(lookupDeletionInfo(null)).toBeNull();
    expect(lookupDeletionInfo(undefined)).toBeNull();
    expect(lookupDeletionInfo("")).toBeNull();
  });

  it("is case-insensitive", () => {
    const info1 = lookupDeletionInfo("GITHUB.COM");
    const info2 = lookupDeletionInfo("GitHub.com");
    const info3 = lookupDeletionInfo("github.com");
    expect(info1).toEqual(info2);
    expect(info2).toEqual(info3);
  });

  it("resolves subdomain to parent domain", () => {
    const info = lookupDeletionInfo("e.linkedin.com");
    expect(info).not.toBeNull();
    expect(info.deletionUrl).toContain("linkedin");
  });

  it("handles X / Twitter domain variants", () => {
    const infoX = lookupDeletionInfo("x.com");
    const infoTwitter = lookupDeletionInfo("twitter.com");

    expect(infoX).not.toBeNull();
    expect(infoTwitter).not.toBeNull();
    expect(infoX.deletionUrl).toBeTruthy();
    expect(infoTwitter.deletionUrl).toBeTruthy();
  });
});

describe("getDeletionUrl", () => {
  it("returns deletion URL for a known service", () => {
    expect(getDeletionUrl("facebook.com")).toBe(
      "https://www.facebook.com/settings?tab=account&section=deactivation"
    );
  });

  it("returns null for an unknown domain", () => {
    expect(getDeletionUrl("unknown.xyz")).toBeNull();
  });
});

describe("getSupportUrl", () => {
  it("returns support URL for a known service", () => {
    expect(getSupportUrl("github.com")).toBe("https://support.github.com");
  });

  it("returns null for an unknown domain", () => {
    expect(getSupportUrl("unknown.xyz")).toBeNull();
  });
});

describe("getPrivacyUrl", () => {
  it("returns privacy URL for a known service", () => {
    const url = getPrivacyUrl("google.com");
    expect(url).toBe("https://policies.google.com/privacy");
  });
});

describe("getBestActionLink", () => {
  it("returns deletion URL as primary action when available", () => {
    const result = getBestActionLink("github.com");
    expect(result.label).toBe("Delete Account");
    expect(result.url).toBe("https://github.com/settings/admin");
  });

  it("returns appropriate fallback for services with only homepage", () => {
    // Use a domain that isn't in the static map
    const result = getBestActionLink("unknown-test-domain.xyz");
    expect(result.label).toBe("No link available");
    expect(result.url).toBeNull();
  });
});

describe("getAllDeletionInfo", () => {
  it("returns all deletion info as an array", () => {
    const allInfo = getAllDeletionInfo();
    expect(Array.isArray(allInfo)).toBe(true);
    expect(allInfo.length).toBeGreaterThan(50);
  });

  it("each entry has required fields", () => {
    const allInfo = getAllDeletionInfo();
    for (const entry of allInfo) {
      expect(entry).toHaveProperty("domain");
      expect(entry).toHaveProperty("homepage");
      expect(entry).toHaveProperty("deletionUrl");
      expect(entry).toHaveProperty("category");
    }
  });

  it("contains major services", () => {
    const allInfo = getAllDeletionInfo();
    const domains = allInfo.map((e) => e.domain);
    expect(domains).toContain("github.com");
    expect(domains).toContain("google.com");
    expect(domains).toContain("facebook.com");
    expect(domains).toContain("netflix.com");
    expect(domains).toContain("amazon.com");
    expect(domains).toContain("spotify.com");
  });

  it("all deletion URLs are valid URLs or null", () => {
    const allInfo = getAllDeletionInfo();
    for (const entry of allInfo) {
      if (entry.deletionUrl) {
        expect(entry.deletionUrl.startsWith("https://")).toBe(true);
      }
    }
  });
});
