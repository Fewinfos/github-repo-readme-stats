import fetch from 'node-fetch';
const GITHUB_API = 'https://api.github.com';

export async function getRepoStats(repoFullName = 'vercel/next.js') {
  function formatK(n) {
    if (n >= 1000) return (n/1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
    return n;
  }
  const [owner, repo] = repoFullName.split('/');
  // Fetch dependencies from package.json if available
  let dependencies = [];
  try {
    const pkgRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/package.json`);
    if (pkgRes.ok) {
      const pkgJson = await pkgRes.json();
      let pkgContent = pkgJson.content;
      if (pkgJson.encoding === 'base64') {
        pkgContent = Buffer.from(pkgContent, 'base64').toString('utf-8');
      }
      const pkg = JSON.parse(pkgContent);
      if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
        dependencies = Object.entries(pkg.dependencies).map(([name, version]) => ({ name, version }));
      } else {
        dependencies = [{ name: 'Not specified', version: '' }];
      }
    } else {
      dependencies = [{ name: 'Not specified', version: '' }];
    }
  } catch (e) {
    dependencies = [{ name: 'Not specified', version: '' }];
    console.error(e);
  }
  // Fetch repo info
  const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`);
  if (!repoRes.ok) {
    const errText = await repoRes.text();
    throw new Error(`Failed to fetch repo info: ${repoRes.status} ${repoRes.statusText} - ${errText}`);
  }
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

  // Fetch closed PRs and calculate average merge time (in days)
  let prMergeTime = 0;
  try {
    let page = 1;
    let mergedPRs = [];
    let keepFetching = true;
    while (keepFetching && mergedPRs.length < 50) { // limit to 50 merged PRs for performance
      const prsRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/pulls?state=closed&per_page=100&page=${page}`);
      if (!prsRes.ok) break;
      const prs = await prsRes.json();
      const merged = prs.filter(pr => pr.merged_at);
      mergedPRs = mergedPRs.concat(merged);
      if (prs.length < 100 || mergedPRs.length >= 50) keepFetching = false;
      else page++;
    }
    if (mergedPRs.length > 0) {
      const totalMergeTime = mergedPRs.reduce((sum, pr) => {
        const created = new Date(pr.created_at);
        const merged = new Date(pr.merged_at);
        return sum + (merged - created);
      }, 0);
      prMergeTime = Math.round(totalMergeTime / mergedPRs.length / (1000 * 60 * 60 * 24));
    }
  } catch (e) {
    // fallback to 0
    console.error(e);
  }

  return {
    stars: formatK(repoData.stargazers_count),
    forks: formatK(repoData.forks_count),
    watchers: formatK(repoData.subscribers_count),
    createdAt: repoData.created_at?.slice(0,10),
    updatedAt: repoData.updated_at?.slice(0,10),
    license: repoData.license?.name || 'No license',
    languages,
    dependencies,
    commitActivity,
    prMergeTime,
    issues: { open, closed, pinned }
  };
}