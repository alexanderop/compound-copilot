---
name: cdeepen
description: "Enhance an existing plan with parallel research agents for depth, best practices, and implementation details. Use when the user says 'deepen the plan', 'research more', or when a plan has high-risk dimensions that need more investigation."
argument-hint: "Path to plan file (or reads from docs/plans/.latest)"
---

# Deepen Plan

Take an existing plan (from `/cplan`) and enhance each section with parallel research agents. Each major element gets its own dedicated research sub-agent to find:
- Best practices and industry patterns
- Performance optimizations
- UI/UX improvements (if applicable)
- Quality enhancements and edge cases
- Real-world implementation examples

The result is a deeply grounded, production-ready plan with concrete implementation details.

## Subagents

This skill dispatches these research subagents in parallel:
- `cexplore` — codebase patterns and conventions
- `cdocs` — external documentation via Context7 MCP
- `clearnings` — past solutions from `docs/solutions/`
- `cbestpractices` — industry standards and community patterns

It also launches all available `*-reviewer` agents against the plan content.

## Workflow

### Step 0: Locate the Plan

1. If a plan path was provided as argument, use it
2. Otherwise, read the path from `docs/plans/.latest`
3. If neither exists, list `docs/plans/` and ask the user which plan to deepen

Do not proceed until you have a valid plan file.

### Step 1: Parse and Analyze Plan Structure

Read the plan file and extract:
- Overview/Problem Statement
- Proposed Solution sections
- Technical Approach/Architecture
- Implementation phases/steps
- Code examples and file references
- Acceptance criteria
- Any UI/UX components mentioned
- Technologies/frameworks mentioned

Create a section manifest:
```
Section 1: [Title] - [Brief description of what to research]
Section 2: [Title] - [Brief description of what to research]
...
```

### Step 2: Research (Parallel)

Launch research sub-agents in parallel for each major section:

**For each section, spawn a `cexplore` agent:**
- Research codebase patterns and conventions for the section topic
- Find existing implementations and architecture decisions

**Spawn `cbestpractices` for each major technology or pattern:**
- Research industry standards and community conventions
- Find recommended patterns, anti-patterns, and production guidance
- Identify performance considerations and common pitfalls

**For each technology/framework mentioned, spawn a `cdocs` agent:**
- Fetch current documentation via Context7 MCP
- Find version-specific patterns and constraints
- Get concrete code examples

**Spawn `clearnings` for documented solutions:**
- Check `docs/solutions/` for relevant past solutions
- Surface institutional knowledge that applies to this plan

### Step 3: Discover and Run Review Agents

Launch ALL available review agents in parallel against the plan content. Do not filter by relevance — let each reviewer decide what applies. The goal is maximum coverage.

### Step 4: Synthesize Findings

Collect outputs from all agents and:
- Extract concrete recommendations (actionable items)
- Extract code patterns and examples
- Identify anti-patterns to avoid
- Note performance and security considerations
- Surface edge cases
- Deduplicate and prioritize by impact
- Flag conflicting advice for human review
- Group findings by plan section

### Step 5: Enhance Plan Sections

For each section, add research insights below the original content:

```markdown
## [Original Section Title]

[Original content preserved]

### Research Insights

**Best Practices:**
- [Concrete recommendation]

**Performance Considerations:**
- [Optimization opportunity]

**Implementation Details:**
```[language]
// Concrete code example from research
```

**Edge Cases:**
- [Edge case and how to handle]

**References:**
- [Documentation URL]
```

### Step 6: Add Enhancement Summary

At the top of the plan, add:

```markdown
## Enhancement Summary

**Deepened on:** [Date]
**Sections enhanced:** [Count]
**Research agents used:** [List]

### Key Improvements
1. [Major improvement 1]
2. [Major improvement 2]
3. [Major improvement 3]

### New Considerations Discovered
- [Important finding 1]
- [Important finding 2]
```

### Step 7: Handover

1. Update the plan file in place
2. Present a brief summary of what was added

Use `#askQuestions` to ask what the user wants to do next:

| Option | When to show |
|--------|-------------|
| **Start Implementation** — load the `/cwork` skill | Always |
| **Write Tests First (TDD)** — load the `/ctest` skill | Always |
| **Deepen further** — re-run research on specific sections | Always |
| **Review and refine** — iterate on specific sections | Always |

**After the user picks a next skill**, announce the handover and load the chosen skill.

## Response Rules

- Never echo full file contents into chat — reference by path
- Keep chat responses under 500 words
- Preserve ALL original plan content — only add, never remove
- Mark all additions clearly as "Research Insights"

## Guidelines

- **Never write code in the plan** — only research and enhance
- Include specific file paths and documentation URLs as references
- Make recommendations concrete and actionable
- When agents disagree, present both perspectives and flag for human decision
