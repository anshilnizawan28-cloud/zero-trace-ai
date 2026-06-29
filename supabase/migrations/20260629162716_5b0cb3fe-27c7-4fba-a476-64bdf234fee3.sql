
-- =========================================================
-- ENUMS
-- =========================================================
create type public.app_role as enum ('owner','admin','auditor','analyst','viewer');
create type public.plan_tier as enum ('free','starter','professional','business','enterprise');
create type public.subscription_status as enum ('trialing','active','past_due','canceled','incomplete','paused');
create type public.invitation_status as enum ('pending','accepted','revoked','expired');

-- =========================================================
-- updated_at helper
-- =========================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

-- =========================================================
-- PROFILES (per user)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  job_title text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles: read own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles: insert own" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles: update own" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- ORGANIZATIONS
-- =========================================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  logo_url text,
  domain text,
  owner_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.organizations to authenticated;
grant all on public.organizations to service_role;
alter table public.organizations enable row level security;
create trigger organizations_touch before update on public.organizations for each row execute function public.touch_updated_at();

-- =========================================================
-- MEMBERSHIPS  (user <-> org with role)
-- =========================================================
create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'analyst',
  suspended boolean not null default false,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);
grant select, insert, update, delete on public.memberships to authenticated;
grant all on public.memberships to service_role;
alter table public.memberships enable row level security;
create index memberships_user_idx on public.memberships(user_id);
create index memberships_org_idx on public.memberships(org_id);

-- =========================================================
-- has_role helpers (security definer, avoid RLS recursion)
-- =========================================================
create or replace function public.is_org_member(_user uuid, _org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.memberships where user_id=_user and org_id=_org and not suspended);
$$;

create or replace function public.has_org_role(_user uuid, _org uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.memberships where user_id=_user and org_id=_org and role=_role and not suspended);
$$;

create or replace function public.has_any_org_role(_user uuid, _org uuid, _roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.memberships where user_id=_user and org_id=_org and role = any(_roles) and not suspended);
$$;

-- Organization policies
create policy "orgs: member read" on public.organizations for select to authenticated using (public.is_org_member(auth.uid(), id));
create policy "orgs: owner write" on public.organizations for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "orgs: owner delete" on public.organizations for delete to authenticated using (owner_id = auth.uid());
create policy "orgs: anyone create" on public.organizations for insert to authenticated with check (owner_id = auth.uid());

-- Membership policies
create policy "memberships: read own org" on public.memberships for select to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "memberships: admin write" on public.memberships for all to authenticated
  using (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]))
  with check (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]));

-- Auto-add owner as member on org create
create or replace function public.add_owner_membership()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.memberships(org_id, user_id, role) values (new.id, new.owner_id, 'owner')
  on conflict do nothing;
  return new;
end $$;
create trigger org_owner_membership after insert on public.organizations
for each row execute function public.add_owner_membership();

-- =========================================================
-- INVITATIONS
-- =========================================================
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role public.app_role not null default 'analyst',
  token text not null unique default encode(gen_random_bytes(24),'hex'),
  status public.invitation_status not null default 'pending',
  invited_by uuid references auth.users(id),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.invitations to authenticated;
grant all on public.invitations to service_role;
alter table public.invitations enable row level security;
create policy "invitations: org admin manage" on public.invitations for all to authenticated
  using (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]))
  with check (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]));

-- =========================================================
-- PLANS (catalog) + SUBSCRIPTIONS
-- =========================================================
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  tier public.plan_tier not null unique,
  name text not null,
  price_inr_monthly integer not null default 0,
  monthly_analyses integer not null default 0,
  max_file_size_mb integer not null default 10,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.plans to anon, authenticated;
grant all on public.plans to service_role;
alter table public.plans enable row level security;
create policy "plans: public read" on public.plans for select to anon, authenticated using (true);

