# Repository Ranking System Implementation

## Overview
A comprehensive ranking system has been added to the GitHub Repository Stats Widget that evaluates repositories across multiple dimensions and assigns a letter grade (S, A, B, C, D) with a numerical score (0-100).

## Implementation Details

### 1. Ranking Algorithm (`calculateRepoRank()`)
Located in `api/index.js`, this function calculates a weighted score based on:

#### Weight Distribution:
- **Popularity (30%)**: Stars (15%), Forks (8%), Watchers (7%)
- **Activity (30%)**: Commit Activity (12%), Release Cadence (8%), Recent Updates (10%)
- **Community Health (40%)**: PR Merge Rate (10%), Issue Close Rate (10%), Contributor Diversity (8%), Discussion Activity (7%), Code Quality (5%)

#### Scoring Logic:
- **Stars/Forks/Watchers**: Logarithmic scaling to prevent mega-repos from dominating
- **Commit Activity**: High (100 pts), Medium (65 pts), Low (30 pts)
- **Release Cadence**: Daily/frequent (100 pts) → Infrequent (50 pts)
- **Recent Updates**: Last 30 days (100 pts) → Over 1 year (20 pts)
- **PR/Issue Rates**: Direct percentage (0-100)
- **Contributor Diversity**: Active/Total ratio with bonus for larger teams
- **Discussion Activity**: Comments per item, scaled up to 100
- **Code Quality**: Commit message quality score (0-100)

### 2. Tier System

| Tier | Score | Color | Badge Style |
|------|-------|-------|-------------|
| S | 90-100 | Gold (#FFD700) | Premium badge with gold border |
| A | 75-89 | Green (#2DA44E) | Success badge with green border |
| B | 60-74 | Blue (#0969DA) | Info badge with blue border |
| C | 45-59 | Orange (#FB8500) | Warning badge with orange border |
| D | 0-44 | Red (#CF222E) | Error badge with red border |

### 3. Visual Display
The rank badge appears in the SVG header section with:
- Letter tier (S, A, B, C, D)
- Numerical score
- Color-coded background and border
- Positioned after the "Updated Time" badge

### 4. Data Integration
New properties added to `repoData` object:
```javascript
{
  rankScore: 87.5,          // Numerical score (0-100)
  rankTier: 'A',            // Letter tier
  rankColor: '#2DA44E',     // Text color
  rankBgColor: '#DDF4E4',   // Background color
  rankBorderColor: '#2DA44E' // Border color
}
```

## Usage

The ranking system is **automatic** - no configuration needed. Every repository card will display:
1. A rank badge showing tier and score
2. All metrics used in the calculation are already visible in the advanced insights section

## Example Rankings

### S-Tier Repository (90+)
- High stars (10k+)
- Active development (commits in last week)
- Excellent PR merge rate (>85%)
- High issue close rate (>80%)
- Strong contributor diversity
- Regular releases
- High code quality

### A-Tier Repository (75-89)
- Good star count (1k+)
- Regular commits
- Good PR/issue handling (>70%)
- Active community
- Regular maintenance

### B-Tier Repository (60-74)
- Moderate popularity
- Ongoing development
- Fair community metrics
- Some areas for improvement

### C-Tier Repository (45-59)
- Lower engagement
- Inconsistent activity
- Needs better PR/issue handling
- Room for community growth

### D-Tier Repository (<45)
- Limited adoption
- Infrequent updates
- Low community engagement
- Multiple areas need attention

## Testing

To test the ranking system:
1. Start the development server: `npm run dev` or `node api/index.js`
2. Visit: `http://localhost:3000/api/?username=OWNER&repo=REPO_NAME`
3. Check the rank badge in the header section
4. Try different repositories to see various rank tiers

## Future Enhancements

Potential improvements:
1. **Optional Query Parameter**: Add `&showRank=false` to hide rank badge
2. **Comparative Ranking**: Percentile-based ranking against similar repos
3. **Historical Tracking**: Show rank trend over time
4. **Category-Specific Ranks**: Separate ranks for popularity, activity, and health
5. **Custom Weights**: Allow users to configure metric weights via query params
6. **Rank Breakdown**: Detailed score breakdown in a tooltip or expanded view

## Algorithm Tuning

The weights and thresholds can be adjusted in the `calculateRepoRank()` function:
- **WEIGHTS object**: Modify percentage allocation per metric
- **Tier thresholds**: Adjust score boundaries for S/A/B/C/D tiers
- **Logarithmic scaling**: Tune the multipliers for stars/forks/watchers
- **Activity scoring**: Adjust score values for high/medium/low activity

## Notes

- The ranking is **absolute** (fixed thresholds), not comparative
- All input metrics are already collected by the existing system
- The algorithm favors well-rounded repositories over single-metric stars
- Community health weighs more (40%) than pure popularity (30%)
- Logarithmic scaling prevents mega-repos from skewing the scale
