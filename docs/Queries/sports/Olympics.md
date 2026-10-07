# Wikidata Query Analysis: Olympics

What Wikidata offers for the Olympics topics, and how far it can serve as their source.

## Legend

✅ Wikidata **already in use** as Source  
☑️ Wikidata **approved** as Source  
🔵 Good Wikidata Coverage expected (**not checked yet**)  
➕ Wikidata only has **minor Gaps**  
✖️ Wikidata has **LOTS of Gaps**  
❌ Wikidata **not viable** at all  
❓ Viability not yet clear

## Navigation

[Sports](../README.md#sports)
- ❌[Athletes](#athletes)
- ➕[Sports](#sports)

## ❌Athletes

*Not analyzed yet.*

## ➕Sports

**Associated List:** -  
**Definition:** -  
**Assessment:** No class query yields the list (checked 2026-10-06, for PR #35's strand V); the names themselves are well covered.

| Query | Results | Missing, e.g. | Not a current Olympic sport, e.g. |
| :---- | :---- | :---- | :---- |
| `P279 Q212434` (subclass of *Olympic sport*) | 55 | football, basketball, volleyball, gymnastics, rowing, handball, archery | women's / men's water polo, "Olympic winter sport", tug of war, rackets |
| `P31 Q212434` (instance of *Olympic sport*) | 31 | tennis, athletics, swimming | "art", skeet variants, "English boxing" |
| "X at the Summer / Winter Olympics" (`P31 Q18608583`, `P361` = Summer Q159821 / Winter Q82414, `P641` = the sport) | 82 | basketball | every sport ever held (croquet, powerboating, military patrol), art competitions, upcoming LA 2028 sports |

**Rating:** the third query is the most useful base: it carries each sport's history, from which omission rules (no longer on the programme, coming in 2028) could be derived, but it needs an exclusion list for what is no sport to draw and the basketball gap explained. Otherwise the membership is curated and only the names come from Wikidata, as for the chemical elements.

## [to Navigation](#navigation)
