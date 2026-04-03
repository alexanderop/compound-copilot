---
name: brainstorm
description: "Explore requirements and approaches through collaborative dialogue before writing a right-sized requirements document and planning implementation. Use for feature ideas, problem framing, when the user says 'let's brainstorm', or when they want to think through options before deciding what to build."
argument-hint: "[feature idea or problem to explore]"
---

# Brainstorm

Explore the problem space before committing to a plan. Brainstorming answers **WHAT** to build through collaborative dialogue. It precedes `/plan`, which answers **HOW** to build it.

The durable output is a **requirements document** — strong enough that planning does not need to invent product behavior, scope boundaries, or success criteria.

This skill does not implement code. It explores, clarifies, and documents decisions for later planning or execution.

**All file references in generated documents must use repo-relative paths (e.g., `src/models/user.rb`), never absolute paths.**

## Core Principles

1. **Assess scope first** — match ceremony to the size and ambiguity of the work
2. **Be a thinking partner** — suggest alternatives, challenge assumptions, explore what-ifs
3. **Resolve product decisions here** — user-facing behavior, scope boundaries, success criteria belong in this workflow
4. **Keep implementation out** — no libraries, schemas, endpoints, or code-level design unless the brainstorm is inherently about a technical/architectural change
5. **Right-size the artifact** — simple work gets compact docs; larger work gets fuller docs
6. **Apply YAGNI to carrying cost** — prefer the simplest approach that delivers meaningful value, but low-cost polish is worth including when easy to maintain

## Interaction Rules

1. **Ask one question at a time** — don't overwhelm with a list
2. **Prefer single-select** when choosing one direction, priority, or next step
3. **Use multi-select sparingly** — only for compatible sets that can all coexist (goals, constraints, non-goals). If prioritization matters, follow up asking which is primary
4. **Use `#askQuestions`** for every clarifying question. Ask exactly one question per call. If cancelled, state it explicitly, retry once, then fall back to plain chat
5. **Keep outputs concise** — brainstorming is about exploration, not documentation

## Workflow

### Step 0: Seed the Brainstorm

**If no description is provided**, ask: "What are you thinking about building? Describe the feature, problem, or idea — even a rough sketch is fine."

**Otherwise**, acknowledge the idea and begin exploring.

### Step 0.5: Resume and Route

#### Check for Prior Art

Search `docs/brainstorms/` and `docs/plans/` for related topics. If found, use `#askQuestions` to ask: "Found related brainstorm from [date]: [topic]. Want to build on it or start fresh?"

If resuming, read the document, summarize current state, and continue from its existing decisions.

#### Assess Whether Brainstorming Is Needed

**Clear requirements indicators:**
- Specific acceptance criteria provided
- Referenced existing patterns to follow
- Described exact expected behavior
- Constrained, well-defined scope

**If requirements are already clear:** keep the interaction brief. Confirm understanding and skip to Step 4 or Step 5.

#### Assess Scope

Use the feature description plus a light repo scan to classify:
- **Lightweight** — small, well-bounded, low ambiguity
- **Standard** — normal feature or bounded refactor with some decisions to make
- **Deep** — cross-cutting, strategic, or highly ambiguous

If unclear, ask one targeted question to disambiguate and proceed.

### Step 1: Explore Intent

#### 1.1 Existing Context Scan

Scan the repo before substantive brainstorming. Match depth to scope:

**Lightweight** — Search for the topic, check if something similar already exists, move on.

**Standard and Deep** — Two passes:
- *Constraint Check* — Check project instruction files for workflow, product, or scope constraints
- *Topic Scan* — Search for relevant terms. Read the most relevant existing artifact. Skim adjacent examples.

Two rules govern technical depth:
1. **Verify before claiming** — when the brainstorm touches checkable infrastructure (database tables, routes, config), read source files to confirm what exists. Label unverified claims as assumptions.
2. **Defer design decisions to planning** — implementation details belong in planning unless the brainstorm is itself about a technical decision.

#### 1.2 Product Pressure Test

Challenge the request before committing. Match depth to scope:

**Lightweight:**
- Does this solve a real problem or is it a nice-to-have?
- Are we duplicating something that already exists?
- Is there a simpler framing of the same need?

**Standard:**
- Are we solving the right problem? (not just the stated one)
- What's the real user or business outcome we're after?
- What happens if we do nothing?
- Is there an adjacent framing that's higher leverage without more carrying cost?
- Given the current project state, user goal, and constraints, what is the single highest-leverage move right now: the request as framed, a reframing, one adjacent addition, a simplification, or doing nothing?
- Favor moves that compound value, reduce future carrying cost, or make the product meaningfully more useful

