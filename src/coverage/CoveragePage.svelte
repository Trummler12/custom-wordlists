<script lang="ts">
  // The "Language Coverage" page (strand W1). Reads the topic/lang from the URL, loads its
  // data/coverage/<topic>.json, and renders which languages Wikidata has a label for, per
  // item — sortable by any column and paged. The sticky header/column, the UI-language
  // dropdown and the localized chrome are later batches.
  import { COVERAGE_TOPICS, resolveRoute, type CoverageTopic } from "./route";
  import { firstDir, sortItems, type SortKey, type SortState } from "./sort";

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

  // Human labels for the numeric column, by the meta.numeric key. English for now — the
  // page chrome gets localized (a `coverage` locale block + the UI dropdown) in a later batch.
  const NUMERIC_LABEL: Record<string, string> = {
    population: "Population",
    area: "Area (km²)",
    users: "Users",
  };
  // The two-script Chinese tags are far longer than the other codes and skew the columns;
  // show a short badge in the header, the real code on hover (see the dotted underline).
  const SHORT_LANG: Record<string, string> = { "zh-Hans": "zs", "zh-Hant": "zt" };

  // Every column header carries the language's spelled-out name on hover, in the UI
  // language with English the natural fallback. Intl.DisplayNames is the CLDR source the
  // main app already uses, so no table of our own.
  const langNamer = (() => {
    try {
      return new Intl.DisplayNames([route.uiLang ?? "en", "en"], { type: "language" });
    } catch {
      return new Intl.DisplayNames(["en"], { type: "language" });
    }
  })();
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
  <a class="home" href={base}>← Main App Page</a>
  <div class="controls">
    <label>Topic:
      <select value={route.topic ?? ""} onchange={goTopic}>
        {#if !route.topic}<option value="" disabled>—</option>{/if}
        {#each COVERAGE_TOPICS as t}<option value={t}>{t}</option>{/each}
      </select>
    </label>
  </div>
</header>

{#if !route.topic}
  <main class="index">
    <h1>Language Coverage</h1>
    <p>Pick a topic to see which languages Wikidata already carries a label for, per item.</p>
    <ul>
      {#each COVERAGE_TOPICS as t}
        <li><a href={topicHref(t)}>{t}</a></li>
      {/each}
    </ul>
  </main>
{:else if error}
  <main><p class="error">Could not load coverage for “{route.topic}”: {error}</p></main>
{:else if !data}
  <main><p>Loading “{route.topic}” …</p></main>
{:else}
  <main>
    <h1>Language Coverage — {data.meta.topic}</h1>
    <div class="bar">
      <span class="count">{data.items.length.toLocaleString()} items</span>
      {#if pageCount > 1}
        <span class="pager">
          <button onclick={() => (page = Math.max(0, page - 1))} disabled={page === 0}>‹ Prev</button>
          <span>Page {page + 1} / {pageCount}</span>
          <button onclick={() => (page = Math.min(pageCount - 1, page + 1))} disabled={page >= pageCount - 1}>Next ›</button>
        </span>
      {/if}
    </div>
    <div class="scroll">
      <table>
        <thead>
          <tr>
            <th class="item"><button class="sort" onclick={() => sortBy("name")}>Item{arrow("name")}</button></th>
            {#if data.meta.numeric}
              <th class="num"><button class="sort" onclick={() => sortBy("num")}>{NUMERIC_LABEL[data.meta.numeric] ?? data.meta.numeric}{arrow("num")}</button></th>
            {/if}
            {#each data.meta.langs as lang}
              <th class="lang" class:here={lang === route.lang}>
                <button class="sort" onclick={() => sortBy(lang)} title={langTitle(lang)}>
                  <span class:abbr={!!SHORT_LANG[lang]}>{SHORT_LANG[lang] ?? lang}</span>{arrow(lang)}
                </button>
              </th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each pageItems as item (item.qid)}
            <tr>
              <th class="item" scope="row">
                <a href={wikidata(item.qid)} target="_blank" rel="noopener noreferrer" class:noname={!item.name}>{item.name ?? item.qid}</a>
              </th>
              {#if data.meta.numeric}<td class="num">{item.num?.toLocaleString() ?? "—"}</td>{/if}
              {#each data.meta.langs as lang}
                <td class="cell" class:has={covered(item, lang)} class:here={lang === route.lang}>
                  {covered(item, lang) ? "✓" : "✗"}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </main>
{/if}

<style>
  :global(body) {
    color-scheme: light dark;
    margin: 0;
    font: 14px/1.4 system-ui, sans-serif;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.6rem 1rem;
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
  .controls label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }
  .controls select {
    font: inherit;
  }
  main {
    padding: 1rem;
  }
  h1 {
    font-size: 1.3rem;
    margin: 0 0 0.3rem;
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
  .pager {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .pager button {
    font: inherit;
    cursor: pointer;
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
  }
  table {
    /* `separate`, not `collapse`: collapsed borders belong to the table, so a sticky
       cell's background can't cover them (they bleed through) and the browser rebuilds the
       border grid on every sticky repaint (scroll jank). With separate borders each cell
       owns its own — right and bottom below, top/left on the outer edge — so the grid is a
       clean single line and the sticky header/column stay put smoothly. */
    --grid: rgba(128, 128, 128, 0.35);
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
  th.lang {
    text-align: center;
  }
  .num {
    text-align: right;
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
  }
  .noname {
    font-style: italic; /* a bare Q-id: Wikidata has no label in any of these languages */
    opacity: 0.8;
  }
  .here {
    outline: 3px solid #e3b23c; /* the URL language's column — a thicker yellow edge */
    outline-offset: -3px;
  }
</style>
