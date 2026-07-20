import { createClient } from "@/lib/supabase/server";

// ══════════════════════════════
// MÉTRICAS GERAIS
// ══════════════════════════════

export async function getChatOverviewMetrics() {
  const db = await createClient();

  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: newUsersWeek },
    { count: totalConversations },
    { count: conversationsToday },
    { count: pendingAlerts },
    { data: npsData },
    { count: blockedUsers },
  ] = await Promise.all([
    db.from("chat_users").select("id", { count: "exact", head: true }),
    db.from("chat_users").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    db.from("conversations").select("id", { count: "exact", head: true }),
    db.from("conversations").select("id", { count: "exact", head: true }).gte("started_at", `${today}T00:00:00`),
    db.from("chat_admin_alerts").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db.from("chat_nps").select("score"),
    db.from("chat_users").select("id", { count: "exact", head: true }).not("blocked_at", "is", null),
  ]);

  const scores = (npsData || []).map(n => n.score);
  const avgNps = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10
    : null;

  return {
    totalUsers: totalUsers ?? 0,
    newUsersWeek: newUsersWeek ?? 0,
    totalConversations: totalConversations ?? 0,
    conversationsToday: conversationsToday ?? 0,
    pendingAlerts: pendingAlerts ?? 0,
    avgNps,
    totalNpsResponses: scores.length,
    blockedUsers: blockedUsers ?? 0,
  };
}

// ══════════════════════════════
// ALERTAS
// ══════════════════════════════

export async function getChatAlerts(status = "pending", limit = 50) {
  const db = await createClient();
  const { data } = await db.from("chat_admin_alerts")
    .select(`
      id, alert_type, severity, trigger_message, status,
      admin_notes, reviewed_at, created_at,
      user_id, conversation_id
    `)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getChatAlertCounts() {
  const db = await createClient();
  const { data } = await db.from("chat_admin_alerts")
    .select("status");

  const counts = { pending: 0, approved: 0, user_blocked: 0, conversation_ended: 0 };
  for (const row of data ?? []) {
    const s = row.status as keyof typeof counts;
    if (s in counts) counts[s]++;
  }
  return counts;
}

// ══════════════════════════════
// USUÁRIOS
// ══════════════════════════════

export async function getChatUsers(limit = 100) {
  const db = await createClient();
  const { data } = await db.from("chat_users")
    .select("id, email, display_name, plan, monthly_message_count, created_at, blocked_at, block_reason")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getChatUserStats(userId: string) {
  const db = await createClient();
  const [
    { data: profile },
    { count: totalConvos },
    { data: lastConvo },
    { data: alerts },
  ] = await Promise.all([
    db.from("user_profiles")
      .select("communication_style, life_context, philosophical_affinity")
      .eq("user_id", userId).single(),
    db.from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    db.from("conversations")
      .select("started_at, session_summary")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1).single(),
    db.from("chat_admin_alerts")
      .select("alert_type, created_at, status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return {
    profile: profile ?? null,
    totalConversations: totalConvos ?? 0,
    lastConversation: lastConvo ?? null,
    alerts: alerts ?? [],
  };
}

// ══════════════════════════════
// ANALYTICS
// ══════════════════════════════

export async function getTopThemes(days = 30, limit = 15) {
  const db = await createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await db.from("conversations")
    .select("themes_discussed")
    .not("themes_discussed", "is", null)
    .gte("started_at", since);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    for (const theme of (row.themes_discussed as string[]) ?? []) {
      counts[theme] = (counts[theme] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([theme, count]) => ({ theme, count }));
}

export async function getTopKeywords(days = 30, limit = 20) {
  const db = await createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await db.from("messages")
    .select("content")
    .eq("role", "user")
    .gte("created_at", since)
    .limit(500);

  const STOPWORDS = new Set([
    "que","para","como","mais","não","com","uma","por","está","isso","esse","essa",
    "tem","vai","você","voce","meu","minha","mas","quando","muito","algo","ainda",
    "qual","bem","aqui","onde","então","porque","tenho","seria","quero","fazer",
    "todo","tudo","cada","sobre","entre","pela","pelo","numa","num","foi",
  ]);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const words = (row.content as string)
      .toLowerCase()
      .replace(/[^\w\sáéíóúãõâêôçà]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 4 && !STOPWORDS.has(w));
    for (const word of words) {
      counts[word] = (counts[word] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export async function getNpsSummary() {
  const db = await createClient();
  const { data } = await db.from("chat_nps")
    .select("score, feedback_text, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];
  const scores = rows.map(r => r.score);
  const promoters = scores.filter(s => s >= 9).length;
  const passives  = scores.filter(s => s >= 7 && s <= 8).length;
  const detractors = scores.filter(s => s <= 6).length;
  const total = scores.length;
  const npsScore = total > 0
    ? Math.round(((promoters - detractors) / total) * 100)
    : null;

  const avgScore = total > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / total * 10) / 10
    : null;

  const recent = rows.slice(0, 10).filter(r => r.feedback_text);

  return { npsScore, avgScore, promoters, passives, detractors, total, recent };
}

export async function getConversationTrend(days = 14) {
  const db = await createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await db.from("conversations")
    .select("started_at")
    .gte("started_at", since);

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const day = (row.started_at as string).split("T")[0];
    counts[day] = (counts[day] ?? 0) + 1;
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

// ══════════════════════════════
// FINANCEIRO
// ══════════════════════════════

export async function getChatFinancials() {
  const db = await createClient();
  const { data } = await db.from("chat_financials")
    .select("id, type, category, description, amount_cents, occurred_at, created_at")
    .order("occurred_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export async function getChatFinancialSummary() {
  const db = await createClient();
  const { data } = await db.from("chat_financials").select("type, amount_cents");

  let revenue = 0;
  let expenses = 0;
  for (const row of data ?? []) {
    if (row.type === "revenue") revenue += row.amount_cents;
    else expenses += row.amount_cents;
  }

  return { revenue, expenses, profit: revenue - expenses };
}

// Estimativa de custo de API baseado em mensagens (Haiku ~$0.0008 por mensagem)
export async function getApiCostEstimate() {
  const db = await createClient();
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const { count } = await db.from("messages")
    .select("id", { count: "exact", head: true })
    .gte("created_at", thisMonth.toISOString());

  const estimatedCostCents = Math.round((count ?? 0) * 0.08); // $0.0008 = 0.08 centavos
  return { messageCount: count ?? 0, estimatedCostCents };
}
