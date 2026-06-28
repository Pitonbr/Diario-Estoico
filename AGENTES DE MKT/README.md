# 🏛️ Diário Estoico — Sistema Multi-Agente

Sistema de 8 agentes de IA que geram **todo o conteúdo** do Diário Estoico automaticamente, para todas as plataformas, todos os dias.

## Visão Geral

```
GitHub Actions (cron 7h BRT) ou VS Code (manual)
    │
    ├── Seleciona ensinamento estoico do dia (anti-repetição)
    ├── Busca eventos e tendências via web search
    │
    ├── ☕ Café Estoico ──→ Roteiro vídeo matinal (2-3 min)
    ├── 📸 Instagram ────→ Reels + Carrossel + Post + Stories
    ├── 🎵 TikTok ───────→ 2 vídeos (emocional + prático)
    ├── ▶️  YouTube ───────→ Short + Long-form (seg/qua)
    ├── 🐦 Twitter/X ────→ 4 tweets + Thread (ter/qui)
    ├── 📧 Newsletter ───→ Email completo + envio via Resend
    ├── 💬 Respostas ────→ Templates de resposta (semanal)
    └── 📊 Analytics ────→ Relatório semanal + sugestões
    │
    └── Salva tudo em output/YYYY-MM-DD/
        ├── *-roteiros.txt  (legível, pronto para gravar)
        └── *.json           (estruturado, pronto para automação)
```

## Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas chaves:

