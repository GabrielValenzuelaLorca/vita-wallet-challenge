# Requirements: vita-wallet-challenge

**Defined:** 2026-04-14
**Core Value:** Motor de exchange funcional end-to-end con validacion de saldo, precision decimal y estados transaccionales consistentes

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: Usuario puede registrarse con email y password (backend + seed opcional desde frontend)
- [ ] **AUTH-02**: Usuario puede hacer login con email y password y recibe un JWT valido
- [ ] **AUTH-03**: Endpoints protegidos rechazan requests sin JWT o con JWT invalido/expirado
- [ ] **AUTH-04**: Password se persiste usando `has_secure_password` (bcrypt), nunca en texto plano
- [ ] **AUTH-05**: Sesion frontend persiste tras refresh del navegador (JWT guardado en storage seguro)
- [ ] **AUTH-06**: Usuario puede cerrar sesion desde la UI y el token se invalida localmente

### Wallets & Balances

- [x] **WALL-01**: Cada usuario tiene balances en 5 monedas: USD, CLP, BTC, USDC, USDT
- [ ] **WALL-02**: Endpoint autenticado retorna los balances actuales del usuario
- [x] **WALL-03**: Balances se persisten con precision decimal adecuada (`BigDecimal` en Ruby, `DECIMAL` en PostgreSQL)
- [x] **WALL-04**: Existen seeds con usuarios de prueba y balances iniciales razonables para demo

### Crypto Prices

- [ ] **PRIC-01**: Endpoint backend expone precios consultando `api.stage.vitawallet.io/api/prices_quote`
- [ ] **PRIC-02**: Service client del endpoint externo esta abstraido detras de un service object con interfaz estable
- [ ] **PRIC-03**: Precios se cachean en `Rails.cache` con TTL corto (30-60s) para reducir llamadas al externo
- [ ] **PRIC-04**: Manejo robusto de errores de API externa: timeout, 5xx, formato invalido -> respuesta controlada al cliente
- [ ] **PRIC-05**: Stub/fake del cliente disponible para desarrollo mientras se habilita whitelist

### Exchange (Core)

- [ ] **EXCH-01**: Endpoint autenticado permite intercambiar fiat -> crypto (ej: USD -> BTC)
- [ ] **EXCH-02**: Endpoint autenticado permite intercambiar crypto -> fiat (ej: BTC -> USD)
- [ ] **EXCH-03**: Pre-validacion de saldo suficiente antes de ejecutar la operacion
- [ ] **EXCH-04**: Calculo del monto recibido usa `BigDecimal`, nunca `Float`; precision monetaria preservada
- [ ] **EXCH-05**: La transaccion es atomica: debito y credito ocurren dentro de `ActiveRecord::Base.transaction`
- [ ] **EXCH-06**: Cada operacion crea un registro `Transaction` con estado `pending` -> `completed` o `rejected`
- [ ] **EXCH-07**: Transaccion rechazada incluye `rejection_reason` (ej: "insufficient_balance", "price_fetch_failed")
- [ ] **EXCH-08**: Cotizacion (exchange rate) usada en el calculo se persiste en la transaccion para auditoria

### Transaction History

- [ ] **HIST-01**: Endpoint autenticado lista las transacciones del usuario
- [ ] **HIST-02**: Listado soporta paginacion (ej: `page` y `per_page` en query params)
- [ ] **HIST-03**: Listado soporta filtro por estado (`pending`, `completed`, `rejected`)
- [ ] **HIST-04**: Respuesta incluye todos los campos necesarios para mostrar: fechas, montos, monedas, estado, razon de rechazo si aplica

### Frontend UI

