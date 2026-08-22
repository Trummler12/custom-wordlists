// What the user has done to the topic tree: what is selected, how deep, in which
// name form — and what is expanded. Expansion lives here rather than with the
// topic data because it is the same kind of thing: per-user, keyed by topic or
// category id, and changed by the same handful of handlers (expanding a topic
// loads it, exactly as ticking one does).
//
// The selection model has one rule worth knowing: tiered groups are represented
// purely by `depthByGroup[k]` (0…tierCount) and flat `words` groups purely by the
// boolean `selected[k]`. Every state above — group full/partial, topic, category —
// is derived from those two, which is why moving a slider rolls all the way up to
// the category checkbox with no code that says so.
//
// `depthOf` / `setDepth` present both as a depth, since every group has a ruler
// and a ruler only speaks in depths; a flat group's is 0 or 1.

import { TOO_LONG_RULE } from "../lib/omitted";
import { SKRIBBL } from "../lib/skribbl";
import { groupEntries, groupHasNames, renderCount } from "../lib/words";
import { depthFromKey, depthFromPointer, skipCollapsed, snapPositions } from "../lib/fame";
import { rulerHiddenByDefault } from "../lib/rulers";
import { catDepth, type CatNode } from "../lib/tree";
import type { Group, NamesMode, TopicSummary, WordEntry } from "../lib/types";
import { lang } from "./lang.svelte";
import { settings } from "./settings.svelte";
import { topics } from "./topics.svelte";

class SelectionState {
  /** Flat `words` groups only, keyed `${topicId}:${groupId}`. */
  selected = $state<Record<string, boolean>>({});
  /** Per-group fame depth (top-N tiers), keyed alike. Absent/0 = unselected. */
  depthByGroup = $state<Record<string, number>>({});
  /** Per-group names mode; only groups with short/long entries show the dropdown. */
  namesMode = $state<Record<string, NamesMode>>({});
  /** Which category nodes the user has toggled, by path. Absent = the default. */
  catExpanded = $state<Record<string, boolean>>({});
  /** Explicit ruler-visibility flips, by topic id. Absent = the data-driven
   *  default (see lib/rulers); only opted-in topics ever appear here. */
  rulerVisible = $state<Record<string, boolean>>({});

  /** The last clear names-mode majority a synthesized topic showed, by its id — a
   *  plain cache, not reactive state: it exists only so a tie among the
   *  contributors leaves the dropdown where it was rather than flipping it. Read
   *  and refreshed by `modeOf` (which already re-runs when a contributor's mode
   *  changes, so the cache is always seen fresh). */
  #modeShown: Record<string, NamesMode> = {};

  key(tid: string, gid: string): string {
    return `${tid}:${gid}`;
  }

  // --- Synthesized topics ----------------------------------------------------
  // A synthesized (inheritsUpwards) topic holds no state of its own: it commands
  // its contributors downward (setDepth/setMode write to each) and describes them
  // upward (depthOf/modeOf report the most common, counts the deduplicated union).
  // Every method below that takes a group checks `topics.isSynth(tid)` first.

  /** The contributors of a synthesized topic paired with their loaded group, ready
   *  to delegate to. Empty (and callers fall through) until the members load. */
  private contribGroups(tid: string): { t: TopicSummary; g: Group }[] {
    const out: { t: TopicSummary; g: Group }[] = [];
    for (const t of topics.contributorsOf(tid)) {
      const g = topics.groupsOf(t)[0];
      if (g) out.push({ t, g });
    }
    return out;
  }
  /** The value most of the contributors agree on, lowest on a tie — so a
   *  synthesized ruler never claims a deeper position than its members hold. */
  private commonest<T extends string | number>(vals: T[], fallback: T): T {
    if (vals.length === 0) return fallback;
    const count = new Map<T, number>();
    for (const v of vals) count.set(v, (count.get(v) ?? 0) + 1);
    let best = vals[0];
    for (const [v, c] of count) {
      const bc = count.get(best) ?? 0;
      if (c > bc || (c === bc && v < best)) best = v;
    }
    return best;
  }

