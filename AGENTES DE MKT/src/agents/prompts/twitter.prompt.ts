export const TWITTER_PROMPT = `{{BRAND_SYSTEM_PROMPT}}

{{TWITTER_GUIDELINES}}

═══ DADOS DO DIA ═══
Ensinamento: "{{CITACAO}}" — {{FILOSOFO}}, {{OBRA}}
Tema: {{TEMA}} | Domínio: {{DOMINIO}}
Gerar thread hoje: {{IS_THREAD_DAY}}
Eventos: {{EVENTOS}}
Tendências: {{TENDENCIAS}}

═══ TAREFA ═══
{
  "morningTweet": { "text": "Tweet matinal (máx 280 chars). Reflexão do dia, tom inspirador.", "hashtags": ["#estoicismo"] },
  "citationTweet": { "text": "Citação estoica + aplicação em 1 frase (máx 280 chars)", "hashtags": [] },
  "engagementTweet": { "text": "Pergunta provocadora para gerar respostas (máx 280 chars)", "hashtags": [] },
  "eveningTweet": { "text": "Reflexão noturna ou dica prática para encerrar o dia (máx 280 chars)", "hashtags": [] },
  "thread": {{THREAD_SCHEMA}}
}

CADA tweet deve ter EXATAMENTE no máximo 280 caracteres.
RESPONDA APENAS COM O JSON.`;

export const TWITTER_THREAD_SCHEMA = `{
    "tweets": [
      "Tweet 1: Hook (curiosidade/polêmica, máx 280 chars)",
      "Tweet 2: Contexto histórico (máx 280 chars)",
      "Tweet 3: O ensinamento central (máx 280 chars)",
      "Tweet 4: Aplicação prática moderna (máx 280 chars)",
      "Tweet 5: Exemplo real de negócios/vida (máx 280 chars)",
      "Tweet 6: Conclusão + CTA (assine o Diário Estoico, link na bio)"
    ],
    "hashtags": ["#estoicismo", "#filosofia"]
  }`;
