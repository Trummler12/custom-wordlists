import type { TopicProse } from "./index";

/** French topic prose. Mirrors `en.ts`; the wording is transcribed from the geography build
 *  scripts (see the PR plan §M). */
export const fr: TopicProse = {
  sovereignty: {
    asymmetricAutonomy: "régions autonomes dont la large autonomie est reconnue internationalement",
    deFactoRecognized: "états pleinement souverains reconnus par de nombreux membres de l'ONU, mais pas tous",
    freeAssociation: "états en libre association avec un autre, à reconnaissance limitée",
    deFactoNarrow: "états pleinement autonomes reconnus par seulement quelques membres de l'ONU",
    specialStatus: "territoires très autonomes à présence internationale propre, que beaucoup prennent pour des pays à part entière",
    pureDeFacto: "états autoproclamés reconnus par peu ou aucun membre de l'ONU",
    classicAutonomous: "territoires autonomes internationalement considérés comme partie d'un État souverain",
  },
  coverage: {
    noCoverage: "pays sans couverture Google Street View",
    rareCoverage: "pays à couverture Street View très rare",
  },
  languageType: {
    dead: "langues mortes",
    extinct: "langues éteintes",
    historical: "langues historiques",
    dialect: "dialectes",
    dialectGroup: "groupes de dialectes",
    languageGroup: "groupes de langues",
    languageFamily: "familles de langues",
    constructed: "langues construites",
    fictional: "langues fictives",
  },
  signLanguages: "langues des signes",
  ancientPlates: "plaques anciennes et éteintes",
  continentTiers: [
    "continents et plaques majeures",
    "plaques mineures et au-delà",
    "microplaques à superficie mesurée et au-delà",
    "microplaques et au-delà, mesurées ou non",
    "plaques tectoniques sans classification connue",
  ],
  tier3Note: "Aucune superficie n'a jamais été publiée pour ces plaques : ce niveau est donc regroupé par plaque parente plutôt que classé par taille, et plusieurs d'entre elles n'ont même pas d'article propre.",
  noteLabel: "Note : ",
  ruler: {
    countries: { text: "pays comptant {condition} habitants", empty: "Classés par population." },
    capitals: {
      text: "capitales de pays comptant {condition} habitants",
      empty: "Classées par la population de leur pays.",
    },
    languages: { text: "langues comptant {condition} locuteurs dans le monde", empty: "Classées par nombre de locuteurs dans le monde." },
    continents: { text: "{condition}", empty: "Classées par superficie des plaques (Bird 2003)." },
  },
  bands: {
    "100M": "100 millions",
    "30M": "30 millions",
    "20M": "20 millions",
    "10M": "10 millions",
    "5M": "5 millions",
    "3M": "3 millions",
    "1M": "1 million",
    "300k": "300 000",
    "100k": "100 000",
    "30k": "30 000",
    "10k": "10 000",
    "3k": "3 000",
    "1k": "1 000",
  },
  more: (n) => `${n} ou plus`,
  aboveZero: "plus de 0",
};
