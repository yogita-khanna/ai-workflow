# `acme-devflow` Security & Guardrails

Security is a primary concern for the `acme-devflow` pipeline. This document details the defense-in-depth strategies implemented to ensure agents operate safely.

## Secrets and Credential Handling

- **No Hardcoded Tokens:** All credentials (Anthropic API keys, GitHub Tokens, Jira tokens, Slack Webhooks) are injected via environment variables (`.env`) or a secrets manager. They are **never** committed to the repository.
- **Log Sanitization:** The orchestrator strips bearer tokens from any standard output before logging to prevent accidental leakage in CI systems or terminal outputs.

## Platform-Level Enforcement

We do not rely solely on the application code behaving correctly (e.g., an agent following the instruction "never merge your own PR"). We use GitHub's platform-level settings as a hard backstop:

1. **Scoped Tokens:** The GitHub Personal Access Token (PAT) or GitHub App token granted to the orchestrator must be strictly scoped. It must **not** have push or merge permissions to `main` or `production` branches.
2. **Branch Protection:**
   - Both `main` and `dev` must have branch protection rules enabled.
   - **Require a pull request before merging.**
   - **Require approvals:** At least 1 human reviewer must approve the PR.
   - **Restrict who can push to matching branches:** The agent's identity must not be in the allowed-pushers or allowed-mergers list.
3. See `scripts/setup-branch-protection.sh` for the automated setup of these rules.

## Audit Trails

Human decisions are the core constraint of this pipeline. Every manual intervention is logged permanently.

- The `audit_logs` table in the SQLite database tracks:
  - Who made the decision (user handle).
  - When the decision occurred (timestamp).
  - Which ticket it applied to.
  - What the action was (e.g., `human_approved_classification`, `human_merged_pr`).

## Cost Guardrails

AI model usage can spiral if left unchecked during TDD retry loops.

- **Per-Ticket Budget:** Configurable maximum spend per ticket (e.g., $10).
- **Daily Spend Limit:** Global orchestrator budget limit.
- If limits are breached, the orchestrator immediately halts agent execution and escalates the ticket to `needs_human`.
