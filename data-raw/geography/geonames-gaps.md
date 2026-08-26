# GeoNames gaps — data-raw/geography

Generated 2026-08-26 by `scripts/geography/report-geonames-gaps.mjs` (read-only).

Every row is a name the build still takes from the Wikidata `.txt` dumps because
geonames does not yet carry it in a usable form. Close each at geonames.org, then a
re-dump (W2) makes the `.txt` files redundant for W3 to purge.

- **absent** — geonames has no name for that language; add the Wikidata name as an
  alternate name (flag it preferred where it should be the default).
- **not-pref** — geonames has the name but would not pick it as the default once the
  anchor is gone; set the preferred flag on the Wikidata name (or accept the shown
  geonames pref as the new default).

**Countries:** 46 gap(s) across 46 entit(y/ies) — by lang: zh-Hans 46.
- of those, 45 already sit in geonames under a sibling tag (the same Han glyph filed as zh-Hant) — a build-side script fallback closes these, no geonames edit.

**Capitals:** 471 gap(s) across 185 entit(y/ies) — by lang: zh-Hant 138 · zh-Hans 95 · it 46 · es 42 · ko 37 · ja 36 · de 31 · fr 27 · en 19.
- absent 439 · not-pref 32; 104 of the absent ones sit under a sibling tag. The bulk is thin per-city alternateNames — weigh whether closing these by hand stays "überschaubar".

## Countries

### India — geonames 1269750 (https://www.geonames.org/1269750)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 印度                            | —                   | zh-Hant                |

### Pakistan — geonames 1168579 (https://www.geonames.org/1168579)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 巴基斯坦                        | —                   | zh-Hant                |

### Brazil — geonames 3469034 (https://www.geonames.org/3469034)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 巴西                            | —                   | zh-Hant                |

### Russia — geonames 2017370 (https://www.geonames.org/2017370)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 俄罗斯                          | —                   | zh-Hant                |

### Mexico — geonames 3996063 (https://www.geonames.org/3996063)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 墨西哥                          | —                   | zh-Hant                |

### Japan — geonames 1861060 (https://www.geonames.org/1861060)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 日本                            | —                   | ja, zh-Hant            |

### Egypt — geonames 357994 (https://www.geonames.org/357994)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 埃及                            | —                   | zh-Hant                |

### Vietnam — geonames 1562822 (https://www.geonames.org/1562822)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 越南                            | —                   | zh-Hant                |

### Iran — geonames 130758 (https://www.geonames.org/130758)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 伊朗                            | —                   | zh-Hant                |

### Turkey — geonames 298795 (https://www.geonames.org/298795)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 土耳其                          | —                   | zh-Hant                |

### South Africa — geonames 953987 (https://www.geonames.org/953987)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 南非                            | —                   | zh-Hant                |

### Spain — geonames 2510769 (https://www.geonames.org/2510769)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 西班牙                          | —                   | zh-Hant                |

### Argentina — geonames 3865483 (https://www.geonames.org/3865483)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 阿根廷                          | —                   | zh-Hant                |

### Afghanistan — geonames 1149361 (https://www.geonames.org/1149361)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 阿富汗                          | —                   | zh-Hant                |

### Iraq — geonames 99237 (https://www.geonames.org/99237)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 伊拉克                          | —                   | zh-Hant                |

### Canada — geonames 6251999 (https://www.geonames.org/6251999)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 加拿大                          | —                   | zh-Hant                |

### Morocco — geonames 2542007 (https://www.geonames.org/2542007)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 摩洛哥                          | —                   | zh-Hant                |

### Angola — geonames 3351879 (https://www.geonames.org/3351879)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 安哥拉                          | —                   | zh-Hant                |

### Chile — geonames 3895114 (https://www.geonames.org/3895114)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 智利                            | —                   | zh-Hant                |

### Cambodia — geonames 1831722 (https://www.geonames.org/1831722)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 柬埔寨                          | —                   | zh-Hant                |

### Cuba — geonames 3562981 (https://www.geonames.org/3562981)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 古巴                            | —                   | zh-Hant                |

### Haiti — geonames 3723988 (https://www.geonames.org/3723988)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 海地                            | —                   | zh-Hant                |

### Czech Republic — geonames 3077311 (https://www.geonames.org/3077311)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 捷克                            | —                   | zh-Hant                |

### Sweden — geonames 2661886 (https://www.geonames.org/2661886)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 瑞典                            | —                   | zh-Hant                |

### Portugal — geonames 2264397 (https://www.geonames.org/2264397)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 葡萄牙                          | —                   | zh-Hant                |

### United Arab Emirates — geonames 290557 (https://www.geonames.org/290557)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 阿拉伯联合酋长国                | —                   | zh-Hant                |

### Israel — geonames 294640 (https://www.geonames.org/294640)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 以色列                          | —                   | zh-Hant                |

### Hungary — geonames 719819 (https://www.geonames.org/719819)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 匈牙利                          | —                   | zh-Hant                |

### Switzerland — geonames 2658434 (https://www.geonames.org/2658434)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 瑞士                            | —                   | zh-Hant                |

### Togo — geonames 2363686 (https://www.geonames.org/2363686)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 多哥                            | —                   | zh-Hant                |

### Paraguay — geonames 3437598 (https://www.geonames.org/3437598)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 巴拉圭                          | —                   | zh-Hant                |

### Lebanon — geonames 272103 (https://www.geonames.org/272103)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 黎巴嫩                          | —                   | zh-Hant                |

### Norway — geonames 3144096 (https://www.geonames.org/3144096)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 挪威                            | —                   | zh-Hant                |

### Slovakia — geonames 3057568 (https://www.geonames.org/3057568)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 斯洛伐克                        | —                   | zh-Hant                |

### Palestine — geonames 6254930 (https://www.geonames.org/6254930)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 巴勒斯坦                        | —                   | zh-Hant                |

### Central African Republic — geonames 239880 (https://www.geonames.org/239880)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 中非共和国                      | —                   | zh-Hant                |

### Nicaragua — geonames 3617476 (https://www.geonames.org/3617476)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 尼加拉瓜                        | —                   | zh-Hant                |

### Oman — geonames 286963 (https://www.geonames.org/286963)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 阿曼                            | —                   | zh-Hant                |

### Mauritania — geonames 2378080 (https://www.geonames.org/2378080)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 毛里塔尼亚                      | —                   | zh-Hant                |

### Kuwait — geonames 285570 (https://www.geonames.org/285570)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 科威特                          | —                   | zh-Hant                |

### Lithuania — geonames 597427 (https://www.geonames.org/597427)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 立陶宛                          | —                   | zh-Hant                |

### Kosovo — geonames 831053 (https://www.geonames.org/831053)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 科索沃                          | —                   | zh-Hant                |

