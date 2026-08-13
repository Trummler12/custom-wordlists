import type { UIStrings } from "./index";

/** Italian UI strings. Machine-written and unreviewed by a native speaker — see
 *  the proofreading note in CONTRIBUTING.md. */
export const it: UIStrings = {
  header: {
    taglineBefore: "Crea liste di parole personalizzate per",
    taglineAfter: "e giochi di parole simili.",
  },
  tree: {
    topics: "Argomenti",
    loading: "Caricamento degli argomenti…",
    loadError: (message) => `Impossibile caricare gli argomenti: ${message}`,
    empty: "Nessun argomento disponibile per ora.",
    toggle: (expanded, title) => `${expanded ? "Comprimi" : "Espandi"} ${title}`,
    loadingShort: "caricamento…",
    wordsOf: (selected, total) => `${selected} di ${total} parol${total === 1 ? "a" : "e"}`,
  },
  names: {
    form: { short: "corto", long: "lungo", both: "entrambi" },
    formLabel: (group) => `Forma del nome per ${group}`,
  },
  fame: {
    depthLabel: (group) => `Livello di notorietà per ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `primo livello di ${total}` : `primi ${depth} livelli di ${total}`,
    groupsDefined: (count) => `Gruppi di notorietà definiti: ${count}`,
    none: "Nessun gruppo di notorietà definito finora — vedi la Contribution Guide nel piè di pagina per proporne.",
    toggle: (shown) =>
      shown
        ? "Nascondi il righello di notorietà di questa lista"
        : "Mostra il righello di notorietà di questa lista",
    toggleAll: (allShown) =>
      allShown ? "Nascondi questi righelli di notorietà" : "Mostra questi righelli di notorietà",
  },
  omitted: {
    label: "Ciò che questa lista tralascia",
    title: "Escluso da questa lista:",
    toggle: (omitted) =>
      omitted ? "Attiva per includerli nella tua lista" : "Attiva per tralasciarli",
    locked: "Sono dati di gioco e non parole, quindi non si possono aggiungere.",
    unknown: (n, primary, secondary) =>
      `${n} voc${n === 1 ? "e" : "i"} senza nome in ${primary}${secondary} nei dati di origine`,
    unknownHint: (omitted) =>
      omitted
        ? "Attiva per includerle con il loro nome inglese, l'unico conosciuto."
        : "Attiva per tralasciarle di nuovo.",
  },
  language: {
    label: (current) => `Lingua: ${current}`,
    menu: "Lingua",
    unsupported: (language) =>
      `Non ancora confermato per ${language} — questo argomento potrebbe essere incompleto.`,
    fallback: "Dove manca una traduzione viene usato l'inglese.",
    // L'articolo si elide davanti a vocale, il che si decide sulla prima lettera.
    usesEnglish: (primary, secondary) =>
      `Anche ${/^[aeiou]/i.test(primary) ? "l'" : "il "}${primary}${secondary} usa ufficialmente i nomi inglesi.`,
    variant: {
      romaji: "Usare i rōmaji per le voci delle liste",
      es419: "Usare lo spagnolo latinoamericano per le voci delle liste",
    },
    variantDiffers: (n) => `${n} voc${n === 1 ? "e si scrive" : "i si scrivono"} in modo diverso`,
    variantShowList: "Vedi quali",
    useEnglish: (forced) =>
      forced
        ? "Usa questa lista nella lingua selezionata"
        : "Usa le voci inglesi di questa lista",
    useEnglishAll: (allForced) =>
      allForced
        ? "Usa queste liste nella lingua selezionata"
        : "Usa le voci inglesi di queste liste",
  },
  settings: {
    label: "Impostazioni",
    showEnglish: "Mostra l'opzione per usare le voci inglesi",
    showEnglishEn: "Questi interruttori compaiono solo per lingue diverse dall'inglese.",
    interfaceLang: "Lingua dell'interfaccia:",
    interfaceAuto: "Automatico",
  },
  output: {
    label: "Risultato",
    copy: "Copia",
    copied: "Copiato!",
    empty: "Seleziona argomenti o gruppi per creare una lista.",
    generatedList: "Lista di parole generata",
    words: "parole",
    chars: "caratteri",
    belowMin: (min) => `· sotto il minimo di skribbl (${min})`,
    overMax: "· oltre il massimo",
    excluded: (count, maxLen, list) =>
      `${count} parol${count === 1 ? "a esclusa" : "e escluse"} (più di ${maxLen} caratteri): ${list}`,
  },
  footer: {
    repository: "Repository GitHub",
    helpOut: "Vuoi dare una mano al progetto? Dai un'occhiata alla",
    // La guida esiste solo in inglese, quindi il link conserva il suo nome.
    contributionGuide: "Contribution Guide",
    helpOutAfter: "!",
  },
};
