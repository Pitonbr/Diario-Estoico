import stoicLibrary from "../../data/stoic-library.json";
import { getUsedTeachingKeys, getRecentPhilosophers, getRecentDomains } from "../database/queries";

export interface TeachingEntry {
  id: string;
  philosopher: string;
  work: string;
  bookChapter: string;
  theme: string;
  originalText: string;
  practicalDomains: string[];
  tags: string[];
}

const DOMAINS = ["pessoal", "financeiro", "empreendedor"] as const;
export type PracticalDomain = (typeof DOMAINS)[number];

/**
 * Seleciona o ensinamento do dia com lógica anti-repetição:
 * 1. Exclui ensinamentos já usados
 * 2. Evita repetir o mesmo filósofo dos últimos 3 dias
 * 3. Rotaciona domínio prático (pessoal → financeiro → empreendedor)
 * 4. Se a data tem evento especial, prioriza tags compatíveis
 */
export async function selectTeachingForToday(
  eventTags: string[] = []
): Promise<{ teaching: TeachingEntry; domain: PracticalDomain }> {
  const usedKeys = await getUsedTeachingKeys();
  const recentPhilosophers = await getRecentPhilosophers(3);
  const recentDomains = await getRecentDomains(3);

  // Pool disponível: remove já usados
  let pool = stoicLibrary.teachings.filter((t) => !usedKeys.includes(t.id));

  // Se esgotou tudo, reseta (ciclo completo)
  if (pool.length === 0) {
    console.log("♻️  Todos os ensinamentos já foram usados. Reiniciando ciclo.");
    pool = [...stoicLibrary.teachings];
  }

  // Prioriza filósofos não-recentes
  const preferredPool = pool.filter(
    (t) => !recentPhilosophers.includes(t.philosopher)
  );
  const workingPool = preferredPool.length > 0 ? preferredPool : pool;

  // Se há eventos do dia, prioriza ensinamentos com tags compatíveis
  let selected: TeachingEntry;
  if (eventTags.length > 0) {
    const tagMatched = workingPool.filter((t) =>
      t.tags.some((tag) => eventTags.includes(tag))
    );
    selected =
      tagMatched.length > 0
        ? tagMatched[Math.floor(Math.random() * tagMatched.length)]
        : workingPool[Math.floor(Math.random() * workingPool.length)];
  } else {
    selected = workingPool[Math.floor(Math.random() * workingPool.length)];
  }

  // Domínio prático: rotaciona evitando repetição dos últimos 3
  const domain = selectDomain(selected.practicalDomains, recentDomains);

  return {
    teaching: selected,
    domain,
  };
}

function selectDomain(
  available: string[],
  recent: string[]
): PracticalDomain {
  // Prioriza domínio que não foi usado recentemente
  const preferred = DOMAINS.filter(
    (d) => available.includes(d) && !recent.includes(d)
  );

  if (preferred.length > 0) {
    return preferred[Math.floor(Math.random() * preferred.length)];
  }

  // Fallback: qualquer domínio disponível
  const validDomains = DOMAINS.filter((d) => available.includes(d));
  return validDomains.length > 0
    ? validDomains[Math.floor(Math.random() * validDomains.length)]
    : "pessoal";
}

export function getTotalTeachings(): number {
  return stoicLibrary.teachings.length;
}
