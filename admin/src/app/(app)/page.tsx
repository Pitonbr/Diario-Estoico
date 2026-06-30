import { MetricCard } from "@/components/metric-card";
import { getDashboardMetrics, getCampaignCacSummary } from "@/lib/metrics";

export default async function DashboardPage() {
  const [metrics, campaigns] = await Promise.all([
    getDashboardMetrics(),
    getCampaignCacSummary(),
  ]);

  // Lista de indicadores principais. Para adicionar um novo, basta incluir
  // um item aqui (e, se vier de dado calculado, gravar a metric_key
  // correspondente no script de snapshot diário).
  const widgets = [
    { label: "Assinantes ativos", value: metrics.activeSubscribers },
    { label: "Ganhos hoje", value: metrics.newSubscribersToday },
    { label: "Churn hoje", value: metrics.churnedToday },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-stone-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {widgets.map((w) => (
          <MetricCard key={w.label} label={w.label} value={w.value} />
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-semibold text-stone-900">
        Campanhas × CAC
      </h2>

      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-500">
            Nenhuma campanha ativa ainda. Quando você criar campanhas
            (orgânicas ou de mídia paga), o custo por assinante adquirido
            aparece aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-100 text-left text-stone-500">
              <tr>
                <th className="px-4 py-2 font-medium">Campanha</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Plataforma</th>
                <th className="px-4 py-2 font-medium">Gasto</th>
                <th className="px-4 py-2 font-medium">Assinantes</th>
                <th className="px-4 py-2 font-medium">CAC</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t border-stone-100">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2 capitalize">{c.kind}</td>
                  <td className="px-4 py-2">{c.platform ?? "—"}</td>
                  <td className="px-4 py-2">
                    R$ {(c.spendCents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-2">{c.subscribersAttributed}</td>
                  <td className="px-4 py-2">
                    {c.cacCents !== null
                      ? `R$ ${(c.cacCents / 100).toFixed(2)}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
