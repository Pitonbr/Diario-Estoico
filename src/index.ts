import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import { config } from "./config/env";
import { generateDailyContent } from "./agent/content-generator";
import { sendToList } from "./email/sender";
import { sendWhatsAppToList, formatWhatsAppMessage } from "./channels/whatsapp";
import {
  hasAlreadySentToday,
  recordSentNewsletter,
  updateDeliveryStatus,
  markTeachingUsed,
  generateContentHash,
  getNextEditionNumber,
  getActiveSubscribers,
} from "./database/queries";

dayjs.extend(utc);
dayjs.extend(timezone);

async function main() {
  const start = Date.now();
  const today = dayjs().tz(config.timezone).format("YYYY-MM-DD");

  console.log("═══════════════════════════════════════════");
  console.log("  🏛️  DIÁRIO ESTOICO — Pipeline Diário");
  console.log(`  📅  ${today}`);
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

    // ── Guard: só envia se passou pela validação anti-alucinação ──
    if (!validation.noHallucination) {
      console.error(
        `\n✗ Conteúdo não passou na validação anti-alucinação após ${result.attempts} tentativa(s). Email NÃO enviado.`
      );

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
        full_content: {
          ...(content as unknown as Record<string, unknown>),
          validationWarnings: validation.warnings,
        },
        recipient_email: config.email.recipientEmail,
        delivery_status: "failed",
      });

      process.exit(1);
    }

    // ── 2. Enviar para todos os inscritos ativos, por canal ──
    const subscribers = await getActiveSubscribers();
    const emailSubs = subscribers.filter((s) => s.channel === "email" && s.email);
    const whatsappSubs = subscribers.filter((s) => s.channel === "whatsapp" && s.phone);

    const recipients =
      emailSubs.length > 0
        ? emailSubs
        : [{ channel: "email" as const, email: config.email.recipientEmail, phone: null, name: config.email.recipientName }];

    const succeeded: string[] = [];
    const failed: string[] = [];
    let firstResendId: string | undefined;

    console.log(`\n📧 Enviando email para ${recipients.length} inscrito(s)...`);
    const sendResults = await sendToList(
      content,
      content.subjectLine,
      recipients.map((r) => r.email as string)
    );

    sendResults.forEach((result, i) => {
      const email = recipients[i].email as string;
      if (result.success) {
        succeeded.push(email);
        firstResendId = firstResendId ?? result.resendId;
        console.log(`   ✓ ${email} — Resend ID: ${result.resendId}`);
      } else {
        failed.push(email);
        console.error(`   ✗ ${email} — falha: ${result.error}`);
      }
    });

    if (whatsappSubs.length > 0) {
      console.log(`\n💬 Enviando WhatsApp para ${whatsappSubs.length} inscrito(s)...`);
      const whatsappText = formatWhatsAppMessage(content);
      const whatsappResults = await sendWhatsAppToList(
        whatsappSubs.map((s) => s.phone as string),
        whatsappText
      );

      whatsappResults.forEach((result, i) => {
        const phone = whatsappSubs[i].phone as string;
        if (result.success) {
          succeeded.push(phone);
          console.log(`   ✓ ${phone} — Message ID: ${result.messageId}`);
        } else {
          failed.push(phone);
          console.error(`   ✗ ${phone} — falha: ${result.error}`);
        }
      });
    }

    const deliveryStatus =
      succeeded.length === 0 ? "failed" : failed.length > 0 ? "partial" : "sent";

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
      recipient_email: succeeded.join(", ") || failed.join(", "),
      delivery_status: deliveryStatus,
      resend_id: firstResendId,
    });

    if (succeeded.length === 0) {
      console.error("\n✗ Nenhum envio teve sucesso.");
      process.exit(1);
    }

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
