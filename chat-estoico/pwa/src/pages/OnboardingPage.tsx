import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOnboardingQuestions, submitOnboarding, OnboardingQuestion } from "../lib/api";
import { TERMS_TEXT, PRIVACY_TEXT } from "../lib/legal-texts";

type Step = "terms" | "email" | "quiz" | "submitting" | "error";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("terms");
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  useEffect(() => {
    fetchOnboardingQuestions().then((data) => setQuestions(data.questions));
  }, []);

  const handleSelect = (qId: string, value: string, type: "single" | "multi") => {
    if (type === "single") {
      setAnswers((prev) => ({ ...prev, [qId]: value }));
    } else {
      setAnswers((prev) => {
        const current = (prev[qId] as string[]) || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value].slice(0, 3);
        return { ...prev, [qId]: updated };
      });
    }
  };

  const currentQuestion = questions[currentQ];
  const isNameQuestion = currentQuestion?.id === "q2_name";
  const canAdvance = isNameQuestion
    ? displayName.trim().length > 0
    : answers[currentQuestion?.id] !== undefined &&
      (Array.isArray(answers[currentQuestion?.id])
        ? (answers[currentQuestion?.id] as string[]).length > 0
        : true);

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep("submitting");
      try {
        const result = await submitOnboarding({
          email,
          answers,
          displayName,
          termsAccepted: true,
          privacyAccepted: true,
        });
        if (!result.userId || typeof result.userId !== "string") {
          throw new Error("userId inválido retornado pelo servidor");
        }
        localStorage.setItem("chatestoico_userId", result.userId);
        localStorage.setItem("chatestoico_name", displayName);
        navigate("/chat");
      } catch (err) {
        console.error("[Onboarding] Erro:", err);
        setStep("error");
      }
    }
  };

  // ═══ TELA 1: TERMOS (LGPD — obrigatório antes de tudo) ═══
  if (step === "terms") {
    return (
      <div className="onboarding-shell">
        <h1 className="onboarding-question">Antes de começar</h1>
        <div className="terms-scroll">
          <h3>Termos de Uso</h3>
          <div dangerouslySetInnerHTML={{ __html: TERMS_TEXT }} />
          <h3>Política de Privacidade</h3>
          <div dangerouslySetInnerHTML={{ __html: PRIVACY_TEXT }} />
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={termsChecked} onChange={(e) => setTermsChecked(e.target.checked)} />
          <span>Li e aceito os <strong>Termos de Uso</strong>, incluindo o entendimento de que o Chat Estoico é uma ferramenta de reflexão filosófica e não substitui acompanhamento psicológico, médico ou de qualquer profissional de saúde.</span>
        </label>
        <label className="checkbox-row">
          <input type="checkbox" checked={privacyChecked} onChange={(e) => setPrivacyChecked(e.target.checked)} />
          <span>Li e aceito a <strong>Política de Privacidade</strong> e consinto com o tratamento dos meus dados de conversa para personalização da experiência, conforme a LGPD.</span>
        </label>
        <button
          className="primary-btn"
          disabled={!termsChecked || !privacyChecked}
          onClick={() => setStep("email")}
        >
          Aceitar e continuar
        </button>
      </div>
    );
  }

  // ═══ TELA 2: EMAIL ═══
  if (step === "email") {
    return (
      <div className="onboarding-shell">
        <h1 className="onboarding-question">Qual seu melhor email?</h1>
        <input
          className="text-input"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="primary-btn"
          disabled={!/^[^@]+@[^@]+\.[^@]+$/.test(email)}
          onClick={() => setStep("quiz")}
        >
          Continuar
        </button>
      </div>
    );
  }

  // ═══ TELA 3: SUBMITTING ═══
  if (step === "submitting") {
    return (
      <div className="onboarding-shell" style={{ textAlign: "center" }}>
        <p className="thinking">Preparando seu espaço de reflexão</p>
      </div>
    );
  }

  // ═══ TELA DE ERRO ═══
  if (step === "error") {
    return (
      <div className="onboarding-shell" style={{ textAlign: "center" }}>
        <h1 className="onboarding-question" style={{ fontSize: "24px" }}>Algo deu errado</h1>
        <p style={{ color: "var(--texto-suave)", marginBottom: "24px", fontSize: "15px", lineHeight: 1.6 }}>
          Não conseguimos criar seu perfil. Isso pode ser uma instabilidade temporária. Tente novamente em instantes.
        </p>
        <button className="primary-btn" onClick={() => setStep("quiz")}>
          Tentar novamente
        </button>
      </div>
    );
  }

  // ═══ TELA 4: QUIZ ═══
  if (!currentQuestion) return null;

  return (
    <div className="onboarding-shell">
      <div className="onboarding-progress">
        {questions.map((_, i) => (
          <div key={i} className={`progress-dot ${i <= currentQ ? "active" : ""}`} />
        ))}
      </div>

      <h1 className="onboarding-question">{currentQuestion.question}</h1>

      {isNameQuestion ? (
        <input
          className="text-input"
          placeholder="Seu nome"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoFocus
        />
      ) : (
        currentQuestion.options.map((opt) => {
          const selected = Array.isArray(answers[currentQuestion.id])
            ? (answers[currentQuestion.id] as string[]).includes(opt.value)
            : answers[currentQuestion.id] === opt.value;
          return (
            <button
              key={opt.value}
              className={`option-btn ${selected ? "selected" : ""}`}
              onClick={() => handleSelect(currentQuestion.id, opt.value, currentQuestion.type)}
            >
              {opt.label}
            </button>
          );
        })
      )}

      <button className="primary-btn" disabled={!canAdvance} onClick={handleNext}>
        {currentQ < questions.length - 1 ? "Próxima" : "Começar a conversar"}
      </button>
    </div>
  );
}
