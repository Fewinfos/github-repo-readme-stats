'use strict';

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** 1234 -> "1.2K", 1500000 -> "1.5M", 999 -> "999" */
function formatNumber(num) {
  const n = Number(num);
  if (!Number.isFinite(n)) return '—';
  const strip = (v) => v.toFixed(1).replace(/\.0$/, '');
  if (n >= 999950) return strip(n / 1e6) + 'M';
  if (n >= 1000) return strip(n / 1e3) + 'K';
  return String(Math.round(n));
}

/** 1234567 -> "1,234,567" */
function formatInt(num) {
  const n = Number(num);
  return Number.isFinite(n) ? Math.round(n).toLocaleString('en-US') : '—';
}

/** Relative time: "just now", "5m ago", "3d ago", "2mo ago", "1y ago". */
function formatRelative(dateString, now = new Date()) {
  if (!dateString) return 'unknown';
  const diff = now - new Date(dateString);
  if (!Number.isFinite(diff)) return 'unknown';
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / DAY_MS);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** Compact duration for an interval in ms: "42m", "7h", "3d". */
function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return 'N/A';
  const minutes = ms / 60000;
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))}m`;
  const hours = minutes / 60;
  if (hours < 48) return `${Math.round(hours)}h`;
  const days = hours / 24;
  if (days < 60) return `${Math.round(days)}d`;
  return `${Math.round(days / 30)}mo`;
}

/** "YYYY-MM-DD" key for a Date in UTC. */
function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

/** "Nov 26" from a "YYYY-MM-DD" key (timezone independent). */
function formatDayShort(key) {
  const [, m, d] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

/** "Wed, Nov 26, 2026" from a "YYYY-MM-DD" key. */
function formatDayLong(key) {
  const [y, m, d] = key.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${MONTHS[m - 1]} ${d}, ${y}`;
}

/** "3y 2mo", "5mo", "12d" for the age of something created at `dateString`. */
function formatAge(dateString, now = new Date()) {
  const days = Math.floor((now - new Date(dateString)) / DAY_MS);
  if (!Number.isFinite(days) || days < 0) return 'N/A';
  if (days < 60) return `${days}d`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years}y ${rest}mo` : `${years}y`;
}

module.exports = {
  DAY_MS,
  MONTHS,
  formatNumber,
  formatInt,
  formatRelative,
  formatDuration,
  formatAge,
  dayKey,
  formatDayShort,
  formatDayLong
};
