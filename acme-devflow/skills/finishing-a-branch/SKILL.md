---
trigger: "Finalize a feature branch, run standards check, and open a PR."
---

# Skill: finishing-a-branch

## Overview
Prepares a branch for review by running linters, tests, and formatting a strict Pull Request template.

## Step-by-Step Guidance
1. **Standards Check**: Run `pnpm turbo run lint test build` from the workspace root. Ensure Turborepo completes with 0 errors.
2. **Review Migrations**: Verify all pure `.sql` migrations via `node-pg-migrate` have matching DOWN migrations.
3. **Commit**: Ensure clean, descriptive commit messages.
4. **Open PR**: Use the `gh pr create` command or equivalent.
5. **Fill Template**: Use the standard PR template below.

## Worked Example
```bash
$ pnpm turbo run lint test build
# Ensure 100% success

$ gh pr create --title "feat(auth): implement RBAC and JWT auth" --body-file .github/pull_request_template.md
```

*Required PR Body Structure:*
```markdown
## Spec Link
Resolves: [Link to spec/design.md]

## Checklist
- [x] All `.sql` migrations include valid UP and DOWN scripts.
- [x] Jest unit tests added and passing.
- [x] Integration tests passing against real Postgres instance.
- [x] Next.js pages do not leak server-side data to the client.
- [x] No direct `process.env` references outside of configuration modules.
```

## Common Mistakes to Avoid
- **Pushing broken builds**: Never open a PR if `turbo run build` fails in either the Next.js or NestJS apps.
