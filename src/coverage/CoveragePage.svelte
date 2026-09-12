<script lang="ts">
  // The "Language Coverage" page (strand W1) — first cut. Reads the topic/lang from the
  // URL, loads its data/coverage/<topic>.json, and renders which languages Wikidata has a
  // label for, per item. Sorting, pagination, the sticky header/column, the UI-language
  // dropdown and the localized chrome are later batches; this establishes the pipeline.
  import { COVERAGE_TOPICS, resolveRoute, type CoverageTopic } from "./route";

  interface CoverageItem {
    qid: string;
    name: string;
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
  const ROW_CAP = 100; // until pagination lands, cap the DOM so 2000+ language rows stay snappy

  let data = $state<Coverage | null>(null);
  let error = $state<string | null>(null);

  const wikidata = (qid: string) => `https://www.wikidata.org/wiki/${qid}`;
  const topicHref = (t: string) => `${base}${t}`;
  const covered = (item: CoverageItem, lang: string) => !item.miss?.includes(lang);

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
  {@const shown = data.items.slice(0, ROW_CAP)}
  <main>
    <h1>Language Coverage — {data.meta.topic}</h1>
    <p class="count">
      {data.items.length.toLocaleString()} items
      {#if data.items.length > ROW_CAP}(showing the first {ROW_CAP}; pagination is a later batch){/if}
    </p>
    <div class="scroll">
      <table>
        <thead>
          <tr>
            <th class="item">Item</th>
            {#if data.meta.numeric}<th class="num">{NUMERIC_LABEL[data.meta.numeric] ?? data.meta.numeric}</th>{/if}
            {#each data.meta.langs as lang}
              <th class="lang" class:here={lang === route.lang}>{lang}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each shown as item (item.qid)}
            <tr>
              <th class="item" scope="row">
                <a href={wikidata(item.qid)} target="_blank" rel="noopener noreferrer">{item.name}</a>
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
  .count {
    opacity: 0.75;
    margin: 0 0 0.8rem;
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
    border-collapse: collapse;
    font-variant-numeric: tabular-nums;
  }
  th,
  td {
    border: 1px solid rgba(128, 128, 128, 0.25);
    padding: 0.25rem 0.5rem;
    text-align: left;
    white-space: nowrap;
  }
  th.lang {
    text-align: center;
  }
  .num {
    text-align: right;
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
  .here {
    outline: 2px solid #d4a017;
    outline-offset: -2px;
  }
</style>
