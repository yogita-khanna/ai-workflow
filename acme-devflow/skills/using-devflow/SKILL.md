---
trigger: "Initiate the DevFlow agent loop and route to the correct workflow skill."
---

# Skill: using-devflow

## AGENT DIRECTIVE: TOKEN & CONTEXT OPTIMIZATION (CRITICAL)
To minimize API token usage and prevent reading the entire project iteratively:
1. **Never use generic search commands** across the entire workspace (`ls -R`, `find .`, or viewing massive `package-lock.json` files). 
2. **Restrict your context window**: When you are assigned a ticket, only view the specific directories and files relevant to that domain (e.g., if working on Auth, only read `src/modules/auth`).
3. **Rely on `design.md`**: Do not re-explore the architecture. Read the `design.md` for the current ticket and execute strictly against it.

## Overview
This skill acts as the entry point and orchestrator for the AI DevFlow plugin. It helps the agent orient itself in our pnpm workspace and select the next correct skill to execute.

## Step-by-Step Guidance
1. **Identify the Trigger Context**: Did the user ask to start a new ticket, fix a bug, review code, or write a spec?
2. **Execute the Decision Tree**:
   - IF starting a new feature/ticket -> Load `classify-ticket` and `writing-a-spec`.
   - IF a Jira bug is requested -> Load `picking-a-jira-bug`.
   - IF setting up a local branch -> Load `using-worktrees`.
   - IF writing code for an approved spec -> Load `tdd-loop`.
   - IF development is done and tests pass -> Load `finishing-a-branch`.
   - IF asked to review a PR -> Load `reviewing-a-pr`.
3. **Transition to the chosen skill**: Read the corresponding `SKILL.md` and execute its instructions.
