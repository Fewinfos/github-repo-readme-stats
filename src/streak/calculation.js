/**
 * Calculate streak statistics from activity data
 * @param {Array} activityData - Array of {date: string, count: number} objects
 * @returns {Object} - { currentStreak: number, longestStreak: number, totalContributions: number }
 */
function calculateStreakStats(activityData) {
  // Calculate total contributions
  const totalContributions = activityData.reduce((sum, d) => sum + d.count, 0);
  
  // Calculate current streak (from most recent day backwards)
  let currentStreak = 0;
  for (let i = activityData.length - 1; i >= 0; i--) {
    if (activityData[i].count > 0) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (let i = 0; i < activityData.length; i++) {
    if (activityData[i].count > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  return {
    currentStreak,
    longestStreak,
    totalContributions
  };
}

module.exports = { calculateStreakStats };
