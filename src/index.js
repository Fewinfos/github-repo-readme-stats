async function getDependencies(owner, repo) {
  try {
    const pkgJson = await fetchJSON(`${GITHUB_API}/repos/${owner}/${repo}/contents/package.json`);
    if (pkgJson) {
      const pkg = parsePackageJson(pkgJson);
      return parseDependencies(pkg);
    }
  } catch (e) {
    console.error(e);
  }
  return [{ name: 'Not specified', version: '' }];
}

async function getRepoInfo(owner, repo) {
  const repoData = await fetchJSON(`${GITHUB_API}/repos/${owner}/${repo}`);
  if (!repoData) throw new Error('Failed to fetch repo info');
  return repoData;
}

async function getLanguagesInfo(owner, repo) {
  const langData = await fetchJSON(`${GITHUB_API}/repos/${owner}/${repo}/languages`) || {};
  return getLanguages(langData);
}

async function getCommitActivity(owner, repo) {
  let commitActivity = [0,0,0,0,0,0,0];
  try {
    const now = new Date();
    const sinceISO = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();
    let page = 1, allCommits = [], keepFetching = true;
    while (keepFetching) {
      const commits = await fetchJSON(`${GITHUB_API}/repos/${owner}/${repo}/commits?since=${sinceISO}&per_page=100&page=${page}`);
      if (!commits) break;
      allCommits = allCommits.concat(commits);
      if (commits.length < 100) keepFetching = false;
      else page++;
    }
    commitActivity = countCommitsPerDay(allCommits, now);
  } catch (e) {
    console.error(e);
  }
  return commitActivity;
}

async function getIssues(owner, repo) {
  let open = 0, closed = 0, pinned = 0;
  const issuesData = await fetchJSON(`${GITHUB_API}/search/issues?q=repo:${owner}/${repo}+type:issue`);
  if (issuesData) {
    open = issuesData.items?.filter(i => i.state === 'open').length || 0;
    closed = issuesData.items?.filter(i => i.state === 'closed').length || 0;
  }
  return { open, closed, pinned };
}

async function getPRMergeTime(owner, repo) {
  let prMergeTime = 0;
  try {
    let page = 1, mergedPRs = [], keepFetching = true;
    while (keepFetching && mergedPRs.length < 50) {
      const prs = await fetchJSON(`${GITHUB_API}/repos/${owner}/${repo}/pulls?state=closed&per_page=100&page=${page}`);
      if (!prs) break;
      const merged = prs.filter(pr => pr.merged_at);
      mergedPRs = mergedPRs.concat(merged);
      if (prs.length < 100 || mergedPRs.length >= 50) keepFetching = false;
      else page++;
    }
    prMergeTime = calcPRMergeTime(mergedPRs);
  } catch (e) {
    console.error(e);
  }
  return prMergeTime;
}

import fetch from 'node-fetch';
const GITHUB_API = 'https://api.github.com';

function formatK(n) {
  if (n >= 1000) return (n/1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k';
  return n;
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

function parsePackageJson(pkgJson) {
  let pkgContent = pkgJson.content;
  if (pkgJson.encoding === 'base64') {
    pkgContent = Buffer.from(pkgContent, 'base64').toString('utf-8');
  }
  return JSON.parse(pkgContent);
}

function getLanguages(langData) {
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
  return languages;
}

function countCommitsPerDay(commits, now) {
  const dayCounts = [0,0,0,0,0,0,0];
  commits.forEach(commit => {
    const date = new Date(commit.commit.author.date);
    const daysAgo = Math.floor((now - date) / (24*60*60*1000));
    if (daysAgo >= 0 && daysAgo < 7) {
      dayCounts[6 - daysAgo]++;
    }
  });
  return dayCounts;
}

function calcPRMergeTime(mergedPRs) {
  if (mergedPRs.length === 0) return 0;
  const totalMergeTime = mergedPRs.reduce((sum, pr) => {
    const created = new Date(pr.created_at);
    const merged = new Date(pr.merged_at);
    return sum + (merged - created);
  }, 0);
  return Math.round(totalMergeTime / mergedPRs.length / (1000 * 60 * 60 * 24));
}

function parseDependencies(pkg) {
  if (pkg.dependencies && Object.keys(pkg.dependencies).length > 0) {
    return Object.entries(pkg.dependencies).map(([name, version]) => ({ name, version }));
  }
  return [{ name: 'Not specified', version: '' }];
}

export async function getRepoStats(repoFullName = 'vercel/next.js') {
  const [owner, repo] = repoFullName.split('/');

  const [dependencies, repoData, languages, commitActivity, issues, prMergeTime] = await Promise.all([
    getDependencies(owner, repo),
    getRepoInfo(owner, repo),
    getLanguagesInfo(owner, repo),
    getCommitActivity(owner, repo),
    getIssues(owner, repo),
    getPRMergeTime(owner, repo)
  ]);

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
    issues
  };
}