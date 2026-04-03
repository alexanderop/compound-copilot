#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const force = process.argv.includes("--force") || process.argv.includes("-f");

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const agentsSrc = resolve(__dirname, "..", "agents");
const skillsSrc = resolve(__dirname, "..", "skills");
const agentsTarget = resolve(process.cwd(), ".github", "agents");
const skillsTarget = resolve(process.cwd(), ".github", "skills");

const agentFiles = readdirSync(agentsSrc).filter((f) => f.endsWith(".agent.md"));
const agentRefDirs = readdirSync(agentsSrc).filter((d) =>
  d.endsWith(".references") && existsSync(join(agentsSrc, d))
);
const skillDirs = readdirSync(skillsSrc).filter((d) =>
  existsSync(join(skillsSrc, d, "SKILL.md"))
);

if (agentFiles.length === 0 && skillDirs.length === 0) {
  console.error("No agent or skill files found in package. This is a bug.");
  process.exit(1);
}

mkdirSync(agentsTarget, { recursive: true });
mkdirSync(skillsTarget, { recursive: true });

// Scaffold docs directories so skills can write plans and solutions immediately
const docsScaffold = ["docs/brainstorms", "docs/plans", "docs/reviews", "docs/solutions", "docs/tests", "docs/specflows"];
for (const dir of docsScaffold) {
  const dirPath = resolve(process.cwd(), dir);
  mkdirSync(dirPath, { recursive: true });
  const gitkeep = join(dirPath, ".gitkeep");
  if (!existsSync(gitkeep)) {
    writeFileSync(gitkeep, "");
  }
}

let copied = 0;
let skipped = 0;
let updated = 0;

function copyFile(src, dest, label) {
  if (existsSync(dest) && !force) {
    console.log(`  skip  ${label} (already exists)`);
    skipped++;
  } else {
    const action = existsSync(dest) ? "update" : "copy";
    cpSync(src, dest);
    console.log(`  ${action}  ${label}`);
    if (action === "update") updated++;
    else copied++;
  }
}

// Install agents
for (const file of agentFiles) {
  copyFile(join(agentsSrc, file), join(agentsTarget, file), `agents/${file}`);
}

// Install agent reference directories
for (const dir of agentRefDirs) {
  const destDir = join(agentsTarget, dir);
  mkdirSync(destDir, { recursive: true });
  const refFiles = readdirSync(join(agentsSrc, dir)).filter((f) => f.endsWith(".md"));
  for (const file of refFiles) {
    copyFile(join(agentsSrc, dir, file), join(destDir, file), `agents/${dir}/${file}`);
  }
}

// Install skills and their reference directories
for (const dir of skillDirs) {
  const skillDir = join(skillsTarget, dir);
  mkdirSync(skillDir, { recursive: true });

  // Copy SKILL.md
  copyFile(join(skillsSrc, dir, "SKILL.md"), join(skillDir, "SKILL.md"), `skills/${dir}/SKILL.md`);

  // Copy skill reference directories (e.g., plan.references/)
  const skillSrcDir = join(skillsSrc, dir);
  const refDirs = readdirSync(skillSrcDir).filter((d) =>
    d.endsWith(".references") && existsSync(join(skillSrcDir, d))
  );
  for (const refDir of refDirs) {
    const destRefDir = join(skillDir, refDir);
    mkdirSync(destRefDir, { recursive: true });
    const refFiles = readdirSync(join(skillSrcDir, refDir)).filter((f) => f.endsWith(".md"));
    for (const file of refFiles) {
      copyFile(
        join(skillSrcDir, refDir, file),
        join(destRefDir, file),
        `skills/${dir}/${refDir}/${file}`
      );
    }
  }
}

const parts = [];
if (copied > 0) parts.push(`${copied} installed`);
if (updated > 0) parts.push(`${updated} updated`);
if (skipped > 0) parts.push(`${skipped} skipped`);
console.log(`\nDone — ${parts.join(", ")} in .github/`);