### Bahrain — geonames 290291 (https://www.geonames.org/290291)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 巴林                            | —                   | zh-Hant                |

### Bhutan — geonames 1252634 (https://www.geonames.org/1252634)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 不丹                            | —                   | zh-Hant                |

### Federated States of Micronesia — geonames 2081918 (https://www.geonames.org/2081918)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 密克罗尼西亚联邦                | —                   | —                      |

### Dominica — geonames 3575830 (https://www.geonames.org/3575830)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 多米尼克                        | —                   | zh-Hant                |

## Capitals

### Beijing — geonames 1816670 (https://www.geonames.org/1816670)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| de      | not-pref | Peking                          | Beijing             | —                      |
| ko      | absent   | 베이징시                            | 베이징                 | —                      |
| zh-Hans | not-pref | 北京市                          | 北京                | —                      |
| zh-Hant | absent   | 北京市                          | —                   | ja, zh-Hans            |

### New Delhi — geonames 1261481 (https://www.geonames.org/1261481)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 新德里                          | —                   | zh-Hant                |

### Washington, D.C. — geonames 11789030 (https://www.geonames.org/11789030)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | Washington, D.C.                | —                   | —                      |
| de      | absent | Washington, D.C.                | —                   | —                      |
| es      | absent | Washington D. C.                | —                   | —                      |
| fr      | absent | Washington                      | —                   | —                      |
| it      | absent | Washington                      | —                   | —                      |
| ja      | absent | ワシントンD.C.                       | —                   | —                      |
| ko      | absent | 워싱턴 D.C.                        | —                   | —                      |
| zh-Hans | absent | 华盛顿哥伦比亚特区              | —                   | —                      |
| zh-Hant | absent | 華盛頓哥倫比亞特區              | —                   | —                      |

### Jakarta — geonames 1642907 (https://www.geonames.org/1642907)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today            | already in geonames as |
|---------|----------|---------------------------------|--------------------------------|------------------------|
| en      | not-pref | Jakarta                         | Jakarta Special Capital Region | —                      |
| it      | absent   | Giacarta                        | —                              | —                      |
| ko      | absent   | 자카르타                            | —                              | —                      |
| zh-Hans | absent   | 雅加达                          | —                              | —                      |
| zh-Hant | absent   | 雅加達                          | —                              | —                      |

### Islamabad — geonames 1176615 (https://www.geonames.org/1176615)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 伊斯蘭瑪巴德                    | —                   | —                      |

### Brasília — geonames 3469058 (https://www.geonames.org/3469058)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 巴西利亞                        | —                   | —                      |

### Abuja — geonames 2352778 (https://www.geonames.org/2352778)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| es      | not-pref | Abuya                           | Abuja               | —                      |
| zh-Hant | absent   | 阿布加                          | —                   | —                      |

### Dhaka — geonames 1185241 (https://www.geonames.org/1185241)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| de      | not-pref | Dhaka                           | Dakka               | —                      |
| zh-Hans | absent   | 达卡市                          | 达卡                | —                      |

### Moscow — geonames 524894 (https://www.geonames.org/524894)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| it      | absent | Mosca                           | —                   | —                      |
| ko      | absent | 모스크바                            | —                   | —                      |
| zh-Hans | absent | 莫斯科                          | —                   | —                      |
| zh-Hant | absent | 莫斯科                          | —                   | —                      |

### Mexico City — geonames 3527646 (https://www.geonames.org/3527646)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 墨西哥城                        | 墨西哥城市          | —                      |
| zh-Hant | absent | 墨西哥城                        | —                   | —                      |

### Addis Ababa — geonames 444178 (https://www.geonames.org/444178)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| it      | absent | Addis Abeba                     | —                   | de                     |
| ko      | absent | 아디스아바바                          | —                   | —                      |
| zh-Hans | absent | 亚的斯亚贝巴                    | —                   | —                      |
| zh-Hant | absent | 阿迪斯阿貝巴                    | —                   | —                      |

### Tokyo — geonames 1850144 (https://www.geonames.org/1850144)

| lang | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|------|--------|---------------------------------|---------------------|------------------------|
| fr   | absent | Tokyo                           | Préfecture de Tokyo | en, it                 |
| ko   | absent | 도쿄도                             | 도쿄 도                | —                      |

### Cairo — geonames 360630 (https://www.geonames.org/360630)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 开罗                            | —                   | —                      |

### Manila — geonames 1701668 (https://www.geonames.org/1701668)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 马尼拉                          | —                   | —                      |

### Kinshasa — geonames 2314302 (https://www.geonames.org/2314302)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 金沙萨                          | —                   | —                      |

### Hanoi — geonames 1581130 (https://www.geonames.org/1581130)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 河内                            | 河內市              | —                      |

### Ankara — geonames 323786 (https://www.geonames.org/323786)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 安卡拉                          | —                   | zh-Hans                |

### Berlin — geonames 6547539 (https://www.geonames.org/6547539)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Berlín                          | —                   | —                      |
| ja      | absent | ベルリン                            | —                   | —                      |
| ko      | absent | 베를린                             | —                   | —                      |
| zh-Hans | absent | 柏林                            | —                   | —                      |
| zh-Hant | absent | 柏林                            | —                   | —                      |

### Paris — geonames 2968815 (https://www.geonames.org/2968815)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today   | already in geonames as |
|---------|--------|---------------------------------|-----------------------|------------------------|
| en      | absent | Paris                           | Paris Department      | —                      |
| de      | absent | Paris                           | Département Paris     | —                      |
| es      | absent | París                           | Departamento de París | —                      |
| fr      | absent | Paris                           | Département de Paris  | —                      |
| it      | absent | Parigi                          | Provincia di Parigi   | —                      |
| ja      | absent | パリ                              | —                     | —                      |
| ko      | absent | 파리                              | —                     | —                      |
| zh-Hans | absent | 巴黎                            | —                     | —                      |
| zh-Hant | absent | 巴黎                            | —                     | —                      |

### Bangkok — geonames 1609348 (https://www.geonames.org/1609348)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| it      | absent | Bangkok                         | —                   | en, de, es, fr         |
| ko      | absent | 방콕                              | —                   | —                      |
| zh-Hant | absent | 曼谷                            | —                   | zh-Hans                |

### Pretoria — geonames 964137 (https://www.geonames.org/964137)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 比勒陀利亚                      | 比勒陀利亞          | —                      |
| zh-Hant | absent | 普勒托利亞                      | 普利托利亞          | —                      |

### Cape Town — geonames 3369157 (https://www.geonames.org/3369157)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 开普敦                          | —                   | —                      |

### Bloemfontein — geonames 1018725 (https://www.geonames.org/1018725)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 布隆方丹                        | —                   | zh-Hans                |

### Rome — geonames 3169070 (https://www.geonames.org/3169070)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 罗马                            | 罗马市              | —                      |

