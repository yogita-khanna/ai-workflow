#!/bin/bash
set -e

# setup-branch-protection.sh
# Requires GitHub CLI (gh) to be authenticated with admin privileges.
# Run this script once when bootstrapping the repository.

REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "Applying branch protections to $REPO..."

# Protect 'main' branch
echo "Protecting 'main'..."
gh api -X PUT "repos/$REPO/branches/main/protection" \
  -H "Accept: application/vnd.github.v3+json" \
  -f enforce_admins=true \
  -F required_pull_request_reviews[required_approving_review_count]=1 \
  -F required_pull_request_reviews[dismiss_stale_reviews]=true \
  -F required_pull_request_reviews[require_code_owner_reviews]=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false

# Protect 'dev' branch
echo "Protecting 'dev'..."
gh api -X PUT "repos/$REPO/branches/dev/protection" \
  -H "Accept: application/vnd.github.v3+json" \
  -f enforce_admins=false \
  -F required_pull_request_reviews[required_approving_review_count]=1 \
  -F required_pull_request_reviews[dismiss_stale_reviews]=true \
  -f allow_force_pushes=false \
  -f allow_deletions=false

echo "Branch protection applied."
echo "CRITICAL: Ensure your bot token is scoped so it does not have administrative bypass rights!"
