#!/usr/bin/env node
'use strict';

/**
 * Copies the theme swatches (background, title, text, accent) from themes/index.js into the
 * landing page, so the picker always matches the API. Run after adding or editing a theme:
 *
 *   node scripts/sync-landing-themes.js
 */

const fs = require('fs');
const path = require('path');
const { resolveTheme } = require('../src/theme');
const THEMES = require('../themes');

const file = path.join(__dirname, '..', 'public', 'index.html');
const swatches = {};
for (const name of Object.keys(THEMES)) {
  const t = resolveTheme(name);
  swatches[name] = [t.bg, t.title, t.text, t.accent];
}

const html = fs.readFileSync(file, 'utf8');
const pattern = /(var THEMES = )(?:\/\*THEMES\*\/)?\{[^;]*\};/;
if (!pattern.test(html)) throw new Error('Could not find the THEMES declaration in public/index.html');

const lines = Object.entries(swatches).map(([name, colors]) => `        ${JSON.stringify(name)}: ${JSON.stringify(colors).replace(/,/g, ', ')}`);
const json = ['{', lines.join(',\n'), '      }'].join('\n');
fs.writeFileSync(file, html.replace(pattern, `$1${json};`));
console.log(`Synced ${Object.keys(swatches).length} themes into public/index.html`);
