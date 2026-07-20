import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface Edition {
  id: string;
  edition_number: number;
  send_date: string;
  subject_line: string;
  philosopher: string;
  sent_count: number;
  total_count: number;
  delivery_status: string;
}

async function getAllEditions(): Promise<Edition[]> {
  const supabase = await createClient();

  // Get one row per edition (the first/representative row)
  const { data } = await supabase
    .from("sent_newsletters")
    .select("id, edition_number, send_date, subject_line, philosopher, delivery_status")
    .order("send_date", { ascending: false })
    .order("edition_number", { ascending: false });

  if (!data) return [];

  // Deduplicate by edition_number, keeping the first row + counting
  const seen = new Set<number>();
  const counts: Record<number, { sent: number; total: number }> = {};

  for (const row of data) {
    const n = row.edition_number;
    counts[n] = counts[n] ?? { sent: 0, total: 0 };
    counts[n].total++;
    if (row.delivery_status === "sent") counts[n].sent++;
  }

  const editions: Edition[] = [];
  for (const row of data) {
    if (seen.has(row.edition_number)) continue;
    seen.add(row.edition_number);
    editions.push({
      ...row,
      sent_count: counts[row.edition_number]?.sent ?? 0,
      total_count: counts[row.edition_number]?.total ?? 0,
    });
  }

  return editions;
}

type GroupedEditions = Record<number, Record<number, Edition[]>>;

function groupByYearMonth(editions: Edition[]): GroupedEditions {
  const grouped: GroupedEditions = {};
  for (const e of editions) {
    const d = new Date(e.send_date + "T12:00:00Z");
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth(); // 0-indexed
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];
    grouped[year][month].push(e);
  }
  return grouped;
}

export default async function NewsletterPage() {
  const editions = await getAllEditions();
  const grouped = groupByYearMonth(editions);
  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-semibold text-stone-900">Newsletter</h1>
          <p className="text-sm text-stone-500">
            {editions.length} edições publicadas
          </p>
        </div>
      </div>

      {editions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-sm text-stone-500">Nenhuma newsletter enviada ainda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {years.map((year) => {
            const months = Object.keys(grouped[year])
              .map(Number)
              .sort((a, b) => b - a);
            const yearTotal = months.reduce(
              (s, m) => s + grouped[year][m].length,
              0
            );

            return (
              <details key={year} open={year === years[0]} className="group rounded-lg border border-stone-200 bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 hover:bg-stone-50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-stone-900">{year}</span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">
                      {yearTotal} edições
                    </span>
                  </div>
                  <span className="text-stone-400 transition-transform group-open:rotate-180">▾</span>
                </summary>

                <div className="border-t border-stone-100 px-5 pb-4 pt-2">
                  {months.map((month) => {
                    const monthEditions = grouped[year][month];
                    return (
                      <details key={month} open className="group/month mt-3 rounded-md border border-stone-100">
                        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-2.5 hover:bg-stone-50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-stone-700">
                              {MONTH_NAMES[month]}
                            </span>
                            <span className="text-xs text-stone-400">
                              {monthEditions.length} edições
                            </span>
                          </div>
                          <span className="text-xs text-stone-300 transition-transform group-open/month:rotate-180">▾</span>
                        </summary>

                        <div className="divide-y divide-stone-50 border-t border-stone-100">
                          {monthEditions.map((e) => (
                            <Link
                              key={e.edition_number}
                              href={`/diario-estoico/newsletter/${e.edition_number}`}
                              className="flex items-start justify-between px-4 py-3 hover:bg-stone-50"
                            >
                              <div className="min-w-0 flex-1 pr-4">
                                <div className="flex items-center gap-2">
                                  <span className="shrink-0 text-xs font-mono text-stone-400">
                                    #{e.edition_number}
                                  </span>
                                  <p className="truncate text-sm font-medium text-stone-800">
                                    {e.subject_line}
                                  </p>
                                </div>
                                <p className="mt-0.5 text-xs text-stone-400">
                                  {e.philosopher} ·{" "}
                                  {new Date(e.send_date + "T12:00:00Z").toLocaleDateString(
                                    "pt-BR",
                                    { day: "2-digit", month: "short" }
                                  )}
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-3">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                    e.delivery_status === "sent"
                                      ? "bg-green-50 text-green-600"
                                      : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  {e.delivery_status === "sent" ? "Enviado" : "Falhou"}
                                </span>
                                <span className="text-xs text-stone-300">→</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
