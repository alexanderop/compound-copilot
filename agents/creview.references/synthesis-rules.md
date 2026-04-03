# Synthesis Rules

Rules for merging findings from multiple reviewers into a single coherent report.

## Merge Pipeline

Execute these stages in order after all reviewers complete:

### 1. Validate
Ensure every finding has all required fields (severity, file, confidence, description).

### 2. Confidence Gate
Suppress findings below the confidence threshold:
- **P0 findings:** surface at 0.50+ confidence
- **All other findings:** surface at 0.60+ confidence
- Below threshold → drop silently

### 3. Deduplicate
Fingerprint each finding by: `file + line_range + title_keywords`. When two findings share a fingerprint:
- Keep the one with higher confidence
- Merge descriptions if they add complementary information
- Credit both reviewers

### 4. Cross-Reviewer Agreement
When 2+ reviewers flag the same issue independently:
- Boost confidence by +0.10
- Escalate severity by one level if both reviewers rated it high
- Note the agreement in the finding: "Flagged by: security-reviewer, architecture-reviewer"

### 5. Separate Pre-Existing Issues
If a finding is about code that wasn't changed in this diff (pre-existing):
- Move to a separate "Pre-existing Issues" section
- Do not count toward the merge verdict

### 6. Resolve Contradictions
When reviewers disagree on the same issue:
- **Severity:** keep the higher (more conservative) rating
- **Autofix class:** keep the more conservative class (manual > gated_auto > safe_auto)
- **Assessment:** side with the reviewer who provides stronger evidence
- Note the disagreement in the finding

### 7. Partition Work
Sort findings into action queues:
- **Auto-fix queue:** `safe_auto` findings → apply automatically in fix phase
- **Gated queue:** `gated_auto` findings → present to user for approval
- **Report-only:** `manual` and `advisory` findings → include in report

### 8. Sort
Order findings: P0 first, then by confidence descending, then by file path, then by line number.

## Protected Artifacts

**Never flag these for deletion, removal, or .gitignore:**
- `docs/brainstorms/*`
- `docs/plans/*`
- `docs/solutions/*`
- `docs/reviews/*`
- `docs/tests/*`
- `docs/specflows/*`

These are pipeline artifacts, not dead code.

## False-Positive Suppression

Suppress findings that match these patterns:
- **Pre-existing issues** not introduced by this diff
- **Style nitpicks** already covered by linters
- **Intentional code** with clear comments explaining why
- **Issues handled elsewhere** (e.g., validation done at a different layer)
- **Restatements** of the same issue in different words
- **Generic advice** not tied to specific code ("consider adding tests")

## Quality Gates

Before delivering the report, verify:
- [ ] Every finding is actionable (has a concrete suggestion)
- [ ] No false positives from surface-level skimming
- [ ] Severity is calibrated (not everything is P1)
- [ ] Line numbers are accurate
- [ ] Protected artifacts are respected
- [ ] No duplicate linter output (if linter already catches it, don't repeat)
