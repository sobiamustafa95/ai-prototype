#!/usr/bin/env bash
# Publishes Snap Dismiss Case lifecycle tickets to GitHub Issues.
# Requires: valid `gh auth`, repo checkout with remote Gok-boilerplates/React-Agent-First-Kit
# Usage: from repo root — bash docs/specs/tickets/publish-to-github.sh
set -euo pipefail

ensure_label() {
  local name="$1"
  local color="$2"
  local desc="$3"
  if ! gh label list --json name --jq '.[].name' | grep -qx "$name"; then
    gh label create "$name" --color "$color" --description "$desc" || true
  fi
}

ensure_label "ready-for-agent" "0E8A16" "Fully specified, ready for an AFK agent"
ensure_label "needs-triage" "FBCA04" "Maintainer needs to evaluate this issue"
ensure_label "needs-info" "D93F0B" "Waiting on reporter for more information"
ensure_label "ready-for-human" "1D76DB" "Requires human implementation"
ensure_label "wontfix" "FFFFFF" "Will not be actioned"

create_ticket() {
  local title="$1"
  local body="$2"
  local url
  url=$(gh issue create --title "$title" --label "ready-for-agent" --body "$body")
  # Print "#N" for Blocked-by references; full URL goes to stderr for the human.
  echo "$url" >&2
  echo "#${url##*/}"
}

echo "Creating tickets in dependency order…"

N1=$(create_ticket "Snap Dismiss: Landing + anonymous Draft Case" "$(cat <<'EOF'
## What to build

A driver can open the Snap Dismiss landing page, click Start Now without signing up, and get a server-backed Draft Case keyed by a Draft Token (30-day TTL while unpaid). Footer disclaimers are visible. Case Status is `Draft`.

## Acceptance criteria

- [ ] Landing page with Start Now CTA creates an anonymous Draft Case with Draft Token
- [ ] Unpaid Draft TTL is 30 days; Case Status shows `Draft`
- [ ] Footer disclaimers visible (not a law firm / no guarantee / user files & court fees)
- [ ] Case journey workflow test covers Start Now → Draft exists
- [ ] Uses Supabase for persistence (ADR 0001); glossary terms from CONTEXT.md
- [ ] `pnpm verify` passes

## Blocked by

- None — can start immediately.
EOF
)")
echo "Created $N1"

