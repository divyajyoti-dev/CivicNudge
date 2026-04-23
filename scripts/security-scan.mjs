#!/usr/bin/env node
/**
 * CivicNudge Security Scanner
 * Static analysis for common vulnerabilities in the codebase.
 * Run: node scripts/security-scan.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

const BOLD = "\x1b[1m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";

const findings = { critical: [], high: [], medium: [], info: [] };

function finding(severity, rule, file, line, detail) {
  findings[severity].push({ rule, file: file.replace(ROOT, ""), line, detail });
}

// ── File walker ──────────────────────────────────────────────────
function walk(dir, exts = [".ts", ".tsx", ".js", ".mjs"]) {
  const results = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next") continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      results.push(...walk(full, exts));
    } else if (exts.includes(extname(name))) {
      results.push(full);
    }
  }
  return results;
}

const files = walk(ROOT);

// ── Rules ────────────────────────────────────────────────────────
for (const filePath of files) {
  const rel = filePath.replace(ROOT, "");
  // Skip scanner itself to avoid self-referential false positives
  if (rel.includes("scripts/security-scan")) continue;

  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const isClientFile = content.includes('"use client"') || content.includes("'use client'");
  const isApiRoute = rel.includes("/api/");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // CRITICAL: Hardcoded secrets
    if (/sk-ant-[a-zA-Z0-9_-]{20,}/.test(line)) {
      finding("critical", "HARDCODED_ANTHROPIC_KEY", rel, lineNum,
        "Anthropic API key hardcoded in source file");
    }
    if (/AIza[0-9A-Za-z_-]{35}/.test(line)) {
      finding("critical", "HARDCODED_GOOGLE_KEY", rel, lineNum,
        "Google API key hardcoded in source file");
    }
    if (/sk_[a-zA-Z0-9]{32,}/.test(line) && !rel.includes("verify.mjs")) {
      finding("critical", "HARDCODED_SECRET", rel, lineNum,
        "Possible hardcoded secret key");
    }

    // CRITICAL: API keys exposed to client
    if (isClientFile && /process\.env\.(ANTHROPIC|GOOGLE|ELEVENLABS|KLING|OPENSTATES|CONGRESS)_API_KEY/.test(line)) {
      finding("critical", "SECRET_IN_CLIENT", rel, lineNum,
        `Server-only env var accessed in client component — key will be exposed to browser`);
    }

    // HIGH: SQL/Command injection patterns (if any DB added later)
    if (/exec\s*\(\s*[`'"].*\$\{/.test(line) || /query\s*\(\s*`.*\$\{/.test(line)) {
      finding("high", "INJECTION_RISK", rel, lineNum,
        "Template literal in exec/query — potential injection if user input is used");
    }

    // HIGH: eval usage
    if (/\beval\s*\(/.test(line) && !line.trim().startsWith("//")) {
      finding("high", "EVAL_USAGE", rel, lineNum, "eval() is dangerous — allows code injection");
    }

    // HIGH: dangerouslySetInnerHTML without sanitisation
    if (/dangerouslySetInnerHTML/.test(line)) {
      finding("high", "DANGEROUS_INNER_HTML", rel, lineNum,
        "dangerouslySetInnerHTML can cause XSS — ensure content is sanitized");
    }

    // HIGH: Unvalidated JSON.parse in API routes (only flag if no try/catch in the whole route handler)
    if (isApiRoute && /JSON\.parse\(/.test(line) && !content.includes("try {") && !content.includes("try{")) {
      finding("high", "UNGUARDED_JSON_PARSE", rel, lineNum,
        "JSON.parse without surrounding try/catch — can crash the route");
    }

    // MEDIUM: console.log with potential sensitive data in API routes
    if (isApiRoute && /console\.(log|error)\(.*(?:key|token|secret|password|auth)/i.test(line)) {
      finding("medium", "SENSITIVE_LOG", rel, lineNum,
        "Possible sensitive value being logged — check this doesn't expose secrets in prod");
    }

    // MEDIUM: Missing input validation on API routes (no body size limit hint)
    if (isApiRoute && /await req\.json\(\)/.test(line)) {
      const routeContent = content;
      if (!routeContent.includes("slice(0,") && !routeContent.includes(".slice(0")) {
        finding("medium", "NO_INPUT_TRUNCATION", rel, lineNum,
          "req.json() without input size limit — large payloads could cause issues. Consider truncating user input before passing to AI.");
      }
    }

    // MEDIUM: fetch() where URL interpolates a variable that could be user-controlled
    // Only flag if the interpolated variable looks like it comes from request input (not a const)
    if (/fetch\s*\(\s*`.*\$\{/.test(line) && isApiRoute) {
      const interpolated = (line.match(/\$\{([^}]+)\}/g) ?? []).map(m => m.slice(2, -1));
      const likellyUserInput = interpolated.some(v =>
        /req|body|param|query|input|data/i.test(v) && !/BASE|URL|HOST|ENDPOINT|KEY/i.test(v)
      );
      if (likellyUserInput) {
        finding("medium", "SSRF_RISK", rel, lineNum,
          "fetch() URL interpolates what looks like user input — verify it's sanitized");
      }
    }

    // MEDIUM: next.config without security headers
    if (rel.includes("next.config") && !content.includes("headers")) {
      finding("medium", "MISSING_SECURITY_HEADERS", rel, lineNum,
        "next.config has no security headers (CSP, X-Frame-Options, etc.)");
    }

    // INFO: TODO/FIXME security notes
    if (/\/\/\s*(TODO|FIXME|HACK|XXX).*(?:auth|security|secret|key|token)/i.test(line)) {
      finding("info", "SECURITY_TODO", rel, lineNum, line.trim());
    }
  }
}

// ── .env checks ──────────────────────────────────────────────────
try {
  const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
  if (!gitignore.includes(".env.local")) {
    finding("critical", "ENV_NOT_GITIGNORED", ".gitignore", 0,
      ".env.local is not in .gitignore — secrets will be committed");
  }
} catch {
  finding("high", "NO_GITIGNORE", ".gitignore", 0, ".gitignore not found");
}

try {
  const envExample = readFileSync(join(ROOT, ".env.local"), "utf8");
  const keyPattern = /sk-ant-api[^\s]+|AIza[^\s]+/;
  if (keyPattern.test(envExample)) {
    // This is in .env.local which is gitignored — just an info note
    finding("info", "LIVE_KEYS_IN_ENV", ".env.local", 0,
      ".env.local contains live API keys (expected, but ensure this file is never committed)");
  }
} catch { /* no .env.local — fine */ }

