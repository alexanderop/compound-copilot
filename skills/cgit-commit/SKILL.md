---
name: cgit-commit
description: Create a git commit with a clear, value-communicating message. Use when the user says "commit", "commit this", "save my changes", "create a commit", or wants to commit staged or unstaged work. Produces well-structured commit messages that follow repo conventions when they exist, and defaults to conventional commit format otherwise.
---

# Git Commit

Create a single, well-crafted git commit from the current working tree changes.

## Workflow

### Step 1: Gather context

Run these commands to understand the current state.

```bash
git status
git diff HEAD
git branch --show-current
git log --oneline -10
git rev-parse --abbrev-ref origin/HEAD
```

The last command returns the remote default branch (e.g., `origin/main`). Strip the `origin/` prefix to get the branch name. If the command fails or returns a bare `HEAD`, try:

```bash
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
```

If both fail, fall back to `main`.

If the `git status` result shows a clean working tree (no staged, modified, or untracked files), report that there is nothing to commit and stop.

If `git branch --show-current` returns empty, the repository is in detached HEAD state. Ask whether to create a feature branch now using `#askQuestions`. If the user agrees, derive the name from the change content and create it with `git checkout -b <branch-name>`. If the user declines, continue with the detached HEAD commit.

### Step 2: Determine commit message convention

Follow this priority order:

1. **Repo conventions already in context** — If project instructions (AGENTS.md, CLAUDE.md, or similar) are already loaded and specify commit message conventions, follow those.
2. **Recent commit history** — If no explicit convention is documented, examine the 10 most recent commits. If a clear pattern emerges (e.g., conventional commits, ticket prefixes, emoji prefixes), match it.
3. **Default: conventional commits** — `type(scope): description` where type is one of `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `style`, `build`.

### Step 3: Consider logical commits

Before staging everything together, scan the changed files for naturally distinct concerns. If modified files clearly group into separate logical changes (e.g., a refactor in one directory and a new feature in another), create separate commits for each group.

Keep this lightweight:
- Group at the **file level only** — do not try to split hunks within a file.
- If the separation is obvious (different features, unrelated fixes), split. If ambiguous, one commit is fine.
- Two or three logical commits is the sweet spot. Do not over-slice.

### Step 4: Stage and commit

Check if on the default branch (`main`, `master`, or resolved default). If so, warn the user and ask whether to continue or create a feature branch first using `#askQuestions`.

Stage relevant files by name. Prefer staging specific files over `git add -A` or `git add .` to avoid accidentally including sensitive files (.env, credentials) or unrelated changes.

Write the commit message:
- **Subject line**: Concise, imperative mood, focused on *why* not *what*. Follow the convention from Step 2.
- **Body** (when needed): Add a body separated by a blank line for non-trivial changes. Explain motivation, trade-offs, or anything a future reader would need. Omit for obvious single-purpose changes.

Use a heredoc to preserve formatting:

```bash
git commit -m "$(cat <<'EOF'
type(scope): subject line here

Optional body explaining why this change was made,
not just what changed.
EOF
)"
```

### Step 5: Confirm

Run `git status` after the commit to verify success. Report the commit hash(es) and subject line(s).
