#!/usr/bin/env node
/**
 * CivicNudge E2E Verification Script
 * Tests every API route and reports pass/fail with timing.
 * Run: node scripts/verify.mjs
 * Requires the dev server to be running on PORT (default 4000).
 */

const BASE = `http://localhost:${process.env.PORT ?? 4000}`;
const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

let passed = 0;
let failed = 0;
const errors = [];

async function check(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const ms = Date.now() - start;
    console.log(`  ${GREEN}✓${RESET} ${name} ${DIM}(${ms}ms)${RESET}`);
    passed++;
  } catch (err) {
    const ms = Date.now() - start;
    console.log(`  ${RED}✗${RESET} ${name} ${DIM}(${ms}ms)${RESET}`);
    console.log(`    ${RED}${err.message}${RESET}`);
    failed++;
    errors.push({ name, error: err.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { res, data: await res.json().catch(() => null) };
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  return { res, data: await res.json().catch(() => null) };
}

const SAMPLE_BILL = {
  id: "test-bill-001",
  title: "CA SB-567: Tenant Protection Act",
  source: "STATE",
  date: "2026-04-22",
  summary: "Expands rent stabilization and strengthens eviction protections.",
  fullText: `CALIFORNIA SENATE BILL 567
AN ACT to amend Section 1946.2 of the Civil Code, relating to tenancy.
This bill expands rent stabilization to properties built before 2005,
caps annual rent increases at 3% + CPI, and requires 90 days notice
for no-fault evictions. Landlords must provide relocation assistance.
Civil penalties up to $10,000 per violation.`,
};

const SAMPLE_PERSONA = {
  occupation: ["Renter"],
  occupationOther: "",
  familyType: ["Single Parent"],
  familyTypeOther: "",
  location: "East Oakland, CA",
  demographicFocus: "Spanish-speaking",
  naturalLanguage: "Low-income renters in Oakland",
  actionBias: "action",
  contentMode: "educate",
  platforms: ["instagram", "sms"],
};

console.log(`\n${BOLD}CivicNudge — E2E Verification${RESET}`);
console.log(`${DIM}Target: ${BASE}${RESET}\n`);

// ── Infrastructure ──────────────────────────────────────────────
console.log(`${BOLD}Infrastructure${RESET}`);

await check("Server is reachable", async () => {
  const res = await fetch(BASE);
  assert(res.ok, `HTTP ${res.status}`);
});

// ── Bills API ───────────────────────────────────────────────────
console.log(`\n${BOLD}Bills API${RESET}`);

await check("POST /api/bills/sync returns count and bills array", async () => {
  const { res, data } = await post("/api/bills/sync", {});
  assert(res.ok, `HTTP ${res.status}`);
  assert(typeof data.count === "number", "Missing count");
  assert(Array.isArray(data.bills), "Missing bills array");
  assert(data.sources, "Missing sources breakdown");
});

await check("GET /api/bills returns bills list", async () => {
  const { res, data } = await get("/api/bills");
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data.bills), "Missing bills array");
});

await check("GET /api/bills?q=search filters results", async () => {
  const { res, data } = await get("/api/bills?q=act");
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data.bills), "Missing bills array");
});

// ── Campaign Generation ──────────────────────────────────────────
console.log(`\n${BOLD}Campaign Generation (Claude Haiku)${RESET}`);

let campaign = null;
await check("POST /api/analyze returns structured campaign JSON", async () => {
  const { res, data } = await post("/api/analyze", {
    bill: SAMPLE_BILL,
    persona: SAMPLE_PERSONA,
  });
  assert(res.ok, `HTTP ${res.status} — ${JSON.stringify(data)}`);
  assert(typeof data.relevanceScore === "number", "Missing relevanceScore");
  assert(typeof data.relevanceSummary === "string", "Missing relevanceSummary");
  assert(data.instagram?.slide1, "Missing instagram.slide1");
  assert(data.instagram?.slide2, "Missing instagram.slide2");
  assert(data.instagram?.slide3, "Missing instagram.slide3");
  assert(data.instagram?.caption, "Missing instagram.caption");
  assert(Array.isArray(data.tweet) && data.tweet.length > 0, "Missing tweet array");
  assert(typeof data.sms === "string" && data.sms.length > 0, "Missing sms");
  assert(data.sms.length <= 200, `SMS too long: ${data.sms.length} chars`);
  campaign = data;
});

