-- Daily Link Quest seed for 2025-09-25
-- Run this in Supabase SQL editor or psql connected to your DB

insert into public.quest_definitions (
  type,
  title,
  description,
  category,
  requirements,
  xp_reward,
  token_reward,
  special_reward,
  is_repeatable,
  repeat_interval,
  sort_order,
  is_active
) values (
  'daily',
  'Check today''s announcement',
  'Open the link to view today''s feature and claim your reward.',
  'daily_link',
  jsonb_build_object(
    'url', 'https://providence.quest',
    'available_on', '2025-09-25'
  ),
  25,  -- XP
  5,   -- Tokens
  null,
  false,
  null,
  10,
  true
)
returning id;