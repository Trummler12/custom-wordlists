import type { LocaleDict } from "./index";

/** Italian UI strings. Machine-written and unreviewed by a native speaker — see
 *  the proofreading note in CONTRIBUTING.md. */
export const it: LocaleDict = {
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
    duplicatesRemoved: (count) => `${count} duplicat${count === 1 ? "o rimosso" : "i rimossi"}`,
    incompleteTopic: (url) => `Questo argomento è segnato come incompleto.{br}[Aiutaci ad aggiungere ciò che manca!](${url})`,
    plannedTopic: (url) => `Questo argomento è previsto, ma non è ancora pronto.{br}[Aiutaci a prepararne i dati!](${url})`,
    incompleteCategory: (url) =>
      `Questa categoria contiene argomenti segnati come incompleti.{br}[Aiutaci ad aggiungere ciò che manca!](${url})`,
    plannedCategory: (url) =>
      `Questa categoria contiene argomenti previsti che non sono ancora pronti.{br}[Aiutaci a prepararne i dati!](${url})`,
    plannedUnselectable: "Gli argomenti previsti non si possono ancora selezionare",
  },
  names: {
    form: { pref: "pref.", short: "corto", long: "lungo", both: "entrambi", all: "tutti" },
    formLabel: (group) => `Forma del nome per ${group}`,
    formHint: {
      short: "Preferisci i nomi corti",
      long: "Preferisci i nomi completi/ufficiali",
      both: "Usa i nomi corti E quelli completi",
      pref: "Usa solo l'etichetta principale",
      all: "Usa TUTTE le varianti disponibili",
    },
  },
  fame: {
    depthLabel: (group) => `Livello di notorietà per ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `primo livello di ${total}` : `primi ${depth} livelli di ${total}`,
    groupsDefined: (count) => `Gruppi di notorietà definiti: ${count}`,
    none: "Nessun gruppo di notorietà definito finora. Vedi la Contribution Guide nel piè di pagina per proporne!",
    selected: "Selezione:",
    mostlySelected: "Selezione maggioritaria:",
    stored: (body) => `(Memorizzato: ${body})`,
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
    upTo: (n) => `Fino a ${n}`,
    unknown: (n, primary, secondary) =>
      `Fino a ${n} voc${n === 1 ? "e" : "i"} senza nome in ${primary}${secondary} nei dati di origine`,
    unknownHint: (omitted) =>
      omitted
        ? "Attiva per includerle con il loro nome inglese, l'unico conosciuto."
        : "Attiva per tralasciarle di nuovo.",
    unknownTier: (tier, n) => `Livello ${tier}: ${n} voc${n === 1 ? "e interessata" : "i interessate"}`,
    tooLong: (n, maxLen) =>
      `Fino a ${n} nom${n === 1 ? "e" : "i"} di oltre ${maxLen} caratteri`,
    tooLongHint: (omitted) =>
      omitted
        ? "Attiva per includerli comunque: skribbl.io non li accetta, ma un altro gioco potrebbe."
        : "Attiva per tralasciarli di nuovo.",
    helpAdd: (url) => `; [aiutaci ad aggiungere ciò che manca!](${url})`,
    tooShort: (n, minLen) => `Fino a ${n} nom${n === 1 ? "e" : "i"} di meno di ${minLen} caratteri`,
    tooShortHint: (omitted) =>
      omitted ? "Attiva per includerli comunque." : "Attiva per tralasciarli di nuovo.",
    separatorIn: (n, sep, removing) =>
      `Fino a ${n} nom${n === 1 ? "e" : "i"} che ${removing ? (n === 1 ? "{i}conterrebbe{/i}" : "{i}conterrebbero{/i}") : n === 1 ? "contiene" : "contengono"} il separatore scelto ({code}${sep}{/code})`,
    separatorHint: (omitted, removing) =>
      omitted
        ? removing
          ? "Attiva per tenerli, senza il separatore."
          : "Attiva per includerli comunque: skribbl.io li spezzerebbe al separatore."
        : removing
          ? "Attiva per tralasciarli invece di togliere il separatore."
          : "Attiva per tralasciarli di nuovo.",
  },
  coverage: {
    label: "Geoguessr / Copertura Street View",
    all: "Tutti i paesi",
    withCoverage: "Con copertura ufficiale",
    reliable: "Solo copertura affidabile",
  },
  languageType: {
    label: "Quali tipi di lingua includere",
    base: "Lingue moderne vive",
    submillion: "Anche lingue con <1 milione di utenti",
    notRecommended: "Poco adatto al disegno informale: assai meno noto di quanto suggerisca il numero di parlanti.",
    toggle: (included) =>
      included
        ? "Spuntato: sono nell'elenco. Togli la spunta per escluderle."
        : "Spunta per aggiungerle all'elenco.",
  },
  sovereignty: {
    label: "Sovranità e riconoscimento",
    wiki: "https://it.wikipedia.org/wiki/Stato_a_riconoscimento_limitato",
    axisRow: "de iure",
    axisCol: "de facto",
    cols: ["Pienamente indipendente", "Parzialmente autonomo"],
    rows: ["Riconoscimento universale", "Ampio riconoscimento", "Riconoscimento parziale", "Senza riconoscimento"],
    colDefs: [
      "Gestisce da sé confini, giustizia, esercito e tasse.",
      "Ha leggi e parlamento propri, ma condivide competenze fondamentali (moneta, difesa, politica estera) con un altro Stato.",
    ],
    rowDefs: [
      "Stato membro dell'ONU, riconosciuto da quasi tutti gli altri.",
      "Riconosciuto da gran parte dei membri dell'ONU, con alcune eccezioni.",
      "Riconosciuto solo da pochi Stati, spesso però con forte presenza funzionale o percepita.",
      "Considerato a livello internazionale parte di un altro Stato sovrano.",
    ],
    regular: "Stati regolari",
  },
  language: {
    label: (current) => `Lingua: ${current}`,
    unsupported: (language) =>
      `Non ancora confermato per ${language}; questo argomento potrebbe essere incompleto.`,
    fallback: "Dove manca una traduzione viene usato l'inglese.",
    // L'articolo si elide davanti a vocale, il che si decide sulla prima lettera.
    usesEnglish: (primary, secondary) =>
      `Anche ${/^[aeiou]/i.test(primary) ? "l'" : "il "}${primary}${secondary} usa ufficialmente i nomi inglesi.`,
    variant: {
      romaji: "Usare i rōmaji per le voci delle liste",
      es419: "Usare lo spagnolo latinoamericano per le voci delle liste",
    },
    variantNote: { romaji: "Grafia Hepburn con vocali lunghe raddoppiate (Moomoomiruku).{br}I rōmaji wāpuro NON sono supportati: entrerebbero in conflitto con le grafie ufficiali (Butterfree, non Batafurii),{br}e risolvere questo e i problemi che ne derivano va oltre gli scopi attuali." },
    generatedRomaji:
      "Questi rōmaji sono stati generati dai nomi giapponesi. Se uno si scrive diversamente, non esitare a [farcelo sapere](https://github.com/Trummler12/custom-wordlists/issues/new)!",
    variantDiffers: (n) => `${n} voc${n === 1 ? "e si scrive" : "i si scrivono"} in modo diverso`,
    variantShowList: "Vedi quali",
    panelTitle: "Impostazioni della lingua",
    slot: { primary: "Principale:", interface: "Interfaccia:", fallback: "Riserva interfaccia:" },
    slotHint: {
      primary: "Lingua principale delle voci delle liste e valore predefinito per la maggior parte delle altre impostazioni della lingua.",
      interface: "La lingua dell'interfaccia in particolare.",
      fallback: "Usata dove la lingua dell'interfaccia non ha una traduzione.{br}Se manca anche qui, viene usato l'inglese.",
    },
    followPrimary: "{i}Principale{/i}",
    showSecondaryBefore: "Mostra l'opzione per usare le voci in", showSecondaryAfter: "",
    showSecondaryHint:
      "Permette, per esempio, di usare i nomi dei paesi nella tua lingua madre e i nomi dei personaggi delle serie nella lingua di doppiaggio che preferisci.",
    secondaryMoot: "Questi interruttori compaiono solo finché la lingua principale e quella secondaria sono diverse.",
    flagType: "Tipo di bandiera:",
    flagTypes: { country: "Paese", mixed: "Mista", linguistic: "Linguistica" },
    useSecondary: (forced, secondary) =>
      forced ? "Usa questa lista nella lingua selezionata" : `Usa le voci di questa lista in ${secondary}`,
    useSecondaryAll: (allForced, secondary) =>
      allForced
        ? "Usa queste liste nella lingua selezionata"
        : `Usa le voci di queste liste in ${secondary}`,
  },
  settings: {
    label: "Impostazioni",
    reset: "Ripristina le impostazioni{br}di selezione",
    resetConfirm: "Clicca di nuovo per confermare",
    resetCancel: "Annulla",
    outputSeparator: "Separatore di output:",
    outputSeparatorHint:
      "skribbl.io accetta solo {code},{/code} come separatore. Gli altri cambiano soltanto ciò che viene copiato; il risultato appare uguale in ogni caso.",
    charLimits: "Limiti di caratteri:",
    minChars: "Min",
    maxChars: "Max",
    removeSeparator: (sep) => `Togli {code}${sep}{/code} dai nomi`,
    charMaxOver: (gameMax) => `skribbl.io accetta al massimo ${gameMax} caratteri per nome.`,
    scriptLimitsHint:
      "Limiti per i nomi nella scrittura propria di questa lingua, in cui un singolo carattere rappresenta di solito un'intera sillaba o parola. I rōmaji e gli altri nomi in lettere latine seguono i limiti generali.",
    showTopicsBefore: "Mostra argomenti:",
    showTopicsAfter: "",
    showTopicsKind: { incomplete: "incompleti", planned: "previsti", all: "tutti" },
    showTopicsHint:
      "Agli argomenti incompleti mancano ancora delle voci. Gli argomenti previsti sono annunciati, ma non si possono ancora selezionare.",
  },
  output: {
    label: "Risultato",
    copy: "Copia",
    copied: "Copiato!",
    copyFailed: "Copia non riuscita",
    copyManual: "L'elenco è selezionato: copialo tu.",
    empty: "Seleziona argomenti, categorie o liste personalizzate per generare un output.",
    generatedList: "Lista di parole generata",
    words: "parole",
    chars: "caratteri",
    belowMin: (min) => `· sotto il minimo di skribbl (${min})`,
    overMax: "· oltre il massimo",
    overLong: (count, maxLen) =>
      `${count} parol${count === 1 ? "a" : "e"} di oltre ${maxLen} caratteri`,
    splitting: (count, sep) =>
      `${count} parol${count === 1 ? "a" : "e"} con il separatore "${sep}" (spezzat${count === 1 ? "a" : "e"} quando si incolla)`,
  },
  footer: {
    repository: "Repository GitHub",
    helpOut: "Vuoi dare una mano al progetto? Dai pure un'occhiata alla",
    // La guida esiste solo in inglese, quindi il link conserva il suo nome.
    contributionGuide: "Contribution Guide",
    helpOutAfter: "!",
  },
  coveragePage: {
    home: "App principale",
    topicLabel: "Argomento:",
    uiLanguage: "Lingua dell'interfaccia",
    title: "Copertura linguistica",
    intro: "Scegli un argomento per vedere per quali lingue Wikidata ha già un'etichetta, per voce.",
    lead: "I contenuti di questo argomento provengono da [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). La tabella mostra per quali lingue ogni voce ha già un'etichetta.",
    notesTitle: "Come contribuire",
    noteAdd: "Apri una voce dalla prima colonna e, una volta effettuato l'accesso, aggiungi qualsiasi etichetta mancante di cui sei sicuro.",
    noteLabelLister: "Per aggiungere una lingua non elencata affatto, vai nelle tue [preferenze di Wikidata](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets) e attiva il gadget {i}labelLister{/i} nella scheda «Accessori»; ogni voce mostrerà allora una «Labels list» (in alto a destra, sotto Strumenti) che accetta qualsiasi codice lingua.",
    noteProtected: "Alcune voci di Wikidata sono protette e possono essere modificate solo con un account vecchio almeno quattro giorni e con 100 o più modifiche.",
    noteStale: "Tieni presente che questa tabella proviene da un dump manuale, quindi la copertura qui mostrata può essere indietro di diverse settimane o persino mesi rispetto allo stato attuale su Wikidata.",
    itemCount: (n) => `${n.toLocaleString()} voci`,
    uiOnly: "Solo lingue dell'interfaccia",
    uiOnlyHint: "I dump di dati grezzi coprono già ogni lingua supportata da skribbl.io,{br}più qualcuna in più con molti utenti.{br}Quindi i dati supportano già ogni lingua prevista,{br}mentre l'interfaccia è curata da noi maintainer e naturalmente resta molto indietro.{br}E ha poco senso voler aggiungere una nuova lingua d'interfaccia{br}finché quasi nessun argomento copre quella lingua.{br}Ma più persone aiutano, prima vengono approvate nuove lingue.{br}=> Dai pure un'occhiata alla Contribution Guide qui sotto!",
    item: "Voce",
    numeric: { population: "Popolazione", area: "Superficie (km{smaller sup}2{/smaller sup})", users: "Utenti", atomicNumber: "Numero atomico", wikipedias: "Wikipedie" },
    first: "Prima pagina",
    prev: "Pagina precedente",
    next: "Pagina successiva",
    last: "Ultima pagina",
    pageParts: (current, total) => ["", `Pagina ${current}`, ` / ${total}`],
    loading: (topic) => `Caricamento di ${topic}…`,
    loadError: (topic, message) => `Impossibile caricare la copertura di ${topic}: ${message}`,
    pageJumpHint: (numeric) =>
      numeric
        ? `Clic: vai a una pagina, a un nome di voce (in inglese) o a un valore di "${numeric}"`
        : "Clic: vai a una pagina o a un nome di voce (in inglese)",
    pageJumpInput: "Pagina, valore o nome di voce",
    pageNoNumeric: "Questa tabella non ha colonne numeriche.",
  },
  tip: {
    unpin: "Sblocca",
  },
  custom: {
    title: "Custom",
    infoHint:
      "Usa il campo di immissione qui sotto per aggiungere liste di parole tue.{br}" +
      "Valgono queste regole:{br}" +
      "- Tutti gli elementi sono separati da uno stesso carattere separatore, uguale in tutto il testo.{br}" +
      "- Evita gli elementi che contengono il separatore stesso.{br}" +
      "- A ogni modifica del contenuto, il separatore viene rilevato automaticamente come il carattere separatore più frequente.{br}" +
      "- skribbl.io ignora la punteggiatura, gli altri caratteri speciali e gli spazi iniziali o finali; una parte viene già ripulita qui.",
    separatorLabel: "Separatore:",
    separatorPick: "Carattere separatore",
    internalDupes: (n) => `${n} voc${n === 1 ? "e duplicata" : "i duplicate"} all'interno di una lista Custom attiva`,
    localDupes: (n) => `${n} duplicat${n === 1 ? "o" : "i"} tra le tue liste Custom attive`,
    globalDupes: (n) => `${n} duplicat${n === 1 ? "o" : "i"} con gli argomenti selezionati`,
    dupesNote: "I duplicati vengono ridotti a una sola copia nel risultato.",
    dupesNoteSave: "I duplicati all'interno di una lista vengono rimossi anche al salvataggio.",
    dupesSamples: {
      internal: "Duplicati interni:",
      local: "Duplicati tra le tue liste Custom attive:",
      global: "Duplicati con gli argomenti selezionati:",
    },
    fitToggle: "Adatta il campo alla sua altezza completa",
    fewerRows: "Mostra meno righe",
    moreRows: "Mostra più righe",
    moreRowsOver: (steps) => `(${steps} pass${steps === 1 ? "o" : "i"} oltre l'altezza del contenuto)`,
    clearHint: "Svuota il campo di immissione Custom",
    clearConfirm: "Stai per svuotare il campo di immissione Custom.",
    clearConfirmButton: "Clicca qui per confermare",
    listsLabel: "Liste salvate",
    listsTitle: "Liste Custom salvate",
    listsInfo:
      "Le liste Custom sono salvate nell'archiviazione locale.{br}" +
      "Ogni browser ha la propria archiviazione locale,{br}" +
      "separata da altri browser o dispositivi.{br}" +
      "Per portare altrove le tue liste Custom,{br}" +
      "esportale qui e importale a destinazione.{br}{br}" +
      "{b}IMPORTANTE{/b}: esporta le tue liste dopo ogni modifica importante " +
      "e conserva queste esportazioni come backup; varie azioni del browser " +
      "possono svuotare l'archiviazione locale, e Safari la svuota persino in automatico " +
      "quando un sito non viene visitato per 7 giorni.",
    listActivate: "Usa questa lista",
    listRename: "Rinomina",
    listSave: "Salva il testo attuale in questa lista",
    listLoad: "Carica questa lista nel campo di immissione",
    listDelete: "Elimina questa lista",
    listUp: "Sposta su",
    listDown: "Sposta giù",
    listSaveNew: "Salva il testo attuale come nuova lista",
    phActivate: "Il segnaposto NON si può usare",
    phRename: "Il segnaposto NON si può rinominare",
    phLoad: "Il segnaposto NON si può caricare",
    phDelete: "Il segnaposto NON si può eliminare",
    phMove: "Il segnaposto NON si può spostare",
    exportLabel: "Esporta liste",
    exportTitle: "Esporta le liste salvate",
    selectAll: "Seleziona tutto",
    exportDownload: "Scarica",
    importLabel: "Importa liste",
    importTitle: "Importa liste salvate",
    importColName: "Nome",
    importColSize: "Dimensione",
    importColDupes: "Dupl.",
    importColWith: "con",
    importButton: "Importa selezione",
    importEmpty: "Nessuna lista salvata in questo file.",
    importDupesSecondary: (pct) => `Secondario: ${pct}`,
    listReplaceConfirm: (name) => `Sostituire la lista "${name}" con il testo attuale?`,
    listDeleteConfirm: (name) => `Eliminare la lista "${name}"?`,
    listLoadConfirm: "Sovrascrivere il campo di immissione con questa lista?",
    confirm: "Conferma",
    cancel: "Annulla",
    charsLabel: "Caratteri che skribbl.io probabilmente ignora",
    charsIgnored: "Caratteri che skribbl.io probabilmente ignora:",
    charsProblematic: "Caratteri problematici:",
    charsTolerated: "Caratteri tollerati:",
    charsRemove: "Valuta di togliere questo carattere.",
    charsLists: "Liste interessate:",
    inputName: "{i}Campo di immissione{/i}",
    charsAccepted: "Caratteri accettati:",
    charsRemoveMaybe: "Forse conviene togliere questo carattere.",
    charsLone: (char, partner) => `{code}${char}{/code} isolato, senza il corrispondente {code}${partner}{/code};`,
    charsPaired: (open, close) => `Come parte di una coppia {code}${open}{/code}-{code}${close}{/code};`,
    cleanChars: "La tua lista contiene caratteri speciali insoliti che possono essere tolti al salvataggio:",
    cleanDupes: (n) =>
      `La tua lista contiene ${n} duplicat${n === 1 ? "o interno, che verrà rimosso" : "i interni, che verranno rimossi"} al salvataggio:`,
    settingsLabel: "Impostazioni Custom",
    settingsTitle: "Impostazioni Custom",
    maxPreviewItems: "Max elementi in anteprima",
    maxPreviewChars: "Max caratteri in anteprima",
    exampleListS: "Lista di esempio S",
    exampleListL: "Lista di esempio L",
    examplePreviewEmpty: "Nessun nome di argomento ancora caricato.",
  },
  sportType: {
    label: "Quali sport includere",
  },
};