insert into public.plans (tier, name, price_inr_monthly, monthly_analyses, max_file_size_mb, features) values
('free','Free Trial',0,1,10,'["Metadata extraction","Hash generation","Basic OCR","Basic AI report","Watermarked report","Zero Storage"]'::jsonb),
('starter','Starter',999,50,100,'["Full metadata","OCR","AI Report","Tampering Detection","PDF Export","Email Support"]'::jsonb),
('professional','Professional',2999,300,500,'["Document Comparison","Redline Reports","Digital Signature Verification","Certificate Validation","API Access","Batch Uploads","AI Chat"]'::jsonb),
('business','Business',9999,2000,2048,'["10 Users","Team Workspace","RBAC","Audit Logs","SSO","MFA","Webhooks","Advanced Compliance"]'::jsonb),
('enterprise','Enterprise',0,0,0,'["Unlimited Users","Unlimited Analyses (fair use)","Dedicated Infrastructure","Private Cloud","On-Premise","Customer-Managed Keys","SLA","White Label","LDAP / AD","SIEM Integration"]'::jsonb);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status public.subscription_status not null default 'trialing',
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  cancel_at_period_end boolean not null default false,
  external_provider text,
  external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id)
);
grant select, insert, update, delete on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;
create policy "subs: org read" on public.subscriptions for select to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "subs: org admin write" on public.subscriptions for all to authenticated
  using (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]))
  with check (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]));
create trigger subscriptions_touch before update on public.subscriptions for each row execute function public.touch_updated_at();

-- =========================================================
-- INVOICES + PAYMENTS
-- =========================================================
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  number text,
  amount_inr integer not null,
  tax_inr integer not null default 0,
  status text not null default 'open',
  gst_number text,
  pdf_url text,
  issued_at timestamptz not null default now(),
  paid_at timestamptz
);
grant select, insert, update on public.invoices to authenticated;
grant all on public.invoices to service_role;
alter table public.invoices enable row level security;
create policy "invoices: org read" on public.invoices for select to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "invoices: admin write" on public.invoices for all to authenticated
  using (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]))
  with check (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]));

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid references public.invoices(id) on delete set null,
  amount_inr integer not null,
  provider text,
  provider_payment_id text,
  status text not null default 'succeeded',
  created_at timestamptz not null default now()
);
grant select on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "payments: org read" on public.payments for select to authenticated using (public.is_org_member(auth.uid(), org_id));

-- =========================================================
-- USAGE (per-org metering)
-- =========================================================
create table public.usage (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id),
  kind text not null,
  quantity integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.usage to authenticated;
grant all on public.usage to service_role;
alter table public.usage enable row level security;
create policy "usage: org read" on public.usage for select to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "usage: member insert" on public.usage for insert to authenticated with check (public.is_org_member(auth.uid(), org_id));
create index usage_org_created_idx on public.usage(org_id, created_at desc);

-- =========================================================
-- REPORTS (sealed forensic report metadata — NOT the source doc)
-- =========================================================
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  file_name text not null,
  file_size bigint not null,
  mime_type text,
  sha256 text,
  sha512 text,
  md5 text,
  risk_score integer,
  risk_label text,
  tampering_confidence integer,
  has_signatures boolean default false,
  signature_trust_score integer,
  report jsonb not null,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "reports: org read" on public.reports for select to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "reports: member create" on public.reports for insert to authenticated with check (public.is_org_member(auth.uid(), org_id) and user_id = auth.uid());
create policy "reports: admin delete" on public.reports for delete to authenticated using (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]));
create index reports_org_idx on public.reports(org_id, created_at desc);

-- =========================================================
-- API KEYS
-- =========================================================
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  prefix text not null,
  hashed_key text not null,
  scopes text[] not null default array['read']::text[],
  rate_limit_per_min integer not null default 60,
  disabled boolean not null default false,
  last_used_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  rotated_at timestamptz
);
grant select, insert, update, delete on public.api_keys to authenticated;
grant all on public.api_keys to service_role;
alter table public.api_keys enable row level security;
create policy "apikeys: org admin" on public.api_keys for all to authenticated
  using (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]))
  with check (public.has_any_org_role(auth.uid(), org_id, array['owner','admin']::public.app_role[]));

