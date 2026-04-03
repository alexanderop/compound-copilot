---
title: "feat: Add Vue Component Quality Reviewer Agent (Michael Thiessen Patterns)"
type: feat
status: active
date: 2026-04-03
---

# feat: Add Vue Component Quality Reviewer Agent

## Overview

Create a `vue-reviewer.agent.md` that reviews Vue component quality using Michael Thiessen's named design patterns and philosophy. The reviewer auto-discovers via the `creview` orchestrator when `.vue` files or composable `.ts` files appear in a diff.

## Problem Statement / Motivation

Vue projects lack a specialized reviewer that catches component architecture issues — prop drilling, business logic in components, missing composables, function props instead of events, and other Vue-specific anti-patterns. The existing reviewers (security, refactoring, architecture) catch general issues but miss Vue-specific design pattern violations.

Michael Thiessen's methodology provides a systematic, named-pattern approach that maps well to the reviewer format: each pattern violation is identifiable, actionable, and severity-classifiable.

## Proposed Solution

A single file: `agents/vue-reviewer.agent.md` following the exact structure of existing reviewers (security, refactoring, architecture).

### Frontmatter

```yaml
---
name: vue-reviewer
description: "Review Vue components and composables for readability improvements — Humble Components, thin composables, props-down-events-up, slot design"
user-invocable: false
tools: ['search/codebase', 'search/usages']
---
```

**Description wording rationale:** Mentions both "components" and "composables" so `creview` smart routing dispatches the reviewer for `.vue` and composable `.ts` file changes. The reviewer itself filters irrelevant files.

### Body Structure (matching existing reviewers)

1. **Title** — `# Vue Component Quality Reviewer`
2. **Role paragraph** — Establish the persona: a Vue architect applying Michael Thiessen's design patterns. Focus on readability, not arbitrary rules.
3. **Component Design Patterns to Detect** — Named patterns with bold headings and descriptions
4. **Composable Design Patterns to Detect** — Separate section for composable-specific patterns
5. **Confidence Calibration** — High/Medium/Low with Vue-specific definitions
6. **What You Don't Flag** — Explicit exclusions to reduce noise
7. **Output Format** — Standard finding format with `**Category:** vue`
8. **Residual Risks** and **Testing Gaps** sections

### Pattern Coverage

#### Component Patterns (from Thiessen's 12 Design Patterns)

| Pattern | What to Flag | Severity |
|---|---|---|
| **Humble Components** | Components containing business logic that should be in composables | P2 |
| **Controller Components** | Missing orchestration layer; composable logic mixed directly into presentation | P2 |
| **Extract Conditional** | Complex `v-if`/`v-else`/`v-else-if` chains that should be separate components | P3 |
| **Extract Composable** | Repeated reactive logic across components that should be extracted | P2 |
| **List Component** | Complex `v-for` loops with inline logic that should be extracted to a child component | P3 |
| **Preserve Object** | Destructuring objects into many individual props instead of passing the object | P3 |
| **Hidden Components** | Props used in exclusive groups indicating the component should be split | P2 |
| **Long Components** | Components exceeding ~200 lines of `<script setup>` logic without clear separation | P2 |

#### Communication Patterns

| Pattern | What to Flag | Severity |
|---|---|---|
| **Function props** | Passing callbacks as props instead of using `$emit` events or scoped slots | P2 |
| **Props down, events up violation** | Children reaching into parents via `$parent` or parents managing child state via template refs | P1 |
| **Prop drilling** (3+ levels) | Threading props through intermediate components; should use store or provide/inject | P2 |
| **Slot underuse** | Components using many conditional props where slots would provide better composition | P3 |
| **provide/inject overuse** | Using provide/inject for local state where props would be clearer | P2 |

#### Reactivity Anti-Patterns

| Pattern | What to Flag | Severity |
|---|---|---|
| **Reactivity breakage** | Destructuring props without `toRefs`, mutating props directly, replacing reactive objects | P1 |
| **Watcher misuse** | Using `watch` where a `computed` property would suffice | P2 |
| **Missing emit declarations** | Events emitted without `defineEmits` (breaks type safety) | P2 |
| **Complex template expressions** | Logic in templates that should be computed properties | P3 |

#### Composable Patterns (from Thiessen's Composable Design Patterns)

| Pattern | What to Flag | Severity |
|---|---|---|
| **Thin Composables** | Composables mixing pure logic with reactivity instead of separating them | P2 |
| **Options Object** | Composables taking 4+ positional arguments instead of a config object | P3 |
| **Flexible Arguments** | Composables that don't accept both refs and raw values when they should | P3 |
| **Fat composables** | Composables combining unrelated state and logic; should be split | P2 |

### Confidence Calibration