### Naypyidaw — geonames 6611854 (https://www.geonames.org/6611854)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| en      | not-pref | Naypyidaw                       | Nay Pyi Taw         | —                      |
| es      | absent   | Naipyidó                        | —                   | —                      |
| it      | absent   | Naypyidaw                       | —                   | en, de, fr             |
| ja      | absent   | ネピドー                            | —                   | —                      |
| zh-Hans | absent   | 奈比多                          | —                   | —                      |
| zh-Hant | absent   | 奈比多                          | —                   | —                      |

### Bogotá — geonames 3688689 (https://www.geonames.org/3688689)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| de      | not-pref | Bogotá                          | Bogota              | —                      |
| it      | absent   | Bogotà                          | Bogotá              | —                      |
| zh-Hans | absent   | 波哥大                          | —                   | zh-Hant                |

### Seoul — geonames 1835848 (https://www.geonames.org/1835848)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| zh-Hans | not-pref | 首尔                            | 首尔特别市          | —                      |

### Madrid — geonames 6359304 (https://www.geonames.org/6359304)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Madrid                          | —                   | en, de, fr             |
| it      | absent | Madrid                          | —                   | en, de, fr             |
| ja      | absent | マドリード                           | —                   | —                      |
| ko      | absent | 마드리드                            | —                   | —                      |
| zh-Hans | absent | 马德里                          | —                   | —                      |
| zh-Hant | absent | 馬德里                          | —                   | —                      |

### Nairobi — geonames 184745 (https://www.geonames.org/184745)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 内罗毕                          | 奈洛比              | —                      |
| zh-Hant | absent | 奈洛比                          | —                   | zh-Hans                |

### Kampala — geonames 232422 (https://www.geonames.org/232422)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 康培拉                          | —                   | —                      |

### Algiers — geonames 2507480 (https://www.geonames.org/2507480)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 阿尔及尔                        | —                   | —                      |

### Kabul — geonames 1138958 (https://www.geonames.org/1138958)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 喀布爾                          | —                   | —                      |

### Kyiv — geonames 703448 (https://www.geonames.org/703448)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| de      | not-pref | Kiew                            | Kyjiw               | —                      |
| es      | absent   | Kiev                            | Kyiv                | fr                     |
| it      | absent   | Kiev                            | Kyiv                | fr                     |
| ko      | absent   | 키이우                             | 키예프                 | —                      |
| zh-Hans | absent   | 基辅                            | —                   | —                      |

### Khartoum — geonames 379252 (https://www.geonames.org/379252)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| de      | absent | Chartum                         | Khartum             | —                      |
| zh-Hant | absent | 喀土穆                          | —                   | zh-Hans                |

### Baghdad — geonames 98182 (https://www.geonames.org/98182)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 巴格达                          | —                   | —                      |

### Warsaw — geonames 756135 (https://www.geonames.org/756135)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 华沙                            | —                   | —                      |

### Ottawa — geonames 6094817 (https://www.geonames.org/6094817)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 渥太华                          | —                   | —                      |

### Rabat — geonames 2538475 (https://www.geonames.org/2538475)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 拉巴特                          | —                   | zh-Hans                |

### Luanda — geonames 2240449 (https://www.geonames.org/2240449)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 魯安達                          | 盧安達              | —                      |

### Tashkent — geonames 1484839 (https://www.geonames.org/1484839)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Taskent                         | Tashkent            | —                      |
| it      | absent | Tashkent                        | —                   | en, es                 |
| ko      | absent | 타슈켄트                            | —                   | —                      |
| zh-Hans | absent | 塔什干                          | —                   | —                      |
| zh-Hant | absent | 塔什干                          | —                   | —                      |

### Kuala Lumpur — geonames 1735161 (https://www.geonames.org/1735161)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 吉隆坡                          | —                   | zh-Hans                |

### Lima — geonames 3936456 (https://www.geonames.org/3936456)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 利马                            | 利馬                | —                      |
| zh-Hant | absent | 利馬                            | —                   | zh-Hans                |

### Riyadh — geonames 108410 (https://www.geonames.org/108410)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| it      | absent | Riad                            | Riyad               | de, es                 |
| zh-Hans | absent | 利雅得                          | 利雅德              | —                      |
| zh-Hant | absent | 利雅德                          | —                   | zh-Hans                |

### Accra — geonames 2306104 (https://www.geonames.org/2306104)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Acra                            | Accra               | —                      |
| zh-Hant | absent | 阿克拉                          | —                   | zh-Hans                |

### Antananarivo — geonames 1070940 (https://www.geonames.org/1070940)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| fr      | absent | Antananarivo                    | Tananarive          | en, de, es, it         |
| zh-Hant | absent | 安塔那那利佛                    | —                   | —                      |

### Caracas — geonames 3646738 (https://www.geonames.org/3646738)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 加拉加斯                        | —                   | —                      |

### Maputo — geonames 1040652 (https://www.geonames.org/1040652)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 馬普托                          | —                   | —                      |

### Kathmandu — geonames 1283240 (https://www.geonames.org/1283240)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| it      | absent | Katmandu                        | Kathmandu           | —                      |
| zh-Hans | absent | 加德满都                        | —                   | —                      |

### Yaoundé — geonames 2220957 (https://www.geonames.org/2220957)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| es      | not-pref | Yaundé                          | Yaoundé             | —                      |
| zh-Hant | absent   | 雅溫得                          | —                   | —                      |

### Sanaa — geonames 71137 (https://www.geonames.org/71137)

| lang | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|------|--------|---------------------------------|---------------------|------------------------|
| es   | absent | Saná                            | Sanaá               | —                      |

### Aden — geonames 415189 (https://www.geonames.org/415189)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 亚丁                            | 亞丁                | —                      |
| zh-Hant | absent | 亞丁                            | —                   | zh-Hans                |

### Canberra — geonames 2172517 (https://www.geonames.org/2172517)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 坎培拉                          | —                   | —                      |

### Pyongyang — geonames 1871856 (https://www.geonames.org/1871856)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| it      | absent   | Pyongyang                       | —                   | en, fr                 |
| ja      | absent   | 平壌市                          | 平壌                | —                      |
| ko      | not-pref | 평양시                             | 평양직할시               | —                      |
| zh-Hans | absent   | 平壤                            | —                   | ko                     |
| zh-Hant | absent   | 平壤                            | —                   | ko                     |

### Damascus — geonames 170654 (https://www.geonames.org/170654)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 大馬士革                        | —                   | —                      |

### Taipei — geonames 1668341 (https://www.geonames.org/1668341)

| lang | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|------|----------|---------------------------------|---------------------|------------------------|
| ja   | not-pref | 台北市                          | 台北                | —                      |
| ko   | absent   | 타이베이시                           | 타이베이                | —                      |

