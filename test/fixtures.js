'use strict';

/**
 * Deterministic fake GitHub payloads (same shape as `fetchRepository` returns), so the card can
 * be rendered and tested without network access.
 */

const DAY = 86400000;
const FIXED_NOW = new Date('2026-11-26T12:00:00Z');

/** Small seeded PRNG so fixtures are stable between runs. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A tiny placeholder avatar as an SVG data URI. */
const AVATAR =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#6e5bff"/><stop offset="1" stop-color="#18c2c9"/></linearGradient></defs>' +
      '<rect width="96" height="96" fill="url(#g)"/><circle cx="48" cy="38" r="16" fill="#fff" fill-opacity=".9"/>' +
      '<path d="M16 96c4-26 20-34 32-34s28 8 32 34z" fill="#fff" fill-opacity=".9"/></svg>'
  ).toString('base64');

const AUTHORS = ['octocat', 'hubot', 'ada-l', 'linus-t', 'grace-h', 'dev-null'];
const MESSAGES = [
  'feat: add streaming response support to the client',
  'fix: handle empty repository without throwing',
  'refactor: extract the calendar layout into its own module',
  'docs: explain the ranking algorithm in the README',
  'wip',
  'fix',
  'chore: bump dependencies and regenerate the lockfile',
  'perf: cache the avatar for ten minutes',
  'test: cover streak edge cases around midnight UTC',
  'update'
];

/**
 * Build a raw payload.
 * @param {Object} [overrides] - shallow overrides for `repo` and the top level fields
 * @param {Object} [opts]
 * @param {Date} [opts.now]
 * @param {number} [opts.seed]
 * @param {boolean} [opts.stats=true] - include weekly commit statistics
 * @param {number} [opts.activity=1] - 0 (dead) .. 1 (normal) .. 2 (very busy)
 * @param {string[]} [opts.authors] - commit authors (defaults to a team of six)
 */
function makeRaw(overrides = {}, opts = {}) {
  const now = opts.now || FIXED_NOW;
  const rand = rng(opts.seed || 7);
  const activity = opts.activity === undefined ? 1 : opts.activity;
  const authors = opts.authors || AUTHORS;
  const iso = (ms) => new Date(ms).toISOString();

  // Daily commit counts for 52 weeks (Sunday-aligned), busier on weekdays, with quiet spells.
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const weekStart = today - new Date(today).getUTCDay() * DAY - 51 * 7 * DAY;
  const weeklyStats = [];
  for (let w = 0; w < 52; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const ts = weekStart + (w * 7 + d) * DAY;
      const weekend = d === 0 || d === 6;
      const quietSpell = w % 13 === 7 || w % 13 === 8;
      let c = 0;
      if (ts <= today && activity > 0 && !quietSpell) {
        const p = (weekend ? 0.25 : 0.8) * Math.min(1, activity);
        if (rand() < p) c = 1 + Math.floor(rand() * 6 * activity);
      }
      days.push(c);
    }
    weeklyStats.push({ week: weekStart / 1000 + w * 7 * 86400, days, total: days.reduce((a, b) => a + b, 0) });
  }

  // Latest 100 commits derived from the statistics so both sources agree.
  const flat = [];
  weeklyStats.forEach((wk) =>
    wk.days.forEach((c, d) => {
      for (let i = 0; i < c; i++) flat.push(wk.week * 1000 + d * DAY + Math.floor(rand() * DAY));
    })
  );
  flat.sort((a, b) => b - a);
  const commitNodes = flat.slice(0, 100).map((ms, i) => ({
    message: MESSAGES[(i * 7 + 3) % MESSAGES.length],
    committedDate: iso(ms),
    author: { name: 'Dev', user: { login: authors[Math.floor(rand() * authors.length)] } }
  }));

  const recentPullRequests = Array.from({ length: 100 }, (_, i) => {
    const created = now - Math.floor((i / 100) * 150 * DAY) - Math.floor(rand() * DAY);
    const merged = rand() < 0.72;
    return {
      state: merged ? 'MERGED' : rand() < 0.5 ? 'CLOSED' : 'OPEN',
      createdAt: iso(created),
      mergedAt: merged ? iso(created + (2 + rand() * 60) * 3600000) : null,
      comments: { totalCount: Math.floor(rand() * 7) }
    };
  });
  const recentIssues = Array.from({ length: 100 }, (_, i) => ({
    state: rand() < 0.4 ? 'OPEN' : 'CLOSED',
    createdAt: iso(now - Math.floor((i / 100) * 200 * DAY) - Math.floor(rand() * DAY)),
    comments: { totalCount: Math.floor(rand() * 6) }
  }));

  const releases = Array.from({ length: 10 }, (_, i) => ({
    tagName: `v2.${9 - i}.0`,
    name: `Release 2.${9 - i}.0`,
    publishedAt: iso(now - (12 + i * 24) * DAY),
    isPrerelease: false
  }));

  const repo = {
    name: 'streamline',
    nameWithOwner: 'acme-labs/streamline',
    description:
      'A fast, type-safe streaming toolkit for building real-time dashboards, with batteries included and zero configuration required.',
    url: 'https://github.com/acme-labs/streamline',
    homepageUrl: 'https://streamline.acme.dev/docs',
    isArchived: false,
    isFork: false,
    isPrivate: false,
    createdAt: iso(now - 3.4 * 365 * DAY),
    updatedAt: iso(now - 2 * 3600000),
    pushedAt: iso(now - 2 * 3600000),
    stargazerCount: 12408,
    forkCount: 1832,
    owner: { login: 'acme-labs', avatarUrl: '' },
    parent: null,
    primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
    licenseInfo: { name: 'MIT License', spdxId: 'MIT' },
    watchers: { totalCount: 241 },
    repositoryTopics: {
      nodes: ['streaming', 'typescript', 'realtime', 'dashboard', 'websocket', 'observability'].map((name) => ({ topic: { name } }))
    },
    openIssues: { totalCount: 87 },
    closedIssues: { totalCount: 1420 },
    recentIssues: { nodes: recentIssues },
    openPullRequests: { totalCount: 21 },
    closedPullRequests: { totalCount: 210 },
    mergedPullRequests: { totalCount: 980 },
    recentPullRequests: { nodes: recentPullRequests },
    languages: {
      totalSize: 1000000,
      edges: [
        { size: 612000, node: { name: 'TypeScript', color: '#3178c6' } },
        { size: 211000, node: { name: 'JavaScript', color: '#f1e05a' } },
        { size: 96000, node: { name: 'CSS', color: '#563d7c' } },
        { size: 52000, node: { name: 'HTML', color: '#e34c26' } },
        { size: 21000, node: { name: 'Shell', color: '#89e051' } },
        { size: 6000, node: { name: 'Dockerfile', color: '#384d54' } },
        { size: 2000, node: { name: 'Makefile', color: '#427819' } }
      ]
    },
    releases: { totalCount: 41, nodes: releases },
    defaultBranchRef: {
      name: 'main',
      target: { history: { totalCount: 6842, nodes: commitNodes } }
    }
  };

  const contributors = Array.from({ length: 30 }, (_, i) => ({
    login: `contributor-${i + 1}`,
    contributions: Math.max(1, Math.round(900 / (i + 1.5)))
  }));

  return {
    repo: { ...repo, ...(overrides.repo || {}) },
    staleIssues: 14,
    contributors,
    contributorsTotal: 143,
    weeklyStats: opts.stats === false ? null : weeklyStats,
    avatar: AVATAR,
    fetchedAt: now.toISOString(),
    ...Object.fromEntries(Object.entries(overrides).filter(([k]) => k !== 'repo'))
  };
}

