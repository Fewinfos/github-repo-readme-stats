// Load environment variables from .env file for local development
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import themes from themes folder
const THEMES = require('../themes/index.js');

// Language colors from GitHub
const LANGUAGE_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Scala: '#c22d40',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Dart: '#00B4AB',
  R: '#198CE7',
  MATLAB: '#e16737',
  Perl: '#0298c3',
  Lua: '#000080',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Objective_C: '#438eff',
  'Jupyter Notebook': '#DA5B0B',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  default: '#8b949e'
};

// GraphQL query to fetch all repository data in a single call
const REPO_QUERY = `
query RepoData($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    name
    description
    url
    homepageUrl
    isArchived
    isFork
    createdAt
    updatedAt
    pushedAt
    stargazerCount
    forkCount
    primaryLanguage {
      name
      color
    }
    licenseInfo {
      name
      spdxId
    }
    watchers {
      totalCount
    }
    issues(states: [OPEN]) {
      totalCount
    }
    closedIssues: issues(states: [CLOSED]) {
      totalCount
    }
    allIssues: issues(first: 30, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        state
        createdAt
        comments {
          totalCount
        }
      }
    }
    pullRequests(states: [OPEN]) {
      totalCount
    }
    closedPullRequests: pullRequests(states: [CLOSED, MERGED]) {
      totalCount
    }
    mergedPullRequests: pullRequests(states: [MERGED]) {
      totalCount
    }
    recentPRs: pullRequests(first: 30, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        state
        createdAt
        mergedAt
        comments {
          totalCount
        }
      }
    }
    languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
      edges {
        size
        node {
          name
          color
        }
      }
      totalSize
    }
    releases(first: 10, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        tagName
        name
        publishedAt
        isPrerelease
      }
    }
    defaultBranchRef {
      target {
        ... on Commit {
          history(first: 100) {
            nodes {
              message
              committedDate
              author {
                user {
                  login
                }
              }
            }
          }
        }
      }
    }
  }
}`;

