# Category Guide

YAML frontmatter contract and category mapping for solution documents.

## Category Mapping

| `problem_type` value | Directory | Track |
|---------------------|-----------|-------|
| `build_error` | `docs/solutions/build-errors/` | Bug |
| `test_failure` | `docs/solutions/test-failures/` | Bug |
| `runtime_error` | `docs/solutions/runtime-errors/` | Bug |
| `performance_issue` | `docs/solutions/performance-issues/` | Bug |
| `database_issue` | `docs/solutions/database-issues/` | Bug |
| `security_issue` | `docs/solutions/security-issues/` | Bug |
| `ui_bug` | `docs/solutions/ui-bugs/` | Bug |
| `integration_issue` | `docs/solutions/integration-issues/` | Bug |
| `logic_error` | `docs/solutions/logic-errors/` | Bug |
| `best_practice` | `docs/solutions/best-practices/` | Knowledge |
| `documentation_gap` | `docs/solutions/documentation-gaps/` | Knowledge |
| `workflow_issue` | `docs/solutions/workflow-issues/` | Knowledge |
| `developer_experience` | `docs/solutions/developer-experience/` | Knowledge |

## Required Frontmatter

```yaml
---
title: "Clear, searchable title"
date: YYYY-MM-DD
last-validated: YYYY-MM-DD
category: [mapped from problem_type above]
module: [area of the codebase]
problem_type: [one of the enum values above]
component: [specific component or subsystem]
symptoms:
  - "Observable symptom 1"
  - "Observable symptom 2"
root_cause: [what actually caused the problem]
resolution_type: code_fix|config_change|dependency_update|workaround|documentation|process_change
severity: critical|high|medium|low
---
```

## Optional Frontmatter

```yaml
related_components:
  - "other-component"
tags:
  - "lowercase-hyphenated"
  - "max-eight-tags"
```

## Validation Rules

- All required fields must be present
- `problem_type` must match one of the enum values exactly
- `symptoms` must be a YAML array with 1-5 items
- `date` and `last-validated` must be YYYY-MM-DD format
- `tags` must be lowercase, hyphenated, max 8 items
- `resolution_type` and `severity` must match their enums exactly

## Filename Convention

```
[sanitized-slug]-[YYYY-MM-DD].md
```

- Lowercase
- Spaces → hyphens
- Remove special characters
- Example: `webpack-build-fails-on-node-22-2025-01-15.md`
