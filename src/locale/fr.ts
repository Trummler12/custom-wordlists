import type { LocaleDict } from "./index";

/** French UI strings. Machine-written and unreviewed by a native speaker — see
 *  the proofreading note in CONTRIBUTING.md. */
export const fr: LocaleDict = {
  header: {
    taglineBefore: "Créez des listes de mots personnalisées pour",
    taglineAfter: "et des jeux de mots similaires.",
  },
  tree: {
    topics: "Thèmes",
    loading: "Chargement des thèmes…",
    loadError: (message) => `Impossible de charger les thèmes : ${message}`,
    empty: "Aucun thème disponible pour le moment.",
    toggle: (expanded, title) => `${expanded ? "Réduire" : "Développer"} ${title}`,
    loadingShort: "chargement…",
    wordsOf: (selected, total) => `${selected} sur ${total} mot${total === 1 ? "" : "s"}`,
    duplicatesRemoved: (count) => `${count} doublon${count === 1 ? "" : "s"} supprimé${count === 1 ? "" : "s"}`,
    incompleteTopic: (url) => `Ce thème est marqué comme incomplet.{br}[Aidez-nous à ajouter ce qui manque !](${url})`,
    plannedTopic: (url) => `Ce thème est prévu, mais pas encore prêt.{br}[Aidez-nous à préparer ses données !](${url})`,
    incompleteCategory: (url) =>
      `Cette catégorie contient des thèmes marqués comme incomplets.{br}[Aidez-nous à ajouter ce qui manque !](${url})`,
    plannedCategory: (url) =>
      `Cette catégorie contient des thèmes prévus qui ne sont pas encore prêts.{br}[Aidez-nous à préparer leurs données !](${url})`,
    plannedUnselectable: "Les thèmes prévus ne peuvent pas encore être sélectionnés",
  },
  names: {
    form: { pref: "préf.", short: "court", long: "long", both: "les deux", all: "tous" },
    formLabel: (group) => `Forme du nom pour ${group}`,
    formHint: {
      short: "Préférer les noms courts",
      long: "Préférer les noms complets/officiels",
      both: "Utiliser les noms courts ET complets",
      pref: "Utiliser uniquement le libellé principal",
      all: "Utiliser TOUTES les variantes disponibles",
    },
  },
  fame: {
    depthLabel: (group) => `Niveau de notoriété pour ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `premier palier sur ${total}` : `${depth} premiers paliers sur ${total}`,
    groupsDefined: (count) => `Paliers de notoriété définis : ${count}`,
    none: "Aucun palier de notoriété défini pour l'instant. Voir la Contribution Guide en pied de page pour en proposer !",
    selected: "Sélection :",
    mostlySelected: "Sélection majoritaire :",
    stored: (body) => `(Enregistré : ${body})`,
    toggle: (shown) =>
      shown
        ? "Masquer la règle de notoriété de cette liste"
        : "Afficher la règle de notoriété de cette liste",
    toggleAll: (allShown) =>
      allShown ? "Masquer ces règles de notoriété" : "Afficher ces règles de notoriété",
  },
  omitted: {
    label: "Ce que cette liste laisse de côté",
    title: "Exclu de cette liste :",
    toggle: (omitted) =>
      omitted ? "Activer pour les inclure dans votre liste" : "Activer pour les laisser de côté",
    locked: "Ce sont des données de jeu et non des mots : impossible de les ajouter.",
    upTo: (n) => `Jusqu'à ${n}`,
    unknown: (n, primary, secondary) =>
      `Jusqu'à ${n} entrée${n === 1 ? "" : "s"} sans nom en ${primary}${secondary} dans les données source`,
    unknownHint: (omitted) =>
      omitted
        ? "Activer pour les inclure sous leur nom anglais, le seul connu."
        : "Activer pour les laisser de côté à nouveau.",
    unknownTier: (tier, n) => `Niveau ${tier} : ${n} entrée${n === 1 ? "" : "s"} concernée${n === 1 ? "" : "s"}`,
    tooLong: (n, maxLen) =>
      `Jusqu'à ${n} nom${n === 1 ? "" : "s"} de plus de ${maxLen} caractères`,
    tooLongHint: (omitted) =>
      omitted
        ? "Activer pour les inclure quand même : skribbl.io les refuse, mais un autre jeu peut les accepter."
        : "Activer pour les laisser de côté à nouveau.",
    helpAdd: (url) => ` ; [aidez-nous à ajouter ce qui manque !](${url})`,
    tooShort: (n, minLen) => `Jusqu'à ${n} nom${n === 1 ? "" : "s"} de moins de ${minLen} caractères`,
    tooShortHint: (omitted) =>
      omitted ? "Activer pour les inclure quand même." : "Activer pour les laisser de côté à nouveau.",
    separatorIn: (n, sep, removing) =>
      `Jusqu'à ${n} nom${n === 1 ? "" : "s"} qui ${removing ? (n === 1 ? "{i}contiendrait{/i}" : "{i}contiendraient{/i}") : n === 1 ? "contient" : "contiennent"} le séparateur choisi ({code}${sep}{/code})`,
    separatorHint: (omitted, removing) =>
      omitted
        ? removing
          ? "Activer pour les conserver, sans le séparateur."
          : "Activer pour les inclure quand même : skribbl.io les couperait au séparateur."
        : removing
          ? "Activer pour les laisser de côté au lieu de retirer le séparateur."
          : "Activer pour les laisser de côté à nouveau.",
  },
  coverage: {
    label: "Geoguessr / Couverture Street View",
    all: "Tous les pays",
    withCoverage: "Avec couverture officielle",
    reliable: "Couverture fiable uniquement",
  },
  languageType: {
    label: "Quels types de langues inclure",
    base: "Langues modernes vivantes",
    submillion: "Aussi les langues de <1 million d'utilisateurs",
    notRecommended: "Peu adapté au dessin détente : bien moins connu que son nombre de locuteurs ne le laisse penser.",
    toggle: (included) =>
      included
        ? "Coché : elles sont dans la liste. Décochez pour les exclure."
        : "Cochez pour les ajouter à la liste.",
  },
  sovereignty: {
    label: "Souveraineté et reconnaissance",
    wiki: "https://fr.wikipedia.org/wiki/Liste_des_États_non_reconnus_internationalement",
    axisRow: "de jure",
    axisCol: "de facto",
    cols: ["Pleinement indépendant", "Partiellement autonome"],
    rows: ["Reconnaissance universelle", "Large reconnaissance", "Reconnaissance partielle", "Sans reconnaissance"],
    colDefs: [
      "Gère ses frontières, sa justice, son armée et ses impôts.",
      "Dispose de ses propres lois et de son parlement, mais partage des compétences clés (monnaie, défense, politique étrangère) avec un autre État.",
    ],
    rowDefs: [
      "État membre de l'ONU, reconnu par presque tous les autres.",
      "Reconnu par une grande partie des membres de l'ONU, avec quelques réticents.",
      "Reconnu par seulement quelques États, mais souvent avec une forte présence fonctionnelle ou perçue.",
      "Considéré internationalement comme partie d'un autre État souverain.",
    ],
    regular: "États réguliers",
  },
  language: {
    label: (current) => `Langue : ${current}`,
    unsupported: (language) =>
      `Pas encore confirmé pour ${language} ; ce thème est peut-être incomplet.`,
    fallback: "L'anglais est utilisé là où une traduction manque.",
    // Les noms de langue sont masculins ; l'article s'élide devant une voyelle,
    // ce qui se décide sur la première lettre et nulle part ailleurs.
    usesEnglish: (primary, secondary) =>
      `${/^[aeiouéèêh]/i.test(primary) ? "L'" : "Le "}${primary}${secondary} utilise lui aussi officiellement les noms anglais.`,
    variant: {
      romaji: "Utiliser les rōmaji pour les entrées des listes",
      es419: "Utiliser l'espagnol d'Amérique latine pour les entrées des listes",
    },
    variantNote: { romaji: "Graphie Hepburn, voyelles longues doublées (Moomoomiruku).{br}Les rōmaji wāpuro ne sont PAS pris en charge : ils entreraient en conflit avec les graphies officielles (Butterfree, pas Batafurii),{br}et résoudre ce problème et ceux qui en découlent dépasse le cadre actuel." },
    generatedRomaji:
      "Ces rōmaji ont été générés à partir des noms japonais. Si l'un d'eux s'écrit autrement, n'hésitez pas à [nous le dire](https://github.com/Trummler12/custom-wordlists/issues/new) !",
    variantDiffers: (n) => `${n} entrée${n === 1 ? "" : "s"} s’écri${n === 1 ? "t" : "vent"} autrement`,
    variantShowList: "Voir lesquelles",
    panelTitle: "Paramètres de langue",
    slot: { primary: "Principale :", interface: "Interface :", fallback: "Repli de l'interface :" },
    slotHint: {
      primary: "Langue principale des entrées des listes, et valeur par défaut de la plupart des autres paramètres de langue.",
      interface: "La langue de l'interface en particulier.",
      fallback: "Utilisée là où la langue de l'interface n'a pas de traduction.{br}Si elle manque ici aussi, l'anglais est utilisé.",
    },
    followPrimary: "{i}Principale{/i}",
    showSecondaryBefore: "Afficher l'option d'utiliser les entrées en", showSecondaryAfter: "",
    showSecondaryHint:
      "Permet par exemple d'utiliser les noms de pays dans votre langue maternelle et les noms de personnages de séries dans votre langue de doublage préférée.",
    secondaryMoot: "Ces interrupteurs n'apparaissent que tant que la langue principale et la langue secondaire diffèrent.",
    flagType: "Type de drapeau :",
    flagTypes: { country: "Pays", mixed: "Mixte", linguistic: "Linguistique" },
    useSecondary: (forced, secondary) =>
      forced ? "Utiliser cette liste dans la langue sélectionnée" : `Utiliser les entrées de cette liste en ${secondary}`,
    useSecondaryAll: (allForced, secondary) =>
      allForced
        ? "Utiliser ces listes dans la langue sélectionnée"
        : `Utiliser les entrées de ces listes en ${secondary}`,
  },
  settings: {
    label: "Paramètres",
    reset: "Réinitialiser les réglages{br}de sélection",
    resetConfirm: "Cliquez à nouveau pour confirmer",
    resetCancel: "Annuler",
    outputSeparator: "Séparateur de sortie :",
    outputSeparatorHint:
      "skribbl.io n'accepte que {code},{/code} comme séparateur. Les autres ne changent que ce qui est copié ; le résultat s'affiche de la même façon dans tous les cas.",
    charLimits: "Limites de caractères :",
    minChars: "Min",
    maxChars: "Max",
    removeSeparator: (sep) => `Retirer {code}${sep}{/code} des noms`,
    charMaxOver: (gameMax) => `skribbl.io accepte au plus ${gameMax} caractères par nom.`,
    scriptLimitsHint:
      "Limites pour les noms dans l'écriture propre à cette langue, où un seul caractère représente en général une syllabe ou un mot entier. Les rōmaji et les autres noms en lettres latines suivent les limites générales.",
    showTopicsBefore: "Afficher les thèmes :",
    showTopicsAfter: "",
    showTopicsKind: { incomplete: "incomplets", planned: "prévus", all: "tous" },
    showTopicsHint:
      "Il manque encore des entrées aux thèmes incomplets. Les thèmes prévus sont annoncés, mais ne peuvent pas encore être sélectionnés.",
  },
  output: {
    label: "Résultat",
    copy: "Copier",
    copied: "Copié !",
    copyFailed: "Échec de la copie",
    copyManual: "La liste est sélectionnée ; copiez-la vous-même.",
    empty: "Sélectionnez des thèmes, des catégories ou des listes personnalisées pour générer une sortie.",
    generatedList: "Liste de mots générée",
    words: "mots",
    chars: "caractères",
    belowMin: (min) => `· en dessous du minimum de skribbl (${min})`,
    overMax: "· au-dessus du maximum",
    overLong: (count, maxLen) =>
      `${count} mot${count === 1 ? "" : "s"} de plus de ${maxLen} caractères`,
    splitting: (count, sep) =>
      `${count} mot${count === 1 ? "" : "s"} contenant le séparateur "${sep}" (coupé${count === 1 ? "" : "s"} au collage)`,
  },
  footer: {
    repository: "Dépôt GitHub",
    helpOut: "Envie d'aider le projet ? N'hésitez pas à jeter un œil à la",
    // Le guide n'existe qu'en anglais, le lien garde donc son nom.
    contributionGuide: "Contribution Guide",
    helpOutAfter: " !",
  },
  coveragePage: {
    home: "Application principale",
    topicLabel: "Thème :",
    uiLanguage: "Langue de l'interface",
    title: "Couverture linguistique",
    intro: "Choisissez un thème pour voir pour quelles langues Wikidata dispose déjà d'un libellé, par élément.",
    lead: "Le contenu de ce thème provient de [Wikidata](https://www.wikidata.org/wiki/Wikidata:Main_Page). Le tableau montre pour quelles langues chaque élément dispose déjà d'un libellé.",
    notesTitle: "Comment aider",
    noteAdd: "Ouvrez un élément depuis la première colonne et, une fois connecté, ajoutez tout libellé manquant dont vous êtes sûr.",
    noteLabelLister: "Pour ajouter une langue qui n'apparaît pas du tout, allez dans vos [préférences Wikidata](https://www.wikidata.org/wiki/Special:Preferences#mw-prefsection-gadgets) et activez le gadget {i}labelLister{/i} dans l'onglet « Gadgets » ; chaque élément affiche alors une « Labels list » (en haut à droite, sous Outils) qui accepte n'importe quel code de langue.",
    noteProtected: "Certains éléments de Wikidata sont protégés et ne peuvent être modifiés qu'avec un compte âgé d'au moins quatre jours et comptant 100 modifications ou plus.",
    noteStale: "Notez que ce tableau provient d'un export manuel ; la couverture affichée ici peut donc accuser un retard de plusieurs semaines, voire de plusieurs mois, sur l'état actuel de Wikidata.",
    itemCount: (n) => `${n.toLocaleString()} éléments`,
    uiOnly: "Langues de l'interface seulement",
    uiOnlyHint: "Les données brutes couvrent déjà toutes les langues prises en charge par skribbl.io,{br}plus quelques autres à nombreux utilisateurs.{br}Les données prennent donc déjà en charge toutes les langues prévues,{br}tandis que l'interface est entretenue par nous, les mainteneurs, et accuse donc naturellement un net retard.{br}Et il ne sert pas à grand-chose de vouloir ajouter une nouvelle langue d'interface{br}tant que presque aucun sujet ne couvre cette langue.{br}Mais plus il y a d'aide, plus vite de nouvelles langues sont validées !{br}=> N'hésitez pas à jeter un œil à la Contribution Guide ci-dessous !",
    item: "Élément",
    numeric: { population: "Population", area: "Superficie (km{smaller sup}2{/smaller sup})", users: "Utilisateurs", atomicNumber: "Numéro atomique", wikipedias: "Wikipédias" },
    first: "Première page",
    prev: "Page précédente",
    next: "Page suivante",
    last: "Dernière page",
    pageParts: (current, total) => ["", `Page ${current}`, ` / ${total}`],
    loading: (topic) => `Chargement de ${topic}…`,
    loadError: (topic, message) => `Impossible de charger la couverture de ${topic} : ${message}`,
    pageJumpHint: (numeric) =>
      numeric
        ? `Clic : aller à une page, à un nom d'entrée (en anglais) ou à une valeur de « ${numeric} »`
        : "Clic : aller à une page ou à un nom d'entrée (en anglais)",
    pageJumpInput: "Page, valeur ou nom d'entrée",
    pageNoNumeric: "Ce tableau n'a pas de colonne numérique.",
  },
  tip: {
    unpin: "Détacher",
  },
  custom: {
    title: "Custom",
    infoHint:
      "Utilisez le champ de saisie ci-dessous pour ajouter vos propres listes de mots.{br}" +
      "Les règles suivantes s'appliquent :{br}" +
      "- Tous les éléments sont séparés par un même caractère séparateur, identique dans toute la saisie.{br}" +
      "- Évitez les éléments qui contiennent eux-mêmes le séparateur.{br}" +
      "- À chaque modification du contenu, le séparateur est détecté automatiquement comme le caractère séparateur le plus fréquent.{br}" +
      "- skribbl.io ignore la ponctuation, les autres caractères spéciaux et les espaces en début ou en fin ; une partie est déjà nettoyée ici même.",
    separatorLabel: "Séparateur :",
    separatorPick: "Caractère séparateur",
    internalDupes: (n) => `${n} entrée${n === 1 ? "" : "s"} en double dans une liste Custom active`,
    localDupes: (n) => `${n} doublon${n === 1 ? "" : "s"} entre vos listes Custom actives`,
    globalDupes: (n) => `${n} doublon${n === 1 ? "" : "s"} avec les thèmes sélectionnés`,
    dupesNote: "Les doublons sont réduits à un seul exemplaire dans le résultat.",
    dupesNoteSave: "Les doublons au sein d'une liste sont aussi supprimés à l'enregistrement.",
    dupesSamples: {
      internal: "Doublons internes :",
      local: "Doublons entre vos listes Custom actives :",
      global: "Doublons avec les thèmes sélectionnés :",
    },
    fitToggle: "Ajuster le champ à toute sa hauteur",
    fewerRows: "Afficher moins de lignes",
    moreRows: "Afficher plus de lignes",
    moreRowsOver: (steps) => `(${steps} cran${steps === 1 ? "" : "s"} au-dessus de la hauteur du contenu)`,
    clearHint: "Vider le champ de saisie Custom",
    clearConfirm: "Vous êtes sur le point de vider le champ de saisie Custom.",
    clearConfirmButton: "Cliquez ici pour confirmer",
    listsLabel: "Listes enregistrées",
    listsTitle: "Listes Custom enregistrées",
    listsInfo:
      "Les listes Custom sont enregistrées dans le stockage local.{br}" +
      "Chaque navigateur a son propre stockage local,{br}" +
      "séparé des autres navigateurs ou appareils.{br}" +
      "Pour emporter vos listes Custom ailleurs,{br}" +
      "exportez-les ici et importez-les à destination.{br}{br}" +
      "{b}IMPORTANT{/b} : exportez vos listes après chaque modification importante " +
      "et conservez ces exports comme sauvegarde ; diverses actions du navigateur " +
      "peuvent vider votre stockage local, et Safari le vide même automatiquement " +
      "lorsqu'un site n'a pas été visité pendant 7 jours.",
    listActivate: "Utiliser cette liste",
    listRename: "Renommer",
    listSave: "Enregistrer la saisie actuelle dans cette liste",
    listLoad: "Charger cette liste dans le champ de saisie",
    listDelete: "Supprimer cette liste",
    listUp: "Monter",
    listDown: "Descendre",
    listSaveNew: "Enregistrer la saisie actuelle comme nouvelle liste",
    phActivate: "Impossible d'utiliser l'emplacement vide",
    phRename: "Impossible de renommer l'emplacement vide",
    phLoad: "Impossible de charger l'emplacement vide",
    phDelete: "Impossible de supprimer l'emplacement vide",
    phMove: "Impossible de déplacer l'emplacement vide",
    exportLabel: "Exporter les listes",
    exportTitle: "Exporter les listes enregistrées",
    selectAll: "Tout sélectionner",
    exportDownload: "Télécharger",
    importLabel: "Importer des listes",
    importTitle: "Importer des listes enregistrées",
    importColName: "Nom",
    importColSize: "Taille",
    importColDupes: "Doublons",
    importColWith: "avec",
    importButton: "Importer la sélection",
    importEmpty: "Aucune liste enregistrée dans ce fichier.",
    importDupesSecondary: (pct) => `Secondaire : ${pct}`,
    listReplaceConfirm: (name) => `Remplacer la liste « ${name} » par la saisie actuelle ?`,
    listDeleteConfirm: (name) => `Supprimer la liste « ${name} » ?`,
    listLoadConfirm: "Écraser le champ de saisie avec cette liste ?",
    confirm: "Confirmer",
    cancel: "Annuler",
    charsLabel: "Caractères que skribbl.io ignore probablement",
    charsIgnored: "Caractères que skribbl.io ignore probablement :",
    charsProblematic: "Caractères problématiques :",
    charsTolerated: "Caractères tolérés :",
    charsRemove: "Pensez à retirer ce caractère.",
    charsLists: "Listes concernées :",
    inputName: "{i}Champ de saisie{/i}",
    charsAccepted: "Caractères acceptés :",
    charsRemoveMaybe: "Il vaudrait peut-être mieux retirer ce caractère.",
    charsLone: (char, partner) => `{code}${char}{/code} isolé, sans {code}${partner}{/code} correspondant ;`,
    charsPaired: (open, close) => `Dans une paire {code}${open}{/code}-{code}${close}{/code} ;`,
    cleanChars: "Votre liste contient des caractères spéciaux inhabituels qui peuvent être retirés à l'enregistrement :",
    cleanDupes: (n) =>
      `Votre liste contient ${n} doublon${n === 1 ? "" : "s"} interne${n === 1 ? "" : "s"}, qui ${n === 1 ? "sera supprimé" : "seront supprimés"} à l'enregistrement :`,
    settingsLabel: "Paramètres Custom",
    settingsTitle: "Paramètres Custom",
    maxPreviewItems: "Éléments max. dans l'aperçu",
    maxPreviewChars: "Caractères max. dans l'aperçu",
    exampleListS: "Liste d'exemple S",
    exampleListL: "Liste d'exemple L",
    examplePreviewEmpty: "Aucun nom de thème chargé pour l'instant.",
  },
  sportType: {
    label: "Quels sports inclure",
  },
};
