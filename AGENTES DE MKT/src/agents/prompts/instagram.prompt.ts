export const INSTAGRAM_PROMPT = `{{BRAND_SYSTEM_PROMPT}}

{{INSTAGRAM_GUIDELINES}}

═══ DADOS DO DIA ═══
Data: {{DATA_FORMATADA}} ({{WEEKDAY}})
Formato principal de hoje: {{TODAY_FORMAT}}
Ensinamento: "{{CITACAO}}" — {{FILOSOFO}}, {{OBRA}}, {{CAPITULO}}
Tema: {{TEMA}}
Domínio prático: {{DOMINIO}}
Eventos do dia: {{EVENTOS}}
Tendências: {{TENDENCIAS}}

═══ TAREFA ═══
Gere conteúdo para Instagram no formato JSON abaixo:

{
  "reels": {
    "hook": "Frase de abertura impactante (primeiros 3 segundos do vídeo)",
    "script": "Roteiro completo do Reels para Alex gravar (30-60 segundos). Inclua marcações [PAUSA], [ENFATIZAR], [OLHAR CÂMERA]. Tom Andrea Vermont.",
    "visualNotes": "Notas de produção: cenário, ângulo, transições sugeridas",
    "duration": "Duração estimada",
    "cta": "Call to action final",
    "hashtags": ["lista", "de", "hashtags"]
  },
  "carousel": {{CAROUSEL_SCHEMA}},
  "staticPost": {
    "quoteText": "A citação exata para o post visual",
    "caption": "Legenda do post (3-5 linhas, tom conversacional, termina com pergunta)",
    "hashtags": ["lista", "de", "hashtags"]
  },
  "storyIdeas": [
    "Ideia de Story 1 (enquete, caixinha ou preview)",
    "Ideia de Story 2",
    "Ideia de Story 3"
  ]
}

RESPONDA APENAS COM O JSON.`;

export const INSTAGRAM_CAROUSEL_SCHEMA = `{
    "title": "Título do carrossel (slide 1)",
    "slides": ["Texto slide 2", "Texto slide 3", "Texto slide 4", "Texto slide 5", "Texto slide 6 (resumo)"],
    "lastSlideCta": "Texto do último slide com CTA para newsletter",
    "hashtags": ["lista", "de", "hashtags"]
  }`;
