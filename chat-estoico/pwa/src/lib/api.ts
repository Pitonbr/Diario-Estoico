const API_BASE = (import.meta as unknown as Record<string, Record<string,string>>).env?.VITE_API_URL ?? "/api";

export interface OnboardingQuestion {
  id: string;
  question: string;
  type: "single" | "multi";
  options: { value: string; label: string }[];
}

export interface ConversationSummary {
  id: string;
  started_at: string;
  ended_at: string | null;
  session_summary: string | null;
  themes_discussed: string[] | null;
  message_count: number | null;
}

export interface HistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export async function fetchOnboardingQuestions(): Promise<{ questions: OnboardingQuestion[]; termsVersion: string }> {
  const res = await fetch(`${API_BASE}/onboarding/questions`);
  return res.json();
}

export async function submitOnboarding(payload: {
  email: string;
  answers: Record<string, string | string[]>;
  displayName: string;
  termsAccepted: true;
  privacyAccepted: true;
}): Promise<{ userId: string }> {
  const res = await fetch(`${API_BASE}/onboarding/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erro no onboarding");
  return res.json();
}

export async function startConversation(userId: string): Promise<{ conversationId: string; greeting: string }> {
  const res = await fetch(`${API_BASE}/conversations/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error(`Erro ao iniciar conversa (${res.status})`);
  return res.json();
}

export async function sendMessage(
  userId: string,
  conversationId: string,
  message: string
): Promise<{ reply: string; safetyFlag: string | null; messagesRemaining: number | null; error?: string }> {
  const res = await fetch(`${API_BASE}/conversations/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, conversationId, message }),
  });
  return res.json();
}

export async function endConversation(conversationId: string): Promise<void> {
  await fetch(`${API_BASE}/conversations/end`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId }),
  });
}

export async function fetchHistory(userId: string): Promise<{ conversations: ConversationSummary[] }> {
  const res = await fetch(`${API_BASE}/conversations/${userId}`);
  return res.json();
}

export async function fetchConversationMessages(conversationId: string): Promise<{ messages: HistoryMessage[] }> {
  const res = await fetch(`${API_BASE}/conversations/messages/${conversationId}`);
  return res.json();
}

export async function submitNps(params: {
  userId: string;
  conversationId: string;
  score: number;
  feedbackText?: string;
}): Promise<void> {
  await fetch(`${API_BASE}/nps/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.userId,
      conversationId: params.conversationId,
      score: params.score,
      feedbackText: params.feedbackText || null,
    }),
  });
}
