---
phase: 05-transaction-history-exchange-ui
plan: 02
subsystem: ui
tags: [react, antd, zod, vitest, tanstack-query, hooks, pagination, mutation]

requires:
  - phase: 04-exchange-engine
    plan: 01
    provides: "POST /exchange endpoint with TransactionSerializer envelope and 422 rejection codes"
  - phase: 05-transaction-history-exchange-ui
    plan: 01
    provides: "GET /transactions endpoint with pagination meta and status filter validation"
  - phase: 03-wallets-crypto-prices
    plan: 02
    provides: "httpClient, walletApi, priceApi, useBalances, usePrices, composition pattern, typed vi.fn mock patterns"
  - phase: 02-authentication
    plan: 02
    provides: "AuthContext with token persistence, ProtectedRoute, testUtils render helper, composition pattern (ARCH-06)"
provides:
  - "transactionSchema, transactionResponseSchema, transactionsResponseSchema, exchangeRequestSchema"
  - "exchangeApi.submitExchange with pre-network request validation and response parsing"
  - "transactionApi.getTransactions with camelCase->snake_case query parameter translation at the service boundary"
  - "useExchange hook: mutation + estimate calculation (direct/inverse/cross-rate via USD) + balances + prices + reset"
  - "useTransactions hook: pagination state, status filter, page reset on filter change"
  - "ExchangePage composing useExchange with ExchangeForm and ExchangeResult components"
  - "HistoryPage composing useTransactions with StatusFilter and TransactionTable components"
  - "38 Vitest cases covering schemas, services, hooks, and page components"
affects: [06-coverage-polish-documentation]

tech-stack:
  added: []
  patterns: [mutation-with-invalidation, query-key-with-filter-state, estimate-computation-in-hook, snake-to-camel-at-service-boundary, typed-vi-fn-generics]

key-files:
  created:
    - frontend/src/schemas/transaction.ts
    - frontend/src/services/exchangeApi.ts
    - frontend/src/services/transactionApi.ts
    - frontend/src/hooks/useExchange.ts
    - frontend/src/hooks/useTransactions.ts
    - frontend/src/pages/Exchange/components/ExchangeForm.tsx
    - frontend/src/pages/Exchange/components/ExchangeResult.tsx
    - frontend/src/pages/History/components/TransactionTable.tsx
    - frontend/src/pages/History/components/StatusFilter.tsx
    - frontend/src/schemas/__tests__/transaction.test.ts
    - frontend/src/services/__tests__/exchangeApi.test.ts
    - frontend/src/services/__tests__/transactionApi.test.ts
    - frontend/src/hooks/__tests__/useExchange.test.ts
    - frontend/src/hooks/__tests__/useTransactions.test.ts
    - frontend/src/pages/Exchange/__tests__/ExchangePage.test.tsx
    - frontend/src/pages/History/__tests__/HistoryPage.test.tsx
  modified:
    - frontend/src/pages/Exchange/ExchangePage.tsx
    - frontend/src/pages/History/HistoryPage.tsx

key-decisions:
  - "Service layer owns camelCase->snake_case query parameter translation so hook/page layers never touch snake_case keys"
  - "useExchange hook owns estimate calculation with three-tier lookup (direct/inverse/cross-rate via USD) to mirror backend ExchangeService semantics"
  - "Typed useMutation<TransactionResponseSchema, Error, ExchangeRequest> generics so onError receives Error (not unknown)"
  - "exchangeApi parses the request before posting so invalid currencies reject client-side without a network round-trip"
  - "useTransactions queryKey includes page/perPage/statusFilter so TanStack Query auto-refetches on any filter change"
  - "setStatusFilter unconditionally resets page to 1 (standard UX: filter change invalidates current pagination)"
  - "formatAmount helper duplicated locally in TransactionTable and ExchangeForm rather than sharing (keeps BalanceCard untouched, avoids cross-component coupling)"
  - "Test mocks use typed vi.fn<Fn> generics and getter-based module mocks (no any/unknown anywhere)"

patterns-established:
  - "TanStack mutation with query invalidation: useExchange invalidates ['balances'] and ['transactions'] on success for automatic Dashboard/History refresh"
  - "Estimate calculation in hook, render in component: pure function over prices, memoized via useCallback"
  - "Controlled antd Table pagination: current/pageSize/total/onChange all flow from hook state, no uncontrolled pagination"
  - "Page-level composition: pages declare state, call hook, pass data+handlers to dumb components"
  - "Typed test mocks: vi.fn<SubmitExchangeFn>() + getter module mock wiring, zero any/unknown casts"

