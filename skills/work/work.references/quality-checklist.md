# Quality Checklist

## Pre-Ship Checklist

Before handing off to review, verify:

- [ ] All plan tasks are checked off (`- [x]`)
- [ ] All tests pass (run the project's test command)
- [ ] Linting passes (per project conventions)
- [ ] Code follows existing patterns (matched naming, structure, style)
- [ ] Conventional commits used for each logical unit
- [ ] No hardcoded secrets, tokens, or credentials
- [ ] No debugging artifacts left behind (console.log, debugger, TODO-fixme)

## Code Review Tiers

### Tier 1: Inline Self-Review

Use **only** when ALL four criteria are met:
1. **Purely additive** — no existing behavior changed
2. **Single concern** — one logical change
3. **Pattern-following** — matches an existing pattern exactly
4. **Plan-faithful** — implements what the plan says, nothing more

For Tier 1: do a quick self-review, then ship.

### Tier 2: Full Review (Default)

Use for everything else. Hand off to `creview` agent with the plan file path for full multi-persona review.

## System-Wide Test Check

Before shipping, ask yourself:

- **What fires when this runs?** Trace the call chain from entry point to side effects.
- **Do tests exercise the real chain?** Not just mocks — does the integration work?
- **Can failure leave orphaned state?** Partial writes, dangling references, unclosed resources?
- **What other interfaces expose this?** API, CLI, background jobs, webhooks?
- **Do error strategies align?** If service A retries but service B doesn't expect retries, that's a bug.

## Test Scenario Completeness

For each implementation unit, ensure test coverage across:

| Category | What to test |
|----------|-------------|
| **Happy path** | The expected flow works correctly |
| **Edge cases** | Boundary values, empty inputs, max limits |
| **Error paths** | Invalid input, network failures, permission denied |
| **Integration** | Cross-layer interactions work end-to-end |
