begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(2);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);

select results_eq(
  $$
    select id
    from public.exercises
    where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid
  $$,
  $$ values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid) $$,
  'an owner can read their exercise'
);

select is_empty(
  $$
    select id
    from public.exercises
    where id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid
  $$,
  'an owner cannot read another user''s exercise'
);

select * from finish();
rollback;
