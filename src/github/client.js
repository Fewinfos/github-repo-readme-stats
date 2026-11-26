'use strict';

const { REPO_QUERY } = require('./query');

const GRAPHQL_URL = 'https://api.github.com/graphql';
const REST_URL = 'https://api.github.com';
const USER_AGENT = 'GitHub-Repo-Card';
const REQUEST_TIMEOUT_MS = 8000;
const STATS_RETRY_DELAY_MS = 1000;
const STATS_ATTEMPTS = 2;
const CACHE_TTL_MS = 10 * 60 * 1000;
// Results that fell back to a commit sample are kept briefly, so real statistics replace them
// as soon as GitHub has finished computing them.
const INCOMPLETE_TTL_MS = 60 * 1000;
const CACHE_MAX_ENTRIES = 100;
const MAX_AVATAR_BYTES = 150 * 1024;
const STALE_AFTER_DAYS = 90;

/** Typed error so the handler can map failures to a status code and a friendly message. */
class GitHubError extends Error {
  /** @param {'NOT_FOUND'|'BAD_TOKEN'|'RATE_LIMIT'|'UPSTREAM'} code */
  constructor(code, message, status) {
    super(message);
    this.name = 'GitHubError';
    this.code = code;
    this.status = status;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function authHeaders(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    'User-Agent': USER_AGENT,
    ...extra
  };
}

function timeoutSignal() {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

async function fetchGraphQL(token, owner, name, now) {
  const staleCutoff = new Date(now - STALE_AFTER_DAYS * 86400000).toISOString().slice(0, 10);
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      query: REPO_QUERY,
      variables: {
        owner,
        name,
        staleQuery: `repo:${owner}/${name} is:issue is:open updated:<${staleCutoff}`
      }
    }),
    signal: timeoutSignal()
  });

  if (response.status === 401) throw new GitHubError('BAD_TOKEN', 'Invalid GitHub token', 401);
  if (response.status === 403 || response.status === 429) {
    throw new GitHubError('RATE_LIMIT', 'API rate limit exceeded', 429);
  }
  if (!response.ok) {
    throw new GitHubError('UPSTREAM', `GitHub API error: ${response.status}`, 502);
  }

  const body = await response.json();
  const firstError = body.errors && body.errors[0];
  if (firstError) {
    if (firstError.type === 'NOT_FOUND' || /Could not resolve/i.test(firstError.message || '')) {
      throw new GitHubError('NOT_FOUND', 'Repository not found', 404);
    }
    if (firstError.type === 'RATE_LIMITED' || /rate limit/i.test(firstError.message || '')) {
      throw new GitHubError('RATE_LIMIT', 'API rate limit exceeded', 429);
    }
    if (!body.data || !body.data.repository) {
      throw new GitHubError('UPSTREAM', firstError.message || 'GraphQL error', 502);
    }
    // Partial data: carry on with what we have.
  }
  if (!body.data || !body.data.repository) {
    throw new GitHubError('NOT_FOUND', 'Repository not found', 404);
  }
  return body.data;
}

/**
 * Contributors with their commit counts (top 100) plus an exact total.
 * Large repositories can answer 403/204; in that case the list is empty and the total unknown.
 */
async function fetchContributors(token, owner, repo) {
  const base = `${REST_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`;
  const headers = authHeaders(token, { Accept: 'application/vnd.github+json' });

  try {
    const response = await fetch(`${base}?per_page=100`, { headers, signal: timeoutSignal() });
    if (!response.ok || response.status === 204) return { list: [], total: null };
    const list = await response.json();
    if (!Array.isArray(list)) return { list: [], total: null };

    const slim = list.map((c) => ({ login: c.login, contributions: c.contributions || 0 }));
    if (list.length < 100) return { list: slim, total: list.length };

    // More than one page: ask for a page size of 1 and read the last page number.
    const probe = await fetch(`${base}?per_page=1`, { headers, signal: timeoutSignal() });
    const link = probe.headers.get('link') || '';
    const match = link.match(/[?&]page=(\d+)>;\s*rel="last"/);
    return { list: slim, total: match ? Number(match[1]) : list.length };
  } catch {
    return { list: [], total: null };
  }
}

/**
 * Commits per day for the last 52 weeks. GitHub computes this lazily and answers 202 the first
 * time, so retry briefly. Returns null when it is unavailable (the model falls back to a sample).
 */
async function fetchWeeklyStats(token, owner, repo) {
  const url = `${REST_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stats/commit_activity`;
  const headers = authHeaders(token, { Accept: 'application/vnd.github+json' });

  try {
    for (let attempt = 0; attempt < STATS_ATTEMPTS; attempt++) {
      const response = await fetch(url, { headers, signal: timeoutSignal() });
      if (response.status === 200) {
        const weeks = await response.json();
        return Array.isArray(weeks) && weeks.length > 0 ? weeks : null;
      }
      if (response.status !== 202) return null;
      await sleep(STATS_RETRY_DELAY_MS);
    }
  } catch {
    // fall through
  }
  return null;
}

/**
 * Download an avatar and inline it as a data URI. GitHub's image proxy (camo) does not load
 * external resources referenced from inside an SVG, so the image has to be embedded.
 */
async function fetchAvatar(login) {
  try {
    const response = await fetch(`https://github.com/${encodeURIComponent(login)}.png?size=96`, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: timeoutSignal()
    });
    if (!response.ok) return null;
    const type = (response.headers.get('content-type') || '').split(';')[0].trim();
    if (!/^image\/(png|jpeg|gif|webp)$/.test(type)) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0 || buffer.length > MAX_AVATAR_BYTES) return null;
    return `data:${type};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

async function load(token, owner, repo, now) {
  const [graph, contributors, weeklyStats, avatar] = await Promise.all([
    fetchGraphQL(token, owner, repo, now),
    fetchContributors(token, owner, repo),
    fetchWeeklyStats(token, owner, repo),
    fetchAvatar(owner)
  ]);

  return {
    repo: graph.repository,
    staleIssues: graph.staleIssues ? graph.staleIssues.issueCount : null,
    contributors: contributors.list,
    contributorsTotal: contributors.total,
    weeklyStats,
    avatar,
    fetchedAt: new Date(now).toISOString()
  };
}

// Small in-memory cache: warm serverless instances reuse it so a popular README does not burn
// through the GitHub rate limit. The CDN cache headers do the heavy lifting in production.
const cache = new Map();

/**
 * Fetch everything needed to render a card for `owner/repo`.
 * Concurrent requests for the same repository share one upstream call.
 */
function fetchRepository(token, owner, repo, now = Date.now()) {
  const key = `${owner}/${repo}`.toLowerCase();
  const hit = cache.get(key);
  if (hit && now - hit.at < hit.ttl) return hit.promise;

  const entry = { at: now, ttl: CACHE_TTL_MS, promise: null };
  entry.promise = load(token, owner, repo, now).then(
    (result) => {
      if (!result.weeklyStats) entry.ttl = INCOMPLETE_TTL_MS;
      return result;
    },
    (error) => {
      cache.delete(key);
      throw error;
    }
  );
  cache.set(key, entry);

  while (cache.size > CACHE_MAX_ENTRIES) {
    cache.delete(cache.keys().next().value);
  }
  return entry.promise;
}

module.exports = { fetchRepository, GitHubError };
