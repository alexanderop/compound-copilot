#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import { basename, relative } from "node:path";
import { validateToolName } from "./copilot-tool-registry.js";

// ---------------------------------------------------------------------------
// Schema — VS Code Copilot agent frontmatter
// ---------------------------------------------------------------------------

const SCHEMAS = {
  agent: {
    label: ".agent.md",
    allowed: new Set([
      "name",
      "description",
      "argument-hint",
      "tools",
      "agents",
      "model",
      "user-invocable",
      "disable-model-invocation",
      "target",
      "mcp-servers",
      "handoffs",
      "hooks",
    ]),
    required: [],
  },
  skill: {
    label: "SKILL.md",
    allowed: new Set([
      "name",
      "description",
      "argument-hint",
      "user-invocable",
      "disable-model-invocation",
    ]),
    required: ["name", "description"],
  },
};

// Claude Code-only fields that must not appear
const BANNED = new Set(["color", "context", "allowed-tools", "disallowedTools"]);

// Deprecated Copilot fields with replacement guidance
const DEPRECATED = {
  infer: 'use "user-invocable" and "disable-model-invocation" instead',
};

// ---------------------------------------------------------------------------
// Frontmatter parsing
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const lines = match[1].split(/\r?\n/);
  const keys = [];
  for (const line of lines) {
    const keyMatch = line.match(/^([a-zA-Z][\w-]*):/);
    if (keyMatch) keys.push(keyMatch[1]);
  }
  return { keys, raw: match[1] };
}

