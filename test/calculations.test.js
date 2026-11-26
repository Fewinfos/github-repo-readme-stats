'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateStreakStats } = require('../src/streak/calculation');
const { buildActivityCalendar } = require('../src/calendar/calculation');
const { calculateBusFactor, calculateReleaseCadence, calculateCommitQuality, calculateAnalytics } = require('../src/analytics/calculation');
const { calculateRepoRank, WEIGHTS } = require('../src/rank/calculation');
const { levelThresholds, levelOf } = require('../src/calendar/svg');
const { niceScale, smoothPath } = require('../src/graph/svg');
const { buildModel } = require('../src/model');
const { SCENARIOS, FIXED_NOW } = require('./fixtures');

const days = (...counts) =>
  counts.map((count, i) => ({ date: `2026-11-${String(i + 1).padStart(2, '0')}`, count }));

// ---------------------------------------------------------------- streaks

test('streak: counts a run that ends today', () => {
  const s = calculateStreakStats(days(0, 0, 1, 2, 1));
  assert.equal(s.currentStreak, 3);
  assert.deepEqual(s.currentRange, { start: '2026-11-03', end: '2026-11-05' });
});

test('streak: stays alive when today is still empty', () => {
  const s = calculateStreakStats(days(0, 1, 1, 1, 0));
  assert.equal(s.currentStreak, 3);
  assert.deepEqual(s.currentRange, { start: '2026-11-02', end: '2026-11-04' });
});

test('streak: is broken after a gap of two days', () => {
  const s = calculateStreakStats(days(1, 1, 1, 0, 0));
  assert.equal(s.currentStreak, 0);
  assert.equal(s.currentRange, null);
  assert.equal(s.longestStreak, 3);
});

test('streak: longest run is found anywhere and ties go to the most recent', () => {
  const s = calculateStreakStats(days(1, 1, 0, 1, 1, 0, 1));
  assert.equal(s.longestStreak, 2);
  assert.deepEqual(s.longestRange, { start: '2026-11-04', end: '2026-11-05' });
});

test('streak: handles an empty window and totals', () => {
  const s = calculateStreakStats(days(0, 0, 0));
  assert.equal(s.currentStreak, 0);
  assert.equal(s.longestStreak, 0);
  assert.equal(s.longestRange, null);
  const t = calculateStreakStats(days(2, 0, 3));
  assert.equal(t.totalContributions, 5);
  assert.equal(t.activeDays, 2);
  assert.equal(t.totalDays, 3);
});

// --------------------------------------------------------------- calendar

test('calendar: spans 365 days ending today (UTC)', () => {
  const cal = buildActivityCalendar({ weeklyStats: null, commits: [], now: new Date('2026-11-26T23:59:00Z') });
  assert.equal(cal.days.length, 365);
  assert.equal(cal.days[364].date, '2026-11-26');
  assert.equal(cal.days[0].date, '2025-11-27');
});

test('calendar: reads weekly statistics and adds PRs and issues', () => {
  // Sunday 2026-11-22 .. Saturday 2026-11-28.
  const week = Date.UTC(2026, 10, 22) / 1000;
  const cal = buildActivityCalendar({
    weeklyStats: [{ week, days: [0, 2, 3, 0, 4, 0, 0] }],
    commits: [],
    pullRequests: [{ createdAt: '2026-11-24T10:00:00Z' }],
    issues: [{ createdAt: '2026-11-24T11:00:00Z' }, { createdAt: '2026-11-25T11:00:00Z' }],
    now: new Date('2026-11-26T12:00:00Z')
  });
  const byDate = Object.fromEntries(cal.days.map((d) => [d.date, d]));
  assert.equal(byDate['2026-11-23'].commits, 2);
  assert.equal(byDate['2026-11-24'].count, 3 + 1 + 1);
  assert.equal(byDate['2026-11-26'].commits, 4);
  assert.equal(cal.source, 'stats');
  assert.equal(cal.max, 5);
});

test('calendar: the commit sample covers statistics that lag behind', () => {
  const week = Date.UTC(2026, 10, 22) / 1000;
  const cal = buildActivityCalendar({
    weeklyStats: [{ week, days: [0, 0, 0, 0, 0, 0, 0] }],
    commits: [{ committedDate: '2026-11-26T09:00:00Z' }, { committedDate: '2026-11-26T10:00:00Z' }],
    now: new Date('2026-11-26T12:00:00Z')
  });
  assert.equal(cal.days[364].commits, 2);
});

test('calendar: falls back to the sample and says so', () => {
  const commits = Array.from({ length: 100 }, (_, i) => ({
    committedDate: new Date(Date.UTC(2026, 10, 26) - Math.floor(i / 4) * 86400000 + 3600000).toISOString()
  }));
  const cal = buildActivityCalendar({ weeklyStats: null, commits, now: new Date('2026-11-26T12:00:00Z') });
  assert.equal(cal.source, 'sample');
  assert.equal(cal.sampleSince, '2026-11-02');
  // The oldest sampled day is only partially covered, so it is not trusted.
  assert.equal(cal.days.find((d) => d.date === '2026-11-02').commits, 0);
  assert.equal(cal.days.find((d) => d.date === '2026-11-03').commits, 4);
});

