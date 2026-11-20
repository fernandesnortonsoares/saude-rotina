// Dados de referência do app Saúde e Rotina
window.APPDATA = {};

APPDATA.REFEICOES = [
  { key: 'cafe', nome: 'Café da manhã', hora: '06:30' },
  { key: 'almoco', nome: 'Almoço', hora: '12:30' },
  { key: 'tarde', nome: 'Lanche da tarde', hora: '15:30' },
  { key: 'noite', nome: 'Lanche da noite', hora: '19:00' },
  { key: 'ceia', nome: 'Ceia', hora: '21:00' }
];

APPDATA.DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Plano modelo (cardápio do Norton). weekday: 0=domingo ... 6=sábado
APPDATA.PLANO_MODELO = {
  1: {
    cafe: [['Ovos mexidos', 4, 'un'], ['Tomate picado', 100, 'g'], ['Bacon bem sequinho', 2, 'fatia'], ['Mamão papaia', 150, 'g']],
    almoco: [['Salada (alface, tomate, pepino)', 150, 'g'], ['Sementes de abóbora', 10, 'g'], ['Lombo de porco grelhado', 150, 'g'], ['Couve refogada com alho', 100, 'g'], ['Abóbora cozida', 75, 'g']],
    tarde: [['Maçã', 1, 'un'], ['Castanha-do-pará', 2, 'un']],
    noite: [['Noite em família: lanche livre', null, '']],
    ceia: [['Chá de camomila sem açúcar', 200, 'ml']]
  },
  2: {
    cafe: [['Ovos mexidos', 4, 'un'], ['Espinafre', 30, 'g'], ['Queijo branco', 30, 'g'], ['Mamão papaia', 150, 'g']],
    almoco: [['Salada (rúcula, tomate-cereja, cenoura)', 150, 'g'], ['Filé de frango grelhado', 150, 'g'], ['Brócolis refogado com alho', 100, 'g'], ['Batata-doce cozida', 100, 'g']],
    tarde: [['Abacate com limão', 100, 'g'], ['Tangerina', 1, 'un']],
    noite: [['Sopa (caldo, fubá, chuchu, cenoura, abobrinha)', 400, 'ml'], ['Ovo pochê (opcional)', 1, 'un'], ['Parmesão ralado', 10, 'g']],
    ceia: [['Iogurte natural', 170, 'g'], ['Nozes', 15, 'g']]
  },
  3: {
    cafe: [['Ovos mexidos cremosos', 4, 'un'], ['Requeijão', 15, 'g'], ['Morangos', 5, 'un']],
    almoco: [['Salada (repolho, cenoura, salsinha)', 150, 'g'], ['Fígado acebolado', 120, 'g'], ['Vagem e cenoura refogadas', 100, 'g'], ['Batata cozida', 100, 'g']],
    tarde: [['Pera', 1, 'un'], ['Castanha-do-pará', 2, 'un']],
    noite: [['Sardinha em lata (escorrida)', 85, 'g'], ['Tomate e cebola picados', 100, 'g']],
    ceia: [['Leite morno com canela', 200, 'ml']]
  },
  4: {
    cafe: [['Ovos mexidos caipira', 4, 'un'], ['Cebola, pimentão e tomate', 120, 'g'], ['Bacon bem sequinho', 2, 'fatia'], ['Banana', 0.5, 'un']],
    almoco: [['Salada (alface, beterraba, tomate)', 150, 'g'], ['Tilápia assada', 150, 'g'], ['Espinafre refogado com alho', 100, 'g'], ['Mandioquinha cozida', 100, 'g']],
    tarde: [['Maçã', 1, 'un'], ['Abacate', 50, 'g']],
    noite: [['Sopa (caldo, fubá, abóbora, couve)', 400, 'ml'], ['Queijo minas', 30, 'g']],
    ceia: [['Queijo minas', 30, 'g'], ['Nozes', 15, 'g']]
  },
  5: {
    cafe: [['Ovos mexidos', 4, 'un'], ['Frango desfiado', 50, 'g'], ['Mamão papaia', 150, 'g']],
    almoco: [['Salada (alface, palmito, tomate, milho)', 150, 'g'], ['Coxa e sobrecoxa assadas sem pele', 150, 'g'], ['Repolho e chuchu refogados', 100, 'g']],
    tarde: [['Goiaba', 1, 'un'], ['Castanha-do-pará', 2, 'un']],
    noite: [['Atum em lata (escorrido)', 120, 'g'], ['Pepino e tomate picados', 100, 'g']],
    ceia: [['Iogurte natural', 170, 'g'], ['Chia', 5, 'g']]
  },
  6: {
    cafe: [['Ovos mexidos', 4, 'un'], ['Cogumelos', 50, 'g'], ['Queijo minas', 30, 'g'], ['Bacon bem sequinho', 2, 'fatia'], ['Laranja', 1, 'un']],
    almoco: [['Salada (pepino, tomate, cebola, hortelã)', 150, 'g'], ['Lombo de porco assado', 150, 'g'], ['Couve refogada', 100, 'g'], ['Inhame cozido', 100, 'g']],
    tarde: [['Tangerina', 1, 'un'], ['Goiaba', 1, 'un'], ['Castanha-do-pará', 2, 'un']],
    noite: [['Sopa (caldo, fubá, cenoura, vagem, abobrinha)', 400, 'ml'], ['Queijo cottage', 45, 'g']],
    ceia: [['Leite morno com canela', 200, 'ml']]
  },
  0: {
    cafe: [['Ovos mexidos', 4, 'un'], ['Abobrinha ralada', 100, 'g'], ['Parmesão ralado', 10, 'g'], ['Morangos', 5, 'un']],
    almoco: [['Salada (folhas, manga, sementes de abóbora)', 150, 'g'], ['Frango em tiras acebolado', 150, 'g'], ['Vagem refogada', 100, 'g'], ['Mandioca cozida', 100, 'g']],
    tarde: [['Maçã', 1, 'un'], ['Abacate', 50, 'g']],
    noite: [['Sardinha em lata (escorrida)', 85, 'g'], ['Pepino e cebola', 100, 'g']],
    ceia: [['Queijo branco', 30, 'g'], ['Chá de camomila sem açúcar', 200, 'ml']]
  }
};

