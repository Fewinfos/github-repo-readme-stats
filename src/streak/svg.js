/**
 * Generate SVG markup for the streak stats box
 * @param {Object} streakStats - Streak statistics { currentStreak, longestStreak, totalContributions }
 * @param {Object} theme - Theme colors
 * @param {number} width - Total SVG width
 * @param {number} yPos - Y position for the section
 * @returns {string} - SVG markup
 */
function generateStreakSVG(streakStats, theme, width, yPos) {
  return `
  <!-- Streak Stats Box (Right Side) -->
  <g transform="translate(${width - 280}, ${yPos - 20})">
    <!-- Background rectangle -->
    <rect 
      x="0" 
      y="0" 
      width="240" 
      height="180" 
      fill="${theme.badgeBg}" 
      stroke="${theme.border}" 
      stroke-width="2" 
      rx="12"/>
    
    
    <!-- Current Streak (Centered with Fire Icon) -->
    <g transform="translate(120, 35)">
      <text x="0" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10" font-weight="600" fill="${theme.textMuted}" letter-spacing="0.5">
        CURRENT STREAK
      </text>
      <!-- Fire Icon SVG -->
      <g transform="translate(-45, 18)">
        <svg width="36" height="36" viewBox="0 0 640 640" fill="none">
          <path d="M256.5 37.6C265.8 29.8 279.5 30.1 288.4 38.5C300.7 50.1 311.7 62.9 322.3 75.9C335.8 92.4 352 114.2 367.6 140.1C372.8 133.3 377.6 127.3 381.8 122.2C382.9 120.9 384 119.5 385.1 118.1C393 108.3 402.8 96 415.9 96C429.3 96 438.7 107.9 446.7 118.1C448 119.8 449.3 121.4 450.6 122.9C460.9 135.3 474.6 153.2 488.3 175.3C515.5 219.2 543.9 281.7 543.9 351.9C543.9 475.6 443.6 575.9 319.9 575.9C196.2 575.9 96 475.7 96 352C96 260.9 137.1 182 176.5 127C196.4 99.3 216.2 77.1 231.1 61.9C239.3 53.5 247.6 45.2 256.6 37.7zM321.7 480C347 480 369.4 473 390.5 459C432.6 429.6 443.9 370.8 418.6 324.6C414.1 315.6 402.6 315 396.1 322.6L370.9 351.9C364.3 359.5 352.4 359.3 346.2 351.4C328.9 329.3 297.1 289 280.9 268.4C275.5 261.5 265.7 260.4 259.4 266.5C241.1 284.3 207.9 323.3 207.9 370.8C207.9 439.4 258.5 480 321.6 480z" fill="${theme.title}"/>
        </svg>
      </g>
      <text x="0" y="46" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="36" font-weight="700" fill="${theme.title}">
        ${streakStats?.currentStreak || 0}
      </text>
    </g>
    
    <!-- Divider -->
    <line x1="20" y1="105" x2="220" y2="105" stroke="${theme.border}" stroke-width="1" opacity="0.3"/>
    
    <!-- Stats Row -->
    <g transform="translate(20, 125)">
      <!-- Longest Streak -->
      <g transform="translate(35, 0)">
        <text x="0" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10" font-weight="600" fill="${theme.textMuted}" letter-spacing="0.5">
          LONGEST STREAK
        </text>
        <text x="0" y="24" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="${theme.text}">
          ${streakStats?.longestStreak || 0}
        </text>
      </g>
      
      <!-- Vertical Divider -->
      <line x1="90" y1="-5" x2="90" y2="35" stroke="${theme.border}" stroke-width="1" opacity="0.3"/>
      
      <!-- Total Contributions -->
      <g transform="translate(155, 0)">
        <text x="0" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10" font-weight="600" fill="${theme.textMuted}" letter-spacing="0.5">
          TOTAL CONTRIBUTIONS
        </text>
        <text x="0" y="24" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="${theme.text}">
          ${streakStats?.totalContributions || 0}
        </text>
      </g>
    </g>
  </g>`;
}

module.exports = { generateStreakSVG };
