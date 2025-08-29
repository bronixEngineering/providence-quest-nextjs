-- Add Epic Games quest to quest_definitions
INSERT INTO public.quest_definitions (
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
  requires_quest_id,
  sort_order,
  is_active
) VALUES (
  'social',
  'Connect Epic Games Account',
  'Link your Epic Games account to Providence Quest',
  'epic_link',
  '{"action": "link_epic", "platform": "epic"}',
  30,
  20,
  'Epic Games Trailblazer Badge',
  false,
  null,
  null,
  15,
  true
);

-- Verify the insertion
SELECT 
  id,
  type,
  title,
  description,
  category,
  xp_reward,
  token_reward,
  special_reward,
  is_active
FROM public.quest_definitions 
WHERE category = 'epic_link';
