'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const handler = require('../api/index.js');
const { makeRaw } = require('./fixtures');

// A 1x1 transparent PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

let counter = 0;
const uniqueRepo = () => `repo-${++counter}`;

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

/**
 * Install a fake `fetch` that behaves like GitHub. `plan` can tweak individual endpoints.
 * Returns the list of requested URLs.
 */
function mockGitHub(plan = {}) {
  const calls = [];
  const raw = plan.raw || makeRaw({}, { now: new Date() });

  global.fetch = async (url, init = {}) => {
    const u = String(url);
    calls.push({ url: u, init });

    if (u === 'https://api.github.com/graphql') {
      if (plan.graphql) return plan.graphql(init);
      return json({ data: { repository: raw.repo, staleIssues: { issueCount: raw.staleIssues } } });
    }
    if (u.includes('/stats/commit_activity')) {
      if (plan.stats) return plan.stats();
      return json(raw.weeklyStats || []);
    }
    if (u.includes('/contributors')) {
      if (plan.contributors) return plan.contributors(u);
      return json(raw.contributors);
    }
    if (u.startsWith('https://github.com/') && u.includes('.png')) {
      if (plan.avatar) return plan.avatar();
      return new Response(PNG, { status: 200, headers: { 'content-type': 'image/png' } });
    }
    throw new Error(`Unexpected request: ${u}`);
  };
  return calls;
}

function call(query) {
  const res = {
    headers: {},
    statusCode: 200,
    body: null,
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    send(body) {
      this.body = body;
      return this;
    }
  };
  return handler({ query }, res).then(() => res);
}

const realFetch = global.fetch;
const realToken = process.env.GITHUB_TOKEN;
const realAllow = process.env.ALLOW_PRIVATE_REPOS;
test.beforeEach(() => {
  process.env.GITHUB_TOKEN = 'test-token';
  delete process.env.ALLOW_PRIVATE_REPOS;
});
test.afterEach(() => {
  global.fetch = realFetch;
  if (realToken === undefined) delete process.env.GITHUB_TOKEN;
  else process.env.GITHUB_TOKEN = realToken;
  if (realAllow === undefined) delete process.env.ALLOW_PRIVATE_REPOS;
  else process.env.ALLOW_PRIVATE_REPOS = realAllow;
});

test('handler: returns an SVG card with correct headers', async () => {
  mockGitHub();
  const res = await call({ username: 'acme-labs', repo: uniqueRepo(), theme: 'dark' });
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Content-Type'], /^image\/svg\+xml/);
  assert.match(res.headers['Cache-Control'], /max-age=1800/);
  assert.match(res.headers['Cache-Control'], /s-maxage=1800/);
  assert.match(res.headers['Cache-Control'], /stale-while-revalidate/);
  assert.ok(res.body.startsWith('<svg '));
  assert.ok(res.body.includes('#0d1117'), 'dark theme background');
  assert.ok(res.body.includes('data:image/png;base64,'), 'avatar is embedded');
});

test('handler: sends the token only to GitHub and encodes path segments', async () => {
  const calls = mockGitHub();
  const repo = uniqueRepo();
  await call({ username: 'acme-labs', repo });
  for (const c of calls) {
    const host = new URL(c.url).host;
    assert.ok(['api.github.com', 'github.com'].includes(host), host);
    const auth = c.init.headers && c.init.headers.Authorization;
    if (host === 'github.com') assert.equal(auth, undefined, 'avatar request must not carry the token');
  }
  assert.ok(calls.some((c) => c.url.includes(`/repos/acme-labs/${repo}/contributors`)));
  const gql = calls.find((c) => c.url.endsWith('/graphql'));
  const body = JSON.parse(gql.init.body);
  assert.equal(body.variables.owner, 'acme-labs');
  assert.match(body.variables.staleQuery, /is:open updated:</);
});

test('handler: a card built from the commit sample is only cached briefly', async () => {
  mockGitHub({ stats: () => new Response('{}', { status: 202 }) });
  const res = await call({ username: 'acme-labs', repo: uniqueRepo(), cache_seconds: '86400' });
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Cache-Control'], /max-age=300/);
  assert.match(res.headers['Cache-Control'], /s-maxage=300/);

  mockGitHub();
  const exact = await call({ username: 'acme-labs', repo: uniqueRepo(), cache_seconds: '86400' });
  assert.match(exact.headers['Cache-Control'], /max-age=86400/);
});

test('handler: serves JSON when asked', async () => {
  mockGitHub();
  const res = await call({ username: 'acme-labs', repo: uniqueRepo(), format: 'json' });
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['Content-Type'], /application\/json/);
  assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
  const data = JSON.parse(res.body);
  assert.equal(data.name, 'streamline');
  assert.equal(data.calendar.days.length, 365);
  assert.ok(['S', 'A', 'B', 'C', 'D'].includes(data.rank.tier));
});

test('handler: validation errors are SVG cards with status 400', async () => {
  const calls = mockGitHub();
  for (const query of [{}, { username: 'octocat' }, { username: 'octocat', repo: '../../x' }, { username: '-bad', repo: 'ok' }]) {
    const res = await call(query);
    assert.equal(res.statusCode, 400);
    assert.match(res.headers['Content-Type'], /^image\/svg\+xml/);
    assert.equal(res.headers['Cache-Control'], 'no-store');
    assert.ok(res.body.startsWith('<svg '));
  }
  assert.equal(calls.length, 0, 'invalid input never reaches GitHub');
});