### Ouagadougou — geonames 2357048 (https://www.geonames.org/2357048)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 瓦加杜古                        | —                   | zh-Hans                |

### Bamako — geonames 2460594 (https://www.geonames.org/2460594)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| fr      | absent | Bamako                          | District de Bamako  | en, de, es, it         |
| zh-Hans | absent | 巴马科                          | 巴馬科              | —                      |
| zh-Hant | absent | 巴馬科                          | —                   | zh-Hans                |

### Niamey — geonames 2440485 (https://www.geonames.org/2440485)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 尼亚美                          | —                   | —                      |
| zh-Hant | absent | 尼阿美                          | 尼亞美              | —                      |

### Colombo — geonames 1248991 (https://www.geonames.org/1248991)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 科伦坡                          | —                   | —                      |

### Sri Jayawardenepura Kotte — geonames 1238992 (https://www.geonames.org/1238992)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today       | already in geonames as |
|---------|--------|---------------------------------|---------------------------|------------------------|
| en      | absent | Sri Jayawardenepura Kotte       | Sri Jayewardenepura Kotte | —                      |
| de      | absent | Sri Jayewardenepura Kotte       | Sri Jayawardenepura       | en                     |
| es      | absent | Sri Jayawardenapura Kotte       | —                         | —                      |
| fr      | absent | Sri Jayawardenapura             | —                         | —                      |
| it      | absent | Sri Jayawardenapura Kotte       | —                         | —                      |
| ko      | absent | 스리자야와르데네푸라코테                    | 스리자야와르다나푸라                | —                      |
| zh-Hans | absent | 斯里贾亚瓦德纳普拉科特          | —                         | —                      |

### Astana — geonames 1526273 (https://www.geonames.org/1526273)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| ja      | absent | アスタナ                            | —                   | —                      |
| zh-Hans | absent | 阿斯塔纳                        | —                   | —                      |
| zh-Hant | absent | 阿斯塔納                        | —                   | —                      |

### Lusaka — geonames 909137 (https://www.geonames.org/909137)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 卢萨卡                          | 路沙卡              | —                      |
| zh-Hant | absent | 路沙卡                          | —                   | zh-Hans                |

### Santiago — geonames 3871336 (https://www.geonames.org/3871336)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| de      | not-pref | Santiago de Chile               | Santiago            | —                      |
| zh-Hant | absent   | 聖地牙哥                        | 聖地亞哥            | —                      |

### N'Djamena — geonames 2427123 (https://www.geonames.org/2427123)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| de      | not-pref | N’Djamena                       | Indschamina         | —                      |
| fr      | absent   | N'Djaména                       | Ndjamena            | —                      |
| it      | absent   | N’Djamena                       | N'Djamena           | de                     |
| zh-Hans | absent   | 恩贾梅纳                        | —                   | —                      |

### Bucharest — geonames 683506 (https://www.geonames.org/683506)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 布加勒斯特                      | —                   | zh-Hans                |

### Phnom Penh — geonames 1821306 (https://www.geonames.org/1821306)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 金邊                            | —                   | —                      |

### Guatemala City — geonames 3595529 (https://www.geonames.org/3595529)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | Guatemala City                  | —                   | —                      |
| de      | absent | Guatemala-Stadt                 | —                   | —                      |
| es      | absent | Ciudad de Guatemala             | —                   | —                      |
| fr      | absent | Guatemala                       | —                   | —                      |
| it      | absent | Città del Guatemala             | —                   | —                      |
| ja      | absent | グアテマラシティ                        | —                   | —                      |
| ko      | absent | 과테말라시티                          | —                   | —                      |
| zh-Hans | absent | 危地马拉城                      | —                   | —                      |
| zh-Hant | absent | 瓜地馬拉市                      | —                   | —                      |

### Amsterdam — geonames 2759794 (https://www.geonames.org/2759794)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| it      | absent   | Amsterdam                       | —                   | en, de, fr             |
| ja      | not-pref | アムステルダム                         | Amusuterudamu       | —                      |
| zh-Hans | absent   | 阿姆斯特丹                      | —                   | zh-Hant                |

### Quito — geonames 3652462 (https://www.geonames.org/3652462)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 基多                            | —                   | zh-Hans                |

### Dakar — geonames 2253354 (https://www.geonames.org/2253354)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 达喀尔                          | 達喀爾              | —                      |
| zh-Hant | absent | 達卡                            | —                   | —                      |

### Harare — geonames 890298 (https://www.geonames.org/890298)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | Harare                          | —                   | —                      |
| de      | absent | Harare                          | —                   | —                      |
| es      | absent | Harare                          | —                   | —                      |
| fr      | absent | Harare                          | —                   | —                      |
| it      | absent | Harare                          | —                   | —                      |
| ja      | absent | ハラレ                             | —                   | —                      |
| ko      | absent | 하라레                             | —                   | —                      |
| zh-Hans | absent | 哈拉雷                          | —                   | —                      |
| zh-Hant | absent | 哈拉雷                          | —                   | —                      |

### Kigali — geonames 202061 (https://www.geonames.org/202061)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 基加利                          | 吉佳利              | —                      |

### Porto-Novo — geonames 2392087 (https://www.geonames.org/2392087)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| de      | absent   | Porto-Novo                      | Porto Novo          | en, it                 |
| fr      | absent   | Porto-Novo                      | Porto Novo          | en, it                 |
| zh-Hans | not-pref | 波多诺伏                        | 新港                | —                      |

### Gitega — geonames 426272 (https://www.geonames.org/426272)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Guitega                         | Gitega              | —                      |
| fr      | absent | Gitega                          | —                   | en, de, es, it         |
| ja      | absent | ギテガ                             | —                   | —                      |
| ko      | absent | 기테가                             | —                   | —                      |
| zh-Hans | absent | 基特加                          | —                   | —                      |
| zh-Hant | absent | 基特加                          | —                   | —                      |

### Conakry — geonames 2422465 (https://www.geonames.org/2422465)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Conakri                         | Conakry             | —                      |
| zh-Hans | absent | 科纳克里                        | —                   | —                      |
| zh-Hant | absent | 柯那克里                        | —                   | —                      |

### Juba — geonames 373303 (https://www.geonames.org/373303)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Yuba                            | —                   | —                      |
| it      | absent | Giuba                           | —                   | —                      |
| ja      | absent | ジュバ                             | —                   | —                      |
| zh-Hans | absent | 朱巴                            | —                   | —                      |

### La Paz — geonames 3911925 (https://www.geonames.org/3911925)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 拉巴斯                          | —                   | zh-Hans                |

### Sucre — geonames 3903987 (https://www.geonames.org/3903987)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 蘇克雷                          | —                   | —                      |

### Brussels — geonames 2800866 (https://www.geonames.org/2800866)

