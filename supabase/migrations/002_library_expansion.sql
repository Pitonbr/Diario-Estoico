-- Migração 002: Expansão da biblioteca estoica
-- Aumenta de ~77 para ~227 ensinamentos cobrindo todos os temas centrais do estoicismo
-- Filósofos: Marco Aurélio, Epicteto, Sêneca, Musônio Rufo, Cleantes, Crisipo

INSERT INTO stoic_teachings
  (teaching_key, philosopher, work, book_chapter, original_text, theme, tags)
VALUES

-- ══════════════════════════════
-- MARCO AURÉLIO — MEDITAÇÕES
-- ══════════════════════════════

-- controle
('v2_ma_ctrl_1','Marco Aurélio','Meditações','Livro 4, Seção 3',
'Retira-te para dentro de ti mesmo tanto quanto possas. Não te mistures com aqueles que não te tornam melhor; e quando precisares voltar ao mundo, volta como quem sabe que a fortaleza interior permanece.',
'controle','{dicotomia,recolhimento,liberdade_interior,fortaleza}'),

('v2_ma_ctrl_2','Marco Aurélio','Meditações','Livro 8, Seção 7',
'Não te perturbes com o que não depende de ti; não te deixes abalar pelo julgamento dos homens. Concentra-te no que é teu: a mente, a vontade, a escolha.',
'controle','{dicotomia,julgamento,vontade,escolha}'),

('v2_ma_ctrl_3','Marco Aurélio','Meditações','Livro 5, Seção 20',
'Tudo o que acontece contigo foi ordenado desde a eternidade. O fio das causas teceu, desde sempre, a tua existência e este acontecimento. Não é possível que seja de outra forma.',
'controle','{destino,aceitacao,logos,perspectiva}'),

('v2_ma_ctrl_4','Marco Aurélio','Meditações','Livro 6, Seção 2',
'Não te preocupes com o que os outros pensam de ti — isso não está em teu poder. Aquilo que está em teu poder é o teu caráter, os teus pensamentos, as tuas ações.',
'controle','{dicotomia,opiniao_alheia,carater,acoes}'),

('v2_ma_ctrl_5','Marco Aurélio','Meditações','Livro 12, Seção 33',
'Tudo aquilo que vês muda rapidamente e deixará de existir. Tem sempre presente quantas dessas mudanças já testemunhaste. O mundo é transformação; a vida é opinião.',
'controle','{mudanca,impermanencia,opiniao,perspectiva}'),

-- virtude
('v2_ma_virt_1','Marco Aurélio','Meditações','Livro 3, Seção 16',
'A alma se desonra quando se torna um tumor no universo. Pois rebelar-se contra o que acontece é rebelar-se contra a natureza — da qual somos parte inseparável.',
'virtude','{honra,natureza,rebeldia,harmonia}'),

('v2_ma_virt_2','Marco Aurélio','Meditações','Livro 7, Seção 9',
'Que a tua primeira preocupação seja a excelência interior. Os bens exteriores são inconstantes e passageiros. A virtude é o único bem que nem a fortuna nem o tempo podem roubar.',
'virtude','{excelencia,bens_externos,constancia,fortuna}'),

('v2_ma_virt_3','Marco Aurélio','Meditações','Livro 10, Seção 8',
'O que te impede de agir em harmonia com a tua natureza? Nada — exceto a tua própria escolha. Isso é ao mesmo tempo assustador e libertador.',
'virtude','{natureza,escolha,liberdade,acao}'),

('v2_ma_virt_4','Marco Aurélio','Meditações','Livro 4, Seção 2',
'A prática filosófica é simples e modesta. Não seduz com o espetáculo da ostentação. Ela quer apenas a alma nua, sem nenhum ornamento externo.',
'virtude','{filosofia,simplicidade,autenticidade,alma}'),

('v2_ma_virt_5','Marco Aurélio','Meditações','Livro 3, Seção 4',
'Não percas mais tempo a discutir o que é um bom homem: sê um.',
'virtude','{acao,determinacao,pratica,identidade}'),

-- tempo
('v2_ma_tempo_1','Marco Aurélio','Meditações','Livro 2, Seção 14',
'Ainda que vivesses três mil anos, ou trinta mil, lembra-te de que ninguém perde outra vida senão aquela que vive agora. O mais longo e o mais curto chegam ao mesmo ponto: o presente.',
'tempo','{presente,perspectiva,mortalidade,efemeridade}'),

('v2_ma_tempo_2','Marco Aurélio','Meditações','Livro 9, Seção 14',
'Recorda que nenhuma existência humana perde mais do que o presente instante — pois o presente é tudo o que realmente possuímos. O passado e o futuro não estão ao nosso alcance.',
'tempo','{presente,instante,posse,passado_futuro}'),

('v2_ma_tempo_3','Marco Aurélio','Meditações','Livro 4, Seção 17',
'Não trates o que te resta de vida como pensamentos a mais, mas observa quais são os mais importantes — e persegue-os como se cada dia fosse o teu último.',
'tempo','{urgencia,prioridade,presenca,morte}'),

('v2_ma_tempo_4','Marco Aurélio','Meditações','Livro 4, Seção 24',
'Lembra-te frequentemente da velocidade com que as coisas e os homens passam e desaparecem. A substância é como um rio em perpétuo fluxo. Nenhuma coisa fica. Nenhum momento é para sempre.',
'tempo','{impermanencia,fluxo,passagem,cosmos}'),

-- morte
('v2_ma_morte_1','Marco Aurélio','Meditações','Livro 4, Seção 48',
'Alexandre, o Grande, e o seu cocheiro chegaram ao mesmo ponto depois de morrer. Foram absorvidos pelas mesmas sementes primitivas do cosmos. Lembra-te disto quando achares que a tua importância é excessiva.',
'morte','{igualdade,perspectiva,humildade,cosmos}'),

('v2_ma_morte_2','Marco Aurélio','Meditações','Livro 6, Seção 15',
'Todas as coisas humanas são fumaça, nada e nimiedade: ontem uma gota de sêmen, amanhã bálsamo e cinzas. Que a tua vida passe neste ínterim em conformidade com a natureza.',
'morte','{efemeridade,conformidade,naturalidade,perspectiva}'),

('v2_ma_morte_3','Marco Aurélio','Meditações','Livro 12, Seção 23',
'Tudo o que vês mudará em breve, e aqueles que vissem a mudança também mudarão. Não há nada de único no presente — a vida é transformação perpétua.',
'morte','{transformacao,mudanca,impermanencia,perspectiva}'),

