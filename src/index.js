import fetch from 'node-fetch';
const GITHUB_API = 'https://api.github.com';

export async function getRepoStats(repoFullName = 'vercel/next.js') {
  const [owner, repo] = repoFullName.split('/');
  // Fetch repo info
  const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`);
  if (!repoRes.ok) throw new Error('Failed to fetch repo info');
  const repoData = await repoRes.json();

  // Fetch languages
  const langRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`);
  const langData = langRes.ok ? await langRes.json() : {};
  const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0) || 1;
  const languageColors = {
    JavaScript: '#4c71f2', Python: '#2f80ed', HTML: '#ff9800', CSS: '#4caf50', TypeScript: '#3178c6', Java: '#b07219', C: '#555', 'C++': '#f34b7d', Other: '#9c27b0'
  };
  const languages = Object.entries(langData).map(([name, bytes]) => ({
    name,
    percent: Math.round((bytes / totalBytes) * 100),
    color: languageColors[name] || '#9c27b0'
  }));
  if (languages.length === 0) languages.push({ name: 'Other', percent: 100, color: '#9c27b0' });

  // Fetch commit activity for the last 7 days using /commits endpoint
  let commitActivity = [0,0,0,0,0,0,0];
  try {
    const now = new Date();
    const since = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000); // 6 days ago
    const sinceISO = since.toISOString();
    let page = 1;
    let allCommits = [];
    let keepFetching = true;
    while (keepFetching) {
      const commitsRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/commits?since=${sinceISO}&per_page=100&page=${page}`);
      if (!commitsRes.ok) break;
      const commits = await commitsRes.json();
      allCommits = allCommits.concat(commits);
      if (commits.length < 100) keepFetching = false;
      else page++;
    }
    // Count commits per day (Sun-Sat, ending with today)
    const dayCounts = [0,0,0,0,0,0,0];
    allCommits.forEach(commit => {
      const date = new Date(commit.commit.author.date);
      // Calculate how many days ago this commit was (0 = today, 6 = 6 days ago)
      const daysAgo = Math.floor((now - date) / (24*60*60*1000));
      if (daysAgo >= 0 && daysAgo < 7) {
        // Place in array so that dayCounts[6] is today, [0] is 6 days ago
        dayCounts[6 - daysAgo]++;
      }
    });
    commitActivity = dayCounts;
  } catch (e) {
    // fallback to zeros, do nothing
    console.error(e);
  }

  // Fetch issues
  const issuesRes = await fetch(`${GITHUB_API}/search/issues?q=repo:${owner}/${repo}+type:issue`);
  let open = 0, closed = 0, pinned = 0;
  if (issuesRes.ok) {
    const issuesData = await issuesRes.json();
    open = issuesData.items?.filter(i => i.state === 'open').length || 0;
    closed = issuesData.items?.filter(i => i.state === 'closed').length || 0;
    // pinned is always 0
  }

  return {
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    watchers: repoData.subscribers_count,
    createdAt: repoData.created_at?.slice(0,10),
    updatedAt: repoData.updated_at?.slice(0,10),
    license: repoData.license?.name || 'No license',
    languages,
    dependencies: [], // Not available from GitHub API directly
    commitActivity,
    prMergeTime: 0, // Not available from public API easily
    issues: { open, closed, pinned }
  };
}