- [ ] **UI-01**: Pagina de Login con formulario, validacion, manejo de errores del backend
- [ ] **UI-02**: Persistencia de sesion: usuario autenticado se mantiene logueado tras refresh
- [ ] **UI-03**: Pagina Dashboard muestra todos los balances del usuario con formato adecuado por moneda
- [ ] **UI-04**: Pagina Exchange con formulario: seleccionar moneda origen, moneda destino, monto
- [ ] **UI-05**: Pagina Exchange muestra monto estimado en tiempo real antes de confirmar
- [ ] **UI-06**: Pagina Exchange confirma la operacion y muestra resultado (exito/rechazo)
- [ ] **UI-07**: Pagina Historial muestra lista paginada de transacciones
- [ ] **UI-08**: Pagina Historial incluye filtro por estado
- [ ] **UI-09**: Todas las paginas tienen loading states y error states consistentes
- [ ] **UI-10**: Navegacion entre paginas autenticadas con ruta protegida (redirige a login si no hay sesion)

### Frontend Architecture & Stack

- [ ] **ARCH-01**: Estructura `src/pages/<PageName>/` -- cada pagina es un directorio con el componente Page y su subdirectorio `components/` para componentes propios
- [ ] **ARCH-02**: Directorio `src/components/` al mismo nivel que `pages/` para componentes transversales reutilizables
- [ ] **ARCH-03**: Directorio `src/hooks/` con custom hooks que cargan toda la logica (fetch, estado, side effects, validaciones)
- [ ] **ARCH-04**: Directorio `src/services/` con clientes HTTP y abstracciones de API
- [ ] **ARCH-05**: Componentes usan composition pattern (children, slots, compound components donde aplique)
- [ ] **ARCH-06**: Componentes solo manejan render/UI; la logica vive en hooks (maxima testeabilidad)
- [ ] **ARCH-07**: Manejo de estado de servidor con TanStack Query (React Query) -- cache, invalidacion, loading/error states out-of-the-box
- [ ] **ARCH-08**: Estado global cliente minimo con Context API (AuthContext, y quizas UI context si aplica)
- [ ] **ARCH-09**: Build tool **Vite** con plugin React + TypeScript
- [ ] **ARCH-10**: TypeScript **strict mode** (`strict: true`, `noImplicitAny`, `strictNullChecks`)
- [ ] **ARCH-11**: **Cero `any` y cero `unknown`** en todo el codigo (src, tests, mocks) -- enforced por regla ESLint (`@typescript-eslint/no-explicit-any` como error)
- [ ] **ARCH-12**: **Zod** para validacion de schemas: validacion de respuestas del API, validacion de forms, inferencia de tipos desde schemas (`z.infer`)
- [ ] **ARCH-13**: Cliente HTTP (axios o fetch) tipado con generics, sin `any` -- capa services encapsula llamadas y parsea con Zod
- [ ] **ARCH-14**: Todos los hooks personalizados tienen tipos de entrada y salida explicitos

### Backend Architecture

- [x] **BE-01**: Rails API-only con PostgreSQL
- [ ] **BE-02**: Controllers delgados -- solo routing, auth, serializacion de request/response
- [ ] **BE-03**: Logica de negocio compleja vive en service objects (`ExchangeService`, `PriceService`, `AuthService`)
- [x] **BE-04**: Serializers dedicados para shape consistente de respuestas
- [ ] **BE-05**: Transacciones DB explicitas en operaciones multi-step (exchange)
- [ ] **BE-06**: Middleware de autenticacion JWT aplicado a endpoints protegidos

### Testing -- Target >=90% coverage en ambos repos

#### Backend (RSpec + SimpleCov)

- [ ] **TEST-01**: `ExchangeService` -- happy path fiat->crypto, crypto->fiat, saldo insuficiente, error de precios, transaccion rechazada, rollback en fallo
- [ ] **TEST-02**: `AuthService` / sesiones -- credenciales validas, invalidas, JWT generation, JWT expirado, JWT invalido, `has_secure_password` match
- [ ] **TEST-03**: `PriceService` -- cache hit, cache miss, TTL, error de API externa (timeout, 5xx, respuesta invalida), fallback
- [ ] **TEST-04**: Request specs para endpoints criticos -- `POST /auth/login`, `GET /balances`, `POST /exchange`, `GET /transactions`
- [ ] **TEST-05**: Request specs cubren autenticacion -- 401 sin token, 401 token invalido/expirado, 200 con token valido
- [ ] **TEST-06**: Model specs -- validaciones de `User`, `Wallet`, `Transaction` (presencia, formato, unicidad, precision decimal)
- [ ] **TEST-07**: Serializers specs -- shape de respuesta correcto, campos sensibles excluidos (password_digest)
- [ ] **TEST-08**: SimpleCov configurado con umbral `>=90%` lineas totales -- el build falla bajo ese umbral
- [ ] **TEST-09**: Specs de integracion del flujo completo exchange (happy path end-to-end backend)