| lang | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|------|--------|---------------------------------|---------------------|------------------------|
| ja   | absent | ブリュッセル市                        | ブリュッセル              | —                      |

### Tunis — geonames 2464470 (https://www.geonames.org/2464470)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| zh-Hans | not-pref | 突尼斯市                        | 突尼斯              | —                      |
| zh-Hant | absent   | 突尼斯市                        | —                   | zh-Hans                |

### Mogadishu — geonames 53654 (https://www.geonames.org/53654)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 摩加迪休                        | —                   | zh-Hans                |

### Havana — geonames 3553478 (https://www.geonames.org/3553478)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 哈瓦那                          | —                   | zh-Hans                |

### Port-au-Prince — geonames 3718427 (https://www.geonames.org/3718427)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| it      | absent | Port-au-Prince                  | —                   | en, de, fr             |
| ja      | absent | ポルトープランス                        | —                   | —                      |
| ko      | absent | 포르토프랭스                          | —                   | —                      |
| zh-Hant | absent | 太子港                          | —                   | —                      |

### Prague — geonames 3067696 (https://www.geonames.org/3067696)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 布拉格                          | —                   | zh-Hans                |

### Santo Domingo — geonames 3492908 (https://www.geonames.org/3492908)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| fr      | absent | Saint-Domingue                  | Saint Domingue      | —                      |
| it      | absent | Santo Domingo                   | —                   | en, de, es             |
| ja      | absent | サント・ドミンゴ                        | —                   | —                      |
| zh-Hans | absent | 圣多明哥                        | 聖多明哥            | —                      |
| zh-Hant | absent | 聖多明哥                        | —                   | zh-Hans                |

### Athens — geonames 264371 (https://www.geonames.org/264371)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 雅典                            | —                   | zh-Hans                |

### Amman — geonames 250441 (https://www.geonames.org/250441)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| es      | not-pref | Amán                            | Ammán               | —                      |
| zh-Hant | absent   | 安曼                            | —                   | zh-Hans                |

### Lisbon — geonames 2267057 (https://www.geonames.org/2267057)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 里斯本                          | —                   | —                      |
| zh-Hant | absent | 里斯本                          | —                   | —                      |

### Baku — geonames 587081 (https://www.geonames.org/587081)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | Baku                            | —                   | —                      |
| de      | absent | Baku                            | —                   | —                      |
| es      | absent | Bakú                            | —                   | —                      |
| fr      | absent | Bakou                           | —                   | —                      |
| it      | absent | Baku                            | —                   | —                      |
| ja      | absent | バクー                             | —                   | —                      |
| ko      | absent | 바쿠                              | —                   | —                      |
| zh-Hans | absent | 巴库                            | —                   | —                      |
| zh-Hant | absent | 巴庫                            | —                   | —                      |

### Abu Dhabi — geonames 292968 (https://www.geonames.org/292968)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Abu Dhabi                       | Abu Dabi            | en, de, it             |
| zh-Hant | absent | 阿布達比                        | —                   | —                      |

### Jerusalem — geonames 281184 (https://www.geonames.org/281184)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 耶路撒冷                        | —                   | zh-Hans                |

### Budapest — geonames 3054643 (https://www.geonames.org/3054643)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 布達佩斯                        | —                   | —                      |

### Dushanbe — geonames 1221873 (https://www.geonames.org/1221873)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | Dushanbe                        | —                   | —                      |
| de      | absent | Duschanbe                       | —                   | —                      |
| es      | absent | Dusambé                         | —                   | —                      |
| fr      | absent | Douchanbé                       | —                   | —                      |
| it      | absent | Dušanbe                         | —                   | —                      |
| ja      | absent | ドゥシャンベ                          | —                   | —                      |
| ko      | absent | 두샨베                             | —                   | —                      |
| zh-Hans | absent | 杜尚别                          | —                   | —                      |
| zh-Hant | absent | 杜尚貝                          | —                   | —                      |

### Bern — geonames 7285212 (https://www.geonames.org/7285212)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | Bern                            | Berne               | de                     |
| es      | absent | Berna                           | —                   | it                     |
| ja      | absent | ベルン                             | —                   | —                      |
| ko      | absent | 베른                              | —                   | —                      |
| zh-Hans | absent | 伯尔尼                          | —                   | —                      |
| zh-Hant | absent | 伯恩                            | —                   | —                      |

### Minsk — geonames 625144 (https://www.geonames.org/625144)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 明斯克                          | —                   | zh-Hans                |

### Vienna — geonames 2761369 (https://www.geonames.org/2761369)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 维也纳                          | 維也納              | —                      |
| zh-Hant | absent | 維也納                          | —                   | zh-Hans                |

### Port Moresby — geonames 2088122 (https://www.geonames.org/2088122)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 莫士比港                        | —                   | —                      |

### Tegucigalpa — geonames 3600949 (https://www.geonames.org/3600949)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 特古西加尔巴                    | 德古斯加巴          | —                      |
| zh-Hant | absent | 德古西加巴                      | —                   | —                      |

### Lomé — geonames 2365267 (https://www.geonames.org/2365267)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 洛美                            | —                   | zh-Hans                |

### Freetown — geonames 2409306 (https://www.geonames.org/2409306)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 自由城                          | —                   | —                      |

### Tripoli — geonames 2210247 (https://www.geonames.org/2210247)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 的黎波里                        | —                   | zh-Hans                |

### Bishkek — geonames 1528334 (https://www.geonames.org/1528334)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Biskek                          | Bishkek             | —                      |
| it      | absent | Biškek                          | —                   | —                      |
| ko      | absent | 비슈케크                            | —                   | —                      |
| zh-Hans | absent | 比什凯克                        | —                   | —                      |
| zh-Hant | absent | 比什凱克                        | —                   | —                      |

### Vientiane — geonames 1651944 (https://www.geonames.org/1651944)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 万象                            | 永珍                | —                      |
| zh-Hant | absent | 永珍                            | —                   | zh-Hans                |

### Asunción — geonames 3439389 (https://www.geonames.org/3439389)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| fr      | absent | Asuncion                        | Asunción            | —                      |
| zh-Hans | absent | 亚松森                          | 亞松森              | —                      |
| zh-Hant | absent | 亞松森                          | —                   | zh-Hans                |

### Belgrade — geonames 792680 (https://www.geonames.org/792680)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 贝尔格莱德                      | —                   | —                      |
| zh-Hant | absent | 貝爾格勒                        | —                   | —                      |

### Sofia — geonames 727011 (https://www.geonames.org/727011)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 索非亚                          | —                   | —                      |

### Brazzaville — geonames 2260535 (https://www.geonames.org/2260535)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 布拉柴维尔                      | —                   | —                      |
| zh-Hant | absent | 布拉柴維爾                      | —                   | —                      |