// ── package.json audit hint ──────────────────────────────────────
try {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  // Flag known outdated patterns
  if (deps["next"] && deps["next"].startsWith("14.")) {
    finding("info", "OLD_NEXT_VERSION", "package.json", 0,
      "Next.js 14.x — consider upgrading to 15.x for latest security patches");
  }
} catch { /* skip */ }

// ── Report ───────────────────────────────────────────────────────
console.log(`\n${BOLD}CivicNudge — Security Scan${RESET}`);
console.log(`${DIM}Scanned ${files.length} files${RESET}\n`);

const SEVERITY_CONFIG = {
  critical: { color: RED, label: "CRITICAL", emoji: "🚨" },
  high:     { color: RED, label: "HIGH",     emoji: "🔴" },
  medium:   { color: YELLOW, label: "MEDIUM", emoji: "🟡" },
  info:     { color: DIM,  label: "INFO",    emoji: "ℹ️ " },
};

let totalIssues = 0;
for (const [sev, cfg] of Object.entries(SEVERITY_CONFIG)) {
  const items = findings[sev];
  if (items.length === 0) continue;
  totalIssues += items.length;
  console.log(`${cfg.color}${BOLD}${cfg.emoji}  ${cfg.label} (${items.length})${RESET}`);
  for (const f of items) {
    const loc = f.line ? `${f.file}:${f.line}` : f.file;
    console.log(`   ${cfg.color}[${f.rule}]${RESET} ${loc}`);
    console.log(`   ${DIM}${f.detail}${RESET}`);
  }
  console.log();
}

console.log("─".repeat(40));
const criticalCount = findings.critical.length;
const highCount = findings.high.length;

if (totalIssues === 0) {
  console.log(`${GREEN}${BOLD}No issues found ✓${RESET}\n`);
} else if (criticalCount > 0) {
  console.log(`${RED}${BOLD}${criticalCount} critical issue(s) require immediate attention${RESET}`);
  console.log(`${DIM}Fix critical issues before committing or deploying.${RESET}\n`);
  process.exit(2);
} else if (highCount > 0) {
  console.log(`${YELLOW}${BOLD}${highCount} high-severity issue(s) found${RESET}\n`);
  process.exit(1);
} else {
  console.log(`${YELLOW}${totalIssues} informational finding(s) — no action required${RESET}\n`);
}
