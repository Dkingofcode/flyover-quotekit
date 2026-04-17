// import { QuoteError, QuoteErrorCode } from './types';

// export const toUserMessage = (error: QuoteError): string => {
//   const map: Record<QuoteErrorCode, string> = {
//     TIMEOUT: 'Quote request timed out. Try again.',
//     LP_UNAVAILABLE: 'Liquidity provider is currently unavailable.',
//     INVALID_RESPONSE: 'Invalid response from liquidity provider.',
//     QUOTE_EXPIRED: 'Quote has expired. Request a new one.',
//     INSUFFICIENT_CAPACITY: 'Liquidity provider has insufficient capacity.',
//     RATE_LIMITED: 'Rate limit reached. Try again later.',
//     NO_ROUTE_AVAILABLE: 'No available route found.',
//   };
//   return map[error.code] ?? 'Unknown error with liquidity provider.';
// };



import { QuoteError, QuoteErrorCode } from './types';

export type UserMessageMapper = (error: QuoteError) => string;

export const defaultToUserMessage: UserMessageMapper = (error: QuoteError): string => {
  const map: Record<QuoteErrorCode, string> = {
    TIMEOUT: 'Quote request timed out. Please try again.',
    LP_UNAVAILABLE: 'Liquidity provider is currently unavailable.',
    INVALID_RESPONSE: 'Received invalid response from liquidity provider.',
    QUOTE_EXPIRED: 'Quote has expired. Please request a new one.',
    INSUFFICIENT_CAPACITY: 'Liquidity provider has insufficient capacity for this amount.',
    RATE_LIMITED: 'Rate limit reached. Please try again shortly.',
    NO_ROUTE_AVAILABLE: 'No available liquidity route found. Try a different provider or try again later.',
  };
  return map[error.code] ?? 'Unknown error occurred with the liquidity provider.';
};

// Allow integrators to provide their own mapper (for localization, custom messages, etc.)
export const toUserMessage = (error: QuoteError, customMapper?: UserMessageMapper): string => {
  if (customMapper) {
    return customMapper(error);
  }
  return defaultToUserMessage(error);
};