test('handler: prototype-key themes do not crash', async () => {
  mockGitHub();
  for (const theme of ['__proto__', 'constructor', 'toString']) {
    const res = await call({ username: 'acme-labs', repo: uniqueRepo(), theme });
    assert.equal(res.statusCode, 200, theme);
    assert.ok(res.body.includes('#ffffff'), `${theme} falls back to the light theme`);
  }
});

test('handler: missing token is a configuration error', async () => {
  mockGitHub();
  delete process.env.GITHUB_TOKEN;
  const res = await call({ username: 'acme-labs', repo: uniqueRepo() });
  assert.equal(res.statusCode, 500);
  assert.match(res.headers['Content-Type'], /^image\/svg\+xml/);
  assert.ok(res.body.includes('GITHUB_TOKEN'));
});

test('handler: unknown repository -> 404 card', async () => {
  mockGitHub({
    graphql: () => json({ data: { repository: null }, errors: [{ type: 'NOT_FOUND', message: "Could not resolve to a Repository with the name 'a/b'." }] })
  });
  const res = await call({ username: 'acme-labs', repo: uniqueRepo() });
  assert.equal(res.statusCode, 404);
  assert.match(res.headers['Content-Type'], /^image\/svg\+xml/);
  assert.ok(res.body.includes('Repository not found'));
  assert.match(res.headers['Cache-Control'], /max-age=300/);
});

test('handler: maps 401, 403 and 5xx to friendly cards', async () => {
  const cases = [
    [401, 401, 'Invalid GitHub token'],
    [403, 429, 'rate limit'],
    [429, 429, 'rate limit'],
    [500, 502, 'not responding']
  ];
  for (const [upstream, expected, text] of cases) {
    mockGitHub({ graphql: () => new Response('{}', { status: upstream }) });
    const res = await call({ username: 'acme-labs', repo: uniqueRepo() });
    assert.equal(res.statusCode, expected, `upstream ${upstream}`);
    assert.ok(res.body.includes(text), `upstream ${upstream}: ${text}`);
  }
});

test('handler: GraphQL rate-limit errors are recognised', async () => {
  mockGitHub({ graphql: () => json({ errors: [{ type: 'RATE_LIMITED', message: 'API rate limit exceeded' }] }) });
  const res = await call({ username: 'acme-labs', repo: uniqueRepo() });
  assert.equal(res.statusCode, 429);
});

test('handler: network failures become a 500 card, not an exception', async () => {
  mockGitHub({ graphql: () => Promise.reject(new TypeError('fetch failed')) });
  const res = await call({ username: 'acme-labs', repo: uniqueRepo() });
  assert.equal(res.statusCode, 500);
  assert.match(res.headers['Content-Type'], /^image\/svg\+xml/);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});

test('handler: private repositories are hidden unless explicitly allowed', async () => {
  const raw = makeRaw({ repo: { isPrivate: true } }, { now: new Date() });
  mockGitHub({ raw });
  const hidden = await call({ username: 'acme-labs', repo: uniqueRepo() });
  assert.equal(hidden.statusCode, 404);
  assert.ok(!hidden.body.includes('streamline'));

  process.env.ALLOW_PRIVATE_REPOS = 'true';
  mockGitHub({ raw });
  const shown = await call({ username: 'acme-labs', repo: uniqueRepo() });
  assert.equal(shown.statusCode, 200);
  assert.ok(shown.body.includes('Private'));
});

test('handler: still renders when avatar, contributors and statistics all fail', async () => {
  mockGitHub({
    avatar: () => new Response('nope', { status: 500 }),
    contributors: () => new Response('{}', { status: 403 }),
    stats: () => new Response('{}', { status: 500 })
  });
  const res = await call({ username: 'acme-labs', repo: uniqueRepo() });
  assert.equal(res.statusCode, 200);
  assert.ok(!res.body.includes('data:image/png'), 'monogram fallback');
  assert.ok(res.body.includes('weekly statistics unavailable'));
});

test('handler: rejects non-image avatar responses', async () => {
  mockGitHub({ avatar: () => new Response('<html>', { status: 200, headers: { 'content-type': 'text/html' } }) });
  const res = await call({ username: 'acme-labs', repo: uniqueRepo() });
  assert.equal(res.statusCode, 200);
  assert.ok(!res.body.includes('data:text/html'));
});

test('handler: repeated requests are served from the in-memory cache', async () => {
  const calls = mockGitHub();
  const repo = uniqueRepo();
  await call({ username: 'acme-labs', repo });
  const first = calls.length;
  await call({ username: 'acme-labs', repo, theme: 'nord' });
  assert.equal(calls.length, first, 'second render made no upstream calls');
});

test('handler: more than 100 contributors triggers an exact count lookup', async () => {
  const many = Array.from({ length: 100 }, (_, i) => ({ login: `c${i}`, contributions: 100 - i }));
  const calls = mockGitHub({
    contributors: (url) =>
      url.endsWith('per_page=1')
        ? new Response('[]', {
            status: 200,
            headers: { link: '<https://api.github.com/repositories/1/contributors?per_page=1&page=2>; rel="next", <https://api.github.com/repositories/1/contributors?per_page=1&page=482>; rel="last"' }
          })
        : json(many)
  });
  const res = await call({ username: 'acme-labs', repo: uniqueRepo(), format: 'json' });
  assert.equal(JSON.parse(res.body).stats.contributors, 482);
  assert.ok(calls.some((c) => c.url.endsWith('per_page=1')));
});