### Ashgabat — geonames 162183 (https://www.geonames.org/162183)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| de      | not-pref | Aşgabat                         | Aschgabat           | —                      |
| ko      | not-pref | 아시가바트                           | 아슈하바트               | —                      |
| zh-Hant | absent   | 阿什哈巴特                      | —                   | —                      |

### Beirut — geonames 276781 (https://www.geonames.org/276781)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 貝魯特                          | —                   | —                      |

### San Salvador — geonames 3583361 (https://www.geonames.org/3583361)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 圣萨尔瓦多                      | —                   | —                      |

### Copenhagen — geonames 2618425 (https://www.geonames.org/2618425)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 哥本哈根                        | —                   | zh-Hans                |

### Singapore — geonames 1880251 (https://www.geonames.org/1880251)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 新加坡                          | 新加坡共和国        | zh-Hant                |

### Bratislava — geonames 3060972 (https://www.geonames.org/3060972)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 布拉提斯拉瓦                    | —                   | —                      |

### Wellington — geonames 2179537 (https://www.geonames.org/2179537)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 威靈頓                          | —                   | —                      |

### San José — geonames 3621849 (https://www.geonames.org/3621849)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| de      | not-pref | San José                        | San Jose            | —                      |
| zh-Hans | absent   | 圣何塞                          | —                   | —                      |

### Ramallah — geonames 282239 (https://www.geonames.org/282239)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 拉姆安拉                        | —                   | zh-Hans                |

### East Jerusalem — geonames 7303419 (https://www.geonames.org/7303419)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | East Jerusalem                  | —                   | —                      |
| ja      | absent | エルサレム                           | 東エルサレム             | —                      |
| zh-Hant | absent | 東耶路撒冷                      | —                   | —                      |

### Bangui — geonames 2389853 (https://www.geonames.org/2389853)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 班吉                            | 班基                | —                      |
| zh-Hant | absent | 班基                            | —                   | zh-Hans                |

### Managua — geonames 3617760 (https://www.geonames.org/3617760)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | Managua                         | —                   | es                     |
| de      | absent | Managua                         | —                   | es                     |
| fr      | absent | Managua                         | —                   | es                     |
| it      | absent | Managua                         | —                   | es                     |
| ja      | absent | マナグア                            | —                   | —                      |
| ko      | absent | 마나과                             | —                   | —                      |
| zh-Hant | absent | 馬納瓜                          | —                   | —                      |

### Muscat — geonames 287286 (https://www.geonames.org/287286)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 馬斯喀特                        | —                   | —                      |

### Panama City — geonames 3703443 (https://www.geonames.org/3703443)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| es      | not-pref | Ciudad de Panamá                | Panamá              | —                      |
| fr      | absent   | Panama                          | Panamá              | —                      |
| it      | absent   | Panama                          | Panamá              | —                      |
| ja      | absent   | パナマ市                           | パナマシティ              | —                      |
| zh-Hans | absent   | 巴拿马城                        | —                   | —                      |

### Kuwait City — geonames 285787 (https://www.geonames.org/285787)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| de      | absent | Kuweit-Stadt                    | Kuwait-Stadt        | —                      |
| it      | absent | Al Kuwait                       | Al-Kuwait           | —                      |
| ko      | absent | 쿠웨이트 시                          | 쿠웨이트시티              | —                      |
| zh-Hans | absent | 科威特城                        | 科威特市            | —                      |
| zh-Hant | absent | 科威特城                        | —                   | —                      |

### Tbilisi — geonames 611717 (https://www.geonames.org/611717)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 提比里斯                        | —                   | —                      |

### Zagreb — geonames 3186886 (https://www.geonames.org/3186886)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 札格雷布                        | —                   | —                      |

### Sarajevo — geonames 3191281 (https://www.geonames.org/3191281)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 萨拉热窝                        | 塞拉耶佛            | —                      |
| zh-Hant | absent | 塞拉耶佛                        | —                   | zh-Hans                |

### Asmara — geonames 343300 (https://www.geonames.org/343300)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 阿斯马拉                        | —                   | —                      |

### Montevideo — geonames 3441575 (https://www.geonames.org/3441575)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 蒙特維多                        | —                   | zh-Hans                |

### Ulaanbaatar — geonames 2028462 (https://www.geonames.org/2028462)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| ko      | not-pref | 울란바타르                           | 울란바토르               | —                      |
| zh-Hant | absent   | 烏蘭巴托                        | —                   | —                      |

### Yerevan — geonames 616051 (https://www.geonames.org/616051)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 埃里温                          | —                   | —                      |

### Vilnius — geonames 593116 (https://www.geonames.org/593116)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| ja      | absent | ヴィルニュス                          | ヴィリニュス              | —                      |
| zh-Hant | absent | 維爾紐斯                        | —                   | —                      |

### Tirana — geonames 3183875 (https://www.geonames.org/3183875)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 地拉那                          | —                   | zh-Hans                |

### Kingston — geonames 3489854 (https://www.geonames.org/3489854)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Kingston                        | —                   | en, de, fr             |
| it      | absent | Kingston                        | —                   | en, de, fr             |
| zh-Hans | absent | 金斯敦                          | 京斯敦              | —                      |
| zh-Hant | absent | 京斯敦                          | —                   | zh-Hans                |

### Banjul — geonames 2413876 (https://www.geonames.org/2413876)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 班珠爾                          | —                   | —                      |

### Doha — geonames 290030 (https://www.geonames.org/290030)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 杜哈                            | —                   | —                      |

### Windhoek — geonames 3352136 (https://www.geonames.org/3352136)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 溫得和克                        | —                   | —                      |

### Gaborone — geonames 933773 (https://www.geonames.org/933773)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 哈博罗内                        | 嘉柏隆里            | —                      |
| zh-Hant | absent | 嘉柏隆里                        | —                   | zh-Hans                |

### Chișinău — geonames 618426 (https://www.geonames.org/618426)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| en      | not-pref | Chișinău                        | Chisinau            | —                      |
| de      | absent   | Chișinău / Kischinjow           | Chişinău            | —                      |
| es      | absent   | Chisináu                        | Chișinău            | —                      |
| fr      | absent   | Chișinău                        | Chişinău            | en, de, es, it         |
| it      | not-pref | Chișinău                        | Chişinău            | —                      |
| zh-Hans | absent   | 基希讷乌                        | —                   | —                      |
| zh-Hant | absent   | 基希涅夫                        | —                   | —                      |

### Ljubljana — geonames 3196359 (https://www.geonames.org/3196359)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 盧比安納                        | —                   | —                      |

### Libreville — geonames 2399697 (https://www.geonames.org/2399697)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 自由市                          | —                   | —                      |

### Maseru — geonames 932505 (https://www.geonames.org/932505)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 馬塞盧                          | —                   | —                      |

