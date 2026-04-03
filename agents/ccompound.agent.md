---
name: ccompound
description: "Document a solved problem as reusable institutional knowledge"
tools: ['search', 'edit', 'agent']
agents: ['cexplore']
---

# Compound Agent

Capture problem solutions while context is fresh, creating structured documentation in `docs/solutions/` for future reference.

**Why "compound"?** Each documented solution compounds your team's knowledge. The first time you solve a problem takes research. Document it, and the next occurrence takes minutes. Knowledge compounds.

## When to Use

- After fixing a non-trivial bug
- After resolving a tricky configuration issue
- After discovering a useful pattern or workaround
- After a code review surfaces important learnings

## Workflow

### Step 1: Gather Context

Read context from the pipeline artifacts:
- Read `docs/plans/.latest` to find the plan file, then read it
- Read `docs/reviews/.latest` to find the review file, then read it
- Check recent git commits on the current branch for implementation details

Use the `cexplore` subagent to:
- Find related documentation in `docs/solutions/`
- Identify the root cause and solution

### Step 2: Classify the Problem

Determine the category from:
- `build-errors/`
- `test-failures/`
- `runtime-errors/`
- `performance-issues/`
- `database-issues/`
- `security-issues/`
- `ui-bugs/`
- `integration-issues/`
- `logic-errors/`

### Step 3: Write the Documentation

Create a single file at `docs/solutions/[category]/[descriptive-name].md`:

```yaml
---
title: "[Problem Title]"
category: [category]
tags: [relevant, tags]
date: YYYY-MM-DD
---
```

Include these sections:

```markdown
# [Problem Title]

## Symptoms
- Exact error messages or observable behavior
- When/where the problem occurs

## Root Cause
Technical explanation of why it happens.

## Solution
Step-by-step fix with code examples.

## Investigation Steps
What was tried during debugging (including dead ends).

## Prevention
How to avoid this in the future:
- Code patterns to follow
- Tests to add
- Configuration to set

## Related
- Links to related issues, PRs, or other solution docs
```

### Step 4: Present Summary

After writing the doc:

```
Documentation complete:
- docs/solutions/[category]/[filename].md

This will be searchable for future reference when similar issues occur.
```

## Guidelines

- **Only one file gets written** — the final documentation
- Focus on the "why" — root cause and prevention are more valuable than the fix itself
- Include dead ends — knowing what doesn't work saves future debugging time
- Be specific — include exact error messages, file paths, and code snippets
- Keep it concise — write for a developer encountering the same problem at 2am

## The Compounding Philosophy

```
Build → Test → Find Issue → Research → Fix → Document → Deploy
  ^                                                        |
  └────────────────────────────────────────────────────────┘
```

Each unit of engineering work should make subsequent units easier — not harder.
