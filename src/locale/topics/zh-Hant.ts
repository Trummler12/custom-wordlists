import type { TopicProse } from "./index";

/** Traditional Chinese topic prose. Mirrors `en.ts`; the wording is transcribed from the
 *  geography build scripts (see the PR plan §M). */
export const zhHant: TopicProse = {
  sovereignty: {
    asymmetricAutonomy: "擁有國際公認的廣泛自治權的自治地區",
    deFactoRecognized: "獲得許多（但非全部）聯合國成員國承認的完全主權國家",
    freeAssociation: "與他國自由聯合、獲得有限承認的國家",
    deFactoNarrow: "僅獲少數聯合國成員國承認的完全自治國家",
    specialStatus: "擁有獨特國際存在感、常被視為獨立國家的高度自治地區",
    pureDeFacto: "僅獲極少數或未獲聯合國成員國承認的自稱國家",
    classicAutonomous: "國際上被視為某主權國家一部分的自治地區",
  },
  coverage: {
    noCoverage: "沒有 Google 街景覆蓋的國家",
    rareCoverage: "街景覆蓋稀疏的國家",
  },
  languageType: {
    dead: "已消亡語言",
    extinct: "滅絕語言",
    historical: "歷史語言",
    dialect: "方言",
    dialectGroup: "方言群",
    languageGroup: "語群",
    languageFamily: "語系",
    constructed: "人造語言",
    fictional: "虛構語言",
  },
  signLanguages: "手語",
  ancientPlates: "古代和已消亡的板塊",
  continentTiers: [
    "大陸和主要板塊",
    "小板塊及以上",
    "有實測面積的微板塊及以上",
    "微板塊及以上，無論是否測量",
    "分類未知的構造板塊",
  ],
  tier3Note: "這些板塊從未公佈過面積，因此本層按其所屬板塊分組，而非按大小排序——其中有幾個甚至沒有獨立的百科條目。",
  noteLabel: "註：",
  ruler: {
    countries: { text: "人口為{condition}的國家", empty: "按人口排序。" },
    capitals: {
      text: "人口為{condition}的國家的首都",
      empty: "按所屬國家的人口排序。",
    },
    languages: { text: "全球使用者為{condition}的語言", empty: "按全球使用者數排序。" },
    continents: { text: "{condition}", empty: "按板塊面積排序（Bird 2003）。" },
  },
  bands: {
    "100M": "1億",
    "30M": "3000萬",
    "20M": "2000萬",
    "10M": "1000萬",
    "5M": "500萬",
    "3M": "300萬",
    "1M": "100萬",
    "300k": "30萬",
    "100k": "10萬",
    "30k": "3萬",
    "10k": "1萬",
    "3k": "3000",
    "1k": "1000",
  },
  more: (n) => `${n}及以上`,
  aboveZero: "多於0",
};
