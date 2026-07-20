import { createClient } from "@/lib/supabase/server";

export interface SocialMetric {
  platform: string;
  followers: number;
  handle: string | null;
  profile_url: string | null;
  updated_at: string;
}

export interface UnifiedDashboardMetrics {
  // Newsletter
  activeSubscribers: number;
  newSubscribersThisMonth: number;
  churnedThisMonth: number;
  // Chat
  activeChatUsers: number;
  newChatUsersThisMonth: number;
  chatInactive15d: number;
  chatInactive30d: number;
  // Combined
  totalUsers: number;
  // Social
  social: SocialMetric[];
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

const METRIC_KEYS = {
  activeSubscribers: "active_subscribers",
  newSubscribers: "new_subscribers",
  churnedSubscribers: "churned_subscribers",
} as const;

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

async function readSnapshot(
  supabase: SupabaseClient,
  metricKey: string,
  date: string
): Promise<number | null> {
  const { data } = await supabase
    .from("daily_metrics_snapshot")
    .select("value")
    .eq("date", date)
    .eq("metric_key", metricKey)
    .maybeSingle();

  return data ? Number(data.value) : null;
}

async function countActiveSubscribersLive(supabase: SupabaseClient) {
  const { count } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .eq("active", true);
  return count ?? 0;
}

async function countNewSubscribersTodayLive(supabase: SupabaseClient, date: string) {
  const { count } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${date}T00:00:00Z`)
    .lt("created_at", `${date}T23:59:59.999Z`);
  return count ?? 0;
}

async function countChurnedTodayLive(supabase: SupabaseClient, date: string) {
  const { count } = await supabase
    .from("subscribers")
    .select("id", { count: "exact", head: true })
    .gte("unsubscribed_at", `${date}T00:00:00Z`)
    .lt("unsubscribed_at", `${date}T23:59:59.999Z`);
  return count ?? 0;
}

export interface DashboardMetrics {
  activeSubscribers: number;
  newSubscribersToday: number;
  churnedToday: number;
}

/**
 * Lê os indicadores do snapshot diário (daily_metrics_snapshot); para
 * qualquer valor ainda não calculado hoje (ex: cron ainda não rodou),
 * cai para cálculo ao vivo direto nas tabelas.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const date = todayDateString();

  const [activeSnapshot, newSnapshot, churnedSnapshot] = await Promise.all([
    readSnapshot(supabase, METRIC_KEYS.activeSubscribers, date),
    readSnapshot(supabase, METRIC_KEYS.newSubscribers, date),
    readSnapshot(supabase, METRIC_KEYS.churnedSubscribers, date),
  ]);

  const [activeLive, newLive, churnedLive] = await Promise.all([
    activeSnapshot === null ? countActiveSubscribersLive(supabase) : null,
    newSnapshot === null ? countNewSubscribersTodayLive(supabase, date) : null,
    churnedSnapshot === null ? countChurnedTodayLive(supabase, date) : null,
  ]);

  return {
    activeSubscribers: activeSnapshot ?? activeLive ?? 0,
    newSubscribersToday: newSnapshot ?? newLive ?? 0,
    churnedToday: churnedSnapshot ?? churnedLive ?? 0,
  };
}

export interface CampaignCac {
  id: string;
  name: string;
  kind: "organico" | "pago";
  platform: string | null;
  spendCents: number;
  subscribersAttributed: number;
  cacCents: number | null;
}

/** CAC = gasto total da campanha ÷ assinantes atribuídos a ela. */
export async function getCampaignCacSummary(): Promise<CampaignCac[]> {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, kind, platform")
    .eq("status", "active");

  if (!campaigns || campaigns.length === 0) return [];

  const results: CampaignCac[] = [];

  for (const campaign of campaigns) {
    const [{ data: spendRows }, { count: subscriberCount }] = await Promise.all([
      supabase
        .from("campaign_spend")
        .select("amount_cents")
        .eq("campaign_id", campaign.id),
      supabase
        .from("campaign_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", campaign.id),
    ]);

    const spendCents = (spendRows ?? []).reduce(
      (sum, row) => sum + Number(row.amount_cents),
      0
    );
    const subscribersAttributed = subscriberCount ?? 0;

    results.push({
      id: campaign.id,
      name: campaign.name,
      kind: campaign.kind,
      platform: campaign.platform,
      spendCents,
      subscribersAttributed,
      cacCents:
        subscribersAttributed > 0
          ? Math.round(spendCents / subscribersAttributed)
          : null,
    });
  }

  return results;
}

export async function getSocialMetrics(): Promise<SocialMetric[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("social_metrics")
    .select("platform, followers, handle, profile_url, updated_at")
    .order("platform");
  return (data ?? []) as SocialMetric[];
}

export async function getUnifiedDashboardMetrics(): Promise<UnifiedDashboardMetrics> {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const d15 = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: activeSubscribers },
    { count: newSubscribersThisMonth },
    { count: churnedThisMonth },
    { count: activeChatUsers },
    { count: newChatUsersThisMonth },
    social,
  ] = await Promise.all([
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("subscribers").select("id", { count: "exact", head: true })
      .gte("unsubscribed_at", monthStart).not("unsubscribed_at", "is", null),
    supabase.from("chat_users").select("id", { count: "exact", head: true }).is("blocked_at", null),
    supabase.from("chat_users").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    getSocialMetrics(),
  ]);

  // Inactive chat users: no conversation in last 15/30 days
  const [{ data: rows15 }, { data: rows30 }] = await Promise.all([
    supabase.from("conversations").select("user_id").gte("started_at", d15),
    supabase.from("conversations").select("user_id").gte("started_at", d30),
  ]);
  const active15Ids = [...new Set((rows15 ?? []).map((r) => r.user_id))];
  const active30Ids = [...new Set((rows30 ?? []).map((r) => r.user_id))];

  const base15 = supabase
    .from("chat_users").select("id", { count: "exact", head: true })
    .is("blocked_at", null).lt("created_at", d15);
  const base30 = supabase
    .from("chat_users").select("id", { count: "exact", head: true })
    .is("blocked_at", null).lt("created_at", d30);

  const [{ count: chatInactive15d }, { count: chatInactive30d }] = await Promise.all([
    active15Ids.length > 0
      ? base15.not("id", "in", `(${active15Ids.join(",")})`)
      : base15,
    active30Ids.length > 0
      ? base30.not("id", "in", `(${active30Ids.join(",")})`)
      : base30,
  ]);

  const ns = activeSubscribers ?? 0;
  const nc = activeChatUsers ?? 0;

  return {
    activeSubscribers: ns,
    newSubscribersThisMonth: newSubscribersThisMonth ?? 0,
    churnedThisMonth: churnedThisMonth ?? 0,
    activeChatUsers: nc,
    newChatUsersThisMonth: newChatUsersThisMonth ?? 0,
    chatInactive15d: chatInactive15d ?? 0,
    chatInactive30d: chatInactive30d ?? 0,
    totalUsers: ns + nc,
    social,
  };
}