-- emoções e julgamentos
('v2_ma_emoc_1','Marco Aurélio','Meditações','Livro 5, Seção 16',
'Nunca se diga que alguém foi lesado por outrem quando a única coisa que o perturbou foi o seu próprio julgamento sobre o que aconteceu. O exterior não toca a alma — apenas o interior.',
'emocoes','{julgamento,perturbacao,responsabilidade,percepcao}'),

('v2_ma_emoc_2','Marco Aurélio','Meditações','Livro 6, Seção 52',
'Não és obrigado a ter uma opinião sobre isso. As coisas em si não têm o poder de tocar a alma — ficam do lado de fora. A perturbação vem apenas do nosso julgamento interior.',
'emocoes','{opiniao,perturbacao,exterior,interior}'),

('v2_ma_emoc_3','Marco Aurélio','Meditações','Livro 8, Seção 47',
'Observa que muitas das coisas que te perturbam são geradas dentro de ti. Quando elas vierem ao encontro, não as recebas antes de as examinares. O exame dissolve metade delas.',
'emocoes','{autoobservacao,exame,perturbacao,origem}'),

('v2_ma_emoc_4','Marco Aurélio','Meditações','Livro 9, Seção 4',
'Quem peca contra mim, peca contra si mesmo. Quem me faz injustiça, prejudica-se a si mesmo. O sábio não é ferido pelas ações dos outros — apenas pelos seus próprios julgamentos equivocados.',
'emocoes','{injustica,julgamento,responsabilidade,sabedoria}'),

-- raiva
('v2_ma_raiva_1','Marco Aurélio','Meditações','Livro 11, Seção 18',
'Quando te sentires irritado com alguém, pergunta-te: que certeza tenho eu de que esta pessoa estava errada? Talvez ela não tivesse outra escolha com o que sabia naquele momento.',
'raiva','{compaixao,perspectiva,ignorancia,tolerancia}'),

('v2_ma_raiva_2','Marco Aurélio','Meditações','Livro 7, Seção 26',
'A raiva é tão contrária à razão quanto o medo. Ambas são doenças da mente. A mente curada recusa as duas — não por supressão, mas por compreensão.',
'raiva','{razao,saude_mental,medo,compreensao}'),

('v2_ma_raiva_3','Marco Aurélio','Meditações','Livro 6, Seção 27',
'Três princípios para guardar: não faças nada sem querer; não faças nada que prejudique o próximo; mantém a serenidade quando os outros erram. O terceiro é o mais difícil.',
'raiva','{principios,serenidade,convivencia,dificuldade}'),

-- relacionamentos
('v2_ma_rel_1','Marco Aurélio','Meditações','Livro 4, Seção 3',
'Os homens existem uns para os outros. Ensina-os quando ignoram, ou suporta-os quando erram. Nenhuma outra opção é compatível com a natureza.',
'relacionamentos','{servico,tolerancia,ensino,natureza}'),

('v2_ma_rel_2','Marco Aurélio','Meditações','Livro 7, Seção 13',
'A natureza criou o ser humano para agir em conjunto com seus semelhantes. Cometer erro contra um ser humano é cometer erro contra a natureza e contra si mesmo.',
'relacionamentos','{comunidade,natureza,erro,responsabilidade}'),

('v2_ma_rel_3','Marco Aurélio','Meditações','Livro 9, Seção 42',
'Quando alguém te ofende, pergunta: o que é que este homem considera bom ou mau? Se o entenderes, sentirás compaixão em vez de raiva — pois a sua ação decorre da sua ignorância.',
'relacionamentos','{compaixao,compreensao,raiva,ignorancia}'),

('v2_ma_rel_4','Marco Aurélio','Meditações','Livro 11, Seção 1',
'A propriedade do bem é amar as pessoas que erram tanto quanto amas a ti mesmo — sabendo que elas erram sem saber o que é realmente o mal.',
'relacionamentos','{amor,erro,ignorancia,compaixao}'),

('v2_ma_rel_5','Marco Aurélio','Meditações','Livro 6, Seção 30',
'Quando o outro erra, vai a ele e dize-lhe com gentileza o que está errado — não com irritação, não com repreensão, mas com amor genuíno. Isso requer mais força do que a crítica.',
'relacionamentos','{correcao,amor,gentileza,forca}'),

-- razão
('v2_ma_razao_1','Marco Aurélio','Meditações','Livro 6, Seção 36',
'A mente livre de paixões é uma fortaleza. Não há sítio mais seguro para refúgio. Quem a possui nunca ficará sem porto seguro em nenhuma tempestade da vida.',
'razao','{serenidade,fortaleza,refugio,liberdade}'),

('v2_ma_razao_2','Marco Aurélio','Meditações','Livro 8, Seção 7',
'O que a razão aprova é melhor do que o que o desejo aprova. O único critério válido é: está de acordo com a tua natureza racional e com o bem comum?',
'razao','{logos,natureza,desejo,discernimento}'),

-- presença
('v2_ma_pres_1','Marco Aurélio','Meditações','Livro 9, Seção 3',
'Não disperses o que te resta de vida em pensamentos sobre outras pessoas. Quanto ao teu caminho interior, mantém-no limpo e direto.',
'presenca','{foco,interior,clareza,simplicidade}'),

('v2_ma_pres_2','Marco Aurélio','Meditações','Livro 8, Seção 22',
'Confina-te ao presente. O passado não existe mais. O futuro ainda não existe. Só este momento te pertence — e ele é suficiente.',
'presenca','{presente,passado,futuro,suficiencia}'),

('v2_ma_pres_3','Marco Aurélio','Meditações','Livro 3, Seção 11',
'Acrescenta pouca coisa à tua vida, e terás mais. Acrescenta muita coisa, e perderás o essencial. Limita o trabalho ao indispensável e vive o resto com liberdade.',
'presenca','{simplicidade,essencial,minimalismo,liberdade}'),

-- progresso
('v2_ma_prog_1','Marco Aurélio','Meditações','Livro 9, Seção 7',
'Em cada manhã, diz a ti mesmo: hoje encontrarei pessoas grosseiras, ingratas, arrogantes — porque elas não conhecem a diferença entre o bem e o mal. Mas eu a conheço, e por isso não me tornarei como elas.',
'progresso','{preparacao,tolerancia,discernimento,escolha}'),

('v2_ma_prog_2','Marco Aurélio','Meditações','Livro 10, Seção 33',
'Aproveita cada ocasião para crescer. Não esperes pelo momento ideal: ele nunca chega. O único momento para a prática da virtude é este — agora.',
'progresso','{oportunidade,agora,virtude,pratica}'),

