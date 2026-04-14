# Requirements: vita-wallet-challenge

**Defined:** 2026-04-14
**Core Value:** Motor de exchange funcional end-to-end con validación de saldo, precisión decimal y estados transaccionales consistentes

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: Usuario puede registrarse con email y password (backend + seed opcional desde frontend)
- [ ] **AUTH-02**: Usuario puede hacer login con email y password y recibe un JWT válido
- [ ] **AUTH-03**: Endpoints protegidos rechazan requests sin JWT o con JWT inválido/expirado
- [ ] **AUTH-04**: Password se persiste usando `has_secure_password` (bcrypt), nunca en texto plano
- [ ] **AUTH-05**: Sesión frontend persiste tras refresh del navegador (JWT guardado en storage seguro)
- [ ] **AUTH-06**: Usuario puede cerrar sesión desde la UI y el token se invalida localmente

### Wallets & Balances

- [ ] **WALL-01**: Cada usuario tiene balances en 5 monedas: USD, CLP, BTC, USDC, USDT
- [ ] **WALL-02**: Endpoint autenticado retorna los balances actuales del usuario
- [ ] **WALL-03**: Balances se persisten con precisión decimal adecuada (`BigDecimal` en Ruby, `DECIMAL` en PostgreSQL)
- [ ] **WALL-04**: Existen seeds con usuarios de prueba y balances iniciales razonables para demo

### Crypto Prices

- [ ] **PRIC-01**: Endpoint backend expone precios consultando `api.stage.vitawallet.io/api/prices_quote`
- [ ] **PRIC-02**: Service client del endpoint externo está abstraído detrás de un service object con interfaz estable
- [ ] **PRIC-03**: Precios se cachean en `Rails.cache` con TTL corto (30-60s) para reducir llamadas al externo
- [ ] **PRIC-04**: Manejo robusto de errores de API externa: timeout, 5xx, formato inválido → respuesta controlada al cliente
- [ ] **PRIC-05**: Stub/fake del cliente disponible para desarrollo mientras se habilita whitelist

### Exchange (Core)

- [ ] **EXCH-01**: Endpoint autenticado permite intercambiar fiat → crypto (ej: USD → BTC)
- [ ] **EXCH-02**: Endpoint autenticado permite intercambiar crypto → fiat (ej: BTC → USD)
- [ ] **EXCH-03**: Pre-validación de saldo suficiente antes de ejecutar la operación
- [ ] **EXCH-04**: Cálculo del monto recibido usa `BigDecimal`, nunca `Float`; precisión monetaria preservada
- [ ] **EXCH-05**: La transacción es atómica: débito y crédito ocurren dentro de `ActiveRecord::Base.transaction`
- [ ] **EXCH-06**: Cada operación crea un registro `Transaction` con estado `pending` → `completed` o `rejected`
- [ ] **EXCH-07**: Transacción rechazada incluye `rejection_reason` (ej: "insufficient_balance", "price_fetch_failed")
- [ ] **EXCH-08**: Cotización (exchange rate) usada en el cálculo se persiste en la transacción para auditoría

### Transaction History

- [ ] **HIST-01**: Endpoint autenticado lista las transacciones del usuario
- [ ] **HIST-02**: Listado soporta paginación (ej: `page` y `per_page` en query params)
- [ ] **HIST-03**: Listado soporta filtro por estado (`pending`, `completed`, `rejected`)
- [ ] **HIST-04**: Respuesta incluye todos los campos necesarios para mostrar: fechas, montos, monedas, estado, razón de rechazo si aplica

### Frontend UI

- [ ] **UI-01**: Página de Login con formulario, validación, manejo de errores del backend
- [ ] **UI-02**: Persistencia de sesión: usuario autenticado se mantiene logueado tras refresh
- [ ] **UI-03**: Página Dashboard muestra todos los balances del usuario con formato adecuado por moneda
- [ ] **UI-04**: Página Exchange con formulario: seleccionar moneda origen, moneda destino, monto
- [ ] **UI-05**: Página Exchange muestra monto estimado en tiempo real antes de confirmar
- [ ] **UI-06**: Página Exchange confirma la operación y muestra resultado (éxito/rechazo)
- [ ] **UI-07**: Página Historial muestra lista paginada de transacciones
- [ ] **UI-08**: Página Historial incluye filtro por estado
- [ ] **UI-09**: Todas las páginas tienen loading states y error states consistentes
- [ ] **UI-10**: Navegación entre páginas autenticadas con ruta protegida (redirige a login si no hay sesión)

### Frontend Architecture & Stack