requirements-completed: [UI-04, UI-05, UI-06, UI-07, UI-08, TEST-10, TEST-13, TEST-14, TEST-15]

duration: 5min
completed: 2026-04-14
---

# Phase 5 Plan 2: Frontend Exchange and History UI Summary

**Exchange page with live price estimate and result feedback, History page with paginated status-filtered table, 38 Vitest cases across schemas/services/hooks/pages, all wired via composition pattern with zero any/unknown**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-14T22:35:00Z
- **Completed:** 2026-04-14T22:40:22Z
- **Tasks:** 3
- **Files modified:** 18

## Accomplishments
- Transaction Zod schemas (transactionSchema, envelope variants, exchangeRequestSchema) with typed inference exports
- exchangeApi.submitExchange with pre-network request validation and typed response parsing
- transactionApi.getTransactions translating camelCase options to snake_case query parameters at the service boundary
- useExchange hook: useMutation + three-tier estimate calculation (direct / inverse / cross-rate via USD) + query invalidation + reset
- useTransactions hook: useQuery with filter-aware queryKey, pagination state, and page reset on filter change
- ExchangePage with currency selects (mutually exclusive), amount InputNumber (stringMode for precision), live estimate, and mutually-exclusive Result card for completed/rejected/pending/error states
- HistoryPage with antd Table (typed ColumnsType), colored status tags, rejection reason column, controlled pagination, status filter with allowClear, and error Alert
- 38 Vitest cases: 15 schema, 4 exchangeApi, 5 transactionApi, 7 useExchange, 5 useTransactions, 6 ExchangePage, 7 HistoryPage

## Task Commits

Each task was committed atomically:

1. **Task 1: Schemas + services + hooks (foundation layer)** - `92eec4b` (feat)
2. **Task 2: Exchange and History pages + components (UI layer)** - `d533cf5` (feat)
3. **Task 3: Vitest tests for all layers** - `28bbd1d` (test)

## Files Created/Modified
- `frontend/src/schemas/transaction.ts` - Transaction Zod schemas with status/currency enums and envelope variants
- `frontend/src/services/exchangeApi.ts` - submitExchange with client-side validation + response parsing
- `frontend/src/services/transactionApi.ts` - getTransactions with camelCase->snake_case query translation
- `frontend/src/hooks/useExchange.ts` - Mutation hook with estimate calculation, query invalidation, reset
- `frontend/src/hooks/useTransactions.ts` - Query hook with pagination and status filter state
- `frontend/src/pages/Exchange/ExchangePage.tsx` - Page composing useExchange + ExchangeForm/ExchangeResult
- `frontend/src/pages/Exchange/components/ExchangeForm.tsx` - Pure antd Form with typed currency selects, InputNumber, estimate display, submit button
- `frontend/src/pages/Exchange/components/ExchangeResult.tsx` - Result card switching on transaction.status or error
- `frontend/src/pages/History/HistoryPage.tsx` - Page composing useTransactions + StatusFilter/TransactionTable
- `frontend/src/pages/History/components/TransactionTable.tsx` - antd Table with typed ColumnsType, colored status tags, controlled pagination
- `frontend/src/pages/History/components/StatusFilter.tsx` - antd Select with pending/completed/rejected and allowClear
- `frontend/src/schemas/__tests__/transaction.test.ts` - 15 schema cases covering valid, invalid, null, and envelope shapes
- `frontend/src/services/__tests__/exchangeApi.test.ts` - 4 cases: success, schema error, ApiRequestError, client-side currency rejection
- `frontend/src/services/__tests__/transactionApi.test.ts` - 5 cases including camelCase->snake_case query translation assertion
- `frontend/src/hooks/__tests__/useExchange.test.ts` - 7 cases covering estimate math and mutation lifecycle
- `frontend/src/hooks/__tests__/useTransactions.test.ts` - 5 cases covering pagination and status filter behavior
- `frontend/src/pages/Exchange/__tests__/ExchangePage.test.tsx` - 6 integration cases from data load to New Exchange reset
- `frontend/src/pages/History/__tests__/HistoryPage.test.tsx` - 7 cases covering render, filter interaction, pagination footer, and error state

