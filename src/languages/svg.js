'use strict';

const { textWidth, escapeXml } = require('../utils/text');
const { text, sectionTitle, n } = require('../utils/svg');

const BAR_Y = 16;
const BAR_HEIGHT = 10;
const LEGEND_PITCH = 22;
const MIN_SEGMENT = 3;

const formatPercent = (p) => (p < 0.1 ? '<0.1' : p.toFixed(1)) + '%';

/** GitHub-style stacked language bar with a legend underneath. */
function generateLanguagesSVG(data, theme, { width, animations }) {
  const languages = data.languages;
  if (languages.length === 0) return null;

  // Proportional widths, but keep tiny languages visible.
  const raw = languages.map((l) => Math.max(MIN_SEGMENT, (l.percent / 100) * width));
  const scale = width / raw.reduce((sum, w) => sum + w, 0);

  let svg = sectionTitle(0, 10, 'LANGUAGES', theme);
  svg += `<clipPath id="rc-lang"><rect y="${BAR_Y}" width="${width}" height="${BAR_HEIGHT}" rx="${BAR_HEIGHT / 2}"/></clipPath>`;
  svg += `<g clip-path="url(#rc-lang)"><g${animations ? ' class="bar"' : ''}>`;
  svg += `<rect y="${BAR_Y}" width="${width}" height="${BAR_HEIGHT}" fill="${theme.barBg}"/>`;

  let x = 0;
  languages.forEach((lang, i) => {
    const w = raw[i] * scale;
    const color = lang.color || theme.textMuted;
    svg += `<rect x="${n(x)}" y="${BAR_Y}" width="${n(w)}" height="${BAR_HEIGHT}" fill="${color}"><title>${escapeXml(lang.name)} ${formatPercent(lang.percent)}</title></rect>`;
    if (i > 0) svg += `<rect x="${n(x - 1)}" y="${BAR_Y}" width="2" height="${BAR_HEIGHT}" fill="${theme.bg}"/>`;
    x += w;
  });
  svg += '</g></g>';

  // Legend, wrapped onto a second line if needed.
  let legendX = 0;
  let legendY = BAR_Y + BAR_HEIGHT + 24;
  for (const lang of languages) {
    const pct = formatPercent(lang.percent);
    const nameW = textWidth(lang.name, 12, 500);
    const entryW = 14 + nameW + 6 + textWidth(pct, 12) + 22;
    if (legendX + entryW > width && legendX > 0) {
      legendX = 0;
      legendY += LEGEND_PITCH;
    }
    svg += `<circle cx="${n(legendX + 5)}" cy="${legendY - 4}" r="5" fill="${lang.color || theme.textMuted}"/>`;
    svg += text(legendX + 16, legendY, lang.name, { size: 12, weight: 500, fill: theme.text });
    svg += text(legendX + 16 + nameW + 6, legendY, pct, { size: 12, fill: theme.textMuted });
    legendX += entryW;
  }

  return { svg, height: legendY + 4 };
}

module.exports = { generateLanguagesSVG };
