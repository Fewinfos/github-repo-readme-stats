'use strict';

const { text, n } = require('../utils/svg');

const RANK_HEIGHT = 232;
const RADIUS = 44;
const STROKE = 10;

const CATEGORIES = [
  { key: 'popularity', label: 'Popularity' },
  { key: 'activity', label: 'Activity' },
  { key: 'community', label: 'Community' }
];

/**
 * Rank card: score ring, tier letter and the three category sub-scores.
 * @returns {{svg:string, height:number}}
 */
function generateRankSVG(data, theme, { width, animations }) {
  const { score, tier, label, breakdown } = data.rank;
  const tierColor = theme.tiers[tier] || theme.title;
  const circumference = 2 * Math.PI * RADIUS;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);
  const cx = 70;
  const cy = 88;

  let svg = `<rect x="0.5" y="0.5" width="${width - 1}" height="${RANK_HEIGHT - 1}" rx="14" fill="${theme.badgeBg}" stroke="${theme.badgeBorder}"/>`;
  svg += text(18, 28, 'REPOSITORY RANK', { size: 11, weight: 600, fill: theme.textMuted, spacing: 1.2 });

  // Ring.
  svg += `<circle cx="${cx}" cy="${cy}" r="${RADIUS}" fill="none" stroke="${theme.barBg}" stroke-width="${STROKE}"/>`;
  svg +=
    `<circle${animations ? ' class="ring"' : ''} cx="${cx}" cy="${cy}" r="${RADIUS}" fill="none" stroke="${tierColor}" ` +
    `stroke-width="${STROKE}" stroke-linecap="round" stroke-dasharray="${n(circumference)}" ` +
    `stroke-dashoffset="${n(offset)}" transform="rotate(-90 ${cx} ${cy})" style="--c:${n(circumference)}"/>`;
  svg += text(cx, cy + 6, score.toFixed(1), { size: 26, weight: 800, fill: theme.text, anchor: 'middle' });
  svg += text(cx, cy + 24, 'OUT OF 100', { size: 9, weight: 600, fill: theme.textMuted, anchor: 'middle', spacing: 0.8 });

  // Tier.
  svg += text(146, 64, 'TIER', { size: 11, weight: 600, fill: theme.textMuted, spacing: 1.2 });
  svg += text(144, 112, tier, { size: 56, weight: 800, fill: tierColor });
  svg += text(146, 134, label, { size: 12, weight: 600, fill: theme.textSecondary });

  // Category breakdown.
  const barWidth = width - 36;
  CATEGORIES.forEach((cat, i) => {
    const y = 168 + i * 22;
    const { score: s, max } = breakdown[cat.key];
    svg += text(18, y, cat.label, { size: 11, weight: 500, fill: theme.textSecondary });
    svg += text(width - 18, y, `${s.toFixed(1)} / ${max}`, { size: 11, weight: 700, fill: theme.text, anchor: 'end' });
    svg += `<rect x="18" y="${y + 5}" width="${barWidth}" height="4" rx="2" fill="${theme.barBg}"/>`;
    svg += `<rect${animations ? ' class="bar"' : ''} x="18" y="${y + 5}" width="${n((barWidth * s) / max)}" height="4" rx="2" fill="${tierColor}"/>`;
  });

  return { svg, height: RANK_HEIGHT };
}

module.exports = { generateRankSVG, RANK_HEIGHT };
