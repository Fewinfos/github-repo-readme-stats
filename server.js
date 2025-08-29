const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Example: SVG Repo Stats Counter Widget (server-side)
function renderRepoStatsCounterSVG({stars = 0, forks = 0, watchers = 0} = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="600" height="120" viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="600" height="120" rx="24" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
    <g font-family="Segoe UI, Arial" font-size="38" font-weight="bold">
      <g>
        <circle cx="110" cy="60" r="38" fill="#fde68a" stroke="#f59e42" stroke-width="2"/>
        <text x="110" y="75" text-anchor="middle" fill="#b45309">⭐</text>
        <text x="180" y="75" fill="#333" font-size="32">${stars}</text>
      </g>
      <g>
        <circle cx="300" cy="60" r="38" fill="#a7f3d0" stroke="#059669" stroke-width="2"/>
        <text x="300" y="75" text-anchor="middle" fill="#047857">🍴</text>
        <text x="370" y="75" fill="#333" font-size="32">${forks}</text>
      </g>
      <g>
        <circle cx="490" cy="60" r="38" fill="#bfdbfe" stroke="#2563eb" stroke-width="2"/>
        <text x="490" y="75" text-anchor="middle" fill="#1d4ed8">👁️</text>
        <text x="560" y="75" fill="#333" font-size="32">${watchers}</text>
      </g>
    </g>
  </svg>`;
}

app.get('/widget', async (req, res) => {
  const { owner = 'octocat', repo = 'Hello-World' } = req.query;
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('GitHub API error');
    const data = await response.json();
    const svg = renderRepoStatsCounterSVG({
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.subscribers_count
    });
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (e) {
    res.status(500).send('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60"><text x="10" y="35" font-size="20" fill="red">Error loading widget</text></svg>');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
