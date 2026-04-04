---
name: plan
description: "Research the codebase and create a structured implementation plan. Use when the user says 'plan this', 'create a plan', 'how should we implement', or wants to turn a feature description into a structured implementation plan."
argument-hint: "Describe the feature, bug fix, or improvement to plan"
---

# Plan

Transform feature descriptions, bug reports, or improvement ideas into well-structured implementation plans.

`/brainstorm` defines **WHAT** to build. `/plan` defines **HOW** to build it. `/work` executes the plan.

This skill produces a durable implementation plan. It does **not** implement code, run tests, or learn from execution-time results.

## Subagents

This skill dispatches read-only research subagents in parallel during Step 1. These agents must exist in the `agents/` directory:

- `cexplore` — codebase patterns and conventions (always)
- `clearnings` — past solutions from `docs/solutions/` (conditional)
- `cdocs` — external documentation via Context7 MCP (conditional)
- `cbestpractices` — industry standards and community patterns (conditional)
- `cspecflow` — user flow completeness analysis (conditional)

## Support Files

Read these on-demand at the step that needs them — do not bulk-load at start:

- `plan.references/plan-template.md` — template structure with all sections and examples
- `plan.references/depth-levels.md` — classification (Lightweight/Standard/Deep) with quality bar
- `plan.references/section-mapping.md` — maps research findings to plan sections

## Workflow

### Step 0: Understand the Request

**If no feature description is provided**, ask: "What would you like to plan? Please describe the feature, bug fix, or improvement you have in mind."

#### 0.1 Find Upstream Brainstorm

Search `docs/brainstorms/` for files matching the feature topic. A brainstorm is relevant if the topic semantically matches and it was created within the last 30 days.

If a relevant brainstorm exists:
1. Read it thoroughly
2. Announce: "Found brainstorm from [date]: [topic]. Using as origin document for planning."
3. Carry forward **all** of: problem frame, requirements, scope boundaries, key decisions, dependencies, outstanding questions
4. Reference carried-forward decisions with `(see origin: <source-path>)`
5. Do not silently omit content — if the origin discussed it, the plan must address it

If multiple brainstorms match, use `#askQuestions` to let the user pick.

#### 0.2 Handle Blocking Questions

If the brainstorm has `Resolve Before Planning` questions:
- Reclassify technical/architectural ones as planning-owned work
- Surface remaining product blockers to the user
- Ask whether to: (a) resume `/brainstorm` to resolve them, or (b) convert to explicit assumptions and continue
- Do not proceed while true product blockers remain unresolved

#### 0.3 No-Brainstorm Fallback

If no relevant brainstorm exists, assess whether the request is clear enough for direct planning:
- **Ambiguous product/scope questions** — recommend `/brainstorm` first
- **User wants to continue anyway** — run a quick planning bootstrap to establish: problem frame, intended behavior, scope boundaries, success criteria, blocking assumptions
- **Request is already clear** — proceed directly

### Step 1: Research

#### 1.1 Choose Research Agents

Not every task needs all agents. Always run `cexplore`.

| Agent | Run when... | Skip when... |
|-------|-----------|------------|
| `clearnings` | Task touches areas where past problems were documented, or domain is complex | Simple rename, trivial config change |
| `cdocs` | Task involves external libraries, APIs, or frameworks | Pure internal refactor with no external deps |
| `cbestpractices` | Architectural decisions, new technology adoption, or patterns where industry guidance matters | Bug fixes, small UI tweaks, internal plumbing |

**External research decision heuristics:**
- **Always run** `cdocs`/`cbestpractices` for security, payments, auth, external APIs, data migrations, or when the codebase has fewer than 3 direct examples of the needed pattern
- **Skip** when the codebase has 3+ direct examples of the exact pattern and the user already knows the intended shape
- If local patterns exist for an adjacent domain but not the exact one (e.g., HTTP clients but not webhooks), research the domain gap specifically

Launch selected agents in parallel. Pass each the feature description and any origin document context.

#### 1.2 Flow and Edge-Case Analysis (Conditional)

For **Standard** or **Deep** plans, or when the feature involves multiple user types, state machines, or multi-step workflows, run:

- `cspecflow` — pass the feature description and research findings from Step 1.1

