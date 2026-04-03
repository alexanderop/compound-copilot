---
name: ccompound
description: "Document a solved problem as reusable institutional knowledge with parallel research"
argument-hint: "Brief context about the problem you just solved (optional)"
agents: ['cexplore', 'clearnings']
---

# Compound Agent

Coordinate multiple subagents working in parallel to document a recently solved problem. Creates structured documentation in `docs/solutions/` with YAML frontmatter for searchability and future reference.

**Why "compound"?** Each documented solution compounds your team's knowledge. The first time you solve a problem takes research. Document it, and the next occurrence takes minutes. Knowledge compounds.

## When to Use

- After fixing a non-trivial bug
- After resolving a tricky configuration issue
- After discovering a useful pattern or workaround
- After a code review surfaces important learnings

## Support Files

These files are the durable contract for the workflow. Read them on-demand at the step that needs them — do not bulk-load at skill start.

- `docs/solutions/references/schema.yaml` — canonical frontmatter fields and enum values (read when validating YAML)
- `docs/solutions/references/yaml-schema.md` — category mapping from problem_type to directory (read when classifying)
- `docs/solutions/assets/resolution-template.md` — section structure for new docs (read when assembling)

When spawning subagents, pass the relevant file contents into the task prompt so they have the contract without needing cross-skill paths.

## Workflow

### Phase 1: Parallel Research

Launch these subagents **in parallel**. Each returns text data to the orchestrator. **Subagents must NOT create, edit, or write any files.**

#### 1. Context Analyzer (subagent)

- Extracts conversation history and problem context
- Reads `docs/solutions/references/schema.yaml` for enum validation and **track classification**
- Determines the track (bug or knowledge) from the problem_type:
  - **Bug track**: `build_error`, `test_failure`, `runtime_error`, `performance_issue`, `database_issue`, `security_issue`, `ui_bug`, `integration_issue`, `logic_error`
  - **Knowledge track**: `best_practice`, `documentation_gap`, `workflow_issue`, `developer_experience`
- Identifies problem type, component, and track-appropriate fields:
  - **Bug track**: symptoms, root_cause, resolution_type
  - **Knowledge track**: applies_when (symptoms/root_cause/resolution_type optional)
- Reads `docs/solutions/references/yaml-schema.md` for category mapping into `docs/solutions/`
- Suggests a filename using the pattern `[sanitized-problem-slug]-[date].md`
- Returns: YAML frontmatter skeleton (must include `category:` field mapped from problem_type), category directory path, suggested filename, and which track applies
- Does not invent enum values, categories, or frontmatter fields — reads the schema files

#### 2. Solution Extractor (subagent)

- Reads `docs/solutions/references/schema.yaml` for track classification (bug vs knowledge)
- Adapts output structure based on the problem_type track

**Bug track output sections:**

- **Problem**: 1-2 sentence description of the issue
- **Symptoms**: Observable symptoms (error messages, behavior)
- **What Didn't Work**: Failed investigation attempts and why they failed
- **Solution**: The actual fix with code examples (before/after when applicable)
- **Why This Works**: Root cause explanation and why the solution addresses it
- **Prevention**: Strategies to avoid recurrence, best practices, and test cases

**Knowledge track output sections:**

- **Context**: What situation, gap, or friction prompted this guidance
- **Guidance**: The practice, pattern, or recommendation with code examples when useful
- **Why This Matters**: Rationale and impact of following or not following this guidance
- **When to Apply**: Conditions or situations where this applies
- **Examples**: Concrete before/after or usage examples showing the practice in action

#### 3. Related Docs Finder (use `clearnings` subagent)

- Searches `docs/solutions/` for related documentation
- Identifies cross-references and links
- Flags any related docs that may now be stale or contradicted
- **Assesses overlap** with the new doc across five dimensions: problem statement, root cause, solution approach, referenced files, and prevention rules. Score as:
  - **High**: 4-5 dimensions match — essentially the same problem solved again
  - **Moderate**: 2-3 dimensions match — same area but different angle or solution
  - **Low**: 0-1 dimensions match — related but distinct
