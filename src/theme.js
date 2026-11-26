'use strict';

const THEMES = require('../themes');
const { mix, luminance, normalizeColor } = require('./utils/color');

const DEFAULT_THEME = 'light';

/** Rank tier colors. Chosen to stay readable on both light and dark backgrounds. */
const TIER_COLORS = {
  S: '#d9a400',
  A: '#2da44e',
  B: '#2f81f7',
  C: '#e8710a',
  D: '#d1242f'
};

/** Query parameter -> theme token. Values are hex colors without the leading '#'. */
const COLOR_OVERRIDES = {
  bg_color: 'bg',
  title_color: 'title',
  text_color: 'text',
  border_color: 'border',
  icon_color: 'iconColor',
  accent_color: 'accent'
};

/** True if `name` is one of the built-in themes (guards against `__proto__` and friends). */
function isTheme(name) {
  return typeof name === 'string' && Object.prototype.hasOwnProperty.call(THEMES, name);
}

/**
 * Resolve a theme by name, apply optional color overrides and derive the extra tokens the
 * card needs (heat-map scale, status colors, tier colors, card surface).
 *
 * @param {string} [name]
 * @param {Object} [overrides] - raw query values keyed by COLOR_OVERRIDES keys
 */
function resolveTheme(name, overrides = {}) {
  const base = { ...THEMES[isTheme(name) ? name : DEFAULT_THEME] };

  for (const [param, token] of Object.entries(COLOR_OVERRIDES)) {
    const color = normalizeColor(overrides[param]);
    if (color) base[token] = color;
  }

  // If only the text color was customised, keep the secondary shades in harmony with it.
  if (normalizeColor(overrides.text_color)) {
    base.textSecondary = mix(base.text, base.bg, 0.25);
    base.textMuted = mix(base.text, base.bg, 0.45);
  }
  // A custom background needs a matching raised surface and bar track.
  if (normalizeColor(overrides.bg_color)) {
    const dark = luminance(base.bg) < 0.4;
    base.badgeBg = mix(base.bg, dark ? '#ffffff' : '#000000', 0.05);
    base.barBg = mix(base.bg, dark ? '#ffffff' : '#000000', 0.08);
    base.badgeBorder = base.border;
  }

  const isDark = luminance(base.bg) < 0.4;
  const accent = base.accent || base.activeText;

  return {
    ...base,
    isDark,
    accent,
    good: base.activeText,
    warn: base.staleText,
    bad: isDark ? '#f85149' : '#cf222e',
    // Subtle tinted surface used for chips (topics) and highlights.
    tint: mix(base.bg, base.title, isDark ? 0.16 : 0.1),
    // 5-step contribution scale, GitHub style: empty cell + four increasing intensities.
    heat: [
      mix(base.bg, base.textMuted, isDark ? 0.22 : 0.16),
      mix(base.bg, accent, 0.3),
      mix(base.bg, accent, 0.52),
      mix(base.bg, accent, 0.76),
      accent
    ],
    tiers: TIER_COLORS
  };
}

module.exports = { resolveTheme, isTheme, TIER_COLORS, DEFAULT_THEME, COLOR_OVERRIDES };
