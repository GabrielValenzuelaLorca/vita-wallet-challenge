---
phase: 03-wallets-crypto-prices
plan: 01
subsystem: api
tags: [rails, rspec, cache, http-client, serializers, webmock]

requires:
  - phase: 01-project-scaffolding-foundation
    provides: "Rails API scaffold with User model, Wallet model (5 currencies), ApplicationController envelope helpers, WalletSerializer, BaseSerializer"
  - phase: 02-authentication
    provides: "JwtService, authenticate_user! before_action, FactoryBot :user factory with :with_wallets trait"
provides:
  - "GET /balances endpoint returning authenticated user wallets with string precision"
  - "GET /prices endpoint returning crypto prices via PriceService"
  - "PriceService with Rails.cache 30s TTL and injectable client pattern"
  - "PriceClient HTTP client for external prices API with typed error handling"
  - "StubPriceClient for development/test without external dependencies"
  - "PriceClient::ApiError with code attribute (:timeout, :server_error, :invalid_response)"
affects: [04-exchange-engine, 05-frontend-core]

tech-stack:
  added: [webmock]
  patterns: [injectable-client, cache-through-service, stub-client-for-dev, after_initialize-for-config]

key-files:
  created:
    - backend/app/controllers/wallets_controller.rb
    - backend/app/controllers/prices_controller.rb
    - backend/app/services/price_service.rb
    - backend/app/services/price_client.rb
    - backend/app/services/stub_price_client.rb
    - backend/config/initializers/price_client.rb
    - backend/spec/serializers/wallet_serializer_spec.rb
    - backend/spec/requests/wallets_spec.rb
    - backend/spec/requests/prices_spec.rb
    - backend/spec/services/price_client_spec.rb
    - backend/spec/services/price_service_spec.rb
  modified:
    - backend/config/routes.rb
    - backend/Gemfile
    - backend/Gemfile.lock
    - backend/spec/rails_helper.rb

key-decisions:
  - "Used after_initialize block in price_client initializer to avoid autoload issues in Rails 7"
  - "MemoryStore stub for cache tests since test env uses null_store by default"
  - "PriceClient normalizes both flat and data-wrapped API responses"

patterns-established:
  - "Injectable client pattern: services accept optional client parameter, default from Rails.application.config"
  - "Cache-through service: PriceService wraps client calls in Rails.cache.fetch with TTL"
  - "Stub client for dev/test: StubPriceClient matches PriceClient interface with hardcoded data"
  - "Typed error handling: PriceClient::ApiError with code attribute for error classification"

requirements-completed: [WALL-02, PRIC-01, PRIC-02, PRIC-03, PRIC-04, PRIC-05, TEST-03, TEST-06, TEST-07]

duration: 3min
completed: 2026-04-14
---

# Phase 3 Plan 1: Wallets & Crypto Prices Backend Summary

**Wallets endpoint with string-precision balances, price service with 30s cache TTL, HTTP client with typed errors, and stub client for dev/test -- 37 RSpec tests**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-14T21:51:49Z
- **Completed:** 2026-04-14T21:54:50Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- WalletsController GET /balances returns authenticated user wallets with BigDecimal balance as string
- PriceService with Rails.cache.fetch 30s TTL and injectable client pattern for testability
- PriceClient with Net::HTTP, configurable timeout, and typed ApiError (timeout/server_error/invalid_response)
- StubPriceClient returns realistic BTC/USDC/USDT prices without external dependencies
- PricesController GET /prices with 503 error handling for service unavailability
- 37 RSpec tests covering serializer, request specs, cache behavior, and HTTP error scenarios

## Task Commits

1. **All tasks** - `a97e07a` (feat: wallets endpoint, price service, clients, and 37 RSpec tests)

## Files Created/Modified
- `backend/app/controllers/wallets_controller.rb` - GET /balances returning user wallets via WalletSerializer
- `backend/app/controllers/prices_controller.rb` - GET /prices with PriceService and 503 error handling
- `backend/app/services/price_service.rb` - Cache-through service with 30s TTL and injectable client
- `backend/app/services/price_client.rb` - Net::HTTP client with timeout/5xx/JSON error handling
- `backend/app/services/stub_price_client.rb` - Hardcoded realistic prices for dev/test
- `backend/config/initializers/price_client.rb` - Configures stub in dev/test, real client in production
- `backend/config/routes.rb` - Added GET /balances and GET /prices routes
- `backend/Gemfile` - Added webmock for HTTP stubbing in tests
- `backend/spec/rails_helper.rb` - Added webmock require
- `backend/spec/serializers/wallet_serializer_spec.rb` - 8 specs for shape, collection, no sensitive fields
- `backend/spec/requests/wallets_spec.rb` - 10 specs for auth, data shape, precision, isolation
- `backend/spec/requests/prices_spec.rb` - 7 specs for auth, success, and 503 error handling
- `backend/spec/services/price_client_spec.rb` - 6 specs for success, timeout, 5xx, invalid JSON
- `backend/spec/services/price_service_spec.rb` - 7 specs for cache hit/miss/TTL, error propagation

## Decisions Made
- Used `after_initialize` block in price_client initializer to avoid NameError from autoload timing in Rails 7
- Stubbed `Rails.cache` with MemoryStore in cache behavior specs since test environment uses null_store
- PriceClient normalizes both flat hash and `{ "data" => {...} }` wrapped responses from external API

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used after_initialize for price client initializer**
- **Found during:** Task 1 (route verification)
- **Issue:** Direct constant reference in initializer caused NameError because StubPriceClient class not yet autoloaded
- **Fix:** Wrapped initializer in `Rails.application.config.after_initialize` block
- **Files modified:** backend/config/initializers/price_client.rb
- **Verification:** `bundle exec rails routes` runs without error
- **Committed in:** a97e07a

**2. [Rule 3 - Blocking] Stubbed Rails.cache with MemoryStore for cache specs**
- **Found during:** Task 2 (running specs)
- **Issue:** Test environment uses `:null_store` cache, so cache-hit test failed (client called twice)
- **Fix:** Added `allow(Rails).to receive(:cache).and_return(memory_store)` in cache behavior context
- **Files modified:** backend/spec/services/price_service_spec.rb
- **Verification:** All 37 specs pass
- **Committed in:** a97e07a

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for Rails autoloading and test accuracy. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required. StubPriceClient is used by default in development and test.

## Next Phase Readiness
- Wallets and prices endpoints ready for frontend dashboard consumption (Phase 3 Plan 2)
- PriceService cache layer ready for exchange engine integration (Phase 4)
- Injectable client pattern allows switching to real API when whitelist is enabled
- StubPriceClient ensures frontend development can proceed without external API access

---
*Phase: 03-wallets-crypto-prices*
*Completed: 2026-04-14*
