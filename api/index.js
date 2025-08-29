// Export a function that can be used as a Vercel serverless function
// Static SVG Repo Stats Counter Widget (no data fetching)
module.exports = (req, res) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="900" height="360" viewBox="0 0 900 360" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0e7ff"/>
        <stop offset="100%" stop-color="#f3f4f6"/>
      </linearGradient>
      <filter id="shadow" x="-10" y="-10" width="920" height="380">
        <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#a5b4fc"/>
      </filter>
    </defs>

    <rect x="0" y="0" width="900" height="360" rx="40" fill="url(#bgGradient)" filter="url(#shadow)"/>

    <text x="450" y="70" text-anchor="middle" font-size="40" font-family="'Segoe UI', 'Arial', sans-serif" fill="#6366f1" font-weight="bold" opacity="0.92">GitHub Repo Stats</text>

    <g font-family="'Segoe UI', 'Arial', sans-serif" font-weight="bold">
      <g>
        <circle cx="200" cy="140" r="60" fill="#fde68a" stroke="#f59e42" stroke-width="4"/>
        <text x="200" y="155" text-anchor="middle" font-size="54" fill="#b45309" filter="url(#shadow)">★</text>
        <text x="200" y="250" text-anchor="middle" font-size="50" fill="#18181b">123</text>
        <text x="200" y="290" text-anchor="middle" font-size="26" fill="#b45309" opacity="0.7">Stars</text>
      </g>
      <g>
        <circle cx="450" cy="140" r="60" fill="#a7f3d0" stroke="#059669" stroke-width="4"/>
        <text x="450" y="155" text-anchor="middle" font-size="50" fill="#047857" filter="url(#shadow)">🍴</text>
        <text x="450" y="250" text-anchor="middle" font-size="50" fill="#18181b">45</text>
        <text x="450" y="290" text-anchor="middle" font-size="26" fill="#047857" opacity="0.7">Forks</text>
      </g>
      <g>
        <circle cx="700" cy="140" r="60" fill="#bfdbfe" stroke="#2563eb" stroke-width="4"/>
        <text x="700" y="155" text-anchor="middle" font-size="50" fill="#1d4ed8" filter="url(#shadow)">👁️</text>
        <text x="700" y="250" text-anchor="middle" font-size="50" fill="#18181b">67</text>
        <text x="700" y="290" text-anchor="middle" font-size="26" fill="#1d4ed8" opacity="0.7">Watchers</text>
      </g>
    </g>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
};
  