-- contemplação
('v2_ma_cont_1','Marco Aurélio','Meditações','Livro 10, Seção 9',
'Olha para as estrelas. Depois olha para a tua preocupação. Pergunta-te: qual das duas parece mais importante no contexto do cosmos?',
'contemplacao','{perspectiva,cosmos,humildade,grandeza}'),

('v2_ma_cont_2','Marco Aurélio','Meditações','Livro 4, Seção 3',
'Retira-te para dentro de ti ao mesmo tempo em que estás no mundo. Quem aprendeu a voltar para si mesmo não necessita de lugar nenhum para encontrar paz.',
'contemplacao','{recolhimento,interior,paz,autossuficiencia}'),

('v2_ma_cont_3','Marco Aurélio','Meditações','Livro 2, Seção 4',
'Lembra-te de que cada conversa, cada momento com outra pessoa, pode ser o último. Isso não deve criar ansiedade — mas presença e cuidado genuíno.',
'contemplacao','{morte,presente,atencao,cuidado}'),


-- ══════════════════════════════
-- EPICTETO — ENCHIRIDION E DISCURSOS
-- ══════════════════════════════

-- controle (dicotomia)
('v2_ep_ctrl_1','Epicteto','Enchiridion','Capítulo 1',
'Algumas coisas estão em nosso poder e outras não. Em nosso poder estão: a opinião, o impulso, o desejo, a aversão. Não estão em nosso poder: o corpo, a reputação, o cargo. Se confundires estas duas classes, sofrerás.',
'controle','{dicotomia,poder_pessoal,opiniao,reputacao}'),

('v2_ep_ctrl_2','Epicteto','Enchiridion','Capítulo 5',
'Os homens não são perturbados pelos acontecimentos, mas pelas opiniões sobre os acontecimentos. A morte não é terrível em si — terrível é a opinião de que a morte é terrível.',
'controle','{julgamento,perturbacao,morte,opiniao}'),

('v2_ep_ctrl_3','Epicteto','Enchiridion','Capítulo 8',
'Não peças que o que acontece aconteça como tu queres; mas deseja que o que acontece seja como é — e encontrarás o fluxo tranquilo da vida.',
'controle','{aceitacao,desejo,tranquilidade,fluxo}'),

('v2_ep_ctrl_4','Epicteto','Enchiridion','Capítulo 15',
'Comporta-te como em um banquete. Se um prato passou sem chegar a ti, não o chames de volta. Espera que ele venha. O mesmo com os filhos, com a esposa, com o cargo — e serás digno de partilhar a mesa com os deuses.',
'controle','{desapego,paciencia,dignidade,expectativa}'),

('v2_ep_ctrl_5','Epicteto','Enchiridion','Capítulo 25',
'Deixou de te prejudicar quem te injuriou, se não quiseste ter sido injuriado. Só te prejudicas a ti mesmo se julgares que foste prejudicado.',
'controle','{injuria,julgamento,prejudico,escolha}'),

('v2_ep_ctrl_6','Epicteto','Discursos','Livro 2, Capítulo 5',
'Não procures que o que acontece aconteça como tu queres; mas que o que tu queres aconteça como acontece — e serás feliz.',
'controle','{aceitacao,felicidade,desejo,harmonia}'),

-- liberdade
('v2_ep_lib_1','Epicteto','Discursos','Livro 4, Capítulo 1',
'Livre é quem vive como quer, quem não pode ser obrigado, não pode ser impedido, não pode ser violentado. Quem vive com medo, com tristeza, com inveja — não é livre, qualquer que seja o seu título.',
'liberdade','{vontade,medo,independencia,titulo}'),

('v2_ep_lib_2','Epicteto','Discursos','Livro 1, Capítulo 1',
'O tirano pode prender o corpo, mas não pode prender a mente que se recusa a ser aprisionada. A liberdade não está nas correntes ou na ausência delas, mas na escolha interior.',
'liberdade','{mente,prisao,escolha,interior}'),

('v2_ep_lib_3','Epicteto','Enchiridion','Capítulo 14',
'Se quiseres que teus filhos, tua esposa, teus amigos vivam sempre, és tolo — pois queres que o que não está em teu poder esteja em teu poder. Isso não é amor; é possessividade disfarçada.',
'liberdade','{apego,controle,amor,possessividade}'),

-- emoções
('v2_ep_emoc_1','Epicteto','Discursos','Livro 3, Capítulo 19',
'A pessoa que realmente progride na filosofia não censura ninguém, não culpa ninguém, não acusa ninguém — pois sabe que ninguém exceto ela mesma é responsável pelo bem ou pelo mal que lhe acontece.',
'emocoes','{responsabilidade,censura,progresso,autoconhecimento}'),

('v2_ep_emoc_2','Epicteto','Enchiridion','Capítulo 20',
'Não é a pessoa que te insulta que te injuria, mas a tua opinião de que o insulto é uma injúria. Quando alguém te irrita, sabe que é a tua própria opinião que te irrita — não o outro.',
'emocoes','{injuria,opiniao,irritacao,responsabilidade}'),

('v2_ep_emoc_3','Epicteto','Discursos','Livro 1, Capítulo 28',
'Presta atenção ao lugar onde a tua mente vai quando os problemas chegam. O sábio observa o movimento dos seus pensamentos como um médico observa sintomas: com precisão, sem pânico.',
'emocoes','{autoobservacao,pensamentos,sabedoria,serenidade}'),

('v2_ep_emoc_4','Epicteto','Discursos','Livro 2, Capítulo 23',
'Quando alguém te colocar em situação difícil, recorda que só há dificuldade real se cederes ao que não é teu. A honra não pode ser tomada por força — pode apenas ser abandonada.',
'emocoes','{honra,dificuldade,resistencia,escolha}'),

-- progresso
('v2_ep_prog_1','Epicteto','Enchiridion','Capítulo 51',
'Nunca te digas filósofo e raramente digas aos outros que o és. Pratica as coisas que os filósofos praticam. A ação é o teste — não o título.',
'progresso','{humildade,filosofia,acao,pratica}'),

('v2_ep_prog_2','Epicteto','Discursos','Livro 4, Capítulo 6',
'A dificuldade não está em escapar dos males, mas em não os desejar. E para não desejá-los, é necessário praticar todo dia, hora a hora, percebendo onde a mente vai.',
'progresso','{pratica,desejo,atencao,disciplina}'),

('v2_ep_prog_3','Epicteto','Discursos','Livro 2, Capítulo 16',
'Quando algo difícil aparece, não digas que é um mal — diz que é um exercício. E pratica-o com toda a tua força. A dificuldade não é o oposto do progresso: é o meio dele.',
'progresso','{exercicio,adversidade,pratica,atitude}'),

