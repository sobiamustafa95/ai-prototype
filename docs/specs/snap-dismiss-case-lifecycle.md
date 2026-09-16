## Problem Statement

California drivers need a way to fight a traffic ticket without going to court. Today they lack a guided, paid self-service path to produce a complete Trial by Written Declaration (TR-205) defense Packet they can print, wet-sign, and mail. Snap Dismiss must deliver that Case lifecycle end-to-end as an AI-first prototype (Supabase-backed, not SnapLegal’s production backend), including payment, download unlock, optional Mail-It to the driver, and Admin support.

## Solution

Drivers start anonymously, build a Case (Citation attachments + manual Case Details, Questionnaire Answers, optional Evidence), pass a hard Eligibility gate with disclaimer assent, pay via Stripe ($49 base, optional +$30 Mail-It), then create/login to an Account to claim the Case and download the latest Packet. The Packet is generated only after payment confirmation and includes the filled TR-205, AI Declaration, embedded evidence, and instructions. Admins can view Cases, edit fields, regenerate Packets, and mark Mail-It fulfilled. Notifications are persisted as domain events (no real email yet); first-party Funnel Events capture progress.

Canonical language: `CONTEXT.md`. Hard decisions: ADRs 0001–0003 and `docs/sprint0/sprint0-snap-dismiss.md`.

## User Stories

