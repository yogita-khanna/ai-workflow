---
trigger: "Finalize a feature branch, run standards check, and open a PR."
---

# Skill: finishing-a-branch

## Overview
Prepares the feature branch for integration, running linters, tests, and formatting a strict Pull Request template.

## Phase 9: PR & CI Flow

1. **Local Standards Check:** Run `npx turbo run lint test build` from root. Ensure Turborepo completes with 0 errors.
2. **Open PR:** Open the pull request using `gh pr create` or the repository interface.
3. **Write PR Description:** Detailed explanation compiled from the spec, design, and self-review notes.

*Required PR Body Structure:*
```markdown
## Spec Link
Resolves: [Link to spec in docs/context/specs/]

## What Changed
[Brief summary of implementation]

## Verification & Test Results
- [ ] All .sql migrations include UP and DOWN scripts and were rollback tested.
- [ ] Jest unit/integration tests run and passed (attach output).
- [ ] Next.js components compiled successfully.

## Security & Performance Verification
- [ ] Checked for SQL injection (parameterized queries used).
- [ ] No N+1 queries introduced.
- [ ] Authentication Guards applied to new routes.
```

4. **CI Validation:** Ensure full CI checks (test suite, linting, build, security scan) compile successfully.

## ✅ HUMAN CHECKPOINT #4 — Merge Approval
Whoever owns the branch (tech lead / release manager) merges. This is a hard checkpoint. Merge = production commitment (triggers deploy, changelog, etc.) and requires explicit human approval. The agent **MUST NEVER** attempt to merge the PR.
