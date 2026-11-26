'use strict';

const { escapeXml, textWidth } = require('./text');

/** Round to 2 decimals so the SVG stays small and diff-friendly. */
const n = (value) => Math.round(value * 100) / 100;

/**
 * <text> element.
 * @param {number} x
 * @param {number} y - baseline
 * @param {string|number} content - escaped for you
 * @param {Object} opts - { size, weight, fill, anchor, spacing, opacity, cls }
 */
function text(x, y, content, opts = {}) {
  const { size = 12, weight = 400, fill, anchor, spacing, opacity, cls } = opts;
  let attrs = `x="${n(x)}" y="${n(y)}" font-size="${size}"`;
  if (weight !== 400) attrs += ` font-weight="${weight}"`;
  if (fill) attrs += ` fill="${fill}"`;
  if (anchor) attrs += ` text-anchor="${anchor}"`;
  if (spacing) attrs += ` letter-spacing="${spacing}"`;
  if (opacity !== undefined) attrs += ` opacity="${opacity}"`;
  if (cls) attrs += ` class="${cls}"`;
  return `<text ${attrs}>${escapeXml(content)}</text>`;
}

/** Octicon (16px grid) drawn at (x, y) with the given pixel size. */
function icon(pathData, x, y, size, fill) {
  const scale = n(size / 16);
  return `<path d="${pathData}" fill="${fill}" transform="translate(${n(x)} ${n(y)}) scale(${scale})"/>`;
}

/** Small uppercase section heading, e.g. "HEALTH & ANALYTICS". */
function sectionTitle(x, y, label, theme) {
  return text(x, y, label, {
    size: 11,
    weight: 600,
    fill: theme.textMuted,
    spacing: 1.2
  });
}

/**
 * Pill / badge. Returns the markup and its width so callers can flow pills in a row.
 * @param {Object} o - { x, y, label, icon?, dot?, fg, bg, border, size?, height? }
 */
function pill(o) {
  const size = o.size || 11.5;
  const height = o.height || 22;
  const padX = 10;
  const glyph = o.icon ? 12 : o.dot ? 6 : 0;
  const glyphGap = glyph ? 6 : 0;
  const labelWidth = textWidth(o.label, size, 500);
  const width = Math.ceil(padX + glyph + glyphGap + labelWidth + padX - (glyph ? 2 : 0));
  const cy = height / 2;

  let svg = `<g transform="translate(${n(o.x)} ${n(o.y)})">`;
  svg += `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${(height - 1) / 2}" fill="${o.bg}" stroke="${o.border}"/>`;
  let cursor = padX - (glyph ? 2 : 0);
  if (o.icon) {
    svg += icon(o.icon, cursor, cy - 6, 12, o.iconColor || o.fg);
  } else if (o.dot) {
    svg += `<circle cx="${cursor + 3}" cy="${cy}" r="3" fill="${o.dotColor || o.fg}"/>`;
  }
  cursor += glyph + glyphGap;
  svg += text(cursor, cy + size * 0.35, o.label, { size, weight: 500, fill: o.fg });
  svg += '</g>';
  return { svg, width };
}

/**
 * Wrap content so it fades in. The animated <g> is nested inside the positioned one
 * because a CSS transform would otherwise override the `transform` attribute.
 */
function section(x, y, inner, { animations, delay = 0 } = {}) {
  const body = animations
    ? `<g class="a" style="animation-delay:${delay}ms">${inner}</g>`
    : inner;
  return `<g transform="translate(${n(x)} ${n(y)})">${body}</g>`;
}

module.exports = { n, text, icon, sectionTitle, pill, section };
