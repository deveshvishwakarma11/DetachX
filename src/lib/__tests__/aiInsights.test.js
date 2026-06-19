import { describe, it, expect } from "vitest";
import { generateInsights } from "../aiInsights";

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
    riskScore: 20,
    riskLevel: "low",
    riskFactors: [],
    status: "active",
    ...overrides,
  };
}

describe("generateInsights", () => {
  it("returns a summary insight when no services exist", () => {
    const insights = generateInsights([]);
    expect(insights).toHaveLength(1);
    expect(insights[0].type).toBe("summary");
    expect(insights[0].title).toContain("No accounts");
  });

  it("returns insights for discovered services", () => {
    const services = [
      makeService({ serviceName: "GitHub", domain: "github.com", category: "Developer Tools" }),
      makeService({ serviceName: "Amazon", domain: "amazon.com", category: "Shopping" }),
      makeService({ serviceName: "Netflix", domain: "netflix.com", category: "Entertainment" }),
    ];

    const insights = generateInsights(services);
    expect(insights.length).toBeGreaterThan(1);
    expect(insights.some((i) => i.title.includes("accounts"))).toBe(true);
  });

  it("generates a forgotten accounts warning for services > 12 months inactive", () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const services = [
      makeService({
        serviceName: "Old Forum",
        domain: "old-forum.com",
        lastSeen: twoYearsAgo.toISOString(),
      }),
      makeService({
        serviceName: "GitHub",
        domain: "github.com",
        category: "Developer Tools",
      }),
    ];

    const insights = generateInsights(services);
    expect(insights.some((i) => i.type === "warning" && i.title.includes("forgotten"))).toBe(true);
  });

  it("generates high-risk warning when services have high riskLevel", () => {
    const services = [
      makeService({
        serviceName: "RiskyService",
        domain: "risky.com",
        riskLevel: "high",
        riskScore: 85,
      }),
    ];

    const insights = generateInsights(services);
    expect(insights.some((i) => i.type === "warning" && i.title.includes("high-risk"))).toBe(true);
  });

  it("generates shopping exposure tip when 5+ shopping accounts", () => {
    const services = [];
    for (let i = 0; i < 5; i++) {
      services.push(
        makeService({
          serviceName: `Shop${i}`,
          domain: `shop${i}.com`,
          category: "Shopping",
        })
      );
    }

    const insights = generateInsights(services);
    expect(insights.some((i) => i.title.includes("shopping"))).toBe(true);
  });

  it("generates finance warning when 3+ financial accounts", () => {
    const services = [];
    for (let i = 0; i < 3; i++) {
      services.push(
        makeService({
          serviceName: `Bank${i}`,
          domain: `bank${i}.com`,
          category: "Finance",
        })
      );
    }

    const insights = generateInsights(services);
    expect(insights.some((i) => i.title.includes("financial"))).toBe(true);
  });

  it("generates social media tip when 5+ social accounts", () => {
    const services = [];
    for (let i = 0; i < 5; i++) {
      services.push(
        makeService({
          serviceName: `Social${i}`,
          domain: `social${i}.com`,
          category: "Social Media",
        })
      );
    }

    const insights = generateInsights(services);
    expect(insights.some((i) => i.title.toLowerCase().includes("social media"))).toBe(true);
  });

  it("sorts insights by priority (highest first)", () => {
    const services = [
      makeService({
        serviceName: "GitHub",
        domain: "github.com",
        category: "Developer Tools",
        riskLevel: "high",
        riskScore: 85,
        riskFactors: ["Suspicious domain"],
      }),
    ];

    const insights = generateInsights(services);
    for (let i = 1; i < insights.length; i++) {
      expect(insights[i - 1].priority).toBeGreaterThanOrEqual(insights[i].priority);
    }
  });

  it("generates data exposure summary when services store personal data", () => {
    const services = [
      makeService({
        serviceName: "Shopify",
        domain: "shopify.com",
        category: "Shopping",
        riskFactors: ["Shopping service — may store payment or personal data"],
      }),
    ];

    const insights = generateInsights(services);
    expect(insights.some((i) => i.title.includes("personal data"))).toBe(true);
  });

  it("returns valid insight structure for each insight", () => {
    const services = [
      makeService({
        serviceName: "GitHub",
        domain: "github.com",
        category: "Developer Tools",
      }),
      makeService({
        serviceName: "Amazon",
        domain: "amazon.com",
        category: "Shopping",
        riskLevel: "medium",
        riskScore: 45,
      }),
    ];

    const insights = generateInsights(services);

    for (const ins of insights) {
      expect(ins).toHaveProperty("type");
      expect(ins).toHaveProperty("icon");
      expect(ins).toHaveProperty("title");
      expect(ins).toHaveProperty("message");
      expect(ins).toHaveProperty("priority");
      expect(["stat", "warning", "tip", "summary"]).toContain(ins.type);
      expect(typeof ins.priority).toBe("number");
      expect(ins.priority).toBeGreaterThanOrEqual(0);
      expect(ins.priority).toBeLessThanOrEqual(10);
    }
  });
});
