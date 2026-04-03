# Findings Schema

## Standard Finding Format

Each reviewer should report findings using this structure:

```markdown
## Finding: [Title]
**Severity:** P0|P1|P2|P3
**Confidence:** 0.00-1.00
**File:** path/to/file.ext:42
**Category:** security|refactoring|architecture|performance|data|testing|[domain]
**Autofix class:** safe_auto|gated_auto|manual|advisory
**Description:** [what's wrong and why it matters]
**Suggestion:** [how to fix it]
```

## Severity Scale

| Level | Meaning | Examples |
|-------|---------|---------|
| **P0** | Critical breakage — blocks merge | Security vulnerability, data corruption, crashes |
| **P1** | High-impact defect — should fix before merge | Race condition, incorrect business logic, broken error handling |
| **P2** | Moderate issue — fix soon | Performance concern, poor abstraction, missing validation |
| **P3** | Low-impact — nice to fix | Naming clarity, minor duplication, style suggestion |

## Confidence Scale

| Range | Meaning |
|-------|---------|
| 0.85-1.00 | Certain — clear evidence in the code |
| 0.70-0.84 | Highly confident — strong indicators |
| 0.60-0.69 | Confident enough — reasonable evidence |
| 0.50-0.59 | Moderately confident — some indicators |
| 0.30-0.49 | Somewhat confident — weak evidence |
| 0.00-0.29 | Not confident — speculative |

**Suppression threshold:** Suppress findings below 0.60 confidence, except P0 findings which surface at 0.50+.

## Autofix Classes

| Class | Meaning | Action |
|-------|---------|--------|
| **safe_auto** | Safe to fix automatically — no behavior change risk | Auto-apply during fix phase |
| **gated_auto** | Likely safe but needs user confirmation | Present to user, apply if approved |
| **manual** | Requires human judgment or design decision | Report only, user decides |
| **advisory** | Informational — no specific fix needed | Include in report for awareness |

## Top-Level Reviewer Output

Each reviewer returns:

```markdown
# [Reviewer Name] Review

## Findings
[list of findings using the format above]

## Residual Risks
[risks that weren't findings but worth noting]

## Testing Gaps
[test coverage concerns]
```
