# Roadmap: vita-wallet-challenge

## Overview

This roadmap delivers a fullstack multi-currency wallet with a functional exchange engine as its core. The journey starts with project scaffolding and backend foundation, then builds authentication (the gate to everything), then the exchange engine (the core value), then the frontend that consumes it all, and finally documentation for delivery. Tests are integrated into every feature phase, not deferred.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Scaffolding & Foundation** - Rails API-only + Vite React TS project setup, DB schema, seeds, test infrastructure (completed 2026-04-14)
- [x] **Phase 2: Authentication** - Backend auth (register, login, JWT) + frontend auth (login page, session persistence, protected routes) (completed 2026-04-14)
- [ ] **Phase 3: Wallets & Crypto Prices** - Balance endpoints, price service with external API client/stub/cache, frontend dashboard
- [ ] **Phase 4: Exchange Engine** - Core exchange logic with BigDecimal precision, atomic transactions, state machine, and full test coverage
- [ ] **Phase 5: Transaction History & Exchange UI** - History endpoints with pagination/filters, exchange page UI, history page UI
- [ ] **Phase 6: Coverage, Polish & Documentation** - Coverage thresholds enforced, remaining edge-case tests, README, video

## Phase Details

### Phase 1: Project Scaffolding & Foundation
**Goal**: Both repos are initialized with correct tooling, DB schema exists with seed data, and test infrastructure is configured so all subsequent phases can write features and tests immediately
**Depends on**: Nothing (first phase)
**Requirements**: ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-07, ARCH-08, ARCH-09, ARCH-10, ARCH-11, ARCH-12, ARCH-13, ARCH-14, BE-01, BE-04, WALL-01, WALL-03, WALL-04, TEST-08, TEST-17
**Success Criteria** (what must be TRUE):
  1. Running `rails s` in /backend starts an API-only Rails server connected to PostgreSQL with migrations applied
  2. Running `npm run dev` in /frontend starts a Vite dev server with TypeScript strict mode, ESLint no-any rule active, and TanStack Query + Zod installed
  3. Frontend directory structure exists: `src/pages/`, `src/components/`, `src/hooks/`, `src/services/` with a typed HTTP client and AuthContext shell
  4. Database has `users`, `wallets`, and `transactions` tables with correct decimal precision columns, and seeds create demo users with balances in all 5 currencies
  5. RSpec + SimpleCov and Vitest + v8 coverage are configured with 90% thresholds (a sample test passes in each repo)
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Rails API-only backend setup, DB schema (users/wallets/transactions), seeds, serializer base
- [x] 01-02-PLAN.md — Vite React TS frontend setup with antd, directory structure, typed HTTP client, AuthContext shell
- [x] 01-03-PLAN.md — Test infrastructure: RSpec + SimpleCov (backend), Vitest + v8 coverage (frontend), sample tests

### Phase 2: Authentication
**Goal**: Users can securely register, log in, and maintain sessions; all subsequent endpoints can be protected by JWT middleware
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, AUTH-06, BE-02, BE-03, BE-06, UI-01, UI-02, UI-09, UI-10, ARCH-05, ARCH-06, TEST-02, TEST-05, TEST-06, TEST-10, TEST-13, TEST-16, TEST-18
**Success Criteria** (what must be TRUE):
  1. POST /auth/register creates a user with bcrypt-hashed password and returns a JWT; POST /auth/login with valid credentials returns a JWT
  2. Requests to protected endpoints without a token (or with an expired/invalid token) return 401 Unauthorized
  3. Frontend login page submits credentials, stores JWT in secure storage, and the user remains logged in after page refresh
  4. Frontend redirects unauthenticated users to login; logged-in users can log out and the token is cleared
  5. RSpec covers auth service (valid/invalid credentials, JWT generation/expiration) and request specs cover 401/200 flows; frontend tests cover login hook, auth context, and protected route redirect
**Plans**: 2 plans

Plans:
- [x] 02-01-PLAN.md — Backend auth: JwtService, AuthService, AuthController (register/login/me), JWT middleware, RSpec tests
- [x] 02-02-PLAN.md — Frontend auth: Login page with antd Form, AuthContext real implementation, session persistence, protected routes, Vitest tests

