/**
 * Generate SVG markup for the activity graph
 * @param {Array} activityData - Array of {date: string, count: number} objects
 * @param {Object} theme - Theme colors
 * @param {number} width - Total SVG width
 * @param {number} padding - SVG padding
 * @param {number} leftColumn - X position for left column
 * @param {number} yPos - Y position for the section
 * @returns {Object} - { svg: string, height: number }
 */
function generateActivityGraphSVG(activityData, theme, width, padding, leftColumn, yPos) {
  const maxActivity = Math.max(...activityData.map(d => d.count), 1);
  const graphWidth = width - padding * 2 - 300; // Leave space for rank card
  const graphHeight = 120;
  const pointWidth = graphWidth / 29; // 30 points, 29 gaps
  
  // Create path data for line chart
  const pathData = activityData.map((d, i) => {
    const x = i * pointWidth;
    const y = graphHeight - (d.count / maxActivity) * graphHeight;
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');
  
  // Create area fill path
  const areaPath = `${pathData} L ${(activityData.length - 1) * pointWidth} ${graphHeight} L 0 ${graphHeight} Z`;
  
  let svg = `
  <!-- Activity Graph -->
  <g transform="translate(${leftColumn}, ${yPos})">
    <text y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="13" font-weight="600" fill="${theme.textMuted}" letter-spacing="1">
      LAST 30 DAYS ACTIVITY
    </text>
    
    <g transform="translate(0, 25)">
      <!-- Y-axis label -->
      <text x="-10" y="${graphHeight / 2}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10" fill="${theme.textMuted}" text-anchor="end" transform="rotate(-90, -10, ${graphHeight / 2})">
        Activity Count
      </text>
      
      <!-- Graph area -->
      <g transform="translate(20, 0)">
        <!-- Grid lines -->
        ${[0, 0.25, 0.5, 0.75, 1].map(ratio => `
        <line x1="0" y1="${graphHeight * (1 - ratio)}" x2="${graphWidth}" y2="${graphHeight * (1 - ratio)}" stroke="${theme.border}" stroke-width="1" opacity="0.3"/>
        <text x="-5" y="${graphHeight * (1 - ratio) + 4}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="9" fill="${theme.textMuted}" text-anchor="end">
          ${Math.round(maxActivity * ratio)}
        </text>`).join('')}
        
        <!-- Area fill -->
        <path d="${areaPath}" fill="${theme.title}" opacity="0.1"/>
        
        <!-- Line chart -->
        <path d="${pathData}" fill="none" stroke="${theme.title}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        
        <!-- Data points -->
        ${activityData.map((d, i) => {
          const x = i * pointWidth;
          const y = graphHeight - (d.count / maxActivity) * graphHeight;
          return `
        <circle cx="${x}" cy="${y}" r="3" fill="${theme.title}" stroke="${theme.bg}" stroke-width="1.5">
          <title>${d.date}: ${d.count} activities</title>
        </circle>`;
        }).join('')}
        
        <!-- X-axis -->
        <line x1="0" y1="${graphHeight}" x2="${graphWidth}" y2="${graphHeight}" stroke="${theme.border}" stroke-width="2"/>
        
        <!-- X-axis labels (show only some dates) -->
        ${[0, 7, 14, 21, 29].map(i => `
        <text x="${i * pointWidth}" y="${graphHeight + 15}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="9" fill="${theme.textMuted}" text-anchor="middle">
          ${activityData[i].date}
        </text>`).join('')}
      </g>
    </g>
  </g>`;

  const height = 180; // Activity graph height

  return { svg, height };
}

module.exports = { generateActivityGraphSVG };
