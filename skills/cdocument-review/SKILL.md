---
name: cdocument-review
description: "Review requirements or plan documents using parallel persona agents that surface role-specific issues. Use when a requirements document or plan document exists and the user wants to improve it, or when invoked by /cplan for quality gating."
argument-hint: "[mode:headless] [path/to/document.md]"
---

# Document Review

Review requirements or plan documents through multi-persona analysis. Dispatches specialized reviewer agents in parallel, auto-fixes quality issues, and presents strategic questions for user decision.

## Support Files

Read these on-demand at the step that needs them — do not bulk-load at start:

- `references/subagent-template.md` — prompt template for dispatching persona agents (read at Phase 2)
- `references/findings-schema.json` — JSON schema reviewers must conform to (read at Phase 2, pass to reviewers)
- `references/review-output-template.md` — output format for presenting synthesized findings (read at Phase 4)

## Phase 0: Detect Mode

Check the skill arguments for `mode:headless`. Arguments may contain a document path, `mode:headless`, or both. Tokens starting with `mode:` are flags, not file paths -- strip them from the arguments and use the remaining token (if any) as the document path for Phase 1.

If `mode:headless` is present, set **headless mode** for the rest of the workflow.

**Headless mode** changes the interaction model, not the classification boundaries. Document-review still applies the same judgment about what has one clear correct fix vs. what needs user judgment. The only difference is how non-auto findings are delivered:
- `auto` fixes are applied silently (same as interactive)
- `present` findings are returned as structured text for the caller to handle -- no `#askQuestions` prompts, no interactive approval
- Phase 5 returns immediately with "Review complete" (no refine/complete question)

The caller receives findings with their original classifications intact and decides what to do with them.

If `mode:headless` is not present, the skill runs in its default interactive mode with no behavior change.

## Phase 1: Get and Analyze Document

**If a document path is provided:** Read it, then proceed.

**If no document is specified (interactive mode):** Ask which document to review using `#askQuestions`, or find the most recent in `docs/brainstorms/` or `docs/plans/` using Glob.

**If no document is specified (headless mode):** Output "Review failed: headless mode requires a document path. Re-invoke with: `/cdocument-review mode:headless <path>`" without dispatching agents.

### Classify Document Type

After reading, classify the document:
- **requirements** -- from `docs/brainstorms/`, focuses on what to build and why
- **plan** -- from `docs/plans/`, focuses on how to build it with implementation details

### Select Conditional Personas

Analyze the document content to determine which conditional personas to activate. Check for these signals:

**product-lens** -- activate when the document makes challengeable claims about what to build and why, or when the proposed work carries strategic weight beyond the immediate problem. Check for either leg:

*Leg 1 — Premise claims:* The document stakes a position on what to build or why that a knowledgeable stakeholder could reasonably challenge:
- Problem framing where the stated need is non-obvious or debatable
- Solution selection where alternatives plausibly exist
- Prioritization decisions that explicitly rank what gets built vs deferred
- Goal statements that predict specific user outcomes

*Leg 2 — Strategic weight:* The proposed work could affect system trajectory, user perception, or competitive positioning:
- Changes that shape how the system is perceived or what it becomes known for
- Complexity or simplicity bets that affect adoption, onboarding, or cognitive load
- Work that opens or closes future directions (path dependencies, architectural commitments)
- Opportunity cost implications

**design-lens** -- activate when the document contains:
- UI/UX references, frontend components, or visual design language
- User flows, wireframes, screen/page/view mentions
- Interaction descriptions (forms, buttons, navigation, modals)
- References to responsive behavior or accessibility

**security-lens** -- activate when the document contains:
- Auth/authorization mentions, login flows, session management
- API endpoints exposed to external clients
- Data handling, PII, payments, tokens, credentials, encryption
- Third-party integrations with trust boundary implications

**scope-guardian** -- activate when the document contains:
- Multiple priority tiers (P0/P1/P2, must-have/should-have/nice-to-have)
- Large requirement count (>8 distinct requirements or implementation units)
- Stretch goals, nice-to-haves, or "future work" sections
- Scope boundary language that seems misaligned with stated goals

