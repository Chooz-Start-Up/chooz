---
description: Create a GitHub issue following the project ticket standard
user-invocable: true
allowed-tools: Bash, Read, Grep
argument-hint: "feat|fix|infra|research: Short title"
---

Create a GitHub issue in `Chooz-Start-Up/chooz` following the ticket standard defined in CLAUDE.md.

The user will provide a title (with prefix) and a description of what they want. Use that to fill out the full template.

**Title format:** `prefix: Short description`
Prefixes: `feat`, `fix`, `infra`, `research`

**Body template (all four sections required):**

```markdown
## Description
Why this work is needed and a summary of what needs to be done. Link to relevant PRD section or prior issues.

## Completion Criteria
- [ ] Concrete, verifiable checklist of what "done" looks like
- [ ] Each item should be independently testable

## Implementation
**Key files:**
- `path/to/file.ts` — what changes here

**Approach:**
High-level description of the implementation strategy.

## Dependencies
- Blocked by: #X (or "None")
- Blocks: #Y (or "None")
```

**Labels** (apply all that fit):
- Phase: `phase-0`, `phase-1`
- Platform: `web-dashboard`, `mobile`, `web-fallback`
- Domain: `infra`, `search`

If the user provides `$ARGUMENTS`, use it as the issue title. Ask for any missing details needed to fill the template.

Use `gh issue create` to create the issue and return the URL.
