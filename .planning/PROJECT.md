# vita-wallet-challenge

## What This Is

Mini aplicación fullstack tipo Vita Wallet — una wallet multi-moneda que permite a un usuario registrarse, consultar balances en fiat y crypto, ver precios crypto en tiempo real desde una API externa, simular intercambios entre monedas, y ver el historial de transacciones. Es la entrega de una prueba técnica para Vita Wallet (Chile) y el público objetivo son los evaluadores técnicos que clonarán el repo, levantarán todo localmente y revisarán código + flujo end-to-end.

## Core Value

Motor de exchange funcional end-to-end: validación de saldo, cálculo correcto con precisión decimal (`BigDecimal`), estados transaccionales (`pending`/`completed`/`rejected`) y persistencia consistente. Si todo lo demás falla, esto debe funcionar.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **AUTH**: Registro con email + password y login que retorna JWT
- [ ] **AUTH**: Endpoints protegidos por middleware JWT (`has_secure_password` + JWT manual)
- [ ] **AUTH**: Persistencia de sesión en frontend (token en storage seguro)
- [ ] **WALLET**: Cada usuario tiene balances en USD, CLP, BTC, USDC, USDT
- [ ] **WALLET**: Consulta de balances autenticada
- [ ] **WALLET**: Validación de saldo suficiente antes de ejecutar transacción
- [ ] **PRICES**: Endpoint backend que consulta `api.stage.vitawallet.io/api/prices_quote`
- [ ] **PRICES**: Cache básico en memoria/Rails.cache para precios (TTL corto)
- [ ] **PRICES**: Manejo de errores de API externa (timeout, 5xx, respuesta inválida)
- [ ] **EXCHANGE**: Intercambio fiat → crypto y crypto → fiat
- [ ] **EXCHANGE**: Cálculo con `BigDecimal` (precisión decimal correcta, sin pérdida)
- [ ] **EXCHANGE**: Transacción atómica en DB (débito origen + crédito destino consistentes)
- [ ] **EXCHANGE**: Estados `pending` → `completed` / `rejected` con razón de rechazo
- [ ] **HISTORY**: Listado paginado de transacciones del usuario autenticado
- [ ] **HISTORY**: Filtro por estado (pending/completed/rejected)
- [ ] **UI**: Login page con manejo de errores y persistencia de sesión
- [ ] **UI**: Dashboard mostrando balances multi-moneda
- [ ] **UI**: Página de Exchange con formulario (moneda origen/destino, monto estimado, confirmación)
- [ ] **UI**: Página de Historial con lista paginada y filtro por estado
- [ ] **UI**: Loading/error states consistentes en todas las páginas
- [ ] **TEST**: RSpec cubriendo casos críticos (auth, exchange engine, saldo)
- [ ] **TEST**: Tests básicos de frontend en hooks y componentes clave
- [ ] **DOC**: README con setup, decisiones técnicas y pendientes
- [ ] **DOC**: Video corto explicando arquitectura

### Out of Scope

- **Deploy real (Heroku/Render/Vercel)** — bonus opcional, no alcanza el tiempo; documentado como pendiente
- **Docker + docker-compose** — bonus opcional, se prefiere setup manual rápido
- **CI/CD pipelines** — bonus opcional, no aporta al core de la evaluación
- **Swagger/OpenAPI docs** — bonus opcional, el README cubre el contrato
- **Pixel-perfect Figma** — estructura y componentes primero, estética si sobra tiempo; se lista como pendiente
- **Refresh tokens / revocación avanzada de JWT** — JWT simple con expiración es suficiente para prueba
- **Email verification / password reset** — el PDF solo pide "Login", no verificación
- **OAuth / social login** — fuera del alcance del PDF
- **2FA** — fuera del alcance del PDF
- **Registro de nuevos usuarios desde UI** — opcional; seed data puede bastar si el tiempo aprieta
- **Tests exhaustivos / coverage alto** — solo se cubren caminos críticos (exchange engine, auth, validación de saldo)
- **Multi-idioma / i18n** — fuera del alcance
- **Notificaciones / emails transaccionales** — fuera del alcance

## Context

**Prueba técnica con plazo ajustado.** El evaluador ya confirmó whitelist de IP para el endpoint de precios (pendiente de activación). El entregable es repo en GitHub/GitLab + README + video explicando arquitectura.

**Endpoint externo**: `https://api.stage.vitawallet.io/api/prices_quote` — acceso por whitelist, detalles de headers/auth/formato se conocerán cuando se habilite el acceso. Hay que diseñar el servicio cliente para ser robusto a fallas (fallback a cache, timeout configurable).

**Experiencia del desarrollador**: Gabriel es semi-senior/senior con 6+ años de experiencia (Rails y React). Prioriza código limpio, arquitectura desacoplada y testeabilidad. La prueba también es oportunidad de mostrar criterio técnico al evaluador.

**Contrato API externa desconocido**: al momento de planificar no tenemos spec del endpoint. Estrategia: abstraer el cliente detrás de un service object con interfaz estable, y definir un stub/fake para desarrollo mientras se habilita el acceso real.

## Constraints

