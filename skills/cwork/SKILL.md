---
name: cwork
description: "Execute an implementation plan step by step with commits. Use when the user says 'implement this', 'build this', 'start working', 'execute the plan', or wants to turn a plan into working code."
argument-hint: "Path to plan file or describe what to implement"
---

# Work

Execute implementation plans efficiently while maintaining quality and shipping complete features.

## Subagents

This skill uses the `cexplore` subagent for codebase pattern research during implementation.

## Support Files

Read these on-demand at the step that needs them — do not bulk-load at start:

- `work.references/execution-strategies.md` — inline vs sequential vs parallel execution (read at Phase 1, Step 3)
- `work.references/quality-checklist.md` — pre-ship checklist and code review tiers (read at Phase 3)

## Workflow

### Phase 1: Quick Start

#### 1. Read Plan and Clarify
- If no plan path was provided, read the path from `docs/plans/.latest`
- Read the plan document completely
- Review any referenced files or links
- If anything is unclear, use `#askQuestions` to get clarification on specific ambiguities (scope, approach, trade-offs) before starting
- Get user approval to proceed
- **Do not skip this** — better to ask now than build the wrong thing

#### 2. Setup Environment

Check the current branch:
- **If already on a feature branch**: use `#askQuestions` to ask whether to continue on this branch or create a new one
- **If on the default branch**: create a feature branch with a meaningful name (e.g., `feat/user-authentication`, `fix/email-validation`)
- **Never commit directly to the default branch** without explicit user permission

#### 3. Break Down Tasks and Choose Strategy

**Read `work.references/execution-strategies.md`** to select the right approach.

- Break the plan into actionable tasks
- Prioritize based on dependencies
- Keep tasks specific and completable
- **Choose execution strategy:**
  - 1-2 tasks -> inline (execute directly)
  - 3+ independent tasks -> parallel subagents
  - 3+ dependent tasks -> sequential subagents

### Phase 2: Execute

#### Task Execution Loop

For each task in priority order:

1. Read any referenced files from the plan
2. Look for similar patterns in the codebase using the `cexplore` subagent
3. Implement following existing conventions
4. Check off the corresponding item in the plan file (`- [ ]` -> `- [x]`)
5. Evaluate for incremental commit

#### Incremental Commits

After completing each logical unit, evaluate whether to commit:

| Commit when... | Don't commit when... |
|----------------|---------------------|
| Logical unit complete (model, service, component) | Small part of a larger unit |
| Meaningful progress is complete and coherent | The unit is still partial |
| About to switch contexts (backend -> frontend) | Purely scaffolding with no behavior |
| About to attempt risky/uncertain changes | Would need a "WIP" commit message |

**Heuristic:** "Can I write a commit message that describes a complete, valuable change? If yes, commit."

Commit workflow:
1. Stage only files related to this logical unit
2. Commit with conventional message: `feat(scope): description`

#### Follow Existing Patterns
- Read referenced files from the plan first
- Match naming conventions exactly
- Reuse existing components where possible
- When in doubt, search for similar implementations

#### Stay Plan-Faithful
- Keep implementation aligned to the plan's stated scope and verification outcomes
- Do not create or modify tests as part of `/cwork`; use `/ctest` separately when needed

### Phase 3: Quality Check

**Read `work.references/quality-checklist.md`** and run through the pre-ship checklist.

1. Run linting (per project conventions)
2. Verify all plan tasks are checked off
3. Ensure code follows existing patterns
4. **Determine review tier:**
   - **Tier 1 (self-review):** purely additive, single concern, pattern-following, plan-faithful -> ship
   - **Tier 2 (full review, default):** everything else -> recommend review

### Phase 4: Handover

After implementation is complete:

1. Create a final commit if uncommitted work remains
2. Push to remote

Use `#askQuestions` to ask what the user wants to do next:

| Option | When to show |
|--------|-------------|
| **Simplify Code (Recommended)** — load the `/csimplify` skill | Always (default) |
| **Review Changes** — hand off to `creview` agent for code review | Always |
| **Ship It** — load the `/cgit-commit-push-pr` skill to create a PR | When Tier 1 self-review is sufficient |
| **Done** — end the workflow | Always |

**After the user picks a next skill**, announce the handover and load the chosen skill.

## Key Principles

- **Start fast, execute faster** — clarify once, then build
- **The plan is your guide** — follow referenced patterns, don't reinvent
- **Ship complete features** — finish the feature, don't leave it 80% done
- **Update the plan** — check off items as you complete them
- **Testing is separate** — `/ctest` owns test creation and test-focused verification

## Response Rules

- Never echo full file contents into chat — reference by path
- Keep status updates to 1-2 lines per task completed
- Don't repeat the plan back — just execute it
- Only show code snippets when asking for user input on a decision
