/**
 * Custom Next.js server for the Sarathi frontend — the Node analogue of the backend's asgi.py.
 *
 * Run (from frontend/):
 *   node server.js                          # production (run `npm run build` first)
 *   NODE_ENV=development node server.js      # development, with hot-reload
 *
 * Env knobs (all optional):
 *   HOST       bind address  (default 127.0.0.1 — localhost only; set 0.0.0.0 to expose)
 *   PORT       port          (default 3000)
 *   NODE_ENV   "production" → optimized build; anything else → dev mode
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const host = process.env.HOST || '127.0.0.1';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname: host, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      // Let Next own all routing (App Router pages, static assets, etc.).
      handle(req, res, parse(req.url, true));
    }).listen(port, host, (err) => {
      if (err) throw err;
      console.log(`▶ Sarathi frontend ready on http://${host}:${port}  (dev=${dev})`);
    });
  })
  .catch((err) => {
    console.error('Failed to start Sarathi frontend:', err);
    process.exit(1);
  });