test('calendar: ignores activity older than a year', () => {
  const cal = buildActivityCalendar({
    weeklyStats: null,
    commits: [{ committedDate: '2020-01-01T00:00:00Z' }],
    now: new Date('2026-11-26T12:00:00Z')
  });
  assert.equal(cal.total, 0);
});

test('calendar: quartile levels', () => {
  const t = levelThresholds([{ count: 1 }, { count: 2 }, { count: 3 }, { count: 4 }, { count: 20 }, { count: 0 }]);
  assert.equal(levelOf(0, t), 0);
  assert.equal(levelOf(1, t), 1);
  assert.equal(levelOf(20, t), 4);
  assert.deepEqual(levelThresholds([]), [1, 2, 3]);
});

// -------------------------------------------------------------- analytics

test('bus factor: contributors needed for half of the commits', () => {
  assert.deepEqual(calculateBusFactor([]), { busFactor: null, busFactorRisk: null });
  assert.deepEqual(
    calculateBusFactor([{ login: 'a', contributions: 90 }, { login: 'b', contributions: 10 }]),
    { busFactor: 1, busFactorRisk: 'high' }
  );
  assert.deepEqual(
    calculateBusFactor([{ login: 'a', contributions: 55 }, { login: 'b', contributions: 45 }]),
    { busFactor: 1, busFactorRisk: 'medium' }
  );
  assert.deepEqual(
    calculateBusFactor([
      { login: 'a', contributions: 30 },
      { login: 'b', contributions: 30 },
      { login: 'c', contributions: 20 },
      { login: 'd', contributions: 20 }
    ]),
    { busFactor: 2, busFactorRisk: 'low' }
  );
});

test('release cadence: label and average', () => {
  const now = new Date('2026-11-26T00:00:00Z');
  const at = (daysAgo) => ({ publishedAt: new Date(+now - daysAgo * 86400000).toISOString() });
  assert.equal(calculateReleaseCadence([], now).label, 'N/A');
  assert.equal(calculateReleaseCadence([at(3)], now).label, 'N/A');
  assert.equal(calculateReleaseCadence([at(3)], now).daysSinceRelease, 3);
  assert.equal(calculateReleaseCadence([at(0), at(10), at(20)], now).label, '~10d');
  assert.equal(calculateReleaseCadence([at(0), at(45)], now).label, '~6w');
  assert.equal(calculateReleaseCadence([at(0), at(200)], now).label, '~6mo');
});

test('commit quality: rewards meaningful headlines only', () => {
  assert.equal(calculateCommitQuality([]), 0);
  const msgs = ['wip', 'fix', 'feat: add the calendar heat map', 'Update', 'refactor the rank module\n\nlong body here'];
  assert.equal(calculateCommitQuality(msgs.map((message) => ({ message }))), 40);
});

test('analytics: PR merge rate ignores PRs that are still open', () => {
  const base = {
    commits: [], pullRequests: [], issues: [], contributors: [], contributorsTotal: null, releases: [],
    createdAt: '2025-01-01T00:00:00Z', stars: 10, staleIssues: 0, commits30: 0, now: FIXED_NOW
  };
  const a = calculateAnalytics({ ...base, counts: { mergedPRs: 30, closedPRs: 10, totalIssues: 0, closedIssues: 0 } });
  assert.equal(a.prMergeRate, 75);
  assert.equal(a.issueCloseRate, null);
  const none = calculateAnalytics({ ...base, counts: { mergedPRs: 0, closedPRs: 0, totalIssues: 0, closedIssues: 0 } });
  assert.equal(none.prMergeRate, null);
});

test('analytics: median time to merge', () => {
  const h = (n) => n * 3600000;
  const t0 = Date.UTC(2026, 0, 1);
  const pr = (hours) => ({ createdAt: new Date(t0).toISOString(), mergedAt: new Date(t0 + h(hours)).toISOString() });
  const a = calculateAnalytics({
    commits: [], pullRequests: [pr(1), pr(2), pr(100)], issues: [], contributors: [], contributorsTotal: null,
    releases: [], createdAt: '2025-01-01T00:00:00Z', stars: 0, staleIssues: 0, commits30: 0,
    counts: { mergedPRs: 3, closedPRs: 0, totalIssues: 0, closedIssues: 0 }, now: FIXED_NOW
  });
  assert.equal(a.medianMergeMs, h(2));
});

