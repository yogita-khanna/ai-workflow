---
trigger: "Fetch and prioritize bugs from Jira for fixing."
---

# Skill: picking-a-jira-bug

## Overview

Integrates with Jira to fetch unassigned or high-priority bugs for the current sprint.

## Step-by-Step Guidance

1. **Identify Project**: Read the Jira project key (e.g., `ACME` or `DEV`).
2. **Execute JQL Query**: Run a query prioritizing High/Critical severity bugs in the 'To Do' state.
   - `project = ACME AND issuetype = Bug AND status = "To Do" ORDER BY priority DESC, created ASC`
3. **Display Format**: Present bugs to the human in the following format for selection:
   - `[Ticket Key] - Title (Priority) - Assigned to: Unassigned`
4. **Assign & Transition**: Once picked, assign the ticket to the current user and transition to 'In Progress'.

## Worked Example

```
Executing JQL: project = ACME AND issuetype = Bug AND status = "To Do" ORDER BY priority DESC
Results:
1. ACME-405 - JWT AuthGuard throws 500 on malformed token (Critical)
2. ACME-399 - N+1 query in products listing (High)
3. ACME-412 - Footer link broken on mobile (Low)

Action: Recommend starting with ACME-405 due to Critical priority.
```

## Common Mistakes to Avoid

- **Ignoring Priority**: Always sort by priority DESC to ensure critical bugs are tackled before low-priority cosmetic issues.
