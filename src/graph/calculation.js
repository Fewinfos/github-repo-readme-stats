/**
 * Calculate 30-day activity data for the graph
 * @param {Object} params - Parameters including recentCommits, recentPRs, recentIssues
 * @returns {Array} - Array of {date: string, count: number} objects
 */
function calculateActivityData(params) {
  const { recentCommits, recentPRs, recentIssues } = params;
  
  const activityData = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Count activities for this day
    let count = 0;
    
    // Count commits
    if (recentCommits) {
      count += recentCommits.filter(c => {
        if (!c.commit?.committedDate) return false;
        const commitDate = new Date(c.commit.committedDate).toISOString().split('T')[0];
        return commitDate === dateStr;
      }).length;
    }
    
    // Count PRs
    if (recentPRs) {
      count += recentPRs.filter(pr => {
        if (!pr.created_at) return false;
        const prDate = new Date(pr.created_at).toISOString().split('T')[0];
        return prDate === dateStr;
      }).length;
    }
    
    // Count issues
    if (recentIssues) {
      count += recentIssues.filter(issue => {
        if (!issue.created_at) return false;
        const issueDate = new Date(issue.created_at).toISOString().split('T')[0];
        return issueDate === dateStr;
      }).length;
    }
    
    activityData.push({ 
      date: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i}d ago`, 
      count 
    });
  }
  
  return activityData;
}

module.exports = { calculateActivityData };
