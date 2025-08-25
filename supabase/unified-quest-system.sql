-- Unified Quest System - Final Version
-- Handles Daily (repeatable), Social (one-time), and Web3 (one-time) quests

-- Quest types and categories
CREATE TYPE quest_type AS ENUM ('daily', 'social', 'web3');
CREATE TYPE quest_status AS ENUM ('available', 'completed', 'locked');

-- Master quest definitions
CREATE TABLE quest_definitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type quest_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'checkin', 'twitter_link', 'discord_join', 'wallet_connect', 'nft_hold', etc.
  
  -- Requirements (flexible JSON)
  requirements JSONB NOT NULL DEFAULT '{}', 
  -- Examples:
  -- Daily: {"action": "daily_checkin"}
  -- Social: {"action": "link_twitter", "verify_follow": "@playprovidence"}
  -- Web3: {"action": "connect_wallet", "chain_id": 1, "asset_check": "eth_balance", "min_amount": "0.1"}
  
  -- Rewards
  xp_reward INTEGER NOT NULL DEFAULT 0,
  token_reward INTEGER NOT NULL DEFAULT 0,
  special_reward TEXT, -- Badge, achievement, etc.
  
  -- Quest behavior
  is_repeatable BOOLEAN DEFAULT FALSE, -- TRUE only for daily quests
  repeat_interval TEXT, -- 'daily' for daily quests, null for others
  
  -- Prerequisites and ordering
  requires_quest_id UUID REFERENCES quest_definitions(id), -- Must complete this quest first
  sort_order INTEGER DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quest completions (both one-time and repeatable)
CREATE TABLE user_quest_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  quest_id UUID NOT NULL REFERENCES quest_definitions(id),
  
  -- Completion details
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date DATE GENERATED ALWAYS AS ((completed_at AT TIME ZONE 'UTC')::DATE) STORED,
  
  -- Rewards earned
  xp_earned INTEGER DEFAULT 0,
  tokens_earned INTEGER DEFAULT 0,
  special_reward_earned TEXT,
  
  -- Progress data (flexible for different quest types)
  completion_data JSONB DEFAULT '{}',
  -- Examples:
  -- Daily: {"streak_day": 5, "bonus_applied": "Weekly Warrior"}
  -- Social: {"twitter_handle": "@user", "verified_at": "2024-08-25T..."}
  -- Web3: {"wallet_address": "0x...", "assets_found": {...}}
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User social account connections (for social quests)
CREATE TABLE user_social_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'twitter', 'discord', 'telegram', etc.
  
  -- Connection details
  platform_user_id TEXT, -- Twitter ID, Discord ID, etc.
  platform_username TEXT, -- @username, handle, etc.
  platform_data JSONB DEFAULT '{}', -- Additional platform-specific data
  
  -- Verification
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT, -- For OAuth or verification process
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_email, platform)
);

-- Daily check-ins (specialized table for daily quest performance)
CREATE TABLE daily_checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  checkin_date DATE NOT NULL,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Streak info
  streak_day INTEGER DEFAULT 1,
  
  -- Rewards
  base_xp INTEGER DEFAULT 10,
  bonus_xp INTEGER DEFAULT 0,
  total_xp INTEGER GENERATED ALWAYS AS (base_xp + bonus_xp) STORED,
  tokens_earned INTEGER DEFAULT 5,
  bonus_reward TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email, checkin_date)
);

