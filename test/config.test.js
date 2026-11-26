'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { parseOptions } = require('../src/config');
const { resolveTheme, isTheme } = require('../src/theme');
const { normalizeColor, mix, parseHex } = require('../src/utils/color');
const { escapeXml, wrapText, truncate, textWidth } = require('../src/utils/text');
const { formatNumber, formatRelative, formatDuration, formatAge } = require('../src/utils/format');
const THEMES = require('../themes');

const q = (extra = {}) => ({ username: 'octocat', repo: 'hello-world', ...extra });

// ------------------------------------------------------------------ input

test('config: accepts valid owner and repo', () => {
  const { error, options } = parseOptions(q());
  assert.equal(error, null);
  assert.equal(options.owner, 'octocat');
  assert.equal(options.repo, 'hello-world');
});

test('config: rejects missing parameters', () => {
  assert.match(parseOptions({}).error, /Missing/);
  assert.match(parseOptions({ username: 'octocat' }).error, /Missing/);
});

test('config: rejects path tricks and odd characters', () => {
  for (const repo of ['..', '.', '../../etc', 'a/b', 'a b', 'a?b=c', 'x'.repeat(101), 'a%2Fb']) {
    assert.ok(parseOptions(q({ repo })).error, `repo ${repo} should be rejected`);
  }
  for (const username of ['-lead', 'a_b', 'a/b', 'x'.repeat(40), 'a b', '']) {
    assert.ok(parseOptions(q({ username })).error, `username ${username} should be rejected`);
  }
});

test('config: tolerates repeated query parameters (arrays)', () => {
  const { error, options } = parseOptions({ username: ['octocat', 'other'], repo: ['hello-world'], theme: ['dark', 'light'] });
  assert.equal(error, null);
  assert.equal(options.owner, 'octocat');
  assert.equal(options.themeName, 'dark');
});

test('config: non-string values do not crash', () => {
  const { error } = parseOptions({ username: { a: 1 }, repo: 42 });
  assert.ok(error);
});

// ------------------------------------------------------------------ theme

test('theme: unknown names and prototype keys fall back to light', () => {
  for (const name of ['nope', '__proto__', 'constructor', 'toString', 'hasOwnProperty', '', undefined, 42]) {
    assert.equal(isTheme(name), false, String(name));
    const theme = resolveTheme(name);
    assert.equal(theme.bg, THEMES.light.bg);
  }
  assert.equal(parseOptions(q({ theme: '__proto__' })).options.themeName, 'light');
  assert.equal(parseOptions(q({ theme: 'constructor' })).options.theme.bg, THEMES.light.bg);
});

