-- Add Tweet Quest to the unified quest system
-- This quest requires users to post a predefined tweet and submit the tweet link

-- Insert the new tweet quest definition
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
  'Share Providence Quest', 
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

-- Update existing quest sort orders to make room for the tweet quest at the top
UPDATE quest_definitions 
SET sort_order = sort_order + 1 
WHERE type = 'social' AND sort_order >= 5;

-- Ensure the tweet quest is at the very top of social quests
UPDATE quest_definitions 
SET sort_order = 5 
WHERE category = 'twitter_share';

COMMENT ON TABLE quest_definitions IS 'Added tweet sharing quest for social media promotion';
