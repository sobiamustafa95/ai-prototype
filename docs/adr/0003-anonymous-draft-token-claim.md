# Anonymous Draft Token claim

**Status:** Accepted

Drivers may complete the funnel without an Account. Each anonymous Case is keyed by a durable **Draft Token** (client-held, server-validated). After payment, signup/login **claims** the Case only when the Draft Token is presented **and** the Account email matches the Stripe receipt email. Unpaid Drafts expire after **30 days** server-side; paid/claimed Cases are not dropped by that TTL.

**Considered:** Soft-account (magic link) before Checkout; or Stripe email alone as the join key. **Chosen:** token-primary claim plus email match — preserves a frictionless start while reducing cross-account theft of a paid Case if a token leaks or an email is guessed.
