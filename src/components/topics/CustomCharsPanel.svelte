<script lang="ts">
  import { placement, rowPopup } from "../shared/placement";
  import Msg from "../../locale/html/Msg.svelte";
  import { plain } from "../../locale/html/plain";
  import { type CharClass, oddChars, type OddChar } from "../../lib/custom";
  import { custom } from "../../state/custom.svelte";
  import { lang } from "../../state/lang.svelte";
  import { overlays } from "../../state/overlays.svelte";
  import TipMarker from "../shared/TipMarker.svelte";
  import TipNote from "../shared/TipNote.svelte";

  // The Custom row's character panel: a ⚠️ shows up once the input field or an active
  // custom list holds a character skribbl.io will probably drop, or one that is only
  // tolerated. Accepted name punctuation alone raises nothing, since nearly every real list
  // has a hyphen or an apostrophe; it is still listed once the panel is open.
  //
  // Shares the `omitted` slot with the 🚫 beside it, so only one of the two is open at a
  // time. The 🔍 notes are siblings of the panel, not children, so its scroll can't clip them.
  const id = "custom-chars";
  const open = $derived(overlays.omittedPanel === id);

  const sources = $derived(custom.effectiveNamed);
  const chars = $derived(oddChars(sources.map((s) => s.items)));
  const warn = $derived(chars.some((c) => c.cls !== "accepted"));
  const sections = $derived(
    (
      [
        ["ignored", lang.ui.custom.charsProblematic],
        ["tolerated", lang.ui.custom.charsTolerated],
        ["accepted", lang.ui.custom.charsAccepted],
      ] as [CharClass, string][]
    )
      .map(([cls, heading]) => ({ cls, heading, items: chars.filter((c) => c.cls === cls) }))
      .filter((s) => s.items.length > 0),
  );
  // A long list spreads over up to four columns instead of growing four times as tall.
  const columns = (n: number): number => Math.min(4, Math.max(1, Math.ceil(n / 3)));

  const tipId = (c: OddChar): string => `custom-char-${c.cls}-${c.char.codePointAt(0)!.toString(16)}`;
  function note(c: OddChar): string {
    const lead: string[] = [];
    if (c.pair) {
      const [o, cl] = c.pair;
      lead.push(c.cls === "accepted" ? lang.ui.custom.charsPaired(o, cl) : lang.ui.custom.charsLone(c.char, c.char === o ? cl : o));
    }
    if (c.cls === "ignored") lead.push(lang.ui.custom.charsRemove);
    if (c.cls === "tolerated") lead.push(lang.ui.custom.charsRemoveMaybe);
    const lists = sources
      .map((s, i) => ({ name: s.list?.name ?? lang.ui.custom.inputName, n: c.perSource[i] }))
      .filter((x) => x.n > 0)
      .map((x) => `- ${x.name} (${x.n})`);
    return [...lead, lang.ui.custom.charsLists, ...lists].join("{br}");
  }
</script>

{#snippet row(c: OddChar)}
  <li>
    <code>{c.label}</code>
    <span class="count">x{c.count}</span>
    <TipMarker tipId={tipId(c)} icon="🔍" text={note(c)} local />
  </li>
{/snippet}

{#if warn}
  <div class="omitted-host">
    <button
      type="button"
      class="omitted-btn"
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={plain(lang.ui.custom.charsLabel)}
      title={plain(lang.ui.custom.charsLabel)}
      onclick={(e) => overlays.toggleOmittedPanel(id, e.currentTarget)}>⚠️</button
    >
    {#if open}
      <div
        class="popup omitted-panel"
        use:placement={rowPopup(overlays.opener("omitted"))}
        role="group"
        aria-label={plain(lang.ui.custom.charsLabel)}
      >
        <p class="omitted-title"><Msg text={lang.ui.custom.charsIgnored} /></p>
        {#each sections as s, i (s.cls)}
          {#if i > 0}<hr />{/if}
          <p class="group-title">{s.heading}</p>
          <ul class="chars" style:grid-template-columns={`repeat(${columns(s.items.length)}, max-content)`}>
            {#each s.items as c (tipId(c))}{@render row(c)}{/each}
          </ul>
        {/each}
      </div>
    {/if}
    {#each chars as c (tipId(c))}
      <TipNote id={tipId(c)} text={note(c)} local />
    {/each}
  </div>
{/if}

<style>
  /* The shared 🚫 button is dimmed until hovered; a warning has to read at once. */
  .omitted-btn {
    opacity: 1;
  }
  /* `column-count` (set inline) is the most columns a section may use; the min width caps it
     further where the panel is narrow, so a phone gets fewer rather than cramped ones. */
  /* A grid, not multi-column: it fills row by row, so the order reads left to right, and its
     content-wide columns sit flush left at a fixed gap, so groups with different column
     counts still line up. */
  .chars {
    display: grid;
    justify-content: start;
    justify-items: start;
    column-gap: 1.2rem;
  }
  .chars li {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    padding: 0.1rem 0;
  }
  /* A minimum width, so a lone "." or "'" still gets a box worth aiming at. */
  .chars code {
    min-width: 1.4em;
    text-align: center;
  }
  .count {
    color: var(--muted-2);
    font-variant-numeric: tabular-nums;
  }
  .group-title {
    margin: 0 0 0.2rem;
    color: var(--muted-2);
  }
  hr {
    border: none;
    border-top: 1px solid var(--panel-border);
    margin: 0.45rem 0;
  }
</style>
