# AgentPay Guard design system

## Product idea

AgentPay Guard is a purchasing control surface. The interface makes the separation between AI recommendation, deterministic policy validation, human approval, PayPal buyer approval, and capture visible at every step. It never infers payment success from a proposal or client callback.

## Foundations

- **Surfaces:** deep navy navigation and hero surfaces; cool neutral application canvas; white working panels.
- **Accent:** violet for intent, navigation, and AI; teal for server-verified outcomes; amber for operator-controlled or pending states; red only for blocked or failed states.
- **Type:** system-first Inter-compatible stack. Headlines use tight tracking and moderate weight. Operational labels use compact uppercase text.
- **Shape:** 8–18px radii, based on component scale. Primary work panels use 12px.
- **Spacing:** 4px base with an 8px primary rhythm.
- **Elevation:** restrained shadows only on interactive or high-priority surfaces.

## Components

- `AppShell`: responsive sidebar, mobile drawer, environment status, breadcrumb, and sandbox boundary.
- `PurchaseLifecycle`: six-stage state visualization derived from backend proposal state. Payment stages display disabled when public payments are off.
- `StatusBadge`: neutral, pending, verified, and blocked state semantics.
- `Policy decision center`: renders only policy keys returned by the backend and explains each using proposal/catalog values.
- `EmptyState` and `Skeleton`: stable loading and no-data layouts.
- `Toast`: accessible live-region feedback with explicit dismissal.

## Views

1. **Command center:** session-derived proposal, policy, approval, and audit summaries.
2. **Shopping studio:** constrained request composer, model/fallback disclosure, decision brief, approval, and conditional PayPal controls.
3. **Catalog:** controlled demo inventory with authoritative prices.
4. **Audit & history:** owner-scoped persisted records, lifecycle, redacted order identity, and audit events.
5. **Demo guide:** an honest, under-three-minute judge journey with implemented, previously verified, and disabled capabilities separated.

## Motion and accessibility

Entrances and state changes use short opacity/translation transitions. Hover effects reinforce interactivity without delaying work. `prefers-reduced-motion` reduces all animation and transition durations. Navigation uses semantic buttons, fields have explicit labels and validation states, focus rings remain visible, status messages use an ARIA live region, and mobile navigation has explicit open/close labels.
