// src/policies.ts

import {
  QuoteResult,
  QuoteResultSuccess,
  SelectedQuote,
  Quote,
  PeginQuoteDTO
} from './types';   // ← this line fixes everything

export interface QuotePolicy {
  select(results: QuoteResult[]): SelectedQuote | null;
}

export const firstHealthyPolicy: QuotePolicy = {
  select(results: QuoteResult[]): SelectedQuote | null {
    // Find the first successful result
    const success = results.find(r => r.ok) as QuoteResultSuccess | undefined;

    if (!success) {
      return null;
    }

    // Return it with the selectedLp field added
    return {
      ...success,
      selectedLp: success.lpUrl,
    };
  },
};

// Type guard to distinguish pegin quotes
function isPeginQuote(quote: Quote): quote is PeginQuoteDTO {
  // Simple check – agreementTimestamp exists on both, so look for pegin-specific field
  return 'callFee' in quote && 'gasFee' in quote;
}

export const lowestTotalCostPolicy: QuotePolicy = {
  select(results: QuoteResult[]): SelectedQuote | null {
    const successes = results.filter(r => r.ok) as QuoteResultSuccess[];

    if (successes.length === 0) {
      return null;
    }

    // Only consider pegin quotes for fee-based selection
    const peginSuccesses = successes.filter(s => isPeginQuote(s.quote));

    if (peginSuccesses.length === 0) {
      // Fallback: pick first available (could also return null or log warning)
      const fallback = successes[0];
      return { ...fallback, selectedLp: fallback.lpUrl };
    }

    const getTotalFee = (q: PeginQuoteDTO) =>
      (parseFloat(q.callFee || '0') || 0) + (parseFloat(q.gasFee || '0') || 0);

    const best = peginSuccesses.reduce((prev, curr) => {
      const prevQuote = prev.quote as PeginQuoteDTO;
      const currQuote = curr.quote as PeginQuoteDTO;
      return getTotalFee(prevQuote) <= getTotalFee(currQuote) ? prev : curr;
    });

    return {
      ...best,
      selectedLp: best.lpUrl,
    };
  },
};