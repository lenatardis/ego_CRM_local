# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install     # install dependencies
npm start       # dev server (Create React App, http://localhost:3000)
npm run build   # production build into build/
npm test        # CRA test runner
npm run check:shared        # shared seed / catalog / media / scripts identical with ../ego_ERP_local
npm run fetch:np-directory  # refresh the Nova Poshta directory snapshot (manual, calls NP's public API)
npm run same-origin         # ERP + CRM on one origin, http://localhost:8080/ (see the workspace CLAUDE.md, "Both apps on one origin")
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

## Survey findings (step 3 of `../CLAUDE.md`)

Routes — staff (`AuthorizedPage.jsx`): `/*` Main (order list, tabs, search), `/fabrics/[:id]`, `/storage/[:id]`, `/order/:id/*` (create/edit order), `/products/:id/*`, `/deliveryNP/:id/*`, `/deliveryUKR/:id/*`, `/order_status/:id/*`, `/calculator/:orderId[/:id]/*`, `/profile/`, `/product/*` (public fabric/product card, `UserPage/Fabric.jsx`). Client (`ClientPage.jsx`): `/*` Auth, `/orders/*?order=<hash>` order status, `/contacts/`, `/details_payment`, `/callback/`, `/product/*`, `/{monobank,wayforpay}/finish-order/*`. Only `sessionStorage` key besides tokens: `client_order_hash`.

Endpoints (all relative to `baseUrl`, `src/api/apiConfig.js`; "public" = sent without a token):