('v2_ep_prog_4','Epicteto','Enchiridion','Capítulo 13',
'Se quiseres progredir, suporta pareceres tolo e ignorante sobre as coisas externas. Não aspires a parecer que sabes — aspira a saber.',
'progresso','{humildade,aparencia,interior,saber}'),

-- relacionamentos
('v2_ep_rel_1','Epicteto','Enchiridion','Capítulo 30',
'Os deveres são medidos pelas relações. É pai: exigem-se cuidados, condescendência e apoio — mesmo que seja um mau pai. O vínculo antecede o julgamento de caráter.',
'relacionamentos','{dever,familia,vinculo,papel_social}'),

('v2_ep_rel_2','Epicteto','Discursos','Livro 2, Capítulo 22',
'Podes dizer ao amigo: prefiro que sejas honesto a que me amates com falsidade. O amor que depende de bajulação não é amor — é servilismo mútuo.',
'relacionamentos','{amizade,honestidade,amor,autenticidade}'),

('v2_ep_rel_3','Epicteto','Enchiridion','Capítulo 43',
'Cada coisa tem duas alças — uma pela qual pode ser carregada, outra pela qual não pode. Se teu irmão agir injustamente, não o carregues pela alça da injustiça — mas pela de que ele ainda é teu irmão.',
'relacionamentos','{perspectiva,vinculo,injustica,escolha}'),

-- sabedoria
('v2_ep_sab_1','Epicteto','Discursos','Livro 2, Capítulo 1',
'O início da filosofia é perceber o próprio estado de fraqueza e impotência em relação às coisas necessárias. Sem este reconhecimento, não há progresso possível.',
'sabedoria','{autoconhecimento,fraqueza,inicio,reconhecimento}'),

('v2_ep_sab_2','Epicteto','Discursos','Livro 4, Capítulo 5',
'A mente do sábio não é um recipiente vazio que se enche de palavras externas — é uma fonte que brota de dentro. O que entra do exterior serve apenas de alimento para o que já existe.',
'sabedoria','{mente,interior,fonte,aprendizado}'),

('v2_ep_sab_3','Epicteto','Discursos','Livro 3, Capítulo 24',
'Enquanto dormes, chama à mente tudo o que fizeste naquele dia. Em que te perturbaste — era isso em teu poder? O que não era — aceitaste sem sofrimento? Esta revisão é prática, não punição.',
'sabedoria','{reflexao,revisao,dia,pratica}'),

-- coragem
('v2_ep_cour_1','Epicteto','Discursos','Livro 1, Capítulo 2',
'Se o que tens de dizer é verdadeiro, dizê-lo. Se o silêncio é covarde, falá-lo. O estoico não teme as palavras certas — teme apenas a mente errada que produziria palavras erradas.',
'coragem','{verdade,coragem,silencio,integridade}'),

('v2_ep_cour_2','Epicteto','Discursos','Livro 2, Capítulo 2',
'Quando estiveres diante de algo terrível, recorda o que realmente tens a perder. Na maioria das vezes descobrirás que o terror vivia apenas na tua opinião sobre o acontecimento.',
'coragem','{medo,terror,opiniao,clareza}'),

-- corpo e saúde
('v2_ep_corp_1','Epicteto','Enchiridion','Capítulo 41',
'O cuidado excessivo com o corpo é sinal de que a mente ainda está apegada ao que não está em seu poder. Dá ao corpo somente o que a natureza requer; o resto é distração da tarefa principal.',
'corpo','{moderacao,natureza,apego,foco}'),

-- ansiedade
('v2_ep_ans_1','Epicteto','Discursos','Livro 2, Capítulo 13',
'A maioria dos teus medos não existirá amanhã. E os que existirem, serão diferentes do que imaginas hoje. A ansiedade é uma viagem no tempo — e o futuro raramente corresponde à viagem.',
'ansiedade','{medo,futuro,imaginacao,perspectiva}'),


-- ══════════════════════════════
-- SÊNECA — CARTAS E ENSAIOS
-- ══════════════════════════════

-- tempo / brevidade
('v2_sn_tempo_1','Sêneca','Da Brevidade da Vida','Capítulo 1',
'A maioria dos mortais lamenta a maldade da natureza por nos dar uma vida tão curta. Mas a vida que recebemos não é curta: nós a tornamos curta. Não somos pobres de tempo — somos pródigos dele.',
'tempo','{brevidade,desperdicar,atitude,urgencia}'),

('v2_sn_tempo_2','Sêneca','Da Brevidade da Vida','Capítulo 3',
'Todos os homens, Lucílio, pertencem a outros; só o sábio pertence a si mesmo. É a mais rara das posses.',
'tempo','{pertencer,autonomia,sabedoria,posse}'),

('v2_sn_tempo_3','Sêneca','Cartas a Lucílio','Carta 1',
'Reivindica a tua propriedade sobre ti mesmo. Agarra e poupa o tempo que até agora era roubado de ti, desperdiçado ou perdido. Certos momentos são roubados, outros escorregam, outros se perdem — todos de maneiras diferentes.',
'tempo','{urgencia,posse,desperdicio,consciencia}'),

('v2_sn_tempo_4','Sêneca','Da Brevidade da Vida','Capítulo 14',
'Todo o tempo passado é propriedade tua — se souberes retê-lo no presente e não ficares parado, apontando para o futuro como único local de vida.',
'tempo','{passado,presente,futuro,propriedade}'),

('v2_sn_tempo_5','Sêneca','Da Brevidade da Vida','Capítulo 10',
'Somente os que dedicam o seu tempo à filosofia têm ócio verdadeiro; só eles vivem de fato. Eles não só guardam bem o seu próprio tempo — juntam ao seu o de todas as épocas.',
'tempo','{filosofia,ocio,sabedoria,heranca_humana}'),

('v2_sn_tempo_6','Sêneca','Cartas a Lucílio','Carta 77',
'Não importa quanto tempo viveste — importa como. Uma vida bem vivida de poucos anos vale mais do que uma vida longa mal aproveitada.',
'tempo','{qualidade,duracao,significado,escolha}'),

-- ansiedade e medo
('v2_sn_ans_1','Sêneca','Cartas a Lucílio','Carta 13',
'Sofremos mais na imaginação do que na realidade. Muitos dos nossos males não existem fora da nossa mente. A ansiedade não reduz os sofrimentos de amanhã — apenas esvazia a alegria de hoje.',
'ansiedade','{imaginacao,medo,presente,alegria}'),