**Deep** — All standard questions, plus:
- Does this build a durable capability (useful in 6-12 months)?
- Are we moving toward our architectural goals or away from them?

#### 1.3 Collaborative Dialogue

Use `#askQuestions` for every clarifying question. Ask exactly one question per tool call. If cancelled, state that explicitly, retry once, then fall back to plain chat.

Progress from broad to narrow:
1. **Problem frame** — "What problem does this solve? Why now?"
2. **Who is affected?** — Users, developers, ops?
3. **What does success look like?** — How would you know this worked?
4. **Validate assumptions** — "You mentioned X — is that a hard requirement or a preference?"
5. **Make requirements concrete** — "When you say 'fast', what does that mean? Sub-100ms? Sub-1s?"
6. **Resolve product decisions** — "Should this work for all users or just admins?"
7. **Surface constraints** — Time, tech, compatibility, team skill?

**Guidelines:**
- Ask questions **one at a time**
- Prefer single-select when choosing one direction
- Use multi-select only for compatible sets that can coexist
- Start broad (problem, users, value) then narrow (constraints, exclusions, edge cases)
- Make requirements concrete enough that planning won't need to invent behavior
- Resolve product decisions here; leave technical choices for planning
- Bring ideas, alternatives, and challenges — don't just interview

**Exit condition:** Continue until the idea is clear OR the user explicitly wants to proceed.

### Step 2: Stay in Brainstorm Mode

Do not launch research subagents during brainstorming. Stay focused on intent, assumptions, constraints, and option space.

If the discussion exposes facts that need verification, capture them as assumptions or open questions for planning.

### Step 3: Generate and Narrow Approaches

If multiple plausible directions remain, propose **2-4 distinct approaches**. For each:

- **Name** — a short label (e.g., "Webhook-first", "Polling with cache")
- **How it works** — 2-3 sentences on the mechanism
- **Pros** — what makes this approach attractive
- **Cons** — what makes this approach risky or costly
- **Fits when** — under what conditions this is the best choice

When useful, include one deliberately higher-upside alternative that increases usefulness without disproportionate carrying cost. Present as a challenger option alongside the baseline, not as the default. Omit when work is already over-scoped or the baseline is clearly right.

If relevant, label each approach: reuse / extend / net-new.

Lead with your recommendation and explain why. If one approach is clearly best, state it directly rather than forcing a menu.

**Narrow and Decide:** Use `#askQuestions` to let the user pick. Present each approach as an option with its key trade-off as the description. Include "Combine approaches" when approaches have complementary strengths.

After the user picks:
- Surface trade-offs between top contenders
- Challenge weak reasoning ("That's simpler, but does it handle X?")
- Let the user make the call

Repeat Step 3 if the user wants to explore further or combine approaches.

### Step 4: Assess Scope for Document

Decide if a requirements document is warranted:
- **Lightweight with clear scope**: skip document creation if brief alignment in chat suffices
- **Standard and Deep**: a requirements document is usually warranted
- **Simple but worth preserving**: write a compact document

### Step 5: Capture the Brainstorm

Write to `docs/brainstorms/YYYY-MM-DD-<descriptive-name>.md` and update the pointer:

1. Ensure `docs/brainstorms/` directory exists
2. Write the brainstorm file using the structure below
3. Write the file path to `docs/brainstorms/.latest` (just the path, nothing else)

If the brainstorm is not complete (blocking questions remain), set `status: paused`.

#### Document Structure

Adapt sections to scope — omit sections that add no value. A short document is better than a bloated one.

**Frontmatter:**

```yaml
---
title: "[Topic]"
status: complete|paused
date: YYYY-MM-DD
topic: kebab-case-topic-name
---
```

**Required sections for non-trivial work:**

- **Problem Frame** — who is affected, what is changing, and why it matters
- **Requirements** — grouped by logical theme with stable IDs (R1, R2, ...) so plans can reference them. Group by theme (e.g., "Packaging", "Migration", "Contributor Workflow"), not discussion order. Requirements keep original stable IDs — numbering does not restart per group. Skip grouping if all requirements are about the same thing. For very small docs (1-3 requirements), plain bullets are acceptable without IDs.
- **Success Criteria** — how we'll know this worked, prefer measurable
- **Scope Boundaries** — what's in and what's out

**Include when materially useful:**