### Phase 3: Wallets & Crypto Prices
**Goal**: Authenticated users can view their multi-currency balances and the system can fetch/cache/stub crypto prices from the external API
**Depends on**: Phase 2
**Requirements**: WALL-02, PRIC-01, PRIC-02, PRIC-03, PRIC-04, PRIC-05, UI-03, TEST-03, TEST-06, TEST-07, TEST-11, TEST-12, TEST-15
**Success Criteria** (what must be TRUE):
  1. GET /balances returns the authenticated user's balances for all 5 currencies with correct decimal precision
  2. GET /prices returns crypto prices; the service client is abstracted behind a service object with a stub/fake available for development
  3. Prices are cached in Rails.cache with a short TTL; repeated calls within TTL do not hit the external API
  4. When the external API is unavailable (timeout, 5xx, invalid response), the backend returns a controlled error response instead of crashing
  5. Frontend dashboard page displays all balances formatted by currency type, with loading and error states; frontend tests cover the balances hook, price service, Zod schemas, and loading/error states
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Exchange Engine
**Goal**: The core exchange engine performs fiat-to-crypto and crypto-to-fiat exchanges with BigDecimal precision, atomic DB transactions, and a clear state machine -- this is the heart of the application
**Depends on**: Phase 3
**Requirements**: EXCH-01, EXCH-02, EXCH-03, EXCH-04, EXCH-05, EXCH-06, EXCH-07, EXCH-08, BE-05, TEST-01, TEST-04, TEST-09
**Success Criteria** (what must be TRUE):
  1. POST /exchange with valid params (source currency, target currency, amount) debits the source wallet and credits the target wallet atomically within a DB transaction
  2. All monetary calculations use BigDecimal exclusively; no Float appears in the exchange calculation path
  3. Exchange creates a Transaction record that transitions from `pending` to `completed` (success) or `rejected` (failure), and rejected transactions include a `rejection_reason`
  4. Insufficient balance is caught before execution and results in a rejected transaction with reason "insufficient_balance"; price fetch failure results in rejection with reason "price_fetch_failed"
  5. The exchange rate used for the calculation is persisted on the Transaction record for auditability; RSpec covers happy path (fiat-to-crypto, crypto-to-fiat), insufficient balance, price error, rollback on failure, and a full integration test of the exchange flow
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD
- [ ] 04-03: TBD

### Phase 5: Transaction History & Exchange UI
**Goal**: Users can execute exchanges from the frontend and view their full transaction history with pagination and filters
**Depends on**: Phase 4
**Requirements**: HIST-01, HIST-02, HIST-03, HIST-04, UI-04, UI-05, UI-06, UI-07, UI-08, TEST-04, TEST-10, TEST-13, TEST-14, TEST-15
**Success Criteria** (what must be TRUE):
  1. GET /transactions returns the authenticated user's transactions with pagination (page/per_page) and optional state filter (pending/completed/rejected)
  2. Frontend exchange page lets user select source/target currency and amount, displays estimated receive amount in real-time using current prices, and submits the exchange with a confirmation step showing success or rejection reason
  3. Frontend history page shows a paginated list of transactions with all relevant fields (date, currencies, amounts, state, rejection reason) and a working state filter
  4. All frontend pages have consistent loading and error states
  5. Frontend tests cover exchange form flow (success/rejection), history list with pagination/filter, and all custom hooks involved; backend request specs cover GET /transactions with pagination and filter params
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD
- [ ] 05-03: TBD

### Phase 6: Coverage, Polish & Documentation
**Goal**: Both repos meet the 90% coverage threshold, the README documents everything the evaluator needs, and the video is recorded
**Depends on**: Phase 5
**Requirements**: DOC-01, DOC-02, DOC-03, DOC-04, DOC-05
**Success Criteria** (what must be TRUE):
  1. Running the full RSpec suite with SimpleCov reports >= 90% line coverage; the build fails below that threshold
  2. Running the full Vitest suite with v8 coverage reports >= 90% line coverage; the build fails below that threshold
  3. README contains Setup, Technical Decisions, How to Run Tests, and Pending/Future Work sections
  4. A short video (2-5 min) explains the architecture and demonstrates the main user flows
**Plans**: TBD

Plans:
- [ ] 06-01: TBD
- [ ] 06-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffolding & Foundation | 3/3 | Complete    | 2026-04-14 |
| 2. Authentication | 2/2 | Complete    | 2026-04-14 |
| 3. Wallets & Crypto Prices | 0/3 | Not started | - |
| 4. Exchange Engine | 0/3 | Not started | - |
| 5. Transaction History & Exchange UI | 0/3 | Not started | - |
| 6. Coverage, Polish & Documentation | 0/2 | Not started | - |
