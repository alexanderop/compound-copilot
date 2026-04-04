---
name: ctest
description: "Write tests for a planned or implemented change. Use when the user says 'write tests', 'test this', 'TDD', or wants to create tests for a feature."
argument-hint: "Path to plan file or leave empty to read from docs/plans/.latest"
---

# Test

Write tests for a planned or implemented change. Works in two modes:

- **Before implementation:** write tests first if the user wants a test-first workflow
- **After implementation:** write tests that verify the code already works, catching gaps in coverage

## Subagents

This skill uses the `cexplore` subagent to research testing conventions in the codebase.

## Workflow

### Phase 1: Understand What to Test

#### 1. Read the Plan
- If no plan path was provided, read the path from `docs/plans/.latest`
- Read the plan document completely
- Extract the requirements, implementation units, and verification outcomes
- Identify the testable behaviors from the plan and current code

#### 2. Detect Mode
- Run `git diff --name-only HEAD` and check if implementation files already exist for the plan's tasks
- **Pre-implementation (red phase):** no implementation exists yet — tests will fail
- **Post-implementation (verification):** code already exists — tests should pass
- Announce the detected mode: "Running in [pre/post]-implementation mode."

#### 3. Research Testing Conventions
- Use the `cexplore` subagent to find:
  - The project's test framework and runner (Jest, Vitest, pytest, RSpec, etc.)
  - Test file naming conventions and directory structure
  - Existing test patterns — how fixtures, mocks, and assertions are written
  - How to run tests (the test command)
- **Match the project's conventions exactly** — don't introduce a new test style

#### 4. Map Criteria to Tests
- For each acceptance criterion in the plan, draft a test name and brief description
- Group tests by file/module based on where the implementation lives (or will live)
- Present the test plan (names + descriptions) to the user for approval before writing
- Use `#askQuestions` to confirm: "Proceed with these [N] tests?" with options to approve, add more, or adjust scope

### Phase 2: Write Tests

#### For each test group:

1. **Create the test file** following project conventions (e.g., `__tests__/`, `spec/`, `test/`, colocated `.test.ts`)
2. **Write test cases** that:
   - Describe the expected behavior clearly in the test name
   - Set up the necessary context (imports, fixtures, test data)
   - Assert the expected outcome
3. **Use minimal mocking** — prefer testing real behavior where possible
4. **Include edge cases** from the plan's risk section if applicable

#### Test Writing Principles

- **Test behavior, not implementation** — test what the code should do, not how it does it
- **One assertion per concept** — each test should verify one thing
- **Descriptive names** — `it("returns 404 when user does not exist")` not `it("test error")`
- **Arrange-Act-Assert** — clear structure in each test
- **Only test what the plan specifies** — don't invent requirements

### Phase 3: Verify

Run the test suite and check results based on mode:

**Pre-implementation (red phase):**
1. All new tests must fail
2. Verify failures are for the right reason (missing implementation, not syntax errors)
3. Fix any tests that fail for the wrong reason (broken imports, typos, bad test setup)
4. Run again — confirm all new tests fail with meaningful error messages

**Post-implementation (verification):**
1. All new tests should pass
2. If tests fail, investigate — is it a test bug or an implementation bug?
3. Fix test bugs (bad assertions, wrong imports). Flag implementation bugs to the user.
4. Run again — confirm all new tests pass

### Phase 4: Record and Commit

1. Write the list of test file paths to `docs/tests/.latest` (one path per line)
2. Commit:
   - Pre-implementation: `test: add failing tests for <feature> (TDD red phase)`
   - Post-implementation: `test: add tests for <feature>`
3. Present a summary:
   - Number of test files created
   - Number of test cases written
   - Status: all red (pre) or all green (post)

### Phase 5: Handover

Use `#askQuestions` to ask what the user wants to do next, based on mode:

**Pre-implementation:**

| Option | When to show |
|--------|-------------|
| **Start Implementation** — load the `/cwork` skill | Always |
| **Add more tests** — continue writing tests | Always |
| **Revise tests** — adjust based on feedback | Always |

**Post-implementation:**

| Option | When to show |
|--------|-------------|
| **Simplify Code** — load the `/csimplify` skill | Always |
| **Add more tests** — continue writing tests | Always |
| **Revise tests** — adjust based on feedback | Always |

**After the user picks a next skill**, announce the handover and load the chosen skill.

## Key Principles

- **Write the minimum tests that cover the plan** — comprehensive but not exhaustive
- **Follow existing patterns** — new tests should look like they belong in the project
- **Adapt to context** — red phase before implementation, green verification after

## Response Rules

- Never echo full file contents into chat — reference by path
- Keep status updates to 1-2 lines per test file created
- Show the test plan (names + descriptions) for approval before writing
- After writing, report: "[N] tests across [M] files — all [red/green]"
