-- Add notes and liked columns to training_sessions
alter table public.training_sessions 
  add column notes text,
  add column liked boolean DEFAULT false not null;
