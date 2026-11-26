'use strict';

const { ICONS } = require('../utils/icons');
const { formatDuration, formatInt } = require('../utils/format');
const { textWidth } = require('../utils/text');
const { text, icon, sectionTitle, n } = require('../utils/svg');

const ROW_PITCH = 35;
const TOP = 22;
const COLUMN_GAP = 32;
const LABEL_X = 24;

/** Rows x 2 columns of health metrics. Height is shared with the rank card next to it. */
const ROWS = 6;
const ANALYTICS_HEIGHT = TOP + ROWS * ROW_PITCH;

const RISK_LABEL = { low: 'Low risk', medium: 'Medium risk', high: 'High risk' };

function buildMetrics(a, theme) {
  const pct = (v) => (v === null || v === undefined ? 'N/A' : `${v}%`);
  const rateBar = (v) => (v === null || v === undefined ? null : v);
  const riskColor = { low: theme.good, medium: theme.warn, high: theme.bad }[a.busFactorRisk];

  return [
    { icon: ICONS.pr, label: 'PR MERGE RATE', value: pct(a.prMergeRate), bar: rateBar(a.prMergeRate) },
    { icon: ICONS.check, label: 'ISSUE CLOSE RATE', value: pct(a.issueCloseRate), bar: rateBar(a.issueCloseRate) },
    { icon: ICONS.clock, label: 'MEDIAN TIME TO MERGE', value: a.medianMergeMs === null ? 'N/A' : formatDuration(a.medianMergeMs) },
    { icon: ICONS.commit, label: 'COMMIT QUALITY', value: `${a.commitQualityScore}%`, bar: a.commitQualityScore },
    { icon: ICONS.pulse, label: 'COMMITS · 30 DAYS', value: formatInt(a.commits30) },
    {
      icon: ICONS.people,
      label: 'ACTIVE CONTRIBUTORS',
      value: a.totalContributors ? `${a.activeContributors} / ${formatInt(a.totalContributors)}` : String(a.activeContributors)
    },
    {
      icon: ICONS.shield,
      label: 'BUS FACTOR',
      value: a.busFactor === null ? 'N/A' : `${a.busFactor} · ${RISK_LABEL[a.busFactorRisk]}`,
      dot: riskColor
    },
    { icon: ICONS.tag, label: 'RELEASE CADENCE', value: a.releaseCadence },
    { icon: ICONS.zap, label: 'GROWTH TREND', value: a.growthTrend },
    { icon: ICONS.issue, label: 'STALE ISSUES (90D+)', value: formatInt(a.staleIssues) },
    { icon: ICONS.comment, label: 'DISCUSSION / ITEM', value: a.discussionActivity.toFixed(1) },
    { icon: ICONS.calendar, label: 'REPOSITORY AGE', value: a.repoAge }
  ];
}

function barColor(value, theme) {
  if (value >= 70) return theme.good;
  if (value >= 40) return theme.warn;
  return theme.bad;
}

function generateAnalyticsSVG(data, theme, { width, animations }) {
  const colWidth = (width - COLUMN_GAP) / 2;
  const metrics = buildMetrics(data.analytics, theme);

  let svg = sectionTitle(0, 10, 'HEALTH & ANALYTICS', theme);

  metrics.forEach((metric, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col * (colWidth + COLUMN_GAP);
    const y = TOP + row * ROW_PITCH;
    const trackWidth = colWidth - LABEL_X;

    svg += `<g transform="translate(${n(x)} ${y})">`;
    svg += icon(metric.icon, 0, 3, 14, theme.iconColor);
    svg += text(LABEL_X, 14, metric.label, { size: 11, weight: 500, fill: theme.textMuted, spacing: 0.4 });

    if (metric.dot) {
      // Colored risk dot just before the value text.
      const dotX = colWidth - textWidth(metric.value, 14, 700) - 12;
      svg += `<circle cx="${n(dotX)}" cy="9.5" r="4" fill="${metric.dot}"/>`;
    }
    svg += text(colWidth, 14.5, metric.value, { size: 14, weight: 700, fill: theme.text, anchor: 'end' });

    if (metric.bar !== null && metric.bar !== undefined) {
      svg += `<rect x="${LABEL_X}" y="22" width="${n(trackWidth)}" height="4" rx="2" fill="${theme.barBg}"/>`;
      svg += `<rect${animations ? ' class="bar"' : ''} x="${LABEL_X}" y="22" width="${n((trackWidth * metric.bar) / 100)}" height="4" rx="2" fill="${barColor(metric.bar, theme)}"/>`;
    } else {
      svg += `<rect x="${LABEL_X}" y="24" width="${n(trackWidth)}" height="1" fill="${theme.border}" opacity="0.6"/>`;
    }
    svg += '</g>';
  });

  return { svg, height: ANALYTICS_HEIGHT };
}

module.exports = { generateAnalyticsSVG, ANALYTICS_HEIGHT };
