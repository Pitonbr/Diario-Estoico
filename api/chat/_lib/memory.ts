import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "./db";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export async function processEndedConversation(conversationId: string): Promise<void> {
  const db = getDb();

  const { data: convo } = await db.from("conversations").select("id, user_id")
    .eq("id", conversationId).single();
  if (!convo) return;

  const { data: messages } = await db.from("messages").select("role, content")
    .eq("conversation_id", conversationId).order("created_at", { ascending: true });
  if (!messages || messages.length < 4) return;

  const transcript = messages
    .map(m => `${m.role === "user" ? "PESSOA" : "CHAT"}: ${m.content}`)
    .join("\n\n");

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    temperature: 0.3,
    messages: [{
      role: "user",
      content: `Analise esta conversa e extraia aprendizados sobre a pessoa.\n\nCONVERSA:\n${transcript.slice(0, 10000)}\n\nResponda APENAS JSON:\n{\n  "summary": "Resumo em 2-3 frases",\n  "themes": ["temas, máx 4"],\n  "userInsights": ["insights que A PRÓPRIA PESSOA verbalizou, máx 3"],\n  "communicationSignals": {"tone": "direto|reflexivo", "depth": "pratico|filosofico", "pace": "rapido|explorador", "formality": "informal|formal", "emotional_expression": "alto|medio|baixo"},\n  "lifeContextUpdates": {"focus_areas": [], "recurring_themes": []}\n}`,
    }],
  });

  const textBlock = response.content.find(b => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return;

  let analysis: {
    summary: string; themes: string[]; userInsights: string[];
    communicationSignals: Record<string, string>;
    lifeContextUpdates: { focus_areas: string[]; recurring_themes: string[] };
  };
  try {
    analysis = JSON.parse(textBlock.text.replace(/```json\n?|```\n?/g, "").trim());
  } catch { return; }

  await db.from("conversations").update({
    ended_at: new Date().toISOString(),
    session_summary: analysis.summary,
    themes_discussed: analysis.themes,
    user_insights: analysis.userInsights,
  }).eq("id", conversationId);

  const { data: profile } = await db.from("user_profiles")
    .select("communication_style, life_context").eq("user_id", convo.user_id).single();

  const existingContext = (profile?.life_context || {}) as Record<string, unknown>;
  const newFocus = [...new Set([
    ...((existingContext.focus_areas as string[]) || []),
    ...(analysis.lifeContextUpdates.focus_areas || [])
  ])].slice(0, 10);
  const newThemes = [...new Set([
    ...((existingContext.recurring_themes as string[]) || []),
    ...(analysis.lifeContextUpdates.recurring_themes || [])
  ])].slice(0, 10);

  await db.from("user_profiles").update({
    communication_style: analysis.communicationSignals,
    life_context: { ...existingContext, focus_areas: newFocus, recurring_themes: newThemes },
    updated_at: new Date().toISOString(),
  }).eq("user_id", convo.user_id);

  if (analysis.userInsights.length > 0) {
    await db.from("profile_insights").insert(
      analysis.userInsights.map(insight => ({
        user_id: convo.user_id, conversation_id: conversationId,
        insight_type: "progress", insight_content: insight, confidence: 0.8,
      }))
    );
  }
}
