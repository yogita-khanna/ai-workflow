# Spec-Framework Commands

This directory contains the implementations for the `acme-devflow` commands.

## IMPORTANT: Agent-Invocable Commands

These are **NOT** meant to be run as CLI scripts by a human (e.g., `node propose.js`). 

Instead, these commands are exposed as **agent-invocable slash commands** (via the `.claude-plugin/plugin.json` registration). When a user types `/devflow:propose TICKET-123` in a chat session, the agent itself invokes this logic as part of its internal workflow.

The primary interface is the agent recognizing that a ticket needs a proposal, and triggering this command *from within its session context* to generate the required artifacts and state changes.

## Available Commands

- **`/devflow:propose <ticket-id>`**: Runs classification. If auto-resolve, sets up the spec folder. If ask-human, generates tradeoffs and halts for human input.
- **`/devflow:apply <ticket-id>`**: Transitions the ticket from proposed to implementation. Triggers the worktree creation and TDD loop.
- **`/devflow:archive <ticket-id>`**: Post-merge cleanup. Merges the delta-spec into the permanent `specs/` record and archives the change folder.
- **`/devflow:explore <idea>`**: (Optional) A sandbox command for discussing fuzzy ideas before committing to a formal proposal. No state artifacts are generated.
