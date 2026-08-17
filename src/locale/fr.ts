import type { UIStrings } from "./index";

/** French UI strings. Machine-written and unreviewed by a native speaker — see
 *  the proofreading note in CONTRIBUTING.md. */
export const fr: UIStrings = {
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
  },
  names: {
    form: { short: "court", long: "long", both: "les deux" },
    formLabel: (group) => `Forme du nom pour ${group}`,
  },
  fame: {
    depthLabel: (group) => `Niveau de notoriété pour ${group}`,
    valueText: (depth, total) =>
      depth === 1 ? `premier palier sur ${total}` : `${depth} premiers paliers sur ${total}`,
    groupsDefined: (count) => `Paliers de notoriété définis : ${count}`,
    none: "Aucun palier de notoriété défini pour l'instant — voir la Contribution Guide en pied de page pour en proposer.",
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
  },
  language: {
    label: (current) => `Langue : ${current}`,
    menu: "Langue",
    unsupported: (language) =>
      `Pas encore confirmé pour ${language} — ce thème est peut-être incomplet.`,
    fallback: "L'anglais est utilisé là où une traduction manque.",
    // Les noms de langue sont masculins ; l'article s'élide devant une voyelle,
    // ce qui se décide sur la première lettre et nulle part ailleurs.
    usesEnglish: (primary, secondary) =>
      `${/^[aeiouéèêh]/i.test(primary) ? "L'" : "Le "}${primary}${secondary} utilise lui aussi officiellement les noms anglais.`,
    variant: {
      romaji: "Utiliser les rōmaji pour les entrées des listes",
      es419: "Utiliser l'espagnol d'Amérique latine pour les entrées des listes",
    },
    variantNote: { romaji: "Graphie Hepburn, voyelles longues doublées (Moomoomiruku).{br}Les rōmaji wāpuro ne sont pas proposés : ils remplaceraient les graphies officielles — Butterfree, pas Batafurii." },
    generatedRomaji:
      "Ces rōmaji ont été générés à partir des noms japonais. Si l'un d'eux s'écrit autrement, [dites-le nous](https://github.com/Trummler12/custom-wordlists/issues/new).",
    variantDiffers: (n) => `${n} entrée${n === 1 ? "" : "s"} s’écri${n === 1 ? "t" : "vent"} autrement`,
    variantShowList: "Voir lesquelles",
    useEnglish: (forced) =>
      forced
        ? "Utiliser cette liste dans la langue sélectionnée"
        : "Utiliser les entrées anglaises de cette liste",
    useEnglishAll: (allForced) =>
      allForced
        ? "Utiliser ces listes dans la langue sélectionnée"
        : "Utiliser les entrées anglaises de ces listes",
  },
  settings: {
    label: "Paramètres",
    showEnglish: "Afficher l'option d'utiliser les entrées anglaises",
    showEnglishEn: "Ces interrupteurs n'apparaissent que pour les langues autres que l'anglais.",
    interfaceLang: "Langue de l'interface :",
    interfaceAuto: "Automatique",
  },
  output: {
    label: "Résultat",
    copy: "Copier",
    copied: "Copié !",
    copyFailed: "Échec de la copie",
    copyManual: "La liste est sélectionnée — copiez-la vous-même.",
    empty: "Sélectionnez des thèmes ou des groupes pour créer une liste.",
    generatedList: "Liste de mots générée",
    words: "mots",
    chars: "caractères",
    belowMin: (min) => `· en dessous du minimum de skribbl (${min})`,
    overMax: "· au-dessus du maximum",
    overLong: (count, maxLen) =>
      `${count} mot${count === 1 ? "" : "s"} de plus de ${maxLen} caractères`,
  },
  footer: {
    repository: "Dépôt GitHub",
    helpOut: "Envie d'aider le projet ? Jetez un œil à la",
    // Le guide n'existe qu'en anglais, le lien garde donc son nom.
    contributionGuide: "Contribution Guide",
    helpOutAfter: " !",
  },
};
