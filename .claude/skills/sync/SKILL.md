---
description: Update brain.md and close completed GitHub issues
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Grep, Glob
---

# Sync — Keep brain.md and GitHub issues up to date

Run this skill after a work session to ensure the project's living documentation and issue tracker are current.

## Step 1: Update brain.md

Read `brain.md` and compare it against the actual project state:

1. **Read recent git history** — Run `git log --oneline -20` and `git diff --name-only HEAD~5..HEAD` to see what changed recently.
2. **Check the "What exists today" table** — Scan key directories and compare against the table. Add or update rows for any new components, pages, or services.
3. **Check the "Key Web Components" table** — Look for new or renamed components in `apps/web/components/` and update paths/descriptions.
4. **Check the "Gotchas & Watch-Outs" section** — Add any new gotchas discovered during the session.
5. **Add a session log entry** if the most recent session's work is not yet logged. Summarize what was done, key decisions, and context for the next session.
6. **Update issue counts** — Refresh the open/closed issue counts and table if issues have changed.

Only update sections that are actually stale. Do not rewrite content that is already accurate.

## Step 2: Close completed GitHub issues

1. **List open issues** — Run `gh issue list --repo Chooz-Start-Up/chooz --state open --limit 50`.
2. **For each open issue**, read its completion criteria and check whether the work has been done:
   - Check if the relevant files/features exist in the codebase
   - Check git log for commits that address the issue
   - Use your knowledge of what was implemented in recent sessions
3. **Close issues that are complete** — For each issue whose completion criteria are met, close it with a comment summarizing what was done: `gh issue close <number> --comment "Completed: <summary>"`.
4. **Report** — List which issues were closed and which remain open.

## Output

After both steps, summarize:
- What was updated in brain.md (if anything)
- Which issues were closed (if any)
- Any issues that are close to done but not yet complete