('v2_sn_ans_2','Sêneca','Cartas a Lucílio','Carta 98',
'O maior obstáculo para viver é a expectativa, que depende do amanhã e perde o hoje. Tu dispões do que está em mãos da Fortuna; o que está em mãos da natureza já tens.',
'ansiedade','{expectativa,presente,fortuna,natureza}'),

('v2_sn_ans_3','Sêneca','Da Tranquilidade da Alma','Capítulo 4',
'A mente que nunca descansa, que nunca para de se preocupar, transforma-se no seu próprio inimigo. A tranquilidade começa quando se aprende a silenciar os próprios processos compulsivos.',
'ansiedade','{tranquilidade,mente,silencio,compulsao}'),

('v2_sn_ans_4','Sêneca','Cartas a Lucílio','Carta 78',
'Retira a tua mente da dor — tanto quanto possas — e pensa em algo positivo. Não para fugir da dor, mas para não seres governado por ela. Existe diferença entre sentir e ser dominado.',
'ansiedade','{dor,mente,foco,governanca}'),

('v2_sn_ans_5','Sêneca','Cartas a Lucílio','Carta 5',
'Não és necessário retirar-te do mundo para encontrar paz; basta retirar-te dentro de ti mesmo. Convive com aqueles que te tornam melhor.',
'ansiedade','{recolhimento,interior,convivencia,paz}'),

-- raiva
('v2_sn_raiva_1','Sêneca','Da Ira','Livro 1, Capítulo 1',
'De todos os vícios, nenhum é mais feio do que a raiva: ela transforma as mais belas faces. Nada é mais horrível quando está em movimento, nada é mais hediondo depois que passou.',
'raiva','{vicio,consequencias,fealdade,transformacao}'),

('v2_sn_raiva_2','Sêneca','Da Ira','Livro 2, Capítulo 10',
'O melhor remédio para a raiva é adiar. Pede à raiva que espere. Ela não te procurará — tu é que te afundarás nela. O adiamento a revela: muda de face, fica mais quieta.',
'raiva','{adiamento,remedio,espera,perspectiva}'),

('v2_sn_raiva_3','Sêneca','Da Ira','Livro 3, Capítulo 5',
'Quando sentires raiva, pergunta: o teu julgamento é realmente justo? Ou é a raiva que faz o julgamento parecer justo? Raramente as duas coisas coincidem.',
'raiva','{julgamento,justeza,autoexame,ilusao}'),

('v2_sn_raiva_4','Sêneca','Da Ira','Livro 2, Capítulo 28',
'Prefere ser mais lento a ser mais rápido na decisão de punir. Os erros podem ser perdoados; o que a raiva faz, muitas vezes, é irreversível.',
'raiva','{punicao,irreversivel,perdao,cautela}'),

-- virtude e bem
('v2_sn_virt_1','Sêneca','Cartas a Lucílio','Carta 71',
'O único bem que não pode ser tomado é o da virtude. Ela não depende do Destino — é o único bem que está completamente em teu poder e que ninguém pode roubar.',
'virtude','{bem,destino,poder_pessoal,permanencia}'),

('v2_sn_virt_2','Sêneca','Cartas a Lucílio','Carta 41',
'Um espírito santo habita em nós — observador e guardião dos nossos bens e males. Ele nos trata como nós o tratamos. O que cultivamos internamente, isso somos.',
'virtude','{consciencia,reciprocidade,interior,cultivo}'),

('v2_sn_virt_3','Sêneca','Cartas a Lucílio','Carta 76',
'Não te glorifies em nada que não seja teu. Se um cavalo se vangloriasse por sua beleza, seria tolerável — mas se se vangloriasse pela bela arreata, não. Sê honesto sobre o que realmente és.',
'virtude','{gloria,identidade,exterioridade,honestidade}'),

('v2_sn_virt_4','Sêneca','Da Vida Feliz','Capítulo 22',
'A riqueza está na virtude, não no ouro. Mas a virtude que não sabe usar os bens materiais com sabedoria também falha — pois demonstra que não aprendeu a indiferença, apenas a pobreza.',
'virtude','{riqueza,indiferenca,sabedoria,uso}'),

-- riqueza e bens externos
('v2_sn_riq_1','Sêneca','Cartas a Lucílio','Carta 2',
'As pessoas que nunca estão sossegadas consigo mesmas acumulam conhecidos, não amigos. E a riqueza que vem de muitas fontes escoa por muitos buracos.',
'riqueza','{amizade,dispersao,qualidade,atencao}'),

('v2_sn_riq_2','Sêneca','Cartas a Lucílio','Carta 16',
'A filosofia não promete riqueza exterior ao ser humano, nem glória — promete algo mais valioso: a serenidade do espírito, a liberdade interior, a paz da alma.',
'riqueza','{filosofia,serenidade,liberdade,paz}'),

('v2_sn_riq_3','Sêneca','Cartas a Lucílio','Carta 17',
'Renuncia à riqueza ou renuncia à esperança dela — mas se a tiveres e não te atrapalhar, guarda-a sem ansiedade. O estoico não é inimigo da riqueza; é inimigo do apego a ela.',
'riqueza','{apego,renuncia,ansiedade,moderacao}'),

-- relacionamentos
('v2_sn_rel_1','Sêneca','Cartas a Lucílio','Carta 6',
'Nenhum bem é bom se estiver isolado: é preciso ter alguém com quem compartilhá-lo. O sábio que se basta a si mesmo ainda assim deseja um amigo — para ter a quem dar.',
'relacionamentos','{amizade,partilha,generosidade,sabedoria}'),

('v2_sn_rel_2','Sêneca','Cartas a Lucílio','Carta 48',
'Converte o teu adversário num amigo. Isso não é fraqueza — é uma forma de virtude que exige mais força do que a vingança.',
'relacionamentos','{adversario,amizade,virtude,forca}'),

('v2_sn_rel_3','Sêneca','Das Beneficências','Livro 1, Capítulo 1',
'Nada une mais os homens do que a benevolência mútua. Esta é a liga que mantém a sociedade humana — o desejo de dar, sem esperar nada em troca.',
'relacionamentos','{benevolencia,generosidade,sociedade,desapego}'),

('v2_sn_rel_4','Sêneca','Cartas a Lucílio','Carta 12',
'Recolhe-te em ti mesmo, tanto quanto puderes; convive com aqueles que podem tornar-te melhor. Recebe aqueles que podes tornar melhores. Isso é reciprocidade real.',
'relacionamentos','{recolhimento,influencia,reciprocidade,crescimento}'),

