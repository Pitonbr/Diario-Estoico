import { createClient } from "@/lib/supabase/server";

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
