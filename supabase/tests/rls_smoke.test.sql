begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(2);

-- Own our fixtures inside the rolled-back transaction so this suite also runs
-- against a local stack that has already been used for development.
insert into auth.users (id, raw_user_meta_data) values
  ('33333333-3333-4333-8333-333333333333', '{}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', '{}'::jsonb);
insert into public.exercises (id, user_id, name, type) values
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 'Policy owner', 'exercise'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '44444444-4444-4444-8444-444444444444', 'Policy other', 'exercise');

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}',
  true
);

select results_eq(
  $$
    select id
    from public.exercises
    where id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid
  $$,
  $$ values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc'::uuid) $$,
  'an owner can read their exercise'
);

select is_empty(
  $$
    select id
    from public.exercises
    where id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::uuid
  $$,
  'an owner cannot read another user''s exercise'
);

select * from finish();
rollback;
