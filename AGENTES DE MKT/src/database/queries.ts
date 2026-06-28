import { getSupabase } from "./client";
import crypto from "crypto";

// ─── Tipos ───
export interface SentNewsletter {
  id?: string;
  edition_number: number;
  send_date: string;
  teaching_key: string;
  philosopher: string;
  source_work: string;
  topic_tags: string[];
  practical_domain: string;
  external_event: string | null;
  content_hash: string;
  subject_line: string;
  full_content: Record<string, unknown>;
  recipient_email: string;
  delivery_status?: string;
  resend_id?: string;
}

// ─── Buscar próximo número de edição ───
export async function getNextEditionNumber(): Promise<number> {
  const db = getSupabase();
  const { data } = await db
    .from("sent_newsletters")
    .select("edition_number")
    .order("edition_number", { ascending: false })
    .limit(1);

  return data && data.length > 0 ? data[0].edition_number + 1 : 1;
}

// ─── Buscar todas as teaching_keys já usadas ───
export async function getUsedTeachingKeys(): Promise<string[]> {
  const db = getSupabase();
  const { data } = await db
    .from("sent_newsletters")
    .select("teaching_key");

  return data ? data.map((row) => row.teaching_key) : [];
}

// ─── Buscar últimos filósofos usados (evitar repetição) ───
export async function getRecentPhilosophers(limit = 3): Promise<string[]> {
  const db = getSupabase();
  const { data } = await db
    .from("sent_newsletters")
    .select("philosopher")
    .order("send_date", { ascending: false })
    .limit(limit);

  return data ? data.map((row) => row.philosopher) : [];
}

// ─── Buscar últimos domínios práticos usados ───
export async function getRecentDomains(limit = 3): Promise<string[]> {
  const db = getSupabase();
  const { data } = await db
    .from("sent_newsletters")
    .select("practical_domain")
    .order("send_date", { ascending: false })
    .limit(limit);

  return data ? data.map((row) => row.practical_domain) : [];
}

// ─── Verificar se já enviou hoje ───
export async function hasAlreadySentToday(date: string): Promise<boolean> {
  const db = getSupabase();
  const { data } = await db
    .from("sent_newsletters")
    .select("id")
    .eq("send_date", date)
    .limit(1);

  return data !== null && data.length > 0;
}

// ─── Verificar duplicata de conteúdo ───
export async function isContentDuplicate(content: string): Promise<boolean> {
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  const db = getSupabase();
  const { data } = await db
    .from("sent_newsletters")
    .select("id")
    .eq("content_hash", hash)
    .limit(1);

  return data !== null && data.length > 0;
}

// ─── Registrar newsletter enviada ───
export async function recordSentNewsletter(newsletter: SentNewsletter): Promise<void> {
  const db = getSupabase();
  const { error } = await db.from("sent_newsletters").insert(newsletter);

  if (error) {
    throw new Error(`Erro ao registrar newsletter: ${error.message}`);
  }
}

// ─── Atualizar status de envio ───
export async function updateDeliveryStatus(
  sendDate: string,
  status: string,
  resendId?: string
): Promise<void> {
  const db = getSupabase();
  const update: Record<string, unknown> = { delivery_status: status };
  if (resendId) update.resend_id = resendId;

  await db.from("sent_newsletters").update(update).eq("send_date", sendDate);
}

// ─── Atualizar uso do ensinamento ───
export async function markTeachingUsed(teachingKey: string): Promise<void> {
  const db = getSupabase();
  const { data } = await db
    .from("stoic_teachings")
    .select("times_used")
    .eq("teaching_key", teachingKey)
    .single();

  const currentCount = data?.times_used ?? 0;

  await db
    .from("stoic_teachings")
    .update({
      times_used: currentCount + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq("teaching_key", teachingKey);
}

// ─── Gerar hash de conteúdo ───
export function generateContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex");
}
