# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install     # install dependencies
npm start       # dev server (Create React App, http://localhost:3000)
npm run build   # production build into build/
npm test        # CRA test runner
```

Package manager is **npm** (`package-lock.json`); the app is built with **Create React App** (`react-scripts` 5). Switching to pnpm or Vite is not planned — only do it if the user asks.

## Project Context

This repository is a local portfolio reconstruction of the Ego **CRM** — the order-taking/customer side of the Ego textile business. Its companion, the Ego **ERP** admin panel, lives in `../ego_ERP_local` and is already restored and deployed. The shared plan, status and ERP↔CRM data contract are kept in `../CLAUDE.md` — read it first and update it when cross-app decisions are made.

The original backend no longer exists. This repository is intentionally **frontend-only**: preserve the existing functionality, UI, business logic and architecture as much as reasonably possible, and replace backend-dependent behavior with local mock data / mocked API responses. Notes about the original setup below are reference information for understanding the frontend, not a specification to restore the original environment.

### Goals

- Publish as a static demo on **GitHub Pages** at `https://lenatardis.github.io/ego_CRM_local/` (served from a sub-path — see "Sub-path hosting").
- Share part of the data with the ERP demo, which runs on the same origin (`https://lenatardis.github.io/ego_ERP_local/`). Which entities are shared is decided in `../CLAUDE.md`; keep mock data and storage in a shape that allows sharing.

## Original architecture (reference)

- `src/index.jsx` mounts `<BrowserRouter>` + Redux `<Provider>`; in production builds it silences `console.*`.
- `src/App.jsx` loads the current user (`src/hooks/useUserAuth.js`) and renders `<AuthorizedPage>` (staff CRM) when logged in, otherwise `<ClientPage>` (customer-facing pages: auth, order status by link, payment details/requisites, callback request, contacts, payment finish pages). A `?order=<hash>` query is resolved via `sendOrderHash` and redirects to `/order/:id`.
- Routing: `src/components/AuthorizedPage/AuthorizedPage.jsx` and `src/components/ClientPage/ClientPage.jsx`.
- State: Redux Toolkit (`src/store/`: `account-slice`, `main-slice`, `selectors`), hooks in `src/hooks/redux.jsx`.
- Auth tokens: `src/utils/authTokens.js`, `localStorage` keys `accessEgoToken` / `refreshEgoToken` (different from the ERP's keys).
- API layer: plain `fetch` in `src/api/*Api.js` (auth, orders, customers, products, calculator, payment, receipt, search, general, novaPoshta), base URL in `src/api/apiConfig.js`, response helpers in `src/api/apiUtils.js`.
- The original API base was `https://dev.panel.egodevelopment.pp.ua/api/v1/` — the **same backend and database as the ERP** (the ERP used `/admin_panel/api/v1` on that host and called CRM endpoints under `/api/v1`). This endpoint is no longer available and must not be used.
- Third-party integrations the original backend proxied: Nova Poshta delivery (cities, warehouses, waybills), payment providers (monobank, WayForPay, payment bills), Checkbox fiscal receipts.
- Hardcoded external links: `src/store/selectors.js` (`getBaseUrl`), the ERP link in `src/components/Navigations/MainMenu.jsx`.

Components are grouped as `AuthorizedPage/*` (Main, OrderCreate, OrderStatus, Calculator, Products, Fabrics, Storage, DeliveryNP, DeliveryUKR, Profile), `ClientPage/*` and reusable `Common/*`. Styling: SCSS modules colocated with components, global styles in `src/App.scss`.

## Mock backend approach (use this for every restored page)

Follow the approach already proven in the ERP (`../ego_ERP_local/src/mocks/`):

- `src/api/*Api.js` keep making real `fetch` calls, but to **same-origin** paths (`/api/v1/...`) instead of the dead host. Do not replace API functions with direct mock imports.
- Requests are answered in the browser by **MSW** (`src/mocks/browser.js`, started in `src/index.jsx` before render; worker file in `public/`, registered relative to the base path).
- `src/mocks/data/<entity>.js` — deterministic seed data (seeded PRNG, e.g. `mulberry32`); record shapes mirror what the components read.
- `src/mocks/handlers/<entity>.js` — MSW handlers (wrapped in an auth check), implementing the filters/pagination the API layer sends and the original response shape; registered in `src/mocks/handlers/index.js`.
- `src/mocks/db.js` — persist changed collections to `localStorage` under a CRM prefix (proposal: `ego-demo:crm:`); bump a `DATA_VERSION` when seed data or record shapes change. Data shared with the ERP follows the contract in `../CLAUDE.md`.
- Related records are stored by id and expanded into nested objects when a response is built, so edits propagate.
- Lists sort newest-created first, so a record created through a form appears at the top of page 1.
- External services (Nova Poshta, monobank, WayForPay, Checkbox) are mocked the same way — never call the real services.
- Demo login: demo users in `src/mocks/data/demoUsers.js` with a shared demo password (align with the ERP if login is shared).

## Sub-path hosting

- `package.json` `homepage` must point to the Pages URL so CRA builds asset URLs under `/ego_CRM_local/`.
- `<BrowserRouter basename={process.env.PUBLIC_URL}>`; redirects and hardcoded `/` URLs must include `process.env.PUBLIC_URL`.
- Deep links need a `404.html` SPA fallback (copy of `index.html`) in the deployed build.

## Important working rules

- Do not attempt to connect to or restore the original backend; do not request `*.egodevelopment.pp.ua` or any real third-party API.
- Do not remove existing functionality just because the backend is unavailable.
- Prefer small, targeted changes over broad rewrites; don't refactor unrelated code.
- Preserve the existing architecture and component structure unless a change is explicitly requested.
- Before making large changes, explain what will be changed and why.
- Do not invent business logic when the existing frontend code provides evidence of the original behavior.
- When replacing an API call with mock behavior, preserve the existing response shape and frontend data flow.
- Keep the project runnable with the existing npm scripts.
- Commit/push only when asked; no AI attribution trailers in commit messages.
