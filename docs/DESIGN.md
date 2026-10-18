# AgentPay Guard design system

## Direction

AgentPay Guard uses a light financial workspace with a dark ink-violet navigation rail. It combines Mercury's premium restraint, Linear's precise hierarchy, Ramp's approval clarity, and Cursor's contextual assistant pattern without copying any product's branding or layout.

The primary experience runs from a natural-language request to a grounded proposal, deterministic policy validation, explicit human approval and server-verified PayPal buyer approval. Capture is a separate disabled stage and has not been genuinely exercised. The interface never presents a `CREATED` or merely `APPROVED` PayPal order as paid.

## Tokens

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#F7F8FA` | Application background |
| Surface | `#FFFFFF` | Cards and controls |
| Primary text | `#111827` | Headings and values |
| Muted text | `#667085` | Supporting copy |
| Accent | `#5145CD` | Primary actions and active state |
| Verified | `#0F766E` | Passed policy and verified payment |
| Pending | `#D97706` | Review, configuration, and pending states |
| Border | `#E4E7EC` | Dividers and component outlines |
| Navigation | `#17152B` | Persistent application rail |

Typography uses Inter with Geist Sans and system fallbacks. Spacing follows an 8px base rhythm with 4px adjustments for compact labels. Controls use 6–9px radii. Shadows only separate surfaces.

## Components

- **Application rail:** product identity, four task destinations, and a persistent sandbox indicator.
- **Assurance metrics:** concise facts covering catalog grounding, server policy, and human approval.
- **Purchase lifecycle:** six explicit stages. Completed stages use teal, the current stage uses indigo, and future stages remain neutral.
- **Request card:** contextual AI input with explicit budget and quantity boundaries.
- **Decision brief:** authoritative SKU, merchant, amount, model mode, attributes, policy results, and audit evidence.
- **Status badge:** compact uppercase state label for proposals and transactions.
- **Notice:** high-contrast status region announced with `role="status"`.

## Responsive and accessibility behavior

Below 760px, the side rail becomes a horizontal navigation header, cards stack, metrics become rows, and the lifecycle becomes a horizontally scrollable sequence. Controls have visible keyboard focus. Reduced-motion preferences disable transitions.

## Content rules

- Proposal, approval, order creation, buyer approval, capture, and completion are separate states.
- Prices and merchants come from the backend catalog.
- Policy results are server decisions, not model claims.
- PayPal's official SDK owns the checkout component.
- Empty history remains empty; no sample transactions or decorative analytics are invented.

## Reference notes

Independent getdesign.md analyses for Mercury, Linear, Ramp, and Cursor informed the direction. AgentPay Guard retains its own color system, hierarchy, copy, and component composition.