- **Tiempo**: ~1.5 días efectivos (hoy 2026-04-14 completo + mañana en la mañana) — la entrega se envía mañana
- **Stack backend**: Ruby on Rails (API-only) + PostgreSQL — fijado por el PDF
- **Stack frontend**: React — fijado por el PDF
- **Tests backend**: RSpec — fijado por el PDF
- **Tests frontend**: framework libre (elegir: vitest + React Testing Library)
- **Estructura**: Monorepo con `/backend` y `/frontend` en la raíz — un solo README, un solo clone, commits atómicos cross-stack
- **Auth**: `has_secure_password` (bcrypt) + JWT manual — demuestra Rails puro sin Devise, demuestra criterio para JWT sin devise-jwt
- **Precisión monetaria**: `BigDecimal` en todo cálculo de dinero — nunca `Float` para evitar errores de redondeo
- **Stack frontend**:
  - **Vite** como build tool (dev server rápido, HMR, build optimizado)
  - **TypeScript strict mode** (`strict: true`, `noImplicitAny`, `strictNullChecks`)
  - **Cero `any` y cero `unknown`** en todo el código (src + tests) — enforced por ESLint como error
  - **Zod** para schemas y validación: validación de responses de API (runtime type safety), validación de forms, inferencia de tipos con `z.infer`
  - **TanStack Query (React Query)** para manejo de estado de servidor — cache, invalidación, loading/error states
  - Context API para estado global cliente mínimo (AuthContext)
- **Arquitectura frontend** (decisión del usuario):
  - `src/pages/<PageName>/` — cada página es un directorio con el componente Page + subdirectorio `components/` para componentes propios de esa página
  - `src/components/` — componentes transversales reutilizables al mismo nivel que `pages/`
  - `src/hooks/` — custom hooks que cargan **toda la lógica posible** (fetch, estado, side effects, validaciones)
  - `src/services/` — clientes HTTP tipados con generics, parseo de responses con Zod
  - Composition pattern en todos los componentes (children props, slots, compound components donde aplique)
  - Componentes **solo** manejan render/UI; la lógica vive en hooks → máxima testeabilidad y legibilidad
- **Testing — objetivo ≥90% coverage en ambos repos**:
  - Backend: RSpec + SimpleCov con umbral 90% (build falla si baja)
  - Frontend: Vitest (provider `v8`) con umbral 90% (build falla si baja)
  - Cobertura de hooks, services, schemas Zod, componentes clave y flujos de página
  - **Todos los mocks y fixtures tipados** (sin `any`/`unknown`/casts forzados)
- **Arquitectura backend** (decisión del usuario):
  - Rails MVC idiomático + mejores prácticas para API-only
  - Controllers delgados: solo routing, auth, serialización de request/response
  - Service objects para lógica de negocio compleja (ExchangeService, PriceService)
  - Form objects / contracts para validaciones complejas
  - Model callbacks mínimos; lógica en servicios
  - Serializers dedicados (Jbuilder o similar) para shape de respuesta consistente
  - Transacciones DB explícitas donde haya operaciones multi-step (exchange)
  - Código desacoplado y testeable en unidades aisladas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monorepo (`/backend` + `/frontend`) | Un clone, un README, CI unificado posible, commits cross-stack atómicos | — Pending |
| Auth con `has_secure_password` + JWT manual | Demuestra Rails puro sin magia de Devise, JWT para stateless API; Devise + devise-jwt es pesado y oculta mecanismo | — Pending |
| `BigDecimal` en todo cálculo monetario | Precisión decimal correcta, sin errores de `Float`; requisito explícito del PDF | — Pending |
| Cache de precios en `Rails.cache` (memory store) | Simple, sin infra extra (Redis), suficiente para prueba con TTL corto | — Pending |
| Service objects para lógica de negocio | Controllers delgados, testeable en unidades aisladas, alinea con "clean architecture" | — Pending |
| Frontend: Vite + TypeScript strict | Build tool moderno, DX superior, tipado estricto para robustez | — Pending |
| Cero `any` / `unknown` en todo el código | Tipado estricto garantiza correctness, alinea con reglas globales del usuario | — Pending |
| Zod para validación y schemas | Runtime type safety en responses de API + inferencia estática con `z.infer` | — Pending |
| TanStack Query para data fetching | Estado de servidor, cache, loading/error states out-of-the-box | — Pending |
| Frontend: hooks cargan toda la lógica, componentes solo UI | Máxima testeabilidad (hooks testeables sin DOM), separación clara de responsabilidades | — Pending |
| Estructura `pages/<Page>/components/` + `components/` global | Escala bien, localiza componentes por alcance (propio de página vs transversal) | — Pending |
| Composition pattern en todos los componentes | Flexibilidad, evita prop drilling, alinea con React idiomático moderno | — Pending |
| Coverage ≥90% en ambos repos (SimpleCov + Vitest v8) | Robustez del entregable; job-critical; builds fallan bajo el umbral | — Pending |
| Postergar Figma al final | Funcional > estético dado el plazo; si sobra tiempo se aplica, si no se menciona en README | — Pending |
| Saltar bonus (Docker, CI/CD, Deploy, Swagger) | Tiempo insuficiente; proteger el core de la prueba | — Pending |
| Stub del cliente de precios mientras se habilita whitelist | Permite avanzar sin bloqueo; se reemplaza cuando el acceso esté listo | — Pending |

---
*Last updated: 2026-04-14 after initialization*
