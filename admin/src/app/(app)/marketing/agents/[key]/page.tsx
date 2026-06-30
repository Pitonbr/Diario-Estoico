import { notFound } from "next/navigation";
import Link from "next/link";
import { getAgent } from "@/lib/agents-registry";
import { getFileContent } from "@/lib/github";
import { getContentPieces, STATUS_LABELS, STATUS_COLORS } from "@/lib/content";
import { PromptEditor } from "./PromptEditor";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const agent = getAgent(key);
  if (!agent) notFound();

  const recentPieces = await getContentPieces("all", key, 10);

  let promptData: { content: string; sha: string } | null = null;
  let promptError: string | null = null;

  if (agent.promptFile) {
    try {
      promptData = await getFileContent(agent.promptFile);
    } catch (e) {
      promptError = e instanceof Error ? e.message : "Erro ao carregar prompt do GitHub";
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/marketing/agents" className="text-sm text-stone-500 hover:text-stone-900">
          ← Agentes
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-3">
          <span className="text-3xl">{agent.emoji}</span>
          <h1 className="text-2xl font-semibold text-stone-900">{agent.label}</h1>
        </div>
        <p className="mb-3 text-sm text-stone-500">{agent.description}</p>
        <div className="flex flex-wrap gap-2">
          {agent.platforms.map((p) => (
            <span key={p} className="rounded bg-stone-100 px-2 py-1 text-xs text-stone-600">
              {p}
            </span>
          ))}
          <span className="rounded bg-stone-100 px-2 py-1 text-xs text-stone-600">
            🕐 {agent.schedule}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Prompt Editor — 2/3 width */}
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Prompt do Agente
          </h2>

          {!agent.promptFile ? (
            <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center">
              <p className="text-sm text-stone-500">
                {key === "newsletter"
                  ? "Newsletter gerenciada pelo pipeline principal (src/). Editar em src/email/templates/diario-estoico.tsx."
                  : "Agente ainda não integrado com editor de prompt."}
              </p>
            </div>
          ) : promptError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <p className="text-sm text-red-600">{promptError}</p>
            </div>
          ) : promptData ? (
            <PromptEditor
              agentKey={key}
              filePath={agent.promptFile}
              initialContent={promptData.content}
              sha={promptData.sha}
            />
          ) : null}
        </div>

        {/* Recent content — 1/3 width */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Últimas Peças Geradas
          </h2>

          {recentPieces.length === 0 ? (
            <p className="text-sm text-stone-400">Nenhuma peça ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentPieces.map((piece) => (
                <Link
                  key={piece.id}
                  href={`/marketing/${piece.id}`}
                  className="rounded-lg border border-stone-200 bg-white p-3 hover:border-stone-400"
                >
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <span className="text-xs text-stone-400">{piece.generated_date}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[piece.status]}`}
                    >
                      {STATUS_LABELS[piece.status]}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-stone-700">
                    {piece.title ?? `${piece.format} — ${piece.platform}`}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {agent.key === "newsletter" && (
            <Link
              href="/marketing?status=all"
              className="mt-4 block text-center text-xs text-stone-500 hover:text-stone-900 underline"
            >
              Ver histórico de newsletters →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
