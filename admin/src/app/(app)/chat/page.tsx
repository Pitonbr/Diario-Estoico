import Link from "next/link";
import {
  getChatOverviewMetrics,
  getChatAlerts,
  getTopThemes,
  getConversationTrend,
} from "@/lib/chat";

function fmtNum(n: number) {
  return n.toLocaleString("pt-BR");
}

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-yellow-400",
};

const TYPE_SHORT: Record<string, string> = {
  homicide: "Homicídio", threats: "Ameaças", racism: "Racismo",
  child_safety: "Seg. infantil", abortion: "Aborto",
  suicidal_ideation: "Ideação suicida", crisis_detected: "Crise",
};

export default async function ChatDashboardPage() {
  const [metrics, alerts, themes, trend] = await Promise.all([
    getChatOverviewMetrics(),
    getChatAlerts("pending", 5),
    getTopThemes(30, 8),
    getConversationTrend(14),
  ]);

  const widgets = [
    { label: "Usuários cadastrados", value: fmtNum(metrics.totalUsers), hint: `+${metrics.newUsersWeek} esta semana` },
    { label: "Conversas hoje", value: fmtNum(metrics.conversationsToday), hint: `${fmtNum(metrics.totalConversations)} total` },
    { label: "NPS médio", value: metrics.avgNps !== null ? `${metrics.avgNps}/10` : "—", hint: `${metrics.totalNpsResponses} avaliações` },
    { label: "Alertas pendentes", value: fmtNum(metrics.pendingAlerts), hint: metrics.pendingAlerts > 0 ? "⚠ Revisão necessária" : "Tudo certo" },
    { label: "Usuários bloqueados", value: fmtNum(metrics.blockedUsers) },
  ];

  const maxTrend = Math.max(...trend.map(d => d.count), 1);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Chat Estoico</h1>
          <p className="mt-0.5 text-sm text-stone-500">Visão geral do produto</p>
        </div>
        <div className="flex gap-2 text-sm">
          <Link href="/chat/alertas" className="rounded-md border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-50">
            Alertas
          </Link>
          <Link href="/chat/usuarios" className="rounded-md border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-50">
            Usuários
          </Link>
          <Link href="/chat/analytics" className="rounded-md border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-700 hover:bg-stone-50">
            Analytics
          </Link>
          <Link href="/chat/financeiro" className="rounded-md bg-stone-900 px-3 py-1.5 font-medium text-white hover:bg-stone-700">
            Financeiro
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {widgets.map(w => (
          <div key={w.label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">{w.label}</p>
            <p className="mt-1.5 text-2xl font-semibold text-stone-900">{w.value}</p>
            {w.hint && <p className="mt-0.5 text-xs text-stone-400">{w.hint}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend de conversas */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Conversas — últimos 14 dias
          </h2>
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            {trend.length === 0 ? (
              <p className="text-sm text-stone-400">Sem dados ainda.</p>
            ) : (
              <div className="flex h-32 items-end gap-1">
                {trend.map(d => (
                  <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t bg-stone-700 transition-all group-hover:bg-stone-900"
                      style={{ height: `${(d.count / maxTrend) * 100}%`, minHeight: "4px" }}
                    />
                    <p className="mt-1 rotate-45 text-[9px] text-stone-400">
                      {d.date.slice(5)}
                    </p>
                    <div className="pointer-events-none absolute -top-7 hidden rounded bg-stone-900 px-1.5 py-0.5 text-xs text-white group-hover:block">
                      {d.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top temas */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Temas mais discutidos (30d)
          </h2>
          {themes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-200 bg-white p-6 text-center">
              <p className="text-xs text-stone-400">Dados aparecerão depois das primeiras conversas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {themes.map((t, i) => (
                <div key={t.theme} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2">
                  <span className="w-5 text-right text-xs font-bold text-stone-400">{i + 1}</span>
                  <span className="flex-1 text-sm text-stone-700">{t.theme}</span>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">{t.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alertas pendentes */}
      {alerts.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Alertas pendentes recentes
            </h2>
            <Link href="/chat/alertas" className="text-xs text-stone-500 underline hover:text-stone-800">
              Ver todos →
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {alerts.map(a => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${SEVERITY_DOT[a.severity] ?? "bg-stone-400"}`} />
                <span className="flex-1 text-sm text-stone-700">
                  {TYPE_SHORT[a.alert_type] ?? a.alert_type}
                </span>
                <span className="text-xs text-stone-400">
                  {new Date(a.created_at).toLocaleDateString("pt-BR")}
                </span>
                <Link
                  href="/chat/alertas"
                  className="rounded bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200"
                >
                  Revisar
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
