'use strict';

const { formatDayShort, formatInt } = require('../utils/format');
const { escapeXml } = require('../utils/text');
const { text, sectionTitle, n } = require('../utils/svg');

const ACTIVITY_HEIGHT = 184;
const WINDOW_DAYS = 30;
const LEFT = 30;
const TOP = 40;
const PLOT_HEIGHT = 102;

/** "Nice" axis maximum and tick values for a data maximum. */
function niceScale(max) {
  if (max <= 4) {
    const top = Math.max(2, max);
    return { top, ticks: Array.from({ length: top + 1 }, (_, i) => i) };
  }
  const raw = max / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw);
  const top = step * Math.ceil(max / step);
  const ticks = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);
  return { top, ticks };
}

/**
 * Smooth path through the points (Catmull-Rom converted to cubic Béziers). Control points are
 * clamped between neighbouring values so the curve never dips below zero or overshoots a peak.
 */
function smoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${n(points[0].x)} ${n(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const lo = Math.min(p1.y, p2.y);
    const hi = Math.max(p1.y, p2.y);
    const clamp = (y) => Math.max(lo, Math.min(hi, y));
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = clamp(p1.y + (p2.y - p0.y) / 6);
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = clamp(p2.y - (p3.y - p1.y) / 6);
    d += ` C ${n(c1x)} ${n(c1y)}, ${n(c2x)} ${n(c2y)}, ${n(p2.x)} ${n(p2.y)}`;
  }
  return d;
}

/**
 * 30-day activity chart (commits + PRs + issues per day).
 * @returns {{svg:string, height:number}}
 */
function generateActivityGraphSVG(data, theme, { width }) {
  const days = data.calendar.days.slice(-WINDOW_DAYS);
  const total = days.reduce((sum, d) => sum + d.count, 0);
  const peak = days.reduce((best, d) => (d.count > best.count ? d : best), days[0]);
  const { top, ticks } = niceScale(Math.max(...days.map((d) => d.count), 0));

  const plotWidth = width - LEFT;
  const stepX = plotWidth / (days.length - 1);
  const yOf = (count) => TOP + PLOT_HEIGHT - (count / top) * PLOT_HEIGHT;
  const points = days.map((d, i) => ({ x: LEFT + i * stepX, y: yOf(d.count), day: d }));
  const line = smoothPath(points);
  const baseline = TOP + PLOT_HEIGHT;
  const area = `${line} L ${n(points[points.length - 1].x)} ${baseline} L ${n(points[0].x)} ${baseline} Z`;

  let svg = sectionTitle(0, 10, 'LAST 30 DAYS', theme);
  svg += text(width, 10, total > 0 ? `${formatInt(total)} contributions · peak ${peak.count} on ${formatDayShort(peak.date)}` : 'No activity in the last 30 days', {
    size: 12,
    fill: theme.textMuted,
    anchor: 'end'
  });

  svg += `<defs><linearGradient id="rc-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${theme.title}" stop-opacity="0.32"/><stop offset="1" stop-color="${theme.title}" stop-opacity="0"/></linearGradient></defs>`;

  // Grid and y axis.
  for (const tick of ticks) {
    const y = yOf(tick);
    svg += `<line x1="${LEFT}" y1="${n(y)}" x2="${width}" y2="${n(y)}" stroke="${theme.border}" stroke-width="1"${tick === 0 ? '' : ' stroke-dasharray="3 4" opacity="0.7"'}/>`;
    svg += text(LEFT - 8, y + 3.5, tick, { size: 10, fill: theme.textMuted, anchor: 'end' });
  }

  // Area and line.
  svg += `<path d="${area}" fill="url(#rc-area)"/>`;
  svg += `<path d="${line}" fill="none" stroke="${theme.title}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"/>`;

  // Markers for active days; today gets a larger ring.
  points.forEach((p, i) => {
    const isToday = i === points.length - 1;
    if (p.day.count === 0 && !isToday) return;
    const label = `${p.day.count} contribution${p.day.count === 1 ? '' : 's'} · ${formatDayShort(p.day.date)}`;
    svg += `<circle cx="${n(p.x)}" cy="${n(p.y)}" r="${isToday ? 4.5 : 3}" fill="${isToday ? theme.title : theme.bg}" stroke="${theme.title}" stroke-width="2"><title>${escapeXml(label)}</title></circle>`;
  });

  // X axis labels.
  [0, 7, 14, 21, 29].forEach((i, idx, all) => {
    const anchor = idx === 0 ? 'start' : idx === all.length - 1 ? 'end' : 'middle';
    const label = i === days.length - 1 ? 'Today' : formatDayShort(days[i].date);
    svg += text(points[i].x, baseline + 18, label, { size: 10, fill: theme.textMuted, anchor });
  });

  return { svg, height: ACTIVITY_HEIGHT };
}

module.exports = { generateActivityGraphSVG, ACTIVITY_HEIGHT, niceScale, smoothPath };
