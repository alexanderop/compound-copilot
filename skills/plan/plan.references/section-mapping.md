# Section-to-Agent Mapping for Plan Deepening

When the confidence check identifies weak sections, use this mapping to determine which research agents to dispatch for deepening.

## Mapping Table

| Plan Section | Research Agents to Dispatch |
|---|---|
| **Requirements Trace / Open Questions** | `cspecflow`, `cexplore` |
| **Context & Research** | `clearnings`, `cdocs`, `cbestpractices`, `cgithistory` |
| **Key Technical Decisions** | `cdocs`, `cbestpractices` |
| **Implementation Units / Test Scenarios** | `cexplore`, `cspecflow` |
| **System-Wide Impact** | `cexplore`, `cbestpractices` |
| **Risks & Dependencies** | `cexplore`, `cdocs` |

## Execution Rules

1. **Direct mode (default):** Dispatch agents from the mapping for each weak section. Collect their findings and update the plan inline.

2. **Multiple weak sections:** If 3+ sections need deepening, batch the agent dispatches — many sections share the same agents, so avoid running `cexplore` three times for three sections. Dispatch each unique agent once with a combined query.

3. **After updating:** Re-run the confidence check on updated sections only. If gaps remain after one round of deepening, flag them as open questions rather than looping indefinitely.

4. **Preserve existing content:** Deepening adds detail — it never removes decisions, requirements, or units that were already in the plan. If new research contradicts an existing decision, flag it as a finding for the user to resolve.
