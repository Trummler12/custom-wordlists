import type { TopicProse } from "./index";

/** Korean topic prose. Mirrors `en.ts`; the wording is transcribed from the geography build
 *  scripts (see the PR plan §M). */
export const ko: TopicProse = {
  sovereignty: {
    asymmetricAutonomy: "폭넓은 자치가 국제적으로 인정된 자치 지역",
    deFactoRecognized: "전부는 아니지만 다수의 유엔 회원국이 승인한 완전한 주권 국가",
    freeAssociation: "다른 나라와 자유연합을 맺은, 승인이 제한된 국가",
    deFactoNarrow: "소수의 유엔 회원국만이 승인한, 완전한 자치 국가",
    specialStatus: "독자적 국제적 존재감을 지녀 독립국으로 여겨지곤 하는 고도 자치 지역",
    pureDeFacto: "유엔 회원국 중 극소수만이 또는 전혀 승인하지 않는 자칭 국가",
    classicAutonomous: "국제적으로 주권 국가의 일부로 여겨지는 자치 지역",
  },
  coverage: {
    noCoverage: "구글 스트리트 뷰가 없는 국가",
    rareCoverage: "스트리트 뷰가 드문 국가",
  },
  languageType: {
    dead: "사멸 언어",
    extinct: "소멸 언어",
    historical: "역사적 언어",
    dialect: "방언",
    dialectGroup: "방언군",
    languageGroup: "어군",
    languageFamily: "어족",
    constructed: "인공어",
    fictional: "가공의 언어",
  },
  signLanguages: "수어",
  ancientPlates: "고대·소멸한 판",
  continentTiers: [
    "대륙과 주요 판",
    "소규모 판 이상",
    "면적이 측정된 미소판 이상",
    "미소판 이상, 측정 여부와 무관",
    "분류가 알려지지 않은 판",
  ],
  tier3Note: "이 판들은 면적이 공표된 적이 없어 이 단계는 크기순이 아니라 상위 판별로 묶여 있으며, 그중 몇몇은 독립된 문서조차 없습니다.",
  noteLabel: "참고: ",
  ruler: {
    countries: { text: "인구가 {condition}인 국가", empty: "인구순 정렬." },
    capitals: {
      text: "인구가 {condition}인 국가의 수도",
      empty: "해당 국가의 인구순 정렬.",
    },
    languages: { text: "전 세계 사용자 수가 {condition}인 언어", empty: "전 세계 사용자 수 기준 정렬." },
    continents: { text: "{condition}", empty: "판 면적 순 (Bird 2003)." },
  },
  bands: {
    "100M": "1억",
    "30M": "3000만",
    "20M": "2000만",
    "10M": "1000만",
    "5M": "500만",
    "3M": "300만",
    "1M": "100만",
    "300k": "30만",
    "100k": "10만",
    "30k": "3만",
    "10k": "1만",
    "3k": "3000",
    "1k": "1000",
  },
  more: (n) => `${n} 이상`,
  aboveZero: "0보다 많음",
};
