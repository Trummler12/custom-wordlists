# Language Roadmap

The order in which new languages are _planned_ to arrive.
It isn't fixed: a language further down the list moves up
if the people around it turn out to be _unusually_ keen to help.

**Two settings, two speeds.** A word list can be offered in a language long before anyone has translated the interface into it, so the app keeps them apart: 🌐 chooses the language the _lists_ come out in, ⚙️ the language the _app itself_ speaks. The ranking below is about the lists. The interface trails behind it and moves only when someone writes the dictionary.

## Lists

1. **English** (primary starting language)
2. **German** (secondary starting language)
3. **Spanish**
4. **Portuguese**
5. **French**
6. **Russian**, **Turkish**, **Polish**
7. **Italian**, **Dutch**
8. **Japanese**, **Korean**
9. _ex aequo (alphabetical):_ Bulgarian, Czech, Danish, Estonian, Finnish, Greek,
   Hebrew, Hungarian, Latvian, Macedonian, Norwegian, Romanian, Serbian, Slovakian,
   Swedish, Tagalog

The _full_ scope is the set skribbl.io itself [supports](https://skribbl-io.fandom.com/wiki/Supported_Languages) (28 languages),
ordered by rough player-base size, with ties grouped onto a shared rank
(skribbl publishes no numbers, so grouped ranks are deliberate guesses).

Two of these carry a second spelling rather than a second language: Japanese lists can be read as romaji (`ja-Latn`), Spanish ones in their Latin American forms (`es-419`). Both are switches beside the language rather than entries on this list.

## Interface

Written so far: **English, German, Spanish, French, Italian, Japanese, Korean** — one file each, `src/locale/<code>.ts`. Every other language falls back to English, which is how Japanese and Korean can sit at rank 8 above and still have an interface: they arrived when the lists that needed them did, not when the ranking said so. Five of the seven were machine-written and are [looking for proofreaders](../CONTRIBUTING.md#looking-for-ui-proofreaders--spanish-french-italian-japanese-korean).

## Chinese, which is in the app but not on this list

`zh-Hans` and `zh-Hant` are in the language picker because the data has them — the Pokémon lists carry both scripts — and they are two entries rather than one, since a reader who wants Traditional should be able to say so. Neither is planned as an interface language, and neither is among the 28 this roadmap ranks. Being available to pick is not the same as being on the roadmap, and Chinese is the case that shows the difference.
