'use strict';

// Load environment variables from .env for local development. On Vercel the variables come from
// the project settings, so a missing dotenv must not be fatal.
try {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), quiet: true });
} catch {
  // dotenv is optional
}

const { parseOptions } = require('../src/config');
const { fetchRepository, GitHubError } = require('../src/github/client');
const { buildModel } = require('../src/model');
const { generateRepoSVG } = require('../src/card');
const { generateErrorSVG } = require('../src/card/error');

const SVG_TYPE = 'image/svg+xml; charset=utf-8';
const INCOMPLETE_CACHE_SECONDS = 300;

/** Failure -> HTTP status, headline, hint and how long clients may cache the error. */
const FAILURES = {
  NOT_FOUND: { status: 404, message: 'Repository not found', hint: 'Check the username and repository name.', cache: 300 },
  BAD_TOKEN: { status: 401, message: 'Invalid GitHub token', hint: 'The server GITHUB_TOKEN is missing or expired.', cache: 0 },
  RATE_LIMIT: { status: 429, message: 'API rate limit exceeded', hint: 'Too many requests. Try again in a few minutes.', cache: 60 },
  UPSTREAM: { status: 502, message: 'GitHub is not responding', hint: 'The GitHub API returned an error. Try again shortly.', cache: 0 }
};

function sendError(res, status, message, hint, theme, cacheSeconds = 0) {
  res.setHeader('Content-Type', SVG_TYPE);
  res.setHeader('Cache-Control', cacheSeconds > 0 ? `public, max-age=${cacheSeconds}` : 'no-store');
  return res.status(status).send(generateErrorSVG(message, hint, theme));
}

module.exports = async (req, res) => {
  const { error, options } = parseOptions(req.query || {});

  try {
    if (error) {
      return sendError(res, 400, error, 'Usage: /api?username=OWNER&repo=REPO&theme=dark', options.theme);
    }

    // The token is required for the GraphQL API.
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return sendError(res, 500, 'Server is not configured', 'Set the GITHUB_TOKEN environment variable.', options.theme);
    }

    const raw = await fetchRepository(token, options.owner, options.repo);

    // The token may be able to see private repositories; never publish those unless opted in.
    if (raw.repo.isPrivate && process.env.ALLOW_PRIVATE_REPOS !== 'true') {
      throw new GitHubError('NOT_FOUND', 'Repository not found', 404);
    }

    const data = buildModel(raw);

    // A card built from the commit sample (statistics still being computed by GitHub) is cached
    // only briefly, so the exact numbers replace it soon.
    const seconds = data.calendar.source === 'sample' ? Math.min(options.cacheSeconds, INCOMPLETE_CACHE_SECONDS) : options.cacheSeconds;
    const cache = `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=${seconds >= options.cacheSeconds ? 86400 : seconds}`;

    if (options.format === 'json') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', cache);
      return res.status(200).send(JSON.stringify(data));
    }

    res.setHeader('Content-Type', SVG_TYPE);
    res.setHeader('Cache-Control', cache);
    return res.status(200).send(generateRepoSVG(data, options.theme, options));
  } catch (err) {
    if (err instanceof GitHubError) {
      const failure = FAILURES[err.code] || FAILURES.UPSTREAM;
      return sendError(res, failure.status, failure.message, failure.hint, options.theme, failure.cache);
    }
    console.error('Unexpected error:', err);
    return sendError(res, 500, 'Failed to build the card', 'Something went wrong on our side.', options.theme);
  }
};
