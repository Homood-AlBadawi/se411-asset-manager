# Code Review

**Project:** AssetTrack — IT Asset Management System
**Course:** SE411 — Software Engineering, Fall 2026/27, Part 1
**Team:** Homood AlBadawi (221110514), Malik Tariq (221110513)
**Reviewed:** 20 September 2026 · ~1,400 lines across 22 source files
**Method:** AI-assisted review across four dimensions — security, performance,
code quality and code reuse — with each finding checked against the code.

**Verdict:** the codebase is sound for a Part 1 frontend deliverable. Nine
issues were found: none critical, two worth fixing before Part 2 goes live, the
rest minor or accepted for scope.

---

## 1. Security

### ✅ What is right

**No injection surface from user input.** Nowhere in the codebase is there
`dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function` or a dynamic
`<script>`. All user text renders as JSX children, which React escapes. An asset
named `<img src=x onerror=alert(1)>` renders as that literal text.

```bash
$ grep -rn "dangerouslySetInnerHTML\|innerHTML\|eval(" src/
# no matches
```

**Input is validated and bounded.** `validateAsset` enforces a length ceiling on
every free-text field (name ≤ 80, notes ≤ 500), a character whitelist on the tag
(`/^[A-Za-z0-9-]{3,20}$/`), a numeric range on the cost and a date sanity check.
Bounded input is what stops a pathological value reaching storage in Part 2.

**No secrets and no third-party runtime code.** Three runtime dependencies
(`react`, `react-dom`, `react-router-dom`), no API keys, no `.env`, no analytics
or CDN scripts — so no supply-chain surface in the shipped bundle.

**Destructive actions are confirmed.** Delete is gated behind `ConfirmDialog`,
which names the asset and its tag before removing anything.

**Identifiers are unguessable.** `crypto.randomUUID()` rather than an
incrementing counter, so ids do not leak inventory size and cannot be enumerated
once a backend exists.

### ⚠️ Findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| S-1 | **Medium** (Part 2) | All validation is client-side. It is a UX affordance, not a security boundary — anyone can bypass it with dev tools. | In Part 2, re-run every rule in `validateAsset` on the server. Share the rule set if the backend is JavaScript. |
| S-2 | Low | No authentication or authorisation. Any visitor can delete any asset. | Out of scope for Part 1 and explicitly deferred; add roles (viewer / editor / admin) with the Part 2 API. |
| S-3 | Low | The tag uniqueness check is a race in a multi-user system: two users can pass it with the same tag. | Add a `UNIQUE` constraint on `tag` in the Part 2 database and surface the 409. |
| S-4 | Informational | No Content Security Policy header. | Nothing to configure in Part 1 (no server); set CSP on the Part 2 host. |

**Not vulnerable to:** XSS (React escaping, no raw HTML), prototype pollution
(no deep merge of user input; reducer spreads into fresh literals), ReDoS (the
one regex is linear with a bounded quantifier), or open redirect (no
URL-derived navigation).

---

## 2. Performance

### ✅ What is right

**The expensive pipeline is memoised.** `queryAssets` — search, then filter,
then sort — recomputes only when the collection or a query input actually
changes:

```js
const visibleAssets = useMemo(
  () => queryAssets(assets, { term, filters, sortKey, sortDirection }),
  [assets, term, filters, sortKey, sortDirection],
)
```

Without this, opening the delete dialog (which sets `pendingDelete`) would
re-sort the entire table.

**Context callbacks are stable.** `addAsset`, `updateAsset`, `deleteAsset` and
`resetAssets` are wrapped in `useCallback` with empty dependency arrays —
`dispatch` is guaranteed stable by React — and the context value is a `useMemo`.
Without this, every consumer would re-render on every provider render regardless
of whether the data changed.

**The pipeline is ordered cheapest-result-first.** Search runs before filter and
sort, so the `O(n log n)` sort operates on the smallest array.

**The bundle is small.** 190 KB raw, **61 KB gzipped**, including React and the
router. No UI framework, no icon library, no date library — `Intl.DateTimeFormat`
and `Intl.NumberFormat` are built into the browser.

**Aggregation is single-pass.** `summarize` computes total, per-status counts,
per-category counts and total value in one loop rather than four.

**CSS is static.** No runtime style generation; one 2.6 KB gzipped stylesheet
cached independently of the JS.

### ⚠️ Findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| P-1 | **Medium** (at scale) | The table renders every matching row. At 10,000 assets that is 10,000 DOM rows. | Add pagination or windowing (`react-window`) once the collection can grow past a few hundred. Part 2's API should paginate server-side anyway. |
| P-2 | Low | Search runs on every keystroke. Imperceptible at 10 assets, not at 10,000. | Debounce the term by ~250 ms, or move search server-side in Part 2. |
| P-3 | Low | `new Intl.NumberFormat(...)` is constructed on every `formatCurrency` call. | Hoist the formatter to module scope — a one-line change, measurable only in long lists. |
| P-4 | Informational | No code splitting; one bundle. | At 61 KB gzipped this is correct. Revisit if the app grows past ~250 KB. |

---

## 3. Code quality

### ✅ What is right

**Layering is enforced by the imports, not just by convention.** Components
import from `context/` and `utils/`; nothing imports `seedAssets` except the
provider. Dependencies point one way.

