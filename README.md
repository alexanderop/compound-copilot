# compound-copilot

[![CI](https://img.shields.io/github/actions/workflow/status/alexanderopalic/compound-copilot/validate.yml?branch=main&label=CI)](https://github.com/alexanderopalic/compound-copilot/actions)
[![npm version](https://img.shields.io/npm/v/compound-copilot)](https://www.npmjs.com/package/compound-copilot)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Structured plan-work-review-compound loops for VS Code Copilot — zero extension code, just markdown agents.

```
@lfg Add webhook notifications when posts are published
```

```
  cbrainstorm ──→ cplan ──┬──→ ctest ──→ cwork ──┬──→ csimplify ──→ creview ──→ ccompound
   (optional)       │     │   (optional)    │     │        │            │             │
       │            ▼     │      │          ▼     │        ▼            ▼             ▼
    cexplore     cexplore │    write     cexplore │     reuse       security      cexplore
    cdocs        research │    tests     patterns │     quality     refactoring   document
    dialogue     learnings│    (red or   make     │     efficiency  architecture  learnings
                 docs     │    verify)   green    │     fix         custom...
                 cspecflow│              commits  │                     │
                 (1.5)    │                       │                     ▼
                          └───── cwork ───────────┘           docs/solutions/
                            (skip tests)    (test after)     ◄── fed back into future plans
```

## Table of Contents

- [Why](#why)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Agents](#agents)
- [Skills](#skills)
- [How It Works](#how-it-works)
- [Adding Custom Reviewers](#adding-custom-reviewers)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Why

VS Code Copilot has its own agent system (`.agent.md` files, subagents, handoffs) but no structured workflow for plan-work-review loops. This project brings the [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) workflow — originally a Claude Code plugin by [Every](https://every.to) — to Copilot as pure markdown agents.

No extension code. No runtime dependencies. Works with any model Copilot supports.

Read more about the philosophy:
- [Compound engineering: how Every codes with agents](https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents)
- [The story behind compounding engineering](https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it)

## Quick Start

```bash
npx compound-copilot
```

This copies agents into `.github/agents/` and skills into `.github/skills/` in your project. It also creates `docs/plans/`, `docs/tests/`, and `docs/solutions/` for pipeline artifacts. Existing files are not overwritten.

Requires VS Code 1.109+ with GitHub Copilot.

## Usage

### Full pipeline

Run all five stages in one go:

```
@lfg Add user authentication with OAuth
```

This plans the feature, writes failing tests (TDD), implements to make them pass, simplifies the code, runs parallel reviews, and documents what was learned.

### Individual agents

Use agents independently when you don't need the full loop:

```
@cbrainstorm Add rate limiting to the API    # explore approaches first
@cplan Add rate limiting to the API          # research & plan
@ctest                                       # write tests from plan (before or after code)
@cwork docs/plans/2026-04-03-feat-rate-limiting-plan.md   # execute a plan
@csimplify                                   # clean up changed code
@creview 42                                  # review PR #42
@ccompound                                   # document learnings
```

Testing is flexible — use `ctest` before or after `cwork`:

```
@cplan → @ctest → @cwork → @csimplify       # TDD: tests first, then implement
@cplan → @cwork → @ctest → @csimplify       # code first, then add tests
@cplan → @cwork → @csimplify                 # skip tests entirely
```

### Scaffold a custom reviewer

```
@create-agent Vue component reviewer
```

## Agents

### Orchestrators (user-facing)

| Agent | What it does |
|-------|-------------|
| `cbrainstorm` | Explores requirements through dialogue, generates approaches with trade-offs, writes brainstorm to `docs/brainstorms/` |
| `cplan` | Dispatches research subagents in parallel (including spec-flow analysis for Standard/Comprehensive plans), asks clarifying questions, writes a plan to `docs/plans/` |
| `ctest` | Writes tests from the plan's acceptance criteria — before implementation (TDD red phase) or after (verification) |
| `cwork` | Reads the plan, creates a branch, implements step by step — makes pre-written tests green or writes new ones |
| `csimplify` | Diffs changed files, launches 3 parallel reviewers (reuse, quality, efficiency), fixes issues directly |
| `creview` | Dispatches security, refactoring, and architecture reviewers in parallel; auto-discovers custom reviewers |
| `ccompound` | Documents non-trivial problems into `docs/solutions/` for future reference |
| `create-agent` | Scaffolds new `.agent.md` files with correct Copilot frontmatter |

### Subagents (dispatched by orchestrators)

| Agent | What it does |
|-------|-------------|
| `cexplore` | Read-only codebase research — architecture, patterns, conventions |
| `clearnings` | Searches `docs/solutions/` for past fixes and gotchas |
| `cdocs` | Fetches current library/framework documentation (Context7, llms.txt, DeepWiki) |
| `cgithistory` | Traces file evolution, code origin, contributor mapping via git history |
| `security-reviewer` | Hunts injection vectors, auth bypasses, hardcoded secrets, SSRF |
| `refactoring-reviewer` | Detects code smells using Martin Fowler's refactoring patterns |
| `architecture-reviewer` | Evaluates boundaries, dependencies, coupling, SOLID principles |
| `cspecflow` | Analyzes specs for user flow completeness, edge cases, and requirement gaps (called by `cplan` Phase 1.5) |

## Skills

| Skill | What it does |
|-------|-------------|
| `lfg` | Runs the full pipeline: plan, test, implement, simplify, review, compound |
| `create-agent` | Scaffolds new agents via skill interface |
| `agent-guide` | Interactive reference for the VS Code Copilot agent format — frontmatter, tools, handoffs, and patterns |

Skills are workflow recipes that compose agents into higher-level sequences. They live in `.github/skills/<name>/SKILL.md`.

## How It Works

### The file-bridge pattern

VS Code Copilot handoffs continue in the same chat session. In a multi-step workflow, earlier steps fill the context window with irrelevant noise — this is **context rot**. There is no API to start a fresh session from a handoff ([microsoft/vscode#287170](https://github.com/microsoft/vscode/issues/287170)).

The workaround: every agent reads input from disk and writes output to disk. Chat history is disposable. Each handoff uses `/clear` so the next stage starts with a fresh context window.

### Context flow

```
cbrainstorm writes → docs/brainstorms/.latest  (pointer to brainstorm — optional)
cplan reads        ← docs/brainstorms/.latest  (picks up brainstorm if it exists)
cspecflow writes   → docs/specflows/.latest    (flow analysis — called by cplan Phase 1.5)
cplan writes       → docs/plans/.latest        (pointer to current plan)
ctest reads        ← docs/plans/.latest        (writes tests — optional, before or after cwork)
ctest writes       → docs/tests/.latest        (list of test file paths)
cwork reads        ← docs/plans/.latest + docs/tests/.latest (if tests exist, makes them green)
csimplify reads    ← docs/plans/.latest        (diffs + fixes changed code)
creview writes     → docs/reviews/.latest      (pointer to review report)
ccompound reads    ← docs/plans/.latest + docs/reviews/.latest
```

The `.latest` files are single-line pointers containing the path to the most recent artifact. They are gitignored — ephemeral pipeline state, not project artifacts.

### Knowledge compounding

The `ccompound` agent writes solutions to `docs/solutions/`. On future runs, `cplan` dispatches the `clearnings` subagent to search these files. Problems solved once are surfaced automatically in future planning — closing the knowledge loop.

## Adding Custom Reviewers

The `creview` agent auto-discovers any `*-reviewer.agent.md` files in your agents directory. If a reviewer's domain matches the changed file types, it gets dispatched automatically.

To add one:

1. Run `@create-agent Vue component reviewer`
2. Place it in `.github/agents/` (e.g., `vue-reviewer.agent.md`)
3. It will be auto-discovered on the next review

Custom reviewers must have:
- Name ending in `-reviewer`
- `user-invocable: false` and `disable-model-invocation: true`
- Read-only tools only (`search/codebase`, `search/usages`)

## Development

### Validate frontmatter

```bash
node src/validate.js
```

Checks all `.agent.md` and `SKILL.md` files for Copilot schema compliance, forbidden fields, and valid tool names.

### CI

Frontmatter validation runs automatically on push and PR via GitHub Actions.

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

## License

MIT
