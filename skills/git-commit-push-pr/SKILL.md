---
name: git-commit-push-pr
description: Commit, push, and open a PR with an adaptive, value-first description. Use when the user says "commit and PR", "push and open a PR", "ship this", "create a PR", "open a pull request", or wants to go from working changes to an open pull request in one step. Also handles "update the PR description" or "refresh the PR description".
---

# Git Commit, Push, and PR

Go from working tree changes to an open pull request in a single workflow, or update an existing PR description. PR descriptions communicate *value and intent* proportional to the complexity of the change.

## Mode Detection

If the user is asking to update, refresh, or rewrite an existing PR description (with no mention of committing or pushing), this is a **description-only update**. Follow the Description Update workflow below. Otherwise, follow the Full workflow.

---

## Description Update Workflow

### DU-1: Confirm intent

Ask: "Update the PR description for this branch?" using `#askQuestions`.

### DU-2: Find the PR

```bash
git branch --show-current
gh pr view --json url,title,state
```

If no open PR exists for the current branch, report that and stop.

### DU-3: Write and apply

Read the current description, gather the full branch diff (see Step 6 of Full workflow), write a new description following the writing principles, and ask the user to confirm before applying:

```bash
gh pr edit --body "$(cat <<'EOF'
Updated description here
EOF
)"
```

---

## Full Workflow

### Step 1: Gather context

```bash
git status
git diff HEAD
git branch --show-current
git log --oneline -10
git rev-parse --abbrev-ref origin/HEAD
```

Resolve the default branch (strip `origin/` prefix). Fall back to `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'`, then to `main`.

Handle edge cases:
- **Detached HEAD**: Ask whether to create a feature branch using `#askQuestions`
- **Clean working tree**: Check for unpushed commits or missing PR before stopping
- **On default branch**: Ask whether to create a feature branch first

### Step 2: Determine conventions

1. Repo conventions already in context (AGENTS.md, CLAUDE.md)
2. Recent commit history patterns
3. Default: conventional commits

### Step 3: Check for existing PR

```bash
gh pr view --json url,title,state
```

- Open PR exists → note URL, after push skip to Step 7 (existing PR flow)
- No PR / closed / merged → continue to create new PR

### Step 4: Branch, stage, and commit

1. If on default branch, create a feature branch first
2. Scan for logical commit boundaries (file-level grouping, 2-3 commits max)
3. Stage files by name (avoid `git add -A`)
4. Commit with conventional message using heredoc

### Step 5: Push

```bash
git push -u origin HEAD
```

### Step 6: Write the PR description

#### Detect the base branch

Use this fallback chain (stop at first success):
1. PR metadata: `gh pr view --json baseRefName,url`
2. `git symbolic-ref --quiet --short refs/remotes/origin/HEAD`
3. `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'`
4. Check common names: main, master, develop, trunk

#### Gather the branch scope

```bash
git merge-base <base-remote>/<base-branch> HEAD
git log --oneline <merge-base>..HEAD
git diff <merge-base>...HEAD
```

Use the full branch diff (not just working-tree diff) as the basis for the description.

#### Size the description

| Change profile | Description approach |
|---|---|
| Small + simple (typo, config, dep bump) | 1-2 sentences, no headers. Under ~300 chars. |
| Small + non-trivial (targeted bugfix) | Short "Problem / Fix" narrative, ~3-5 sentences. |
| Medium feature or refactor | Summary paragraph + section on what changed and why. |
| Large or architecturally significant | Full narrative: context, approach, decisions, migration notes. |

#### Writing principles

- **Lead with value**: First sentence tells *why this PR exists*, not what files changed
- **No orphaned opening paragraphs**: If using `##` headers anywhere, put the opening under a heading too
- **Describe the net result, not the journey**: No debugging steps, iteration history, or intermediate failures
- **When commits conflict, trust the final diff**: Describe the end state
- **Explain the non-obvious**: Spend description space on things the diff doesn't show
- **No empty sections**: Omit sections that don't apply (don't write "N/A")
- **Never prefix list items with `#`**: GitHub interprets `#1` as issue references

### Step 7: Create or update the PR

#### New PR

```bash
gh pr create --title "the pr title" --body "$(cat <<'EOF'
PR description here
EOF
)"
```

Keep the PR title under 72 characters.

#### Existing PR

The push already updated the PR. Ask if the user wants the description updated. If yes, write a new description covering the full PR scope and apply with `gh pr edit --body`.

### Step 8: Report

Output the PR URL.
