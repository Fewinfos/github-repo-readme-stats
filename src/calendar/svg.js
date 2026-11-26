'use strict';

const { MONTHS, formatInt, formatDayLong, formatDayShort } = require('../utils/format');
const { escapeXml } = require('../utils/text');
const { text, n } = require('../utils/svg');

const LABEL_WIDTH = 30;
const CELL_GAP = 3;
const GRID_TOP = 50;
const WEEKDAY_LABELS = { 1: 'Mon', 3: 'Wed', 5: 'Fri' };

/** Intensity thresholds from the quartiles of the non-zero days (like GitHub's graph). */
function levelThresholds(days) {
  const counts = days.filter((d) => d.count > 0).map((d) => d.count).sort((a, b) => a - b);
  if (counts.length === 0) return [1, 2, 3];
  const at = (q) => counts[Math.min(counts.length - 1, Math.floor(q * (counts.length - 1)))];
  return [at(0.25), at(0.5), at(0.75)];
}

function levelOf(count, thresholds) {
  if (count <= 0) return 0;
  if (count <= thresholds[0]) return 1;
  if (count <= thresholds[1]) return 2;
  if (count <= thresholds[2]) return 3;
  return 4;
}

function describeDay(day) {
  const parts = [];
  if (day.commits) parts.push(`${day.commits} commit${day.commits === 1 ? '' : 's'}`);
  if (day.prs) parts.push(`${day.prs} PR${day.prs === 1 ? '' : 's'} opened`);
  if (day.issues) parts.push(`${day.issues} issue${day.issues === 1 ? '' : 's'} opened`);
  return `${parts.join(', ') || 'No activity'} on ${formatDayLong(day.date)}`;
}

/** Calendar height for a given width (cells are square, so it follows from the column count). */
function calendarHeight(width, weeks) {
  const pitch = (width - LABEL_WIDTH) / weeks;
  return Math.round(GRID_TOP + 7 * pitch + 34);
}

/**
 * GitHub-style contribution calendar for the last year.
 * @returns {{svg:string, height:number}}
 */
function generateCalendarSVG(data, theme, { width }) {
  const { calendar } = data;
  const days = calendar.days;
  const startOffset = new Date(days[0].date + 'T00:00:00Z').getUTCDay(); // 0 = Sunday
  const weeks = Math.ceil((startOffset + days.length) / 7);
  const pitch = (width - LABEL_WIDTH) / weeks;
  const cell = pitch - CELL_GAP;
  const thresholds = levelThresholds(days);

  // Headline.
  let svg = text(0, 12, `${formatInt(calendar.total)} contributions in the last year`, {
    size: 15,
    weight: 600,
    fill: theme.text
  });
  const busiest = days.reduce((best, d) => (d.count > best.count ? d : best), days[0]);
  const summary = busiest.count > 0
    ? `${calendar.activeDays} active days · busiest ${formatDayShort(busiest.date)} (${busiest.count})`
    : 'No activity in the last year';
  svg += text(width, 12, summary, { size: 12, fill: theme.textMuted, anchor: 'end' });

  // Month labels: one per month at the column where it starts. A leading partial month is
  // dropped when the next month begins within three columns, and labels never crowd each other.
  const starts = [];
  let lastMonth = -1;
  for (let col = 0; col < weeks; col++) {
    const month = Number(days[Math.max(0, col * 7 - startOffset)].date.slice(5, 7)) - 1;
    if (month !== lastMonth) starts.push({ col, month });
    lastMonth = month;
  }
  if (starts.length > 1 && starts[1].col - starts[0].col < 3) starts.shift();
  let lastLabelCol = -10;
  for (const { col, month } of starts) {
    if (col - lastLabelCol < 3) continue;
    svg += text(LABEL_WIDTH + col * pitch, GRID_TOP - 10, MONTHS[month], { size: 10, fill: theme.textMuted });
    lastLabelCol = col;
  }

  // Weekday labels.
  for (const [row, label] of Object.entries(WEEKDAY_LABELS)) {
    svg += text(0, GRID_TOP + Number(row) * pitch + cell * 0.78, label, { size: 10, fill: theme.textMuted });
  }

  // Cells, one group per day so each carries a tooltip.
  days.forEach((day, i) => {
    const col = Math.floor((i + startOffset) / 7);
    const row = (i + startOffset) % 7;
    const x = LABEL_WIDTH + col * pitch;
    const y = GRID_TOP + row * pitch;
    const level = levelOf(day.count, thresholds);
    const isToday = i === days.length - 1;
    const stroke = isToday ? ` stroke="${theme.textSecondary}" stroke-width="1"` : '';
    const rect = `<rect x="${n(x)}" y="${n(y)}" width="${n(cell)}" height="${n(cell)}" rx="3" fill="${theme.heat[level]}"${stroke}`;
    svg += day.count > 0 ? `${rect}><title>${escapeXml(describeDay(day))}</title></rect>` : `${rect}/>`;
  });

  // Footer: data note on the left, legend on the right.
  const footerY = GRID_TOP + 7 * pitch + 22;
  const note =
    calendar.source === 'sample'
      ? `Based on the latest commits${calendar.sampleSince ? ` since ${formatDayShort(calendar.sampleSince)}` : ''} · weekly statistics unavailable`
      : 'Commits plus pull requests and issues opened · UTC';
  svg += text(LABEL_WIDTH, footerY, note, { size: 10.5, fill: theme.textMuted });

  const legendCell = 11;
  const legendGap = 3;
  const legendWidth = 5 * legendCell + 4 * legendGap;
  const legendX = width - legendWidth - 30;
  svg += text(legendX - 8, footerY, 'Less', { size: 10.5, fill: theme.textMuted, anchor: 'end' });
  theme.heat.forEach((color, i) => {
    svg += `<rect x="${legendX + i * (legendCell + legendGap)}" y="${footerY - legendCell + 1}" width="${legendCell}" height="${legendCell}" rx="2.5" fill="${color}"/>`;
  });
  svg += text(legendX + legendWidth + 8, footerY, 'More', { size: 10.5, fill: theme.textMuted });

  return { svg, height: calendarHeight(width, weeks) };
}

module.exports = { generateCalendarSVG, levelThresholds, levelOf };
