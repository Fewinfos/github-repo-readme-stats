'use strict';

const { FLAME_640 } = require('../utils/icons');
const { formatDayShort, formatInt } = require('../utils/format');
const { textWidth } = require('../utils/text');
const { text, n } = require('../utils/svg');

const STREAK_HEIGHT = 184;
const FLAME = '#f0883e';

const range = (r) => (r ? (r.start === r.end ? formatDayShort(r.start) : `${formatDayShort(r.start)} – ${formatDayShort(r.end)}`) : '');

/**
 * Streak card: current streak, longest streak and active days.
 * @returns {{svg:string, height:number}}
 */
function generateStreakSVG(data, theme, { width }) {
  const s = data.streak;
  const alive = s.currentStreak > 0;
  const flameSize = 46;
  const flameScale = flameSize / 640;

  let svg = `<rect x="0.5" y="0.5" width="${width - 1}" height="${STREAK_HEIGHT - 1}" rx="14" fill="${theme.badgeBg}" stroke="${theme.badgeBorder}"/>`;

  // Current streak.
  svg += text(18, 28, 'CURRENT STREAK', { size: 11, weight: 600, fill: theme.textMuted, spacing: 1.2 });
  svg += `<path d="${FLAME_640}" fill="${alive ? FLAME : theme.textMuted}" opacity="${alive ? 1 : 0.5}" transform="translate(${width - 18 - flameSize} 22) scale(${n(flameScale)})"/>`;

  const bigNumber = String(s.currentStreak);
  svg += text(18, 82, bigNumber, { size: 48, weight: 800, fill: alive ? theme.text : theme.textMuted });
  svg += text(18 + textWidth(bigNumber, 48, 800) + 8, 82, s.currentStreak === 1 ? 'day' : 'days', {
    size: 14,
    weight: 500,
    fill: theme.textSecondary
  });
  svg += text(18, 102, alive ? range(s.currentRange) : 'No active streak', { size: 11.5, fill: theme.textMuted });

  svg += `<line x1="18" y1="116" x2="${width - 18}" y2="116" stroke="${theme.border}" opacity="0.7"/>`;

  // Longest streak and active days.
  const colWidth = (width - 36) / 2;
  const columns = [
    {
      label: 'LONGEST STREAK',
      value: String(s.longestStreak),
      unit: s.longestStreak === 1 ? 'day' : 'days',
      sub: s.longestStreak > 0 ? range(s.longestRange) : '—'
    },
    {
      label: 'ACTIVE DAYS',
      value: formatInt(s.activeDays),
      unit: `/ ${s.totalDays}`,
      sub: `${Math.round((s.activeDays / s.totalDays) * 100)}% of the year`
    }
  ];
  columns.forEach((col, i) => {
    const x = 18 + i * colWidth;
    svg += text(x, 138, col.label, { size: 10, weight: 600, fill: theme.textMuted, spacing: 0.8 });
    svg += text(x, 162, col.value, { size: 22, weight: 700, fill: theme.text });
    svg += text(x + textWidth(col.value, 22, 700) + 5, 162, col.unit, { size: 11.5, fill: theme.textSecondary });
    svg += text(x, 177, col.sub, { size: 10.5, fill: theme.textMuted });
  });

  return { svg, height: STREAK_HEIGHT };
}

module.exports = { generateStreakSVG, STREAK_HEIGHT };