module.exports = async (req, res) => {
  try {
    const { username, repo, theme = 'light' } = req.query;
    const selectedTheme = THEMES[theme] || THEMES.light;

    // Validate required parameters
    if (!username || !repo) {
      return res.status(400).send(
        generateErrorSVG('Missing username or repo parameter', selectedTheme)
      );
    }

    // GitHub token is required for GraphQL API
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return res.status(500).send(
        generateErrorSVG('GitHub token required for API access', selectedTheme)
      );
    }

    // Fetch all repository data with a single GraphQL call
    const graphqlResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GitHub-Repo-Card'
      },
      body: JSON.stringify({
        query: REPO_QUERY,
        variables: { owner: username, name: repo }
      })
    });

    if (!graphqlResponse.ok) {
      if (graphqlResponse.status === 401) {
        return res.status(401).send(
          generateErrorSVG('Invalid GitHub token', selectedTheme)
        );
      }
      if (graphqlResponse.status === 403) {
        return res.status(403).send(
          generateErrorSVG('API rate limit exceeded', selectedTheme)
        );
      }
      throw new Error(`GitHub API error: ${graphqlResponse.status}`);
    }

    const graphqlResult = await graphqlResponse.json();

    if (graphqlResult.errors) {
      const errorMsg = graphqlResult.errors[0]?.message || 'GraphQL error';
      if (errorMsg.includes('Could not resolve')) {
        return res.status(404).send(
          generateErrorSVG('Repository not found', selectedTheme)
        );
      }
      throw new Error(errorMsg);
    }

    const gqlRepo = graphqlResult.data.repository;
    if (!gqlRepo) {
      return res.status(404).send(
        generateErrorSVG('Repository not found', selectedTheme)
      );
    }

    // Transform GraphQL data to match the expected format
    const data = {
      name: gqlRepo.name,
      description: gqlRepo.description,
      html_url: gqlRepo.url,
      homepage: gqlRepo.homepageUrl,
      archived: gqlRepo.isArchived,
      fork: gqlRepo.isFork,
      created_at: gqlRepo.createdAt,
      updated_at: gqlRepo.updatedAt,
      pushed_at: gqlRepo.pushedAt,
      stargazers_count: gqlRepo.stargazerCount,
      forks_count: gqlRepo.forkCount,
      language: gqlRepo.primaryLanguage?.name || null,
      license: gqlRepo.licenseInfo ? { name: gqlRepo.licenseInfo.name, spdx_id: gqlRepo.licenseInfo.spdxId } : null,
      watchers_count: gqlRepo.watchers.totalCount,
      open_issues_count: gqlRepo.issues.totalCount
    };

    // Fetch contributors from REST API (GraphQL doesn't provide contributor stats)
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${username}/${repo}/contributors?per_page=10`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'GitHub-Repo-Card'
        }
      }
    );
    const contributorsData = contributorsResponse.ok ? await contributorsResponse.json() : [];

    const languagesData = {};
    gqlRepo.languages.edges.forEach(edge => {
      languagesData[edge.node.name] = edge.size;
    });

    const releasesData = gqlRepo.releases.nodes.map(release => ({
      tag_name: release.tagName,
      name: release.name,
      published_at: release.publishedAt,
      prerelease: release.isPrerelease
    }));

    // Extract commit data
    const commits = gqlRepo.defaultBranchRef?.target?.history?.nodes || [];
    const recentCommits = commits.map(commit => ({
      commit: { message: commit.message, committedDate: commit.committedDate },
      author: commit.author?.user ? { login: commit.author.user.login } : null
    }));

    // Extract PR and issue data
    const recentPRs = gqlRepo.recentPRs.nodes.map(pr => ({
      state: pr.state.toLowerCase(),
      created_at: pr.createdAt,
      merged_at: pr.mergedAt,
      comments: pr.comments.totalCount
    }));

    const recentIssues = gqlRepo.allIssues.nodes.map(issue => ({
      state: issue.state.toLowerCase(),
      created_at: issue.createdAt,
      comments: issue.comments.totalCount,
      pull_request: false
    }));

    // Calculate totals from GraphQL data
    const totalPullRequests = gqlRepo.pullRequests.totalCount + gqlRepo.closedPullRequests.totalCount;
    const totalIssues = gqlRepo.issues.totalCount + gqlRepo.closedIssues.totalCount;
    const mergedPRsCount = gqlRepo.mergedPullRequests.totalCount;
    const closedIssuesCount = gqlRepo.closedIssues.totalCount;

    // Calculate commit activity based on recent commits
    let commitActivity = 'unknown';
    if (recentCommits.length > 0) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentCommitCount = recentCommits.filter(c => 
        c.commit?.committedDate ? new Date(c.commit.committedDate) > thirtyDaysAgo : false
      ).length;
      if (recentCommitCount === 0) commitActivity = 'low';
      else if (recentCommitCount < 10) commitActivity = 'low';
      else if (recentCommitCount < 30) commitActivity = 'medium';
      else commitActivity = 'high';
    }

    // Calculate PR Merge Rate
    const prMergeRate = totalPullRequests > 0 ? Math.min(100, Math.floor((mergedPRsCount / totalPullRequests) * 100)) : 0;

    // Calculate Issue Close Rate
    const issueCloseRate = totalIssues > 0 ? Math.min(100, Math.floor((closedIssuesCount / totalIssues) * 100)) : 0;

    // Calculate Average Time to Merge (for recent PRs)
    let avgTimeToMerge = 'N/A';
    const mergedRecentPRs = recentPRs.filter(pr => pr.merged_at);
    if (mergedRecentPRs.length > 0) {
      const totalMergeTime = mergedRecentPRs.reduce((sum, pr) => {
        const created = new Date(pr.created_at);
        const merged = new Date(pr.merged_at);
        return sum + (merged - created);
      }, 0);
      const avgMs = totalMergeTime / mergedRecentPRs.length;
      const avgDays = Math.floor(avgMs / (1000 * 60 * 60 * 24));
      const avgHours = Math.floor((avgMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      avgTimeToMerge = avgDays > 0 ? `${avgDays}d` : `${avgHours}h`;
    }

    // Calculate Average Response Time (first comment/review on issues/PRs)
    let avgResponseTime = 'N/A';
    const itemsWithComments = [...recentIssues, ...recentPRs].filter(item => item.comments > 0).slice(0, 20);
    if (itemsWithComments.length > 5) {
      // Simplified: estimate based on creation time patterns
      avgResponseTime = '< 24h'; // This is a simplified metric; full implementation would need comments API
    }

    // Calculate Stale Issues (open > 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const staleIssuesCount = recentIssues.filter(issue => 
      issue.state === 'open' && !issue.pull_request && new Date(issue.created_at) < ninetyDaysAgo
    ).length;

    // Contributor Diversity (new vs returning in recent commits)
    const contributorSet = new Set();
    const recentContributorSet = new Set();
    recentCommits.slice(0, 50).forEach(commit => {
      if (commit.author?.login) {
        recentContributorSet.add(commit.author.login);
      }
    });
    contributorsData.forEach(c => contributorSet.add(c.login));
    const contributorDiversity = contributorSet.size > 0 ? `${recentContributorSet.size}/${contributorSet.size}` : '0/0';

    // Bus Factor (concentration risk - top contributor %)
    let busFactor = 'Low Risk';
    if (contributorsData.length > 0) {
      const totalContributions = contributorsData.reduce((sum, c) => sum + c.contributions, 0);
      const topContributorPercent = (contributorsData[0].contributions / totalContributions) * 100;
      if (topContributorPercent > 70) busFactor = 'High Risk';
      else if (topContributorPercent > 50) busFactor = 'Medium Risk';
      else busFactor = 'Low Risk';
    }

    // Release Cadence
    let releaseCadence = 'N/A';
    if (releasesData.length >= 2) {
      const recentReleases = releasesData.slice(0, 5);
      let totalDaysBetween = 0;
      for (let i = 0; i < recentReleases.length - 1; i++) {
        const date1 = new Date(recentReleases[i].published_at);
        const date2 = new Date(recentReleases[i + 1].published_at);
        totalDaysBetween += Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
      }
      const avgDays = Math.floor(totalDaysBetween / (recentReleases.length - 1));
      if (avgDays < 30) releaseCadence = `~${avgDays}d`;
      else if (avgDays < 90) releaseCadence = `~${Math.floor(avgDays / 7)}w`;
      else releaseCadence = `~${Math.floor(avgDays / 30)}mo`;
    }

    // Commit Message Quality Score (simplified)
    let commitQualityScore = 0;
    if (recentCommits.length > 0) {
      const qualityCommits = recentCommits.filter(commit => {
        const msg = commit.commit?.message || '';
        return msg.length >= 20 && msg.length <= 200 && !msg.match(/^(fix|update|change|wip)$/i);
      }).length;
      commitQualityScore = Math.floor((qualityCommits / recentCommits.length) * 100);
    }

    // Growth Trend (stars growth estimate based on age)
    const repoAgeInDays = Math.floor((Date.now() - new Date(data.created_at)) / (1000 * 60 * 60 * 24));
    const starsPerDay = repoAgeInDays > 0 ? (data.stargazers_count / repoAgeInDays).toFixed(2) : 0;
    const growthTrend = parseFloat(starsPerDay) > 1 ? 'High Growth' : parseFloat(starsPerDay) > 0.1 ? 'Growing' : 'Stable';

    // Discussion Activity (comments per issue/PR)
    const totalItems = recentIssues.length + recentPRs.length;
    const totalComments = [...recentIssues, ...recentPRs].reduce((sum, item) => sum + (item.comments || 0), 0);
    const discussionActivity = totalItems > 0 ? (totalComments / totalItems).toFixed(1) : '0.0';

    // Process languages data
    const languagesArray = Object.entries(languagesData).map(([name, bytes]) => ({
      name,
      bytes,
      color: LANGUAGE_COLORS[name] || LANGUAGE_COLORS.default
    })).sort((a, b) => b.bytes - a.bytes);
    
    const totalBytes = languagesArray.reduce((sum, lang) => sum + lang.bytes, 0);
    const topLanguages = languagesArray.slice(0, 5).map(lang => ({
      ...lang,
      percentage: ((lang.bytes / totalBytes) * 100).toFixed(1)
    }));

    // Calculate contributors stats
    const totalContributors = contributorsData.length;
    const topContributors = contributorsData.slice(0, 5).map(c => ({
      login: c.login,
      contributions: c.contributions,
      avatar: c.avatar_url
    }));

    // Get latest release
    const latestRelease = releasesData[0] || null;

    // Calculate health status based on last update
    const lastUpdate = new Date(data.updated_at || data.pushed_at);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
    const healthStatus = daysSinceUpdate <= 30 ? 'active' : 'stale';

    // Get language color
    const languageColor = LANGUAGE_COLORS[data.language] || LANGUAGE_COLORS.default;

    // Calculate repository rank
    const rankData = calculateRepoRank({
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      watchers: data.watchers_count || 0,
      commitActivity: commitActivity,
      releaseCadence: releaseCadence,
      pushedAt: data.pushed_at,
      prMergeRate: prMergeRate,
      issueCloseRate: issueCloseRate,
      contributorDiversity: contributorDiversity,
      discussionActivity: discussionActivity,
      commitQualityScore: commitQualityScore
    });

    // Extract comprehensive repository data
    const repoData = {
      name: data.name || 'Unknown',
      owner: data.owner?.login || username,
      ownerAvatar: data.owner?.avatar_url || '',
      description: data.description || '',
      stars: data.stargazers_count || 0,
      starsFormatted: formatNumber(data.stargazers_count || 0),
      forks: data.forks_count || 0,
      forksFormatted: formatNumber(data.forks_count || 0),
      watchers: data.subscribers_count || 0,
      watchersFormatted: formatNumber(data.subscribers_count || 0),
      issues: data.open_issues_count || 0,
      issuesFormatted: formatNumber(data.open_issues_count || 0),
      pullRequests: totalPullRequests,
      pullRequestsFormatted: formatNumber(totalPullRequests),
      language: data.language || null,
      languageColor: languageColor,
      languages: topLanguages,
      license: data.license?.spdx_id || null,
      updatedAt: formatDate(data.updated_at || data.pushed_at),
      createdAt: formatDate(data.created_at),
      pushedAt: formatDate(data.pushed_at),
      size: data.size || 0,
      sizeFormatted: formatSize(data.size || 0),
      isPrivate: data.private || false,
      defaultBranch: data.default_branch || 'main',
      hasIssues: data.has_issues || false,
      hasDiscussions: data.has_discussions || false,
      hasWiki: data.has_wiki || false,
      hasPages: data.has_pages || false,
      hasDownloads: data.has_downloads || false,
      commitActivity: commitActivity,
      healthStatus: healthStatus,
      archived: data.archived || false,
      topics: (data.topics || []).slice(0, 8),
      contributors: totalContributors,
      contributorsFormatted: formatNumber(totalContributors),
      topContributors: topContributors,
      latestRelease: latestRelease ? {
        name: latestRelease.name || latestRelease.tag_name,
        tag: latestRelease.tag_name,
        publishedAt: formatDate(latestRelease.published_at)
      } : null,
      networkCount: data.network_count || 0,
      subscribersCount: data.subscribers_count || 0,
      homepageUrl: data.homepage || null,
      // Advanced Analytics
      totalIssues: totalIssues,
      totalIssuesFormatted: formatNumber(totalIssues),
      prMergeRate: prMergeRate,
      issueCloseRate: issueCloseRate,
      avgTimeToMerge: avgTimeToMerge,
      avgResponseTime: avgResponseTime,
      staleIssuesCount: staleIssuesCount,
      // Contributor Insights
      contributorDiversity: contributorDiversity,
      busFactor: busFactor,
      activeContributors: recentContributorSet.size,
      // Code Quality
      commitQualityScore: commitQualityScore,
      releaseCadence: releaseCadence,
      totalCommits: recentCommits.length,
      // Community & Growth
      growthTrend: growthTrend,
      starsPerDay: starsPerDay,
      discussionActivity: discussionActivity,
      totalReleases: releasesData.length,
      // Repository Rank
      rankScore: rankData.score,
      rankTier: rankData.tier
    };

    // Generate and return SVG
    const svg = generateRepoSVG(repoData, selectedTheme);
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=1800'); // Cache for 30 minutes
    return res.status(200).send(svg);

  } catch (error) {
    console.error('Error:', error);
    const selectedTheme = THEMES[req.query?.theme] || THEMES.light;
    return res.status(500).send(
      generateErrorSVG('Failed to fetch repository data', selectedTheme)
    );
  }
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

function formatSize(kb) {
  if (kb >= 1024 * 1024) {
    return (kb / (1024 * 1024)).toFixed(1) + ' GB';
  }
  if (kb >= 1024) {
    return (kb / 1024).toFixed(1) + ' MB';
  }
  return kb + ' KB';
}

// SVG Icons as path data
const ICONS = {
  star: 'M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z',
  fork: 'M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z',
  eye: 'M8 2c1.981 0 3.671.992 4.933 2.078 1.27 1.091 2.187 2.345 2.637 3.023a1.62 1.62 0 010 1.798c-.45.678-1.367 1.932-2.637 3.023C11.67 13.008 9.981 14 8 14c-1.981 0-3.671-.992-4.933-2.078C1.797 10.83.88 9.576.43 8.898a1.62 1.62 0 010-1.798c.45-.677 1.367-1.931 2.637-3.022C4.33 2.992 6.019 2 8 2zM1.679 7.932a.12.12 0 000 .136c.411.622 1.241 1.75 2.366 2.717C5.176 11.758 6.527 12.5 8 12.5c1.473 0 2.825-.742 3.955-1.715 1.124-.967 1.954-2.096 2.366-2.717a.12.12 0 000-.136c-.412-.621-1.242-1.75-2.366-2.717C10.824 4.242 9.473 3.5 8 3.5c-1.473 0-2.825.742-3.955 1.715-1.124.967-1.954 2.096-2.366 2.717zM8 10a2 2 0 110-4 2 2 0 010 4z',
  issue: 'M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z',
  license: 'M8.75.75V2h.985c.304 0 .603.08.867.231l1.29.736c.038.022.08.033.124.033h2.234a.75.75 0 010 1.5h-.427l2.111 4.692a.75.75 0 01-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.006.005-.01.01-.045.04c-.21.176-.441.327-.686.45C14.556 10.78 13.88 11 13 11a4.498 4.498 0 01-2.023-.454 3.544 3.544 0 01-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 01-.154-.838L12.178 4.5h-.162c-.305 0-.604-.079-.868-.231l-1.29-.736a.245.245 0 00-.124-.033H8.75V13h2.5a.75.75 0 010 1.5h-6.5a.75.75 0 010-1.5h2.5V3.5h-.984a.245.245 0 00-.124.033l-1.289.737c-.265.15-.564.23-.869.23h-.162l2.112 4.692a.75.75 0 01-.154.838l-.53-.53.529.531-.001.002-.002.002-.006.006-.016.015-.045.04c-.21.176-.441.327-.686.45C4.556 10.78 3.88 11 3 11a4.498 4.498 0 01-2.023-.454 3.544 3.544 0 01-.686-.45l-.045-.04-.016-.015-.006-.006-.004-.004v-.001a.75.75 0 01-.154-.838L2.178 4.5H1.75a.75.75 0 010-1.5h2.234a.249.249 0 00.125-.033l1.288-.737c.265-.15.564-.23.869-.23h.984V.75a.75.75 0 011.5 0zm2.945 8.477c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L13 6.327zm-10 0c.285.135.718.273 1.305.273s1.02-.138 1.305-.273L3 6.327z',
  branch: 'M9.5 3.25a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zm-6 0a.75.75 0 101.5 0 .75.75 0 00-1.5 0zm8.25-.75a.75.75 0 100 1.5.75.75 0 000-1.5zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5z',
  clock: 'M8 0a8 8 0 110 16A8 8 0 018 0zM1.5 8a6.5 6.5 0 1013 0 6.5 6.5 0 00-13 0zm7-3.25v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.751.751 0 017 8.25v-3.5a.75.75 0 011.5 0z',
  pulse: 'M6 2a.75.75 0 01.696.471L10 10.731l1.304-3.26A.751.751 0 0112 7h3.25a.75.75 0 010 1.5h-2.742l-1.812 4.528a.751.751 0 01-1.392 0L6 4.77 4.696 8.03A.75.75 0 014 8.5H.75a.75.75 0 010-1.5h2.742l1.812-4.529A.751.751 0 016 2z',
  database: 'M6 2h4a1 1 0 110 2H6a1 1 0 010-2zM3.25 4h9.5a.75.75 0 010 1.5h-9.5a.75.75 0 010-1.5zM1 7.25A.75.75 0 011.75 6.5h12.5a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75H1.75a.75.75 0 01-.75-.75v-7.5zm1.5.75v6h11v-6h-11z',
  comment: 'M1.5 2.75a.25.25 0 01.25-.25h12.5a.25.25 0 01.25.25v8.5a.25.25 0 01-.25.25h-6.5a.75.75 0 00-.53.22L4.5 14.44v-2.19a.75.75 0 00-.75-.75h-2a.25.25 0 01-.25-.25v-8.5zM1.75 1A1.75 1.75 0 000 2.75v8.5C0 12.216.784 13 1.75 13H3v1.543a1.457 1.457 0 002.487 1.03L8.61 12.5h5.64c.966 0 1.75-.784 1.75-1.75v-8.5A1.75 1.75 0 0014.25 1H1.75z',
  check: 'M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.751.751 0 01.018-1.042.751.751 0 011.042-.018L6 10.94l6.72-6.72a.75.75 0 011.06 0z',
  x: 'M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.749.749 0 011.275.326.749.749 0 01-.215.734L9.06 8l3.22 3.22a.749.749 0 01-.326 1.275.749.749 0 01-.734-.215L8 9.06l-3.22 3.22a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042L6.94 8 3.72 4.78a.75.75 0 010-1.06z',
  archive: 'M2.5 1.75v11.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V1.75a.25.25 0 00-.25-.25H2.75a.25.25 0 00-.25.25zm.75 12.5h9.5c.966 0 1.75-.784 1.75-1.75V1.75A1.75 1.75 0 0012.75 0H2.25A1.75 1.75 0 00.5 1.75v10.75c0 .966.784 1.75 1.75 1.75zM8 7.75a.75.75 0 01.75.75v2.19l.72-.72a.751.751 0 011.042.018.751.751 0 01.018 1.042l-2 2a.75.75 0 01-1.06 0l-2-2a.751.751 0 01.018-1.042.751.751 0 011.042-.018l.72.72V8.5A.75.75 0 018 7.75zm-3.5-3a.75.75 0 01.75-.75h5.5a.75.75 0 010 1.5h-5.5a.75.75 0 01-.75-.75z',
  graph: 'M1.5 1.75V13.5h13.75a.75.75 0 010 1.5H.75a.75.75 0 01-.75-.75V1.75a.75.75 0 011.5 0zm14.28 2.53a.75.75 0 00-1.06-1.06L10 7.94 7.53 5.47a.75.75 0 00-1.06 0l-3.97 3.97a.75.75 0 101.06 1.06L7 7.06l2.47 2.47a.75.75 0 001.06 0l5.25-5.25z',
  shield: 'M8 0C6.547 0 5.254.434 4.415 1.158c-.838.724-1.415 1.812-1.415 3.342v4.5c0 1.53.577 2.618 1.415 3.342C5.254 13.066 6.547 13.5 8 13.5s2.746-.434 3.585-1.158c.838-.724 1.415-1.812 1.415-3.342V4.5c0-1.53-.577-2.618-1.415-3.342C10.746.434 9.453 0 8 0zM4.5 4.5c0-.935.242-1.566.672-1.993C5.602 2.08 6.229 1.5 8 1.5s2.398.58 2.828 1.007c.43.427.672 1.058.672 1.993v4.5c0 .935-.242 1.566-.672 1.993C10.398 11.42 9.771 12 8 12s-2.398-.58-2.828-1.007c-.43-.427-.672-1.058-.672-1.993V4.5z',
  tag: 'M2.5 7.775V2.75a.25.25 0 01.25-.25h5.025a.25.25 0 01.177.073l6.25 6.25a.25.25 0 010 .354l-5.025 5.025a.25.25 0 01-.354 0l-6.25-6.25a.25.25 0 01-.073-.177zm-1.5 0V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zM6 5a1 1 0 100 2 1 1 0 000-2z',
  zap: 'M9.504.43a1.516 1.516 0 012.437 1.713L10.415 5.5h2.123c1.57 0 2.346 1.909 1.22 3.004l-7.34 7.142a1.249 1.249 0 01-.871.354h-.302a1.25 1.25 0 01-1.157-1.723L5.633 10.5H3.462c-1.57 0-2.346-1.909-1.22-3.004L9.503.429z'
};

function generateRepoSVG(data, theme) {
  const width = 1000;  // Much wider to cover full README
  const padding = 40;
  const leftColumn = padding;
  const rightColumn = 540;
  
  // Calculate description lines
  const maxDescLength = 90;
  const descLines = data.description ? wrapText(data.description, maxDescLength) : [];
  const descHeight = descLines.length * 20;
  
  // Calculate total height dynamically based on content
  const headerHeight = 100;
  const descSection = descLines.length > 0 ? descHeight + 20 : 0;
  const advancedMetricsSection = 180; // 8 metrics in 4 rows at 35px each + header (30px) + padding (20px)
  const topicsSection = data.topics.length > 0 ? 50 : 0;
  const footerSection = 60;
  
  const height = padding + headerHeight + descSection + advancedMetricsSection + topicsSection + footerSection + padding;

  // Activity indicator colors
  const activityColors = {
    high: { bg: theme.activeBg, text: theme.activeText, border: theme.activeBorder },
    medium: { bg: '#fff8c5', text: '#9a6700', border: '#d4a72c' },
    low: { bg: '#ffebe9', text: '#cf222e', border: '#f85149' },
    unknown: { bg: theme.badgeBg, text: theme.textMuted, border: theme.badgeBorder }
  };
  const activityStyle = activityColors[data.commitActivity] || activityColors.unknown;

  // Health badge style
  const healthStyle = data.healthStatus === 'active' 
    ? { bg: theme.activeBg, border: theme.activeBorder, text: theme.activeText }
    : { bg: theme.staleBg, border: theme.staleBorder, text: theme.staleText };

  let yPos = padding;

  // Start SVG
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.1"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${theme.bg}" rx="16"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="${theme.border}" stroke-width="1" rx="16"/>
  
  <!-- Header Section -->
  <g transform="translate(${leftColumn}, ${yPos})">
    <!-- Owner Info -->
    <g>
      <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="14" font-weight="500" fill="${theme.textSecondary}">
        ${escapeXml(data.owner)}
      </text>
      
      <!-- Badges Row -->
      <g transform="translate(${Math.min(data.owner.length * 8 + 12, 150)}, -3)">
        ${data.archived ? `
        <g>
          <rect width="65" height="20" fill="${theme.staleBg}" stroke="${theme.staleBorder}" stroke-width="1" rx="10"/>
          <text x="32.5" y="14" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="10" font-weight="600" fill="${theme.staleText}" text-anchor="middle">📦 Archived</text>
        </g>` : ''}
      </g>
    </g>
  </g>`;

  yPos += 30;

  // Repository Name (Large)
  const truncatedName = data.name.length > 45 ? data.name.substring(0, 42) + '...' : data.name;
  svg += `
  <text x="${leftColumn}" y="${yPos + 32}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="36" font-weight="700" fill="${theme.title}" letter-spacing="-0.5">
    ${escapeXml(truncatedName)}
  </text>`;

  yPos += 50;

  // Status Badges (Top right corner)
  svg += `
  <g transform="translate(${width - 130}, ${padding - 30})">
    <!-- Updated Time -->
    <g transform="translate(0, 0)">
      <rect width="100" height="24" fill="${theme.badgeBg}" stroke="${theme.badgeBorder}" stroke-width="1" rx="12"/>
      <path d="${ICONS.clock}" fill="${theme.iconColor}" transform="translate(8, 6) scale(0.75)"/>
      <text x="26" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" fill="${theme.textSecondary}">
        ${escapeXml(data.pushedAt)}
      </text>
    </g>
  </g>
  
  <!-- Large Circular Rank Indicator (Right Side, Upper Position) -->
  <g transform="translate(${width - 350}, 80)">
    <!-- Progress track (background) -->
    <circle 
      cx="110" 
      cy="110" 
      r="95" 
      fill="none" 
      stroke="${theme.iconColor}20" 
      stroke-width="14"
      stroke-linecap="round"/>
    
    <!-- Progress circle (animated) -->
    <circle 
      cx="110" 
      cy="110" 
      r="95" 
      fill="none" 
      stroke="${theme.title}" 
      stroke-width="14"
      stroke-linecap="round"
      stroke-dasharray="${(data.rankScore / 100) * 597} 597"
      transform="rotate(-90 110 110)"
      style="transition: stroke-dasharray 0.5s ease;"/>
    
    <!-- Percentage text -->
    <text x="110" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="42" font-weight="900" fill="${theme.title}" text-anchor="middle">
      ${data.rankScore}
    </text>
    <text x="110" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="18" font-weight="700" fill="${theme.textMuted}" text-anchor="middle" letter-spacing="2">
      ${data.rankTier}
    </text>
  </g>`;

  yPos += 40;

  // Advanced Analytics Section
  yPos += 10;

  // Create metrics array for two-column list
  const metrics = [
    { icon: ICONS.graph, label: 'PR MERGE RATE', value: `${data.prMergeRate}%` },
    { icon: ICONS.check, label: 'ISSUE CLOSE RATE', value: `${data.issueCloseRate}%` },
    { icon: ICONS.clock, label: 'AVG TIME TO MERGE', value: data.avgTimeToMerge },
    { icon: 'M1.75 1A1.75 1.75 0 000 2.75v8.5C0 12.216.784 13 1.75 13H3v1.543a1.457 1.457 0 002.487 1.03L8.61 12.5h5.64c.966 0 1.75-.784 1.75-1.75v-8.5A1.75 1.75 0 0014.25 1H1.75zM1.5 2.75a.25.25 0 01.25-.25h12.5a.25.25 0 01.25.25v8.5a.25.25 0 01-.25.25h-6.5a.75.75 0 00-.53.22L4.5 14.44v-2.19a.75.75 0 00-.75-.75h-2a.25.25 0 01-.25-.25v-8.5z', label: 'DISCUSSION/ITEM', value: data.discussionActivity },
    { icon: ICONS.shield, label: 'BUS FACTOR', value: data.busFactor },
    { icon: ICONS.zap, label: 'GROWTH TREND', value: data.growthTrend },
    { icon: ICONS.tag, label: 'RELEASE CADENCE', value: data.releaseCadence },
    { icon: 'M1.5 2.75a.25.25 0 01.25-.25h8.5a.25.25 0 01.25.25v8.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5zM1.75 1A1.75 1.75 0 000 2.75v8.5C0 12.216.784 13 1.75 13h8.5c.966 0 1.75-.784 1.75-1.75v-8.5A1.75 1.75 0 0010.25 1h-8.5zM13 3.5v7a.5.5 0 001 0v-7a.5.5 0 00-1 0zm2-2v11a.5.5 0 001 0v-11a.5.5 0 00-1 0z', label: 'STALE ISSUES', value: String(data.staleIssuesCount) }
  ];

  svg += `
  <!-- Advanced Metrics List -->
  <g transform="translate(${leftColumn}, ${yPos})">`;
  
  metrics.forEach((metric, idx) => {
    const column = idx % 2;
    const row = Math.floor(idx / 2);
    const xPos = column * 330;
    const yOffset = row * 35;
    
    svg += `
    <g transform="translate(${xPos}, ${yOffset})">
      <path d="${metric.icon}" fill="${theme.iconColor}" transform="scale(0.8)"/>
      <text x="20" y="10" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" font-weight="500" fill="${theme.textMuted}">
        ${metric.label}
      </text>
      <text x="250" y="10" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="${theme.text}" text-anchor="end">
        ${escapeXml(metric.value)}
      </text>
    </g>`;
  });
  
  svg += `
  </g>`;

  yPos += Math.ceil(metrics.length / 2) * 35 + 20;

  // Topics Section
  if (data.topics.length > 0) {
    svg += `
  <!-- TOPICS -->
  <g transform="translate(${leftColumn}, ${yPos})">`;
    
    let xPos = 0;
    data.topics.forEach((topic, idx) => {
      const topicWidth = topic.length * 7 + 20;
      if (xPos + topicWidth > width - padding * 2) return; // Skip if doesn't fit
      
      svg += `
    <g transform="translate(${xPos}, 0)">
      <rect width="${topicWidth}" height="24" fill="${theme.badgeBg}" stroke="${theme.title}40" stroke-width="1" rx="12"/>
      <text x="${topicWidth / 2}" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" font-weight="500" fill="${theme.title}" text-anchor="middle">
        ${escapeXml(topic)}
      </text>
    </g>`;
      xPos += topicWidth + 10;
    });
    
    svg += `
  </g>`;
    yPos += 40;
  }

  // Footer Section with Additional Info
  svg += `
  <!-- FOOTER INFO -->
  <g transform="translate(${leftColumn}, ${yPos})">
    <rect width="${width - padding * 2}" height="1" fill="${theme.border}"/>
  </g>`;
  
  yPos += 15;
  
  svg += `
  <g transform="translate(${leftColumn}, ${yPos})">
    <!-- License -->
    <g>
      <path d="${ICONS.license}" fill="${theme.iconColor}" transform="scale(0.85)"/>
      <text x="20" y="11" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12" fill="${theme.textSecondary}">
        ${data.license ? escapeXml(data.license) : 'No license'}
      </text>
    </g>
    
    <!-- Features -->
    <g transform="translate(280, 0)">
      <text x="0" y="11" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="12" fill="${theme.textMuted}">
        ${data.hasIssues ? '✓' : '✗'} Issues  ${data.hasWiki ? '✓' : '✗'} Wiki  ${data.hasPages ? '✓' : '✗'} Pages  ${data.hasDiscussions ? '✓' : '✗'} Discussions
      </text>
    </g>
  </g>`;
  
  yPos += 20;
  
  // Latest Release Info
  if (data.latestRelease) {
    svg += `
  <g transform="translate(${leftColumn}, ${yPos})">
    <text x="0" y="11" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" fill="${theme.textMuted}">
      Latest Release: <tspan font-weight="600" fill="${theme.text}">${escapeXml(data.latestRelease.tag)}</tspan> · ${escapeXml(data.latestRelease.publishedAt)}
    </text>
  </g>`;
  }

  svg += `
</svg>`;

  return svg;
}

