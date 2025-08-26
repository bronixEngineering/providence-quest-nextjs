-- Sample Social Quest Definitions
-- Run this after the unified quest system

INSERT INTO quest_definitions (type, title, description, category, requirements, xp_reward, token_reward, special_reward, is_repeatable, repeat_interval, sort_order) VALUES

-- Twitter Quests
('social', 'Connect Twitter Account', 'Link your Twitter account to Providence Quest', 'twitter_link', 
 '{"action": "link_twitter", "platform": "twitter"}', 
 25, 15, 'Twitter Trailblazer Badge', FALSE, null, 20),

('social', 'Follow @PlayProvidence', 'Follow our official Twitter account', 'twitter_follow', 
 '{"action": "twitter_follow", "account": "@playprovidence", "verify_follow": true}', 
 15, 10, null, FALSE, null, 21),

-- Discord Quests  
('social', 'Join Discord Server', 'Connect your Discord and join the Providence community', 'discord_link',
 '{"action": "link_discord", "platform": "discord", "server_id": "providence-discord"}',
 30, 20, 'Discord Pioneer Badge', FALSE, null, 22),

('social', 'Discord Community Member', 'Verify membership in Providence Discord server', 'discord_member',
 '{"action": "discord_verify", "server_id": "providence-discord", "verify_membership": true}',
 20, 15, null, FALSE, null, 23);

-- Update quest definitions to ensure proper ordering
UPDATE quest_definitions SET sort_order = 1 WHERE type = 'daily' AND category = 'checkin';

COMMENT ON TABLE quest_definitions IS 'Updated with social quest samples for Twitter and Discord integration';