  // --- Expansion -------------------------------------------------------------

  /** Only top-level categories start open, so the second level (gaming → pokemon)
   *  shows up but its contents stay collapsed until the user drills in. */
  catOpen(node: CatNode): boolean {
    return this.catExpanded[node.path] ?? catDepth(node) === 0;
  }
  toggleCat(node: CatNode): void {
    this.catExpanded[node.path] = !this.catOpen(node);
  }

  // --- Names mode ------------------------------------------------------------
  // A group's entries are plain strings or { short, long } pairs. The mode picks
  // which form(s) to emit; counts and output de-duplicate identical rendered
  // strings, so "both" on a pair whose forms match still yields one word.

  // Takes the group rather than only its key, because the group is what carries
  // the default: a list of countries emits `short` where South Park emits `long`,
  // and neither is the reader's doing.
  modeOf(tid: string, g: Group): NamesMode {
    if (topics.isSynth(tid)) {
      // A clear majority is shown and remembered; a tie leaves the dropdown on the
      // last majority rather than flipping to an arbitrary winner.
      const majority = this.strictMode(this.namesModes(tid));
      if (majority !== undefined) this.#modeShown[tid] = majority;
      return this.#modeShown[tid] ?? g.defaultNames ?? "long";
    }
    return this.namesMode[this.key(tid, g.id)] ?? g.defaultNames ?? "long";
  }
  /** The modes of the contributors that actually have a short/long distinction —
   *  the only ones whose mode is observable. A continent of single-form names would
   *  otherwise vote its default forever and freeze the merged dropdown on it. */
  private namesModes(tid: string): NamesMode[] {
    return this.contribGroups(tid)
      .filter(({ g }) => groupHasNames(g, lang.current))
      .map(({ t, g }) => this.modeOf(t.id, g));
  }
  /** The value with strictly more occurrences than any other, or undefined on a
   *  tie (or none) — the merged names dropdown changes only when a new clear
   *  majority forms, never on a dead heat. */
  private strictMode(vals: NamesMode[]): NamesMode | undefined {
    const count = new Map<NamesMode, number>();
    for (const v of vals) count.set(v, (count.get(v) ?? 0) + 1);
    let best: NamesMode | undefined;
    let bestN = 0;
    let tied = false;
    for (const [v, n] of count) {
      if (n > bestN) {
        best = v;
        bestN = n;
        tied = false;
      } else if (n === bestN) {
        tied = true;
      }
    }
    return tied ? undefined : best;
  }
  /** Whether a synthesized topic's distinguishing contributors disagree on their
   *  names mode — so its dropdown shows the common one yet a re-pick still unifies
   *  them (see NamesModeSelect). Always false for an ordinary topic. */
  modeMixed(tid: string): boolean {
    return topics.isSynth(tid) && new Set(this.namesModes(tid)).size > 1;
  }
  setMode(tid: string, g: Group, mode: NamesMode): void {
    if (topics.isSynth(tid)) {
      for (const c of this.contribGroups(tid)) this.setMode(c.t.id, c.g, mode);
      return;
    }
    this.namesMode[this.key(tid, g.id)] = mode;
  }

  // --- Counts ----------------------------------------------------------------

  /** The entries a group currently contributes: its top-N tiers, or all of its
   *  flat words when ticked. */
  entriesOf(tid: string, g: Group): WordEntry[] {
    // A synthesized topic contributes what its members do — the union of their
    // selected entries, each member at its own depth. `renderCount` de-duplicates
    // by rendered form, so a transcontinental country counted here twice still
    // counts once (Russia in Europe's and Asia's selection). The synth's own ruler
    // position (`depthOf`) is a summary of the members, not the count's source.
    if (topics.isSynth(tid)) {
      return this.contribGroups(tid).flatMap(({ t, g }) => this.entriesOf(t.id, g));
    }
    const depth = this.depthOf(tid, g);
    if (g.tiers) return g.tiers.slice(0, depth).flat();
    return depth > 0 ? (g.words ?? []) : [];
  }

