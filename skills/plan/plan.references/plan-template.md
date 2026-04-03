# Plan Template

Use this template when writing plan documents to `docs/plans/`.

## Frontmatter

```yaml
---
title: "[Clear, searchable title using conventional format]"
type: feat|fix|refactor
status: active
date: YYYY-MM-DD
origin: brainstorm|direct  # where this plan came from
deepened: false             # set to true after cdeepen runs
---
```

## Core Sections

### Overview

1-2 paragraph summary of what this plan achieves and why it matters.

### Problem Frame

- What problem are we solving?
- Who is affected?
- Why does it matter now?

### Requirements Trace

Link requirements back to the brainstorm doc (if one exists) or state them inline:

- **R1**: [requirement] — _source: brainstorm / user request / inferred_
- **R2**: [requirement] — _source_

### Scope Boundaries

**In scope:**
- ...

**Out of scope:**
- ...

### Context & Research

Summarize findings from research agents. Include:
- Relevant codebase patterns found (with file paths)
- Institutional knowledge from `docs/solutions/` (if any)
- External documentation or best practices consulted
- Git history insights (if relevant)

### Key Technical Decisions

| Decision | Chosen approach | Why | Alternatives considered |
|----------|----------------|-----|------------------------|
| ... | ... | ... | ... |

### Open Questions

Questions that still need answers. Mark blocking ones clearly:

- **[BLOCKING]** Question that must be answered before implementation
- Question that can be resolved during implementation

### Implementation Units

Break the work into ordered, checkable units:

#### Unit 1: [Name]

- **Goal:** What this unit achieves
- **Requirements:** R1, R2
- **Dependencies:** None | Unit N
- **Files:**
  - Create: `path/to/new-file.ext`
  - Modify: `path/to/existing-file.ext`
  - Test: `path/to/test-file.ext`
- **Approach:** How to implement (2-5 sentences, reference patterns)
- **Execution note:** _TDD red-first_ | _standard_ | _refactor-only_
- **Patterns to follow:** Reference existing code at `path/to/similar.ext`
- **Test scenarios:**
  - Happy path: ...
  - Edge case: ...
  - Error path: ...

#### Unit 2: [Name]

_(repeat structure)_

### System-Wide Impact

- What existing features or systems does this touch?
- Are there performance implications?
- Security considerations?

### Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ... | Low/Med/High | Low/Med/High | ... |

### Sources & References

- Links to docs, issues, or external resources consulted

## Deep Plan Extensions (for comprehensive plans only)

Add these sections when the plan is classified as comprehensive/deep:

### Alternative Approaches Considered

For each rejected approach: what it was, why it was rejected, and when it might be reconsidered.

### Success Metrics

How we'll know this worked. Quantitative where possible.

### Phased Delivery

If the work can be shipped incrementally:

- **Phase 1 (MVP):** Units 1-2 — delivers [value]
- **Phase 2:** Units 3-4 — delivers [value]

### Documentation & Operational Notes

- What docs need updating after implementation?
- Any deployment considerations?
- Monitoring or alerting changes?
