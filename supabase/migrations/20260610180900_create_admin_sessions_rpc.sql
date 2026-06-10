-- Create RPC function to fetch latest training sessions across all users
create or replace function public.get_admin_sessions()
returns table (
  id uuid,
  completed_at timestamp with time zone,
  exercises jsonb,
  notes text,
  liked boolean,
  user_id uuid,
  display_name text,
  full_name text,
  avatar_url text
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    t.id,
    t.completed_at,
    t.exercises,
    t.notes,
    t.liked,
    t.user_id,
    p.display_name,
    p.full_name,
    p.avatar_url
  from public.training_sessions t
  left join public.profiles p on t.user_id = p.id
  order by t.completed_at desc;
end;
$$;