  /** The length limit in force for this list, or none where the reader has asked
   *  for the over-long names anyway. The counters have to know: a number beside a
   *  row that disagrees with what the output holds is worse than either. */
  capFor(tid: string, g: Group): number | undefined {
    return settings.isToggled(tid, g.id, TOO_LONG_RULE) ? undefined : SKRIBBL.maxWordLen;
  }

  groupTotal(tid: string, g: Group): number {
    return renderCount(
      groupEntries(g),
      this.modeOf(tid, g),
      lang.contentLang(tid),
      lang.derivesRomaji(tid),
      this.capFor(tid, g),
    );
  }
  groupSelCount(tid: string, g: Group): number {
    return renderCount(
      this.entriesOf(tid, g),
      this.modeOf(tid, g),
      lang.contentLang(tid),
      lang.derivesRomaji(tid),
      this.capFor(tid, g),
    );
  }

  groupFull(tid: string, g: Group): boolean {
    if (topics.isSynth(tid)) {
      const cs = this.contribGroups(tid);
      return cs.length > 0 && cs.every(({ t, g }) => this.groupFull(t.id, g));
    }
    const k = this.key(tid, g.id);
    return g.tiers ? (this.depthByGroup[k] ?? 0) === g.tiers.length : !!this.selected[k];
  }
  groupPartial(tid: string, g: Group): boolean {
    if (topics.isSynth(tid)) {
      return this.groupSelCount(tid, g) > 0 && !this.groupFull(tid, g);
    }
    if (!g.tiers) return false;
    const d = this.depthByGroup[this.key(tid, g.id)] ?? 0;
    return d > 0 && d < g.tiers.length;
  }

  topicSelCount(t: TopicSummary): number {
    return topics.groupsOf(t).reduce((n, g) => n + this.groupSelCount(t.id, g), 0);
  }
  /** Live and mode-aware once the topic is loaded; the manifest's entry count as a
   *  baseline before that. */
  topicTotal(t: TopicSummary): number {
    const gs = topics.groupsOf(t);
    return gs.length ? gs.reduce((n, g) => n + this.groupTotal(t.id, g), 0) : t.wordCount;
  }
  topicFull(t: TopicSummary): boolean {
    const gs = topics.groupsOf(t);
    return gs.length > 0 && gs.every((g) => this.groupFull(t.id, g));
  }
  topicPartial(t: TopicSummary): boolean {
    return this.topicSelCount(t) > 0 && !this.topicFull(t);
  }

  /** A category's topics minus the synthesized ones. A synthesized topic re-lists
   *  its contributors, which already sit in the same subtree, so counting or
   *  toggling it alongside them would double every country. */
  private real(ts: TopicSummary[]): TopicSummary[] {
    return ts.filter((t) => !topics.isSynth(t.id));
  }

  catTotal(ts: TopicSummary[]): number {
    return this.real(ts).reduce((n, t) => n + this.topicTotal(t), 0);
  }
  catSel(ts: TopicSummary[]): number {
    return this.real(ts).reduce((n, t) => n + this.topicSelCount(t), 0);
  }
  catFull(ts: TopicSummary[]): boolean {
    const real = this.real(ts);
    return real.length > 0 && real.every((t) => this.topicFull(t));
  }
  catPartial(ts: TopicSummary[]): boolean {
    return this.catSel(ts) > 0 && !this.catFull(ts);
  }

  // --- Fame depth ------------------------------------------------------------

  depthOf(tid: string, g: Group): number {
    if (topics.isSynth(tid)) {
      const depths = this.contribGroups(tid).map(({ t, g }) => this.depthOf(t.id, g));
      return this.commonest(depths, 0);
    }
    const k = this.key(tid, g.id);
    return g.tiers ? (this.depthByGroup[k] ?? 0) : this.selected[k] ? 1 : 0;
  }
  setDepth(tid: string, g: Group, d: number): void {
    if (topics.isSynth(tid)) {
      for (const c of this.contribGroups(tid)) this.setDepth(c.t.id, c.g, d);
      return;
    }
    const k = this.key(tid, g.id);
    if (g.tiers) this.depthByGroup[k] = d;
    else this.selected[k] = d > 0;
  }

