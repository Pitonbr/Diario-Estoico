import { useEffect, useRef, useState } from "react";
import { startConversation, sendMessage, endConversation } from "../lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const userId = localStorage.getItem("chatestoico_userId")!;
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Iniciar conversa ao montar
  useEffect(() => {
    startConversation(userId).then((data) => {
      setConversationId(data.conversationId);
      setMessages([{ role: "assistant", content: data.greeting }]);
    });

    // Encerrar conversa ao sair (dispara processamento de memória)
    return () => {
      const cid = localStorage.getItem("chatestoico_activeConvo");
      if (cid) endConversation(cid).catch(() => {});
    };
  }, [userId]);

  useEffect(() => {
    if (conversationId) localStorage.setItem("chatestoico_activeConvo", conversationId);
  }, [conversationId]);

  // Auto-scroll
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

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>CHAT ESTOICO</h1>
          <div className="subtitle">EMPREENDER ESTOICO</div>
        </div>
        {remaining !== null && remaining <= 10 && (
          <div className="subtitle">{remaining} mensagens restantes</div>
        )}
      </header>

      <div className="chat-scroll" ref={scrollRef}>
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="msg msg-user">{msg.content}</div>
          ) : (
            <div key={i} className="msg msg-assistant">
              {msg.content.split("\n\n").map((para, j) => (
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
    </div>
  );
}
