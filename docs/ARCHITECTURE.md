# Architecture, Technology Stack and Features

**Project:** AssetTrack — IT Asset Management System
**Course:** SE411 — Software Engineering, Fall 2026/27, Part 1
**Team:** Homood AlBadawi (221110514), Malik Tariq (221110513)

---

## 1. Overview

AssetTrack is a single-page application. The browser loads one HTML document;
React Router then swaps the page body as the user moves between menu items, so
there are no full page reloads. All state lives in memory in the browser tab.

```
┌──────────────────────────────────────────────────────────────┐
│                          Browser tab                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Presentation layer                                    │  │
│  │  Navbar · Dashboard · AssetsPage · AddAssetPage ·       │  │
│  │  EditAssetPage · AboutPage · NotFoundPage               │  │
│  │  AssetTable · AssetForm · SearchBar · ConfirmDialog ·   │  │
│  │  StatusBadge · Toast                                    │  │
│  └───────────────┬────────────────────────┬───────────────┘  │
│                  │ useAssets()            │ pure calls       │
│                  ▼                        ▼                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐  │
│  │  State layer             │  │  Domain logic layer      │  │
│  │  AssetContext (Provider) │  │  assetUtils.js           │  │
│  │  assetReducer.js         │  │  validate · search ·     │  │
│  │  ADD/UPDATE/DELETE/RESET │  │  filter · sort · format  │  │
│  └───────────┬──────────────┘  └──────────────────────────┘  │
│              │ seeded from                                   │
│              ▼                                               │
│  ┌──────────────────────────┐                                │
│  │  Data layer              │  ← Part 2 replaces this with   │
│  │  seedAssets.js (array)   │     REST calls; nothing above  │
│  │  assetOptions.js (enums) │     it changes                 │
│  └──────────────────────────┘                                │
└──────────────────────────────────────────────────────────────┘
```

### Layer responsibilities

| Layer | Responsibility | Knows about |
|---|---|---|
| Presentation | Render state, capture events. No business rules. | The state layer's interface and the domain helpers |
| State | Hold the collection; apply create/update/delete rules atomically | The domain layer and the seed data |
| Domain logic | Pure functions: validation, search, filter, sort, aggregation, formatting | Nothing — no React, no DOM, no globals |
| Data | The initial collection of objects and the enumerated vocabularies | Nothing |

Dependencies point downward only. A component never reaches past the state
layer into the data layer.

---

## 2. Technology stack

| Concern | Technology | Version | Rationale |
|---|---|---|---|
| UI library | React | 18.3 | Required by the brief. Function components and hooks throughout — no class components. |
| Build tool | Vite | 5.4 | Native-ESM dev server with instant HMR; Rollup-based production build. Replaces Create React App, which is no longer maintained. |
| Routing | React Router | 6.26 | Declarative route table; `NavLink` gives the active-menu-item styling for free. |
| State management | React Context + `useReducer` | built-in | One entity, one collection. Redux or Zustand would add a dependency and a lot of boilerplate for no benefit at this size. `useReducer` still gives the central, testable, atomic transitions that plain `useState` would not. |
| Testing | Vitest | 2.1 | Reuses `vite.config.js`, so tests and app share one module resolution and one transform pipeline. Jest-compatible API. |
| Component testing | React Testing Library | 16.0 | Queries the DOM the way a user does (by role, by label), so tests survive refactoring. |
| Styling | Plain CSS with custom properties | — | Every colour, radius and shadow is a token on `:root` in `src/index.css`. No Tailwind or Bootstrap dependency to install, configure or learn. |

**Runtime dependencies: 3** (`react`, `react-dom`, `react-router-dom`).
Everything else is a dev dependency and does not ship to the browser.

---

## 3. Data flow

### 3.1 Reading

`AssetProvider` sits above the router in `main.jsx`, so every route can call
`useAssets()`. `AssetsPage` reads the raw collection and pushes it through one
memoised pipeline:

```js
const visibleAssets = useMemo(
  () => queryAssets(assets, { term, filters, sortKey, sortDirection }),
  [assets, term, filters, sortKey, sortDirection],
)
```

`queryAssets` is `sortAssets(filterAssets(searchAssets(...)))` — search first
because it is the most selective, so filtering and sorting run over the smallest
array. Because it is memoised, typing in an unrelated field does not re-sort the
table.

### 3.2 Writing

```
User submits AssetForm
  → AssetForm runs validateAsset() and stops here if it returns errors
  → page calls addAsset(values) / updateAsset(id, values)
  → context dispatches { type: ACTIONS.ADD, payload }
  → assetReducer produces a NEW array (never mutates)
  → React re-renders every consumer of the context
  → navigate('/assets') shows the result
```

The reducer is the only code that constructs a stored asset. It generates the
id, stamps `createdAt`/`updatedAt`, trims strings and converts the cost from the
form's string to a number — so those invariants hold no matter which page
dispatched the action. On update it deliberately re-applies the original `id`
and `createdAt` *after* spreading the changes, so a malformed payload cannot
overwrite them.

### 3.3 Immutability

Every reducer branch returns a new array (`[asset, ...state]`, `.map`,
`.filter`). `sortAssets` copies with `[...assets]` before sorting, because
`Array.prototype.sort` mutates in place — sorting the context array directly
would change state outside the reducer and React would not re-render reliably.

---

## 4. Component catalogue

### Pages

| Component | Route | Responsibility |
|---|---|---|
| `Dashboard` | `/` | Summary tiles, status breakdown, category bar chart |
| `AssetsPage` | `/assets` | Owns search/filter/sort state; composes SearchBar + AssetTable + ConfirmDialog + Toast |
| `AddAssetPage` | `/assets/new` | Renders an empty `AssetForm`; dispatches ADD |
| `EditAssetPage` | `/assets/:id/edit` | Looks the asset up by route param; renders a pre-filled `AssetForm`; dispatches UPDATE |
| `AboutPage` | `/about` | Team members, project description, stack, course information |
| `NotFoundPage` | `*` | Fallback for unknown URLs |

### Reusable components

| Component | Props | Notes |
|---|---|---|
| `Navbar` | — | Four `NavLink`s; active item styled via the render-prop `className` |
| `AssetTable` | `assets, sortKey, sortDirection, onSort, onDelete` | Presentational. Renders its own empty state. |
| `AssetForm` | `initialValues, existingAssets, editingId, submitLabel, onSubmit, onCancel` | **One form serves both add and edit.** `editingId` is what lets an asset keep its own tag during an edit. |
| `SearchBar` | `term, filters, onTermChange, onFilterChange, onReset, resultCount, totalCount` | Fully controlled; holds no state |
| `ConfirmDialog` | `open, title, message, confirmLabel, onConfirm, onCancel` | Native `<dialog>`, so focus trapping and Escape are the browser's job |
| `StatusBadge` | `status` | Maps a status to a colour token through `STATUS_TONE` |
| `Toast` | `message, onDismiss, duration` | Auto-dismisses; clears its timer on unmount |

The add and edit pages differ by about six lines. That is the point: the form,
its validation and its error rendering exist once.

---

## 5. Feature walkthrough

### Create
`/assets/new` renders `AssetForm` with `EMPTY_ASSET`. On submit the form runs
`validateAsset(values, existingAssets)`. If the returned object has any keys the
submission stops and each message renders under its field with `role="alert"`.
Otherwise `addAsset` dispatches ADD, the reducer prepends the new record so it
is visible immediately, and the user lands on `/assets`.

### Read / display
The dashboard aggregates with `summarize()`; the assets page lists with
`AssetTable`. Costs render through `formatCurrency` (SAR, no decimals) and dates
through `formatDate` (`11 Feb 2025`), both of which return an em dash for
missing values rather than `undefined` or `NaN`.

### Update
`EditAssetPage` reads `:id` from the URL, so an edit link is shareable and
survives a refresh. If `getAsset` returns null — deleted in another tab, stale
bookmark — the page renders "Asset not found" with a way back rather than
crashing on `asset.name`. `editingId` is passed to the form so the uniqueness
check skips the asset being edited.

