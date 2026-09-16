# Snap Dismiss

California drivers prepare a Trial by Written Declaration (TR-205) defense packet without appearing in court. This context is the product domain for the AI-first rebuild (Supabase-backed prototype), not SnapLegal’s production implementation.

## Language

**Snap Dismiss**:
The product and brand. Separate from SnapLegal; this prototype does not depend on SnapLegal’s backend.
_Avoid_: SnapLegal (as a synonym for this product)

**Case**:
The root aggregate a driver works on and pays for: citation facts, optional evidence, questionnaire answers, packet generations, and payment state. After payment, Case content is locked for the driver; only an Admin may edit and regenerate.
_Avoid_: Ticket (as the lifecycle object), matter, order

**Citation**:
The ticket facts and citation/courtesy-notice uploads belonging to a Case. Input to the Case, not its own lifecycle. Prototype: uploads are attachments only; Case Details are entered manually (no OCR/AI prefill). County is a California dropdown; court name is free text. One violation per Citation in Phase 1.
_Avoid_: Ticket (when meaning the Case), violation record, OCR-required intake, multi-violation Citation

**Questionnaire Answers**:
The driver’s guided answers about what happened; the factual input to declaration generation. One set per Case.

**Evidence**:
Optional supporting files (JPG/PNG/PDF) attached to a Case. Included in the generated Packet as embedded/appended exhibits (one printable bundle), not merely listed.
_Avoid_: Dashboard-only attachments, separate evidence zip as the primary deliverable

**Declaration**:
AI-generated, professional, fact-based statement of facts derived from Questionnaire Answers; inserted into the Packet. Drivers do not edit it or preview it in-app; only an Admin may change Case fields and regenerate. Free of admission of guilt; not attorney work product.
_Avoid_: Argument, brief, legal advice, user-edited statement, in-app declaration preview

**Packet**:
A generated PDF artifact of a Case (TR-205 fields, Declaration, continuation pages if needed, exhibit list, embedded evidence, instructions). Produced only after payment is confirmed; generation auto-retries on failure then falls to Admin. Prior versions may be retained in storage; the product UI exposes a single download of the latest Packet. Signed by the driver with a wet signature after print.
_Avoid_: Document (ambiguous), PDF (as the domain noun), in-app e-sign

**Wet Signature**:
The driver prints the Packet and signs by hand. No in-app e-sign in Phase 1.
_Avoid_: Embedded e-sign

**Case Status**:
Coarse dashboard lifecycle only: `Draft` (exists, not paid), `Generated` (paid and at least one Packet exists), `Completed` (driver downloaded the current Packet, even if Mail-It is still pending). Not a substitute for payment or Mail-It state.
_Avoid_: Paid, Mailed (as Case Status values)

**Payment State**:
Separate from Case Status. Tracks whether the Case has been paid via Stripe: base self-service Price ($49) and optional Mail-It Price (+$30) as distinct line items.
_Avoid_: Folding “paid” into Case Status, ad hoc Checkout amounts without Prices

**Mail-It Add-on**:
Paid Phase 1 add-on: Snap Dismiss mails a physical copy of the generated Packet **to the driver**. Not court filing. Guest flow collects mailing address at selection; Account holders use account address data.
_Avoid_: Online filing, court mailing, attorney review

**Mail-It Fulfillment**:
Separate from Case Status. When Mail-It is purchased: address captured, Case flagged for mailing; an Admin marks it mailed. No print/postage vendor in the prototype.
_Avoid_: Automatic shipping integration (for this prototype)

**Eligibility**:
Hard gate before payment and generation: California ticket, deadline not passed (date-derived when known, else user-attested), none of the unsupported exclusions (DUI, criminal, injury accident, commercial/CDL, missed deadline), plus explicit disclaimer assent (re-confirmed at Checkout).
_Avoid_: Soft warning, post-pay check

**Draft Token**:
Opaque client-held identifier for an anonymous Case before Account claim. Claim requires the token plus Account email matching the Stripe receipt email. Unpaid Drafts expire after 30 days server-side; paid/claimed Cases do not expire via this TTL.
_Avoid_: Session-only Case with no durable id, immortal unpaid anonymous storage

**Account**:
The signed-in identity required to unlock Packet download (with payment). One Account may own many Cases. Funnel may start anonymous; draft links to Account at unlock. Driver role maps to app `MEMBER`.
_Avoid_: User (when meaning the Account), customer profile as the Case

**Admin**:
Operator who can view Cases, uploads, edit Case fields, regenerate Packets, and mark Mail-It fulfilled. Same app as drivers; role-gated shell; seeded accounts only (no public Admin signup).
_Avoid_: Attorney, reviewer (Phase 2), self-serve Admin registration

**Notification**:
A persisted domain event about a Case (payment confirmed, packet ready, draft incomplete, deadline approaching, etc.). Real email delivery is out of prototype scope; rows/events are stored for later wiring.
_Avoid_: Assuming email was sent because a Notification exists

**Funnel Event**:
A first-party analytics record of product progress (step views, eligibility failure, checkout start/success). Not marketing pixels unless explicitly required later.
_Avoid_: Ads pixels as default Phase 1 scope
