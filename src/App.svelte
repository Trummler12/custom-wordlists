<script lang="ts">
  import { onMount } from "svelte";
  import type { NamesMode, TopicSummary } from "./lib/types";
  import type { CatNode } from "./lib/tree";
  import { SKRIBBL } from "./lib/skribbl";
  import { groupHasNames } from "./lib/words";
  import { snapPositions } from "./lib/fame";
  import { selectAll, setIndeterminate } from "./lib/dom";
  import { lang } from "./state/lang.svelte";
  import { topics } from "./state/topics.svelte";
  import { selection } from "./state/selection.svelte";
  import { output } from "./state/output.svelte";
  import { overlays } from "./state/overlays.svelte";

  // Repo home, used for the footer links.
  const REPO_URL = "https://github.com/Trummler12/custom-wordlists";

  onMount(async () => {
    await topics.init();
    // Only once the manifest is there, as before: a failed load keeps the error
    // message in English rather than resolving a language nobody can act on.
    if (!topics.error) lang.init();
  });
</script>

<svelte:window onpointerdown={overlays.onPointerDown} onkeydown={overlays.onKeyDown} />

{#snippet langPicker(id: string)}
  {#if lang.available.length > 1}
    <div class="lang-picker">
      <button
        type="button"
        class="lang-btn"
        aria-haspopup="menu"
        aria-expanded={overlays.langMenu === id}
        aria-label={lang.ui.languageLabel(lang.name(lang.current))}
        onclick={() => overlays.toggleLangMenu(id)}
      >🌐</button>
      {#if overlays.langMenu === id}
        <ul class="lang-menu" role="menu" aria-label={lang.ui.languageMenu}>
          {#each lang.available as l (l)}
            <li role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={l === lang.current}
                class:selected={l === lang.current}
                onclick={() => overlays.chooseLanguage(l)}
              >
                <span class="lang-code">{l.toUpperCase()}</span>
                <span class="lang-name">{lang.name(l)}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
{/snippet}

<main>
  <div class="layout" class:single={!topics.ready}>
    <div class="col-topics">
      <header>
        <div class="title-row">
          <h1>Custom Wordlists</h1>
          <div class="lang-header-slot">{@render langPicker("header")}</div>
        </div>
        <p class="tagline">
          {lang.ui.taglineBefore}
          <a href="https://skribbl.io" target="_blank" rel="noopener noreferrer">skribbl.io</a>
          {lang.ui.taglineAfter}
        </p>
      </header>

      {#if topics.loading}
        <p class="status">{lang.ui.loadingTopics}</p>
      {:else if topics.error}
        <p class="status error">{lang.ui.loadError(topics.error)}</p>
      {:else if topics.all.length === 0}
        <p class="status">{lang.ui.noTopics}</p>
      {:else}
        <section class="topics" aria-label={lang.ui.topics}>
        <h2>{lang.ui.topics}</h2>
        {#snippet topicRow(t: TopicSummary)}
            <div class="topic-item">
              <div class="topic-row">
                <button
                  type="button"
                  class="expander"
                  aria-expanded={!!selection.expanded[t.id]}
                  aria-controls={`groups-${t.id}`}
                  aria-label={lang.ui.toggle(!!selection.expanded[t.id], topics.topicTitle(t))}
                  onclick={() => selection.toggleExpand(t)}
                >
                  {selection.expanded[t.id] ? "▾" : "▸"}
                </button>
                <label class="topic">
                  <input
                    type="checkbox"
                    checked={selection.topicFull(t)}
                    use:setIndeterminate={selection.topicPartial(t)}
                    onchange={() => selection.toggleTopic(t)}
                  />
                  <span class="icon" aria-hidden="true">{t.icon ?? "•"}</span>
                  <span class="title">{topics.topicTitle(t)}</span>
                  {#if !t.languages?.includes(lang.current)}
                    <!-- A button, not a bare span: a `title` tooltip needs a hover, which
                         touch devices don't have. Interactive content, so a click on it
                         doesn't reach the surrounding <label>'s checkbox. -->
                    <button
                      type="button"
                      class="lang-warning"
                      aria-expanded={overlays.warnTopic === t.id}
                      aria-controls={`lang-note-${t.id}`}
                      aria-label={lang.ui.langUnsupported(lang.name(lang.current))}
                      onpointerenter={(e) => overlays.warnEnter(e, t.id)}
                      onpointerleave={(e) => overlays.warnLeave(e)}
                      onfocus={(e) => overlays.openWarn(t.id, e.currentTarget)}
                      onblur={overlays.closeWarn}
                      onclick={(e) => overlays.warnClick(e, t.id)}>⚠️</button
                    >
                  {/if}
                  <span class="meta">
                    {#if topics.isLoading(t)}{lang.ui.loadingShort}{:else}{lang.ui.wordsOf(selection.topicSelCount(t), selection.topicTotal(t))}{/if}
                  </span>
                </label>
              </div>
              <!-- Outside the <label>, or clicking the note would toggle the topic.
                   Spans the row, so it can't run out of the viewport on either side. -->
              {#if overlays.warnTopic === t.id}
                <!-- `tooltip`, not `status`: this is help text the reader asked for, not
                     a live update that should interrupt whatever is being read. Screen
                     readers get the same text from the button's aria-label, so the note
                     is deliberately not also wired up as its description. -->
                <p
                  class="lang-warning-note"
                  class:above={overlays.warnAbove}
                  id={`lang-note-${t.id}`}
                  role="tooltip"
                >
                  {lang.ui.langUnsupported(lang.name(lang.current))}
                </p>
              {/if}

              {#if selection.expanded[t.id] && topics.data[t.id]}
                <ul class="groups" id={`groups-${t.id}`}>
                  {#each topics.groupsOf(t) as g (g.id)}
                    {@const k = selection.key(t.id, g.id)}
                    <li>
                      <div class="group">
                        <label class="group-label">
                          <input
                            type="checkbox"
                            checked={selection.groupFull(t.id, g)}
                            use:setIndeterminate={selection.groupPartial(t.id, g)}
                            onchange={() => selection.toggleGroup(t.id, g)}
                          />
                          <span class="title">{topics.groupTitle(g)}</span>
                        </label>
                        {#if groupHasNames(g, lang.current)}
                          <select
                            class="names-mode"
                            aria-label={lang.ui.nameFormLabel(topics.groupTitle(g))}
                            value={selection.modeOf(k)}
                            onchange={(e) => selection.setMode(k, e.currentTarget.value as NamesMode)}
                          >
                            <option value="short">{lang.ui.nameForm.short}</option>
                            <option value="long">{lang.ui.nameForm.long}</option>
                            <option value="both">{lang.ui.nameForm.both}</option>
                          </select>
                        {/if}
                        <span class="meta">{lang.ui.wordsOf(selection.groupSelCount(t.id, g), selection.groupTotal(t.id, g))}</span>
                      </div>
                      {#if g.tiers && g.tiers.length > 1}
                        {@const d = selection.depth(k)}
                        {@const pos = snapPositions(g)}
                        <div class="group-depth">
                          <div
                            class="depth-track"
                            role="slider"
                            tabindex="0"
                            aria-valuemin="0"
                            aria-valuemax={g.tiers.length}
                            aria-valuenow={d}
                            aria-valuetext={lang.ui.tiersValueText(d, g.tiers.length)}
                            aria-label={lang.ui.fameDepthLabel(topics.groupTitle(g))}
                            onpointerdown={(e) => {
                              e.currentTarget.setPointerCapture(e.pointerId);
                              selection.dragDepth(e, k, g);
                            }}
                            onpointermove={(e) => {
                              if (e.buttons & 1) selection.dragDepth(e, k, g);
                            }}
                            onkeydown={(e) => selection.keyDepth(e, k, g)}
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
              aria-expanded={selection.catOpen(node)}
              aria-controls={`${catId}-children`}
              aria-label={lang.ui.toggle(selection.catOpen(node), topics.categoryTitle(node))}
              onclick={() => selection.toggleCat(node)}
            >
              {selection.catOpen(node) ? "▾" : "▸"}
            </button>
            <input
              type="checkbox"
              id={catId}
              checked={selection.catFull(at)}
              use:setIndeterminate={selection.catPartial(at)}
              onchange={() => selection.toggleCategory(at)}
            />
            <h3 class="category-title">
              <label for={catId}>
                {#if topics.categoryIcon(node)}<span class="icon" aria-hidden="true">{topics.categoryIcon(node)}</span> {/if}{topics.categoryTitle(node)}
              </label>
            </h3>
            <span class="meta">{lang.ui.wordsOf(selection.catSel(at), selection.catTotal(at))}</span>
          </div>
          {#if selection.catOpen(node)}
            <div class="cat-children" id={`${catId}-children`}>
              {#each node.topics as t (t.id)}{@render topicRow(t)}{/each}
              {#each node.children as child (child.path)}{@render categoryNode(child)}{/each}
            </div>
          {/if}
        {/snippet}

        {#each topics.tree.topics as t (t.id)}{@render topicRow(t)}{/each}
        {#each topics.tree.children as node (node.path)}{@render categoryNode(node)}{/each}
        {#if topics.topicError}
          <p class="status error">{topics.topicError}</p>
        {/if}
        </section>
      {/if}
    </div>

    {#if topics.ready}
      <section class="output" aria-label={lang.ui.output}>
        <div class="output-head">
          <h2>{lang.ui.output}</h2>
          <div class="head-actions">
            {@render langPicker("output")}
            <button type="button" onclick={output.copy} disabled={output.included.length === 0}>
              {output.copied ? lang.ui.copied : lang.ui.copy}
            </button>
          </div>
        </div>

        {#if output.merged.length === 0}
          <p class="status">{lang.ui.emptyOutput}</p>
        {:else}
          <!-- Read-only per-word chips (not a textarea) so M2 can color words. -->
          <div
            class="chips"
            role="textbox"
            aria-readonly="true"
            aria-label={lang.ui.generatedList}
            tabindex="0"
            onclick={(e) => selectAll(e.currentTarget)}
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectAll(e.currentTarget);
              }
            }}
          >
            {#each output.included as w (w)}<span class="chip">{w}</span>{/each}
          </div>

          <p class="counter" class:warn={output.belowMin || output.overMax}>
            {lang.ui.wordsLabel}: {output.included.length} · {lang.ui.charsLabel}: {output.charCount.toLocaleString()} /
            {SKRIBBL.maxTotal.toLocaleString()}
            {#if output.belowMin}{lang.ui.belowMin(SKRIBBL.minWords)}{/if}
            {#if output.overMax}{lang.ui.overMax}{/if}
          </p>

          {#if output.excluded.length > 0}
            <p class="status warn">
              {lang.ui.excluded(output.excluded.length, SKRIBBL.maxWordLen, output.excluded.join(", "))}
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
        {lang.ui.helpOut}
        <a
          href={REPO_URL + "?tab=contributing-ov-file#contributing"}
          target="_blank"
          rel="noopener noreferrer">{lang.ui.contributionGuide}</a
        >{lang.ui.helpOutAfter}
      </span>
      <a
        class="footer-repo"
        href={REPO_URL + "#custom-wordlists"}
        target="_blank"
        rel="noopener noreferrer">{lang.ui.repository}</a
      >
    </div>
  </footer>
</main>
