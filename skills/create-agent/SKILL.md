---
name: create-agent
description: "Scaffold a new custom agent — reviewers, researchers, or workflow agents. Use when asked to create, scaffold, or add a new agent."
argument-hint: "Describe the agent to create (e.g., 'Vue reviewer', 'Python linter')"
---

# Create Agent

Scaffold a new `.agent.md` file with correct VS Code Copilot frontmatter and structure.

## Workflow

### Step 1: Determine Agent Type

Ask the user what kind of agent they want to create:

1. **Reviewer** — a code review subagent (dispatched by the `creview` orchestrator)
2. **Researcher** — a read-only codebase exploration agent
3. **Workflow** — a user-facing agent for specific tasks

### Step 2: Gather Details

Based on agent type, ask:

- **Name** — lowercase, hyphenated (e.g., `vue-reviewer`, `python-linter`)
- **Description** — what it does in one sentence
- **Domain** — what file types or patterns it targets (for reviewers)

### Step 3: Generate the Agent File

#### For Reviewers

Reviewers are subagents dispatched by the `creview` orchestrator. They:
- Are hidden from the user dropdown
- Cannot be auto-invoked by other agents
- Have read-only tools only
- Follow the standard finding output format

```yaml
---
name: [name]-reviewer
description: "[What it reviews] — [specific focus areas]"
user-invocable: false
disable-model-invocation: true
tools: ['search/codebase', 'search/usages']
---
```

The body should include:
- Clear role description
- What to look for (specific patterns, smells, or violations)
- Confidence calibration (High/Medium/Low with definitions)
- What NOT to flag (to avoid noise)
- Standard output format (Finding with Severity, Confidence, File, Category, Description, Suggestion)

#### For Researchers

Researchers are read-only subagents used by other agents for codebase exploration.

```yaml
---
name: [name]
description: "[What it researches]"
user-invocable: false
disable-model-invocation: true
tools: ['search/codebase', 'search/usages', 'search/changes', 'web/fetch']
---
```

#### For Workflow Agents

Workflow agents are user-facing and can have full tool access.

```yaml
---
name: [name]
description: "[What it does]"
argument-hint: "[Expected input]"
tools: ['*']
---
```

### Step 4: Place the File

Write the agent file to `.github/agents/[name].agent.md`.

### Step 5: Explain Auto-Discovery

For reviewers, explain:
- The `creview` orchestrator uses `agents: ['*']` and auto-discovers all `*-reviewer.agent.md` files
- It reads the reviewer's `description` to determine if it's relevant to the current diff
- The reviewer will be dispatched automatically when files matching its domain are changed
- No configuration needed — just create the file and it's active

## VS Code Copilot Frontmatter Reference

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Agent identifier (lowercase, hyphenated) |
| `description` | string | Shown in chat input; used for smart routing |
| `argument-hint` | string | Guidance text for input |
| `tools` | string[] | Tool/tool-set names |
| `agents` | string[] or `*` | Subagent availability |
| `user-invocable` | boolean | Show in dropdown (default: true) |
| `disable-model-invocation` | boolean | Prevent auto-invocation (default: false) |
| `handoffs` | object[] | Workflow transitions |

**Banned fields** (Claude Code only — must not appear):
`color`, `context`, `allowed-tools`, `disallowedTools`

**Deprecated fields:**
`infer` — use `user-invocable` and `disable-model-invocation` instead
