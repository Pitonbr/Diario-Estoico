export interface CalendarEvent {
  date: string; // MM-DD
  name: string;
  category: "festivo" | "business" | "mentoria" | "historico";
  stoicConnection: string;
}

export const fixedCalendarEvents: CalendarEvent[] = [
  // ── Janeiro ──
  { date: "01-01", name: "Ano Novo", category: "festivo", stoicConnection: "Novo começo: Sêneca sobre o uso do tempo e a brevidade da vida" },
  { date: "01-06", name: "Dia de Reis", category: "festivo", stoicConnection: "Sabedoria dos reis: Marco Aurélio como imperador-filósofo" },
  { date: "01-24", name: "Dia Internacional da Educação", category: "mentoria", stoicConnection: "Epicteto: a educação como caminho para a liberdade interior" },
  // ── Fevereiro ──
  { date: "02-01", name: "Início do mês do Empreendedorismo (SEBRAE)", category: "business", stoicConnection: "Coragem empreendedora: enfrentar riscos com virtude estoica" },
  { date: "02-14", name: "Dia dos Namorados (internacional)", category: "festivo", stoicConnection: "Sêneca sobre amizade e relacionamentos verdadeiros" },
  // ── Março ──
  { date: "03-08", name: "Dia Internacional da Mulher", category: "festivo", stoicConnection: "Cleantes e Musônio Rufo: estoicismo e igualdade de gênero" },
  { date: "03-15", name: "Dia Mundial do Consumidor", category: "business", stoicConnection: "Temperança estoica: consumir com moderação e propósito" },
  { date: "03-20", name: "Dia Internacional da Felicidade", category: "mentoria", stoicConnection: "Eudaimonia: a felicidade estoica como florescimento, não prazer" },
  // ── Abril ──
  { date: "04-07", name: "Dia Mundial da Saúde", category: "mentoria", stoicConnection: "O corpo como indiferente preferível: cuidar sem depender" },
  { date: "04-15", name: "Dia Mundial do Empreendedorismo Criativo", category: "business", stoicConnection: "Sabedoria prática: inovação com discernimento estoico" },
  { date: "04-21", name: "Tiradentes", category: "historico", stoicConnection: "Coragem moral: sacrifício por princípios, como Sócrates e Sêneca" },
  { date: "04-22", name: "Dia da Terra", category: "festivo", stoicConnection: "Cosmopolitismo estoico: somos parte de um todo maior" },
  // ── Maio ──
  { date: "05-01", name: "Dia do Trabalho", category: "festivo", stoicConnection: "Epicteto: dignidade no trabalho, seja escravo ou imperador" },
  { date: "05-05", name: "Dia do Empreendedor Individual (MEI)", category: "business", stoicConnection: "Disciplina da ação: empreender com virtude e propósito" },
  { date: "05-15", name: "Dia do Investidor", category: "business", stoicConnection: "Indiferentes preferíveis: buscar riqueza sem ser escravo dela" },
  // ── Junho ──
  { date: "06-05", name: "Dia Mundial do Meio Ambiente", category: "festivo", stoicConnection: "Viver segundo a natureza: o princípio fundador do estoicismo" },
  { date: "06-12", name: "Dia dos Namorados (Brasil)", category: "festivo", stoicConnection: "Marco Aurélio sobre Faustina: amar com presença, não posse" },
  // ── Julho ──
  { date: "07-01", name: "Início do 2º semestre", category: "business", stoicConnection: "Revisão de meio de ano: a premeditatio malorum aplicada a metas" },
  { date: "07-20", name: "Dia do Amigo", category: "festivo", stoicConnection: "Sêneca, Carta 9: sobre amizade verdadeira e autossuficiência" },
  // ── Agosto ──
  { date: "08-05", name: "Dia Nacional da Saúde", category: "mentoria", stoicConnection: "Desconforto voluntário: construir resiliência física e mental" },
  { date: "08-11", name: "Dia do Estudante", category: "mentoria", stoicConnection: "Epicteto como professor: a filosofia se aprende praticando" },
  { date: "08-25", name: "Dia do Soldado", category: "historico", stoicConnection: "Marco Aurélio em campanha: estoicismo sob pressão real" },
  // ── Setembro ──
  { date: "09-05", name: "Dia do Empreendedor", category: "business", stoicConnection: "Sêneca empresário: possuir riqueza sem ser possuído por ela" },
  { date: "09-07", name: "Independência do Brasil", category: "historico", stoicConnection: "Coragem e autodeterminação: virtudes estoicas na fundação de nações" },
  { date: "09-10", name: "Dia Mundial de Prevenção ao Suicídio", category: "mentoria", stoicConnection: "Estoicismo e saúde mental: a base da terapia cognitivo-comportamental" },
  // ── Outubro ──
  { date: "10-01", name: "Dia Internacional do Idoso", category: "mentoria", stoicConnection: "Sêneca sobre envelhecer: não é pouco tempo, é muito desperdício" },
  { date: "10-05", name: "Dia do Empreendedor", category: "business", stoicConnection: "Disciplina e persistência: virtudes do empreendedor estoico" },
  { date: "10-10", name: "Dia Mundial da Saúde Mental", category: "mentoria", stoicConnection: "Do estoicismo à TCC: 2300 anos de cuidado com a mente" },
  { date: "10-15", name: "Dia do Professor", category: "mentoria", stoicConnection: "Epicteto e Musônio Rufo: a linhagem mestre-discípulo" },
  // ── Novembro ──
  { date: "11-01", name: "Dia de Todos os Santos", category: "festivo", stoicConnection: "Memento mori: lembrar da morte para viver com intensidade" },
  { date: "11-19", name: "Dia do Empreendedorismo Feminino", category: "business", stoicConnection: "Porcia Catão: estoicismo feminino na Roma antiga" },
  { date: "11-20", name: "Dia da Consciência Negra", category: "historico", stoicConnection: "Epicteto nasceu escravo: a liberdade interior transcende correntes" },
  { date: "11-25", name: "Black Friday", category: "business", stoicConnection: "Temperança: o estoico diante do consumismo" },
  // ── Dezembro ──
  { date: "12-10", name: "Dia Internacional dos Direitos Humanos", category: "historico", stoicConnection: "Cosmopolitismo estoico: todos os seres humanos têm valor igual" },
  { date: "12-25", name: "Natal", category: "festivo", stoicConnection: "Gratidão e generosidade: virtudes compartilhadas entre tradições" },
  { date: "12-31", name: "Réveillon", category: "festivo", stoicConnection: "Revisão noturna de Sêneca aplicada ao ano inteiro" },
];

export function getTodayEvents(date: Date): CalendarEvent[] {
  const mmdd = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return fixedCalendarEvents.filter((e) => e.date === mmdd);
}
