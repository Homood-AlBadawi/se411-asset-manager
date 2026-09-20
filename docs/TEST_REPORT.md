# Test Report

**Project:** AssetTrack — IT Asset Management System
**Course:** SE411 — Software Engineering, Fall 2026/27, Part 1
**Team:** Homood AlBadawi (221110514), Malik Tariq (221110513)
**Date of run:** 20 September 2026
**Result:** **65 / 65 passed**, 5 test files, 5.1 s

---

## 1. Strategy

Tests were generated with AI assistance and then run, as the brief requires. The
suite is deliberately split into three levels, so a failure points at a layer
rather than at "something broke".

| Level | What it exercises | Renders? | Count |
|---|---|---|---|
| **Unit** | Pure functions: validation, search, filter, sort, aggregation, formatting, and the reducer | No | 37 |
| **Component** | A single component's behaviour under real user events | Yes, one component | 21 |
| **Integration** | Whole routes through the real router and the real store | Yes, the whole app | 7 |

Two rules shaped how the tests are written:

- **Query the way a user perceives the page** — by role, label and visible text
  (`getByRole('searchbox', { name: /search assets/i })`), never by CSS class or
  test-id. Renaming a class or reordering the DOM cannot break a test; changing
  what the user sees can, which is the point.
- **Simulate real interaction** — `@testing-library/user-event` rather than
  `fireEvent`, so typing fires focus, keydown, input and change in the order a
  browser fires them.

Nothing is mocked. `renderWithProviders` supplies a deterministic three-asset
fixture through `AssetProvider`'s `initialAssets` prop and wraps everything in a
`MemoryRouter`; the code under test is the code that ships.

## 2. How to run

```bash
npm test                  # single run
npm run test:watch        # re-run on change
npm run test:ui           # verbose, one line per test case
```

## 3. Coverage by file

### `src/tests/assetUtils.test.js` — 26 unit tests

| Group | Cases | Notable edge cases |
|---|---|---|
| `generateId` | 1 | Two calls never collide |
| `normalizeAsset` | 1 | Trims strings, leaves numbers alone |
| `validateAsset` | 9 | Whitespace-only name; illegal tag characters; **duplicate tag, case-insensitive**; an asset keeping its own tag while edited; empty cost accepted as "not recorded"; negative and non-numeric cost; future purchase date; 501-character notes |
| `searchAssets` | 4 | Empty and whitespace-only term returns everything, not nothing; matches tag, holder and notes; no match returns `[]` |
| `filterAssets` | 3 | `'All'` means no filter; filters AND together |
| `sortAssets` | 3 | **Input array not mutated**; numbers sorted numerically (2000 < 8000 < 40000, not lexically); blanks pushed to the end |
| `queryAssets` | 1 | Search → filter → sort applied in that order |
| `summarize` | 2 | Correct groups and total; empty collection does not divide by zero |
| `formatDate` | 2 | Em dash for empty and for invalid input |

### `src/tests/assetReducer.test.js` — 11 unit tests

| Action | Cases | Notable |
|---|---|---|
| ADD | 4 | New asset prepended; id and timestamps generated; `'1500'` coerced to `1500`; strings trimmed; **previous state not mutated** |
| UPDATE | 3 | Only the target changes; **`id` and `createdAt` survive a payload that tries to overwrite them**, while `updatedAt` refreshes; unknown id is a no-op |
| DELETE | 2 | Target removed; unknown id leaves the collection intact |
| RESET / default | 2 | RESET replaces the collection; an unknown action returns the same reference |

### `src/tests/AssetForm.test.jsx` — 9 component tests

Empty submit is blocked and both required-field messages appear · duplicate tag
rejected · illegal tag characters rejected · negative cost rejected · an error
clears as soon as the user fixes that field · valid data reaches `onSubmit`
exactly once with the right values · edit mode pre-fills every field · an asset
keeps its own tag while being edited · Cancel calls `onCancel` and never
submits.

### `src/tests/AssetsPage.test.jsx` — 12 component tests

All three assets listed · the "Showing N of M" counter is correct · typing
narrows the table live · a non-matching search shows the empty state · Clear
resets both the box and the counter · the status filter works · a filter and a
search term combine · clicking a header sorts and a second click reverses ·
cost sorts numerically · **Delete opens a confirmation instead of deleting** ·
Cancel keeps the asset · Confirm removes it and the row count drops.

