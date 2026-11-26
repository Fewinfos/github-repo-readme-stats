'use strict';

const { FONT_STACK, escapeXml, truncate } = require('../utils/text');
const { resolveTheme } = require('../theme');
const { mix } = require('../utils/color');

const WIDTH = 460;
const HEIGHT = 132;

/**
 * Compact error card. Rendered in the requested theme so it still looks at home in a README.
 *
 * @param {string} message - headline, e.g. "Repository not found"
 * @param {string} [hint] - one line of advice
 * @param {Object} [theme] - resolved theme (defaults to light)
 */
function generateErrorSVG(message, hint, theme = resolveTheme('light')) {
  const danger = theme.bad;
  const tintBg = mix(theme.bg, danger, 0.14);

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(message)}" font-family="${FONT_STACK}">
<title>${escapeXml(message)}</title>
<rect width="${WIDTH}" height="${HEIGHT}" rx="14" fill="${theme.bg}"/>
<rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${HEIGHT - 1}" rx="13.5" fill="none" stroke="${danger}" stroke-opacity="0.7"/>
<g transform="translate(32 34)">
<circle cx="18" cy="18" r="18" fill="${tintBg}" stroke="${danger}" stroke-opacity="0.6"/>
<path d="M18 10.5v9" stroke="${danger}" stroke-width="2.6" stroke-linecap="round" fill="none"/>
<circle cx="18" cy="25.2" r="1.7" fill="${danger}"/>
</g>
<text x="86" y="56" font-size="16" font-weight="700" fill="${danger}">${escapeXml(truncate(message, 340, 16, 700))}</text>
<text x="86" y="80" font-size="12.5" fill="${theme.textSecondary}">${escapeXml(truncate(hint || 'Please check the username and repository name.', 340, 12.5))}</text>
<text x="86" y="100" font-size="11" fill="${theme.textMuted}">github-repo-readme-stats</text>
</svg>`;
}

module.exports = { generateErrorSVG };
