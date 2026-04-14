---
phase: 01-project-scaffolding-foundation
plan: 01
subsystem: database, api
tags: [rails, postgresql, bcrypt, bigdecimal, seeds, serializer, cors]

requires:
  - phase: none
    provides: first plan, no dependencies
provides:
  - Rails 7.0 API-only backend in /backend connected to PostgreSQL
  - DB schema with users, wallets, transactions tables (correct decimal precision)
  - Seed data with 2 demo users and 10 wallets (5 per user)
  - PORO serializer base pattern (BaseSerializer, UserSerializer, WalletSerializer)
  - ApplicationController with render_success/render_error API envelope helpers
  - Health check endpoint (GET /health)
  - CORS configured for frontend dev server (localhost:5173)
affects: [auth, wallets, exchange, history, testing]

tech-stack:
  added: [rails 7.0, postgresql, bcrypt, rack-cors, puma]
  patterns: [api-only, poro-serializers, api-envelope, bigdecimal-precision]

key-files:
  created:
    - backend/app/models/user.rb
    - backend/app/models/wallet.rb
    - backend/app/models/transaction.rb
    - backend/app/serializers/base_serializer.rb
    - backend/app/serializers/user_serializer.rb
    - backend/app/serializers/wallet_serializer.rb
    - backend/app/controllers/application_controller.rb
    - backend/app/controllers/health_controller.rb
    - backend/db/seeds.rb
    - backend/db/schema.rb
    - backend/config/initializers/cors.rb
  modified:
    - backend/Gemfile
    - backend/config/database.yml
    - backend/config/routes.rb

key-decisions:
  - "PORO serializers over jbuilder/active_model_serializers for full control over response shape"
  - "BigDecimal string representation in JSON via to_s('F') to preserve decimal precision"
  - "API envelope pattern: { data, meta } for success, { error: { code, message } } for errors"

patterns-established:
  - "BaseSerializer PORO pattern: initialize(object, options), as_json, serialize, serialize_collection"
  - "API response envelope: render_success(data:, meta:, status:) and render_error(code:, message:, status:)"
  - "Wallet as separate record per currency per user (not columns), enforced by unique compound index"
  - "All monetary values use BigDecimal, never Float"

requirements-completed: [BE-01, BE-04, WALL-01, WALL-03, WALL-04]

duration: 4min
completed: 2026-04-14
---

# Phase 1 Plan 01: Rails Backend Setup Summary

**Rails 7.0 API-only backend with PostgreSQL schema (users/wallets/transactions), BigDecimal seeds for 2 demo users, and PORO serializer pattern**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-14T20:58:29Z
- **Completed:** 2026-04-14T21:02:32Z
- **Tasks:** 2
- **Files modified:** 48 (including Rails scaffold)

## Accomplishments
- Rails API-only app initialized with PostgreSQL, bcrypt, and rack-cors
- DB schema with DECIMAL(20,8) for balances/amounts and DECIMAL(30,18) for exchange rates, with proper indexes and constraints
- Seeds create 2 users with 5 wallets each: demo@vitawallet.com (realistic balances) and empty@vitawallet.com (zero balances), all using BigDecimal
- PORO serializer pattern established (BaseSerializer, UserSerializer, WalletSerializer) with balance as string in JSON
- ApplicationController API envelope helpers (render_success/render_error) for consistent responses
- Health check endpoint at GET /health

## Task Commits

1. **Task 1: Rails API-only app with PostgreSQL and DB schema** - `7f97893` (feat)
2. **Task 2: Seed data and base serializer pattern** - `7f97893` (feat)

Note: Both tasks committed together per project convention (one commit per plan).

## Files Created/Modified
- `backend/app/models/user.rb` - User model with has_secure_password, email validations, associations
- `backend/app/models/wallet.rb` - Wallet model with CURRENCIES constant, balance validation, scoped uniqueness
- `backend/app/models/transaction.rb` - Transaction model with STATUSES constant, all field validations
- `backend/app/serializers/base_serializer.rb` - PORO base with serialize/serialize_collection class methods
- `backend/app/serializers/user_serializer.rb` - Serializes id, email, created_at (excludes password_digest)
- `backend/app/serializers/wallet_serializer.rb` - Serializes id, currency, balance as fixed-point string
- `backend/app/controllers/application_controller.rb` - API envelope helpers (render_success, render_error)
- `backend/app/controllers/health_controller.rb` - GET /health endpoint returning { status: "ok" }
- `backend/db/seeds.rb` - Idempotent seeds with BigDecimal for all monetary values
- `backend/db/schema.rb` - Auto-generated schema with correct decimal precision columns
- `backend/db/migrate/*_create_users.rb` - Users table with email unique index
- `backend/db/migrate/*_create_wallets.rb` - Wallets table with DECIMAL(20,8) balance, compound unique index
- `backend/db/migrate/*_create_transactions.rb` - Transactions table with DECIMAL(20,8) amounts, DECIMAL(30,18) rate
- `backend/config/initializers/cors.rb` - CORS for localhost:5173 with credentials
- `backend/config/database.yml` - PostgreSQL config (vita_wallet_development/test)
- `backend/config/routes.rb` - Health check route
- `backend/Gemfile` - Added bcrypt and rack-cors

## Decisions Made
- Used PORO serializers instead of jbuilder or active_model_serializers for full control over JSON shape and no gem dependency
- Balance serialized as string via BigDecimal#to_s("F") to preserve decimal precision across JSON boundary
- API envelope pattern established in ApplicationController: { data, meta } for success, { error: { code, message } } for errors
- Seeds use find_or_create_by! for idempotency

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Backend foundation complete with schema, seeds, and base patterns
- Ready for Phase 2 (authentication) to add JWT auth, auth service, and protected endpoints
- Ready for plan 01-03 (test infrastructure) to add RSpec + SimpleCov

---
*Phase: 01-project-scaffolding-foundation*
*Completed: 2026-04-14*
