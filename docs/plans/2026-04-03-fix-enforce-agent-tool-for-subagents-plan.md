---
title: "fix: Enforce agent tool requirement for subagent declarations"
type: fix
status: active
date: 2026-04-03
---

## Problem Statement

Agent frontmatter currently allows `agents` and `tools` to be declared together without failing validation when the `agent` tool is missing. The validator only emits a warning, which means misconfigured orchestrator-style agents can pass `npm run validate` and fail later at runtime or in Copilot configuration.

There is also a wording/documentation gap around the `agents` field. Current docs describe it as "Subagent availability", but they do not make the coupling to the `agent` tool explicit, and at least one user-facing string is grammatically inconsistent (`all available agent` instead of `all available agents`).

## Overview And Motivation

This repo is already treating frontmatter as a schema-driven contract in [src/validate.js](/Users/alexanderopalic/Projects/compound-copilot/src/validate.js) and documenting the supported fields in [skills/create-agent/SKILL.md](/Users/alexanderopalic/Projects/compound-copilot/skills/create-agent/SKILL.md), [agents/create-agent.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/create-agent.agent.md), and agent examples under [agents/](/Users/alexanderopalic/Projects/compound-copilot/agents). Enforcing this relationship at validation time prevents broken agent definitions from shipping and makes the authoring rules discoverable where users actually look.

## Proposed Solution

Promote the existing cross-validation rule in [src/validate.js](/Users/alexanderopalic/Projects/compound-copilot/src/validate.js) from warning-level guidance to error-level enforcement for agent files that:

- declare a non-empty `agents` array, and
- declare `tools` explicitly without `'*'`, and
- omit the `agent` tool

Implementation should treat `agent` as the only valid requirement for subagent dispatch. The current fallback check for `agents` as a tool alias should be reviewed and removed unless there is a documented compatibility reason to keep it.

Documentation should be updated to state that:

- `agents` lists subagents this agent may invoke
- when `agents` is present and `tools` is explicitly scoped, `tools` must include `agent`
- `agents: ['*']` means all available agents

## Technical Considerations

- The validator currently exits non-zero only when errors are present, so changing this rule from warning to error will affect `npm run validate` in [package.json](/Users/alexanderopalic/Projects/compound-copilot/package.json).
- `tools: ['*']` should remain a valid escape hatch because it already grants access to all tools, including `agent`.
- Unknown-agent checks in [src/validate.js](/Users/alexanderopalic/Projects/compound-copilot/src/validate.js) should remain warnings unless there is a separate decision to tighten them.
- The same wording and examples should be kept in sync across the duplicated authoring docs in [skills/create-agent/SKILL.md](/Users/alexanderopalic/Projects/compound-copilot/skills/create-agent/SKILL.md) and [agents/create-agent.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/create-agent.agent.md).
- The current repository snapshot also contains mirrored `.github/agents` and `.github/skills` copies. Implementation should confirm whether those are generated artifacts or source-of-truth docs before editing both.

## Implementation Tasks

- [ ] Update cross-field validation in [src/validate.js](/Users/alexanderopalic/Projects/compound-copilot/src/validate.js) so missing `agent` in `tools` becomes an error, not a warning, when `agents` is declared and `tools` is explicitly scoped.
- [ ] Decide whether the legacy acceptance of `agents` as a tool name in the `hasAgentTool` check is still needed; remove it if unsupported by the registry in [src/copilot-tool-registry.js](/Users/alexanderopalic/Projects/compound-copilot/src/copilot-tool-registry.js).
- [ ] Update the validation message text to be explicit and user-actionable, including the exact required fix.
- [ ] Update frontmatter reference text in [skills/create-agent/SKILL.md](/Users/alexanderopalic/Projects/compound-copilot/skills/create-agent/SKILL.md) and [agents/create-agent.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/create-agent.agent.md) to define `agents` as subagents this agent can use and to note the `agent` tool requirement.
- [ ] Search for any user-facing copy containing the singular phrasing `all available agent` and fix it to `all available agents`.
- [ ] Validate representative agent files in [agents/cplan.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/cplan.agent.md), [agents/ccompound.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/ccompound.agent.md), [agents/creview.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/creview.agent.md), and [agents/csimplify.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/csimplify.agent.md) to ensure the stricter rule does not create regressions.
- [ ] Run `npm run validate` and confirm the repository passes with the tightened rule.

## Acceptance Criteria

- [ ] An agent file with `agents: ['cexplore']` and `tools: ['search/codebase']` fails validation with an error that clearly states `agent` must be included in `tools`.
- [ ] An agent file with `agents: ['cexplore']` and `tools: ['search/codebase', 'agent']` passes this specific validation rule.
- [ ] An agent file with `agents: ['*']` and `tools: ['*']` continues to pass validation.
- [ ] Existing orchestrator examples and authoring docs explicitly describe the relationship between `agents` and the `agent` tool.
- [ ] User-facing wording uses `all available agents` consistently.

## References

- [src/validate.js](/Users/alexanderopalic/Projects/compound-copilot/src/validate.js)
- [src/copilot-tool-registry.js](/Users/alexanderopalic/Projects/compound-copilot/src/copilot-tool-registry.js)
- [skills/create-agent/SKILL.md](/Users/alexanderopalic/Projects/compound-copilot/skills/create-agent/SKILL.md)
- [agents/create-agent.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/create-agent.agent.md)
- [agents/cplan.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/cplan.agent.md)
- [agents/creview.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/creview.agent.md)

## Dependencies And Risks

- Tightening a warning into an error can fail validation for downstream custom agents that were previously tolerated.
- The repo has duplicate agent/skill definitions under `.github/`; if both trees are intended to stay aligned, partial doc updates will create drift.
- Git-history-specific context could not be collected because the research subagent tool invocation failed in this session, so any legacy compatibility rationale around the `agents` alias still needs confirmation during implementation.