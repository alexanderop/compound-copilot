# Plan Depth Guidance

## Depth Classification

| Level | When to use | Units | Sections |
|-------|------------|-------|----------|
| **Lightweight** | Simple bugs, small improvements, config changes | 1-3 | Problem, approach, acceptance criteria, essential context |
| **Standard** | Most features, complex bugs, multi-file changes | 3-6 | All core sections from template |
| **Deep** | Major features, architectural changes, cross-cutting concerns | 4-8, phased | All core + deep extensions |

## Plan Quality Bar

Every plan, regardless of depth, must have:

- [ ] Clear problem frame — someone unfamiliar can understand _what_ and _why_
- [ ] Concrete requirements traceability — each requirement has an origin
- [ ] Exact file paths — not "the user model" but `src/models/user.ts:42`
- [ ] Explicit test file paths — where tests will live
- [ ] Decisions with rationale — not just "we'll use X" but "we'll use X because Y"
- [ ] Existing pattern references — link to code that shows the convention to follow
- [ ] Enumerated test scenarios — happy path, edge cases, error paths per unit
- [ ] Clear dependencies between units — build order is obvious

## Planning Rules

- Use `path/class` references over line numbers (lines shift)
- Make progress checkable — each unit should be completable independently
- No implementation code in plans — use pseudo-code or diagrams when helpful
- No git commands in plans — the work agent handles that
- No micro-step instructions ("create file, add import, write function") — describe the _what_, not the _how_

## Confidence Check (Post-Generation)

After writing the plan, assess whether it needs deepening:

### 1. Classify plan depth and topic risk

Score the plan against these dimensions:

| Dimension | Low risk | High risk |
|-----------|---------|-----------|
| Scope | Single module | Cross-cutting |
| Novelty | Follows existing patterns | New patterns needed |
| Dependencies | Self-contained | External APIs, migrations |
| Reversibility | Easy to revert | Hard to undo (data migrations, API contracts) |

### 2. Gate: should we deepen?

- **Lightweight plans**: Skip deepening unless user requests it
- **Standard plans with 0-1 high-risk dimensions**: Ship as-is
- **Standard plans with 2+ high-risk dimensions**: Suggest deepening
- **Deep plans**: Always run confidence check

### 3. Score confidence gaps

For each section, check:

**Requirements Trace:**
- [ ] Every requirement is concrete and testable
- [ ] No implicit assumptions left unstated

**Context & Research:**
- [ ] Relevant past solutions referenced
- [ ] Framework/library constraints documented

**Key Technical Decisions:**
- [ ] Each decision has a clear rationale
- [ ] Alternatives were considered

**Implementation Units:**
- [ ] Dependencies are explicit and ordered
- [ ] Test scenarios cover happy, edge, and error paths
- [ ] File paths are specific (not "somewhere in src/")

**System-Wide Impact:**
- [ ] Side effects on other features identified
- [ ] Performance implications assessed

**Risks & Dependencies:**
- [ ] Each risk has a mitigation strategy
- [ ] External dependencies have fallback plans

### 4. If gaps found

Hand off to `cdeepen` with specific sections that need strengthening. The deepening agent will run targeted research and update only those sections.