test('theme: every built-in theme resolves with all derived tokens', () => {
  for (const name of Object.keys(THEMES)) {
    const t = resolveTheme(name);
    assert.equal(t.heat.length, 5, name);
    for (const key of ['bg', 'text', 'title', 'accent', 'good', 'warn', 'bad', 'tint']) {
      assert.match(t[key], /^#[0-9a-f]{6}([0-9a-f]{2})?$/i, `${name}.${key} = ${t[key]}`);
    }
    t.heat.forEach((c) => assert.match(c, /^#[0-9a-f]{6}$/i, name));
  }
});

test('theme: custom colors override, and only strict hex is accepted', () => {
  const t = resolveTheme('light', { bg_color: '101820', title_color: 'fee715', text_color: 'ffffff' });
  assert.equal(t.bg, '#101820');
  assert.equal(t.title, '#fee715');
  assert.equal(t.isDark, true);
  assert.notEqual(t.textMuted, THEMES.light.textMuted);

  for (const bad of ['red', 'url(javascript:alert(1))', 'fff;}</style>', '12', '"onload="x', '#ggg', '']) {
    assert.equal(normalizeColor(bad), null, bad);
    assert.equal(resolveTheme('light', { bg_color: bad }).bg, THEMES.light.bg, bad);
  }
  assert.equal(normalizeColor('#ABC'), '#aabbcc');
});

test('color: mix and parse', () => {
  assert.equal(mix('#000000', '#ffffff', 0.5), '#808080');
  assert.equal(mix('#ff0000', '#0000ff', 0), '#ff0000');
  assert.equal(mix('nonsense', '#ffffff', 0.5), 'nonsense');
  assert.deepEqual(parseHex('#50fa7b20'), [0x50, 0xfa, 0x7b]);
});

// ---------------------------------------------------------------- options

test('config: hide list keeps only known sections', () => {
  const { options } = parseOptions(q({ hide: 'Calendar, streak ,bogus,__proto__' }));
  assert.deepEqual([...options.hide].sort(), ['calendar', 'streak']);
});

test('config: flags, radius and cache clamp', () => {
  const o = parseOptions(q({ animations: 'false', hide_border: 'true', border_radius: '999', cache_seconds: '5' })).options;
  assert.equal(o.animations, false);
  assert.equal(o.hideBorder, true);
  assert.equal(o.radius, 32);
  assert.equal(o.cacheSeconds, 900);
  assert.equal(parseOptions(q({ cache_seconds: '9999999' })).options.cacheSeconds, 86400);
  const d = parseOptions(q()).options;
  assert.equal(d.animations, true);
  assert.equal(d.hideBorder, false);
  assert.equal(d.radius, 16);
  assert.equal(d.cacheSeconds, 1800);
  assert.equal(d.format, 'svg');
  assert.equal(parseOptions(q({ format: 'json' })).options.format, 'json');
  assert.equal(parseOptions(q({ format: 'xml' })).options.format, 'svg');
});

// ------------------------------------------------------------------- text

test('text: escapeXml neutralises markup and control characters', () => {
  assert.equal(escapeXml(`<script>alert("x")</script> & 'y'`), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &apos;y&apos;');
  assert.equal(escapeXml('a\u0000b\u001fc'), 'abc');
  assert.equal(escapeXml(null), '');
  assert.equal(escapeXml(0), '0');
});

test('text: wrapText wraps, limits lines and ellipsises', () => {
  assert.deepEqual(wrapText('', 300, 15), []);
  assert.deepEqual(wrapText('short text', 300, 15), ['short text']);
  const lines = wrapText('word '.repeat(80), 300, 15, 2);
  assert.equal(lines.length, 2);
  assert.ok(lines[1].endsWith('…'));
  lines.forEach((line) => assert.ok(textWidth(line, 15) <= 300 + 1, line));
  const single = wrapText('a'.repeat(200), 100, 15, 2);
  assert.ok(single[0].endsWith('…'));
});

test('text: truncate only touches long strings', () => {
  assert.equal(truncate('abc', 100, 12), 'abc');
  const t = truncate('x'.repeat(100), 60, 12);
  assert.ok(t.endsWith('…'));
  assert.ok(textWidth(t, 12) <= 60);
});

// ----------------------------------------------------------------- format

test('format: numbers, durations, ages and relative times', () => {
  assert.equal(formatNumber(0), '0');
  assert.equal(formatNumber(999), '999');
  assert.equal(formatNumber(1000), '1K');
  assert.equal(formatNumber(1234), '1.2K');
  assert.equal(formatNumber(999999), '1M');
  assert.equal(formatNumber(2500000), '2.5M');
  assert.equal(formatNumber(NaN), '—');

  assert.equal(formatDuration(30 * 60000), '30m');
  assert.equal(formatDuration(5 * 3600000), '5h');
  assert.equal(formatDuration(3 * 86400000), '3d');
  assert.equal(formatDuration(-1), 'N/A');

  const now = new Date('2026-11-26T12:00:00Z');
  assert.equal(formatAge('2026-11-01T00:00:00Z', now), '25d');
  assert.equal(formatAge('2023-07-01T00:00:00Z', now), '3y 4mo');
  assert.equal(formatRelative('2026-11-26T11:59:30Z', now), 'just now');
  assert.equal(formatRelative('2026-11-26T09:00:00Z', now), '3h ago');
  assert.equal(formatRelative('2026-11-25T00:00:00Z', now), 'yesterday');
  assert.equal(formatRelative('2026-08-26T00:00:00Z', now), '3mo ago');
  assert.equal(formatRelative(null, now), 'unknown');
});

// ------------------------------------------------------------ landing page

test('landing page: theme picker lists exactly the built-in themes', () => {
  const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'public', 'index.html'), 'utf8');
  const block = html.match(/var THEMES = (\{[\s\S]*?\n {6}\});/);
  assert.ok(block, 'THEMES block found');
  const listed = Object.keys(JSON.parse(block[1]));
  assert.deepEqual(listed.sort(), Object.keys(THEMES).sort(), 'run `node scripts/sync-landing-themes.js`');
});

test('landing page: every section name it offers is understood by the API', () => {
  const { SECTIONS } = require('../src/config');
  const html = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'public', 'index.html'), 'utf8');
  const offered = [...html.matchAll(/\['(\w+)', '[^']+'\]/g)].map((m) => m[1]).filter((n) => !n.endsWith('_color'));
  for (const name of offered) assert.ok(SECTIONS.includes(name), `${name} is not a hide-able section`);
  for (const name of SECTIONS) assert.ok(offered.includes(name), `${name} is missing from the landing page`);
});
