// The category tree the topic list renders, built from the flat manifest — plus
// the `inheritsUpwards` synthesis: which merged topics to hang in it, and how to
// assemble one from its contributors.

import type { Group, Omission, TopicSummary, WordEntry } from "./types";
import { renderEntry } from "./words";

/** One level of the category tree. Renders as a single collapsible node showing
 *  only its own path segment, so "gaming/pokemon/pokemon" nests inside
 *  "gaming/pokemon" instead of repeating the whole path as a flat header. */
export interface CatNode {
  name: string;
  path: string;
  topics: TopicSummary[];
  children: CatNode[];
  /** All topics under this node (own + descendants); filled once per tree build,
   *  so category rows don't re-flatten their subtree on every render. */
  all: TopicSummary[];
}

const fillAll = (node: CatNode): TopicSummary[] =>
  (node.all = node.topics.concat(...node.children.map(fillAll)));

/** The file stem of a topic's path, without the `.json` — the family key a set of
 *  `inheritsUpwards` leaves share (every `countries.json` is one family). */
const stemOf = (path: string): string => (path.split("/").pop() ?? "").replace(/\.json$/, "");

/** The synthesized id for a family meeting at `meet` with file stem `stem`:
 *  "geography/human" + "countries" → "geography-human-countries". Internal, and
 *  distinct from the leaves' own ids ("africa-countries"), so it can key the tree
 *  and the selection delegation without colliding. */
const synthId = (meet: string, stem: string): string =>
  `${meet.split("/").filter(Boolean).join("-")}-${stem}`;

/** Languages every contributor supports — the intersection, in the first one's
 *  order. A contributor that declares none constrains nothing (it is already
 *  flagged on its own row); the synthesized topic claims a language only where all
 *  its members actually have it. */
function intersectLangs(contributors: TopicSummary[]): string[] | undefined {
  const declared = contributors.map((c) => c.languages).filter((l): l is string[] => !!l);
  if (declared.length === 0) return undefined;
  return declared[0].filter((l) => declared.every((set) => set.includes(l)));
}

/** The `dataOrigin` all contributors share, or undefined where they differ or one has
 *  none: a merge can only claim a source every one of its parts has. */
function sharedOrigin(contributors: TopicSummary[]): string | string[] | undefined {
  const first = contributors[0]?.dataOrigin;
  if (first === undefined) return undefined;
  const key = JSON.stringify(first);
  return contributors.every((c) => JSON.stringify(c.dataOrigin) === key) ? first : undefined;
}

/** The synthesized topics an `inheritsUpwards` family calls for: one merged topic
 *  per (meeting level, file stem), hung at that level as a sibling of the ordinary
 *  topics there. It holds no file and no state — a control surface over the
 *  same-named leaves it lists as `contributors`; `topics.groupsOf` assembles its
 *  list and `selection` delegates every action to those leaves.
 *
 *  A leaf contributes at every level from 1 up to its `inheritsUpwards`, so a
 *  `2` shows up merged twice (cities: per continent and globally). */
export function synthesizeTopics(topics: TopicSummary[]): TopicSummary[] {
  const families = new Map<string, TopicSummary[]>();
  for (const t of topics) {
    if (!t.inheritsUpwards) continue;
    const stem = stemOf(t.path);
    const segs = t.category.split("/").filter(Boolean);
    for (let k = 1; k <= t.inheritsUpwards && k <= segs.length; k++) {
      const meet = segs.slice(0, segs.length - k).join("/");
      const key = `${meet}::${stem}`;
      let family = families.get(key);
      if (!family) families.set(key, (family = []));
      family.push(t);
    }
  }
  const synths: TopicSummary[] = [];
  for (const [key, contributors] of families) {
    const sep = key.indexOf("::");
    const meet = key.slice(0, sep);
    const stem = key.slice(sep + 2);
    const first = contributors[0];
    const languages = intersectLangs(contributors);
    const origin = sharedOrigin(contributors);
    synths.push({
      id: synthId(meet, stem),
      title: first.title,
      icon: first.icon,
      category: meet,
      path: "", // no file of its own — the mark of a synthesized topic, with `contributors`
      ...(languages ? { languages } : {}),
      // The contributors carry the same icon controls (build-generated alike), so
      // the synth surfaces the merged control from the first — no file load needed.
      ...(first.controls ? { controls: first.controls } : {}),
      // Romaji is derived per contributor and merged in; the synth carries the flag
      // too so its own row derives it and shows the ℹ️ note (see derivedRomaji).
      ...(first.generatedRomaji ? { generatedRomaji: true } : {}),
      // Where the merged names come from, as long as every member agrees.
      ...(origin ? { dataOrigin: origin } : {}),
      // A merge is only as finished as its least finished member.
      ...(contributors.some((c) => c.plannedTopic)
        ? { plannedTopic: true }
        : contributors.some((c) => c.incompleteTopic)
          ? { incompleteTopic: true }
          : {}),
      contributors: contributors.map((c) => c.id),
      // Pre-load baseline only; once the members load, `topics.groupsOf` gives the
      // deduplicated count (transcontinentals merged), which is what the row shows.
      wordCount: contributors.reduce((n, c) => n + c.wordCount, 0),
    });
  }
  return synths;
}

