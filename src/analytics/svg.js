/**
 * Generate SVG markup for advanced analytics metrics
 * @param {Object} data - Repository data with analytics metrics
 * @param {Object} theme - Theme colors
 * @param {Object} ICONS - Icon path data
 * @param {number} leftColumn - X position for left column
 * @param {number} yPos - Y position for the section
 * @returns {Object} - { svg: string, height: number }
 */
function generateAnalyticsSVG(data, theme, ICONS, leftColumn, yPos) {
  const escapeXml = (unsafe) => {
    if (!unsafe) return '';
    return String(unsafe).replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  // Create metrics array for two-column list
  const metrics = [
    { icon: ICONS.graph, label: 'PR MERGE RATE', value: `${data.prMergeRate}%` },
    { icon: ICONS.check, label: 'ISSUE CLOSE RATE', value: `${data.issueCloseRate}%` },
    { icon: ICONS.clock, label: 'AVG TIME TO MERGE', value: data.avgTimeToMerge },
    { icon: 'M1.75 1A1.75 1.75 0 000 2.75v8.5C0 12.216.784 13 1.75 13H3v1.543a1.457 1.457 0 002.487 1.03L8.61 12.5h5.64c.966 0 1.75-.784 1.75-1.75v-8.5A1.75 1.75 0 0014.25 1H1.75zM1.5 2.75a.25.25 0 01.25-.25h12.5a.25.25 0 01.25.25v8.5a.25.25 0 01-.25.25h-6.5a.75.75 0 00-.53.22L4.5 14.44v-2.19a.75.75 0 00-.75-.75h-2a.25.25 0 01-.25-.25v-8.5z', label: 'DISCUSSION/ITEM', value: data.discussionActivity },
    { icon: ICONS.shield, label: 'BUS FACTOR', value: data.busFactor },
    { icon: ICONS.zap, label: 'GROWTH TREND', value: data.growthTrend },
    { icon: ICONS.tag, label: 'RELEASE CADENCE', value: data.releaseCadence },
    { icon: 'M1.5 2.75a.25.25 0 01.25-.25h8.5a.25.25 0 01.25.25v8.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5zM1.75 1A1.75 1.75 0 000 2.75v8.5C0 12.216.784 13 1.75 13h8.5c.966 0 1.75-.784 1.75-1.75v-8.5A1.75 1.75 0 0010.25 1h-8.5zM13 3.5v7a.5.5 0 001 0v-7a.5.5 0 00-1 0zm2-2v11a.5.5 0 001 0v-11a.5.5 0 00-1 0z', label: 'STALE ISSUES', value: String(data.staleIssuesCount) }
  ];

  let svg = `
  <!-- Advanced Metrics List -->
  <g transform="translate(${leftColumn}, ${yPos})">`;
  
  metrics.forEach((metric, idx) => {
    const column = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = column * 330;
    const yOffset = row * 35;
    
    svg += `
    <g transform="translate(${xPos}, ${yOffset})">
      <path d="${metric.icon}" fill="${theme.iconColor}" transform="scale(0.8)"/>
      <text x="20" y="10" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" font-weight="500" fill="${theme.textMuted}">
        ${metric.label}
      </text>
      <text x="250" y="10" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="${theme.text}" text-anchor="end">
        ${escapeXml(metric.value)}
      </text>
    </g>`;
  });
  
  svg += `
  </g>`;

  const height = Math.ceil(metrics.length / 2) * 35 + 20;

  return { svg, height };
}

module.exports = { generateAnalyticsSVG };