**adversarial** -- activate when the document contains:
- More than 5 distinct requirements or implementation units
- Explicit architectural or scope decisions with stated rationale
- High-stakes domains (auth, payments, data migrations, external integrations)
- Proposals of new abstractions, frameworks, or significant architectural patterns

## Phase 2: Announce and Dispatch Personas

### Announce the Review Team

Tell the user which personas will review and why. For conditional personas, include the justification:

```
Reviewing with:
- coherence-reviewer (always-on)
- feasibility-reviewer (always-on)
- scope-guardian-reviewer -- plan has 12 requirements across 3 priority levels
- security-lens-reviewer -- plan adds API endpoints with auth flow
```

### Build Agent List

Always include:
- `coherence-reviewer`
- `feasibility-reviewer`

Add activated conditional personas:
- `product-lens-reviewer`
- `design-lens-reviewer`
- `security-lens-reviewer`
- `scope-guardian-reviewer`
- `adversarial-document-reviewer`

### Dispatch

**Read `references/subagent-template.md`** and **`references/findings-schema.json`** to build the prompt.

Dispatch all agents in **parallel** using the Agent tool. Each agent receives the prompt built from the subagent template with these variables filled:

| Variable | Value |
|----------|-------|
| `{persona_file}` | Full content of the agent's markdown file |
| `{schema}` | Content of the findings schema |
| `{document_type}` | "requirements" or "plan" from Phase 1 classification |
| `{document_path}` | Path to the document |
| `{document_content}` | Full text of the document |

Pass each agent the **full document** -- do not split into sections.

**Error handling:** If an agent fails or times out, proceed with findings from agents that completed. Note the failed agent in the Coverage section. Do not block the entire review on a single agent failure.

**Dispatch limit:** Even at maximum (7 agents), use parallel dispatch. These are document reviewers with bounded scope reading a single document -- parallel is safe and fast.

## Phase 3: Synthesize Findings

Process findings from all agents through this pipeline. **Order matters** -- each step depends on the previous.

### 3.1 Validate

Check each agent's returned JSON against the findings schema:
- Drop findings missing any required field defined in the schema
- Drop findings with invalid enum values
- Note the agent name for any malformed output in the Coverage section

### 3.2 Confidence Gate

Suppress findings below 0.50 confidence. Store them as residual concerns for potential promotion in step 3.4.

### 3.3 Deduplicate

Fingerprint each finding using `normalize(section) + normalize(title)`. Normalization: lowercase, strip punctuation, collapse whitespace.

When fingerprints match across personas:
- If the findings recommend **opposing actions** (e.g., one says cut, the other says keep), do not merge -- preserve both for contradiction resolution in 3.5
- Otherwise merge: keep the highest severity, keep the highest confidence, union all evidence arrays, note all agreeing reviewers (e.g., "coherence, feasibility")
- **Coverage attribution:** Attribute the merged finding to the persona with the highest confidence. Decrement the losing persona's Findings count *and* the corresponding route bucket (Auto or Present) so `Findings = Auto + Present` stays exact.

### 3.4 Promote Residual Concerns

Scan the residual concerns (findings suppressed in 3.2) for:
- **Cross-persona corroboration**: A residual concern from Persona A overlaps with an above-threshold finding from Persona B. Promote at P2 with confidence 0.55-0.65. Inherit `finding_type` from the corroborating above-threshold finding.
- **Concrete blocking risks**: A residual concern describes a specific, concrete risk that would block implementation. Promote at P2 with confidence 0.55. Set `finding_type: omission`.

### 3.5 Resolve Contradictions

When personas disagree on the same section:
- Create a **combined finding** presenting both perspectives
- Set `autofix_class: present`
- Set `finding_type: error`
- Frame as a tradeoff, not a verdict

