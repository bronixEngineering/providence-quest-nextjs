-- Add Connect Wallet quest
-- This should be run after existing social quests

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
  'web3',
  'Connect Wallet',
  'Connect your Web3 wallet and verify ownership with signature',
  'wallet_connect',
  '{"action": "connect_wallet", "verification": "nonce_sign", "one_time_only": true}',
  50,
  25,
  'Wallet Pioneer Badge',
  FALSE,
  null,
  20,
  TRUE
);

-- Add wallet_accounts table to track user wallet connections
CREATE TABLE IF NOT EXISTS wallet_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES profiles(email) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  nonce TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_signature TEXT,
  verification_message TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  is_primary BOOLEAN DEFAULT TRUE,
  network_chain_id INTEGER DEFAULT 1, -- Ethereum mainnet
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_user_email ON wallet_accounts(user_email);
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_wallet_address ON wallet_accounts(wallet_address);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_accounts_user_primary ON wallet_accounts(user_email) WHERE is_primary = TRUE;

-- RLS (Row Level Security) - but we'll use supabaseAdmin
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;

-- Update profiles table to include wallet reference (optional, for quick access)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS primary_wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_verified_at TIMESTAMP WITH TIME ZONE;

COMMENT ON TABLE wallet_accounts IS 'User wallet connections with nonce verification';
COMMENT ON COLUMN wallet_accounts.nonce IS 'Random nonce for signature verification';
COMMENT ON COLUMN wallet_accounts.is_primary IS 'Only one primary wallet per user';

-- Verify structure
SELECT id, type, title, category, sort_order, xp_reward, token_reward 
FROM quest_definitions 
WHERE category = 'wallet_connect';
