import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/components/metric-card";
import Link from "next/link";

async function getNewsletterMetrics() {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: total },
    { count: newThisMonth },
    { count: churned },
    { data: lastNewsletter },
  ] = await Promise.all([
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("subscribers").select("id", { count: "exact", head: true })
      .gte("unsubscribed_at", monthStart).not("unsubscribed_at", "is", null),
    supabase.from("sent_newsletters")
      .select("subject, sent_at, total_sent")
      .order("sent_at", { ascending: false })
      .limit(5),
  ]);

  return {
    total: total ?? 0,
    newThisMonth: newThisMonth ?? 0,
    churned: churned ?? 0,
    lastNewsletters: lastNewsletter ?? [],
  };
}

export default async function DiarioEstoicoPage() {
  const data = await getNewsletterMetrics();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-stone-900">Diário Estoico</h1>
      <p className="mb-8 text-sm text-stone-500">Visão geral da newsletter</p>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricCard label="Assinantes ativos" value={data.total} />
        <MetricCard label="Novos este mês" value={data.newThisMonth} />
        <MetricCard label="Cancelamentos mês" value={data.churned} />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Últimas newsletters enviadas
        </h2>
        <Link
          href="/diario-estoico/newsletter"
          className="text-xs text-stone-500 underline hover:text-stone-800"
        >
          Ver todas →
        </Link>
      </div>

      {data.lastNewsletters.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-500">Nenhuma newsletter enviada ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-4 py-3">Assunto</th>
                <th className="px-4 py-3">Enviada em</th>
                <th className="px-4 py-3">Destinatários</th>
              </tr>
            </thead>
            <tbody>
              {data.lastNewsletters.map((n, i) => (
                <tr key={i} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-medium text-stone-800">{n.subject}</td>
                  <td className="px-4 py-3 text-stone-500">
                    {n.sent_at
                      ? new Date(n.sent_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{n.total_sent ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
