-- Remove Twitter follow quest
DELETE FROM quest_definitions 
WHERE category = 'twitter_follow';

-- Also remove any completed Twitter follow quests
DELETE FROM user_quest_completions 
WHERE quest_id IN (
  SELECT id FROM quest_definitions WHERE category = 'twitter_follow'
);
