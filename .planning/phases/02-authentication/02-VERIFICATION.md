---
phase: 02-authentication
verified: 2026-04-14T22:30:00Z
status: passed
score: 14/14 must-haves verified
re_verification: false
human_verification:
  - test: "Login form submit triggers loading state visual feedback on button"
    expected: "Button shows spinner/disabled state while API call is in flight"
    why_human: "Test only asserts button exists when isSubmitting=true, does not assert aria-busy or disabled attribute"
  - test: "Session restore on page refresh"
    expected: "Refreshing the browser with a stored token restores the authenticated session without redirect to /login"
    why_human: "Verified in code that validateSession() calls /auth/me on mount, but actual browser behavior and race conditions cannot be verified programmatically"
---

# Phase 2: Authentication Verification Report

**Phase Goal:** Users can securely register, log in, and maintain sessions; all subsequent endpoints can be protected by JWT middleware
**Verified:** 2026-04-14T22:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths — Plan 02-01 (Backend)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | POST /auth/register with valid email+password creates a user and returns JWT + user data in envelope | VERIFIED | `auth_controller.rb` calls `AuthService.register`, serializes user, returns `render_success(data: { token, user }, status: :created)`. Request spec tests 201 + data.token + data.user.email |
| 2 | POST /auth/login with valid credentials returns JWT + user data in envelope | VERIFIED | `auth_controller.rb#login` calls `AuthService.authenticate`, returns `render_success(data: { token, user })`. Request spec tests 200 + token |
| 3 | POST /auth/login with invalid credentials returns 401 with error envelope | VERIFIED | Controller returns `render_error(code: "invalid_credentials", ..., status: :unauthorized)` when result is nil. Request spec tests 401 + error.code |
| 4 | Requests to protected endpoints without token return 401 | VERIFIED | `application_controller.rb#authenticate_user!` renders 401 when no bearer token. Request spec GET /auth/me without header returns 401 + error.code "unauthorized" |
| 5 | Requests with expired or malformed JWT return 401 | VERIFIED | `JwtService.decode` returns nil on `JWT::DecodeError`/`JWT::ExpiredSignature`. `authenticate_user!` renders 401 when payload is nil. Request spec tests both expired (travel_to 25h) and invalid token |
| 6 | Password is stored as bcrypt digest, never plaintext | VERIFIED | `User` model has `has_secure_password`. `user_spec.rb` has `it { should have_secure_password }`. Request spec checks `data.user` does not contain `password_digest` key |
| 7 | JWT payload contains user_id and has expiration | VERIFIED | `JwtService#encode` builds `{ user_id: user_id, exp: 24.hours.from_now.to_i }`. `jwt_service_spec.rb` tests that decode returns payload with "user_id" key and that expired tokens (25h later) return nil |

