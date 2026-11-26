#!/usr/bin/env node
'use strict';

/**
 * Render cards to ./previews without deploying anything.
 *
 *   node scripts/preview.js                      all fixture scenarios, light + dark
 *   node scripts/preview.js --scenario busy      one scenario
 *   node scripts/preview.js --theme dracula      choose theme(s), comma separated or "all"
 *   node scripts/preview.js --live owner/repo    real data (needs GITHUB_TOKEN in .env)
 *   node scripts/preview.js --out ./some/dir     output directory
 */

const fs = require('fs');
const path = require('path');

const { parseOptions } = require('../src/config');
const { buildModel } = require('../src/model');
const { generateRepoSVG } = require('../src/card');
const { SCENARIOS, FIXED_NOW } = require('../test/fixtures');
const THEMES = require('../themes');

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? null : process.argv[i + 1];
}

async function main() {
  const outDir = path.resolve(arg('out') || path.join(__dirname, '..', 'previews'));
  fs.mkdirSync(outDir, { recursive: true });

  const themeArg = arg('theme') || 'light,dark';
  const themes = themeArg === 'all' ? Object.keys(THEMES) : themeArg.split(',');
  const live = arg('live');

  const jobs = [];
  if (live) {
    try {
      require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
    } catch {
      // dotenv is optional
    }
    const [owner, repo] = live.split('/');
    const { fetchRepository } = require('../src/github/client');
    const raw = await fetchRepository(process.env.GITHUB_TOKEN, owner, repo);
    jobs.push({ name: `${owner}-${repo}`, data: buildModel(raw) });
  } else {
    const wanted = arg('scenario');
    const names = wanted ? [wanted] : Object.keys(SCENARIOS);
    for (const name of names) {
      if (!SCENARIOS[name]) throw new Error(`Unknown scenario "${name}". Try: ${Object.keys(SCENARIOS).join(', ')}`);
      jobs.push({ name, data: buildModel(SCENARIOS[name](), FIXED_NOW) });
    }
  }

  const extra = { animations: arg('animations') || 'false' };
  for (const job of jobs) {
    for (const themeName of themes) {
      const { options } = parseOptions({ username: 'x', repo: 'y', theme: themeName, ...extra });
      const svg = generateRepoSVG(job.data, options.theme, options);
      const file = path.join(outDir, `${job.name}.${themeName}.svg`);
      fs.writeFileSync(file, svg);
      console.log(`${file}  (${(svg.length / 1024).toFixed(1)} KB)`);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
