import type { TopicProse } from "./index";

/** Portuguese topic prose. Mirrors `en.ts`; the wording follows the reference, in the same
 *  Brazilian register as the chrome dictionary (see the PR plan §M). */
export const pt: TopicProse = {
  sovereignty: {
    asymmetricAutonomy: "regiões autônomas cujo amplo autogoverno é reconhecido internacionalmente",
    deFactoRecognized: "estados plenamente soberanos reconhecidos por muitos, embora não todos, membros da ONU",
    freeAssociation: "estados em livre associação com outro, com reconhecimento limitado",
    deFactoNarrow: "estados totalmente autogovernados reconhecidos por apenas alguns membros da ONU",
    specialStatus: "territórios altamente autônomos com presença internacional própria, muitas vezes tidos como países independentes",
    pureDeFacto: "estados autodeclarados reconhecidos por poucos ou nenhum membro da ONU",
    classicAutonomous: "territórios autônomos internacionalmente considerados parte de um Estado soberano",
  },
  coverage: {
    noCoverage: "países sem cobertura do Google Street View",
    rareCoverage: "países com cobertura apenas esparsa do Street View",
  },
  languageType: {
    dead: "línguas mortas",
    extinct: "línguas extintas",
    historical: "línguas históricas",
    dialect: "dialetos",
    dialectGroup: "grupos de dialetos",
    languageGroup: "grupos de línguas",
    languageFamily: "famílias linguísticas",
    constructed: "línguas construídas",
    fictional: "línguas fictícias",
  },
  signLanguages: "línguas de sinais",
  ancientPlates: "placas antigas e extintas",
  continentTiers: [
    "continentes e placas principais",
    "placas menores e maiores",
    "microplacas com área medida, e maiores",
    "microplacas e maiores, medidas ou não",
    "placas tectônicas de classificação desconhecida",
  ],
  tier3Note: "Nunca foi publicada uma área para estas placas, então este nível é agrupado pela placa sob a qual cada uma está, em vez de ordenado por tamanho — e várias delas também não têm um artigo de enciclopédia próprio.",
  noteLabel: "Observação: ",
  ruler: {
    countries: { text: "Países com {condition} habitantes", empty: "Ordenado por população." },
    capitals: {
      text: "Capitais de países com {condition} habitantes",
      empty: "Ordenado pela população do país.",
    },
    languages: { text: "Línguas com {condition} falantes no mundo", empty: "Ordenado por falantes no mundo." },
    continents: { text: "{condition}", empty: "Ordenado pela área das placas (Bird 2003)." },
  },
  bands: {
    "100M": "100 milhões",
    "30M": "30 milhões",
    "20M": "20 milhões",
    "10M": "10 milhões",
    "5M": "5 milhões",
    "3M": "3 milhões",
    "1M": "1 milhão",
    "300k": "300.000",
    "100k": "100.000",
    "30k": "30.000",
    "10k": "10.000",
    "3k": "3.000",
    "1k": "1.000",
  },
  more: (n) => `${n} ou mais`,
  aboveZero: "mais de 0",
};
