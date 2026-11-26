'use strict';

const { DAY_MS, formatAge } = require('../utils/format');

const GENERIC_COMMIT = /^(wip|fix|fixes|fixed|update|updates|updated|change|changes|test|tests|commit|minor|misc|stuff|asdf|\.+)$/i;

function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const percent = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : null);

/** Contributors needed to account for half of all commits, and the resulting risk level. */
function calculateBusFactor(contributors) {
  const total = contributors.reduce((sum, c) => sum + c.contributions, 0);
  if (contributors.length === 0 || total === 0) return { busFactor: null, busFactorRisk: null };

  const sorted = [...contributors].sort((a, b) => b.contributions - a.contributions);
  let running = 0;
  let needed = 0;
  for (const c of sorted) {
    running += c.contributions;
    needed++;
    if (running / total >= 0.5) break;
  }

  const topShare = sorted[0].contributions / total;
  let risk = 'low';
  if (topShare > 0.7) risk = 'high';
  else if (needed === 1 || topShare > 0.5) risk = 'medium';
  return { busFactor: needed, busFactorRisk: risk };
}

/** Average gap between the most recent releases. */
function calculateReleaseCadence(releases, now) {
  if (releases.length === 0) return { label: 'N/A', avgDays: null, daysSinceRelease: null };

  const daysSinceRelease = Math.floor((now - new Date(releases[0].publishedAt)) / DAY_MS);
  if (releases.length < 2) return { label: 'N/A', avgDays: null, daysSinceRelease };

  const recent = releases.slice(0, 5);
  let totalDays = 0;
  for (let i = 0; i < recent.length - 1; i++) {
    totalDays += Math.abs(new Date(recent[i].publishedAt) - new Date(recent[i + 1].publishedAt)) / DAY_MS;
  }
  const avgDays = Math.max(1, Math.floor(totalDays / (recent.length - 1)));

  let label;
  if (avgDays < 30) label = `~${avgDays}d`;
  else if (avgDays < 90) label = `~${Math.floor(avgDays / 7)}w`;
  else label = `~${Math.floor(avgDays / 30)}mo`;
  return { label, avgDays, daysSinceRelease };
}

/** Share of commits whose headline looks intentional rather than "wip" / "fix". */
function calculateCommitQuality(commits) {
  if (commits.length === 0) return 0;
  const good = commits.filter((c) => {
    const headline = String(c.message || '').split('\n')[0].trim();
    return headline.length >= 12 && headline.length <= 100 && !GENERIC_COMMIT.test(headline);
  }).length;
  return Math.round((good / commits.length) * 100);
}

/**
 * Derive repository health metrics. Pure: every input is passed in, nothing is fetched.
 *
 * @param {Object} p
 * @param {Array<{message:string,committedDate:string,author:string|null}>} p.commits
 * @param {Array<{state:string,createdAt:string,mergedAt:string|null,comments:number}>} p.pullRequests
 * @param {Array<{state:string,createdAt:string,comments:number}>} p.issues
 * @param {{mergedPRs:number, closedPRs:number, totalIssues:number, closedIssues:number}} p.counts
 * @param {Array<{login:string,contributions:number}>} p.contributors
 * @param {number|null} p.contributorsTotal
 * @param {Array<{publishedAt:string}>} p.releases
 * @param {string} p.createdAt
 * @param {number} p.stars
 * @param {number|null} p.staleIssues - exact count when available
 * @param {number} p.commits30 - commits during the last 30 days
 * @param {Date} [p.now]
 */
function calculateAnalytics(p) {
  const now = p.now || new Date();

  // Commit activity over the last 30 days.
  let commitActivity = 'none';
  if (p.commits30 >= 30) commitActivity = 'high';
  else if (p.commits30 >= 10) commitActivity = 'medium';
  else if (p.commits30 > 0) commitActivity = 'low';

  // PR merge rate among PRs that were resolved (open ones are still pending).
  const prMergeRate = percent(p.counts.mergedPRs, p.counts.mergedPRs + p.counts.closedPRs);
  const issueCloseRate = percent(p.counts.closedIssues, p.counts.totalIssues);

  // Median time to merge across recently opened PRs that were merged.
  const mergeTimes = p.pullRequests
    .filter((pr) => pr.mergedAt)
    .map((pr) => new Date(pr.mergedAt) - new Date(pr.createdAt))
    .filter((ms) => ms >= 0);
  const medianMergeMs = median(mergeTimes);

  // Contributors who committed during the last 90 days.
  const ninetyDaysAgo = now - 90 * DAY_MS;
  const active = new Set();
  for (const c of p.commits) {
    if (c.author && new Date(c.committedDate) >= ninetyDaysAgo) active.add(c.author);
  }

  // Stale issues: exact search count when we have it, otherwise estimate from the recent sample.
  const staleIssues =
    p.staleIssues !== null && p.staleIssues !== undefined
      ? p.staleIssues
      : p.issues.filter((i) => i.state === 'open' && new Date(i.createdAt) < ninetyDaysAgo).length;

  // Growth trend from stars per day of life.
  const ageDays = Math.max(1, Math.floor((now - new Date(p.createdAt)) / DAY_MS));
  const starsPerDay = Math.round((p.stars / ageDays) * 100) / 100;
  const growthTrend = starsPerDay > 1 ? 'High Growth' : starsPerDay > 0.1 ? 'Growing' : 'Stable';

  // Average comments per recent issue/PR.
  const items = [...p.issues, ...p.pullRequests];
  const comments = items.reduce((sum, item) => sum + (item.comments || 0), 0);
  const discussionActivity = items.length > 0 ? Math.round((comments / items.length) * 10) / 10 : 0;

  const cadence = calculateReleaseCadence(p.releases, now);

  return {
    commitActivity,
    commits30: p.commits30,
    prMergeRate,
    issueCloseRate,
    medianMergeMs,
    staleIssues,
    activeContributors: active.size,
    totalContributors: p.contributorsTotal,
    ...calculateBusFactor(p.contributors),
    releaseCadence: cadence.label,
    releaseAvgDays: cadence.avgDays,
    daysSinceRelease: cadence.daysSinceRelease,
    commitQualityScore: calculateCommitQuality(p.commits),
    growthTrend,
    starsPerDay,
    discussionActivity,
    repoAge: formatAge(p.createdAt, now)
  };
}

module.exports = { calculateAnalytics, calculateBusFactor, calculateReleaseCadence, calculateCommitQuality };
