/**
 * RAG via Postgres full-text search — sem OpenAI, custo zero.
 * Usa tsvector do Postgres para buscar ensinamentos relevantes.
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
  matchCount = 3
): Promise<RetrievedTeaching[]> {
  const db = getDb();

  // Combina mensagem atual com contexto recente para query mais rica
  const queryText = [userMessage, ...recentContext.slice(-2)].join(" ");

  // Extrai palavras-chave (remove stopwords em PT/EN)
  const stopwords = new Set([
    "de","a","o","que","e","do","da","em","um","para","com","uma","os","no","se",
    "na","por","mais","as","dos","como","mas","foi","ao","ele","das","tem","à",
    "seu","sua","ou","ser","quando","muito","há","nos","já","está","eu","também",
    "só","pelo","pela","até","isso","ela","entre","era","depois","sem","mesmo",
    "the","a","an","is","are","was","were","be","to","of","and","in","that","it",
    "for","on","with","as","at","by","from","this","or","but","not","have","had"
  ]);

  const keywords = queryText
    .toLowerCase()
    .replace(/[^\w\sáéíóúãõâêôçàüñ]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w))
    .slice(0, 8);

  if (keywords.length === 0) return [];

  // Busca usando ILIKE em tema, tags e texto original
  const conditions = keywords.map(k =>
    `(original_text ILIKE '%${k}%' OR theme ILIKE '%${k}%' OR tags::text ILIKE '%${k}%')`
  );
  const whereClause = conditions.join(" OR ");

  const { data, error } = await db
    .from("stoic_teachings")
    .select("teaching_key, philosopher, work, book_chapter, original_text, theme")
    .or(
      keywords.map(k =>
        `original_text.ilike.%${k}%,theme.ilike.%${k}%`
      ).join(",")
    )
    .limit(matchCount * 3); // busca mais, depois ranqueia

  if (error || !data || data.length === 0) {
    // Fallback: retorna ensinamentos por tema mais comum
    const { data: fallback } = await db
      .from("stoic_teachings")
      .select("teaching_key, philosopher, work, book_chapter, original_text, theme")
      .limit(matchCount);
    return (fallback || []).map(mapTeaching);
  }

  // Ranqueia por relevância (quantas keywords batem)
  const ranked = data
    .map(t => {
      const text = `${t.original_text} ${t.theme}`.toLowerCase();
      const score = keywords.filter(k => text.includes(k)).length;
      return { t, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, matchCount)
    .filter(({ score }) => score > 0)
    .map(({ t }) => mapTeaching(t));

  return ranked;
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