function extractYamlValue(raw, key) {
  const match = raw.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match) return null;
  return match[1].trim().replace(/^['"]|['"]$/g, "");
}

function extractYamlArray(raw, key) {
  const match = raw.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match) return null;
  const val = match[1].trim();
  const items = val.match(/['"]([^'"]*)['"]/g);
  if (!items) {
    if (val === "'*'" || val === '"*"' || val === "*") return ["*"];
    return null;
  }
  return items.map((s) => s.replace(/^['"]|['"]$/g, ""));
}

// ---------------------------------------------------------------------------
// File type detection
// ---------------------------------------------------------------------------

function detectType(filePath) {
  if (filePath.endsWith(".agent.md")) return "agent";
  if (filePath.endsWith("SKILL.md")) return "skill";
  return null;
}

// ---------------------------------------------------------------------------
// File discovery
// ---------------------------------------------------------------------------

async function discoverFiles(root) {
  const files = [];
  for await (const entry of glob(
    [`${root}/agents/**/*.agent.md`, `${root}/skills/**/SKILL.md`],
    { withFileTypes: false }
  )) {
    files.push(entry);
  }
  return files.sort();
}

// ---------------------------------------------------------------------------
// Collect known agent names
// ---------------------------------------------------------------------------

async function collectAgentNames(root) {
  const names = new Set();
  for await (const entry of glob([`${root}/agents/**/*.agent.md`], {
    withFileTypes: false,
  })) {
    const content = await readFile(entry, "utf-8");
    const fm = parseFrontmatter(content);
    if (fm) {
      const name = extractYamlValue(fm.raw, "name");
      if (name) names.add(name);
    }
    const derived = basename(entry).replace(/\.agent\.md$/, "");
    names.add(derived);
  }
  return names;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateFile(filePath, content, knownAgents) {
  const errors = [];
  const warnings = [];
  const type = detectType(filePath);
  if (!type) return { errors, warnings };

  const schema = SCHEMAS[type];
  const fm = parseFrontmatter(content);

  if (!fm) {
    if (schema.required.length > 0) {
      errors.push(`Missing frontmatter — required fields: ${schema.required.join(", ")}`);
    }
    return { errors, warnings };
  }

  // Check for banned and unknown keys
  for (const key of fm.keys) {
    if (BANNED.has(key)) {
      errors.push(`Banned field "${key}" — Claude Code only, not valid in VS Code Copilot`);
    } else if (DEPRECATED[key]) {
      errors.push(`Deprecated field "${key}" — ${DEPRECATED[key]}`);
    } else if (!schema.allowed.has(key)) {
      const suggestion = findClosest(key, schema.allowed);
      const hint = suggestion ? ` Did you mean "${suggestion}"?` : "";
      errors.push(`Unknown field "${key}" — not in ${schema.label} schema.${hint}`);
    }
  }

  // Check required fields
  for (const req of schema.required) {
    if (!fm.keys.includes(req)) {
      errors.push(`Missing required field "${req}"`);
    }
  }

  // Validate tool names
  if (type === "agent") {
    const tools = extractYamlArray(fm.raw, "tools");
    if (tools && !tools.includes("*")) {
      for (const tool of tools) {
        const result = validateToolName(tool);
        if (!result.valid) {
          errors.push(result.message);
        }
      }
    }
  }

  // Cross-validation for agents
  if (type === "agent") {
    const tools = extractYamlArray(fm.raw, "tools");
    const agents = extractYamlArray(fm.raw, "agents");

    if (agents && agents.length > 0 && tools && !tools.includes("*")) {
      const hasAgentTool = tools.some((t) => t === "agent" || t === "agents");
      if (!hasAgentTool) {
        warnings.push(`When "agents" and "tools" are specified, the "agent" tool should be included in "tools"`);
      }
    }

    if (agents && !agents.includes("*") && knownAgents) {
      for (const agentName of agents) {
        if (!knownAgents.has(agentName)) {
          warnings.push(`Unknown agent "${agentName}" — not found in agents/ directory`);
        }
      }
    }

    // Validate handoff agent references
    if (fm.keys.includes("handoffs")) {
      const handoffAgents = [...fm.raw.matchAll(/^\s+agent:\s*(.+)$/gm)]
        .map((m) => m[1].trim().replace(/^['"]|['"]$/g, ""));
      for (const agentName of handoffAgents) {
        if (knownAgents && !knownAgents.has(agentName)) {
          warnings.push(`Handoff references unknown agent "${agentName}" — not found in agents/ directory`);
        }
      }
    }
  }

  return { errors, warnings };
}

// ---------------------------------------------------------------------------
// Fuzzy matching
// ---------------------------------------------------------------------------

function findClosest(input, allowed) {
  let best = null;
  let bestDist = Infinity;
  for (const candidate of allowed) {
    const d = levenshtein(input, candidate);
    if (d < bestDist && d <= 3) {
      bestDist = d;
      best = candidate;
    }
  }
  return best;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const root = process.cwd();
  const files = await discoverFiles(root);

  if (files.length === 0) {
    console.log("No markdown files found to validate.");
    process.exit(0);
  }

  const knownAgents = await collectAgentNames(root);

  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];

  for (const filePath of files) {
    const content = await readFile(filePath, "utf-8");
    const rel = relative(root, filePath);
    const { errors, warnings } = validateFile(filePath, content, knownAgents);

    if (errors.length > 0 || warnings.length > 0) {
      totalErrors += errors.length;
      totalWarnings += warnings.length;
      results.push({ file: rel, errors, warnings });
    }
  }

  for (const { file, errors, warnings } of results) {
    if (errors.length > 0) {
      console.log(`\nERROR  ${file}`);
      for (const err of errors) console.log(`  ${err}`);
    }
    if (warnings.length > 0) {
      console.log(`\nWARN   ${file}`);
      for (const w of warnings) console.log(`  ${w}`);
    }
  }

  const warnSuffix = totalWarnings > 0
    ? `, ${totalWarnings} warning${totalWarnings === 1 ? "" : "s"}`
    : "";

  if (totalErrors === 0) {
    console.log(`\nOK  ${files.length} files checked, 0 errors${warnSuffix}`);
    process.exit(0);
  } else {
    console.log(`\nFAILED  ${files.length} files checked, ${totalErrors} error${totalErrors === 1 ? "" : "s"}${warnSuffix}`);
    process.exit(1);
  }
}

main();
