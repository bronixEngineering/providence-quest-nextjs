-- Comprehensive Quest System Schema
-- Unified XP system for Daily, Social, and Web3 quests

-- Quest types and categories
CREATE TYPE quest_type AS ENUM ('daily', 'social', 'web3', 'special');
CREATE TYPE quest_status AS ENUM ('available', 'in_progress', 'completed', 'expired');

-- Master quest definitions table
CREATE TABLE quest_definitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type quest_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'checkin', 'twitter', 'discord', 'nft', 'token', etc.
  
  -- Requirements (JSON for flexibility)
  requirements JSONB NOT NULL DEFAULT '{}', -- {action: 'follow', account: '@playprovidence', etc}
  
  -- Rewards
  xp_reward INTEGER NOT NULL DEFAULT 0,
  token_reward INTEGER NOT NULL DEFAULT 0,
  special_reward TEXT, -- Badge, NFT, etc.
  
  -- Quest rules
  is_repeatable BOOLEAN DEFAULT FALSE,
  repeat_interval TEXT, -- 'daily', 'weekly', null
  max_completions INTEGER, -- null = unlimited
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quest progress and completions
CREATE TABLE user_quest_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL, -- Use email as identifier
  quest_id UUID NOT NULL REFERENCES quest_definitions(id),
  
  status quest_status DEFAULT 'available',
  progress_data JSONB DEFAULT '{}', -- Flexible progress tracking
  
  -- Completion tracking
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_count INTEGER DEFAULT 0,
  next_available_at TIMESTAMP WITH TIME ZONE, -- For repeatable quests
  
  -- Rewards tracking
  xp_earned INTEGER DEFAULT 0,
  tokens_earned INTEGER DEFAULT 0,
  rewards_claimed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily check-ins (specific implementation)
CREATE TABLE daily_checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  checkin_date DATE NOT NULL, -- UTC date
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Streak tracking
  streak_day INTEGER DEFAULT 1,
  is_streak_broken BOOLEAN DEFAULT FALSE,
  
  -- Rewards for this checkin
  base_xp INTEGER DEFAULT 10,
  bonus_xp INTEGER DEFAULT 0, -- Streak bonus
  total_xp INTEGER GENERATED ALWAYS AS (base_xp + bonus_xp) STORED,
  tokens_earned INTEGER DEFAULT 5,
  bonus_reward TEXT, -- "Weekly Warrior!", etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_email, checkin_date)
);

