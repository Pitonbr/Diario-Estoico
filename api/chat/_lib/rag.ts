/**
 * RAG via Postgres full-text search — sem OpenAI, custo zero.
 * Usa ILIKE para buscar ensinamentos relevantes, com ranking por:
 * 1. Relevância de keywords da mensagem
 * 2. Afinidade filosófica do usuário (filósofo/tema preferido = boost)
 */
import { getDb } from "./db";

export interface RetrievedTeaching {
  teachingKey: string;
  philosopher: string;
  work: string;
  bookChapter: string;
  originalText: string;
  theme: string;
}

export async function retrieveTeachings(
  userMessage: string,
  recentContext: string[] = [],
  affinity: { philosophers: Record<string, number>; themes: Record<string, number> } = { philosophers: {}, themes: {} },
  matchCount = 3
): Promise<RetrievedTeaching[]> {
  const db = getDb();

  const queryText = [userMessage, ...recentContext.slice(-2)].join(" ");

  const stopwords = new Set([
    "de","a","o","que","e","do","da","em","um","para","com","uma","os","no","se",
    "na","por","mais","as","dos","como","mas","foi","ao","ele","das","tem","à",
    "seu","sua","ou","ser","quando","muito","há","nos","já","está","eu","também",
    "só","pelo","pela","até","isso","ela","entre","era","depois","sem","mesmo",
    "isso","aqui","ali","agora","hoje","então","assim","tudo","nada","cada","todo",
    "the","a","an","is","are","was","were","be","to","of","and","in","that","it",
    "for","on","with","as","at","by","from","this","or","but","not","have","had"
  ]);

  const keywords = queryText
    .toLowerCase()
    .replace(/[^\w\sáéíóúãõâêôçàüñ]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w))
    .slice(0, 10);

  if (keywords.length === 0) return getFallback(matchCount);

  // Busca com ILIKE em tema, texto e tags
  const { data, error } = await db
    .from("stoic_teachings")
    .select("teaching_key, philosopher, work, book_chapter, original_text, theme")
    .or(
      keywords.map(k =>
        `original_text.ilike.%${k}%,theme.ilike.%${k}%`
      ).join(",")
    )
    .limit(matchCount * 5);

  if (error || !data || data.length === 0) {
    return getFallback(matchCount, affinity);
  }

  // Ranking com boost de afinidade
  const totalAffinityVotes = Object.values(affinity.philosophers).reduce((a, b) => a + b, 0) +
    Object.values(affinity.themes).reduce((a, b) => a + b, 0);

  const ranked = data
    .map(t => {
      const text = `${t.original_text} ${t.theme}`.toLowerCase();

      // Score de relevância por keywords
      const keywordScore = keywords.filter(k => text.includes(k)).length;

      // Score de afinidade filosófica (normalizado 0-1, peso máximo 1.5)
      let affinityScore = 0;
      if (totalAffinityVotes > 0) {
        const phKey = t.philosopher.toLowerCase().replace(/\s/g, "_");
        const phVotes = affinity.philosophers[phKey] || 0;
        const thVotes = affinity.themes[t.theme] || 0;
        affinityScore = ((phVotes + thVotes) / totalAffinityVotes) * 1.5;
      }

      return { t, score: keywordScore + affinityScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, matchCount)
    .map(({ t }) => mapTeaching(t));

  return ranked.length > 0 ? ranked : getFallback(matchCount, affinity);
}

async function getFallback(
  matchCount: number,
  affinity: { philosophers: Record<string, number>; themes: Record<string, number> } = { philosophers: {}, themes: {} }
): Promise<RetrievedTeaching[]> {
  const db = getDb();

  // Se há afinidade, prioriza o filósofo favorito no fallback
  const topPhilosopher = getTopKey(affinity.philosophers);
  const topTheme = getTopKey(affinity.themes);

  if (topTheme) {
    const { data } = await db.from("stoic_teachings")
      .select("teaching_key, philosopher, work, book_chapter, original_text, theme")
      .eq("theme", topTheme)
      .limit(matchCount);
    if (data && data.length > 0) return data.map(mapTeaching);
  }

  if (topPhilosopher) {
    const { data } = await db.from("stoic_teachings")
      .select("teaching_key, philosopher, work, book_chapter, original_text, theme")
      .ilike("philosopher", `%${topPhilosopher.replace(/_/g, " ")}%`)
      .limit(matchCount);
    if (data && data.length > 0) return data.map(mapTeaching);
  }

  const { data: fallback } = await db
    .from("stoic_teachings")
    .select("teaching_key, philosopher, work, book_chapter, original_text, theme")
    .limit(matchCount);
  return (fallback || []).map(mapTeaching);
}

function getTopKey(record: Record<string, number>): string | null {
  const entries = Object.entries(record);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function mapTeaching(t: {
  teaching_key: string; philosopher: string; work: string;
  book_chapter: string; original_text: string; theme: string;
}): RetrievedTeaching {
  return {
    teachingKey: t.teaching_key,
    philosopher: t.philosopher,
    work: t.work,
    bookChapter: t.book_chapter,
    originalText: t.original_text,
    theme: t.theme,
  };
}
