# Sprint 0 — Snap Dismiss

This document is a living reference. It is updated only when assumptions, scope, or delivery model materially change.

**Domain glossary:** [`CONTEXT.md`](../../CONTEXT.md)  
**ADRs:** [`docs/adr/0001-supabase-prototype-backend.md`](../adr/0001-supabase-prototype-backend.md), [`0002-generate-packet-after-payment.md`](../adr/0002-generate-packet-after-payment.md), [`0003-anonymous-draft-token-claim.md`](../adr/0003-anonymous-draft-token-claim.md)

---

## 1. Project Snapshot

| Field                         | Value                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------- |
| Project Name                  | Snap Dismiss                                                                 |
| Client / Stakeholder          | Yuri                                                                         |
| Engagement Model              | Fixed Scope                                                                  |
| PM Owner                      | Karishma Zaheer                                                              |
| Tech Lead                     | Adnan Hussain                                                                |
| Kickoff Date                  | 27th Feb 2026                                                                |
| Delivery shape (this rebuild) | AI-first end-to-end prototype on Supabase (not SnapLegal production backend) |

---

## 2. Problem Statement

Snap Dismiss is an online tool that helps California drivers fight traffic tickets without going to court.

The system uses AI to generate a completed TR-205 Trial by Written Declaration defense **Packet** in PDF format. After payment and Account unlock, drivers download the Packet, print it, wet-sign it, and mail it to the court themselves. An optional **Mail-It** add-on mails a physical copy of the Packet **to the driver** (not court filing).

The platform includes a driver dashboard to track **Cases** and an Admin panel to manage Cases, edit fields, regenerate Packets, and mark Mail-It fulfilled.

Snap Dismiss is not a law firm and does not guarantee dismissal. It provides a structured way for drivers to prepare ticket defense paperwork.

**Brand:** Snap Dismiss is a separate product/brand from SnapLegal. Production architecture may share SnapLegal services; **this prototype does not depend on SnapLegal’s implementation** — see ADR 0001.

---

## 3. Domain Model (canonical)

See `CONTEXT.md` for full glossary. Short form:

| Term                      | Meaning                                                                 |
| ------------------------- | ----------------------------------------------------------------------- |
| **Case**                  | Root aggregate the driver builds and pays for                           |
| **Citation**              | Ticket facts + citation/courtesy-notice uploads (not its own lifecycle) |
| **Questionnaire Answers** | Guided “what happened” inputs (one set per Case)                        |
| **Evidence**              | Optional files; **embedded** in the Packet                              |
| **Declaration**           | AI-generated statement; no driver edit or in-app preview                |
| **Packet**                | Generated PDF artifact (versioned in storage; UI = latest download)     |
| **Case Status**           | `Draft` / `Generated` / `Completed` only                                |
| **Payment State**         | Separate from status (Stripe base ± Mail-It)                            |
| **Mail-It Fulfillment**   | Separate from status (Admin marks mailed)                               |

---

## 4. Target Users / Personas

- **Driver (Account)** — app role `MEMBER`; may own many Cases
- **Admin** — app role `ADMIN`; seeded only (no public Admin signup)

---

## 5. Goals & Success Criteria

### Business Goals

- Generate revenue through paid TR-205 Packet generation.
- Position Snap Dismiss as a scalable product.
- Reduce manual intervention via AI-driven Declaration drafting.

### Delivery Success Looks Like

- Clean TR-205 generation (after payment)
- Working anonymous → pay → claim → download funnel
- Stripe Checkout + webhooks (test mode acceptable)
- Admin: view / edit / regenerate / mark Mail-It mailed

---

## 6. Scope Definition

### In Scope

