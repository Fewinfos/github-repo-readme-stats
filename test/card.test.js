'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { parseOptions } = require('../src/config');
const { buildModel } = require('../src/model');
const { generateRepoSVG } = require('../src/card');
const { generateErrorSVG } = require('../src/card/error');
const { resolveTheme } = require('../src/theme');
const THEMES = require('../themes');
const { SCENARIOS, FIXED_NOW, makeRaw } = require('./fixtures');

/** Minimal well-formedness check: tags balance and nothing leaks "undefined" / "NaN". */
function assertWellFormed(svg, label) {
  assert.ok(svg.startsWith('<svg '), `${label}: starts with <svg`);
  assert.ok(svg.trimEnd().endsWith('</svg>'), `${label}: ends with </svg>`);

  const stack = [];
  const tag = /<(\/?)([A-Za-z][\w:.-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  let m;
  while ((m = tag.exec(svg))) {
    const [, closing, name, , selfClosing] = m;
    if (selfClosing) continue;
    if (closing) {
      assert.equal(stack.pop(), name, `${label}: unbalanced </${name}> near ${svg.slice(m.index - 40, m.index + 40)}`);
    } else {
      stack.push(name);
    }
  }
  assert.deepEqual(stack, [], `${label}: unclosed tags`);

  for (const bad of ['undefined', 'NaN', '[object', 'Infinity', 'null']) {
    // Drop the base64 avatar before scanning.
    const text = svg.replace(/data:[^"]+/g, '');
    assert.ok(!text.includes(bad), `${label}: output contains "${bad}": ${text.slice(Math.max(0, text.indexOf(bad) - 60), text.indexOf(bad) + 60)}`);
  }
}

function render(raw, query = {}) {
  const { options } = parseOptions({ username: 'x', repo: 'y', ...query });
  return generateRepoSVG(buildModel(raw, FIXED_NOW), options.theme, options);
}

test('card: every scenario renders well-formed SVG in several themes', () => {
  for (const [name, make] of Object.entries(SCENARIOS)) {
    for (const theme of ['light', 'dark', 'dracula']) {
      assertWellFormed(render(make(), { theme }), `${name}/${theme}`);
    }
  }
});

test('card: every theme renders the busy scenario', () => {
  for (const theme of Object.keys(THEMES)) {
    assertWellFormed(render(SCENARIOS.busy(), { theme }), theme);
  }
});

test('card: width/height match the viewBox', () => {
  const svg = render(SCENARIOS.busy());
  const [, w, h] = svg.match(/<svg width="(\d+)" height="(\d+)" viewBox="0 0 \1 \2"/);
  assert.equal(w, '1000');
  assert.ok(Number(h) > 600 && Number(h) < 1500, `height ${h}`);
});

test('card: shows the headline facts', () => {
  const svg = render(SCENARIOS.busy());
  for (const needle of ['acme-labs', 'streamline', '12.4K', 'TypeScript', 'REPOSITORY RANK', 'CURRENT STREAK', 'contributions in the last year', 'LAST 30 DAYS', 'HEALTH &amp; ANALYTICS']) {
    assert.ok(svg.includes(needle), `missing "${needle}"`);
  }
});

test('card: markup in repository fields is escaped, never injected', () => {
  const evil = '</text><script>alert(1)</script><image href="x" onerror="alert(2)"/>';
  const svg = render(
    makeRaw({
      repo: {
        name: 'evil<&>"repo',
        description: evil,
        homepageUrl: 'https://example.com/"><script>alert(3)</script>',
        licenseInfo: { name: evil, spdxId: evil },
        repositoryTopics: { nodes: [{ topic: { name: evil } }] },
        owner: { login: 'o<w>ner', avatarUrl: '' },
        languages: { totalSize: 10, edges: [{ size: 10, node: { name: evil, color: '#fff" onload="x' } }] }
      }
    })
  );
  assert.ok(!svg.includes('<script'), 'no script tag');
  assert.ok(!/<image[^>]*onerror/.test(svg), 'no injected image');
  assert.ok(!svg.includes('" onload="x'), 'color attribute cannot break out');
});

test('card: hide removes sections and shrinks the card', () => {
  const full = render(SCENARIOS.busy());
  const height = (svg) => Number(svg.match(/height="(\d+)"/)[1]);

  const noCalendar = render(SCENARIOS.busy(), { hide: 'calendar' });
  assert.ok(!noCalendar.includes('contributions in the last year'));
  assert.ok(height(noCalendar) < height(full) - 150);

  const slim = render(SCENARIOS.busy(), { hide: 'description,topics,stats,languages,metrics,rank,calendar,activity,streak,footer' });
  assert.ok(height(slim) < 200);
  assertWellFormed(slim, 'slim');

  // Hiding one half of a pair lets the other take its place.
  const noRank = render(SCENARIOS.busy(), { hide: 'rank' });
  assert.ok(!noRank.includes('REPOSITORY RANK'));
  assert.ok(noRank.includes('HEALTH &amp; ANALYTICS'));
  const noMetrics = render(SCENARIOS.busy(), { hide: 'metrics' });
  assert.ok(noMetrics.includes('REPOSITORY RANK'));
  assert.ok(!noMetrics.includes('HEALTH &amp; ANALYTICS'));
});

test('card: animations can be switched off', () => {
  const on = render(SCENARIOS.busy());
  const off = render(SCENARIOS.busy(), { animations: 'false' });
  assert.ok(on.includes('@keyframes') && on.includes('prefers-reduced-motion'));
  assert.ok(!off.includes('@keyframes') && !off.includes('class="a"'));
});

test('card: custom colors and border options apply', () => {
  const svg = render(SCENARIOS.busy(), { bg_color: '101820', title_color: 'fee715', hide_border: 'true', border_radius: '4' });
  assert.ok(svg.includes('fill="#101820"'));
  assert.ok(svg.includes('#fee715'));
  assert.ok(svg.includes('rx="4"'));
  assert.ok(!svg.includes('width="999" height='), 'border rect removed');
  assert.ok(render(SCENARIOS.busy()).includes('width="999" height='), 'border rect present by default');
});

test('card: calendar is honest when only a commit sample is available', () => {
  assert.ok(render(SCENARIOS['sample-only']()).includes('weekly statistics unavailable'));
  assert.ok(!render(SCENARIOS.busy()).includes('weekly statistics unavailable'));
});

test('card: accessibility title and description are present', () => {
  const svg = render(SCENARIOS.busy());
  assert.match(svg, /<title id="rc-title">acme-labs\/streamline repository stats<\/title>/);
  assert.match(svg, /<desc id="rc-desc">[^<]*stars[^<]*rank [SABCD]/);
  assert.ok(svg.includes('role="img"'));
});

test('card: the same data renders identically (deterministic)', () => {
  assert.equal(render(SCENARIOS.busy()), render(SCENARIOS.busy()));
});

test('error card: themed, escaped and well-formed', () => {
  const svg = generateErrorSVG('Repo <not> found', 'try "again" & again', resolveTheme('dracula'));
  assertWellFormed(svg, 'error');
  assert.ok(svg.includes('Repo &lt;not&gt; found'));
  assert.ok(svg.includes('#282a36'));
  assertWellFormed(generateErrorSVG('x'), 'error default');
});
