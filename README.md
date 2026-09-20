# AssetTrack — IT Asset Management

**SE411 Software Engineering — Project Part 1 (Fall 2026/27)**
Prince Sultan University · Instructor: Dr. Skander Turki

A React frontend for managing an organisation's IT assets — laptops, desktops,
monitors, servers, networking gear, printers, mobile devices and peripherals.
The user can **add, update, delete, search, filter, sort and display** assets.

In Part 1 the inventory is a plain collection of JavaScript objects held in
memory. There is no database and no backend; those arrive in Part 2.

---

## Team

| Name | Student ID | Responsibility |
|---|---|---|
| Homood AlBadawi | 221110514 | Frontend architecture, state management, testing |
| Malik Tariq | 221110513 | UI design, components, documentation |

---

## Quick start

Requires **Node.js 18 or newer**.

```bash
npm install     # install dependencies
npm run dev     # start the dev server on http://localhost:5173
npm test        # run the test suite (65 tests)
npm run build   # production build into dist/
npm run preview # serve the production build locally
```

---

## Features

| # | Requirement from the brief | Where it lives |
|---|---|---|
| 1 | React project | Vite + React 18, `src/` |
| 2 | Menu to navigate between features | `src/components/Navbar.jsx` + React Router in `src/App.jsx` |
| 3a | **Add** elements | `src/pages/AddAssetPage.jsx`, `src/components/AssetForm.jsx` |
| 3b | **Update** elements | `src/pages/EditAssetPage.jsx` |
| 3c | **Remove** elements | `src/pages/AssetsPage.jsx` + `ConfirmDialog` |
| 3d | **Search** elements | `src/components/SearchBar.jsx`, `searchAssets()` |
| 3e | **Display** elements | `src/components/AssetTable.jsx`, `src/pages/Dashboard.jsx` |
| 4 | About page with team names and IDs | `src/pages/AboutPage.jsx`, linked from the menu |

Beyond the minimum:

- Three filter dropdowns (category, status, department) that combine with search.
- Click-to-sort on every table column, ascending and descending.
- Form validation: required fields, tag format, duplicate-tag detection, numeric
  and date range checks.
- Confirmation dialog before any delete, plus a toast confirming it happened.
- Dashboard with totals, a status breakdown and a category bar chart.
- Empty states and a 404 route.
- Responsive layout and accessible markup (labelled controls, `aria-sort`,
  `role="status"` live regions).

---

## Pages

| Route | Page | Purpose |
|---|---|---|
| `/` | Dashboard | Counts by status and category, total purchase value |
| `/assets` | Assets | Search, filter, sort, delete |
| `/assets/new` | Add Asset | Create a new asset |
| `/assets/:id/edit` | Edit Asset | Update an existing asset |
| `/about` | About | Team members and project information |
| `*` | Not Found | Fallback for unknown routes |

---

## Documentation

| Document | Contents |
|---|---|
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Functional and non-functional requirements, user stories, traceability matrix |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Architecture, technology stack, data model, feature walkthrough |
| [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md) | Test strategy, the 65 test cases, run output |
| [`docs/CODE_REVIEW.md`](docs/CODE_REVIEW.md) | Security, performance, code quality and reuse review |
| [`docs/AI_USAGE.md`](docs/AI_USAGE.md) | How AI tooling was used at each stage, as the brief requires |

---

## Technology stack

| Layer | Choice | Why |
|---|---|---|
| UI library | React 18 | Required by the brief; hooks-based function components |
| Build tool | Vite 5 | Fast dev server with HMR, small production bundle |
| Routing | React Router 6 | Declarative routes for the navigation menu |
| State | Context + `useReducer` | Enough for one collection; no external dependency |
| Testing | Vitest 2 + React Testing Library 16 | Shares Vite's config; tests behaviour, not implementation |
| Styling | Plain CSS with custom properties | No framework dependency; design tokens in `src/index.css` |

---

## Project structure

```
se411-asset-manager/
├── docs/                      Documentation (see table above)
├── index.html                 Vite entry point
├── package.json
├── vite.config.js             Build + Vitest configuration
└── src/
    ├── main.jsx               Root render, Router + AssetProvider
    ├── App.jsx                Layout shell and route table
    ├── index.css              Design tokens and all styling
    ├── components/            Navbar, AssetTable, AssetForm, SearchBar,
    │                          ConfirmDialog, StatusBadge, Toast
    ├── context/               AssetContext.jsx, assetReducer.js
    ├── data/                  seedAssets.js, assetOptions.js
    ├── pages/                 Dashboard, Assets, Add, Edit, About, NotFound
    ├── tests/                 5 test files, 65 tests
    └── utils/                 assetUtils.js (validation, search, sort, format)
```

---

## Part 2 readiness

Every read and write goes through the four functions exposed by `AssetContext`
(`addAsset`, `updateAsset`, `deleteAsset`, `getAsset`). Replacing the in-memory
reducer with `fetch` calls to a REST API changes only `src/context/`; no page or
component imports the data directly.

---

## Licence

Coursework submission for SE411 at Prince Sultan University.