| Item                    | Description                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Landing Page + CTA      | Engaging page; CTA “Start Now”.                                                                                                                                          |
| Citation Upload         | JPG/PNG/PDF citation (+ optional courtesy notice) stored as **attachments**; **no OCR/AI prefill** in prototype.                                                         |
| Case Details Form       | Manual entry: name, address, CA county dropdown, court name (free text), citation number, violation code, due date, bail (optional unknown). One violation per Citation. |
| Guided Questionnaire    | Seven guided questions → Questionnaire Answers.                                                                                                                          |
| Evidence Upload         | JPG/PNG/PDF; included as embedded exhibits in the Packet.                                                                                                                |
| Eligibility Gate        | Hard gate: CA ticket, deadline, exclusion checklist, disclaimer assent.                                                                                                  |
| Payment (Stripe)        | Two Prices: base **$49** + optional Mail-It **+$30**. Pay before generation.                                                                                             |
| Mail-It Add-on          | Charge + capture mailing address; Admin fulfills manually (no print vendor).                                                                                             |
| Packet Generation       | After payment webhook: TR-205 + Declaration + exhibits + instructions; auto-retry then Admin.                                                                            |
| Account Unlock          | Account required to download; claim via Draft Token + Stripe email match.                                                                                                |
| Driver Dashboard        | List Cases; status; download latest Packet.                                                                                                                              |
| Admin Panel             | View Cases/uploads; edit fields; regenerate Packet; mark Mail-It mailed.                                                                                                 |
| AI Declaration          | Generated from Questionnaire Answers; deterministic TR-205 field fill from Case Details.                                                                                 |
| UI/Branding             | Snap Dismiss naming + traffic visuals; SnapLegal palette/typography/layout reference (Figma).                                                                            |
| Legal Disclaimers       | Footer always; assent checkbox at Eligibility **and** Checkout.                                                                                                          |
| Notifications (persist) | Domain Notification rows in Supabase; **no real email send** in prototype.                                                                                               |
| Funnel Events           | First-party step/checkout analytics; no ads pixels unless Yuri requires.                                                                                                 |
| Wet Signature           | Print and sign by hand; no e-sign.                                                                                                                                       |

### Explicitly Out of Scope

**Phase 2 / later**

- Attorney review
- Court integrations / online filing
- Spanish version
- OCR / AI Case Details prefill
- In-app e-sign
- Real email delivery (Notification rows only for now)
- Print/postage vendor for Mail-It
- Self-serve refunds
- Multi-violation Citation
- Ads / marketing pixels (unless explicitly required)
- Driver edit of Declaration or post-pay Case fields

---

## 7. User Flows and Journey

### Happy path (ordered)

1. Landing → Start Now (anonymous **Draft Token** created; 30-day TTL while unpaid)
2. Upload Citation attachments (optional courtesy notice)
3. Case Details (manual) → Questionnaire → Evidence
4. Eligibility (CA + deadline + exclusions + disclaimer assent)
5. Checkout: $49 ± Mail-It (+$30); Mail-It collects mailing address if guest; disclaimer re-assent; Stripe Checkout
6. Webhook confirms payment → Packet generation (retry then Admin path on failure)
7. Signup/login → claim Case (Draft Token + email must match Stripe receipt) → download unlock
8. Case Status → `Generated`; first download → `Completed` (Mail-It may still be pending)
9. Driver prints, wet-signs, mails to court (base product). If Mail-It purchased, Admin mails physical Packet to driver separately.

### Dashboard

- Many Cases per Account
- Status: `Draft` (unpaid) · `Generated` (paid + Packet exists) · `Completed` (downloaded; Mail-It fulfillment tracked separately)
- Download = latest Packet only

### Guided questions

1. Where were you driving (city/street)?
2. What did the officer claim?
3. What happened from your perspective?
4. Why do you believe the ticket is incorrect?
5. What were the road/traffic conditions?
6. Did you say anything to the officer?
7. Any additional facts you want the judge to know?

### Packet contents

