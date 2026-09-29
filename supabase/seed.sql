-- ============================================================
-- Amanah — Local development seed (applied by `supabase db reset`)
-- ============================================================
-- Demo organization "Al-Rahma Charity" (/public/al-rahma) with one user per role.
-- All accounts use the password: amanah-dev-password
--   admin@amanah.test      (admin, org owner)
--   collector@amanah.test  (collector)
--   viewer@amanah.test     (viewer)
-- NEVER run this against a production database.
-- ============================================================

-- ─── Users ───────────────────────────────────────────────────────────────────

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
  crypt('amanah-dev-password', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', jsonb_build_object('full_name', u.full_name), now(), now(),
  '', '', '', ''
from (values
  ('a0000000-0000-0000-0000-000000000001'::uuid, 'admin@amanah.test',     'Amina Admin'),
  ('a0000000-0000-0000-0000-000000000002'::uuid, 'collector@amanah.test', 'Khalid Collector'),
  ('a0000000-0000-0000-0000-000000000003'::uuid, 'viewer@amanah.test',    'Vera Viewer')
) as u(id, email, full_name);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text, 'email',
       jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true), now(), now(), now()
from auth.users
where email like '%@amanah.test';

-- ─── Organization & members ──────────────────────────────────────────────────

insert into public.organizations (id, name, slug, owner_id) values
  ('b0000000-0000-0000-0000-000000000001', 'Al-Rahma Charity', 'al-rahma', 'a0000000-0000-0000-0000-000000000001');

insert into public.organization_members (organization_id, user_id, role, status, invited_by) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'admin',     'active', null),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'collector', 'active', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'viewer',    'active', 'a0000000-0000-0000-0000-000000000001');

-- ─── Beneficiaries ───────────────────────────────────────────────────────────

insert into public.beneficiaries
  (id, organization_id, full_name, phone, national_id, gender, city, address, family_size, monthly_income, employment_status, health_conditions, category, status, created_by)
values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Fatima Hassan',  '+20 100 111 2233', '29001011234567', 'female', 'Cairo',      '12 Nile St, Shubra', 5, 1500, 'Unemployed', null,                    'Widows',  'active',   'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Omar Abdullah',  '+20 100 222 3344', '28505051234567', 'male',   'Giza',       '4 Pyramids Rd',      3,  800, 'Day laborer', 'Type 2 diabetes',      'Medical', 'active',   'a0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Maryam Youssef', '+20 100 333 4455', null,             'female', 'Alexandria', null,                 4, null, null,          null,                   'Orphans', 'active',   'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Yusuf Ibrahim',  '+20 100 444 5566', null,             'male',   'Cairo',      null,                 2,  600, 'Retired',     'Needs knee surgery',   'Elderly', 'inactive', 'a0000000-0000-0000-0000-000000000001');

-- ─── Needs ───────────────────────────────────────────────────────────────────

insert into public.beneficiary_needs
  (id, organization_id, beneficiary_id, type, description, estimated_cost, frequency, urgency, status, start_date)
values
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'food',     'Monthly food basket for family of 5', 60,   'monthly',  'medium',   'active',    current_date - 70),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'rent',     'Rent support',                        150,  'monthly',  'high',     'active',    current_date - 40),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'medicine', 'Insulin supply',                      40,   'weekly',   'critical', 'active',    current_date - 30),
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'education','School fees',                         300,  'yearly',   'low',      'active',    current_date - 200),
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', 'surgery',  'Knee replacement',                    2500, 'one_time', 'high',     'paused',    null);

-- ─── Distributions ───────────────────────────────────────────────────────────

insert into public.aid_distributions
  (organization_id, beneficiary_id, need_id, type, amount, notes, distributed_by, distribution_date)
values
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'food_package',      60,  'Delivered by Khalid', 'a0000000-0000-0000-0000-000000000002', current_date - 65),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'food_package',      60,  null,                  'a0000000-0000-0000-0000-000000000002', current_date - 35),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'rent_payment',      150, 'Paid to landlord',    'a0000000-0000-0000-0000-000000000001', current_date - 12),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 'medicine',          40,  null,                  'a0000000-0000-0000-0000-000000000002', current_date - 5),
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 'education_support', 300, 'Fall semester',       'a0000000-0000-0000-0000-000000000001', current_date - 150);

-- ─── Donations ───────────────────────────────────────────────────────────────

insert into public.donations (organization_id, donor_name, is_anonymous, amount, payment_method, notes, donated_at, created_by) values
  ('b0000000-0000-0000-0000-000000000001', 'Ahmed Saleh', false, 1000, 'bank_transfer', 'Monthly pledge', now() - interval '60 days', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000001', null,          true,  250,  'cash',          null,             now() - interval '20 days', 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000001', 'Layla Nasser', false, 400, 'wallet',        null,             now() - interval '3 days',  'a0000000-0000-0000-0000-000000000001');

-- ─── Notes ───────────────────────────────────────────────────────────────────

insert into public.beneficiary_notes (organization_id, beneficiary_id, body, created_by, created_at) values
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Home visit done. Eldest son started work, re-assess income next quarter.', 'a0000000-0000-0000-0000-000000000002', now() - interval '10 days');
