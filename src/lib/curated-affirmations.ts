export interface CuratedCategory {
  key: string;
  name: string;
  frequency: string;
  description: string;
  iconName: string;
  affirmations: string[];
}

export const CURATED_CATEGORIES: Record<string, CuratedCategory> = {
  autoestima: {
    key: "autoestima",
    name: "Autoestima",
    frequency: "98.4 MHz",
    description: "Ancoragem de autovalor, autoridade interna e segurança.",
    iconName: "Shield",
    affirmations: [
      "Minha presença sustenta espaço sem necessidade de validação externa.",
      "Reconheço meu valor intrínseco e opero com firmeza em qualquer ambiente.",
      "Minha voz expressa clareza e autoridade sem pedir permissão.",
      "Descarto a necessidade de agradar e priorizo minha integridade.",
      "Respeito meu ritmo e confio na precisão das minhas decisões.",
      "Habito meu corpo com total confiança e postura inabalável.",
      "Minha capacidade de realização independe da opinião de terceiros.",
      "Aceito erros como ajustes técnicos de rota, nunca como falhas pessoais.",
      "Mantenho limites claros e preservo minha energia sem hesitação.",
      "Minha autoestima é uma estrutura sólida, não uma reação a elogios.",
      "Falo com precisão e permito que minhas ações comprovem minha competência.",
      "Ocupo meu lugar no mundo com convicção e tranquilidade absoluta.",
      "Minha mente rejeita comparações improdutivas de forma automática.",
      "Sou a fonte primária da minha própria segurança e determinação.",
      "Mantenho a compostura e o autorrespeito sob qualquer circunstância.",
      "Minha identidade é estável, autêntica e imune a ruídos externos."
    ]
  },
  abundancia: {
    key: "abundancia",
    name: "Abundância",
    frequency: "101.2 MHz",
    description: "Fluxo de prosperidade, recursos, valor e geração de riqueza.",
    iconName: "TrendingUp",
    affirmations: [
      "Crio valor consistente e recebo retorno financeiro proporcional.",
      "Minha relação com o dinheiro é clara, racional e expansiva.",
      "Identifico oportunidades práticas e executo com eficiência imediata.",
      "Recursos fluem em direção às minhas iniciativas bem estruturadas.",
      "Elimino crenças de escassez e opero na lógica da multiplicação.",
      "Gerencio meus recursos com disciplina, inteligência e visão de longo prazo.",
      "Minha competência técnica e estratégica atrai prosperidade real.",
      "Abro espaço diário para crescimento financeiro e novos canais de renda.",
      "O dinheiro é uma ferramenta neutra que amplifica meu impacto positivo.",
      "Mereço e sustento estabilidade material em nível crescente.",
      "Tomo decisões financeiras com frieza, critério e segurança total.",
      "Construo patrimônio através de constância e escolhas conscientes.",
      "Minhas habilidades resolvem problemas reais e geram valor concreto.",
      "Multiplico o que recebo e mantenho o fluxo contínuo de abundância.",
      "Minha capacidade produtiva cresce a cada projeto finalizado.",
      "Sinto tranquilidade em relação ao futuro financeiro que construo agora."
    ]
  },
  amor: {
    key: "amor",
    name: "Amor & Relações",
    frequency: "103.8 MHz",
    description: "Vínculos conscientes, respeito mútuo e comunicação autêntica.",
    iconName: "HeartHandshake",
    affirmations: [
      "Comunico minhas necessidades com clareza, calma e respeito.",
      "Atraio e mantenho conexões baseadas em reciprocidade e honestidade.",
      "Ofereço presença real e escuta ativa sem perder meus limites.",
      "Minha capacidade de amar começa na lealdade aos meus próprios valores.",
      "Permito trocas profundas e descarto jogos emocionais desgastantes.",
      "Reconheço o valor das pessoas sem depender de sua aprovação contínua.",
      "Construo pontes de diálogo onde antes existiam reações impulsivas.",
      "Protejo minha paz em relações e desfaço atritos com maturidade.",
      "Pratico a paciência nas interações e mantenho meu centro emocional.",
      "Minhas relações são fontes de cooperação, crescimento e respeito mútuo.",
      "Expresso afeto de forma genuína, sem cobranças ou expectativas irreais.",
      "Aceito as pessoas como são enquanto decido quem permanece ao meu lado.",
      "Minha postura afetiva é generosa, lúcida e equilibrada.",
      "Sustento a harmonia nos meus círculos sem abrir mão da verdade.",
      "Valorizo parcerias que somam clareza e fortalecem meu caminho.",
      "Meu coração permanece aberto à conexão e firme na proteção do meu bem-estar."
    ]
  },
  foco: {
    key: "foco",
    name: "Foco & Disciplina",
    frequency: "106.5 MHz",
    description: "Atenção concentrada, execução sem desvios e alta disciplina.",
    iconName: "Target",
    affirmations: [
      "Executo a tarefa prioritária antes de buscar qualquer distração.",
      "Minha atenção permanece ancorada no que posso controlar agora.",
      "Bloqueio ruídos periféricos e mantenho foco absoluto no objetivo ativo.",
      "Minha disciplina diária supera qualquer oscilação temporária de humor.",
      "Concluo o que começo com precisão e padrão de excelência elevado.",
      "Digo não a demandas secundárias para proteger meu tempo produtivo.",
      "Minha mente é um filtro calibrado para identificar apenas o essencial.",
      "Trabalho em blocos contínuos de imersão e concentração profunda.",
      "Elimino o hábito da procrastinação através de pequenas ações imediatas.",
      "Mantenho o ritmo constante mesmo diante de tarefas complexas.",
      "Minha determinação é sustentada pela clareza do resultado final.",
      "Controlo meus impulsos de checagem constante e preservo meu fluxo.",
      "Priorizo impacto real sobre ocupação superficial.",
      "Cada minuto dedicado com intenção consolida minha maestria.",
      "Minha rotina é estruturada para maximizar foco, energia e entrega.",
      "Decido a direção e executo sem hesitação retroativa."
    ]
  },
  saude: {
    key: "saude",
    name: "Saúde & Vitalidade",
    frequency: "95.6 MHz",
    description: "Energia biológica, repouso restaurador e cuidado corporal consciente.",
    iconName: "Activity",
    affirmations: [
      "Forneço ao meu corpo nutrientes de qualidade e hidratação regular.",
      "Meu sono é profundo, restaurador e regenera minha energia vital.",
      "Respeito os sinais biológicos de descanso e evito o esgotamento.",
      "Movimento meu corpo diariamente com vigor e prazer consciente.",
      "Minha respiração é ritmada, profunda e acalma meu sistema nervoso.",
      "Cuido da minha postura física e projeto vitalidade no dia a dia.",
      "Cultivo hábitos que protegem minha longevidade e clareza mental.",
      "Elimino substâncias e excessos que drenam meu rendimento.",
      "Meu organismo funciona com harmonia, defesa e imunidade ativas.",
      "Trato meu corpo como o instrumento principal da minha existência.",
      "Equilibro esforço produtivo e recuperação física com precisão.",
      "Minha mente desacelera no momento de descanso sem culpa.",
      "Desenvolvo força, resistência e flexibilidade em ritmo constante.",
      "Minha saúde é meu maior ativo e prioridade inegociável.",
      "Sinto vigor físico renovado ao iniciar cada novo ciclo diário.",
      "Habito um estado biológico de prontidão, serenidade e equilíbrio."
    ]
  },
  superacao: {
    key: "superacao",
    name: "Superação & Resiliência",
    frequency: "92.0 MHz",
    description: "Força sob pressão, dissolução de obstáculos e persistência.",
    iconName: "Zap",
    affirmations: [
      "Obstáculos são dados do problema que ajusto e resolvo com método.",
      "Minha resiliência aumenta a cada situação de pressão que atravesso.",
      "Não temo momentos desconfortáveis; eles refinam minha capacidade.",
      "Mantenho a lucidez quando o ambiente ao redor parece instável.",
      "Desmonto desafios complexos em etapas executáveis simples.",
      "Minha capacidade de adaptação é rápida, prática e assertiva.",
      "Aprendo com a perda sem transformar a dor em narrativa de derrota.",
      "Persisto no caminho mesmo quando o progresso imediato parece invisível.",
      "Minha força mental se sobrepõe a qualquer cansaço momentâneo.",
      "Transformo atrito em aprendizado e sigo em frente sem remorso.",
      "Encaro a incerteza com curiosidade estratégica e calma.",
      "Nenhuma circunstância externa anula meu poder de escolha agora.",
      "Supero velhos limites com a repetição consistente do correto.",
      "Minha determinação é mais duradoura do que qualquer crise.",
      "Levanto-me de cada revés com mais experiência e precisão técnica.",
      "Mantenho os olhos no horizonte enquanto piso firme no presente."
    ]
  },
  gratidao: {
    key: "gratidao",
    name: "Gratidão & Presença",
    frequency: "90.4 MHz",
    description: "Reconhecimento lúcido, ancoragem no presente e calma.",
    iconName: "Sparkles",
    affirmations: [
      "Reconheço o valor das conquistas presentes sem pressa ansiosa.",
      "Minha mente descansa no momento atual e absorve a realidade com calma.",
      "Valorizo as condições reais que me permitem construir o futuro.",
      "Agradeço pela minha capacidade contínua de aprender e evoluir.",
      "Identifico pontos de apoio e segurança na minha vida cotidiana.",
      "Reconheço o esforço acumulado que me trouxe até este patamar.",
      "Mantenho uma perspectiva lúcida que celebra pequenos avanços diários.",
      "Minha atenção contempla o que já existe em vez de focar apenas na falta.",
      "Pratico a gratidão silenciosa através do cuidado com o que possuo.",
      "Reconheço a contribuição de quem caminha ao meu lado.",
      "Sinto serenidade perante a jornada que se desdobra a cada dia.",
      "Aprecio o silêncio e o espaço seguro que conquisto para mim.",
      "Minha consciência está ancorada no presente com clareza e lucidez.",
      "Valorizo a oportunidade diária de recomeçar com foco renovado.",
      "Mantenho um olhar atento para os recursos e apoios já disponíveis.",
      "Vivo este instante com intensidade, equilíbrio e respeito à vida."
    ]
  },
  proposito: {
    key: "proposito",
    name: "Propósito & Direção",
    frequency: "107.9 MHz",
    description: "Alinhamento existencial, visão de longo prazo e legado.",
    iconName: "Compass",
    affirmations: [
      "Minhas ações diárias convergem para uma visão clara de longo prazo.",
      "Trabalho em projetos que ampliam meu impacto e significado no mundo.",
      "Meu tempo é investido em direções alinhadas com meus princípios.",
      "Rejeito atalhos que comprometem minha rota existencial essencial.",
      "Construo um legado baseado em utilidade real, verdade e entrega.",
      "Minha missão é clara: evoluir continuamente e gerar valor concreto.",
      "Tomo decisões estratégicas guiado pelo que importa a longo prazo.",
      "Minha energia é canalizada para o que realmente faz diferença.",
      "Tenho clareza de onde estou e para onde direciono meus passos.",
      "Minha ambição é nobre, produtiva e alinhada com o bem comum.",
      "Dedico meus melhores talentos à resolução de problemas relevantes.",
      "Mantenho o rumo mesmo quando surgem ventos contrários.",
      "Construo meu futuro através da escolha deliberada de hoje.",
      "Minha vida tem direção precisa e recusa a passividade.",
      "Cultivo habilidades que sustentam minha contribuição duradoura.",
      "Sigo minha bússola interna com tranquilidade e determinação constante."
    ]
  }
};

export const ALL_CURATED_AFFIRMATIONS = Object.values(CURATED_CATEGORIES).flatMap(
  (category) =>
    category.affirmations.map((text) => ({
      text,
      categoryKey: category.key,
      source: "curated" as const,
    }))
);
