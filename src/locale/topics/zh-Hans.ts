import type { TopicProse } from "./index";

/** Simplified Chinese topic prose. Mirrors `en.ts`; the wording is transcribed from the
 *  geography build scripts (see the PR plan §M). */
export const zhHans: TopicProse = {
  sovereignty: {
    asymmetricAutonomy: "拥有国际公认的广泛自治权的自治地区",
    deFactoRecognized: "获得许多（但非全部）联合国成员国承认的完全主权国家",
    freeAssociation: "与他国自由联合、获得有限承认的国家",
    deFactoNarrow: "仅获少数联合国成员国承认的完全自治国家",
    specialStatus: "拥有独特国际存在感、常被视为独立国家的高度自治地区",
    pureDeFacto: "仅获极少数或未获联合国成员国承认的自称国家",
    classicAutonomous: "国际上被视为某主权国家一部分的自治地区",
  },
  coverage: {
    noCoverage: "没有 Google 街景覆盖的国家",
    rareCoverage: "街景覆盖稀疏的国家",
  },
  languageType: {
    dead: "已消亡语言",
    extinct: "灭绝语言",
    historical: "历史语言",
    dialect: "方言",
    dialectGroup: "方言群",
    languageGroup: "语群",
    languageFamily: "语系",
    constructed: "人造语言",
    fictional: "虚构语言",
  },
  signLanguages: "手语",
  ancientPlates: "古代和已消亡的板块",
  continentTiers: [
    "大陆和主要板块",
    "小板块及以上",
    "有实测面积的微板块及以上",
    "微板块及以上，无论是否测量",
    "分类未知的构造板块",
  ],
  tier3Note: "这些板块从未公布过面积，因此本层按其所属板块分组，而非按大小排序——其中有几个甚至没有独立的百科条目。",
  noteLabel: "注：",
  ruler: {
    countries: { text: "人口为{condition}的国家", empty: "按人口排序。" },
    capitals: {
      text: "人口为{condition}的国家的首都",
      empty: "按所属国家的人口排序。",
    },
    languages: { text: "全球使用者为{condition}的语言", empty: "按全球使用者数排序。" },
    continents: { text: "{condition}", empty: "按板块面积排序（Bird 2003）。" },
  },
  bands: {
    "100M": "1亿",
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
  more: (n) => `${n}及以上`,
  aboveZero: "多于0",
};