### Bissau — geonames 2374776 (https://www.geonames.org/2374776)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| it      | absent | Bissau                          | —                   | en, de, fr             |
| ko      | absent | 비사우                             | —                   | —                      |
| zh-Hans | absent | 比绍                            | —                   | —                      |
| zh-Hant | absent | 比索                            | —                   | —                      |

### Ciudad de la Paz — geonames 2306898 (https://www.geonames.org/2306898)

| lang | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|------|--------|---------------------------------|---------------------|------------------------|
| en   | absent | Ciudad de la Paz                | —                   | —                      |
| de   | absent | Ciudad de la Paz                | —                   | —                      |
| es   | absent | Ciudad de la Paz                | —                   | —                      |
| fr   | absent | Ciudad de la Paz                | —                   | —                      |
| it   | absent | Ciudad de la Paz                | —                   | —                      |
| ja   | absent | ラパス                             | —                   | —                      |
| ko   | absent | 오얄라                             | —                   | —                      |

### Riga — geonames 456172 (https://www.geonames.org/456172)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 里加                            | —                   | —                      |
| zh-Hant | absent | 里加                            | —                   | —                      |

### Skopje — geonames 785842 (https://www.geonames.org/785842)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Skopie                          | Skopje              | —                      |
| zh-Hant | absent | 史高比耶                        | —                   | —                      |

### Pristina — geonames 786714 (https://www.geonames.org/786714)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| de      | absent   | Pristina                        | —                   | en, fr, it             |
| es      | absent   | Pristina                        | Priština            | en, fr, it             |
| it      | not-pref | Priština                        | Prishtina           | —                      |
| zh-Hant | absent   | 普里斯提納                      | —                   | —                      |

### Manama — geonames 290340 (https://www.geonames.org/290340)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 麥納麦                          | —                   | —                      |

### Dili — geonames 1645457 (https://www.geonames.org/1645457)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 帝力                            | —                   | zh-Hans                |

### Tallinn — geonames 588409 (https://www.geonames.org/588409)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 塔林                            | —                   | zh-Hans                |

### Port of Spain — geonames 3573890 (https://www.geonames.org/3573890)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| de      | absent | Port of Spain                   | Port-of-Spain       | en, it                 |
| zh-Hant | absent | 西班牙港                        | —                   | zh-Hans                |

### Nicosia — geonames 146268 (https://www.geonames.org/146268)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 尼古西亞                        | —                   | —                      |

### Port Louis — geonames 934154 (https://www.geonames.org/934154)

| lang | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|------|--------|---------------------------------|---------------------|------------------------|
| es   | absent | Port Louis                      | Puerto Louis        | en, de, it             |

### Lobamba — geonames 935048 (https://www.geonames.org/935048)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| de      | absent | Lobamba                         | —                   | en, es                 |
| fr      | absent | Lobamba                         | —                   | en, es                 |
| it      | absent | Lobamba                         | —                   | en, es                 |
| zh-Hant | absent | 洛班巴                          | —                   | zh-Hans                |

### Mbabane — geonames 934985 (https://www.geonames.org/934985)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 姆巴巴内                        | 墨巴本              | —                      |
| zh-Hant | absent | 墨巴本                          | —                   | zh-Hans                |

### Djibouti — geonames 223817 (https://www.geonames.org/223817)

| lang | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|------|--------|---------------------------------|---------------------|------------------------|
| es   | absent | Ciudad de Yibuti                | Yibuti              | —                      |

### Suva — geonames 2198148 (https://www.geonames.org/2198148)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 苏瓦                            | —                   | —                      |

### Thimphu — geonames 1252416 (https://www.geonames.org/1252416)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 辛布                            | —                   | —                      |

### Luxembourg — geonames 2960316 (https://www.geonames.org/2960316)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today  | already in geonames as |
|---------|----------|---------------------------------|----------------------|------------------------|
| es      | not-pref | Luxemburgo                      | Ciudad de Luxemburgo | —                      |
| ja      | absent   | ルクセンブルク市                       | ルクセンブルク              | —                      |
| zh-Hans | absent   | 卢森堡市                        | 盧森堡市             | —                      |
| zh-Hant | absent   | 盧森堡市                        | —                    | zh-Hans                |

### Podgorica — geonames 3193044 (https://www.geonames.org/3193044)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 波德戈里察                      | —                   | zh-Hans                |

### Honiara — geonames 2108502 (https://www.geonames.org/2108502)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 荷尼阿拉                        | —                   | —                      |

### Paramaribo — geonames 3383330 (https://www.geonames.org/3383330)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 巴拉馬利波                      | —                   | —                      |

### Praia — geonames 3374333 (https://www.geonames.org/3374333)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 普拉亚                          | —                   | —                      |
| zh-Hant | absent | 普拉亞                          | 培亞                | —                      |

### Valletta — geonames 8334638 (https://www.geonames.org/8334638)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | La Valeta                       | Valletta            | —                      |
| fr      | absent | La Valette                      | Valletta            | —                      |
| it      | absent | La Valletta                     | —                   | —                      |
| ja      | absent | バレッタ                            | ヴァレッタ               | —                      |
| ko      | absent | 발레타                             | —                   | —                      |
| zh-Hans | absent | 瓦莱塔                          | —                   | —                      |
| zh-Hant | absent | 瓦萊塔                          | —                   | —                      |

### Bandar Seri Begawan — geonames 1820906 (https://www.geonames.org/1820906)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 斯里巴加灣市                    | —                   | zh-Hans                |

### Malé — geonames 1282027 (https://www.geonames.org/1282027)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| it      | absent   | Male                            | Malé                | —                      |
| zh-Hans | not-pref | 马累                            | 瑪律                | —                      |
| zh-Hant | absent   | 馬累                            | —                   | zh-Hans                |

### Belmopan — geonames 3582672 (https://www.geonames.org/3582672)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 贝尔墨邦                        | —                   | —                      |

### Nassau — geonames 3571824 (https://www.geonames.org/3571824)

| lang    | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|----------|---------------------------------|---------------------|------------------------|
| ko      | not-pref | 나소                              | 나사우                 | —                      |
| zh-Hant | absent   | 拿騷                            | —                   | —                      |

### Reykjavík — geonames 3413831 (https://www.geonames.org/3413831)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | Reykjavík                       | —                   | —                      |
| de      | absent | Reykjavík                       | —                   | —                      |
| es      | absent | Reikiavik                       | —                   | —                      |
| fr      | absent | Reykjavik                       | —                   | —                      |
| it      | absent | Reykjavík                       | —                   | —                      |
| ja      | absent | レイキャヴィーク                        | —                   | —                      |
| ko      | absent | 레이캬비크                           | —                   | —                      |
| zh-Hans | absent | 雷克雅未克                      | —                   | —                      |
| zh-Hant | absent | 雷克雅未克                      | —                   | —                      |

