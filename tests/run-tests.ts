// tests/run-tests.ts
import { QuoteClient } from '../src/QuoteClient';
import { toUserMessage } from '../src/errors';

const baseRequest = {
  callEoaOrContractAddress: "0x0000000000000000000000000000000000000000",
  callContractArguments: "0x",
  rskRefundAddress: "0xYourRefundAddressHereIfNeeded",
  valueToTransfer: "1000000000000000000",
};

async function runTests() {
  console.log("🚀 Running QuoteKit Tests...\n");
  const client = new QuoteClient({ timeoutMs: 8000 });

  // Test 1: Success
  console.log("Test 1: Success mode");
  const successResult = await client.getQuote('http://localhost:4321/pegin/getQuote?mode=success', baseRequest);
  console.log("Result:", successResult.ok ? "✅ SUCCESS" : "❌ " + successResult.error?.code);

  // Test 2: Expired
  console.log("\nTest 2: Expired quote");
  const expiredResult = await client.getQuote('http://localhost:4321/pegin/getQuote?mode=expired', baseRequest);
  console.log("Result:", expiredResult.ok ? "✅" : "❌ " + expiredResult.error?.code);

  // Test 3: Insufficient capacity
  console.log("\nTest 3: Insufficient capacity");
  const insuffResult = await client.getQuote('http://localhost:4321/pegin/getQuote?mode=insufficient_capacity', baseRequest);
  console.log("Result:", insuffResult.ok ? "✅" : "❌ " + insuffResult.error?.code);

  // Test 4: Multi-LP
  console.log("\nTest 4: Multi-LP selection");
  const lpUrls = [
    'http://localhost:4321/pegin/getQuote?mode=expired',
    'http://localhost:4321/pegin/getQuote?mode=success',
    'http://localhost:4321/pegin/getQuote?mode=insufficient_capacity'
  ];
  const multiResult = await client.getQuotes(lpUrls, baseRequest);
  console.log("Result:", multiResult.ok ? "✅ Selected success" : "❌ " + multiResult.error?.code);

  console.log("\n✅ All manual tests completed!");
}

runTests().catch(console.error);