import pLimit from 'p-limit';
import { QuoteRequest, QuoteResult, SelectedQuote, QuoteErrorCode, Quote } from './types';
import { firstHealthyPolicy } from './policies';

const DEFAULT_TIMEOUT = 10000;
const DEFAULT_QUOTE_EXPIRY_MS = 60000;
const DEFAULT_CONCURRENCY = 3;

export interface QuoteClientOptions {
  timeoutMs?: number;
  quoteExpiryMs?: number;
  concurrency?: number;
}

export class QuoteClient {
  private readonly options: Required<QuoteClientOptions>;

  constructor(options: QuoteClientOptions = {}) {
    this.options = {
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT,
      quoteExpiryMs: options.quoteExpiryMs ?? DEFAULT_QUOTE_EXPIRY_MS,
      concurrency: options.concurrency ?? DEFAULT_CONCURRENCY,
    };
  }

  private isPegout(request: QuoteRequest): boolean {
    return 'to' in request;
  }

  async getQuote(lpUrl: string, request: QuoteRequest): Promise<QuoteResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeoutMs);

    try {
      const endpoint = this.isPegout(request)
  ? '/pegout/getQuotes'
  : '/pegin/getQuote';

// Build URL correctly (fixes your 404 issue)
// const base = new URL(lpUrl);
// const finalUrl = new URL(endpoint, base.origin);

// // Preserve query params like ?mode=success
// base.searchParams.forEach((value, key) => {
//   finalUrl.searchParams.set(key, value);
// });


// Build URL correctly - preserve query params like ?mode=xxx
const urlObj = new URL(lpUrl);
urlObj.pathname = endpoint;   // safely set the correct endpoint
const finalUrl = urlObj.toString();


console.log(`Final URL: ${finalUrl}`);

const res = await fetch(finalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      console.log(`Quote request to ${finalUrl} → status: ${res.status}`);

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 429) return { ok: false, error: { code: 'RATE_LIMITED', lpUrl } };
        if (res.status === 503) return { ok: false, error: { code: 'LP_UNAVAILABLE', lpUrl } };
        return { ok: false, error: { code: 'LP_UNAVAILABLE', lpUrl, details: res.statusText } };
      }

      let raw: any;
      try {
        const text = await res.text();
       console.log(`  Raw response body: ${text.substring(0, 200)}...`);
        raw = JSON.parse(text);
      } catch (parseErr){
        console.log(`  Parse failed: ${parseErr}`);
        return { ok: false, error: { code: 'INVALID_RESPONSE', lpUrl } };
      }

      const quote = raw.quote;
      const quoteHash = raw.quoteHash;
      console.log(`[Client] Raw parsed response from ${lpUrl}:`, JSON.stringify(raw, null, 2));

      if (!quote || !quoteHash || !quote.agreementTimestamp) {
        return { ok: false, error: { code: 'INVALID_RESPONSE', lpUrl } };
      }

      const age = Date.now() - quote.agreementTimestamp * 1000;
      if (age > this.options.quoteExpiryMs) {
        return { ok: false, error: { code: 'QUOTE_EXPIRED', lpUrl } };
      }

      // Simple insufficient capacity check (you can expand)
      if (parseFloat(quote.callFee || '0') === 0 && parseFloat(quote.value || '0') === 0) {
        return { ok: false, error: { code: 'INSUFFICIENT_CAPACITY', lpUrl } };
      }
     console.log(`  Validation passed → returning success from ${lpUrl}`);
      return { ok: true, lpUrl, quote, quoteHash };
    } catch (e: any) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') return { ok: false, error: { code: 'TIMEOUT', lpUrl } };
      return { ok: false, error: { code: 'LP_UNAVAILABLE', lpUrl, details: e.message } };
    }
  }

  async getQuotes(
    lpUrls: string[],
    request: QuoteRequest,
    policy = firstHealthyPolicy
  ): Promise<SelectedQuote> {
    const limit = pLimit(this.options.concurrency);
    const results = await Promise.all(
      lpUrls.map(url => limit(() => this.getQuote(url, request)))
    );

    const selected = policy.select(results);
    return selected ?? { ok: false, error: { code: 'NO_ROUTE_AVAILABLE' } };
  }
}