import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startConversation, sendMessage, endConversation, submitNps } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const userId = localStorage.getItem("chatestoico_userId")!;
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [startError, setStartError] = useState(false);
  const [showNps, setShowNps] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsFeedback, setNpsFeedback] = useState("");
  const pendingConvoRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) {
      navigate("/onboarding");
      return;
    }
    startConversation(userId)
      .then((data) => {
        if (!data.conversationId || !data.greeting) {
          setStartError(true);
          return;
        }
        setConversationId(data.conversationId);
        setMessages([{ role: "assistant", content: data.greeting }]);
      })
      .catch((err: Error) => {
        // Usuário não encontrado no banco → cadastro corrompido → refazer onboarding
        if (err.message.includes("404") || err.message.toLowerCase().includes("não encontrado")) {
          localStorage.removeItem("chatestoico_userId");
          localStorage.removeItem("chatestoico_name");
          localStorage.removeItem("chatestoico_activeConvo");
          navigate("/onboarding");
          return;
        }
        setStartError(true);
      });

    return () => {
      const cid = localStorage.getItem("chatestoico_activeConvo");
      if (cid) endConversation(cid).catch(() => {});
    };
  }, [userId, navigate]);

  useEffect(() => {
    if (conversationId) localStorage.setItem("chatestoico_activeConvo", conversationId);
  }, [conversationId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !conversationId || thinking || limitReached) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setThinking(true);

    try {
      const result = await sendMessage(userId, conversationId, text);

      if (result.error === "limit_reached") {
        setLimitReached(true);
        setThinking(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
      if (result.messagesRemaining !== null) setRemaining(result.messagesRemaining);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Tive um problema para responder. Pode tentar de novo?" },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEndAndHistory = () => {
    if (conversationId && messages.length > 2) {
      endConversation(conversationId).catch(() => {});
      localStorage.removeItem("chatestoico_activeConvo");
      pendingConvoRef.current = conversationId;
      setShowNps(true);
    } else {
      if (conversationId) {
        endConversation(conversationId).catch(() => {});
        localStorage.removeItem("chatestoico_activeConvo");
      }
      navigate("/history");
    }
  };

  const handleNpsSubmit = async () => {
    if (npsScore !== null && pendingConvoRef.current) {
      await submitNps({
        userId,
        conversationId: pendingConvoRef.current,
        score: npsScore,
        feedbackText: npsFeedback || undefined,
      }).catch(() => {});
    }
    setShowNps(false);
    navigate("/history");
  };

  const handleNpsSkip = () => {
    setShowNps(false);
    navigate("/history");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>CHAT ESTOICO</h1>
          <div className="subtitle">EMPREENDER ESTOICO</div>
        </div>
        <div className="header-right">
          {remaining !== null && remaining <= 10 && (
            <div className="subtitle">{remaining} restantes</div>
          )}
          <button
            className="history-nav-btn"
            onClick={handleEndAndHistory}
            title="Ver histórico de conversas"
            aria-label="Histórico"
          >
            ☰
          </button>
        </div>
      </header>

      <div className="chat-scroll" ref={scrollRef}>
        {startError && (
          <div className="msg msg-assistant">
            <p>Tive um problema para iniciar a conversa.</p>
            <p>
              <button
                onClick={() => window.location.reload()}
                style={{ marginTop: "8px", background: "none", border: "none", cursor: "pointer",
                  color: "var(--dourado)", textDecoration: "underline", fontSize: "inherit", fontFamily: "inherit" }}
              >
                Recarregar página
              </button>
            </p>
          </div>
        )}
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="msg msg-user">{msg.content}</div>
          ) : (
            <div key={i} className="msg msg-assistant">
              {(msg.content || "").split("\n\n").map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          )
        )}
        {thinking && <div className="thinking">refletindo</div>}
      </div>

      {limitReached && (
        <div className="limit-banner">
          Você atingiu o limite gratuito deste mês. Em breve, o plano premium estará disponível — e sua reflexão poderá continuar sem limites.
        </div>
      )}

      <div className="chat-input-bar">
        <button className="voice-btn" title="Modo voz — em breve" aria-label="Modo voz em breve">
          🎙
        </button>
        <textarea
          className="chat-input"
          placeholder="O que está na sua mente?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={limitReached}
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={!input.trim() || thinking || limitReached}
          aria-label="Enviar"
        >
          ↑
        </button>
      </div>

      {showNps && (
        <div className="nps-overlay">
          <div className="nps-modal">
            <p className="nps-title">Como foi sua reflexão hoje?</p>
            <p className="nps-sub">De 0 a 10, quanto você recomendaria o Chat Estoico?</p>
            <div className="nps-scores">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  className={`nps-score-btn${npsScore === i ? " nps-score-active" : ""}`}
                  onClick={() => setNpsScore(i)}
                >
                  {i}
                </button>
              ))}
            </div>
            <textarea
              className="nps-feedback"
              placeholder="Comentário (opcional)…"
              value={npsFeedback}
              onChange={(e) => setNpsFeedback(e.target.value)}
              rows={2}
            />
            <div className="nps-actions">
              <button className="nps-skip" onClick={handleNpsSkip}>Pular</button>
              <button
                className="nps-submit"
                onClick={handleNpsSubmit}
                disabled={npsScore === null}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
