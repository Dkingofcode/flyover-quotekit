import express from 'express';

const app = express();
app.use(express.json());

const PORT = 4321;

app.post(['/pegin/getQuote', '/pegout/getQuotes'], (req, res) => {
  const mode = req.query.mode || 'success';
  console.log(`[Mock LPS] Received request with mode: ${mode}`);
  console.log('  Path:', req.path);
  console.log('  Query:', req.query);
  console.log('  Body:', req.body);           // see what request payload looks like

  //const mode = req.query.mode || 'success';
  console.log(`→ Using mode: ${mode}`);

  if (mode === 'timeout') return; // never responds

  if (mode === 'invalid_json') {
    res.set('Content-Type', 'text/plain').send('not json');
    return;
  }

  if (mode === 'unavailable') return res.status(503).send();

  if (mode === 'rate_limited') return res.status(429).send();

  if (mode === 'expired') {
    return res.json({
      quote: { agreementTimestamp: Math.floor(Date.now() / 1000) - 100 },
      quoteHash: '0xexpiredhash',
    });
  }

  if (mode === 'insufficient_capacity') {
    return res.json({
      quote: { agreementTimestamp: Math.floor(Date.now() / 1000), callFee: '0', value: '0' },
      quoteHash: '0xinsufficient',
    });
  }

  // success
//   res.json({
//     quote: {
//       agreementTimestamp: Math.floor(Date.now() / 1000),
//       fedBTCAddr: 'tb1q...',
//       lpBTCAddr: 'tb1q...',
//       callFee: '1000',
//       gasFee: '500',
//       // ... minimal valid quote
//     },
//     quoteHash: '0xvalidquotehash123',
//   });
if (mode === 'success') {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    quote: {
      agreementTimestamp: now,
      fedBTCAddr: "tb1qfexamplefedaddress00000000000000000",
      lpBTCAddr: "tb1qlexamplelpaddress11111111111111111",
      callFee: "500000000000000",
      gasFee: "200000000000000",
      productFeeAmount: "10000000000000",
      value: "1000000000000000000"  // or whatever amount
    },
    quoteHash: "0xmockvalidquotehash-" + now  // MUST be present!
  };
  console.log('[Mock success] Sending:', payload);
  return res.json(payload);
}

});

app.listen(PORT, () => {
  console.log(`Mock LPS running on http://localhost:${PORT}`);
  console.log('Use ?mode=success|expired|invalid_json|unavailable|rate_limited|timeout');
});