### `src/tests/App.test.jsx` — 7 integration tests

The menu links to all four features · the About link opens the About page and
**both names and both student IDs are present** · the dashboard total matches
the store · an asset added through the form appears in the list and the counter
increments · an edit through `/assets/:id/edit` replaces the old name · an
unknown asset id renders "Asset not found" instead of crashing · an unknown URL
renders the 404 page.

## 4. Requirements traceability

| Requirement | Test |
|---|---|
| FR-02 menu | `App.test.jsx` — "shows a link to every feature" |
| FR-03 add | `App.test.jsx` — "adds an asset from the Add Asset page" |
| FR-04 update | `App.test.jsx` — "updates an asset through the edit route" |
| FR-05 delete | `AssetsPage.test.jsx` — delete group (3) |
| FR-06 search | `AssetsPage.test.jsx` — search group (3) |
| FR-07 display | `AssetsPage.test.jsx` — display group (2) |
| FR-08 about page | `App.test.jsx` — "opens the About page from the menu" |
| FR-10 filter | `AssetsPage.test.jsx` — filters group (2) |
| FR-11 sort | `AssetsPage.test.jsx` — sorting group (2) |
| FR-12 validation | `AssetForm.test.jsx` — validation group (5) |
| FR-13 duplicate tag | `assetUtils.test.js` + `AssetForm.test.jsx` |
| FR-14 statistics | `App.test.jsx` — "renders the summary counts" |
| FR-15 confirm destructive | `AssetsPage.test.jsx` — "keeps the asset when the user cancels" |
| FR-16 empty state | `AssetsPage.test.jsx` — "shows an empty state" |
| FR-17 error routes | `App.test.jsx` — last two tests |

Every "Must" and "Should" requirement has at least one test.

## 5. Bugs the suite caught during development

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | Editing an asset without changing its tag was rejected as a duplicate | The uniqueness check compared against the whole collection, including the asset being edited | Added the `editingId` parameter, excluded from the comparison |
| 2 | Sorting by cost put 40000 before 8000 | `localeCompare` on stringified numbers | Branch on `typeof === 'number'` and subtract |
| 3 | The table re-ordered itself after a sort click had already been applied elsewhere | `Array.prototype.sort` mutated the context array in place | `sortAssets` copies with `[...assets]` first |
| 4 | Assets with no assigned holder sorted above real names | Empty strings sort first lexically | Blank values explicitly pushed to the end, in both directions |

## 6. Run output

```
 RUN  v2.1.9

 ✓ src/tests/assetUtils.test.js   (26 tests)  19ms
 ✓ src/tests/AssetForm.test.jsx   ( 9 tests) 704ms
 ✓ src/tests/AssetsPage.test.jsx  (12 tests) 758ms
 ✓ src/tests/assetReducer.test.js (11 tests)   5ms
 ✓ src/tests/App.test.jsx         ( 7 tests) 511ms

 Test Files  5 passed (5)
      Tests  65 passed (65)
   Duration  5.11s
```

Production build for the same commit:

```
vite v5.4.21 building for production...
✓ 52 modules transformed.
dist/index.html                   0.52 kB │ gzip:  0.32 kB
dist/assets/index-BI81emtP.css    9.88 kB │ gzip:  2.59 kB
dist/assets/index-CZAar3h8.js   190.66 kB │ gzip: 61.05 kB
✓ built in 914ms
```

## 7. Gaps

Honest list of what is not covered:

- **No visual regression testing.** Layout breakage would not fail the suite.
- **No cross-browser run.** Tests execute in jsdom, not a real browser engine.
- **`ConfirmDialog` is tested through `AssetsPage`, not directly.** jsdom's
  `showModal` support varies by version, which is why the component falls back
  to setting the `open` attribute.
- **No performance test.** The memoised pipeline is reasoned about, not measured
  against a 10,000-row collection.
- **Accessibility is asserted structurally** (roles, labels, `aria-sort`), not
  with an automated audit such as `jest-axe`.

Items 1, 2 and 5 are the natural additions for Part 2.
