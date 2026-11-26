'use strict';

const { DAY_MS, dayKey } = require('../utils/format');

/** Number of days covered by the calendar (one year, like GitHub's contribution graph). */
const CALENDAR_DAYS = 365;
/** Size of the commit sample fetched through GraphQL. */
const COMMIT_SAMPLE_LIMIT = 100;

function startOfUtcDay(now) {
  const d = new Date(now);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Build a year of daily activity for the repository, oldest day first. All dates are UTC.
 *
 * Commits come from GitHub's weekly commit statistics (exact, 52 weeks). The latest-100-commit
 * sample is merged in because the statistics are cached and can lag by a day. When the statistics
 * are unavailable, the sample alone is used and `source` is `'sample'` so the card can say so.
 * Pull requests and issues are counted on the day they were opened.
 *
 * @param {Object} params
 * @param {Array<{week:number, days:number[]}>|null} params.weeklyStats
 * @param {Array<{committedDate:string}>} params.commits - newest first
 * @param {Array<{createdAt:string}>} params.pullRequests
 * @param {Array<{createdAt:string}>} params.issues
 * @param {Date|number} [params.now]
 */
function buildActivityCalendar({
  weeklyStats,
  commits = [],
  pullRequests = [],
  issues = [],
  now = new Date()
}) {
  const today = startOfUtcDay(now);
  const keys = [];
  for (let i = CALENDAR_DAYS - 1; i >= 0; i--) keys.push(dayKey(today - i * DAY_MS));
  const indexOf = new Map(keys.map((key, i) => [key, i]));

  const countByDay = (items, getDate) => {
    const counts = new Array(CALENDAR_DAYS).fill(0);
    for (const item of items) {
      const stamp = getDate(item);
      if (!stamp) continue;
      const idx = indexOf.get(dayKey(stamp));
      if (idx !== undefined) counts[idx]++;
    }
    return counts;
  };

  // Commits from the weekly statistics.
  const hasStats = Array.isArray(weeklyStats) && weeklyStats.length > 0;
  const statsCommits = new Array(CALENDAR_DAYS).fill(0);
  if (hasStats) {
    for (const week of weeklyStats) {
      for (let d = 0; d < 7; d++) {
        const idx = indexOf.get(dayKey(week.week * 1000 + d * DAY_MS));
        if (idx !== undefined) statsCommits[idx] = (week.days && week.days[d]) || 0;
      }
    }
  }

  // Commits from the latest-100 sample. If the sample is full, the oldest day is only partially
  // covered, so trust the sample strictly after that day.
  const sampleCommits = countByDay(commits, (c) => c.committedDate);
  let sampleCoveredFrom = 0;
  let sampleSince = null;
  if (commits.length >= COMMIT_SAMPLE_LIMIT) {
    const oldest = commits.reduce((min, c) => (c.committedDate < min ? c.committedDate : min), commits[0].committedDate);
    sampleSince = dayKey(oldest);
    const oldestIdx = indexOf.get(sampleSince);
    sampleCoveredFrom = oldestIdx === undefined ? 0 : oldestIdx + 1;
  }

  const commitsPerDay = keys.map((_, i) => {
    const sample = i >= sampleCoveredFrom ? sampleCommits[i] : 0;
    return hasStats ? Math.max(statsCommits[i], sample) : sample;
  });

  const prsPerDay = countByDay(pullRequests, (p) => p.createdAt);
  const issuesPerDay = countByDay(issues, (i) => i.createdAt);

  const days = keys.map((date, i) => ({
    date,
    count: commitsPerDay[i] + prsPerDay[i] + issuesPerDay[i],
    commits: commitsPerDay[i],
    prs: prsPerDay[i],
    issues: issuesPerDay[i]
  }));

  return {
    days,
    total: days.reduce((sum, d) => sum + d.count, 0),
    totalCommits: commitsPerDay.reduce((sum, c) => sum + c, 0),
    activeDays: days.filter((d) => d.count > 0).length,
    max: days.reduce((max, d) => Math.max(max, d.count), 0),
    source: hasStats ? 'stats' : 'sample',
    sampleSince: hasStats ? null : sampleSince
  };
}

module.exports = { buildActivityCalendar, CALENDAR_DAYS };
