# compound-copilot

[![CI](https://img.shields.io/github/actions/workflow/status/alexanderopalic/compound-copilot/validate.yml?branch=main&label=CI)](https://github.com/alexanderopalic/compound-copilot/actions)
[![npm version](https://img.shields.io/npm/v/compound-copilot)](https://www.npmjs.com/package/compound-copilot)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Structured plan-work-review-compound loops for VS Code Copilot — zero extension code, markdown skills and agents.

```
/lfg Add webhook notifications when posts are published
```

```
  /brainstorm ──→ /plan ──┬──→ /test ──→ /work ──┬──→ /simplify ──→ creview ──→ /compound
   (optional)       │     │   (optional)    │     │        │           agent          │
       │            ▼     │      │          ▼     │        ▼            │             ▼
    cexplore     cexplore │    write     cexplore │     reuse       security      cexplore
    cdocs        research │    tests     patterns │     quality     refactoring   document
    dialogue     learnings│    (red or   make     │     efficiency  architecture  learnings
                 docs     │    verify)   green    │     fix         custom...
                 cspecflow│              commits  │                     │
                 (1.5)    │                       │                     ▼
                    │     └───── /work ───────────┘           docs/solutions/
                    ▼       (skip tests)    (test after)     ◄── fed back into future plans
              /document-review
              /deepen (optional)
               coherence
               feasibility
               adversarial
               product-lens
               design-lens
               scope-guardian
               security-lens
```

Skills ask what you want to do next after each step — pick the suggested option or choose your own path.

## Table of Contents

- [Why](#why)
- [Quick Start](#quick-start)
- [Usage](#usage)
- [Skills](#skills)
- [Agents](#agents)
- [How It Works](#how-it-works)
- [Adding Custom Reviewers](#adding-custom-reviewers)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Why

VS Code Copilot has its own agent system (`.agent.md` files, subagents, handoffs) but no structured workflow for plan-work-review loops. This project brings the [Compound Engineering](https://github.com/EveryInc/compound-engineering-plugin) workflow — originally a Claude Code plugin by [Every](https://every.to) — to Copilot as pure markdown skills and agents.

No extension code. No runtime dependencies. Works with any model Copilot supports.

Read more about the philosophy:
- [Compound engineering: how Every codes with agents](https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents)
- [The story behind compounding engineering](https://every.to/source-code/my-ai-had-already-fixed-the-code-before-i-saw-it)

## Quick Start

```bash
npx github:alexanderop/compound-copilot
```

This copies agents into `.github/agents/` and skills into `.github/skills/` in your project. It also creates `docs/plans/`, `docs/tests/`, and `docs/solutions/` for pipeline artifacts. Existing files are not overwritten.

Requires VS Code 1.109+ with GitHub Copilot.

## Usage

### Full pipeline

Run all stages in one go:

```
/lfg Add user authentication with OAuth
```

This plans the feature, writes failing tests (TDD), implements to make them pass, simplifies the code, runs parallel reviews, and documents what was learned.

### Individual skills

Use skills independently when you don't need the full loop. Each skill asks what you want to do next when it finishes:

```
/brainstorm Add rate limiting to the API     # explore approaches first
/plan Add rate limiting to the API           # research & plan
/document-review docs/plans/2026-04-03-*.md  # multi-persona plan review
/deepen docs/plans/2026-04-03-*.md           # strengthen weak sections with research
/test                                        # write tests from plan (before or after code)
/work docs/plans/2026-04-03-feat-rate-limiting-plan.md   # execute a plan
/simplify                                    # clean up changed code
/compound                                    # document learnings
```

For code review, use the `creview` agent directly (it runs reviewers in isolated context):

```
@creview 42                                  # review PR #42
```

Testing is flexible — use `/test` before or after `/work`:

```
/plan → /test → /work → /simplify           # TDD: tests first, then implement
/plan → /work → /test → /simplify           # code first, then add tests
/plan → /work → /simplify                   # skip tests entirely
```

Each `→` is a handover — the skill suggests the next step and you confirm.

### Scaffold a custom reviewer

```
@create-agent Vue component reviewer
```

## Skills

Skills are the primary workflow interface. Each skill asks what you want to do next when it finishes, suggesting the logical next step. They live in `.github/skills/<name>/SKILL.md`.

### Workflow skills

| Skill | What it does | Suggests next |
|-------|-------------|---------------|
| `/brainstorm` | Explores requirements through dialogue, generates approaches with trade-offs, writes to `docs/brainstorms/` | `/plan` |
| `/plan` | Dispatches research subagents in parallel, asks clarifying questions, writes a plan to `docs/plans/` | `/test` or `/work` |
| `/test` | Writes tests from the plan's acceptance criteria — TDD red phase or post-implementation verification | `/work` or `/simplify` |
| `/work` | Reads the plan, creates a branch, implements step by step — makes pre-written tests green or writes new ones | `/simplify` or review |
| `/simplify` | Diffs changed files, launches 3 parallel reviewers (reuse, quality, efficiency), fixes issues directly | review or ship |
| `/compound` | Documents non-trivial problems into `docs/solutions/` for future reference | ship |
| `/document-review` | Dispatches persona reviewers (coherence, feasibility, + conditional) against a plan or brainstorm; auto-fixes clear issues, presents the rest | `/plan` or `/work` |
| `/deepen` | Scores plan sections for confidence gaps, dispatches targeted research, strengthens weak areas | `/work` or `/test` |
| `/lfg` | Autonomous end-to-end pipeline — runs all stages without asking between steps | — |

### Utility skills

| Skill | What it does |
|-------|-------------|
| `/git-commit` | Creates well-crafted commits following repo conventions |
| `/git-commit-push-pr` | Commits, pushes, and opens a PR in one step |
| `/git-worktree` | Manages Git worktrees for isolated parallel development |
| `/create-agent` | Scaffolds new `.agent.md` files with correct Copilot frontmatter |

## Agents

Agents are reserved for tasks that need isolated execution context — parallel reviewer dispatch and read-only subagents.

### Orchestrators

| Agent | What it does |
|-------|-------------|
| `creview` | Dispatches security, refactoring, and architecture reviewers in parallel; auto-discovers custom reviewers |
| `create-agent` | Scaffolds new `.agent.md` files with correct Copilot frontmatter |

### Subagents (dispatched by skills and agents)

| Agent | What it does |
|-------|-------------|
| `cexplore` | Read-only codebase research — architecture, patterns, conventions |
| `clearnings` | Searches `docs/solutions/` for past fixes and gotchas |
| `cdocs` | Fetches current library/framework documentation (Context7, llms.txt, DeepWiki) |
| `cbestpractices` | Researches industry standards, community conventions, and recommended patterns |
| `cspecflow` | Analyzes specs for user flow completeness, edge cases, and requirement gaps |

### Code reviewers (dispatched by `creview`)

| Agent | What it does |
|-------|-------------|
| `security-reviewer` | Hunts injection vectors, auth bypasses, hardcoded secrets, SSRF |
| `refactoring-reviewer` | Detects code smells using Martin Fowler's refactoring patterns |
| `architecture-reviewer` | Evaluates boundaries, dependencies, coupling, SOLID principles |

### Document reviewers (dispatched by `/document-review`)

These agents review plans and brainstorms _before_ implementation begins. The first two always run; the rest activate conditionally based on document content.

| Agent | What it does | Activation |
|-------|-------------|------------|
| `coherence-reviewer` | Contradictions between sections, terminology drift, broken internal references | Always |
| `feasibility-reviewer` | Architecture conflicts, dependency gaps, migration risks, implementability | Always |
| `adversarial-document-reviewer` | Challenges premises, surfaces unstated assumptions, stress-tests decisions | >5 requirements, high-stakes domains, new abstractions |
| `design-lens-reviewer` | Missing design decisions, interaction states, user flows, AI slop risk | UI/UX references in document |
| `product-lens-reviewer` | Premise challenges, strategic consequences, goal-work misalignment | Challengeable claims, strategic weight |
| `scope-guardian-reviewer` | Scope exceeds goals, unjustified complexity, priority dependency issues | Large requirement sets, multiple priority tiers |
| `security-lens-reviewer` | Auth/authz assumptions, data exposure, attack surface, plan-level threat model | Auth, APIs, data handling, third-party integrations |

## How It Works

### The file-bridge pattern

VS Code Copilot handoffs continue in the same chat session. In a multi-step workflow, earlier steps fill the context window with irrelevant noise — this is **context rot**. There is no API to start a fresh session from a handoff ([microsoft/vscode#287170](https://github.com/microsoft/vscode/issues/287170)).

The workaround: every agent reads input from disk and writes output to disk. Chat history is disposable. Each handoff uses `/clear` so the next stage starts with a fresh context window.

### Context flow

```
/brainstorm writes    → docs/brainstorms/.latest  (pointer to brainstorm — optional)
/plan reads           ← docs/brainstorms/.latest  (picks up brainstorm if it exists)
cspecflow writes      → docs/specflows/.latest    (flow analysis — called by /plan Phase 1.5)
/plan writes          → docs/plans/.latest        (pointer to current plan)
/document-review reads← docs/plans/.latest        (multi-persona plan review — optional)
/deepen reads         ← docs/plans/.latest        (strengthen weak sections — optional)
/test reads           ← docs/plans/.latest        (writes tests — optional, before or after /work)
/test writes          → docs/tests/.latest        (list of test file paths)
/work reads           ← docs/plans/.latest + docs/tests/.latest (if tests exist, makes them green)
/simplify reads       ← docs/plans/.latest        (diffs + fixes changed code)
creview writes        → docs/reviews/.latest      (pointer to review report)
/compound reads       ← docs/plans/.latest + docs/reviews/.latest
```

The `.latest` files are single-line pointers containing the path to the most recent artifact. They are gitignored — ephemeral pipeline state, not project artifacts.

### Knowledge compounding

The `/compound` skill writes solutions to `docs/solutions/`. On future runs, `/plan` dispatches the `clearnings` subagent to search these files. Problems solved once are surfaced automatically in future planning — closing the knowledge loop.

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
