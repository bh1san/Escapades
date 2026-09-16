-- ==============================================================================
-- PROJECT GENESIS: AUTONOMOUS TREASURY DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================

-- 1. The Treasury Table (Tracks overall balance, block tracking, and expansion status)
CREATE TABLE IF NOT EXISTS treasury (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  total_usdt_earned NUMERIC(20, 6) DEFAULT 0,
  available_for_expansion NUMERIC(20, 6) DEFAULT 0,
  expansion_ready BOOLEAN DEFAULT FALSE,
  last_checked_block BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. The Transactions Log (Tracks every individual incoming USDT deposit with idempotency)
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  from_address VARCHAR(42) NOT NULL,
  amount_usdt NUMERIC(20, 6) NOT NULL,
  block_number BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Site Registry (Tracks the family tree of spawned micro-tools in Phase 4)
CREATE TABLE IF NOT EXISTS site_registry (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) UNIQUE NOT NULL,
  niche VARCHAR(500) NOT NULL,
  tool_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'deployed',
  parent_site VARCHAR(255) DEFAULT 'genesis',
  monthly_revenue NUMERIC(20, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Genesis Main Site:
-- INSERT INTO site_registry (domain, niche, tool_name, status, parent_site)
-- VALUES ('genesis-crypto-tax.com', 'General Crypto Tax & PnL', 'Crypto Tax Calculator', 'deployed', 'root');

-- Optional: Initial seed example
-- INSERT INTO treasury (wallet_address) VALUES ('0xYOUR_PUBLIC_WALLET_ADDRESS_HERE') ON CONFLICT (wallet_address) DO NOTHING;
