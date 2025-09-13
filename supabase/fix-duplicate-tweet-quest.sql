-- Fix duplicate tweet quest issue
-- Remove all existing "Share Providence Quest" quests and add a clean one

-- First, delete all existing tweet/share quests
DELETE FROM quest_definitions 
WHERE title ILIKE '%Share Providence Quest%' 
   OR title ILIKE '%Share%Providence%'
   OR category = 'twitter_share';

-- Also clean up any completions for these quests
DELETE FROM user_quest_completions 
WHERE quest_id IN (
  SELECT id FROM quest_definitions 
  WHERE title ILIKE '%Share Providence Quest%' 
     OR title ILIKE '%Share%Providence%'
     OR category = 'twitter_share'
);

-- Now insert a clean, single tweet quest
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
  sort_order
) VALUES (
  'social', 
  'Share Referral Quest', 
  'Share your referral link on Twitter and help others join Providence Quest!', 
  'twitter_share', 
  '{
    "action": "post_tweet", 
    "tweet_template": "Come join me at Providence {referral_url}",
    "tweet_url_required": true,
    "wallet_address_required": true
  }', 
  35, 
  20, 
  'Social Media Champion Badge',
  FALSE, 
  null, 
  5  -- High sort order to appear at the top
);

-- Update other quest sort orders to make room
UPDATE quest_definitions 
SET sort_order = sort_order + 1 
WHERE type = 'social' AND sort_order >= 5 AND category != 'twitter_share';

-- Verify the result
SELECT id, type, title, category, sort_order, is_active 
FROM quest_definitions 
WHERE is_active = true
ORDER BY sort_order;
