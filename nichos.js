/*
 * Nichos da demo e do gerador de prévias.
 * Usado por index.html (landing) e gerador.html. Para criar um nicho novo, copie um
 * existente, troque a chave (só letras minúsculas) e coloque-o em GRUPOS_NICHOS.
 *
 * Regra dos textos: falar do PROCESSO (orçamento antes, agendamento, WhatsApp) e
 * não fazer promessas específicas (24h, garantia de X meses, "licenciado").
 * Nas prévias de empresas reais, a landing troca subtítulo, destaques, passos, FAQ
 * e horário por textos neutros (ver montarPrevia em index.html); título, serviços
 * e introServicos são reaproveitados, então precisam ser apenas descritivos.
 *
 * Campos obrigatórios: grupo, rotulo, empresa, cor, titulo (com " em BH"), subtitulo,
 * destaques[3], tituloForm, cta, pedido, placeholderMensagem, introServicos,
 * servicos[6], passos[3], faq[3], endereco, horario, whatsapp, mensagemWhats.
 */
const WHATS_DEMO = '5531992868113';
const CNPJ_FICTICIO = 'CNPJ 00.000.000/0001-00 (fictício)';
const ATENDE_BH = 'Atendimento em BH e região metropolitana';

const PASSOS_ORCAMENTO = [
  ['Envie o pedido', 'Pelo formulário ou WhatsApp, conte o que você precisa.'],
  ['Receba o orçamento', 'Valor e prazo combinados antes de começar.'],
  ['Serviço feito', 'No dia e horário combinados.']
];
const PASSOS_FOTO = [
  ['Mande uma foto', 'Pelo WhatsApp ou formulário, mostre o problema.'],
  ['Receba o orçamento', 'Valor combinado antes da visita.'],
  ['Serviço feito', 'No dia e horário combinados.']
];
const PASSOS_AGENDA = [
  ['Escolha o serviço', 'Diga o que deseja e o melhor horário para você.'],
  ['Confirmamos pelo WhatsApp', 'Retornamos com os horários disponíveis e valores.'],
  ['Venha no horário', 'Atendimento sem fila e sem correria.']
];

const GRUPOS_NICHOS = [
  { nome: 'Automotivo', nichos: ['oficina'] },
  { nome: 'Casa e reparos', nichos: ['servicos', 'desentupidora', 'chaveiro', 'dedetizacao', 'vidracaria'] },
  { nome: 'Climatização e eletrônicos', nichos: ['arcondicionado', 'celular', 'eletro'] },
  { nome: 'Beleza, estética e pet', nichos: ['estetica', 'barbearia', 'salao', 'petshop'] },
  { nome: 'Mudanças e limpeza', nichos: ['mudancas', 'estofados', 'limpeza'] }
];

