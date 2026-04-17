export interface PeginQuoteRequest {
  callEoaOrContractAddress: string;
  callContractArguments: string;
  rskRefundAddress: string;
  valueToTransfer: string;
}

export interface PegoutQuoteRequest {
  to: string;
  valueToTransfer: string;
  rskRefundAddress: string;
}

export type QuoteRequest = PeginQuoteRequest | PegoutQuoteRequest;

export interface PeginQuoteDTO {
  agreementTimestamp: number;
  // ... (all fields from OpenAPI – abbreviated for brevity; full in repo)
  fedBTCAddr: string;
  lpBTCAddr: string;
  callFee: string;
  gasFee: string;
  productFeeAmount: string;
  // add the rest exactly as in the OpenAPI you saw
}

export interface PegoutQuoteDTO {
  agreementTimestamp: number;
  depositAddr: string;
  // ... full fields
}

export type Quote = PeginQuoteDTO | PegoutQuoteDTO;

export interface QuoteResultSuccess {
  ok: true;
  lpUrl: string;
  quote: Quote;
  quoteHash: string;
}

export interface QuoteError {
  code: QuoteErrorCode;
  lpUrl?: string;
  details?: string;
}

export type QuoteResult = QuoteResultSuccess | { ok: false; error: QuoteError };

export type QuoteErrorCode =
  | 'TIMEOUT'
  | 'LP_UNAVAILABLE'
  | 'INVALID_RESPONSE'
  | 'QUOTE_EXPIRED'
  | 'INSUFFICIENT_CAPACITY'
  | 'RATE_LIMITED'
  | 'NO_ROUTE_AVAILABLE';

export interface SelectedQuote {
  ok: boolean;
  quote?: Quote;
  quoteHash?: string;
  error?: QuoteError;
  selectedLp?: string;
}

