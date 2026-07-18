import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ONBOARDING_QUESTIONS } from "../_lib/onboarding";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (_req.method === "OPTIONS") return res.status(200).end();
  res.json({ questions: ONBOARDING_QUESTIONS, termsVersion: "1.0.0" });
}
