---
description: Commit feature to dev, update brain.md, and close completed tickets
user-invocable: true
allowed-tools: Bash, Read, Write, Edit, Grep, Glob, AskUserQuestion
---

# Finish Feature — Commit, update brain, and close tickets

Run this skill when a feature is complete and verified. It commits changes, updates the project's living documentation, checks for completable tickets, and asks for confirmation before executing.

## Step 1: Gather context

1. **Read `brain.md`** to understand current project state.
2. **Run `git status` and `git diff --stat`** to see all changed files.
3. **Run `git log --oneline -5`** to see recent commit style.
4. **Run `gh issue list --state open --limit 30`** to find open tickets.
5. **Read the plan file** (most recent `.claude/plans/*.md`) if one exists, for feature context.

## Step 2: Determine what to do

Based on the gathered context, determine:

- **Commit message** — Summarize the feature in the project's commit style (`prefix: short description`).
- **brain.md updates** — What tables, component entries, or session log entries need updating.
- **Tickets to close** — Which open GitHub issues have their completion criteria fully met by this work. Read the full issue body (`gh issue view <number>`) for any candidate tickets to verify completion criteria.

## Step 3: Show confirmation dialog

Before making any changes, use `AskUserQuestion` to show a confirmation dialog with a concise summary:

**Format the question as:**

```
Ready to finish this feature:

**Commit:** `<commit message>`
**Files:** <count> files changed
**brain.md:** <1-2 sentence summary of updates>
**Tickets:** Close #X (<title>) / No tickets to close

Proceed?
```

Options: "Looks good" / "Chat" (to adjust)

If the user selects "Chat", incorporate their feedback and show the confirmation again.

## Step 4: Execute

Only after user confirms:

1. **Update brain.md:**
   - Update relevant tables (services, components, etc.) if entries changed.
   - Add a session log entry with: what was done, key decisions, context for next session.
   - Only update sections that are actually stale.

2. **Commit to dev:**
   - Stage all relevant changed files (not untracked files unrelated to the feature).
   - Commit with the agreed message + `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`.
   - Verify the commit succeeded with `git status`.

3. **Close tickets:**
   - For each ticket to close: `gh issue close <number> --comment "Completed: <summary>"`.

4. **Report** — Summarize what was committed, what was updated in brain.md, and which tickets were closed.