Use the output to identify missing edge cases, state transitions, or handoff gaps. The analysis is written to `docs/specflows/` — reference it from the plan when relevant.

**Skip when:** Lightweight plans, pure refactors, or single linear flow with no branching.

#### 1.3 Review and Fill Gaps

Review all findings. If gaps remain:
- **High-risk topic gaps** — run `cdocs` or `cbestpractices` with targeted queries
- **Critical spec-flow gaps** — surface as planning questions before proceeding
- **Sufficient context** — announce findings briefly and proceed

### Step 2: Classify and Structure

#### 2.1 Classify Depth

| Level | When | Units |
|-------|------|-------|
| **Lightweight** | Simple bugs, small improvements, config changes | 1-3 |
| **Standard** | Most features, complex bugs, multi-file changes | 3-6 |
| **Deep** | Major features, architectural changes, cross-cutting | 4-8, phased |

**Reclassification:** If classified as Lightweight but research reveals the work touches external APIs, CI config, exported interfaces, environment variables consumed by other systems, or shared types — reclassify to Standard.

If depth is unclear, ask one targeted question and continue.

#### 2.2 Detect Execution Posture

If the user, brainstorm, or research signals TDD, test-first, characterization-first, or external delegation — carry it forward in relevant implementation unit execution notes. Only ask the user if posture would materially change sequencing.

#### 2.3 Title and Filename

- Draft a clear title: `feat: Add user authentication`, `fix: Prevent checkout double-submit`
- Determine type: `feat`, `fix`, `refactor`
- Filename: `docs/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.md`
  - Check existing files for today's date to determine next sequence number (zero-padded, starting 001)

### Step 3: Write the Plan

Create the plan file. Adapt sections to depth level — omit sections that add no value for the specific work.

**All file paths in the plan must be repo-relative** (e.g., `src/models/user.ts`), never absolute paths.

#### Frontmatter

```yaml
---
title: "[Plan Title]"
type: feat|fix|refactor
status: active
date: YYYY-MM-DD
origin: docs/brainstorms/YYYY-MM-DD-<topic>.md  # when planning from a brainstorm
---
```

#### Overview

1-2 paragraphs: what is changing and why.

#### Problem Frame

The user/business problem and context. Reference the origin doc when present.

#### Requirements Trace

- **R1**: [requirement] — _source: brainstorm / user request / inferred_
- **R2**: [requirement] — _source_

#### Scope Boundaries

**In scope:** ...
**Out of scope:** ...

#### Context & Research

Summarize findings from research agents:
- Relevant codebase patterns (with file paths)
- Institutional knowledge from `docs/solutions/`
- External documentation or best practices consulted
- Git history insights (if relevant)

#### Key Technical Decisions

| Decision | Chosen approach | Why | Alternatives considered |
|----------|----------------|-----|------------------------|

#### Open Questions

- **[BLOCKING]** Questions that must be answered before implementation
- Questions that can be resolved during implementation

#### High-Level Technical Design (Optional)

Include when the work involves DSL/API surface design, multi-component integration, complex data flow, state-heavy lifecycle, or branching logic. Choose the right medium:

| Work involves... | Best form |
|---|---|
| DSL or API surface | Pseudo-code grammar or contract sketch |
| Multi-component integration | Mermaid sequence or component diagram |
| Data pipeline | Data flow sketch |
| State-heavy lifecycle | State diagram |
| Complex branching | Flowchart |
| Mode/flag combos | Decision matrix |

Frame as: *"Directional guidance for review, not implementation specification."*

Skip for well-patterned or straightforward work.

#### Implementation Units

Break work into ordered, checkable units. Each unit = one meaningful atomic change.

For each unit:

```markdown
- [ ] **Unit N: [Name]**

**Goal:** What this unit achieves
**Requirements:** R1, R2
**Dependencies:** None | Unit N
**Files:**
- Create: `path/to/new-file`
- Modify: `path/to/existing-file`
- Test: `path/to/test-file`

**Approach:** Key design decisions, data flow, integration notes (2-5 sentences)
**Execution note:** _(optional)_ TDD red-first | characterization-first | external-delegate
**Patterns to follow:** Existing code at `path/to/similar`

**Test scenarios:**
- Happy path: [specific input -> expected outcome]
- Edge case: [boundary condition -> expected outcome]
- Error path: [failure mode -> expected outcome]
- Integration: [cross-layer scenario -> expected outcome]

**Verification:** How to know this unit is complete (outcomes, not commands)
```

