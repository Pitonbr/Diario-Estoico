-- ═══════════════════════════════════════════════════════════
-- DIÁRIO ESTOICO — Migração 003: fundação do painel admin
-- ═══════════════════════════════════════════════════════════

-- ─── Usuários administrativos do painel ───
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE, -- referencia auth.users(id) do Supabase Auth
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indicadores diários (genérico, extensível sem migração) ───
CREATE TABLE IF NOT EXISTS daily_metrics_snapshot (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  metric_key TEXT NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT daily_metrics_snapshot_unique UNIQUE (date, metric_key)
);

CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON daily_metrics_snapshot(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_key ON daily_metrics_snapshot(metric_key);

-- ─── Churn: precisa saber quando um assinante saiu ───
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- ─── Campanhas (orgânicas e pagas) — base para CAC ───
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('organico', 'pago')),
  platform TEXT, -- instagram | tiktok | youtube | twitter | meta_ads | google_ads | tiktok_ads | etc.
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  budget_daily_cents INTEGER,
  platform_campaign_id TEXT, -- id da campanha na plataforma de ads, quando aplicável
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaign_spend (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT campaign_spend_unique UNIQUE (campaign_id, date)
);

CREATE TABLE IF NOT EXISTS campaign_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  attributed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT campaign_subscribers_unique UNIQUE (campaign_id, subscriber_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_spend_campaign ON campaign_spend(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_subscribers_campaign ON campaign_subscribers(campaign_id);