-- User overall stats and progression
CREATE TABLE user_stats (
  user_email TEXT PRIMARY KEY,
  
  -- Core progression
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  tokens INTEGER DEFAULT 0,
  
  -- Quest completion counts
  total_quests_completed INTEGER DEFAULT 0,
  daily_quests_completed INTEGER DEFAULT 0,
  social_quests_completed INTEGER DEFAULT 0,
  web3_quests_completed INTEGER DEFAULT 0,
  
  -- Daily check-in specific stats
  current_daily_streak INTEGER DEFAULT 0,
  longest_daily_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  
  -- Connected accounts count
  connected_social_accounts INTEGER DEFAULT 0,
  
  -- Achievements
  badges JSONB DEFAULT '[]',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quest_definitions_type ON quest_definitions(type);
CREATE INDEX idx_quest_definitions_active ON quest_definitions(is_active, sort_order);
CREATE INDEX idx_user_completions_email ON user_quest_completions(user_email);
CREATE INDEX idx_user_completions_quest ON user_quest_completions(quest_id);
CREATE INDEX idx_user_completions_date ON user_quest_completions(completion_date);
CREATE INDEX idx_social_connections_email ON user_social_connections(user_email);
CREATE INDEX idx_social_connections_platform ON user_social_connections(platform);
CREATE INDEX idx_daily_checkins_email_date ON daily_checkins(user_email, checkin_date);

-- Unique constraints
CREATE UNIQUE INDEX idx_user_quest_completion_unique 
ON user_quest_completions(user_email, quest_id, completion_date)
WHERE completion_date IS NOT NULL; -- Prevent duplicate daily completions

-- Trigger to prevent duplicate completions for non-repeatable quests
CREATE OR REPLACE FUNCTION prevent_duplicate_quest_completion()
RETURNS TRIGGER AS $$
DECLARE
  quest_repeatable BOOLEAN;
  existing_count INTEGER;
BEGIN
  -- Check if quest is repeatable
  SELECT is_repeatable INTO quest_repeatable
  FROM quest_definitions
  WHERE id = NEW.quest_id;
  
  -- If quest is not repeatable, check for existing completions
  IF quest_repeatable = FALSE THEN
    SELECT COUNT(*) INTO existing_count
    FROM user_quest_completions
    WHERE user_email = NEW.user_email 
      AND quest_id = NEW.quest_id;
    
    IF existing_count > 0 THEN
      RAISE EXCEPTION 'Quest already completed. Non-repeatable quests can only be completed once.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER trigger_prevent_duplicate_quest_completion
  BEFORE INSERT ON user_quest_completions
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_quest_completion();

-- Enable RLS
ALTER TABLE quest_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Level calculation functions (reuse from previous schema)
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF xp < 100 THEN RETURN 1;
  ELSE RETURN FLOOR(SQRT(xp / 50)) + 1;
  END IF;
END;
$$ language plpgsql;

-- Update user stats after any quest completion
CREATE OR REPLACE FUNCTION update_user_stats_after_quest(
  p_user_email TEXT,
  p_quest_type quest_type,
  p_xp_earned INTEGER,
  p_tokens_earned INTEGER
)
RETURNS VOID AS $$
DECLARE
  new_total_xp INTEGER;
  new_level INTEGER;
BEGIN
  INSERT INTO user_stats (user_email, total_xp, tokens, total_quests_completed)
  VALUES (p_user_email, p_xp_earned, p_tokens_earned, 1)
  ON CONFLICT (user_email) DO UPDATE SET
    total_xp = user_stats.total_xp + p_xp_earned,
    tokens = user_stats.tokens + p_tokens_earned,
    total_quests_completed = user_stats.total_quests_completed + 1,
    daily_quests_completed = CASE WHEN p_quest_type = 'daily' THEN user_stats.daily_quests_completed + 1 ELSE user_stats.daily_quests_completed END,
    social_quests_completed = CASE WHEN p_quest_type = 'social' THEN user_stats.social_quests_completed + 1 ELSE user_stats.social_quests_completed END,
    web3_quests_completed = CASE WHEN p_quest_type = 'web3' THEN user_stats.web3_quests_completed + 1 ELSE user_stats.web3_quests_completed END,
    updated_at = NOW();
  
  -- Update level
  SELECT total_xp INTO new_total_xp FROM user_stats WHERE user_email = p_user_email;
  new_level := calculate_level_from_xp(new_total_xp);
  
  UPDATE user_stats 
  SET level = new_level
  WHERE user_email = p_user_email;
END;
$$ language plpgsql;

-- Daily check-in processing (same as before)
CREATE OR REPLACE FUNCTION process_daily_checkin(p_user_email TEXT)
RETURNS TABLE(
  success BOOLEAN,
  streak_day INTEGER,
  xp_earned INTEGER,
  tokens_earned INTEGER,
  bonus_reward TEXT,
  message TEXT
) AS $$
DECLARE
  today_date DATE := (NOW() AT TIME ZONE 'UTC')::DATE;
  yesterday_date DATE := (NOW() AT TIME ZONE 'UTC' - INTERVAL '1 day')::DATE;
  last_checkin DATE;
  current_streak INTEGER := 1;
  base_xp INTEGER := 10;
  bonus_xp INTEGER := 0;
  total_xp INTEGER;
  tokens INTEGER := 5;
  bonus TEXT := NULL;
  existing_checkin INTEGER;
  daily_quest_id UUID;
BEGIN
  -- Check existing checkin
  SELECT COUNT(*) INTO existing_checkin
  FROM daily_checkins
  WHERE user_email = p_user_email AND checkin_date = today_date;
  
  IF existing_checkin > 0 THEN
    RETURN QUERY SELECT FALSE, 0, 0, 0, NULL::TEXT, 'Already checked in today'::TEXT;
    RETURN;
  END IF;
  
  -- Get streak info
  SELECT last_checkin_date, current_daily_streak 
  INTO last_checkin, current_streak
  FROM user_stats 
  WHERE user_email = p_user_email;
  
  -- Calculate streak
  IF last_checkin IS NULL OR last_checkin < yesterday_date THEN
    current_streak := 1;
  ELSIF last_checkin = yesterday_date THEN
    current_streak := COALESCE(current_streak, 0) + 1;
  END IF;
  
  -- Calculate rewards
  CASE 
    WHEN current_streak >= 30 THEN
      bonus_xp := 90; tokens := 50; bonus := 'Monthly Master! 👑';
    WHEN current_streak >= 14 THEN
      bonus_xp := 30; tokens := 25; bonus := 'Bi-Weekly Beast! 🦁';
    WHEN current_streak >= 7 THEN
      bonus_xp := 15; tokens := 15; bonus := 'Weekly Warrior! ⚔️';
    WHEN current_streak >= 3 THEN
      bonus_xp := 5; tokens := 8; bonus := '3-Day Streak! 🔥';
    ELSE
      bonus_xp := 0; tokens := 5; bonus := NULL;
  END CASE;
  
  total_xp := base_xp + bonus_xp;
  
  -- Insert checkin
  INSERT INTO daily_checkins (
    user_email, checkin_date, streak_day, 
    base_xp, bonus_xp, tokens_earned, bonus_reward
  ) VALUES (
    p_user_email, today_date, current_streak,
    base_xp, bonus_xp, tokens, bonus
  );
  
  -- Get daily quest ID
  SELECT id INTO daily_quest_id 
  FROM quest_definitions 
  WHERE type = 'daily' AND category = 'checkin' 
  LIMIT 1;
  
  -- Insert quest completion record
  IF daily_quest_id IS NOT NULL THEN
    INSERT INTO user_quest_completions (
      user_email, quest_id, xp_earned, tokens_earned, special_reward_earned,
      completion_data
    ) VALUES (
      p_user_email, daily_quest_id, total_xp, tokens, bonus,
      jsonb_build_object('streak_day', current_streak, 'bonus_applied', bonus)
    );
  END IF;
  
  -- Update user stats
  PERFORM update_user_stats_after_quest(p_user_email, 'daily', total_xp, tokens);
  
  -- Update streak
  UPDATE user_stats 
  SET 
    current_daily_streak = current_streak,
    longest_daily_streak = GREATEST(COALESCE(longest_daily_streak, 0), current_streak),
    last_checkin_date = today_date,
    updated_at = NOW()
  WHERE user_email = p_user_email;
  
  RETURN QUERY SELECT 
    TRUE, current_streak, total_xp, tokens, bonus, 'Check-in successful!'::TEXT;
END;
$$ language plpgsql;

-- Insert sample quest definitions
INSERT INTO quest_definitions (type, title, description, category, requirements, xp_reward, token_reward, is_repeatable, repeat_interval, sort_order) VALUES
-- Daily Quests
('daily', 'Daily Check-in', 'Check in daily to maintain your streak and earn rewards!', 'checkin', '{"action": "daily_checkin"}', 10, 5, TRUE, 'daily', 1),

-- Social Quests
('social', 'Connect Twitter', 'Link your Twitter account to Providence Quest', 'twitter_link', '{"action": "link_twitter", "verify_follow": "@playprovidence"}', 25, 15, FALSE, null, 10),
('social', 'Join Discord', 'Join the Providence Discord community', 'discord_join', '{"action": "join_discord", "server_id": "providence-discord"}', 30, 20, FALSE, null, 11),
('social', 'Follow on Twitter', 'Follow @playprovidence on Twitter', 'twitter_follow', '{"action": "twitter_follow", "account": "@playprovidence"}', 15, 10, FALSE, null, 12),

-- Web3 Quests
('web3', 'Connect Wallet', 'Connect your Web3 wallet to unlock asset-based rewards', 'wallet_connect', '{"action": "connect_wallet", "verification": "nonce_sign"}', 50, 25, FALSE, null, 20),
('web3', 'ETH Holder', 'Hold 0.1+ ETH in your connected wallet', 'eth_balance', '{"action": "verify_balance", "chain_id": 1, "asset": "native", "min_amount": "0.1"}', 25, 15, FALSE, null, 21),
('web3', 'NFT Collector', 'Own any NFT in your connected wallet', 'nft_holder', '{"action": "verify_nft", "chain_id": 1, "min_count": 1}', 40, 20, FALSE, null, 22);

COMMENT ON TABLE quest_definitions IS 'Unified quest definitions for all quest types';
COMMENT ON TABLE user_quest_completions IS 'All user quest completions with flexible data';
COMMENT ON TABLE user_social_connections IS 'User social media account connections';
COMMENT ON TABLE daily_checkins IS 'Optimized daily check-in tracking';
COMMENT ON TABLE user_stats IS 'Unified user progression and statistics';