/** The dedup key for merging a synthesized topic's tiers: an entry's English
 *  forms, so a country that spans two continents (Russia under Europe and Asia)
 *  collapses to one. `both` covers the short/long overrides (China / People's
 *  Republic of China) without depending on the list's names mode. */
const mergeKey = (e: WordEntry): string => renderEntry(e, "both", "en").join("|");

/** Cap on the names a merged rule's hover keeps, matching the per-list sample
 *  (SAMPLE_CAP in lib/omitted) and the panel's five-line excerpt. */
const SUMMARY_NAME_CAP = 50;

/** The declared omission rules across the contributors, deduplicated by `id` —
 *  every continent writes the "breakaway states" rule under the same id (with its
 *  own `match`, its own territories), so the merged panel shows one row, not seven.
 *  First occurrence wins; validate-data guarantees same-id rules carry the same
 *  reason, so which one wins can't matter. The per-contributor rules stay reachable
 *  through `sources`, which is where a toggle on the merged row commands them. */
function mergeRules(
  sources: { tid: string; group: Group }[],
  pick: (g: Group) => Omission[] | undefined,
): Omission[] {
  const seen = new Set<string>();
  const out: Omission[] = [];
  for (const s of sources) {
    for (const rule of pick(s.group) ?? []) {
      if (seen.has(rule.id)) continue;
      seen.add(rule.id);
      out.push(rule);
    }
  }
  return out;
}

/** Merge the contributor groups of an `inheritsUpwards` family into the one group
 *  the synthesized topic renders. Tiers are assembled band by band and
 *  deduplicated (transcontinentals), the omission rules deduplicated by id, while
 *  `sources` keeps each contributor's group so a later per-contributor view can
 *  regroup without re-merging. The boundary metadata (`tierConditions`,
 *  `rulerTooltip`, `defaultNames`) is taken from the first contributor —
 *  validate-data guarantees they all agree. */
export function mergeGroups(
  synth: TopicSummary,
  sources: { tid: string; group: Group }[],
): Group {
  const first = sources[0].group;
  const omitted = mergeRules(sources, (g) => g.omitted);
  const omittable = mergeRules(sources, (g) => g.omittable);
  const dedup = (entries: WordEntry[]): WordEntry[] => {
    const seen = new Set<string>();
    const out: WordEntry[] = [];
    for (const e of entries) {
      const key = mergeKey(e);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(e);
    }
    return out;
  };
  const g: Group = {
    id: synth.id,
    title: synth.title,
    ...(first.defaultNames !== undefined ? { defaultNames: first.defaultNames } : {}),
    ...(first.tierConditions ? { tierConditions: first.tierConditions } : {}),
    ...(first.rulerTooltip ? { rulerTooltip: first.rulerTooltip } : {}),
    ...(omitted.length ? { omitted } : {}),
    ...(omittable.length ? { omittable } : {}),
    sources,
  };
  if (first.tiers) {
    // A country sits in the same band in every continent (equal tierConditions),
    // so dedup is per tier — one pass per band, not one across the whole list.
    g.tiers = first.tiers.map((_, k) => dedup(sources.flatMap((s) => s.group.tiers?.[k] ?? [])));
  } else {
    g.words = dedup(sources.flatMap((s) => s.group.words ?? []));
  }
  // The "no name in this language" count reaches the merged panel too: summed per
  // tier across the contributors (an upper bound — a transcontinental missing the
  // same name twice counts twice, which "up to N" already allows for).
  const tierN = Math.max(0, ...sources.map((s) => s.group.unknownByTier?.length ?? 0));
  if (tierN > 0) {
    g.unknownByTier = Array.from({ length: tierN }, (_, k) =>
      sources.reduce((n, s) => n + (s.group.unknownByTier?.[k] ?? 0), 0),
    );
  }
  // Each rule's count and name sample, gathered from the contributors that carry
  // it — the same union the merged rule stands for. Names deduplicated so a
  // transcontinental match is not listed twice; capped like the per-list sample.
  const summary: Record<string, { count: number; names: string[] }> = {};
  for (const s of sources) {
    for (const [id, part] of Object.entries(s.group.omissionSummary ?? {})) {
      const agg = (summary[id] ??= { count: 0, names: [] });
      agg.count += part.count;
      for (const name of part.names) {
        if (agg.names.length < SUMMARY_NAME_CAP && !agg.names.includes(name)) agg.names.push(name);
      }
    }
  }
  if (Object.keys(summary).length) g.omissionSummary = summary;
  return g;
}

