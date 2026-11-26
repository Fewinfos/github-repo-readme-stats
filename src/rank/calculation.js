'use strict';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Category weights (sum = 100). Mirrors the table in the README. */
const WEIGHTS = {
  // Popularity (30)
  stars: 15,
  forks: 8,
  watchers: 7,
  // Activity (30)
  commitActivity: 12,
  releaseCadence: 8,
  recentUpdates: 10,
  // Community health (40)
  prMergeRate: 10,
  issueCloseRate: 10,
  contributorDiversity: 8,
  discussionActivity: 7,
  codeQuality: 5
};

const TIERS = [
  { tier: 'S', min: 90, label: 'Exceptional' },
  { tier: 'A', min: 75, label: 'Excellent' },
  { tier: 'B', min: 60, label: 'Good' },
  { tier: 'C', min: 45, label: 'Fair' },
  { tier: 'D', min: 0, label: 'Needs attention' }
];

const clamp100 = (value) => Math.max(0, Math.min(100, value));

/**
 * Calculate the repository rank: a 0-100 score, a tier (S-D) and a per-category breakdown.
 *
 * @param {Object} m
 * @param {number} m.stars
 * @param {number} m.forks
 * @param {number} m.watchers
 * @param {'high'|'medium'|'low'|'none'} m.commitActivity
 * @param {number|null} m.releaseAvgDays - average days between releases, null if unknown
 * @param {string} m.pushedAt
 * @param {number|null} m.prMergeRate - 0-100
 * @param {number|null} m.issueCloseRate - 0-100
 * @param {number} m.activeContributors - people who committed recently
 * @param {number} m.discussionActivity - average comments per issue/PR
 * @param {number} m.commitQualityScore - 0-100
 * @param {Date} [m.now]
 * @returns {{score:number, tier:string, label:string, breakdown:Object}}
 */
function calculateRepoRank(m) {
  const now = m.now || new Date();

  const points = {};
  const award = (key, score0to100) => {
    points[key] = (clamp100(score0to100) * WEIGHTS[key]) / 100;
  };

  // Popularity: logarithmic so a 100-star repo is not dwarfed by a 100k-star one.
  award('stars', Math.log10(Math.max(1, m.stars)) * 20);
  award('forks', Math.log10(Math.max(1, m.forks)) * 25);
  award('watchers', Math.log10(Math.max(1, m.watchers)) * 25);

  // Activity.
  award('commitActivity', { high: 100, medium: 65, low: 30, none: 0 }[m.commitActivity] || 0);

  let releaseScore = 0;
  if (m.releaseAvgDays !== null && m.releaseAvgDays !== undefined) {
    if (m.releaseAvgDays < 30) releaseScore = 100;
    else if (m.releaseAvgDays < 90) releaseScore = 85;
    else if (m.releaseAvgDays < 120) releaseScore = 70;
    else releaseScore = 50;
  }
  award('releaseCadence', releaseScore);

  const daysSincePush = Math.floor((now - new Date(m.pushedAt)) / DAY_MS);
  let updateScore = 100;
  if (daysSincePush > 365) updateScore = 20;
  else if (daysSincePush > 180) updateScore = 40;
  else if (daysSincePush > 90) updateScore = 60;
  else if (daysSincePush > 30) updateScore = 80;
  award('recentUpdates', updateScore);

  // Community health.
  award('prMergeRate', m.prMergeRate || 0);
  award('issueCloseRate', m.issueCloseRate || 0);
  // A project kept alive by one person scores low here; five or more recent committers is full marks.
  award('contributorDiversity', [0, 15, 40, 60, 80, 100][Math.min(5, m.activeContributors || 0)]);
  award('discussionActivity', (m.discussionActivity || 0) * 20); // 5+ comments per item = full marks
  award('codeQuality', m.commitQualityScore || 0);

  const sum = (...keys) => keys.reduce((total, key) => total + points[key], 0);
  const maxOf = (...keys) => keys.reduce((total, key) => total + WEIGHTS[key], 0);
  const category = (...keys) => ({
    score: Math.round(sum(...keys) * 10) / 10,
    max: maxOf(...keys)
  });

  const breakdown = {
    popularity: category('stars', 'forks', 'watchers'),
    activity: category('commitActivity', 'releaseCadence', 'recentUpdates'),
    community: category('prMergeRate', 'issueCloseRate', 'contributorDiversity', 'discussionActivity', 'codeQuality')
  };

  const score = Math.round(sum(...Object.keys(WEIGHTS)) * 10) / 10;
  const { tier, label } = TIERS.find((t) => score >= t.min);

  return { score, tier, label, breakdown };
}

module.exports = { calculateRepoRank, WEIGHTS, TIERS };
