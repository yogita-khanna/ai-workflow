# `acme-devflow`

An agentic, spec-driven development pipeline plugin for our organization.

`acme-devflow` forces AI agents to follow a strict workflow: classifying risk, writing specs, executing in isolated worktrees using TDD, and stopping at the PR review stage. Production deployments are explicitly out of scope.

## Installation

Since this is built as a Claude Plugin, you can install it into your local workspace:

\`\`\`bash

# From within your project directory:

/plugin install devflow@acme-marketplace
\`\`\`

_(Under the hood, this links the `.claude-plugin/plugin.json` into your local `.claude` config, exposing the skills and commands to the agent)._

## Usage

Agents loaded with `acme-devflow` will automatically check the `using-devflow` skill before acting.

As a human, you can trigger the pipeline in a chat session by typing:

\`\`\`
/devflow:propose TICKET-123
\`\`\`

The agent will read the ticket, classify it, and either auto-resolve (proceeding to implementation) or propose options for you to decide on.

To manually pick a bug from Jira, use the CLI tool:
\`\`\`bash
npm run bug-picker
\`\`\`

## Documentation

- [Architecture & State Machine](./ARCHITECTURE.md)
- [Security & Guardrails](./SECURITY.md)
- [Contributing](./CONTRIBUTING.md)
