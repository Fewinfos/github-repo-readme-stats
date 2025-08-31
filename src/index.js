// Static data for the SVG widget


const repoStats = {
  stars: 124,
  forks: 45,
  watchers: 67,
  createdAt: '2022-01-15', // YYYY-MM-DD
  updatedAt: '2025-08-30', // YYYY-MM-DD
  license: 'MIT License',
  languages: [
    { name: 'JavaScript', percent: 27, color: '#4c71f2' },
    { name: 'Python', percent: 23, color: '#2f80ed' },
    { name: 'HTML', percent: 18, color: '#ff9800' },
    { name: 'CSS', percent: 14, color: '#4caf50' },
    { name: 'Other', percent: 18, color: '#9c27b0' }
  ],
  dependencies: [
    { name: 'react', version: '18.2' },
    { name: 'express', version: '4.18' },
    { name: 'mongoose', version: '7.3' },
    { name: 'chart.js', version: '4.0' },
    { name: 'axios', version: '1.6' }
  ],
  commitActivity: [30, 50, 90, 60, 80, 40, 20], // Sun-Sat
  prMergeTime: 2.4, // days
  issues: {
    open: 120,
    closed: 90,
    pinned: 30
  }
};

export default repoStats;
