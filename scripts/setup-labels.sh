#!/usr/bin/env bash


set -e

REPO="${1:-}"
if [[ -z "$REPO" ]]; then
  echo "Usage: $0 owner/repo" >&2
  exit 1
fi

if ! command -v gh &>/dev/null; then
  echo "Error: GitHub CLI (gh) not found. Install from https://cli.github.com" >&2
  exit 1
fi

create_label() {
  local name="$1"
  local color="$2"
  local desc="$3"
  if gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null; then
    echo "  ✓ Created: $name"
  else
    gh label edit "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null \
      && echo "  ~ Updated: $name" \
      || echo "  ! Skipped: $name (may already exist)"
  fi
}

echo "Setting up Truthbook labels in $REPO ..."

create_label "dsp:assertion"           "e3b341" "Assertion post"
create_label "dsp:challenge"           "bc8cff" "Challenge post"
create_label "dsp:answer"              "3fb950" "Answer post"
create_label "dsp:dispute"             "f85149" "Dispute instance"
create_label "dsp:agreement"           "58a6ff" "Agreement record"
create_label "dsp:offer"               "d29922" "Resolution offer"
create_label "dsp:crickets-conditions" "8b949e" "Crickets negotiation"
create_label "dsp:crickets-event"      "ff7b72" "Crickets expiry event"
create_label "dsp:active"              "238636" "Active dispute/process"
create_label "dsp:resolved"            "484f58" "Resolved dispute"

echo "Done."
