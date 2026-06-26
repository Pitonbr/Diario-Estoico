-- ═══════════════════════════════════════════════════════════
-- DIÁRIO ESTOICO — Migração 002: lista de inscritos (email + whatsapp)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'whatsapp')),
  email TEXT,
  phone TEXT,
  name TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT subscribers_email_unique UNIQUE (email),
  CONSTRAINT subscribers_phone_unique UNIQUE (phone),
  CONSTRAINT subscribers_contact_check CHECK (
    (channel = 'email' AND email IS NOT NULL) OR
    (channel = 'whatsapp' AND phone IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(active);
CREATE INDEX IF NOT EXISTS idx_subscribers_channel ON subscribers(channel);

-- Inscreve o destinatário atual (configurado via secret RECIPIENT_EMAIL)
INSERT INTO subscribers (channel, email, name, active)
VALUES ('email', 'alexpiton@hotmail.com', 'Alex', true)
ON CONFLICT (email) DO NOTHING;
