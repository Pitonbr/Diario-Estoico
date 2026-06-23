import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Preview,
  Font,
  Img,
} from "@react-email/components";

export interface DiarioEstoicoEmailProps {
  dayLabel: string;
  dateFormatted: string;
  editionLabel: string;
  quote: { text: string; author: string; source: string };
  contextTitle: string;
  contextBody: string;
  applicationTitle: string;
  applicationBody: string;
  ctaQuestions: string[];
  bibliographicRef: string;
  eventConnection?: string;
  preheader?: string;
}

// ── Paleta Grécia Antiga ──
const COLORS = {
  darkBlue: "#1B2A4A",
  gold: "#C49A6C",
  marble: "#F5F0EB",
  cream: "#FAF8F5",
  text: "#2D2D2D",
  textLight: "#6B6B6B",
  white: "#FFFFFF",
  border: "#E8E0D6",
};

// ── Padrão Meandro Grego (inline SVG como data URI) ──
const MEANDER_BORDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='8' viewBox='0 0 40 8'%3E%3Cpath d='M0 0h8v8H0V6h6V2H2v4H0V0zm10 0h8v8h-8V6h6V2h-4v4h-2V0zm10 0h8v8h-8V6h6V2h-4v4h-2V0zm10 0h8v8h-8V6h6V2h-4v4h-2V0z' fill='%23C49A6C' fill-opacity='0.3'/%3E%3C/svg%3E`;

export function DiarioEstoicoEmail(props: DiarioEstoicoEmailProps) {
  const {
    dayLabel,
    dateFormatted,
    editionLabel,
    quote,
    contextTitle,
    contextBody,
    applicationTitle,
    applicationBody,
    ctaQuestions,
    bibliographicRef,
    eventConnection,
    preheader,
  } = props;

  return (
    <Html lang="pt-BR">
      <Head>
        <Font
          fontFamily="Georgia"
          fallbackFontFamily="serif"
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Georgia"
          fallbackFontFamily="serif"
          fontWeight={700}
          fontStyle="normal"
        />
      </Head>
      {preheader && <Preview>{preheader}</Preview>}
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* ═══ Header com padrão grego ═══ */}
          <Section style={styles.header}>
            <Img
              src={MEANDER_BORDER}
              width="100%"
              height="8"
              alt=""
              style={{ display: "block" }}
            />
            <Text style={styles.headerTitle}>🏛️ DIÁRIO ESTOICO</Text>
            <Text style={styles.headerSub}>
              {dayLabel} · {dateFormatted}
            </Text>
            <Img
              src={MEANDER_BORDER}
              width="100%"
              height="8"
              alt=""
              style={{ display: "block" }}
            />
          </Section>

          {/* ═══ Citação do dia ═══ */}
          <Section style={styles.quoteSection}>
            <Text style={styles.sectionIcon}>📜</Text>
            <Text style={styles.sectionLabel}>ENSINAMENTO DO DIA</Text>
            <Section style={styles.quoteBox}>
              <Text style={styles.quoteText}>&ldquo;{quote.text}&rdquo;</Text>
              <Text style={styles.quoteAuthor}>
                — {quote.author}, {quote.source}
              </Text>
            </Section>
          </Section>

          {/* ═══ Contextualização ═══ */}
          <Section style={styles.contentSection}>
            <Text style={styles.contextTitle}>{contextTitle}</Text>
            {contextBody.split("\n\n").map((paragraph, i) => (
              <Text key={i} style={styles.bodyText}>
                {paragraph}
              </Text>
            ))}
          </Section>

          <Hr style={styles.divider} />

          {/* ═══ Aplicação prática ═══ */}
          <Section style={styles.applicationSection}>
            <Text style={styles.sectionIcon}>⚡</Text>
            <Text style={styles.sectionLabel}>{applicationTitle}</Text>
            <Text style={styles.applicationText}>{applicationBody}</Text>
          </Section>

          <Hr style={styles.divider} />

          {/* ═══ Call to Action ═══ */}
          <Section style={styles.ctaSection}>
            <Text style={styles.sectionIcon}>🎯</Text>
            <Text style={styles.sectionLabel}>REFLEXÃO DO DIA</Text>
            {ctaQuestions.map((question, i) => (
              <Text key={i} style={styles.ctaQuestion}>
                {i + 1}. {question}
              </Text>
            ))}
          </Section>

          <Hr style={styles.divider} />

          {/* ═══ Footer ═══ */}
          <Section style={styles.footer}>
            <Text style={styles.footerRef}>
              📚 {bibliographicRef}
            </Text>
            {eventConnection && (
              <Text style={styles.footerEvent}>
                🔗 {eventConnection}
              </Text>
            )}
            <Img
              src={MEANDER_BORDER}
              width="100%"
              height="8"
              alt=""
              style={{ display: "block", marginTop: "16px" }}
            />
            <Text style={styles.footerBrand}>
              🏛️ Diário Estoico · {editionLabel}
            </Text>
            <Text style={styles.footerMotto}>
              Sabedoria antiga para a vida moderna
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ── Estilos inline (email-safe) ──
const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: COLORS.marble,
    fontFamily: "Georgia, 'Times New Roman', serif",
    margin: 0,
    padding: "20px 0",
  },
  container: {
    backgroundColor: COLORS.white,
    maxWidth: "600px",
    margin: "0 auto",
    borderRadius: "4px",
    border: `1px solid ${COLORS.border}`,
    overflow: "hidden",
  },
  header: {
    backgroundColor: COLORS.darkBlue,
    padding: "0",
    textAlign: "center" as const,
  },
  headerTitle: {
    color: COLORS.gold,
    fontSize: "28px",
    fontWeight: "bold" as const,
    letterSpacing: "4px",
    margin: "20px 0 4px",
    fontFamily: "Georgia, serif",
  },
  headerSub: {
    color: COLORS.marble,
    fontSize: "13px",
    letterSpacing: "1px",
    margin: "0 0 20px",
    opacity: 0.85,
  },
  quoteSection: {
    padding: "28px 32px 20px",
    textAlign: "center" as const,
  },
  sectionIcon: {
    fontSize: "24px",
    margin: "0 0 4px",
    textAlign: "center" as const,
  },
  sectionLabel: {
    color: COLORS.gold,
    fontSize: "11px",
    fontWeight: "bold" as const,
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    margin: "0 0 16px",
    textAlign: "center" as const,
  },
  quoteBox: {
    borderLeft: `4px solid ${COLORS.gold}`,
    paddingLeft: "20px",
    margin: "0 8px",
    textAlign: "left" as const,
  },
  quoteText: {
    color: COLORS.darkBlue,
    fontSize: "18px",
    fontStyle: "italic" as const,
    lineHeight: "1.6",
    margin: "0 0 8px",
    fontFamily: "Georgia, serif",
  },
  quoteAuthor: {
    color: COLORS.gold,
    fontSize: "14px",
    margin: "0",
    fontFamily: "Georgia, serif",
  },
  contentSection: {
    padding: "8px 32px 20px",
  },
  contextTitle: {
    color: COLORS.darkBlue,
    fontSize: "20px",
    fontWeight: "bold" as const,
    margin: "0 0 16px",
    fontFamily: "Georgia, serif",
  },
  bodyText: {
    color: COLORS.text,
    fontSize: "15px",
    lineHeight: "1.7",
    margin: "0 0 12px",
    fontFamily: "Georgia, serif",
  },
  divider: {
    borderTop: `1px solid ${COLORS.border}`,
    margin: "0 32px",
  },
  applicationSection: {
    padding: "20px 32px",
    backgroundColor: COLORS.cream,
    textAlign: "center" as const,
  },
  applicationText: {
    color: COLORS.text,
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0",
    textAlign: "left" as const,
    fontFamily: "Georgia, serif",
  },
  ctaSection: {
    padding: "20px 32px",
    textAlign: "center" as const,
  },
  ctaQuestion: {
    color: COLORS.darkBlue,
    fontSize: "15px",
    fontWeight: "bold" as const,
    lineHeight: "1.6",
    margin: "0 0 8px",
    textAlign: "left" as const,
    fontFamily: "Georgia, serif",
  },
  footer: {
    padding: "20px 32px",
    backgroundColor: COLORS.marble,
    textAlign: "center" as const,
  },
  footerRef: {
    color: COLORS.textLight,
    fontSize: "12px",
    margin: "0 0 4px",
  },
  footerEvent: {
    color: COLORS.textLight,
    fontSize: "12px",
    margin: "0 0 4px",
  },
  footerBrand: {
    color: COLORS.darkBlue,
    fontSize: "14px",
    fontWeight: "bold" as const,
    letterSpacing: "2px",
    margin: "16px 0 4px",
  },
  footerMotto: {
    color: COLORS.gold,
    fontSize: "12px",
    fontStyle: "italic" as const,
    margin: "0",
  },
};

export default DiarioEstoicoEmail;