### Bridgetown — geonames 3374036 (https://www.geonames.org/3374036)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 橋鎮                            | —                   | —                      |

### Port Vila — geonames 2135171 (https://www.geonames.org/2135171)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 维拉港                          | —                   | —                      |

### Apia — geonames 4035413 (https://www.geonames.org/4035413)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 阿皮亞                          | —                   | —                      |

### Castries — geonames 3576812 (https://www.geonames.org/3576812)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hant | absent | 卡斯特里                        | —                   | zh-Hans                |

### South Tarawa — no GeoNames id on record

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | South Tarawa                    | —                   | —                      |
| de      | absent | South Tarawa                    | —                   | —                      |
| es      | absent | Tarawa Sur                      | —                   | —                      |
| fr      | absent | Tarawa-Sud                      | —                   | —                      |
| it      | absent | Tarawa Sud                      | —                   | —                      |
| ja      | absent | サウス・タラワ                         | —                   | —                      |
| ko      | absent | 사우스타라와                          | —                   | —                      |
| zh-Hans | absent | 南塔拉瓦                        | —                   | —                      |
| zh-Hant | absent | 南塔拉瓦                        | —                   | —                      |

### St. George's — geonames 3579925 (https://www.geonames.org/3579925)

| lang | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|------|----------|---------------------------------|---------------------|------------------------|
| en   | not-pref | St. George's                    | Saint George's      | —                      |
| de   | absent   | St. George’s                    | St. George's        | —                      |
| es   | absent   | Saint George                    | Saint George's      | —                      |
| it   | absent   | Saint George's                  | St. George's        | en, es                 |

### Nukuʻalofa — geonames 4032402 (https://www.geonames.org/4032402)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | Nukuʻalofa                      | Nuku'alofa          | —                      |
| de      | absent | Nukuʻalofa                      | Nuku’alofa          | —                      |
| es      | absent | Nukualofa                       | Nuku'alofa          | —                      |
| fr      | absent | Nukuʻalofa                      | Nuku'alofa          | —                      |
| it      | absent | Nukuʻalofa                      | Nuku'alofa          | —                      |
| zh-Hant | absent | 努库阿洛法                      | —                   | zh-Hans                |

### Q36262 — geonames 3576022 (https://www.geonames.org/3576022)

| lang | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|------|--------|---------------------------------|---------------------|------------------------|
| es   | absent | Saint John                      | Saint John's        | —                      |
| ja   | absent | セイント・ジョンズ                       | セントジョンズ             | —                      |

### Andorra la Vella — geonames 3041563 (https://www.geonames.org/3041563)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| es      | absent | Andorra la Vieja                | Andorra la Vella    | —                      |
| ja      | absent | アンドラ・ラ・ベリャ                      | アンドラ・ラ・ヴェリャ         | —                      |
| ko      | absent | 안도라라벨랴                          | 안도라라베야              | —                      |
| zh-Hans | absent | 安道尔城                        | —                   | —                      |
| zh-Hant | absent | 老安道爾                        | 安道爾城            | —                      |

### Roseau — geonames 3575635 (https://www.geonames.org/3575635)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 罗索                            | —                   | —                      |
| zh-Hant | absent | 羅梭                            | 羅索                | —                      |

### Majuro — geonames 2113779 (https://www.geonames.org/2113779)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| it      | absent | Majuro                          | —                   | en, de, es, fr         |
| ja      | absent | マジュロ                            | —                   | —                      |
| zh-Hans | absent | 马朱罗                          | —                   | —                      |
| zh-Hant | absent | 馬久羅                          | —                   | —                      |

### Monaco — geonames 2993457 (https://www.geonames.org/2993457)

| lang | tier     | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|------|----------|---------------------------------|---------------------|------------------------|
| it   | not-pref | Principato di Monaco            | Monaco              | —                      |

### Vaduz — geonames 3042031 (https://www.geonames.org/3042031)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| en      | absent | Vaduz                           | —                   | —                      |
| de      | absent | Vaduz                           | —                   | —                      |
| es      | absent | Vaduz                           | —                   | —                      |
| fr      | absent | Vaduz                           | —                   | —                      |
| it      | absent | Vaduz                           | —                   | —                      |
| ja      | absent | ファドゥーツ                          | —                   | —                      |
| ko      | absent | 파두츠                             | —                   | —                      |
| zh-Hans | absent | 瓦杜兹                          | —                   | —                      |
| zh-Hant | absent | 華杜茲                          | —                   | —                      |

### San Marino — geonames 3345302 (https://www.geonames.org/3345302)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| fr      | absent | Saint-Marin                     | San Marino          | —                      |
| it      | absent | Città di San Marino             | —                   | —                      |
| ja      | absent | サンマリノ市                         | サンマリノ               | —                      |
| ko      | absent | 산마리노                            | —                   | —                      |
| zh-Hans | absent | 圣马力诺                        | —                   | —                      |
| zh-Hant | absent | 聖馬力諾                        | —                   | —                      |

### Ngerulmud — geonames 8063361 (https://www.geonames.org/8063361)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| de      | absent | Ngerulmud                       | —                   | en                     |
| es      | absent | Ngerulmud                       | —                   | en                     |
| fr      | absent | Ngerulmud                       | —                   | en                     |
| it      | absent | Ngerulmud                       | —                   | en                     |
| ja      | absent | ンゲルルムッド                         | —                   | —                      |
| zh-Hans | absent | 恩吉鲁穆德                      | —                   | —                      |
| zh-Hant | absent | 恩吉魯穆德                      | —                   | —                      |

### Yaren District — geonames 2110418 (https://www.geonames.org/2110418)

| lang    | tier   | Wikidata name (to add / prefer) | geonames pref today | already in geonames as |
|---------|--------|---------------------------------|---------------------|------------------------|
| zh-Hans | absent | 亚伦区                          | 亞倫區              | —                      |

### Funafuti — geonames 2110394 (https://www.geonames.org/2110394)

| lang | tier   | Wikidata name (to add / prefer) | geonames pref today            | already in geonames as |
|------|--------|---------------------------------|--------------------------------|------------------------|
| es   | absent | Funafuti                        | Fongafale (atolón de Funafuti) | en, de, fr             |
| it   | absent | Funafuti                        | —                              | en, de, fr             |
| ja   | absent | フナフティ島                         | —                              | —                      |

### Vatican City — geonames 3164670 (https://www.geonames.org/3164670)

| lang | tier     | Wikidata name (to add / prefer) | geonames pref today    | already in geonames as |
|------|----------|---------------------------------|------------------------|------------------------|
| de   | not-pref | Vatikanstadt                    | Staat der Vatikanstadt | —                      |
| ja   | absent   | バチカン                            | ローマ法王庁 (バチカン市国)   | —                      |
| ko   | absent   | 바티칸 시국                          | 바티칸시티                  | —                      |
