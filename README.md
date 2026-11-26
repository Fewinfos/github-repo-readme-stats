<!-- Banner Image -->

[![Banner Image](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats)](https://github.com/fewinfos)


# GitHub Repository Stats Widget

A serverless service that turns **live GitHub repository data** into one crisp, themeable SVG card you can drop into any README, portfolio or dashboard — stars, forks, languages, a GitHub-style **contribution calendar**, health analytics, a **rank** and your current **streak**.

- 🧾 **Looks like GitHub** — avatar, `owner / repo`, status pills (visibility, health, license, latest release, branch), topics, stat tiles, language bar.
- 📅 **Contribution calendar** — a full year of commits, pull requests and issues, with month labels, tooltips and a Less → More legend.
- 🔥 **Streaks** — current and longest streak with their date ranges, plus active days.
- ❤️ **Health analytics** — merge rate, close rate, median time to merge, commit quality, bus factor, release cadence, stale issues and more.
- ⭐ **Rank (S–D)** — one weighted score with a category breakdown.
- 🎨 **15 themes**, custom colors, section toggles, optional animations, `prefers-reduced-motion` aware.
- 🧩 **JSON endpoint** (`format=json`) for your own dashboards.
- 🔒 **Safe by default** — strict input validation, escaped output, private repositories never exposed.

> Try it and build your snippet interactively on the landing page of your deployment (the home page is a live generator).

---

## Quick start

```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO)
```

Make the card follow the reader's light / dark preference:

```html
<picture>
  <source media="(prefers-color-scheme: dark)"  srcset="https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=dark">
  <source media="(prefers-color-scheme: light)" srcset="https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=light">
  <img alt="Repository stats" src="https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO">
</picture>
```

---

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `username` | **Required.** Owner of the repository (user or organization). | – |
| `repo` | **Required.** Repository name. | – |
| `theme` | One of the [themes](#themes) below. | `light` |
| `hide` | Comma separated sections to hide: `description`, `topics`, `stats`, `languages`, `metrics`, `rank`, `calendar`, `activity`, `streak`, `footer`. | none |
| `bg_color` `title_color` `text_color` `border_color` `icon_color` `accent_color` | Override theme colors. Hex **without** `#`, 3 or 6 digits. `accent_color` drives the calendar. | theme |
| `hide_border` | `true` removes the card border. | `false` |
| `border_radius` | Corner radius, `0`–`32`. | `16` |
| `animations` | `false` disables entrance animations. | `true` |
| `cache_seconds` | Browser/CDN cache time, clamped to `900`–`86400`. | `1800` |
| `format` | `json` returns the computed statistics instead of an image. | `svg` |

**Examples**

```markdown
<!-- Compact card: no calendar, activity chart or footer -->
![Stats](https://github-repo-readme-stats.vercel.app/api/?username=facebook&repo=react&theme=tokyonight&hide=calendar,activity,footer)

<!-- Your own colors -->
![Stats](https://github-repo-readme-stats.vercel.app/api/?username=facebook&repo=react&bg_color=0d1117&title_color=fee715&accent_color=fee715&border_radius=8)
```

---

## What the card shows

| Section | Details |
|---------|---------|
| **Header** | Avatar, owner, repository name, *Public/Private*, health (*Active* ≤ 30 days since the last push, *Quiet* ≤ 180, *Dormant* beyond, or *Archived*), fork origin, license, latest release, default branch, last push time. |
| **Stat tiles** | Stars, forks, watchers, open issues, open pull requests, commits, contributors. |
| **Languages** | Stacked bar and legend using GitHub's own language colors. |
| **Health & analytics** | See the table below. |
| **Rank** | Score ring, tier letter and the *Popularity / Activity / Community* breakdown. |
| **Contribution calendar** | 52 weeks of daily activity (commits + PRs opened + issues opened, UTC). |
| **30-day chart** | Smooth activity curve with integer axis, peak and today marker. |
| **Streak** | Current streak, longest streak (with dates) and active days of the last year. |

### How the metrics are measured

| Metric | Definition |
|--------|------------|
| **PR merge rate** | `merged / (merged + closed without merge)`. Open PRs are still pending, so they do not count against you. |
| **Issue close rate** | `closed / all issues`. |
| **Median time to merge** | Median of *created → merged* for the 100 most recent PRs (the median ignores one-off outliers). |
| **Commit quality** | Share of the latest 100 commits whose headline is 12–100 characters and is not a throwaway like `wip`, `fix` or `update`. |
| **Commits · 30 days** | Exact count from GitHub's commit statistics. |
| **Active contributors** | Authors with a commit in the last 90 days (from the latest 100 commits) / all contributors. |
| **Bus factor** | Fewest contributors that account for **50%** of all commits. Risk is *high* if one person wrote more than 70%, *medium* if one person alone accounts for half or more, otherwise *low*. |
| **Release cadence** | Average gap between the five most recent releases. |
| **Growth trend** | Stars per day of repository life: `> 1` High Growth, `> 0.1` Growing, otherwise Stable. |
| **Stale issues** | Open issues with **no activity for 90+ days** (exact count via GitHub search). |
| **Discussion / item** | Average comments per recent issue or pull request. |

### Calendar data and accuracy

Commit counts come from GitHub's *weekly commit statistics*. GitHub computes these lazily: for a repository that has not been requested for a while, the first request can answer "still computing". In that case the card falls back to the latest 100 commits and says so under the calendar (*"Based on the latest commits since …"*). Such a card is cached for only 5 minutes (instead of 30), so exact numbers replace it soon after GitHub has finished computing them.

---

## ⭐ Repository Ranking System

The rank evaluates a repository across three weighted categories and assigns a score out of 100 and a tier.

#### 📊 Popularity (30%)
- **Stars** (15%) — logarithmic scale, community interest
- **Forks** (8%) — reuse and adoption
- **Watchers** (7%) — active monitoring

#### 🔥 Activity (30%)
- **Commit activity** (12%) — commits in the last 30 days (`≥ 30` high, `≥ 10` medium, `> 0` low)
- **Release cadence** (8%) — how regularly releases ship
- **Recent updates** (10%) — how recently code was pushed

#### 💚 Community health (40%)
- **PR merge rate** (10%)
- **Issue close rate** (10%)
- **Contributor diversity** (8%) — people who committed recently (1 → 15 pts, 5 or more → full marks). A project kept alive by one person is rewarded for being active, not for being diverse.
- **Discussion activity** (7%) — average comments per issue/PR (5+ = full marks)
- **Code quality** (5%) — commit message quality

### Tiers

| Tier | Score | Color | Meaning |
|------|-------|-------|---------|
| **S** | 90–100 | 🟡 Gold | Exceptional |
| **A** | 75–89 | 🟢 Green | Excellent |
| **B** | 60–74 | 🔵 Blue | Good |
| **C** | 45–59 | 🟠 Orange | Fair |
| **D** | 0–44 | 🔴 Red | Needs attention |

---

## Themes

15 built-in themes: `light`, `dark`, `dimmed`, `solarizedlight`, `dracula`, `nord`, `monokai`, `gruvbox`, `solarized`, `tokyonight`, `catppuccin`, `ocean`, `radical`, `rosepine`, `forest`.

Add `&theme=NAME` to the URL:

```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=facebook&repo=react&theme=dracula)
```

**Light**

![Light Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=light)

**Dark**

![Dark Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=dark)

**Dracula**

![Dracula Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=dracula)

**Tokyo Night**

![Tokyo Night Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=tokyonight)

**Catppuccin**

![Catppuccin Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=catppuccin)

> Want a theme of your own? Add an entry to [`themes/index.js`](themes/index.js) (copy any existing one), run `node scripts/sync-landing-themes.js`, and open a pull request.

---

## JSON API

`format=json` returns everything the card is drawn from — handy for dashboards:

```bash
curl "https://github-repo-readme-stats.vercel.app/api/?username=facebook&repo=react&format=json"
```

The response contains `stats`, `languages`, `analytics`, `rank`, `streak` and the daily `calendar.days` series (`{ date, count, commits, prs, issues }`). It is served with `Access-Control-Allow-Origin: *`.

---

## Self-hosting

1. Fork the repository and import it into [Vercel](https://vercel.com).
2. Add the environment variable **`GITHUB_TOKEN`** — a [personal access token](https://github.com/settings/tokens) **with no scopes** is enough for public repositories.
3. Deploy.

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | **Required.** Used for the GraphQL and REST API calls. |
| `ALLOW_PRIVATE_REPOS` | Set to `true` to let the card render private repositories the token can see. **Off by default**, so a token with wider access never leaks private data through a public URL. |

### Run it locally

```bash
git clone https://github.com/fewinfos/github-repo-readme-stats.git
cd github-repo-readme-stats
cd api && npm install && cd ..       # installs dotenv (optional)
echo GITHUB_TOKEN=ghp_yourtoken > .env

npm run dev                          # http://localhost:3000  (real data)
npm run dev -- --mock                # same, but with built-in sample data and no token
npm run preview                      # render sample cards to ./previews (light + dark)
npm run preview:all                  # ...in every theme
node scripts/preview.js --live facebook/react   # render a real repository to ./previews
npm test                             # unit + handler tests, no network needed
```

No Vercel account is needed for any of this (`vercel dev` still works if you prefer it).

### Project layout

```
api/index.js          request handler: validate -> fetch -> model -> render
src/config.js         query parameter parsing and validation
src/theme.js          theme resolution, custom colors, derived tokens
src/github/           GraphQL query + REST calls, timeouts, caching, typed errors
src/model.js          raw GitHub data -> everything the renderers need (pure)
src/analytics|rank|streak|calendar|graph/
                      calculation.js (pure maths) and svg.js (rendering) for each feature
src/header|stats|languages/   remaining SVG sections
src/card/             layout of the whole card and the error card
themes/index.js       theme palettes
test/                 fixtures and tests
public/index.html     landing page / live generator
```

### Notes on caching and limits

- Responses are cached for 30 minutes (`s-maxage` + `stale-while-revalidate`); raise it with `cache_seconds` if you embed a lot of cards.
- Each card costs **one GraphQL point** plus a handful of small REST calls (contributors, commit statistics); warm instances also keep an in-memory cache for 10 minutes.
- The owner's avatar is embedded in the SVG because GitHub's image proxy blocks external images inside SVGs.
- All dates are UTC.

---

## 🙌 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and pull requests are welcome!

## 📜 License

[MIT](LICENSE)
