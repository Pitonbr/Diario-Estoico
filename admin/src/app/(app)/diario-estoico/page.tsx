import { createClient } from "@/lib/supabase/server";
import { MetricCard } from "@/components/metric-card";
import Link from "next/link";

const MONTH_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

async function getPageData() {
  const supabase = await createClient();
  const now = new Date();
  const year = now.getFullYear();
  const monthStart = new Date(year, now.getMonth(), 1).toISOString();
  const yearStart = new Date(year, 0, 1).toISOString();

  const [
    { count: total },
    { count: newThisMonth },
    { count: churned },
    { data: lastEditions },
    { data: subsInYear },
  ] = await Promise.all([
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("subscribers").select("id", { count: "exact", head: true })
      .gte("unsubscribed_at", monthStart).not("unsubscribed_at", "is", null),
    supabase.from("sent_newsletters")
      .select("edition_number, subject_line, send_date, philosopher, delivery_status")
      .order("send_date", { ascending: false })
      .order("edition_number", { ascending: false })
      .limit(50),
    supabase.from("subscribers")
      .select("created_at")
      .gte("created_at", yearStart),
  ]);

  // Deduplicate editions
  const seenEditions = new Set<number>();
  const recentEditions = [];
  for (const e of lastEditions ?? []) {
    if (seenEditions.has(e.edition_number)) continue;
    seenEditions.add(e.edition_number);
    recentEditions.push(e);
    if (recentEditions.length >= 5) break;
  }

  // Monthly growth: group by month
  const monthCounts: number[] = Array(12).fill(0);
  for (const s of subsInYear ?? []) {
    const m = new Date(s.created_at).getMonth();
    monthCounts[m]++;
  }
  const maxCount = Math.max(...monthCounts, 1);

  return {
    total: total ?? 0,
    newThisMonth: newThisMonth ?? 0,
    churned: churned ?? 0,
    recentEditions,
    monthCounts,
    maxCount,
    year,
  };
}

export default async function DiarioEstoicoPage() {
  const data = await getPageData();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-stone-900">Diário Estoico</h1>
      <p className="mb-8 text-sm text-stone-500">Visão geral da newsletter</p>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MetricCard label="Assinantes ativos" value={data.total} />
        <MetricCard label="Novos este mês" value={data.newThisMonth} />
        <MetricCard label="Cancelamentos mês" value={data.churned} />
      </div>

      {/* Gráfico de crescimento mensal */}
      <div className="mb-8 rounded-lg border border-stone-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-stone-700">
          Crescimento de assinantes — {data.year}
        </h2>
        <div className="flex h-36 items-end gap-1.5">
          {data.monthCounts.map((count, i) => {
            const heightPct = data.maxCount > 0 ? (count / data.maxCount) * 100 : 0;
            const isCurrentMonth = i === new Date().getMonth();
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs text-stone-400">{count > 0 ? count : ""}</span>
                <div
                  className={`w-full rounded-t transition-all ${
                    isCurrentMonth ? "bg-stone-700" : "bg-stone-200"
                  }`}
                  style={{ height: `${Math.max(heightPct, count > 0 ? 4 : 0)}%`, minHeight: count > 0 ? "4px" : "2px" }}
                />
                <span className={`text-xs ${isCurrentMonth ? "font-semibold text-stone-700" : "text-stone-400"}`}>
                  {MONTH_SHORT[i]}
                </span>
              </div>
            );
          })}
        </div>
        {data.monthCounts.every((c) => c === 0) && (
          <p className="mt-3 text-center text-xs text-stone-400">
            Nenhum assinante registrado em {data.year} ainda.
          </p>
        )}
      </div>

      {/* Últimas newsletters */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Últimas newsletters
        </h2>
        <Link
          href="/diario-estoico/newsletter"
          className="text-xs text-stone-500 underline hover:text-stone-800"
        >
          Ver todas →
        </Link>
      </div>

      {data.recentEditions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
          <p className="text-sm text-stone-500">Nenhuma newsletter enviada ainda.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-400">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Assunto</th>
                <th className="px-4 py-3">Filósofo</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEditions.map((n) => (
                <tr key={n.edition_number} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 font-mono text-xs text-stone-400">
                    #{n.edition_number}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/diario-estoico/newsletter/${n.edition_number}`}
                      className="font-medium text-stone-800 hover:underline"
                    >
                      {n.subject_line}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-500">{n.philosopher}</td>
                  <td className="px-4 py-3 text-stone-500">
                    {n.send_date
                      ? new Date(n.send_date + "T12:00:00Z").toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      n.delivery_status === "sent"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}>
                      {n.delivery_status === "sent" ? "Enviado" : "Falhou"}
                    </span>
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
