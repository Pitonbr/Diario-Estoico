import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Variável obrigatória: ${key}`);
  return val;
}

export const config = {
  anthropic: { apiKey: required("ANTHROPIC_API_KEY"), model: "claude-sonnet-4-6" as const },
  openai: { apiKey: required("OPENAI_API_KEY") },
  supabase: { url: required("SUPABASE_URL"), serviceKey: required("SUPABASE_SERVICE_KEY") },
  port: parseInt(process.env.PORT || "3333"),
  nodeEnv: process.env.NODE_ENV || "development",
};
