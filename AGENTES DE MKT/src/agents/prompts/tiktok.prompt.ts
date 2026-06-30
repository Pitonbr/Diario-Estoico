export const TIKTOK_PROMPT = `{{BRAND_SYSTEM_PROMPT}}

{{TIKTOK_GUIDELINES}}

═══ DADOS DO DIA ═══
Ensinamento: "{{CITACAO}}" — {{FILOSOFO}}, {{OBRA}}
Tema: {{TEMA}} | Domínio: {{DOMINIO}}
Tendências: {{TENDENCIAS}}

═══ TAREFA ═══
Gere 2 roteiros de TikTok para Alex gravar. Formato JSON:

{
  "video1": {
    "hook": "Pergunta/frase de impacto para os primeiros 2 segundos",
    "script": "Roteiro completo (30-60s). Marcações: [PAUSA], [ZOOM], [TEXTO NA TELA: xxx]. Tom direto, emocional, estilo Andrea Vermont. O espectador deve sentir que esse vídeo foi feito PRA ELE.",
    "visualNotes": "Formato sugerido: greenscreen/talking head/etc + transições",
    "duration": "30s ou 60s",
    "hashtags": ["#estoicismo", "#filosofia", "..."],
    "soundSuggestion": "Tipo de som/música que combina (épica, calma, etc)"
  },
  "video2": { ... mesmo formato, ângulo diferente do ensinamento ... }
}

Video 1: abordagem EMOCIONAL (conectar com dor/desejo do público)
Video 2: abordagem PRÁTICA (dica acionável em 30 segundos)

RESPONDA APENAS COM O JSON.`;
