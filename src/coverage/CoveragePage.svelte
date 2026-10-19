<script lang="ts">
  // The "Language Coverage" page (strand W1). Reads the topic/lang from the URL, loads its
  // data/coverage/<topic>.json, and renders which languages Wikidata has a label for, per
  // item — sortable by any column, paged, its chrome localized and switchable in place.
  import { COVERAGE_TOPICS, coverageTopicOf, resolveRoute, type CoverageTopic } from "./route";
  import { firstDir, sortItems, type SortKey, type SortState } from "./sort";
  import { nameLanding, numberLanding, parseJump } from "./jump";
  import { tick } from "svelte";
  import { plain } from "../locale/html/plain";
  import { FALLBACK_LANG, strings, UI_LANGS } from "../locale";
  import { loadManifest } from "../lib/data";
  import { resolveStr } from "../lib/words";
  import type { LocalizedString, Manifest } from "../lib/types";
  import Msg from "../locale/html/Msg.svelte";
  import { plainText } from "../locale/html/markup";
  import SiteFooter from "../components/layout/SiteFooter.svelte";

  interface CoverageItem {
    qid: string;
    name?: string; // absent when Wikidata has no label in any covered language
    num?: number;
    miss?: string[];
  }
  interface Coverage {
    meta: { topic: string; numeric: string | null; langs: string[] };
    items: CoverageItem[];
  }

  const base = import.meta.env.BASE_URL;
  const route = resolveRoute(location.pathname, location.search, base);

  // The interface language: an explicit URL segment wins, else the reader's last choice
  // (persisted below, since the canonical URL drops the segment), else the content language,
  // else English — and switchable at runtime via the dropdown. Only the languages that have
  // a dictionary are offered; anything else falls through strings() to English anyway.
  const asUiLang = (l: string | null): string | null => (l && UI_LANGS.includes(l) ? l : null);
  const UILANG_KEY = "wordlists:coverageUiLang";
  const storedUiLang = (): string | null => {
    try {
      return asUiLang(localStorage.getItem(UILANG_KEY));
    } catch {
      return null; // private mode or storage disabled — fall through to the other sources
    }
  };
  let uiLang = $state(asUiLang(route.uiLang) ?? storedUiLang() ?? asUiLang(route.lang) ?? FALLBACK_LANG);
  // Remember the choice so a reload keeps it, rather than snapping back to the content language.
  $effect(() => {
    try {
      localStorage.setItem(UILANG_KEY, uiLang);
    } catch {
      // ignore — nothing depends on the write succeeding
    }
  });
  // The fallback language the reader chose in the app's 🌐 panel, for labels the interface
  // dictionary lacks. Read once: this page offers no control for it.
  const fallbackLang = (() => {
    try {
      return asUiLang(localStorage.getItem("wordlists:fallbackLang")) ?? FALLBACK_LANG;
    } catch {
      return FALLBACK_LANG;
    }
  })();
  const ui = $derived(strings(uiLang, fallbackLang).coveragePage);
  const numLabel = (key: string): string => (ui.numeric as Record<string, string>)[key] ?? key;

  // Topic names come from the topic data, not a duplicated locale table (the "locale-like
  // data" rule): the manifest carries each topic's localized title. `coverageTopicOf` is the
  // shared topic⇒coverage mapping (also drives the app's omission-row link); countries/
  // capitals are split across the per-continent topics, so any one of them stands in (their
  // titles are identical). Continents uses its short form.
  let manifest = $state<Manifest | null>(null);
  loadManifest().then((m) => (manifest = m)).catch(() => {});
  function topicTitle(topic: CoverageTopic, lang: string): string {
    const summary = manifest?.topics.find((t) => coverageTopicOf(t) === topic);
    if (!summary) return topic; // manifest not in yet — the id shows briefly
    const title = summary.title;
    const loc: LocalizedString =
      title && typeof title === "object" && "short" in title ? (title.short as LocalizedString) : (title as LocalizedString);
    return resolveStr(loc, lang);
  }
  const topicName = $derived(route.topic ? topicTitle(route.topic, uiLang) : "");

  // The dropdown lists each UI language under its own name (endonym), computed once.
  const endonym = (code: string): string => {
    try {
      return new Intl.DisplayNames([code], { type: "language" }).of(code) ?? code;
    } catch {
      return code;
    }
  };
  const uiLangOptions = UI_LANGS.map((code) => ({ code, name: endonym(code) }));

  // The two-script Chinese tags are far longer than the other codes and skew the columns;
  // show a short badge in the header, the real code on hover (see the dotted underline).
  const SHORT_LANG: Record<string, string> = { "zh-Hans": "zs", "zh-Hant": "zt" };

  // Column headers carry the language's spelled-out name on hover, in the current UI
  // language (English the natural fallback), via the same CLDR source the main app uses.
  const langNamer = $derived.by(() => {
    try {
      return new Intl.DisplayNames([uiLang, "en"], { type: "language" });
    } catch {
      return new Intl.DisplayNames(["en"], { type: "language" });
    }
  });
  const langName = (code: string): string => {
    try {
      return langNamer.of(code) ?? code;
    } catch {
      return code;
    }
  };
  // A shortened zh tag shows its real code first, then the name on a second line.
  const langTitle = (lang: string): string => (SHORT_LANG[lang] ? `${lang}\n${langName(lang)}` : langName(lang));
  const PAGE_SIZE = 100; // one screenful of rows; a size control is a later batch

  // The interface language is applied but not shown: the shareable URL stays
  // <base>coverage/<topic>/<lang>. Drop any /<uiLang> segment or ?/ leftover once.
  if (route.topic) {
    const canonical = `${base}coverage/${route.topic}${route.lang ? `/${route.lang}` : ""}`;
    if (location.pathname !== canonical || location.search) history.replaceState(null, "", canonical);
  }

  let data = $state<Coverage | null>(null);
  let error = $state<string | null>(null);

  // The URL's language starts "pre-clicked" (its gaps on top); with none, the most-gaps
  // default order kicks in (see sort.ts).
  let sort = $state<SortState>(route.lang ? { key: route.lang, dir: "desc" } : { key: null, dir: "desc" });
  let page = $state(0);

  const sorted = $derived(data ? sortItems(data.items, sort) : []);
  const pageCount = $derived(Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)));
  const pageItems = $derived(sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE));

  const wikidata = (qid: string) => `https://www.wikidata.org/wiki/${qid}`;
  const topicHref = (t: string) => `${base}coverage/${t}`;
  const covered = (item: CoverageItem, lang: string) => !item.miss?.includes(lang);

  // Clicking a header sorts by it: a new column takes its natural first direction, the
  // active one flips. Any re-sort returns to the first page.
  function sortBy(key: SortKey) {
    sort = sort.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: firstDir(key) };
    page = 0;
  }
  const arrow = (key: SortKey) => (sort.key !== key ? "" : sort.dir === "asc" ? " ▲" : " ▼");

  // The pager's "Page n / m" is also a jump field. A page number in range goes there and
  // leaves the order alone; any other number is a value of the numeric column (sorted
  // largest first), anything else an entry name (sorted A→Z) — and the table lands
  // where it would sort, with that row flashed.
  let jumping = $state(false);
  let jumpText = $state("");
  let jumpError = $state(false);
  let landed = $state<string | null>(null);
  let errorTimer: ReturnType<typeof setTimeout> | undefined;
  let landTimer: ReturnType<typeof setTimeout> | undefined;
  // The field takes the place of the "Page 3" it replaces, at exactly that width: wide
  // enough for nearly anything typed, and the pager around it doesn't move.
  let currentEl = $state<HTMLElement>();
  let jumpWidth = $state("");
  const pageLabel = $derived.by(() => {
    const [before, current, after] = ui.pageParts(page + 1, pageCount);
    const no = String(page + 1);
    return { before, current, after, no, at: current.indexOf(no) };
  });

  function startJump() {
    jumpWidth = currentEl ? `${currentEl.getBoundingClientRect().width}px` : "";
    jumpText = String(page + 1);
    jumpError = false;
    jumping = true;
  }
  function stopJump() {
    jumping = false;
    jumpError = false;
    clearTimeout(errorTimer);
  }
  function land(index: number) {
    page = Math.floor(index / PAGE_SIZE);
    landed = sorted[index]?.qid ?? null;
    clearTimeout(landTimer);
    landTimer = setTimeout(() => (landed = null), 2000);
    void tick().then(() => document.querySelector("tr.landed")?.scrollIntoView({ block: "center" }));
  }
  function commitJump() {
    const target = parseJump(jumpText);
    if (!target || !data) return stopJump();
    if (target.kind === "number" && target.value >= 1 && target.value <= pageCount) {
      page = target.value - 1;
      return stopJump();
    }
    if (target.kind === "number" && !data.meta.numeric) {
      // Nothing to read the number against: say so on the field for a moment.
      jumpError = true;
      clearTimeout(errorTimer);
      errorTimer = setTimeout(() => (jumpError = false), 3000);
      return;
    }
    stopJump();
    if (target.kind === "number") {
      sort = { key: "num", dir: "desc" };
      land(numberLanding(sorted, target.value));
    } else {
      sort = { key: "name", dir: "asc" };
      land(nameLanding(sorted, target.text));
    }
  }
  function jumpKey(e: KeyboardEvent) {
    if (e.key === "Enter") commitJump();
    else if (e.key === "Escape") stopJump();
  }
  function focusSelect(node: HTMLInputElement) {
    node.focus();
    node.select();
  }

  // The language columns group the official languages (UI_LANGS) to the left and the rest
  // after — a stable partition, so each side keeps the dump's order and `en` stays leftmost.
  // The list is always complete: "UI languages only" dims the non-official columns (see
  // `.dim`) rather than removing them, so the table's width stays constant (the width cap
  // relies on it) and toggling shifts nothing. A divider marks the boundary.
  let uiOnly = $state(false);
  const isOfficial = (l: string): boolean => UI_LANGS.includes(l);
  const officialLangs = $derived((data?.meta.langs ?? []).filter(isOfficial));
  const otherLangs = $derived((data?.meta.langs ?? []).filter((l) => !isOfficial(l)));
  const displayLangs = $derived([...officialLangs, ...otherLangs]);
  const dividerLang = $derived(otherLangs.length ? officialLangs[officialLangs.length - 1] : null);

  async function load(topic: CoverageTopic) {
    try {
      const res = await fetch(`${base}data/coverage/${topic}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      data = (await res.json()) as Coverage;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  if (route.topic) void load(route.topic);

  // Switching topic is a plain navigation to its route (the entry reloads and refetches);
  // the content language, if any, is carried across.
  function goTopic(event: Event) {
    const topic = (event.currentTarget as HTMLSelectElement).value;
    if (topic) location.assign(`${base}coverage/${topic}${route.lang ? `/${route.lang}` : ""}`);
  }
</script>

<header>
  <a class="home" href={base}>← <Msg text={ui.home} /></a>
  <div class="controls">
    <!-- Captions, not <label>s: a label hands its hover to the dropdown, which then
         lights up under a pointer that can't open it. -->
    <span class="control"
      ><span id="coverage-topic-label"><Msg text={ui.topicLabel} /></span>
      <select aria-labelledby="coverage-topic-label" value={route.topic ?? ""} onchange={goTopic}>
        {#if !route.topic}<option value="" disabled>—</option>{/if}
        {#each COVERAGE_TOPICS as t}<option value={t}>{topicTitle(t, uiLang)}</option>{/each}
      </select></span
    >
    <span class="control uilang"
      ><span aria-hidden="true">🌐</span>
      <select bind:value={uiLang} aria-label={plain(ui.uiLanguage)}>
        {#each uiLangOptions as opt}<option value={opt.code}>{opt.name}</option>{/each}
      </select></span
    >
  </div>
</header>

{#if !route.topic}
  <main class="index">
    <h1><Msg text={ui.title} /></h1>
    <p><Msg text={ui.intro} /></p>
    <ul>
      {#each COVERAGE_TOPICS as t}
        <li><a href={topicHref(t)}>{topicTitle(t, uiLang)}</a></li>
      {/each}
    </ul>
  </main>
{:else if error}
  <main><p class="error"><Msg text={ui.loadError(topicName, error)} /></p></main>
{:else if !data}
  <main><p><Msg text={ui.loading(topicName)} /></p></main>
{:else}
  <div class="wrap" style:--lang-count={displayLangs.length}>
  <main>
    <h1><Msg text={ui.title} /> — {topicName}</h1>
    <p class="lead"><Msg text={ui.lead} /></p>
    <details class="notes">
      <summary><Msg text={ui.notesTitle} /></summary>
      <ul>
        <li><Msg text={ui.noteAdd} /></li>
        <li><Msg text={ui.noteLabelLister} /></li>
        <li><Msg text={ui.noteProtected} /></li>
        <li><Msg text={ui.noteStale} /></li>
      </ul>
    </details>
    <div class="bar">
      <span class="count"><Msg text={ui.itemCount(data.items.length)} /></span>
      <div class="bar-right">
        <label class="uionly" title={plainText(ui.uiOnlyHint, "\n")}>
          <input type="checkbox" bind:checked={uiOnly} />
          <div class="uionly-text"><Msg text={ui.uiOnly} /></div>
        </label>
        {#if pageCount > 1}
          <span class="pager">
            <button onclick={() => (page = 0)} disabled={page === 0} aria-label={plain(ui.first)} title={plain(ui.first)}>‹‹‹</button>
            <button onclick={() => (page = Math.max(0, page - 1))} disabled={page === 0} aria-label={plain(ui.prev)} title={plain(ui.prev)}>‹</button>
            {#if jumping}
              <span class="page-label"
                >{pageLabel.before}<span class="jump"
                  ><input
                    class="jump-input"
                    class:error={jumpError}
                    style:width={jumpWidth}
                    aria-label={plain(ui.pageJumpInput)}
                    aria-invalid={jumpError}
                    placeholder={plain(ui.pageJumpInput)}
                    bind:value={jumpText}
                    use:focusSelect
                    onkeydown={jumpKey}
                    onblur={stopJump}
                  />{#if jumpError}<span class="jump-error" role="alert"><Msg text={ui.pageNoNumeric} /></span
                    >{/if}</span
                >{pageLabel.after}</span
              >
            {:else}
              <!-- The whole label is the click target; only the number looks like one. -->
              <button
                class="page-jump"
                title={plain(ui.pageJumpHint(data.meta.numeric ? numLabel(data.meta.numeric) : null), "\n")}
                onclick={startJump}
                >{pageLabel.before}<span bind:this={currentEl}
                  >{#if pageLabel.at < 0}{pageLabel.current}{:else}{pageLabel.current.slice(0, pageLabel.at)}<span class="page-no">{pageLabel.no}</span
                    >{pageLabel.current.slice(pageLabel.at + pageLabel.no.length)}{/if}</span
                >{pageLabel.after}</button
              >
            {/if}
            <button onclick={() => (page = Math.min(pageCount - 1, page + 1))} disabled={page >= pageCount - 1} aria-label={plain(ui.next)} title={plain(ui.next)}>›</button>
            <button onclick={() => (page = pageCount - 1)} disabled={page >= pageCount - 1} aria-label={plain(ui.last)} title={plain(ui.last)}>›››</button>
          </span>
        {/if}
      </div>
    </div>
    <div class="scroll">
      <table>
        <thead>
          <tr>
            <th class="item"><button class="sort" onclick={() => sortBy("name")}><Msg text={ui.item} />{arrow("name")}</button></th>
            {#if data.meta.numeric}
              <th class="num"><button class="sort" onclick={() => sortBy("num")}><Msg text={numLabel(data.meta.numeric)} />{arrow("num")}</button></th>
            {/if}
            {#each displayLangs as lang (lang)}
              <th class="lang" class:here={lang === route.lang} class:divider={lang === dividerLang} class:dim={uiOnly && !isOfficial(lang)}>
                <button class="sort" onclick={() => sortBy(lang)} title={langTitle(lang)}>
                  <span class:abbr={!!SHORT_LANG[lang]}>{SHORT_LANG[lang] ?? lang}</span>{arrow(lang)}
                </button>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each pageItems as item (item.qid)}
            <tr class:landed={item.qid === landed}>
              <th class="item" scope="row">
                <a href={wikidata(item.qid)} target="_blank" rel="noopener noreferrer" title={item.name ?? item.qid} class:noname={!item.name}>{item.name ?? item.qid}</a>
              </th>
              {#if data.meta.numeric}<td class="num">{item.num?.toLocaleString() ?? "—"}</td>{/if}
              {#each displayLangs as lang (lang)}
                <td class="cell" class:has={covered(item, lang)} class:here={lang === route.lang} class:divider={lang === dividerLang} class:dim={uiOnly && !isOfficial(lang)}>
                  {covered(item, lang) ? "✓" : "✗"}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </main>
  <SiteFooter footer={strings(uiLang, fallbackLang).footer} flow sticky />
  </div>
{/if}

<style>
  /* The <body> baseline (margin, tighter font) lives in coverage.css — it cannot be
     component-scoped. Everything below is scoped to this page. */
  header {
    /* Pinned to the top so the home link + topic/language selects stay reachable while the
       page scrolls. Opaque (Canvas = the page background) so the table doesn't show through,
       and above everything below it — including the table's sticky header (z-index up to 3). */
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 1rem;
    background: Canvas;
    border-bottom: 1px solid rgba(128, 128, 128, 0.35);
  }
  .home {
    text-decoration: none;
    opacity: 0.85;
  }
  .controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .controls .control {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  .controls select {
    font: inherit;
  }
  /* The loaded content (main + footer) is capped and centred at --content-cap ≈ the table's
     natural full width, so wide windows don't stretch it and narrow ones scroll the table
     rather than the cap forcing it. --content-cap is defined HERE, on .wrap, on purpose: it
     reads --lang-count (set inline below from the data), and a custom property resolves its
     nested var()s where it is DECLARED — defining it on <body> froze in <body>'s static count,
     so the cap never tracked the data. On .wrap the real per-topic count drives it. Tunables:
     --lang-col (one 2-char language column) and --table-buffer (extra slack). */
  .wrap {
    --lang-col: 1.9ch;
    --content-cap: calc(
      28ch + 13ch + var(--lang-count) * var(--lang-col) + (var(--lang-count) + 2) * 1rem + 5rem
    );
    --table-buffer: 0px; /* extra allowance around the table, tune as needed */
    --dim-opacity: 0.42; /* how faint the non-official columns go under "UI languages only" */
    max-width: calc(var(--content-cap) + var(--table-buffer, 0px));
    margin-inline: auto;
  }
  /* The header stays a full-width top bar (home link + the topic/language selects); only the
     loaded table below is capped. */
  main {
    padding: 1rem;
  }
  h1 {
    font-size: 1.3rem;
    margin: 0 0 0.3rem;
  }
  .lead {
    max-width: 70ch;
    margin: 0 0 0.6rem;
    opacity: 0.9;
  }
  .notes {
    max-width: 70ch;
    margin: 0 0 0.9rem;
  }
  .notes summary {
    cursor: pointer;
    font-weight: 600;
  }
  .notes ul {
    margin: 0.4rem 0 0;
    padding-left: 1.2rem;
  }
  .notes li {
    margin: 0.3rem 0;
    opacity: 0.9;
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: 0 0 0.8rem;
  }
  .count {
    opacity: 0.75;
  }
  .bar-right {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
  }
  .uionly {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    white-space: nowrap;
  }
  .uionly-text {
    text-wrap: wrap;
  }
  .pager {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .pager button {
    font: inherit;
    cursor: pointer;
  }
  /* The page count reads as text and only hints at being a control: a soft outline around
     the current number. */
  .pager .page-jump {
    border: 0;
    background: none;
    color: inherit;
    padding: 0;
  }
  .page-no {
    border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
    border-radius: 0.3rem;
    padding: 0 0.3rem;
  }
  .pager .page-jump:hover .page-no,
  .pager .page-jump:focus-visible .page-no {
    border-color: color-mix(in srgb, currentColor 55%, transparent);
  }
  .jump {
    position: relative;
  }
  .jump-input {
    box-sizing: border-box;
    font: inherit;
    min-width: 0;
  }
  .jump-input.error {
    outline: 2px solid var(--danger, #c0392b);
    outline-offset: 0;
  }
  /* Under the field, so the pager doesn't jump sideways when it appears. */
  .jump-error {
    position: absolute;
    top: calc(100% + 0.2rem);
    right: 0;
    white-space: nowrap;
    color: var(--danger, #c0392b);
    font-size: 0.85em;
  }
  /* The row a jump landed on, picked out for a moment. */
  tbody tr.landed th,
  tbody tr.landed td {
    animation: landed 2s ease-out;
  }
  @keyframes landed {
    from {
      background: color-mix(in srgb, Highlight 45%, transparent);
    }
  }
  .pager button:disabled {
    cursor: default;
    opacity: 0.5;
  }
  .sort {
    width: 100%;
    border: 0;
    background: none;
    color: inherit;
    font: inherit;
    font-weight: 600;
    text-align: inherit;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
  }
  .error {
    color: #c0392b;
  }
  .index ul {
    line-height: 1.9;
  }
  .scroll {
    overflow: auto;
    max-height: 80vh;
    margin-bottom: -0.5rem; /* clear space below the horizontal scrollbar, before the footer */
  }
  table {
    /* `separate`, not `collapse`: collapsed borders belong to the table, so a sticky
       cell's background can't cover them (they bleed through) and the browser rebuilds the
       border grid on every sticky repaint (scroll jank). With separate borders each cell
       owns its own — right and bottom below, top/left on the outer edge — so the grid is a
       clean single line and the sticky header/column stay put smoothly. */
    --grid: rgba(128, 128, 128, 0.35);
    width: 100%; /* fill the capped wrapper; the numeric column (width:100%) absorbs the slack */
    border-collapse: separate;
    border-spacing: 0;
    font-variant-numeric: tabular-nums;
  }
  th,
  td {
    border-right: 1px solid var(--grid);
    border-bottom: 1px solid var(--grid);
    padding: 0.25rem 0.5rem;
    text-align: left;
    white-space: nowrap;
  }
  thead th {
    border-top: 1px solid var(--grid); /* the grid's top edge */
  }
  th.item {
    border-left: 1px solid var(--grid); /* the grid's left edge (the Item column) */
  }
  /* The Entry name is capped at the reference width and truncates with an ellipsis; the full
     name sits on the link's `title`. A block-level link so the max-width and ellipsis take
     hold (a table cell's own max-width is unreliable under table-layout:auto). */
  th.item a {
    display: block;
    max-width: 28ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* The numeric column absorbs the leftover width, so the numeric + language columns sit as a
     block flush against the right of the table (the columns move right, not their contents).
     The numeric value keeps its conventional right alignment; the language cells stay centred. */
  th.lang {
    text-align: center;
  }
  .num {
    text-align: right;
    width: 100%;
  }
  /* The header row and the Item column stay in view while scrolling the big grid; both
     need an opaque background so the cells behind don't bleed through. */
  thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: Canvas;
  }
  th.item {
    position: sticky;
    left: 0;
    z-index: 1;
    background: Canvas;
  }
  thead th.item {
    z-index: 3; /* the top-left corner is sticky on both axes */
  }
  /* A translucent grey layer lightens a dark cell and darkens a light one, so the hovered
     row reads on the neutral cells and the green/red ones alike. */
  tbody tr:hover td,
  tbody tr:hover th {
    box-shadow: inset 0 0 0 100px rgba(127, 127, 127, 0.18);
  }
  .abbr {
    text-decoration: underline dotted;
    text-underline-offset: 2px;
  }
  .cell {
    text-align: center;
    color: #fff;
    font-weight: 600;
    /* Keep the marks as plain text, never colour-font emoji, so they stay white. */
    font-variant-emoji: text;
  }
  .cell.has {
    background: #1b6e2e; /* solid green — white mark on top */
  }
  .cell:not(.has) {
    background: #c62828; /* solid red — same weight of mark, for symmetry */
    font-size: smaller;
  }
  .noname {
    font-style: italic; /* a bare Q-id: Wikidata has no label in any of these languages */
    opacity: 0.8;
  }
  .here {
    outline: 3px solid #e3b23c; /* the URL language's column — a thicker yellow edge */
    outline-offset: -3px;
  }
  /* The boundary between the official languages and the rest. A thicker, more opaque grey
     than the 1px grid, so it reads as a divider in both themes; the yellow `.here` marker
     is an outline painted on top, so it still wins where the two land on the same column. */
  .divider {
    border-right: 3px solid rgba(128, 128, 128, 0.85);
  }
  /* "UI languages only" fades the non-official columns instead of removing them, so the table
     keeps its width and nothing shifts (`--dim-opacity`, set on .wrap, tunable). A body cell
     fades whole — nothing sits behind it — but the sticky header would let the scrolled body
     show through if its background went translucent too, so there only the label fades while
     the opaque cell background stays put. */
  .cell.dim {
    opacity: var(--dim-opacity, 0.42);
  }
  thead th.lang.dim .sort {
    opacity: var(--dim-opacity, 0.42);
  }
  /* The footer is passed `flow` (see the markup), so SiteFooter renders it in-flow at the
     bottom of the capped .wrap rather than as the app's fixed bar — it no longer overlaps the
     table, and its inner width follows the content cap instead of the main app's 60rem. */
</style>
