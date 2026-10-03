import type { TopicProse } from "./index";

/** Japanese topic prose. Mirrors `en.ts`; the wording is transcribed from the geography build
 *  scripts (see the PR plan §M). */
export const ja: TopicProse = {
  sovereignty: {
    asymmetricAutonomy: "広範な自治が国際的に認められている自治地域",
    deFactoRecognized: "全てではないが多くの国連加盟国に承認された、完全な主権国家",
    freeAssociation: "他国と自由連合を結ぶ、承認が限られた国",
    deFactoNarrow: "ごく一部の国連加盟国のみに承認された、完全に自治を行う国家",
    specialStatus: "独自の国際的存在感を持ち、独自の国と見なされがちな高度な自治地域",
    pureDeFacto: "国連加盟国のごく一部にしか、あるいは全く承認されない自称国家",
    classicAutonomous: "国際的に主権国家の一部と見なされる自治地域",
  },
  coverage: {
    noCoverage: "Google ストリートビュー非対応の国",
    rareCoverage: "ストリートビューがまばらな国",
  },
  languageType: {
    dead: "死語",
    extinct: "消滅言語",
    historical: "歴史的言語",
    dialect: "方言",
    dialectGroup: "方言群",
    languageGroup: "語群",
    languageFamily: "語族",
    constructed: "人工言語",
    fictional: "架空言語",
  },
  signLanguages: "手話",
  ancientPlates: "古代・消滅したプレート",
  continentTiers: [
    "大陸と主要プレート",
    "小規模プレート以上",
    "面積が測定された微小プレート以上",
    "微小プレート以上、測定の有無を問わず",
    "分類不明の構造プレート",
  ],
  tier3Note: "これらのプレートの面積は公表されたことがないため、この段階は大きさ順ではなく所属するプレートごとにまとめてあります。独立した記事すらないものもいくつかあります。",
  noteLabel: "注：",
  ruler: {
    countries: { text: "人口が{condition}の国", empty: "人口順。" },
    capitals: {
      text: "人口が{condition}の国の首都",
      empty: "国の人口順。",
    },
    languages: { text: "世界の話者数が{condition}の言語", empty: "世界の話者数順。" },
    continents: { text: "{condition}", empty: "プレート面積順（Bird 2003）。" },
  },
  bands: {
    "100M": "1億",
    "30M": "3000万",
    "20M": "2000万",
    "10M": "1000万",
    "5M": "500万",
    "3M": "300万",
    "1M": "100万",
    "300k": "30万",
    "100k": "10万",
    "30k": "3万",
    "10k": "1万",
    "3k": "3000",
    "1k": "1000",
  },
  more: (n) => `${n}以上`,
  aboveZero: "0より多い",
};
