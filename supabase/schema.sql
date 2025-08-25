-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table for user game data
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- NextAuth user ID
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  wallet_address TEXT UNIQUE,
  wallet_nonce TEXT,
  wallet_verified BOOLEAN DEFAULT FALSE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  tokens INTEGER DEFAULT 0,
  completed_quests INTEGER DEFAULT 0,
  total_quests INTEGER DEFAULT 0,
  rank TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_wallet_address ON profiles(wallet_address);

-- Enable RLS but no policies since we're using service key with NextAuth API routes
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language plpgsql;

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
