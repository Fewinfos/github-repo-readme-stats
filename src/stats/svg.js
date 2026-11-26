'use strict';

const { ICONS } = require('../utils/icons');
const { formatNumber, formatInt } = require('../utils/format');
const { escapeXml } = require('../utils/text');
const { text, icon, n } = require('../utils/svg');

const TILE_HEIGHT = 64;
const GAP = 8;
const STAR_GOLD = '#e3b341';

/** Row of headline numbers: stars, forks, watchers, issues, PRs, commits, contributors. */
function generateStatsSVG(data, theme, { width }) {
  const s = data.stats;
  const tiles = [
    { icon: ICONS.star, color: STAR_GOLD, label: 'Stars', value: s.stars },
    { icon: ICONS.fork, label: 'Forks', value: s.forks },
    { icon: ICONS.eye, label: 'Watching', value: s.watchers },
    { icon: ICONS.issue, label: 'Issues', value: s.openIssues },
    { icon: ICONS.pr, label: 'Pull requests', value: s.openPullRequests },
    { icon: ICONS.commit, label: 'Commits', value: s.commits },
    { icon: ICONS.people, label: 'Contributors', value: s.contributors }
  ];

  const tileWidth = (width - GAP * (tiles.length - 1)) / tiles.length;
  let svg = '';

  tiles.forEach((tile, i) => {
    const known = tile.value !== null && tile.value !== undefined;
    svg += `<g transform="translate(${n(i * (tileWidth + GAP))} 0)">`;
    if (known) svg += `<title>${escapeXml(`${formatInt(tile.value)} ${tile.label.toLowerCase()}`)}</title>`;
    svg += `<rect x="0.5" y="0.5" width="${n(tileWidth - 1)}" height="${TILE_HEIGHT - 1}" rx="10" fill="${theme.badgeBg}" stroke="${theme.badgeBorder}"/>`;
    svg += icon(tile.icon, 14, 13, 14, tile.color || theme.iconColor);
    svg += text(34, 24.5, tile.label, { size: 12, weight: 500, fill: theme.textSecondary });
    svg += text(14, 51, known ? formatNumber(tile.value) : '—', { size: 22, weight: 700, fill: theme.text });
    svg += '</g>';
  });

  return { svg, height: TILE_HEIGHT };
}

module.exports = { generateStatsSVG, TILE_HEIGHT };
