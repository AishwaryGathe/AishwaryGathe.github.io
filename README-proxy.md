Proxy server for in-app iframes

1) Purpose
- Provide a local proxy that fetches external sites/PDFs and returns them with headers that make embedding via iframe possible for local development.

2) Warning
- This proxy bypasses framing protections and should be used only for local development/trusted sources. Do NOT expose it publicly.

3) Install & run
```powershell
cd d:\Portfolio
npm install
npm start
```

4) How it works
- The app will rewrite external `http(s)` iframe sources to `http://localhost:3000/proxy?url=<encoded>` so content is served from the proxy and can be embedded.
