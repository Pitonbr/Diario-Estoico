-- ═══════════════════════════════════════════════════════════
-- DIÁRIO ESTOICO — Migração 004: peças de conteúdo orgânico
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS content_pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_key TEXT NOT NULL,        -- cafe_estoico | instagram | tiktok | youtube | twitter
  platform TEXT NOT NULL,
  format TEXT NOT NULL,           -- reels | carousel | static_post | story | short | longform | tweet | thread | video_script
  generated_date DATE NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  cta TEXT,
  visual_notes TEXT,
  audio_notes TEXT,
  duration TEXT,
  slides JSONB,
  scheduled_time TEXT,
  metadata JSONB DEFAULT '{}',
  teaching_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending_approval'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected')),
  quality_rating SMALLINT CHECK (quality_rating BETWEEN 1 AND 5),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_pieces_date ON content_pieces(generated_date DESC);
CREATE INDEX IF NOT EXISTS idx_content_pieces_agent ON content_pieces(agent_key);
CREATE INDEX IF NOT EXISTS idx_content_pieces_status ON content_pieces(status);
