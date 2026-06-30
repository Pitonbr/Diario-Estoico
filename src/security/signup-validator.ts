// Domínios de email descartáveis conhecidos
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","tempmail.com","throwam.com","yopmail.com",
  "sharklasers.com","guerrillamailblock.com","grr.la","guerrillamail.info",
  "spam4.me","trashmail.com","trashmail.at","trashmail.io","trashmail.me",
  "dispostable.com","mailnull.com","spamgourmet.com","spamgourmet.net",
  "maildrop.cc","discard.email","fakeinbox.com","tempr.email","throwam.com",
  "getnada.com","10minutemail.com","10minutemail.net","tempemail.net",
  "mohmal.com","tempinbox.com","emailondeck.com","owlpic.com",
]);

// Padrões suspeitos em endereços de email
const SUSPICIOUS_EMAIL_PATTERNS = [
  /^[a-z]{1,2}\d{6,}@/i,      // ex: x123456789@
  /^\d+@/,                      // começa só com números
  /[^a-z0-9._+\-@]/i,          // caracteres incomuns
];

export interface SignupValidation {
  riskScore: number;   // 0–100; >= 60 vai para fila de aprovação
  riskNotes: string;
  shouldPend: boolean; // true = colocar em approval_status: 'pending'
}

export function validateSignup(email?: string | null, phone?: string | null): SignupValidation {
  const notes: string[] = [];
  let score = 0;

  // ── Validação de e-mail ──
  if (email) {
    const domain = email.split("@")[1]?.toLowerCase() ?? "";

    if (DISPOSABLE_DOMAINS.has(domain)) {
      score += 60;
      notes.push(`Domínio descartável: ${domain}`);
    }

    const isSuspicious = SUSPICIOUS_EMAIL_PATTERNS.some((re) => re.test(email));
    if (isSuspicious) {
      score += 25;
      notes.push("Padrão de email suspeito");
    }

    if (!email.includes(".")) {
      score += 10;
      notes.push("Email sem ponto no domínio");
    }
  } else if (!phone) {
    score += 30;
    notes.push("Sem email nem telefone");
  }

  // ── Validação de telefone ──
  if (phone) {
    const digits = phone.replace(/\D/g, "");

    // Formato brasileiro: 55 + DDD (2 dígitos) + número (8 ou 9 dígitos) = 12 ou 13 dígitos
    const isBrazilianMobile = /^55[1-9]{2}9\d{8}$/.test(digits);
    const isBrazilianLandline = /^55[1-9]{2}[2-5]\d{7}$/.test(digits);

    if (!isBrazilianMobile && !isBrazilianLandline) {
      score += 20;
      notes.push(`Formato de telefone inválido: ${digits}`);
    }

    // Números sequenciais óbvios (ex: 55119999999999)
    if (/(.)\1{6,}/.test(digits)) {
      score += 30;
      notes.push("Telefone com dígitos repetidos");
    }
  }

  const riskScore = Math.min(score, 100);
  return {
    riskScore,
    riskNotes: notes.join("; ") || "OK",
    shouldPend: riskScore >= 60,
  };
}