| Variável | Onde conseguir |
|---|---|
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `SUPABASE_URL` | [supabase.com/dashboard](https://supabase.com/dashboard) |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role key |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) |
| `RECIPIENT_EMAIL` | Seu email (alexpiton@gmail.com) |
| `SENDER_EMAIL` | Email verificado no Resend |

### 3. Setup do banco de dados (Supabase)

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Vá em **SQL Editor**
3. Cole o conteúdo de `src/database/migrations/001_initial_schema.sql`
4. Execute
5. Popule a base de ensinamentos:

```bash
npm run seed
```

### 4. Rodar

```bash
# Ver todos os comandos disponíveis
npm run help

# Rodar TODOS os agentes de uma vez
npm run all-daily

# Rodar um agente específico
npm run cafe          # ☕ Roteiro do vídeo matinal
npm run instagram     # 📸 Reels, carrossel, post, stories
npm run tiktok        # 🎵 2 vídeos TikTok
npm run youtube       # ▶️  Short + long-form
npm run twitter       # 🐦 Tweets + thread
npm run newsletter    # 📧 Email (gera E envia)
npm run responses     # 💬 Templates de resposta (semanal)
npm run analytics     # 📊 Relatório semanal
```

## Usando no VS Code

O projeto inclui configurações do VS Code prontas:

1. Abra a pasta `AGENTES/` no VS Code
2. Instale as extensões recomendadas (VS Code vai sugerir automaticamente)
3. Pressione `F5` e escolha qual agente rodar no dropdown:

```
▶ Pipeline Diário (TODOS)
☕ Café Estoico
📸 Instagram
🎵 TikTok
▶️ YouTube
🐦 Twitter/X
📧 Newsletter
📊 Preview Email
🌱 Seed Database
```

## Estrutura de Arquivos

```
AGENTES/
├── .vscode/
│   ├── launch.json           # 9 configs de debug (1 por agente)
│   ├── settings.json         # Formatação, TypeScript
│   └── extensions.json       # Extensões recomendadas
│
├── .github/workflows/
│   └── daily-content.yml     # Cron diário 7h BRT
│
├── data/
│   └── stoic-library.json    # 80+ ensinamentos validados
│
├── src/
│   ├── agents/               # ═══ OS 8 AGENTES ═══
│   │   ├── cafe-estoico-agent.ts    # ☕ Vídeo matinal diário
│   │   ├── instagram-agent.ts       # 📸 Reels + carrossel + post
│   │   ├── tiktok-agent.ts          # 🎵 2 vídeos virais
│   │   ├── youtube-agent.ts         # ▶️  Short + long-form
│   │   ├── twitter-agent.ts         # 🐦 Tweets + threads
│   │   ├── newsletter-agent.ts      # 📧 Email + envio
│   │   ├── response-manager.ts      # 💬 Templates de resposta
│   │   ├── analytics-agent.ts       # 📊 Relatório semanal
│   │   ├── stoic-knowledge.ts       # Seleção anti-repetição
│   │   ├── event-fetcher.ts         # Busca eventos do dia
│   │   ├── validator.ts             # Anti-alucinação (3 camadas)
│   │   └── prompts/
│   │       └── brand-voice.ts       # Voz da marca + guidelines
│   │
│   ├── orchestrator/         # ═══ ORQUESTRAÇÃO ═══
│   │   ├── daily-pipeline.ts        # Roda TODOS os agentes
│   │   └── run-single.ts           # Roda 1 agente por nome
│   │
│   ├── config/               # ═══ CONFIGURAÇÃO ═══
│   │   ├── env.ts                   # Variáveis de ambiente
│   │   ├── types.ts                 # Tipos compartilhados
│   │   ├── claude-api.ts            # Helper Claude API
│   │   └── calendar.ts             # Datas festivas BR
│   │
│   ├── database/             # ═══ SUPABASE ═══
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql
│   │   ├── client.ts
│   │   ├── queries.ts
│   │   └── seed.ts
│   │
│   └── email/                # ═══ EMAIL ═══
│       ├── templates/
│       │   └── diario-estoico.tsx   # Template React Email
│       └── sender.ts               # Integração Resend
│
├── output/                   # ═══ OUTPUTS (gitignored) ═══
│   └── YYYY-MM-DD/
│       ├── cafe-estoico-roteiros.txt
│       ├── instagram-roteiros.txt
│       ├── tiktok-roteiros.txt
│       ├── youtube-roteiros.txt
│       ├── twitter-roteiros.txt
│       ├── newsletter-roteiros.txt
│       ├── *.json
│       └── daily-summary.json
│
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

## Como os Agentes Funcionam

### Consistência Cross-Platform

Todos os agentes recebem o **mesmo ensinamento estoico do dia** e o **mesmo contexto** (eventos, tendências). Isso garante que o conteúdo é consistente entre plataformas — quem vê o Reels no Instagram reconhece o mesmo tema no tweet e na newsletter.

### Anti-Repetição

O sistema seleciona ensinamentos evitando:
- Repetir o mesmo ensinamento (tracking por `teaching_key`)
- Repetir o mesmo filósofo 3 dias seguidos
- Repetir o mesmo domínio prático (pessoal/financeiro/empreendedor)
- Ao usar todos os 80+ ensinamentos, reinicia o ciclo

### Anti-Alucinação

3 camadas de validação:
1. **Citação fixa**: toda citação vem do `stoic-library.json`, nunca gerada pela IA
2. **Match direto**: compara citação gerada com a original
3. **Revisor**: segunda chamada à API para verificar fatos

### Brand Voice

Todos os agentes compartilham o mesmo `brand-voice.ts` que define:
- Tom: Andrea Vermont (direto, emocional, impactante)
- Público: empreendedores brasileiros 25-50 anos
- Regras: nunca inventar citações, nunca tom de guru/coach genérico
- Guidelines específicas por plataforma (Instagram, TikTok, YouTube, Twitter)

## Stack Técnica

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js 20 + TypeScript |
| IA | Claude API (Sonnet 4.6) + Web Search |
| Banco de Dados | Supabase (PostgreSQL) |
| Email Template | React Email |
| Envio de Email | Resend |
| Scheduling | GitHub Actions (cron) |
| IDE | VS Code (configs incluídas) |

## GitHub Actions

O workflow `.github/workflows/daily-content.yml` roda automaticamente às 7h BRT (10h UTC) e:

1. Executa o pipeline diário completo
2. Salva os outputs como artifacts do GitHub (30 dias de retenção)

Para configurar, adicione os secrets no GitHub:
- `ANTHROPIC_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `RESEND_API_KEY`
- `RECIPIENT_EMAIL`

## Fluxo de Trabalho Diário

```
07:00  GitHub Actions dispara o pipeline
07:01  Agentes geram todo o conteúdo (~2 min)
07:03  Alex abre output/ no VS Code
07:05  Grava Café Estoico usando roteiro de cafe-estoico-roteiros.txt
07:20  Posta Reels/TikTok/Short usando roteiros de instagram/tiktok/youtube
07:30  Revisa e programa tweets do dia
08:00  Newsletter enviada automaticamente
```

## Licença

MIT