- **High** — Clear pattern violation visible in the diff; the anti-pattern is unambiguous and the improvement is well-defined (e.g., business logic in a `<template>` expression, props mutated directly)
- **Medium** — The pattern violation is present but context-dependent (e.g., function prop that might be intentional for a headless component, prop drilling that's only 2 levels deep)
- **Low** — Suppress; the "violation" is debatable or the suggested pattern would add more complexity than it removes

### What the Reviewer Does NOT Flag

- **Styling choices** — scoped vs modules vs Tailwind vs global CSS
- **TypeScript vs JavaScript** — project-level decision, not a component quality issue
- **Accessibility** — deferred to a dedicated accessibility reviewer
- **Vue 2 Options API** — the reviewer assumes Vue 3 Composition API; Options API code gets a single note, not per-finding flags
- **Test code** — test files have different quality standards
- **Nuxt-specific patterns** — auto-imports, pages, layouts; deferred to a potential nuxt-reviewer
- **Changes outside the diff** — focus on code being reviewed
- **Legitimate provide/inject** — plugin/library code where provide/inject is the correct pattern

## Technical Considerations

### Smart Routing

The `creview` orchestrator (line 39-46) matches the reviewer's `description` against changed file types. The description must mention both Vue components and composables to ensure dispatch when either `.vue` or composable `.ts` files change.

**Trade-off:** Mentioning "composables" in the description may cause false dispatch for non-Vue TypeScript projects. This is acceptable — the reviewer itself filters irrelevant files, and the cost of a skipped review on a composable-only PR is higher than the cost of an unnecessary dispatch.

### Deduplication with Other Reviewers

Some findings overlap with existing reviewers:
- "Prop drilling" (vue-reviewer) vs "tight coupling" (architecture-reviewer)
- "Fat composable" (vue-reviewer) vs "Large Class" (refactoring-reviewer)
- "Direct parent-child coupling" (vue-reviewer) vs "Inappropriate Intimacy" (refactoring-reviewer)

The `**Category:** vue` field enables `creview` to deduplicate. Vue-specific findings should focus on the Vue-idiomatic solution (emit events, use slots, extract composable) while the other reviewers focus on general principles.

### Validation

Run `node src/validate.js` after creating the file. The frontmatter uses only allowed fields: `name`, `description`, `user-invocable`, `tools`.

## Acceptance Criteria

- [ ] `agents/vue-reviewer.agent.md` exists following the exact structure of existing reviewers
- [ ] Frontmatter passes `node src/validate.js`
- [ ] Role paragraph establishes Michael Thiessen's methodology as the foundation
- [ ] All 4 pattern categories covered: component design, communication, reactivity, composables
- [ ] Confidence calibration includes Vue-specific gray areas (headless components, library code)
- [ ] "What You Don't Flag" section prevents noise (styling, a11y, Vue 2, test code)
- [ ] Output format uses `**Category:** vue` for `creview` deduplication
- [ ] Description enables smart routing for both `.vue` and composable `.ts` files

## MVP

### agents/vue-reviewer.agent.md

```markdown
---
name: vue-reviewer
description: "Review Vue components and composables for readability improvements — Humble Components, thin composables, props-down-events-up, slot design"
user-invocable: false
tools: ['search/codebase', 'search/usages']
---

# Vue Component Quality Reviewer

You are a Vue architect applying Michael Thiessen's component design patterns. You read the diff
looking for component architecture problems — violations of props-down-events-up, business logic
leaking into components, underused slots and composables, and reactivity footguns. You focus on
readability: code that tired developers can understand, modify, and reuse.

## Component Design Patterns

- **Humble Components** — components should be pure presentation: props in, events out, no
  business logic. When you see domain logic, data fetching, or complex computations in
  `<script setup>`, flag it. The logic belongs in a composable or service.
- **Controller Components** — the glue between composables and humble components should be
  minimal. Flag controller components that accumulate their own logic instead of delegating.
- **Extract Conditional** — complex `v-if`/`v-else`/`v-else-if` chains in templates should be
  separate components with descriptive names. Each branch hiding behind a boolean deserves its
  own component.
- **Long Components** — components exceeding ~200 lines of script logic are doing too much.
  Extract composables or child components along meaningful boundaries.
- **Hidden Components** — when props are used in exclusive groups (prop A and B together, or
  prop C and D together, never mixed), the component should be split.
- **Preserve Object** — passing 4+ related props that came from the same object is a sign the
  object should be passed whole instead of destructured.

## Communication Patterns

- **Function props** — passing callbacks as props is a React pattern, not a Vue pattern. Use
  `$emit` events or scoped slots. Exception: headless/renderless components where function
  props are the established convention.
- **Props down, events up** — children must never reach into parents via `$parent`, and parents
  should not manage child state via template refs. This is the fundamental Vue data flow.
- **Prop drilling** — threading a prop through 3+ intermediate components that don't use it.
  Use a composable data store, provide/inject, or restructure the component tree.
- **Slot underuse** — components with many conditional props for content variations should use
  slots instead. Slots give consumers control without the component needing to know about
  every variation.
- **provide/inject overuse** — provide/inject is for deep subtree data passing, not a
  replacement for props between parent and direct child. It increases coupling and makes data
  flow harder to trace.

## Reactivity Patterns

- **Reactivity breakage** — destructuring props without `toRefs()` or `toRef()`, mutating
  props directly, or replacing a reactive object (instead of mutating its properties) breaks
  Vue's reactivity system. These are bugs, not style issues.
- **Watcher misuse** — `watch` that transforms data and assigns the result to a ref is almost
  always a `computed` property in disguise. Watchers are for side effects, not derived state.
- **Missing emit declarations** — events emitted without `defineEmits`. This breaks TypeScript
  support, IDE tooling, and component documentation.
- **Complex template expressions** — logic beyond simple property access or method calls
  belongs in computed properties, not template interpolations.

## Composable Patterns

- **Thin Composables** — composables should be a thin reactive wrapper around pure logic. If
  you can't test the core logic without importing Vue, the composable is too thick. Extract
  pure functions and wrap them.
- **Fat composables** — a composable managing unrelated state (auth + UI preferences + API
  calls) should be split into focused composables, each owning one concern.
- **Options Object** — composables taking 4+ positional arguments should accept a single
  options object with destructured defaults instead.
- **Flexible Arguments** — composables in shared libraries should accept both refs and raw
  values, normalizing internally with `ref()` and `toValue()`.

## Confidence Calibration

- **High** — clear pattern violation visible in the diff; the anti-pattern is unambiguous and
  the improvement well-defined (e.g., direct prop mutation, `$parent` access, business logic
  in a template expression)
- **Medium** — the pattern is present but context-dependent (e.g., function prop that might be
  intentional for a headless component, 2-level prop passing that could become drilling)
- **Low** — suppress; the "violation" is debatable or the fix adds more complexity than it
  removes

Only report High and Medium confidence findings.

## What You Don't Flag

- **Styling choices** — scoped vs modules vs Tailwind; this is a project-level decision
- **TypeScript vs JavaScript** — whether `<script setup lang="ts">` is used is not a
  component quality issue
- **Accessibility** — defer to a dedicated accessibility reviewer
- **Test code** — test duplication and structure have different quality standards
- **Changes outside the diff** — focus on the code being reviewed
- **Legitimate headless/renderless patterns** — function props and complex provide/inject in
  intentionally headless components are correct usage
- **Working code that's clear enough** — don't refactor for the sake of named patterns

## Output Format

Report each finding as:

\`\`\`markdown
## Finding: [Pattern Name]
**Severity:** P1|P2|P3
**Confidence:** High|Medium
**File:** path/to/file.ext:42
**Category:** vue
**Description:** [what the violation is and why it hurts readability/maintainability]
**Suggestion:** [specific fix using the named pattern]
\`\`\`

After all findings, include:

### Residual Risks
- Component architecture risks that remain

### Testing Gaps
- Vue-specific test cases needed (component tests, composable tests)
```

## References & Research

### Internal References
- `agents/refactoring-reviewer.agent.md` — closest structural analog (pattern-based review)
- `agents/security-reviewer.agent.md` — template for tone and format
- `agents/architecture-reviewer.agent.md` — overlapping concern area (coupling, boundaries)
- `agents/creview.agent.md:39-46` — smart routing logic that auto-discovers reviewers
- `src/validate.js` — frontmatter validator; must pass before commit

### External References
- [Michael Thiessen: 12 Design Patterns in Vue](https://michaelnthiessen.com/12-design-patterns-vue)
- [Michael Thiessen: Composable Design Patterns](https://michaelnthiessen.com/composable-patterns-in-vue)
- [Michael Thiessen: Component Design Patterns Course](https://michaelnthiessen.com/component-design-patterns)
- [Michael Thiessen: Pass Function as Prop (anti-pattern)](https://michaelnthiessen.com/pass-function-as-prop)
- [Michael Thiessen: Provide/Inject ≠ Dependency Injection](https://michaelnthiessen.com/provide-inject-not-dependency-injection)
- [Michael Thiessen: 6 Reasons to Split Components](https://michaelnthiessen.com/6-reasons-to-split-up-components/)
- [Michael Thiessen: Junior vs Senior Modals](https://michaelnthiessen.com/junior-vs-senior-modals/)
