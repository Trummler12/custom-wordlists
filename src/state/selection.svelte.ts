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
import { groupEntries, renderCount } from "../lib/words";
import { depthFromKey, depthFromPointer, tierSizes } from "../lib/fame";
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

  key(tid: string, gid: string): string {
    return `${tid}:${gid}`;
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
    return this.namesMode[this.key(tid, g.id)] ?? g.defaultNames ?? "long";
  }
  setMode(k: string, mode: NamesMode): void {
    this.namesMode[k] = mode;
  }

  // --- Counts ----------------------------------------------------------------

  /** The entries a group currently contributes: its top-N tiers, or all of its
   *  flat words when ticked. */
  entriesOf(tid: string, g: Group): WordEntry[] {
    const k = this.key(tid, g.id);
    if (g.tiers) return g.tiers.slice(0, this.depthByGroup[k] ?? 0).flat();
    return this.selected[k] ? (g.words ?? []) : [];
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
    const k = this.key(tid, g.id);
    return g.tiers ? (this.depthByGroup[k] ?? 0) === g.tiers.length : !!this.selected[k];
  }
  groupPartial(tid: string, g: Group): boolean {
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

  catTotal(ts: TopicSummary[]): number {
    return ts.reduce((n, t) => n + this.topicTotal(t), 0);
  }
  catSel(ts: TopicSummary[]): number {
    return ts.reduce((n, t) => n + this.topicSelCount(t), 0);
  }
  catFull(ts: TopicSummary[]): boolean {
    return ts.every((t) => this.topicFull(t));
  }
  catPartial(ts: TopicSummary[]): boolean {
    return this.catSel(ts) > 0 && !this.catFull(ts);
  }

  // --- Fame depth ------------------------------------------------------------

  depthOf(tid: string, g: Group): number {
    const k = this.key(tid, g.id);
    return g.tiers ? (this.depthByGroup[k] ?? 0) : this.selected[k] ? 1 : 0;
  }
  setDepth(tid: string, g: Group, d: number): void {
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
    const d = depthFromKey(e, this.depthOf(tid, g), tierSizes(g).length);
    if (d === null) return;
    e.preventDefault();
    this.setDepth(tid, g, d);
  }

  // --- Setting ---------------------------------------------------------------

  setGroup(tid: string, g: Group, on: boolean): void {
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
    const data = topics.data[t.id] ?? (await topics.ensure(t));
    if (!data) return;
    this.setTopic(t, !this.topicFull(t));
  }
  async toggleCategory(ts: TopicSummary[]): Promise<void> {
    const on = !this.catFull(ts);
    const loaded = await Promise.all(ts.map((t) => topics.data[t.id] ?? topics.ensure(t)));
    ts.forEach((t, i) => loaded[i] && this.setTopic(t, on));
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