| Area | Endpoints |
|---|---|
| auth | `POST users/token/` {username,password}→{access,refresh} or {user\|detail: error}; `POST users/token/refresh/`; `GET users/` (current user: `id, first_name, photo, url`, …); `PATCH users/:id/` {password} |
| orders | `GET orders/?page&manager&is_general&…` (paginated `{count,results}`); `GET orders/recent-views/?manager=`; `POST orders/` (create **and** update — body has `id` when updating); `GET/DELETE orders/:id/`; `POST orders/duplicate/` {order_id}; `GET orders/sub-orders/?…`; `GET orders/source/`; public: `GET orders/free-access/?order_hash=` → `{order:{id,…}}`, `POST orders/free-access-customer/` {order_id, phone_last_digits} |
| customers | `POST customers/` {order_id, …fields} |
| products | `GET products/warehouse-items/?page_size=10&source&…`, public `GET products/warehouse-items/:id/`; `GET products/fabric/?…`, public `GET products/fabric/:id/`; `GET/POST products/order-product/` (`?order=` / {order, warehouse_item}), `DELETE products/order-product/:id/` |
| calculator | `GET calculator/kit/templates/size/[?order_product_id]`; `GET calculator/kit/templates/?fabric_id&kit_template_size_id[&source_id]`; `GET calculator/kit/components/additional/?…`; `GET calculator/kit/components/type_templates/`; `POST calculator/kit/`; `PATCH calculator/kit/:id/`; `POST calculator/kit/split/`; `DELETE calculator/kit/components/:id/?kit_id=`; (`GET calculator/templates/` — unused) |
| payments | `GET payments/?order_id=`; `POST payments/` {order_id, …} (create/update); `GET/POST payments_types/payment_bill/[?payment_id]`, `PATCH/DELETE payments_types/payment_bill/:id/`; public: `POST payments_types/{monobank,wayforpay}/` {payment_bill_id}, `POST payments_types/:type/:id/successful/` |
| receipts | public `POST checkbox/receipt/` {payment_id, payment_type}; public `POST receipt/` (multipart, customer's transfer screenshot); `POST receipt/approved/` (multipart, staff) |
| delivery | `GET/POST delivery/nova_poshta/item/` (`?order_id=` / {order_id, …}); `POST delivery/nova_poshta/waybill/` and `…/waybill/update/` {nova_poshta_id}; `GET delivery/nova_poshta/waybill/:id/pdf/`; `DELETE delivery/nova_poshta/:id/` (unused); `GET delivery/nova_poshta/location/city/?city=`, `…/location/warehouse/?city_ref&find_by_string`. Ukrposhta pages have no API of their own — they reuse `getCities` and save through `setDeliverNP` |
| search | `GET search/?query&is_order&is_fabric&is_warehouse_item&page` → orders only (see "Global search as mocked") |
| general (public) | `GET general/work_schedule/`, `general/company/`, `general/call_order/reason/`, `general/payment_details/?order=`; `POST general/call_order/` {name, phone, reason} |

Record shapes the components read (to be detailed per page while restoring):
- Order list item: `id, created, status, is_general, is_immediate, is_favourite, general_order{id}, sub_orders_count, kit_count, warehouse_item_count, source{id,name}, manager{first_name,last_name,middle_name,username}, customer{id,first_name,last_name,middle_name,username,phone,url}, payment{amount, final_amount, discount_amount, discount_type, status}`.
- Payment bill: `id, type (IBAN|ONLINE|TAX), method (PREPAYMENT|FULL|POSTPAID), status (PAY_WAIT|PAID|NOT_PAID), prepayment_amount, prepayment_datetime, receipt_url, customer_receipt, customer_receipt_approved` — same fields as the ERP's `paymentBills`.
- Order statuses seen: `NEW`, `OPENED`; fabric/template statuses `ACTIVE`, `DEPRECATED`.

Orders as mocked (steps 6.3–6.4, `src/mocks/data/orders.js` + `handlers/{orders,customers,payments,delivery}.js`):
- Shared collections `orders`, `customers`, `paymentBills` (keys `ego-demo:shared:<name>`), seed shape from `shared/seed.js`; `serializeOrder` expands them into the list/detail shape above plus `modified, comment, order_hash, general_order{id,status,payment}` and `payment.already_paid_amount` (sum of the order's `PAID` bills). `warehouse_item_count` / `kit_count` count the order's cart (`orderProducts`); `url` is the customer link `<origin><PUBLIC_URL>/orders/?order=<order_hash>` (the client status route; a logged-in manager opening it is sent to `/order/:id` by `App.jsx`). Until step 6.10 it was `/?order=`, which only opened the login page for a customer.
- `GET orders/` and `orders/recent-views/` answer `{orders, total_pages}` (not DRF `{count, results}`; `Main.jsx` reads these), page size 10; `GET orders/sub-orders/` answers a plain array.
- A new order (`POST orders/` without `id`) has `customer: null, payment: null`; `OrderWrapper.jsx` then creates both through `POST customers/` / `POST payments/`. New payment defaults: `status 'NONE'`, `discount_type 'NONE'`, amounts null. Every `updateOrder` call also sends `manager` (the current user), so editing an order re-assigns it — original frontend behaviour, kept.
- Validation the UI shows: unknown `source` → `{source: ['Invalid pk "…" - object does not exist.']}` (Order.jsx maps it to its suborder message); phone not `+380XXXXXXXXX` → `{phone: [message]}`.
- Duplicate copies customer, source, comment, urgency and payment totals (status `NONE`), manager = current user. Duplicate also copies the cart. Delete cascades to suborders, their bills and CRM-private data keyed by the order (recent views, cart, NP item) (new ids are max + 1, so ids can be reused).
- Sources (step 7 / 6a, workspace `CLAUDE.md`): `src/mocks/data/sources.js` reads the ERP-owned shared `sources`; `data/catalog.js` `priceFor` passes them to the shared pricing, so prices follow a source's current pricelist. A source deleted in the ERP isn't offered and can't be set on another order; orders that have it keep it.
- Production (step 7.5, workspace `CLAUDE.md`): `src/mocks/data/production.js` reads the ERP-owned shared `production` collection; cart lines get `manufacturing: {id, status}` (status as the ERP's Ukrainian label), an order with a production record can't be deleted, a cart line in production can't be removed. Seed orders in production have exactly their production item as cart (`SEED_PRODUCTION`).
- Delete guard (step 7.4, workspace `CLAUDE.md`): `DELETE orders/:id/` → 400 `{detail}` when any bill of the order or its suborders is `PAID` (`deleteBlocker`; the production condition comes in 7.5), `DELETE payments_types/payment_bill/:id/` → 400 for a paid bill. Changed with the user's OK: `Main/Order/Order.jsx` (order + suborder) and `Products/Products.jsx` (suborder) show the refusal in a popup — the original code ignored any non-204 silently.
- CRM-private: `recentViews` (`{[managerId]: [orderId]}`, max 10, recorded on `GET orders/:id/`, seeded with each manager's 6 newest orders). Delivery items: see "Delivery as mocked".
- Original-code quirk seen while testing: "Дублювати замовлення" navigates to the original order, not the copy (`Order.onEditOrder` ignores the id `OrderMenu` passes) — left as is.

Delivery as mocked (step 6.8, `src/mocks/data/novaPoshta.js` + `handlers/delivery.js`):
- Nova Poshta directory: a snapshot of the real one (`src/mocks/data/npDirectory.json`, ~560 KB) — 30 cities with their real refs and all their working branches (1668, cargo ones included, no parcel lockers; real addresses, postal codes, weight limits, `null` = no limit). Made with `npm run fetch:np-directory` (`scripts/fetch-np-directory.mjs`, NP's public JSON API, no key) — run by hand to refresh; the app never calls Nova Poshta. Loaded lazily (`loadDirectory()`, a separate ~63 KB gzipped chunk) by the delivery handlers and the order-delete cascade, so the first page load doesn't carry it (main bundle stays ~435 KB gzipped). `location/city/?city=` matches the start of the name or of a word; `location/warehouse/?city_ref&find_by_string` by number or address text.
- Delivery item (`npItems`, CRM-private) stored in the nested shape `DeliveryNP.jsx` reads (`receiver.delivery_receiver.*`, `receiver.city_identifier / address / address_identifier / max_weight_allowed / department_number`, `specified_weight`, `delivery.{payer, payment_method, estimate_order_price, estimate_delivery_price, ttn, comment}`, `delivery_date`, `with_backward_delivery`, `backward_amount`); the flat POST fields are mapped onto it (`paid_by_the_sender` → `payer` `Sender` / `Recipient`). Keyed by the general order. `postpaid_amount` is computed: declared value − paid bills of the order and its suborders.
- A new item starts from the order's customer and its total (+ suborders); the Products / order-status pages keep `estimate_order_price` current themselves. Weight before a branch, or above the branch limit → 400 `{errors: {specified_weight}}` (the messages `NovaPoshtaWeight.jsx` maps).
- Waybill: required fields (names, phone, city, branch, weight, declared value > 0) → 400 `{errors}`; TTN `2045…` (14 digits), shipping estimate = weight tariff (80 / 110 / 160 UAH …) + 0.5% of declared value + cash-on-delivery fee (20 UAH + 2%); update keeps the TTN and recalculates. The "PDF" is a printable HTML waybill handed over as a blob URL (a real PDF would need an embedded font for Cyrillic).
- Seed: seed orders that are `SHIPMENT_READY` / `DELIVERED` have a filled item with a waybill (receiver = customer, weight from the cart, cash on delivery when the order is postpaid and unpaid).
- Ukrposhta: the original page is an unfinished stub (submit only logs, nothing saved); its city / region lookups use `location/city/` (`cities`), area / index read `areas` / `indexes`, which the city endpoint never had — left as is.

Order status as mocked (step 6.9, `handlers/payments.js`):
- `GET payments/?order_id=` → `[payment]` (same shape as `POST payments/`, with `already_paid_amount`). Payment status (`IN_PROG` / `PAY_WAIT` / `NOT_PAID`), discount and type are saved through the existing `POST payments/` upsert; the page derives the type from the bills itself (`IBAN`→`REQ`, `ONLINE`, `TAX`→`POSTPAID`).
- Bills are the shared `paymentBills` (seed shape, keyed by `order_id`); the API addresses them by the order's payment id (`?payment_id=`, body `payment`). List oldest first (bill №1 = first). Responses add `payment` (payment id) and `order`, resolve `customer_receipt` with `resolveDemoAsset`, and send `prepayment_amount` as a **number**: `Bill.jsx` adds it to the available sum (a string would concatenate).
- New bill: `{type: null, method, status: 'PAY_WAIT', prepayment_amount (null for №1, the rest for the POSTPAID №2), prepayment_datetime: null, comment: null}`, the other seed fields null. `comment` is a new field on shared bills (the ERP ignores it). PATCH stores `type / method / status / comment / prepayment_amount / prepayment_datetime` (sent as a UTC ISO string, stored in the seed's local `toIso` format). DELETE → 204. The page itself enforces "max 2 bills", "edit only while `IN_PROG`" and the amount limit; the mock doesn't re-check.
- `POST receipt/approved/` (multipart `payment` = bill id, `is_approved`): only for `customer_receipt_approved === 'IN_PROC'`, otherwise 400 (as in the ERP's "CRM платежі"). Approve → `APPROVED`, bill `PAID` with `paid_datetime`; then the order's payment becomes `PAID` when all its bills are paid and cover `final_amount` (the seed's rule). Decline → `DECLINED`, an unpaid bill becomes `NOT_PAID` (the seed pairs `DECLINED` with `NOT_PAID`).
- Waybill print (`OrderActions` → `waybill/:id/pdf/`) and "Скопіювати все" (client-side) needed nothing new.
- Fixed (2026-10-23, with the user's go-ahead): `Bill.jsx` showed the "Рахунок підтверджено" bar for any receipt link, so an unchecked or declined customer screenshot read as confirmed next to "Підтвердити оплату". Now it shows for a fiscal receipt (`receipt_url`) or an `APPROVED` customer receipt.
- Original UI, left as is: the payment status picker has no `PAID` entry, so a paid order shows the empty "Статус оплати"; in a ~900 px wide window the fixed bottom menu overlaps the action buttons.

Client pages as mocked (step 6.10, `handlers/{client,general}.js` + `data/general.js`; all public, registered **first** in `handlers/index.js` because `orders/free-access/` would otherwise match the auth-only `orders/:id/`):
- `GET orders/free-access/?order_hash=` → `{order (as GET orders/:id/), general_order, payment, products: [cart warehouse_item], kits: [cart kit], payment_bills (oldest first), nova_poshta_delivery (the general order's item or null), ukr_poshta_delivery: null}`; unknown hash → 404 (Status.jsx shows "Замовлення не знайдено").
- `POST orders/free-access-customer/` {order_id, phone_last_digits}: matched against the NP receiver's phone, else the customer's; wrong → 400 `{errors}` (red input). Match → `{customer, nova_poshta_delivery}`; an order without an NP item gets an unsaved empty one, because `DetailsInput.jsx` shows nothing without it (orders created in the CRM always get an item).
- `POST receipt/` (multipart `payment`, `receipt`): only an `IBAN` bill that isn't paid and has no receipt, or a `DECLINED` one; PDF/JPG/PNG/GIF ≤ 5 MB, else 400. The file isn't kept: the bill gets the sample `demo/customer-receipt.svg` (as the seed), `customer_receipt_approved: 'IN_PROC'`, and a `NOT_PAID` bill goes back to `PAY_WAIT`. The manager then approves it on the order-status page (step 6.9).
- Online payment, no real service: `POST payments_types/{monobank,wayforpay}/` {payment_bill_id} (an `ONLINE`, `PAY_WAIT` bill with an amount, else 400) stores `provider_payment {type, order_id: invoice id, invoice_url}` and answers `{invoice_id, invoice_url}`, where `invoice_url` is the app's own `/<provider>/finish-order/?invoice_id=…`. `POST payments_types/:provider/:invoice_id/successful/` marks the bill `PAID` (+ the order `PAID` by the 6.9 rule; repeating it shows the same result), answers `{id, payment: bill + free_access_order_url}`; unknown invoice → 400 `{errors}` (error finish page). `POST checkbox/receipt/` {payment_id = bill id} gives a paid bill `receipt_id` + `receipt_url` `https://checkbox.ua/` (the seed's fiscal-receipt link).
- `general/company/`, `work_schedule/`, `call_order/reason/`, `payment_details/` serve made-up demo values (`data/general.js`: no real phone, IBAN or tax code). `POST general/call_order/` validates name / `+380XXXXXXXXX` / known reasons (400 `{errors}`) and stores the request CRM-private (`callOrders`); no staff page lists them in the original.
- Changed (2026-10-23, at the user's request): the static `/details_payment` page (`DetailsContent.jsx`) hardcoded requisites with a real person's name and account numbers (not from the API); they are now the same demo values as `data/general.js`. Layout and labels unchanged (including the original's second "Код ЄДРПОУ" label on the 20-digit number).
- Original UI, left as is: the callback form gives no success message (it just clears).

Global search as mocked (step 6.11, `handlers/search.js`): `GET search/?query&is_order&is_fabric&is_warehouse_item&page` → `{orders: {items, current_page, total_pages}, filter}`. The original page only ever shows orders (results replace the order list), so the three toggles are read as *where* the query is matched: "Замовлення" = the order's number, customer name / username / phone (by digits — the query is sent unencoded, so a typed `+` arrives as a space), comment, source; "Тканини" = its kits' fabric code, fabric type ("сатин") and kit name; "Склад" = the names of stock items in its cart. Every word must match; newest first, 10 per page; `filter` echoes the toggles (the page draws the buttons from it, and hides them all if all three are off — original UI).

Catalog, cart and calculator as mocked (steps 6.5–6.7, `src/mocks/data/{catalog,orderProducts}.js` + `handlers/{products,calculator}.js`):
- Catalog data comes from `src/mocks/shared/catalog/` (the ERP's seed modules, identical in both repos — workspace `CLAUDE.md`, "Cross-app contract"); demo media in `public/demo/media/`. Read-only; prices via `priceFor(owner, id, sourceId)` (`shared/catalog/pricing.js`: source pricelist → default list → none).
- Response shapes: fabrics `{fabrics, total_pages, fabric_types, tags, order_by}`; warehouse items `{items, total_pages, categories}` with `sizes[].colors[]` (`name` is a CSS color, `price` = `{sell_price}` or `null`); public cards take plain number prices and only list priced entries; list filters arrive comma-separated (`type=1,3`).
- Calculator: missing prices are `0` (the frontend disables zero-priced kits / components / options); kit component `image` is a string in kits, an array in the additional list and split groups; fabric consumption is posted in cm, returned in m. `kit/templates/` answers 404 when the fabric's type has no kits (→ "За вибраними даними комплекту не існує").
- `orderProducts` (CRM-private): `{id, order_id, created, warehouse_item | kit}`; the kit id is the order-product id. The server prices a kit on save (template price, or component sum when split, + added components + options); an unpriced part → 400 `{errors: {component_price}}`. Fabric with no remainder → 404.
- Seed carts: `SEED_ORDER_PRODUCTS` from the shared seed, with real prices for each order's source; the seed orders' amounts, bills and bank lines are derived from them (workspace `CLAUDE.md`, "Money follows the carts"). `Products.jsx` recomputes and saves the amount from the cart on every visit, so the two must agree — they do, and re-saving a seed kit unchanged keeps its price.
- Fixed (2026-10-23, with the user's go-ahead): `Calculator.jsx` built the displayed kit price as "saved price − options it started with + options selected now", which broke once a kit was split (and paired added components' options with the wrong form entries). It now adds up the parts in every mode — template `starting_price` (or the split components' prices) + added components + options selected now — the same sum the mock saves.

Other hardcoded external URLs: `getBaseUrl` (`src/store/selectors.js`; only used for the "copy link" buttons in `FabricItem` / `StorageItem` → now the demo's own `<origin><PUBLIC_URL>`), ERP link in `MainMenu.jsx:466`, Nova Poshta tracking link in `ClientPage/Status/InvoiceInfo/Input/SearchInput.jsx` (a public tracking page opened in a new tab — fine to keep).

Quirks of the original code that affect mocking (don't "fix" unless asked):
- 401 detection mostly checks `response.statusText === 'Unauthorized'`, some modules `response.status === 401` — mock 401s must set both.
- `getSearchParams` drops falsy values (`false`, `0`), so e.g. `is_general=false` is never sent.
- Retry-after-refresh bugs: `getSuborders` retries `getOrders`, `getProductDetail` retries `getStorageProducts`, `updateUserInfo` calls itself without args, `approveReceipt` doesn't return the retry.
- `POST orders/`, `POST customers/`, `POST payments/`, `POST delivery/nova_poshta/item/` are upserts keyed by order.
- `Products.jsx` compares the cart total (number) with `payment.amount` (string), so it re-saves the payment on every visit — intentional per the user: a last-minute fix for a 0 that appeared in a freshly created suborder. Keep it.
- `Profile.jsx` calls `updateUserInfo(accessToken, user.id)` without the password, so the password change never sends it; the mock just answers with the user.
- `npm run build` must run with `CI=false` on CI: CRA treats the existing lint warnings as errors when `CI=true`.

## Mock backend approach (use this for every restored page)

Follow the approach already proven in the ERP (`../ego_ERP_local/src/mocks/`):

- `src/api/*Api.js` keep making real `fetch` calls, but to **same-origin** paths (`/api/v1/...`) instead of the dead host. Do not replace API functions with direct mock imports.
- Requests are answered in the browser by **MSW 2** (`msw@2.15`, devDependency; `src/mocks/browser.js`, started in `src/index.jsx` before render; worker `public/mockServiceWorker.js`, registered under `process.env.PUBLIC_URL`). Not MSW 3 like the ERP: v3 declares a `typescript >= 5` peer that conflicts with CRA 5's TypeScript 4.9; the handler API (`http`, `HttpResponse`) is the same. After upgrading msw, refresh the worker with `npx msw init public`.
- Handler helpers in `src/mocks/handlers/utils.js`: `API = '/api/v1'`, `withAuth` (passes the demo `user` to the resolver), `withLatency` for public endpoints, `unauthorized()` (401 **with** `statusText: 'Unauthorized'`), `notFound()`, `paginate()` → `{count, next, previous, results}`.
- `src/mocks/data/<entity>.js` — deterministic seed data (seeded PRNG, e.g. `mulberry32`); record shapes mirror what the components read.
- `src/mocks/handlers/<entity>.js` — MSW handlers (wrapped in an auth check), implementing the filters/pagination the API layer sends and the original response shape; registered in `src/mocks/handlers/index.js`.
- `src/mocks/db.js` — CRM-private collections: `getCollection` / `saveCollection` under `ego-demo:crm:` (bump `DATA_VERSION`). Collections shared with the ERP (orders, customers, payment bills — contract in `../CLAUDE.md`): `getSharedCollection` / `saveSharedCollection(name, items)` under `ego-demo:shared:`, re-read on every access because the ERP may change them in another tab (bump `SHARED_DATA_VERSION` together with the ERP).
- `src/mocks/shared/seed.js` — seed of the data shared with the ERP (orders, customers, payment bills, managers, sources); **identical copy in both repos**, don't edit it here without copying it to the ERP; run `npm run check:shared`. Record shapes and rules: `../CLAUDE.md` → "Cross-app contract".
- Related records are stored by id and expanded into nested objects when a response is built, so edits propagate.
- Lists sort newest-created first, so a record created through a form appears at the top of page 1.
- External services (Nova Poshta, monobank, WayForPay, Checkbox) are mocked the same way — never call the real services.
- Demo login: managers in `src/mocks/data/demoUsers.js` (ids 21–24, `demo_manager`…`demo_manager4`, password `DemoPass123` as in the ERP; names = the managers on the ERP's CRM orders). Tokens `demo-crm-{access,refresh}-<id>`. The login form has a demo-manager picker that fills in the credentials (like the ERP's demo-role picker).

## Deployment

Live at https://lenatardis.github.io/ego_CRM_local/ — `.github/workflows/deploy.yml` builds and deploys on every push to `master` (npm ci, `npm run build` with `CI=false`, `404.html` = `index.html` for deep links, `actions/deploy-pages`). So every push to `master` changes the live demo; bump `DATA_VERSION` / `SHARED_DATA_VERSION` when stored demo data would no longer fit.

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
