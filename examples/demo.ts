// examples/demo.ts
import { QuoteClient, toUserMessage, firstHealthyPolicy } from '../src';

async function main() {
  const client = new QuoteClient({
    timeoutMs: 8000,          // shorter for faster demo
    quoteExpiryMs: 90000,
    concurrency: 2,
  });

  // Minimal valid PeginQuoteRequest shape (adjust values for your test)
  // This is the structure sent to /pegin/getQuote
  const request = {
    callEoaOrContractAddress: "0x0000000000000000000000000000000000000000",  // example: simple transfer to EOA
    callContractArguments: "0x",                                              // no calldata for simple peg-in
    rskRefundAddress: "0xYourRefundAddressHereIfNeeded",                      // your RSK address for refund
    valueToTransfer: "1000000000000000000",                                   // 1 RBTC in wei (adjust as needed)
    // Optional extra fields some LPs might expect:
    // gasLimit: "21000",
    // btcRefundAddress: "tb1qexamplebtcrefundaddress",
  };

  // Use mock LPS URLs with different modes to see success + failures
//   const lpUrls = [
//     "http://localhost:4321?mode=success",           // should succeed
//     // "http://localhost:4321?mode=expired",           // should fail with QUOTE_EXPIRED
//     // "http://localhost:4321?mode=insufficient_capacity", // should fail with INSUFFICIENT_CAPACITY
//   ];

const lpUrls = [
  "http://localhost:4321?mode=success",
  "http://localhost:4321?mode=expired",
  "http://localhost:4321?mode=insufficient_capacity"
];

  console.log("Requesting quotes from multiple LPs...\n");

  try {
    const result = await client.getQuotes(lpUrls, request, firstHealthyPolicy);

    console.log("Final selected result:");
    console.dir(result, { depth: null, colors: true });

    if (!result.ok) {
      console.log("\nUser-friendly message:", toUserMessage(result.error!));
    } else {
      console.log("\nSuccess! Selected LP:", result.selectedLp);
      console.log("Quote hash:", result.quoteHash);
      console.log("Agreement timestamp:", result.quote?.agreementTimestamp);
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
}

main().catch(console.error);