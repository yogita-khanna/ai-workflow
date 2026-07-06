---
trigger: "Setup and teardown Git worktrees for isolated development in our npm monorepo."
---

# Skill: using-worktrees

## Overview

We use `git worktree` to manage parallel development streams without constantly wiping `node_modules` or losing uncommitted state in our Next.js + NestJS monorepo.

## Step-by-Step Guidance

1. **Create Worktree**: Run `git worktree add ../<repo-name>-<branch-name> -b <branch-name>`.
2. **Navigate**: `cd ../<repo-name>-<branch-name>`
3. **Install Dependencies**: Run `npm install` in the new worktree to link the monorepo packages.
4. **Manage Ports**: If running the Next.js/NestJS apps locally in multiple worktrees simultaneously, ensure `.env.local` is configured to avoid port collisions (e.g., overriding backend port from 3000 to 3001).
5. **Teardown**: Once the branch is merged and deleted, run `git worktree remove ../<repo-name>-<branch-name>`.

## Worked Example

```bash
# We are currently in ~/projects/acme-monorepo
git worktree add ../acme-monorepo-feature-rbac -b feature/rbac-auth
cd ../acme-monorepo-feature-rbac
npm install
```

## Common Mistakes to Avoid

- **Running pnpm instead of npm**: This is a strict `npm workspace` setup. Using pnpm or yarn will break lockfiles and package resolutions.
- **Port Collisions**: Starting `npx turbo run dev` in two worktrees will crash due to Next.js trying to bind port 3000 in both.
- **Committing node_modules**: Never stage or commit `node_modules` directories. Ensure they are added to the `.gitignore` at the workspace root.
