# Pokémon species name archive

All-language Pokémon species names, kept as a reference for when the site gains more languages later. **Not app data** — the app itself uses only the `de`/`en` lists under `data/topics/gaming/pokemon/`.

## Provenance

Pulled from [PokéAPI](https://pokeapi.co) — a **verbatim dump** of its `pokemon-species` `names`. The generator that wrote them is gone (it also wrote a `de.json`/`en.json` layout that stopped existing in #18); `scripts/pokemon/dump-names.mjs` is the one that writes dumps in this shape today. Don't hand-edit these.

## Format

- `gen-<n>/<lang>.txt` — one file per language per generation.
- One entry per line: `<national-dex-id>\t<name>`, in National-Dex order.
- Languages as PokéAPI returns them: `de`, `en`, `es`, `es-419`, `fr`, `it`, `ja`, `ja-hrkt` (kana), `ja-roma` (romaji), `ko`, `zh-hans`, `zh-hant`.

## Known upstream limitation (Chinese)

A few newer entries in the Chinese variants (`zh-hans`/`zh-hant`) carry PokéAPI's own Traditional/Simplified inconsistencies — some names mix scripts, and for #1023 (Iron Crown) the two files are effectively swapped. Confirmed affected:
#474 (Porygon-Z), #973 (Flamigo), #1022 (Iron Boulder), #1023 (Iron Crown).
They are kept **verbatim as returned by the API** rather than hand-corrected, because these files are generated. Normalize/verify the Chinese lists before using them in production.
