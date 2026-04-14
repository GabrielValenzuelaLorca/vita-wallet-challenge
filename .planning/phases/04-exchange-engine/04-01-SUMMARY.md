---
phase: 04-exchange-engine
plan: 01
subsystem: api
tags: [rails, rspec, bigdecimal, atomic-transactions, pessimistic-locking, service-objects]

requires:
  - phase: 01-project-scaffolding-foundation
    provides: "Rails API scaffold with User, Wallet, Transaction models, ApplicationController envelope, BaseSerializer"
  - phase: 02-authentication
    provides: "JwtService, authenticate_user!, FactoryBot :user factory with :with_wallets trait"
  - phase: 03-wallets-crypto-prices
    provides: "PriceService with cache and injectable client, StubPriceClient, PriceClient::ApiError"
provides:
  - "ExchangeService.execute with atomic fiat/crypto exchanges, BigDecimal math, pessimistic locking"
  - "POST /exchange endpoint with authentication and param validation"
  - "TransactionSerializer with string-precision amounts and ISO 8601 timestamps"
  - "Cross-rate support: fiat-to-fiat and crypto-to-crypto via USD intermediary"
  - "State machine: pending -> completed or rejected with rejection_reason"
affects: [05-frontend-core, 06-testing-polish]

tech-stack:
  added: []
  patterns: [atomic-exchange-with-pessimistic-locking, bigdecimal-only-monetary-math, cross-rate-through-usd, rejected-transaction-audit-trail]

key-files:
  created:
    - backend/app/services/exchange_service.rb
    - backend/app/controllers/exchange_controller.rb
    - backend/app/serializers/transaction_serializer.rb
    - backend/spec/services/exchange_service_spec.rb
    - backend/spec/requests/exchange_spec.rb
  modified:
    - backend/config/routes.rb

key-decisions:
  - "PriceClient::ApiError rescue outside transaction block to avoid rejected transaction being rolled back"
  - "Cross-rate calculation uses USDC as USD proxy for fiat-to-fiat, direct USD for crypto-to-crypto"
  - "DB precision (scale 8) truncates BigDecimal results -- tests compare against DB-persisted values"
  - "ParameterMissing rescue in controller for graceful missing-params handling"

patterns-established:
  - "Atomic exchange pattern: lock wallets, validate balance, debit/credit, create Transaction -- all in one transaction"
  - "Rejected transaction audit trail: insufficient_balance and price_fetch_failed create rejected Transaction records"
  - "BigDecimal-only monetary math: zero .to_f in exchange path, string conversion via to_s('F')"
  - "Cross-rate through intermediary: fiat<->fiat via USDC, crypto<->crypto via USD"

requirements-completed: [EXCH-01, EXCH-02, EXCH-03, EXCH-04, EXCH-05, EXCH-06, EXCH-07, EXCH-08, BE-05, TEST-01, TEST-04, TEST-09]

duration: 4min
completed: 2026-04-14
---

# Phase 4 Plan 1: Exchange Engine Summary

**Atomic exchange service with BigDecimal math, pessimistic locking, cross-rate support, and 48 new RSpec tests -- 123 total, 94.56% coverage**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-14T22:06:33Z
- **Completed:** 2026-04-14T22:10:50Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- ExchangeService with atomic fiat/crypto exchanges, pessimistic wallet locking, and BigDecimal-only math
- Cross-rate support for all currency pairs (fiat-to-fiat via USDC, crypto-to-crypto via USD)
- State machine with rejected transaction audit trail (insufficient_balance, price_fetch_failed)
- 48 new RSpec tests: 36 service specs + 12 request specs, full suite at 123 examples, 0 failures
- 94.56% line coverage, 88% branch coverage

## Task Commits

1. **Task 1: ExchangeService + ExchangeController + TransactionSerializer** - `f398cc3` (feat)
2. **Task 2: Comprehensive RSpec test suite** - `54dcf6c` (test)

## Files Created/Modified
- `backend/app/services/exchange_service.rb` - Core exchange engine with atomic transactions, BigDecimal math, cross-rates
- `backend/app/controllers/exchange_controller.rb` - POST /exchange with authentication, param validation, ParameterMissing rescue
- `backend/app/serializers/transaction_serializer.rb` - Transaction JSON with string-precision amounts and ISO 8601 timestamps
- `backend/config/routes.rb` - Added POST /exchange route
- `backend/spec/services/exchange_service_spec.rb` - 36 specs: happy paths, rejections, precision, atomicity
- `backend/spec/requests/exchange_spec.rb` - 12 specs: auth, success, rejections, full E2E integration

## Decisions Made
- PriceClient::ApiError rescued outside the transaction block so rejected transaction record persists (not rolled back)
- Cross-rate for fiat-to-fiat uses USDC/CLP and USDC/USD prices as USD proxy; crypto-to-crypto converts through USD
- Test assertions use `.round(8)` to match DB precision (decimal 20,8) instead of raw BigDecimal division results
- Added ParameterMissing rescue in controller for graceful 422 on missing exchange params

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] DB decimal precision truncation in test assertions**
- **Found during:** Task 2 (running service specs)
- **Issue:** BigDecimal division produces more decimal places than DB stores (precision 20, scale 8), causing exact comparison failures
- **Fix:** Test assertions use `.round(8)` to match what the DB actually persists after save
- **Files modified:** backend/spec/services/exchange_service_spec.rb, backend/spec/requests/exchange_spec.rb
- **Verification:** All 48 new tests pass
- **Committed in:** 54dcf6c

**2. [Rule 1 - Bug] ParameterMissing exception on empty request body**
- **Found during:** Task 2 (running request specs)
- **Issue:** POST /exchange with empty params raised unhandled ActionController::ParameterMissing
- **Fix:** Added rescue_from and explicit presence validation for required params
- **Files modified:** backend/app/controllers/exchange_controller.rb
- **Verification:** Missing params test returns 422 with error envelope
- **Committed in:** 54dcf6c

**3. [Rule 1 - Bug] Atomicity test stubbed wallet.save! during factory creation**
- **Found during:** Task 2 (running service specs)
- **Issue:** allow_any_instance_of(Wallet).to receive(:save!) intercepted wallet creation in :with_wallets factory trait
- **Fix:** Rewrote atomicity tests to stub specific wallet instances after user creation, using targeted stubs on the target wallet only
- **Files modified:** backend/spec/services/exchange_service_spec.rb
- **Verification:** Both atomicity tests pass, verifying rollback behavior
- **Committed in:** 54dcf6c

---

**Total deviations:** 3 auto-fixed (3 bugs)
**Impact on plan:** All fixes necessary for test accuracy and controller robustness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required. StubPriceClient provides exchange rates in dev/test.

## Next Phase Readiness
- Exchange endpoint ready for frontend exchange page integration (Phase 5)
- TransactionSerializer provides the JSON shape for the exchange form response
- All exchange directions supported: fiat->crypto, crypto->fiat, fiat->fiat, crypto->crypto
- Rejected transaction audit trail ready for transaction history display

---
*Phase: 04-exchange-engine*
*Completed: 2026-04-14*
