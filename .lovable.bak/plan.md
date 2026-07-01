# Zero Storage Analyzer — V2 Enterprise Plan

This is a very large scope (auth, MFA, SSO, orgs, RBAC, subscriptions, billing, API keys, digital signatures, compliance, audit, security center). I'll deliver it in **focused, shippable phases** rather than one mega-commit — each phase leaves the app in a working, demoable state. Confirm the phase order and I'll start with Phase 1.

## Phase 1 — Foundation: Auth + Cloud + Schema (this turn after approval)
- Enable **Lovable Cloud** (Supabase under the hood).
- Auth: email/password sign-up + sign-in, email verification, forgot/reset password, change password, password strength meter, secure logout, session refresh.
- Social login: **Google + Microsoft** (managed providers). GitHub deferred unless requested.
- `/auth`, `/auth/reset-password`, `/auth/callback` routes (public, SSR-off where needed).
- `_authenticated/` route gate for the app shell.
- Landing page upgrade: nav (Home / Features / Pricing / Enterprise / Security / Docs / Blog / Contact), hero headline + subtitle, trust badges, Sign In / Start Free Trial / Book Demo / Watch Demo CTAs.
- Database schema (single migration):
  - `profiles`, `organizations`, `memberships` (with `app_role`: owner/admin/auditor/analyst/viewer), `invitations`
  - `plans`, `subscriptions`, `invoices`, `payments`, `usage`, `reports`
  - `api_keys`, `audit_logs`, `mfa_settings`, `user_sessions`
  - `digital_certificates`, `digital_signatures`, `trust_chains`, `certificate_revocation_cache`
  - `has_role()` security-definer function, RLS on every table, explicit `GRANT`s.

## Phase 2 — Onboarding + Org + RBAC
- Post-signup wizard: Create Org → Choose Plan → Invite Team → Enable MFA → Upload First Document.
- Org switcher, members page, invite/accept flow, suspend/remove, org settings (logo, name, domains).
- RBAC permission helpers + UI gating across the app.
- Audit log writer + viewer.

## Phase 3 — MFA + Security Center
- TOTP enrollment (Supabase Auth MFA), email OTP, recovery codes, MFA management page.
- Security Center: zero-storage status, TLS, memory-wipe attestation, sessions, trusted devices, access logs.

## Phase 4 — Subscriptions + Billing
- Pricing page (Free Trial / Starter ₹999 / Professional ₹2,999 / Business ₹9,999 / Enterprise).
- Built-in Stripe payments via `enable_stripe_payments` (recommended path). Razorpay is BYOK and adds significant complexity — I'll add it in a follow-up phase if you confirm you need INR-native rails beyond Stripe India.
- Billing dashboard: current plan, usage, credits, invoices, upgrade/downgrade/cancel, coupons, GST invoice fields.
- Usage metering tied to analyses + plan caps.

## Phase 5 — Digital Signature Intelligence
- New `/analyze/signatures` module + dedicated report view.
- PDF signature extraction using `@signpdf/utils` + `node-forge` (pure JS, browser-safe) to parse the PKCS#7 / CMS signature block from signed PDFs: signer cert subject/issuer/serial/thumbprint, key & signature & hash algorithms, signing time, validity window, multiple signatures, "modified after signing" via ByteRange check.
- Trust chain display, signature timeline, certificate tree, trust score, warnings (expiry, revocation when CRL/OCSP responder reachable).
- Required disclosure text shown verbatim on every signature report.
- Downloadable validation report (PDF + JSON).

## Phase 6 — Compliance Dashboard + API Keys + Webhooks
- Compliance dashboard: trust/risk/tampering scores, integrity, signature, encryption, PII detection, ISO 27001 / GDPR / SOC 2 / HIPAA control mappings.
- API key management: generate, rotate, disable, delete, usage, rate limits.
- Webhooks management UI + delivery log.

## Phase 7 — Enterprise polish
- SSO (SAML / OIDC / Azure AD) — Supabase SAML is BYO config; I'll wire the UI + docs and a setup checklist. True LDAP / SCIM / on-prem / air-gapped / CMEK / SIEM are deployment-tier features; I'll add the marketing surfaces + admin stubs and document what requires the Enterprise contract.
- Light mode toggle, animated dashboards, interactive charts, success/loading animations.

## Technical notes (for transparency)
- **Zero Storage preserved**: document bytes still never leave the browser; only reports/metadata/hashes/audit get persisted (and only when the user's plan allows it).
- **Digital signature parsing runs client-side** for the same reason — uses `pdfjs-dist` + `node-forge` in the browser. CRL/OCSP lookups go through a server function (no document content sent, just the certificate).
- **Payments**: built-in Stripe (`enable_stripe_payments`) is the recommended path. I'll skip BYOK Stripe and Razorpay unless you confirm.
- **Things that require infra I can't provision from code**: true on-prem / air-gapped binaries, customer-managed KMS, LDAP bind, SIEM forwarders, SCIM endpoints from Azure AD. I'll build the UI + admin config surfaces and clearly mark them as "Enterprise contract required" rather than fake them.

## Open questions before I start
1. **Payments**: confirm **Stripe (built-in)** is fine, or do you specifically need **Razorpay** (BYOK, you provide keys)?
2. **User profiles**: store display name / avatar / job title on `profiles`? (Recommended: yes.)
3. **Phase order above OK?** Or do you want Digital Signatures (Phase 5) pulled forward right after Phase 1?

Reply with answers (or "go" to accept defaults: Stripe built-in, profiles yes, phase order as listed) and I'll start Phase 1.