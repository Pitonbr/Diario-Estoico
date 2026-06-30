import Link from "next/link";
import { AGENTS_REGISTRY } from "@/lib/agents-registry";
import { getContentPieces } from "@/lib/content";

export default async function AgentsPage() {
  const pending = await getContentPieces("pending_approval", undefined, 200);

  const pendingByAgent: Record<string, number> = {};
  for (const p of pending) {
    pendingByAgent[p.agent_key] = (pendingByAgent[p.agent_key] ?? 0) + 1;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/marketing" className="text-sm text-stone-500 hover:text-stone-900">
          ← Feed
        </Link>
        <h1 className="text-2xl font-semibold text-stone-900">Agentes de Conteúdo</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS_REGISTRY.map((agent) => {
          const pendingCount = pendingByAgent[agent.key] ?? 0;
          return (
            <Link
              key={agent.key}
              href={`/marketing/agents/${agent.key}`}
              className="flex flex-col rounded-lg border border-stone-200 bg-white p-5 hover:border-stone-400 hover:shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-2xl">{agent.emoji}</span>
                <div className="flex gap-1">
                  {!agent.hasContentFeed && (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                      não integrado
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      {pendingCount} aguardando
                    </span>
                  )}
                </div>
              </div>

              <h2 className="mb-1 font-semibold text-stone-900">{agent.label}</h2>
              <p className="mb-3 line-clamp-2 text-xs text-stone-500">{agent.description}</p>

              <div className="mt-auto flex flex-wrap gap-1">
                {agent.platforms.map((p) => (
                  <span key={p} className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                    {p}
                  </span>
                ))}
              </div>

              <p className="mt-2 text-xs text-stone-400">🕐 {agent.schedule}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
