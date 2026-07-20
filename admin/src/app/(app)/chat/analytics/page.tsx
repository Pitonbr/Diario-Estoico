import Link from "next/link";
import {
  getTopThemes,
  getTopKeywords,
  getNpsSummary,
  getConversationTrend,
} from "@/lib/chat";

function NpsBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-stone-600">{label}</span>
        <span className="font-semibold text-stone-800">{count} ({pct.toFixed(0)}%)</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const [themes, keywords, nps, trend] = await Promise.all([
    getTopThemes(30, 15),
    getTopKeywords(30, 20),
    getNpsSummary(),
    getConversationTrend(30),
  ]);

  const maxTrend = Math.max(...trend.map(d => d.count), 1);
  const totalConvos = trend.reduce((s, d) => s + d.count, 0);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/chat" className="text-sm text-stone-400 hover:text-stone-700">
          ← Chat Estoico
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">Analytics</h1>
      </div>

      {/* NPS + trend */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* NPS Card */}
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">NPS</h2>
          {nps.total === 0 ? (
            <p className="text-sm text-stone-400">Nenhuma avaliação ainda.</p>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-bold text-stone-900">
                    {nps.npsScore !== null ? nps.npsScore : "—"}
                  </p>
                  <p className="text-xs text-stone-400">Score NPS</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-stone-700">{nps.avgScore}/10</p>
                  <p className="text-xs text-stone-400">Média</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-stone-700">{nps.total}</p>
                  <p className="text-xs text-stone-400">Respostas</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <NpsBar label="Promotores (9-10)" count={nps.promoters} total={nps.total} color="bg-green-500" />
                <NpsBar label="Neutros (7-8)" count={nps.passives} total={nps.total} color="bg-yellow-400" />
                <NpsBar label="Detratores (0-6)" count={nps.detractors} total={nps.total} color="bg-red-400" />
              </div>

              {nps.recent.length > 0 && (
                <div className="mt-4 border-t border-stone-100 pt-4">
                  <p className="mb-2 text-xs font-semibold text-stone-500">Comentários recentes</p>
                  <div className="flex flex-col gap-2">
                    {nps.recent.map((r, i) => (
                      <p key={i} className="rounded bg-stone-50 p-2 text-xs text-stone-600 italic">
                        &ldquo;{r.feedback_text}&rdquo;
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Trend de conversas — 30d */}
        <div className="lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Conversas (30 dias)</h2>
            <span className="text-sm font-semibold text-stone-700">{totalConvos} total</span>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white p-5">
            {trend.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-400">Sem dados ainda.</p>
            ) : (
              <div className="flex h-40 items-end gap-0.5">
                {trend.map(d => (
                  <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t bg-stone-700 transition-all group-hover:bg-stone-900"
                      style={{ height: `${(d.count / maxTrend) * 100}%`, minHeight: "4px" }}
                    />
                    <p className="mt-1 hidden text-[8px] text-stone-400 sm:block rotate-45">
                      {d.date.slice(5)}
                    </p>
                    <div className="pointer-events-none absolute -top-8 hidden rounded bg-stone-900 px-1.5 py-0.5 text-xs text-white group-hover:block">
                      {d.date.slice(5)}: {d.count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top temas */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Temas mais discutidos (30 dias)
          </h2>
          {themes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-200 bg-white p-8 text-center">
              <p className="text-sm text-stone-400">Aparecerão após as primeiras conversas completadas.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
              {themes.map((t, i) => {
                const pct = themes[0].count > 0 ? (t.count / themes[0].count) * 100 : 0;
                return (
                  <div key={t.theme} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-stone-100" : ""}`}>
                    <span className="w-5 shrink-0 text-right text-xs font-bold text-stone-400">{i + 1}</span>
                    <span className="flex-1 text-sm text-stone-700">{t.theme}</span>
                    <div className="w-20 overflow-hidden rounded-full bg-stone-100 h-1.5">
                      <div className="h-full rounded-full bg-stone-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-semibold text-stone-600">{t.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top keywords */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Palavras-chave dos usuários (30 dias)
          </h2>
          {keywords.length === 0 ? (
            <div className="rounded-lg border border-dashed border-stone-200 bg-white p-8 text-center">
              <p className="text-sm text-stone-400">Aparecerão após as primeiras mensagens dos usuários.</p>
            </div>
          ) : (
            <div className="rounded-lg border border-stone-200 bg-white p-5">
              <div className="flex flex-wrap gap-2">
                {keywords.map(k => {
                  const size = Math.max(10, Math.min(18, 10 + Math.round((k.count / keywords[0].count) * 8)));
                  return (
                    <span
                      key={k.word}
                      className="rounded-full bg-stone-100 px-2.5 py-1 text-stone-700 font-medium"
                      style={{ fontSize: `${size}px` }}
                      title={`${k.count}×`}
                    >
                      {k.word}
                    </span>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-stone-100 pt-4">
                <p className="mb-2 text-xs font-semibold text-stone-500">Top 5</p>
                {keywords.slice(0, 5).map((k, i) => (
                  <div key={k.word} className="flex items-center justify-between py-0.5 text-xs">
                    <span className="text-stone-600"><span className="font-bold text-stone-400 mr-1">{i + 1}.</span> {k.word}</span>
                    <span className="font-semibold text-stone-700">{k.count}×</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights de produto */}
      <div className="mt-8 rounded-lg border border-dashed border-stone-200 bg-stone-50 p-6">
        <h2 className="mb-3 text-sm font-semibold text-stone-600">💡 Potencial de novos produtos</h2>
        <div className="grid grid-cols-1 gap-3 text-xs text-stone-500 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-stone-700 mb-1">Temas emergentes</p>
            <p>Os temas mais discutidos acima revelam onde os usuários buscam mais apoio. Volume alto em um tema = oportunidade de curso, e-book ou módulo especializado.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700 mb-1">Feedback NPS</p>
            <p>Promotores (9-10) são candidatos a depoimentos e embaixadores. Detratores (0-6) com comentários revelam as maiores fricções do produto.</p>
          </div>
          <div>
            <p className="font-semibold text-stone-700 mb-1">Palavras-chave</p>
            <p>As palavras com maior frequência guiam o SEO de landing pages e o conteúdo dos agentes de marketing para Instagram/YouTube.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
