export interface Exercise {
  title: string;
  description: string;
}

export interface Checklist {
  items: string[];
}

export interface ExampleBox {
  title: string;
  content: string;
}

export interface LessonContent {
  id: string;
  title: string;
  introduction: string;
  sections: {
    title: string;
    content: string;
    examples?: ExampleBox[];
  }[];
  summary: string[];
  exercise?: Exercise;
  checklist?: Checklist;
}

export interface ModuleData {
  id: string;
  number: number;
  title: string;
  description: string;
  lessons: LessonContent[];
}

export const courseContent: ModuleData[] = [
  {
    id: "modulo-1",
    number: 1,
    title: "Fundamentos da IA",
    description: "Entenda o que é IA de verdade, como ela funciona e como pensar para usá-la bem.",
    lessons: [
      {
        id: "m1-aula-1",
        title: "O que é IA (sem tecnicismo)",
        introduction: "Você já ouviu falar de Inteligência Artificial milhares de vezes. Mas o que ela realmente é? Vamos tirar o mistério e entender de forma simples.",
        sections: [
          {
            title: "Esquece o que você viu nos filmes",
            content: "IA não é um robô que vai dominar o mundo. Não é uma superinteligência que pensa sozinha. Na prática, IA é uma ferramenta. Uma ferramenta muito poderosa, mas ainda assim, uma ferramenta.\n\nPense assim: uma calculadora faz contas que você demoraria minutos para fazer. Ela não \"pensa\" — ela processa. A IA é parecida, só que em vez de números, ela processa linguagem, imagens, padrões.\n\nQuando você pergunta algo ao ChatGPT, ele não \"sabe\" a resposta. Ele prevê qual é a próxima palavra mais provável com base em bilhões de textos que leu. É estatística avançada, não mágica.",
            examples: [
              {
                title: "Exemplo prático",
                content: "Quando você digita \"Bom dia, como você...\", a IA prevê que a próxima palavra provavelmente é \"está\". Ela faz isso milhares de vezes por segundo até formar uma resposta completa."
              }
            ]
          },
          {
            title: "A analogia do assistente",
            content: "Imagine que você contratou um assistente que leu todos os livros do mundo, viu todos os sites, analisou milhões de conversas. Esse assistente não é genial — ele é muito bem informado.\n\nQuando você pede algo, ele busca padrões no que já viu e tenta montar a melhor resposta possível. Às vezes acerta em cheio. Às vezes erra feio. Depende de como você pede.\n\nE é aqui que entra o segredo: a qualidade da resposta depende da qualidade da pergunta. Isso você vai aprender ao longo do curso."
          },
          {
            title: "Por que isso importa agora?",
            content: "A IA chegou num ponto em que qualquer pessoa pode usar. Você não precisa saber programar. Não precisa entender algoritmos. Você só precisa saber se comunicar.\n\nIsso muda tudo. Pela primeira vez na história, uma tecnologia de ponta está acessível para todo mundo. E quem souber usar bem, vai sair na frente.\n\nNão é sobre substituir pessoas. É sobre amplificar o que você já faz. Escrever mais rápido. Pensar com mais clareza. Resolver problemas com menos esforço."
          }
        ],
        summary: [
          "IA é uma ferramenta, não uma inteligência real",
          "Ela prevê respostas com base em padrões estatísticos",
          "A qualidade da resposta depende da qualidade da pergunta",
          "Qualquer pessoa pode usar IA hoje, sem conhecimento técnico"
        ],
        exercise: {
          title: "Reflexão prática",
          description: "Pense em 3 tarefas do seu dia a dia que envolvem escrita, pesquisa ou organização. Anote-as. Ao longo do curso, você vai aprender a resolver cada uma com IA."
        }
      },
      {
        id: "m1-aula-2",
        title: "Como a IA funciona na prática",
        introduction: "Agora que você sabe o que é IA, vamos entender como ela realmente funciona quando você usa. Sem complicação.",
        sections: [
          {
            title: "O fluxo básico: entrada, processamento, saída",
            content: "Toda interação com IA segue um padrão simples:\n\n1. ENTRADA: Você escreve algo (um comando, uma pergunta, um pedido)\n2. PROCESSAMENTO: A IA analisa o que você escreveu e busca a melhor resposta\n3. SAÍDA: Ela devolve um texto, imagem ou resultado\n\nÉ isso. Não tem mistério. O que muda é a qualidade de cada etapa.",
            examples: [
              {
                title: "Exemplo prático",
                content: "Entrada: \"Escreva um post sobre produtividade\"\nProcessamento: IA busca padrões de posts sobre produtividade\nSaída: Um texto genérico sobre produtividade\n\nAgora compare:\nEntrada: \"Escreva um post de Instagram sobre como usar 15 minutos por dia para organizar a semana, tom leve e prático, com emojis\"\nProcessamento: IA busca padrões mais específicos\nSaída: Um texto muito mais útil e direcionado"
              }
            ]
          },
          {
            title: "A IA não lê sua mente",
            content: "Esse é um erro comum: achar que a IA vai \"entender\" o que você quer. Não vai.\n\nEla trabalha com o que você dá. Se você der pouco, ela inventa. Se você der muito e bem organizado, ela entrega melhor.\n\nPense como se estivesse dando instruções para alguém que nunca te viu, não conhece seu negócio e não sabe o que você quer. Quanto mais contexto, melhor."
          },
          {
            title: "O ciclo de refinamento",
            content: "Na prática, você raramente acerta de primeira. E tudo bem.\n\nO uso real de IA funciona assim:\n\n1. Você pede algo\n2. Ela responde\n3. Você ajusta o pedido\n4. Ela responde melhor\n5. Você refina de novo\n6. Resultado final\n\nIsso não é falha. É o processo. Os melhores usuários de IA sabem iterar. Sabem refinar. Não esperam perfeição de cara.",
            examples: [
              {
                title: "Exemplo prático",
                content: "Primeira tentativa: \"Escreva um e-mail de vendas\"\nResposta: Texto genérico\n\nRefinamento: \"Esse e-mail é para donos de pequenos negócios que querem economizar tempo. Tom direto, sem enrolação, máximo 5 linhas.\"\nResposta: Muito melhor\n\nRefinamento final: \"Adicione uma pergunta no início para gerar curiosidade\"\nResposta: Exatamente o que você queria"
              }
            ]
          }
        ],
        summary: [
          "IA funciona em 3 etapas: entrada, processamento e saída",
          "Ela não lê sua mente — depende do que você escreve",
          "O processo natural é pedir, receber, refinar, repetir",
          "Bons usuários sabem iterar até chegar no resultado certo"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Abra o ChatGPT (ou outra IA) e faça um pedido simples. Depois, refine 3 vezes até o resultado ficar exatamente como você quer. Observe como cada ajuste melhora a resposta."
        }
      },
      {
        id: "m1-aula-3",
        title: "Mentalidade correta para usar IA",
        introduction: "A diferença entre quem usa IA bem e quem não consegue resultados não está na ferramenta. Está na forma de pensar.",
        sections: [
          {
            title: "IA é ferramenta, não solução mágica",
            content: "O maior erro é esperar que a IA resolva tudo sozinha. Ela não resolve. Ela acelera, amplia, facilita — mas você continua no comando.\n\nQuem espera milagre, se frustra. Quem entende que é uma parceria, evolui rápido.\n\nPense assim: a IA é como um carro. Ele te leva mais longe e mais rápido, mas você ainda precisa saber dirigir, escolher o caminho e colocar gasolina."
          },
          {
            title: "Clareza é tudo",
            content: "Se você não sabe o que quer, a IA também não vai saber. Simples assim.\n\nAntes de pedir qualquer coisa, pare e pense:\n\n- O que exatamente eu preciso?\n- Para quem é isso?\n- Qual o tom, estilo, formato?\n- O que eu NÃO quero?\n\nQuanto mais claro você for consigo mesmo, melhor vai ser seu pedido. E melhor vai ser a resposta.",
            examples: [
              {
                title: "Exemplo prático",
                content: "Pedido confuso: \"Me ajuda com um texto\"\n\nPedido claro: \"Preciso de um texto de 3 parágrafos explicando os benefícios de acordar cedo, para um público jovem, tom motivacional mas sem clichês, para usar no meu blog pessoal.\""
              }
            ]
          },
          {
            title: "Errar faz parte",
            content: "Você vai errar. A IA vai errar. E está tudo bem.\n\nCada erro ensina. Cada resposta ruim mostra o que ajustar. O processo de aprendizado com IA é rápido porque o feedback é instantâneo.\n\nNão tenha medo de experimentar. Teste prompts diferentes. Veja o que funciona. Anote o que dá certo. Com o tempo, você desenvolve intuição."
          },
          {
            title: "Pense como um diretor, não como um digitador",
            content: "Quem usa IA bem não fica só pedindo coisas. Fica direcionando.\n\nVocê é o diretor. A IA é a equipe. Você dá a visão, o contexto, os limites. A IA executa.\n\nIsso significa que você precisa pensar antes de digitar. Precisa saber o que quer antes de pedir. Precisa revisar e ajustar o que recebe.\n\nEssa mentalidade muda tudo."
          }
        ],
        summary: [
          "IA é parceira, não solução mágica",
          "Clareza no pedido = qualidade na resposta",
          "Errar faz parte do processo de aprendizado",
          "Pense como diretor: dê visão, contexto e direção"
        ],
        exercise: {
          title: "Reflexão",
          description: "Pense na última vez que você pediu algo para uma IA e não ficou satisfeito. O problema estava no pedido ou na expectativa? Anote o que você faria diferente agora."
        }
      },
      {
        id: "m1-aula-4",
        title: "Erros comuns de iniciantes",
        introduction: "Vamos falar sobre os erros que quase todo mundo comete no início — e como evitá-los desde já.",
        sections: [
          {
            title: "Erro 1: Prompts vagos demais",
            content: "\"Escreve um texto pra mim\" é o pedido mais inútil que existe.\n\nQue texto? Sobre o quê? Para quem? Com qual objetivo? Qual o tamanho? Qual o tom?\n\nA IA não é vidente. Ela precisa de informação. Quanto menos você dá, mais ela inventa. E invenção raramente é o que você precisa.",
            examples: [
              {
                title: "Exemplo prático",
                content: "❌ \"Escreve um texto sobre vendas\"\n\n✅ \"Escreve um texto de 200 palavras sobre como pequenos negócios podem aumentar vendas usando WhatsApp, tom prático e direto, para donos de loja física.\""
              }
            ]
          },
          {
            title: "Erro 2: Aceitar a primeira resposta",
            content: "A primeira resposta quase nunca é a melhor. Ela é um ponto de partida.\n\nOs melhores usuários de IA refinam. Pedem ajustes. Dão feedback. Iteram.\n\nSe você aceita tudo de primeira, está desperdiçando o potencial da ferramenta. A mágica está no refinamento."
          },
          {
            title: "Erro 3: Não revisar o conteúdo",
            content: "IA erra. Inventa dados. Usa frases estranhas. Repete ideias.\n\nVocê SEMPRE precisa revisar. Nunca publique, envie ou use algo da IA sem ler e ajustar.\n\nA IA é seu rascunhista, não seu editor. A revisão final é sua responsabilidade.",
            examples: [
              {
                title: "Exemplo prático",
                content: "A IA pode escrever \"Segundo estudos recentes, 87% das pessoas preferem...\" — e esse dado simplesmente não existir. Sempre verifique fatos e números."
              }
            ]
          },
          {
            title: "Erro 4: Esperar que a IA pense por você",
            content: "IA não substitui pensamento estratégico. Ela executa bem, mas não define direção.\n\nSe você não sabe o que quer, a IA só vai te dar respostas genéricas. O trabalho de pensar, decidir e direcionar ainda é seu.\n\nUse IA para amplificar suas ideias, não para ter ideias por você."
          },
          {
            title: "Erro 5: Não aprender com os resultados",
            content: "Cada interação com IA é uma chance de aprender. O que funcionou? O que não funcionou? Por quê?\n\nQuem presta atenção, evolui rápido. Quem só usa sem refletir, fica estagnado.\n\nCrie o hábito de analisar suas conversas. Salve os prompts que funcionam. Construa seu repertório."
          }
        ],
        summary: [
          "Evite prompts vagos — seja específico",
          "Refine as respostas, não aceite de primeira",
          "Sempre revise antes de usar",
          "IA não pensa por você — ela executa suas ideias",
          "Aprenda com cada interação"
        ],
        checklist: {
          items: [
            "Meu pedido está claro e específico?",
            "Incluí contexto suficiente?",
            "Refinei a resposta pelo menos uma vez?",
            "Revisei o conteúdo antes de usar?",
            "Aprendi algo com essa interação?"
          ]
        }
      }
    ]
  },
  {
    id: "modulo-2",
    number: 2,
    title: "Ferramentas Essenciais",
    description: "Conheça as principais ferramentas de IA e aprenda a usar cada uma na prática.",
    lessons: [
      {
        id: "m2-aula-1",
        title: "ChatGPT na prática",
        introduction: "O ChatGPT é a ferramenta de IA mais popular do mundo. Vamos entender como usá-lo de verdade, além do básico.",
        sections: [
          {
            title: "O que é o ChatGPT",
            content: "ChatGPT é um modelo de linguagem criado pela OpenAI. Ele conversa com você em texto, respondendo perguntas, criando conteúdo, ajudando em tarefas.\n\nPense nele como um assistente que está disponível 24 horas, sabe sobre praticamente qualquer assunto e não reclama de refazer o trabalho.\n\nEle tem versões gratuitas e pagas. A versão gratuita já resolve muita coisa. A paga é mais rápida e tem recursos extras."
          },
          {
            title: "Para que serve na vida real",
            content: "O ChatGPT não é só para \"fazer perguntas\". Ele serve para:\n\n• Escrever textos, e-mails, posts, legendas\n• Resumir documentos longos\n• Traduzir e adaptar conteúdos\n• Criar roteiros e scripts\n• Organizar ideias e fazer brainstorm\n• Explicar conceitos complexos de forma simples\n• Revisar e melhorar textos que você escreveu\n• Criar listas, checklists, planejamentos\n• Simular conversas e treinar apresentações",
            examples: [
              {
                title: "Exemplo prático",
                content: "Você precisa escrever um e-mail pedindo prazo extra para um cliente. Em vez de ficar 20 minutos pensando nas palavras certas, você pede ao ChatGPT: \"Escreva um e-mail profissional e educado pedindo 3 dias extras de prazo para entrega de um projeto, explicando que tivemos um imprevisto técnico.\"\n\nEm 10 segundos você tem um rascunho. Ajusta duas palavras e envia."
              }
            ]
          },
          {
            title: "Como usar bem",
            content: "A regra de ouro: seja específico.\n\nQuanto mais contexto você der, melhor a resposta. Inclua:\n\n• O que você precisa exatamente\n• Para quem é (público, contexto)\n• Tom desejado (formal, informal, técnico, leve)\n• Formato (lista, parágrafo, tópicos)\n• Tamanho aproximado\n• O que você NÃO quer\n\nE lembre-se: refine. A primeira resposta é um ponto de partida."
          },
          {
            title: "Truques que funcionam",
            content: "1. Peça para ele \"agir como\" alguém: \"Aja como um especialista em marketing digital e me ajude a...\"\n\n2. Dê exemplos do que você quer: \"Quero um texto nesse estilo: [cole um exemplo]\"\n\n3. Peça opções: \"Me dê 5 versões diferentes de...\"\n\n4. Use ele para revisar: \"Revise esse texto e sugira melhorias: [seu texto]\"\n\n5. Peça para simplificar: \"Explique isso como se eu tivesse 10 anos\""
          }
        ],
        summary: [
          "ChatGPT é um assistente de texto disponível 24h",
          "Serve para escrever, resumir, organizar, criar e revisar",
          "Seja específico nos pedidos para ter bons resultados",
          "Use truques como 'aja como', 'dê opções' e 'revise'"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Abra o ChatGPT e peça para ele escrever 3 versões de uma bio profissional sua para o Instagram. Depois, escolha a melhor e peça para ele melhorar ainda mais."
        }
      },
      {
        id: "m2-aula-2",
        title: "IA para textos",
        introduction: "Escrever é uma das tarefas que mais tomam tempo. Vamos ver como usar IA para acelerar sua produção de texto sem perder qualidade.",
        sections: [
          {
            title: "O que a IA pode fazer com texto",
            content: "A IA pode:\n\n• Escrever do zero com base em instruções\n• Reescrever textos existentes\n• Expandir ideias curtas em textos completos\n• Resumir textos longos\n• Mudar o tom (formal para informal, técnico para simples)\n• Corrigir erros e melhorar clareza\n• Traduzir mantendo o sentido\n• Adaptar para diferentes plataformas"
          },
          {
            title: "Escrevendo do zero",
            content: "Quando você precisa criar um texto do zero, dê à IA:\n\n1. O tipo de texto (post, artigo, e-mail, roteiro)\n2. O assunto principal\n3. O público-alvo\n4. O tom de voz\n5. O tamanho aproximado\n6. Qualquer informação específica que precisa conter",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Escreva um post para LinkedIn sobre a importância de fazer pausas durante o trabalho. Tom profissional mas leve, 150 palavras, para empreendedores. Inclua uma estatística sobre produtividade e termine com uma pergunta para gerar engajamento.\""
              }
            ]
          },
          {
            title: "Melhorando textos existentes",
            content: "Às vezes você já tem um texto, mas ele não está bom. A IA pode ajudar:\n\n• \"Reescreva esse texto de forma mais clara\"\n• \"Deixe esse texto mais persuasivo\"\n• \"Simplifique esse texto para leigos\"\n• \"Adicione exemplos práticos a esse texto\"\n• \"Encurte esse texto mantendo as ideias principais\"",
            examples: [
              {
                title: "Exemplo prático",
                content: "Você escreveu: \"Nossa empresa oferece soluções inovadoras para otimizar processos empresariais através de metodologias disruptivas.\"\n\nVocê pede: \"Reescreva de forma simples e direta, sem jargões corporativos.\"\n\nIA responde: \"Ajudamos empresas a trabalhar melhor e mais rápido, com menos complicação.\""
              }
            ]
          },
          {
            title: "Adaptando para diferentes canais",
            content: "Um mesmo conteúdo pode virar vários textos diferentes:\n\n• Um artigo vira post de Instagram\n• Um post vira thread no Twitter\n• Uma ideia vira roteiro de vídeo\n• Um e-mail vira mensagem de WhatsApp\n\nBasta pedir: \"Adapte esse texto para [plataforma], mantendo a mensagem principal.\""
          }
        ],
        summary: [
          "IA escreve, reescreve, expande, resume e adapta textos",
          "Dê contexto completo ao pedir textos do zero",
          "Use IA para melhorar textos que você já escreveu",
          "Adapte um conteúdo para múltiplas plataformas"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Pegue um texto seu (e-mail, post, mensagem) e peça para a IA reescrever de 3 formas: mais formal, mais informal e mais curto. Compare os resultados."
        }
      },
      {
        id: "m2-aula-3",
        title: "IA para imagens",
        introduction: "Criar imagens com IA parece mágica, mas tem técnica. Vamos entender como pensar visualmente e conseguir os resultados que você quer.",
        sections: [
          {
            title: "Como funciona geração de imagens",
            content: "Ferramentas como DALL-E, Midjourney e Leonardo AI criam imagens a partir de descrições em texto. Você escreve o que quer ver, e a IA gera.\n\nMas atenção: a IA interpreta literalmente. Se você pedir \"cachorro feliz\", ela vai gerar um cachorro que parece feliz. Se quiser algo específico, precisa descrever em detalhes."
          },
          {
            title: "Anatomia de um bom prompt de imagem",
            content: "Um prompt de imagem eficiente tem:\n\n1. SUJEITO: O que aparece na imagem (pessoa, objeto, cena)\n2. AÇÃO/POSE: O que está acontecendo\n3. ESTILO: Realista, cartoon, pintura, minimalista\n4. AMBIENTE: Onde acontece, qual o cenário\n5. ILUMINAÇÃO: Luz natural, estúdio, dramática\n6. CORES: Paleta específica se necessário\n7. COMPOSIÇÃO: Close, panorâmica, vista aérea",
            examples: [
              {
                title: "Exemplo prático",
                content: "❌ \"Uma mulher trabalhando\"\n\n✅ \"Mulher jovem, cabelo castanho, trabalhando em laptop em um café moderno, luz natural entrando pela janela, estilo fotografia editorial, cores quentes, ângulo levemente lateral\""
              }
            ]
          },
          {
            title: "Estilos que você pode pedir",
            content: "A IA consegue imitar diversos estilos:\n\n• Fotografia realista\n• Ilustração digital\n• Aquarela\n• Pintura a óleo\n• Cartoon/desenho animado\n• 3D render\n• Minimalista/flat design\n• Vintage/retrô\n• Neon/cyberpunk\n• Estilo de artistas específicos (com cuidado ético)"
          },
          {
            title: "Erros comuns e como evitar",
            content: "1. Prompt muito vago: Adicione detalhes sobre estilo, cor e composição\n\n2. Esperar perfeição de primeira: Gere várias versões e escolha a melhor\n\n3. Ignorar proporções: Especifique se quer quadrado, retrato ou paisagem\n\n4. Não iterar: Pegue uma imagem boa e peça variações\n\n5. Esquecer o uso final: Uma imagem para Instagram é diferente de uma para apresentação"
          }
        ],
        summary: [
          "IA gera imagens a partir de descrições em texto",
          "Bons prompts incluem sujeito, estilo, ambiente, luz e composição",
          "Você pode pedir diversos estilos artísticos",
          "Gere várias versões e itere até encontrar o ideal"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Escolha uma imagem que você precisaria para um projeto (post, apresentação, banner). Escreva um prompt detalhado seguindo a estrutura da aula. Depois, teste em uma ferramenta de IA de imagens."
        }
      },
      {
        id: "m2-aula-4",
        title: "IA para vídeos",
        introduction: "Vídeos são o formato mais consumido hoje. Vamos ver como a IA pode ajudar você a criar vídeos mesmo sem saber editar.",
        sections: [
          {
            title: "O que a IA pode fazer com vídeos",
            content: "A IA hoje consegue:\n\n• Gerar vídeos curtos a partir de texto\n• Criar avatares que falam (você não precisa aparecer)\n• Editar vídeos automaticamente\n• Adicionar legendas em segundos\n• Criar transições e efeitos\n• Transformar textos em vídeos animados\n• Clonar voz para narração"
          },
          {
            title: "Ferramentas principais",
            content: "Algumas ferramentas que você pode usar:\n\n• HeyGen e Synthesia: Criam avatares que falam seu texto\n• Runway: Geração e edição de vídeos com IA\n• Descript: Edição de vídeo como se fosse documento de texto\n• CapCut: Edição fácil com recursos de IA integrados\n• Opus Clip: Transforma vídeos longos em cortes curtos\n• Eleven Labs: Clonagem de voz realista"
          },
          {
            title: "Criando vídeos com avatares",
            content: "Se você não quer aparecer na câmera, avatares são uma solução:\n\n1. Escolha um avatar (pessoa virtual)\n2. Escreva o roteiro que ele vai falar\n3. A IA gera o vídeo com o avatar falando naturalmente\n4. Você pode adicionar elementos visuais e músicas\n\nÉ perfeito para tutoriais, explicações e apresentações.",
            examples: [
              {
                title: "Exemplo prático",
                content: "Você precisa gravar 10 vídeos explicando seu produto para clientes. Em vez de gravar você mesmo 10 vezes, você escreve 10 roteiros e gera 10 vídeos com avatar em minutos."
              }
            ]
          },
          {
            title: "Editando vídeos com IA",
            content: "A edição também ficou mais fácil:\n\n• Legendas automáticas em segundos\n• Remoção de silêncios e erros\n• Cortes inteligentes baseados no conteúdo\n• Zoom automático em momentos importantes\n• Música de fundo que combina com o tom\n\nO que antes levava horas agora leva minutos."
          }
        ],
        summary: [
          "IA cria, edita e aprimora vídeos automaticamente",
          "Avatares permitem criar vídeos sem aparecer",
          "Ferramentas como HeyGen, Runway e CapCut facilitam o processo",
          "Edição com IA reduz horas de trabalho para minutos"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Escreva um roteiro de 30 segundos sobre um tema que você domina. Depois, explore uma ferramenta de avatar (como HeyGen ou Synthesia, que têm versões gratuitas) e veja como ficaria o vídeo."
        }
      },
      {
        id: "m2-aula-5",
        title: "IA para produtividade",
        introduction: "Além de criar conteúdo, a IA pode te ajudar a organizar a vida, trabalhar melhor e perder menos tempo com tarefas repetitivas.",
        sections: [
          {
            title: "IA como assistente pessoal",
            content: "Pense na IA como seu assistente particular que:\n\n• Organiza suas tarefas e prioridades\n• Resume e-mails e documentos longos\n• Prepara agendas e pautas de reunião\n• Responde perguntas rápidas\n• Lembra você do que é importante\n• Ajuda a tomar decisões"
          },
          {
            title: "Organizando tarefas e rotina",
            content: "Você pode usar IA para:\n\n• Criar listas de tarefas priorizadas\n• Planejar sua semana com base em objetivos\n• Dividir projetos grandes em etapas pequenas\n• Definir prazos realistas\n• Revisar o que foi feito e ajustar planos",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Tenho essas tarefas para a semana: [lista]. Me ajude a organizar por prioridade, considerando que tenho 4 horas por dia disponíveis e preciso entregar o projeto X até sexta.\""
              }
            ]
          },
          {
            title: "Resumindo informação",
            content: "Uma das melhores utilidades da IA é processar informação por você:\n\n• Resumir artigos e relatórios\n• Extrair pontos principais de documentos\n• Simplificar textos complexos\n• Criar sumários de reuniões\n• Transformar anotações bagunçadas em texto organizado"
          },
          {
            title: "Automatizando respostas",
            content: "Você pode usar IA para criar templates de respostas para situações comuns:\n\n• E-mails de follow-up\n• Respostas a perguntas frequentes\n• Mensagens de agradecimento\n• Comunicados padrão\n\nCrie uma vez, use sempre.",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Crie 5 templates de e-mail para: 1) agradecer reunião, 2) cobrar resposta educadamente, 3) recusar proposta gentilmente, 4) pedir mais informações, 5) confirmar recebimento de documento.\""
              }
            ]
          }
        ],
        summary: [
          "IA funciona como assistente pessoal para organização",
          "Use para organizar tarefas, planejar semanas e dividir projetos",
          "Resuma documentos longos em segundos",
          "Crie templates de resposta para situações comuns"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Liste todas as tarefas que você tem para esta semana e peça à IA para organizá-las por prioridade, sugerindo um cronograma realista baseado no tempo que você tem disponível."
        }
      }
    ]
  },
  {
    id: "modulo-3",
    number: 3,
    title: "Prompts que Funcionam",
    description: "Domine a arte de escrever prompts que geram resultados excelentes.",
    lessons: [
      {
        id: "m3-aula-1",
        title: "O que é um bom prompt",
        introduction: "O prompt é tudo. É a diferença entre uma resposta inútil e uma resposta perfeita. Vamos entender o que faz um prompt funcionar.",
        sections: [
          {
            title: "Prompt é instrução, não pergunta",
            content: "Muita gente trata a IA como Google: faz perguntas curtas e espera respostas. Isso funciona, mas é o nível mais básico.\n\nUm prompt de verdade é uma instrução completa. É você dizendo exatamente o que quer, como quer e para que serve.\n\nA diferença:\n\n• Pergunta: \"O que é marketing digital?\"\n• Prompt: \"Explique marketing digital em 3 parágrafos, de forma simples, para alguém que nunca ouviu falar, focando em como isso pode ajudar um pequeno negócio a vender mais.\""
          },
          {
            title: "Os 4 elementos de um bom prompt",
            content: "Todo bom prompt tem:\n\n1. CONTEXTO: Quem você é, qual a situação, para que serve\n2. TAREFA: O que exatamente você quer que a IA faça\n3. FORMATO: Como você quer a resposta (texto, lista, tabela)\n4. RESTRIÇÕES: O que você NÃO quer, limites, regras",
            examples: [
              {
                title: "Exemplo prático",
                content: "CONTEXTO: Sou dono de uma loja de roupas femininas\nTAREFA: Escreva uma legenda para Instagram anunciando promoção de inverno\nFORMATO: Máximo 150 caracteres, com 3 emojis\nRESTRIÇÕES: Não use palavras como \"imperdível\" ou \"corra\""
              }
            ]
          },
          {
            title: "Clareza mata ambiguidade",
            content: "A IA não adivinha. Se você deixar espaço para interpretação, ela vai interpretar — e provavelmente não do jeito que você quer.\n\nSeja específico em:\n\n• Números (\"3 exemplos\", \"200 palavras\", \"5 tópicos\")\n• Tom (\"formal\", \"descontraído\", \"técnico\")\n• Público (\"para iniciantes\", \"para gestores\", \"para jovens\")\n• Objetivo (\"para vender\", \"para educar\", \"para entreter\")"
          },
          {
            title: "Dê exemplos quando possível",
            content: "Uma das formas mais eficientes de guiar a IA é dar exemplos.\n\n\"Quero um texto nesse estilo: [exemplo]\"\n\"A resposta deve seguir esse formato: [exemplo]\"\n\"Use um tom parecido com isso: [exemplo]\"\n\nExemplos são mais claros que descrições."
          }
        ],
        summary: [
          "Prompt é instrução completa, não pergunta simples",
          "Bons prompts têm contexto, tarefa, formato e restrições",
          "Seja específico em números, tom, público e objetivo",
          "Exemplos são mais claros que descrições"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Transforme essas perguntas em prompts completos: 1) \"Como melhorar vendas?\" 2) \"Escreve um post\" 3) \"Me dá ideias de conteúdo\". Use os 4 elementos aprendidos."
        }
      },
      {
        id: "m3-aula-2",
        title: "Estrutura de prompt",
        introduction: "Existe uma estrutura que funciona para quase qualquer situação. Vamos aprender e praticar.",
        sections: [
          {
            title: "A estrutura universal",
            content: "Use essa estrutura como base:\n\n[PAPEL] Aja como [tipo de especialista]\n[CONTEXTO] Eu preciso de [situação/necessidade]\n[TAREFA] Faça [ação específica]\n[FORMATO] Responda em [formato desejado]\n[REGRAS] Siga essas diretrizes: [restrições]\n\nNão precisa usar todas as partes sempre, mas quanto mais completo, melhor o resultado."
          },
          {
            title: "Exemplos da estrutura em ação",
            content: "Veja como aplicar:",
            examples: [
              {
                title: "Para criar conteúdo",
                content: "Aja como um redator de redes sociais com 10 anos de experiência.\nPreciso de conteúdo para promover meu curso de culinária.\nCrie 5 legendas para Instagram sobre receitas fáceis.\nFormato: legenda + 3 hashtags por post.\nRegras: tom leve e inspirador, máximo 100 palavras cada."
              },
              {
                title: "Para resolver problemas",
                content: "Aja como um consultor de negócios.\nTenho uma loja física e as vendas caíram 30% nos últimos 3 meses.\nAnalise possíveis causas e sugira 5 ações práticas para reverter.\nFormato: lista numerada com explicação breve de cada ação.\nRegras: foque em ações de baixo custo e resultado rápido."
              }
            ]
          },
          {
            title: "Ajustando a estrutura",
            content: "Você não precisa ser rígido. Adapte conforme a necessidade:\n\n• Para pedidos simples: contexto + tarefa é suficiente\n• Para pedidos complexos: use todos os elementos\n• Para conversas: comece simples e adicione detalhes conforme necessário\n\nO importante é dar informação suficiente para a IA entregar o que você precisa."
          },
          {
            title: "Templates prontos",
            content: "Crie seus próprios templates para situações que se repetem:\n\n• Template de post para Instagram\n• Template de e-mail profissional\n• Template de resumo de conteúdo\n• Template de brainstorm de ideias\n\nUma vez criado, você só troca as variáveis."
          }
        ],
        summary: [
          "Use a estrutura: Papel + Contexto + Tarefa + Formato + Regras",
          "Adapte a estrutura conforme a complexidade do pedido",
          "Crie templates para situações que se repetem",
          "Quanto mais contexto, melhor o resultado"
        ],
        checklist: {
          items: [
            "Defini um papel/expertise para a IA?",
            "Expliquei o contexto da minha necessidade?",
            "Deixei claro o que quero que ela faça?",
            "Especifiquei o formato de resposta?",
            "Incluí regras e restrições importantes?"
          ]
        }
      },
      {
        id: "m3-aula-3",
        title: "Prompts para estudo",
        introduction: "A IA pode ser seu professor particular 24 horas. Vamos ver como usar prompts para aprender melhor e mais rápido.",
        sections: [
          {
            title: "Aprendendo conceitos novos",
            content: "Quando você quer entender algo novo:\n\n• Peça explicações em diferentes níveis de complexidade\n• Use analogias do seu dia a dia\n• Peça exemplos práticos\n• Solicite que a IA verifique seu entendimento",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Explique o conceito de juros compostos de 3 formas:\n1. Como se eu tivesse 10 anos\n2. Como se eu fosse um adulto comum\n3. Como um especialista explicaria para outro especialista\n\nUse exemplos com números reais em cada explicação.\""
              }
            ]
          },
          {
            title: "Resumindo e organizando",
            content: "Quando você tem material para estudar:\n\n• Peça resumos com os pontos principais\n• Solicite esquemas e mapas mentais em texto\n• Peça para transformar em perguntas e respostas\n• Crie flashcards automaticamente",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Aqui está um capítulo do meu livro: [texto]\n\nFaça:\n1. Resumo de 5 linhas\n2. 5 pontos-chave em bullets\n3. 10 perguntas de revisão com respostas\n4. 3 exemplos práticos de aplicação\""
              }
            ]
          },
          {
            title: "Praticando e testando",
            content: "Use a IA para testar seu conhecimento:\n\n• Peça questões sobre o tema\n• Simule provas e avaliações\n• Peça feedback sobre suas respostas\n• Solicite correções e explicações de erros"
          },
          {
            title: "Conectando conhecimentos",
            content: "A IA pode ajudar a fazer conexões:\n\n• \"Como esse conceito se relaciona com [outro conceito]?\"\n• \"Onde mais posso aplicar isso?\"\n• \"Quais são os conceitos pré-requisitos que preciso entender?\"\n• \"O que geralmente confunde as pessoas sobre isso?\""
          }
        ],
        summary: [
          "Use IA para explicações em diferentes níveis de complexidade",
          "Peça resumos, esquemas e flashcards automaticamente",
          "Simule provas e peça feedback sobre respostas",
          "Faça conexões entre conceitos diferentes"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Escolha um conceito que você quer aprender melhor. Peça à IA para explicar de 3 formas diferentes, criar 5 perguntas de revisão e dar 3 exemplos de aplicação prática."
        }
      },
      {
        id: "m3-aula-4",
        title: "Prompts para trabalho",
        introduction: "No ambiente profissional, a IA pode economizar horas do seu dia. Vamos ver os melhores prompts para trabalho.",
        sections: [
          {
            title: "E-mails profissionais",
            content: "E-mails consomem tempo. Use IA para:\n\n• Escrever e-mails do zero\n• Responder e-mails de forma profissional\n• Tornar e-mails mais claros e diretos\n• Adaptar o tom conforme o destinatário",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Escreva um e-mail profissional para:\nDestinatário: Cliente que não respondeu há 1 semana\nObjetivo: Cobrar resposta educadamente sem parecer insistente\nTom: Cordial mas objetivo\nTamanho: Máximo 5 linhas\nIncluir: Referência ao assunto anterior e proposta de próximo passo\""
              }
            ]
          },
          {
            title: "Relatórios e documentos",
            content: "Agilize a criação de documentos:\n\n• Estruture relatórios a partir de dados soltos\n• Crie sumários executivos\n• Padronize formatos e linguagem\n• Revise e melhore textos existentes"
          },
          {
            title: "Reuniões e apresentações",
            content: "Prepare-se melhor:\n\n• Crie pautas de reunião organizadas\n• Prepare pontos de discussão\n• Resuma atas e próximos passos\n• Crie roteiros de apresentação",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Preciso apresentar os resultados do trimestre para a diretoria.\n\nDados: [seus números]\n\nCrie:\n1. Roteiro de 10 minutos\n2. 5 slides principais com bullets\n3. 3 perguntas que podem surgir com respostas sugeridas\n4. Conclusão forte e próximos passos\""
              }
            ]
          },
          {
            title: "Análise e tomada de decisão",
            content: "Use IA para pensar melhor:\n\n• Liste prós e contras de decisões\n• Analise cenários e riscos\n• Sugira alternativas não consideradas\n• Questione premissas e vieses"
          }
        ],
        summary: [
          "Automatize e-mails com prompts específicos",
          "Estruture relatórios e documentos mais rápido",
          "Prepare reuniões e apresentações com IA",
          "Use para análise de decisões importantes"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Pense em 3 tarefas profissionais que você faz toda semana. Crie um prompt para cada uma e teste. Guarde os que funcionarem melhor."
        }
      },
      {
        id: "m3-aula-5",
        title: "Prompts para conteúdo",
        introduction: "Criar conteúdo para redes sociais e blogs pode ser exaustivo. Vamos ver como usar prompts para manter a consistência sem perder qualidade.",
        sections: [
          {
            title: "Gerando ideias infinitas",
            content: "Nunca mais fique sem ideias:\n\n• Peça listas de temas baseados no seu nicho\n• Solicite variações de um tema central\n• Peça ideias baseadas em tendências\n• Use formatos diferentes para o mesmo assunto",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Sou nutricionista e crio conteúdo sobre alimentação saudável.\n\nMe dê:\n• 10 ideias de posts educativos\n• 10 ideias de posts de engajamento (perguntas, enquetes)\n• 10 ideias de posts com dicas práticas rápidas\n• 5 ideias de séries (conteúdo em partes)\""
              }
            ]
          },
          {
            title: "Escrevendo para diferentes plataformas",
            content: "Cada rede tem sua linguagem:\n\n• Instagram: Visual, legendas emocionais ou práticas, hashtags\n• LinkedIn: Profissional, storytelling, insights de carreira\n• Twitter/X: Direto, provocativo, threads\n• YouTube: Roteiros com ganchos fortes\n• Blog: SEO, profundidade, estrutura clara"
          },
          {
            title: "Adaptando tom e estilo",
            content: "Defina sua voz:\n\n• Especifique o tom desejado no prompt\n• Dê exemplos de conteúdos que você gosta\n• Peça para manter consistência entre posts\n• Revise e ajuste para soar como você",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Meu tom de voz é: direto, sem frescura, com humor sutil, como se estivesse conversando com um amigo.\n\nEscreva um post sobre [tema] seguindo esse tom. Nada de frases genéricas ou clichês motivacionais.\""
              }
            ]
          },
          {
            title: "Criando séries e sequências",
            content: "Conteúdo em série engaja mais:\n\n• Peça ideias de séries com episódios conectados\n• Crie desafios para seguidores\n• Desenvolva temas em partes (parte 1, 2, 3...)\n• Crie calendários temáticos"
          }
        ],
        summary: [
          "Gere listas de ideias infinitas com prompts específicos",
          "Adapte o conteúdo para cada plataforma",
          "Defina e mantenha seu tom de voz único",
          "Crie séries e sequências para maior engajamento"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Defina seu nicho e tom de voz em um parágrafo. Depois, peça à IA 30 ideias de posts para o próximo mês, divididos por tipo (educativo, engajamento, vendas)."
        }
      },
      {
        id: "m3-aula-6",
        title: "Prompts para vendas",
        introduction: "Comunicação persuasiva é essencial para vender. Vamos ver como usar IA para criar mensagens que convertem.",
        sections: [
          {
            title: "Estruturas de copy que funcionam",
            content: "Algumas estruturas clássicas:\n\n• AIDA: Atenção, Interesse, Desejo, Ação\n• PAS: Problema, Agitação, Solução\n• BAB: Before, After, Bridge (Antes, Depois, Ponte)\n\nVocê pode pedir para a IA usar qualquer uma dessas estruturas.",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Use a estrutura PAS para escrever um texto de vendas para meu curso de inglês online.\n\nProblema: Pessoas que tentam aprender inglês há anos e não conseguem.\nAgitação: Frustração, tempo perdido, oportunidades perdidas.\nSolução: Método prático focado em conversação real.\n\nTom: Empático mas direto. Máximo 200 palavras.\""
              }
            ]
          },
          {
            title: "Headlines e ganchos",
            content: "O início é o mais importante:\n\n• Peça várias opções de headline\n• Teste diferentes ângulos (curiosidade, benefício, medo)\n• Use números e especificidade\n• Foque no resultado, não no processo",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Me dê 10 headlines para vender um curso de Excel.\n\n5 focando no benefício (economia de tempo)\n3 focando na dor (perda de oportunidades)\n2 focando na curiosidade (segredo, método)\n\nTodas devem ter menos de 10 palavras.\""
              }
            ]
          },
          {
            title: "Superando objeções",
            content: "A IA pode ajudar a antecipar e responder objeções:\n\n• Liste as principais objeções do seu público\n• Crie respostas persuasivas para cada uma\n• Prepare FAQs de vendas\n• Desenvolva argumentos para cada objeção"
          },
          {
            title: "Call to Action efetivo",
            content: "O CTA (chamada para ação) precisa ser claro:\n\n• Peça opções de CTAs para diferentes contextos\n• Teste urgência vs. curiosidade\n• Adapte para o estágio do cliente\n• Mantenha simples e direto"
          }
        ],
        summary: [
          "Use estruturas como AIDA, PAS e BAB para organizar textos de vendas",
          "Peça múltiplas opções de headlines e teste",
          "Antecipe objeções e prepare respostas",
          "Crie CTAs claros e diretos"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Escolha um produto ou serviço seu. Peça à IA para criar uma página de vendas usando a estrutura PAS, com 10 headlines diferentes e 5 respostas para objeções comuns."
        }
      }
    ]
  },
  {
    id: "modulo-4",
    number: 4,
    title: "IA para Conteúdo",
    description: "Aprenda a criar conteúdo consistente e de qualidade usando IA como sua aliada.",
    lessons: [
      {
        id: "m4-aula-1",
        title: "Ideias infinitas",
        introduction: "O bloqueio criativo acabou. Com as técnicas certas, você nunca mais vai ficar sem ideias de conteúdo.",
        sections: [
          {
            title: "O método da multiplicação",
            content: "Uma ideia vira várias:\n\n1. Comece com um tema central\n2. Peça à IA para explorar ângulos diferentes\n3. Cada ângulo vira um conteúdo\n4. Cada conteúdo pode ser expandido ou fragmentado\n\nDe uma ideia, você tira 10. De 10, você tira 100.",
            examples: [
              {
                title: "Exemplo prático",
                content: "Tema: Produtividade\n\nÂngulos possíveis:\n• Produtividade para mães\n• Produtividade para quem trabalha de casa\n• Erros de produtividade\n• Mitos sobre produtividade\n• Produtividade sem app\n• Produtividade em 15 minutos\n• Produtividade para preguiçosos\n\nCada um vira um post, um vídeo, um artigo."
              }
            ]
          },
          {
            title: "Formatos que geram ideias",
            content: "Use esses formatos para multiplicar conteúdo:\n\n• Listas: \"5 formas de...\", \"10 erros de...\"\n• Comparações: \"X vs Y\", \"Antes e depois\"\n• Tutoriais: \"Como fazer...\", \"Passo a passo\"\n• Histórias: \"O dia em que...\", \"Quando eu descobri...\"\n• Perguntas: \"E se...?\", \"Por que...\"\n• Opiniões: \"O que ninguém fala sobre...\""
          },
          {
            title: "Usando tendências e atualidades",
            content: "Conecte seu tema a acontecimentos:\n\n• Notícias do momento\n• Memes e trends virais\n• Datas comemorativas\n• Lançamentos e novidades do seu mercado\n\nPeça à IA para conectar seu tema principal com eventos atuais."
          },
          {
            title: "Repositório de ideias",
            content: "Crie um banco de ideias:\n\n1. Gere 30-50 ideias de uma vez\n2. Classifique por tipo (educativo, engajamento, vendas)\n3. Guarde em um documento ou app\n4. Vá usando e reabastecendo\n\nNunca mais comece do zero."
          }
        ],
        summary: [
          "Uma ideia central gera dezenas de conteúdos",
          "Use formatos variados para multiplicar possibilidades",
          "Conecte seu conteúdo com tendências atuais",
          "Mantenha um repositório de ideias sempre abastecido"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Pegue seu tema principal e peça à IA 50 ideias de conteúdo, divididas por formato (listas, tutoriais, histórias, perguntas). Guarde em um documento para usar durante o mês."
        }
      },
      {
        id: "m4-aula-2",
        title: "Roteiros para vídeos",
        introduction: "Vídeos são o formato mais consumido. Vamos aprender a criar roteiros que prendem a atenção e entregam valor.",
        sections: [
          {
            title: "A estrutura básica de roteiro",
            content: "Todo bom vídeo tem:\n\n1. GANCHO (0-3 segundos): Prende atenção imediatamente\n2. PROMESSA (3-10 segundos): Diz o que a pessoa vai ganhar\n3. CONTEÚDO (corpo): Entrega o prometido\n4. CTA (final): Diz o que fazer depois\n\nSe você perder a pessoa no gancho, nada mais importa."
          },
          {
            title: "Criando ganchos poderosos",
            content: "Tipos de gancho que funcionam:\n\n• Pergunta provocativa: \"Você sabia que 90% das pessoas fazem isso errado?\"\n• Afirmação contrária: \"Esqueça tudo que você ouviu sobre [tema]\"\n• Resultado impactante: \"Em 7 dias eu consegui [resultado]\"\n• Identificação: \"Se você é [característica], esse vídeo é pra você\"\n• Curiosidade: \"Vou te mostrar algo que mudou minha forma de [ação]\"",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Crie 10 ganchos para um vídeo sobre como usar IA para escrever e-mails mais rápido.\n\nDivida em:\n3 ganchos de pergunta\n3 ganchos de afirmação contrária\n2 ganchos de resultado\n2 ganchos de curiosidade\n\nMáximo 15 palavras cada.\""
              }
            ]
          },
          {
            title: "Organizando o conteúdo principal",
            content: "O corpo do vídeo precisa ser organizado:\n\n• Divida em passos claros (passo 1, 2, 3)\n• Use transições (\"agora que você sabe X, vamos para Y\")\n• Dê exemplos concretos em cada ponto\n• Mantenha cada parte curta e focada\n• Recapitule antes de avançar"
          },
          {
            title: "Fechamento que converte",
            content: "O final precisa ter propósito:\n\n• Resuma o aprendizado em uma frase\n• Diga exatamente o que fazer agora\n• Seja específico no CTA\n• Crie senso de próximo passo"
          }
        ],
        summary: [
          "Use a estrutura: gancho, promessa, conteúdo, CTA",
          "O gancho é o momento mais importante — invista nele",
          "Organize o conteúdo em passos claros e concretos",
          "Termine com CTA específico e direcionado"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Escolha um tema para um vídeo de 3 minutos. Peça à IA para criar um roteiro completo com gancho, promessa, 3 pontos principais com exemplos e CTA final."
        }
      },
      {
        id: "m4-aula-3",
        title: "Legendas humanas",
        introduction: "O texto gerado por IA muitas vezes tem 'cara de IA'. Vamos aprender a humanizar e deixar natural.",
        sections: [
          {
            title: "Os sinais de texto artificial",
            content: "Textos de IA costumam ter:\n\n• Frases muito perfeitas e genéricas\n• Vocabulário rebuscado demais\n• Estruturas repetitivas\n• Falta de opinião e personalidade\n• Excesso de adjetivos vazios\n• Conclusões óbvias"
          },
          {
            title: "Técnicas de humanização",
            content: "Para deixar mais natural:\n\n1. Adicione imperfeições propositais (contrações, pausas)\n2. Use expressões do dia a dia\n3. Inclua opiniões pessoais\n4. Quebre regras gramaticais quando fizer sentido\n5. Adicione humor ou ironia quando apropriado\n6. Use referências culturais e temporais",
            examples: [
              {
                title: "Exemplo prático",
                content: "IA original: \"A utilização de inteligência artificial pode proporcionar benefícios significativos para a otimização de processos empresariais.\"\n\nHumanizado: \"Olha, IA não é mágica. Mas economiza um tempo absurdo em tarefas chatas. E tempo, a gente sabe, é dinheiro.\""
              }
            ]
          },
          {
            title: "Prompts para humanizar",
            content: "Peça diretamente:\n\n• \"Reescreva de forma mais conversacional\"\n• \"Escreva como se fosse uma conversa entre amigos\"\n• \"Adicione sua opinião pessoal sobre isso\"\n• \"Use expressões que uma pessoa comum usaria\"\n• \"Quebre algumas regras gramaticais para soar natural\"",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Reescreva esse texto como se eu estivesse contando para um amigo no WhatsApp, de forma natural e com meu jeito de falar. Pode usar gírias leves e expressões comuns. Não precisa ser perfeito gramaticalmente.\""
              }
            ]
          },
          {
            title: "Sua voz é sua marca",
            content: "Desenvolva um estilo próprio:\n\n• Identifique expressões que você usa naturalmente\n• Crie um documento com seu \"tom de voz\"\n• Revise sempre antes de publicar\n• Com o tempo, a IA aprende seu estilo"
          }
        ],
        summary: [
          "Identifique os sinais de texto artificial",
          "Use técnicas de humanização: imperfeições, humor, opinião",
          "Peça diretamente para a IA reescrever de forma natural",
          "Desenvolva e documente seu tom de voz único"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Pegue um texto gerado por IA e identifique 5 sinais de artificialidade. Depois, peça para reescrever de forma mais natural e compare os resultados."
        }
      },
      {
        id: "m4-aula-4",
        title: "Calendário com IA",
        introduction: "Consistência é o segredo de qualquer estratégia de conteúdo. Vamos usar IA para criar calendários eficientes.",
        sections: [
          {
            title: "Planejamento mensal estratégico",
            content: "Um bom calendário considera:\n\n• Datas importantes do mês\n• Equilíbrio entre tipos de conteúdo\n• Frequência sustentável\n• Temas que se conectam\n• Espaço para conteúdo espontâneo",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Crie um calendário de conteúdo para Instagram para o mês de março.\n\nMeu nicho: Finanças pessoais\nFrequência: 4 posts por semana (seg, qua, sex, dom)\n\nIncluir:\n• Datas comemorativas relevantes\n• 40% conteúdo educativo\n• 30% engajamento\n• 20% vendas indiretas\n• 10% bastidores/humanização\n\nFormato: tabela com data, tipo de post, tema e legenda sugerida.\""
              }
            ]
          },
          {
            title: "Criando pilares de conteúdo",
            content: "Organize seu conteúdo em pilares:\n\n1. Identifique 3-5 temas principais do seu nicho\n2. Cada pilar vira uma \"editoria\"\n3. Distribua os pilares ao longo da semana/mês\n4. Isso cria variedade com consistência"
          },
          {
            title: "Planejamento semanal prático",
            content: "Divida por tipo de dia:\n\n• Segunda: Conteúdo motivacional/início de semana\n• Terça: Tutorial/educativo\n• Quarta: Engajamento/perguntas\n• Quinta: Dicas rápidas\n• Sexta: Leve/descontraído\n• Sábado/Domingo: Reflexão ou descanso\n\nAdapte para sua realidade e audiência."
          },
          {
            title: "Automatizando com templates",
            content: "Crie templates reutilizáveis:\n\n• Template de calendário mensal\n• Templates de post para cada pilar\n• Banco de legendas prontas\n• Lista de hashtags por tema\n\nIsso reduz o trabalho de criar do zero todo mês."
          }
        ],
        summary: [
          "Planeje mensalmente considerando datas e tipos de conteúdo",
          "Organize em pilares/editorias temáticas",
          "Distribua tipos de conteúdo ao longo da semana",
          "Crie templates para agilizar o processo"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Defina 4 pilares de conteúdo para seu nicho. Peça à IA para criar um calendário mensal com 16 posts (4 por semana), distribuindo os pilares e incluindo legendas sugeridas."
        }
      },
      {
        id: "m4-aula-5",
        title: "Reaproveitamento de conteúdo",
        introduction: "Criar conteúdo dá trabalho. Vamos aprender a multiplicar o valor de cada conteúdo que você produz.",
        sections: [
          {
            title: "A filosofia do reaproveitamento",
            content: "Um conteúdo bem feito pode virar muitos:\n\n• Um artigo vira 10 posts\n• Um vídeo longo vira 5 cortes\n• Um podcast vira artigo, posts e quotes\n• Uma apresentação vira carrossel\n\nA ideia é extrair o máximo de valor de cada esforço."
          },
          {
            title: "De longo para curto",
            content: "Transforme conteúdos longos em peças curtas:\n\n• Artigo → Posts com pontos principais\n• Vídeo → Cortes para Reels/Shorts\n• Podcast → Quotes visuais\n• Webinar → Mini tutoriais\n• E-book → Série de posts",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Tenho esse artigo de blog: [artigo]\n\nTransforme em:\n• 5 posts de Instagram (legenda + ideia visual)\n• 3 tweets/threads\n• 1 carrossel de 8 slides\n• 10 quotes para stories\n• 3 ganchos para Reels\""
              }
            ]
          },
          {
            title: "De curto para longo",
            content: "Expanda conteúdos curtos:\n\n• Post viral → Artigo completo\n• Pergunta frequente → Tutorial\n• Comentário interessante → Vídeo explicativo\n• Stories → Carrossel aprofundado"
          },
          {
            title: "Entre formatos diferentes",
            content: "Transforme entre mídias:\n\n• Texto → Áudio (podcast)\n• Áudio → Texto (transcrição)\n• Texto → Vídeo (avatar ou animação)\n• Imagem → Carrossel explicativo\n• Dados → Infográfico\n\nUse IA para fazer essas conversões rapidamente."
          }
        ],
        summary: [
          "Um bom conteúdo pode virar muitos formatos",
          "Transforme conteúdos longos em peças curtas e vice-versa",
          "Converta entre mídias diferentes (texto, áudio, vídeo)",
          "Maximize o valor de cada esforço de criação"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Pegue seu melhor conteúdo (post, artigo, vídeo) e peça à IA para transformar em pelo menos 5 formatos diferentes para outras plataformas."
        }
      }
    ]
  },
  {
    id: "modulo-5",
    number: 5,
    title: "IA para Negócios",
    description: "Use IA como aliada estratégica para crescer seu negócio.",
    lessons: [
      {
        id: "m5-aula-1",
        title: "IA como assistente de negócios",
        introduction: "A IA pode ser seu braço direito nos negócios. Vamos ver como usar ela de forma estratégica.",
        sections: [
          {
            title: "Mudando a mentalidade",
            content: "Pare de ver IA como ferramenta isolada. Veja como assistente que:\n\n• Está disponível 24 horas\n• Não reclama de refazer trabalho\n• Processa informação muito mais rápido que você\n• Não esquece o que você pediu (na mesma conversa)\n• Pode assumir tarefas repetitivas"
          },
          {
            title: "Tarefas estratégicas para delegar",
            content: "Use IA para:\n\n• Pesquisa de mercado inicial\n• Análise de concorrentes\n• Brainstorm de estratégias\n• Estruturação de processos\n• Criação de documentos padrão\n• Análise de dados e tendências",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Aja como consultor de negócios.\n\nMeu negócio: Loja de roupas femininas online\nFaturamento: R$ 30.000/mês\nDesafio: Crescer 50% nos próximos 6 meses\n\nAnalise:\n1. Principais alavancas de crescimento\n2. Riscos e obstáculos prováveis\n3. 5 ações prioritárias com prazo sugerido\n4. Métricas para acompanhar\""
              }
            ]
          },
          {
            title: "Criando processos com IA",
            content: "Documente e padronize:\n\n• Peça para criar checklists de processos\n• Desenvolva scripts de atendimento\n• Crie templates de documentos\n• Estruture fluxos de trabalho\n• Padronize comunicações recorrentes"
          },
          {
            title: "Tomada de decisão assistida",
            content: "Use IA para pensar melhor:\n\n• Peça análise de prós e contras\n• Solicite cenários possíveis\n• Questione suas premissas\n• Explore alternativas não consideradas\n• Valide sua lógica"
          }
        ],
        summary: [
          "Veja IA como assistente estratégico, não ferramenta isolada",
          "Delegue pesquisa, análise e estruturação de processos",
          "Crie documentação e padronização com ajuda da IA",
          "Use para melhorar tomada de decisão"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Descreva seu negócio e seu maior desafio atual. Peça à IA para analisar como um consultor e sugerir 5 ações prioritárias com justificativa."
        }
      },
      {
        id: "m5-aula-2",
        title: "Criação de ofertas",
        introduction: "Uma boa oferta é o coração de qualquer venda. Vamos usar IA para criar ofertas irresistíveis.",
        sections: [
          {
            title: "O que faz uma oferta funcionar",
            content: "Uma boa oferta tem:\n\n1. PROMESSA clara: O que a pessoa ganha\n2. PROVA: Por que acreditar em você\n3. PREÇO justo: Valor percebido maior que o custo\n4. PROPOSTA única: Por que você e não outro\n5. PRAZO: Urgência ou escassez"
          },
          {
            title: "Construindo a promessa",
            content: "A promessa precisa ser específica:\n\n• \"Aprenda inglês\" é fraco\n• \"Fale inglês em 90 dias conversando com nativos\" é forte\n\nUse IA para refinar sua promessa:",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Meu produto: Curso de confeitaria\nPúblico: Mães que querem renda extra em casa\n\nMe ajude a criar 5 versões de promessa principal:\n• Focando no resultado financeiro\n• Focando na flexibilidade de horário\n• Focando na autonomia/independência\n• Focando na facilidade de começar\n• Focando no prazer de fazer algo próprio\""
              }
            ]
          },
          {
            title: "Estruturando bônus e garantias",
            content: "Bônus aumentam valor percebido:\n\n• Devem complementar a oferta principal\n• Precisam ter valor claro e específico\n• Não podem parecer \"enchimento\"\n\nGarantia remove risco:\n\n• Quanto maior a garantia, maior a confiança\n• Seja específico no que está garantindo"
          },
          {
            title: "Testando e refinando",
            content: "Use IA para testar sua oferta:\n\n• Peça para identificar objeções\n• Solicite sugestões de melhoria\n• Simule perguntas de clientes\n• Compare com ofertas concorrentes"
          }
        ],
        summary: [
          "Boa oferta tem promessa, prova, preço, proposta única e prazo",
          "Refine sua promessa para ser específica e atraente",
          "Use bônus que complementam e garantias que removem risco",
          "Teste e refine com ajuda da IA"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Descreva seu produto/serviço e peça à IA para estruturar uma oferta completa com promessa, 3 bônus relevantes, garantia e 5 possíveis objeções com respostas."
        }
      },
      {
        id: "m5-aula-3",
        title: "Textos que vendem",
        introduction: "Copywriting é a habilidade de escrever textos que levam à ação. Vamos usar IA para criar copy efetivo.",
        sections: [
          {
            title: "Princípios de copy que funcionam",
            content: "Copy efetiva:\n\n• Fala da dor antes da solução\n• Usa linguagem do público\n• É específica, não genérica\n• Cria desejo antes de pedir ação\n• Remove objeções antes que apareçam"
          },
          {
            title: "Páginas de vendas",
            content: "Estrutura que converte:\n\n1. Headline que prende\n2. Identificação do problema\n3. Agitação da dor\n4. Apresentação da solução\n5. Benefícios específicos\n6. Prova social\n7. Oferta e bônus\n8. Garantia\n9. CTA claro",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Crie uma página de vendas para meu serviço de consultoria financeira.\n\nPúblico: Profissionais liberais que ganham bem mas não sobra dinheiro\nProduto: 3 sessões de consultoria + planilha personalizada\nPreço: R$ 997\nDiferencial: Método prático sem blá-blá-blá financeiro\n\nEscreva cada seção da página seguindo a estrutura de copy.\""
              }
            ]
          },
          {
            title: "E-mails de vendas",
            content: "Sequências que funcionam:\n\n• E-mail 1: História + identificação\n• E-mail 2: Problema + consequências\n• E-mail 3: Solução + prova\n• E-mail 4: Oferta + benefícios\n• E-mail 5: Urgência + última chance"
          },
          {
            title: "Mensagens de WhatsApp",
            content: "Vendas por WhatsApp precisam ser:\n\n• Curtas e diretas\n• Personalizadas\n• Com pergunta para gerar resposta\n• Com próximo passo claro\n• Sem spam ou pressão excessiva"
          }
        ],
        summary: [
          "Copy fala da dor, usa linguagem do público e é específica",
          "Páginas de vendas seguem estrutura testada",
          "E-mails de vendas funcionam em sequência estratégica",
          "WhatsApp precisa ser direto e personalizado"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Escolha um produto seu e peça à IA para criar: 1 headline poderosa, 3 e-mails de uma sequência de vendas e 5 mensagens de WhatsApp para diferentes momentos do funil."
        }
      },
      {
        id: "m5-aula-4",
        title: "Atendimento com IA",
        introduction: "Atendimento consome tempo. Vamos ver como usar IA para padronizar e agilizar sem perder a humanização.",
        sections: [
          {
            title: "Mapeando situações recorrentes",
            content: "Primeiro, identifique:\n\n• Perguntas que você recebe sempre\n• Objeções mais comuns\n• Situações de suporte frequentes\n• Dúvidas sobre seus produtos/serviços\n\nEssas são as que você vai automatizar primeiro."
          },
          {
            title: "Criando banco de respostas",
            content: "Monte seu FAQ inteligente:\n\n• Crie respostas para cada situação comum\n• Mantenha tom consistente com sua marca\n• Inclua variações para não parecer robótico\n• Atualize conforme surgem novas dúvidas",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Sou dono de uma loja de suplementos.\n\nCrie respostas prontas para:\n1. Cliente perguntando sobre prazo de entrega\n2. Cliente com dúvida sobre qual produto escolher\n3. Cliente reclamando de atraso\n4. Cliente pedindo desconto\n5. Cliente perguntando sobre troca/devolução\n\nCada resposta deve ter 3 versões com tons levemente diferentes.\""
              }
            ]
          },
          {
            title: "Scripts de atendimento",
            content: "Crie fluxos para sua equipe:\n\n• Abertura de conversa\n• Perguntas de qualificação\n• Apresentação de soluções\n• Tratamento de objeções\n• Fechamento e próximos passos"
          },
          {
            title: "Humanizando o automático",
            content: "Para não parecer robô:\n\n• Personalize com nome do cliente\n• Adicione detalhes específicos da situação\n• Varie as respostas\n• Inclua toques humanos (emojis apropriados, expressões naturais)\n• Saiba quando parar de automatizar e assumir pessoalmente"
          }
        ],
        summary: [
          "Mapeie situações recorrentes de atendimento",
          "Crie banco de respostas com variações",
          "Desenvolva scripts estruturados para equipe",
          "Humanize com personalização e toques naturais"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Liste as 10 perguntas mais frequentes que você recebe. Peça à IA para criar 3 variações de resposta para cada uma, mantendo seu tom de voz."
        }
      },
      {
        id: "m5-aula-5",
        title: "Funis simples",
        introduction: "Funil de vendas não precisa ser complicado. Vamos ver como criar funis simples e eficientes com ajuda da IA.",
        sections: [
          {
            title: "O que é um funil de verdade",
            content: "Funil é o caminho que o cliente percorre:\n\n1. DESCOBERTA: Pessoa encontra você\n2. INTERESSE: Pessoa quer saber mais\n3. CONSIDERAÇÃO: Pessoa avalia sua solução\n4. DECISÃO: Pessoa decide comprar\n5. AÇÃO: Pessoa efetua a compra\n\nSeu trabalho é facilitar cada etapa."
          },
          {
            title: "Funil mínimo viável",
            content: "O funil mais simples que funciona:\n\n1. Conteúdo que atrai (post, vídeo, anúncio)\n2. Página de captura (coleta e-mail ou WhatsApp)\n3. Sequência de nutrição (e-mails ou mensagens)\n4. Oferta (página de vendas)\n5. Compra\n\nComeçe simples e vá sofisticando.",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Me ajude a criar um funil simples para vender meu curso de fotografia para iniciantes.\n\nEtapa 1: Post de Instagram que chama atenção\nEtapa 2: Link para baixar 'Guia Grátis: 10 Erros de Iniciante'\nEtapa 3: 5 e-mails de nutrição\nEtapa 4: Oferta do curso\n\nCrie o conteúdo de cada etapa.\""
              }
            ]
          },
          {
            title: "Métricas que importam",
            content: "Acompanhe:\n\n• Taxa de clique no conteúdo inicial\n• Taxa de conversão na captura\n• Taxa de abertura dos e-mails\n• Taxa de clique para a oferta\n• Taxa de conversão em vendas\n\nMelhore uma métrica de cada vez."
          },
          {
            title: "Otimizando com IA",
            content: "Use IA para melhorar cada etapa:\n\n• Teste diferentes headlines\n• Varie os ganchos dos e-mails\n• Refine a copy da página de vendas\n• Crie variações de CTA\n• Analise o que pode estar falhando"
          }
        ],
        summary: [
          "Funil é o caminho do cliente da descoberta à compra",
          "Comece com funil mínimo: conteúdo, captura, nutrição, oferta",
          "Acompanhe métricas de cada etapa",
          "Use IA para testar e otimizar continuamente"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Desenhe seu funil mínimo viável. Peça à IA para criar o conteúdo de cada etapa: 1 post de atração, 1 isca digital, 5 e-mails de nutrição e 1 página de vendas simplificada."
        }
      }
    ]
  },
  {
    id: "modulo-6",
    number: 6,
    title: "Produtividade com IA",
    description: "Organize sua vida e trabalho de forma mais inteligente.",
    lessons: [
      {
        id: "m6-aula-1",
        title: "Organização pessoal",
        introduction: "A desorganização rouba tempo e energia. Vamos usar IA para criar sistemas de organização que funcionam para você.",
        sections: [
          {
            title: "Diagnóstico: onde você perde tempo?",
            content: "Antes de organizar, entenda:\n\n• Quais tarefas mais consomem seu tempo?\n• Onde você procrastina mais?\n• O que você sempre esquece?\n• Quais decisões te travam?\n\nUse IA para analisar sua rotina e identificar gargalos.",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Analise minha rotina atual:\n[Descreva seu dia típico]\n\nIdentifique:\n• 3 principais desperdícios de tempo\n• 3 tarefas que poderiam ser automatizadas\n• 3 decisões que poderiam virar regras fixas\n• Sugestões de melhoria para cada ponto\""
              }
            ]
          },
          {
            title: "Criando sistemas simples",
            content: "Sistemas eficientes são:\n\n• Simples de manter\n• Flexíveis para imprevistos\n• Baseados em regras claras\n• Revisados regularmente\n\nPeça à IA para criar sistemas baseados na sua realidade."
          },
          {
            title: "Rotinas que funcionam",
            content: "Estruture seu dia:\n\n• Rotina matinal: Preparação para o dia\n• Blocos de trabalho: Tarefas focadas\n• Intervalos programados: Descanso real\n• Revisão diária: O que foi feito, o que ficou\n• Encerramento: Preparação para o próximo dia"
          },
          {
            title: "Listas e priorizações",
            content: "Use IA para gerenciar tarefas:\n\n• Transforme pensamentos soltos em listas organizadas\n• Priorize usando critérios claros (urgência, impacto)\n• Divida projetos grandes em etapas pequenas\n• Defina prazos realistas"
          }
        ],
        summary: [
          "Diagnostique onde você perde tempo antes de organizar",
          "Crie sistemas simples e baseados em regras claras",
          "Estruture rotinas para diferentes momentos do dia",
          "Use IA para gerenciar e priorizar tarefas"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Descreva seu dia típico para a IA e peça uma análise com 5 sugestões de melhoria na sua organização pessoal, considerando seu estilo de vida e trabalho."
        }
      },
      {
        id: "m6-aula-2",
        title: "Planejamento semanal",
        introduction: "Uma boa semana não acontece por acaso. Vamos criar um sistema de planejamento semanal prático e sustentável.",
        sections: [
          {
            title: "A revisão semanal",
            content: "Todo domingo (ou segunda cedo):\n\n1. Revise a semana que passou\n   • O que funcionou?\n   • O que não funcionou?\n   • O que ficou pendente?\n\n2. Planeje a semana que vem\n   • Quais são as prioridades?\n   • Quais compromissos estão fixos?\n   • O que precisa de preparação?"
          },
          {
            title: "Distribuindo tarefas nos dias",
            content: "Algumas diretrizes:\n\n• Segunda: Tarefas que exigem mais energia\n• Terça/Quarta: Produção pesada\n• Quinta: Reuniões e interações\n• Sexta: Finalização e organização\n• Fim de semana: Descanso + revisão",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Tenho essas tarefas para a semana:\n[Liste suas tarefas]\n\nMeus compromissos fixos:\n[Liste reuniões e horários bloqueados]\n\nMinha energia é melhor pela manhã.\nPreciso de 1 hora de exercício 3x por semana.\n\nCrie um cronograma semanal distribuindo tudo de forma realista.\""
              }
            ]
          },
          {
            title: "Blocos de tempo",
            content: "Agrupe tarefas similares:\n\n• Bloco de comunicação: E-mails, mensagens\n• Bloco de criação: Conteúdo, textos\n• Bloco de reuniões: Calls, encontros\n• Bloco de administração: Finanças, organização\n\nAlternar entre tipos de tarefa desperdiça energia."
          },
          {
            title: "Espaço para imprevistos",
            content: "Não planeje 100% do tempo:\n\n• Reserve 20-30% para imprevistos\n• Tenha tarefas \"bônus\" para quando sobrar tempo\n• Flexibilize quando necessário sem culpa\n• Reajuste durante a semana se preciso"
          }
        ],
        summary: [
          "Faça revisão semanal todo domingo ou segunda",
          "Distribua tarefas considerando sua energia",
          "Use blocos de tempo para tarefas similares",
          "Reserve espaço para imprevistos"
        ],
        checklist: {
          items: [
            "Revisei a semana passada?",
            "Listei as prioridades da semana?",
            "Distribuí tarefas nos dias certos?",
            "Criei blocos de tempo?",
            "Deixei espaço para imprevistos?"
          ]
        }
      },
      {
        id: "m6-aula-3",
        title: "Decisão com IA",
        introduction: "Decisões difíceis nos travam. Vamos usar IA como parceira para pensar melhor e decidir com mais clareza.",
        sections: [
          {
            title: "Por que decisões nos travam",
            content: "Ficamos paralisados quando:\n\n• Temos muitas opções\n• Não temos informação suficiente\n• O risco parece alto\n• Estamos emocionalmente envolvidos\n• Não sabemos por onde começar a analisar"
          },
          {
            title: "Usando IA para estruturar decisões",
            content: "Peça ajuda para organizar o pensamento:\n\n• Liste todas as opções\n• Analise prós e contras de cada uma\n• Identifique critérios de decisão\n• Pese cada critério por importância\n• Simule cenários possíveis",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Preciso decidir entre:\nOpção A: Continuar no emprego atual\nOpção B: Aceitar proposta de outra empresa\nOpção C: Começar meu negócio próprio\n\nMe ajude a analisar:\n1. Prós e contras de cada opção\n2. Riscos envolvidos\n3. O que eu precisaria para cada cenário funcionar\n4. Perguntas que eu deveria me fazer antes de decidir\n5. Sua recomendação baseada nas informações\""
              }
            ]
          },
          {
            title: "Questionando premissas",
            content: "Use IA para desafiar seu pensamento:\n\n• \"Que premissas estou assumindo que podem estar erradas?\"\n• \"O que eu estaria ignorando nessa análise?\"\n• \"Se eu estivesse aconselhando um amigo, o que diria?\"\n• \"Qual seria a decisão se eu não tivesse medo?\""
          },
          {
            title: "Tomando a decisão",
            content: "No final, você decide. A IA só clareia o caminho.\n\n• Use a análise como base, não como muleta\n• Confie na sua intuição depois de pensar bem\n• Aceite que decisões sempre têm incerteza\n• Uma decisão tomada é melhor que indecisão eterna"
          }
        ],
        summary: [
          "Decisões travam por excesso de opções ou medo de errar",
          "Use IA para estruturar prós, contras e cenários",
          "Questione suas premissas e vieses",
          "A decisão final é sua — IA só clareia o caminho"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Escolha uma decisão que você está adiando. Descreva as opções para a IA e peça uma análise completa com prós, contras, riscos e recomendação."
        }
      }
    ]
  },
  {
    id: "modulo-7",
    number: 7,
    title: "IA como Renda Extra",
    description: "Transforme suas habilidades com IA em fonte de renda.",
    lessons: [
      {
        id: "m7-aula-1",
        title: "Serviços com IA",
        introduction: "Você pode ganhar dinheiro oferecendo serviços que usam IA. Vamos ver o que é possível vender.",
        sections: [
          {
            title: "O que você pode oferecer",
            content: "Serviços que clientes pagam:\n\n• Criação de conteúdo (posts, artigos, roteiros)\n• Gerenciamento de redes sociais com IA\n• Copywriting e textos de vendas\n• Criação de imagens e artes\n• Organização e automação de processos\n• Pesquisa e relatórios\n• Transcrição e resumos\n• Tradução e adaptação de conteúdo"
          },
          {
            title: "Nichos que pagam bem",
            content: "Alguns mercados valorizam mais:\n\n• Marketing digital para pequenas empresas\n• E-commerce e vendas online\n• Profissionais liberais (médicos, advogados)\n• Coaches e mentores\n• Produtores de conteúdo\n• Startups e negócios novos",
            examples: [
              {
                title: "Exemplo prático",
                content: "Serviço: Pacote de conteúdo mensal para Instagram\nO que inclui: 20 posts (arte + legenda), 8 stories, 4 roteiros de Reels\nPara quem: Donos de restaurantes\nPreço médio: R$ 1.500 - 3.000/mês\nTempo com IA: ~10-15 horas/mês"
              }
            ]
          },
          {
            title: "Serviços mais simples para começar",
            content: "Se está começando:\n\n• Transcrição de vídeos\n• Resumos de conteúdo\n• Criação de posts simples\n• Legendas para vídeos\n• Organização de informações\n\nÉ mais fácil de vender e entregar."
          },
          {
            title: "Serviços mais complexos e lucrativos",
            content: "Com mais experiência:\n\n• Estratégia de conteúdo completa\n• Funis de vendas automatizados\n• Consultorias de produtividade com IA\n• Treinamentos para equipes\n• Criação de processos e automações"
          }
        ],
        summary: [
          "Vários serviços podem ser oferecidos usando IA",
          "Alguns nichos pagam melhor que outros",
          "Comece simples e evolua para serviços mais complexos",
          "O valor está na entrega, não na ferramenta"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Liste 3 serviços que você poderia oferecer usando IA, considerando suas habilidades atuais. Para cada um, defina: para quem é, o que inclui, quanto tempo levaria e quanto poderia cobrar."
        }
      },
      {
        id: "m7-aula-2",
        title: "Como cobrar",
        introduction: "Definir preço é uma das partes mais difíceis. Vamos ver como precificar seus serviços de forma justa e lucrativa.",
        sections: [
          {
            title: "Modelos de precificação",
            content: "Você pode cobrar por:\n\n• PROJETO: Preço fechado por entrega\n• HORA: Valor por hora trabalhada\n• PACOTE: Conjunto de entregas por mês\n• RETORNO: Porcentagem do resultado gerado\n\nCada modelo tem vantagens e desvantagens."
          },
          {
            title: "Calculando seu preço",
            content: "Base para calcular:\n\n1. Quanto você quer ganhar por mês?\n2. Quantas horas pode trabalhar?\n3. Qual seu custo operacional?\n4. Quanto tempo cada serviço leva?\n\nDivida o quanto quer ganhar pelo tempo que tem. Esse é seu piso.",
            examples: [
              {
                title: "Exemplo prático",
                content: "Meta: R$ 6.000/mês\nHoras disponíveis: 100 horas/mês\nCusto mínimo por hora: R$ 60\n\nSe um projeto leva 10 horas:\nPreço mínimo: R$ 600\n\nMas você adiciona:\n• Margem de negociação: +20%\n• Valor percebido pelo cliente: +30%\n• Experiência e diferencial: +20%\n\nPreço real: R$ 1.020"
              }
            ]
          },
          {
            title: "Não venda tempo, venda resultado",
            content: "O cliente não quer horas de trabalho. Quer resultado.\n\n• Não é \"5 horas de criação de conteúdo\"\n• É \"20 posts prontos para publicar\"\n\n• Não é \"consultoria de 1 hora\"\n• É \"estratégia de conteúdo para 30 dias\"\n\nQuando você vende resultado, pode cobrar mais."
          },
          {
            title: "Aumentando valor percebido",
            content: "Para cobrar mais:\n\n• Especialize em um nicho\n• Mostre resultados anteriores\n• Ofereça garantias\n• Crie pacotes com bônus\n• Posicione-se como especialista, não como \"faz tudo\""
          }
        ],
        summary: [
          "Escolha modelo de precificação que faz sentido",
          "Calcule preço base considerando tempo e custos",
          "Venda resultado, não horas de trabalho",
          "Aumente valor percebido com especialização e posicionamento"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Calcule o preço de um serviço que você poderia oferecer. Use a fórmula: (meta mensal / horas disponíveis) x horas do projeto + margem de valor agregado."
        }
      },
      {
        id: "m7-aula-3",
        title: "Onde encontrar clientes",
        introduction: "Ter habilidade não basta. Você precisa de clientes. Vamos ver onde encontrá-los.",
        sections: [
          {
            title: "Clientes próximos",
            content: "Comece por quem já te conhece:\n\n• Amigos e família (e contatos deles)\n• Ex-colegas de trabalho\n• Pessoas que te seguem nas redes\n• Grupos do WhatsApp que você participa\n• Comunidades online que você frequenta\n\nDivulgue o que você faz. Peça indicações."
          },
          {
            title: "Redes sociais como vitrine",
            content: "Mostre seu trabalho:\n\n• Poste exemplos do que você cria\n• Compartilhe antes/depois\n• Dê dicas gratuitas relacionadas ao serviço\n• Conte histórias de resultados\n• Seja presente e responda comentários",
            examples: [
              {
                title: "Exemplo prático",
                content: "Post 1: \"Transformei esse texto genérico em copy que vende. Veja a diferença:\"\n[Antes e depois]\n\nPost 2: \"5 erros que matam suas legendas de Instagram\"\n[Dica gratuita]\n\nPost 3: \"Cliente me pediu 30 posts. Entreguei em 2 dias usando IA.\"\n[Resultado]"
              }
            ]
          },
          {
            title: "Plataformas de freelancer",
            content: "Opções para começar:\n\n• Workana\n• 99Freelas\n• GetNinjas\n• Fiverr (internacional)\n• Upwork (internacional)\n\nCrie perfil profissional, com portfólio e preços claros."
          },
          {
            title: "Abordagem direta",
            content: "Vá atrás de clientes ativamente:\n\n• Identifique negócios que precisam do seu serviço\n• Mande mensagem oferecendo ajuda específica\n• Mostre como você resolveria um problema deles\n• Ofereça um teste grátis ou com desconto\n\nNão espere ser encontrado. Vá encontrar."
          }
        ],
        summary: [
          "Comece pelos contatos mais próximos",
          "Use redes sociais como vitrine do seu trabalho",
          "Cadastre-se em plataformas de freelancer",
          "Faça abordagem direta de potenciais clientes"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Liste 10 pessoas que você conhece que poderiam precisar do seu serviço ou indicar alguém. Escreva uma mensagem de apresentação para enviar a elas."
        }
      },
      {
        id: "m7-aula-4",
        title: "Escala com IA",
        introduction: "Uma vez que você tem clientes, como atender mais sem trabalhar mais? Vamos ver como escalar.",
        sections: [
          {
            title: "O problema da escala",
            content: "Quando você vende tempo, tem limite:\n\n• Mais clientes = mais trabalho\n• Mais trabalho = menos tempo livre\n• Preço tem teto (cliente não paga infinito)\n\nPara crescer de verdade, precisa escalar."
          },
          {
            title: "Criando processos replicáveis",
            content: "Documente tudo que você faz:\n\n• Passo a passo de cada serviço\n• Templates que você usa\n• Prompts que funcionam\n• Checklists de qualidade\n\nIsso permite delegar ou automatizar.",
            examples: [
              {
                title: "Exemplo prático",
                content: "Processo de criação de posts:\n\n1. Receber briefing do cliente (formulário padrão)\n2. Gerar ideias com IA (prompt específico)\n3. Criar legendas (template por tipo de post)\n4. Revisar e ajustar (checklist de qualidade)\n5. Entregar no formato certo (pasta organizada)\n\nCom processo documentado, você treina alguém em horas."
              }
            ]
          },
          {
            title: "Automatizando partes do trabalho",
            content: "O que pode automatizar:\n\n• Formulários de briefing\n• Templates de resposta\n• Organização de arquivos\n• Agendamento de entregas\n• Cobrança e pagamentos\n\nMenos trabalho operacional = mais tempo para o que importa."
          },
          {
            title: "Modelos de escala",
            content: "Caminhos possíveis:\n\n• Contratar assistentes: Você direciona, eles executam\n• Criar produtos: Cursos, templates, assinaturas\n• Aumentar ticket: Clientes maiores, serviços premium\n• Nichos específicos: Virar referência em um mercado\n\nNão precisa escolher um só. Combine conforme faz sentido."
          }
        ],
        summary: [
          "Vender tempo tem limite natural de crescimento",
          "Documente processos para replicar e delegar",
          "Automatize trabalho operacional",
          "Escale com equipe, produtos ou especialização"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Escolha um serviço que você oferece (ou poderia oferecer). Documente o processo completo em passos. Identifique o que poderia automatizar e o que poderia delegar."
        }
      }
    ]
  },
  {
    id: "modulo-final",
    number: 8,
    title: "O Jogo é Mental",
    description: "O mindset certo para se manter relevante no mundo da IA.",
    lessons: [
      {
        id: "mf-aula-1",
        title: "O futuro do trabalho",
        introduction: "O mundo do trabalho está mudando rápido. Vamos entender o que está acontecendo e como se posicionar.",
        sections: [
          {
            title: "O que a IA realmente muda",
            content: "A IA não substitui pessoas. Substitui tarefas.\n\n• Tarefas repetitivas e previsíveis serão automatizadas\n• Tarefas que exigem julgamento humano continuam importantes\n• Novas tarefas surgem com a tecnologia\n• A velocidade de mudança está acelerando\n\nQuem entende isso, se adapta. Quem ignora, fica para trás."
          },
          {
            title: "Profissões em transformação",
            content: "Não é sobre profissões \"sumirem\". É sobre mudarem:\n\n• Escritores usarão IA para produzir mais\n• Designers usarão IA como assistente\n• Analistas usarão IA para processar dados\n• Vendedores usarão IA para personalizar abordagens\n\nQuem usa IA faz em 1 hora o que outros fazem em 8."
          },
          {
            title: "Habilidades que importam",
            content: "O que vai diferenciar pessoas:\n\n• Pensamento crítico (avaliar o que a IA produz)\n• Criatividade (ter ideias, não só executar)\n• Comunicação (saber pedir e explicar)\n• Adaptabilidade (aprender rápido)\n• Empatia (entender pessoas, não só tarefas)"
          },
          {
            title: "A mentalidade de crescimento",
            content: "A única constante é a mudança. Aceite:\n\n• Você vai precisar aprender coisas novas sempre\n• O que funciona hoje pode não funcionar amanhã\n• Experimentar é mais importante que acertar de primeira\n• Quem para de aprender, para de crescer"
          }
        ],
        summary: [
          "IA substitui tarefas, não pessoas inteiras",
          "Profissões se transformam, não desaparecem",
          "Pensamento crítico, criatividade e adaptabilidade são essenciais",
          "Aprendizado contínuo é a nova regra do jogo"
        ],
        exercise: {
          title: "Reflexão",
          description: "Pense na sua profissão ou área de atuação. Liste 3 tarefas que podem ser automatizadas e 3 que vão continuar humanas. O que você precisa desenvolver para se manter relevante?"
        }
      },
      {
        id: "mf-aula-2",
        title: "Relevância e adaptação",
        introduction: "Como se manter relevante num mundo que muda tão rápido? Vamos ver estratégias práticas.",
        sections: [
          {
            title: "O mito de 'saber tudo'",
            content: "Você não precisa dominar toda tecnologia nova.\n\nPrecisa:\n\n• Entender o básico de como funciona\n• Saber quando e para que usar\n• Aprender rápido quando precisar aprofundar\n\nNinguém sabe tudo. Quem tenta, se perde."
          },
          {
            title: "Aprendizado just-in-time",
            content: "Aprenda quando precisar:\n\n• Tenha uma base conceitual sólida\n• Saiba onde buscar informação\n• Aprenda aplicando, não só consumindo\n• Documente o que aprende para reusar",
            examples: [
              {
                title: "Exemplo prático",
                content: "Você não precisa fazer um curso de 40 horas sobre cada ferramenta de IA.\n\nPrecisa saber: \"Quando eu precisar criar imagens, vou usar X. Quando precisar, aprendo o essencial em 1 hora.\"\n\nAprendizado sob demanda é mais eficiente."
              }
            ]
          },
          {
            title: "Construindo sua vantagem",
            content: "Combine habilidades únicas:\n\n• IA + [sua expertise] = diferencial\n• Quanto mais específico, menos concorrência\n• Experiência humana + eficiência da IA = valor\n\nNinguém pode copiar sua combinação única."
          },
          {
            title: "Comunidade e conexões",
            content: "Você não precisa evoluir sozinho:\n\n• Participe de comunidades sobre IA\n• Troque experiências com outros profissionais\n• Ensine o que aprende (ensinar fixa conhecimento)\n• Mantenha curiosidade ativa"
          }
        ],
        summary: [
          "Não tente dominar tudo — tenha base sólida e aprenda sob demanda",
          "Combine IA com sua expertise única",
          "Experiência humana + eficiência da IA = vantagem",
          "Evolua em comunidade, não sozinho"
        ],
        exercise: {
          title: "Exercício prático",
          description: "Defina sua combinação única: [IA + sua expertise + seu diferencial]. Escreva em uma frase o que você oferece que ninguém mais oferece da mesma forma."
        }
      },
      {
        id: "mf-aula-3",
        title: "Próximos passos",
        introduction: "Você chegou ao final do curso. Mas o aprendizado não para aqui. Vamos definir seu caminho daqui pra frente.",
        sections: [
          {
            title: "O que você aprendeu",
            content: "Nesse curso você viu:\n\n• O que é IA e como funciona\n• Ferramentas práticas para o dia a dia\n• Como escrever prompts eficientes\n• Aplicações para conteúdo, negócios e produtividade\n• Como gerar renda usando IA\n• Mentalidade para se manter relevante\n\nVocê tem as bases. Agora é praticar."
          },
          {
            title: "Os 3 pilares da evolução contínua",
            content: "Para continuar evoluindo:\n\n1. PRÁTICA DIÁRIA\n   Use IA todo dia, mesmo para coisas simples. A fluência vem do uso.\n\n2. EXPERIMENTAÇÃO\n   Teste coisas novas. Erre. Aprenda. Repita.\n\n3. ATUALIZAÇÃO\n   Acompanhe novidades. A tecnologia muda rápido."
          },
          {
            title: "Seu plano de ação",
            content: "Para os próximos 30 dias:\n\nSemana 1: Revise os módulos e pratique os exercícios que não fez\nSemana 2: Escolha 1 aplicação e use IA diariamente nela\nSemana 3: Ofereça seu primeiro serviço ou automatize 1 processo\nSemana 4: Avalie resultados e defina próximos passos",
            examples: [
              {
                title: "Exemplo prático",
                content: "\"Use esse prompt para criar seu plano personalizado:\n\n'Baseado no curso Método IA Real, crie um plano de ação de 30 dias para mim.\n\nMinha situação: [descreva]\nMeu objetivo principal: [defina]\nTempo disponível por dia: [quanto]\n\nQuero um plano com ações específicas para cada semana.'\""
              }
            ]
          },
          {
            title: "Uma mensagem final",
            content: "A IA é uma ferramenta poderosa, mas você é quem faz a diferença.\n\nNão espere condições perfeitas. Não espere dominar tudo. Comece com o que tem, aprenda com o que erra, evolua com o que funciona.\n\nO futuro pertence a quem age. E você já deu o primeiro passo.\n\nAgora é continuar."
          }
        ],
        summary: [
          "Você tem as bases — agora é praticar",
          "Evolua através de prática diária, experimentação e atualização",
          "Crie seu plano de ação para os próximos 30 dias",
          "O futuro pertence a quem age — continue evoluindo"
        ],
        exercise: {
          title: "Exercício final",
          description: "Use o prompt sugerido para criar seu plano de ação personalizado para os próximos 30 dias. Depois, coloque em prática e revise semanalmente seu progresso."
        }
      }
    ]
  }
];
