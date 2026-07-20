import { MetricCard } from "@/components/metric-card";
import { getUnifiedDashboardMetrics, getCampaignCacSummary } from "@/lib/metrics";
import Link from "next/link";

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
};

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "📷",
  tiktok: "🎵",
  youtube: "▶️",
  facebook: "👤",
};

export default async function DashboardPage() {
  const [metrics, campaigns] = await Promise.all([
    getUnifiedDashboardMetrics(),
    getCampaignCacSummary(),
  ]);

  const churnPct =
    metrics.activeSubscribers + metrics.churnedThisMonth > 0
      ? (
          (metrics.churnedThisMonth /
            (metrics.activeSubscribers + metrics.churnedThisMonth)) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-stone-900">Dashboard</h1>
      <p className="mb-8 text-sm text-stone-500">Visão consolidada — Empreender Estoico</p>

      {/* Usuários totais */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
        Visão geral de usuários
      </h2>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Total de usuários" value={metrics.totalUsers} />
        <MetricCard label="Novos este mês" value={metrics.newSubscribersThisMonth + metrics.newChatUsersThisMonth} />
        <MetricCard label="Inativos 15+ dias" value={metrics.chatInactive15d} />
        <MetricCard label="Inativos 30+ dias" value={metrics.chatInactive30d} />
      </div>

      {/* Newsletter */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
        Diário Estoico — Newsletter
      </h2>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Assinantes ativos" value={metrics.activeSubscribers} />
        <MetricCard label="Novos este mês" value={metrics.newSubscribersThisMonth} />
        <MetricCard label="Cancelamentos mês" value={metrics.churnedThisMonth} />
        <MetricCard label="Churn %" value={`${churnPct}%`} />
      </div>

      {/* Chat Estoico */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
        Chat Estoico
      </h2>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricCard label="Usuários ativos" value={metrics.activeChatUsers} />
        <MetricCard label="Novos este mês" value={metrics.newChatUsersThisMonth} />
        <MetricCard label="Inativos 15+ dias" value={metrics.chatInactive15d} />
      </div>

      {/* Redes sociais */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
        Redes sociais
      </h2>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.social.map((s) => (
          <div key={s.platform} className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="mb-1 text-xs text-stone-400">
              {PLATFORM_ICONS[s.platform] ?? "🌐"}{" "}
              {PLATFORM_LABELS[s.platform] ?? s.platform}
            </p>
            <p className="text-2xl font-semibold text-stone-900">
              {s.followers.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-stone-400">seguidores</p>
            <div className="mt-2 flex items-center justify-between">
              {s.handle ? (
                <span className="text-xs text-stone-500">@{s.handle}</span>
              ) : (
                <span className="text-xs italic text-stone-300">sem handle</span>
              )}
              <Link
                href={`/admin/redes-sociais`}
                className="text-xs text-stone-400 underline hover:text-stone-700"
              >
                editar
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics do site */}
      <div className="mb-8 rounded-lg border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-700">Visitas ao site</p>
            <p className="text-xs text-stone-400">Dados via Vercel Analytics</p>
          </div>
          <a
            href="https://vercel.com/pitonbr/diario-estoico/analytics"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
          >
            Abrir Analytics →
          </a>
        </div>
      </div>

      {/* Campanhas × CAC */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
        Campanhas × CAC
      </h2>

      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-500">
            Nenhuma campanha ativa. Quando você criar campanhas orgânicas ou de
            mídia paga, o custo por assinante aparece aqui automaticamente.
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
