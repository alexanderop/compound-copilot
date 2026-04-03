/**
 * Canonical VS Code Copilot tool registry.
 *
 * Sourced from microsoft/vscode-copilot-chat package.json:
 *   - contributes.languageModelTools  (individual tools)
 *   - contributes.chatToolSets        (tool sets)
 */

export const TOOL_SETS = {
  edit: [
    "createDirectory",
    "createFile",
    "createJupyterNotebook",
    "editFiles",
    "editNotebook",
    "rename",
  ],
  execute: [
    "runNotebookCell",
    "testFailure",
    "executionSubagent",
  ],
  read: [
    "getNotebookSummary",
    "problems",
    "readFile",
    "viewImage",
    "readNotebookCellOutput",
  ],
  search: [
    "changes",
    "codebase",
    "fileSearch",
    "listDirectory",
    "searchResults",
    "textSearch",
    "searchSubagent",
    "usages",
  ],
  vscode: [
    "askQuestions",
    "getProjectSetupInfo",
    "installExtension",
    "memory",
    "newWorkspace",
    "resolveMemoryFileUri",
    "runCommand",
    "switchAgent",
    "vscodeAPI",
  ],
  web: [
    "fetch",
    "githubRepo",
  ],
};

export const INDIVIDUAL_TOOLS = new Set(
  Object.values(TOOL_SETS).flat()
);

INDIVIDUAL_TOOLS.add("applyPatch");
INDIVIDUAL_TOOLS.add("readProjectStructure");
INDIVIDUAL_TOOLS.add("symbols");
INDIVIDUAL_TOOLS.add("findTestFiles");
INDIVIDUAL_TOOLS.add("insertEdit");
INDIVIDUAL_TOOLS.add("multiReplaceString");
INDIVIDUAL_TOOLS.add("replaceString");
INDIVIDUAL_TOOLS.add("toolReplay");

export const TOOL_SET_NAMES = new Set(Object.keys(TOOL_SETS));

export const SPECIAL_TOOLS = new Set(["*", "agent", "todo"]);

export const RENAMED_TOOLS = {
  editFiles: "edit/editFiles",
  runTerminalCommand: "execute",
  codebase: "search/codebase",
  usages: "search/usages",
  changes: "search/changes",
  problems: "read/problems",
  fetch: "web/fetch",
};

/**
 * Check if a tool reference is valid.
 *
 * Valid formats:
 *   - '*'                          (all tools)
 *   - 'agent', 'todo'             (special)
 *   - 'search', 'edit', 'web' ... (tool set names)
 *   - 'search/codebase'           (set/tool slash notation)
 *   - '<server>/*'                (MCP server wildcard)
 *   - 'ext.id/toolName'           (extension tools)
 */
export function validateToolName(tool) {
  if (SPECIAL_TOOLS.has(tool)) return { valid: true };
  if (TOOL_SET_NAMES.has(tool)) return { valid: true };

  if (tool.includes("/")) {
    const [set, ref] = tool.split("/", 2);
    if (ref === "*") return { valid: true };
    if (TOOL_SETS[set]) {
      if (TOOL_SETS[set].includes(ref)) return { valid: true };
      return {
        valid: false,
        message: `Unknown tool "${ref}" in set "${set}". Available: ${TOOL_SETS[set].join(", ")}`,
      };
    }
    return { valid: true };
  }

  if (RENAMED_TOOLS[tool]) {
    return {
      valid: false,
      message: `Tool "${tool}" has been renamed, use "${RENAMED_TOOLS[tool]}" instead`,
    };
  }

  if (INDIVIDUAL_TOOLS.has(tool)) {
    const set = Object.entries(TOOL_SETS).find(([, tools]) =>
      tools.includes(tool)
    );
    if (set) {
      return {
        valid: false,
        message: `Tool "${tool}" should use slash notation: "${set[0]}/${tool}"`,
      };
    }
    return { valid: true };
  }

  return { valid: true };
}
