-- Web3 Quest System Extension
-- Separate validation system for dynamic asset-based rewards

-- Web3 asset requirements definitions
CREATE TABLE web3_asset_requirements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL, -- "Hold 10+ ETH", "Own Pudgy Penguin NFT"
  description TEXT NOT NULL,
  
  -- Chain and asset info
  chain_id INTEGER NOT NULL, -- 1 = Ethereum, 137 = Polygon, etc.
  asset_type TEXT NOT NULL, -- 'native', 'erc20', 'erc721', 'erc1155'
  contract_address TEXT, -- null for native tokens like ETH
  token_id TEXT, -- for specific NFTs
  
  -- Requirements
  minimum_amount DECIMAL(36,18), -- For token amounts (supports big numbers)
  specific_attributes JSONB DEFAULT '{}', -- NFT traits, etc.
  
  -- Rewards (can be tiered)
  base_xp_reward INTEGER DEFAULT 0,
  base_token_reward INTEGER DEFAULT 0,
  multiplier_per_unit DECIMAL(10,4) DEFAULT 1.0, -- Extra rewards per additional unit
  max_multiplier DECIMAL(10,4) DEFAULT 1.0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Web3 asset snapshots (periodic validation results)
CREATE TABLE user_web3_assets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  asset_requirement_id UUID NOT NULL REFERENCES web3_asset_requirements(id),
  
  -- Validation results
  meets_requirement BOOLEAN DEFAULT FALSE,
  current_amount DECIMAL(36,18) DEFAULT 0,
  asset_details JSONB DEFAULT '{}', -- NFT metadata, token info, etc.
  
  -- Rewards calculation
  calculated_xp INTEGER DEFAULT 0,
  calculated_tokens INTEGER DEFAULT 0,
  rewards_claimed BOOLEAN DEFAULT FALSE,
  
  -- Validation metadata
  last_validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validation_hash TEXT, -- To detect changes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_email, wallet_address, asset_requirement_id)
);

-- Web3 quest completions (one-time rewards)
CREATE TABLE web3_quest_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  asset_requirement_id UUID NOT NULL REFERENCES web3_asset_requirements(id),
  
  -- Completion details
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  xp_earned INTEGER DEFAULT 0,
  tokens_earned INTEGER DEFAULT 0,
  snapshot_data JSONB DEFAULT '{}', -- What they had when they completed it
  
  UNIQUE(user_email, asset_requirement_id)
);

-- Indexes
CREATE INDEX idx_web3_requirements_active ON web3_asset_requirements(is_active);
CREATE INDEX idx_web3_requirements_chain ON web3_asset_requirements(chain_id);
CREATE INDEX idx_user_web3_assets_email ON user_web3_assets(user_email);
CREATE INDEX idx_user_web3_assets_wallet ON user_web3_assets(wallet_address);
CREATE INDEX idx_user_web3_assets_validated ON user_web3_assets(last_validated_at);
CREATE INDEX idx_web3_completions_email ON web3_quest_completions(user_email);

-- Enable RLS
ALTER TABLE web3_asset_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_web3_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE web3_quest_completions ENABLE ROW LEVEL SECURITY;

-- Function to calculate Web3 rewards based on holdings
CREATE OR REPLACE FUNCTION calculate_web3_rewards(
  p_requirement_id UUID,
  p_current_amount DECIMAL
)
RETURNS TABLE(xp_reward INTEGER, token_reward INTEGER) AS $$
DECLARE
  req_record RECORD;
  multiplier DECIMAL;
  final_xp INTEGER;
  final_tokens INTEGER;
BEGIN
  -- Get requirement details
  SELECT * INTO req_record
  FROM web3_asset_requirements
  WHERE id = p_requirement_id;
  
  -- Check if requirement is met
  IF p_current_amount < req_record.minimum_amount THEN
    RETURN QUERY SELECT 0, 0;
    RETURN;
  END IF;
  
  -- Calculate multiplier based on amount
  multiplier := LEAST(
    (p_current_amount / req_record.minimum_amount) * req_record.multiplier_per_unit,
    req_record.max_multiplier
  );
  
  final_xp := FLOOR(req_record.base_xp_reward * multiplier);
  final_tokens := FLOOR(req_record.base_token_reward * multiplier);
  
  RETURN QUERY SELECT final_xp, final_tokens;
END;
$$ language plpgsql;

-- Function to process Web3 quest completion
CREATE OR REPLACE FUNCTION process_web3_quest_completion(
  p_user_email TEXT,
  p_asset_requirement_id UUID,
  p_current_amount DECIMAL,
  p_asset_details JSONB
)
RETURNS TABLE(
  success BOOLEAN,
  xp_earned INTEGER,
  tokens_earned INTEGER,
  message TEXT
) AS $$
DECLARE
  existing_completion INTEGER;
  reward_result RECORD;
BEGIN
  -- Check if already completed
  SELECT COUNT(*) INTO existing_completion
  FROM web3_quest_completions
  WHERE user_email = p_user_email 
    AND asset_requirement_id = p_asset_requirement_id;
  
  IF existing_completion > 0 THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Quest already completed'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate rewards
  SELECT * INTO reward_result
  FROM calculate_web3_rewards(p_asset_requirement_id, p_current_amount);
  
  -- Insert completion record
  INSERT INTO web3_quest_completions (
    user_email, asset_requirement_id, xp_earned, tokens_earned, snapshot_data
  ) VALUES (
    p_user_email, p_asset_requirement_id, 
    reward_result.xp_reward, reward_result.token_reward, p_asset_details
  );
  
  -- Update user stats
  PERFORM update_user_stats_after_quest(
    p_user_email, 'web3', reward_result.xp_reward, reward_result.token_reward
  );
  
  RETURN QUERY SELECT 
    TRUE, 
    reward_result.xp_reward, 
    reward_result.token_reward,
    'Web3 quest completed!'::TEXT;
END;
$$ language plpgsql;

-- Sample Web3 asset requirements
INSERT INTO web3_asset_requirements (name, description, chain_id, asset_type, contract_address, minimum_amount, base_xp_reward, base_token_reward, multiplier_per_unit, max_multiplier) VALUES
-- ETH Holder rewards
('ETH Whale', 'Hold 10+ ETH', 1, 'native', null, 10.0, 100, 50, 1.1, 3.0),
('ETH Dolphin', 'Hold 1+ ETH', 1, 'native', null, 1.0, 25, 15, 1.05, 2.0),
('ETH Shrimp', 'Hold 0.1+ ETH', 1, 'native', null, 0.1, 10, 5, 1.0, 1.0),

-- Popular NFT collections (example addresses)
('Pudgy Penguin Holder', 'Own a Pudgy Penguin NFT', 1, 'erc721', '0xBd3531dA5CF5857e7CfAA92426877b022e612cf8', 1.0, 75, 25, 1.0, 1.0),
('BAYC Holder', 'Own a Bored Ape', 1, 'erc721', '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', 1.0, 200, 100, 1.0, 1.0),

-- ERC20 tokens
('USDC Holder', 'Hold 1000+ USDC', 1, 'erc20', '0xA0b86a33E6411b537BdFCCA76B4b27a8E9e097C0', 1000.0, 30, 20, 1.02, 2.5);

COMMENT ON TABLE web3_asset_requirements IS 'Definitions for Web3 asset-based quest requirements';
COMMENT ON TABLE user_web3_assets IS 'User Web3 asset validation snapshots';
COMMENT ON TABLE web3_quest_completions IS 'One-time Web3 quest completion rewards';
