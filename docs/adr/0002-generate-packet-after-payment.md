# Generate Packet only after payment

**Status:** Accepted

A Case’s Packet (TR-205 PDF + Declaration + embedded evidence + instructions) is **created only after Stripe payment is confirmed** (webhook). Download still also requires Account claim. This avoids unpaid PDFs, “Generated but unpaid” dashboard confusion, and leaked artifacts.

**Considered:** Generate after Eligibility and paywall the download (faster perceived “magic,” but orphans files and complicates status). **Chosen:** pay-then-generate; on generation failure after a successful payment, auto-retry then surface to Admin — refunds stay a manual support policy, not automatic prototype behavior.
