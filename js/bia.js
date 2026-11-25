/* ==========================================================================
   BIA Tutora - Módulo Único Sensível ao Contexto (Vanilla JS)
   - Ambiente 1 (data-bia="curso"): Modo Consultivo (Drawer lateral direito)
   - Ambiente 2 (data-bia="tutor"): Modo Interventivo (Monitor + Opt-in + Reforço)
   ========================================================================== */
(function () {
  'use strict';

  const IN_PAGES_DIR = window.location.pathname.replace(/\\/g, '/').includes('/pages/');
  const ICON_SRC = IN_PAGES_DIR ? '../assets/svg/icons/chat-bot.svg' : 'assets/svg/icons/chat-bot.svg';

  const svg = (path) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

  const ICONS = {
    expand: svg('<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>'),
    shrink: svg('<path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/>'),
    close: svg('<path d="M18 6L6 18"/><path d="M6 6l12 12"/>'),
    send: svg('<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>'),
    chevron: svg('<path d="M6 9l6 6 6-6"/>'),
  };

  /* Ondinhas orgânicas contínuas dentro do cabeçalho (sem recorte e com movimento fluido) */
  function headWavesSvg() {
    return `<svg class="bia_head-waves" viewBox="0 0 800 34" preserveAspectRatio="none" aria-hidden="true">
      <path class="bia_head-wave -w1" d="M0,14 C135,0 265,32 400,12 C535,-2 665,30 800,10 L800,34 L0,34 Z" fill="rgba(255, 255, 255, 0.25)"/>
      <path class="bia_head-wave -w2" d="M0,20 C155,33 285,3 420,19 C555,33 680,5 800,19 L800,34 L0,34 Z" fill="rgba(255, 255, 255, 0.46)"/>
      <path class="bia_head-wave -w3" d="M0,24 C130,8 270,32 410,18 C550,6 675,30 800,17 L800,34 L0,34 Z" fill="#FFFFFF"/>
    </svg>`;
  }

  /* Estética de ondas sonoras suaves (opacidade 50% -> 70% no hover e projeção equilibrada) */
  function fabWavesSvg() {
    const rInner = 29.4;
    const totalBars = 40;
    const pattern = [2.6, 4, 6, 8.2, 9.5, 7, 4.6, 2.8, 4.2, 6.5, 4.5, 2.6];
    let bars = '';

    for (let i = 0; i < totalBars; i++) {
      const deg = (i / totalBars) * 360;
      // Deixa livre o arco inferior (64° a 116°) onde fica a etiqueta "BIA" / "TUTOR"
      if (deg >= 64 && deg <= 116) continue;

      const len = pattern[i % pattern.length];
      const delay = (i * -0.09).toFixed(2);

      bars += `<g transform="translate(40 40) rotate(${deg.toFixed(1)})">
        <rect class="bia_eq-bar" style="--d:${delay}s" x="${rInner}" y="-0.95" width="${len}" height="1.9" rx="0.95" fill="url(#bia-eq-grad)" />
      </g>`;
    }

    return `<svg class="bia_fab-waves" viewBox="0 0 80 80" aria-hidden="true">
      <defs>
        <linearGradient id="bia-eq-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#701A75"/>
          <stop offset="50%" stop-color="#C81054"/>
          <stop offset="100%" stop-color="#F00A3C"/>
        </linearGradient>
      </defs>
      ${bars}
    </svg>`;
  }

  /* ------------------------------------------------------------------------
     1. BANCO DE DADOS MOCKADOS (FAQs, 15 Questões, Reforços 5x por Tópico)
     ------------------------------------------------------------------------ */
  const FAQ_CATEGORIES = [
    {
      id: 'sobre',
      label: 'Sobre o curso',
      chips: [
        {
          question: 'Qual a carga horária e o nível do curso?',
          answer: (c) =>
            `O curso **${c.curso || 'Excel na Prática'}** tem carga horária de **${c.cargaHoraria || '16h'}** e nível **${c.nivel || 'Iniciante'}**. Você estuda 100% on-line e no seu ritmo.`,
        },
        {
          question: 'O curso é gratuito? Como me matriculo?',
          answer: (c) =>
            c.matricula ||
            'Sim! Todos os cursos da **Escola Virtual** são **100% gratuitos**. Basta clicar em **Matricule-se**, fazer seu login ou cadastro e começar.',
        },
        {
          question: 'Preciso ter o Excel instalado?',
          answer: () =>
            'Você pode assistir às aulas pelo celular ou computador. Para praticar as planilhas, recomendamos usar o **Excel** ou o **Excel on-line gratuito** no computador.',
        },
      ],
    },
    {
      id: 'conteudo',
      label: 'Conteúdo geral',
      chips: [
        {
          question: 'O que vou aprender nos 4 módulos?',
          answer: (c) => {
            const mods = c.modulos || [];
            if (!mods.length) return 'Você aprenderá desde os primeiros passos até fórmulas, gráficos, tabelas dinâmicas e macros.';
            return (
              `O curso possui **${mods.length} módulos**:\n\n` +
              mods.map((m, i) => `${i + 1}. **${m.titulo}** — ${m.desc}`).join('\n')
            );
          },
        },
        {
          question: 'O curso ensina Função SE e PROCV?',
          answer: () =>
            'Sim! No **Módulo 2 – Fórmulas e funções**, você aprende operações básicas, `SOMA`, `MÉDIA`, `Função SE`, `PROCV` e `PROCX` com exemplos práticos.',
        },
        {
          question: 'Tem gráficos e tabelas dinâmicas?',
          answer: () =>
            'Sim! O **Módulo 3 – Análise de dados** é dedicado a classificação, filtros, criação de gráficos e tabelas dinâmicas.',
        },
      ],
    },
    {
      id: 'certificado',
      label: 'Conclusão e certificado',
      chips: [
        {
          question: 'Como faço para emitir o certificado?',
          answer: (c) =>
            c.certificado ||
            'Conclua **100% das atividades**, obtenha **70% ou mais** na avaliação final e emita gratuitamente na **Área do Aluno > Histórico de Cursos**.',
        },
        {
          question: 'Qual a nota mínima na avaliação final?',
          answer: () =>
            'Para aprovação e emissão do certificado gratuito, a nota mínima exigida na avaliação final é **70%**.',
        },
        {
          question: 'O que falta para eu concluir o curso?',
          answer: (c) =>
            `Seu progresso atual está em **${c.progresso ?? 30}%**. ${c.faltante || 'Conclua as aulas restantes e faça a avaliação final com nota mínima de 70%.'}`,
        },
      ],
    },
  ];

  const ACTIVITY_QUESTIONS = [
    {
      id: 1,
      topicTag: 'Operadores de Comparação',
      question: 'Uma loja dá frete grátis para compras a partir de R$ 100. O valor está em A2. Qual fórmula mostra "Grátis" ou "Pago"?',
      options: [
        '=SE(A2>100;"Pago";"Grátis")',
        '=SE(A2>=100;"Grátis";"Pago")',
        '=SE(A2<100;"Grátis";"Pago")',
        '=SE("Grátis";A2>=100;"Pago")',
      ],
      correct: 1,
      feedbackRight: 'Correto! O operador >= inclui compras de exatamente R$ 100 na condição de frete grátis.',
      feedbackWrong: 'Atenção ao operador: "a partir de R$ 100" exige >= (maior ou igual) e "Grátis" como primeiro resultado.',
    },
    {
      id: 2,
      topicTag: 'Sintaxe da Função SE',
      question: 'Qual é a ordem correta dos três argumentos da função SE no Excel em português?',
      options: [
        '=SE(valor_se_verdadeiro; teste_lógico; valor_se_falso)',
        '=SE(teste_lógico; valor_se_falso; valor_se_verdadeiro)',
        '=SE(teste_lógico; valor_se_verdadeiro; valor_se_falso)',
        '=SE(valor_se_falso; valor_se_verdadeiro; teste_lógico)',
      ],
      correct: 2,
      feedbackRight: 'Isso mesmo! Primeiro vem o teste lógico, depois o resultado se verdadeiro e por último o resultado se falso.',
      feedbackWrong: 'A estrutura padrão da função SE é sempre: teste lógico primeiro, valor se verdadeiro segundo e valor se falso terceiro.',
    },
    {
      id: 3,
      topicTag: 'Aspas, Textos e Separadores',
      question: 'Qual fórmula exibe corretamente o texto "Aprovado" quando a nota em B2 for maior ou igual a 7?',
      options: [
        '=SE(B2>=7;Aprovado;Reprovado)',
        '=SE(B2>=7,"Aprovado","Reprovado")',
        '=SE(B2>=7;"Aprovado";"Reprovado")',
        '=SE("B2>=7";"Aprovado";"Reprovado")',
      ],
      correct: 2,
      feedbackRight: 'Perfeito! Textos vão entre aspas, referências de células ficam sem aspas e o separador no Excel PT-BR é ponto e vírgula.',
      feedbackWrong: 'Lembre-se: textos precisam de aspas, o teste lógico não vai entre aspas e o separador em português é ponto e vírgula (;).',
    },
    {
      id: 4,
      topicTag: 'Operadores de Comparação',
      question: 'Para verificar se a idade em C2 é menor que 18 anos, qual teste lógico deve ser usado?',
      options: ['C2<=18', 'C2<18', 'C2>18', 'C2<>18'],
      correct: 1,
      feedbackRight: 'Exato! O operador < verifica estritamente valores menores que 18.',
      feedbackWrong: 'Menor que 18 não inclui o 18. Por isso o operador correto é < (C2<18).',
    },
    {
      id: 5,
      topicTag: 'Sintaxe da Função SE',
      question: 'O que acontece se você esquecer de informar o terceiro argumento (valor_se_falso) e o teste der falso?',
      options: [
        'O Excel retorna a palavra FALSO',
        'A célula fica em branco automaticamente',
        'O Excel apaga a fórmula',
        'O Excel retorna 100',
      ],
      correct: 0,
      feedbackRight: 'Correto! Sem o terceiro argumento, o Excel exibe o valor lógico FALSO quando a condição não é atendida.',
      feedbackWrong: 'Quando o terceiro argumento é omitido e o teste é falso, o Excel retorna literalmente FALSO.',
    },
    {
      id: 6,
      topicTag: 'Aspas, Textos e Separadores',
      question: 'Ao digitar =SE(A2>10;OK;Erro) sem aspas nos textos, qual erro o Excel costuma exibir?',
      options: ['#DIV/0!', '#NOME?', '#VALOR!', '#REF!'],
      correct: 1,
      feedbackRight: 'Muito bem! Sem aspas, o Excel acha que OK e Erro são nomes de funções ou intervalos e retorna #NOME?.',
      feedbackWrong: 'Quando um texto é escrito sem aspas na fórmula, o Excel tenta interpretá-lo como um nome e gera o erro #NOME?.',
    },
    {
      id: 7,
      topicTag: 'Operadores de Comparação',
      question: 'Qual operador representa "diferente de" em um teste lógico do Excel?',
      options: ['!=', '<>', '=/=', '><'],
      correct: 1,
      feedbackRight: 'Correto! No Excel, "diferente de" é representado pelos sinais <> juntos.',
      feedbackWrong: 'Diferente de outras linguagens, no Excel usamos <> para verificar se dois valores são diferentes.',
    },
    {
      id: 8,
      topicTag: 'Sintaxe da Função SE',
      question: 'Qual fórmula calcula 10% de desconto sobre D2 somente se D2 for maior que 200?',
      options: [
        '=SE(D2>200;D2*0,9;D2)',
        '=SE(D2*0,9;D2>200;D2)',
        '=SE(D2>200;D2;D2*0,9)',
        '=SE(D2<200;D2*0,9;D2)',
      ],
      correct: 0,
      feedbackRight: 'Isso! Se D2>200 for verdadeiro, aplica D2*0,9; caso contrário, mantém o valor original D2.',
      feedbackWrong: 'Verifique a ordem: primeiro o teste D2>200, depois o cálculo com desconto (D2*0,9) e por fim o valor sem desconto (D2).',
    },
    {
      id: 9,
      topicTag: 'Aspas, Textos e Separadores',
      question: 'No Excel configurado em português do Brasil, qual caractere separa os argumentos da função SE?',
      options: ['Dois pontos (:)', 'Vírgula (,)', 'Ponto e vírgula (;)', 'Barra (/)'],
      correct: 2,
      feedbackRight: 'Correto! O ponto e vírgula (;) separa os argumentos porque a vírgula é usada nos decimais.',
      feedbackWrong: 'No Excel em português, o separador de argumentos é o ponto e vírgula (;).',
    },
    {
      id: 10,
      topicTag: 'Operadores de Comparação',
      question: 'Um estoque precisa de reposição quando a quantidade em E2 for até 5 unidades (5 ou menos). Qual teste usar?',
      options: ['E2<5', 'E2>=5', 'E2<=5', 'E2=5'],
      correct: 2,
      feedbackRight: 'Exato! "Até 5 unidades" inclui o número 5, portanto usa-se <= (menor ou igual).',
      feedbackWrong: '"Até 5" inclui o 5 e os valores abaixo dele, então o operador correto é <= (E2<=5).',
    },
    {
      id: 11,
      topicTag: 'Sintaxe da Função SE',
      question: 'Qual fórmula está escrita com a sintaxe válida no Excel?',
      options: [
        'SE(A1=10;"Sim";"Não")',
        '=SE(A1=10;"Sim";"Não")',
        '=SE[A1=10;"Sim";"Não"]',
        '=SE(A1=10:"Sim":"Não")',
      ],
      correct: 1,
      feedbackRight: 'Correto! Toda fórmula começa com =, usa parênteses () e separa argumentos com ;.',
      feedbackWrong: 'Toda fórmula no Excel começa com =, envolve argumentos com parênteses () e os separa por ;.',
    },
    {
      id: 12,
      topicTag: 'Aspas, Textos e Separadores',
      question: 'Se você quiser retornar o número 0 quando a condição for falsa, como deve escrever o terceiro argumento?',
      options: ['"0"', '0', '(0)', '#0'],
      correct: 1,
      feedbackRight: 'Correto! Números usados para cálculo ou exibição numérica vão sem aspas.',
      feedbackWrong: 'Números não devem receber aspas (se colocar "0", o Excel trata como texto).',
    },
    {
      id: 13,
      topicTag: 'Operadores de Comparação',
      question: 'Se B2 vale 70, qual será o resultado da fórmula =SE(B2>70;"Meta";"Abaixo")?',
      options: ['Meta', 'Abaixo', '70', '#VALOR!'],
      correct: 1,
      feedbackRight: 'Isso! 70 não é estritamente maior que 70, então o teste é falso e retorna "Abaixo".',
      feedbackWrong: 'O operador > significa estritamente maior. Como B2 é igual a 70, o teste B2>70 dá falso e retorna "Abaixo".',
    },
    {
      id: 14,
      topicTag: 'Sintaxe da Função SE',
      question: 'Ao arrastar =SE(B2>=7;"Aprovado";"Reprovado") para a linha 3, o que acontece automaticamente?',
      options: [
        'Continua testando B2',
        'Atualiza a referência para B3',
        'Apaga os textos da fórmula',
        'Retorna erro #REF!',
      ],
      correct: 1,
      feedbackRight: 'Exato! Por usar referência relativa (B2), o Excel ajusta automaticamente para B3, B4 e assim por diante.',
      feedbackWrong: 'Sem o cifrão ($), B2 é uma referência relativa e se ajusta automaticamente para B3 ao arrastar.',
    },
    {
      id: 15,
      topicTag: 'Aspas, Textos e Separadores',
      question: 'Qual fórmula verifica corretamente se o texto na célula A2 é igual a "Pago"?',
      options: [
        '=SE(A2=Pago;"OK";"Pendente")',
        '=SE(A2="Pago";"OK";"Pendente")',
        '=SE("A2"="Pago";"OK";"Pendente")',
        '=SE(A2="Pago";OK;Pendente)',
      ],
      correct: 1,
      feedbackRight: 'Perfeito! Tanto no teste lógico quanto nos resultados, textos literais ficam entre aspas e células ficam sem aspas.',
      feedbackWrong: 'A célula A2 fica sem aspas, enquanto todos os textos ("Pago", "OK", "Pendente") precisam estar entre aspas.',
    },
  ];

  const REINFORCEMENT_TOPICS = {
    'Operadores de Comparação': {
      explanation:
        'Os operadores de comparação servem para montar a pergunta do teste lógico na função SE. Eles comparam dois valores e resultam em VERDADEIRO ou FALSO. O detalhe mais comum é saber quando incluir o valor limite (`>=` e `<=`) ou não (`>` e `<`).',
      example:
        'Exemplo prático: se a média para aprovação é 7 (quem tira 7 passa), usamos `>=`:\n`=SE(B2>=7;"Aprovado";"Reprovado")`\nJá para "diferente de zero", usamos `<>`: `=SE(A2<>0;"Tem saldo";"Zerado")`.',
      questions: [
        {
          question: 'Qual operador verifica se um valor é "maior ou igual" a outro?',
          options: ['>', '>=', '=>', '<='],
          correct: 1,
          explanation: 'No Excel, "maior ou igual" é sempre escrito com o sinal de maior seguido do igual: `>=`.',
        },
        {
          question: 'Se a idade mínima é 18 anos (18 já pode), qual teste está certo?',
          options: ['A2>18', 'A2>=18', 'A2<18', 'A2<>18'],
          correct: 1,
          explanation: 'Como 18 já atende à regra, precisamos incluir o 18 usando `A2>=18`.',
        },
        {
          question: 'Qual operador significa "diferente de" no Excel?',
          options: ['!=', '<>', '==', '><'],
          correct: 1,
          explanation: 'O símbolo `<>` representa "diferente de" nas fórmulas do Excel.',
        },
        {
          question: 'Com A2 = 10, o teste lógico `A2>10` é:',
          options: ['Verdadeiro', 'Falso', 'Erro #NOME?', 'Igual a 10'],
          correct: 1,
          explanation: '10 não é maior que 10, então `A2>10` resulta em Falso.',
        },
        {
          question: 'Para testar "até 50 reais" (incluindo 50), qual operador usar?',
          options: ['<', '<=', '>', '>='],
          correct: 1,
          explanation: '"Até 50" inclui o 50 e valores menores, usando `<=`.',
        },
      ],
      qa: [
        { keys: ['diferente', '<>', '!='], answer: 'No Excel, para verificar se dois valores são diferentes, use `<>` (ex.: `A2<>0`). O símbolo `!=` não existe no Excel.' },
        { keys: ['maior', 'igual', '>=', '>'], answer: 'Use `>` quando o número limite **não** entra (ex.: acima de 100) e `>=` quando o limite **entra** (ex.: a partir de 100).' },
        { keys: ['menor', '<=', '<'], answer: 'Use `<` para estritamente menor e `<=` quando o valor limite também conta (ex.: "até 5 unidades" = `<=5`).' },
      ],
      qaFallback: 'Neste reforço estamos focados apenas em **Operadores de Comparação** (`>`, `>=`, `<`, `<=`, `=`, `<>`). Pergunte algo sobre como comparar valores no teste lógico!',
    },

    'Sintaxe da Função SE': {
      explanation:
        'A função SE funciona como uma encruzilhada com uma pergunta e dois caminhos. Ela sempre segue exatamente 3 partes dentro dos parênteses: primeiro o teste lógico, segundo o que acontece se for verdadeiro e terceiro o que acontece se for falso.',
      example:
        'Estrutura fixa:\n`=SE(teste_lógico; valor_se_verdadeiro; valor_se_falso)`\nExemplo: `=SE(A2>=100;"Frete Grátis";"Frete Pago")`.',
      questions: [
        {
          question: 'O que vem sempre como primeiro argumento da função SE?',
          options: ['O valor se verdadeiro', 'O teste lógico', 'O valor se falso', 'O texto entre aspas'],
          correct: 1,
          explanation: 'O primeiro argumento é sempre o teste lógico (a condição que será avaliada).',
        },
        {
          question: 'Qual caractere deve iniciar obrigatoriamente qualquer fórmula SE?',
          options: ['+', '=', ':', '@'],
          correct: 1,
          explanation: 'Toda fórmula no Excel começa com o sinal de igual (`=`).',
        },
        {
          question: 'Qual parte da fórmula aparece se o teste lógico der FALSO?',
          options: ['O primeiro argumento', 'O segundo argumento', 'O terceiro argumento', 'Nenhum'],
          correct: 2,
          explanation: 'O terceiro argumento é o `valor_se_falso`, retornado quando o teste não é atendido.',
        },
        {
          question: 'Qual fórmula segue a ordem correta?',
          options: [
            '=SE("OK";A1>5;"Não")',
            '=SE(A1>5;"OK";"Não")',
            '=SE(A1>5;"Não";"OK") // se OK for verdadeiro',
            'SE(A1>5;"OK";"Não")',
          ],
          correct: 1,
          explanation: '`=SE(A1>5;"OK";"Não")` começa com `=`, traz o teste primeiro e o resultado verdadeiro em seguida.',
        },
        {
          question: 'Quantos argumentos principais a função SE recebe?',
          options: ['1', '2', '3', '5'],
          correct: 2,
          explanation: 'A função SE possui 3 argumentos: teste lógico, valor se verdadeiro e valor se falso.',
        },
      ],
      qa: [
        { keys: ['ordem', 'estrutura', 'argumento', 'parte'], answer: 'A ordem é sempre: 1º `teste_lógico`, 2º `valor_se_verdadeiro`, 3º `valor_se_falso`, todos separados por `;`.' },
        { keys: ['terceiro', 'falso', 'omitir', 'faltar'], answer: 'Se você omitir o 3º argumento e o teste for falso, o Excel exibe a palavra `FALSO`.' },
        { keys: ['arrastar', 'relativa', 'copiar'], answer: 'Ao arrastar uma fórmula com `B2`, o Excel atualiza para `B3`, `B4`, etc., mantendo a lógica para cada linha.' },
      ],
      qaFallback: 'Neste reforço estamos focados apenas na **Sintaxe da Função SE** (ordem dos argumentos e estrutura). Tire sua dúvida sobre como montar a fórmula!',
    },

    'Aspas, Textos e Separadores': {
      explanation:
        'No Excel em português, os argumentos são separados por ponto e vírgula (`;`). Além disso, qualquer texto literal (como `"Aprovado"`) deve ficar entre aspas duplas, enquanto números e referências de células (`B2`, `100`, `0`) ficam sem aspas.',
      example:
        'Correto: `=SE(A2="Pago";"Liberado";0)`\nErrado: `=SE(A2=Pago;Liberado;"0")` (gera `#NOME?` por falta de aspas nos textos e transforma o zero em texto).',
      questions: [
        {
          question: 'Quando devemos usar aspas duplas dentro da função SE?',
          options: [
            'Em referências de células como B2',
            'Em palavras ou textos como "Aprovado"',
            'Em todos os números',
            'No sinal de igual',
          ],
          correct: 1,
          explanation: 'Aspas duplas são usadas apenas para textos literais, como `"Aprovado"`.',
        },
        {
          question: 'Qual separador de argumentos é usado no Excel em português?',
          options: ['Vírgula (,)', 'Ponto e vírgula (;)', 'Barra (/)', 'Ponto (.)'],
          correct: 1,
          explanation: 'No Excel em português do Brasil, os argumentos são separados por ponto e vírgula (`;`).',
        },
        {
          question: 'Qual erro aparece quando esquecemos as aspas em um texto na fórmula?',
          options: ['#NOME?', '#DIV/0!', '#REF!', '#N/D'],
          correct: 0,
          explanation: 'Sem aspas, o Excel não reconhece a palavra como texto e exibe `#NOME?`.',
        },
        {
          question: 'Como devemos escrever o número 100 dentro da fórmula `=SE(A2>=100; ...)`?',
          options: ['"100"', '100', '[100]', '{100}'],
          correct: 1,
          explanation: 'Números vão sem aspas para que o Excel os reconheça como valores numéricos.',
        },
        {
          question: 'Qual fórmula está com aspas e separadores corretos?',
          options: [
            '=SE(B2="Sim","OK","Não")',
            '=SE(B2="Sim";"OK";"Não")',
            '=SE("B2"="Sim";"OK";"Não")',
            '=SE(B2=Sim;OK;Não)',
          ],
          correct: 1,
          explanation: 'A célula `B2` fica sem aspas, os textos ficam com aspas e o separador é `;`.',
        },
      ],
      qa: [
        { keys: ['aspa', 'texto', 'palavra'], answer: 'Sempre coloque **aspas duplas** em textos (ex.: `"Grátis"`). Nunca coloque aspas em células (`A2`) ou números (`100`).' },
        { keys: ['virgula', 'ponto e virgula', 'separador', ';', ','], answer: 'No Excel em português, use sempre **ponto e vírgula (`;`)** para separar os argumentos, porque a vírgula é usada para casas decimais.' },
        { keys: ['#nome', 'erro'], answer: 'O erro `#NOME?` geralmente acontece quando falta aspas em um texto ou o nome da função foi digitado errado.' },
      ],
      qaFallback: 'Neste reforço estamos focados em **Aspas, Textos e Separadores** (`"texto"`, `;` e `#NOME?`). Envie sua dúvida sobre esse assunto!',
    },
  };

  /* ------------------------------------------------------------------------
     2. UTILIDADES
     ------------------------------------------------------------------------ */
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  const normalize = (s) =>
    String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const inlineMd = (s) =>
    s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>');

  function md(text) {
    const lines = escapeHtml(text).split('\n');
    let html = '';
    let list = null;
    const closeList = () => {
      if (list) {
        html += `</${list}>`;
        list = null;
      }
    };
    lines.forEach((line) => {
      const ul = line.match(/^\s*-\s+(.*)/);
      const ol = line.match(/^\s*\d+\.\s+(.*)/);
      if (ul || ol) {
        const type = ul ? 'ul' : 'ol';
        if (list !== type) {
          closeList();
          html += `<${type}>`;
          list = type;
        }
        html += `<li>${inlineMd((ul || ol)[1])}</li>`;
      } else if (line.trim() === '') {
        closeList();
      } else {
        closeList();
        html += `<p>${inlineMd(line)}</p>`;
      }
    });
    closeList();
    return html;
  }

  function readContext() {
    const el = document.getElementById('bia-context');
    if (!el) return {};
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      return {};
    }
  }

  /* ------------------------------------------------------------------------
     3. AMBIENTE 1: MODO CONSULTIVO (CURSO E MATRÍCULA)
     ------------------------------------------------------------------------ */
  function createConsultativeDrawer(root, ctx) {
    const sessionKey = 'bia:curso:chat-session';
    let conversation = [];
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) conversation = JSON.parse(saved);
    } catch (e) {
      conversation = [];
    }
    let activeCategoryId = null;
    let busy = false;

    const progressPct = Number.isFinite(Number(ctx.progresso)) ? Number(ctx.progresso) : 30;

    root.classList.add('bia', '-curso');
    root.innerHTML = `
      <div class="bia_launcher">
        <div class="bia_tooltip" data-bia-tooltip>
          Dúvidas sobre o curso?
          <button type="button" class="bia_tooltip-close" data-bia-tooltip-close aria-label="Fechar aviso">×</button>
        </div>
        <div class="bia_fab-wrap">
          ${fabWavesSvg()}
          <button type="button" class="bia_fab" data-bia-open aria-label="Abrir BIA Tutora" aria-expanded="false">
            <img src="${ICON_SRC}" alt="">
            <span class="bia_fab-label">BIA</span>
          </button>
        </div>
      </div>

      <div class="bia_backdrop" data-bia-backdrop hidden></div>

      <aside class="bia_panel" role="dialog" aria-modal="false" aria-label="BIA Tutora" hidden>
        <div class="bia_panel-shell">
          <div class="bia_head-wrap">
            <header class="bia_head">
              <div class="bia_brand">
                <span class="bia_mark"><img src="${ICON_SRC}" alt=""></span>
                <div class="bia_title-row">
                  <span class="bia_name">BIA Tutora</span>
                </div>
              </div>
              <div class="bia_actions">
                <button type="button" class="bia_icon-btn" data-bia-expand aria-label="Expandir painel">${ICONS.expand}</button>
                <button type="button" class="bia_icon-btn" data-bia-close aria-label="Fechar painel">${ICONS.close}</button>
              </div>
              ${headWavesSvg()}
            </header>
          </div>

          <div class="bia_body" data-bia-body>
            <!-- Faixa slim recolhível do resumo do curso -->
            <div class="bia_summary" data-bia-summary>
              <button type="button" class="bia_summary-toggle" data-bia-summary-toggle aria-expanded="false">
                <span class="bia_summary-left">
                  <span>${escapeHtml(ctx.curso || 'Excel na Prática')}</span>
                  <span class="bia_summary-pct">${progressPct}%</span>
                </span>
                <span class="bia_summary-chevron">${ICONS.chevron}</span>
              </button>
              <div class="bia_summary-collapse">
                <div class="bia_summary-inner">
                  <div class="bia_summary-content">
                    <div class="bia_summary-meta">
                      <span>Carga horária: ${escapeHtml(ctx.cargaHoraria || '16h')}</span>
                      <span>Nível: ${escapeHtml(ctx.nivel || 'Iniciante')}</span>
                    </div>
                    <p>${escapeHtml(ctx.objetivo || 'Aprenda a criar planilhas eficientes, usar funções essenciais e analisar dados na prática.')}</p>
                    <div class="bia_progress-track" aria-hidden="true">
                      <span class="bia_progress-fill" style="width:${progressPct}%"></span>
                    </div>
                    <p><strong>Para concluir:</strong> ${escapeHtml(ctx.faltante || 'Concluir as aulas restantes e atingir 70% na avaliação final.')}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mensagem inicial da BIA Tutora acoplada com as Dúvidas sobre o Curso -->
            <div class="bia_msg -bot">
              <span class="bia_mark -sm -round"><img src="${ICON_SRC}" alt=""></span>
              <div class="bia_coupled-card" style="flex:1;min-width:0;">
                <div class="bia_coupled-text">
                  ${md(`Oi! Sou a **BIA Tutora**. Selecione um tema abaixo ou digite sua dúvida sobre **${ctx.curso || 'o curso'}**:`)}
                </div>
                <div class="bia_quick-dock" data-bia-quick-dock aria-label="Dúvidas sobre o curso">
                  <div class="bia_cats" role="tablist" aria-label="Categorias de dúvidas">
                    ${FAQ_CATEGORIES.map(
                      (cat) =>
                        `<button type="button" role="tab" aria-selected="false" class="bia_cat-btn" data-bia-cat="${cat.id}">${escapeHtml(cat.label.replace(' geral', '').replace('Conclusão e certificado', 'Conclusão'))}</button>`
                    ).join('')}
                  </div>
                  <div class="bia_chips-collapse">
                    <div class="bia_chips-inner">
                      <div class="bia_chips" data-bia-chips style="padding-top:8px;padding-bottom:2px;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Histórico de mensagens da conversa -->
            <ul class="bia_msgs" data-bia-msgs aria-live="polite"></ul>
          </div>

          <footer class="bia_foot">
            <form class="bia_form" data-bia-form autocomplete="off">
              <label class="visually-hidden" for="bia-input-curso">Digite sua dúvida sobre o curso</label>
              <input class="bia_input" id="bia-input-curso" data-bia-input type="text" maxlength="400" placeholder="Digite sua dúvida sobre o curso...">
              <button type="submit" class="bia_send" data-bia-send aria-label="Enviar mensagem" disabled>${ICONS.send}</button>
            </form>
            <div class="bia_foot-meta">
              <span>Respostas baseadas na ementa do curso</span>
              <button type="button" class="bia_clear-btn" data-bia-clear disabled>Limpar conversa</button>
            </div>
          </footer>
        </div>
      </aside>
    `;

    const $ = (sel) => root.querySelector(sel);
    const panel = $('.bia_panel');
    const backdrop = $('[data-bia-backdrop]');
    const body = $('[data-bia-body]');
    const chipsEl = $('[data-bia-chips]');
    const msgsEl = $('[data-bia-msgs]');
    const input = $('[data-bia-input]');
    const sendBtn = $('[data-bia-send]');
    const clearBtn = $('[data-bia-clear]');
    const fab = $('[data-bia-open]');
    const tooltip = $('[data-bia-tooltip]');
    const expandBtn = $('[data-bia-expand]');

    function saveSession() {
      try {
        sessionStorage.setItem(sessionKey, JSON.stringify(conversation));
      } catch (e) {
        /* ignore */
      }
    }

    const quickDock = $('[data-bia-quick-dock]');
    const quickClose = $('[data-bia-quick-close]');

    function scrollSmoothDown() {
      body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
    }

    function renderChips() {
      const isOpen = Boolean(activeCategoryId);
      if (quickDock) quickDock.classList.toggle('-open', isOpen);
      if (quickClose) quickClose.hidden = !isOpen;
      root.querySelectorAll('[data-bia-cat]').forEach((b) => {
        const active = b.dataset.biaCat === activeCategoryId;
        b.classList.toggle('-active', active);
        b.setAttribute('aria-selected', String(active));
      });

      if (!activeCategoryId) return;
      const cat = FAQ_CATEGORIES.find((c) => c.id === activeCategoryId);
      if (!cat) return;

      chipsEl.innerHTML = '';
      cat.chips.forEach((chip, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bia_chip';
        btn.style.setProperty('--i', idx);
        btn.textContent = chip.question;
        btn.addEventListener('click', () => {
          if (busy) return;
          activeCategoryId = null;
          renderChips();
          appendUserAndBot(chip.question, chip.answer(ctx), false);
        });
        chipsEl.appendChild(btn);
      });
    }

    function renderMessage(m) {
      const li = document.createElement('li');
      li.className = `bia_msg -${m.from}`;
      if (m.from === 'bot') {
        li.innerHTML = `
          <span class="bia_mark -sm -round"><img src="${ICON_SRC}" alt=""></span>
          <div class="bia_bubble">${md(m.text)}</div>
        `;
      } else {
        li.innerHTML = `<div class="bia_bubble">${md(m.text)}</div>`;
      }
      msgsEl.appendChild(li);
    }

    function renderConversation() {
      msgsEl.innerHTML = '';
      conversation.forEach(renderMessage);
      clearBtn.disabled = conversation.length === 0;
      body.scrollTop = body.scrollHeight;
    }

    function appendUserAndBot(userText, botText, immediate) {
      const u = { from: 'user', text: userText };
      conversation.push(u);
      renderMessage(u);
      saveSession();
      clearBtn.disabled = false;
      scrollSmoothDown();

      if (immediate) {
        const b = { from: 'bot', text: botText };
        conversation.push(b);
        renderMessage(b);
        saveSession();
        scrollSmoothDown();
        return;
      }

      busy = true;
      updateSend();
      const typing = document.createElement('li');
      typing.className = 'bia_msg -bot';
      typing.innerHTML = `<span class="bia_mark -sm -round"><img src="${ICON_SRC}" alt=""></span><div class="bia_bubble"><span class="bia_typing" aria-label="BIA digitando"><span></span><span></span><span></span></span></div>`;
      msgsEl.appendChild(typing);
      scrollSmoothDown();

      setTimeout(() => {
        typing.remove();
        const b = { from: 'bot', text: botText };
        conversation.push(b);
        renderMessage(b);
        saveSession();
        busy = false;
        updateSend();
        scrollSmoothDown();
      }, 280);
    }

    function answerFreeText(text) {
      const n = normalize(text);
      const customFaq = (ctx.faq || []).map((f) => ({ keys: f.keys, answer: () => f.answer }));
      const syllabusRules = [
        { keys: ['hora', 'duracao', 'tempo', 'nivel', 'carga'], answer: () => FAQ_CATEGORIES[0].chips[0].answer(ctx) },
        { keys: ['matricul', 'gratuit', 'pagar', 'custa', 'valor', 'inscri'], answer: () => FAQ_CATEGORIES[0].chips[1].answer(ctx) },
        { keys: ['modulo', 'ementa', 'aprender', 'conteudo', 'aula'], answer: () => FAQ_CATEGORIES[1].chips[0].answer(ctx) },
        { keys: ['certificad', 'diploma', 'concluir', 'nota', '70', 'falta', 'progresso'], answer: () => FAQ_CATEGORIES[2].chips[0].answer(ctx) },
        { keys: ['se', 'funcao se', 'decisao', 'logica'], answer: () => 'A **Função SE** é ensinada no **Módulo 2 – Fórmulas e funções**. Ela testa uma condição e retorna um resultado para verdadeiro e outro para falso!' },
        { keys: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite'], answer: () => `Olá! Como posso te ajudar hoje com o curso **${ctx.curso || 'Excel na Prática'}**?` },
      ];

      const hit = [...customFaq, ...syllabusRules].find((rule) =>
        rule.keys.some((k) => n.includes(normalize(k)))
      );

      if (hit) return hit.answer(ctx);
      return `No curso **${ctx.curso || 'Excel na Prática'}**, você aprende desde a interface do Excel até funções (` +
        '`SOMA`, `MÉDIA`, `SE`, `PROCV`), gráficos, tabelas dinâmicas e macros. Se quiser, clique em uma das categorias acima ou pergunte sobre **carga horária**, **módulos**, **matrícula** ou **certificado**!';
    }

    function updateSend() {
      sendBtn.disabled = busy || input.value.trim() === '';
    }

    function open() {
      panel.hidden = false;
      backdrop.hidden = false;
      root.classList.add('-open');
      fab.setAttribute('aria-expanded', 'true');
      tooltip.hidden = true;
      setTimeout(() => input.focus(), 200);
    }

    function close() {
      panel.hidden = true;
      backdrop.hidden = true;
      root.classList.remove('-open');
      fab.setAttribute('aria-expanded', 'false');
      fab.focus();
    }

    const summaryEl = $('[data-bia-summary]');
    const summaryToggle = $('[data-bia-summary-toggle]');
    if (summaryEl && summaryToggle) {
      summaryToggle.addEventListener('click', () => {
        const isOpen = summaryEl.classList.toggle('-open');
        summaryToggle.setAttribute('aria-expanded', String(isOpen));
      });
    }

    root.querySelectorAll('[data-bia-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const clicked = btn.dataset.biaCat;
        activeCategoryId = activeCategoryId === clicked ? null : clicked;
        renderChips();
      });
    });

    if (quickClose) {
      quickClose.addEventListener('click', () => {
        activeCategoryId = null;
        renderChips();
      });
    }

    fab.addEventListener('click', open);
    backdrop.addEventListener('click', close);
    $('[data-bia-close]').addEventListener('click', close);
    $('[data-bia-tooltip-close]').addEventListener('click', (e) => {
      e.stopPropagation();
      tooltip.hidden = true;
    });
    tooltip.addEventListener('click', (e) => {
      if (!e.target.closest('[data-bia-tooltip-close]')) open();
    });

    expandBtn.addEventListener('click', () => {
      const on = root.classList.toggle('-expanded');
      expandBtn.innerHTML = on ? ICONS.shrink : ICONS.expand;
      expandBtn.setAttribute('aria-label', on ? 'Reduzir painel' : 'Expandir painel');
    });

    input.addEventListener('input', updateSend);
    $('[data-bia-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || busy) return;
      input.value = '';
      updateSend();
      appendUserAndBot(text, answerFreeText(text), false);
    });

    clearBtn.addEventListener('click', () => {
      conversation = [];
      saveSession();
      renderConversation();
    });

    root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) close();
    });

    renderChips();
    renderConversation();

    return { open, close };
  }

  /* ------------------------------------------------------------------------
     4. AMBIENTE 2: MODO INTERVENTIVO (ATIVIDADE DE 15 QUESTÕES)
     ------------------------------------------------------------------------ */
  function createInterventiveTutor(root) {
    const state = {
      errorsByTopic: {},
      answeredWrongIds: new Set(),
      totalErrors: 0,
      interventionTriggered: false,
      interventionDismissed: false,
      activeTopic: null,
      practiceIndex: 0,
      practiceStarted: false,
      practiceAnswered: [],
      qaHistory: [],
      frozenHandler: null,
    };

    root.classList.add('bia', '-tutor');
    root.innerHTML = `
      <div class="bia_launcher">
        <div class="bia_tooltip" data-bia-tooltip>
          Dúvidas sobre o curso?
          <button type="button" class="bia_tooltip-close" data-bia-tooltip-close aria-label="Fechar aviso">×</button>
        </div>
        <div class="bia_fab-wrap">
          ${fabWavesSvg()}
          <button type="button" class="bia_fab" data-bia-open aria-label="Abrir BIA Tutora">
            <img src="${ICON_SRC}" alt="">
            <span class="bia_fab-label">TUTOR</span>
          </button>
        </div>
      </div>

      <!-- Passo 1: Cartão Contextual de Intervenção (Opt-in) Padronizado com o 1º Pop-up -->
      <dialog class="bia_modal" data-bia-optin aria-labelledby="bia-optin-title">
        <div class="bia_modal-top">
          <span class="bia_modal-topic" data-optin-topic>ASSUNTO IDENTIFICADO</span>
          <span class="bia_modal-step">BIA Tutora</span>
        </div>
        <h1 class="bia_modal-title" id="bia-optin-title">Posso te ajudar com isso?</h1>
        <div class="bia_modal-body">
          <p data-optin-msg></p>
          <div class="bia_modal-actions">
            <button type="button" class="bia_btn-secondary" data-optin-continue>Continuar atividade</button>
            <button type="button" class="bia_btn-primary" data-optin-accept autofocus>Fazer reforço agora</button>
          </div>
        </div>
      </dialog>

      <div class="bia_backdrop" data-bia-backdrop hidden></div>

      <!-- Passos 2 a 5: Modo Focado Clean (sem ondinhas poluindo o interior) -->
      <aside class="bia_panel" role="dialog" aria-modal="false" aria-label="BIA Tutora - Modo Focado" hidden>
        <div class="bia_panel-shell">
          <div class="bia_head-wrap">
            <header class="bia_head">
              <div class="bia_brand">
                <span class="bia_mark"><img src="${ICON_SRC}" alt=""></span>
                <div class="bia_title-row">
                  <span class="bia_name">BIA Tutora</span>
                  <span class="bia_badge">Reforço</span>
                </div>
              </div>
              <div class="bia_actions">
                <button type="button" class="bia_icon-btn" data-bia-expand aria-label="Expandir painel">${ICONS.expand}</button>
                <button type="button" class="bia_icon-btn" data-bia-return aria-label="Voltar para a atividade">${ICONS.close}</button>
              </div>
              ${headWavesSvg()}
            </header>
          </div>

          <div class="bia_tabs" role="tablist" aria-label="Abas do reforço">
            <button type="button" role="tab" aria-selected="true" class="bia_tab -active" data-tab="reforco">Explicação e Prática</button>
            <button type="button" role="tab" aria-selected="false" class="bia_tab" data-tab="duvidas">Tira-dúvidas do assunto</button>
          </div>

          <div class="bia_body" data-tab-panel="reforco"></div>

          <div class="bia_body" data-tab-panel="duvidas" hidden>
            <p class="bia_section-label" data-qa-scope>Chat restrito ao assunto do reforço</p>
            <ul class="bia_msgs" data-qa-msgs aria-live="polite"></ul>
          </div>

          <footer class="bia_foot" data-qa-foot hidden>
            <form class="bia_form" data-qa-form autocomplete="off">
              <label class="visually-hidden" for="bia-input-tutor">Tire sua dúvida sobre o assunto do reforço</label>
              <input class="bia_input" id="bia-input-tutor" data-qa-input type="text" maxlength="300" placeholder="Pergunte sobre este assunto...">
              <button type="submit" class="bia_send" data-qa-send aria-label="Enviar pergunta" disabled>${ICONS.send}</button>
            </form>
          </footer>

          <div class="bia_return-bar">
            <span style="font-size:12px;color:#4B5563;">Seu progresso na atividade está salvo.</span>
            <button type="button" class="bia_btn-secondary" data-bia-return>Voltar para a atividade</button>
          </div>
        </div>
      </aside>
    `;

    const $ = (sel) => root.querySelector(sel);
    const modal = $('[data-bia-optin]');
    const panel = $('.bia_panel');
    const backdrop = $('[data-bia-backdrop]');
    const reforcoBody = $('[data-tab-panel="reforco"]');
    const duvidasBody = $('[data-tab-panel="duvidas"]');
    const qaFoot = $('[data-qa-foot]');
    const qaMsgs = $('[data-qa-msgs]');
    const qaInput = $('[data-qa-input]');
    const qaSend = $('[data-qa-send]');
    const fab = $('[data-bia-open]');
    const expandBtn = $('[data-bia-expand]');

    function setFrozen(locked) {
      if (typeof state.frozenHandler === 'function') state.frozenHandler(locked);
    }

    function getTopErrorTopic() {
      let bestTopic = Object.keys(REINFORCEMENT_TOPICS)[0];
      let maxCount = -1;
      Object.entries(state.errorsByTopic).forEach(([topic, count]) => {
        if (count > maxCount) {
          maxCount = count;
          bestTopic = topic;
        }
      });
      return bestTopic;
    }

    function switchTab(tabName) {
      root.querySelectorAll('[data-tab]').forEach((t) => {
        const active = t.dataset.tab === tabName;
        t.classList.toggle('-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      reforcoBody.hidden = tabName !== 'reforco';
      duvidasBody.hidden = tabName !== 'duvidas';
      qaFoot.hidden = tabName !== 'duvidas';
      if (tabName === 'duvidas') setTimeout(() => qaInput.focus(), 100);
    }

    function renderFocusedContent() {
      const topic = state.activeTopic || Object.keys(REINFORCEMENT_TOPICS)[0];
      const data = REINFORCEMENT_TOPICS[topic] || Object.values(REINFORCEMENT_TOPICS)[0];
      const topicEl = $('[data-focused-topic]');
      if (topicEl) topicEl.textContent = `Reforço: ${topic}`;
      const qaScopeEl = $('[data-qa-scope]');
      if (qaScopeEl) qaScopeEl.textContent = `Tira-dúvidas focado em: ${topic}`;

      if (!state.practiceStarted) {
        reforcoBody.innerHTML = `
          <article class="bia_explain-card">
            <h3>${escapeHtml(topic)}</h3>
            <div>${md(data.explanation)}</div>
            <div class="bia_example-box">${md(data.example)}</div>
            <button type="button" class="bia_btn-primary" data-start-practice>Iniciar micro-prática (5 perguntas)</button>
          </article>
        `;
        reforcoBody.querySelector('[data-start-practice]').addEventListener('click', () => {
          state.practiceStarted = true;
          state.practiceIndex = 0;
          state.practiceAnswered = [];
          renderFocusedContent();
        });
        return;
      }

      if (state.practiceIndex >= data.questions.length) {
        const hits = state.practiceAnswered.filter((x) => x.isCorrect).length;
        reforcoBody.innerHTML = `
          <article class="bia_explain-card">
            <h3>Reforço concluído!</h3>
            <p>Você completou as <strong>5 perguntas básicas</strong> sobre <strong>${escapeHtml(topic)}</strong> e acertou <strong>${hits} de 5</strong>.</p>
            <p>Agora você está pronto para retomar exatamente de onde parou na atividade principal.</p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">
              <button type="button" class="bia_btn-primary" data-return-main>Voltar para a atividade</button>
              <button type="button" class="bia_btn-secondary" data-retry-practice>Refazer 5 perguntas</button>
            </div>
          </article>
        `;
        reforcoBody.querySelector('[data-return-main]').addEventListener('click', returnToActivity);
        reforcoBody.querySelector('[data-retry-practice]').addEventListener('click', () => {
          state.practiceIndex = 0;
          state.practiceAnswered = [];
          renderFocusedContent();
        });
        return;
      }

      const q = data.questions[state.practiceIndex];
      const currentAns = state.practiceAnswered[state.practiceIndex];
      const pct = ((state.practiceIndex + 1) / data.questions.length) * 100;

      reforcoBody.innerHTML = `
        <article class="bia_practice-box">
          <div class="bia_practice-head">
            <span>Micro-prática · ${escapeHtml(topic)}</span>
            <span>${state.practiceIndex + 1}/5</span>
          </div>
          <div class="bia_progress-track" aria-hidden="true">
            <span class="bia_progress-fill" style="width:${pct}%"></span>
          </div>
          <p class="bia_practice-q">${escapeHtml(q.question)}</p>
          <div class="bia_practice-opts">
            ${q.options
              .map((opt, idx) => {
                let cls = 'bia_practice-opt';
                if (currentAns) {
                  if (idx === q.correct) cls += ' -right';
                  else if (idx === currentAns.selected && !currentAns.isCorrect) cls += ' -wrong';
                }
                return `<button type="button" class="${cls}" data-prac-opt="${idx}" ${currentAns ? 'disabled' : ''}>${escapeHtml(opt)}</button>`;
              })
              .join('')}
          </div>
          ${
            currentAns
              ? `<div class="bia_practice-fb ${currentAns.isCorrect ? '-right' : '-wrong'}" aria-live="polite">
                   <strong>${currentAns.isCorrect ? 'Correto!' : 'Quase lá.'}</strong> ${md(q.explanation)}
                 </div>
                 <div class="bia_practice-actions">
                   <button type="button" class="bia_btn-primary" data-prac-next>${state.practiceIndex === 4 ? 'Concluir reforço' : 'Próxima pergunta ›'}</button>
                 </div>`
              : ''
          }
        </article>
      `;

      reforcoBody.querySelectorAll('[data-prac-opt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.pracOpt);
          state.practiceAnswered[state.practiceIndex] = {
            selected: idx,
            isCorrect: idx === q.correct,
          };
          renderFocusedContent();
        });
      });

      const nextBtn = reforcoBody.querySelector('[data-prac-next]');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          state.practiceIndex += 1;
          renderFocusedContent();
        });
      }
    }

    function renderQaMessages() {
      const topic = state.activeTopic || Object.keys(REINFORCEMENT_TOPICS)[0];
      qaMsgs.innerHTML = '';
      if (!state.qaHistory.length) {
        const li = document.createElement('li');
        li.className = 'bia_msg -bot';
        li.innerHTML = `
          <span class="bia_mark -sm -round"><img src="${ICON_SRC}" alt=""></span>
          <div class="bia_bubble">${md(`Estou aqui para tirar dúvidas rápidas apenas sobre **${topic}**. O que você gostaria de revisar?`)}</div>
        `;
        qaMsgs.appendChild(li);
      } else {
        state.qaHistory.forEach((m) => {
          const li = document.createElement('li');
          li.className = `bia_msg -${m.from}`;
          li.innerHTML =
            m.from === 'bot'
              ? `<span class="bia_mark -sm -round"><img src="${ICON_SRC}" alt=""></span><div class="bia_bubble">${md(m.text)}</div>`
              : `<div class="bia_bubble">${md(m.text)}</div>`;
          qaMsgs.appendChild(li);
        });
      }
      duvidasBody.scrollTop = duvidasBody.scrollHeight;
    }

    function openFocusedMode(topic, resetPractice) {
      state.activeTopic = topic || getTopErrorTopic();
      if (resetPractice) {
        state.practiceStarted = false;
        state.practiceIndex = 0;
        state.practiceAnswered = [];
        state.qaHistory = [];
      }
      setFrozen(true);
      switchTab('reforco');
      renderFocusedContent();
      renderQaMessages();
      panel.hidden = false;
      backdrop.hidden = false;
      root.classList.add('-open');
    }

    function returnToActivity() {
      panel.hidden = true;
      backdrop.hidden = true;
      root.classList.remove('-open');
      setFrozen(false);
    }

    function triggerOptInModal(topic) {
      state.activeTopic = topic;
      setFrozen(true);
      $('[data-optin-topic]').textContent = `Assunto identificado: ${topic}`;
      $('[data-optin-msg]').textContent = `Percebi que você teve dificuldade em ${topic}. Quer fazer um reforço rápido antes de continuar?`;
      if (typeof modal.showModal === 'function') modal.showModal();
      else modal.setAttribute('open', '');
    }

    function closeOptInModal() {
      if (modal.open && typeof modal.close === 'function') modal.close();
      else modal.removeAttribute('open');
    }

    $('[data-optin-accept]').addEventListener('click', () => {
      closeOptInModal();
      openFocusedMode(state.activeTopic, true);
    });

    $('[data-optin-continue]').addEventListener('click', () => {
      state.interventionDismissed = true;
      closeOptInModal();
      setFrozen(false);
    });

    modal.addEventListener('cancel', () => {
      state.interventionDismissed = true;
      setFrozen(false);
    });

    const tutorTooltip = $('[data-bia-tooltip]');
    const tutorTooltipClose = $('[data-bia-tooltip-close]');
    if (tutorTooltipClose && tutorTooltip) {
      tutorTooltipClose.addEventListener('click', (e) => {
        e.stopPropagation();
        tutorTooltip.hidden = true;
      });
      tutorTooltip.addEventListener('click', (e) => {
        if (!e.target.closest('[data-bia-tooltip-close]')) {
          openFocusedMode(state.activeTopic || getTopErrorTopic(), false);
        }
      });
    }

    fab.addEventListener('click', () => {
      openFocusedMode(state.activeTopic || getTopErrorTopic(), false);
    });

    root.querySelectorAll('[data-bia-return]').forEach((btn) => {
      btn.addEventListener('click', returnToActivity);
    });
    backdrop.addEventListener('click', returnToActivity);

    expandBtn.addEventListener('click', () => {
      const on = root.classList.toggle('-expanded');
      expandBtn.innerHTML = on ? ICONS.shrink : ICONS.expand;
      expandBtn.setAttribute('aria-label', on ? 'Reduzir painel' : 'Expandir painel');
    });

    root.querySelectorAll('[data-tab]').forEach((tab) => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    qaInput.addEventListener('input', () => {
      qaSend.disabled = qaInput.value.trim() === '';
    });

    $('[data-qa-form]').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = qaInput.value.trim();
      if (!text) return;
      qaInput.value = '';
      qaSend.disabled = true;

      const topic = state.activeTopic || Object.keys(REINFORCEMENT_TOPICS)[0];
      const data = REINFORCEMENT_TOPICS[topic];
      const n = normalize(text);
      const hit = (data.qa || []).find((item) => item.keys.some((k) => n.includes(normalize(k))));
      const reply = hit ? hit.answer : data.qaFallback;

      state.qaHistory.push({ from: 'user', text }, { from: 'bot', text: reply });
      renderQaMessages();
    });

    root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) returnToActivity();
    });

    return {
      open: () => openFocusedMode(state.activeTopic || getTopErrorTopic(), false),
      close: returnToActivity,
      setActivityLockHandler(fn) {
        state.frozenHandler = fn;
      },
      recordActivityAnswer({ questionId, topicTag, isCorrect }) {
        if (isCorrect) return;
        if (!state.answeredWrongIds.has(questionId)) {
          state.answeredWrongIds.add(questionId);
          state.totalErrors += 1;
          state.errorsByTopic[topicTag] = (state.errorsByTopic[topicTag] || 0) + 1;
        }
        console.info(
          `[BIA Monitor] Erros acumulados: ${state.totalErrors}/5 | Por assunto:`,
          { ...state.errorsByTopic }
        );
        if (state.totalErrors >= 5 && !state.interventionTriggered && !state.interventionDismissed) {
          state.interventionTriggered = true;
          const topTopic = getTopErrorTopic();
          setTimeout(() => triggerOptInModal(topTopic), 350);
        }
      },
    };
  }

  /* ------------------------------------------------------------------------
     5. GUIA INTERATIVO DO PROTÓTIPO (3 ETAPAS DE ONBOARDING)
     ------------------------------------------------------------------------ */
  let restartGuideFn = null;

  function initPrototypeGuide() {
    const isTutorPage = Boolean(document.querySelector('[data-bia="tutor"]'));
    const isCursoPage = Boolean(document.querySelector('[data-bia="curso"]'));
    const pageStep = isTutorPage ? 3 : isCursoPage ? 2 : 1;
    const KEY_PREFIX = 'bia:guide:v2:step';
    const storageKey = `${KEY_PREFIX}${pageStep}`;

    /* Garante que ao navegar manualmente de Home -> Cursos ou de Cursos -> Atividade o pop-up da próxima etapa sempre apareça */
    document.querySelectorAll('a[href*="curso.html"]').forEach((link) => {
      link.addEventListener('click', () => {
        try {
          sessionStorage.removeItem(`${KEY_PREFIX}2`);
        } catch (e) {
          /* ignore */
        }
      });
    });
    document.querySelectorAll('a[href*="atividade.html"]').forEach((link) => {
      link.addEventListener('click', () => {
        try {
          sessionStorage.removeItem(`${KEY_PREFIX}3`);
        } catch (e) {
          /* ignore */
        }
      });
    });

    const overlay = document.createElement('div');
    overlay.className = 'bia-guide_overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'bia-guide-title');
    overlay.hidden = true;
    document.body.appendChild(overlay);

    let activeHighlights = [];
    let lastFocused = null;

    function clearHighlights() {
      activeHighlights.forEach((el) => el.classList.remove('bia-guide-highlight'));
      activeHighlights = [];
    }

    function highlightElements(selector, keepAfterClose) {
      clearHighlights();
      if (!selector) return;
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.add('bia-guide-highlight');
        activeHighlights.push(el);
        if (keepAfterClose) {
          el.addEventListener(
            'click',
            () => {
              try {
                sessionStorage.setItem(storageKey, '1');
              } catch (e) {
                /* ignore */
              }
              el.classList.remove('bia-guide-highlight');
            },
            { once: true }
          );
        }
      });
    }

    function closeGuide(keepHighlight) {
      overlay.hidden = true;
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch (e) {
        /* ignore */
      }
      if (!keepHighlight) clearHighlights();
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function renderDots(activeStep) {
      return [1, 2, 3]
        .map((n) => `<span class="bia-guide_dot ${n === activeStep ? '-active' : ''}"></span>`)
        .join('');
    }

    function showStep1() {
      highlightElements('.m-top-menu_link[href*="curso.html"], .m-nav_link[href*="curso.html"]', true);
      overlay.innerHTML = `
        <div class="bia-guide_card">
          <div class="bia-guide_top">
            <span class="bia-guide_tag">AMBIENTE SIMULADO</span>
            <span class="bia-guide_step">Passo 1 de 3</span>
          </div>
          <h2 class="bia-guide_title" id="bia-guide-title">Bem-vindo ao protótipo interativo</h2>
          <div class="bia-guide_text">
            <p>Você está em um <strong>ambiente simulado</strong>, criado para demonstrar o funcionamento real da <strong>BIA Tutora</strong> integrada à jornada do aluno.</p>
            <p>Explore a página inicial à vontade e, quando desejar avançar, clique em <strong>"Cursos"</strong> na barra de navegação (navbar).</p>
          </div>
          <div class="bia-guide_foot">
            <div class="bia-guide_dots" aria-hidden="true">${renderDots(1)}</div>
            <div class="bia-guide_actions">
              <button type="button" class="bia-guide_btn" data-guide-dismiss>Entendi</button>
            </div>
          </div>
        </div>
      `;
      overlay.hidden = false;
      const primary = overlay.querySelector('[data-guide-dismiss]');
      if (primary) primary.focus();
      overlay.querySelector('[data-guide-dismiss]').addEventListener('click', () => closeGuide(true));
    }

    function showStep2() {
      highlightElements('.bia_fab-wrap', true);
      overlay.innerHTML = `
        <div class="bia-guide_card">
          <div class="bia-guide_top">
            <span class="bia-guide_tag">MODO CONSULTIVO</span>
            <span class="bia-guide_step">Passo 2 de 3</span>
          </div>
          <h2 class="bia-guide_title" id="bia-guide-title">A BIA Tutora na Área do Curso</h2>
          <div class="bia-guide_text">
            <p>Nesta área, a <strong>BIA Tutora</strong> atua no <strong>modo consultivo</strong> — disponível no botão flutuante no canto inferior direito para tirar dúvidas frequentes, mostrar o resumo do curso e conversar no chat.</p>
            <p>Explore a página e a BIA à vontade. Quando desejar iniciar a prática, clique em <strong>"Começar agora"</strong> na própria página.</p>
          </div>
          <div class="bia-guide_foot">
            <div class="bia-guide_dots" aria-hidden="true">${renderDots(2)}</div>
            <div class="bia-guide_actions">
              <button type="button" class="bia-guide_btn" data-guide-dismiss>Entendi</button>
            </div>
          </div>
        </div>
      `;
      overlay.hidden = false;
      const primary = overlay.querySelector('[data-guide-dismiss]');
      if (primary) primary.focus();
      overlay.querySelector('[data-guide-dismiss]').addEventListener('click', () => closeGuide(true));
    }

    function showStep3() {
      clearHighlights();
      overlay.innerHTML = `
        <div class="bia-guide_card">
          <div class="bia-guide_top">
            <span class="bia-guide_tag">MODO INTERVENTIVO</span>
            <span class="bia-guide_step">Passo 3 de 3</span>
          </div>
          <h2 class="bia-guide_title" id="bia-guide-title">Como a BIA Tutora atua na atividade</h2>
          <div class="bia-guide_text">
            <p>A BIA monitora silenciosamente seu desempenho durante as <strong>15 questões</strong> e é <strong>acionada automaticamente ao atingir 5 erros (33%)</strong>, identificando o assunto com mais dificuldade.</p>
            <p>Nesse momento, ela oferece um <strong>reforço rápido</strong> (explicação automática + 5 perguntas básicas + tira-dúvidas) e depois retorna exatamente ao ponto onde você parou.</p>
          </div>
          <div class="bia-guide_foot">
            <div class="bia-guide_dots" aria-hidden="true">${renderDots(3)}</div>
            <div class="bia-guide_actions">
              <button type="button" class="bia-guide_btn" data-guide-dismiss>Entendi</button>
            </div>
          </div>
        </div>
      `;
      overlay.hidden = false;
      const primary = overlay.querySelector('[data-guide-dismiss]');
      if (primary) primary.focus();
      overlay.querySelector('[data-guide-dismiss]').addEventListener('click', () => closeGuide(false));
    }

    function openCurrentStep() {
      lastFocused = document.activeElement;
      if (pageStep === 1) showStep1();
      else if (pageStep === 2) showStep2();
      else showStep3();
    }

    /* Botão discreto "Rever guia" lateralizado junto às ações do cabeçalho (.o-header_actions / .pg-topbar) com respiro */
    const headerHost = document.querySelector('.o-header_actions') || document.querySelector('.pg-topbar');
    if (headerHost) {
      const replayBtn = document.createElement('button');
      replayBtn.type = 'button';
      replayBtn.className = 'bia-guide_replay';
      replayBtn.setAttribute('aria-label', 'Rever guia interativo do protótipo');
      replayBtn.innerHTML = `<span class="bia-guide_replay-dot" aria-hidden="true">?</span><span>Rever guia</span>`;
      replayBtn.addEventListener('click', () => {
        try {
          sessionStorage.removeItem(`${KEY_PREFIX}1`);
          sessionStorage.removeItem(`${KEY_PREFIX}2`);
          sessionStorage.removeItem(`${KEY_PREFIX}3`);
        } catch (e) {
          /* ignore */
        }
        openCurrentStep();
      });

      if (headerHost.classList.contains('pg-topbar')) {
        const exitLink = headerHost.querySelector('.pg-topbar_exit');
        headerHost.insertBefore(replayBtn, exitLink || null);
      } else {
        headerHost.insertBefore(replayBtn, headerHost.firstChild);
      }
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeGuide(true);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.hidden) {
        closeGuide(true);
      }
    });

    restartGuideFn = () => {
      try {
        sessionStorage.removeItem(`${KEY_PREFIX}1`);
        sessionStorage.removeItem(`${KEY_PREFIX}2`);
        sessionStorage.removeItem(`${KEY_PREFIX}3`);
      } catch (e) {
        /* ignore */
      }
      openCurrentStep();
    };

    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(storageKey) === '1';
    } catch (e) {
      alreadySeen = false;
    }

    if (!alreadySeen) {
      setTimeout(openCurrentStep, 220);
    }
  }

  /* ------------------------------------------------------------------------
     6. BOOT & API PÚBLICA UNIFICADA
     ------------------------------------------------------------------------ */
  const instances = {};

  function boot() {
    const ctx = readContext();
    document.querySelectorAll('[data-bia]').forEach((el) => {
      const mode = el.getAttribute('data-bia') === 'tutor' ? 'tutor' : 'curso';
      instances[mode] = mode === 'tutor' ? createInterventiveTutor(el) : createConsultativeDrawer(el, ctx);
    });
    initPrototypeGuide();
  }

  window.BIA = {
    open: (mode) => instances[mode] && instances[mode].open(),
    close: (mode) => instances[mode] && instances[mode].close(),
    restartGuide: () => restartGuideFn && restartGuideFn(),
    getActivityQuestions: () => ACTIVITY_QUESTIONS,
    setActivityLockHandler: (fn) => instances.tutor && instances.tutor.setActivityLockHandler(fn),
    recordActivityAnswer: (payload) => instances.tutor && instances.tutor.recordActivityAnswer(payload),
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
