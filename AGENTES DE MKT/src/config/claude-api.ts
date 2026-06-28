import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config/env";

const anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });

/**
 * Chamada genérica ao Claude com parsing de JSON seguro
 */
export async function callClaude(prompt: string, maxTokens = 2000): Promise<string> {
  const response = await anthropic.messages.create({
    model: config.anthropic.model,
    max_tokens: maxTokens,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("Claude não retornou texto");
  return text.text;
}

/**
 * Chamada ao Claude com web search para tendências do dia
 */
export async function callClaudeWithSearch(prompt: string, maxTokens = 1000): Promise<string> {
  const response = await anthropic.messages.create({
    model: config.anthropic.model,
    max_tokens: maxTokens,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{ role: "user", content: prompt }],
  });
  const text = response.content.find((b) => b.type === "text");
  return text && text.type === "text" ? text.text : "";
}

/**
 * Parse seguro de JSON retornado pelo Claude
 */
export function parseClaudeJson<T>(raw: string): T {
  const clean = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean) as T;
}
