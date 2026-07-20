-- Migração 004: Sistema de convites presentes + templates de email + métricas sociais

-- ══════════════════════════════
-- CONVITES PRESENTES (gift invites)
-- ══════════════════════════════

CREATE TABLE IF NOT EXISTS gift_invites (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token         UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  display_name  TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,                        -- WhatsApp/SMS (ex: 5511999999999)
  products      TEXT[] NOT NULL DEFAULT '{}', -- 'newsletter' | 'chat'
  duration_days INTEGER NOT NULL DEFAULT 7,   -- 7 ou 30 dias
  notes         TEXT,                         -- observações do admin
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'activated', 'expired')),
  email_sent_at TIMESTAMPTZ,
  activated_at  TIMESTAMPTZ,
  activated_user_id UUID REFERENCES chat_users(id) ON DELETE SET NULL,
  expires_at    TIMESTAMPTZ,                  -- definido no momento da ativação
  created_by    TEXT DEFAULT 'admin',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_invites_token   ON gift_invites(token);
CREATE INDEX IF NOT EXISTS idx_gift_invites_email   ON gift_invites(email);
CREATE INDEX IF NOT EXISTS idx_gift_invites_status  ON gift_invites(status);
CREATE INDEX IF NOT EXISTS idx_gift_invites_created ON gift_invites(created_at DESC);

-- ══════════════════════════════
-- TEMPLATES DE EMAIL
-- ══════════════════════════════