function generateErrorSVG(message, theme) {
  const width = 400;
  const height = 120;
  
  // Default to light theme if not provided
  if (!theme) {
    theme = THEMES.light;
  }
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="transparent" rx="12"/>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" fill="${theme.bg}" stroke="#f85149" stroke-width="1" rx="12"/>
  
  <!-- Error Icon -->
  <g transform="translate(${width / 2 - 40}, 30)">
    <circle cx="12" cy="12" r="12" fill="#ffebe9" stroke="#f85149" stroke-width="1"/>
    <path d="M12 7v5m0 3v.01" stroke="#cf222e" stroke-width="2" stroke-linecap="round"/>
  </g>
  
  <!-- Error Message -->
  <text x="${width / 2}" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="14" font-weight="500" fill="#cf222e" text-anchor="middle">
    ${escapeXml(message)}
  </text>
  
  <text x="${width / 2}" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="11" fill="${theme.textMuted}" text-anchor="middle">
    Please check the username and repository name
  </text>
</svg>`;
}

function wrapText(text, maxLength) {
  if (!text || text.length <= maxLength) {
    return [text || ''];
  }
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  for (const word of words) {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Limit to 2 lines and add ellipsis if needed
  if (lines.length > 2) {
    lines[1] = lines[1].substring(0, maxLength - 3) + '...';
    return lines.slice(0, 2);
  }
  
  return lines;
}

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') {
    return unsafe;
  }
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Calculate repository rank based on multiple weighted metrics
 * @param {Object} metrics - Repository metrics
 * @returns {Object} - { score, tier, color }
 */
function calculateRepoRank(metrics) {
  // Define weights for different categories (total = 100%)
  const WEIGHTS = {
    // Popularity Metrics (30%)
    stars: 15,
    forks: 8,
    watchers: 7,
    
    // Activity Metrics (30%)
    commitActivity: 12,
    releaseCadence: 8,
    recentUpdates: 10,
    
    // Community Health (40%)
    prMergeRate: 10,
    issueCloseRate: 10,
    contributorDiversity: 8,
    discussionActivity: 7,
    codeQuality: 5
  };

  let totalScore = 0;

  // 1. Stars Score (0-100 scale, logarithmic)
  const starsScore = Math.min(100, Math.log10(Math.max(1, metrics.stars)) * 20);
  totalScore += (starsScore * WEIGHTS.stars) / 100;

  // 2. Forks Score (0-100 scale, logarithmic)
  const forksScore = Math.min(100, Math.log10(Math.max(1, metrics.forks)) * 25);
  totalScore += (forksScore * WEIGHTS.forks) / 100;

  // 3. Watchers Score (0-100 scale, logarithmic)
  const watchersScore = Math.min(100, Math.log10(Math.max(1, metrics.watchers)) * 25);
  totalScore += (watchersScore * WEIGHTS.watchers) / 100;

  // 4. Commit Activity Score
  const activityScores = { high: 100, medium: 65, low: 30, unknown: 0 };
  const activityScore = activityScores[metrics.commitActivity] || 0;
  totalScore += (activityScore * WEIGHTS.commitActivity) / 100;

  // 5. Release Cadence Score
  let releaseScore = 0;
  if (metrics.releaseCadence !== 'N/A') {
    const cadence = metrics.releaseCadence.toLowerCase();
    if (cadence.includes('d')) releaseScore = 100; // Daily/weekly releases
    else if (cadence.includes('w')) releaseScore = 85; // Weekly releases
    else if (cadence.includes('mo') && parseInt(cadence) <= 3) releaseScore = 70; // 1-3 month cadence
    else releaseScore = 50; // Longer cadence
  }
  totalScore += (releaseScore * WEIGHTS.releaseCadence) / 100;

  // 6. Recent Updates Score (based on days since last update)
  const daysSinceUpdate = Math.floor((Date.now() - new Date(metrics.pushedAt)) / (1000 * 60 * 60 * 24));
  let updateScore = 100;
  if (daysSinceUpdate > 365) updateScore = 20;
  else if (daysSinceUpdate > 180) updateScore = 40;
  else if (daysSinceUpdate > 90) updateScore = 60;
  else if (daysSinceUpdate > 30) updateScore = 80;
  totalScore += (updateScore * WEIGHTS.recentUpdates) / 100;

  // 7. PR Merge Rate Score (already 0-100)
  totalScore += (metrics.prMergeRate * WEIGHTS.prMergeRate) / 100;

  // 8. Issue Close Rate Score (already 0-100)
  totalScore += (metrics.issueCloseRate * WEIGHTS.issueCloseRate) / 100;

  // 9. Contributor Diversity Score
  let diversityScore = 0;
  if (metrics.contributorDiversity !== '0/0') {
    const [active, total] = metrics.contributorDiversity.split('/').map(Number);
    if (total > 0) {
      const ratio = active / total;
      diversityScore = Math.min(100, ratio * 200); // Higher ratio = better diversity
      if (total >= 10) diversityScore = Math.min(100, diversityScore * 1.2); // Bonus for larger teams
    }
  }
  totalScore += (diversityScore * WEIGHTS.contributorDiversity) / 100;

  // 10. Discussion Activity Score
  const discussionValue = parseFloat(metrics.discussionActivity) || 0;
  let discussionScore = Math.min(100, discussionValue * 20); // Scale: 5+ comments = 100
  totalScore += (discussionScore * WEIGHTS.discussionActivity) / 100;

  // 11. Code Quality Score (commit message quality)
  const qualityScore = metrics.commitQualityScore || 0;
  totalScore += (qualityScore * WEIGHTS.codeQuality) / 100;

  // Round to 1 decimal place
  totalScore = Math.round(totalScore * 10) / 10;

  // Determine tier based on score
  let tier;
  if (totalScore >= 90) {
    tier = 'S';
  } else if (totalScore >= 75) {
    tier = 'A';
  } else if (totalScore >= 60) {
    tier = 'B';
  } else if (totalScore >= 45) {
    tier = 'C';
  } else {
    tier = 'D';
  }

  return {
    score: totalScore,
    tier: tier
  };
}
