// Import static data from src/index.js (ESM style)
import repoStats from '../src/index.js';


export default function handler(req, res) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg viewBox="0 0 440 1350" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="auto" style="display:block;">
  <text x="30" y="28" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📊 Repository Stats</text>
    <g transform="translate(0, 40)">

  <!-- Stats Counter Widget -->
  <g transform="translate(10, 10)">
        <rect width="420" height="140" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
        <rect x="20" y="30" width="110" height="80" rx="10" fill="url(#gradStar)"/>
        <text x="40" y="65" font-size="22" font-weight="bold" font-family="Arial" fill="#fff">⭐ 1.2k</text>
        <text x="40" y="90" font-size="13" font-family="Arial" fill="#fff">Stars</text>
        <rect x="155" y="30" width="110" height="80" rx="10" fill="url(#gradFork)"/>
        <text x="175" y="65" font-size="22" font-weight="bold" font-family="Arial" fill="#fff">🍴 320</text>
        <text x="175" y="90" font-size="13" font-family="Arial" fill="#fff">Forks</text>
        <rect x="290" y="30" width="110" height="80" rx="10" fill="url(#gradWatch)"/>
        <text x="310" y="65" font-size="22" font-weight="bold" font-family="Arial" fill="#fff">👁️ 540</text>
        <text x="310" y="90" font-size="13" font-family="Arial" fill="#fff">Watchers</text>
      </g>
  <!-- Timeline Widget -->
  <g transform="translate(10, 160)">
        <rect width="420" height="150" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
        <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📅 Repository Timeline</text>
        <circle cx="30" cy="70" r="6" fill="#4caf50"/>
        <text x="50" y="75" font-size="15" font-family="Arial" fill="#434d58">Created: 2021-05-10</text>
        <circle cx="30" cy="105" r="6" fill="#ff9800"/>
        <text x="50" y="110" font-size="15" font-family="Arial" fill="#434d58">Last Updated: 2025-08-30</text>
      </g>
  // ...existing code...
      <g transform="translate(10, 320)">
        <rect width="420" height="100" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
        <text x="20" y="35" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📜 License</text>
        <rect x="20" y="55" width="140" height="28" rx="6" fill="#4c71f2"/>
        <text x="40" y="75" font-size="15" font-family="Arial" fill="#fff" font-weight="bold">MIT License</text>
      </g>
      <!-- Language Usage Widget -->
      <g transform="translate(10, 430)">
        <rect width="420" height="220" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
        <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📊 Language Usage</text>
        <circle cx="160" cy="120" r="70" fill="none" stroke="#e4e2e2" stroke-width="20"/>
        <circle cx="160" cy="120" r="70" fill="none" stroke="#4c71f2" stroke-width="20" stroke-dasharray="120 440" stroke-dashoffset="0" stroke-linecap="round"/>
        <circle cx="160" cy="120" r="70" fill="none" stroke="#2f80ed" stroke-width="20" stroke-dasharray="100 440" stroke-dashoffset="-120" stroke-linecap="round"/>
        <circle cx="160" cy="120" r="70" fill="none" stroke="#ff9800" stroke-width="20" stroke-dasharray="80 440" stroke-dashoffset="-220" stroke-linecap="round"/>
        <circle cx="160" cy="120" r="70" fill="none" stroke="#4caf50" stroke-width="20" stroke-dasharray="60 440" stroke-dashoffset="-300" stroke-linecap="round"/>
        <circle cx="160" cy="120" r="70" fill="none" stroke="#9c27b0" stroke-width="20" stroke-dasharray="80 440" stroke-dashoffset="-360" stroke-linecap="round"/>
        <rect x="260" y="70" width="12" height="12" fill="#4c71f2" rx="2"/>
        <text x="280" y="80" font-size="14" font-family="Arial" fill="#434d58">JavaScript (27%)</text>
        <rect x="260" y="95" width="12" height="12" fill="#2f80ed" rx="2"/>
        <text x="280" y="105" font-size="14" font-family="Arial" fill="#434d58">Python (23%)</text>
        <rect x="260" y="120" width="12" height="12" fill="#ff9800" rx="2"/>
        <text x="280" y="130" font-size="14" font-family="Arial" fill="#434d58">HTML (18%)</text>
        <rect x="260" y="145" width="12" height="12" fill="#4caf50" rx="2"/>
        <text x="280" y="155" font-size="14" font-family="Arial" fill="#434d58">CSS (14%)</text>
        <rect x="260" y="170" width="12" height="12" fill="#9c27b0" rx="2"/>
        <text x="280" y="180" font-size="14" font-family="Arial" fill="#434d58">Other (18%)</text>
      </g>
      <!-- Dependencies Widget -->
      <g transform="translate(10, 660)">
        <rect width="420" height="180" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
        <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📦 Dependencies</text>
        <g font-family="Arial" font-size="14" fill="#434d58">
          <rect x="20" y="50" width="100" height="24" fill="#e4e2e2" rx="6"/>
          <text x="30" y="68">react 18.2</text>
          <rect x="140" y="50" width="100" height="24" fill="#e4e2e2" rx="6"/>
          <text x="150" y="68">express 4.18</text>
          <rect x="260" y="50" width="120" height="24" fill="#e4e2e2" rx="6"/>
          <text x="270" y="68">mongoose 7.3</text>
          <rect x="20" y="90" width="120" height="24" fill="#e4e2e2" rx="6"/>
          <text x="30" y="108">chart.js 4.0</text>
          <rect x="160" y="90" width="110" height="24" fill="#e4e2e2" rx="6"/>
          <text x="170" y="108">axios 1.6</text>
        </g>
      </g>
      <!-- Commit Activity Widget -->
      <g transform="translate(10, 850)">
        <rect width="420" height="200" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
        <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">📈 Commit Activity</text>
        <line x1="50" y1="150" x2="380" y2="150" stroke="#e4e2e2" stroke-width="2"/>
        <rect x="60"  y="120" width="20" height="30" fill="#4c71f2" rx="4"/>
        <rect x="100" y="100" width="20" height="50" fill="#4c71f2" rx="4"/>
        <rect x="140" y="60"  width="20" height="90" fill="#4c71f2" rx="4"/>
        <rect x="180" y="90"  width="20" height="60" fill="#4c71f2" rx="4"/>
        <rect x="220" y="70"  width="20" height="80" fill="#4c71f2" rx="4"/>
        <rect x="260" y="110" width="20" height="40" fill="#4c71f2" rx="4"/>
        <rect x="300" y="130" width="20" height="20" fill="#4c71f2" rx="4"/>
  <!-- Removed last bar -->
  <text x="60"  y="170" font-size="12" font-family="Arial" fill="#434d58">Sun</text>
  <text x="100" y="170" font-size="12" font-family="Arial" fill="#434d58">Mon</text>
  <text x="140" y="170" font-size="12" font-family="Arial" fill="#434d58">Tue</text>
  <text x="180" y="170" font-size="12" font-family="Arial" fill="#434d58">Wed</text>
  <text x="220" y="170" font-size="12" font-family="Arial" fill="#434d58">Thu</text>
  <text x="260" y="170" font-size="12" font-family="Arial" fill="#434d58">Fri</text>
  <text x="300" y="170" font-size="12" font-family="Arial" fill="#434d58">Sat</text>
  <!-- Removed last label -->
      </g>
      <!-- PR Merge Time Widget -->
      <g transform="translate(10, 1060)">
        <rect width="420" height="120" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
        <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">🕐 Avg PR Merge Time</text>
        <circle cx="80" cy="75" r="25" fill="none" stroke="#4c71f2" stroke-width="4"/>
        <line x1="80" y1="75" x2="80" y2="60" stroke="#2f80ed" stroke-width="3"/>
        <line x1="80" y1="75" x2="95" y2="75" stroke="#2f80ed" stroke-width="3"/>
        <text x="130" y="82" font-size="18" font-family="Arial" fill="#434d58" font-weight="bold">2.4 days</text>
      </g>
      <!-- Issues Widget -->
      <g transform="translate(10, 1190)">
        <rect width="420" height="160" fill="#fffefe" stroke="#e4e2e2" rx="16" ry="16"/>
        <text x="20" y="30" font-size="18" font-family="Arial" fill="#2f80ed" font-weight="bold">🧵 Issues</text>
        <rect x="20" y="60" width="220" height="20" fill="#4caf50" rx="6"/>
        <text x="250" y="75" font-size="14" fill="#434d58">Open (120)</text>
        <rect x="20" y="95" width="180" height="20" fill="#4c71f2" rx="6"/>
        <text x="250" y="110" font-size="14" fill="#434d58">Closed (90)</text>
        <rect x="20" y="130" width="80" height="20" fill="#ff9800" rx="6"/>
        <text x="250" y="145" font-size="14" fill="#434d58">Pinned (30)</text>
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
  