-- =========================================================
-- AUDIT LOGS
-- =========================================================
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  resource text,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "audit: org auditor read" on public.audit_logs for select to authenticated
  using (org_id is null and actor_id = auth.uid()
         or org_id is not null and public.has_any_org_role(auth.uid(), org_id, array['owner','admin','auditor']::public.app_role[]));
create policy "audit: any insert own" on public.audit_logs for insert to authenticated
  with check (actor_id = auth.uid());
create index audit_org_idx on public.audit_logs(org_id, created_at desc);

-- =========================================================
-- MFA SETTINGS  (mirror of user MFA preferences; Supabase Auth owns factors)
-- =========================================================
create table public.mfa_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  totp_enabled boolean not null default false,
  email_otp_enabled boolean not null default false,
  recovery_codes_generated_at timestamptz,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.mfa_settings to authenticated;
grant all on public.mfa_settings to service_role;
alter table public.mfa_settings enable row level security;
create policy "mfa: own" on public.mfa_settings for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create trigger mfa_touch before update on public.mfa_settings for each row execute function public.touch_updated_at();

-- =========================================================
-- USER SESSIONS (display-only — Supabase Auth manages real sessions)
-- =========================================================
create table public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_label text,
  ip text,
  user_agent text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.user_sessions to authenticated;
grant all on public.user_sessions to service_role;
alter table public.user_sessions enable row level security;
create policy "sessions: own" on public.user_sessions for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- =========================================================
-- DIGITAL SIGNATURE TABLES
-- =========================================================
create table public.digital_certificates (
  id uuid primary key default gen_random_uuid(),
  thumbprint_sha256 text not null unique,
  subject text,
  issuer text,
  serial_number text,
  public_key_algorithm text,
  signature_algorithm text,
  valid_from timestamptz,
  valid_until timestamptz,
  raw jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now()
);
grant select, insert on public.digital_certificates to authenticated;
grant all on public.digital_certificates to service_role;
alter table public.digital_certificates enable row level security;
create policy "certs: authenticated read" on public.digital_certificates for select to authenticated using (true);
create policy "certs: authenticated insert" on public.digital_certificates for insert to authenticated with check (true);

create table public.digital_signatures (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  certificate_id uuid references public.digital_certificates(id),
  signer_name text,
  signer_email text,
  signer_org text,
  signing_time timestamptz,
  signature_algorithm text,
  hash_algorithm text,
  document_modified_after_signing boolean,
  trust_chain_status text,
  revocation_status text,
  timestamp_authority text,
  cryptographic_valid boolean,
  trust_score integer,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert, delete on public.digital_signatures to authenticated;
grant all on public.digital_signatures to service_role;
alter table public.digital_signatures enable row level security;
create policy "sigs: org read" on public.digital_signatures for select to authenticated using (public.is_org_member(auth.uid(), org_id));
create policy "sigs: member write" on public.digital_signatures for insert to authenticated with check (public.is_org_member(auth.uid(), org_id));

create table public.trust_chains (
  id uuid primary key default gen_random_uuid(),
  signature_id uuid not null references public.digital_signatures(id) on delete cascade,
  position integer not null,
  subject text,
  issuer text,
  serial_number text,
  thumbprint_sha256 text,
  valid_from timestamptz,
  valid_until timestamptz
);
grant select, insert on public.trust_chains to authenticated;
grant all on public.trust_chains to service_role;
alter table public.trust_chains enable row level security;
create policy "chain: parent visible" on public.trust_chains for select to authenticated
  using (exists(select 1 from public.digital_signatures s where s.id = signature_id and public.is_org_member(auth.uid(), s.org_id)));
create policy "chain: parent insert" on public.trust_chains for insert to authenticated
  with check (exists(select 1 from public.digital_signatures s where s.id = signature_id and public.is_org_member(auth.uid(), s.org_id)));

create table public.certificate_revocation_cache (
  thumbprint_sha256 text primary key,
  status text not null,
  checked_at timestamptz not null default now(),
  source text
);
grant select on public.certificate_revocation_cache to authenticated;
grant all on public.certificate_revocation_cache to service_role;
alter table public.certificate_revocation_cache enable row level security;
create policy "crl: authenticated read" on public.certificate_revocation_cache for select to authenticated using (true);
