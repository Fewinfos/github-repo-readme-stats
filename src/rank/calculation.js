/**
 * Calculate repository rank score and tier
 * @param {Object} metrics - Repository metrics
 * @returns {Object} - { score: number, tier: string }
 */
function calculateRepoRank(metrics) {
  // Define weights for different categories (total = 100%)
  const WEIGHTS = {
    // Popularity Metrics (30%)
    stars: 15,
    forks: 8,
    watchers: 7,
    
    // Activity Metrics (30%)
    commitActivity: 12,
    releaseCadence: 8,
    recentUpdates: 10,
    
    // Community Health (40%)
    prMergeRate: 10,
    issueCloseRate: 10,
    contributorDiversity: 8,
    discussionActivity: 7,
    codeQuality: 5
  };

  let totalScore = 0;

  // 1. Stars Score (0-100 scale, logarithmic)
  const starsScore = Math.min(100, Math.log10(Math.max(1, metrics.stars)) * 20);
  totalScore += (starsScore * WEIGHTS.stars) / 100;

  // 2. Forks Score (0-100 scale, logarithmic)
  const forksScore = Math.min(100, Math.log10(Math.max(1, metrics.forks)) * 25);
  totalScore += (forksScore * WEIGHTS.forks) / 100;

  // 3. Watchers Score (0-100 scale, logarithmic)
  const watchersScore = Math.min(100, Math.log10(Math.max(1, metrics.watchers)) * 25);
  totalScore += (watchersScore * WEIGHTS.watchers) / 100;

  // 4. Commit Activity Score
  const activityScores = { high: 100, medium: 65, low: 30, unknown: 0 };
  const activityScore = activityScores[metrics.commitActivity] || 0;
  totalScore += (activityScore * WEIGHTS.commitActivity) / 100;

  // 5. Release Cadence Score
  let releaseScore = 0;
  if (metrics.releaseCadence !== 'N/A') {
    const cadence = metrics.releaseCadence.toLowerCase();
    if (cadence.includes('d')) releaseScore = 100; // Daily/weekly releases
    else if (cadence.includes('w')) releaseScore = 85; // Weekly releases
    else if (cadence.includes('mo') && parseInt(cadence) <= 3) releaseScore = 70; // 1-3 month cadence
    else releaseScore = 50; // Longer cadence
  }
  totalScore += (releaseScore * WEIGHTS.releaseCadence) / 100;

  // 6. Recent Updates Score (based on days since last update)
  const daysSinceUpdate = Math.floor((Date.now() - new Date(metrics.pushedAt)) / (1000 * 60 * 60 * 24));
  let updateScore = 100;
  if (daysSinceUpdate > 365) updateScore = 20;
  else if (daysSinceUpdate > 180) updateScore = 40;
  else if (daysSinceUpdate > 90) updateScore = 60;
  else if (daysSinceUpdate > 30) updateScore = 80;
  totalScore += (updateScore * WEIGHTS.recentUpdates) / 100;

  // 7. PR Merge Rate Score (already 0-100)
  totalScore += (metrics.prMergeRate * WEIGHTS.prMergeRate) / 100;

  // 8. Issue Close Rate Score (already 0-100)
  totalScore += (metrics.issueCloseRate * WEIGHTS.issueCloseRate) / 100;

  // 9. Contributor Diversity Score
  let diversityScore = 0;
  if (metrics.contributorDiversity !== '0/0') {
    const [active, total] = metrics.contributorDiversity.split('/').map(Number);
    if (total > 0) {
      const ratio = active / total;
      diversityScore = Math.min(100, ratio * 200); // Higher ratio = better diversity
      if (total >= 10) diversityScore = Math.min(100, diversityScore * 1.2); // Bonus for larger teams
    }
  }
  totalScore += (diversityScore * WEIGHTS.contributorDiversity) / 100;

  // 10. Discussion Activity Score
  const discussionValue = parseFloat(metrics.discussionActivity) || 0;
  let discussionScore = Math.min(100, discussionValue * 20); // Scale: 5+ comments = 100
  totalScore += (discussionScore * WEIGHTS.discussionActivity) / 100;

  // 11. Code Quality Score (commit message quality)
  const qualityScore = metrics.commitQualityScore || 0;
  totalScore += (qualityScore * WEIGHTS.codeQuality) / 100;

  // Round to 1 decimal place
  totalScore = Math.round(totalScore * 10) / 10;

  // Determine tier based on score
  let tier;
  if (totalScore >= 90) {
    tier = 'S';
  } else if (totalScore >= 75) {
    tier = 'A';
  } else if (totalScore >= 60) {
    tier = 'B';
  } else if (totalScore >= 45) {
    tier = 'C';
  } else {
    tier = 'D';
  }

  return {
    score: totalScore,
    tier: tier
  };
}

module.exports = { calculateRepoRank };
