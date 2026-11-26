'use strict';

const { ICONS } = require('../utils/icons');
const { escapeXml, textWidth, truncate, wrapText } = require('../utils/text');
const { text, icon, pill, n } = require('../utils/svg');
const { mix } = require('../utils/color');

const AVATAR = 72;
const HEADER_HEIGHT = 82;

function avatarSvg(data, theme) {
  const r = AVATAR / 2;
  const ring = `<circle cx="${r}" cy="${r}" r="${r - 0.75}" fill="none" stroke="${theme.border}" stroke-width="1.5"/>`;

  if (data.avatar) {
    return (
      `<clipPath id="rc-avatar"><circle cx="${r}" cy="${r}" r="${r}"/></clipPath>` +
      `<image href="${data.avatar}" xlink:href="${data.avatar}" width="${AVATAR}" height="${AVATAR}" clip-path="url(#rc-avatar)"/>` +
      ring
    );
  }

  // No avatar available (offline, rate limited): fall back to a monogram.
  const initial = (data.owner || '?').charAt(0).toUpperCase();
  return (
    `<circle cx="${r}" cy="${r}" r="${r}" fill="${theme.tint}"/>` +
    text(r, r + 11, initial, { size: 32, weight: 700, fill: theme.title, anchor: 'middle' }) +
    ring
  );
}

/** Pills that describe the repository: visibility, health, license, release, branch... */
function buildPills(data, theme) {
  const neutral = {
    fg: theme.textSecondary,
    bg: theme.badgeBg,
    border: theme.badgeBorder,
    iconColor: theme.iconColor
  };
  const bad = {
    fg: theme.bad,
    bg: mix(theme.bg, theme.bad, 0.12),
    border: mix(theme.bg, theme.bad, 0.45)
  };
  const good = { fg: theme.activeText, bg: theme.activeBg, border: theme.activeBorder };
  const warn = { fg: theme.staleText, bg: theme.staleBg, border: theme.staleBorder };

  const health = {
    active: { label: 'Active', ...good },
    quiet: { label: 'Quiet', ...warn },
    dormant: { label: 'Dormant', ...bad }
  }[data.health];

  const pills = [
    { label: data.isPrivate ? 'Private' : 'Public', icon: data.isPrivate ? ICONS.lock : ICONS.globe, ...neutral }
  ];
  if (data.archived) pills.push({ label: 'Archived', icon: ICONS.archive, ...warn });
  else if (health) pills.push({ ...health, dot: true });
  if (data.isFork && data.forkOf) {
    pills.push({ label: `Fork of ${truncate(data.forkOf, 190, 11.5, 500)}`, icon: ICONS.fork, ...neutral });
  }
  if (data.license) pills.push({ label: data.license, icon: ICONS.license, ...neutral });
  if (data.latestRelease) {
    pills.push({ label: truncate(data.latestRelease.tag, 110, 11.5, 500), icon: ICONS.tag, ...neutral });
  }
  if (data.defaultBranch) pills.push({ label: truncate(data.defaultBranch, 110, 11.5, 500), icon: ICONS.branch, ...neutral });
  return pills;
}

/**
 * Avatar, `owner / repo` title, status pills and the "pushed" badge.
 * @returns {{svg:string, height:number}}
 */
function generateHeaderSVG(data, theme, { width }) {
  const textX = AVATAR + 18;

  // Last push badge, top right.
  const pushed = pill({
    x: 0,
    y: 0,
    label: `Pushed ${data.pushedAtText}`,
    icon: ICONS.clock,
    fg: theme.textSecondary,
    bg: theme.badgeBg,
    border: theme.badgeBorder,
    iconColor: theme.iconColor
  });
  const pushedX = width - pushed.width;

  let svg = `<g transform="translate(0 ${(HEADER_HEIGHT - AVATAR) / 2})">${avatarSvg(data, theme)}</g>`;
  svg += `<g transform="translate(${n(pushedX)} 0)">${pushed.svg}</g>`;

  // Owner line + repo name.
  svg += icon(ICONS.repo, textX, 3, 14, theme.iconColor);
  svg += text(textX + 22, 15, truncate(data.owner, 320, 14, 500), {
    size: 14,
    weight: 500,
    fill: theme.textSecondary
  });
  const nameMax = pushedX - textX - 16;
  svg += `<a href="${escapeXml(data.url)}">${text(textX, 50, truncate(data.name, nameMax, 30, 700), {
    size: 30,
    weight: 700,
    fill: theme.title,
    spacing: -0.4
  })}</a>`;

  // Pills, left to right; anything that does not fit is dropped.
  let cursor = textX;
  for (const spec of buildPills(data, theme)) {
    const placed = pill({ ...spec, x: cursor, y: 60 });
    if (cursor + placed.width > width) break;
    svg += placed.svg;
    cursor += placed.width + 8;
  }

  return { svg, height: HEADER_HEIGHT };
}

/** Description (max two lines) and the homepage link, if any. */
function generateDescriptionSVG(data, theme, { width }) {
  const lines = wrapText(data.description, width, 15, 2);
  let svg = '';
  let y = 14;

  if (lines.length === 0) {
    svg += text(0, y, 'No description provided.', { size: 15, fill: theme.textMuted });
    y += 22;
  }
  for (const line of lines) {
    svg += text(0, y, line, { size: 15, fill: theme.text });
    y += 22;
  }

  if (data.homepage) {
    const label = truncate(data.homepage.replace(/^https?:\/\//, '').replace(/\/$/, ''), width - 24, 13, 500);
    svg += icon(ICONS.link, 0, y - 12, 13, theme.iconColor);
    svg += `<a href="${escapeXml(data.homepage)}">${text(20, y - 1, label, { size: 13, weight: 500, fill: theme.title })}</a>`;
    y += 22;
  }

  return { svg, height: y - 8 };
}

/** Topic chips, wrapped onto at most two rows. */
function generateTopicsSVG(data, theme, { width }) {
  if (data.topics.length === 0) return null;

  const chipHeight = 26;
  const rowGap = 8;
  const maxRows = 2;
  let x = 0;
  let row = 0;
  let svg = '';

  for (const topic of data.topics) {
    const label = truncate(topic, 200, 12, 500);
    const chipWidth = Math.ceil(textWidth(label, 12, 500) + 24);
    if (x + chipWidth > width) {
      row++;
      x = 0;
      if (row >= maxRows) break;
    }
    const y = row * (chipHeight + rowGap);
    svg +=
      `<g transform="translate(${n(x)} ${y})">` +
      `<rect width="${chipWidth}" height="${chipHeight}" rx="${chipHeight / 2}" fill="${theme.tint}"/>` +
      text(chipWidth / 2, 17.5, label, { size: 12, weight: 500, fill: theme.title, anchor: 'middle' }) +
      '</g>';
    x += chipWidth + 8;
  }

  const rows = Math.min(row + 1, maxRows);
  return { svg, height: rows * chipHeight + (rows - 1) * rowGap };
}

module.exports = { generateHeaderSVG, generateDescriptionSVG, generateTopicsSVG, HEADER_HEIGHT };
