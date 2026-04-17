# @rsksmart/quotekit

**Flyover Integrator Reliability Kit** – A robust, typed reliability layer for Flyover quote requests on Rootstock.

Makes BTC → RBTC (and pegout) onboarding predictable by handling timeouts, validation, expiry, and safe multi-LP fallback.

## 🌍 Why Quotekit?

Flyover integrations often fail in subtle ways:

- Hanging requests  
- Stale or expired quotes  
- Inconsistent LP responses  
- Fragile retry logic  

Quotekit eliminates these risks with a **deterministic, typed reliability layer**, so developers can focus on building—not firefighting edge cases.


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


 



## Quick Demo (Test in < 45 seconds)
```bash
git clone https://github.com/YOUR-USERNAME/quotekit.git
cd quotekit
npm install


```bash
# Terminal 1 — Start Mock LPS
npm run mock:lps

# Terminal 2 — Run Demo
npm run demo

# Running Tests
npm test