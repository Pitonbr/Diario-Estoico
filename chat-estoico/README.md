# 🏛️ Chat Estoico

IA de conversação socrática do ecossistema **Empreender Estoico**. Um mentor de reflexão que nunca prescreve — conduz por perguntas e exemplos dos grandes estoicos, aprendendo o estilo de cada pessoa a cada conversa.

## Ecossistema

```
EMPREENDER ESTOICO (matriz)
├── Produto 1: Diário Estoico (newsletter diária)
└── Produto 2: Chat Estoico (este repositório)
    └── Compartilha a mesma base Supabase (stoic_teachings)
```

## Como Funciona

```
Mensagem do usuário
    │
    ▼
1. SEGURANÇA ─── triagem de crise (2 camadas)
    │              └── se crise: acolhe + CVV 188 (nunca filosofa crise)
    ▼
2. PERFIL ────── carrega memória: estilo, temas, última conversa
    ▼
3. RAG ───────── busca semântica nos ensinamentos (pgvector)
    │              └── única fonte de citações (zero alucinação)
    ▼
4. MOTOR ─────── Claude + system prompt socrático
    │              └── regra dura: NUNCA prescreve ação
    ▼
5. MEMÓRIA ───── ao fim da conversa: resumo, temas, insights
                   └── perfil evolui a cada sessão
```

### O "Machine Learning" Adaptativo

O sistema aprende cada usuário em 4 níveis — sem treinar modelos, usando arquitetura moderna de memória + RAG:

| Nível | Quando | O que aprende |
|---|---|---|
| Onboarding | 1x no cadastro | Estilo, familiaridade, áreas de foco, idioma |
| Tempo real | Cada mensagem | Ajuste de tom dentro da conversa |
| Pós-sessão | Fim de cada conversa | Resumo, temas recorrentes, insights verbalizados pela pessoa |
| Afinidade | Contínuo | Com quais filósofos/temas a pessoa mais ressoa |

### Regras Invioláveis do Motor

1. **Nunca prescreve ações** — proibido "você deve", "faça", "recomendo"
2. **Conduz por perguntas socráticas e exemplos históricos**
3. **Toda citação vem do RAG** — jamais gera citações
4. **Valida emoção antes da razão**
5. **Crise = sai do modo filosófico** → acolhimento + CVV 188
6. **Máx 3 parágrafos** — conversa, não palestra
7. **Espelha o idioma do usuário**

### Técnicas Psicológicas Implementadas

- **Questionamento Socrático** (clarificação → evidência → perspectiva → implicação)
- **Entrevista Motivacional** (evocar razões da própria pessoa)
- **Reestruturação cognitiva** (TCC — herdeira direta de Epicteto)
- **Self-distancing** (Ethan Kross — a "Vista do Alto" validada em laboratório)
- **Modelagem por exemplar** (histórias dos estoicos no lugar de conselhos)
- **Validação emocional antes da razão**

## Setup

### Pré-requisitos
- Node.js 20+
- Conta Supabase (mesma instância do Diário Estoico)
- API keys: Anthropic + OpenAI (embeddings)

### 1. Banco de dados

No Supabase SQL Editor, execute:
```
backend/src/database/migrations/001_chat_schema.sql
```
(Requer a extensão `vector` — disponível em todos os projetos Supabase)

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env    # preencha as chaves
npm run seed-embeddings  # gera vetores do RAG (1x)
npm run dev              # API em localhost:3333
```

### 3. Testar o motor (sem front-end)

```bash
npm run test-engine
```
Simula uma conversa completa e verifica as regras (nenhuma prescrição, termina com pergunta).

### 4. PWA

```bash
cd pwa
npm install
npm run dev              # localhost:5173 (proxy → backend)
```

## VS Code

Abra a pasta raiz no VS Code. `F5` → escolha:
- 🏛️ Backend (API) — servidor com hot reload
- 🧪 Testar Motor de Conversa — simulação local
- 🌱 Seed Embeddings — gerar vetores RAG

## Estrutura

```
chat-estoico/
├── backend/
│   └── src/
│       ├── engine/
│       │   ├── socratic-prompt.ts      # ❤️ Coração: regras do mentor
│       │   ├── conversation-engine.ts  # Pipeline por mensagem
│       │   ├── rag.ts                  # Busca semântica (pgvector)
│       │   ├── memory-processor.ts     # Aprendizado pós-conversa
│       │   ├── onboarding.ts           # Quiz + mapeamento de perfil
│       │   └── test-conversation.ts    # Teste local do motor
│       ├── safety/
│       │   └── crisis-detection.ts     # 2 camadas de detecção
│       ├── routes/  (server.ts)        # API Fastify
│       └── database/
│           ├── migrations/             # Schema (pgvector incluso)
│           └── seed-embeddings.ts      # Gera vetores RAG
├── pwa/
│   └── src/
│       ├── pages/
│       │   ├── OnboardingPage.tsx      # Termos LGPD + quiz
│       │   └── ChatPage.tsx            # Interface de conversa
│       ├── lib/
│       │   ├── api.ts                  # Cliente da API
│       │   └── legal-texts.ts          # Termos + Privacidade v1.0.0
│       └── styles/global.css           # Design pergaminho/pedra
└── docs/                               # Documentação adicional
```

## Freemium

- Plano free: 50 mensagens/mês (configurável em `server.ts`)
- Contador com reset automático a cada 30 dias
- Preparado para plano premium (campo `plan` no banco)

## LGPD

- ✅ Aceite obrigatório de Termos + Privacidade antes do onboarding
- ✅ Consentimento explícito para dados sensíveis de conversa
- ✅ Exportação completa de dados (`GET /lgpd/export/:userId`)
- ✅ Direito ao esquecimento (`DELETE /lgpd/delete/:userId` — cascade)
- ✅ Auditoria de eventos de segurança (`safety_events`)
- ⚠️ Recomendação: revisão jurídica dos textos antes do lançamento público

## Preparado para V2 (Voz)

- Campo `mode` (`text | voice`) em conversas e mensagens
- Campo `audio_url` em mensagens
- Botão de voz no PWA (desabilitado, com tooltip "em breve")
- Fluxo planejado: Whisper (STT) → mesmo pipeline → TTS

## Beta (10 usuários)

Custo estimado por conversa de texto: R$0,15-0,50 (Claude + embeddings).
Com 10 usuários ativos: ~R$50-150/mês em API.

## Roadmap

- [x] Fase 1: Motor + RAG + Segurança + Onboarding + PWA texto
- [ ] Fase 2: Modo voz (Whisper + TTS)
- [ ] Fase 3: Expandir biblioteca (80 → 200+ ensinamentos)
- [ ] Fase 4: Billing premium (Stripe)
- [ ] Fase 5: App nativo (React Native)