## Decisions Made
- Service layer translates camelCase options (perPage) to snake_case query keys (per_page) so hooks/pages never touch snake_case
- useExchange hook owns the full estimate calculation (pure function over prices) so pages stay dumb and only render
- Estimate uses three-tier lookup matching backend ExchangeService: direct source->target rate, inverse target->source rate, then cross-rate via USD
- useMutation generics set explicit <TransactionResponseSchema, Error, ExchangeRequest> so onError binds to Error (avoids `unknown` param)
- exchangeApi validates the request payload before POSTing, rejecting invalid currencies without a network round-trip
- useTransactions queryKey includes page/perPage/statusFilter so TanStack Query handles refetching automatically
- setStatusFilter always resets page to 1 to avoid showing a stale paginated view after a filter narrows results
- formatBalance/formatAmount helpers duplicated locally in ExchangeForm and TransactionTable instead of shared to keep BalanceCard untouched (no cross-component coupling)
- Test mocks use typed vi.fn<Fn>() generics and getter-based module mocks throughout; zero any/unknown in source or test files
- ExchangePage Back to Dashboard link targets `/` (the actual dashboard route) instead of `/dashboard` (which does not exist in App.tsx)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] onError signature would bind to `unknown` instead of `Error`**
- **Found during:** Task 1 (writing useExchange)
- **Issue:** Plan's useMutation signature used untyped generics, which made TanStack Query's onError callback receive `unknown`. That violates the project-wide "zero any/unknown" rule.
- **Fix:** Added explicit generics `useMutation<TransactionResponseSchema, Error, ExchangeRequest>` so onError receives a typed Error parameter.
- **Files modified:** frontend/src/hooks/useExchange.ts
- **Verification:** tsc --noEmit passes with zero errors, no `unknown` token remains in the file.
- **Committed in:** 92eec4b

**2. [Rule 1 - Bug] Back to Dashboard link targeted a non-existent route**
- **Found during:** Task 2 (writing ExchangePage/HistoryPage)
- **Issue:** Plan specified `<Link to="/dashboard">` but App.tsx mounts the dashboard at `/` (not `/dashboard`), so the link would navigate to a 404-redirect.
- **Fix:** Changed both links to `<Link to="/">` matching the actual route.
- **Files modified:** frontend/src/pages/Exchange/ExchangePage.tsx, frontend/src/pages/History/HistoryPage.tsx
- **Verification:** Visual inspection of App.tsx route table confirms `/` is the Dashboard route.
- **Committed in:** d533cf5

**3. [Rule 1 - Bug] Plan's ExchangeForm used `as any` cast to avoid `as never`**
- **Found during:** Task 3 (writing exchangeApi test for client-side currency rejection)
- **Issue:** Initial draft used `"EUR" as never` to bypass TypeScript; the `as never` pattern violates the zero-any/unknown spirit by type-laundering.
- **Fix:** Introduced a typed `UntypedRequest` interface matching the runtime shape and cast the service method to `(request: UntypedRequest) => Promise<...>` so the test works with concrete types.
- **Files modified:** frontend/src/services/__tests__/exchangeApi.test.ts
- **Verification:** tsc --noEmit passes, the test exercises Zod validation against genuinely unknown runtime data with a typed interface.
- **Committed in:** 28bbd1d

---

**Total deviations:** 3 auto-fixed (3 bugs)
**Impact on plan:** All three fixes preserve the plan's intent while aligning with the project's zero any/unknown rule and the actual App.tsx route table. No scope creep.

## Issues Encountered

None beyond the auto-fixed deviations. TypeScript compilation passes cleanly after each task.

## User Setup Required

None - no external service configuration required. The frontend uses the existing httpClient which attaches the stored JWT automatically.

## Next Phase Readiness
- Exchange and History pages ready for end-to-end smoke testing (login -> /exchange -> /history)
- useExchange and useTransactions hooks reusable if Phase 6 adds any refinement (e.g., per-currency history filter, quote refresh UI)
- Typed vi.fn mock pattern with getter-based module mocks established across all hook and page tests for reuse by Phase 6 coverage work
- Vitest execution deferred to main process per project rule (`cd frontend && npx vitest run` runs all 38 new cases alongside the existing suite)
- antd Form + Result + Table + Tag patterns established for any future UI work

## Self-Check: PASSED

Verified existence of all 18 created/modified files and all 3 task commits (`92eec4b`, `d533cf5`, `28bbd1d`).

---
*Phase: 05-transaction-history-exchange-ui*
*Completed: 2026-04-14*
