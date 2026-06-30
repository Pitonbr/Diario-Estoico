import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function getRecentNewsletters() {
  const db = await createClient();
  const { data } = await db
    .from("sent_newsletters")
    .select("edition_number, send_date, subject_line, delivery_status, philosopher, source_work")
    .order("send_date", { ascending: false })
    .limit(10);
  return data ?? [];
}

async function getRecentContent() {
  const db = await createClient();
  const { data } = await db
    .from("content_pieces")
    .select("agent_key, generated_date, status, created_at")
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

const DELIVERY_COLORS: Record<string, string> = {
  sent:    "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  failed:  "bg-red-100 text-red-700",
};

export default async function LogsPage() {
  const [newsletters, content] = await Promise.all([
    getRecentNewsletters(),
    getRecentContent(),
  ]);

  const contentByDate: Record<string, number> = {};
  for (const c of content) {
    contentByDate[c.generated_date] = (contentByDate[c.generated_date] ?? 0) + 1;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-900">← Admin</Link>
        <h1 className="text-2xl font-semibold text-stone-900">Logs</h1>
      </div>

      {/* Links externos */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href="https://github.com/Pitonbr/Diario-Estoico/actions/workflows/daily-newsletter.yml"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 hover:border-stone-400"
        >
          <span className="text-xl">📧</span>
          <div>
            <p className="font-medium text-stone-900">Newsletter — GitHub Actions</p>
            <p className="text-xs text-stone-500">Histórico de execuções do cron diário (08:00 BRT)</p>
          </div>
          <span className="ml-auto text-stone-300">→</span>
        </a>
        <a
          href="https://github.com/Pitonbr/Diario-Estoico/actions/workflows/daily-content.yml"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 hover:border-stone-400"
        >
          <span className="text-xl">📣</span>
          <div>
            <p className="font-medium text-stone-900">Conteúdo — GitHub Actions</p>
            <p className="text-xs text-stone-500">Histórico de execuções dos agentes (07:00 BRT)</p>
          </div>
          <span className="ml-auto text-stone-300">→</span>
        </a>
        <a
          href="https://vercel.com/pitonbrs-projects/diario-estoico-admin"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 hover:border-stone-400"
        >
          <span className="text-xl">▲</span>
          <div>
            <p className="font-medium text-stone-900">Admin — Vercel</p>
            <p className="text-xs text-stone-500">Logs de deploy e runtime do painel admin</p>
          </div>
          <span className="ml-auto text-stone-300">→</span>
        </a>
        <a
          href="https://supabase.com/dashboard/project/oqemuvihrmaohgkuxqtm/logs/explorer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 hover:border-stone-400"
        >
          <span className="text-xl">🗄️</span>
          <div>
            <p className="font-medium text-stone-900">Banco de Dados — Supabase</p>
            <p className="text-xs text-stone-500">Logs de queries e API</p>
          </div>
          <span className="ml-auto text-stone-300">→</span>
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Últimas newsletters */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Últimas Newsletters Enviadas
          </h2>
          {newsletters.length === 0 ? (
            <p className="text-sm text-stone-400">Nenhuma newsletter enviada ainda.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              {newsletters.map((n) => (
                <div key={n.send_date} className="flex items-center gap-3 border-b border-stone-100 px-4 py-3 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-stone-800">{n.subject_line}</p>
                    <p className="text-xs text-stone-400">{n.philosopher} · Ed.#{n.edition_number} · {n.send_date}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${DELIVERY_COLORS[n.delivery_status] ?? "bg-stone-100 text-stone-500"}`}>
                    {n.delivery_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas execuções de conteúdo */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Últimas Gerações de Conteúdo
          </h2>
          {Object.keys(contentByDate).length === 0 ? (
            <p className="text-sm text-stone-400">Nenhuma execução registrada ainda.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              {Object.entries(contentByDate)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 10)
                .map(([date, count]) => (
                  <div key={date} className="flex items-center justify-between border-b border-stone-100 px-4 py-3 last:border-0">
                    <p className="text-sm text-stone-700">{date}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-stone-400">{count} peças geradas</span>
                      <Link
                        href={`/marketing?status=all`}
                        className="text-xs text-stone-500 underline hover:text-stone-900"
                      >
                        Ver →
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
