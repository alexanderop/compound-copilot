# Execution Strategies

Select the execution strategy based on task complexity and dependencies.

## Strategy Selection

| Strategy | When to use | How it works |
|----------|------------|--------------|
| **Inline** | 1-2 small tasks, or bare prompts with no plan | Execute directly in current context. No subagents needed. |
| **Sequential** | 3+ tasks with dependencies between them | Each task runs as a subagent with fresh context. Pass the plan file, unit details, and resolved questions. Execute in dependency order. |
| **Parallel** | 3+ independent tasks with non-overlapping files | Dispatch subagents concurrently. Handle dependent tasks sequentially after their prerequisites complete. |

## Inline

Best for:
- Single-file changes
- Bug fixes with a clear cause
- Config updates
- Bare prompts ("add a loading spinner to the user page")

Just do the work directly — no orchestration overhead.

## Sequential Subagents

Best for:
- Features that build on each other (model → service → controller → view)
- Migrations that must run in order
- Refactors that change interfaces consumed by later units

Each subagent gets:
1. The full plan file path
2. Its specific unit details
3. Context from previously completed units (what changed, what to build on)
4. Any sequencing or coordination constraints relevant to its unit

## Parallel Subagents

Best for:
- Independent features (API endpoint + UI component with no shared state)
- Multiple isolated refactors

Rules:
- Only parallelize units with non-overlapping file sets
- Handle shared dependencies sequentially first
- Merge and validate implementation coherence after all parallel work completes

## Choosing Between Strategies

```
1-2 tasks? → Inline
3+ tasks, all independent? → Parallel
3+ tasks, some dependent? → Sequential (or hybrid: parallel independent, sequential dependent)
```

When in doubt, use sequential — it's safer and easier to debug than parallel.