/** Named scenarios used by the preview script and the tests. */
const SCENARIOS = {
  busy: () => makeRaw(),
  'sample-only': () => makeRaw({}, { stats: false }),
  quiet: () => makeRaw({ repo: { pushedAt: new Date(+FIXED_NOW - 120 * DAY).toISOString() } }, { activity: 0.15 }),
  'solo-dev': () =>
    makeRaw(
      {
        repo: { stargazerCount: 9, forkCount: 1, watchers: { totalCount: 1 }, description: '' },
        contributors: [{ login: 'octocat', contributions: 212 }],
        contributorsTotal: 1,
        staleIssues: 0
      },
      { activity: 0.5, authors: ['octocat'] }
    ),
  archived: () =>
    makeRaw(
      {
        repo: {
          isArchived: true,
          isFork: true,
          parent: { nameWithOwner: 'upstream-org/streamline-original-project' },
          pushedAt: new Date(+FIXED_NOW - 700 * DAY).toISOString()
        }
      },
      { activity: 0 }
    ),
  empty: () =>
    makeRaw({
      repo: {
        description: null,
        homepageUrl: null,
        primaryLanguage: null,
        licenseInfo: null,
        repositoryTopics: { nodes: [] },
        languages: { totalSize: 0, edges: [] },
        releases: { totalCount: 0, nodes: [] },
        recentPullRequests: { nodes: [] },
        recentIssues: { nodes: [] },
        openIssues: { totalCount: 0 },
        closedIssues: { totalCount: 0 },
        openPullRequests: { totalCount: 0 },
        closedPullRequests: { totalCount: 0 },
        mergedPullRequests: { totalCount: 0 },
        stargazerCount: 0,
        forkCount: 0,
        watchers: { totalCount: 0 },
        defaultBranchRef: null
      },
      contributors: [],
      contributorsTotal: null,
      staleIssues: 0,
      avatar: null,
      weeklyStats: null
    }),
  'long-text': () =>
    makeRaw({
      repo: {
        name: 'an-extraordinarily-long-repository-name-that-keeps-going-and-going-forever',
        description:
          'This is an intentionally very long description that goes on and on to make sure the card truncates it gracefully instead of overflowing, because real repositories have all sorts of descriptions, including ones that are far too long for anyone to read in a README header. '.repeat(2),
        homepageUrl: 'https://example.com/a/really/long/path/to/documentation/that/keeps/on/going/and/going/index.html',
        repositoryTopics: {
          nodes: Array.from({ length: 10 }, (_, i) => ({ topic: { name: `topic-number-${i + 1}-with-a-long-name` } }))
        }
      }
    })
};

module.exports = { makeRaw, SCENARIOS, FIXED_NOW, AVATAR };