- [ ] **ARCH-01**: Estructura `src/pages/<PageName>/` — cada página es un directorio con el componente Page y su subdirectorio `components/` para componentes propios
- [ ] **ARCH-02**: Directorio `src/components/` al mismo nivel que `pages/` para componentes transversales reutilizables
- [ ] **ARCH-03**: Directorio `src/hooks/` con custom hooks que cargan toda la lógica (fetch, estado, side effects, validaciones)
- [ ] **ARCH-04**: Directorio `src/services/` con clientes HTTP y abstracciones de API
- [ ] **ARCH-05**: Componentes usan composition pattern (children, slots, compound components donde aplique)
- [ ] **ARCH-06**: Componentes solo manejan render/UI; la lógica vive en hooks (máxima testeabilidad)
- [ ] **ARCH-07**: Manejo de estado de servidor con TanStack Query (React Query) — cache, invalidación, loading/error states out-of-the-box
- [ ] **ARCH-08**: Estado global cliente mínimo con Context API (AuthContext, y quizás UI context si aplica)
- [ ] **ARCH-09**: Build tool **Vite** con plugin React + TypeScript
- [ ] **ARCH-10**: TypeScript **strict mode** (`strict: true`, `noImplicitAny`, `strictNullChecks`)
- [ ] **ARCH-11**: **Cero `any` y cero `unknown`** en todo el código (src, tests, mocks) — enforced por regla ESLint (`@typescript-eslint/no-explicit-any` como error)
- [ ] **ARCH-12**: **Zod** para validación de schemas: validación de respuestas del API, validación de forms, inferencia de tipos desde schemas (`z.infer`)
- [ ] **ARCH-13**: Cliente HTTP (axios o fetch) tipado con generics, sin `any` — capa services encapsula llamadas y parsea con Zod
- [ ] **ARCH-14**: Todos los hooks personalizados tienen tipos de entrada y salida explícitos

### Backend Architecture

- [ ] **BE-01**: Rails API-only con PostgreSQL
- [ ] **BE-02**: Controllers delgados — solo routing, auth, serialización de request/response
- [ ] **BE-03**: Lógica de negocio compleja vive en service objects (`ExchangeService`, `PriceService`, `AuthService`)
- [ ] **BE-04**: Serializers dedicados para shape consistente de respuestas
- [ ] **BE-05**: Transacciones DB explícitas en operaciones multi-step (exchange)
- [ ] **BE-06**: Middleware de autenticación JWT aplicado a endpoints protegidos

### Testing — Target ≥90% coverage en ambos repos

#### Backend (RSpec + SimpleCov)

- [ ] **TEST-01**: `ExchangeService` — happy path fiat→crypto, crypto→fiat, saldo insuficiente, error de precios, transacción rechazada, rollback en fallo
- [ ] **TEST-02**: `AuthService` / sesiones — credenciales válidas, inválidas, JWT generation, JWT expirado, JWT inválido, `has_secure_password` match
- [ ] **TEST-03**: `PriceService` — cache hit, cache miss, TTL, error de API externa (timeout, 5xx, respuesta inválida), fallback
- [ ] **TEST-04**: Request specs para endpoints críticos — `POST /auth/login`, `GET /balances`, `POST /exchange`, `GET /transactions`
- [ ] **TEST-05**: Request specs cubren autenticación — 401 sin token, 401 token inválido/expirado, 200 con token válido
- [ ] **TEST-06**: Model specs — validaciones de `User`, `Wallet`, `Transaction` (presencia, formato, unicidad, precisión decimal)
- [ ] **TEST-07**: Serializers specs — shape de respuesta correcto, campos sensibles excluidos (password_digest)
- [ ] **TEST-08**: SimpleCov configurado con umbral `≥90%` líneas totales — el build falla bajo ese umbral
- [ ] **TEST-09**: Specs de integración del flujo completo exchange (happy path end-to-end backend)

#### Frontend (Vitest + React Testing Library + MSW)

- [ ] **TEST-10**: Tests de **todos** los custom hooks (fetch, estado, cálculos) — mocks de API con MSW o fakes tipados
- [ ] **TEST-11**: Tests de **todos** los service objects (clientes HTTP, parseo Zod, manejo de errores)
- [ ] **TEST-12**: Tests de **todos** los schemas Zod — inputs válidos/inválidos, mensajes de error
- [ ] **TEST-13**: Tests de componentes clave: Login form, Exchange form, Balances display, Transaction history list, filtros
- [ ] **TEST-14**: Tests de flujos de página: login exitoso/fallido, exchange exitoso/rechazado, carga de historial con filtro
- [ ] **TEST-15**: Tests cubren loading states y error states (React Query `isLoading`, `isError`, `error`)
- [ ] **TEST-16**: Tests de routing protegido — usuario no autenticado redirigido a login
- [ ] **TEST-17**: Vitest configurado con coverage (`v8` provider) y umbral `≥90%` líneas totales — el build falla bajo ese umbral
- [ ] **TEST-18**: Todos los mocks y fixtures en tests son **tipados**, sin `any` ni `unknown` ni casts forzados

### Documentation & Delivery

