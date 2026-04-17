# @rsksmart/quotekit

**Flyover Integrator Reliability Kit** – A robust, typed reliability layer for Flyover quote requests on Rootstock.

Makes BTC → RBTC (and pegout) onboarding predictable by handling timeouts, validation, expiry, and safe multi-LP fallback.

## Features

- Strict per-request timeouts (never hangs)
- Response validation + consistent typed errors
- Automatic quote freshness/expiry detection
- Multi-LP parallel querying with concurrency control
- Pluggable selection policies (first healthy, lowest cost, etc.)
- Small overrideable `toUserMessage()` helper
- Deterministic Mock LPS for fast, repeatable tests
- Zero runtime dependencies (except tiny `p-limit`)
- Clean, well-typed API

## Installation

```bash
npm install @rsksmart/quotekit