  /** Drag or click on the slider track. */
  dragDepth(e: PointerEvent, tid: string, g: Group): void {
    this.setDepth(tid, g, depthFromPointer(e, g));
  }
  /** Arrow/Home/End on the slider. Other keys are left alone — the event must
   *  keep its default, so the caller can't preventDefault unconditionally. */
  keyDepth(e: KeyboardEvent, tid: string, g: Group): void {
    const pos = snapPositions(g);
    const from = this.depthOf(tid, g);
    const d = depthFromKey(e, from, pos.length - 1);
    if (d === null) return;
    e.preventDefault();
    // Skip stops an empty leading/trailing tier collapsed onto an end, so an arrow
    // moves the thumb rather than stepping onto an invisible duplicate stop.
    this.setDepth(tid, g, skipCollapsed(pos, from, d));
  }

  // --- Setting ---------------------------------------------------------------

  setGroup(tid: string, g: Group, on: boolean): void {
    if (topics.isSynth(tid)) {
      this.setDepth(tid, g, on ? (g.tiers?.length ?? 1) : 0);
      return;
    }
    const k = this.key(tid, g.id);
    if (g.tiers) this.depthByGroup[k] = on ? g.tiers.length : 0;
    else this.selected[k] = on;
  }
  setTopic(t: TopicSummary, on: boolean): void {
    for (const g of topics.groupsOf(t)) this.setGroup(t.id, g, on);
  }

  toggleGroup(tid: string, g: Group): void {
    // Any selection (full or partial) clears; only an empty group fills.
    this.setGroup(tid, g, this.groupSelCount(tid, g) === 0);
  }
  async toggleTopic(t: TopicSummary): Promise<void> {
    if (topics.isSynth(t.id)) {
      await topics.ensure(t); // loads every contributor
      this.setTopic(t, !this.topicFull(t));
      return;
    }
    const data = topics.data[t.id] ?? (await topics.ensure(t));
    if (!data) return;
    this.setTopic(t, !this.topicFull(t));
  }
  async toggleCategory(ts: TopicSummary[]): Promise<void> {
    // Only the real topics: a synthesized one just re-lists members already here,
    // and toggling both would fight over the same contributors.
    const real = this.real(ts);
    const on = !this.catFull(real);
    const loaded = await Promise.all(real.map((t) => topics.data[t.id] ?? topics.ensure(t)));
    real.forEach((t, i) => loaded[i] && this.setTopic(t, on));
  }

  // --- Ruler visibility ------------------------------------------------------
  // Purely a view option: which fame rulers are shown, independent of what is
  // selected. An explicit flip is remembered; otherwise the data-driven default
  // applies. A control-root category's toggle rolls up over the topics it governs,
  // exactly like the selection checkboxes above (`ts` is that governed set).

  isRulerVisible(t: TopicSummary): boolean {
    return this.rulerVisible[t.id] ?? !rulerHiddenByDefault(t, topics.categories);
  }
  toggleRuler(t: TopicSummary): void {
    this.rulerVisible[t.id] = !this.isRulerVisible(t);
  }

  allRulersShown(ts: TopicSummary[]): boolean {
    return ts.every((t) => this.isRulerVisible(t));
  }
  /** Mixed state — some rulers shown, some hidden — for the category toggle's
   *  indeterminate mark, mirroring `catPartial`. */
  someRulersHidden(ts: TopicSummary[]): boolean {
    return !this.allRulersShown(ts) && ts.some((t) => this.isRulerVisible(t));
  }
  toggleCatRulers(ts: TopicSummary[]): void {
    const on = !this.allRulersShown(ts);
    for (const t of ts) this.rulerVisible[t.id] = on;
  }
}

export const selection = new SelectionState();
