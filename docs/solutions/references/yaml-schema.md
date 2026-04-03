# YAML Frontmatter Schema

`schema.yaml` in this directory is the canonical contract for `docs/solutions/` frontmatter written by `ccompound`.

Use this file as the quick reference for:
- required fields
- enum values
- validation expectations
- category mapping
- track classification (bug vs knowledge)

## Tracks

The `problem_type` determines which **track** applies. Each track has different required and optional fields.

| Track | problem_types | Description |
|-------|--------------|-------------|
| **Bug** | `build_error`, `test_failure`, `runtime_error`, `performance_issue`, `database_issue`, `security_issue`, `ui_bug`, `integration_issue`, `logic_error` | Defects and failures that were diagnosed and fixed |
| **Knowledge** | `best_practice`, `documentation_gap`, `workflow_issue`, `developer_experience` | Practices, patterns, workflow improvements, and documentation |

## Required Fields (both tracks)

- **module**: Module or area affected
- **date**: ISO date in `YYYY-MM-DD`
- **problem_type**: One of the values listed in the Tracks table above
- **component**: One of `frontend`, `backend`, `api`, `database`, `cli`, `ci_cd`, `testing`, `documentation`, `tooling`, `infrastructure`, `authentication`, `configuration`, `build_system`, `package_management`
- **severity**: One of `critical`, `high`, `medium`, `low`

## Bug Track Fields

Required:
- **symptoms**: YAML array with 1-5 observable symptoms (errors, broken behavior)
- **root_cause**: One of `missing_dependency`, `wrong_api`, `config_error`, `logic_error`, `async_timing`, `memory_leak`, `scope_issue`, `missing_validation`, `missing_permission`, `version_mismatch`, `missing_type`, `missing_import`, `wrong_path`, `environment_mismatch`, `race_condition`
- **resolution_type**: One of `code_fix`, `config_change`, `dependency_update`, `test_fix`, `migration`, `environment_setup`, `documentation_update`, `tooling_addition`, `refactor`

## Knowledge Track Fields

No additional required fields beyond the shared ones. All fields below are optional:

- **applies_when**: Conditions or situations where this guidance applies
- **symptoms**: Observable gaps or friction that prompted this guidance
- **root_cause**: Underlying cause, if there is a specific one
- **resolution_type**: Type of change, if applicable

## Optional Fields (both tracks)

- **related_components**: Other components involved
- **tags**: Search keywords, lowercase and hyphen-separated
- **last_updated**: Date of last update when refreshing an existing doc

## Category Mapping

| problem_type | Directory |
|-------------|-----------|
| `build_error` | `docs/solutions/build-errors/` |
| `test_failure` | `docs/solutions/test-failures/` |
| `runtime_error` | `docs/solutions/runtime-errors/` |
| `performance_issue` | `docs/solutions/performance-issues/` |
| `database_issue` | `docs/solutions/database-issues/` |
| `security_issue` | `docs/solutions/security-issues/` |
| `ui_bug` | `docs/solutions/ui-bugs/` |
| `integration_issue` | `docs/solutions/integration-issues/` |
| `logic_error` | `docs/solutions/logic-errors/` |
| `developer_experience` | `docs/solutions/developer-experience/` |
| `workflow_issue` | `docs/solutions/workflow-issues/` |
| `best_practice` | `docs/solutions/best-practices/` |
| `documentation_gap` | `docs/solutions/documentation-gaps/` |

## Validation Rules

1. Determine the track from `problem_type` using the Tracks table.
2. All shared required fields must be present.
3. Bug-track required fields (`symptoms`, `root_cause`, `resolution_type`) must be present on bug-track docs.
4. Knowledge-track docs have no additional required fields beyond the shared ones.
5. Enum fields must match the allowed values exactly.
6. Array fields must respect min/max item counts.
7. `date` must match `YYYY-MM-DD`.
8. `tags` should be lowercase and hyphen-separated.