- Pre-filled TR-205 (bail blank if unknown; instructions tell driver to confirm with court)
- AI Declaration (+ continuation pages if needed)
- Exhibit list + **embedded** evidence
- Instructions page (print, wet-sign, mail to court; court fees separate)
- Template: [courts.ca.gov TR-205 PDF](https://courts.ca.gov/sites/default/files/courts/default/2024-11/tr205.pdf)
- Unsupported → “Not supported yet” (no Stripe, no Packet)

### Payment

- Stripe Checkout + webhooks (real test mode)
- Base **$49**; Mail-It **+$30** as second Price / line item
- Court payment is separate and paid to the court

### Notifications (persisted events only)

| Event                      | Description                       |
| -------------------------- | --------------------------------- |
| Packet Generated           | Packet ready (email wiring later) |
| Payment Confirmed          | Payment success                   |
| Draft Incomplete           | Abandoned unpaid draft            |
| Court Deadline Approaching | Due date known and approaching    |
| Case Ready to Mail         | Packet ready / Mail-It queue cue  |

Priority (when delivery is wired later): deadline → packet ready → payment confirmed → draft incomplete.

### Admin workflow

- View all Cases and uploads
- Edit Case fields (post-pay support path)
- Regenerate Packet (storage may keep prior versions; UI still serves latest)
- Mark Mail-It fulfilled

### Disclaimers

Footer on every page:

- “Not a law firm.”
- “No guarantee of dismissal.”
- “User is responsible for filing and court fees.”

Plus explicit assent at Eligibility and Checkout.

---

## 8. Requirements Maturity

| Field              | Value                                                          |
| ------------------ | -------------------------------------------------------------- |
| Requirement Source | Client Calls; BA to PM Document; grill session 2026-09         |
| Clarity            | Very Clear (prototype decisions locked in `CONTEXT.md` + ADRs) |

### Closed decisions (were open questions)

| Topic                    | Decision                                                       |
| ------------------------ | -------------------------------------------------------------- |
| Backend for this rebuild | Supabase end-to-end; no SnapLegal dependency (ADR 0001)        |
| Analytics                | First-party Funnel Events only                                 |
| Auth timing              | Anonymous funnel; Account + payment unlock download (ADR 0003) |
| Packet timing            | Generate only after payment confirmed (ADR 0002)               |
| Admin                    | Seeded `ADMIN` role in same app                                |
| Notifications            | Persist rows; defer real email                                 |

---

## 9. Commercial Model Alignment

| Field                 | Value                                                         |
| --------------------- | ------------------------------------------------------------- |
| Model                 | Fixed Scope                                                   |
| Baseline Scope Locked | Yes (this document + `CONTEXT.md`)                            |
| Change Handling       | Change Request required; impact on cost & timeline documented |

---

## 10. Timeline & Milestones

| Milestone                                                           | Expected Outcome                            | Target Window |
| ------------------------------------------------------------------- | ------------------------------------------- | ------------- |
| UI/UX Designs                                                       | Landing Page + CTA                          | 1–2 weeks     |
| Case funnel (upload, details, questionnaire, evidence, eligibility) | Anonymous Draft Case collection             | 2 weeks       |
| Payment / Packet generation / Account claim / Dashboard             | Stripe; generate-after-pay; download unlock | 2 weeks       |
| Admin + Mail-It fulfillment flags                                   | Edit/regenerate/mark mailed                 | 1 week        |

---

## 11. Team & Ownership

| Role      | Name            | Allocation |
| --------- | --------------- | ---------- |
| PM        | Karishma Zaheer | 100%       |
| Tech Lead | Adnan Hussain   | 100%       |
| Dev(s)    | TBD             | 50–100%    |
| QA        | TBD             | 50–100%    |

---

## 12. Key Assumptions

- TR-205 form structure remains stable statewide.
- Courts accept AI-generated typed declarations with wet signature.
- Most target cases qualify as simple infractions.
- Base product: drivers mail Packets to the court themselves.
- Mail-It is driver convenience mailing, not court filing.
- AI can consistently generate legally appropriate Declarations.
- Supabase + Stripe test mode are sufficient for prototype DoD.

---

## 13. Risks & Mitigation

| Risk                                   | Impact                | Mitigation                         |
| -------------------------------------- | --------------------- | ---------------------------------- |
| Incorrect TR-205 population            | Court rejection       | Field validation + QA cases        |
| Unsupported Cases attempt usage        | Misuse / bad outcomes | Hard eligibility gate before pay   |
| Payment OK, generation fails           | Stranded paid driver  | Auto-retry then Admin path         |
| Anonymous Draft abuse / storage growth | Cost                  | 30-day unpaid Draft TTL            |
| Cross-account Case claim               | Theft of paid Packet  | Draft Token + Stripe email match   |
| Data security breach                   | Legal & reputational  | Secure storage + seeded Admin only |

---

## 14. Dependencies

- **Client-side:** Timely feedback; Figma / SnapLegal design reference; disclaimer legal review.
- **Third-party:** Stripe; AI Declaration provider; Supabase (Auth, DB, Storage).
- **Internal:** TR-205 template configuration; CA county list.

### Technical Stack (this prototype)

- **Frontend:** This React Agent-First Kit (Snap Dismiss funnel + dashboards).
- **Backend:** Supabase (replaces SnapLegal backend for the experiment).
- **Payment:** Stripe Checkout + webhooks.
- **Document generation:** TR-205 template fill + AI Declaration + embedded exhibits.

---

## 15. Communication & Governance

| Field                  | Value                                                   |
| ---------------------- | ------------------------------------------------------- |
| Primary Client Contact | Yuri (`yuri@hq4ads.com`)                                |
| Decision Makers        | Yuri, Karishma, Adnan, Rohail                           |
| Meeting Cadence        | Weekly status calls (9pm–4am PST / 10:30am–11:30am PST) |
| Escalation Path        | Client → PM → Tech Lead/BA → Escalation Steps           |
| Team Working Hours     | 9pm–4am PST / 10:30am–11:30am PST                       |

---

## 16. Reporting & Transparency

Sprint reports shared: Clockify reports, daily updates, delivery confidence, weekly progress reports, task tracking based on project plan, bug tracking.

---

## 17. Definition of Done

- Clean TR-205 Packet generation after payment
- Anonymous funnel → Eligibility → Stripe → claim → download
- Mail-It: Price, address capture, Admin “marked mailed”
- Admin: view Cases, edit fields, regenerate Packet
- Stripe Checkout + webhook confirmation
- File uploads stored securely (Supabase Storage)
- PDFs render correctly across browsers
- Generation failure: retry then Admin-visible failure state
- Case Status works (`Draft` / `Generated` / `Completed`) with separate Payment / Mail-It fields
- Notification + Funnel Event rows persisted
- Disclaimers in footer + Eligibility/Checkout assent
- No OCR, no e-sign, no real email send required for DoD

### Compliance

- All disclaimers visible and assented where required
- No legal claims beyond scope

---

## 18. Acceptance & Review Process

| Field                | Value                                           |
| -------------------- | ----------------------------------------------- |
| Demo / Review method | Live meeting or recorded video (if unavailable) |
| Client review window | Within 2 business days after demo call          |

### Feedback classification

- Bug (included)
- Change Request (requires approval)
- New enhancement (requires approval)

### Acceptance rule

- Written confirmation required
- No response within review window = accepted

---

## 19. Final Sprint 0 Sign-off

| Field                      | Value                                                      |
| -------------------------- | ---------------------------------------------------------- |
| PM Confirmation            | Scope, risks, and delivery model are understood            |
| Artifacts by PM            | Project Plan; Kanban board tickets; High-level flow charts |
| Domain lock                | `CONTEXT.md` + ADRs 0001–0003 (grill session confirmed)    |
| Client / Internal Approval | —                                                          |
| Date                       | 27th Feb 2026                                              |
