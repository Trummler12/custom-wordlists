import type { TopicProse } from "./index";

/** Spanish topic prose. Mirrors `en.ts`; the wording is transcribed from the geography build
 *  scripts (see the PR plan §M). */
export const es: TopicProse = {
  sovereignty: {
    asymmetricAutonomy: "regiones autónomas cuyo amplio autogobierno está reconocido internacionalmente",
    deFactoRecognized: "estados plenamente soberanos reconocidos por muchos, aunque no todos, los miembros de la ONU",
    freeAssociation: "estados en libre asociación con otro, de reconocimiento limitado",
    deFactoNarrow: "estados con autogobierno pleno reconocidos por solo unos pocos miembros de la ONU",
    specialStatus: "territorios muy autónomos con presencia internacional propia, que muchos toman por países propios",
    pureDeFacto: "estados autoproclamados reconocidos por pocos o ningún miembro de la ONU",
    classicAutonomous: "territorios autónomos considerados internacionalmente parte de un Estado soberano",
  },
  coverage: {
    noCoverage: "países sin cobertura de Google Street View",
    rareCoverage: "países con cobertura de Street View muy escasa",
  },
  languageType: {
    dead: "lenguas muertas",
    extinct: "lenguas extintas",
    historical: "lenguas históricas",
    dialect: "dialectos",
    dialectGroup: "grupos de dialectos",
    languageGroup: "grupos de lenguas",
    languageFamily: "familias de lenguas",
    constructed: "lenguas construidas",
    fictional: "lenguas ficticias",
  },
  signLanguages: "lenguas de señas",
  ancientPlates: "placas antiguas y extintas",
  continentTiers: [
    "continentes y placas mayores",
    "placas menores y mayores",
    "microplacas con superficie medida y mayores",
    "microplacas y mayores, medidas o no",
    "placas tectónicas sin clasificación conocida",
  ],
  tier3Note: "Nunca se ha publicado la superficie de estas placas, así que este nivel se agrupa por la placa a la que pertenece cada una en lugar de ordenarse por tamaño, y varias ni siquiera tienen artículo propio.",
  noteLabel: "Nota: ",
  ruler: {
    countries: { text: "países con {condition} habitantes", empty: "Ordenados por población." },
    capitals: {
      text: "capitales de países con {condition} habitantes",
      empty: "Ordenadas por la población de su país.",
    },
    languages: { text: "idiomas con {condition} hablantes en el mundo", empty: "Ordenados por número de hablantes en el mundo." },
    continents: { text: "{condition}", empty: "Ordenadas por superficie de la placa (Bird 2003)." },
  },
  bands: {
    "100M": "100 millones",
    "30M": "30 millones",
    "20M": "20 millones",
    "10M": "10 millones",
    "5M": "5 millones",
    "3M": "3 millones",
    "1M": "1 millón",
    "300k": "300 000",
    "100k": "100 000",
    "30k": "30 000",
    "10k": "10 000",
    "3k": "3000",
    "1k": "1000",
  },
  more: (n) => `${n} o más`,
  aboveZero: "más de 0",
};
