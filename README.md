# AssetTrack — IT Asset Management

**SE411 Software Engineering — Project (Fall 2026/27)**
Prince Sultan University · Instructor: Dr. Skander Turki

A full-stack application for managing an organisation's IT assets — laptops,
desktops, monitors, servers, networking gear, printers, mobile devices and
peripherals.

- **Part 1** — a React frontend: add, update, delete, search, filter, sort and display assets.
- **Part 2** — a **Java Spring Boot server** with a REST API and an H2 database,
  integrated with the React frontend, with a **JUnit 5 + Mockito** test suite.

---

## Team

| Name | Student ID |
|---|---|
| Homood AlBadawi | 221110514 |
| Malik Tariq | 221110513 |

---

## Running the application

Two processes: the Spring backend on port **3000** and the React frontend on port **5173**.
Start the backend first.

**Requirements:** Java 21 (or newer) and Node.js 18 (or newer). Maven is not needed —
the backend ships the Maven wrapper (`mvnw`).

### 1. Backend (Spring Boot)

```bash
cd backend/assets
./mvnw spring-boot:run
```

Wait for `Tomcat started on port 3000`. The API is then at
`http://localhost:3000/api/v1/assets`.

### 2. Frontend (React)

In a second terminal, from the repository root:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Tests

```bash
cd backend/assets
./mvnw test        # 22 backend tests — JUnit 5 + Mockito
```

```bash
npm test           # 73 frontend tests — Vitest + React Testing Library
```

---

## Part 2 requirements

| # | Requirement from the brief | Where it is |
|---|---|---|
| 1 | The Java application is a Spring server | `backend/assets` — Spring Boot 4.1, Java 21 |
| 2 | Add an element | `POST /api/v1/assets` · **Add Asset** page |
| 3 | Search for an element by id | `GET /api/v1/assets/{id}` · **Find by ID** box on the Assets page |
| 4 | Search all elements, display paginated results | `GET /api/v1/assets?page=&size=&sort=` · table with First / Previous / Next / Last and 5 / 10 / 20 per page |
| 5 | Update an element | `PUT /api/v1/assets/{id}` · **Edit** page |
| 6 | Unit test suite for the backend (JUnit + Mockito) | `backend/assets/src/test` — 22 tests |

Delete (`DELETE /api/v1/assets/{id}`) is also implemented, because the Part 1 frontend has it.

---

## REST API

Base URL: `http://localhost:3000/api/v1/assets` · all bodies are JSON.

| Method | Route | Description | Request body | Success | Errors |
|---|---|---|---|---|---|
| GET | `/api/v1/assets` | List assets, paginated and sorted: `?page=0&size=10&sort=name,asc` | — | 200 · `Page<Asset>` | — |
| GET | `/api/v1/assets/{id}` | Find one asset by its id | — | 200 · `Asset` | 404 |
| POST | `/api/v1/assets` | Add a new asset (id must be empty) | `Asset` | 201 · `Location` header | 400, 409 |
| PUT | `/api/v1/assets/{id}` | Update an existing asset | `Asset` | 204 | 400, 404, 409 |
| DELETE | `/api/v1/assets/{id}` | Delete an asset | — | 204 | 404 |

- **400** — the body fails validation (`@Valid`)
- **404** — no asset with that id (`ObjectNotFoundException`)
- **409** — the asset tag is already used (the `tag` column is `UNIQUE`)

The list returns a Spring `Page`: `content`, `number`, `size`, `totalElements`,
`totalPages`. Default page size is 10.

---

## Architecture

```
React frontend (Vite, :5173)                      Spring Boot backend (:3000)
┌──────────────────────────────┐                  ┌──────────────────────────────────┐
│ Pages and components         │                  │ AssetController  @RestController │
│        ↓                     │   HTTP + JSON    │        ↓                         │
│ AssetContext  (shared state) │ ───────────────► │ AssetService     business rules  │
│        ↓                     │ ◄─────────────── │        ↓                         │
│ api/assetApi.js  (fetch)     │  @CrossOrigin    │ AssetRepository  Spring Data JDBC│
└──────────────────────────────┘                  │        ↓                         │
                                                  │ H2 database  schema.sql/data.sql │
                                                  └──────────────────────────────────┘
```

### Backend — `backend/assets/src/main/java/edu/psu/se411/assets/`

| Package | Class | Role |
|---|---|---|
| `model` | `Asset` | Java record with validation annotations (`@NotBlank`, `@Size`, `@Pattern`, `@PastOrPresent`, `@PositiveOrZero`) |
| `repository` | `AssetRepository` | Extends `CrudRepository` and `PagingAndSortingRepository`; Spring generates the implementation |
| `service` | `AssetService` | Business logic; throws `ObjectNotFoundException` for an unknown id |
| `controller` | `AssetController` | REST endpoints; maps exceptions to 404 / 409; `@CrossOrigin` for the frontend |
| `exception` | `ObjectNotFoundException` | Custom unchecked exception |

`src/main/resources`: `application.properties` (port 3000, default page size 10),
`schema.sql` (the `asset` table), `data.sql` (10 sample assets). H2 runs in memory,
so the data resets on every restart.

### Frontend — `src/`

| Path | Role |
|---|---|
| `api/assetApi.js` | The only module that makes HTTP requests; turns error statuses into `ApiError` |
| `context/AssetContext.jsx` | Shares the API calls with every page; triggers a reload after each write |
| `pages/` | Dashboard, Assets (list, pagination, find by id), Add, Edit, About |
| `components/` | Navbar, AssetTable, AssetForm, SearchBar, Pagination, FindById, ConfirmDialog, Toast |

---

## Tests

| Suite | Tool | Tests | What it covers |
|---|---|---|---|
| `AssetServiceTest` | JUnit 5 + Mockito (`@Mock`, `@InjectMocks`) | 9 | Every service method, with the repository mocked |
| `AssetControllerTest` | `@WebMvcTest` + `@MockitoBean` + MockMvc | 12 | Every route, including 400 and 404 responses |
| `AssetsApplicationTests` | `@SpringBootTest` | 1 | The application context starts |
| Frontend | Vitest + React Testing Library | 73 | Pages, form, pagination, find by id, HTTP client |

---

## Technology stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 4.1, Spring Web MVC, Spring Data JDBC, Bean Validation |
| Database | H2 (in memory) |
| Backend tests | JUnit 5, Mockito, Spring MockMvc |
| Frontend | React 18, Vite 5, React Router 6, plain CSS |
| Frontend tests | Vitest, React Testing Library |

---

## Part 1 documentation

The Part 1 documents are in [`docs/`](docs/): requirements, architecture, test
report, code review and AI usage. They describe the frontend as it was in Part 1,
when the data was an in-memory collection.

---

## Licence

Coursework submission for SE411 at Prince Sultan University.