1. As a California driver, I want to start from a landing page without signing up, so that I can begin fighting my ticket with low friction.
2. As a driver, I want a clear CTA (“Start Now”), so that I know how to begin the funnel.
3. As a driver, I want my anonymous work saved under a Draft Token, so that I can continue before I create an Account.
4. As a driver, I want unpaid Drafts to expire after 30 days, so that abandoned data does not live forever (and I understand paid Cases are kept).
5. As a driver, I want to upload citation photos/PDFs (and optionally a courtesy notice), so that my Case has the source documents on file.
6. As a driver, I want to enter Case Details manually (no OCR), so that the TR-205 is filled from confirmed facts I control.
7. As a driver, I want California county as a dropdown and court name as free text, so that intake stays simple for the prototype.
8. As a driver, I want to record one violation code per Citation, so that Phase 1 Cases stay unambiguous.
9. As a driver, I want to mark bail unknown, so that I can proceed when bail is not on the citation and get instructions to confirm with the court.
10. As a driver, I want to answer guided “what happened” questions, so that an AI Declaration can be drafted from my facts.
11. As a driver, I want to upload Evidence (JPG/PNG/PDF), so that supporting materials are included in my Packet.
12. As a driver, I want a hard Eligibility confirmation (CA ticket, deadline, exclusion checklist), so that unsupported tickets are stopped before payment.
13. As a driver facing an unsupported ticket (DUI, criminal, injury accident, commercial/CDL, missed deadline), I want a clear “Not supported yet” outcome, so that I am not charged for a Packet I cannot use.
14. As a driver, I want to assent to legal disclaimers at Eligibility, so that I acknowledge Snap Dismiss is not a law firm and offers no guarantee.
15. As a driver, I want footer disclaimers on every page, so that legal limits are always visible.
16. As a driver, I want to choose base self-service ($49) at Checkout, so that I can buy Packet generation and download.
17. As a driver, I want an optional Mail-It add-on (+$30), so that Snap Dismiss mails a physical Packet copy to me (not to the court).
18. As a guest selecting Mail-It, I want to provide a mailing address at add-on selection, so that fulfillment has somewhere to send the Packet.
19. As a logged-in driver selecting Mail-It, I want my Account address used, so that I do not re-enter shipping details unnecessarily.
20. As a driver, I want to re-assent to disclaimers at Checkout, so that assent is recorded before money moves.
21. As a driver, I want Stripe Checkout (test mode acceptable) with webhook confirmation, so that payment state is trustworthy.
22. As a driver, I want the Packet generated only after payment succeeds, so that unpaid PDFs are not created or leaked.
23. As a driver whose generation fails after payment, I want automatic retries and then Admin visibility, so that I am not stranded without a refund-automation dependency.
24. As a driver, I want to create or log into an Account after paying to unlock download, so that my Packet is tied to my identity.
25. As a driver claiming a Case, I want claim to require my Draft Token and an Account email matching the Stripe receipt email, so that someone else cannot steal my paid Case easily.
26. As a driver, I want to download the latest Packet PDF, so that I can print, wet-sign, and mail it to the court.
27. As a driver, I want the Packet to include filled TR-205 fields, AI Declaration (with continuation pages if needed), exhibit list, embedded Evidence, and mailing instructions, so that I have one printable bundle.
28. As a driver, I do not want an in-app Declaration preview or edit UI, so that the Declaration remains Admin-controlled after AI generation.
29. As a driver, I want Case content locked after payment, so that what I paid for does not drift under me without Admin involvement.
30. As a driver, I want Case Status to show Draft / Generated / Completed, so that I can track progress at a glance.
31. As a driver, I want Completed when I have downloaded (even if Mail-It is still pending), so that download progress is not blocked by mailing ops.
32. As a driver, I want Payment State and Mail-It Fulfillment tracked separately from Case Status, so that ops and I are not confused by overloaded statuses.
33. As a driver, I want a dashboard listing all my Cases, so that I can manage multiple tickets over time.
34. As a driver, I want to re-download the latest Packet from the dashboard, so that I can print again if needed.
35. As a driver, I want Funnel Events recorded for step views, eligibility failure, and checkout start/success, so that product progress can be measured without ads pixels.
36. As a driver, I want Notification rows persisted for payment confirmed, packet ready, draft incomplete, and deadline approaching, so that email can be wired later without redesigning events.
37. As a driver, I want wet-signature-only instructions (no e-sign), so that Phase 1 stays aligned with print-and-mail reality.
38. As an Admin, I want to sign in with a seeded Admin Account (no public Admin signup), so that the Admin surface stays controlled.
39. As an Admin, I want a role-gated Admin shell in the same app, so that I can operate without a separate Admin product.
40. As an Admin, I want to view all Cases and uploads, so that I can support drivers.
41. As an Admin, I want to edit Case fields after payment, so that I can fix errors without unlocking driver self-edit.
42. As an Admin, I want to regenerate a Packet after edits, so that the driver gets a corrected latest PDF.
43. As an Admin, I want prior Packet versions retained in storage while the UI serves latest, so that regeneration does not require a history browser in Phase 1.
44. As an Admin, I want to mark Mail-It as mailed, so that fulfillment can be tracked without a print vendor.
45. As an Admin, I want failed post-pay generation Cases visible for retry/regeneration, so that paid drivers can be unblocked.
46. As a product owner, I want Snap Dismiss branding with traffic visuals while reusing SnapLegal palette/typography/layout references, so that the prototype feels on-brand without SnapLegal backend coupling.
47. As a product owner, I want this prototype on Supabase rather than SnapLegal services, so that the experiment can ship independently (ADR 0001).
48. As a compliance reviewer, I want “not a law firm,” “no guarantee,” and “user files and pays court fees” clearly shown and assented, so that scope limits are explicit.
49. As a driver mailing to court myself, I want instructions that court payment is separate, so that I do not confuse Snap Dismiss fees with bail/court fees.
50. As a future operator, I want real email delivery deferred, so that Notification persistence can ship without SES/email scope in the prototype DoD.

## Implementation Decisions

