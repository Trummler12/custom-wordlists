<script lang="ts">
  import { onMount } from "svelte";
  import { loadManifest, loadTopic } from "./lib/data";
  import type {
    TopicSummary,
    Topic,
    Group,
    NamesMode,
    WordEntry,
    CategoryMeta,
  } from "./lib/types";
  import { SKRIBBL } from "./lib/skribbl";
  import { groupEntries, groupHasNames, renderCount, renderEntry } from "./lib/words";
  import { buildTree, catDepth, titleCase, type CatNode } from "./lib/tree";
  import { depthFromKey, depthFromPointer, snapPositions } from "./lib/fame";
  import { selectAll, setIndeterminate } from "./lib/dom";
  import { strings, SUPPORTED_LANGS } from "./locale";

  // Repo home, used for the footer links.
  const REPO_URL = "https://github.com/Trummler12/custom-wordlists";

  let topics = $state<TopicSummary[]>([]);
  let categories = $state<Record<string, CategoryMeta>>({}); // path → display metadata
  let loading = $state(true);
  let error = $state<string | null>(null);

  let topicData = $state<Record<string, Topic>>({}); // id → loaded topic (cache)
  let loadingById = $state<Record<string, boolean>>({});
  let topicError = $state<string | null>(null);

  let expanded = $state<Record<string, boolean>>({});
  let catExpanded = $state<Record<string, boolean>>({}); // category node open/closed, by path
  let selected = $state<Record<string, boolean>>({}); // flat groups only, key `${topicId}:${groupId}`
  // Per-group fame depth (top-N tiers), keyed like `selected`. Absent/0 = unselected.
  let depthByGroup = $state<Record<string, number>>({});
  // Per-group names mode (only groups with short/long entries show the dropdown).
  let namesMode = $state<Record<string, NamesMode>>({});

  // Selected UI language: which variant of a localized topic to load. Neutral
  // topics ignore it. Persisted in localStorage; default resolved in onMount.
  let lang = $state<string>("en");
  const LANG_STORAGE_KEY = "wordlists:lang";
  // Endonyms for the picker; fallback is the upper-cased code.
  const LANG_NAMES: Record<string, string> = {
    de: "Deutsch", en: "English", fr: "Français", es: "Español", it: "Italiano",
    pt: "Português", nl: "Nederlands", pl: "Polski", ja: "日本語", ko: "한국어", zh: "中文",
  };
  const langName = (l: string) => LANG_NAMES[l] ?? l.toUpperCase();
  // Active UI-chrome strings; follows `lang`, falls back to English (see locale/).
  // Named `ui` (not the i18n-usual `t`) because `t` is the TopicSummary loop var.
  const ui = $derived(strings(lang));
  // Which language menu is open (by instance id), or null. Two pickers share the
  // language but each has its own trigger.
  let langMenuOpen = $state<string | null>(null);
  // Topic whose language warning shows its note, or null. A `title=` tooltip needs a
  // hover, which touch devices don't have — so the ⚠️ is a button as well (issue #22).
  let warnOpen = $state<string | null>(null);
  // What kind of pointer last went down anywhere on the page. A click event doesn't
  // carry that, and it decides whether the warning follows the cursor or the tap.
  let lastPointerType = "mouse";
  // Whether the open warning note sits above its row instead of below it.
  let warnAbove = $state(false);
  /** Open a topic's language note, flipping it above the row when the marker is low
   *  enough that a note below would be cut off by the bottom of the viewport. */
  function openWarn(id: string, marker: Element) {
    warnAbove = marker.getBoundingClientRect().bottom > window.innerHeight * (2 / 3);
    warnOpen = id;
  }

  let copied = $state(false);

  const key = (tid: string, gid: string) => `${tid}:${gid}`;

  // Languages offered by the picker — the app's curated set (see locale/), not
  // derived from topics: a topic missing the selected language falls back to en.
  const availableLangs = SUPPORTED_LANGS;

  onMount(async () => {
    try {
      const manifest = await loadManifest();
      topics = manifest.topics;
      categories = manifest.categories ?? {};
      // Default language: stored → browser → en → first available.
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(LANG_STORAGE_KEY);
      } catch {
        /* localStorage unavailable — ignore */
      }
      const browser = navigator.language?.slice(0, 2);
      lang =
        [stored, browser, "en"].find((l) => l && availableLangs.includes(l)) ??
        availableLangs[0] ??
        "en";
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    } finally {
      loading = false;
    }
  });

  /** Switch the UI language. Topic files carry every language inline, so nothing
   *  is refetched — the derived counts/output re-resolve each entry against the
   *  new `lang` reactively, and the id-keyed selection stays put. */
  function setLanguage(l: string) {
    if (l === lang) return;
    lang = l;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, l);
    } catch {
      /* localStorage unavailable — ignore */
    }
  }
  const chooseLanguage = (l: string) => {
    langMenuOpen = null;
    setLanguage(l);
  };
  function onWindowPointerDown(e: PointerEvent) {
    if (e.pointerType) lastPointerType = e.pointerType;
    const target = e.target as Element | null;
    if (langMenuOpen && !target?.closest?.(".lang-picker")) langMenuOpen = null;
    // Only for pointers without hover — with a mouse, leaving the marker closes it.
    if (warnOpen && lastPointerType !== "mouse" && !target?.closest?.(".lang-warning")) {
      warnOpen = null;
    }
  }
  function onWindowKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      langMenuOpen = null;
      warnOpen = null;
    }
  }

  async function ensureLoaded(t: TopicSummary): Promise<Topic | null> {
    if (topicData[t.id]) return topicData[t.id];
    if (loadingById[t.id]) return null;
    loadingById[t.id] = true;
    topicError = null;
    try {
      const data = await loadTopic(t.path);
      topicData[t.id] = data;
      return data;
    } catch (e) {
      topicError = e instanceof Error ? e.message : String(e);
      return null;
    } finally {
      loadingById[t.id] = false;
    }
  }

  async function toggleExpand(t: TopicSummary) {
    expanded[t.id] = !expanded[t.id];
    if (expanded[t.id]) await ensureLoaded(t);
  }

  const groupsOf = (t: TopicSummary): Group[] => topicData[t.id]?.groups ?? [];

  // --- Selection model -------------------------------------------------------
  // Tiered groups are represented purely by depthByGroup[k] (0…tierCount);
  // flat `words` groups keep the boolean selected[k]. Every parent state below
  // (group full/partial, topic, category) is derived from these two, so moving
  // a slider rolls up to the topic and category checkboxes with no extra code.

  const tierCount = (g: Group) => g.tiers?.length ?? 0;

  // --- Names mode (short / long / both) --------------------------------------
  // A group's entries are plain strings or { short, long } pairs. A group with
  // any pair shows a per-group Names dropdown; the mode picks which form(s) to
  // emit. Counts and output dedup identical rendered strings (e.g. two "Kyle"s).
  const modeOf = (k: string): NamesMode => namesMode[k] ?? "long";

  // The resolvers in lib/words.ts take the language as an argument; passing
  // `lang` here is what keeps every derived count and the output recomputing on
  // a language switch, with no refetch.
  function selectedEntries(tid: string, g: Group): WordEntry[] {
    const k = key(tid, g.id);
    if (g.tiers) return g.tiers.slice(0, depthByGroup[k] ?? 0).flat();
    return selected[k] ? g.words ?? [] : [];
  }

  const groupTotal = (tid: string, g: Group): number =>
    renderCount(groupEntries(g), modeOf(key(tid, g.id)), lang);
  const groupSelCount = (tid: string, g: Group): number =>
    renderCount(selectedEntries(tid, g), modeOf(key(tid, g.id)), lang);

  const groupFull = (tid: string, g: Group): boolean => {
    const k = key(tid, g.id);
    return g.tiers ? (depthByGroup[k] ?? 0) === g.tiers.length : !!selected[k];
  };
  const groupPartial = (tid: string, g: Group): boolean => {
    if (!g.tiers) return false;
    const d = depthByGroup[key(tid, g.id)] ?? 0;
    return d > 0 && d < g.tiers.length;
  };

  const topicSelCount = (t: TopicSummary): number =>
    groupsOf(t).reduce((n, g) => n + groupSelCount(t.id, g), 0);
  // Total available for a topic: live (mode-aware) once loaded, else the manifest
  // entry count as a baseline.
  const topicTotal = (t: TopicSummary): number => {
    const gs = groupsOf(t);
    return gs.length ? gs.reduce((n, g) => n + groupTotal(t.id, g), 0) : t.wordCount;
  };
  const topicFull = (t: TopicSummary): boolean => {
    const gs = groupsOf(t);
    return gs.length > 0 && gs.every((g) => groupFull(t.id, g));
  };
  const topicPartial = (t: TopicSummary): boolean =>
    topicSelCount(t) > 0 && !topicFull(t);

  const catTotal = (ts: TopicSummary[]) => ts.reduce((n, t) => n + topicTotal(t), 0);
  const catSel = (ts: TopicSummary[]) => ts.reduce((n, t) => n + topicSelCount(t), 0);
  const catFull = (ts: TopicSummary[]) => ts.every(topicFull);
  const catPartial = (ts: TopicSummary[]) => catSel(ts) > 0 && !catFull(ts);

  function dragDepth(e: PointerEvent, k: string, g: Group) {
    depthByGroup[k] = depthFromPointer(e, g);
  }
  function keyDepth(e: KeyboardEvent, k: string, n: number) {
    const d = depthFromKey(e, depthByGroup[k] ?? 0, n);
    if (d === null) return;
    e.preventDefault();
    depthByGroup[k] = d;
  }

  function setGroup(tid: string, g: Group, on: boolean) {
    const k = key(tid, g.id);
    if (g.tiers) depthByGroup[k] = on ? g.tiers.length : 0;
    else selected[k] = on;
  }
  function setTopic(t: TopicSummary, on: boolean) {
    for (const g of groupsOf(t)) setGroup(t.id, g, on);
  }

  function toggleGroup(tid: string, g: Group) {
    // Any selection (full or partial) clears; only an empty group fills.
    setGroup(tid, g, groupSelCount(tid, g) === 0);
  }
  async function toggleTopic(t: TopicSummary) {
    const data = topicData[t.id] ?? (await ensureLoaded(t));
    if (!data) return;
    setTopic(t, !topicFull(t));
  }
  async function toggleCategory(ts: TopicSummary[]) {
    const on = !catFull(ts);
    const loaded = await Promise.all(ts.map((t) => topicData[t.id] ?? ensureLoaded(t)));
    ts.forEach((t, i) => loaded[i] && setTopic(t, on));
  }

  const tree = $derived(buildTree(topics));

  // Default expansion: only top-level categories are open, so the second level
  // (e.g. gaming → pokemon) shows up but its contents stay collapsed until the
  // user drills in. A manual toggle (catExpanded) overrides the default.
  const catOpen = (node: CatNode) => catExpanded[node.path] ?? catDepth(node) === 0;

  // Display name for a topic / category in the active language, with fallbacks.
  // Topic: per-lang title (if the names differ) → representative title.
  // Category: per-lang title → global title → title-cased folder name.
  const topicTitle = (t: TopicSummary) => t.titles?.[lang] ?? t.title;
  const groupTitle = (g: Group) => g.titles?.[lang] ?? g.title;
  const categoryTitle = (node: CatNode) =>
    categories[node.path]?.titles?.[lang] ?? categories[node.path]?.title ?? titleCase(node.name);
  const categoryIcon = (node: CatNode) => categories[node.path]?.icon;

  // Aggregate selected groups' words (top-N tiers), de-duplicated, manifest order.
  const merged = $derived.by(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const t of topics) {
      const data = topicData[t.id];
      if (!data) continue;
      for (const g of data.groups) {
        const mode = modeOf(key(t.id, g.id));
        for (const e of selectedEntries(t.id, g)) {
          for (const w of renderEntry(e, mode, lang)) {
            if (!seen.has(w)) {
              seen.add(w);
              out.push(w);
            }
          }
        }
      }
    }
    return out;
  });

  const included = $derived(merged.filter((w) => w.length <= SKRIBBL.maxWordLen));
  const excluded = $derived(merged.filter((w) => w.length > SKRIBBL.maxWordLen));
  const outputText = $derived(included.join(SKRIBBL.separator));
  const charCount = $derived(outputText.length);
  // Counter only renders when merged.length > 0, so this needs no empty-guard.
  const belowMin = $derived(included.length < SKRIBBL.minWords);
  const overMax = $derived(charCount > SKRIBBL.maxTotal);

  async function copy() {
    try {
      await navigator.clipboard.writeText(outputText);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      /* clipboard unavailable (e.g. insecure context) — ignore */
    }
  }