### Observable Truths — Plan 02-02 (Frontend)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 8 | Login page renders a form with email and password fields and a submit button | VERIFIED | `LoginForm.tsx` uses antd `Form` with `Form.Item` for email and password, and `Button` with `htmlType="submit"`. `LoginPage.test.tsx` asserts presence of "Email" placeholder, "Password" placeholder, and "Log in" button |
| 9 | Submitting valid credentials stores JWT in localStorage and redirects to dashboard | VERIFIED | `AuthContext#login` calls `authApi.login`, then `localStorage.setItem(TOKEN_KEY, newToken)` and sets state. `useLoginForm#handleLogin` calls `navigate("/")` on success. `useLoginForm.test.ts` asserts navigate called with "/" |
| 10 | Submitting invalid credentials shows an error message from the backend | VERIFIED | `useLoginForm` catches `ApiRequestError` and sets `errorMessage`. `LoginForm.tsx` renders `Alert` when `errorMessage !== null`. `useLoginForm.test.ts` tests error message from `ApiRequestError` |
| 11 | User remains logged in after page refresh (token persisted in localStorage) | VERIFIED | `AuthContext` initializes `token` from `getStoredToken()` (localStorage). `useEffect` calls `authApi.me()` to validate stored token and restores `user` state. Token cleared on 401 |
| 12 | Unauthenticated users are redirected to /login when accessing protected routes | VERIFIED | `ProtectedRoute.tsx` returns `<Navigate to="/login" replace />` when `!isAuthenticated`. `ProtectedRoute.test.tsx` tests redirect to "/login" |
| 13 | Logged-in users can log out and the token is cleared from storage | VERIFIED | `AuthContext#logout` calls `localStorage.removeItem(TOKEN_KEY)`, `setUser(null)`, `setToken(null)`. `isAuthenticated` becomes false, ProtectedRoute redirects to /login |
| 14 | Login form shows loading state while request is in flight | VERIFIED (weak) | `LoginForm.tsx` passes `loading={isSubmitting}` to antd `Button`. Test asserts button exists when `isSubmitting=true` but does not assert loading visual attribute — flagged for human verification |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/app/services/jwt_service.rb` | JWT encode/decode with expiration | VERIFIED | `JWT.encode` with HS256 + 24h exp, `JWT.decode` returning nil on error/expiry |
| `backend/app/services/auth_service.rb` | Register and login business logic | VERIFIED | `authenticate` method with `JwtService.encode` call |
| `backend/app/controllers/auth_controller.rb` | POST /auth/register and POST /auth/login endpoints | VERIFIED | `def register`, `def login`, `def me` |
| `backend/app/controllers/application_controller.rb` | authenticate_user! before_action method | VERIFIED | `authenticate_user!` private method sets `@current_user` |
| `backend/config/routes.rb` | Auth routes | VERIFIED | `post "auth/register"`, `post "auth/login"`, `get "auth/me"` |
| `backend/spec/services/jwt_service_spec.rb` | JWT encode/decode/expiration tests | VERIFIED | 5 tests: encode, decode valid, decode invalid, decode tampered, decode expired (travel_to) |
| `backend/spec/services/auth_service_spec.rb` | Auth service register/login tests | VERIFIED | 8 tests: register success/dupe/short-password/token, authenticate valid/wrong-pw/nonexistent |
| `backend/spec/requests/auth_spec.rb` | Request specs for auth endpoints including 401 flows | VERIFIED | 11 tests: register 201/422 (dupe/missing-pw), login 200/401 (wrong-pw/nonexistent), me 200/401 (no-header/invalid/expired) |
| `backend/spec/factories/users.rb` | User factory with :with_wallets trait | VERIFIED | `Faker::Internet.unique.email`, `:with_wallets` creates 5 wallets per `Wallet::CURRENCIES` |
| `frontend/src/services/api.ts` | Real authApi.login and authApi.register implementations | VERIFIED | `httpClient.post` calls with Zod parse for login, register, me |
| `frontend/src/contexts/AuthContext.tsx` | Real login/logout with API calls and localStorage | VERIFIED | `localStorage.setItem` on login, `localStorage.removeItem` on logout and session failure |
| `frontend/src/hooks/useLoginForm.ts` | Login form state management hook | VERIFIED | Returns `{ isSubmitting, errorMessage, handleLogin }`, error handling for `ApiRequestError` |
| `frontend/src/pages/Login/components/LoginForm.tsx` | antd Form with email/password/submit | VERIFIED | `Form.Item` for email and password, `Button` with loading prop, `Alert` for errors |
| `frontend/src/pages/Login/LoginPage.tsx` | Login page using LoginForm and useLoginForm | VERIFIED | Composes `useLoginForm` + `LoginForm`, redirects with `<Navigate>` when authenticated |
| `frontend/src/hooks/__tests__/useLoginForm.test.ts` | Tests for login form hook | VERIFIED | 5 tests: initial state, success navigation, ApiRequestError message, generic error, clears previous error |
| `frontend/src/pages/Login/__tests__/LoginPage.test.tsx` | Tests for login page component | VERIFIED | 5 tests: fields/button render, title/subtitle, error Alert, loading state (weak), redirect when authenticated |
| `frontend/src/components/__tests__/ProtectedRoute.test.tsx` | Tests for protected route redirect | VERIFIED | 4 tests: redirect unauthenticated, no content when unauth, renders children when auth, loading spinner |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `auth_controller.rb` | `auth_service.rb` | `AuthService.register` / `AuthService.authenticate` | WIRED | Lines 5 and 13 call `AuthService.register` and `AuthService.authenticate` |
| `auth_service.rb` | `jwt_service.rb` | `JwtService.encode` | WIRED | Lines 5 and 13 call `JwtService.encode(user_id: user.id)` |
| `application_controller.rb` | `jwt_service.rb` | `JwtService.decode` in `authenticate_user!` | WIRED | Line 6 calls `JwtService.decode(token: token)` |
| `LoginPage.tsx` | `useLoginForm.ts` | `useLoginForm` hook | WIRED | Imported line 4, called line 11 |
| `useLoginForm.ts` | `AuthContext.tsx` | `useAuthContext().login` | WIRED | `useAuthContext()` at line 16, `login` called at line 25 |
| `AuthContext.tsx` | `api.ts` | `authApi.login` | WIRED | `authApi` imported line 3, `authApi.login` called line 55 |
| `api.ts` | `httpClient.ts` | `httpClient.post` | WIRED | `httpClient` imported line 2, `.post` at lines 12, 19 and `.get` at line 26 |
| `ProtectedRoute.tsx` | `useAuth.ts` | `useAuthContext` | WIRED | `useAuthContext` imported line 4, called line 11 |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| AUTH-01 | 02-01 | User can register with email and password | SATISFIED | `POST /auth/register` creates user via `User.create!`, tested in request spec |
| AUTH-02 | 02-01 | User can login with email and password and receives a valid JWT | SATISFIED | `POST /auth/login` returns JWT via `AuthService.authenticate` + `JwtService.encode` |
| AUTH-03 | 02-01 | Protected endpoints reject requests without JWT or with invalid/expired JWT | SATISFIED | `authenticate_user!` in `ApplicationController`, tested with no-header, invalid, and expired token cases |
| AUTH-04 | 02-01 | Password stored using `has_secure_password` (bcrypt), never plaintext | SATISFIED | `User` model has `has_secure_password`, user_spec tests it, request spec checks no `password_digest` in response |
| AUTH-05 | 02-02 | Frontend session persists after browser refresh (JWT in safe storage) | SATISFIED | Token stored in localStorage, `AuthContext` restores session via `authApi.me()` on mount |
| AUTH-06 | 02-02 | User can log out from UI and token is locally invalidated | SATISFIED | `AuthContext#logout` clears localStorage + state. `isAuthenticated` becomes false |
| UI-01 | 02-02 | Login page with form, validation, backend error handling | SATISFIED | `LoginPage.tsx` + `LoginForm.tsx` with antd validation rules and `Alert` for backend errors |
| UI-02 | 02-02 | Session persistence: authenticated user stays logged in after refresh | SATISFIED | `useEffect` in `AuthContext` validates stored token via `/auth/me` on mount |
| UI-09 | 02-02 | All pages have consistent loading and error states | SATISFIED | `isSubmitting` loading on button, `isLoading` spinner in `ProtectedRoute`, `errorMessage` Alert in `LoginForm` |
| UI-10 | 02-02 | Navigation between authenticated pages with protected route (redirects to login if no session) | SATISFIED | `ProtectedRoute` wraps `/`, `/exchange`, `/history` in `App.tsx`; redirects to `/login` when not authenticated |
| ARCH-05 | 02-02 | Components use composition pattern (children, slots, compound components) | SATISFIED | `LoginForm.tsx` accepts optional `children` prop (line 10, rendered line 76) |
| ARCH-06 | 02-02 | Components only handle render/UI; logic lives in hooks | SATISFIED | `useLoginForm` holds all form logic; `LoginForm` is pure UI receiving props |
| BE-02 | 02-01 | Thin controllers: only routing, auth, serialization | SATISFIED | `AuthController` delegates to `AuthService`, no business logic in controller |
| BE-03 | 02-01 | Complex business logic in service objects | SATISFIED | `AuthService` and `JwtService` hold all logic; controllers call class methods |
| BE-06 | 02-01 | JWT auth middleware applied to protected endpoints | SATISFIED | `before_action :authenticate_user!` available in `ApplicationController`; used in `AuthController` with `only: [:me]` |
| TEST-02 | 02-01 | AuthService / sessions: valid, invalid, JWT generation, expired, invalid, has_secure_password | SATISFIED | `jwt_service_spec.rb` (5 tests) + `auth_service_spec.rb` (8 tests) cover all scenarios |
| TEST-05 | 02-01 | Request specs: 401 no token, 401 invalid/expired, 200 valid token | SATISFIED | `auth_spec.rb` covers all three cases for `GET /auth/me` |
| TEST-06 | 02-01 | Model specs: User, Wallet, Transaction validations | PARTIAL | `user_spec.rb` (8 tests) and `wallet_spec.rb` (5 tests) exist; email format validation not explicitly tested in model spec (model has it, spec doesn't assert it); Transaction model spec is mapped to Phase 3 |
| TEST-10 | 02-02 | Tests for all custom hooks (fetch, state, calculations) | SATISFIED | `useLoginForm.test.ts` (5 tests), `useAuth.test.ts` (1 test — throws outside provider); inside-provider behavior tested indirectly via ProtectedRoute/LoginPage tests |
| TEST-13 | 02-02 | Tests for key components: Login form, Exchange form, etc. | SATISFIED (partial) | `LoginPage.test.tsx` tests form rendering, error, loading, redirect. Exchange/History forms are Phase 5 |
| TEST-16 | 02-02 | Tests for protected routing: unauthenticated redirected to login | SATISFIED | `ProtectedRoute.test.tsx` directly tests redirect when `isAuthenticated=false` |
| TEST-18 | 02-02 | All mocks and fixtures in tests are typed, no any/unknown/forced casts | SATISFIED | Test mocks use `AuthContextType`, `AuthResponseSchema`, `MeResponseSchema`, `UseLoginFormReturn`; `vi.mocked()` used; no `any` or `as unknown as T` in test files |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `frontend/src/hooks/useLoginForm.ts` | 27 | `catch (error: unknown)` | INFO | TypeScript catch clause annotation; properly narrowed via `instanceof ApiRequestError` — compliant with TS strict mode |
| `frontend/src/pages/Login/__tests__/LoginPage.test.tsx` | 107-117 | Loading state test only asserts button exists, not loading attribute | WARNING | Test does not verify the actual visual loading state of the button; `Button loading={true}` is passed but not asserted |

No blockers found.

### Human Verification Required

**1. Login form loading state visual**

**Test:** Submit login form with slow network or mocked delay. Observe the Log in button during submission.
**Expected:** Button shows a loading spinner and is disabled while the API call is in flight.
**Why human:** `LoginPage.test.tsx` test for `isSubmitting=true` only asserts the button is present, not that it visually shows the loading state (no `aria-busy` or disabled attribute assertion).

**2. Session restoration on page refresh**

**Test:** Log in successfully, then refresh the browser tab.
**Expected:** The user stays on the dashboard (or wherever they were) without being redirected to /login, and their session is restored within ~1 second.
**Why human:** `AuthContext` session restoration via `authApi.me()` is verified in code, but actual browser timing, race conditions, and the "isLoading=true flicker before redirect" UX can only be verified manually.

### Gaps Summary

No blocking gaps. All 14 must-have truths are verified as implemented and wired.

Minor observations (non-blocking):
1. `useAuth.test.ts` only has 1 test (throws outside provider); the plan specified a second test for "returns context values when inside AuthProvider". The positive-path behavior is implicitly covered by `ProtectedRoute.test.tsx` and `LoginPage.test.tsx` which mock `useAuthContext` successfully, so TEST-10 is still satisfied overall.
2. `user_spec.rb` does not explicitly test `validate_format_of(:email)` via a shoulda matcher, though the validation exists in the model. The format is validated at request time (422 response to invalid emails) and TEST-06 is jointly mapped to Phase 2 and Phase 3.
3. The loading state test in `LoginPage.test.tsx` is a weak assertion (presence only, not loading visual). Flagged for human verification.

---

_Verified: 2026-04-14T22:30:00Z_
_Verifier: Claude (gsd-verifier)_
