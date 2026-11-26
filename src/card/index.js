'use strict';

const { FONT_STACK, escapeXml } = require('../utils/text');
const { section, text, n } = require('../utils/svg');
const { formatInt } = require('../utils/format');
const { generateHeaderSVG, generateDescriptionSVG, generateTopicsSVG } = require('../header/svg');
const { generateStatsSVG } = require('../stats/svg');
const { generateLanguagesSVG } = require('../languages/svg');
const { generateAnalyticsSVG } = require('../analytics');
const { generateRankSVG } = require('../rank');
const { generateCalendarSVG } = require('../calendar');
const { generateActivityGraphSVG } = require('../graph');
const { generateStreakSVG } = require('../streak');

const WIDTH = 1000;
const PAD = 32;
const INNER = WIDTH - PAD * 2;
const SIDE_WIDTH = 272; // rank / streak card
const SIDE_GAP = 40;
const STAGGER_MS = 70;

const STYLE = `
.a{animation:rc-fade .6s ease-out both}
@keyframes rc-fade{from{opacity:0;transform:translateY(6px)}}
.bar{transform-box:fill-box;transform-origin:0 50%;animation:rc-grow .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes rc-grow{from{transform:scaleX(0)}}
.ring{animation:rc-ring 1.2s cubic-bezier(.2,.8,.2,1) both}
@keyframes rc-ring{from{stroke-dashoffset:var(--c)}}
@media (prefers-reduced-motion:reduce){.a,.bar,.ring{animation:none}}`;

/** Footer line: data source on the left, generation time on the right. */
function generateFooterSVG(data, theme, { width }) {
  const d = new Date(data.generatedAt);
  const stamp = d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  });
  const svg =
    `<line x1="0" y1="0" x2="${width}" y2="0" stroke="${theme.border}" opacity="0.6"/>` +
    text(0, 22, 'Live data from the GitHub API', { size: 10.5, fill: theme.textMuted }) +
    text(width, 22, `Generated ${stamp} UTC`, { size: 10.5, fill: theme.textMuted, anchor: 'end' });
  return { svg, height: 28 };
}

/** Two cards side by side; either can be hidden, in which case the other takes its natural place. */
function pairRow(left, right, hideLeft, hideRight, ctx) {
  const showLeft = !hideLeft;
  const showRight = !hideRight;
  if (!showLeft && !showRight) return null;

  const leftWidth = showRight ? INNER - SIDE_WIDTH - SIDE_GAP : INNER;
  const l = showLeft ? left({ ...ctx, width: leftWidth }) : null;
  const r = showRight ? right({ ...ctx, width: SIDE_WIDTH }) : null;

  let svg = '';
  if (l) svg += `<g>${l.svg}</g>`;
  if (r) svg += `<g transform="translate(${INNER - SIDE_WIDTH} 0)">${r.svg}</g>`;
  return { svg, height: Math.max(l ? l.height : 0, r ? r.height : 0) };
}

function summaryOf(data) {
  const s = data.stats;
  return (
    `${data.owner}/${data.name}: ${formatInt(s.stars)} stars, ${formatInt(s.forks)} forks, ` +
    `${formatInt(s.openIssues)} open issues, rank ${data.rank.tier} (${data.rank.score}/100), ` +
    `${data.streak.currentStreak}-day current streak.`
  );
}

/**
 * Compose the full repository card.
 *
 * @param {Object} data - model from `buildModel`
 * @param {Object} theme - result of `resolveTheme`
 * @param {Object} options - { hide:Set, animations:boolean, hideBorder:boolean, radius:number }
 * @returns {string} SVG markup
 */
function generateRepoSVG(data, theme, options = {}) {
  const { hide = new Set(), animations = true, hideBorder = false, radius = 16 } = options;
  const ctx = { animations };

  const blocks = [];
  let y = PAD;
  let step = 0;

  const add = (gap, build) => {
    const block = build();
    if (!block || !block.height) return;
    if (blocks.length > 0) y += gap;
    blocks.push(section(PAD, y, block.svg, { animations, delay: step++ * STAGGER_MS }));
    y += block.height;
  };

  add(0, () => generateHeaderSVG(data, theme, { ...ctx, width: INNER }));
  if (!hide.has('description')) add(10, () => generateDescriptionSVG(data, theme, { ...ctx, width: INNER }));
  if (!hide.has('topics')) add(12, () => generateTopicsSVG(data, theme, { ...ctx, width: INNER }));
  if (!hide.has('stats')) add(22, () => generateStatsSVG(data, theme, { ...ctx, width: INNER }));
  if (!hide.has('languages')) add(22, () => generateLanguagesSVG(data, theme, { ...ctx, width: INNER }));
  add(28, () =>
    pairRow(
      (c) => generateAnalyticsSVG(data, theme, c),
      (c) => generateRankSVG(data, theme, c),
      hide.has('metrics'),
      hide.has('rank'),
      ctx
    )
  );
  if (!hide.has('calendar')) add(28, () => generateCalendarSVG(data, theme, { ...ctx, width: INNER }));
  add(28, () =>
    pairRow(
      (c) => generateActivityGraphSVG(data, theme, c),
      (c) => generateStreakSVG(data, theme, c),
      hide.has('activity'),
      hide.has('streak'),
      ctx
    )
  );
  if (!hide.has('footer')) add(18, () => generateFooterSVG(data, theme, { ...ctx, width: INNER }));

  const bottom = hide.has('footer') ? PAD : 12;
  const height = Math.ceil(y + bottom);
  const r = Math.max(0, Math.min(32, radius));
  const title = `${data.owner}/${data.name} repository stats`;

  return `<svg width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-labelledby="rc-title rc-desc" font-family="${FONT_STACK}">
<title id="rc-title">${escapeXml(title)}</title>
<desc id="rc-desc">${escapeXml(summaryOf(data))}</desc>
${animations ? `<style>${STYLE}</style>` : ''}
<defs><clipPath id="rc-card"><rect width="${WIDTH}" height="${height}" rx="${r}"/></clipPath>
<linearGradient id="rc-accent" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${theme.title}"/><stop offset="1" stop-color="${theme.accent}"/></linearGradient></defs>
<rect width="${WIDTH}" height="${height}" rx="${r}" fill="${theme.bg}"/>
<rect width="${WIDTH}" height="4" fill="url(#rc-accent)" clip-path="url(#rc-card)"/>
${hideBorder ? '' : `<rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="${n(Math.max(0, r - 0.5))}" fill="none" stroke="${theme.border}"/>`}
${blocks.join('\n')}
</svg>`;
}

module.exports = { generateRepoSVG, WIDTH };