/** Build the nested tree from each topic's `category` path. Topics keep manifest
 *  order; categories appear in first-seen order. Pass synthesized topics
 *  (`synthesizeTopics`) alongside the real ones to hang them at their meeting
 *  level. */
export function buildTree(topics: TopicSummary[]): CatNode {
  const root: CatNode = { name: "", path: "", topics: [], children: [], all: [] };
  for (const t of topics) {
    let node = root;
    let path = "";
    for (const seg of t.category.split("/").filter(Boolean)) {
      path = path ? `${path}/${seg}` : seg;
      let child = node.children.find((c) => c.name === seg);
      if (!child) {
        child = { name: seg, path, topics: [], children: [], all: [] };
        node.children.push(child);
      }
      node = child;
    }
    node.topics.push(t);
  }
  fillAll(root);
  return root;
}

/** The tree as the reader sees it: only the topics `shown` lets through, and only the
 *  categories that still hold one of them somewhere below. The top-level categories stay
 *  whatever they hold, so a whole subject never vanishes from the list. A new tree with
 *  `all` refilled, so everything that sums a category speaks for what is on screen. */
export function pruneTree(root: CatNode, shown: (t: TopicSummary) => boolean): CatNode {
  // A branch nothing was taken from is handed back as it was, so its rows see the same
  // node and don't re-render when a topic elsewhere comes or goes.
  const prune = (node: CatNode, depth: number): CatNode | null => {
    const topics = node.topics.filter(shown);
    const children = node.children
      .map((c) => prune(c, depth + 1))
      .filter((c): c is CatNode => c !== null);
    if (depth > 1 && topics.length === 0 && children.length === 0) return null;
    const same =
      topics.length === node.topics.length &&
      children.length === node.children.length &&
      children.every((c, i) => c === node.children[i]);
    if (same) return node;
    return { name: node.name, path: node.path, topics, children, all: topics.concat(...children.map((c) => c.all)) };
  };
  return prune(root, 0)!;
}

/** Where each icon control (the Geoguessr coverage, the sovereignty matrix) is lifted to,
 *  as category path => icon keys: the deepest category holding every topic that carries
 *  it, so one control there commands them all. Only where at least two carry it (a single
 *  carrier's own control already does the job) and below the top of the tree (there is
 *  no row above the top-level categories). Planned topics don't count; what is currently
 *  shown doesn't matter either, so the control stays put while topics come and go. */
export function liftControls(topics: TopicSummary[]): Record<string, string[]> {
  const carriers = new Map<string, string[][]>();
  for (const t of topics) {
    if (t.contributors || t.plannedTopic) continue;
    for (const icon of Object.keys(t.controls ?? {})) {
      let cats = carriers.get(icon);
      if (!cats) carriers.set(icon, (cats = []));
      cats.push(t.category.split("/").filter(Boolean));
    }
  }
  const lifted: Record<string, string[]> = {};
  for (const [icon, cats] of carriers) {
    if (cats.length < 2) continue;
    let common = cats[0];
    for (const segs of cats.slice(1)) {
      let i = 0;
      while (i < common.length && i < segs.length && common[i] === segs[i]) i++;
      common = common.slice(0, i);
    }
    if (common.length === 0) continue;
    (lifted[common.join("/")] ??= []).push(icon);
  }
  return lifted;
}

/** A category path's ancestors, deepest first: "a/b/c" → ["a/b/c","a/b","a"]. In
 *  that order because the features that walk it want the nearest declaring
 *  ancestor, not the outermost. */
export function ancestorPaths(category: string): string[] {
  const segs = category.split("/").filter(Boolean);
  const paths: string[] = [];
  for (let i = segs.length; i > 0; i--) paths.push(segs.slice(0, i).join("/"));
  return paths;
}

/** Depth of a node below the root: top-level categories are 0. */
export const catDepth = (node: CatNode): number => node.path.split("/").length - 1;

/** Fallback display name for a category with no `_category.json` title. */
export const titleCase = (seg: string): string =>
  seg
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