#### Frontend (Vitest + React Testing Library + MSW)

- [ ] **TEST-10**: Tests de **todos** los custom hooks (fetch, estado, calculos) -- mocks de API con MSW o fakes tipados
- [ ] **TEST-11**: Tests de **todos** los service objects (clientes HTTP, parseo Zod, manejo de errores)
- [ ] **TEST-12**: Tests de **todos** los schemas Zod -- inputs validos/invalidos, mensajes de error
- [ ] **TEST-13**: Tests de componentes clave: Login form, Exchange form, Balances display, Transaction history list, filtros
- [ ] **TEST-14**: Tests de flujos de pagina: login exitoso/fallido, exchange exitoso/rechazado, carga de historial con filtro
- [ ] **TEST-15**: Tests cubren loading states y error states (React Query `isLoading`, `isError`, `error`)
- [ ] **TEST-16**: Tests de routing protegido -- usuario no autenticado redirigido a login
- [ ] **TEST-17**: Vitest configurado con coverage (`v8` provider) y umbral `>=90%` lineas totales -- el build falla bajo ese umbral
- [ ] **TEST-18**: Todos los mocks y fixtures en tests son **tipados**, sin `any` ni `unknown` ni casts forzados

### Documentation & Delivery

- [ ] **DOC-01**: README con seccion Setup (clone, instalar deps, crear DB, seeds, levantar servers)
- [ ] **DOC-02**: README con seccion Decisiones Tecnicas (stack, arquitectura, auth, cache, precision decimal)
- [ ] **DOC-03**: README con seccion Pendientes (bonus no incluidos, Figma pixel-perfect, etc.)
- [ ] **DOC-04**: README con seccion de como correr los tests
- [ ] **DOC-05**: Video corto (2-5 min) explicando arquitectura y flujos principales

## v2 Requirements

Descartados explicitamente por plazo; se mencionan en README como posibles mejoras.

### Bonus (PDF)

- **BON-01**: Deploy funcional (Heroku/Render/Vercel)
- **BON-02**: Dockerizacion + docker-compose
- **BON-03**: Pipeline CI/CD (GitHub Actions)
- **BON-04**: UI pixel-perfect Figma
- **BON-05**: Documentacion Swagger/OpenAPI del backend

### Features adicionales

