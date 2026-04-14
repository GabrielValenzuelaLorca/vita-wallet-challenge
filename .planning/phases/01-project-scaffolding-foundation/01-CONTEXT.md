# Phase 1: Project Scaffolding & Foundation - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Initialize both repos (Rails API-only backend + Vite React TS frontend) with correct tooling, DB schema with migrations and seed data, and test infrastructure with coverage thresholds configured. After this phase, all subsequent phases can immediately write features and tests without setup friction.

</domain>

<decisions>
## Implementation Decisions

### Seed Data
- 2 seed users:
  - Principal: `demo@vitawallet.com` / `password123` — balances realistas (USD ~1000, CLP ~500000, BTC ~0.05, USDC ~500, USDT ~500)
  - Edge case: `empty@vitawallet.com` / `password123` — saldo cero en todas las monedas (demuestra validacion de saldo en exchange)
- Cada usuario tiene 5 registros en `wallets` (uno por moneda)
- Credenciales documentadas en README para que el evaluador entre rapido

### Frontend Styling & Design System
- **antd** como design system completo — layout, componentes, tipografia, spacing
- NO Tailwind — antd maneja todo el styling
- Solo light theme (ConfigProvider default)
- Desktop-first funcional — se ve bien en desktop, no se rompe en mobile pero responsive no es prioridad
- Import antd styles via CSS-in-JS (default de antd v5+)

### Database Precision
- Wallets son **registros separados** (tabla `wallets` con `user_id`, `currency`, `balance`), no columnas por moneda
- Balances y montos de transaccion: `DECIMAL(20,8)` — cubre BTC (8 decimales = satoshi), fiat se almacena con 8 pero se muestra con 2
- Exchange rate en tabla `transactions`: `DECIMAL(30,18)` — precision maxima para rates extremos (ej: CLP/BTC)
- Calculos intermedios siempre con `BigDecimal` en Ruby — sin `Float` jamas
- La precision de display se maneja en la capa de aplicacion (serializers backend, formatters frontend) segun el tipo de moneda

### API Response Conventions
- Respuestas exitosas con envelope: `{ "data": { ... }, "meta": { ... } }`
  - `meta` contiene paginacion cuando aplica: `{ "page": 1, "per_page": 20, "total": 100 }`
- Respuestas de error estructuradas: `{ "error": { "code": "insufficient_balance", "message": "..." } }`
  - `code` es machine-readable (snake_case), `message` es human-readable
- HTTP status codes REST estrictos: 200, 201, 401, 404, 422, 500
- Keys JSON en `snake_case` — consistente con Ruby/Rails, sin transformacion necesaria en serializers

### Claude's Discretion
- Estructura exacta del Gemfile y package.json (versiones, gemas/packages adicionales de soporte)
- ESLint + Prettier config exacta (siempre que enforce no-any estricto)
- Estructura de directorios de tests en ambos repos
- Configuracion de SimpleCov y Vitest coverage (siempre que ambos tengan umbral 90%)
- HTTP client choice en frontend (axios vs fetch wrapper) — siempre tipado sin any

</decisions>

<specifics>
## Specific Ideas

- El evaluador debe poder clonar, instalar deps, crear DB, seedear, y levantar ambos servers con los minimos pasos posibles. Optimizar DX del setup.
- `demo@vitawallet.com` / `password123` es la cuenta que el evaluador usara para probar todo — debe estar documentada en README prominentemente.
- antd v5+ usa CSS-in-JS, no necesita import de CSS files separados.
- El usuario con saldo cero es para demostrar que el exchange rechaza correctamente cuando no hay fondos.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-project-scaffolding-foundation*
*Context gathered: 2026-04-14*