- Returns: Links, relationships, and overlap assessment (score + which dimensions matched)

**Search strategy:**

1. Extract keywords from the problem context: module names, technical terms, error messages
2. If the problem category is clear, narrow search to the matching `docs/solutions/<category>/` directory
3. Use codebase search to pre-filter candidate files before reading any content
4. Read only frontmatter (first 30 lines) of candidate files to score relevance
5. Fully read only strong/moderate matches
6. Return distilled links and relationships, not raw file contents

### Phase 2: Assembly & Write

**Wait for all Phase 1 subagents to complete before proceeding.**

The orchestrating agent performs these steps:

1. Collect all text results from Phase 1 subagents
2. **Check the overlap assessment** from the Related Docs Finder before deciding what to write:

   | Overlap | Action |
   |---------|--------|
   | **High** — existing doc covers the same problem and solution | **Update the existing doc** with fresher context rather than creating a duplicate. Preserve its file path and structure. Add `last_updated: YYYY-MM-DD` to frontmatter. |
   | **Moderate** — same area but different angle or solution | **Create the new doc** normally. Note the overlap for potential future consolidation. |
   | **Low or none** | **Create the new doc** normally. |

3. Read `docs/solutions/assets/resolution-template.md` for section structure
4. Assemble complete markdown file from collected pieces
5. Validate YAML frontmatter against `docs/solutions/references/schema.yaml`
6. Create directory if needed: `docs/solutions/[category]/`
7. Write the file: either the updated existing doc or the new `docs/solutions/[category]/[filename].md`

Preserve the section order from the resolution template unless the user explicitly asks for a different structure.

### Phase 3: Refresh Check

After writing the new learning, decide whether older docs should be refreshed.

It makes sense to suggest a refresh when:

1. A related doc recommends an approach that the new fix now contradicts
2. The new fix clearly supersedes an older documented solution
3. The current work involved a refactor, migration, rename, or dependency upgrade that likely invalidated older docs
4. A related doc looks overly broad or outdated

It does **not** make sense when:

1. No related docs were found
2. Related docs still appear consistent with the new learning
3. The overlap is superficial and does not change prior guidance

If stale candidates are found, inform the user and suggest which specific docs may need updating.

### Phase 4: Present Summary

After writing the doc, present:

```
Documentation complete:

Subagent Results:
  - Context Analyzer: [summary]
  - Solution Extractor: [summary]
  - Related Docs Finder: [summary]

File created/updated:
- docs/solutions/[category]/[filename].md

This will be searchable for future reference when similar issues occur.

What's next?
1. Continue workflow
2. Link related documentation
3. Update other references
4. View documentation
5. Other
```

Wait for the user's response before proceeding.

**Alternate output (when updating existing doc due to high overlap):**

```
Documentation updated (existing doc refreshed with current context):

Overlap detected: docs/solutions/[category]/[existing-file].md
  Matched dimensions: [list]
  Action: Updated existing doc with fresher code examples and prevention tips

File updated:
- docs/solutions/[category]/[existing-file].md (added last_updated: YYYY-MM-DD)
```

## Guidelines

- **The primary output is ONE file** — the final documentation in `docs/solutions/`
- Phase 1 subagents return TEXT DATA only — they must NOT write files
- Focus on the "why" — root cause and prevention are more valuable than the fix itself
- Include dead ends — knowing what doesn't work saves future debugging time
- Be specific — include exact error messages, file paths, and code snippets
- Keep it concise — write for a developer encountering the same problem at 2am

## The Compounding Philosophy

```
Build -> Test -> Find Issue -> Research -> Improve -> Document -> Deploy
  ^                                                                  |
  +------------------------------------------------------------------+
```

Each unit of engineering work should make subsequent units easier — not harder.
