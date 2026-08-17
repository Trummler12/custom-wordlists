// The house style for a topic file, in one place: one entry per line, one blank
// line between fame tiers, everything else inline. Shared by every codemod that
// writes `data/topics/**`, so none of them can round-trip a file into a smaller
// one than it read.
//
// That is not hypothetical. Each codemod used to carry its own serializer naming
// the fields it happened to know, and `enrich-pokemon-langs` knew `id`, `title`
// and `words` — re-running it would have silently dropped every `tiers`,
// `omitted` and `omittable` in the repo. Hence the rule below: a key this file
// doesn't recognise is still written out, and reported, rather than lost.

/** Field order for a topic file, mirroring schema/topic.schema.json. */
const TOPIC_KEYS = [
  "id",
  "title",
  "icon",
  "order",
  "description",
  "languages",
  "usesEnglishFor",
  "generatedRomaji",
  "hideRulersByDefault",
  "sources",
  "corrections",
  "credits",
  "lastUpdated",
  "lastChecked",
  "groups",
  "presets",
];

/** Field order within a group. `words` and `tiers` are mutually exclusive. */
const GROUP_KEYS = ["id", "title", "defaultNames", "omitted", "omittable", "words", "tiers"];

const line = (indent, text) => " ".repeat(indent) + text;

/** An array with one item per line. */
function block(items, indent, closeIndent) {
  if (items.length === 0) return "[]";
  const body = items.map((i) => line(indent, JSON.stringify(i))).join(",\n");
  return `[\n${body}\n${line(closeIndent, "]")}`;
}

/** Field order within an omission rule. */
const RULE_KEYS = ["id", "match", "as", "except", "locked", "reason"];

/** One omission rule per block rather than per line, with its `reason` opened up
 *  one language to a line.
 *
 *  A rule used to fit on a line because it carried two languages. At seven it
 *  would run past any window, and these are prose sentences of uneven length —
 *  grouping them two or three to a line means every line re-wraps when one
 *  translation changes, and a diff that should read as "the Spanish text moved"
 *  reads as three languages moving. One per line keeps a change where it
 *  belongs. */
function ruleBlock(rules) {
  const NL = "\n";
  const body = rules
    .map((rule) => {
      const keys = [...RULE_KEYS, ...Object.keys(rule).filter((k) => !RULE_KEYS.includes(k))];
      const fields = [];
      for (const key of keys) {
        const value = rule[key];
        if (value === undefined) continue;
        if (key === "reason" && value !== null && typeof value === "object") {
          const langs = Object.entries(value)
            .map(([l, text]) => line(12, `${JSON.stringify(l)}: ${JSON.stringify(text)}`))
            .join(`,${NL}`);
          fields.push(line(10, `"reason": {${NL}${langs}${NL}${line(10, "}")}`));
        } else {
          fields.push(line(10, `${JSON.stringify(key)}: ${JSON.stringify(value)}`));
        }
      }
      return [line(8, "{"), fields.join(`,${NL}`), line(8, "}")].join(NL);
    })
    .join(`,${NL}`);
  return `[${NL}${body}${NL}${line(6, "]")}`;
}

/** Fame tiers: each tier its own multi-line array, a blank line between them, so
 *  the boundaries are visible in the file rather than only in the count. */
function tierBlock(tiers) {
  const body = tiers
    .map((tier) => line(8, block(tier, 10, 8)))
    .join(",\n\n");
  return `[\n${body}\n${line(6, "]")}`;
}

function serializeGroup(group, warn) {
  const parts = [];
  for (const key of GROUP_KEYS) {
    const value = group[key];
    if (value === undefined) continue;
    if (key === "words") parts.push(line(6, `"words": ${block(value, 8, 6)}`));
    else if (key === "tiers") parts.push(line(6, `"tiers": ${tierBlock(value)}`));
    else if (key === "omitted" || key === "omittable") {
      parts.push(line(6, `"${key}": ${ruleBlock(value)}`));
    } else parts.push(line(6, `"${key}": ${JSON.stringify(value)}`));
  }
  for (const key of Object.keys(group)) {
    if (GROUP_KEYS.includes(key)) continue;
    warn(`group "${group.id}" has unknown key "${key}" — written through unformatted`);
    parts.push(line(6, `"${key}": ${JSON.stringify(group[key])}`));
  }
  return `${line(4, "{")}\n${parts.join(",\n")}\n${line(4, "}")}`;
}

/** Serialize a whole topic file, ending in a newline.
 *  `warn` receives a message for anything this file doesn't know about; pass
 *  something that fails loudly if you'd rather not find out later. */
export function serializeTopic(topic, warn = (m) => console.warn(`serialize: ${m}`)) {
  const parts = [];
  const emit = (key, value) => {
    if (Array.isArray(value) && (key === "sources" || key === "credits") && value.length > 1) {
      // A list of sources reads as a list, one per line — they are long URLs.
      parts.push(line(2, `"${key}": ${block(value, 4, 2)}`));
    } else if (key === "groups") {
      const body = value.map((g) => serializeGroup(g, warn)).join(",\n");
      parts.push(line(2, `"groups": [\n${body}\n${line(2, "]")}`));
    } else if (key === "presets") {
      parts.push(line(2, `"presets": ${block(value, 4, 2)}`));
    } else {
      parts.push(line(2, `"${key}": ${JSON.stringify(value)}`));
    }
  };

  for (const key of TOPIC_KEYS) {
    if (topic[key] !== undefined) emit(key, topic[key]);
  }
  for (const key of Object.keys(topic)) {
    if (TOPIC_KEYS.includes(key)) continue;
    warn(`topic "${topic.id}" has unknown key "${key}" — written through unformatted`);
    emit(key, topic[key]);
  }

  const text = `{\n${parts.join(",\n")}\n}\n`;
  // A serializer that loses data is the failure mode worth spending a check on.
  if (JSON.stringify(JSON.parse(text)) !== JSON.stringify(sorted(topic))) {
    throw new Error(`serialize: "${topic.id}" did not round-trip`);
  }
  return text;
}

/** The topic with its keys in emitted order, for comparing round-trip equality
 *  without tripping over key order. */
function sorted(topic) {
  const order = (obj, keys) => {
    const out = {};
    for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
    for (const k of Object.keys(obj)) if (!keys.includes(k)) out[k] = obj[k];
    return out;
  };
  const t = order(topic, TOPIC_KEYS);
  if (t.groups) {
    t.groups = t.groups.map((g) => {
      const out = order(g, GROUP_KEYS);
      // Rules are reordered on the way out too, so the comparison has to expect
      // it — otherwise a file that merely lists `except` before `as` reads as
      // data lost.
      for (const key of ["omitted", "omittable"]) {
        if (out[key]) out[key] = out[key].map((rule) => order(rule, RULE_KEYS));
      }
      return out;
    });
  }
  return t;
}
