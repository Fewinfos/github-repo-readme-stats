'use strict';

/**
 * One GraphQL round-trip that returns everything the card needs from the GraphQL API.
 *
 * Variables:
 *   $owner, $name  - repository coordinates
 *   $staleQuery    - search string for issues with no activity in 90+ days
 */
const REPO_QUERY = `
query RepoData($owner: String!, $name: String!, $staleQuery: String!) {
  repository(owner: $owner, name: $name) {
    name
    nameWithOwner
    description
    url
    homepageUrl
    isArchived
    isFork
    isPrivate
    createdAt
    updatedAt
    pushedAt
    stargazerCount
    forkCount
    owner {
      login
      avatarUrl(size: 96)
    }
    parent {
      nameWithOwner
    }
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
    repositoryTopics(first: 10) {
      nodes {
        topic {
          name
        }
      }
    }
    openIssues: issues(states: [OPEN]) {
      totalCount
    }
    closedIssues: issues(states: [CLOSED]) {
      totalCount
    }
    recentIssues: issues(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes {
        state
        createdAt
        comments {
          totalCount
        }
      }
    }
    openPullRequests: pullRequests(states: [OPEN]) {
      totalCount
    }
    closedPullRequests: pullRequests(states: [CLOSED]) {
      totalCount
    }
    mergedPullRequests: pullRequests(states: [MERGED]) {
      totalCount
    }
    recentPullRequests: pullRequests(first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
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
      totalCount
      nodes {
        tagName
        name
        publishedAt
        isPrerelease
      }
    }
    defaultBranchRef {
      name
      target {
        ... on Commit {
          history(first: 100) {
            totalCount
            nodes {
              message
              committedDate
              author {
                name
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
  staleIssues: search(query: $staleQuery, type: ISSUE, first: 1) {
    issueCount
  }
}`;

module.exports = { REPO_QUERY };
