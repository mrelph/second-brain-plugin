# Page templates

This file defines the page templates the skill writes into `templates/`, plus how to generate the example seed pages. Templates are generated **tailored to the user's design** — the skeletons below show the wikilinks + frontmatter-ON variant; the markdown and frontmatter-OFF variants are described under [Variants](#variants).

## Template skeletons

### `templates/steering.md`

```markdown
---
type: steering
created: {{date}}
tags: []
---
# {{title}}

## Purpose

## Scope & boundaries

## Guiding principles

## Related
- [[ ]]
```

### `templates/research.md`

```markdown
---
type: research
created: {{date}}
tags: []
---
# {{title}}

## Question

## Key findings

## Sources

## Open threads

## Related
- [[ ]]
```

### `templates/meeting-note.md`

```markdown
---
type: meeting-note
date: {{date}}
attendees: []
tags: []
---
# {{title}}

## Attendees
- [[ ]]

## Agenda

## Decisions

## Action items
- [ ]
```

### `templates/project.md`

```markdown
---
type: project
created: {{date}}
status: active
tags: []
---
# {{title}}

## Goal

## Status

## Milestones
- [ ]

## Decisions log

## Related
- [[ ]]
```

### `templates/big-idea.md`

```markdown
---
type: big-idea
created: {{date}}
tags: []
---
# {{title}}

## The idea (one line)

## Why it matters

## Sparks & sources

## Next step
```

### `templates/person.md`

```markdown
---
type: person
created: {{date}}
tags: []
---
# {{title}}

## Role & context

## Interactions

## Related
- [[ ]]
```

### `templates/entity.md`, `templates/concept.md`, `templates/topic.md`

All three share the same skeleton. The `type:` value differs per file (`entity`, `concept`, or `topic`). The entity variant in full:

```markdown
---
type: entity
created: {{date}}
tags: []
---
# {{title}}

## Definition

## Key facts

## Relationships
- [[ ]]

## Sources
```

`concept.md` and `topic.md` are identical except `type: concept` and `type: topic` respectively.

---

## Seed pages

The skill creates one `_example-*.md` per numbered area and one `_example-entity.md` in `wiki/`:

| File | Location |
|---|---|
| `_example-steering.md` | `01 - Steering/` |
| `_example-research.md` | `02 - Research/` |
| `_example-meeting.md` | `03 - Meeting Notes/` |
| `_example-project.md` | `04 - Projects/` |
| `_example-big-idea.md` | `05 - Big Ideas/` |
| `_example-person.md` | `06 - People/` |
| `_example-entity.md` | `wiki/entities/` (or the user's first wiki category) |

### Content: domain-flavored, not generic

Seed pages are filled with **realistic content drawn from the user's actual domain and entity types**, not lorem ipsum. The goal is to show the format in a way that immediately makes sense to the user.

For example: if the domain is AI alignment research, the example research page might be titled "Risks from learned optimization (Risks from MESA-optimizers)" with a real-sounding question, a couple of key findings, and a plausible open thread. If the domain is a personal recipe collection, the example project might be "Summer preserves batch 2025" with realistic milestones.

Use the `schema.domain`, `schema.entityTypes`, and any detail gathered during the interview to flavor the content. One well-chosen example teaches the format faster than a generic placeholder ever could.

### Opening markers

Every seed page **except** the steering one opens with:

```
> ⚠️ Example page — delete me once you've seen the format.
```

`01 - Steering/_example-steering.md` is special: seed it with a real lightweight starting steering doc — vision and scope drawn from the interview answers — and open it with:

```
> ✏️ Starter — edit me.
```

This makes the steering page immediately useful rather than throwaway.

---

## Variants

Templates are generated according to `wiki.linkStyle` and `wiki.frontmatter` from `.second-brain.json`. Adjust the skeletons above as follows before writing each template file:

**markdown (non-wikilinks) variant** — `wiki.linkStyle: "markdown"`: the `Related`, `Relationships`, and `Attendees` link bullets use `[Text](file.md)` instead of `[[ ]]`.

**frontmatter-OFF variant** — `wiki.frontmatter: false`: omit the `---` YAML block entirely; keep the body (headings, bullets, and checkboxes) unchanged.
