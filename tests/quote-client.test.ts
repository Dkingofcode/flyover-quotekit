// import { QuoteClient } from '../src/QuoteClient';
// import request from 'supertest';
// import { mockLpsApp } from './setup'; // simple setup that starts server

// test('returns QUOTE_EXPIRED on expired quote', async () => {
//   const client = new QuoteClient();
//   const res = await client.getQuote('http://localhost:4321', { ...validRequest, /* ... */ }, '?mode=expired');
//   expect(res.ok).toBe(false);
//   expect((res as any).error.code).toBe('QUOTE_EXPIRED');
// });

// // more tests for TIMEOUT, INVALID_RESPONSE, etc.




// import { QuoteClient } from '../src/QuoteClient';
// import supertest from 'supertest';
// import { app as mockApp } from '../src/mock/mock-lps'; // export app from mock

// describe('QuoteClient', () => {
//   let server: any;

//   beforeAll(() => { server = mockApp.listen(4321); });
//   afterAll(() => server.close());

//   test('returns success on valid quote', async () => {
//     const client = new QuoteClient();
//     const result = await client.getQuote('http://localhost:4321/pegin/getQuote?mode=success', request);
//     expect(result.ok).toBe(true);
//   });

//   test('returns QUOTE_EXPIRED on expired quote', async () => {
//     const client = new QuoteClient();
//     const result = await client.getQuote('http://localhost:4321/pegin/getQuote?mode=expired', request);
//     expect(result.ok).toBe(false);
//     expect((result as any).error.code).toBe('QUOTE_EXPIRED');
//   });

//   // add tests for INVALID_RESPONSE, INSUFFICIENT_CAPACITY, TIMEOUT, etc.
// });





// import { QuoteClient } from '../src/QuoteClient';

// const baseRequest = {
//   callEoaOrContractAddress: "0x0000000000000000000000000000000000000000",
//   callContractArguments: "0x",
//   rskRefundAddress: "0xYourRefundAddressHereIfNeeded",
//   valueToTransfer: "1000000000000000000",
// };

// describe('QuoteClient', () => {
//   const client = new QuoteClient({ timeoutMs: 3000 });

//   test('success mode returns valid quote', async () => {
//     const result = await client.getQuote('http://localhost:4321/pegin/getQuote?mode=success', baseRequest);
//     expect(result.ok).toBe(true);
//     expect((result as any).quoteHash).toBeDefined();
//   });

//   test('expired mode returns QUOTE_EXPIRED', async () => {
//     const result = await client.getQuote('http://localhost:4321/pegin/getQuote?mode=expired', baseRequest);
//     expect(result.ok).toBe(false);
//     expect((result as any).error.code).toBe('QUOTE_EXPIRED');
//   });

//   test('insufficient_capacity returns INSUFFICIENT_CAPACITY', async () => {
//     const result = await client.getQuote('http://localhost:4321/pegin/getQuote?mode=insufficient_capacity', baseRequest);
//     expect(result.ok).toBe(false);
//     expect((result as any).error.code).toBe('INSUFFICIENT_CAPACITY');
//   });
// });










// tests/quote-client.test.ts
// tests/quote-client.test.ts
import { QuoteClient } from '../src/QuoteClient';
import { toUserMessage } from '../src/errors';

const basePeginRequest = {
  callEoaOrContractAddress: "0x0000000000000000000000000000000000000000",
  callContractArguments: "0x",
  rskRefundAddress: "0xYourRefundAddressHereIfNeeded",
  valueToTransfer: "1000000000000000000",
};

describe('QuoteClient with Mock LPS', () => {
  const client = new QuoteClient({ timeoutMs: 8000 });

  test('success mode returns valid quote', async () => {
    const result = await client.getQuote(
      'http://localhost:4321/pegin/getQuote?mode=success',
      basePeginRequest as any   // safe for tests
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.quoteHash).toBeDefined();
      expect(result.quote.agreementTimestamp).toBeGreaterThan(0);
    }
  });

  test('expired mode returns QUOTE_EXPIRED', async () => {
    const result = await client.getQuote(
      'http://localhost:4321/pegin/getQuote?mode=expired',
      basePeginRequest as any
    );

    expect(result.ok).toBe(false);
    expect((result as any).error.code).toBe('QUOTE_EXPIRED');
    expect(toUserMessage((result as any).error)).toContain('expired');
  });

  test('insufficient_capacity returns INSUFFICIENT_CAPACITY', async () => {
    const result = await client.getQuote(
      'http://localhost:4321/pegin/getQuote?mode=insufficient_capacity',
      basePeginRequest as any
    );

    expect(result.ok).toBe(false);
    expect((result as any).error.code).toBe('INSUFFICIENT_CAPACITY');
  });

  test('multi-LP with firstHealthyPolicy selects healthy quote', async () => {
    const lpUrls = [
      'http://localhost:4321/pegin/getQuote?mode=expired',
      'http://localhost:4321/pegin/getQuote?mode=success',
      'http://localhost:4321/pegin/getQuote?mode=insufficient_capacity'
    ];

    const result = await client.getQuotes(lpUrls, basePeginRequest as any);

    expect(result.ok).toBe(true);
    expect(result.selectedLp).toContain('mode=success');
  });
});