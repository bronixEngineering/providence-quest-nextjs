-- Daily Quest System Schema
-- Run this in Supabase SQL Editor

-- Daily check-ins table
CREATE TABLE daily_checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL, -- Use email as reference (more reliable than user_id)
  checkin_date DATE NOT NULL, -- 2025-08-25 format (UTC)
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_earned INTEGER DEFAULT 10,
  tokens_earned INTEGER DEFAULT 5,
  streak_day INTEGER DEFAULT 1, -- Which day of the streak (1, 2, 3...)
  bonus_reward TEXT, -- Special bonus text like "Weekly Warrior!"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User streaks table (current streak info)
CREATE TABLE user_streaks (
  user_email TEXT PRIMARY KEY, -- Use email as primary key
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_checkin_date DATE,
  total_checkins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_daily_checkins_user_email ON daily_checkins(user_email);
CREATE INDEX idx_daily_checkins_date ON daily_checkins(checkin_date);
CREATE UNIQUE INDEX idx_daily_checkins_user_date ON daily_checkins(user_email, checkin_date);

-- Enable RLS
ALTER TABLE daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_streaks_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Trigger for user_streaks updated_at
CREATE TRIGGER handle_streaks_updated_at 
  BEFORE UPDATE ON user_streaks 
  FOR EACH ROW 
  EXECUTE PROCEDURE handle_streaks_updated_at();

-- Function to get today's date in UTC
CREATE OR REPLACE FUNCTION get_today_utc()
RETURNS DATE AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE 'UTC')::DATE;
END;
$$ language plpgsql;

-- Function to check if user can check in today
CREATE OR REPLACE FUNCTION can_checkin_today(p_user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  today_date DATE := get_today_utc();
  existing_checkin INTEGER;
BEGIN
  SELECT COUNT(*) INTO existing_checkin
  FROM daily_checkins
  WHERE user_email = p_user_email 
    AND checkin_date = today_date;
  
  RETURN existing_checkin = 0;
END;
$$ language plpgsql;

-- Insert sample streak bonuses configuration (optional)
COMMENT ON TABLE daily_checkins IS 'Daily check-in records with rewards and streak info';
COMMENT ON TABLE user_streaks IS 'User streak statistics and current status';

-- Streak Bonus Configuration (as reference):
-- Day 1: +10 XP, +5 Tokens
-- Day 3: +15 XP, +8 Tokens, "3-Day Streak!"
-- Day 7: +25 XP, +15 Tokens, "Weekly Warrior!"
-- Day 14: +40 XP, +25 Tokens, "Bi-Weekly Beast!"
-- Day 30: +100 XP, +50 Tokens, "Monthly Master!"
