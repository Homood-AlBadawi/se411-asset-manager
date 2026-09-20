# AI Tool Usage

**Project:** AssetTrack — IT Asset Management System
**Course:** SE411 — Software Engineering, Fall 2026/27, Part 1
**Team:** Homood AlBadawi (221110514), Malik Tariq (221110513)

The brief asks the team to use an AI tool to specify requirements, design the
interface, write the code, generate documentation, generate and run tests, and
generate a code review. This document records how that was done and what the
team decided rather than accepted.

**Tool used:** Claude (Anthropic).

---

## 1. Requirements specification

The AI was given the project brief and asked to turn "manage assets" into a
concrete specification for one asset type.

**Team decisions, not the AI's:**

- The asset type — **IT equipment** — was chosen over vehicles, projects and
  financial assets because it maps onto something the team can describe
  accurately and because the entity has enough fields to make search and filter
  meaningful without becoming a domain-modelling exercise.
- The scope boundary: no persistence in Part 1, because the brief says the data
  is a collection of objects.

**AI contribution:** the field list, the validation rules per field, the
functional/non-functional split, the user stories, and the traceability matrix
in `REQUIREMENTS.md`.

## 2. Visual design

The AI proposed the layout (sticky navbar, dashboard tiles, table with row
actions) and a design-token palette. The team kept the token approach and
rejected a first pass that used a UI framework, on the grounds that a framework
dependency is harder to justify in a review than 400 lines of CSS the team can
read.

## 3. Implementation

The AI wrote the React code. The architectural constraints it was given up front
were the team's:

- Business logic in pure functions, outside components, so it is testable
  without rendering.
- All mutation through one reducer.
- The data layer behind a narrow interface, so Part 2 changes one folder.

Those three constraints are what most of the code review's positive findings
trace back to.

## 4. Documentation

`README.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md`, `TEST_REPORT.md` and
`CODE_REVIEW.md` were AI-generated from the actual source, then checked against
it — every file path, test name, count and build figure in them was verified
against the repository rather than taken on trust.

## 5. Tests

The AI generated 65 tests across five files and they were **run, not just
written**: `npm test` reports 65/65 passing in 5.1 s. Output is in
`TEST_REPORT.md`.

Four real bugs surfaced during that process and are documented in section 5 of
the test report:

1. Editing an asset was rejected for duplicating its own tag.
2. Costs sorted lexically, so 40000 came before 8000.
3. `Array.prototype.sort` mutated the context array in place.
4. Assets with no assigned holder sorted above named ones.

Each was fixed and has a regression test.

## 6. Code review

The AI reviewed the finished codebase across security, performance, code quality
and code reuse; the result is `CODE_REVIEW.md`. Nine findings, none critical.
Claims were spot-checked against the source — for example the "no injection
surface" finding was confirmed with a grep for `dangerouslySetInnerHTML`,
`innerHTML` and `eval` across `src/`, which returns nothing.

## 7. Reflection

Where AI assistance helped most: producing a complete, consistent skeleton fast,
and being exhaustive about edge cases in tests and documentation — the kind of
coverage that is tedious to do by hand and therefore usually skipped.

Where judgement was still required: the AI's first instinct was to add
dependencies (a UI framework, a state-management library, a date library) that
the project does not need. Each was rejected on the grounds that the code review
would have to justify it. The AI also, until told otherwise, put business logic
inside components; the split into pure modules was a team instruction, and it is
what made the test suite fast and meaningful.

The honest summary: AI moved the work from "write everything" to "decide
everything and verify everything". The verification is not optional — three of
the four bugs above were in AI-written code and were caught only because the
tests were actually run.
