import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Variável obrigatória não definida: ${key}`);
  return val;
}

export const config = {
  anthropic: { apiKey: required("ANTHROPIC_API_KEY"), model: "claude-sonnet-4-6" as const },
  supabase: { url: required("SUPABASE_URL"), serviceKey: required("SUPABASE_SERVICE_KEY") },
  resend: { apiKey: required("RESEND_API_KEY") },
  email: {
    recipientEmail: process.env.RECIPIENT_EMAIL || "alexpiton@gmail.com",
    recipientName: process.env.RECIPIENT_NAME || "Alex",
    senderEmail: process.env.SENDER_EMAIL || "onboarding@resend.dev",
    senderName: process.env.SENDER_NAME || "Diário Estoico",
  },
  creator: {
    name: "Alex",
    handle: "diarioestoico",
    tone: "andrea-vermont", // direto, emocional, viral
    language: "pt-BR",
  },
  timezone: "America/Sao_Paulo",
};