-- adversidade
('v2_sn_adv_1','Sêneca','Sobre a Providência','Capítulo 2',
'A adversidade não é punição — é treinamento. Os que a providência ama, ela desafia. A pedra mais dura produz as faíscas mais brilhantes.',
'adversidade','{treinamento,desafio,providencia,crescimento}'),

('v2_sn_adv_2','Sêneca','Sobre a Providência','Capítulo 4',
'A boa fortuna produz riqueza e vaidade; a má fortuna produz grandeza de alma. O mármore produz as estátuas mais belas quando é mais difícil de trabalhar.',
'adversidade','{grandeza,dificuldade,transformacao,escultura}'),

('v2_sn_adv_3','Sêneca','Cartas a Lucílio','Carta 78',
'A dor não é um mal se for suportada com resignação. Não é o sofrimento que destrói — é a rendição ao sofrimento, a narrativa que construímos em volta dele.',
'adversidade','{dor,resignacao,narrativa,resistencia}'),

('v2_sn_adv_4','Sêneca','Cartas a Lucílio','Carta 24',
'Acostuma-te ao pior possível antes que ele chegue. O soldado que já dormiu no frio não se assusta com o inverno. A premeditação do mal não é pessimismo — é preparação.',
'adversidade','{preparacao,antecipacao,premeditacao,fortaleza}'),

-- progresso
('v2_sn_prog_1','Sêneca','Cartas a Lucílio','Carta 5',
'Que o teu progresso seja de todos os dias, e deixa de lado tudo o que não pertence a ti. Pouca coisa faz a diferença entre um dia excelente e um dia desperdiçado.',
'progresso','{diario,crescimento,foco,diferenca}'),

('v2_sn_prog_2','Sêneca','Cartas a Lucílio','Carta 34',
'Cada dia que passa, torno-me melhor, Lucílio. Não muito — mas melhor. E isso é suficiente. O crescimento não é medido em saltos, mas em passos consistentes.',
'progresso','{melhora,consistencia,paciencia,crescimento}'),

-- sabedoria
('v2_sn_sab_1','Sêneca','Cartas a Lucílio','Carta 2',
'Não percorras muitos autores e muitas obras de uma só vez: ficarás com a mente confusa. Alimenta-te com os que podem tornar-te melhor e só depois passa a outro.',
'sabedoria','{leitura,foco,profundidade,nutricao}'),

('v2_sn_sab_2','Sêneca','Cartas a Lucílio','Carta 108',
'Aprende para que possas viver melhor, não para que possas falar melhor. A sabedoria não é para o palco.',
'sabedoria','{aprendizado,vida,pratica,ostentacao}'),

('v2_sn_sab_3','Sêneca','Cartas a Lucílio','Carta 3',
'Primeiro delibera, depois age. Mas faz isso rapidamente — pois a vida que espera pelo momento ideal nada faz. O equilíbrio entre reflexão e ação é a própria sabedoria prática.',
'sabedoria','{deliberacao,acao,urgencia,equilibrio}'),

-- morte
('v2_sn_morte_1','Sêneca','Da Brevidade da Vida','Capítulo 7',
'Quem aprendeu a morrer esqueceu a servidão. A morte está acima de todo poder. Quem a aceita é livre de uma maneira que nenhum tirano pode desfazer.',
'morte','{liberdade,aceitacao,servidao,poder}'),

('v2_sn_morte_2','Sêneca','Consolação a Márcia','Capítulo 19',
'Todos morremos, Márcia. Diferentes apenas nos prazos. O que importa não é quando, mas como vivemos o tempo que nos foi dado.',
'morte','{prazo,qualidade,perspectiva,significado}'),

('v2_sn_morte_3','Sêneca','Cartas a Lucílio','Carta 58',
'A morte não nos rouba o presente — só nos impede de ter um futuro. Mas o presente, como o passado, não pode mais ser tirado de nós depois de vivido.',
'morte','{presente,futuro,impermanencia,vivido}'),

-- trabalho e propósito
('v2_sn_trab_1','Sêneca','Da Tranquilidade da Alma','Capítulo 1',
'O ócio sem estudo é morte — é o túmulo de um homem vivo. Trabalha com dedicação, mas assegura que o teu trabalho tem significado além do salário.',
'trabalho','{estudo,dedicacao,proposito,significado}'),

('v2_sn_trab_2','Sêneca','Cartas a Lucílio','Carta 7',
'Retira-te para dentro de ti mesmo quando fores obrigado a misturar-te com muita gente. Conviver com quem é melhor do que tu eleva-te; com quem é igual mantém-te; com quem é pior afunda-te.',
'trabalho','{convivencia,influencia,crescimento,recolhimento}'),

-- coragem
('v2_sn_cour_1','Sêneca','Sobre a Providência','Capítulo 3',
'O nobre naufraga, arde, mas não é vencido — pois fica em pé diante da adversidade com o mesmo rosto com que estava quando tudo corria bem. A serenidade não é ausência de tempestade; é estabilidade durante ela.',
'coragem','{serenidade,adversidade,estabilidade,constancia}'),

('v2_sn_cour_2','Sêneca','Cartas a Lucílio','Carta 13',
'Existem muitas coisas que nos assustam mais do que nos machucam. Sofremos frequentemente na imaginação. Examina o teu medo: é ele proporcional ao real perigo?',
'coragem','{medo,imaginacao,exame,proporcao}'),


-- ══════════════════════════════
-- MUSÔNIO RUFO — LIÇÕES
-- ══════════════════════════════

('v2_mr_1','Musônio Rufo','Lições','Lição 6',
'Não basta conhecer a filosofia; é necessário praticar as suas lições. O médico que conhece os remédios mas não os aplica não é menos ignorante do que aquele que nunca estudou medicina.',
'progresso','{pratica,conhecimento,filosofia,aplicacao}'),

('v2_mr_2','Musônio Rufo','Lições','Lição 3',
'A filosofia não é estudo para tempos de lazer — é treinamento para a vida. Deve ser praticada em todo momento: no trabalho, na refeição, na conversa, no sofrimento.',
'progresso','{filosofia,vida,pratica,treinamento}'),

('v2_mr_3','Musônio Rufo','Lições','Lição 16',
'O exercício do corpo torna-o forte para o trabalho; o exercício da alma torna-a forte para a virtude. Treina a alma com tanta diligência quanto o atleta treina o corpo.',
'corpo','{treinamento,virtude,alma,disciplina}'),

('v2_mr_4','Musônio Rufo','Lições','Lição 8',
'Comer apenas para nutrir — não para prazer — é sabedoria. Quem vive para o prazer do palato é escravo de uma sensação. A moderação à mesa é prática filosófica.',
'corpo','{moderacao,prazer,nutricao,liberdade}'),

