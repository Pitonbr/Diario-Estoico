import fs from "fs";
import React from "react";
import { render } from "@react-email/render";
import { DiarioEstoicoEmail } from "./email/templates/diario-estoico";

/**
 * Gera um preview HTML do template para teste local
 * Uso: npx tsx src/preview.ts && open preview.html
 */
async function preview() {
  const mockProps = {
    dayLabel: "Dia 173 de 365",
    dateFormatted: "segunda-feira, 22 de junho de 2026",
    editionLabel: "Edição #1",
    quote: {
      text: "Não são os fatos que perturbam os homens, mas os julgamentos que os homens fazem sobre os fatos.",
      author: "Epicteto",
      source: "Enchiridion (Manual), Capítulo 5",
    },
    contextTitle: "O Filtro Entre Você e a Realidade",
    contextBody: `Imagine que dois empreendedores recebem a mesma notícia: um investidor decidiu não aportar no projeto. O primeiro entra em espiral — raiva, autossabotagem, noites sem dormir. O segundo anota o feedback, ajusta a proposta e agenda três novas reuniões na mesma semana.

O fato é idêntico. A diferença está no julgamento. Epicteto, que nasceu escravo e foi libertado pela força do seu pensamento, identificou há quase dois mil anos o que a psicologia moderna só formalizou no século XX: entre o estímulo e a resposta existe um espaço, e nesse espaço mora a nossa liberdade.

Hoje, Dia do Empreendedor Criativo, é um bom momento para fazer um inventário dos julgamentos automáticos que rodam na sua mente. Aquele cliente que cancelou não "destruiu seu trimestre" — ele devolveu um espaço na agenda. O concorrente que cresceu não "roubou seu mercado" — ele validou que existe demanda.`,
    applicationTitle: "Empreendedorismo e Negócios",
    applicationBody:
      "Antes da próxima reunião difícil, escreva em um papel: qual é o FATO objetivo e qual é o meu JULGAMENTO sobre ele? Separe os dois fisicamente. Decida com base no fato, não no julgamento.",
    ctaQuestions: [
      "Qual julgamento automático você carregou hoje que não sobreviveria a um exame racional?",
      "Se você reescrevesse a narrativa do seu maior problema atual usando apenas fatos, sem adjetivos, o que mudaria?",
    ],
    bibliographicRef: "Epicteto. Enchiridion (Manual). Capítulo 5.",
    eventConnection:
      "No Dia Mundial do Empreendedorismo Criativo, o estoicismo nos lembra: criatividade real começa por ver a realidade sem distorção.",
    preheader:
      "O filtro entre você e a realidade — Epicteto sobre julgamentos",
  };

  const emailElement = React.createElement(DiarioEstoicoEmail, mockProps);
  const html = await render(emailElement);
  fs.writeFileSync("preview.html", html);
  console.log("✓ Preview salvo em preview.html — abra no navegador para visualizar.");
}

preview().catch(console.error);
