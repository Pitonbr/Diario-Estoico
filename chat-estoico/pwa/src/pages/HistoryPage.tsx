import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHistory, fetchConversationMessages, ConversationSummary, HistoryMessage } from "../lib/api";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function HistoryPage() {
  const userId = localStorage.getItem("chatestoico_userId")!;
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, HistoryMessage[]>>({});
  const [loadingMsgs, setLoadingMsgs] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory(userId)
      .then(data => setConversations(data.conversations || []))
      .finally(() => setLoading(false));
  }, [userId]);

  const toggleConversation = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!messages[id]) {
      setLoadingMsgs(id);
      const data = await fetchConversationMessages(id);
      setMessages(prev => ({ ...prev, [id]: data.messages || [] }));
      setLoadingMsgs(null);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="back-btn" onClick={() => navigate("/chat")} aria-label="Voltar ao chat">
          ←
        </button>
        <div>
          <h1>HISTÓRICO</h1>
          <div className="subtitle">REFLEXÕES ANTERIORES</div>
        </div>
        <div style={{ width: 36 }} />
      </header>

      <div className="history-scroll">
        {loading && (
          <div className="thinking">carregando</div>
        )}

        {!loading && conversations.length === 0 && (
          <div className="history-empty">
            <p>Nenhuma conversa encerrada ainda.</p>
            <p>Ao terminar uma conversa, ela aparecerá aqui com um resumo reflexivo.</p>
          </div>
        )}

        {conversations.map(convo => (
          <div
            key={convo.id}
            className={`history-card ${expandedId === convo.id ? "expanded" : ""}`}
          >
            <button
              className="history-card-header"
              onClick={() => toggleConversation(convo.id)}
              aria-expanded={expandedId === convo.id}
            >
              <div className="history-date">{formatDate(convo.started_at)}</div>
              <div className="history-meta">
                <span>{formatTime(convo.started_at)}</span>
                {convo.message_count != null && (
                  <span>{convo.message_count} {convo.message_count === 1 ? "mensagem" : "mensagens"}</span>
                )}
              </div>
              {convo.session_summary && (
                <p className="history-summary">{convo.session_summary}</p>
              )}
              {convo.themes_discussed && convo.themes_discussed.length > 0 && (
                <div className="history-themes">
                  {convo.themes_discussed.map(t => (
                    <span key={t} className="theme-chip">{t}</span>
                  ))}
                </div>
              )}
              <span className="history-chevron">{expandedId === convo.id ? "▲" : "▼"}</span>
            </button>

            {expandedId === convo.id && (
              <div className="history-messages">
                {loadingMsgs === convo.id ? (
                  <div className="thinking">carregando</div>
                ) : (
                  (messages[convo.id] || []).map((msg, i) =>
                    msg.role === "user" ? (
                      <div key={i} className="hist-msg hist-msg-user">{msg.content}</div>
                    ) : (
                      <div key={i} className="hist-msg hist-msg-assistant">
                        {msg.content.split("\n\n").map((para, j) => (
                          <p key={j}>{para}</p>
                        ))}
                      </div>
                    )
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
