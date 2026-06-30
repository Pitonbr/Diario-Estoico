-- ═══════════════════════════════════════════════════════════
-- DIÁRIO ESTOICO — Migração 005: transações financeiras
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS transactions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  type         TEXT        NOT NULL CHECK (type IN ('income', 'expense')),
  source       TEXT        NOT NULL,          -- ex: "Assinatura mensal", "Meta Ads", "Anthropic API"
  category     TEXT        NOT NULL,          -- ver CHECK abaixo
  amount_cents INTEGER     NOT NULL CHECK (amount_cents > 0),
  description  TEXT,
  occurred_at  DATE        NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT transactions_category_check CHECK (
    (type = 'income'  AND category IN ('assinatura', 'produto', 'parceria', 'outro_receita')) OR
    (type = 'expense' AND category IN ('midia_paga', 'sistema', 'producao', 'outro_despesa'))
  )
);

CREATE INDEX IF NOT EXISTS idx_transactions_occurred ON transactions(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type     ON transactions(type);
