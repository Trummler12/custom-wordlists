# Labels

How labels are used in this repo, and which parts of it a machine actually enforces.

**Emoji marks the project's own taxonomy.** Labels carrying an emoji are ours; the plain ones (`documentation`, `question`, `good first issue`, …) are GitHub's defaults, kept as they are. Priority labels are the one exception — they are long enough to read on their own.

## What GitHub can and can't enforce

Only two things are automatic:

- **Each issue form applies its own label** (`labels:` in the form's frontmatter).
- **Nobody without write access can change labels at all** — not add, not remove. So a label applied by a form is effectively locked for outside contributors, and any "maintainer only" label below is already protected by that.

Everything else on this page is convention. GitHub has no way to restrict a label to a template, and issue forms have no widget that maps a contributor's choice to a real label. Where a form does ask ("Kind of proposal"), the answer lands in the issue body and [`.github/workflows/labels.yml`](../.github/workflows/labels.yml) turns it into a label.

## Type — what kind of contribution this is

Applied automatically by the form. Exactly one per issue.

| Label | Applied by | Meaning |
|---|---|---|
| `List 📋` | `1-word-list.yml` | A whole word list: new, a full rework, or a new language |
| `Data 📊` | `2-data-source.yml` | Links to structured data a list can be generated from |
| `Correction 🔧` | `3-correction.yml` | A wrong or missing entry, a fame-group tweak, a translation |
| `Code 💻` | `4-bug.yml`, `5-improvement.yml` | The app itself — site, UI, build |

`Correction 🔧` is deliberately content-only. A wrong entry in a list is not a `Bug 🐛`; keeping them apart is what makes `Bug 🐛` usable as a filter for "the app is broken".

`Data 📊` is a type rather than a kind, even though a data source always *becomes* a list. What arrives is different in kind from a list: links, not entries. Keeping it out of `List 📋` is also what stops `Needs JSON 🧩` from firing on it — see below, that job is gated on the `List 📋` label, and a data issue has no entries to look at.

## Kind — what shape it takes

On the word-list and data-source forms this is a *Kind* dropdown, and the labeling workflow turns the answer into a label on issue creation. For code there is no dropdown: `Bug 🐛` and `Improvement ⚙️` are separate forms that apply their own label directly — a dropdown whose first option a mobile browser pre-selects is a worse question than two entries in the template chooser.

| Label | From | Meaning |
|---|---|---|
| `New 🆕` | `List 📋`, `Data 📊` | A topic that wasn't covered yet |
| `Rework 🛠️` | `List 📋` | A full overhaul of an existing list |
| `Language 🌐` | `List 📋`, `Data 📊` | Adds or fixes a language |
| `Bug 🐛` | `4-bug.yml` | Something doesn't work as it should |
| `Improvement ⚙️` | `5-improvement.yml` | A concrete proposal for how something could work better |

Both forms with a dropdown spell it `Kind of proposal` and spell the options the same way, so the workflow reads one heading and a new form costs it no change. The data form offers no `Rework`: a data source doesn't overhaul a list, it replaces one or fills a language in one.

`Idea 💡` is **not** in the dropdown on purpose: an open-ended idea versus a concrete proposal is a distinction the reporter shouldn't have to agonise over. Apply it on triage when something turns out to be more of a direction than a proposal.

## Conversion — from a simple list to JSON

A `List 📋` can arrive in two shapes (see [CONTRIBUTING.md](../CONTRIBUTING.md)): the *simple* plain-text form, or ready-to-paste *JSON*. These two labels track a simple submission on its way to becoming data — kept apart from `help wanted` on purpose, so that promise ("never applied automatically") stays intact.

| Label | Applied by | Meaning |
|---|---|---|
| `Needs JSON 🧩` | `.github/workflows/labels.yml`, on creation | The list came in simple form and still needs turning into JSON — a good spot to help out |
| `Being converted 🔨` | Maintainer, by hand | Someone has claimed the conversion (a referencing issue or PR exists); avoids two people doing it at once |

`Needs JSON 🧩` is set only when a word-list issue's body holds fewer than ~10 JSON-looking entry lines — i.e. it isn't already JSON. It's advisory: a maintainer can drop it if the heuristic misjudged. When help lands, swap it for `Being converted 🔨`.

## Priority

Maintainer-assigned, on triage. At most one at a time — if several end up on an issue, the labeling workflow keeps the highest and drops the rest.

| Label | Meaning |
|---|---|
| `priority: critical` | Breaks the live site or loses data — before anything else |
| `priority: high` | Next up once the current work is done |
| `priority: medium` | Worth doing, no particular urgency |
| `priority: low` | Nice to have, whenever it fits |

The severity is carried by **colour**, not by position: labels sort alphabetically, so the list reads critical → high → low → medium no matter what. GitHub has no scoped or ordered labels (unlike Gitea), and the `priority: ` prefix exists only to keep the four together.

## Status & housekeeping

All maintainer-assigned; GitHub's defaults apart from `Example 📌`.

| Label | Used for |
|---|---|
| `Example 📌` | Not a real request — an issue kept open as a filled-in sample of a template |
| `documentation` | README, CONTRIBUTING, this file, the planning docs |
| `question` | Needs an answer before anything can be decided |
| `help wanted` | Maintainer would welcome someone else picking this up |
| `good first issue` | Small, self-contained, well-described — a good entry point |
| `duplicate` | Already tracked elsewhere; link the original and close |
| `invalid` | Not actionable as reported |
| `wontfix` | Understood and deliberately not going to happen |

`good first issue` and `help wanted` are never applied automatically — GitHub only surfaces them once they are set by hand.