('v2_mr_5','Musônio Rufo','Lições','Lição 14',
'A raiva, quando não controlada, transforma o ser humano em algo semelhante a um animal. O sábio não a suprime — aprende a reconhecê-la antes que ela o governe.',
'raiva','{controle,reconhecimento,sabedoria,governanca}'),

('v2_mr_6','Musônio Rufo','Lições','Lição 9',
'O bem-estar mais profundo não vem de circunstâncias favoráveis, mas do caráter. O homem de boa alma é feliz mesmo na prisão; o homem de má alma é miserável mesmo no palácio.',
'virtude','{carater,felicidade,circunstancias,independencia}'),

('v2_mr_7','Musônio Rufo','Lições','Lição 4',
'Quando se busca o conforto em vez da virtude, escolhe-se o que é fácil em vez do que é correto. Esta escolha, repetida dia após dia, muda quem se é.',
'virtude','{conforto,escolha,habito,identidade}'),

('v2_mr_8','Musônio Rufo','Lições','Lição 2',
'Não nascemos sábios — tornamo-nos sábios. Mas cada dia que passa sem praticar a sabedoria é um dia em que nos tornamos um pouco mais tolos.',
'sabedoria','{pratica,aprendizado,diario,escolha}'),

('v2_mr_9','Musônio Rufo','Lições','Lição 11',
'Quem diz "vou começar amanhã" adia a virtude para um amanhã que nunca chega. A virtude começa agora, nesta escolha, neste momento — ou não começa.',
'progresso','{urgencia,procrastinacao,agora,virtude}'),

('v2_mr_10','Musônio Rufo','Lições','Lição 5',
'Relaciona-te com os outros como gostarias que eles se relacionassem contigo — não por conveniência ou reciprocidade esperada, mas por princípio.',
'relacionamentos','{reciprocidade,principio,convivencia,autenticidade}'),

('v2_mr_11','Musônio Rufo','Lições','Lição 13',
'É melhor examinar a nossa própria vida do que criticar a dos outros. A crítica é fácil; o autoexame é o trabalho real da filosofia.',
'sabedoria','{autoexame,critica,filosofia,honestidade}'),

('v2_mr_12','Musônio Rufo','Lições','Lição 7',
'A adversidade não é inimiga do filósofo — é sua professora mais honesta. Os confortos nos ensinam o que queremos ouvir; a dificuldade nos ensina o que precisamos saber.',
'adversidade','{aprendizado,professor,dificuldade,honestidade}'),


-- ══════════════════════════════
-- CLEANTES E CRISIPO — FRAGMENTOS
-- ══════════════════════════════

('v2_cl_1','Cleantes','Hino a Zeus','Fragmento 527',
'Conduz-me, ó Zeus, e tu, ó Destino, para onde determinastes que eu vá. Seguirei sem hesitar. Pois se em minha covardia me recusar, ainda assim terei de seguir — mas com sofrimento desnecessário.',
'controle','{destino,aceitacao,coragem,logo}'),

('v2_cl_2','Cleantes','Hino a Zeus','Fragmento 527',
'O Logos permeia o universo inteiro. A razão não é apenas humana — é o princípio que governa tudo o que existe. Viver segundo a razão é viver segundo o Todo.',
'razao','{logos,universo,cosmos,harmonia}'),

('v2_cl_3','Cleantes','Fragmentos','Fragmento 510',
'A virtude é a única coisa que pode ser chamada de bem sem reservas, pois é a única que jamais pode ser usada para fazer o mal. Tudo o mais depende de quem o usa.',
'virtude','{bem,absoluto,definição,uso}'),

('v2_cl_4','Crisipo','Fragmentos','SVF 3.16',
'O objetivo da vida é viver de acordo com a natureza — o que significa viver de acordo com a virtude, pois a virtude é o que a natureza nos destinou como seres racionais.',
'virtude','{natureza,objetivo,vida,razao}'),

('v2_cl_5','Crisipo','Fragmentos','SVF 3.495',
'As paixões não são inevitáveis: são erros de julgamento que podemos corrigir. O medo nasce de um julgamento errado sobre o futuro; a cobiça, de um julgamento errado sobre o que vale a pena.',
'emocoes','{paixoes,julgamento,erro,correcao}'),


-- ══════════════════════════════
-- TEMAS COMPLEMENTARES — CITAÇÕES DIVERSAS
-- ══════════════════════════════

('v2_misc_1','Marco Aurélio','Meditações','Livro 5, Seção 1',
'De manhã, quando te levantares com preguiça, pensa: levanto-me para fazer o trabalho de um ser humano. Vou queixar-me de ir fazer aquilo para que nasci, para o qual fui colocado neste mundo?',
'trabalho','{proposito,manha,dever,natureza}'),

('v2_misc_2','Epicteto','Discursos','Livro 2, Capítulo 16',
'Quando alguém te manda embora com rejeição, não digas "fui rejeitado" — dize "saí." Quando algo acaba, não digas "perdi" — dize "devolvi." A narrativa que escolhes sobre os eventos determina como eles te afetam.',
'emocoes','{narrativa,perspectiva,reencuadramento,liberdade}'),

('v2_misc_3','Marco Aurélio','Meditações','Livro 4, Seção 7',
'Não consideres como perda de tempo os momentos de quietude e contemplação. O coração que aprende a descansar não é preguiçoso — recarrega-se para a ação justa.',
'contemplacao','{quietude,descanso,acao,equilíbrio}'),

('v2_misc_4','Sêneca','Da Tranquilidade da Alma','Capítulo 13',
'A mente que não descansa transforma-se numa prisão. Que os teus passatempos sejam modestos, mas reais e teus. E que te sigas a ti mesmo neles — não ao que os outros esperam.',
'contemplacao','{descanso,autenticidade,passatempo,verdade}'),

('v2_misc_5','Marco Aurélio','Meditações','Livro 7, Seção 54',
'Em todo lugar e a toda hora, depende de ti aceitar com contentamento o que a providência te traz, e tratar com justiça as pessoas ao teu redor. Estas duas coisas são suficientes para uma boa vida.',
'justica','{providencia,contentamento,justica,suficiencia}'),

('v2_misc_6','Epicteto','Enchiridion','Capítulo 24',
'Que estas reflexões não fiquem apenas na mente — pratica-as a cada hora. Quando vires o mais belo rosto, o mais belo corpo, dize: isso é transitório. Quando alguém morrer, dize: partiu na hora certa.',
'morte','{pratica,transitoriedade,beleza,aceitacao}'),

