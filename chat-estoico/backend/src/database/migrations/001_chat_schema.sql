-- ═══════════════════════════════════════════════════════════════
-- CHAT ESTOICO — Schema de Banco de Dados
-- Instância: mesma do Diário Estoico (reaproveita stoic_teachings)
-- ═══════════════════════════════════════════════════════════════

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;  -- pgvector para busca semântica

-- ─── Usuários do Chat ───
CREATE TABLE IF NOT EXISTS chat_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE,                       -- referência ao Supabase Auth
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  preferred_language TEXT DEFAULT 'pt-BR',
  plan TEXT DEFAULT 'free',                  -- free | premium (futuro)
  monthly_message_count INTEGER DEFAULT 0,   -- controle freemium
  monthly_reset_at TIMESTAMPTZ DEFAULT NOW(),
  terms_accepted_at TIMESTAMPTZ,             -- LGPD: aceite obrigatório
  terms_version TEXT,                        -- versão dos termos aceitos
  privacy_accepted_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                     -- LGPD: soft delete p/ direito ao esquecimento
);

-- ─── Perfil Adaptativo (a "memória" sobre cada pessoa) ───
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,

  -- Dados do onboarding (respostas diretas)
  onboarding_answers JSONB DEFAULT '{}',

  -- Perfil de comunicação inferido (atualizado continuamente)
  communication_style JSONB DEFAULT '{}',
  -- Estrutura: { "tone": "direto|reflexivo", "depth": "pratico|filosofico",
  --   "pace": "rapido|explorador", "formality": "informal|formal",
  --   "emotional_expression": "alto|medio|baixo" }

  -- Contexto de vida (o que a pessoa compartilhou)
  life_context JSONB DEFAULT '{}',
  -- Estrutura: { "focus_areas": ["carreira", "ansiedade"],
  --   "recurring_themes": [...], "stoic_familiarity": "iniciante|intermediario|avancado" }

  -- Ressonância filosófica (com quais filósofos/temas mais conecta)
  philosophical_affinity JSONB DEFAULT '{}',
  -- Estrutura: { "philosophers": {"seneca": 0.8, "epicteto": 0.5},
  --   "themes": {"controle": 12, "tempo": 5} }  (contadores de engajamento)

  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Conversas (sessões) ───
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  mode TEXT DEFAULT 'text',                  -- text | voice (preparado p/ v2)
  message_count INTEGER DEFAULT 0,

  -- Resumo pós-conversa (gerado pelo processo assíncrono de memória)
  session_summary TEXT,
  themes_discussed TEXT[],
  user_insights TEXT[],                      -- insights que O USUÁRIO verbalizou
  teachings_referenced TEXT[],               -- teaching_keys citados na conversa

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Mensagens ───
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                        -- user | assistant
  content TEXT NOT NULL,
  mode TEXT DEFAULT 'text',                  -- text | voice
  audio_url TEXT,                            -- v2: URL do áudio se modo voz

  -- Metadados da geração (apenas para role=assistant)
  teachings_used TEXT[],                     -- quais ensinamentos o RAG recuperou
  safety_flag TEXT,                          -- null | crisis_detected | redirected

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Insights de Perfil (o "diário" que a IA mantém sobre a evolução) ───
CREATE TABLE IF NOT EXISTS profile_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES chat_users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id),
  insight_type TEXT NOT NULL,                -- theme | preference | progress | affinity
  insight_content TEXT NOT NULL,
  confidence REAL DEFAULT 0.5,               -- 0-1: confiança na inferência
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Embeddings dos Ensinamentos (RAG) ───
CREATE TABLE IF NOT EXISTS teaching_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teaching_key TEXT UNIQUE NOT NULL,         -- referência ao stoic_teachings
  content_text TEXT NOT NULL,                -- texto usado para o embedding
  embedding vector(1536),                    -- OpenAI text-embedding-3-small
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice de busca vetorial (cosine similarity)
CREATE INDEX IF NOT EXISTS idx_teaching_embeddings_vector
  ON teaching_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 20);

-- ─── Eventos de Segurança (auditoria LGPD + safety) ───
CREATE TABLE IF NOT EXISTS safety_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES chat_users(id),
  conversation_id UUID REFERENCES conversations(id),
  event_type TEXT NOT NULL,                  -- crisis_detected | resources_provided
  action_taken TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Função de busca semântica (RAG) ───
CREATE OR REPLACE FUNCTION match_teachings(
  query_embedding vector(1536),
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  teaching_key TEXT,
  content_text TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    te.teaching_key,
    te.content_text,
    1 - (te.embedding <=> query_embedding) AS similarity
  FROM teaching_embeddings te
  ORDER BY te.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ─── Índices ───
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_insights_user ON profile_insights(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_users_email ON chat_users(email);