-- User overall stats (derived from all quest completions)
CREATE TABLE user_stats (
  user_email TEXT PRIMARY KEY,
  
  -- Overall progression
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  tokens INTEGER DEFAULT 0,
  
  -- Quest stats
  total_quests_completed INTEGER DEFAULT 0,
  daily_quests_completed INTEGER DEFAULT 0,
  social_quests_completed INTEGER DEFAULT 0,
  web3_quests_completed INTEGER DEFAULT 0,
  
  -- Streaks
  current_daily_streak INTEGER DEFAULT 0,
  longest_daily_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  
  -- Achievements/Badges
  badges JSONB DEFAULT '[]', -- Array of earned badges
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quest_definitions_type ON quest_definitions(type);
CREATE INDEX idx_quest_definitions_active ON quest_definitions(is_active);
CREATE INDEX idx_user_quest_progress_email ON user_quest_progress(user_email);
CREATE INDEX idx_user_quest_progress_quest ON user_quest_progress(quest_id);
CREATE INDEX idx_user_quest_progress_status ON user_quest_progress(status);
CREATE INDEX idx_daily_checkins_email ON daily_checkins(user_email);
CREATE INDEX idx_daily_checkins_date ON daily_checkins(checkin_date);

-- Unique constraint for daily quests (prevent duplicate completions on same date)
CREATE UNIQUE INDEX idx_user_quest_daily_unique 
ON user_quest_progress(user_email, quest_id, (completed_at::DATE))
WHERE completed_at IS NOT NULL;

-- Enable RLS
ALTER TABLE quest_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Functions for XP and level calculation
CREATE OR REPLACE FUNCTION calculate_level_from_xp(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: Every 100 XP = 1 level, with scaling
  -- Level 1: 0-99 XP, Level 2: 100-249 XP, Level 3: 250-449 XP, etc.
  IF xp < 100 THEN RETURN 1;
  ELSE RETURN FLOOR(SQRT(xp / 50)) + 1;
  END IF;
END;
$$ language plpgsql;

CREATE OR REPLACE FUNCTION xp_needed_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
  IF level <= 1 THEN RETURN 100;
  ELSE RETURN ((level - 1) * (level - 1)) * 50;
  END IF;
END;
$$ language plpgsql;

-- Function to update user stats after quest completion
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
  -- Insert or update user stats
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
  
  -- Calculate new level
  SELECT total_xp INTO new_total_xp FROM user_stats WHERE user_email = p_user_email;
  new_level := calculate_level_from_xp(new_total_xp);
  
  UPDATE user_stats 
  SET level = new_level
  WHERE user_email = p_user_email;
END;
$$ language plpgsql;

-- Function to handle daily check-in with streak calculation
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
BEGIN
  -- Check if already checked in today
  SELECT COUNT(*) INTO existing_checkin
  FROM daily_checkins
  WHERE user_email = p_user_email AND checkin_date = today_date;
  
  IF existing_checkin > 0 THEN
    RETURN QUERY SELECT FALSE, 0, 0, 0, NULL::TEXT, 'Already checked in today'::TEXT;
    RETURN;
  END IF;
  
  -- Get last check-in date and current streak
  SELECT last_checkin_date, current_daily_streak 
  INTO last_checkin, current_streak
  FROM user_stats 
  WHERE user_email = p_user_email;
  
  -- Calculate streak
  IF last_checkin IS NULL OR last_checkin < yesterday_date THEN
    -- Streak broken or first time
    current_streak := 1;
  ELSIF last_checkin = yesterday_date THEN
    -- Continue streak
    current_streak := COALESCE(current_streak, 0) + 1;
  END IF;
  
  -- Calculate rewards based on streak
  CASE 
    WHEN current_streak >= 30 THEN
      bonus_xp := 90; -- +100 total XP
      tokens := 50;
      bonus := 'Monthly Master! 👑';
    WHEN current_streak >= 14 THEN
      bonus_xp := 30; -- +40 total XP
      tokens := 25;
      bonus := 'Bi-Weekly Beast! 🦁';
    WHEN current_streak >= 7 THEN
      bonus_xp := 15; -- +25 total XP
      tokens := 15;
      bonus := 'Weekly Warrior! ⚔️';
    WHEN current_streak >= 3 THEN
      bonus_xp := 5; -- +15 total XP
      tokens := 8;
      bonus := '3-Day Streak! 🔥';
    ELSE
      bonus_xp := 0;
      tokens := 5;
      bonus := NULL;
  END CASE;
  
  total_xp := base_xp + bonus_xp;
  
  -- Insert check-in record
  INSERT INTO daily_checkins (
    user_email, checkin_date, streak_day, 
    base_xp, bonus_xp, tokens_earned, bonus_reward
  ) VALUES (
    p_user_email, today_date, current_streak,
    base_xp, bonus_xp, tokens, bonus
  );
  
  -- Update user stats
  PERFORM update_user_stats_after_quest(p_user_email, 'daily', total_xp, tokens);
  
  -- Update streak info
  UPDATE user_stats 
  SET 
    current_daily_streak = current_streak,
    longest_daily_streak = GREATEST(COALESCE(longest_daily_streak, 0), current_streak),
    last_checkin_date = today_date,
    updated_at = NOW()
  WHERE user_email = p_user_email;
  
  RETURN QUERY SELECT 
    TRUE, 
    current_streak, 
    total_xp, 
    tokens, 
    bonus,
    'Check-in successful!'::TEXT;
END;
$$ language plpgsql;

-- Insert default daily check-in quest definition
INSERT INTO quest_definitions (type, title, description, category, requirements, xp_reward, token_reward, is_repeatable, repeat_interval) 
VALUES (
  'daily', 
  'Daily Check-in', 
  'Check in daily to maintain your streak and earn rewards!',
  'checkin',
  '{"action": "daily_checkin"}',
  10,
  5,
  TRUE,
  'daily'
);

COMMENT ON TABLE quest_definitions IS 'Master quest definitions for all quest types';
COMMENT ON TABLE user_quest_progress IS 'User progress tracking for all quests';
COMMENT ON TABLE daily_checkins IS 'Daily check-in specific tracking with streak logic';
COMMENT ON TABLE user_stats IS 'Unified user statistics and progression';
