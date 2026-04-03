# Reviewer Persona Catalog

## Always-On Reviewers

These run on every review, regardless of diff content:

| Persona | Agent | Focus |
|---------|-------|-------|
| **Security** | `security-reviewer` | Injection vectors, auth bypasses, secrets exposure, SSRF, OWASP top 10 |
| **Refactoring** | `refactoring-reviewer` | Code smells, simplification opportunities, Martin Fowler patterns |
| **Architecture** | `architecture-reviewer` | Boundaries, dependencies, SOLID principles, coupling |

## Conditional Reviewers (Smart Routing)

Dispatch these based on what's in the diff:

| Persona | Dispatch when... | Skip when... |
|---------|-----------------|--------------|
| **Performance** | Hot paths modified, DB queries changed, loops over collections, caching logic | Pure UI, docs, config |
| **Data/Migration** | Schema changes, migrations, data model modifications | No DB-touching files |
| **Testing** | Test files modified or new code lacks test coverage | Pure refactor with existing tests |
| **Adversarial** | Large diffs (50+ lines changed in a single file), complex logic | Small, straightforward changes |

## Stack-Specific Reviewers (Auto-Discovered)

The review orchestrator scans `agents/` for `*-reviewer.agent.md` files and matches their description against changed file types:

- `.vue` / `.tsx` / `.jsx` files → dispatch any frontend reviewer found
- `.rb` / `.py` / `.go` files → dispatch any language-specific reviewer found
- `.sql` / migration files → dispatch any data reviewer found

## Selection Rules

1. **Always** spawn the 3 always-on reviewers
2. Use judgment for conditional reviewers — match diff content to persona focus
3. Spawn stack-specific reviewers when meaningful files of that type are changed
4. **Announce** which reviewers were selected and why before dispatching
5. Format: `Dispatching: security-reviewer, refactoring-reviewer, architecture-reviewer (always-on) + performance-reviewer (DB queries modified in user_service.ts)`
