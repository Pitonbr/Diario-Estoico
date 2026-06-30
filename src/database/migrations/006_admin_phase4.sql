-- ═══════════════════════════════════════════════════════════
-- DIÁRIO ESTOICO — Migração 006: Fase 4 Admin
-- ═══════════════════════════════════════════════════════════

-- Campos de segurança/aprovação em subscribers
ALTER TABLE subscribers
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('approved', 'pending', 'rejected')),
  ADD COLUMN IF NOT EXISTS signup_risk_score INTEGER DEFAULT 0
    CHECK (signup_risk_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS risk_notes TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- Retroativo: marcar existentes como aprovados
UPDATE subscribers SET approval_status = 'approved', approved_at = created_at
  WHERE approval_status IS NULL OR approval_status = 'approved';

-- Cupons
CREATE TABLE IF NOT EXISTS coupons (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         TEXT        NOT NULL UNIQUE,
  discount_pct SMALLINT    NOT NULL CHECK (discount_pct BETWEEN 1 AND 100),
  max_uses     INTEGER,
  uses_count   INTEGER     NOT NULL DEFAULT 0,
  active       BOOLEAN     NOT NULL DEFAULT TRUE,
  expires_at   TIMESTAMPTZ,
  description  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_approval ON subscribers(approval_status);
CREATE INDEX IF NOT EXISTS idx_coupons_code         ON coupons(code);
