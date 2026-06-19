import { describe, it, expect } from "vitest";
import {
  computeServiceRisk,
  computeAllRisks,
  computeRiskSummary,
} from "../riskScoring";

// ═══════════════════════════════════════════════════════════════════════════════
// Mock service objects
// ═══════════════════════════════════════════════════════════════════════════════

function makeService(overrides = {}) {
  return {
    serviceName: "Test Service",
    domain: "test.com",
    category: "Unknown",
    confidenceScore: 70,
    evidenceCount: 3,
    evidenceTypes: ["account_creation"],
    firstSeen: "2024-01-01T00:00:00.000Z",
    lastSeen: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeServiceRisk", () => {
  it("returns low risk for a known safe domain with recent activity", () => {
    const service = makeService({
      domain: "github.com",
      category: "Developer Tools",
      lastSeen: new Date().toISOString(),
    });

    const result = computeServiceRisk(service);
    expect(result.riskScore).toBeLessThanOrEqual(30);
    expect(result.riskLevel).toBe("low");
    expect(result.status).toBe("active");
  });

  it("returns high risk for a risky domain", () => {
    const service = makeService({
      domain: "mailinator.com",
      category: "Unknown",
    });

    const result = computeServiceRisk(service);
    expect(result.riskScore).toBeGreaterThan(30);
    expect(result.riskFactors).toContain("Suspicious domain");
  });

  it("detects inactive status when last seen > 12 months ago", () => {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    const service = makeService({
      lastSeen: threeYearsAgo.toISOString(),
    });

    const result = computeServiceRisk(service);
    expect(result.status).toBe("dormant");
    expect(result.riskFactors.some((f) => f.includes("2 years"))).toBe(true);
  });

  it("detects inactive status when last seen between 12-24 months", () => {
    const eighteenMonthsAgo = new Date();
    eighteenMonthsAgo.setMonth(eighteenMonthsAgo.getMonth() - 18);

    const service = makeService({
      lastSeen: eighteenMonthsAgo.toISOString(),
    });

    const result = computeServiceRisk(service);
    expect(result.status).toBe("inactive");
    expect(result.riskFactors.some((f) => f.includes("year"))).toBe(true);
  });

  it("adds sensitivity risk for Finance category", () => {
    const service = makeService({
      domain: "some-bank.com",
      category: "Finance",
    });

    const result = computeServiceRisk(service);
    expect(result.riskFactors.some((f) => f.includes("payment") || f.includes("Finance"))).toBe(true);
  });

  it("adds sensitivity risk for Shopping category", () => {
    const service = makeService({
      domain: "some-store.com",
      category: "Shopping",
    });

    const result = computeServiceRisk(service);
    expect(result.riskFactors.some((f) => f.includes("payment") || f.includes("Shopping"))).toBe(true);
  });

  it("adds low confidence risk factor when confidence < 40", () => {
    const service = makeService({ confidenceScore: 25 });

    const result = computeServiceRisk(service);
    expect(result.riskFactors).toContain("Low detection confidence");
  });

  it("adds security alert risk factor when security evidence exists", () => {
    const service = makeService({
      evidenceTypes: ["account_creation", "security"],
    });

    const result = computeServiceRisk(service);
    expect(result.riskFactors.some((f) => f.includes("Security"))).toBe(true);
  });

  it("returns status 'dormant' when no lastSeen date", () => {
    const service = makeService({ lastSeen: null });

    const result = computeServiceRisk(service);
    expect(result.status).toBe("dormant");
  });

  it("clamps risk score between 0 and 100", () => {
    // A service with many high-risk factors should still max at 100
    const manyFactors = [
      "security", "account_creation", "verification",
      "purchase", "security",
    ];
    const highRiskService = makeService({
      domain: "some-unknown-spam-domain.xyz",
      category: "Finance",
      confidenceScore: 15,
      evidenceCount: 25,
      evidenceTypes: manyFactors,
      lastSeen: null,
    });

    const result = computeServiceRisk(highRiskService);
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it("deduplicates risk factors", () => {
    const service = makeService({
      domain: "completely-unknown-domain.xyz",
      category: "Finance",
      confidenceScore: 20,
      lastSeen: null,
    });

    const result = computeServiceRisk(service);
    // Check no duplicate factors
    const uniqueFactors = new Set(result.riskFactors);
    expect(uniqueFactors.size).toBe(result.riskFactors.length);
  });
});

describe("computeAllRisks", () => {
  it("enriches all services with risk data", () => {
    const services = [
      makeService({ domain: "github.com", category: "Developer Tools" }),
      makeService({ domain: "unknown-spam.xyz", category: "Unknown" }),
    ];

    const result = computeAllRisks(services);

    expect(result).toHaveLength(2);
    expect(result[0].riskScore).toBeDefined();
    expect(result[0].riskLevel).toBeDefined();
    expect(result[0].status).toBeDefined();
    expect(result[1].riskScore).toBeDefined();
    expect(result[1].riskLevel).toBeDefined();
  });

  it("does not mutate the original array reference", () => {
    const services = [makeService()];
    const result = computeAllRisks(services);
    expect(result).toBe(services); // Same reference
  });
});

describe("computeRiskSummary", () => {
  it("computes risk distribution correctly", () => {
    const services = [
      makeService({ domain: "safe.com", category: "Developer Tools" }),
      makeService({ domain: "medium-unknown.com", category: "Unknown", confidenceScore: 50 }),
    ];

    // Add risk scores manually for deterministic test
    services[0].riskLevel = "low";
    services[0].riskScore = 15;
    services[1].riskLevel = "medium";
    services[1].riskScore = 45;

    const summary = computeRiskSummary(services);

    expect(summary.low).toBe(1);
    expect(summary.medium).toBe(1);
    expect(summary.high).toBe(0);
    expect(summary.total).toBe(2);
  });

  it("handles empty services array", () => {
    const summary = computeRiskSummary([]);
    expect(summary.total).toBe(0);
    expect(summary.averageRisk).toBe(0);
    expect(summary.low).toBe(0);
    expect(summary.medium).toBe(0);
    expect(summary.high).toBe(0);
  });

  it("identifies the highest risk service", () => {
    const services = [
      makeService({ domain: "low-risk.com", riskLevel: "low", riskScore: 15 }),
      makeService({ domain: "high-risk.com", riskLevel: "high", riskScore: 85 }),
    ];

    const summary = computeRiskSummary(services);
    expect(summary.highestRiskService.domain).toBe("high-risk.com");
  });
});