CREATE TABLE IF NOT EXISTS email_templates (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_key TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  subject      TEXT NOT NULL,
  html_body    TEXT NOT NULL,
  text_body    TEXT,
  variables    JSONB DEFAULT '[]',  -- lista de variáveis disponíveis
  active       BOOLEAN DEFAULT TRUE,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Template: Convite presente
INSERT INTO email_templates (template_key, name, subject, html_body, text_body, variables)
VALUES (
  'gift_invite',
  'Convite Presente — Acesso Exclusivo',
  'Você recebeu um presente especial — {{display_name}}',
  $HTML$<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Seu presente estoico chegou</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background-color: #f0ebe0; font-family: Georgia, ''Times New Roman'', serif; }
  .wrapper { padding: 40px 20px; }
  .container { max-width: 560px; margin: 0 auto; background: #1c1c18; border-radius: 4px; overflow: hidden; }
  .header { padding: 48px 48px 32px; border-bottom: 1px solid #2e2e24; }
  .brand { color: #9a7c35; font-size: 10px; letter-spacing: 4px; text-transform: uppercase; font-family: Arial, sans-serif; margin-bottom: 20px; }
  .title { color: #f0ebe0; font-size: 30px; line-height: 1.35; font-weight: normal; }
  .title strong { color: #c9a227; font-style: italic; }
  .body { padding: 36px 48px; color: #c4bdb0; line-height: 1.85; font-size: 15px; }
  .body p { margin-bottom: 18px; }
  .accent { color: #c9a227; }
  .quote-block { border-left: 3px solid #c9a227; padding: 4px 0 4px 20px; margin: 28px 0; }
  .quote-text { color: #8a8070; font-style: italic; font-size: 14px; line-height: 1.7; }
  .quote-author { color: #6a6050; font-size: 12px; margin-top: 8px; letter-spacing: 1px; font-family: Arial, sans-serif; text-transform: uppercase; }
  .products-box { background: #141410; border: 1px solid #2e2e24; border-radius: 4px; padding: 20px 24px; margin: 20px 0 28px; }
  .products-box-title { color: #6a6050; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; font-family: Arial, sans-serif; margin-bottom: 12px; }
  .product-item { color: #c9a227; font-size: 14px; padding: 4px 0; }
  .product-item::before { content: "✦ "; }
  .duration-badge { display: inline-block; background: #2e2e24; color: #c9a227; font-size: 12px; padding: 6px 16px; border-radius: 2px; margin-top: 8px; font-family: Arial, sans-serif; letter-spacing: 1px; }
  .cta-section { padding: 0 48px 40px; text-align: center; }
  .cta-button { display: inline-block; background: #c9a227; color: #1c1c18; padding: 18px 48px; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border-radius: 2px; }
  .cta-button:hover { background: #dab52e; }
  .cta-note { margin-top: 16px; color: #4a4a40; font-size: 12px; font-family: Arial, sans-serif; }
  .footer { padding: 24px 48px; border-top: 1px solid #2e2e24; }
  .footer p { color: #4a4a40; font-size: 11px; font-family: Arial, sans-serif; line-height: 1.6; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="container">
    <div class="header">
      <p class="brand">Empreender Estoico</p>
      <h1 class="title">{{display_name}},<br>você foi <strong>escolhido(a).</strong></h1>
    </div>
    <div class="body">
      <p>Poucos chegam até aqui.</p>
      <p>O que está prestes a receber não é apenas um acesso — é um convite para entrar em contato com uma forma diferente de pensar, de sentir e de conduzir a vida com propósito.</p>
      <p>O Empreender Estoico reúne um <span class="accent">grupo seleto de pessoas</span> que escolheram a sabedoria antes do ruído, a clareza antes da reação impulsiva, e o desenvolvimento interior antes das aparências.</p>

      <div class="quote-block">
        <p class="quote-text">"A felicidade da sua vida depende da qualidade dos seus pensamentos. Tudo depende da interpretação que damos às coisas."</p>
        <p class="quote-author">— Marco Aurélio, Meditações</p>
      </div>

      <p>Preparamos especialmente para você acesso completo e <span class="accent">gratuito por {{duration_days}} dias</span> ao seguinte:</p>

      <div class="products-box">
        <p class="products-box-title">Seu presente inclui</p>
        {{products_list}}
        <div>
          <span class="duration-badge">{{duration_days}} dias de acesso gratuito</span>
        </div>
      </div>

      <p>Clique no botão abaixo para ativar seu acesso e começar agora a sua jornada pelo mais alto nível da inteligência estoica.</p>
    </div>
    <div class="cta-section">
      <a href="{{gift_link}}" class="cta-button">Ativar meu presente →</a>
      <p class="cta-note">Convite pessoal · Válido por {{duration_days}} dias a partir do clique</p>
    </div>
    <div class="footer">
      <p>Você recebeu este email porque foi indicado(a) pessoalmente para o Empreender Estoico.<br>
      Este convite é intransferível e válido por {{duration_days}} dias após a ativação.</p>
      <p style="margin-top:8px;">Empreender Estoico · São Paulo, Brasil</p>
    </div>
  </div>
</div>
</body>
</html>$HTML$,
  'Olá {{display_name}},

Você foi escolhido(a) para fazer parte de um grupo seleto de pessoas com acesso ao Empreender Estoico.

Seu presente: {{duration_days}} dias de acesso gratuito a:
{{products_text}}

Ative agora: {{gift_link}}

Este convite é pessoal e válido por {{duration_days}} dias a partir do clique.

— Empreender Estoico',
  '["display_name","duration_days","products_list","products_text","gift_link"]'::jsonb
)
ON CONFLICT (template_key) DO NOTHING;

-- ══════════════════════════════
-- MÉTRICAS SOCIAIS (input manual)
-- ══════════════════════════════

CREATE TABLE IF NOT EXISTS social_metrics (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform   TEXT UNIQUE NOT NULL,
  followers  INTEGER DEFAULT 0,
  handle     TEXT,
  profile_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO social_metrics (platform, followers, handle) VALUES
  ('instagram', 0, ''),
  ('tiktok',    0, ''),
  ('youtube',   0, ''),
  ('facebook',  0, '')
ON CONFLICT (platform) DO NOTHING;

-- ══════════════════════════════
-- ALTERAR TABELAS EXISTENTES
-- ══════════════════════════════

-- chat_users: telefone + trial de plano premium
ALTER TABLE chat_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE chat_users ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ;
ALTER TABLE chat_users ADD COLUMN IF NOT EXISTS gift_invite_id UUID REFERENCES gift_invites(id) ON DELETE SET NULL;

-- subscribers: vínculo com convite + trial
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS gift_invite_id UUID REFERENCES gift_invites(id) ON DELETE SET NULL;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ;
