import { createClient } from "@/lib/supabase/server";
import { SocialMetricsForm } from "./social-metrics-form";

async function getSocialMetrics() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("social_metrics")
    .select("platform, followers, handle, profile_url, updated_at")
    .order("platform");
  return data ?? [];
}

export default async function RedesSociaisPage() {
  const metrics = await getSocialMetrics();
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-stone-900">Redes Sociais</h1>
      <p className="mb-8 text-sm text-stone-500">
        Atualize os seguidores manualmente. Os valores aparecem no Dashboard.
      </p>
      <SocialMetricsForm metrics={metrics} />
    </div>
  );
}
