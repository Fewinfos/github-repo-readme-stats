'use strict';

const { resolveTheme, isTheme } = require('./theme');

/** Sections that can be switched off with `?hide=a,b`. */
const SECTIONS = [
  'description',
  'topics',
  'stats',
  'languages',
  'metrics',
  'rank',
  'calendar',
  'activity',
  'streak',
  'footer'
];

const USERNAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;

const DEFAULT_CACHE_SECONDS = 1800;
const MIN_CACHE_SECONDS = 900;
const MAX_CACHE_SECONDS = 86400;

/** Query values may arrive as arrays (`?a=1&a=2`); use the first one. */
function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function flag(value, fallback) {
  const v = first(value);
  if (v === undefined) return fallback;
  return !/^(false|0|no|off)$/i.test(String(v));
}

/**
 * Validate and normalise the query string.
 *
 * @param {Object} query - `req.query`
 * @returns {{ error: string|null, options: Object }}
 *   `options` is always populated (with a resolved theme) so error cards can be themed.
 */
function parseOptions(query = {}) {
  const q = {};
  for (const key of Object.keys(query)) q[key] = first(query[key]);

  const themeName = isTheme(q.theme) ? q.theme : 'light';
  const theme = resolveTheme(themeName, q);

  const hide = new Set(
    String(q.hide || '')
      .toLowerCase()
      .split(',')
      .map((s) => s.trim())
      .filter((s) => SECTIONS.includes(s))
  );

  const radius = Number.parseFloat(q.border_radius);
  const cacheSeconds = Number.parseInt(q.cache_seconds, 10);

  const options = {
    owner: typeof q.username === 'string' ? q.username.trim() : '',
    repo: typeof q.repo === 'string' ? q.repo.trim() : '',
    themeName,
    theme,
    hide,
    animations: flag(q.animations, true),
    hideBorder: flag(q.hide_border, false),
    radius: Number.isFinite(radius) ? Math.max(0, Math.min(32, radius)) : 16,
    format: q.format === 'json' ? 'json' : 'svg',
    cacheSeconds: Number.isFinite(cacheSeconds)
      ? Math.max(MIN_CACHE_SECONDS, Math.min(MAX_CACHE_SECONDS, cacheSeconds))
      : DEFAULT_CACHE_SECONDS
  };

  let error = null;
  if (!options.owner || !options.repo) {
    error = 'Missing username or repo parameter';
  } else if (!USERNAME_RE.test(options.owner)) {
    error = 'Invalid username';
  } else if (!REPO_RE.test(options.repo) || options.repo === '.' || options.repo === '..') {
    error = 'Invalid repository name';
  }

  return { error, options };
}

module.exports = { parseOptions, SECTIONS, DEFAULT_CACHE_SECONDS };
