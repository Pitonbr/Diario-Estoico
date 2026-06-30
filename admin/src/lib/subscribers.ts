import { createClient } from "@/lib/supabase/server";

export interface Subscriber {
  id: string;
  channel: "email" | "whatsapp";
  email: string | null;
  phone: string | null;
  name: string | null;
  active: boolean;
  approval_status: "approved" | "pending" | "rejected";
  signup_risk_score: number;
  risk_notes: string | null;
  approved_at: string | null;
  created_at: string;
  unsubscribed_at: string | null;
}

export async function getSubscribers(filter?: {
  approval?: "approved" | "pending" | "rejected" | "all";
  channel?: "email" | "whatsapp" | "all";
  search?: string;
}): Promise<Subscriber[]> {
  const db = await createClient();
  let q = db.from("subscribers").select("*").order("created_at", { ascending: false });

  if (filter?.approval && filter.approval !== "all")
    q = q.eq("approval_status", filter.approval);
  if (filter?.channel && filter.channel !== "all")
    q = q.eq("channel", filter.channel);
  if (filter?.search) {
    const s = `%${filter.search}%`;
    q = q.or(`email.ilike.${s},phone.ilike.${s},name.ilike.${s}`);
  }

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Subscriber[];
}

export async function updateSubscriberApproval(
  id: string,
  approval: "approved" | "rejected"
): Promise<void> {
  const db = await createClient();
  await db
    .from("subscribers")
    .update({
      approval_status: approval,
      active: approval === "approved",
      approved_at: approval === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", id);
}

export async function toggleSubscriberActive(id: string, active: boolean): Promise<void> {
  const db = await createClient();
  await db
    .from("subscribers")
    .update({ active, unsubscribed_at: active ? null : new Date().toISOString() })
    .eq("id", id);
}

export async function deleteSubscriber(id: string): Promise<void> {
  const db = await createClient();
  await db.from("subscribers").delete().eq("id", id);
}
