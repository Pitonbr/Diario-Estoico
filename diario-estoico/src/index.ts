import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { config } from "./config/env";
import { generateDailyContent } from "./agent/content-generator";
import { sendNewsletter } from "./email/sender";
import {
  hasAlreadySentToday,
  recordSentNewsletter,
  updateDeliveryStatus,
  markTeachingUsed,
  generateContentHash,
  getNextEditionNumber,
} from "./database/queries";

dayjs.extend(utc);
dayjs.extend(timezone);

async function main() {
  const start = Date.now();
  const today = dayjs().tz(config.timezone).format("YYYY-MM-DD");

  console.log("═══════════════════════════════════════════");
  console.log("  🏛️  DIÁRIO ESTOICO — Pipeline Diário");
  console.log(`  📅  ${today}`);
  console.log(`  📧  Destino: ${config.email.recipientEmail}`);
  console.log("═══════════════════════════════════════════\n");

  // ── Guard: já enviou hoje? ──
  const alreadySent = await hasAlreadySentToday(today);
  if (alreadySent) {
    console.log("⏭️  Newsletter já enviada hoje. Encerrando.\n");
    return;
  }

  try {
    // ── 1. Gerar conteúdo ──
    const result = await generateDailyContent();
    const { content, teachingKey, philosopher, sourceWork, domain, externalEvent, validation } = result;

    // Warnings do validador
    if (validation.warnings.length > 0) {
      console.log("\n⚠️  Avisos do validador:");
      validation.warnings.forEach((w) => console.log(`   - ${w}`));
    }

    // ── 2. Enviar email ──
    console.log("\n📧 Enviando email...");
    const sendResult = await sendNewsletter(content, content.subjectLine);

    if (!sendResult.success) {
      console.error(`\n✗ Falha no envio: ${sendResult.error}`);

      // Registra tentativa com status failed
      const editionNumber = await getNextEditionNumber();
      await recordSentNewsletter({
        edition_number: editionNumber,
        send_date: today,
        teaching_key: teachingKey,
        philosopher,
        source_work: sourceWork,
        topic_tags: [],
        practical_domain: domain,
        external_event: externalEvent,
        content_hash: generateContentHash(JSON.stringify(content)),
        subject_line: content.subjectLine,
        full_content: content as unknown as Record<string, unknown>,
        recipient_email: config.email.recipientEmail,
        delivery_status: "failed",
      });

      process.exit(1);
    }

    console.log(`   ✓ Email enviado! Resend ID: ${sendResult.resendId}`);

    // ── 3. Registrar no banco ──
    console.log("\n💾 Registrando no banco de dados...");
    const editionNumber = await getNextEditionNumber();

    await recordSentNewsletter({
      edition_number: editionNumber,
      send_date: today,
      teaching_key: teachingKey,
      philosopher,
      source_work: sourceWork,
      topic_tags: content.ctaQuestions,
      practical_domain: domain,
      external_event: externalEvent,
      content_hash: generateContentHash(JSON.stringify(content)),
      subject_line: content.subjectLine,
      full_content: content as unknown as Record<string, unknown>,
      recipient_email: config.email.recipientEmail,
      delivery_status: "sent",
      resend_id: sendResult.resendId,
    });

    await markTeachingUsed(teachingKey);

    // ── Resumo ──
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log("\n═══════════════════════════════════════════");
    console.log("  ✅  PIPELINE CONCLUÍDO COM SUCESSO");
    console.log(`  📧  Assunto: "${content.subjectLine}"`);
    console.log(`  📜  ${philosopher} — ${sourceWork}`);
    console.log(`  ⚡  Domínio: ${domain}`);
    console.log(`  🔢  Edição #${editionNumber}`);
    console.log(`  ⏱️  Tempo total: ${elapsed}s`);
    console.log("═══════════════════════════════════════════\n");
  } catch (error) {
    console.error("\n💥 Erro fatal no pipeline:");
    console.error(error);
    process.exit(1);
  }
}

main();