const NICHOS = {
  /* ---------------- Automotivo ---------------- */
  oficina: {
    grupo: 'Automotivo', rotulo: 'Oficina mecânica',
    empresa: 'Auto Center Exemplo',
    cor: '#c2410c', corEscura: '#7c2d12', corClara: '#ffedd5',
    titulo: 'Oficina mecânica em BH com orçamento rápido pelo WhatsApp',
    subtitulo: 'Diagnóstico claro, preço combinado antes do serviço e aviso quando o carro estiver pronto.',
    destaques: ['Orçamento sem compromisso', 'Você aprova antes de qualquer serviço', 'Garantia informada no orçamento'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: modelo e ano do carro, barulho ao frear…',
    introServicos: 'Manutenção preventiva e corretiva para carros de passeio.',
    servicos: [
      ['Revisão preventiva', 'Checagem completa conforme o manual do fabricante.'],
      ['Freios e suspensão', 'Pastilhas, discos, amortecedores e alinhamento.'],
      ['Injeção eletrônica', 'Diagnóstico por scanner e correção de falhas.'],
      ['Troca de óleo e filtros', 'Troca rápida, com óleo indicado para o seu motor.'],
      ['Ar-condicionado', 'Higienização, carga de gás e reparos.'],
      ['Elétrica automotiva', 'Bateria, alternador, motor de arranque e iluminação.']
    ],
    passos: [
      ['Envie o pedido', 'Pelo formulário ou WhatsApp, conte o que está acontecendo.'],
      ['Receba o orçamento', 'Avaliamos e enviamos o valor antes de começar.'],
      ['Aprove e acompanhe', 'Avisamos o andamento e quando o carro estiver pronto.']
    ],
    faq: [
      ['O orçamento é cobrado?', 'Não. O orçamento é sem compromisso; você decide depois de ver o valor.'],
      ['Vocês dão garantia?', 'Sim. A garantia de serviços e peças é informada por escrito no orçamento.'],
      ['Precisa agendar?', 'Recomendamos agendar pelo WhatsApp para reduzir o tempo de espera.']
    ],
    endereco: 'Rua Exemplo, 123 — Bairro Exemplo, Belo Horizonte/MG',
    horario: 'Segunda a sexta, 8h às 18h · Sábado, 8h às 12h',
    mensagemWhats: 'Olá! Vim pelo site e gostaria de um orçamento para o meu carro.'
  },

  /* ---------------- Casa e reparos ---------------- */
  servicos: {
    grupo: 'Casa e reparos', rotulo: 'Eletricista e reparos',
    empresa: 'Exemplo Manutenção Residencial',
    cor: '#0f766e', corEscura: '#134e4a', corClara: '#ccfbf1',
    titulo: 'Eletricista e reparos residenciais em BH, com hora marcada',
    subtitulo: 'Profissional pontual, orçamento antes do serviço e local limpo ao final.',
    destaques: ['Orçamento sem compromisso', 'Atendimento em toda BH', 'Garantia informada no orçamento'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: trocar 3 tomadas e instalar chuveiro, bairro…',
    introServicos: 'Pequenos e médios reparos para casas, apartamentos e condomínios.',
    servicos: [
      ['Elétrica', 'Tomadas, disjuntores, quadros e iluminação.'],
      ['Hidráulica', 'Vazamentos, torneiras, sifões e caixas acopladas.'],
      ['Instalações', 'Chuveiros, ventiladores de teto, suportes de TV.'],
      ['Pintura', 'Retoques e pintura de cômodos.'],
      ['Pequenos reparos', 'Portas, fechaduras, prateleiras e afins.'],
      ['Condomínios', 'Manutenção preventiva com visitas programadas.']
    ],
    passos: [
      ['Descreva o serviço', 'Envie fotos e detalhes pelo WhatsApp ou formulário.'],
      ['Receba o orçamento', 'Valor e prazo combinados antes da visita.'],
      ['Serviço executado', 'Atendimento no horário marcado.']
    ],
    faq: [
      ['Atendem em qual região?', 'Belo Horizonte e região metropolitana, conforme a agenda.'],
      ['Cobram visita?', 'O orçamento por foto é gratuito; visitas técnicas são combinadas antes.'],
      ['Dão garantia?', 'Sim, a garantia é informada no orçamento.']
    ],
    endereco: 'Atendimento a domicílio — Belo Horizonte/MG',
    horario: 'Segunda a sábado, 8h às 18h',
    mensagemWhats: 'Olá! Vim pelo site e gostaria de um orçamento.'
  },
  desentupidora: {
    grupo: 'Casa e reparos', rotulo: 'Desentupidora',
    empresa: 'Exemplo Desentupidora',
    cor: '#0369a1',
    titulo: 'Desentupidora em BH com atendimento rápido pelo WhatsApp',
    subtitulo: 'Pia, vaso, ralo ou esgoto entupido? Mande uma foto e receba o orçamento antes da visita.',
    destaques: ['Orçamento pelo WhatsApp', 'Valor combinado antes do serviço', 'Casas, comércios e condomínios'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: pia da cozinha entupida, bairro…',
    introServicos: 'Desentupimento e limpeza para casas, comércios e condomínios.',
    servicos: [
      ['Pia e tanque', 'Desentupimento de pias de cozinha, banheiro e tanques.'],
      ['Vaso sanitário', 'Desentupimento sem quebrar o piso, sempre que possível.'],
      ['Ralos e caixas de gordura', 'Limpeza e desobstrução de ralos e caixas.'],
      ['Rede de esgoto', 'Desobstrução de tubulações e caixas de passagem.'],
      ['Caixa d’água', 'Limpeza e higienização de reservatórios.'],
      ['Hidrojateamento', 'Limpeza de tubulações com jato de água em alta pressão.']
    ],
    passos: PASSOS_FOTO,
    faq: [
      ['Atendem com urgência?', 'Sim, conforme a agenda do dia. Fale pelo WhatsApp para saber o horário mais próximo.'],
      ['Cobram visita?', 'O valor e eventuais custos de visita são combinados antes, pelo WhatsApp.'],
      ['Atendem condomínios?', 'Sim, com agendamento e orçamento formal.']
    ],
    endereco: ATENDE_BH,
    horario: 'Todos os dias, com agendamento pelo WhatsApp',
    mensagemWhats: 'Olá! Vim pelo site e preciso de um orçamento de desentupimento.'
  },
  chaveiro: {
    grupo: 'Casa e reparos', rotulo: 'Chaveiro',
    empresa: 'Chaveiro Exemplo',
    cor: '#a16207',
    titulo: 'Chaveiro em BH com atendimento rápido pelo WhatsApp',
    subtitulo: 'Ficou trancado do lado de fora ou precisa trocar a fechadura? Fale agora e saiba o valor antes.',
    destaques: ['Valor informado antes do serviço', 'Casa, carro e comércio', 'Pix e cartão'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de atendimento',
    placeholderMensagem: 'Ex.: porta trancada, bairro, tipo de fechadura…',
    introServicos: 'Abertura, cópias e instalação para residências, veículos e empresas.',
    servicos: [
      ['Abertura de portas', 'Abertura de portas residenciais e comerciais.'],
      ['Troca de fechaduras', 'Troca e instalação de fechaduras e cilindros.'],
      ['Cópia de chaves', 'Cópias de chaves simples e tetra.'],
      ['Chave de carro', 'Cópias e chaves de veículos (consulte o modelo).'],
      ['Trancas e travas', 'Instalação de trancas extras e travas de segurança.'],
      ['Cofres', 'Abertura e manutenção de cofres (consulte).']
    ],
    passos: PASSOS_ORCAMENTO,
    faq: [
      ['Atendem fora do horário comercial?', 'Consulte pelo WhatsApp: informamos a disponibilidade na hora.'],
      ['Pedem comprovação para abrir porta?', 'Sim. Por segurança, pedimos documento que comprove que você mora ou trabalha no local.'],
      ['Fazem chave de carro codificada?', 'Depende do modelo. Envie marca, modelo e ano pelo WhatsApp.']
    ],
    endereco: ATENDE_BH,
    horario: 'Segunda a sábado, 8h às 20h',
    mensagemWhats: 'Olá! Vim pelo site e preciso de um chaveiro.'
  },
  dedetizacao: {
    grupo: 'Casa e reparos', rotulo: 'Dedetização',
    empresa: 'Exemplo Dedetização',
    cor: '#15803d',
    titulo: 'Dedetização em BH para casas, comércios e condomínios',
    subtitulo: 'Controle de baratas, formigas, cupins e ratos com agendamento e orientações antes e depois da aplicação.',
    destaques: ['Orçamento sem compromisso', 'Orientações para família e pets', 'Agendamento no melhor horário'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: baratas na cozinha, apartamento de 2 quartos…',
    introServicos: 'Controle de pragas para residências, empresas e condomínios.',
    servicos: [
      ['Baratas', 'Aplicação direcionada nos pontos de abrigo.'],
      ['Formigas', 'Tratamento para formigas domésticas.'],
      ['Cupins', 'Avaliação e tratamento de madeiras e estruturas.'],
      ['Ratos', 'Controle com iscas em pontos seguros.'],
      ['Escorpiões', 'Orientação e controle em áreas de risco.'],
      ['Mosquitos', 'Tratamento de áreas externas e focos.']
    ],
    passos: PASSOS_ORCAMENTO,
    faq: [
      ['Preciso sair de casa?', 'Depende do produto e do local. Explicamos o tempo de espera ao agendar.'],
      ['É seguro para crianças e pets?', 'Passamos as orientações de proteção antes da aplicação.'],
      ['Atendem comércios?', 'Sim, inclusive fora do horário de funcionamento, se preferir.']
    ],
    endereco: ATENDE_BH,
    horario: 'Segunda a sábado, 8h às 18h',
    mensagemWhats: 'Olá! Vim pelo site e gostaria de um orçamento de dedetização.'
  },
  vidracaria: {
    grupo: 'Casa e reparos', rotulo: 'Vidraçaria',
    empresa: 'Vidraçaria Exemplo',
    cor: '#0e7490',
    titulo: 'Vidraçaria em BH: box, espelhos e janelas sob medida',
    subtitulo: 'Medição, orçamento e instalação com prazo combinado antes.',
    destaques: ['Orçamento sem compromisso', 'Prazo combinado antes', 'Instalação com acabamento cuidadoso'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: box de banheiro 1,20 m, bairro…',
    introServicos: 'Vidros e espelhos sob medida para casas e comércios.',
    servicos: [
      ['Box para banheiro', 'Box de correr, de abrir e de canto.'],
      ['Espelhos', 'Espelhos sob medida, com ou sem moldura.'],
      ['Janelas e portas', 'Janelas e portas de vidro temperado.'],
      ['Guarda-corpo', 'Guarda-corpos e fechamentos de sacada.'],
      ['Tampos de mesa', 'Tampos e prateleiras de vidro.'],
      ['Troca de vidros', 'Substituição de vidros quebrados.']
    ],
    passos: PASSOS_FOTO,
    faq: [
      ['A medição é cobrada?', 'Combinamos pelo WhatsApp; em muitos casos o orçamento sai por foto e medidas.'],
      ['Qual o prazo?', 'Depende do vidro e da peça. Informamos o prazo no orçamento.'],
      ['Fazem manutenção de box?', 'Sim: roldanas, puxadores, vedação e ajustes.']
    ],
    endereco: 'Rua Exemplo, 789 — Bairro Exemplo, Belo Horizonte/MG',
    horario: 'Segunda a sexta, 8h às 18h · Sábado, 8h às 12h',
    mensagemWhats: 'Olá! Vim pelo site e gostaria de um orçamento de vidraçaria.'
  },

  /* ---------------- Climatização e eletrônicos ---------------- */
  arcondicionado: {
    grupo: 'Climatização e eletrônicos', rotulo: 'Ar-condicionado',
    empresa: 'Exemplo Climatização',
    cor: '#075985',
    titulo: 'Instalação e manutenção de ar-condicionado em BH',
    subtitulo: 'Instalação, limpeza e conserto com orçamento rápido pelo WhatsApp.',
    destaques: ['Orçamento sem compromisso', 'Limpeza e higienização completas', 'Casas e empresas'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: instalar split 12.000 BTUs, 3º andar…',
    introServicos: 'Serviços para aparelhos split, janela e cassete.',
    servicos: [
      ['Instalação', 'Instalação de aparelhos novos, com infraestrutura.'],
      ['Limpeza e higienização', 'Limpeza completa para ar mais saudável.'],
      ['Manutenção preventiva', 'Revisão periódica para evitar defeitos.'],
      ['Carga de gás', 'Verificação de vazamentos e recarga.'],
      ['Conserto', 'Diagnóstico e reparo de aparelhos que não gelam.'],
      ['Desinstalação', 'Retirada e reinstalação em outro local.']
    ],
    passos: PASSOS_ORCAMENTO,
    faq: [
      ['Quanto tempo leva a limpeza?', 'Em geral cerca de 1 hora por aparelho, dependendo do modelo.'],
      ['Instalam aparelho comprado pela internet?', 'Sim. Envie o modelo e a potência (BTUs) para o orçamento.'],
      ['De quanto em quanto tempo limpar?', 'O técnico indica a frequência ideal para o seu uso.']
    ],
    endereco: ATENDE_BH,
    horario: 'Segunda a sábado, 8h às 18h',
    mensagemWhats: 'Olá! Vim pelo site e gostaria de um orçamento de ar-condicionado.'
  },
  celular: {
    grupo: 'Climatização e eletrônicos', rotulo: 'Assistência de celular',
    empresa: 'Exemplo Cell Assistência',
    cor: '#4f46e5',
    titulo: 'Assistência técnica de celular em BH com orçamento rápido',
    subtitulo: 'Tela quebrada, bateria fraca ou celular que não carrega? Diga o modelo e receba o valor.',
    destaques: ['Orçamento pelo WhatsApp', 'Valor aprovado antes do conserto', 'Garantia informada no orçamento'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: modelo do celular e o defeito…',
    introServicos: 'Conserto das principais marcas de smartphones.',
    servicos: [
      ['Troca de tela', 'Telas para os principais modelos.'],
      ['Troca de bateria', 'Bateria nova para o celular durar o dia.'],
      ['Conector de carga', 'Celular que não carrega ou carrega com mau contato.'],
      ['Celular molhado', 'Limpeza e avaliação após contato com líquidos.'],
      ['Câmera e som', 'Câmeras, alto-falantes e microfones.'],
      ['Software', 'Atualização, lentidão e falhas de sistema.']
    ],
    passos: PASSOS_ORCAMENTO,
    faq: [
      ['Quanto tempo leva?', 'Muitos reparos ficam prontos no mesmo dia, dependendo da peça.'],
      ['Perco meus dados?', 'Na maioria dos reparos, não. Recomendamos fazer backup antes, quando possível.'],
      ['Atendem quais marcas?', 'As principais marcas. Informe o modelo para confirmar.']
    ],
    endereco: 'Rua Exemplo, 321 — Loja 2, Belo Horizonte/MG',
    horario: 'Segunda a sábado, 9h às 19h',
    mensagemWhats: 'Olá! Vim pelo site e gostaria de um orçamento para o meu celular.'
  },
  eletro: {
    grupo: 'Climatização e eletrônicos', rotulo: 'Conserto de eletrodomésticos',
    empresa: 'Exemplo Eletro Consertos',
    cor: '#b45309',
    titulo: 'Conserto de eletrodomésticos em BH com visita agendada',
    subtitulo: 'Máquina de lavar, geladeira, micro-ondas e fogão: diagnóstico e orçamento antes do conserto.',
    destaques: ['Diagnóstico antes do conserto', 'Peças informadas no orçamento', 'Agendamento pelo WhatsApp'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: máquina de lavar não centrifuga, marca e modelo…',
    introServicos: 'Conserto de linha branca em domicílio.',
    servicos: [
      ['Máquina de lavar', 'Não liga, não centrifuga, vaza ou faz barulho.'],
      ['Geladeira e freezer', 'Não gela, forma gelo demais ou faz ruído.'],
      ['Micro-ondas', 'Não esquenta, faísca ou não liga.'],
      ['Fogão e cooktop', 'Queimadores, acendimento e forno.'],
      ['Lava-louças', 'Não lava bem, não drena ou apresenta erro.'],
      ['Secadora', 'Não aquece ou não gira.']
    ],
    passos: PASSOS_ORCAMENTO,
    faq: [
      ['Cobram a visita?', 'O valor da visita técnica é combinado antes, pelo WhatsApp.'],
      ['Atendem qual região?', 'BH e região, conforme a agenda.'],
      ['Tem garantia?', 'O prazo de garantia é informado no orçamento.']
    ],
    endereco: ATENDE_BH,
    horario: 'Segunda a sábado, 8h às 18h',
    mensagemWhats: 'Olá! Vim pelo site e preciso de conserto de eletrodoméstico.'
  },

  /* ---------------- Beleza, estética e pet ---------------- */
  estetica: {
    grupo: 'Beleza, estética e pet', rotulo: 'Estética',
    empresa: 'Studio Exemplo Estética',
    cor: '#be185d', corEscura: '#831843', corClara: '#fce7f3',
    titulo: 'Estética em BH com atendimento cuidadoso e horário marcado',
    subtitulo: 'Avaliação individual para indicar o procedimento certo para você, sem pressa e sem pressão.',
    destaques: ['Avaliação personalizada', 'Atendimento individual', 'Agendamento fácil pelo WhatsApp'],
    tituloForm: 'Agende sua avaliação', cta: 'Agendar avaliação', pedido: 'agendamentos',
    placeholderMensagem: 'Ex.: melhor dia e horário para você…',
    introServicos: 'Procedimentos estéticos com avaliação prévia.',
    servicos: [
      ['Limpeza de pele', 'Higienização profunda com protocolo para o seu tipo de pele.'],
      ['Design de sobrancelhas', 'Desenho que valoriza o seu rosto.'],
      ['Drenagem linfática', 'Técnica manual para bem-estar e sensação de leveza.'],
      ['Massagem relaxante', 'Momento de pausa para aliviar a tensão do dia a dia.'],
      ['Depilação', 'Atendimento rápido, com cuidado e higiene.'],
      ['Avaliação estética', 'Conversa inicial para entender o que você procura.']
    ],
    passos: [
      ['Envie o pedido', 'Diga o procedimento e o melhor horário para você.'],
      ['Confirmamos pelo WhatsApp', 'Retornamos com horários disponíveis e valores.'],
      ['Venha para a avaliação', 'Indicamos o cuidado adequado antes de começar.']
    ],
    faq: [
      ['Preciso de avaliação antes?', 'Sim. A avaliação garante que o procedimento é adequado para você.'],
      ['Quais formas de pagamento?', 'Pix, cartão de débito e crédito.'],
      ['Posso remarcar?', 'Sim, avise pelo WhatsApp com antecedência.']
    ],
    endereco: 'Avenida Exemplo, 456 — Sala 10, Belo Horizonte/MG',
    horario: 'Terça a sábado, 9h às 19h',
    mensagemWhats: 'Olá! Vim pelo site e gostaria de agendar uma avaliação.'
  },
  barbearia: {
    grupo: 'Beleza, estética e pet', rotulo: 'Barbearia',
    empresa: 'Barbearia Exemplo',
    cor: '#475569',
    titulo: 'Barbearia em BH com horário marcado pelo WhatsApp',
    subtitulo: 'Corte, barba e acabamento sem fila: escolha o horário e confirme pelo WhatsApp.',
    destaques: ['Horário marcado, sem fila', 'Ambiente confortável', 'Pix e cartão'],
    tituloForm: 'Agende seu horário', cta: 'Agendar horário', pedido: 'agendamentos',
    placeholderMensagem: 'Ex.: corte + barba, sábado de manhã…',
    introServicos: 'Cortes e cuidados masculinos.',
    servicos: [
      ['Corte', 'Cortes clássicos e modernos.'],
      ['Barba', 'Modelagem e acabamento com toalha quente.'],
      ['Corte + barba', 'O combo completo.'],
      ['Sobrancelha', 'Acabamento discreto.'],
      ['Pigmentação', 'Para barba e cabelo.'],
      ['Corte infantil', 'Com paciência para os pequenos.']
    ],
    passos: PASSOS_AGENDA,
    faq: [
      ['Precisa agendar?', 'Recomendamos agendar para garantir o horário.'],
      ['Quanto tempo leva?', 'Um corte leva em média 30 a 40 minutos.'],
      ['Posso remarcar?', 'Sim, avise pelo WhatsApp com antecedência.']
    ],
    endereco: 'Rua Exemplo, 555 — Bairro Exemplo, Belo Horizonte/MG',
    horario: 'Terça a sábado, 9h às 20h',
    mensagemWhats: 'Olá! Vim pelo site e quero agendar um horário.'
  },
  salao: {
    grupo: 'Beleza, estética e pet', rotulo: 'Salão de beleza',
    empresa: 'Salão Exemplo',
    cor: '#c026d3',
    titulo: 'Salão de beleza em BH com agendamento pelo WhatsApp',
    subtitulo: 'Cabelo, unhas e maquiagem com horário marcado e atendimento cuidadoso.',
    destaques: ['Horário marcado', 'Atendimento personalizado', 'Pix e cartão'],
    tituloForm: 'Agende seu horário', cta: 'Agendar horário', pedido: 'agendamentos',
    placeholderMensagem: 'Ex.: escova + manicure, sexta à tarde…',
    introServicos: 'Cabelo, unhas e beleza para o dia a dia e para eventos.',
    servicos: [
      ['Corte e escova', 'Cortes femininos e finalização.'],
      ['Coloração e mechas', 'Cor e luzes com avaliação do cabelo.'],
      ['Tratamentos', 'Hidratação, nutrição e reconstrução.'],
      ['Manicure e pedicure', 'Unhas cuidadas e esmaltação.'],
      ['Maquiagem', 'Para o dia a dia e eventos.'],
      ['Penteados', 'Para festas, formaturas e casamentos.']
    ],
    passos: PASSOS_AGENDA,
    faq: [
      ['Precisa agendar?', 'Sim, para garantir o horário e o profissional.'],
      ['Fazem atendimento para noivas?', 'Sim, com agendamento antecipado. Consulte pelo WhatsApp.'],
      ['Posso remarcar?', 'Sim, avise pelo WhatsApp com antecedência.']
    ],
    endereco: 'Avenida Exemplo, 777 — Bairro Exemplo, Belo Horizonte/MG',
    horario: 'Terça a sábado, 9h às 19h',
    mensagemWhats: 'Olá! Vim pelo site e quero agendar um horário.'
  },
  petshop: {
    grupo: 'Beleza, estética e pet', rotulo: 'Banho e tosa',
    empresa: 'Exemplo Pet Banho & Tosa',
    cor: '#b5440a',
    titulo: 'Banho e tosa em BH com horário marcado',
    subtitulo: 'Banho, tosa e cuidados para o seu pet, com agendamento pelo WhatsApp.',
    destaques: ['Horário marcado', 'Cuidado e paciência com cada pet', 'Busca e entrega (consulte)'],
    tituloForm: 'Agende o banho', cta: 'Agendar banho', pedido: 'agendamentos',
    placeholderMensagem: 'Ex.: raça e porte do pet, melhor dia…',
    introServicos: 'Banho, tosa e cuidados de higiene para cães.',
    servicos: [
      ['Banho', 'Banho com produtos adequados à pele do pet.'],
      ['Tosa higiênica', 'Higiene das áreas sensíveis.'],
      ['Tosa completa', 'Na máquina ou na tesoura.'],
      ['Hidratação', 'Pelagem mais macia e brilhante.'],
      ['Unhas', 'Corte de unhas com cuidado.'],
      ['Ouvidos', 'Limpeza de ouvidos.']
    ],
    passos: PASSOS_AGENDA,
    faq: [
      ['Precisa agendar?', 'Sim, para organizar o atendimento e evitar espera.'],
      ['Atendem gatos?', 'Consulte pelo WhatsApp: informamos as condições para cada pet.'],
      ['Fazem busca e entrega?', 'Consulte a disponibilidade para o seu bairro.']
    ],
    endereco: 'Rua Exemplo, 999 — Bairro Exemplo, Belo Horizonte/MG',
    horario: 'Segunda a sábado, 8h às 18h',
    mensagemWhats: 'Olá! Vim pelo site e quero agendar banho e tosa.'
  },

  /* ---------------- Mudanças e limpeza ---------------- */
  mudancas: {
    grupo: 'Mudanças e limpeza', rotulo: 'Fretes e mudanças',
    empresa: 'Exemplo Fretes e Mudanças',
    cor: '#2563eb',
    titulo: 'Fretes e mudanças em BH com orçamento pelo WhatsApp',
    subtitulo: 'Mudanças residenciais e comerciais, carretos e pequenos fretes com data combinada.',
    destaques: ['Orçamento sem compromisso', 'Data e horário combinados', 'Ajudantes para carregar (opcional)'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: apartamento de 2 quartos, do Centro para o Buritis, data…',
    introServicos: 'Transporte de móveis e cargas em BH e região.',
    servicos: [
      ['Mudança residencial', 'Casas e apartamentos, com ou sem ajudantes.'],
      ['Mudança comercial', 'Escritórios e lojas, inclusive fora do horário.'],
      ['Carretos e fretes', 'Poucos volumes, compras e entregas.'],
      ['Montagem de móveis', 'Desmontagem e montagem combinadas no orçamento.'],
      ['Embalagem', 'Proteção de móveis e objetos frágeis.'],
      ['Interior de MG', 'Fretes para outras cidades (consulte).']
    ],
    passos: [
      ['Envie a lista', 'Móveis, fotos e os endereços de origem e destino.'],
      ['Receba o orçamento', 'Valor, data e horário combinados antes.'],
      ['Mudança feita', 'Com cuidado e no horário combinado.']
    ],
    faq: [
      ['Como é feito o orçamento?', 'Envie a lista de móveis ou fotos e os endereços de origem e destino.'],
      ['Vocês desmontam móveis?', 'Sim, se combinado no orçamento.'],
      ['Atendem fora de BH?', 'Sim, consulte a disponibilidade e o valor.']
    ],
    endereco: ATENDE_BH,
    horario: 'Segunda a sábado, 7h às 19h',
    mensagemWhats: 'Olá! Vim pelo site e gostaria de um orçamento de frete/mudança.'
  },
  estofados: {
    grupo: 'Mudanças e limpeza', rotulo: 'Limpeza de estofados',
    empresa: 'Exemplo Limpeza de Estofados',
    cor: '#0b8278',
    titulo: 'Limpeza de sofás e estofados em BH, no seu endereço',
    subtitulo: 'Higienização de sofá, colchão, cadeiras e tapetes sem sair de casa.',
    destaques: ['Orçamento por foto', 'Atendimento no seu endereço', 'Agendamento pelo WhatsApp'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: sofá de 3 lugares + colchão casal…',
    introServicos: 'Higienização de estofados em casas, empresas e carros.',
    servicos: [
      ['Sofás', 'Limpeza profunda de sofás de tecido.'],
      ['Colchões', 'Higienização de colchões de todos os tamanhos.'],
      ['Cadeiras e poltronas', 'Cadeiras de jantar, escritório e poltronas.'],
      ['Tapetes', 'Limpeza de tapetes no local.'],
      ['Bancos de carro', 'Higienização interna de veículos.'],
      ['Impermeabilização', 'Proteção contra líquidos e manchas.']
    ],
    passos: PASSOS_FOTO,
    faq: [
      ['Quanto tempo para secar?', 'Depende do tecido e do clima; informamos a estimativa no atendimento.'],
      ['Remove manchas?', 'Avaliamos antes o tipo de tecido e de mancha e dizemos o que esperar.'],
      ['Precisa de água ou energia?', 'Usamos a tomada do local; o restante levamos.']
    ],
    endereco: ATENDE_BH,
    horario: 'Segunda a sábado, 8h às 18h',
    mensagemWhats: 'Olá! Vim pelo site e gostaria de um orçamento de limpeza de estofados.'
  },
  limpeza: {
    grupo: 'Mudanças e limpeza', rotulo: 'Limpeza residencial e pós-obra',
    empresa: 'Exemplo Limpeza',
    cor: '#117e39',
    titulo: 'Diarista e limpeza pós-obra em BH com agendamento',
    subtitulo: 'Limpeza residencial, comercial e pós-obra com escopo combinado antes.',
    destaques: ['Orçamento sem compromisso', 'Escopo combinado por escrito', 'Agendamento flexível'],
    tituloForm: 'Peça seu orçamento', cta: 'Pedir orçamento', pedido: 'pedidos de orçamento',
    placeholderMensagem: 'Ex.: apartamento de 70 m² pós-reforma, bairro…',
    introServicos: 'Limpeza para casas, escritórios e imóveis após obra.',
    servicos: [
      ['Limpeza residencial', 'Limpeza de rotina com agenda fixa ou avulsa.'],
      ['Faxina pesada', 'Limpeza completa de todos os ambientes.'],
      ['Pós-obra', 'Remoção de poeira, respingos e resíduos de reforma.'],
      ['Escritórios', 'Limpeza comercial, inclusive fora do expediente.'],
      ['Vidros e janelas', 'Limpeza de vidros internos e acessíveis.'],
      ['Organização', 'Organização de armários e ambientes.']
    ],
    passos: PASSOS_ORCAMENTO,
    faq: [
      ['Levam os produtos?', 'Combinamos no orçamento: podemos levar produtos e equipamentos.'],
      ['Como é calculado o valor?', 'Pelo tamanho do imóvel e pelo tipo de limpeza.'],
      ['Atendem toda semana?', 'Sim, com agenda fixa.']
    ],
    endereco: ATENDE_BH,
    horario: 'Segunda a sábado, 8h às 18h',
    mensagemWhats: 'Olá! Vim pelo site e gostaria de um orçamento de limpeza.'
  }
};

/*
 * Ícones (traço 24×24, desenhados para este kit; sem bibliotecas externas).
 * Cada valor é o conteúdo interno de um <svg viewBox="0 0 24 24">.
 */
const ICONES = {
  carro: '<path d="M5 16h14M3 16v-3l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v3"/><path d="M3 13h18"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  raio: '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
  gota: '<path d="M12 3c3 4 6 7.2 6 10.6A6 6 0 0 1 6 13.6C6 10.2 9 7 12 3z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
  chave: '<circle cx="7.5" cy="15.5" r="4"/><path d="M10.4 12.6 20 3M16 7l3 3M13.5 9.5l2 2"/>',
  inseto: '<rect x="8" y="7" width="8" height="13" rx="4"/><path d="M12 20v-8M8 11H4M20 11h-4M8 15H3M21 15h-5M8 19l-3 2M16 19l3 2M10 7 8 4M14 7l2-3"/>',
  janela: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18M6 6l3 3"/>',
  floco: '<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7"/><path d="m9 4 3 2 3-2M9 20l3-2 3 2"/>',
  celular: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/>',
  maquina: '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M8 5.5h.01M11 5.5h.01M12 11a2 2 0 0 1 2 2"/>',
  tesoura: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
  brilho: '<path d="M12 3l1.8 4.9L19 9.7l-5.2 1.8L12 16.4l-1.8-4.9L5 9.7l5.2-1.8z"/><path d="M19 15l.7 1.9 2 .7-2 .7L19 20.2l-.7-1.9-2-.7 2-.7z"/>',
  pata: '<circle cx="6.5" cy="10" r="1.8"/><circle cx="10" cy="6" r="1.8"/><circle cx="14" cy="6" r="1.8"/><circle cx="17.5" cy="10" r="1.8"/><path d="M12 11.5c-2.8 0-5 3-5 5.3 0 1.7 1.6 2.2 3 2.2h4c1.4 0 3-.5 3-2.2 0-2.3-2.2-5.3-5-5.3z"/>',
  caminhao: '<path d="M2 6h12v10H2zM14 9h4l3 3.5V16h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  sofa: '<path d="M5 10V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v2"/><path d="M3 11a2 2 0 0 1 2 2v2h14v-2a2 2 0 1 1 2 2v3H1v-3a2 2 0 0 1 2-2z"/><path d="M5 18v2M19 18v2"/>',
  vassoura: '<path d="M20 2 12.5 9.5"/><path d="M10.5 9 15 13.5 13 21l-9.5-9.5L10.5 9z"/><path d="M6.5 14.5l3 3M9 12.5l3 3"/>',
  // Interface
  check: '<path d="M20 6 9 17l-5-5"/>',
  estrela: '<path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z"/>',
  conversa: '<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-5A8.5 8.5 0 1 1 21 11.5z"/>',
  // Símbolo oficial do WhatsApp (preenchido; não alterar a forma). Usado só nos botões que abrem o WhatsApp.
  whatsapp: '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  mapa: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  escudo: '<path d="M12 3 4 6v6c0 4.4 3.4 7.9 8 9 4.6-1.1 8-4.6 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  envio: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  sino: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>'
};

const ICONE_POR_NICHO = {
  oficina: 'carro', servicos: 'raio', desentupidora: 'gota', chaveiro: 'chave', dedetizacao: 'inseto',
  vidracaria: 'janela', arcondicionado: 'floco', celular: 'celular', eletro: 'maquina', estetica: 'brilho',
  barbearia: 'tesoura', salao: 'tesoura', petshop: 'pata', mudancas: 'caminhao', estofados: 'sofa', limpeza: 'vassoura'
};

/** Cria um elemento <svg> com o ícone pedido (só nomes de ICONES; nunca texto de usuário). */
function criarIcone(nome, classe) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'ico' + (classe ? ' ' + classe : ''));
  svg.innerHTML = ICONES[nome] || ICONES.check;
  return svg;
}

/** Mistura duas cores #rrggbb (t = 0 → a, t = 1 → b). */
function misturarCor(a, b, t) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

/** Contraste (WCAG) entre uma cor #rrggbb e o branco. */
function contrasteComBranco(hex) {
  const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const [r, g, b] = [1, 3, 5].map(i => lin(parseInt(hex.slice(i, i + 2), 16)));
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (L + 0.05);
}

/** Escurece a cor até o texto branco por cima ficar legível (contraste ≥ 4,5). */
function corLegivel(hex) {
  let c = hex;
  for (let i = 0; i < 12 && contrasteComBranco(c) < 4.5; i++) c = misturarCor(c, '#000000', 0.12);
  return c;
}

// Campos comuns preenchidos automaticamente.
Object.keys(NICHOS).forEach(chave => {
  const n = NICHOS[chave];
  n.chave = chave;
  if (!n.cnpj) n.cnpj = CNPJ_FICTICIO;
  if (!n.whatsapp) n.whatsapp = WHATS_DEMO;
  if (!n.corEscura) n.corEscura = misturarCor(n.cor, '#000000', 0.45);
  if (!n.corClara) n.corClara = misturarCor(n.cor, '#ffffff', 0.85);
  if (!n.icone) n.icone = ICONE_POR_NICHO[chave] || 'check';
  // Nota de exemplo só para a demo fictícia; prévias usam a nota real informada no gerador (ou nenhuma).
  if (n.nota === undefined) { n.nota = 4.9; n.avaliacoes = 120; n.notaExemplo = true; }
});
