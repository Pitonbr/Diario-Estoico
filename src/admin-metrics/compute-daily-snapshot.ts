import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { config } from "../config/env";
import { getSupabase } from "../database/client";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Calcula os indicadores diários do Dashboard admin e grava em
 * daily_metrics_snapshot. Roda depois do pipeline da newsletter
 * (ver .github/workflows/daily-newsletter.yml).
 */
async function main() {
  const db = getSupabase();
  const today = dayjs().tz(config.timezone).format("YYYY-MM-DD");

  console.log(`📊 Calculando indicadores de ${today}...`);

  const [{ count: activeSubscribers }, { count: newSubscribers }, { count: churnedSubscribers }] =
    await Promise.all([
      db.from("subscribers").select("id", { count: "exact", head: true }).eq("active", true),
      db
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${today}T00:00:00Z`)
        .lt("created_at", `${today}T23:59:59.999Z`),
      db
        .from("subscribers")
        .select("id", { count: "exact", head: true })
        .gte("unsubscribed_at", `${today}T00:00:00Z`)
        .lt("unsubscribed_at", `${today}T23:59:59.999Z`),
    ]);

  const metrics: Record<string, number> = {
    active_subscribers: activeSubscribers ?? 0,
    new_subscribers: newSubscribers ?? 0,
    churned_subscribers: churnedSubscribers ?? 0,
  };

  for (const [metricKey, value] of Object.entries(metrics)) {
    const { error } = await db
      .from("daily_metrics_snapshot")
      .upsert(
        { date: today, metric_key: metricKey, value },
        { onConflict: "date,metric_key" }
      );

    if (error) {
      console.error(`✗ Falha ao gravar ${metricKey}:`, error.message);
    } else {
      console.log(`   ✓ ${metricKey} = ${value}`);
    }
  }

  console.log("✓ Snapshot diário concluído.");
}

main().catch((err) => {
  console.error("💥 Erro ao calcular snapshot:", err);
  process.exit(1);
});
