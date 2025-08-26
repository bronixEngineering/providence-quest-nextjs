-- Add Connect Discord Account quest
-- This should be run after the existing social quests

INSERT INTO quest_definitions (
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
) VALUES (
  'social',
  'Connect Discord Account',
  'Link your Discord account to Providence Quest platform',
  'discord_link',
  '{"action": "link_discord", "platform": "discord"}',
  25,
  15,
  'Discord Pioneer Badge',
  FALSE,
  null,
  12,
  TRUE
);

-- Update existing Discord quests sort order to maintain proper ordering
UPDATE quest_definitions 
SET sort_order = 13 
WHERE category = 'discord_member' AND type = 'social';

-- Verify the quest structure
SELECT id, type, title, category, sort_order, xp_reward, token_reward, special_reward
FROM quest_definitions 
WHERE type = 'social' AND category LIKE '%discord%'
ORDER BY sort_order;
