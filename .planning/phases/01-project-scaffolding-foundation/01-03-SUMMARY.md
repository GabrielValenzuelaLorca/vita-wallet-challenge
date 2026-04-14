---
phase: 01-project-scaffolding-foundation
plan: 03
subsystem: testing
tags: [rspec, simplecov, vitest, v8-coverage, factory_bot, shoulda-matchers, testing-library, jsdom]

requires:
  - phase: 01-01
    provides: Rails backend with models (User, Wallet, Transaction) and seeds
  - phase: 01-02
    provides: React frontend with Zod schemas, AuthContext, and ProtectedRoute
provides:
  - RSpec + SimpleCov test infrastructure for backend with 90% coverage threshold
  - Vitest + v8 coverage test infrastructure for frontend with 90% coverage threshold
  - FactoryBot and Shoulda::Matchers configured for future backend tests
  - Custom render utility wrapping all providers for future frontend tests
  - Sample model specs proving backend test infra works (User, Wallet)
  - Sample schema and component tests proving frontend test infra works
affects: [02-authentication-session, 03-wallet-dashboard-exchange, 04-transaction-history-filtering, 05-testing-quality, 06-polish-deployment]

tech-stack:
  added: [rspec-rails, simplecov, factory_bot_rails, shoulda-matchers, faker, vitest, @vitest/coverage-v8, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom]
  patterns: [rspec-model-specs, shoulda-matchers-one-liners, custom-render-with-providers, zod-schema-testing]

key-files:
  created:
    - backend/.rspec
    - backend/.gitignore
    - backend/spec/spec_helper.rb
    - backend/spec/rails_helper.rb
    - backend/spec/models/user_spec.rb
    - backend/spec/models/wallet_spec.rb
    - frontend/vitest.config.ts
    - frontend/src/test/setup.ts
    - frontend/src/test/testUtils.tsx
    - frontend/src/schemas/__tests__/common.test.ts
    - frontend/src/components/__tests__/ProtectedRoute.test.tsx
  modified:
    - backend/Gemfile
    - backend/Gemfile.lock
    - frontend/package.json
    - frontend/package-lock.json
    - frontend/.gitignore

key-decisions:
  - "SimpleCov loaded at top of spec_helper.rb (before any app code) for accurate coverage"
  - "fixture_path singular (not fixture_paths) for Rails 7.0 compatibility"
  - "ProtectedRoute test uses MemoryRouter (not BrowserRouter) for route control in tests"
  - "Separate vitest.config.ts from vite.config.ts for clean test/build separation"

patterns-established:
  - "Backend test pattern: require rails_helper, RSpec.describe Model, type: :model with shoulda-matchers one-liners"
  - "Frontend test pattern: __tests__/ colocated with source, vitest globals, jest-dom matchers"
  - "Custom render utility: testUtils.tsx wraps QueryClient + BrowserRouter + AuthProvider for integration tests"
  - "Schema testing: Zod parse/throw assertions for validation contracts"

requirements-completed: [TEST-08, TEST-17]

duration: 3min
completed: 2026-04-14
---

# Phase 1 Plan 03: Test Infrastructure Summary

**RSpec + SimpleCov (90% threshold) for Rails backend and Vitest + v8 coverage (90% threshold) for React frontend with sample tests passing in both repos**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-14T21:06:55Z
- **Completed:** 2026-04-14T21:10:00Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- Backend: RSpec with SimpleCov (90% min coverage, branch coverage, file groups for models/controllers/services/serializers)
- Backend: FactoryBot and Shoulda::Matchers integrated; 11 sample tests pass (User + Wallet model specs)
- Frontend: Vitest with v8 coverage (90% thresholds on lines, branches, functions, statements)
- Frontend: Custom render utility with all providers; 9 sample tests pass (Zod schemas + ProtectedRoute)
- Both repos: Coverage reports generate in HTML format; thresholds enforce quality as features are added

## Task Commits

1. **All tasks** - `e25b23e` (test) -- single commit per plan convention

## Files Created/Modified
- `backend/.rspec` - RSpec config: require spec_helper, documentation format, color
- `backend/.gitignore` - Ignore coverage/, tmp/, log/, spec/examples.txt
- `backend/Gemfile` - Added rspec-rails, factory_bot_rails, faker, shoulda-matchers, simplecov
- `backend/spec/spec_helper.rb` - SimpleCov start at top with 90% threshold, branch coverage, file groups
- `backend/spec/rails_helper.rb` - FactoryBot syntax methods, Shoulda::Matchers integration, transactional fixtures
- `backend/spec/models/user_spec.rb` - Association, validation, and seed data tests for User model
- `backend/spec/models/wallet_spec.rb` - Association, validation, and decimal precision tests for Wallet model
- `frontend/vitest.config.ts` - Vitest config with jsdom, v8 coverage, 90% thresholds, setup file
- `frontend/src/test/setup.ts` - jest-dom/vitest matchers import
- `frontend/src/test/testUtils.tsx` - Custom render wrapping QueryClient + BrowserRouter + AuthProvider
- `frontend/src/schemas/__tests__/common.test.ts` - 7 tests for apiEnvelopeSchema, apiErrorSchema, apiMetaSchema
- `frontend/src/components/__tests__/ProtectedRoute.test.tsx` - 2 tests verifying redirect when unauthenticated
- `frontend/package.json` - Added test, test:watch, test:coverage scripts + dev dependencies
- `frontend/.gitignore` - Added coverage directory

## Decisions Made
- SimpleCov must be the first require in spec_helper.rb (before any app code) for accurate coverage measurement
- Used `fixture_path` (singular) instead of `fixture_paths` (plural) for Rails 7.0 compatibility
- ProtectedRoute test uses MemoryRouter for deterministic route control instead of BrowserRouter
- Vitest config is separate from Vite config for clean separation of test and build concerns
- Created backend .gitignore to exclude coverage/, tmp/, log/, and spec/examples.txt from version control

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Used fixture_path instead of fixture_paths for Rails 7.0**
- **Found during:** Task 1 (RSpec configuration)
- **Issue:** Generated rails_helper.rb used `fixture_paths=` (plural) which is Rails 7.1+; Rails 7.0 uses `fixture_path=` (singular)
- **Fix:** Changed to `config.fixture_path = Rails.root.join("spec/fixtures")`
- **Files modified:** backend/spec/rails_helper.rb
- **Verification:** `bundle exec rspec` runs without NoMethodError
- **Committed in:** e25b23e

**2. [Rule 3 - Blocking] Added .gitignore files for generated artifacts**
- **Found during:** Task 1 commit (staging files)
- **Issue:** No backend .gitignore existed; coverage/, tmp/, log/ directories were showing as untracked
- **Fix:** Created backend/.gitignore and added coverage to frontend/.gitignore
- **Files modified:** backend/.gitignore (new), frontend/.gitignore
- **Verification:** `git status` no longer shows generated files
- **Committed in:** e25b23e

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes necessary for correct operation. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Test infrastructure complete in both repos, ready for all subsequent phases to write tests alongside features
- Backend: `bundle exec rspec` runs with SimpleCov coverage enforcement
- Frontend: `npx vitest run` runs with v8 coverage enforcement
- Coverage thresholds will catch quality regressions as features are added
- Phase 1 complete -- ready for Phase 2 (authentication/session management)

---
*Phase: 01-project-scaffolding-foundation*
*Completed: 2026-04-14*
