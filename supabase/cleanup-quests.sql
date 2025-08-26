-- Clean up duplicate and old quests, keep only working ones
-- Run this to clean the quest_definitions table

-- First, let's see what we have
SELECT id, type, title, category, sort_order, created_at 
FROM quest_definitions 
ORDER BY type, category, sort_order;

-- Delete old/duplicate social quests, keep only the latest ones
DELETE FROM quest_definitions 
WHERE id IN (
  'dbd13ddf-0086-456d-b378-94870dd4bf47', -- Old twitter_link
  '5a15e002-7aba-45ad-8594-15a2a298e344', -- Old twitter_follow  
  '8b3c0a73-676f-4b57-8926-c22ef77b5d7e'  -- Old discord_join
);

-- Delete web3 quests for now (we'll implement these later)
DELETE FROM quest_definitions 
WHERE type = 'web3';

-- Update remaining quest sort orders to be clean
UPDATE quest_definitions SET sort_order = 1 WHERE type = 'daily' AND category = 'checkin';
UPDATE quest_definitions SET sort_order = 10 WHERE type = 'social' AND category = 'twitter_link';
UPDATE quest_definitions SET sort_order = 11 WHERE type = 'social' AND category = 'twitter_follow';
UPDATE quest_definitions SET sort_order = 12 WHERE type = 'social' AND category = 'discord_link';
UPDATE quest_definitions SET sort_order = 13 WHERE type = 'social' AND category = 'discord_member';

-- Verify final state
SELECT id, type, title, category, sort_order, is_active 
FROM quest_definitions 
WHERE is_active = true
ORDER BY type, sort_order;