Rules for units:
- Every feature-bearing unit must have test scenarios with specific inputs and expected outcomes
- For non-feature units (config, scaffolding, styling): `Test expectation: none — [reason]`
- Include the test file path in Files for feature-bearing units
- No implementation code — describe the *what*, not the *how*

#### System-Wide Impact

- **Interaction graph:** What callbacks, middleware, observers, or entry points are affected
- **Error propagation:** How failures travel across layers
- **State lifecycle risks:** Partial-write, cache, duplicate, or cleanup concerns
- **API surface parity:** Other interfaces that may require the same change
- **Integration coverage:** Cross-layer scenarios unit tests alone won't prove
- **Unchanged invariants:** Existing APIs or behaviors this plan does not change (blast-radius assurance)

Omit categories that don't apply. For lightweight plans, a few bullets suffice.

#### Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|

#### Sources & References

- **Origin document:** [path]
- Related code: [path or symbol]
- Related PRs/issues: #[number]
- External docs: [url]

#### Deep Plan Extensions (Deep plans only)

Add only the sections that genuinely help:
- **Alternative Approaches Considered**
- **Success Metrics**
- **Phased Delivery** (Phase 1 MVP -> Phase 2)
- **Documentation & Operational Notes**

### Step 4: Review Before Finalizing

Check before writing:
- [ ] Plan doesn't invent product behavior that should have been in `/brainstorm`
- [ ] Every decision is grounded in origin document or research
- [ ] Each unit is concrete, dependency-ordered, and implementation-ready
- [ ] Feature-bearing units have test scenarios from every applicable category
- [ ] Test scenarios name specific inputs, actions, and expected outcomes
- [ ] Deferred items are explicit, not hidden as fake certainty
- [ ] All file paths are repo-relative

If an origin document exists, re-read it and verify:
- Scope boundaries and success criteria are preserved
- Blocking questions were resolved, assumed, or sent back to `/brainstorm`
- Every section is addressed — nothing was silently dropped

### Step 5: Write and Handoff

1. Write the plan file to `docs/plans/YYYY-MM-DD-NNN-<type>-<name>-plan.md`
2. Write the file path to `docs/plans/.latest`
3. Announce: "Plan written to `docs/plans/[filename]`"

#### Confidence Check (Standard and Deep plans)

Score the plan against these risk dimensions:

| Dimension | Low risk | High risk |
|-----------|---------|-----------|
| Scope | Single module | Cross-cutting |
| Novelty | Follows existing patterns | New patterns needed |
| Dependencies | Self-contained | External APIs, migrations |
| Reversibility | Easy to revert | Hard to undo (data migrations, API contracts) |

- **Lightweight plans**: Skip unless user requests deepening
- **Standard with 0-1 high-risk dimensions**: Ship as-is
- **Standard with 2+ high-risk dimensions**: Suggest deepening
- **Deep plans**: Always run confidence check

If gaps are found, suggest the `/deepen` skill with specific sections that need strengthening.

### Step 6: Handover

Use `#askQuestions` to ask what the user wants to do next:

| Option | When to show |
|--------|-------------|
| **Write Tests First (TDD) (Recommended)** — load the `/test` skill | Always (default for Standard/Deep) |
| **Start Implementation** — load the `/work` skill | Always |
| **Deepen Plan** — load the `/deepen` skill | When 2+ high-risk dimensions or user requests |
| **Review and refine** — iterate on the plan | Always |

**After the user picks a next skill**, announce the handover and load the chosen skill. Example: "Loading `/work` to start implementation."

## Planning Rules

- **Never write code** — only research and plan
- Use `path/class` references over brittle line numbers
- Make units checkable with `- [ ]` syntax
- No implementation code — pseudo-code in High-Level Technical Design only, framed as directional
- No git commands, commit messages, or test command recipes in plans
- No micro-step instructions ("create file, add import") — describe the *what*

## Response Rules

- Never echo full file contents into chat — reference by path
- Summarize codebase findings in 3-5 bullets, not full quotes
- Say "Written to `docs/plans/xxx.md`" — don't repeat the full plan in chat
- Keep chat responses under 500 words
