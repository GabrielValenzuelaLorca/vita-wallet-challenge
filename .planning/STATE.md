---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: in_progress
last_updated: "2026-04-14T22:40:22Z"
progress:
  total_phases: 6
  completed_phases: 5
  total_plans: 11
  completed_plans: 10
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-14)

**Core value:** Motor de exchange funcional end-to-end con validacion de saldo, precision decimal y estados transaccionales consistentes
**Current focus:** Phase 1: Project Scaffolding & Foundation

## Current Position

Phase: 5 of 6 (Transaction History & Exchange UI) -- COMPLETE
Plan: 2 of 2 in current phase -- COMPLETE
Status: Phase 5 complete, ready for Phase 6 (Coverage, Polish & Documentation)
Last activity: 2026-04-14 -- Completed 05-02-PLAN.md

Progress: [█████████░] 91%

## Performance Metrics

**Velocity:**
- Total plans completed: 10
- Average duration: 3.5min
- Total execution time: 0.58 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 3 | 12min | 4min |
| 02 | 2 | 6min | 3min |
| 03 | 2 | 6min | 3min |
| 04 | 1 | 4min | 4min |
| 05 | 2 | 7min | 3.5min |

**Recent Trend:**
- Last 5 plans: 3min, 3min, 4min, 2min, 5min
- Trend: stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Monorepo structure: /backend (Rails API-only) + /frontend (Vite React TS)
- Auth: has_secure_password + manual JWT (no Devise)
- BigDecimal for all monetary calculations
- External price API stub until whitelist enabled
- Coverage target >= 90% both repos
- PORO serializers over jbuilder/active_model_serializers for full response control
- API envelope: { data, meta } success / { error: { code, message } } errors
- Balance as string in JSON via BigDecimal#to_s("F") for precision preservation
- Separated AuthContext types into authTypes.ts for react-refresh compatibility
- Used fetch-based httpClient (not axios) for lighter HTTP calls
- Lazy initializer for localStorage token read (avoid setState in useEffect)
- SimpleCov loaded first in spec_helper.rb for accurate coverage
- fixture_path (singular) for Rails 7.0 compatibility
- Separate vitest.config.ts from vite.config.ts for test/build separation
- MemoryRouter in tests for deterministic route control
- Flat auth routes under /auth/ (not namespaced) for simplicity
- GET /auth/me as protected endpoint for session restoration and testability
- JwtService returns nil on any decode failure for uniform error handling
- Service objects pattern: class methods on PORO, thin controllers delegate to services
- useLoginForm hook encapsulates all form logic per ARCH-06, LoginForm is pure UI
- AuthContext validates stored token on mount via GET /auth/me for session restoration
- isAuthenticated requires both token and user (not just token) to prevent stale-token flash
- antd v6 Alert uses title prop instead of deprecated message prop
- Composition pattern: hooks carry logic, components render only
- Injectable client pattern: services accept optional client, default from Rails.application.config
- after_initialize block for price_client initializer to avoid autoload timing issues
- MemoryStore stub in cache specs since test env uses null_store
- antd Statistic receives pre-formatted string for full currency formatting control
- BTC trailing zeros trimmed for cleaner display (0.05 BTC not 0.05000000 BTC)
- CLP formatted with 0 decimal places (Chilean peso has no cents)
- usePrices hook created but not consumed by Dashboard -- reserved for Exchange page
- Per-test QueryClient wrapper in hook tests for isolation
- PriceClient::ApiError rescue outside transaction block to persist rejected transaction record
- Cross-rate: fiat-to-fiat via USDC prices, crypto-to-crypto via USD
- DB decimal precision (scale 8) truncates BigDecimal -- tests compare against persisted values
- ParameterMissing rescue in ExchangeController for graceful missing-params handling
- GET /transactions uses manual limit/offset pagination instead of kaminari/pagy to keep dependencies minimal
- Status filter validation runs before query so invalid status never touches the DB (422 early return)
- Transaction history ordered by created_at:desc (not id:desc) to be resilient to future PK migrations
- Pagination total count computed from filtered scope so meta reflects the active status filter
- Service layer translates camelCase options to snake_case query keys so hooks/pages never touch snake_case
- useExchange hook owns three-tier estimate lookup (direct/inverse/cross-rate via USD) mirroring backend ExchangeService semantics
- useMutation typed with explicit generics so onError binds to Error (avoids `unknown` param per zero-any/unknown rule)
- exchangeApi validates request payload before POSTing so invalid currencies fail client-side without network round-trip
- useTransactions setStatusFilter always resets page to 1 (standard UX for filter-narrowing)
- formatAmount helper duplicated locally in ExchangeForm and TransactionTable instead of shared to avoid cross-component coupling
- Typed vi.fn<Fn>() + getter-based module mocks pattern established for test-layer zero any/unknown compliance
- Back to Dashboard Link targets `/` (actual dashboard route) not `/dashboard` (non-existent route per App.tsx)

### Pending Todos

None yet.

### Blockers/Concerns

- External API whitelist pending activation -- stub design must be swappable
- Tight deadline (~1.5 days) -- prioritize core exchange engine over polish

## Session Continuity

Last session: 2026-04-14
Stopped at: Completed 05-02-PLAN.md (Frontend Exchange and History UI)
Resume file: None
