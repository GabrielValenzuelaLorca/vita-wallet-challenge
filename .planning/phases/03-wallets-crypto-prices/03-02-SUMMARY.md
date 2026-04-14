---
phase: 03-wallets-crypto-prices
plan: 02
subsystem: ui
tags: [react, antd, zod, vitest, tanstack-query, hooks, dashboard]

requires:
  - phase: 01-project-scaffolding-foundation
    provides: "Vite React TS scaffold, httpClient, Zod schemas/common, wallet types, testUtils"
  - phase: 02-authentication
    plan: 02
    provides: "AuthContext, composition pattern (hooks carry logic, components render only), typed mock patterns"
  - phase: 03-wallets-crypto-prices
    plan: 01
    provides: "GET /balances endpoint, GET /prices endpoint, PriceService with 30s cache TTL"
provides:
  - "walletApi.getBalances service with Zod validation for GET /balances"
  - "priceApi.getPrices service with Zod validation for GET /prices"
  - "Price Zod schema (priceEntrySchema, pricesDataSchema, pricesResponseSchema)"
  - "useBalances TanStack Query hook for wallet balances"
  - "usePrices TanStack Query hook with 30s auto-refetch"
  - "DashboardPage with loading/error/success states"
  - "BalanceCard with currency-aware formatting (fiat/crypto/stablecoin)"
  - "BalanceList responsive grid component"
  - "35 Vitest tests covering schemas, services, hooks, and dashboard page"
affects: [04-exchange-engine, 05-frontend-exchange-history]

tech-stack:
  added: []
  patterns: [currency-formatting-helper, tanstack-query-hooks, zod-validated-api-services, responsive-card-grid]

key-files:
  created:
    - frontend/src/schemas/price.ts
    - frontend/src/services/walletApi.ts
    - frontend/src/services/priceApi.ts
    - frontend/src/hooks/useBalances.ts
    - frontend/src/hooks/usePrices.ts
    - frontend/src/pages/Dashboard/components/BalanceCard.tsx
    - frontend/src/pages/Dashboard/components/BalanceList.tsx
    - frontend/src/schemas/__tests__/wallet.test.ts
    - frontend/src/schemas/__tests__/price.test.ts
    - frontend/src/services/__tests__/walletApi.test.ts
    - frontend/src/services/__tests__/priceApi.test.ts
    - frontend/src/hooks/__tests__/useBalances.test.ts
    - frontend/src/hooks/__tests__/usePrices.test.ts
    - frontend/src/pages/Dashboard/__tests__/DashboardPage.test.tsx
  modified:
    - frontend/src/pages/Dashboard/DashboardPage.tsx

key-decisions:
  - "antd Statistic receives pre-formatted string value for full control over currency formatting"
  - "BTC trailing zeros trimmed (0.05 BTC not 0.05000000 BTC) for cleaner display"
  - "CLP formatted with 0 decimal places (no cents in Chilean peso)"
  - "usePrices hook created now but not consumed by DashboardPage -- reserved for Exchange page in Phase 5"
  - "QueryClientProvider wrapper function in hook tests for isolated QueryClient per test"

patterns-established:
  - "Currency formatting: formatBalance helper with switch on Currency type for fiat/crypto/stablecoin display rules"
  - "API service pattern: httpClient.get + Zod schema.parse in named object (walletApi, priceApi)"
  - "TanStack Query hooks: extract .data from envelope in queryFn, return typed state object"
  - "Dashboard composition: DashboardPage uses hook, BalanceList receives data, BalanceCard renders individual items"

requirements-completed: [UI-03, TEST-06, TEST-11, TEST-12, TEST-15]

duration: 3min
completed: 2026-04-14
---

# Phase 3 Plan 2: Frontend Dashboard Summary

**Dashboard page with 5 currency balance cards, walletApi/priceApi Zod-validated services, TanStack Query hooks with auto-refetch, and 35 Vitest tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-14T21:57:08Z
- **Completed:** 2026-04-14T22:00:06Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- DashboardPage replaces placeholder with real balance display using useBalances hook, loading Spin, and error Alert
- BalanceCard formats currencies correctly: USD ($1,000.50), CLP ($500,000), BTC (0.05 BTC), USDC/USDT ($500.00)
- walletApi and priceApi services parse responses through Zod schemas following authApi pattern
- useBalances and usePrices TanStack Query hooks with proper loading/error/data state management
- usePrices auto-refetches every 30 seconds to match backend cache TTL
- 35 Vitest tests: 8 wallet schema, 7 price schema, 3 walletApi, 2 priceApi, 3 useBalances, 3 usePrices, 9 DashboardPage

## Task Commits

1. **Task 1: Dashboard page, API services, schemas, hooks** - `c889d3a` (feat)
2. **Task 2: Vitest tests for all layers** - `c788be5` (test)

## Files Created/Modified
- `frontend/src/schemas/price.ts` - Zod schemas for price API: priceEntrySchema, pricesDataSchema, pricesResponseSchema
- `frontend/src/services/walletApi.ts` - getBalances calling GET /balances with Zod validation
- `frontend/src/services/priceApi.ts` - getPrices calling GET /prices with Zod validation
- `frontend/src/hooks/useBalances.ts` - TanStack Query hook extracting wallet data from envelope
- `frontend/src/hooks/usePrices.ts` - TanStack Query hook with 30s refetchInterval
- `frontend/src/pages/Dashboard/DashboardPage.tsx` - Real dashboard with loading/error/success states
- `frontend/src/pages/Dashboard/components/BalanceCard.tsx` - Currency-aware balance card with formatBalance helper
- `frontend/src/pages/Dashboard/components/BalanceList.tsx` - Responsive grid layout (3/2/1 columns)
- `frontend/src/schemas/__tests__/wallet.test.ts` - 8 tests: valid/invalid currency, missing fields, type checks
- `frontend/src/schemas/__tests__/price.test.ts` - 7 tests: entry/data/response validation, edge cases
- `frontend/src/services/__tests__/walletApi.test.ts` - 3 tests: success, Zod rejection, 401 propagation
- `frontend/src/services/__tests__/priceApi.test.ts` - 2 tests: success, 503 propagation
- `frontend/src/hooks/__tests__/useBalances.test.ts` - 3 tests: success/error/loading states
- `frontend/src/hooks/__tests__/usePrices.test.ts` - 3 tests: success/error/loading states
- `frontend/src/pages/Dashboard/__tests__/DashboardPage.test.tsx` - 9 tests: loading/error/success, formatting per currency

## Decisions Made
- antd Statistic receives pre-formatted string value for full control over currency formatting (avoids Statistic's own number formatting)
- BTC trailing zeros trimmed for cleaner display (0.05 BTC not 0.05000000 BTC)
- CLP formatted with 0 decimal places since Chilean peso has no cents
- usePrices hook created but not consumed by DashboardPage -- reserved for Exchange page in Phase 5
- Hook tests use per-test QueryClient wrapper function for isolation (no shared state between tests)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. Frontend uses existing httpClient with auth token from localStorage.

## Next Phase Readiness
- Dashboard page functional with real data from GET /balances endpoint
- usePrices hook ready for Exchange page consumption in Phase 4/5
- walletApi/priceApi patterns established for any future API service additions
- BalanceCard formatBalance helper reusable for balance display anywhere in the app
- 35 Vitest tests provide regression safety for dashboard and data layer changes

---
*Phase: 03-wallets-crypto-prices*
*Completed: 2026-04-14*