- **V2-01**: Registro de usuarios desde UI (si no hay tiempo para UI, se usan seeds)
- **V2-02**: Refresh tokens / revocacion de JWT
- **V2-03**: Email verification / password reset
- **V2-04**: Notificaciones (in-app o email)

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth / Social login | No pedido por el PDF, complejidad innecesaria |
| 2FA | Fuera del alcance del PDF |
| Multi-idioma / i18n | Fuera del alcance del PDF |
| Tests E2E (Cypress/Playwright) | Tiempo insuficiente, tests unitarios + integracion bastan |
| Tests exhaustivos / coverage alto | Prioridad es cubrir caminos criticos (auth, exchange) |
| Transacciones reales (no simulacion) | El PDF dice "Simular intercambio", no pide integracion con exchange real |
| Mobile responsive pixel-perfect | Layout web funcional, mobile como bonus si sobra tiempo |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Pending |
| AUTH-02 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| AUTH-04 | Phase 2 | Pending |
| AUTH-05 | Phase 2 | Pending |
| AUTH-06 | Phase 2 | Pending |
| WALL-01 | Phase 1 | Complete |
| WALL-02 | Phase 3 | Pending |
| WALL-03 | Phase 1 | Complete |
| WALL-04 | Phase 1 | Complete |
| PRIC-01 | Phase 3 | Pending |
| PRIC-02 | Phase 3 | Pending |
| PRIC-03 | Phase 3 | Pending |
| PRIC-04 | Phase 3 | Pending |
| PRIC-05 | Phase 3 | Pending |
| EXCH-01 | Phase 4 | Pending |
| EXCH-02 | Phase 4 | Pending |
| EXCH-03 | Phase 4 | Pending |
| EXCH-04 | Phase 4 | Pending |
| EXCH-05 | Phase 4 | Pending |
| EXCH-06 | Phase 4 | Pending |
| EXCH-07 | Phase 4 | Pending |
| EXCH-08 | Phase 4 | Pending |
| HIST-01 | Phase 5 | Pending |
| HIST-02 | Phase 5 | Pending |
| HIST-03 | Phase 5 | Pending |
| HIST-04 | Phase 5 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| UI-03 | Phase 3 | Pending |
| UI-04 | Phase 5 | Pending |
| UI-05 | Phase 5 | Pending |
| UI-06 | Phase 5 | Pending |
| UI-07 | Phase 5 | Pending |
| UI-08 | Phase 5 | Pending |
| UI-09 | Phase 2 | Pending |
| UI-10 | Phase 2 | Pending |
| ARCH-01 | Phase 1 | Pending |
| ARCH-02 | Phase 1 | Pending |
| ARCH-03 | Phase 1 | Pending |
| ARCH-04 | Phase 1 | Pending |
| ARCH-05 | Phase 2 | Pending |
| ARCH-06 | Phase 2 | Pending |
| ARCH-07 | Phase 1 | Pending |
| ARCH-08 | Phase 1 | Pending |
| ARCH-09 | Phase 1 | Pending |
| ARCH-10 | Phase 1 | Pending |
| ARCH-11 | Phase 1 | Pending |
| ARCH-12 | Phase 1 | Pending |
| ARCH-13 | Phase 1 | Pending |
| ARCH-14 | Phase 1 | Pending |
| BE-01 | Phase 1 | Complete |
| BE-02 | Phase 2 | Pending |
| BE-03 | Phase 2 | Pending |
| BE-04 | Phase 1 | Complete |
| BE-05 | Phase 4 | Pending |
| BE-06 | Phase 2 | Pending |
| TEST-01 | Phase 4 | Pending |
| TEST-02 | Phase 2 | Pending |
| TEST-03 | Phase 3 | Pending |
| TEST-04 | Phase 4, Phase 5 | Pending |
| TEST-05 | Phase 2 | Pending |
| TEST-06 | Phase 2, Phase 3 | Pending |
| TEST-07 | Phase 3 | Pending |
| TEST-08 | Phase 1 | Pending |
| TEST-09 | Phase 4 | Pending |
| TEST-10 | Phase 2, Phase 5 | Pending |
| TEST-11 | Phase 3 | Pending |
| TEST-12 | Phase 3 | Pending |
| TEST-13 | Phase 2, Phase 5 | Pending |
| TEST-14 | Phase 5 | Pending |
| TEST-15 | Phase 3, Phase 5 | Pending |
| TEST-16 | Phase 2 | Pending |
| TEST-17 | Phase 1 | Pending |
| TEST-18 | Phase 2 | Pending |
| DOC-01 | Phase 6 | Pending |
| DOC-02 | Phase 6 | Pending |
| DOC-03 | Phase 6 | Pending |
| DOC-04 | Phase 6 | Pending |
| DOC-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 80 total
- Mapped to phases: 80
- Unmapped: 0

**Note:** Some TEST-* requirements span multiple phases because they are integration tests that grow as features are added. The primary phase listed first is where the test infrastructure is created; the second phase extends it.

---
*Requirements defined: 2026-04-14*
*Last updated: 2026-04-14 after roadmap creation*
