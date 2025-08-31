// Import static data from src/index.js (ESM style)
import repoStats from '../src/index.js';


export default function handler(req, res) {
  try {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg viewBox="0 0 440 1350" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="auto" style="display:block;">
      <text x="30" y="28" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📊 Repository Stats</text>
      <g transform="translate(0, 40)">
        <!-- Stats Counter Widget -->
        <g transform="translate(10, 10)">
          <rect width="420" height="140" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
          <rect x="20" y="30" width="110" height="80" rx="10" fill="url(#gradStar)"/>
          <text x="40" y="65" font-size="22" font-weight="bold" font-family="Arial" fill="#fff">⭐ ${repoStats.stars}</text>
          <text x="40" y="90" font-size="13" font-family="Arial" fill="#fff">Stars</text>
          <rect x="155" y="30" width="110" height="80" rx="10" fill="url(#gradFork)"/>
          <text x="175" y="65" font-size="22" font-weight="bold" font-family="Arial" fill="#fff">🍴 ${repoStats.forks}</text>
          <text x="175" y="90" font-size="13" font-family="Arial" fill="#fff">Forks</text>
          <rect x="290" y="30" width="110" height="80" rx="10" fill="url(#gradWatch)"/>
          <text x="310" y="65" font-size="22" font-weight="bold" font-family="Arial" fill="#fff">👁️ ${repoStats.watchers}</text>
          <text x="310" y="90" font-size="13" font-family="Arial" fill="#fff">Watchers</text>
        </g>
        <!-- Timeline Widget -->
        <g transform="translate(10, 160)">
          <rect width="420" height="150" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
          <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📅 Repository Timeline</text>
          <circle cx="30" cy="70" r="6" fill="#4caf50"/>
          <text x="50" y="75" font-size="15" font-family="Arial" fill="#434d58">Created: ${repoStats.createdAt}</text>
          <circle cx="30" cy="105" r="6" fill="#ff9800"/>
          <text x="50" y="110" font-size="15" font-family="Arial" fill="#434d58">Last Updated: ${repoStats.updatedAt}</text>
        </g>
        <!-- License Widget -->
        <g transform="translate(10, 320)">
          <rect width="420" height="100" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
          <text x="20" y="35" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📜 License</text>
          <rect x="20" y="55" width="140" height="28" rx="6" fill="#4c71f2"/>
          <text x="40" y="75" font-size="15" font-family="Arial" fill="#fff" font-weight="bold">${repoStats.license}</text>
        </g>
        <!-- Language Usage Widget -->
        <g transform="translate(10, 430)">
          <rect width="420" height="220" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
          <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📊 Language Usage</text>
          <circle cx="160" cy="120" r="70" fill="none" stroke="#e4e2e2" stroke-width="20"/>
          <!-- Dynamic language arcs and legend -->
          ${repoStats.languages.map((lang, i, arr) => {
            const total = 440;
            let offset = 0;
            for (let j = 0; j < i; j++) offset -= arr[j].percent / 100 * total;
            return `<circle cx="160" cy="120" r="70" fill="none" stroke="${lang.color}" stroke-width="20" stroke-dasharray="${lang.percent / 100 * total} ${total}" stroke-dashoffset="${offset}" stroke-linecap="round"/>`;
          }).join('')}
          ${repoStats.languages.map((lang, i) => {
            const y = 70 + i * 25;
            return `<rect x="260" y="${y}" width="12" height="12" fill="${lang.color}" rx="2"/>
            <text x="280" y="${y+10}" font-size="14" font-family="Arial" fill="#434d58">${lang.name} (${lang.percent}%)</text>`;
          }).join('')}
        </g>
        <!-- Dependencies Widget -->
        <g transform="translate(10, 660)">
          <rect width="420" height="180" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
          <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📦 Dependencies</text>
          <g font-family="Arial" font-size="14" fill="#434d58">
            ${repoStats.dependencies.map((dep, i) => {
              const x = 20 + (i % 3) * 120;
              const y = 50 + Math.floor(i / 3) * 40;
              return `<rect x="${x}" y="${y}" width="100" height="24" fill="#e4e2e2" rx="6"/>
              <text x="${x+10}" y="${y+18}">${dep.name} ${dep.version}</text>`;
            }).join('')}
          </g>
        </g>
        <!-- Commit Activity Widget -->
        <g transform="translate(10, 850)">
          <rect width="420" height="200" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
          <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📈 Commit Activity</text>
          <line x1="50" y1="150" x2="380" y2="150" stroke="#e4e2e2" stroke-width="2"/>
          ${repoStats.commitActivity.map((val, i) => {
            const x = 60 + i * 40;
            const y = 150 - val;
            return `<rect x="${x}" y="${y}" width="20" height="${val}" fill="#4c71f2" rx="4"/>`;
          }).join('')}
          ${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => `<text x="${60 + i * 40}" y="170" font-size="12" font-family="Arial" fill="#434d58">${d}</text>`).join('')}
        </g>
        <!-- PR Merge Time Widget -->
        <g transform="translate(10, 1060)">
          <rect width="420" height="120" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
          <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">🕐 Avg PR Merge Time</text>
          <circle cx="80" cy="75" r="25" fill="none" stroke="#4c71f2" stroke-width="4"/>
          <line x1="80" y1="75" x2="80" y2="60" stroke="#2f80ed" stroke-width="3"/>
          <line x1="80" y1="75" x2="95" y2="75" stroke="#2f80ed" stroke-width="3"/>
          <text x="130" y="82" font-size="18" font-family="Arial" fill="#434d58" font-weight="bold">${repoStats.prMergeTime} days</text>
        </g>
        <!-- Issues Widget -->
        <g transform="translate(10, 1190)">
          <rect width="420" height="160" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
          <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">🧵 Issues</text>
          <rect x="20" y="60" width="220" height="20" fill="#4caf50" rx="6"/>
          <text x="250" y="75" font-size="14" fill="#434d58">Open (${repoStats.issues.open})</text>
          <rect x="20" y="95" width="180" height="20" fill="#4c71f2" rx="6"/>
          <text x="250" y="110" font-size="14" fill="#434d58">Closed (${repoStats.issues.closed})</text>
          <rect x="20" y="130" width="80" height="20" fill="#ff9800" rx="6"/>
          <text x="250" y="145" font-size="14" fill="#434d58">Pinned (${repoStats.issues.pinned})</text>
        </g>
      </g>
      <defs>
        <linearGradient id="gradStar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fbc02d"/>
          <stop offset="100%" stop-color="#f57c00"/>
        </linearGradient>
        <linearGradient id="gradFork" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#42a5f5"/>
          <stop offset="100%" stop-color="#1e88e5"/>
        </linearGradient>
        <linearGradient id="gradWatch" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#66bb6a"/>
          <stop offset="100%" stop-color="#2e7d32"/>
        </linearGradient>
      </defs>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(svg);
  } catch (error) {
    console.error('Error generating SVG:', error);
    res.status(500).setHeader('Content-Type', 'image/svg+xml');
    res.end(`<svg width="500" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff3f3"/><text x="50%" y="50%" text-anchor="middle" alignment-baseline="middle" font-size="18" fill="#d32f2f">Error: ${error.message}</text></svg>`);
  }
}

// Named export: creation & last updated date only widget
export function dateWidget(req, res) {
  const dateSvg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="500" height="100" viewBox="0 0 500 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0e7ff"/>
        <stop offset="100%" stop-color="#f3f4f6"/>
      </linearGradient>
      <filter id="shadow2" x="-10" y="-10" width="520" height="120">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#a5b4fc"/>
      </filter>
    </defs>
    <rect x="0" y="0" width="500" height="100" rx="24" fill="url(#bgGradient2)" filter="url(#shadow2)"/>
    <text x="250" y="45" text-anchor="middle" font-size="28" font-family="'Segoe UI', 'Arial', sans-serif" fill="#6366f1" font-weight="bold" opacity="0.92">
      📅 Repo Dates
    </text>
    <text x="250" y="80" text-anchor="middle" font-size="20" font-family="'Segoe UI', 'Arial', sans-serif" fill="#18181b" opacity="0.9">
      Created: ${repoStats.createdAt}   |   Last updated: ${repoStats.updatedAt}
    </text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(dateSvg);
}
  
