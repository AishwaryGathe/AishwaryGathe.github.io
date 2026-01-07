const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing url query param');

  try {
    const resp = await fetch(url, { redirect: 'follow' });
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const buffer = await resp.buffer();

    // Set safe headers and allow framing
    res.set('Content-Type', contentType);
    res.set('X-Frame-Options', 'ALLOWALL');
    res.set('Referrer-Policy', 'no-referrer');
    res.set('Access-Control-Allow-Origin', '*');
    // Relax CSP to improve embedding success (may be ignored by some responses)
    res.set('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;");

    res.send(buffer);
  } catch (err) {
    console.error('Proxy error for', url, err && err.message);
    res.status(502).send('Proxy fetch failed');
  }
});

app.listen(PORT, () => console.log(`Proxy server listening on http://localhost:${PORT}`));
