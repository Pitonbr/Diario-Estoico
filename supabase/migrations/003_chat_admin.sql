-- Migração 003: Infraestrutura de governança do Chat Estoico
-- Alertas admin (linhas vermelhas), NPS, financeiro, logs de erro

-- ══════════════════════════════
-- ALERTAS ADMIN (LINHAS VERMELHAS)
-- ══════════════════════════════

CREATE TABLE IF NOT EXISTS chat_admin_alerts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES chat_users(id) ON DELETE SET NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  alert_type   TEXT NOT NULL,
  -- homicide | threats | racism | child_safety | abortion | suicidal_ideation | violence | other
  severity     TEXT NOT NULL DEFAULT 'high',
  -- critical (bloqueia imediato) | high (bloqueia + alerta) | medium (só alerta)
  trigger_message TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending',
  -- pending | approved | user_blocked | conversation_ended
  admin_notes  TEXT,
  reviewed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_admin_alerts_status  ON chat_admin_alerts(status);
CREATE INDEX IF NOT EXISTS idx_chat_admin_alerts_created ON chat_admin_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_admin_alerts_user    ON chat_admin_alerts(user_id);

-- Bloqueio de conversas e usuários
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS admin_blocked BOOLEAN DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS block_reason  TEXT;

ALTER TABLE chat_users ADD COLUMN IF NOT EXISTS blocked_at    TIMESTAMPTZ;
ALTER TABLE chat_users ADD COLUMN IF NOT EXISTS block_reason  TEXT;

-- ══════════════════════════════
-- NPS
-- ══════════════════════════════

CREATE TABLE IF NOT EXISTS chat_nps (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID REFERENCES chat_users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  score           SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 10),
  feedback_text   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_nps_created ON chat_nps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_nps_user    ON chat_nps(user_id);

-- ══════════════════════════════
-- FINANCEIRO DO CHAT ESTOICO
-- ══════════════════════════════

CREATE TABLE IF NOT EXISTS chat_financials (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type         TEXT NOT NULL CHECK (type IN ('revenue','expense')),
  category     TEXT NOT NULL,
  -- expense: api_anthropic | hosting | marketing | outros
  -- revenue: assinatura | parceria | consultoria | outros
  description  TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  occurred_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_financials_date ON chat_financials(occurred_at DESC);

-- ══════════════════════════════
-- LOGS DE ERRO
-- ══════════════════════════════

CREATE TABLE IF NOT EXISTS chat_error_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level           TEXT NOT NULL DEFAULT 'error',
  -- error | warning | info
  error_type      TEXT NOT NULL,
  message         TEXT NOT NULL,
  context         JSONB DEFAULT '{}',
  user_id         UUID,
  conversation_id UUID,
  resolved        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_error_logs_created ON chat_error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_error_logs_level   ON chat_error_logs(level, resolved);