- [ ] **DOC-01**: README con sección Setup (clone, instalar deps, crear DB, seeds, levantar servers)
- [ ] **DOC-02**: README con sección Decisiones Técnicas (stack, arquitectura, auth, cache, precisión decimal)
- [ ] **DOC-03**: README con sección Pendientes (bonus no incluidos, Figma pixel-perfect, etc.)
- [ ] **DOC-04**: README con sección de cómo correr los tests
- [ ] **DOC-05**: Video corto (2-5 min) explicando arquitectura y flujos principales

## v2 Requirements

Descartados explícitamente por plazo; se mencionan en README como posibles mejoras.

### Bonus (PDF)

- **BON-01**: Deploy funcional (Heroku/Render/Vercel)
- **BON-02**: Dockerización + docker-compose
- **BON-03**: Pipeline CI/CD (GitHub Actions)
- **BON-04**: UI pixel-perfect Figma
- **BON-05**: Documentación Swagger/OpenAPI del backend

### Features adicionales

- **V2-01**: Registro de usuarios desde UI (si no hay tiempo para UI, se usan seeds)
- **V2-02**: Refresh tokens / revocación de JWT
- **V2-03**: Email verification / password reset
- **V2-04**: Notificaciones (in-app o email)

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth / Social login | No pedido por el PDF, complejidad innecesaria |
| 2FA | Fuera del alcance del PDF |
| Multi-idioma / i18n | Fuera del alcance del PDF |
| Tests E2E (Cypress/Playwright) | Tiempo insuficiente, tests unitarios + integración bastan |
| Tests exhaustivos / coverage alto | Prioridad es cubrir caminos críticos (auth, exchange) |
| Transacciones reales (no simulación) | El PDF dice "Simular intercambio", no pide integración con exchange real |
| Mobile responsive pixel-perfect | Layout web funcional, mobile como bonus si sobra tiempo |

## Traceability

*Empty — populated during roadmap creation*

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | — | Pending |
| AUTH-02 | — | Pending |
| AUTH-03 | — | Pending |
| AUTH-04 | — | Pending |
| AUTH-05 | — | Pending |
| AUTH-06 | — | Pending |
| WALL-01 | — | Pending |
| WALL-02 | — | Pending |
| WALL-03 | — | Pending |
| WALL-04 | — | Pending |
| PRIC-01 | — | Pending |
| PRIC-02 | — | Pending |
| PRIC-03 | — | Pending |
| PRIC-04 | — | Pending |
| PRIC-05 | — | Pending |
| EXCH-01 | — | Pending |
| EXCH-02 | — | Pending |
| EXCH-03 | — | Pending |
| EXCH-04 | — | Pending |
| EXCH-05 | — | Pending |
| EXCH-06 | — | Pending |
| EXCH-07 | — | Pending |
| EXCH-08 | — | Pending |
| HIST-01 | — | Pending |
| HIST-02 | — | Pending |
| HIST-03 | — | Pending |
| HIST-04 | — | Pending |
| UI-01 | — | Pending |
| UI-02 | — | Pending |
| UI-03 | — | Pending |
| UI-04 | — | Pending |
| UI-05 | — | Pending |
| UI-06 | — | Pending |
| UI-07 | — | Pending |
| UI-08 | — | Pending |
| UI-09 | — | Pending |
| UI-10 | — | Pending |
| ARCH-01 | — | Pending |
| ARCH-02 | — | Pending |
| ARCH-03 | — | Pending |
| ARCH-04 | — | Pending |
| ARCH-05 | — | Pending |
| ARCH-06 | — | Pending |
| ARCH-07 | — | Pending |
| ARCH-08 | — | Pending |
| ARCH-09 | — | Pending |
| ARCH-10 | — | Pending |
| ARCH-11 | — | Pending |
| ARCH-12 | — | Pending |
| ARCH-13 | — | Pending |
| ARCH-14 | — | Pending |
| BE-01 | — | Pending |
| BE-02 | — | Pending |
| BE-03 | — | Pending |
| BE-04 | — | Pending |
| BE-05 | — | Pending |
| BE-06 | — | Pending |
| TEST-01 | — | Pending |
| TEST-02 | — | Pending |
| TEST-03 | — | Pending |
| TEST-04 | — | Pending |
| TEST-05 | — | Pending |
| TEST-06 | — | Pending |
| TEST-07 | — | Pending |
| TEST-08 | — | Pending |
| TEST-09 | — | Pending |
| TEST-10 | — | Pending |
| TEST-11 | — | Pending |
| TEST-12 | — | Pending |
| TEST-13 | — | Pending |
| TEST-14 | — | Pending |
| TEST-15 | — | Pending |
| TEST-16 | — | Pending |
| TEST-17 | — | Pending |
| TEST-18 | — | Pending |
| DOC-01 | — | Pending |
| DOC-02 | — | Pending |
| DOC-03 | — | Pending |
| DOC-04 | — | Pending |
| DOC-05 | — | Pending |

**Coverage:**
- v1 requirements: 75 total
- Mapped to phases: 0
- Unmapped: 75 ⚠️ (populated by roadmap)

---
*Requirements defined: 2026-04-14*
*Last updated: 2026-04-14 after initial definition*