('v2_misc_7','Marco Aurélio','Meditações','Livro 9, Seção 29',
'A injustiça que sofres não vem do exterior — vem do teu julgamento sobre o exterior. Modifica o julgamento e a injustiça dissolve-se.',
'emocoes','{injustica,julgamento,dissolucao,poder}'),

('v2_misc_8','Sêneca','Sobre a Providência','Capítulo 1',
'A razão providencial não nos poupou das dificuldades — porque as dificuldades são o único meio pelo qual a virtude é testada, revelada e fortalecida.',
'adversidade','{providencia,dificuldade,teste,fortaleza}'),

('v2_misc_9','Marco Aurélio','Meditações','Livro 4, Seção 19',
'Lembra-te frequentemente da impermanência de todas as coisas. A substância é como um rio em perpétuo fluxo. Nenhuma coisa fica. Nenhum momento é para sempre. E isso é libertador.',
'contemplacao','{impermanencia,fluxo,liberdade,existencia}'),

('v2_misc_10','Epicteto','Discursos','Livro 2, Capítulo 23',
'Cuidado com os aplausos da multidão. Eles te dirão o que querem ouvir, não o que precisas saber. O progresso interior raramente produz aplausos externos — e não precisa deles.',
'progresso','{aplausos,multidao,interior,autenticidade}'),

('v2_misc_11','Marco Aurélio','Meditações','Livro 8, Seção 48',
'Lembra-te de que quando despertas irritado, não és tu que controlas a situação — é a situação que controla tu. A calma é sempre mais poderosa do que a reação.',
'raiva','{calma,controle,situacao,reacao}'),

('v2_misc_12','Sêneca','Cartas a Lucílio','Carta 11',
'Escolhe sempre alguém cuja vida tu aprovarias e que possas ter sempre diante dos olhos como guia. Precisamos de alguém que nos inspire — não para imitarmos, mas para medirmos onde estamos.',
'progresso','{modelo,inspiracao,medicao,crescimento}'),

('v2_misc_13','Marco Aurélio','Meditações','Livro 5, Seção 9',
'Os obstáculos que enfrentas no caminho da ação não impedem a tua virtude — eles a revelam. Sem resistência, não há como saber o que és.',
'adversidade','{obstaculos,revelacao,virtude,resistencia}'),

('v2_misc_14','Epicteto','Discursos','Livro 1, Capítulo 15',
'Considera que cada pessoa faz o que pode com o entendimento que tem. Quando pecam, é por falta de entendimento — não por maldade pura. O sábio lamenta a ignorância, não a pessoa.',
'relacionamentos','{compreensao,ignorancia,compaixao,julgamento}'),

('v2_misc_15','Sêneca','Cartas a Lucílio','Carta 90',
'A filosofia não produz apenas sabedoria — produz também a capacidade de suportar a falta de sabedoria alheia com equanimidade. Isso é tão importante quanto a sabedoria em si.',
'sabedoria','{equanimidade,tolerancia,suportar,filosofia}'),

('v2_misc_16','Marco Aurélio','Meditações','Livro 6, Seção 7',
'Retorna a ti mesmo tão frequentemente quanto possas. Faz que cada momento de repouso — por mais breve que seja — seja um retorno ao teu centro.',
'contemplacao','{retorno,centro,repouso,presenca}'),

('v2_misc_17','Epicteto','Discursos','Livro 4, Capítulo 12',
'Nunca digas sobre algo "perdi isso" — dize "devolvi." O teu filho morreu? Foi devolvido. A tua esposa morreu? Foi devolvida. A tua fazenda foi tomada? Foi devolvida. Mas o ladrão é mau! Que importa isso a ti, por quem foi devolvida?',
'morte','{perda,devolucao,apego,destino}'),

('v2_misc_18','Sêneca','Cartas a Lucílio','Carta 45',
'Não te deixes enganar pelas aparências: o que é bom não é necessariamente o que parece bom; o que é mau não é necessariamente o que parece mau. O julgamento precipitado é o inimigo da sabedoria.',
'sabedoria','{aparencias,julgamento,discernimento,precipitacao}'),

('v2_misc_19','Marco Aurélio','Meditações','Livro 3, Seção 6',
'Tem respeito por ti mesmo. Em toda situação, mantém a tua dignidade interior. Isso não significa arrogância — significa saber o que vales independentemente do que outros dizem.',
'coragem','{dignidade,respeito,autoconhecimento,independencia}'),

('v2_misc_20','Epicteto','Enchiridion','Capítulo 17',
'Lembra-te que és ator de um drama, cujo caráter o autor determinou. Se curto, de um curto; se longo, de um longo. Se te manda representar um pobre, representa-o com arte; igualmente um coxo, um governante, um simples cidadão. Pois isto é teu: representar bem o papel que te é atribuído.',
'controle','{papel,arte,aceitacao,presenca}'),

('v2_misc_21','Sêneca','Da Ira','Livro 3, Capítulo 43',
'Nada tornará a nossa vida mais suave do que ser indulgente com os outros. Deveríamos ser bons uns para os outros, porque vivemos entre homens.',
'relacionamentos','{indulgencia,bondade,comunidade,convivencia}'),

('v2_misc_22','Marco Aurélio','Meditações','Livro 9, Seção 22',
'Aquilo que não prejudica a cidade não pode prejudicar o cidadão. Quando imaginas que foste prejudicado, aplica esta regra: a cidade inteira foi prejudicada? Se não — talvez o prejuízo seja apenas a tua opinião.',
'emocoes','{cidade,perspectiva,prejuizo,opiniao}'),

('v2_misc_23','Epicteto','Discursos','Livro 3, Capítulo 10',
'Nunca busques que os acontecimentos se passem como tu queres, mas deseja que eles se passem como de fato se passam — e terás tranquilidade. Esta é a fórmula mais simples e mais difícil da filosofia.',
'controle','{acontecimentos,desejo,tranquilidade,dificuldade}'),

('v2_misc_24','Sêneca','Cartas a Lucílio','Carta 4',
'Exercita-te a fim de que a pobreza, se valer, te encontre preparado; se valer a riqueza, te encontre pronto para devolvê-la. A indiferença real é aquela que pode suportar qualquer dos dois.',
'riqueza','{pobreza,preparacao,indiferenca,equanimidade}'),

('v2_misc_25','Marco Aurélio','Meditações','Livro 12, Seção 1',
'Tudo o que necessitas já está em ti: decisão, coragem, paciência, razão. Não precisas de mais tempo, mais condições, mais aprovação. Precisas de te usar a ti mesmo.',
'coragem','{recursos_internos,suficiencia,autossuficiencia,uso}')

ON CONFLICT (teaching_key) DO NOTHING;