- **Key Decisions** — decisions made during brainstorming with rationale
- **Dependencies & Assumptions** — what we're assuming to be true
- **Outstanding Questions** — split into:
  - *Resolve Before Planning* — truly blocking items. Format: `[Affects R1][User decision] Question`
  - *Deferred to Planning* — can be resolved during planning. Format: `[Affects R2][Technical] Question` or `[Affects R3][Needs research] Question`
  - Rules: use "Resolve Before Planning" sparingly. Do not force resolution of technical questions — those belong in planning. Carry deferred questions forward explicitly.
- **Alternatives Considered** — what was explored and rejected, with reasons
- **Next Steps** — `-> /plan` when ready, or `-> Resume /brainstorm` when blocked

#### Visual Aids

Include when requirements would be significantly easier to understand with one:

| Requirements describe... | Visual aid |
|---|---|
| Multi-step user workflow or process | Mermaid flow diagram (TB direction) or ASCII flow |
| 3+ behavioral modes, variants, or states | Markdown comparison table |
| 3+ interacting participants | Mermaid or ASCII relationship diagram |
| Multiple competing approaches | Comparison table |

**Skip when:** prose is clear enough, diagram would just restate requirements, visual describes implementation architecture (belongs in `/plan`), or brainstorm is simple and linear.

**Format:** Mermaid (default) for simple flows (5-15 nodes). ASCII for annotated flows with rich in-box content (80-col max). Markdown tables for comparisons. Place inline at point of relevance. Prose is authoritative when visual and prose disagree.

#### Pre-Finalization Checklist

Before marking complete:
- What would `/plan` still have to invent if this brainstorm ended now?
- Do any requirements depend on something claimed to be out of scope?
- Are any unresolved items actually product decisions rather than planning questions?
- Did implementation details leak in when they shouldn't have?
- Do any requirements claim infrastructure is absent without codebase verification?
- Is there a low-cost change that would make this materially more useful?
- Would a visual aid help a reader grasp the requirements faster than prose alone?

If planning would need to invent product behavior, scope boundaries, or success criteria, the brainstorm is not complete yet.

### Step 6: Handover

Use `#askQuestions` to ask what the user wants to do next. Only show options that apply:

**When no blocking questions remain:**

| Option | When to show |
|--------|-------------|
| **Start Planning (Recommended)** — load the `/plan` skill | Always (default recommendation) |
| **Keep exploring** — continue brainstorming (return to Step 1.3) | Always |
| **Proceed directly to work** — load the `/work` skill | Only when scope is lightweight, success criteria are clear, and no technical questions remain |
| **Done for now** — end the workflow | Always |

**When blocking questions remain:**
- Ask the blocking questions now, one at a time, by default
- If user wants to proceed anyway: convert remaining items to assumptions or deferred questions first
- If user wants to pause: present as paused/blocked

Do not offer "Start Planning" while `Resolve Before Planning` remains non-empty.

**After the user picks a next skill**, announce the handover and load the chosen skill. Example: "Loading `/plan` to create an implementation plan from the brainstorm."

### Step 7: Closing Summary

Only when the workflow is ending or handing off (not when returning to options):

**Complete:**
```text
Brainstorm complete!

Requirements doc: docs/brainstorms/YYYY-MM-DD-<topic>-requirements.md

Key decisions:
- [Decision 1]
- [Decision 2]

Recommended next step: /plan
```

**Paused:**
```text
Brainstorm paused.

Requirements doc: docs/brainstorms/YYYY-MM-DD-<topic>-requirements.md

Planning is blocked by:
- [Blocking question 1]
- [Blocking question 2]

Resume /brainstorm when ready to resolve these before planning.
```

## Response Rules

- Ask one question at a time
- Do not ask clarifying questions in plain chat when `#askQuestions` is available
- When a response can be represented as options, prefer `#askQuestions` over freeform chat
- If a `#askQuestions` call is cancelled, say so briefly before falling back to chat
- When presenting approaches, use a consistent format so they're easy to compare
- Say "Written to `docs/brainstorms/xxx.md`" — don't repeat the full brainstorm in chat
- Keep chat responses under 500 words

## Guidelines

- **Never write code** — only explore and capture decisions
- **Stay divergent** — resist the urge to plan or commit too early
- **Challenge assumptions** — "Do we actually need X?" is a valid brainstorm output
- **Capture rejected ideas** — knowing what was considered and dropped is as valuable as the decision itself
- **Defer validation work** — codebase exploration, documentation lookup, and best-practice research belong in planning unless the user explicitly asks to brainstorm around known findings