- Build Snap Dismiss as the product context for this kit fork/theme; do not call SnapLegal backend APIs (ADR 0001). Use Supabase for Auth, data, and file storage.
- Domain root is Case. Related concepts: Citation, Questionnaire Answers, Evidence, Declaration, Packet, Eligibility, Draft Token, Account, Payment State, Mail-It Add-on / Fulfillment, Notification, Funnel Event (`CONTEXT.md`).
- Roles: driver Accounts map to `MEMBER`; Admins map to `ADMIN`; seed Admins only; one app with role-gated Admin shell.
- Anonymous funnel creates a server-backed Draft Case keyed by Draft Token (30-day TTL while unpaid). Claim after pay requires Draft Token + Account email === Stripe receipt email (ADR 0003).
- Eligibility is a hard gate before Checkout: CA + deadline (date-derived when known, else attested) + exclusions + disclaimer assent. Failures never reach Stripe or Packet generation.
- Stripe Checkout uses two Prices (base $49, Mail-It +$30). Webhook is the source of truth for Payment State. Packet generation runs only after payment confirmation (ADR 0002); auto-retry then Admin path on failure; no automatic refunds.
- Post-pay Case fields and Declaration are locked for drivers; only Admin may edit and regenerate. Drivers never see Declaration in-app—only inside the PDF.
- Packet contents: filled TR-205, AI Declaration (± continuation), exhibit list, embedded Evidence, instructions. Bail unknown leaves bail blank and relies on instructions. UI download always returns latest Packet; older versions may remain in storage.
- Mail-It: capture address (guest at selection / Account address when logged in); persist fulfillment flag; Admin marks mailed; no print/postage integration.
- Case Status machine: `Draft` (unpaid) → `Generated` (paid + Packet exists) → `Completed` (downloaded). Payment and Mail-It are separate fields.
- Persist Notification events and Funnel Events in Supabase; do not send email or install ads pixels in this scope.
- Frontend follows kit conventions: concern-scoped pages/components/hooks/services, TanStack Query, Zod boundary validation, i18n keys, role routes. Replace example/auth placeholders with Snap Dismiss Case flows as needed; keep quality gate (`pnpm verify`) green.
- Network boundary for the Case journey is the single primary test seam (MSW-backed workflow tests). Stripe and Supabase are behind that boundary via handlers/fakes appropriate to the chosen client shape—not separate deep unit seams for PDF bytes or common primitives.

## Testing Decisions

- Good tests assert external behavior visible to Driver/Admin (status, unlock, download availability, eligibility block, claim failure, Admin regenerate/mail mark)—not internal React state, hook call counts, or PDF binary structure.
- Primary seam: Case journey workflow tests (confirmed)—co-located `*.workflow.test.tsx`, RTL `getByRole` / `userEvent`, `renderWithProviders`, shared MSW handlers (same pattern as the example feature workflows and auth route workflows).
- Sibling workflows on the same seam: (1) driver anonymous → pay → claim → download → status; (2) Admin view/edit/regenerate/mark Mail-It; (3) failure paths (eligibility block, email mismatch on claim, post-pay generation failure surfacing).
- Service/hook tests only where logic is shared and not adequately covered by workflows (e.g. claim rules, status transitions), still through MSW—not mocked Axios internals.
- Do not add Playwright specs per feature; keep the centralized smoke gate. Do not unit-test common UI primitives in isolation.
- Prior art: example feature `*.workflow.test.tsx` siblings; auth/route workflow tests seeding `useAuthStore`; shared `handlers` + `server.use` overrides.

## Out of Scope

- SnapLegal production backend integration
- OCR / AI prefill of Case Details
- Driver edit or in-app preview of Declaration
- Driver post-pay Case edits
- In-app e-sign
- Real email/SMS delivery
- Print/postage vendor automation for Mail-It
- Court filing / court system integrations
- Attorney review
- Spanish / bilingual UI
- Self-serve refunds
- Multi-violation Citation
- Marketing/ads pixels (unless later explicitly required)
- Expanding Playwright beyond the existing smoke gate for this feature

## Further Notes

- Glossary: `CONTEXT.md`
- Sprint lock: `docs/sprint0/sprint0-snap-dismiss.md`
- ADRs: `0001-supabase-prototype-backend`, `0002-generate-packet-after-payment`, `0003-anonymous-draft-token-claim`
- TR-205 template reference: courts.ca.gov TR-205 PDF
- Design: SnapLegal Figma reference for palette/typography/layout; Snap Dismiss naming and traffic visuals
- Pricing rationale ($49 / +$30) is commercial context from Sprint 0; implement as two Stripe Prices
