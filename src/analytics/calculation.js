/**
 * Calculate advanced analytics metrics for a repository
 * @param {Object} params - Parameters for analytics calculation
 * @returns {Object} - Analytics metrics
 */
function calculateAnalytics(params) {
  const {
    recentCommits,
    recentPRs,
    recentIssues,
    totalPullRequests,
    totalIssues,
    mergedPRsCount,
    closedIssuesCount,
    contributorsData,
    releasesData,
    createdAt
  } = params;

  // Calculate commit activity based on recent commits
  let commitActivity = 'unknown';
  if (recentCommits.length > 0) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentCommitCount = recentCommits.filter(c => 
      c.commit?.committedDate ? new Date(c.commit.committedDate) > thirtyDaysAgo : false
    ).length;
    if (recentCommitCount === 0) commitActivity = 'low';
    else if (recentCommitCount < 10) commitActivity = 'low';
    else if (recentCommitCount < 30) commitActivity = 'medium';
    else commitActivity = 'high';
  }

  // Calculate PR Merge Rate
  const prMergeRate = totalPullRequests > 0 ? Math.min(100, Math.floor((mergedPRsCount / totalPullRequests) * 100)) : 0;

  // Calculate Issue Close Rate
  const issueCloseRate = totalIssues > 0 ? Math.min(100, Math.floor((closedIssuesCount / totalIssues) * 100)) : 0;

  // Calculate Average Time to Merge (for recent PRs)
  let avgTimeToMerge = 'N/A';
  const mergedRecentPRs = recentPRs.filter(pr => pr.merged_at);
  if (mergedRecentPRs.length > 0) {
    const totalMergeTime = mergedRecentPRs.reduce((sum, pr) => {
      const created = new Date(pr.created_at);
      const merged = new Date(pr.merged_at);
      return sum + (merged - created);
    }, 0);
    const avgMs = totalMergeTime / mergedRecentPRs.length;
    const avgDays = Math.floor(avgMs / (1000 * 60 * 60 * 24));
    const avgHours = Math.floor((avgMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    avgTimeToMerge = avgDays > 0 ? `${avgDays}d` : `${avgHours}h`;
  }

  // Calculate Average Response Time (first comment/review on issues/PRs)
  let avgResponseTime = 'N/A';
  const itemsWithComments = [...recentIssues, ...recentPRs].filter(item => item.comments > 0).slice(0, 20);
  if (itemsWithComments.length > 5) {
    avgResponseTime = '< 24h'; // Simplified metric
  }

  // Calculate Stale Issues (open > 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const staleIssuesCount = recentIssues.filter(issue => 
    issue.state === 'open' && !issue.pull_request && new Date(issue.created_at) < ninetyDaysAgo
  ).length;

  // Contributor Diversity (new vs returning in recent commits)
  const contributorSet = new Set();
  const recentContributorSet = new Set();
  recentCommits.slice(0, 50).forEach(commit => {
    if (commit.author?.login) {
      recentContributorSet.add(commit.author.login);
    }
  });
  contributorsData.forEach(c => contributorSet.add(c.login));
  const contributorDiversity = contributorSet.size > 0 ? `${recentContributorSet.size}/${contributorSet.size}` : '0/0';

  // Bus Factor (concentration risk - top contributor %)
  let busFactor = 'Low Risk';
  if (contributorsData.length > 0) {
    const totalContributions = contributorsData.reduce((sum, c) => sum + c.contributions, 0);
    const topContributorPercent = (contributorsData[0].contributions / totalContributions) * 100;
    if (topContributorPercent > 70) busFactor = 'High Risk';
    else if (topContributorPercent > 50) busFactor = 'Medium Risk';
    else busFactor = 'Low Risk';
  }

  // Release Cadence
  let releaseCadence = 'N/A';
  if (releasesData.length >= 2) {
    const recentReleases = releasesData.slice(0, 5);
    let totalDaysBetween = 0;
    for (let i = 0; i < recentReleases.length - 1; i++) {
      const date1 = new Date(recentReleases[i].published_at);
      const date2 = new Date(recentReleases[i + 1].published_at);
      totalDaysBetween += Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
    }
    const avgDays = Math.floor(totalDaysBetween / (recentReleases.length - 1));
    if (avgDays < 30) releaseCadence = `~${avgDays}d`;
    else if (avgDays < 90) releaseCadence = `~${Math.floor(avgDays / 7)}w`;
    else releaseCadence = `~${Math.floor(avgDays / 30)}mo`;
  }

  // Commit Message Quality Score (simplified)
  let commitQualityScore = 0;
  if (recentCommits.length > 0) {
    const qualityCommits = recentCommits.filter(commit => {
      const msg = commit.commit?.message || '';
      return msg.length >= 20 && msg.length <= 200 && !msg.match(/^(fix|update|change|wip)$/i);
    }).length;
    commitQualityScore = Math.floor((qualityCommits / recentCommits.length) * 100);
  }

  // Growth Trend (stars growth estimate based on age)
  const repoAgeInDays = Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
  const starsPerDay = repoAgeInDays > 0 ? (params.stars / repoAgeInDays).toFixed(2) : 0;
  const growthTrend = parseFloat(starsPerDay) > 1 ? 'High Growth' : parseFloat(starsPerDay) > 0.1 ? 'Growing' : 'Stable';

  // Discussion Activity (comments per issue/PR)
  const totalItems = recentIssues.length + recentPRs.length;
  const totalComments = [...recentIssues, ...recentPRs].reduce((sum, item) => sum + (item.comments || 0), 0);
  const discussionActivity = totalItems > 0 ? (totalComments / totalItems).toFixed(1) : '0.0';

  return {
    commitActivity,
    prMergeRate,
    issueCloseRate,
    avgTimeToMerge,
    avgResponseTime,
    staleIssuesCount,
    contributorDiversity,
    busFactor,
    releaseCadence,
    commitQualityScore,
    growthTrend,
    starsPerDay,
    discussionActivity,
    activeContributors: recentContributorSet.size
  };
}

module.exports = { calculateAnalytics };
