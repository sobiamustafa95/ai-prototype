/**
 * The one place a new role gets registered. Everything else in the role
 * system (route table + nav in `ProtectedRoutes.tsx`) is keyed off `Role`, so
 * adding a role here is what makes it available to add routes for next — see
 * `src/routes/ProtectedRoutes.tsx`'s module doc for the full "adding a role"
 * checklist.
 *
 * `MEMBER` is lifted from the real backend contract's own example user payload
 * (`"role": "MEMBER"`), not an invented business concept — this boilerplate ships
 * exactly two example roles ("a regular authenticated user" vs "an admin"),
 * both wired to placeholder pages, per AGENTS.md § zero business-domain lock-in.
 */
export enum Role {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}
