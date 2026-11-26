'use strict';

/**
 * Streaks over a run of daily activity.
 *
 * A streak is a run of consecutive days with at least one contribution. The current streak is
 * allowed to end yesterday: if nothing has happened *yet* today, the streak is still alive.
 *
 * @param {Array<{date:string, count:number}>} days - oldest first, one entry per day
 * @returns {{
 *   currentStreak: number, currentRange: {start:string,end:string}|null,
 *   longestStreak: number, longestRange: {start:string,end:string}|null,
 *   totalContributions: number, activeDays: number, totalDays: number
 * }}
 */
function calculateStreakStats(days) {
  const totalContributions = days.reduce((sum, d) => sum + d.count, 0);
  const activeDays = days.filter((d) => d.count > 0).length;

  // Current streak: walk back from today (or yesterday if today is still empty).
  let end = days.length - 1;
  if (end >= 0 && days[end].count === 0) end--;
  let currentStreak = 0;
  let currentStart = null;
  for (let i = end; i >= 0 && days[i].count > 0; i--) {
    currentStreak++;
    currentStart = days[i].date;
  }

  // Longest streak anywhere in the window. Ties go to the most recent run.
  let longestStreak = 0;
  let longestRange = null;
  let run = 0;
  let runStart = null;
  for (let i = 0; i < days.length; i++) {
    if (days[i].count > 0) {
      if (run === 0) runStart = days[i].date;
      run++;
      if (run >= longestStreak) {
        longestStreak = run;
        longestRange = { start: runStart, end: days[i].date };
      }
    } else {
      run = 0;
    }
  }

  return {
    currentStreak,
    currentRange: currentStreak > 0 ? { start: currentStart, end: days[end].date } : null,
    longestStreak,
    longestRange,
    totalContributions,
    activeDays,
    totalDays: days.length
  };
}

module.exports = { calculateStreakStats };