APPDATA.EXERCICIOS = [
  { nome: 'Sentar e levantar da cadeira', meta: '10 a 12 vezes' },
  { nome: 'Flexão na parede', meta: '10 a 12 vezes' },
  { nome: 'Remada com mochila', meta: '10 a 12 de cada braço' },
  { nome: 'Subir no degrau', meta: '10 com cada perna' },
  { nome: 'Ponte', meta: '10 a 12 vezes' },
  { nome: 'Ponta dos pés', meta: '15 vezes' },
  { nome: 'Prancha na mesa', meta: '20 a 30 segundos' }
];

APPDATA.SEMANAS_EMOCIONAL = [
  { c: 'Autoconsciência e resiliência', h: 'Entender que as emoções são sinais, não ordens; fazer uma pausa antes de reagir.', e: '3 vezes ao dia: parar, respirar 3 vezes e dar nome ao que sente.' },
  { c: 'Pensamento flexível', h: 'Reconhecer pensamentos distorcidos: tudo ou nada, prever o pior, achar que sabe o que o outro pensa, se rotular.', e: 'Registro de pensamento: situação, o que pensei, evidências a favor e contra, pensamento mais equilibrado.' },
  { c: 'Autoestima e autocompaixão', h: 'Falar consigo como falaria com um bom amigo; separar o erro da pessoa.', e: 'Anotar todo dia uma coisa que fez bem e uma qualidade sua.' },
  { c: 'Calma diante do estresse e da ansiedade', h: 'Respiração lenta (inspirar em 4, soltar em 6), relaxamento muscular, técnica 5-4-3-2-1.', e: '5 minutos de respiração guiada; lista do que posso e do que não posso controlar.' },
  { c: 'Esperança e ânimo diante da tristeza', h: 'Agir antes de esperar a vontade: pequenas atividades prazerosas ou úteis, sol e movimento.', e: 'Agendar uma atividade boa por dia e anotar como se sentiu antes e depois.' },
  { c: 'Autocontrole diante da raiva', h: 'Perceber os sinais no corpo, sair da situação por 20 minutos e voltar para conversar.', e: 'Frase guia: "Eu sinto... quando... e preciso..."; registrar o que funcionou.' },
  { c: 'Liberdade dos hábitos que prendem', h: 'Entender gatilho, hábito e recompensa; esperar 10 minutos quando vier o impulso; trocar por outra ação.', e: 'Registrar os impulsos na aba Hábitos.' },
  { c: 'Relacionamentos saudáveis', h: 'Escuta atenta, colocar limites com respeito, pedir e aceitar desculpas.', e: 'Um momento de conversa sem celular por dia com alguém importante.' },
  { c: 'Empatia e generosidade', h: 'Ajudar os outros melhora o próprio humor; gentileza pequena e frequente.', e: 'Uma gentileza por dia; uma ação voluntária na semana.' },
  { c: 'Gratidão e propósito', h: 'Reconhecer o que vai bem sem negar o que dói; metas pequenas e um plano para manter o que aprendeu.', e: 'Três gratidões por dia; carta para si mesmo daqui a 3 meses.' }
];

