---
trigger: "Score a ticket's risk, reversibility, and precedent to determine if human approval is needed."
---

# Skill: classify-ticket

## Overview
Every new ticket must be classified before implementation. We use three criteria to determine if a ticket can be automatically implemented (`auto-apply`) or requires human approval (`ask-human`).

## Step-by-Step Guidance
1. **Evaluate Risk**: Does this touch auth, payments, or the core data model? (High Risk = `ask-human`). Is it a UI copy change or non-critical feature? (Low Risk).
2. **Evaluate Reversibility**: Does it involve schema migrations with data? (Low Reversibility = `ask-human`). Is it hidden behind a feature flag? (High Reversibility).
3. **Evaluate Precedent**: Has this repo built something structurally similar before? (No = `ask-human`, Yes = `auto-apply`).
4. **Determine Score**: If ANY of the three criteria flag as `ask-human`, the overall score is `ask-human`.

## Worked Examples

**1. RBAC + Authentication**
- **Risk**: High (touches core security, password hashing, JWTs).
- **Reversibility**: Low (adds 5 core tables `users`, `roles`, etc. to the database).
- **Precedent**: None (first auth implementation).
- **Score**: `ask-human`.

**2. Add new 'About Us' Copy to Footer**
- **Risk**: Low (UI text only).
- **Reversibility**: High (just revert the PR).
- **Precedent**: Yes (standard React component update).
- **Score**: `auto-apply`.

**3. Add caching to User Profile endpoint**
- **Risk**: Medium (caching could leak data if misconfigured).
- **Reversibility**: High (can turn off caching flag).
- **Precedent**: Yes (other endpoints use Redis cache).
- **Score**: `ask-human` (due to data leak risk on a sensitive endpoint).

**4. Add 'deleted_at' soft delete to 'products' table**
- **Risk**: Medium.
- **Reversibility**: Low (DB schema change on a core table with existing data).
- **Precedent**: Yes (other tables have soft deletes).
- **Score**: `ask-human` (due to low reversibility schema migration).

## Common Mistakes to Avoid
- **Underestimating Reversibility**: Any change involving `.sql` migrations via `node-pg-migrate` is automatically low reversibility if it runs on production data. Always score it `ask-human` unless it's explicitly purely additive and isolated.
