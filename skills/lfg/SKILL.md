---
name: lfg
description: "Full Compound Engineering pipeline — plan, implement, simplify, review, and document in one go. Use when asked to build a feature end-to-end."
---

# LFG Pipeline

Run the full Compound Engineering pipeline: plan, then work, then simplify, then review, then compound.

**Critical: Every step MUST be delegated to its subagent.** Do not perform any step inline. Each agent runs in its own context to avoid context rot — the whole point of the pipeline is that each stage gets a fresh context window with only the file-based artifacts it needs.

## Workflow

### 0. Brainstorm (optional)

Before planning, evaluate whether brainstorming would help:

- **Skip brainstorming** when the feature is clear, well-scoped, and has an obvious approach (e.g., "add a created_at column to users")
- **Brainstorm first** when the feature is ambiguous, has multiple valid approaches, or the user explicitly asks to brainstorm

**If brainstorming:** Delegate to the `@cbrainstorm` subagent with the user's feature description.

- The subagent explores intent, generates approaches, and writes a brainstorm to `docs/brainstorms/`
- Do NOT brainstorm yourself — that is cbrainstorm's job

**Gate: Pause for user decision.** Present: "Brainstorm complete. Say 'plan' to move to planning, or keep exploring."

If the user says "brainstorm" or "let's think about this first" anywhere in their request, always run this step.

### 1. Plan

Delegate to the `@cplan` subagent with the user's feature description.

- The subagent researches the codebase, asks clarifying questions, and writes a plan to `docs/plans/`
- If a brainstorm was produced in step 0, `cplan` will automatically pick it up from `docs/brainstorms/.latest`
- Do NOT research the codebase yourself — that is cplan's job

**Gate: Pause for user approval before proceeding.**

Present: "Plan ready. Review it and say 'go' to start implementation, or provide feedback to refine."

### 2. Implement

Delegate to the `@cwork` subagent.

- Pass the plan path (read from `docs/plans/.latest`) to the subagent
- The subagent creates a feature branch, implements step by step, runs tests, and makes incremental commits
- Do NOT write code yourself — that is cwork's job

### 3. Simplify

Delegate to the `@csimplify` subagent.

- The subagent diffs changed files and launches three parallel review subagents: code reuse, code quality, and efficiency
- It fixes any issues found directly — deduplication, replacing hand-rolled logic with existing utilities, removing unnecessary work
- This reduces noise in the review step so reviewers can focus on real issues
- Do NOT simplify code yourself — that is simplify's job

### 4. Review

Delegate to the `@creview` subagent.

- The subagent reads context from `docs/plans/.latest`
- It dispatches `security-reviewer`, `refactoring-reviewer`, and `architecture-reviewer` in parallel
- It writes findings to `docs/reviews/` and updates `docs/reviews/.latest`
- Do NOT review code yourself — that is creview's job

### 5. Resolve

If the review surfaces critical (P1) findings:
- Read findings from `docs/reviews/.latest`
- Delegate back to the `@cwork` subagent with the specific P1 findings to fix
- The subagent addresses each finding, re-runs tests, and commits fixes
- Do NOT fix issues yourself — delegate to cwork

### 6. Compound

Delegate to the `@ccompound` subagent.

- The subagent reads context from `docs/plans/.latest` and `docs/reviews/.latest`
- **Skip this step** if the work was straightforward with no unexpected issues
- Do NOT write documentation yourself — that is ccompound's job

### 7. Ship

- Push to remote
- Create a pull request with summary, testing notes, and review findings

## Usage

Just describe what you want to build:

> @lfg Add a webhook notification system that sends events to configured URLs when new posts are published

The pipeline handles the rest. You intervene at the plan approval gate and whenever clarification is needed.