// Questionário: tipos n=número, u=única, m=múltipla, s=sim/não, h=horário, e=escala 0-10, t=texto, d=data
APPDATA.QUESTIONARIO = [
  { sec: 'Dados pessoais', q: [
    ['nome', 'Nome', 't'],
    ['nascimento', 'Data de nascimento', 'd'],
    ['sexo', 'Sexo biológico', 'u', ['Masculino', 'Feminino']],
    ['cidade', 'Cidade e estado', 't'],
    ['mora_com', 'Com quem mora', 'm', ['Sozinho', 'Cônjuge', 'Filhos', 'Pais', 'Outros']],
    ['cozinha', 'Quem cozinha em casa', 'u', ['Eu', 'Outra pessoa', 'Dividido', 'Compro pronto']]
  ]},
  { sec: 'Medidas do corpo', reav: true, q: [
    ['peso', 'Peso (kg)', 'n'],
    ['altura', 'Altura (cm)', 'n'],
    ['cintura', 'Cintura (cm)', 'n'],
    ['percepcao_corpo', 'Como percebe seu corpo', 'u', ['Muito magro', 'Pouca gordura', 'Normal', 'Acima do peso', 'Bem acima do peso']],
    ['peso_6m', 'Nos últimos 6 meses o peso', 'u', ['Subiu', 'Ficou igual', 'Desceu']],
    ['perda_musculo', 'Sente que está perdendo força ou músculo', 'u', ['Não', 'Um pouco', 'Bastante']],
    ['levantar_cadeira', 'Consegue levantar da cadeira 5 vezes sem usar as mãos', 's']
  ]},
  { sec: 'Condições de saúde', q: [
    ['cond_metab', 'Metabólicas', 'm', ['Diabetes tipo 1', 'Diabetes tipo 2', 'Pré-diabetes', 'Obesidade', 'Gota ou ácido úrico alto']],
    ['cond_coracao', 'Coração e circulação', 'm', ['Pressão alta', 'Pré-hipertensão', 'Colesterol ou triglicerídeos altos', 'Infarto ou angina', 'Insuficiência cardíaca', 'Arritmia', 'AVC', 'Trombose', 'Marca-passo ou stent']],
    ['cond_rins', 'Rins e urina', 'm', ['Doença renal crônica', 'Cálculo renal', 'Diálise', 'Próstata aumentada', 'Incontinência']],
    ['cond_digest', 'Fígado e digestão', 'm', ['Gordura no fígado', 'Hepatite ou cirrose', 'Gastrite ou refluxo', 'Intestino irritável', 'Doença celíaca', 'Intolerância à lactose', 'Intestino preso', 'Crohn ou retocolite']],
    ['cond_pulmao', 'Pulmões e sono', 'm', ['Asma', 'DPOC ou bronquite crônica', 'Apneia do sono']],
    ['cond_hormonio', 'Hormônios', 'm', ['Hipotireoidismo', 'Hipertireoidismo', 'Ovários policísticos', 'Menopausa', 'Testosterona baixa']],
    ['cond_ossos', 'Ossos e articulações', 'm', ['Osteoporose', 'Artrose', 'Artrite reumatoide', 'Hérnia de disco', 'Dor lombar crônica', 'Fibromialgia', 'Perda de massa muscular']],
    ['cond_outras', 'Outras', 'm', ['Anemia', 'Doença autoimune', 'Neuropatia nos pés', 'Câncer (tratamento ou acompanhamento)', 'Feridas que demoram a cicatrizar', 'Retinopatia ou glaucoma']],
    ['cond_mental', 'Saúde mental', 'm', ['Ansiedade', 'Depressão', 'Insônia', 'Transtorno bipolar', 'Transtorno alimentar']],
    ['cond_texto', 'Outras condições (descreva)', 't']
  ]},
  { sec: 'Cirurgias, internações e tratamentos', q: [
    ['cirurgias', 'Cirurgias que já fez', 'm', ['Bariátrica', 'Coração', 'Coluna', 'Joelho ou quadril (inclusive prótese)', 'Ombro', 'Abdominal ou hérnia', 'Vesícula', 'Intestino ou estômago', 'Amputação', 'Outra']],
    ['cirurgia_recente', 'Fez alguma cirurgia nos últimos 3 meses', 's'],
    ['cirurgias_texto', 'Detalhes das cirurgias (qual, ano, restrições)', 't'],
    ['internacao', 'Foi internado nos últimos 12 meses (e por quê)', 't'],
    ['tratamentos', 'Tratamentos em andamento', 'm', ['Quimioterapia ou radioterapia', 'Diálise', 'Fisioterapia', 'Psicoterapia', 'Reabilitação cardíaca ou pulmonar', 'Nutricionista', 'Outro']],
    ['gestante', 'Está grávida ou amamentando', 's'],
    ['limitacao', 'Limitação de movimento', 'm', ['Cadeira de rodas', 'Bengala ou andador', 'Equilíbrio', 'Visão', 'Audição']],
    ['queda', 'Caiu nos últimos 12 meses', 's'],
    ['fumo', 'Cigarro', 'u', ['Nunca fumei', 'Parei', 'Fumo']],
    ['familia', 'Doenças na família (pais e irmãos)', 'm', ['Diabetes', 'Pressão alta', 'Infarto', 'AVC', 'Câncer', 'Doença renal', 'Alzheimer']]
  ]},
  { sec: 'Remédios (só para os alertas)', q: [
    ['insulina', 'Usa insulina', 's'],
    ['rem_diabetes', 'Remédios para diabetes', 'm', ['Metformina', 'Glibenclamida', 'Gliclazida', 'Outros', 'Nenhum']],
    ['rem_outros', 'Outros remédios de uso contínuo', 't']
  ]},
  { sec: 'Objetivos', q: [
    ['objetivos', 'Seus objetivos', 'm', ['Ganhar músculo', 'Controlar a glicose', 'Emagrecer', 'Ganhar peso', 'Dormir melhor', 'Mais disposição', 'Melhorar a testosterona', 'Reduzir a pressão', 'Melhorar o intestino', 'Reduzir o estresse']],
    ['objetivo_principal', 'Objetivo mais importante', 't']
  ]},
  { sec: 'Rotina e horários', reav: true, q: [
    ['acorda', 'Que horas acorda (dias de semana)', 'h'],
    ['sai', 'Que horas sai de casa', 'h'],
    ['almoca', 'Que horas almoça', 'h'],
    ['marmita', 'Leva marmita', 's'],
    ['dorme', 'Que horas vai dormir', 'h'],
    ['dia_especial', 'Dia diferente na semana (ex.: noite em família)', 't']
  ]},
  { sec: 'Alimentação e bebidas', reav: true, q: [
    ['refeicoes', 'Quais refeições faz', 'm', ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Lanche da noite', 'Ceia']],
    ['nao_come', 'Não come', 'm', ['Arroz', 'Feijão', 'Pão', 'Massas', 'Carne vermelha', 'Porco', 'Peixe', 'Leite e derivados']],
    ['nao_gosta', 'Alimentos que não gosta', 't'],
    ['adora', 'Alimentos que adora', 't'],
    ['alergias', 'Alergias ou intolerâncias', 'm', ['Lactose', 'Glúten', 'Frutos do mar', 'Amendoim', 'Ovo', 'Outra']],
    ['dieta_escolha', 'Dieta por escolha ou religião', 't'],
    ['agua_copos', 'Copos de água por dia', 'n'],
    ['cafe_bebe', 'Toma café', 'u', ['Não', 'Até 2 xícaras', 'Mais de 2']],
    ['suco', 'Toma suco', 'm', ['Natural sem açúcar', 'Natural com açúcar', 'De caixinha', 'Em pó']],
    ['refri', 'Refrigerante', 'u', ['Não', 'Zero', 'Comum']],
    ['alcool', 'Álcool', 'u', ['Não', 'Socialmente', 'Toda semana', 'Todo dia']],
    ['doces', 'Doces', 'u', ['Nunca', 'Raramente', 'Algumas vezes por semana', 'Todo dia']]
  ]},
  { sec: 'Situação financeira', reav: true, q: [
    ['orcamento', 'Orçamento para alimentação', 'u', ['Econômico', 'Médio', 'Livre']],
    ['fin_preocupa', 'Quanto a situação financeira te preocupa', 'e'],
    ['fin_dividas', 'Tem dívidas que tiram o sono', 's'],
    ['fin_falta', 'Já faltou dinheiro para comida ou remédios nos últimos 3 meses', 's'],
    ['fin_controle', 'Controla seus gastos (anota, planeja)', 'u', ['Sim', 'Às vezes', 'Não']],
    ['tempo_cozinhar', 'Tempo para cozinhar', 'u', ['Menos de 15 min', 'Até 30 min', 'Mais de 30 min']]
  ]},
  { sec: 'Sono', reav: true, q: [
    ['sono_horas', 'Horas de sono por noite', 'n'],
    ['sono_despertares', 'Quantas vezes acorda à noite', 'n'],
    ['sono_motivo', 'Por que acorda', 'm', ['Urinar', 'Fome', 'Suor', 'Calor', 'Ronco', 'Ansiedade', 'Dor', 'Não sei']],
    ['ronco', 'Ronca ou para de respirar dormindo', 's'],
    ['tela_cama', 'Usa celular ou TV na cama', 's']
  ]},
  { sec: 'Atividade física', reav: true, q: [
    ['atividade_atual', 'O que faz hoje', 'm', ['Nada', 'Caminhada', 'Escada', 'Academia', 'Esporte', 'Trabalho físico']],
    ['tempo_treino', 'Tempo por dia para treinar', 'u', ['10 min', '15 min', '30 min', '45 min ou mais']],
    ['horario_treino', 'Melhor horário', 'u', ['Antes do trabalho', 'Almoço', 'Depois do trabalho', 'Noite']],
    ['equipamentos', 'O que tem em casa', 'm', ['Escada', 'Cadeira firme', 'Mesa', 'Mochila', 'Elástico', 'Halteres', 'Colchonete']],
    ['escada_sensacao', 'Ao subir 1 andar de escada', 'u', ['Tranquilo', 'Cansado', 'Muito cansado', 'Com falta de ar']]
  ]},
  { sec: 'Bem-estar, lazer e leitura', reav: true, q: [
    ['estresse', 'Nível de estresse', 'e'],
    ['disposicao', 'Nível de disposição', 'e'],
    ['humor', 'Humor na maior parte dos dias', 'u', ['Bom', 'Regular', 'Ruim']],
    ['lazer', 'O que gosta de fazer no tempo livre', 'm', ['Ler', 'Filmes', 'Música', 'Família', 'Amigos', 'Natureza', 'Hobbies manuais', 'Jogos']],
    ['leitura_tempo', 'Quanto lê por dia', 'u', ['Nada', 'Até 15 min', '15 a 30 min', 'Mais de 30 min']],
    ['leitura_tipo', 'Tipo de leitura preferida', 'm', ['Livros', 'Estudos religiosos', 'Notícias', 'Técnicos', 'Ficção']]
  ]},
  { sec: 'Hábitos do dia a dia e redes sociais', reav: true, q: [
    ['tela_horas', 'Horas por dia no celular fora do trabalho', 'n'],
    ['redes_horas', 'Horas por dia em redes sociais', 'n'],
    ['redes_efeito', 'Depois de usar redes sociais você costuma se sentir', 'u', ['Bem', 'Indiferente', 'Ansioso', 'Triste ou se comparando', 'Irritado']],
    ['redes_noite', 'Usa redes sociais na última hora antes de dormir', 's'],
    ['celular_acordar', 'Pega o celular logo ao acordar', 's'],
    ['noticias', 'Quanto tempo vê notícias por dia', 'u', ['Quase nada', 'Até 30 min', '30 a 60 min', 'Mais de 1 hora']],
    ['sentado_horas', 'Horas sentado por dia', 'n'],
    ['pausas', 'Faz pausas para levantar durante o trabalho', 'u', ['A cada hora', 'Às vezes', 'Quase nunca']],
    ['sol', 'Toma sol (15 min ou mais) quantos dias por semana', 'n'],
    ['natureza', 'Tem contato com natureza, plantas ou ar livre', 'u', ['Todo dia', 'Toda semana', 'Raramente']],
    ['comer_tela', 'Come assistindo TV ou no celular', 'u', ['Nunca', 'Às vezes', 'Quase sempre']],
    ['trabalho_horas', 'Horas de trabalho por dia, contando deslocamento', 'n'],
    ['convivio', 'Encontra amigos ou família fora de casa', 'u', ['Toda semana', 'Todo mês', 'Raramente']],
    ['solidao', 'Com que frequência se sente sozinho', 'e'],
    ['postura_dor', 'Sente dor no pescoço ou nas costas no fim do dia', 's'],
    ['higiene_bucal', 'Escova os dentes e usa fio dental todos os dias', 's']
  ]},
  { sec: 'Hábitos e vícios (confidencial)', q: [
    ['habitos', 'Hábito que gostaria de largar ou reduzir', 'm', ['Álcool', 'Cigarro ou vape', 'Outras drogas', 'Remédios sem receita', 'Apostas', 'Jogos eletrônicos', 'Celular e redes sociais', 'Comida compulsiva', 'Açúcar e doces', 'Compras', 'Pornografia']],
    ['habitos_freq', 'Com que frequência', 'u', ['Todo dia', 'Algumas vezes por semana', 'Algumas vezes por mês', 'Raramente']],
    ['habitos_gatilho', 'Quando acontece mais', 'm', ['Estresse', 'Tédio', 'Solidão', 'Tristeza', 'Festas', 'Depois do trabalho', 'À noite']],
    ['habitos_meta', 'Quer reduzir ou parar', 'u', ['Reduzir', 'Parar']]
  ]},
  { sec: 'Saúde sexual (opcional, maiores de 18)', q: [
    ['sex_desejo', 'Como está seu desejo sexual', 'e'],
    ['sex_satisfacao', 'Satisfação com a vida sexual', 'e'],
    ['sex_dificuldade', 'Alguma dificuldade', 'm', ['Pouco desejo', 'Dificuldade de ereção', 'Ejaculação precoce', 'Ressecamento', 'Dor', 'Dificuldade de orgasmo', 'Cansaço', 'Nenhuma']],
    ['sex_tempo', 'Há quanto tempo', 'u', ['Menos de 3 meses', '3 a 12 meses', 'Mais de 1 ano']]
  ]}
];

// Regras de exames: [nome, unidade, ref_min, ref_max, se_alto, se_baixo]
APPDATA.EXAMES = [
  ['Glicemia em jejum', 'mg/dL', 70, 99, 'Reduzir a raiz do almoço e as frutas mais doces; reforçar verduras e proteína; caminhada ou escada depois das refeições.', null],
  ['Hemoglobina glicada', '%', 4, 5.6, 'Reduzir a raiz do almoço e as frutas mais doces; reforçar verduras e proteína; caminhada ou escada depois das refeições.', null],
  ['Colesterol total', 'mg/dL', 0, 190, 'Limitar bacon e frituras; reforçar azeite, castanhas, sardinha e fibras; acrescentar caminhada.', null],
  ['LDL', 'mg/dL', 0, 130, 'Limitar bacon e gema (de 4 para 3 ovos); reforçar azeite, castanhas e sardinha; acrescentar caminhada.', null],
  ['HDL', 'mg/dL', 40, 999, null, 'Reforçar azeite, castanhas e sardinha; aumentar atividade aeróbica.'],
  ['Triglicerídeos', 'mg/dL', 0, 150, 'Cortar bacon, reduzir frutas doces e sucos; reforçar sardinha; aumentar caminhada.', null],
  ['Creatinina', 'mg/dL', 0.7, 1.3, 'Não aumentar a proteína; reduzir sal. Converse com seu médico.', null],
  ['TGP', 'U/L', 0, 41, 'Cortar álcool, frituras e açúcar; acrescentar caminhada.', null],
  ['Vitamina B12', 'pg/mL', 200, 900, null, 'Reforçar fígado, ovos, sardinha e leite. Converse com seu médico.'],
  ['Vitamina D', 'ng/mL', 30, 100, null, 'Reforçar sardinha e gema; tomar sol pela manhã; parte do treino ao ar livre.'],
  ['Ferritina', 'ng/mL', 30, 400, null, 'Reforçar fígado e folhas verdes com limão; reduzir a intensidade do treino até melhorar.'],
  ['Testosterona total', 'ng/dL', 300, 1000, null, 'Reforçar zinco (fígado, sementes de abóbora), gorduras boas e proteína; aumentar o treino de força; cuidar do sono.'],
  ['PSA', 'ng/mL', 0, 4, 'Sem mudança automática. Converse com seu médico.', null],
  ['TSH', 'mUI/L', 0.4, 4.5, 'Sem mudança automática. Converse com seu médico.', 'Sem mudança automática. Converse com seu médico.'],
  ['Pressão sistólica', 'mmHg', 0, 119, 'Reduzir sal, embutidos e enlatados; acrescentar caminhada; evitar prender a respiração nos exercícios.', null],
  ['Pressão diastólica', 'mmHg', 0, 79, 'Reduzir sal, embutidos e enlatados; acrescentar caminhada.', null],
  ['Peso', 'kg', null, null, null, null],
  ['Massa muscular (bioimpedância)', 'kg', null, null, null, null]
];
