import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  return val;
}

export const config = {
  anthropic: {
    apiKey: required("ANTHROPIC_API_KEY"),
    model: "claude-sonnet-4-6" as const,
  },
  supabase: {
    url: required("SUPABASE_URL"),
    serviceKey: required("SUPABASE_SERVICE_KEY"),
  },
  resend: {
    apiKey: required("RESEND_API_KEY"),
  },
  email: {
    recipientEmail: process.env.RECIPIENT_EMAIL || "alexpiton@gmail.com",
    recipientName: process.env.RECIPIENT_NAME || "Alex",
    senderEmail: process.env.SENDER_EMAIL || "onboarding@resend.dev",
    senderName: process.env.SENDER_NAME || "Diário Estoico",
  },
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  },
  timezone: process.env.TZ || "America/Sao_Paulo",
  nodeEnv: process.env.NODE_ENV || "development",
};
