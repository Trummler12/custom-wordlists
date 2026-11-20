import type { LocaleDict } from "./index";

/** Portuguese UI strings. Machine-written and unreviewed by a native speaker — see the
 *  proofreading note in CONTRIBUTING.md. Written in a Brazilian register, the larger
 *  player base; the tag stays the generic `pt`, which `matchTag` widens pt-BR/pt-PT onto.
 *  Portuguese pluralizes like English (one vs. the rest), so the counters just branch on
 *  `n === 1` inline rather than through a helper. */
export const pt: LocaleDict = {
  header: {
    taglineBefore: "Crie listas de palavras personalizadas para",
    taglineAfter: "e jogos de palavras semelhantes.",
  },
  tree: {
    topics: "Tópicos",
    loading: "Carregando tópicos…",
    loadError: (message) => `Não foi possível carregar os tópicos: ${message}`,
    empty: "Nenhum tópico disponível ainda.",
    toggle: (expanded, title) => `${expanded ? "Recolher" : "Expandir"} ${title}`,
    loadingShort: "carregando…",
    wordsOf: (selected, total) => `${selected} de ${total} ${total === 1 ? "palavra" : "palavras"}`,
    duplicatesRemoved: (count) => `${count} duplicata${count === 1 ? " removida" : "s removidas"}`,
    incompleteTopic: (url) => `Este tópico está marcado como incompleto.{br}[Ajude-nos a adicionar o que falta!](${url})`,
    plannedTopic: (url) => `Este tópico está planejado, mas ainda não está pronto.{br}[Ajude-nos a preparar os dados dele!](${url})`,
    incompleteCategory: (url) =>
      `Esta categoria contém tópicos marcados como incompletos.{br}[Ajude-nos a adicionar o que falta!](${url})`,
    plannedCategory: (url) =>
      `Esta categoria contém tópicos planejados que ainda não estão prontos.{br}[Ajude-nos a preparar os dados deles!](${url})`,
    plannedUnselectable: "Tópicos planejados ainda não podem ser selecionados",
  },
  names: {
    form: { pref: "pref.", short: "curta", long: "longa", both: "ambas", all: "todas" },
    formLabel: (group) => `Forma do nome para ${group}`,
    formHint: {
      short: "Preferir nomes curtos",
      long: "Preferir nomes completos/oficiais",
      both: "Usar nomes curtos E completos",
      pref: "Usar apenas o rótulo principal",
      all: "Usar TODAS as variantes disponíveis",
    },
  },
  fame: {
    depthLabel: (group) => `Profundidade de fama para ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `nível mais alto de ${total}` : `${depth} níveis mais altos de ${total}`,
    groupsDefined: (count) => `Grupos de fama definidos: ${count}`,
    none: "Nenhum grupo de fama definido ainda. Veja o Contribution Guide no rodapé para propor alguns!",
    selected: "Selecionado:",
    mostlySelected: "Em grande parte selecionado:",
    stored: (body) => `(Armazenado: ${body})`,
    toggle: (shown) =>
      shown ? "Ocultar a régua de fama desta lista" : "Mostrar a régua de fama desta lista",
    toggleAll: (allShown) =>
      allShown ? "Ocultar estas réguas de fama" : "Mostrar estas réguas de fama",
  },
  omitted: {
    label: "O que esta lista deixa de fora",
    title: "Deixado de fora desta lista:",
    toggle: (omitted) =>
      omitted ? "Alternar para incluí-los na sua lista" : "Alternar para deixá-los de fora",
    locked: "Estes são dados de jogo, não palavras, então não podem ser adicionados.",
    upTo: (n) => `Até ${n}`,
    unknown: (n, primary, secondary) =>
      `Até ${n} ${n === 1 ? "entrada" : "entradas"} para as quais os dados de origem não têm nome em ${primary}${secondary}`,
    unknownHint: (omitted) =>
      omitted
        ? "Alternar para incluí-las com seus nomes em inglês (os únicos conhecidos para elas)."
        : "Alternar para deixá-las de fora novamente.",
    unknownTier: (tier, n) => `Nível ${tier}: ${n} ${n === 1 ? "entrada" : "entradas"}`,
    tooLong: (n, maxLen) => `Até ${n} ${n === 1 ? "nome" : "nomes"} com mais de ${maxLen} caracteres`,
    tooLongHint: (omitted) =>
      omitted
        ? "Alternar para incluí-los mesmo assim (o skribbl.io não os aceita, mas outro jogo pode)."
        : "Alternar para deixá-los de fora novamente.",
    helpAdd: (url) => `; [ajude-nos a adicionar o que falta!](${url})`,
    tooShort: (n, minLen) => `Até ${n} nome${n === 1 ? "" : "s"} com menos de ${minLen} caracteres`,
    tooShortHint: (omitted) =>
      omitted ? "Alternar para incluí-los mesmo assim." : "Alternar para deixá-los de fora novamente.",
    separatorIn: (n, sep, removing) =>
      `Até ${n} nome${n === 1 ? "" : "s"} que ${removing ? (n === 1 ? "{i}conteria{/i}" : "{i}conteriam{/i}") : n === 1 ? "contém" : "contêm"} o separador escolhido ({code}${sep}{/code})`,
    separatorHint: (omitted, removing) =>
      omitted
        ? removing
          ? "Alternar para mantê-los, sem o separador."
          : "Alternar para incluí-los mesmo assim: o skribbl.io dividiria cada um no separador."
        : removing
          ? "Alternar para deixá-los de fora em vez de remover o separador."
          : "Alternar para deixá-los de fora novamente.",
  },
  coverage: {
    label: "Cobertura do Geoguessr / Street View",
    all: "Todos os países",
    withCoverage: "Com cobertura oficial",
    reliable: "Apenas cobertura confiável",
  },
  languageType: {
    label: "Quais tipos de língua incluir",
    base: "Línguas modernas vivas",
    submillion: "Também línguas com menos de 1 milhão de falantes",
    notRecommended: "Pouco adequado para desenho casual: bem menos familiar do que o número de falantes sugere.",
    toggle: (included) =>
      included
        ? "Marcado: estão na lista. Desmarque para deixá-los de fora."
        : "Marque para adicioná-los à lista.",
  },
  sovereignty: {
    label: "Soberania e reconhecimento",
    wiki: "https://pt.wikipedia.org/wiki/Lista_de_Estados_com_reconhecimento_limitado",
    axisRow: "de jure",
    axisCol: "de facto",
    cols: ["Totalmente independente", "Parcialmente autônomo"],
    rows: ["Universalmente reconhecido", "Amplamente reconhecido", "Parcialmente reconhecido", "Não reconhecido"],
    colDefs: [
      "Administra suas próprias fronteiras, tribunais, exército e impostos.",
      "Tem suas próprias leis e parlamento, mas compartilha poderes essenciais (moeda, defesa, política externa) com outro Estado.",
    ],
    rowDefs: [
      "Um Estado-membro da ONU, reconhecido por praticamente todos os outros.",
      "Reconhecido por grande parte dos membros da ONU, com alguns opositores.",
      "Reconhecido por apenas alguns Estados, embora muitas vezes com forte presença funcional ou percebida.",
      "Internacionalmente considerado parte de outro Estado soberano.",
    ],
    regular: "Estados comuns",
  },
  language: {
    label: (current) => `Idioma: ${current}`,
    unsupported: (language) => `Ainda não confirmado para ${language}; este tópico pode estar incompleto.`,
    fallback: "O inglês é usado onde falta uma tradução.",
    usesEnglish: (primary, secondary) =>
      `${primary}${secondary} também usa oficialmente os nomes em inglês.`,
    variant: {
      romaji: "Usar romaji para as entradas da lista",
      es419: "Usar espanhol latino-americano para as entradas da lista",
    },
    variantNote: { romaji: "Grafias Hepburn com vogais longas duplicadas (Moomoomiruku).{br}O romaji wāpuro NÃO é suportado: entraria em conflito com as grafias oficiais (Butterfree, não Batafurii),{br}e resolver isso e os problemas decorrentes foge ao escopo por enquanto." },
    generatedRomaji:
      "Estes romaji foram gerados a partir dos nomes japoneses. Se algum tiver grafia diferente na prática, fique à vontade para [nos avisar](https://github.com/Trummler12/custom-wordlists/issues/new)!",
    variantDiffers: (n) => `${n} ${n === 1 ? "entrada" : "entradas"} com grafia diferente`,
    variantShowList: "Mostrar quais",
    panelTitle: "Configurações de idioma",
    slot: { primary: "Principal:", interface: "Interface:", fallback: "Reserva da interface:" },
    slotHint: {
      primary: "Idioma principal das entradas das listas e padrão para a maioria das outras configurações de idioma.",
      interface: "O idioma da interface em particular.",
      fallback: "Usado onde o idioma da interface não tem tradução.{br}Se aqui também faltar, o inglês é usado.",
    },
    followPrimary: "{i}Principal{/i}",
    showSecondaryBefore: "Mostrar a opção de usar entradas em", showSecondaryAfter: "",
    showSecondaryHint:
      "Permite usar, por exemplo, nomes de países na sua língua materna e os nomes de personagens de séries no seu idioma de dublagem preferido.",
    secondaryMoot: "Estes botões só aparecem enquanto o idioma principal e o secundário forem diferentes.",
    flagType: "Tipo de bandeira:",
    flagTypes: { country: "País", mixed: "Mista", linguistic: "Linguística" },
    useSecondary: (forced, secondary) =>
      forced ? "Usar esta lista no idioma selecionado" : `Usar as entradas desta lista em ${secondary}`,
    useSecondaryAll: (allForced, secondary) =>
      allForced
        ? "Usar estas listas no idioma selecionado"
        : `Usar as entradas destas listas em ${secondary}`,
  },
  settings: {
    label: "Configurações",
    reset: "Redefinir configurações de seleção{br}para o padrão",
    resetConfirm: "Clique novamente para confirmar",
    resetCancel: "Cancelar",
    outputSeparator: "Separador de saída:",
    outputSeparatorHint:
      "O skribbl.io só aceita {code},{/code} como separador. Os outros só mudam o que é copiado; a saída aparece igual de qualquer forma.",
    charLimits: "Limites de caracteres:",
    minChars: "Mín.",
    maxChars: "Máx.",
    removeSeparator: (sep) => `Remover {code}${sep}{/code} dos nomes`,
    charMaxOver: (gameMax) => `O skribbl.io aceita no máximo ${gameMax} caracteres por nome.`,
    scriptLimitsHint:
      "Limites para nomes na escrita própria deste idioma, em que um único caractere costuma representar uma sílaba ou palavra inteira. Romaji e outros nomes em letras latinas seguem os limites gerais.",
    showTopicsBefore: "Mostrar tópicos:",
    showTopicsAfter: "",
    showTopicsKind: { incomplete: "incompletos", planned: "planejados", all: "todos" },
    showTopicsHint:
      "Tópicos incompletos ainda têm entradas faltando. Tópicos planejados estão anunciados, mas ainda não podem ser selecionados.",
  },
  output: {
    label: "Saída",
    copy: "Copiar",
    copied: "Copiado!",
    copyFailed: "Falha ao copiar",
    copyManual: "A lista está selecionada; copie-a você mesmo.",
    empty: "Selecione tópicos, categorias ou listas personalizadas para gerar uma saída.",
    generatedList: "Lista de palavras gerada",
    words: "palavras",
    chars: "caracteres",
    belowMin: (min) => `· abaixo do mínimo do skribbl (${min})`,
    overMax: "· acima do máximo",
    overLong: (count, maxLen) =>
      `${count} ${count === 1 ? "palavra" : "palavras"} com mais de ${maxLen} caracteres`,
    splitting: (count, sep) =>
      `${count} palavra${count === 1 ? "" : "s"} com o separador "${sep}" (dividida${count === 1 ? "" : "s"} ao colar)`,
  },
  footer: {
    repository: "Repositório no GitHub",
    helpOut: "Quer ajudar no projeto? Fique à vontade para conferir o",
    // The guide itself is English only, so the link keeps its name.
    contributionGuide: "Contribution Guide",
    helpOutAfter: "!",
  },
  coveragePage: {
    home: "Página principal do app",
    topicLabel: "Tópico:",
    uiLanguage: "Idioma da interface",
    title: "Cobertura de Idiomas",
    intro: "Escolha um tópico para ver para quais idiomas a Wikidata já tem um rótulo, por item.",
    lead: "O conteúdo deste tópico vem da [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). A tabela mostra para quais idiomas cada item já tem um rótulo.",
    notesTitle: "Como ajudar",
    noteAdd: "Abra um item da primeira coluna e, depois de fazer login, adicione qualquer rótulo que falte e do qual você tenha certeza.",
    noteLabelLister: "Para adicionar um idioma que não esteja listado, vá às suas [preferências da Wikidata](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets) e ative o gadget {i}labelLister{/i} na aba “Gadgets”; cada item passará a mostrar uma “Labels list” (canto superior direito, em Ferramentas) que aceita qualquer código de idioma.",
    noteProtected: "Alguns itens da Wikidata são protegidos e exigem uma conta com pelo menos quatro dias e 100 ou mais edições para serem alterados.",
    noteStale: "Observe que esta tabela vem de um dump manual, então a cobertura mostrada aqui pode estar atrasada em relação ao estado atual da Wikidata em até várias semanas ou até meses.",
    itemCount: (n) => `${n.toLocaleString()} ${n === 1 ? "item" : "itens"}`,
    uiOnly: "Apenas idiomas da interface",
    uiOnlyHint: "Os dumps de dados brutos já cobrem todos os idiomas que o skribbl.io suporta,{br}além de alguns outros com muitos usuários.{br}Ou seja, os dados já suportam todos os idiomas planejados,{br}enquanto a interface é mantida por nós, os mantenedores, e naturalmente fica bem atrás.{br}E há pouco sentido em tentar adicionar um novo idioma de interface{br}enquanto quase nenhum tópico cobre esse idioma ainda.{br}Mas quanto mais gente ajuda, mais cedo novos idiomas são aprovados!{br}=> Confira o Contribution Guide abaixo!",
    item: "Item",
    numeric: { population: "População", area: "Área (km{smaller sup}2{/smaller sup})", users: "Usuários", atomicNumber: "Número atômico", wikipedias: "Wikipédias" },
    first: "Primeira página",
    prev: "Página anterior",
    next: "Próxima página",
    last: "Última página",
    pageParts: (current, total) => ["", `Página ${current}`, ` / ${total}`],
    loading: (topic) => `Carregando ${topic}…`,
    loadError: (topic, message) => `Não foi possível carregar a cobertura de ${topic}: ${message}`,
    pageJumpHint: (numeric) =>
      numeric
        ? `Clique: ir para uma página, um nome de entrada (em inglês) ou um valor em "${numeric}"`
        : "Clique: ir para uma página ou um nome de entrada (em inglês)",
    pageJumpInput: "Página, valor ou nome de entrada",
    pageNoNumeric: "Esta tabela não tem coluna numérica.",
  },
  tip: {
    unpin: "Desafixar",
  },
  custom: {
    title: "Custom",
    infoHint:
      "Use o campo de entrada abaixo para adicionar suas próprias listas de palavras.{br}" +
      "Valem as seguintes regras:{br}" +
      "- Todos os itens são separados por um mesmo caractere separador, igual em toda a entrada.{br}" +
      "- Evite itens que contenham o próprio separador.{br}" +
      "- A cada alteração do conteúdo, o separador é detectado automaticamente como o caractere separador mais frequente.{br}" +
      "- O skribbl.io ignora pontuação, outros caracteres especiais e espaços no início ou no fim; parte disso já é limpa aqui mesmo.",
    separatorLabel: "Separador:",
    separatorPick: "Caractere separador",
    internalDupes: (n) => `${n} entrada${n === 1 ? " duplicada" : "s duplicadas"} dentro de uma lista Custom ativa`,
    localDupes: (n) => `${n} duplicata${n === 1 ? "" : "s"} entre suas listas Custom ativas`,
    globalDupes: (n) => `${n} duplicata${n === 1 ? "" : "s"} com os tópicos selecionados`,
    dupesNote: "As duplicatas são reduzidas a uma única cópia na saída.",
    dupesNoteSave: "As duplicatas dentro de uma lista também são removidas quando ela é salva.",
    dupesSamples: {
      internal: "Duplicatas internas:",
      local: "Duplicatas entre suas listas Custom ativas:",
      global: "Duplicatas com os tópicos selecionados:",
    },
    fitToggle: "Ajustar o campo à altura completa",
    fewerRows: "Mostrar menos linhas",
    moreRows: "Mostrar mais linhas",
    moreRowsOver: (steps) => `(${steps} passo${steps === 1 ? "" : "s"} acima da altura do conteúdo)`,
    clearHint: "Limpar o campo de entrada Custom",
    clearConfirm: "Você está prestes a esvaziar o campo de entrada Custom.",
    clearConfirmButton: "Clique aqui para confirmar",
    listsLabel: "Listas salvas",
    listsTitle: "Listas Custom salvas",
    listsInfo:
      "As listas Custom ficam salvas no armazenamento local.{br}" +
      "Cada navegador tem seu próprio armazenamento local,{br}" +
      "separado de outros navegadores ou dispositivos.{br}" +
      "Para levar suas listas Custom para outro lugar,{br}" +
      "exporte-as aqui e importe-as no destino.{br}{br}" +
      "{b}IMPORTANTE{/b}: exporte suas listas depois de cada alteração maior " +
      "e guarde essas exportações como backup; várias ações do navegador " +
      "podem limpar seu armazenamento local, e o Safari até o limpa automaticamente " +
      "quando um site fica 7 dias sem ser visitado.",
    listActivate: "Usar esta lista",
    listRename: "Renomear",
    listSave: "Salvar a entrada atual nesta lista",
    listLoad: "Carregar esta lista no campo de entrada",
    listDelete: "Excluir esta lista",
    listUp: "Mover para cima",
    listDown: "Mover para baixo",
    listSaveNew: "Salvar a entrada atual como nova lista",
    phActivate: "NÃO é possível usar o espaço reservado",
    phRename: "NÃO é possível renomear o espaço reservado",
    phLoad: "NÃO é possível carregar o espaço reservado",
    phDelete: "NÃO é possível excluir o espaço reservado",
    phMove: "NÃO é possível mover o espaço reservado",
    exportLabel: "Exportar listas",
    exportTitle: "Exportar listas salvas",
    selectAll: "Selecionar tudo",
    exportDownload: "Baixar",
    importLabel: "Importar listas",
    importTitle: "Importar listas salvas",
    importColName: "Nome",
    importColSize: "Tamanho",
    importColDupes: "Dupl.",
    importColWith: "com",
    importButton: "Importar seleção",
    importEmpty: "Nenhuma lista salva neste arquivo.",
    importDupesSecondary: (pct) => `Secundário: ${pct}`,
    listReplaceConfirm: (name) => `Substituir a lista "${name}" pela entrada atual?`,
    listDeleteConfirm: (name) => `Excluir a lista "${name}"?`,
    listLoadConfirm: "Sobrescrever o campo de entrada com esta lista?",
    confirm: "Confirmar",
    cancel: "Cancelar",
    charsLabel: "Caracteres que o skribbl.io provavelmente ignora",
    charsIgnored: "Caracteres que o skribbl.io provavelmente ignora:",
    charsProblematic: "Caracteres problemáticos:",
    charsTolerated: "Caracteres tolerados:",
    charsRemove: "Considere remover este caractere.",
    charsLists: "Listas afetadas:",
    inputName: "{i}Campo de entrada{/i}",
    charsAccepted: "Caracteres aceitos:",
    charsRemoveMaybe: "Talvez valha remover este caractere.",
    charsLone: (char, partner) => `{code}${char}{/code} solto, sem o {code}${partner}{/code} correspondente;`,
    charsPaired: (open, close) => `Como parte de um par {code}${open}{/code}-{code}${close}{/code};`,
    cleanChars: "Sua lista contém caracteres especiais incomuns que podem ser removidos ao salvar:",
    cleanDupes: (n) =>
      `Sua lista contém ${n} duplicata${n === 1 ? " interna, que será removida" : "s internas, que serão removidas"} ao salvar:`,
    settingsLabel: "Configurações de Custom",
    settingsTitle: "Configurações de Custom",
    maxPreviewItems: "Máx. de itens na prévia",
    maxPreviewChars: "Máx. de caracteres na prévia",
    exampleListS: "Lista de exemplo S",
    exampleListL: "Lista de exemplo L",
    examplePreviewEmpty: "Nenhum nome de tópico carregado ainda.",
  },
  sportType: {
    label: "Quais esportes incluir",
  },
};
