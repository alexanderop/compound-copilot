#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const agentsSrc = resolve(__dirname, "..", "agents");
const skillsSrc = resolve(__dirname, "..", "skills");
const agentsTarget = resolve(process.cwd(), ".github", "agents");
const skillsTarget = resolve(process.cwd(), ".github", "skills");

const agentFiles = readdirSync(agentsSrc).filter((f) => f.endsWith(".agent.md"));
const skillDirs = readdirSync(skillsSrc).filter((d) =>
  existsSync(join(skillsSrc, d, "SKILL.md"))
);

if (agentFiles.length === 0 && skillDirs.length === 0) {
  console.error("No agent or skill files found in package. This is a bug.");
  process.exit(1);
}

mkdirSync(agentsTarget, { recursive: true });
mkdirSync(skillsTarget, { recursive: true });

// Scaffold docs directories so agents can write plans and solutions immediately
const docsScaffold = ["docs/brainstorms", "docs/plans", "docs/solutions"];
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

// Install agents
for (const file of agentFiles) {
  const dest = join(agentsTarget, file);
  if (existsSync(dest)) {
    console.log(`  skip  agents/${file} (already exists)`);
    skipped++;
  } else {
    cpSync(join(agentsSrc, file), dest);
    console.log(`  copy  agents/${file}`);
    copied++;
  }
}

// Install skills
for (const dir of skillDirs) {
  const dest = join(skillsTarget, dir, "SKILL.md");
  if (existsSync(dest)) {
    console.log(`  skip  skills/${dir}/SKILL.md (already exists)`);
    skipped++;
  } else {
    mkdirSync(join(skillsTarget, dir), { recursive: true });
    cpSync(join(skillsSrc, dir, "SKILL.md"), dest);
    console.log(`  copy  skills/${dir}/SKILL.md`);
    copied++;
  }
}

console.log(
  `\nDone — ${copied} file${copied === 1 ? "" : "s"} installed to .github/` +
    (skipped > 0 ? ` (${skipped} skipped)` : "")
);
