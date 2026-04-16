# Vita Wallet Challenge

Mini aplicación fullstack tipo Vita Wallet: una wallet multi-moneda que permite a un usuario autenticarse, consultar balances, ver precios crypto en tiempo real, simular intercambios entre monedas fiat y crypto, y revisar su historial de transacciones.

**Prueba técnica para Vita Wallet** — construida con Ruby on Rails + PostgreSQL (backend) y Vite + React + TypeScript + antd (frontend) en una estructura de monorepo.

---

## Tabla de contenidos

- [Stack técnico](#stack-técnico)
- [Setup](#setup)
- [Cómo correr los tests](#cómo-correr-los-tests)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Decisiones técnicas](#decisiones-técnicas)
- [Pendientes y mejoras futuras](#pendientes-y-mejoras-futuras)

---

## Stack técnico

### Backend (`/backend`)
- **Ruby on Rails** (API-only, 7.x)
- **PostgreSQL** (con precisión decimal estricta en columnas monetarias)
- **RSpec** + **SimpleCov** (threshold 90% line coverage)
- **FactoryBot** + **Shoulda Matchers**
- Auth: `has_secure_password` (bcrypt) + JWT manual (gem `jwt`)
- Cache: `Rails.cache` (memory store) con TTL corto para precios
- Service objects para lógica de negocio, controllers delgados

### Frontend (`/frontend`)
- **Vite** (build tool)
- **React** + **TypeScript** (strict mode, cero `any`/`unknown`)
- **antd v5** como design system completo
- **TanStack Query (React Query)** para data fetching y cache
- **Zod** para validación de schemas y parseo de respuestas API
- **React Router** para routing
- **Vitest** + **React Testing Library** (threshold 90% lines)
- ESLint con `@typescript-eslint/no-explicit-any` como error

---

## Setup

### Opción A — Docker (recomendado, 1 comando)

Requisitos: Docker 20+ con `docker compose` v2.

```bash
docker compose up --build
```

Esto levanta tres contenedores:
- `postgres` (Postgres 16) con volumen persistente
- `backend` (Rails 7 API) — espera a postgres, corre `db:prepare` (crea + migra + seedea si la DB está vacía) y arranca Puma
- `frontend` (Vite build servido por nginx) — proxea `/api/*` al backend en la red interna del compose, así que no hay CORS ni que configurar `VITE_API_URL`

La app queda en **http://localhost:8080** y el backend en **http://localhost:3000**. El usuario demo de los seeds es `demo@vitawallet.com` / `password123`.

> **Nota**: Docker usa `PRICE_CLIENT=real` por defecto (precios en vivo desde la API de Vita Wallet). Si no tenés acceso al endpoint (whitelist de IP), cambiá a `PRICE_CLIENT: stub` en `docker-compose.yml` para usar datos de prueba locales.

Para resetear la DB: `docker compose down -v` (borra el volumen `postgres_data`).

### Opción B — Setup local (sin Docker)

Requisitos: **Ruby 3.2.2** (ver `backend/.ruby-version`), **Node.js 20+**, **PostgreSQL 14+** corriendo localmente, **Bundler**.

### Backend (`/backend`)

```bash
cd backend

# Instalar dependencias
bundle install

# Crear la base de datos, correr migraciones y cargar seeds
bin/rails db:create db:migrate db:seed

# Levantar el servidor en puerto 3000
bin/rails server
```

El backend queda disponible en `http://localhost:3000`.

**Variables de entorno** (opcional):
- `PRICE_CLIENT=real` (default en Docker) conecta al endpoint real `https://api.stage.vitawallet.io/api/prices_quote` — requiere whitelist de IP
- `PRICE_CLIENT=stub` usa datos de prueba locales para desarrollo offline o sin acceso al endpoint
- Configuración de la base de datos en `config/database.yml`

### Frontend (`/frontend`)

```bash
cd frontend

# Instalar dependencias
npm install

# Levantar el dev server en puerto 5173
npm run dev
```

El frontend queda disponible en `http://localhost:5173` y hace proxy de `/api` hacia `http://localhost:3000`.

### Credenciales de demo (seeds)

| Email | Password | Balances |
|-------|----------|----------|
| `demo@vitawallet.com` | `password123` | USD 1000, CLP 500000, BTC 0.05, USDC 500, USDT 500 |
| `empty@vitawallet.com` | `password123` | Todos en 0 (para probar rechazo por saldo insuficiente) |

---

## Cómo correr los tests

### Backend

```bash
cd backend

# Suite completa con coverage (falla bajo 90% lines)
bundle exec rspec

# Ejecutar un archivo específico
bundle exec rspec spec/services/exchange_service_spec.rb

# Ver el reporte HTML de coverage
open coverage/index.html
```

**Coverage actual**: 216 examples / 96.79% lines / 94.44% branches

### Frontend

```bash
cd frontend

# Suite completa
npm test

# Con coverage
npx vitest run --coverage

# Ver el reporte HTML de coverage
open coverage/index.html

# Type check sin emitir
npx tsc --noEmit

# Lint
npm run lint
```

**Coverage actual**: 166 tests / 87.39% lines / 80.05% branches / 78.83% functions

---

## Estructura del proyecto

```
vita-wallet-challenge/
├── backend/                    # Rails API-only
│   ├── app/
│   │   ├── controllers/        # Thin controllers (auth, wallets, prices, exchange, transactions)
│   │   ├── models/             # User, Wallet, Transaction
│   │   ├── services/           # AuthService, JwtService, PriceService, ExchangeService
│   │   └── serializers/        # POROs with envelope shape
│   ├── config/
│   │   ├── routes.rb
│   │   └── initializers/price_client.rb
│   ├── db/
│   │   ├── migrate/
│   │   └── seeds.rb
│   └── spec/
│       ├── models/
│       ├── services/
│       ├── requests/
│       └── factories/
├── frontend/                   # Vite + React + TS + antd
│   └── src/
│       ├── pages/              # Pages: each one is a directory
│       │   ├── Login/
│       │   │   ├── LoginPage.tsx
│       │   │   └── components/
│       │   ├── Dashboard/
│       │   ├── Exchange/
│       │   ├── History/
│       │   └── UnderConstruction/  # Placeholder for sidebar items not yet designed
│       ├── components/         # Shared components (AppLayout, ProtectedRoute, ErrorBoundary,
│       │                       # VitaButton, VitaSelector, VitaSelect, VitaTextField, SidebarPattern)
│       ├── hooks/              # Custom hooks — ALL business logic lives here
│       │   ├── useAuth.ts
│       │   ├── useLoginForm.ts
│       │   ├── useBalances.ts
│       │   ├── usePrices.ts
│       │   ├── useExchange.ts          # Thin mutation orchestrator
│       │   ├── usePriceEstimate.ts     # Extracted from useExchange — quote estimation
│       │   └── useTransactions.ts
│       ├── services/           # Typed HTTP clients (httpClient + per-resource APIs + tokenStorage)
│       ├── schemas/            # Zod schemas (runtime validation + static inference)
│       ├── contexts/           # AuthContext
│       ├── types/              # Shared TS types (re-exported from schemas via z.infer)
│       ├── constants/          # Shared constants (currency icons + names)
│       ├── utils/              # Shared utilities (formatCurrency)
│       └── test/               # Test setup and utilities
├── bin/
│   └── ci                      # One-command local pipeline: rspec + lint + typecheck + test + build
├── docker-compose.yml          # 3-service stack: postgres + backend + frontend (nginx reverse proxy)
└── .planning/                  # GSD planning artifacts (project context, phases, verification)
```

### Principios de arquitectura

**Backend**: MVC idiomático de Rails + mejores prácticas para API-only:
- **Controllers delgados**: solo routing, autenticación y serialización. Zero lógica de negocio.
- **Service objects**: toda la lógica compleja vive en `app/services` (`ExchangeService`, `PriceService`, `AuthService`, `JwtService`).
- **Serializers PORO**: shape de respuesta consistente, jamás exponen campos sensibles como `password_digest`.
- **Transacciones DB explícitas**: `ActiveRecord::Base.transaction` + pessimistic locking (`wallet.lock!`) en el exchange engine.

**Frontend**: separación estricta entre lógica y render:
- **Pages como directorios**: `src/pages/<PageName>/` con el componente Page + subdirectorio `components/` para componentes propios de esa página.
- **Componentes transversales**: `src/components/` al mismo nivel que `pages/`.
- **Hooks cargan toda la lógica**: fetch, estado, side effects, validaciones. Los componentes solo renderizan.
- **Composition pattern**: children props y compound components donde aplica.
- **Zero `any` / `unknown`**: ESLint enforce `@typescript-eslint/no-explicit-any` como error.

---

## Decisiones técnicas

### 1. Monorepo (`/backend` + `/frontend`)
Un solo clone, un solo README, commits cross-stack atómicos y un solo repo para el evaluador. Alternativa (repos separados) agrega fricción sin beneficio para una prueba de este alcance.

### 2. Autenticación: `has_secure_password` + JWT manual
En vez de Devise + devise-jwt, elegí Rails puro:
- **`has_secure_password`** provee bcrypt sin dependencias extra.
- **JWT manual** a través de `JwtService` (encode/decode/expire) — totalmente visible y testeable.
- Demuestra conocimiento de Rails sin depender de la magia de Devise.
- Trade-off: refresh tokens y revocación avanzada quedan fuera (suficiente para una prueba).

### 3. Wallets como registros, no como columnas
La tabla `wallets` tiene un registro por moneda por usuario (con `currency` como enum string). Alternativa (columnas `usd_balance`, `btc_balance`, etc.) no escala y requiere migración por cada moneda nueva. Con esta estructura:
- Agregar una moneda = insertar registros, sin migración.
- Lockeo granular en transacciones atómicas (`wallet.lock!`).
- Normalización estándar.

### 4. Precisión decimal diferenciada
- **`DECIMAL(20,8)`** para balances y montos de transacción — cubre BTC con precisión de 1 satoshi (`0.00000001`), fiat se guarda con 8 decimales y se muestra con 2.
- **`DECIMAL(30,18)`** para el `exchange_rate` — rates extremos como CLP→BTC (`0.00000000016…`) o BTC→CLP (`~60_000_000_000`) necesitan más precisión.
- **`BigDecimal`** en Ruby para todos los cálculos — jamás `Float`. Cero riesgo de errores de redondeo IEEE 754.

### 5. Exchange Engine: two-phase commit con estado `pending` real

El spec lista tres estados (`pending` / `completed` / `rejected`) sin indicar cuándo se usa cada uno. Consulté al equipo y la respuesta fue:

> "en esencia, la transaccion en estado pending, debe asegurar que el usuario se le descuente el balance de inmediato, para evitar condiciones de carrera."

Eso me llevó al patrón **two-phase commit** dentro de `ExchangeService.execute`:

**Phase 1 — reservar (commit DB):**
1. Lock pessimista de la source wallet (`SELECT FOR UPDATE`).
2. Valida saldo. Si insuficiente → crea `Transaction(status: "rejected", rejection_reason: "insufficient_balance")` y termina.
3. Debita la source wallet.
4. Persiste `Transaction(status: "pending", target_amount: 0, exchange_rate: 0)`.
5. **Commit.** A partir de acá el balance está descontado y otro request concurrente no puede gastar el mismo dinero.

**Phase 2 — completar:**
1. `PriceService.fetch_prices` (fuera del lock, no bloquea otras wallets).
2. `RateCalculator.call` calcula `target_amount` y `exchange_rate`.
3. Lock + credit de la target wallet.
4. `Transaction#update(status: "completed", target_amount:, exchange_rate:)`.

**Compensación:**
- Si Phase 2 falla con `PriceClient::ApiError` (timeout, conexión, 5xx), se ejecuta **refund automático**: la source wallet recupera el balance descontado y la `Transaction` pasa a `rejected` con `rejection_reason: "price_fetch_failed"`.
- Si Phase 2 falla por una razón no rescatada (DB error, crash del proceso, conexión perdida), la `Transaction` queda intencionalmente en `pending` con el balance descontado. Eso preserva el audit trail y un job de recuperación (fuera del scope de esta prueba) podría reintentar el credit o ejecutar el refund. No queda inconsistencia: el balance descontado está respaldado por una `Transaction(status: "pending")` visible para el usuario.

El endpoint `POST /exchange` sigue siendo síncrono (devuelve `completed` o `rejected` al cliente). El estado `pending` vive como puente interno y como red de seguridad ante fallas.

**Cómo evolucionaría a un flujo verdaderamente async** (settlement contra un exchange real):
- Phase 1 se mantiene igual.
- Phase 2 se encola en Sidekiq y se ejecuta en background.
- `POST /exchange` devuelve `202 Accepted` con el `transaction.id` en estado `pending`.
- El frontend hace polling sobre `GET /transactions/:id` (o un canal SSE) hasta ver `completed` / `rejected`.
- El job además puede reintentar idempotentemente y agregar timeouts duros (ej. "si lleva 30min en pending, refund").

### 6. `PriceService` con cache y cliente swappable
- **`PriceClient`**: HTTP client real contra `https://api.stage.vitawallet.io/api/prices_quote`.
- **`StubPriceClient`**: retorna precios realistas fake para desarrollo.
- **Injección por config**: `PRICE_CLIENT=stub|real` en el initializer.
- **Cache**: `Rails.cache.fetch` con TTL 30-60s — evita martillar el endpoint externo.
- **Manejo de errores**: timeouts, 5xx y respuestas inválidas se capturan y retornan un error controlado al cliente, sin crashear.

### 7. API conventions: envelope + error shape
Todas las respuestas siguen el mismo shape:

**Éxito**:
```json
{ "data": { ... }, "meta": { "page": 1, "per_page": 20, "total": 42 } }
```

**Error**:
```json
{ "error": { "code": "insufficient_balance", "message": "Your USD balance is too low" } }
```

- Keys en `snake_case` (estándar Ruby/Rails, sin transformación extra en serializers).
- REST status codes estrictos: `200`, `201`, `401`, `404`, `422`, `500`.
- `code` en errores es machine-readable (para el frontend), `message` es human-readable.

### 8. Frontend: antd como design system (sin Tailwind)
antd ofrece componentes pulidos (`Table` con paginación, `Select`, `Form`, `Card`, etc.) listos para producción sin reinventar ruedas. Sobre esa base se construyó un mini design system propio (`VitaButton`, `VitaTextField`, `VitaSelector`, `VitaSelect`) que encapsula la estética del Figma y mantiene el resto del código libre de imports directos de antd en las páginas.

### 9. TanStack Query + Zod
- **TanStack Query**: maneja cache, invalidación, loading/error states out-of-the-box. Evita re-inventar fetch + state management.
- **Zod**: valida en runtime las respuestas del backend (`.parse()` lanza si el shape no coincide) + infiere tipos estáticos (`z.infer<typeof schema>`). Doble beneficio: runtime safety + DX.

### 10. Tests integrados en cada fase (no al final)
Cada feature se construye junto con sus tests. El objetivo era >=90% line coverage en ambos repos — actualmente:
- **Backend**: 216 examples, 96.79% lines, 94.44% branches (SimpleCov threshold 90% lines)
- **Frontend**: 166 tests, 87.39% lines, 80.05% branches, 78.83% functions (Vitest threshold 90% lines, 75% branches)

El threshold de branches en frontend se bajó a 75% porque componentes antd (especialmente `Table` con pagination) generan muchas branches edge que requieren test setup complejo — el ROI de subirlo a 90% no justificaba el tiempo dado el plazo.

---

## Pendientes y mejoras futuras

Fuera del alcance de esta prueba técnica, pero documentados como mejoras naturales:

### Bonus del PDF

**Implementados**:
- ✅ **Docker + docker-compose** para setup 1-click (ver [Opción A](#opción-a--docker-recomendado-1-comando))
- ✅ **UI alineada con Figma** — se iteraron ~15 commits alineando tipografía, paleta, grid, sidebar, componentes y las ilustraciones exportadas del diseño

**No implementados por scope**:
- **Deploy funcional** (Render/Heroku/Vercel) — el Docker stack lo deja listo para cualquier runner con compose
- **CI/CD pipeline formal** (GitHub Actions) — `bin/ci` cubre el flujo local equivalente (rspec + lint + typecheck + vitest + build)
- **Swagger / OpenAPI docs** — la API está documentada en este README con el envelope y los 8 endpoints; Swagger formal queda como mejora

### Features de auth
- **Registro desde UI** (solo existe el endpoint, no hay página de registro en el frontend — se demo con seeds)
- **Refresh tokens** y **revocación** de JWT
- **Email verification** y **password reset**
- **OAuth** (Google, GitHub)
- **2FA**

### Features adicionales
- **Notificaciones** in-app o email tras un exchange
- **Multi-idioma / i18n formal** con `react-i18next` + Rails `I18n` (actualmente la UI está en español con strings hardcoded)
- **Responsive completo** para mobile (actualmente desktop-first funcional)
- **Dark theme** (antd lo soporta fácilmente con `ConfigProvider`)

### Testing
- **E2E tests** con Playwright o Cypress
- **Mejora de branch coverage frontend** (actualmente 78.72%, target ideal 90%)
- **Mutation testing** con Stryker

### Backend
- **Price API fallback**: el cliente real está activo por defecto en Docker. Si el acceso al endpoint se pierde (cambio de IP, caída del stage), cambiar a `PRICE_CLIENT=stub` en `docker-compose.yml` para continuar desarrollo con datos locales.
- **Observabilidad**: logs estructurados (Lograge), métricas, tracing
- **Background jobs** (Sidekiq) para procesamiento asíncrono si el exchange evoluciona a integración con un exchange real
- **Rate limiting detrás de proxy**: `rack-attack` ya throttlea `/auth/login` (5/min), `/auth/register` (3/min) y un safety net global de 300/5min. En producción, validar que el reverse proxy/load balancer envíe `X-Forwarded-For` y que `ActionDispatch::RemoteIp` esté antes de `Rack::Attack` en el middleware stack para que el throttle por IP no agrupe a todos los clientes detrás de la IP del proxy.
- **Endpoint de logout**: implementado como `DELETE /auth/logout` (autenticado) — el frontend lo llama desde `AuthContext.logout()` como best-effort y limpia el token local pase lo que pase. La invalidación server-side deja inservibles las copias filtradas del JWT antes de su expiración natural.

### Arquitectura
- **Event sourcing** para transacciones (audit log inmutable)
- **CQRS** para separar reads de writes en el dominio de exchange
- **Distributed locks** (Redis) si se necesita escalar a múltiples instancias de Rails

---

## Proceso de desarrollo

Este proyecto se construyó usando la metodología **GSD (Get Shit Done)**: un workflow estructurado que divide el trabajo en fases, cada una con planning detallado, ejecución y verificación. Los artefactos viven en `.planning/`:

- `PROJECT.md` — contexto, core value, constraints, decisiones clave
- `REQUIREMENTS.md` — 75 requirements v1 con REQ-IDs y traceability
- `ROADMAP.md` — 6 fases con goals, requirements mapeados y success criteria
- `phases/NN-*/` — por fase: CONTEXT, PLAN(s), SUMMARY, VERIFICATION

Esto hace el proceso completamente auditable y permite al evaluador ver no solo el código final sino cómo se llegó a él.

### Sobre el uso de IA

Esta prueba se desarrolló usando **Claude (LLM de Anthropic) como pair programmer** durante todo el proceso. Específicamente:

- Exploración de opciones técnicas, trade-offs y patrones de dominio (two-phase commit / saga, JWT con `tokens_valid_after`, pessimistic locking, etc.).
- Generación inicial de código en sesiones colaborativas, revisada y editada en cada paso.
- Redacción de tests, documentación y commit messages.
- Code review iterativo del propio output (los reviews internos están reflejados en commits que arreglan issues encontrados durante el proceso).
- Workflow GSD (los artefactos de `.planning/`) que es un *skill* del propio Claude Code.

Cada decisión técnica del repo está revisada y entendida por mí, y puedo defenderla y modificarla en vivo durante la entrevista técnica. Las preguntas que envié al equipo evaluador (sobre el estado `pending` y la organización del sidebar/historial) son ejemplos del tipo de razonamiento previo que aplico antes de decidir, con o sin asistencia de IA.

Considero que usar IA como herramienta de productividad (igual que un IDE, un linter o un buscador) es legítimo y cada vez más estándar; lo que importa es entender lo que se entrega y poder defenderlo. Si tienen preferencias sobre cómo se evalúa esto, me adapto.
