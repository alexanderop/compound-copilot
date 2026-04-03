---
title: "feat: Add simple HTML explainer for the Compound Engineering workflow"
type: feat
status: active
date: 2026-04-03
---

## Problem Statement

This repository explains the Compound Engineering workflow in [README.md](/Users/alexanderopalic/Projects/compound-copilot/README.md), but that explanation is embedded inside a long markdown document and there is no standalone page that can be opened directly or linked as a focused visual explainer. The request is to add a simple HTML file that explains how the workflow works in this project.

## Overview And Motivation

The repo already has the right source material for this page: the workflow diagram, agent roles, file-bridge pattern, context flow, and compounding loop are documented in [README.md](/Users/alexanderopalic/Projects/compound-copilot/README.md), while implementation details are reinforced by [agents/cplan.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/cplan.agent.md), [agents/cbrainstorm.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/cbrainstorm.agent.md), [agents/creview.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/creview.agent.md), and [agents/ccompound.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/ccompound.agent.md).

The simplest, most consistent addition is a repo-level static HTML page in `docs/` that summarizes:

- the end-to-end pipeline (`cbrainstorm` → `cplan` → `cwork` → `csimplify` → `creview` → `ccompound`)
- why the workflow uses file-based handoffs
- which artifacts are written to `docs/brainstorms/`, `docs/plans/`, `docs/reviews/`, and `docs/solutions/`
- how knowledge compounds back into future runs

This keeps the explainer separate from generated pipeline artifacts while making it easy to discover from the README.

## Proposed Solution

Add a single self-contained HTML file at `docs/how-compound-engineering-works.html` with minimal inline CSS and no build tooling. The page should be static, readable when opened directly from disk, and aligned with the terminology already used in [README.md](/Users/alexanderopalic/Projects/compound-copilot/README.md).

The page should cover these sections:

- a short definition of Compound Engineering in the context of this repo
- the workflow stages and what each agent is responsible for
- the artifact handoff model and why it prevents context rot
- the knowledge loop through `docs/solutions/`
- a short "how to use it" example based on the existing command examples in [README.md](/Users/alexanderopalic/Projects/compound-copilot/README.md)

The README should then link to the HTML page from the project overview or the existing "How It Works" section so the page is discoverable.

## Technical Considerations

- This repo currently has no HTML or static-site pattern, so the implementation should avoid introducing a framework or asset pipeline for a single page.
- The package `files` list in [package.json](/Users/alexanderopalic/Projects/compound-copilot/package.json) does not include `docs/`, so a page placed there will be repo-only and will not ship via npm unless packaging is changed.
- [bin/install.js](/Users/alexanderopalic/Projects/compound-copilot/bin/install.js) scaffolds `docs/brainstorms`, `docs/plans`, `docs/reviews`, and `docs/solutions` in downstream projects. The new HTML page should not be confused with those generated artifact directories.
- The page should not depend on root-absolute asset paths or external build output. If any styling is added, it should be inline or use relative paths only.
- README wording may need a small refresh to ensure the HTML page and the existing markdown explanation stay consistent, especially around the staged workflow and the docs directory purpose.

## Implementation Tasks

- [ ] Create `docs/how-compound-engineering-works.html` as a standalone page with semantic HTML and light inline styling.
- [ ] Base the page content on the existing workflow explanation in [README.md](/Users/alexanderopalic/Projects/compound-copilot/README.md) so terminology stays consistent with the repo.
- [ ] Explain the six workflow stages and clearly label which parts are optional versus always-on.
- [ ] Add a section describing the file-bridge pattern, `.latest` pointer files, and why agents read and write artifacts through disk.
- [ ] Add a section showing how learnings in `docs/solutions/` feed back into later planning through `clearnings`.
- [ ] Add a prominent link to the page from [README.md](/Users/alexanderopalic/Projects/compound-copilot/README.md), ideally near the existing "How It Works" section.
- [ ] Decide explicitly whether the page is intended to be repo-only documentation or should also ship in the npm package; if it should ship, update [package.json](/Users/alexanderopalic/Projects/compound-copilot/package.json) accordingly.
- [ ] Open the HTML file locally to verify it renders correctly without a build step and that all internal links work.

## Acceptance Criteria

- [ ] A standalone HTML file exists at `docs/how-compound-engineering-works.html` and can be opened directly in a browser.
- [ ] The page accurately explains the pipeline stages used in this repo and matches the terminology in [README.md](/Users/alexanderopalic/Projects/compound-copilot/README.md).
- [ ] The page explains the file-based handoff model and the role of the artifact folders under `docs/`.
- [ ] [README.md](/Users/alexanderopalic/Projects/compound-copilot/README.md) links to the new explainer page.
- [ ] No new tooling, framework, or build step is introduced for this change.
- [ ] If the page is meant to ship in the package, the packaging configuration is updated and verified; otherwise the plan explicitly leaves it as repo-only documentation.

## References

- [README.md](/Users/alexanderopalic/Projects/compound-copilot/README.md)
- [agents/cplan.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/cplan.agent.md)
- [agents/cbrainstorm.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/cbrainstorm.agent.md)
- [agents/creview.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/creview.agent.md)
- [agents/ccompound.agent.md](/Users/alexanderopalic/Projects/compound-copilot/agents/ccompound.agent.md)
- [bin/install.js](/Users/alexanderopalic/Projects/compound-copilot/bin/install.js)
- [package.json](/Users/alexanderopalic/Projects/compound-copilot/package.json)

## Dependencies And Risks

- There is no prior HTML documentation pattern in this repo, so this change defines a new documentation form and should stay intentionally minimal.
- A standalone HTML page can drift from [README.md](/Users/alexanderopalic/Projects/compound-copilot/README.md) unless both are kept aligned.
- If the user expects the page to be included in the published npm package, the current packaging setup will not satisfy that expectation without an explicit follow-up change.