# Contributing to `acme-devflow`

We treat `acme-devflow` as an internal open-source project. This means we welcome contributions from any team, but we maintain a high bar for what gets merged into the "core" pipeline versus what should remain a project-specific extension.

## Philosophy: Core vs. Extension

### What belongs in Core?
The core pipeline (`acme-devflow`) is responsible for enforcing the universal truths of our engineering culture:
- Work must be spec-driven.
- Code must have tests (TDD).
- Agents cannot self-merge.
- Production deployments are human-only.

If your proposed change reinforces these universals or makes the baseline pipeline safer/faster for *everyone*, it belongs in Core.

### What belongs in an Extension?
- Custom linting rules for a specific frontend framework.
- Deployment scripts to a unique staging environment.
- Specialized notification formats for a single squad's Slack channel.

## How to Contribute a Skill

If you are adding a new core capability, it must be added as a **Skill**.

1. Create a new folder under `skills/<your-skill-name>`.
2. Write a `SKILL.md`. It **must** contain:
   - A one-sentence trigger description (when the agent should use it).
   - Clear, step-by-step guidance.
   - At least 1 worked example demonstrating the expected input and output.
3. Open a PR to the `dev` branch.
4. Core maintainers will review to ensure the skill doesn't conflict with existing guardrails.

## Testing Your Changes

Before submitting a PR, ensure you have run the orchestrator test suite:
\`\`\`bash
cd orchestrator
npm test
\`\`\`
If you modify the classification logic (`skills/classify-ticket`), you must ensure the automated classification test suite passes (`npm run test:classification`).
