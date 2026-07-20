"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSocialMetricAction(
  platform: string,
  followers: number,
  handle: string,
  profileUrl: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("social_metrics")
    .update({
      followers,
      handle: handle || null,
      profile_url: profileUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("platform", platform);

  if (error) return { error: error.message };
  revalidatePath("/admin/redes-sociais");
  revalidatePath("/");
  return { success: true };
}