test('analytics: commit activity levels follow the 30 day count', () => {
  const run = (commits30) =>
    calculateAnalytics({
      commits: [], pullRequests: [], issues: [], contributors: [], contributorsTotal: null, releases: [],
      createdAt: '2025-01-01T00:00:00Z', stars: 0, staleIssues: 0, commits30,
      counts: { mergedPRs: 0, closedPRs: 0, totalIssues: 0, closedIssues: 0 }, now: FIXED_NOW
    }).commitActivity;
  assert.deepEqual([0, 5, 15, 45].map(run), ['none', 'low', 'medium', 'high']);
});

// ------------------------------------------------------------------- rank

test('rank: weights add up to 100', () => {
  assert.equal(Object.values(WEIGHTS).reduce((a, b) => a + b, 0), 100);
});

test('rank: tier boundaries', () => {
  const perfect = {
    stars: 1e6, forks: 1e6, watchers: 1e6, commitActivity: 'high', releaseAvgDays: 5, pushedAt: FIXED_NOW.toISOString(),
    prMergeRate: 100, issueCloseRate: 100, activeContributors: 9, discussionActivity: 9, commitQualityScore: 100, now: FIXED_NOW
  };
  const top = calculateRepoRank(perfect);
  assert.equal(top.score, 100);
  assert.equal(top.tier, 'S');

  const bottom = calculateRepoRank({
    stars: 0, forks: 0, watchers: 0, commitActivity: 'none', releaseAvgDays: null, pushedAt: '2000-01-01T00:00:00Z',
    prMergeRate: null, issueCloseRate: null, activeContributors: 0, discussionActivity: 0, commitQualityScore: 0, now: FIXED_NOW
  });
  assert.equal(bottom.tier, 'D');
  assert.ok(bottom.score >= 0 && bottom.score < 45);
});

test('rank: breakdown categories add up to the score', () => {
  const model = buildModel(SCENARIOS.busy(), FIXED_NOW);
  const { score, breakdown } = model.rank;
  const sum = breakdown.popularity.score + breakdown.activity.score + breakdown.community.score;
  assert.ok(Math.abs(sum - score) < 0.31, `${sum} vs ${score}`);
  assert.deepEqual([breakdown.popularity.max, breakdown.activity.max, breakdown.community.max], [30, 30, 40]);
});

test('rank: a one-person project does not get full contributor diversity credit', () => {
  const solo = buildModel(SCENARIOS['solo-dev'](), FIXED_NOW);
  const team = buildModel(SCENARIOS.busy(), FIXED_NOW);
  assert.ok(team.analytics.activeContributors > solo.analytics.activeContributors);
  assert.ok(team.rank.score > solo.rank.score);
});

// ------------------------------------------------------------ chart maths

test('chart: nice axis scales', () => {
  assert.deepEqual(niceScale(0), { top: 2, ticks: [0, 1, 2] });
  assert.deepEqual(niceScale(3), { top: 3, ticks: [0, 1, 2, 3] });
  const s = niceScale(37);
  assert.ok(s.top >= 37);
  assert.equal(s.ticks[0], 0);
  assert.equal(s.ticks[s.ticks.length - 1], s.top);
  assert.ok(s.ticks.every((t) => Number.isInteger(t) || s.top < 10));
});

test('chart: smooth path never overshoots below the baseline', () => {
  const points = [0, 10, 0, 0, 8, 0].map((v, i) => ({ x: i * 20, y: 100 - v * 10 }));
  const d = smoothPath(points);
  const ys = [...d.matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((m) => Number(m[2]));
  assert.ok(Math.max(...ys) <= 100.0001);
  assert.ok(Math.min(...ys) >= 0 - 0.0001, 'never rises above the tallest peak');
});

// ------------------------------------------------------------------ model

test('model: shape and derived values for the busy scenario', () => {
  const m = buildModel(SCENARIOS.busy(), FIXED_NOW);
  assert.equal(m.owner, 'acme-labs');
  assert.equal(m.stats.stars, 12408);
  assert.equal(m.stats.contributors, 143);
  assert.equal(m.license, 'MIT');
  assert.equal(m.latestRelease.tag, 'v2.9.0');
  assert.equal(m.health, 'active');
  assert.equal(m.calendar.days.length, 365);
  assert.equal(m.calendar.source, 'stats');
  assert.ok(m.languages.length >= 5);
  const pct = m.languages.reduce((sum, l) => sum + l.percent, 0);
  assert.ok(pct > 99 && pct <= 100.0001, `languages sum to ${pct}`);
});

test('model: handles an empty repository', () => {
  const m = buildModel(SCENARIOS.empty(), FIXED_NOW);
  assert.equal(m.stats.commits, 0);
  assert.equal(m.stats.contributors, null);
  assert.equal(m.license, null);
  assert.equal(m.languages.length, 0);
  assert.equal(m.analytics.prMergeRate, null);
  assert.equal(m.streak.currentStreak, 0);
});

test('model: health reflects archive status and push age', () => {
  assert.equal(buildModel(SCENARIOS.archived(), FIXED_NOW).health, 'archived');
  assert.equal(buildModel(SCENARIOS.quiet(), FIXED_NOW).health, 'quiet');
});
