-- ═══════════════════════════════════════════════════════════
-- DIÁRIO ESTOICO — Schema de Banco de Dados (Supabase)
-- Migração inicial: tabelas de controle de conteúdo
-- ═══════════════════════════════════════════════════════════

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tabela: Ensinamentos Estoicos (biblioteca de referência) ───
CREATE TABLE IF NOT EXISTS stoic_teachings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teaching_key TEXT UNIQUE NOT NULL,       -- ex: "ma-med-01"
  philosopher TEXT NOT NULL,
  work TEXT NOT NULL,
  book_chapter TEXT NOT NULL,
  theme TEXT NOT NULL,
  original_text TEXT NOT NULL,
  practical_domains TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabela: Newsletters Enviadas (anti-repetição) ───
CREATE TABLE IF NOT EXISTS sent_newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  edition_number INTEGER NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  send_date DATE UNIQUE NOT NULL,          -- uma por dia, sem duplicatas
  teaching_key TEXT NOT NULL REFERENCES stoic_teachings(teaching_key),
  philosopher TEXT NOT NULL,
  source_work TEXT NOT NULL,
  topic_tags TEXT[] DEFAULT '{}',
  practical_domain TEXT NOT NULL,           -- pessoal | financeiro | empreendedor
  external_event TEXT,                      -- evento/data cruzada
  content_hash TEXT NOT NULL,               -- hash SHA-256 do conteúdo
  subject_line TEXT NOT NULL,
  full_content JSONB NOT NULL,              -- conteúdo completo estruturado
  recipient_email TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'sent',      -- sent | failed | bounced
  resend_id TEXT,                           -- ID do Resend para rastreio
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabela: Eventos do Calendário ───
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_date DATE NOT NULL,
  event_name TEXT NOT NULL,
  category TEXT NOT NULL,                   -- festivo | business | mentoria | historico
  stoic_connection TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,        -- se repete todo ano
  year INTEGER,                             -- NULL para recorrentes
  source TEXT,                              -- de onde veio o evento
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabela: Canais de Distribuição (expansão futura) ───
CREATE TABLE IF NOT EXISTS distribution_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_type TEXT NOT NULL,               -- email | instagram | linkedin | twitter
  channel_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Tabela: Conteúdo por Canal (expansão futura) ───
CREATE TABLE IF NOT EXISTS channel_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  newsletter_id UUID REFERENCES sent_newsletters(id),
  channel_id UUID REFERENCES distribution_channels(id),
  adapted_content JSONB NOT NULL,
  posted_at TIMESTAMPTZ,
  post_status TEXT DEFAULT 'pending',       -- pending | posted | failed
  external_post_id TEXT,                    -- ID na plataforma
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Índices ───
CREATE INDEX idx_sent_newsletters_date ON sent_newsletters(send_date DESC);
CREATE INDEX idx_sent_newsletters_teaching ON sent_newsletters(teaching_key);
CREATE INDEX idx_sent_newsletters_philosopher ON sent_newsletters(philosopher);
CREATE INDEX idx_stoic_teachings_times_used ON stoic_teachings(times_used ASC);
CREATE INDEX idx_stoic_teachings_philosopher ON stoic_teachings(philosopher);
CREATE INDEX idx_stoic_teachings_domains ON stoic_teachings USING GIN(practical_domains);
CREATE INDEX idx_calendar_events_date ON calendar_events(event_date);

-- ─── Canal de email padrão ───
INSERT INTO distribution_channels (channel_type, channel_config, is_active)
VALUES ('email', '{"provider": "resend", "recipient": "alexpiton@gmail.com"}', true)
ON CONFLICT DO NOTHING;
