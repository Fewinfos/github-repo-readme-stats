/**
 * Generate SVG markup for the rank indicator
 * @param {Object} data - Repository data with rankScore and rankTier
 * @param {Object} theme - Theme colors
 * @param {number} width - Total SVG width
 * @returns {string} - SVG markup
 */
function generateRankSVG(data, theme, width) {
  return `
  <!-- Rectangular Rank Indicator (Right Side, Upper Position) -->
  <g transform="translate(${width - 280}, 155)">
    <!-- Background rectangle -->
    <rect 
      x="0" 
      y="0" 
      width="240" 
      height="140" 
      fill="${theme.badgeBg}" 
      stroke="${theme.border}" 
      stroke-width="2" 
      rx="16"/>
    
    <!-- Progress bar background -->
    <rect 
      x="20" 
      y="90" 
      width="200" 
      height="12" 
      fill="${theme.iconColor}20" 
      rx="6"/>
    
    <!-- Progress bar fill -->
    <rect 
      x="20" 
      y="90" 
      width="${(data.rankScore / 100) * 200}" 
      height="12" 
      fill="${theme.title}" 
      rx="6"
      style="transition: width 0.5s ease;"/>
    
    <!-- Rank score -->
    <text x="120" y="50" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="48" font-weight="900" fill="${theme.title}" text-anchor="middle">
      ${data.rankScore}
    </text>
    
    <!-- Rank tier -->
    <text x="120" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="16" font-weight="700" fill="${theme.textMuted}" text-anchor="middle" letter-spacing="2">
      TIER ${data.rankTier}
    </text>
    
    <!-- Percentage label -->
    <text x="120" y="125" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" font-weight="500" fill="${theme.textMuted}" text-anchor="middle">
      RANK SCORE
    </text>
  </g>`;
}

module.exports = { generateRankSVG };