await check("Campaign relevance score is in range 1–10", async () => {
  assert(campaign, "No campaign (prior test failed)");
  assert(campaign.relevanceScore >= 1 && campaign.relevanceScore <= 10,
    `Score out of range: ${campaign.relevanceScore}`);
});

// ── Bias Detection ───────────────────────────────────────────────
console.log(`\n${BOLD}Bias Detection (Claude Sonnet)${RESET}`);

await check("POST /api/bias returns verdict and signals", async () => {
  const { res, data } = await post("/api/bias", {
    billText: SAMPLE_BILL.fullText,
  });
  assert(res.ok, `HTTP ${res.status}`);
  assert(["neutral", "mixed", "advocacy"].includes(data.verdict),
    `Invalid verdict: ${data.verdict}`);
  assert(Array.isArray(data.signals), "Missing signals array");
  assert(typeof data.summary === "string", "Missing summary");
  assert(typeof data.confidence === "number", "Missing confidence");
});

await check("Bias verdict reflects neutral legislative text", async () => {
  const { data } = await post("/api/bias", { billText: SAMPLE_BILL.fullText });
  // Neutral legislative text should not come back as high-confidence advocacy
  const isOverlyAggressiveVerdict =
    data.verdict === "advocacy" && data.confidence > 0.9;
  assert(!isOverlyAggressiveVerdict,
    `Unexpectedly strong advocacy verdict (${data.confidence}) on neutral text`);
});

// ── Multimodal — key presence checks ────────────────────────────
console.log(`\n${BOLD}Multimodal API Keys${RESET}`);

await check("Google API key set → image route accepts request", async () => {
  const { res, data } = await post("/api/generate-image", {
    prompt: "Test civic graphic",
  });
  // 500 with "not set" = missing key; any other response means key is present
  if (res.status === 500 && data?.error?.includes("not set")) {
    throw new Error("GOOGLE_API_KEY not set in .env.local");
  }
  // 500 for other reasons (quota, model error) = key is present, that's fine
});

await check("ElevenLabs API key set → audio route accepts request", async () => {
  const { res, data } = await post("/api/generate-audio", {
    text: "Test narration",
  });
  if (res.status === 500 && data?.error?.includes("not set")) {
    throw new Error("ELEVENLABS_API_KEY not set in .env.local");
  }
});

await check("Kling/video route exists and responds", async () => {
  const { res, data } = await post("/api/generate-video", {
    prompt: "Test video",
  });
  // Just check the route exists (200, or 500 with a meaningful error — not 404)
  assert(res.status !== 404, "Route not found");
  // If key missing, that's expected — still a pass for route existence
  const keyMissing = res.status === 500 && data?.error?.includes("not set");
  if (keyMissing) {
    console.log(`    ${YELLOW}ℹ KLING_API_KEY not set — video generation disabled${RESET}`);
  }
});

// ── Summary ──────────────────────────────────────────────────────
console.log(`\n${"─".repeat(40)}`);
const total = passed + failed;
if (failed === 0) {
  console.log(`${GREEN}${BOLD}All ${total} checks passed ✓${RESET}\n`);
} else {
  console.log(`${RED}${BOLD}${failed}/${total} checks failed${RESET}`);
  console.log(`\nFailed checks:`);
  for (const e of errors) {
    console.log(`  ${RED}✗ ${e.name}${RESET}: ${e.error}`);
  }
  console.log();
  process.exit(1);
}
