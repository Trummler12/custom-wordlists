# Name-quality report — data-raw/geography

Generated 2026-09-02 by `scripts/geography/report-name-quality.mjs` (read-only). A worklist of the Wikidata issues the country and capital dumps hit — fix at the source, re-dump, and the entry here (and any override it carries) falls away.

## Codes mis-filed as names — new — 0

Code-like names (no lowercase) not yet reviewed into `name-abbreviations.json`. Each is either a genuine abbreviation to add to `legit`, or an ISO/technical code Wikidata mis-files under P1813 (belongs in P297 / P298) — add it to `acknowledged` once seen, and clean it up on Wikidata when you get to it.

_None — every code-like name is reviewed._

## Missing names — content languages — 30 entities

No usable name in these languages, so the list falls back to English (⚠️ in the app). Add a Wikidata label.

| entity | missing | Wikidata |
| --- | --- | --- |
| Q141191391 (country) | en, de, es, it, ja, ko, zh-Hans, zh-Hant | [Q141191391](https://www.wikidata.org/wiki/Q141191391) |
| Jersey (country) | de, es, it | [Q785](https://www.wikidata.org/wiki/Q785) |
| Transnistria (country) | de, zh-Hant | [Q648767](https://www.wikidata.org/wiki/Q648767) |
| Abuja (capital) | de, it | [Q3787](https://www.wikidata.org/wiki/Q3787) |
| Dodoma (capital) | zh-Hant | [Q3866](https://www.wikidata.org/wiki/Q3866) |
| Sri Jayawardenepura Kotte (capital) | zh-Hant | [Q41963](https://www.wikidata.org/wiki/Q41963) |
| Lilongwe (capital) | zh-Hant | [Q3876](https://www.wikidata.org/wiki/Q3876) |
| Kigali (capital) | zh-Hant | [Q3859](https://www.wikidata.org/wiki/Q3859) |
| Porto-Novo (capital) | zh-Hant | [Q3799](https://www.wikidata.org/wiki/Q3799) |
| Juba (capital) | zh-Hant | [Q1947](https://www.wikidata.org/wiki/Q1947) |
| Ciudad de la Paz (capital) | zh-Hant | [Q1140136](https://www.wikidata.org/wiki/Q1140136) |
| Moroni (capital) | zh-Hant | [Q3901](https://www.wikidata.org/wiki/Q3901) |
| São Tomé (capital) | zh-Hant | [Q3932](https://www.wikidata.org/wiki/Q3932) |
| St. George's (capital) | zh-Hant | [Q41547](https://www.wikidata.org/wiki/Q41547) |
| Kingstown (capital) | zh-Hant | [Q41474](https://www.wikidata.org/wiki/Q41474) |
| Palikir (capital) | zh-Hant | [Q42751](https://www.wikidata.org/wiki/Q42751) |
| Basseterre (capital) | zh-Hant | [Q41295](https://www.wikidata.org/wiki/Q41295) |
| Yaren District (capital) | zh-Hant | [Q31026](https://www.wikidata.org/wiki/Q31026) |
| Funafuti (capital) | zh-Hant | [Q34126](https://www.wikidata.org/wiki/Q34126) |
| Mariehamn (capital) | zh-Hant | [Q48329](https://www.wikidata.org/wiki/Q48329) |
| Philipsburg (capital) | zh-Hant | [Q30958](https://www.wikidata.org/wiki/Q30958) |
| Alofi (capital) | zh-Hant | [Q30966](https://www.wikidata.org/wiki/Q30966) |
| North Nicosia (capital) | zh-Hant | [Q2762100](https://www.wikidata.org/wiki/Q2762100) |
| Saipan (capital) | de, es, it, ja, ko, zh-Hans, zh-Hant | [Q49755159](https://www.wikidata.org/wiki/Q49755159) |
| Cockburn Town (capital) | zh-Hant | [Q34205](https://www.wikidata.org/wiki/Q34205) |
| The Valley (capital) | zh-Hant | [Q30994](https://www.wikidata.org/wiki/Q30994) |
| Plymouth (capital) | zh-Hant | [Q30990](https://www.wikidata.org/wiki/Q30990) |
| Jamestown (capital) | zh-Hant | [Q30970](https://www.wikidata.org/wiki/Q30970) |
| Adamstown (capital) | zh-Hant | [Q48273](https://www.wikidata.org/wiki/Q48273) |
| Mata-Utu (capital) | zh-Hant | [Q31002](https://www.wikidata.org/wiki/Q31002) |

## Overrides in force — 60

Where `name-overrides.json` asserts a name because Wikidata's label is a formal/realm title or absent. **promotable** = the common name already exists as an altLabel, so promoting it on Wikidata (to the label, or a short name) would retire the override.

| entity | overridden langs | promotable | Wikidata |
| --- | --- | --- | --- |
| China | en, de, es, fr, ja, ko, zh-Hans, zh-Hant | fr, ko, zh-Hans, zh-Hant | [Q148](https://www.wikidata.org/wiki/Q148) |
| United States | ja | ja | [Q30](https://www.wikidata.org/wiki/Q30) |
| Indonesia | zh-Hant | — | [Q252](https://www.wikidata.org/wiki/Q252) |
| Bangladesh | zh-Hant | zh-Hant | [Q902](https://www.wikidata.org/wiki/Q902) |
| United Kingdom | ja | ja | [Q145](https://www.wikidata.org/wiki/Q145) |
| Thailand | ja | ja | [Q869](https://www.wikidata.org/wiki/Q869) |
| South Africa | ja, ko | ja, ko | [Q258](https://www.wikidata.org/wiki/Q258) |
| South Korea | ja, zh-Hans, zh-Hant | ja, zh-Hans, zh-Hant | [Q884](https://www.wikidata.org/wiki/Q884) |
| Spain | ja | ja | [Q29](https://www.wikidata.org/wiki/Q29) |
| Kenya | zh-Hant | zh-Hant | [Q114](https://www.wikidata.org/wiki/Q114) |
| Uzbekistan | zh-Hant | zh-Hant | [Q265](https://www.wikidata.org/wiki/Q265) |
| Ivory Coast | es, ja | — | [Q1008](https://www.wikidata.org/wiki/Q1008) |
| Australia | ko, zh-Hant | ko, zh-Hant | [Q408](https://www.wikidata.org/wiki/Q408) |
| North Korea | ko, zh-Hans, zh-Hant | ko, zh-Hans, zh-Hant | [Q423](https://www.wikidata.org/wiki/Q423) |
| Taiwan | es, ja, ko, zh-Hans, zh-Hant | es, ja, ko, zh-Hans, zh-Hant | [Q865](https://www.wikidata.org/wiki/Q865) |
| Mali | ja | ja | [Q912](https://www.wikidata.org/wiki/Q912) |
| Kazakhstan | es | — | [Q232](https://www.wikidata.org/wiki/Q232) |
| Netherlands | en, de, es, fr, it, ja, ko, zh-Hans, zh-Hant | en, de, fr, it | [Q29999](https://www.wikidata.org/wiki/Q29999) |
| Ecuador | zh-Hant | zh-Hant | [Q736](https://www.wikidata.org/wiki/Q736) |
| Zimbabwe | es | — | [Q954](https://www.wikidata.org/wiki/Q954) |
| South Sudan | it | it | [Q958](https://www.wikidata.org/wiki/Q958) |
| Czechia | en, es, it, ja | en, es, it, ja | [Q213](https://www.wikidata.org/wiki/Q213) |
| Tajikistan | zh-Hant | zh-Hant | [Q863](https://www.wikidata.org/wiki/Q863) |
| Kyrgyzstan | fr | fr | [Q813](https://www.wikidata.org/wiki/Q813) |
| Denmark | en, de, es, fr, it, ja, ko, zh-Hans, zh-Hant | en, de, fr | [Q756617](https://www.wikidata.org/wiki/Q756617) |
| Norway | ja | ja | [Q20](https://www.wikidata.org/wiki/Q20) |
| Palestine | fr, it, ja | fr, it | [Q219060](https://www.wikidata.org/wiki/Q219060) |
| Mongolia | ja, zh-Hant | ja, zh-Hant | [Q711](https://www.wikidata.org/wiki/Q711) |
| Guinea-Bissau | ja, ko | ja | [Q1007](https://www.wikidata.org/wiki/Q1007) |
| Kosovo | ja | — | [Q1246](https://www.wikidata.org/wiki/Q1246) |
| Timor-Leste | es, fr | — | [Q574](https://www.wikidata.org/wiki/Q574) |
| Eswatini | es | es | [Q1050](https://www.wikidata.org/wiki/Q1050) |
| Bahamas | en | en | [Q778](https://www.wikidata.org/wiki/Q778) |
| Saint Vincent and the Grenadines | ko | — | [Q757](https://www.wikidata.org/wiki/Q757) |
| Antigua and Barbuda | ja | — | [Q781](https://www.wikidata.org/wiki/Q781) |
| Federated States of Micronesia | de, es, fr, it, ko, zh-Hant | de, es, fr, it | [Q702](https://www.wikidata.org/wiki/Q702) |
| Dominica | ko | ko | [Q784](https://www.wikidata.org/wiki/Q784) |
| Saint Kitts and Nevis | ja | ja | [Q763](https://www.wikidata.org/wiki/Q763) |
| Nauru | de | de | [Q697](https://www.wikidata.org/wiki/Q697) |
| Sint Maarten | zh-Hans | — | [Q26273](https://www.wikidata.org/wiki/Q26273) |
| Jersey | ko | ko | [Q785](https://www.wikidata.org/wiki/Q785) |
| Guernsey | ko | ko | [Q25230](https://www.wikidata.org/wiki/Q25230) |
| Cook Islands | ko | ko | [Q26988](https://www.wikidata.org/wiki/Q26988) |
| Abkhazia | ko | ko | [Q23334](https://www.wikidata.org/wiki/Q23334) |
| Northern Cyprus | de | de | [Q23681](https://www.wikidata.org/wiki/Q23681) |
| Puerto Rico | it | it | [Q1183](https://www.wikidata.org/wiki/Q1183) |
| French Polynesia | ja | ja | [Q30971](https://www.wikidata.org/wiki/Q30971) |
| Northern Mariana Islands | ko | — | [Q16644](https://www.wikidata.org/wiki/Q16644) |
| Faroe Islands | ko | ko | [Q4628](https://www.wikidata.org/wiki/Q4628) |
| American Samoa | ja | ja | [Q16641](https://www.wikidata.org/wiki/Q16641) |
| United States Virgin Islands | es, it, ja | it | [Q11703](https://www.wikidata.org/wiki/Q11703) |
| Cayman Islands | de, ko | de | [Q5785](https://www.wikidata.org/wiki/Q5785) |
| British Virgin Islands | ja | ja | [Q25305](https://www.wikidata.org/wiki/Q25305) |
| Saint Barthélemy | ja | — | [Q25362](https://www.wikidata.org/wiki/Q25362) |
| Saint Pierre and Miquelon | de | de | [Q34617](https://www.wikidata.org/wiki/Q34617) |
| Christmas Island | zh-Hant | — | [Q31063](https://www.wikidata.org/wiki/Q31063) |
| Cocos (Keeling) Islands | zh-Hant | — | [Q36004](https://www.wikidata.org/wiki/Q36004) |
| Belmopan | zh-Hant | — | [Q3043](https://www.wikidata.org/wiki/Q3043) |
| St. John's | de | — | [Q36262](https://www.wikidata.org/wiki/Q36262) |
| Kingston | zh-Hant | — | [Q30963](https://www.wikidata.org/wiki/Q30963) |

## Stale entries — safe to remove — 0

Curated rules the data no longer needs — a Wikidata fix (or a dump change) landed, so these compensations do nothing now and can be deleted.

_None._

## Filtered from the build — for reference

What the build drops from the raw dump over the content languages. Nothing is lost — the raw `country-names.json` / `capital-names.json` keep every term.

**Unflagged aliases — 6158 drop(s), 5527 distinct.** `skos:altLabel` with no pref/official/short flag: ignored by design, the discardable flood (`Red China`, `Rotchina`, `cn`). Count only; a common name genuinely hiding here would need a label or short-name flag on Wikidata to surface.

What is left — flagged code-like names that still get dropped — falls in two kinds, listed as `` `code` (langs) ``:

### Invalid on Wikidata — 24

Filed under P1813 (short name) but really an ISO/technical code, practically never spoken; they belong in P297 / P298. Reviewed into `name-abbreviations.json` `acknowledged`; clean up on Wikidata when convenient.

`AG` (en); `AS` (en); `AUS` (en); `B` (de); `B&H` (en); `BH` (fr); `DRK` (de); `DVRK` (de); `EC` (en); `ECU` (en, fr); `FM` (en); `GU` (en); `HKSAR` (en); `MH` (en); `MYS` (en); `NG` (en); `NIC` (en); `PW` (en); `RIM` (fr); `RP` (en); `TERRITOIRE DE LA POLYNESIE FRANCAISE` (fr); `TW` (en); `TWN` (en); `W` (de)

### Valid but unsuitable for skribbl — 5

Genuine abbreviations, correct on Wikidata, but too short or punctuated to draw. Kept in `name-abbreviations.json` `legit` so the report stays quiet, yet dropped from the lists by the word rule (3+ letters, letters only).

`HK` (en); `I.O.M.` (en); `PH` (en); `U.S.` (en); `É.A.U.` (fr)