**Business logic is free of React.** `assetUtils.js` and `assetReducer.js`
import nothing from React and touch no DOM. That is why 37 of 65 tests run in
under 25 ms with no rendering.

**All mutation is centralised.** Four action types in one `switch`. There is no
`setAssets` scattered across pages, so "what can change an asset?" has a
one-file answer.

**Immutability is consistent.** Every reducer branch returns a new array;
`sortAssets` copies before sorting. No in-place mutation anywhere.

**Naming is honest.** `queryAssets`, `pendingDelete`, `normalizeAsset`,
`STATUS_TONE`. No `data`, `handleClick2`, `temp` or `flag`.

**Errors are handled where they occur.** `useAssets` throws a named error if
used outside its provider. `EditAssetPage` renders a recoverable message for a
missing id instead of crashing on `asset.name`. `formatCurrency` and
`formatDate` return an em dash rather than `NaN` or `Invalid Date`.

**Accessibility is built in, not bolted on.** Every input has a `<label>`;
sortable headers carry `aria-sort`; the result counter is `role="status"`;
failed fields get `aria-invalid` and their messages `role="alert"`; the delete
button's accessible name includes the asset name; focus rings are visible.

**Comments explain intent, not mechanics.** The comment on `sortAssets` says
*why* it copies (`sort` mutates); no comment says "loop over the array".

**Consistent style throughout.** Function components only, ES modules, no
`var`, no default exports competing with named ones inside a module,
single-quoted strings, no semicolon noise.

### ⚠️ Findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| Q-1 | Low | No ESLint or Prettier configuration. Consistency is currently maintained by hand. | Add `eslint-plugin-react-hooks` before Part 2 — it catches stale-closure bugs that tests miss. |
| Q-2 | Low | No TypeScript and no PropTypes, so component contracts are documented only in comments. | Either is a real improvement; TypeScript would also catch a typo'd asset field at compile time. |
| Q-3 | Low | `AssetsPage` holds five pieces of related state (`term`, `filters`, `sortKey`, `sortDirection`, `pendingDelete`). | If a sixth appears, extract a `useAssetQuery()` hook. At five it is still readable. |
| Q-4 | Informational | `AssetForm` is ~170 lines, mostly repeated field markup. | A `<Field>` wrapper would cut it, at the cost of one layer of indirection. Judgement call; left as is. |

---

## 4. Code reuse

### ✅ What is right

**One form serves two features.** `AssetForm` is shared by `AddAssetPage` and
`EditAssetPage`, parameterised by `initialValues`, `editingId` and
`submitLabel`. The two pages differ by about six lines. Validation, error
rendering and the field layout exist exactly once — a new rule is one edit, not
two.

**One vocabulary module.** `assetOptions.js` feeds the form's `<select>`s, the
filter dropdowns, the dashboard's status list and the tests. Adding a category
is a one-line change that propagates everywhere.

**One query pipeline.** `queryAssets` composes `searchAssets`, `filterAssets`
and `sortAssets`. Each is independently testable, and the composition is used by
the page and by the tests identically.

**One test helper.** `renderWithProviders` wraps router plus store plus fixture,
used by both integration files.

**Small presentational components reused across pages.** `StatusBadge` appears
in the table and on the dashboard; `Toast` and `ConfirmDialog` are generic
enough to serve any future entity.

**The data layer is a seam, not a leak.** Four functions on the context — that
is the whole interface between the UI and the data. It is what makes the Part 2
migration a change to one folder.

### ⚠️ Findings

| # | Severity | Finding | Recommendation |
|---|---|---|---|
| R-1 | Low | The column list in `AssetTable` and the field list in `AssetForm` both encode the asset shape, in different forms. Adding a field means editing both. | Derive both from a single field-descriptor array if the entity count grows in Part 2. |
| R-2 | Informational | The page-header block (`<div className="page-head">`) is repeated on five pages. | A `<PageHeader title subtitle action>` component would remove ~20 lines. Low value at this size. |

---

## 5. Summary

| Dimension | Rating | Comment |
|---|---|---|
| Security | **Good** | No injection surface; input bounded; the one real gap (S-1) is inherent to a frontend-only deliverable and is Part 2 work. |
| Performance | **Good** | Correct memoisation, stable callbacks, small bundle. Scaling limits (P-1, P-2) are understood and documented rather than discovered later. |
| Code quality | **Very good** | Clean layering, pure logic, centralised mutation, real accessibility. Tooling (Q-1, Q-2) is the main gap. |
| Code reuse | **Very good** | One form, one vocabulary, one pipeline, one data seam. |

### Recommended before Part 2

1. **S-1** — mirror `validateAsset` on the server. *(required)*
2. **S-3** — `UNIQUE` constraint on `tag` in the database. *(required)*
3. **Q-1** — add ESLint with `react-hooks` rules. *(cheap, high value)*
4. **P-1** — paginate once the API can return more than a page of assets.
5. **P-3** — hoist the `Intl` formatters. *(one line)*

### Deliberately not changed

- No `localStorage` persistence — the brief specifies an in-memory collection,
  and adding storage now would create a second source of truth to unwind.
- No state-management library — Context plus `useReducer` is sufficient and
  adds no dependency.
- No CSS framework — design tokens in one file cost less than a framework's
  configuration and learning curve.
