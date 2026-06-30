export interface IntegrationStatus {
  key: string;
  label: string;
  emoji: string;
  status: "ok" | "error" | "paused" | "unknown";
  message: string;
  docsUrl?: string;
  dashboardUrl?: string;
}

export async function checkIntegrations(): Promise<IntegrationStatus[]> {
  const results = await Promise.allSettled([
    checkSupabase(),
    checkResend(),
    checkAnthropic(),
    checkGitHub(),
  ]);

  const statuses = results.map((r) =>
    r.status === "fulfilled" ? r.value : ({ ...r.reason, status: "error" } as IntegrationStatus)
  );

  // Serviços que não têm check automatizado
  statuses.push(
    {
      key: "vercel",
      label: "Vercel",
      emoji: "▲",
      status: "ok",
      message: "Painel admin em produção",
      dashboardUrl: "https://vercel.com/pitonbrs-projects/diario-estoico-admin",
    },
    {
      key: "whatsapp",
      label: "WhatsApp (Meta)",
      emoji: "💬",
      status: "paused",
      message: "Pausado — aguardando verificação de negócio Meta",
      docsUrl: "https://business.facebook.com",
    }
  );

  return statuses;
}

async function checkSupabase(): Promise<IntegrationStatus> {
  try {
    const url = process.env.SUPABASE_URL;
    if (!url) throw new Error("SUPABASE_URL não configurado");
    const res = await fetch(`${url}/rest/v1/subscribers?select=id&limit=1`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_KEY ?? "",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY ?? ""}`,
      },
      signal: AbortSignal.timeout(5000),
    });
    return {
      key: "supabase",
      label: "Supabase",
      emoji: "🗄️",
      status: res.ok ? "ok" : "error",
      message: res.ok ? "Banco de dados conectado" : `HTTP ${res.status}`,
      dashboardUrl: "https://supabase.com/dashboard/project/oqemuvihrmaohgkuxqtm",
    };
  } catch (e) {
    return { key: "supabase", label: "Supabase", emoji: "🗄️", status: "error", message: String(e) };
  }
}

async function checkResend(): Promise<IntegrationStatus> {
  try {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY não configurado");
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    });
    return {
      key: "resend",
      label: "Resend (email)",
      emoji: "📧",
      status: res.ok ? "ok" : "error",
      message: res.ok ? "API de email conectada" : `HTTP ${res.status}`,
      dashboardUrl: "https://resend.com/overview",
    };
  } catch (e) {
    return { key: "resend", label: "Resend (email)", emoji: "📧", status: "error", message: String(e) };
  }
}

async function checkAnthropic(): Promise<IntegrationStatus> {
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY não configurado");
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
      signal: AbortSignal.timeout(5000),
    });
    return {
      key: "anthropic",
      label: "Anthropic (IA)",
      emoji: "🤖",
      status: res.ok ? "ok" : "error",
      message: res.ok ? "API de IA conectada" : `HTTP ${res.status}`,
      dashboardUrl: "https://console.anthropic.com",
    };
  } catch (e) {
    return { key: "anthropic", label: "Anthropic (IA)", emoji: "🤖", status: "error", message: String(e) };
  }
}

async function checkGitHub(): Promise<IntegrationStatus> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("GITHUB_TOKEN não configurado");
    const res = await fetch("https://api.github.com/repos/Pitonbr/Diario-Estoico", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(5000),
    });
    return {
      key: "github",
      label: "GitHub",
      emoji: "🐙",
      status: res.ok ? "ok" : "error",
      message: res.ok ? "Repositório acessível" : `HTTP ${res.status}`,
      dashboardUrl: "https://github.com/Pitonbr/Diario-Estoico",
    };
  } catch (e) {
    return { key: "github", label: "GitHub", emoji: "🐙", status: "error", message: String(e) };
  }
}
