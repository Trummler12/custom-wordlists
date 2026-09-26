import type { UIStrings } from "./index";
import { en } from "./en";

/** Portuguese UI strings. Machine-written and unreviewed by a native speaker — see the
 *  proofreading note in CONTRIBUTING.md. Written in a Brazilian register, the larger
 *  player base; the tag stays the generic `pt`, which `matchTag` widens pt-BR/pt-PT onto.
 *  Portuguese pluralizes like English (one vs. the rest), so the counters just branch on
 *  `n === 1` inline rather than through a helper. */
export const pt: UIStrings = {
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
  },
  names: {
    form: { pref: "pref.", short: "curta", long: "longa", both: "ambas", all: "todas" },
    formHint: en.names.formHint, // English stopgap until the UI-language PR translates it.
    formLabel: (group) => `Forma do nome para ${group}`,
  },
  fame: {
    depthLabel: (group) => `Profundidade de fama para ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `nível mais alto de ${total}` : `${depth} níveis mais altos de ${total}`,
    groupsDefined: (count) => `Grupos de fama definidos: ${count}`,
    none: "Nenhum grupo de fama definido ainda — veja o Contribution Guide no rodapé para propor alguns!",
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
        ? "Alternar para incluí-las com seus nomes em inglês — os únicos conhecidos para elas."
        : "Alternar para deixá-las de fora novamente.",
    unknownTier: (tier, n) => `Nível ${tier}: ${n} ${n === 1 ? "entrada" : "entradas"}`,
    tooLong: (n, maxLen) => `Até ${n} ${n === 1 ? "nome" : "nomes"} com mais de ${maxLen} caracteres`,
    tooLongHint: (omitted) =>
      omitted
        ? "Alternar para incluí-los mesmo assim — o skribbl.io não os aceita, mas outro jogo pode."
        : "Alternar para deixá-los de fora novamente.",
    helpAdd: (url) => ` — [ajude-nos a adicionar o que falta!](${url})`,
  },
  // custom: English stopgap until the UI-language PR translates it (§X).
  custom: en.custom,
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
        ? "Marcado — estão na lista. Desmarque para deixá-los de fora."
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
      "Tem suas próprias leis e parlamento, mas compartilha poderes essenciais — moeda, defesa, política externa — com outro Estado.",
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
    menu: "Idioma",
    // LB1 stopgaps: English until the translation pass.
    panelTitle: en.language.panelTitle,
    slot: en.language.slot,
    slotHint: en.language.slotHint,
    followPrimary: en.language.followPrimary,
    showSecondaryBefore: en.language.showSecondaryBefore, showSecondaryAfter: en.language.showSecondaryAfter,
    showSecondaryHint: en.language.showSecondaryHint,
    secondaryMoot: en.language.secondaryMoot,
    useSecondary: en.language.useSecondary,
    useSecondaryAll: en.language.useSecondaryAll,
    unsupported: (language) => `Ainda não confirmado para ${language} — este tópico pode estar incompleto.`,
    fallback: "O inglês é usado onde falta uma tradução.",
    usesEnglish: (primary, secondary) =>
      `${primary}${secondary} também usa oficialmente os nomes em inglês.`,
    variant: {
      romaji: "Usar romaji para as entradas da lista",
      es419: "Usar espanhol latino-americano para as entradas da lista",
    },
    variantNote: { romaji: "Grafias Hepburn com vogais longas duplicadas (Moomoomiruku).{br}O romaji wāpuro não é oferecido: substituiria as grafias oficiais — Butterfree, não Batafurii." },
    generatedRomaji:
      "Estes romaji foram gerados a partir dos nomes japoneses. Se algum tiver grafia diferente na prática, [avise-nos](https://github.com/Trummler12/custom-wordlists/issues/new).",
    variantDiffers: (n) => `${n} ${n === 1 ? "entrada" : "entradas"} com grafia diferente`,
    variantShowList: "Mostrar quais",
    useEnglish: (forced) =>
      forced ? "Usar esta lista no idioma selecionado" : "Usar as entradas em inglês desta lista",
    useEnglishAll: (allForced) =>
      allForced
        ? "Usar estas listas no idioma selecionado"
        : "Usar as entradas em inglês destas listas",
  },
  settings: {
    label: "Configurações",
    showEnglish: "Mostrar a opção de usar entradas em inglês",
    showEnglishEn: "Estas opções aparecem apenas para idiomas diferentes do inglês.",
    interfaceLang: "Idioma da interface:",
    interfaceAuto: "Automático",
    // LB1 stopgaps: English until the translation pass.
    outputSeparator: en.settings.outputSeparator,
    outputSeparatorHint: en.settings.outputSeparatorHint,
    minChars: en.settings.minChars,
    maxChars: en.settings.maxChars,
    reset: "Redefinir configurações{br}para o padrão",
    resetConfirm: "Clique novamente para confirmar",
    resetCancel: "Cancelar",
  },
  output: {
    label: "Saída",
    copy: "Copiar",
    copied: "Copiado!",
    copyFailed: "Falha ao copiar",
    copyManual: "A lista está selecionada — copie-a você mesmo.",
    empty: "Selecione tópicos ou grupos para montar uma lista.",
    generatedList: "Lista de palavras gerada",
    words: "palavras",
    chars: "caracteres",
    belowMin: (min) => `· abaixo do mínimo do skribbl (${min})`,
    overMax: "· acima do máximo",
    overLong: (count, maxLen) =>
      `${count} ${count === 1 ? "palavra" : "palavras"} com mais de ${maxLen} caracteres`,
  },
  footer: {
    repository: "Repositório no GitHub",
    helpOut: "Quer ajudar no projeto? Confira o",
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
    noteLabelLister: "Para adicionar um idioma que não esteja listado, ative o gadget labelLister nas suas [preferências da Wikidata](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets), em Gadgets; cada item passará a mostrar uma “Labels list” (canto superior direito, em Ferramentas) que aceita qualquer código de idioma.",
    noteProtected: "Alguns itens da Wikidata são protegidos e exigem uma conta com pelo menos quatro dias e 100 ou mais edições para serem alterados.",
    noteStale: "Observe que esta tabela vem de um dump manual, então a cobertura mostrada aqui pode estar atrasada em relação ao estado atual da Wikidata em até várias semanas.",
    itemCount: (n) => `${n.toLocaleString()} ${n === 1 ? "item" : "itens"}`,
    uiOnly: "Apenas idiomas da interface",
    uiOnlyHint: "Os dumps de dados brutos já cobrem todos os idiomas que o skribbl.io suporta,{br}além de alguns outros com muitos usuários.{br}Ou seja, os dados já suportam todos os idiomas planejados,{br}enquanto a interface é mantida por nós, os mantenedores, e naturalmente fica bem atrás.{br}E há pouco sentido em tentar adicionar um novo idioma de interface{br}enquanto quase nenhum tópico cobre esse idioma ainda.{br}Mas quanto mais gente ajuda, mais cedo novos idiomas são aprovados!{br}=> Confira o Contribution Guide abaixo!",
    item: "Item",
    numeric: { population: "População", area: "Área (km²)", users: "Usuários" },
    first: "Primeira página",
    prev: "Página anterior",
    next: "Próxima página",
    last: "Última página",
    page: (current, total) => `Página ${current} / ${total}`,
    // LB1 stopgaps: English until the translation pass.
    pageJumpHint: en.coveragePage.pageJumpHint,
    pageJumpInput: en.coveragePage.pageJumpInput,
    pageNoNumeric: en.coveragePage.pageNoNumeric,
    loading: (topic) => `Carregando ${topic}…`,
    loadError: (topic, message) => `Não foi possível carregar a cobertura de ${topic}: ${message}`,
  },
};
