'use strict';

/** Font stack used for every piece of text in the card. */
const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";

// Approximate Helvetica/Arial advance widths (em units). Good enough to lay out
// pills, truncate long names and wrap descriptions without a font engine.
const WIDTHS = {};
const setWidth = (chars, w) => {
  for (const ch of chars) WIDTHS[ch] = w;
};
setWidth('ijl', 0.222);
setWidth("|", 0.26);
setWidth(" !,./:;I[]\\ft", 0.278);
setWidth("'", 0.191);
setWidth('()-`r', 0.333);
setWidth('{}', 0.334);
setWidth('"', 0.355);
setWidth('*', 0.389);
setWidth('^', 0.469);
setWidth('Jckvxyzs', 0.5);
setWidth('0123456789$#?_abdeghnopquL', 0.556);
setWidth('+<=>~', 0.584);
setWidth('FTZ', 0.611);
setWidth('ABEKPSVXY&', 0.667);
setWidth('CDHNRUw', 0.722);
setWidth('GOQ', 0.778);
setWidth('Mm', 0.833);
setWidth('%', 0.889);
setWidth('W', 0.944);
setWidth('@', 1.015);

function charWidth(ch) {
  const known = WIDTHS[ch];
  if (known !== undefined) return known;
  const cp = ch.codePointAt(0);
  if (cp >= 0x1f000) return 1.15; // emoji
  if (
    (cp >= 0x1100 && cp <= 0x11ff) ||
    (cp >= 0x2e80 && cp <= 0xa4cf) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xff00 && cp <= 0xff60)
  ) {
    return 1; // CJK / full-width
  }
  return 0.6;
}

/**
 * Estimate the rendered width of a string in px.
 * @param {string} text
 * @param {number} size - font size in px
 * @param {number} [weight=400]
 */
function textWidth(text, size, weight = 400) {
  let em = 0;
  for (const ch of String(text ?? '')) em += charWidth(ch);
  const boldFactor = weight >= 600 ? 1.07 : weight >= 500 ? 1.03 : 1;
  return em * size * boldFactor;
}

/** Truncate `text` with an ellipsis so it fits in `maxWidth` px. */
function truncate(text, maxWidth, size, weight = 400) {
  const str = String(text ?? '');
  if (textWidth(str, size, weight) <= maxWidth) return str;
  const chars = Array.from(str);
  while (chars.length > 1 && textWidth(chars.join('') + '…', size, weight) > maxWidth) {
    chars.pop();
  }
  return chars.join('').trimEnd() + '…';
}

/**
 * Wrap text to at most `maxLines` lines that fit in `maxWidth` px.
 * If the text does not fit, the last line is ellipsised.
 */
function wrapText(text, maxWidth, size, maxLines = 2, weight = 400) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  let i = 0;

  for (; i < words.length; i++) {
    const candidate = current ? `${current} ${words[i]}` : words[i];
    if (!current || textWidth(candidate, size, weight) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (lines.length === maxLines - 1) break; // no room for another line
    lines.push(current);
    current = words[i];
  }

  // Anything left over is folded into the last line and ellipsised.
  const tail = i < words.length ? [current, ...words.slice(i)].join(' ') : current;
  if (tail) lines.push(tail);
  return lines.map((line) => truncate(line, maxWidth, size, weight));
}

// Characters that are not allowed in XML 1.0 documents.
// eslint-disable-next-line no-control-regex
const INVALID_XML = /[\x00-\x08\x0B\x0C\x0E-\x1F]/g;

/** Escape a value for safe use in SVG text content or attribute values. */
function escapeXml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(INVALID_XML, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = { FONT_STACK, textWidth, truncate, wrapText, escapeXml };