### Delete
Clicking Delete does not delete: it sets `pendingDelete`, which opens
`ConfirmDialog` naming the asset and its tag. Only Confirm dispatches DELETE. A
`Toast` then states what was removed.

### Search
`searchAssets` matches a case-insensitive substring across name, tag, assigned
holder, location, department, category and notes. An empty or whitespace-only
term returns everything rather than nothing.

### Filter and sort
Three dropdowns AND together, and combine with the search term. `'All'` means
"do not filter". Every column header is a button that toggles direction on a
second click; the active header carries `aria-sort` so screen readers announce
it. Blank values sort to the end in both directions, so a missing holder never
displaces a real one at the top.

---

## 6. Design decisions

| Decision | Alternative considered | Why this one |
|---|---|---|
| Context + `useReducer` | Redux Toolkit, Zustand | One entity, one collection. The reducer already gives atomic, testable transitions; a store library would add a dependency and indirection for nothing. |
| Pure helpers in `assetUtils.js` | Logic inside components | 37 of 65 tests run with no DOM, in milliseconds. Rules can be verified without guessing at rendering. |
| One `AssetForm` for add and edit | Two separate forms | Validation and error display exist once; a rule change is a one-line change. |
| Validation on submit, errors cleared on change | Validate on every keystroke | Attacking the user mid-word is hostile; clearing on correction still gives immediate positive feedback. |
| Native `<dialog>` | A hand-built modal `<div>` | Focus trapping, Escape-to-close and the backdrop come from the platform instead of from bespoke key listeners. |
| Plain CSS with custom properties | Tailwind, CSS Modules, styled-components | No build-step dependency, no class-name soup, and every token is in one place at the top of `index.css`. |
| No persistence | `localStorage` | The brief says data is a collection of objects; Part 2 supplies persistence. Adding `localStorage` now would create a second source of truth to unwind later. |
| Uncontrolled ids via `crypto.randomUUID()` | Incrementing integer | Collision-free without tracking a counter, and it matches the id shape a real backend would return. |

---

## 7. Testing architecture

| File | Kind | Tests | Covers |
|---|---|---|---|
| `assetUtils.test.js` | Unit, no DOM | 26 | Validation rules, search, filter, sort, aggregation, formatting |
| `assetReducer.test.js` | Unit, no DOM | 11 | ADD/UPDATE/DELETE/RESET, immutability, field coercion |
| `AssetForm.test.jsx` | Component | 9 | Validation surfacing, error clearing, edit pre-fill, submit/cancel |
| `AssetsPage.test.jsx` | Component | 12 | Display, search, filters, sorting, the delete confirmation flow |
| `App.test.jsx` | Integration | 7 | Menu navigation, About page, dashboard counts, end-to-end add and edit, error routes |

`renderWithProviders` wraps a component in `MemoryRouter` + `AssetProvider` with
a three-asset fixture, so integration tests exercise the real router and the
real store rather than mocks. `AssetProvider` accepts an `initialAssets` prop
purely so tests can inject that fixture — the app itself never passes it.

See `TEST_REPORT.md` for the run output.

---

## 8. Part 2 migration path

The backend work is confined to `src/context/`:

| Now | Part 2 |
|---|---|
| `useReducer(assetReducer, seedAssets)` | `useEffect` → `GET /api/assets` into state |
| `addAsset(draft)` dispatches ADD | `POST /api/assets`, then dispatch with the server's response |
| `updateAsset(id, changes)` dispatches UPDATE | `PUT /api/assets/:id` |
| `deleteAsset(id)` dispatches DELETE | `DELETE /api/assets/:id` |
| `validateAsset` runs in the browser | Same rules re-run server-side — client validation is UX, never a security boundary |

No page or component imports `seedAssets` or dispatches directly, so none of
them changes. Loading and error states become new fields on the context value;
`assetUtils.js` is untouched because the shape of an asset does not change.
