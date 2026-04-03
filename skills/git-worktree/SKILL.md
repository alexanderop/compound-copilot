---
name: git-worktree
description: Manage Git worktrees for isolated parallel development. Use when the user wants to work on multiple features in parallel, review code in isolation, or needs a clean workspace. Handles creating, listing, switching, and cleaning up worktrees.
---

# Git Worktree Manager

Manage Git worktrees for isolated parallel development — review PRs in isolation, work on features in parallel, or get a clean workspace.

## When to Use

- **Code review**: Isolate review work from in-progress feature work
- **Parallel features**: Work on multiple features simultaneously
- **Clean workspace**: Get a fresh copy without stashing
- **Cleanup**: After completing work in a worktree

## Commands

### Create a worktree

```bash
# Create from default branch
git worktree add .worktrees/<branch-name> -b <branch-name> main

# Create from specific branch
git worktree add .worktrees/<branch-name> -b <branch-name> <from-branch>
```

After creating:
1. Copy `.env*` files from the main repo to the worktree
2. Ensure `.worktrees` is in `.gitignore`
3. Report the path for the user to `cd` into

### List worktrees

```bash
git worktree list
```

Show which worktree is current (marked with active indicator).

### Switch to a worktree

```bash
cd .worktrees/<name>
```

If the name isn't provided, list available worktrees and ask the user to pick one using `#askQuestions`.

### Clean up worktrees

```bash
# List inactive worktrees
git worktree list

# Remove a specific worktree
git worktree remove .worktrees/<name>

# Prune stale worktree references
git worktree prune
```

Always confirm before removing. Never remove the current worktree.

## Workflow Integration

### With `/review`

1. Check current branch
2. If already on the target branch → stay, no worktree needed
3. If on a different branch → offer worktree using `#askQuestions`:
   - Yes → create worktree, cd into it
   - No → proceed with PR diff on current branch

### With `/work`

Always offer the choice using `#askQuestions`:
1. **New branch** (live work on current worktree)
2. **Worktree** (parallel work in isolation)

## Setup Details

### Directory structure

```
.worktrees/
├── feature-login/          # Worktree 1
├── feature-notifications/  # Worktree 2
└── ...
```

### .env file handling

After creating a worktree, copy environment files:

```bash
# Copy all .env variants
for f in .env .env.local .env.test .env.development .env.production; do
  [ -f "$f" ] && cp "$f" ".worktrees/<name>/$f"
done
```

### .gitignore management

Ensure `.worktrees` is gitignored:

```bash
grep -q '.worktrees' .gitignore 2>/dev/null || echo '.worktrees' >> .gitignore
```

## Key Principles

- **Worktrees are lightweight** — shared git objects, no repo duplication
- **Always confirm destructive actions** — don't remove without asking
- **Copy .env files** — worktrees need environment config to function
- **Keep .worktrees gitignored** — these are local development artifacts
- **Prefer worktrees over stash** — cleaner workflow, no accidental conflicts