N2=$(create_ticket "Snap Dismiss: Citation uploads + Case Details" "$(cat <<EOF
## What to build

A driver can upload citation (+ optional courtesy notice) attachments and enter manual Case Details (CA county dropdown, court free text, one violation, bail optional/unknown) on their Draft Case. No OCR.

## Acceptance criteria

- [ ] Citation and optional courtesy notice uploads store as attachments on the Case
- [ ] Manual Case Details persist and reload with the Draft Token
- [ ] County dropdown + court free text; one violation; bail unknown supported
- [ ] Workflow test covers upload + details save/reload
- [ ] \`pnpm verify\` passes

## Blocked by

- $N1
EOF
)")
echo "Created $N2"

N3=$(create_ticket "Snap Dismiss: Questionnaire Answers + Evidence" "$(cat <<EOF
## What to build

A driver can complete the guided questionnaire and optionally upload Evidence on the Draft Case, so Declaration and Packet exhibits have inputs.

## Acceptance criteria

- [ ] Seven guided questions persist as Questionnaire Answers on the Case
- [ ] Optional Evidence (JPG/PNG/PDF) attaches to the Case
- [ ] Workflow test covers questionnaire + evidence save
- [ ] \`pnpm verify\` passes

## Blocked by

- $N2
EOF
)")
echo "Created $N3"

N4=$(create_ticket "Snap Dismiss: Eligibility gate + intake Funnel Events" "$(cat <<EOF
## What to build

Hard Eligibility before Checkout: California ticket, deadline, exclusion checklist, disclaimer assent. Unsupported Cases see “Not supported yet” and cannot pay. Funnel Events record step views and eligibility failure.

## Acceptance criteria

- [ ] Eligibility blocks Stripe when exclusions/deadline/CA fail
- [ ] Disclaimer assent required at Eligibility
- [ ] Funnel Events for step views + eligibility failure
- [ ] Workflow test covers pass and “Not supported yet” paths
- [ ] \`pnpm verify\` passes

## Blocked by

- $N2
- $N3
EOF
)")
echo "Created $N4"

N5=$(create_ticket "Snap Dismiss: Pay → Packet → claim → download" "$(cat <<EOF
## What to build

After Eligibility, driver pays \$49 via Stripe Checkout; webhook sets Payment State; Packet generates only after payment (TR-205 + AI Declaration + embedded Evidence + instructions); Case locks for the driver; Account claim requires Draft Token + Stripe receipt email match; download latest Packet; Status \`Generated\` then \`Completed\` on download. Generation auto-retries then surfaces for Admin. No in-app Declaration preview/edit.

## Acceptance criteria

- [ ] Stripe Checkout (\$49) + webhook updates Payment State
- [ ] Packet created only after payment (ADR 0002); download requires claim (ADR 0003)
- [ ] Claim fails when Account email ≠ Stripe receipt email
- [ ] Post-pay Case locked for driver; Status transitions Draft → Generated → Completed
- [ ] Workflow tests: happy path, claim mismatch, generation failure path
- [ ] \`pnpm verify\` passes

## Blocked by

- $N4
EOF
)")
echo "Created $N5"

N6=$(create_ticket "Snap Dismiss: Mail-It add-on" "$(cat <<EOF
## What to build

Optional Mail-It (+\$30) as a second Stripe Price: physical Packet mailed to the driver (not court). Capture guest mailing address (or Account address); persist Mail-It Fulfillment as pending until marked mailed.

## Acceptance criteria

- [ ] Checkout can include Mail-It Price (+\$30) with base \$49
- [ ] Guest address captured at selection; Account address used when logged in
- [ ] Mail-It Fulfillment tracked separately from Case Status
- [ ] Workflow test covers Mail-It selection + address persistence
- [ ] \`pnpm verify\` passes

## Blocked by

- $N5
EOF
)")
echo "Created $N6"

N7=$(create_ticket "Snap Dismiss: Driver Case dashboard" "$(cat <<EOF
## What to build

A logged-in driver sees all their Cases with Case Status and can re-download the latest Packet.

## Acceptance criteria

- [ ] Dashboard lists multiple Cases for the Account
- [ ] Shows Draft / Generated / Completed appropriately
- [ ] Re-download serves latest Packet only
- [ ] Workflow test covers list + re-download after claim
- [ ] \`pnpm verify\` passes

## Blocked by

- $N5
EOF
)")
echo "Created $N7"

N8=$(create_ticket "Snap Dismiss: Admin Case support" "$(cat <<EOF
## What to build

Seeded Admin (\`ADMIN\` role, no public Admin signup) can list Cases and uploads, edit Case fields after payment, regenerate Packet (storage may keep prior versions; UI serves latest), see failed generation Cases, and mark Mail-It mailed.

## Acceptance criteria

- [ ] Role-gated Admin shell; seeded Admins only
- [ ] View Cases/uploads; edit fields; regenerate Packet; latest download for driver
- [ ] Failed post-pay generation visible for retry/regenerate
- [ ] Admin can mark Mail-It Fulfillment mailed
- [ ] Workflow test covers edit → regenerate and mark mailed
- [ ] \`pnpm verify\` passes

## Blocked by

- $N5
EOF
)")
echo "Created $N8"

N9=$(create_ticket "Snap Dismiss: Notifications + remaining Funnel Events" "$(cat <<EOF
## What to build

Persist Notification rows (payment confirmed, packet ready, draft incomplete, deadline approaching, ready-to-mail cue) and checkout start/success Funnel Events. No real email send in prototype.

## Acceptance criteria

- [ ] Notification rows written for the listed Case events
- [ ] Funnel Events for checkout start/success (intake events already from Eligibility ticket)
- [ ] No email/SMS delivery required for DoD
- [ ] Workflow or service-level coverage that rows are persisted on the events
- [ ] \`pnpm verify\` passes

## Blocked by

- $N5
EOF
)")
echo "Created $N9"

echo
echo "Done. Issues: $N1 $N2 $N3 $N4 $N5 $N6 $N7 $N8 $N9"
