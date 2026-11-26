#!/usr/bin/env node
'use strict';

/**
 * Tiny local server so you can try the landing page and the API without a Vercel account.
 *
 *   npm run dev            -> http://localhost:3000
 *   PORT=4000 npm run dev
 *   npm run dev -- --mock  -> serve fixture data instead of calling GitHub (no token needed)
 *
 * It mirrors vercel.json: "/" serves public/index.html, everything else goes to api/index.js.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MOCK = process.argv.includes('--mock');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

if (MOCK) {
  // Answer every GitHub request from fixtures. Handy for UI work and demos.
  const { makeRaw } = require('../test/fixtures');
  const raw = makeRaw({}, { now: new Date() });
  const realFetch = global.fetch;
  process.env.GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'mock-token';
  global.fetch = async (url, init) => {
    const u = String(url);
    const ok = (body) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
    if (u === 'https://api.github.com/graphql') return ok({ data: { repository: raw.repo, staleIssues: { issueCount: raw.staleIssues } } });
    if (u.includes('/stats/commit_activity')) return ok(raw.weeklyStats);
    if (u.includes('/contributors')) return ok(raw.contributors);
    if (u.startsWith('https://github.com/')) return new Response(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'), { status: 200, headers: { 'content-type': 'image/png' } });
    return realFetch(url, init);
  };
}

const handler = require('../api/index.js');

/** Adapt Node's response to the small subset of the Vercel API the handler uses. */
function adapt(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.send = (body) => {
    res.end(body);
    return res;
  };
  return res;
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname === '/' || pathname === '/index.html' || pathname === '/favicon.ico') {
      const file = path.join(PUBLIC_DIR, pathname === '/favicon.ico' ? 'favicon.ico' : 'index.html');
      res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
      return fs.createReadStream(file).pipe(res);
    }

    const query = {};
    for (const key of new Set(url.searchParams.keys())) {
      const values = url.searchParams.getAll(key);
      query[key] = values.length > 1 ? values : values[0];
    }

    try {
      await handler({ query, headers: req.headers, url: req.url }, adapt(res));
    } catch (error) {
      console.error(error);
      res.statusCode = 500;
      res.end('Internal error');
    }
  })
  .listen(PORT, () => {
    console.log(`Dev server running at http://localhost:${PORT}${MOCK ? '  (mock data)' : ''}`);
    console.log(`Try: http://localhost:${PORT}/api?username=octocat&repo=Hello-World&theme=dark`);
  });