Specific conflict patterns:
- Coherence says "keep for consistency" + scope-guardian says "cut for simplicity" -> combined finding, let user decide
- Feasibility says "this is impossible" + product-lens says "this is essential" -> P1 finding framed as a tradeoff
- Multiple personas flag the same issue -> merge into single finding, note consensus, increase confidence

### 3.6 Route by Autofix Class

**Severity and autofix_class are independent.** A P1 finding can be `auto` if the correct fix is obvious.

| Autofix Class | Route |
|---------------|-------|
| `auto` | Apply automatically -- one clear correct fix |
| `present` | Present individually for user judgment |

Demote any `auto` finding that lacks a `suggested_fix` to `present`.

**Auto-eligible patterns:** summary/detail mismatch (body is authoritative over overview), wrong counts, missing list entries derivable from elsewhere in the document, stale internal cross-references, terminology drift, prose/diagram contradictions where prose is more detailed, missing steps mechanically implied by other content, unstated thresholds implied by surrounding context, completeness gaps where the correct addition is obvious.

### 3.7 Sort

Sort findings for presentation: P0 -> P1 -> P2 -> P3, then by finding type (errors before omissions), then by confidence (descending), then by document order (section position).

## Phase 4: Apply and Present

### Apply Auto-fixes

Apply all `auto` findings to the document in a **single pass**:
- Edit the document inline using the Edit tool
- Track what was changed for the "Auto-fixes Applied" section
- Do not ask for approval -- these have one clear correct fix

List every auto-fix in the output summary so the user can see what changed.

### Present Remaining Findings

**Headless mode:** Do not use `#askQuestions`. Output all non-auto findings as structured text:

```
Document review complete (headless mode).

Applied N auto-fixes:
- <section>: <what was changed> (<reviewer>)

Findings (requires judgment):

[P0] Section: <section> — <title> (<reviewer>, confidence <N>)
  Why: <why_it_matters>
  Suggested fix: <suggested_fix or "none">

Residual concerns:
- <concern> (<source>)

Deferred questions:
- <question> (<source>)
```

Omit any section with zero items. Then proceed directly to Phase 5.

**Interactive mode:**

**Read `references/review-output-template.md`** for the exact output format.

Present `present` findings using the review output template. Within each severity level, separate findings by type:
- **Errors** first -- these need resolution
- **Omissions** second -- these need additions

Brief summary at the top: "Applied N auto-fixes. K findings to consider (X errors, Y omissions)."

Include the Coverage table, auto-fixes applied, residual concerns, and deferred questions.

### Protected Artifacts

During synthesis, discard any finding that recommends deleting or removing files in:
- `docs/brainstorms/`
- `docs/plans/`
- `docs/solutions/`

These are pipeline artifacts and must not be flagged for removal.

## Phase 5: Next Action

**Headless mode:** Return "Review complete" immediately. Do not ask questions.

**Interactive mode:**

Use `#askQuestions` to offer these options. Use the document type from Phase 1 to set the "Review complete" description:

1. **Refine again** -- Address the findings above, then re-review
2. **Review complete** -- description based on document type:
   - requirements document: "Create technical plan with `/cplan`"
  - plan document: "Implement with `/cwork`"

After 2 refinement passes, recommend completion -- diminishing returns are likely. But if the user wants to continue, allow it.

Return "Review complete" as the terminal signal for callers.

## What NOT to Do

- Do not rewrite the entire document
- Do not add new sections or requirements the user didn't discuss
- Do not over-engineer or add complexity
- Do not create separate review files or add metadata sections
- Do not modify caller skills (`/cbrainstorm`, `/cplan`, or external skills that invoke `/cdocument-review`)

## Iteration Guidance

On subsequent passes, re-dispatch personas and re-synthesize. The auto-fix mechanism and confidence gating prevent the same findings from recurring once fixed. If findings are repetitive across passes, recommend completion.

---

## Included References

### Subagent Template

@./references/subagent-template.md

### Findings Schema

@./references/findings-schema.json

### Review Output Template

@./references/review-output-template.md
