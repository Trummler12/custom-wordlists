import type { TopicProse } from "./index";

/** Italian topic prose. Mirrors `en.ts`; the wording is transcribed from the geography build
 *  scripts (see the PR plan §M). */
export const it: TopicProse = {
  sovereignty: {
    asymmetricAutonomy: "regioni autonome la cui ampia autonomia è riconosciuta a livello internazionale",
    deFactoRecognized: "stati pienamente sovrani riconosciuti da molti, ma non tutti, i membri dell'ONU",
    freeAssociation: "stati in libera associazione con un altro, dal riconoscimento limitato",
    deFactoNarrow: "stati pienamente autogovernati riconosciuti solo da pochi membri dell'ONU",
    specialStatus: "territori molto autonomi con una presenza internazionale propria, che molti scambiano per paesi a sé",
    pureDeFacto: "stati autoproclamati riconosciuti da pochi o nessun membro dell'ONU",
    classicAutonomous: "territori autonomi considerati a livello internazionale parte di uno Stato sovrano",
  },
  coverage: {
    noCoverage: "paesi senza copertura di Google Street View",
    rareCoverage: "paesi con copertura Street View molto scarsa",
  },
  languageType: {
    dead: "lingue morte",
    extinct: "lingue estinte",
    historical: "lingue storiche",
    dialect: "dialetti",
    dialectGroup: "gruppi di dialetti",
    languageGroup: "gruppi di lingue",
    languageFamily: "famiglie di lingue",
    constructed: "lingue costruite",
    fictional: "lingue fittizie",
  },
  signLanguages: "lingue dei segni",
  ancientPlates: "placche antiche ed estinte",
  continentTiers: [
    "continenti e placche maggiori",
    "placche minori e maggiori",
    "microplacche con superficie misurata e maggiori",
    "microplacche e maggiori, misurate o no",
    "placche tettoniche senza classificazione nota",
  ],
  tier3Note: "Per queste placche non è mai stata pubblicata una superficie, quindi questo livello è raggruppato per placca madre anziché ordinato per dimensione, e diverse non hanno nemmeno una voce propria.",
  noteLabel: "Nota: ",
  ruler: {
    countries: { text: "paesi con {condition} abitanti", empty: "Ordinati per popolazione." },
    capitals: {
      text: "capitali di paesi con {condition} abitanti",
      empty: "Ordinate per la popolazione del loro paese.",
    },
    languages: { text: "lingue con {condition} parlanti nel mondo", empty: "Ordinate per numero di parlanti nel mondo." },
    continents: { text: "{condition}", empty: "Ordinate per superficie delle placche (Bird 2003)." },
  },
  bands: {
    "100M": "100 milioni",
    "30M": "30 milioni",
    "20M": "20 milioni",
    "10M": "10 milioni",
    "5M": "5 milioni",
    "3M": "3 milioni",
    "1M": "1 milione",
    "300k": "300.000",
    "100k": "100.000",
    "30k": "30.000",
    "10k": "10.000",
    "3k": "3.000",
    "1k": "1.000",
  },
  more: (n) => `${n} o più`,
  aboveZero: "più di 0",
};
