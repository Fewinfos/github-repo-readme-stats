'use strict';

/**
 * Parse #rgb / #rgba / #rrggbb / #rrggbbaa into [r, g, b]. Alpha is ignored.
 * @returns {number[]|null}
 */
function parseHex(input) {
  if (typeof input !== 'string') return null;
  let hex = input.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]+$/.test(hex)) return null;
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .slice(0, 3)
      .split('')
      .map((c) => c + c)
      .join('');
  } else if (hex.length === 8) {
    hex = hex.slice(0, 6);
  } else if (hex.length !== 6) {
    return null;
  }
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

function toHex(rgb) {
  return (
    '#' +
    rgb
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

/**
 * Linear blend between two colors. `t` is the weight of `b` (0 = a, 1 = b).
 * Falls back to `a` if either color cannot be parsed.
 */
function mix(a, b, t) {
  const ca = parseHex(a);
  const cb = parseHex(b);
  if (!ca || !cb) return a;
  return toHex(ca.map((v, i) => v + (cb[i] - v) * t));
}

/**
 * Validate user supplied color input (hex without the leading '#').
 * Only strict hex is accepted, so the value is safe to interpolate into SVG/CSS.
 * @returns {string|null} '#rrggbb' or null
 */
function normalizeColor(input) {
  if (typeof input !== 'string') return null;
  const rgb = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(input.trim()) ? parseHex(input) : null;
  return rgb ? toHex(rgb) : null;
}

/** Relative luminance (0 = black, 1 = white). */
function luminance(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

module.exports = { parseHex, toHex, mix, normalizeColor, luminance };
