import type { TopicProse } from "./index";

/** German topic prose. Mirrors `en.ts`; the wording is transcribed from the geography build
 *  scripts (see the PR plan §M). */
export const de: TopicProse = {
  sovereignty: {
    asymmetricAutonomy: "autonome Regionen, deren weitreichende Selbstverwaltung völkerrechtlich anerkannt ist",
    deFactoRecognized: "vollständig souveräne Staaten, von vielen, aber nicht allen UN-Mitgliedern anerkannt",
    freeAssociation: "Staaten in freier Assoziation mit einem anderen, begrenzt anerkannt",
    deFactoNarrow: "vollständig selbstverwaltete Staaten, nur von wenigen UN-Mitgliedern anerkannt",
    specialStatus: "weitgehend autonome Gebiete mit eigenständigem internationalem Auftreten, die viele für eigene Länder halten",
    pureDeFacto: "selbsterklärte Staaten, von wenigen oder keinen UN-Mitgliedern anerkannt",
    classicAutonomous: "autonome Gebiete, die international als Teil eines souveränen Staates gelten",
  },
  coverage: {
    noCoverage: "Länder ohne Google-Street-View-Abdeckung",
    rareCoverage: "Länder mit nur spärlicher Street-View-Abdeckung",
  },
  languageType: {
    dead: "tote Sprachen",
    extinct: "ausgestorbene Sprachen",
    historical: "historische Sprachen",
    dialect: "Dialekte",
    dialectGroup: "Dialektgruppen",
    languageGroup: "Sprachgruppen",
    languageFamily: "Sprachfamilien",
    constructed: "konstruierte Sprachen",
    fictional: "fiktive Sprachen",
  },
  signLanguages: "Gebärdensprachen",
  ancientPlates: "urzeitliche und erloschene Platten",
  continentTiers: [
    "Kontinente und Grossplatten",
    "Kleinplatten und grösser",
    "Mikroplatten mit gemessener Fläche und grösser",
    "Mikroplatten und grösser, ob gemessen oder nicht",
    "tektonische Platten ohne bekannte Einordnung",
  ],
  tier3Note: "Für diese Platten wurde nie eine Fläche veröffentlicht, daher ist diese Stufe nach Mutterplatte gruppiert statt nach Grösse sortiert — und mehrere von ihnen haben nicht einmal einen eigenen Enzyklopädie-Artikel.",
  noteLabel: "Hinweis: ",
  ruler: {
    countries: { text: "Länder mit {condition} Einwohnern", empty: "Nach Einwohnerzahl geordnet." },
    capitals: {
      text: "Hauptstädte von Ländern mit {condition} Einwohnern",
      empty: "Nach Einwohnerzahl des Landes geordnet.",
    },
    languages: { text: "Sprachen mit {condition} Sprechern weltweit", empty: "Nach Sprecherzahl weltweit geordnet." },
    continents: { text: "{condition}", empty: "Nach Plattenfläche geordnet (Bird 2003)." },
  },
  bands: {
    "100M": "100 Millionen",
    "30M": "30 Millionen",
    "20M": "20 Millionen",
    "10M": "10 Millionen",
    "5M": "5 Millionen",
    "3M": "3 Millionen",
    "1M": "1 Million",
    "300k": "300.000",
    "100k": "100.000",
    "30k": "30.000",
    "10k": "10.000",
    "3k": "3.000",
    "1k": "1.000",
  },
  more: (n) => `${n} und mehr`,
  aboveZero: "mehr als 0",
};
