# Supabase backend for the Snap Dismiss prototype

**Status:** Accepted

Snap Dismiss is a separate product/brand from SnapLegal. Production may share SnapLegal services for accounts, payments, and document generation, but **this AI-first rebuild treats Snap Dismiss as an end-to-end prototype on Supabase** (Auth, database, storage) and must not depend on SnapLegal’s existing implementation. Requirements and Figma/design references are reused; the backend is not.

**Considered:** Reuse SnapLegal backend APIs behind a new funnel (closer to production, slower experiment, couples the kit to an external system we don’t control here). **Chosen:** Supabase so the prototype can ship and learn without that dependency. Re-integrating SnapLegal later is an explicit migration, not an assumption of this codebase.