</script>

<svelte:window onpointerdown={onWindowPointerDown} onkeydown={onWindowKeyDown} />

{#snippet langPicker(id: string)}
  {#if availableLangs.length > 1}
    <div class="lang-picker">
      <button
        type="button"
        class="lang-btn"
        aria-haspopup="menu"
        aria-expanded={langMenuOpen === id}
        aria-label={ui.languageLabel(langName(lang))}
        onclick={() => (langMenuOpen = langMenuOpen === id ? null : id)}
      >🌐</button>
      {#if langMenuOpen === id}
        <ul class="lang-menu" role="menu" aria-label={ui.languageMenu}>
          {#each availableLangs as l (l)}
            <li role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l === lang}
                class:selected={l === lang}
                onclick={() => chooseLanguage(l)}
              >
                <span class="lang-code">{l.toUpperCase()}</span>
                <span class="lang-name">{langName(l)}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
{/snippet}

<main>
  <div class="layout" class:single={loading || error || topics.length === 0}>
    <div class="col-topics">
      <header>
        <div class="title-row">
          <h1>Custom Wordlists</h1>
          <div class="lang-header-slot">{@render langPicker("header")}</div>
        </div>
        <p class="tagline">
          {ui.taglineBefore}
          <a href="https://skribbl.io" target="_blank" rel="noopener noreferrer">skribbl.io</a>
          {ui.taglineAfter}
        </p>
      </header>

      {#if loading}
        <p class="status">{ui.loadingTopics}</p>
      {:else if error}
        <p class="status error">{ui.loadError(error)}</p>
      {:else if topics.length === 0}
        <p class="status">{ui.noTopics}</p>
      {:else}
        <section class="topics" aria-label={ui.topics}>
        <h2>{ui.topics}</h2>
        {#snippet topicRow(t: TopicSummary)}
            <div class="topic-item">
              <div class="topic-row">
                <button
                  type="button"
                  class="expander"
                  aria-expanded={!!expanded[t.id]}
                  aria-controls={`groups-${t.id}`}
                  aria-label={ui.toggle(!!expanded[t.id], topicTitle(t))}
                  onclick={() => toggleExpand(t)}
                >
                  {expanded[t.id] ? "▾" : "▸"}
                </button>
                <label class="topic">
                  <input
                    type="checkbox"
                    checked={topicFull(t)}
                    use:setIndeterminate={topicPartial(t)}
                    onchange={() => toggleTopic(t)}
                  />
                  <span class="icon" aria-hidden="true">{t.icon ?? "•"}</span>
                  <span class="title">{topicTitle(t)}</span>
                  {#if !t.languages?.includes(lang)}
                    <!-- A button, not a bare span: a `title` tooltip needs a hover, which
                         touch devices don't have. Interactive content, so a click on it
                         doesn't reach the surrounding <label>'s checkbox. -->
                    <button
                      type="button"
                      class="lang-warning"
                      aria-expanded={warnOpen === t.id}
                      aria-controls={`lang-note-${t.id}`}
                      aria-label={ui.langUnsupported(langName(lang))}
                      onpointerenter={(e) => {
                        if (e.pointerType === "mouse") openWarn(t.id, e.currentTarget);
                      }}
                      onpointerleave={(e) => {
                        if (e.pointerType === "mouse") warnOpen = null;
                      }}
                      onfocus={(e) => openWarn(t.id, e.currentTarget)}
                      onblur={() => (warnOpen = null)}
                      onclick={(e) => {
                        // With a mouse the hover above already governs the note; only
                        // pointers that can't hover need the click to toggle it.
                        if (lastPointerType === "mouse") return;
                        if (warnOpen === t.id) warnOpen = null;
                        else openWarn(t.id, e.currentTarget);
                      }}>⚠️</button
                    >
                  {/if}
                  <span class="meta">
                    {#if loadingById[t.id] && !topicData[t.id]}{ui.loadingShort}{:else}{ui.wordsOf(topicSelCount(t), topicTotal(t))}{/if}
                  </span>
                </label>
              </div>
              <!-- Outside the <label>, or clicking the note would toggle the topic.
                   Spans the row, so it can't run out of the viewport on either side. -->
              {#if warnOpen === t.id}
                <!-- `tooltip`, not `status`: this is help text the reader asked for, not
                     a live update that should interrupt whatever is being read. Screen
                     readers get the same text from the button's aria-label, so the note
                     is deliberately not also wired up as its description. -->
                <p
                  class="lang-warning-note"
                  class:above={warnAbove}
                  id={`lang-note-${t.id}`}
                  role="tooltip"
                >
                  {ui.langUnsupported(langName(lang))}
                </p>
              {/if}

              {#if expanded[t.id] && topicData[t.id]}
                <ul class="groups" id={`groups-${t.id}`}>
                  {#each groupsOf(t) as g (g.id)}
                    {@const k = key(t.id, g.id)}
                    <li>
                      <div class="group">
                        <label class="group-label">
                          <input
                            type="checkbox"
                            checked={groupFull(t.id, g)}
                            use:setIndeterminate={groupPartial(t.id, g)}
                            onchange={() => toggleGroup(t.id, g)}
                          />
                          <span class="title">{groupTitle(g)}</span>
                        </label>
                        {#if groupHasNames(g, lang)}
                          <select
                            class="names-mode"
                            aria-label={ui.nameFormLabel(groupTitle(g))}
                            value={modeOf(k)}
                            onchange={(e) => (namesMode[k] = e.currentTarget.value as NamesMode)}
                          >
                            <option value="short">{ui.nameForm.short}</option>
                            <option value="long">{ui.nameForm.long}</option>
                            <option value="both">{ui.nameForm.both}</option>
                          </select>
                        {/if}
                        <span class="meta">{ui.wordsOf(groupSelCount(t.id, g), groupTotal(t.id, g))}</span>
                      </div>
                      {#if g.tiers && g.tiers.length > 1}
                        {@const d = depthByGroup[k] ?? 0}
                        {@const pos = snapPositions(g)}
                        <div class="group-depth">
                          <div
                            class="depth-track"
                            role="slider"
                            tabindex="0"
                            aria-valuemin="0"
                            aria-valuemax={g.tiers.length}
                            aria-valuenow={d}
                            aria-valuetext={ui.tiersValueText(d, g.tiers.length)}
                            aria-label={ui.fameDepthLabel(groupTitle(g))}
                            onpointerdown={(e) => {
                              e.currentTarget.setPointerCapture(e.pointerId);
                              dragDepth(e, k, g);
                            }}
                            onpointermove={(e) => {
                              if (e.buttons & 1) dragDepth(e, k, g);
                            }}
                            onkeydown={(e) => keyDepth(e, k, tierCount(g))}
                          >
                            <span class="depth-rail"></span>
                            <span
                              class="depth-fill"
                              style="width: calc({pos[d]} * (100% - 2 * var(--inset)))"
                            ></span>
                            {#each pos as p, i (i)}
                              <span
                                class="depth-dot"
                                class:on={i > d}
                                style="left: calc(var(--inset) + {p} * (100% - 2 * var(--inset)))"
                              ></span>
                            {/each}
                            <span
                              class="depth-thumb"
                              style="left: calc(var(--inset) + {pos[d]} * (100% - 2 * var(--inset)))"
                            ></span>
                          </div>
                        </div>
                      {/if}
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
        {/snippet}

        {#snippet categoryNode(node: CatNode)}
          {@const at = node.all}
          {@const catId = "cat-" + (node.path.replace(/\//g, "-") || "root")}
          <div class="category">
            <button
              type="button"
              class="expander"
              aria-expanded={catOpen(node)}
              aria-controls={`${catId}-children`}
              aria-label={ui.toggle(catOpen(node), categoryTitle(node))}
              onclick={() => (catExpanded[node.path] = !catOpen(node))}
            >
              {catOpen(node) ? "▾" : "▸"}
            </button>
            <input
              type="checkbox"
              id={catId}
              checked={catFull(at)}
              use:setIndeterminate={catPartial(at)}
              onchange={() => toggleCategory(at)}
            />
            <h3 class="category-title">
              <label for={catId}>
                {#if categoryIcon(node)}<span class="icon" aria-hidden="true">{categoryIcon(node)}</span> {/if}{categoryTitle(node)}
              </label>
            </h3>
            <span class="meta">{ui.wordsOf(catSel(at), catTotal(at))}</span>
          </div>
          {#if catOpen(node)}
            <div class="cat-children" id={`${catId}-children`}>
              {#each node.topics as t (t.id)}{@render topicRow(t)}{/each}
              {#each node.children as child (child.path)}{@render categoryNode(child)}{/each}
            </div>
          {/if}
        {/snippet}

        {#each tree.topics as t (t.id)}{@render topicRow(t)}{/each}
        {#each tree.children as node (node.path)}{@render categoryNode(node)}{/each}
        {#if topicError}
          <p class="status error">{topicError}</p>
        {/if}
        </section>
      {/if}
    </div>

    {#if !loading && !error && topics.length > 0}
      <section class="output" aria-label={ui.output}>
        <div class="output-head">
          <h2>{ui.output}</h2>
          <div class="head-actions">
            {@render langPicker("output")}
            <button type="button" onclick={copy} disabled={included.length === 0}>
              {copied ? ui.copied : ui.copy}
            </button>
          </div>
        </div>

        {#if merged.length === 0}
          <p class="status">{ui.emptyOutput}</p>
        {:else}
          <!-- Read-only per-word chips (not a textarea) so M2 can color words. -->
          <div
            class="chips"
            role="textbox"
            aria-readonly="true"
            aria-label={ui.generatedList}
            tabindex="0"
            onclick={(e) => selectAll(e.currentTarget)}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectAll(e.currentTarget);
              }
            }}
          >
            {#each included as w (w)}<span class="chip">{w}</span>{/each}
          </div>

          <p class="counter" class:warn={belowMin || overMax}>
            {ui.wordsLabel}: {included.length} · {ui.charsLabel}: {charCount.toLocaleString()} /
            {SKRIBBL.maxTotal.toLocaleString()}
            {#if belowMin}{ui.belowMin(SKRIBBL.minWords)}{/if}
            {#if overMax}{ui.overMax}{/if}
          </p>

          {#if excluded.length > 0}
            <p class="status warn">
              {ui.excluded(excluded.length, SKRIBBL.maxWordLen, excluded.join(", "))}
            </p>
          {/if}
        {/if}
      </section>
    {/if}
  </div>

  <footer class="site-footer">
    <!-- Inner box repeats main's content width so the two ends line up with the
         topic column's left edge and the output panel's right edge. -->
    <div class="footer-inner">
      <span class="footer-help">
        {ui.helpOut}
        <a
          href={REPO_URL + "?tab=contributing-ov-file#contributing"}
          target="_blank"
          rel="noopener noreferrer">{ui.contributionGuide}</a
        >{ui.helpOutAfter}
      </span>
      <a
        class="footer-repo"
        href={REPO_URL + "#custom-wordlists"}
        target="_blank"
        rel="noopener noreferrer">{ui.repository}</a
      >
    </div>
  </footer>
</main>
