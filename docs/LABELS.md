# Labels

How labels are used in this repo, and which parts of it a machine actually enforces.

**Emoji marks the project's own taxonomy.** Labels carrying an emoji are ours; the plain
ones (`documentation`, `question`, `good first issue`, …) are GitHub's defaults, kept as
they are. Priority labels are the one exception — they are long enough to read on their
own.

## What GitHub can and can't enforce

Only two things are automatic:

- **Each issue form applies its own label** (`labels:` in the form's frontmatter).
- **Nobody without write access can change labels at all** — not add, not remove. So a
  label applied by a form is effectively locked for outside contributors, and any
  "maintainer only" label below is already protected by that.

Everything else on this page is convention. GitHub has no way to restrict a label to a
template, and issue forms have no widget that maps a contributor's choice to a real
label. Where a form does ask ("Kind of proposal"), the answer lands in the issue body and
[`.github/workflows/labels.yml`](../.github/workflows/labels.yml) turns it into a label.

## Type — what kind of contribution this is

Applied automatically by the form. Exactly one per issue.

| Label | Applied by | Meaning |
|---|---|---|
| `List 📋` | `word-list.yml` | A whole word list: new, a full rework, or a new language |
| `Correction 🔧` | `correction.yml` | A wrong or missing entry, a fame-group tweak, a translation |
| `Code 💻` | `code.yml` | The app itself — site, UI, build |

`Correction 🔧` is deliberately content-only. A wrong entry in a list is not a `Bug 🐛`;
keeping them apart is what makes `Bug 🐛` usable as a filter for "the app is broken".

## Kind — what shape it takes

Derived from the form's *Kind* dropdown by the labeling workflow, on issue creation.

| Label | From | Meaning |
|---|---|---|
| `New 🆕` | `List 📋` | A topic that wasn't covered yet |
| `Rework 🛠️` | `List 📋` | A full overhaul of an existing list |
| `Language 🌐` | `List 📋` | Adds or fixes a language |
| `Bug 🐛` | `Code 💻` | Something doesn't work as it should |
| `Improvement ⚙️` | `Code 💻` | A concrete proposal for how something could work better |

`Idea 💡` is **not** in the dropdown on purpose: an open-ended idea versus a concrete
proposal is a distinction the reporter shouldn't have to agonise over. Apply it on triage
when something turns out to be more of a direction than a proposal.

## Priority

Maintainer-assigned, on triage. At most one at a time — if several end up on an issue,
the labeling workflow keeps the highest and drops the rest.

| Label | Meaning |
|---|---|
| `priority: critical` | Breaks the live site or loses data — before anything else |
| `priority: high` | Next up once the current work is done |
| `priority: medium` | Worth doing, no particular urgency |
| `priority: low` | Nice to have, whenever it fits |

The severity is carried by **colour**, not by position: labels sort alphabetically, so the
list reads critical → high → low → medium no matter what. GitHub has no scoped or ordered
labels (unlike Gitea), and the `priority: ` prefix exists only to keep the four together.

## Status & housekeeping

GitHub defaults, all maintainer-assigned.

| Label | Used for |
|---|---|
| `documentation` | README, CONTRIBUTING, this file, the planning docs |
| `question` | Needs an answer before anything can be decided |
| `help wanted` | Maintainer would welcome someone else picking this up |
| `good first issue` | Small, self-contained, well-described — a good entry point |
| `duplicate` | Already tracked elsewhere; link the original and close |
| `invalid` | Not actionable as reported |
| `wontfix` | Understood and deliberately not going to happen |

`good first issue` and `help wanted` are never applied automatically — GitHub only surfaces
them once they are set by hand.
