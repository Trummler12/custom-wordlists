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
  "hideRulers",
  "sources",
  "corrections",
  "credits",
  "lastUpdated",
  "lastChecked",
  // A flattened topic carries its list directly, in the same order a group would.
  "defaultNames",
  "tierNotes",
  "omitted",
  "omittable",
  "words",
  "tiers",
  "tierConditions",
  "rulerTooltip",
  "inheritsUpwards",
];

/** Field order within a ruler tooltip. */
const TOOLTIP_KEYS = ["text", "empty"];


const line = (indent, text) => " ".repeat(indent) + text;

/** An array with one item per line. */
function block(items, indent, closeIndent) {
  if (items.length === 0) return "[]";
  const body = items.map((i) => line(indent, JSON.stringify(i))).join(",\n");
  return `[\n${body}\n${line(closeIndent, "]")}`;
}

/** Field order within an omission rule. */
const RULE_KEYS = ["id", "match", "as", "except", "locked", "count", "icon", "reason"];

/** Field order within a tier note. */
const NOTE_KEYS = ["fromTier", "icon", "text"];

/** One object per block rather than per line, with its prose field opened up one
 *  language to a line. `field` is the indent of the array's `"key":` line, so the
 *  same shape serializes at group level (6) and, since the topics were flattened,
 *  at topic level (2).
 *
 *  A rule used to fit on a line because it carried two languages. At seven it
 *  would run past any window, and these are prose sentences of uneven length —
 *  grouping them two or three to a line means every line re-wraps when one
 *  translation changes, and a diff that should read as "the Spanish text moved"
 *  reads as three languages moving. One per line keeps a change where it
 *  belongs. */
function proseBlock(items, order, prose, field) {
  const NL = "\n";
  const brace = field + 2;
  const inner = field + 4;
  const body = items
    .map((item) => {
      const keys = [...order, ...Object.keys(item).filter((k) => !order.includes(k))];
      const fields = [];
      for (const key of keys) {
        const value = item[key];
        if (value === undefined) continue;
        if (key === prose && value !== null && typeof value === "object") {
          const langs = Object.entries(value)
            .map(([l, text]) => line(inner + 2, `${JSON.stringify(l)}: ${JSON.stringify(text)}`))
            .join(`,${NL}`);
          fields.push(line(inner, `${JSON.stringify(key)}: {${NL}${langs}${NL}${line(inner, "}")}`));
        } else {
          fields.push(line(inner, `${JSON.stringify(key)}: ${JSON.stringify(value)}`));
        }
      }
      return [line(brace, "{"), fields.join(`,${NL}`), line(brace, "}")].join(NL);
    })
    .join(`,${NL}`);
  return `[${NL}${body}${NL}${line(field, "]")}`;
}

/** Tier conditions: one condition per line, its whole language map inline. Unlike
 *  a rule's prose these are short parallel phrases, and reading tier 2 against tier
 *  3 wants them stacked, not each spread over nine lines. */
function condBlock(conds, field) {
  const body = conds.map((c) => line(field + 2, JSON.stringify(c))).join(",\n");
  return `[\n${body}\n${line(field, "]")}`;
}

/** A ruler tooltip: its two sentences one to a line, each language map inline —
 *  the same reasoning as `condBlock`, they are short and read against each other. */
function tooltipBlock(tt, field) {
  const body = TOOLTIP_KEYS.filter((k) => tt[k] !== undefined)
    .map((k) => line(field + 2, `${JSON.stringify(k)}: ${JSON.stringify(tt[k])}`))
    .join(",\n");
  return `{\n${body}\n${line(field, "}")}`;
}

/** Fame tiers: each tier its own multi-line array, a blank line between them, so
 *  the boundaries are visible in the file rather than only in the count. */
function tierBlock(tiers, field) {
  const body = tiers
    .map((tier) => line(field + 2, block(tier, field + 4, field + 2)))
    .join(",\n\n");
  return `[\n${body}\n${line(field, "]")}`;
}

/** Serialize one of the list-carrying fields at the given indent, or null when the
 *  key is not one — shared by a group (field 6) and a flat topic (field 2). */
function listField(key, value, field) {
  if (key === "words") return `"words": ${block(value, field + 2, field)}`;
  if (key === "tiers") return `"tiers": ${tierBlock(value, field)}`;
  if (key === "tierConditions") return `"tierConditions": ${condBlock(value, field)}`;
  if (key === "rulerTooltip") return `"rulerTooltip": ${tooltipBlock(value, field)}`;
  if (key === "omitted" || key === "omittable") return `"${key}": ${proseBlock(value, RULE_KEYS, "reason", field)}`;
  if (key === "tierNotes") return `"tierNotes": ${proseBlock(value, NOTE_KEYS, "text", field)}`;
  return null;
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
    } else {
      // A topic's list fields serialize at topic indent; everything else is a
      // scalar or small object that fits on its line.
      const list = listField(key, value, 2);
      parts.push(line(2, list ?? `"${key}": ${JSON.stringify(value)}`));
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
  // Rules and notes are reordered on the way out too, so the comparison has to
  // expect it — otherwise a file that merely lists `except` before `as` reads as
  // data lost. Applies wherever they live: in a group, or on a flattened topic.
  const orderRules = (obj) => {
    for (const key of ["omitted", "omittable"]) {
      if (obj[key]) obj[key] = obj[key].map((rule) => order(rule, RULE_KEYS));
    }
    if (obj.tierNotes) obj.tierNotes = obj.tierNotes.map((n) => order(n, NOTE_KEYS));
    if (obj.rulerTooltip) obj.rulerTooltip = order(obj.rulerTooltip, TOOLTIP_KEYS);
    return obj;
  };
  return orderRules(order(topic, TOPIC_KEYS));
}
