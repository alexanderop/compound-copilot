# Plan Handoff

This file contains post-plan-writing instructions: document review, post-generation options, and issue creation. Load it after the plan file has been written and the confidence check (5.3.1-5.3.7) is complete.

## 5.3.8 Document Review

After the confidence check (and any deepening), run the `/cdocument-review` skill on the plan file. Pass the plan path as the argument. When this step is reached, it is mandatory — do not skip it because the confidence check already ran. The two tools catch different classes of issues.

The confidence check and document-review are complementary:
- The confidence check strengthens rationale, sequencing, risk treatment, and grounding
- Document-review checks coherence, feasibility, scope alignment, and surfaces role-specific issues

If document-review returns findings that were auto-applied, note them briefly when presenting handoff options. If residual P0/P1 findings were surfaced, mention them so the user can decide whether to address them before proceeding.

When document-review returns "Review complete", proceed to Final Checks.

**Pipeline mode:** If invoked from an automated workflow such as `/clfg`, run `/cdocument-review` with `mode:headless` and the plan path. Headless mode applies auto-fixes silently and returns structured findings without interactive prompts. Address any P0/P1 findings before returning control to the caller.

## 5.3.9 Final Checks and Cleanup

Before proceeding to post-generation options:
- Confirm the plan is stronger in specific ways, not merely longer
- Confirm the planning boundary is intact
- Confirm origin decisions were preserved when an origin document exists

If artifact-backed mode was used:
- Clean up the temporary scratch directory after the plan is safely updated
- If cleanup is not practical on the current platform, note where the artifacts were left

## 5.4 Post-Generation Options

**Pipeline mode:** If invoked from an automated workflow such as `/clfg`, skip the interactive menu below and return control to the caller immediately. The plan file has already been written, the confidence check has already run, and document-review has already run — the caller determines the next step.

After document-review completes, present the options using `#askQuestions`. Otherwise present numbered options in chat and wait for the user's reply before proceeding.

**Question:** "Plan ready at `docs/plans/YYYY-MM-DD-NNN-<type>-<name>-plan.md`. What would you like to do next?"

**Options:**
1. **Start `/cwork`** - Begin implementing this plan (recommended)
2. **Open plan in editor** - Open the plan file for review
3. **Run additional document review** - Another pass for further refinement
4. **Start `/cwork` in another session** - Begin implementing in a separate agent session when the current platform supports it
5. **Create Issue** - Create an issue in the configured tracker

Based on selection:
- **Open plan in editor** -> Open `docs/plans/<plan_filename>.md` using the current platform's file-open mechanism
- **Run additional document review** -> Load the `/cdocument-review` skill with the plan path for another pass
- **`/cwork`** -> Load `/cwork` with the plan path
- **`/cwork` in another session** -> If the current platform supports launching a separate agent session, start `/cwork` with the plan path there. Otherwise, explain the limitation briefly and offer to run `/cwork` in the current session instead.
- **Create Issue** -> Follow the Issue Creation section below
- **Other** -> Accept free text for revisions and loop back to options

## Issue Creation

When the user selects "Create Issue", detect their project tracker from `CLAUDE.md`:

1. Look for `project_tracker: github` or `project_tracker: linear`
2. If GitHub:

   ```bash
   gh issue create --title "<type>: <title>" --body-file <plan_path>
   ```

3. If Linear:

   ```bash
   linear issue create --title "<title>" --description "$(cat <plan_path>)"
   ```

4. If no tracker is configured:
   - Ask which tracker they use using `#askQuestions`
   - Suggest adding the tracker to `CLAUDE.md` for future runs

After issue creation:
- Display the issue URL
- Ask whether to proceed to `/cwork`
