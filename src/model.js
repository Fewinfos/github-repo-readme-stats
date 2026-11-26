'use strict';

const { calculateAnalytics } = require('./analytics');
const { calculateRepoRank } = require('./rank');
const { calculateStreakStats } = require('./streak');
const { buildActivityCalendar } = require('./calendar');
const { formatRelative, DAY_MS } = require('./utils/format');
const { normalizeColor } = require('./utils/color');

const MAX_LANGUAGES = 6;
const FALLBACK_LANGUAGE_COLOR = '#8b949e';

function buildLanguages(languages) {
  const edges = (languages && languages.edges) || [];
  const total = (languages && languages.totalSize) || edges.reduce((sum, e) => sum + e.size, 0);
  if (!total) return [];

  const all = edges.map((e) => ({
    name: e.node.name,
    color: normalizeColor(e.node.color) || FALLBACK_LANGUAGE_COLOR,
    bytes: e.size,
    percent: (e.size / total) * 100
  }));

  const top = all.slice(0, MAX_LANGUAGES);
  const shown = top.reduce((sum, l) => sum + l.percent, 0);
  if (100 - shown >= 0.5) {
    top.push({ name: 'Other', color: null, bytes: 0, percent: 100 - shown });
  }
  return top;
}

function healthOf(repo, daysSincePush) {
  if (repo.isArchived) return 'archived';
  if (daysSincePush <= 30) return 'active';
  if (daysSincePush <= 180) return 'quiet';
  return 'dormant';
}

/**
 * Turn the raw GitHub payload into everything the renderers need. Pure and deterministic for a
 * given `now`, which is what makes the card testable without network access.
 *
 * @param {Object} raw - result of `fetchRepository` (or a fixture with the same shape)
 * @param {Date} [now]
 */
function buildModel(raw, now = new Date()) {
  const repo = raw.repo;
  const history = (repo.defaultBranchRef && repo.defaultBranchRef.target && repo.defaultBranchRef.target.history) || {
    nodes: [],
    totalCount: 0
  };

  const commits = history.nodes.map((c) => ({
    message: c.message,
    committedDate: c.committedDate,
    author: (c.author && ((c.author.user && c.author.user.login) || c.author.name)) || null
  }));
  const pullRequests = repo.recentPullRequests.nodes.map((pr) => ({
    state: String(pr.state).toLowerCase(),
    createdAt: pr.createdAt,
    mergedAt: pr.mergedAt,
    comments: pr.comments.totalCount
  }));
  const issues = repo.recentIssues.nodes.map((issue) => ({
    state: String(issue.state).toLowerCase(),
    createdAt: issue.createdAt,
    comments: issue.comments.totalCount
  }));
  const releases = repo.releases.nodes.map((r) => ({
    tag: r.tagName,
    name: r.name,
    publishedAt: r.publishedAt,
    prerelease: r.isPrerelease
  }));

  const calendar = buildActivityCalendar({
    weeklyStats: raw.weeklyStats,
    commits,
    pullRequests,
    issues,
    now
  });
  const streak = calculateStreakStats(calendar.days);
  const commits30 = calendar.days.slice(-30).reduce((sum, d) => sum + d.commits, 0);

  const openIssues = repo.openIssues.totalCount;
  const closedIssues = repo.closedIssues.totalCount;
  const openPRs = repo.openPullRequests.totalCount;
  const mergedPRs = repo.mergedPullRequests.totalCount;
  const closedPRs = repo.closedPullRequests.totalCount;
  const contributorsTotal =
    raw.contributorsTotal !== null && raw.contributorsTotal !== undefined
      ? raw.contributorsTotal
      : raw.contributors.length || null;

  const analytics = calculateAnalytics({
    commits,
    pullRequests,
    issues,
    counts: { mergedPRs, closedPRs, totalIssues: openIssues + closedIssues, closedIssues },
    contributors: raw.contributors,
    contributorsTotal,
    releases,
    createdAt: repo.createdAt,
    stars: repo.stargazerCount,
    staleIssues: raw.staleIssues,
    commits30,
    now
  });

  const rank = calculateRepoRank({
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    watchers: repo.watchers.totalCount,
    commitActivity: analytics.commitActivity,
    releaseAvgDays: analytics.releaseAvgDays,
    pushedAt: repo.pushedAt,
    prMergeRate: analytics.prMergeRate,
    issueCloseRate: analytics.issueCloseRate,
    activeContributors: analytics.activeContributors,
    discussionActivity: analytics.discussionActivity,
    commitQualityScore: analytics.commitQualityScore,
    now
  });

  const daysSincePush = Math.floor((now - new Date(repo.pushedAt || repo.updatedAt)) / DAY_MS);
  const spdx = repo.licenseInfo && repo.licenseInfo.spdxId;
  const latest = releases[0] || null;

  return {
    owner: (repo.owner && repo.owner.login) || '',
    name: repo.name,
    url: repo.url,
    avatar: raw.avatar || null,
    description: repo.description || '',
    homepage: repo.homepageUrl || null,
    topics: ((repo.repositoryTopics && repo.repositoryTopics.nodes) || []).map((n) => n.topic.name),
    isPrivate: !!repo.isPrivate,
    isFork: !!repo.isFork,
    forkOf: repo.parent ? repo.parent.nameWithOwner : null,
    archived: !!repo.isArchived,
    defaultBranch: (repo.defaultBranchRef && repo.defaultBranchRef.name) || null,
    license: repo.licenseInfo ? (spdx && spdx !== 'NOASSERTION' ? spdx : repo.licenseInfo.name || 'Custom') : null,
    latestRelease: latest ? { tag: latest.tag, name: latest.name, publishedAt: latest.publishedAt } : null,
    health: healthOf(repo, daysSincePush),
    pushedAt: repo.pushedAt,
    pushedAtText: formatRelative(repo.pushedAt || repo.updatedAt, now),
    createdAt: repo.createdAt,
    stats: {
      stars: repo.stargazerCount,
      forks: repo.forkCount,
      watchers: repo.watchers.totalCount,
      openIssues,
      openPullRequests: openPRs,
      commits: history.totalCount,
      contributors: contributorsTotal
    },
    languages: buildLanguages(repo.languages),
    analytics,
    rank,
    calendar,
    streak,
    generatedAt: now.toISOString()
  };
}

module.exports = { buildModel };
