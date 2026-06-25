# 🏛️ Diário Estoico

Agente autônomo que envia uma newsletter diária sobre Estoicismo, conectando sabedoria antiga com eventos atuais de negócios, empreendedorismo e desenvolvimento pessoal.

## Arquitetura

```
GitHub Actions (cron 8h BRT)
  → Seleciona ensinamento (anti-repetição via Supabase)
  → Busca eventos do dia (calendário + web search)
  → Gera conteúdo via Claude API (Sonnet 4.6)
  → Valida (double-check anti-alucinação)
  → Renderiza email HTML (React Email, design greco-clássico)
  → Envia via Resend
  → Registra no Supabase
```

## Stack

| Componente | Tecnologia |
|---|---|
| Runtime | Node.js 20 + TypeScript |
| IA | Claude API (Sonnet 4.6) + Web Search |
| Banco de Dados | Supabase (PostgreSQL) |
| Email Template | React Email |
| Envio de Email | Resend |
| Scheduling | GitHub Actions (cron) |

## Setup

### 1. Clone e instale

```bash
git clone https://github.com/Pitonbr/diario-estoico.git
cd diario-estoico
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas chaves:
#   ANTHROPIC_API_KEY  → https://console.anthropic.com
#   SUPABASE_URL       → https://supabase.com/dashboard
#   SUPABASE_SERVICE_KEY
#   RESEND_API_KEY     → https://resend.com/api-keys
#   RECIPIENT_EMAIL    → seu email
#   SENDER_EMAIL       → email verificado no Resend
```

### 3. Configure o Supabase

Crie um novo projeto no Supabase e execute a migração:

```bash
# No Supabase SQL Editor, cole o conteúdo de:
# src/database/migrations/001_initial_schema.sql
```

### 4. Popule a base de ensinamentos

```bash
npm run seed
```

### 5. Teste localmente

```bash
# Preview do template (gera preview.html)
npm run preview

# Envio real de teste
npm run dev
```

### 6. Configure GitHub Actions

No repositório GitHub, vá em **Settings → Secrets and variables → Actions** e adicione:

| Secret | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | Sua chave da API Anthropic |
| `SUPABASE_URL` | URL do seu projeto Supabase |
| `SUPABASE_SERVICE_KEY` | Service role key do Supabase |
| `RESEND_API_KEY` | Sua chave da API Resend |
| `RECIPIENT_EMAIL` | alexpiton@gmail.com |
| `RECIPIENT_NAME` | Alex |
| `SENDER_EMAIL` | Email verificado no Resend |

## Estrutura do Projeto

```
diario-estoico/
├── .github/workflows/       # Cron diário GitHub Actions
├── src/
│   ├── agent/               # Motor de geração de conteúdo
│   │   ├── content-generator.ts   # Orquestrador principal
│   │   ├── stoic-knowledge.ts     # Seleção de ensinamentos
│   │   ├── event-fetcher.ts       # Busca eventos/tendências
│   │   ├── validator.ts           # Anti-alucinação (3 camadas)
│   │   └── prompts/              # Templates de prompt
│   ├── email/               # Templates e envio
│   │   ├── templates/            # React Email components
│   │   └── sender.ts            # Integração Resend
│   ├── database/            # Supabase client e queries
│   ├── channels/            # (futuro) Social media
│   └── config/              # Env, calendário
├── data/                    # Base bibliográfica JSON
└── package.json
```

## Anti-Repetição

O sistema garante conteúdo único através de:

1. **Banco de dados**: registra toda newsletter enviada com `teaching_key`
2. **Rotação de filósofos**: evita repetir o mesmo filósofo por 3 dias seguidos
3. **Rotação de domínios**: alterna entre pessoal, financeiro e empreendedor
4. **Hash de conteúdo**: detecta duplicatas exatas via SHA-256
5. **Ciclo completo**: ao usar todos os ~80 ensinamentos, reinicia o ciclo

## Anti-Alucinação

Validação em 3 camadas:

1. **Citação fixa**: toda citação vem do `stoic-library.json`, nunca gerada pela IA
2. **Match direto**: compara citação gerada com a original (corrige se diferir)
3. **Revisor Claude**: segunda chamada à API como "revisor" detecta fatos inventados

## Expansão Futura

A estrutura já inclui:

- `src/channels/` — módulos para Instagram, LinkedIn, Twitter
- `channel_posts` table — rastreia publicações por canal
- `distribution_channels` table — configuração de canais
- `sendToList()` — envio para múltiplos destinatários

## Comandos

| Comando | Descrição |
|---|---|
| `npm run dev` | Executa pipeline completo (dev) |
| `npm run preview` | Gera preview.html do template |
| `npm run seed` | Popula base de ensinamentos |
| `npm run build` | Compila TypeScript |
| `npm start` | Executa pipeline (produção) |

## Licença

MIT
