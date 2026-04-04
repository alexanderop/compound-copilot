# Quality Checklist

## Pre-Ship Checklist

Before handing off to review, verify:

- [ ] All plan tasks are checked off (`- [x]`)
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

## System-Wide Impact Check

Before shipping, ask yourself:

- **What fires when this runs?** Trace the call chain from entry point to side effects.
- **Does the change hold across the real chain?** Not just the local edit — do the integrations still line up?
- **Can failure leave orphaned state?** Partial writes, dangling references, unclosed resources?
- **What other interfaces expose this?** API, CLI, background jobs, webhooks?
- **Do error strategies align?** If service A retries but service B doesn't expect retries, that's a bug.
