<div align="center">

# 📊 GitHub Repository Stats Widget

### Showcase your GitHub repository stats with beautiful, customizable SVG widgets

[![License](https://img.shields.io/github/license/fewinfos/readme-activity-calender)](LICENSE)
[![Issues](https://img.shields.io/github/issues/fewinfos/readme-activity-calender)](https://github.com/fewinfos/readme-activity-calender/issues)
[![Stars](https://img.shields.io/github/stars/fewinfos/readme-activity-calender)](https://github.com/fewinfos/readme-activity-calender/stargazers)

**Generate dynamic, real-time GitHub repository statistics and activity visualizations for your README files**

[Features](#-features) • [Quick Start](#-quick-start) • [Themes](#-themes) • [Customization](#%EF%B8%8F-customization) • [Contributing](#-contributing)

---

![Demo](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=dark)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Widget Types](#-widget-types)
  - [Repository Ranking](#-repository-ranking-system)
  - [Analytics](#-analytics-widget)
  - [Activity Graph](#-activity-graph)
  - [Streak Statistics](#-streak-statistics)
- [Themes](#-themes)
- [Customization](#%EF%B8%8F-customization)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **🏆 Repository Ranking System** - Intelligent scoring algorithm that evaluates your repo across popularity, activity, and community health
- **📈 Analytics Dashboard** - Comprehensive statistics including stars, forks, issues, PRs, and more
- **📊 Activity Graph** - Visual representation of repository commit activity over time
- **🔥 Streak Statistics** - Track contribution streaks and consistency
- **🎨 10+ Beautiful Themes** - Dark, light, dracula, nord, monokai, gruvbox, and more
- **⚡ Real-time Data** - Fetches live data directly from GitHub's API
- **🔧 Highly Customizable** - Control colors, themes, and display options
- **🚀 Easy Integration** - Just copy and paste Markdown into your README
- **📱 Responsive SVG** - Looks great on any device or platform

---

## 🚀 Quick Start

Add any of these widgets to your README by copying the Markdown snippet and replacing `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repository name.

### Basic Usage

```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO)
```

### With Theme

```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=dark)
```

### Live Example

```markdown
![Stats](https://github-repo-readme-stats.vercel.app/api/?username=facebook&repo=react&theme=dracula)
```

![Stats Example](https://github-repo-readme-stats.vercel.app/api/?username=facebook&repo=react&theme=dracula)

---

## 📊 Widget Types

This tool offers four different types of widgets to showcase different aspects of your repository.

### 🏆 Repository Ranking System

The widget now includes an **intelligent ranking system** that evaluates repositories based on multiple weighted metrics and assigns a letter grade (S, A, B, C, D) with a numerical score.

### How Ranking Works

The ranking algorithm analyzes your repository across three main categories:

#### 📊 **Popularity Metrics (30%)**
- **Stars** (15%): Logarithmic scale - measures community interest
- **Forks** (8%): Indicates code reusability and adoption
- **Watchers** (7%): Shows active monitoring and engagement

#### 🔥 **Activity Metrics (30%)**
- **Commit Activity** (12%): Recent development momentum (high/medium/low)
- **Release Cadence** (8%): Frequency and regularity of releases
- **Recent Updates** (10%): How recently the repository was updated

#### 💚 **Community Health (40%)**
- **PR Merge Rate** (10%): Percentage of pull requests successfully merged
- **Issue Close Rate** (10%): Efficiency in resolving issues
- **Contributor Diversity** (8%): Active vs total contributors ratio
- **Discussion Activity** (7%): Average comments per issue/PR
- **Code Quality** (5%): Commit message quality score

### Ranking Tiers

| Tier | Score Range | Badge Color | Description |
|------|-------------|-------------|-------------|
| **S** | 90-100 | 🟡 Gold | Exceptional - Top-tier project with outstanding metrics |
| **A** | 75-89 | 🟢 Green | Excellent - Highly active and well-maintained |
| **B** | 60-74 | 🔵 Blue | Good - Solid project with healthy metrics |
| **C** | 45-59 | 🟠 Orange | Fair - Room for improvement in some areas |
| **D** | 0-44 | 🔴 Red | Needs Attention - Multiple areas need improvement |

The ranking badge appears automatically in the widget header, showing both the tier letter and numerical score.

**Usage:**
```markdown
![Ranking](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&type=rank)
```

---

### 📈 Analytics Widget

Get a comprehensive overview of your repository's key statistics including stars, forks, issues, pull requests, watchers, and language distribution.

**Features:**
- Total stars, forks, and watchers count
- Open and closed issues/PRs
- Primary programming language
- Repository size and creation date
- License information
- Last update timestamp

**Usage:**
```markdown
![Analytics](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&type=analytics)
```

---

### 📊 Activity Graph

Visualize your repository's commit activity over time with an interactive graph showing contribution patterns and trends.

**Features:**
- Commit frequency visualization
- Time-based activity patterns
- Contribution trends
- Daily/weekly activity breakdown

**Usage:**
```markdown
![Activity](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&type=graph)
```

---

### 🔥 Streak Statistics

Track and display your repository's contribution streaks, including current streak, longest streak, and total contributions.

**Features:**
- Current active streak
- Longest streak record
- Total contribution count
- Streak consistency metrics

**Usage:**
```markdown
![Streak](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&type=streak)
```

---

---

## 🎨 Themes

Customize your widget with **10 beautiful built-in themes**! Each theme provides carefully selected colors for optimal readability and aesthetics.

### Available Themes

#### Light Theme
The classic GitHub light theme with clean whites and subtle grays.

**Copy to use:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=light)
```

![Light Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=light)

---

#### Dark Theme
GitHub's modern dark theme with deep blues and bright accents.

**Copy to use:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=dark)
```

![Dark Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=dark)

---

#### Dracula Theme
The popular Dracula color scheme with purple and cyan accents.

**Copy to use:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=dracula)
```

![Dracula Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=dracula)

---

#### Nord Theme
Arctic, north-bluish color palette with soft pastels.

**Copy to use:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=nord)
```

![Nord Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=nord)

---

#### Monokai Theme
Vibrant and warm colors inspired by the classic Monokai editor theme.

**Copy to use:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=monokai)
```

![Monokai Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=monokai)

---

#### Gruvbox Theme
Retro groove color scheme with earthy tones.

**Copy to use:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=gruvbox)
```

![Gruvbox Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=gruvbox)

---

#### Solarized Theme
Precision colors for optimal readability in dark environments.

**Copy to use:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=solarized)
```

![Solarized Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=solarized)

---

#### Tokyo Night Theme
A clean, dark theme inspired by Tokyo's night skyline.

**Copy to use:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=tokyonight)
```

![Tokyo Night Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=tokyonight)

---

#### Catppuccin Theme
Soothing pastel theme for the cozy feeling.

**Copy to use:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=catppuccin)
```

![Catppuccin Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=catppuccin)

---

#### Ocean Theme
Deep ocean blues with cyan highlights.

**Copy to use:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=ocean)
```

![Ocean Theme](https://github-repo-readme-stats.vercel.app/api/?username=fewinfos&repo=github-repo-readme-stats&theme=ocean)

---

### How to Use Themes

Simply add the `theme` parameter to your widget URL:

```markdown
![Repository Stats](https://your-deployment-url.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=THEME_NAME)
```

**Example:**
```markdown
![Repository Stats](https://github-repo-readme-stats.vercel.app/api/?username=facebook&repo=react&theme=dracula)
```

---

## ⚙️ Customization

### Available Parameters

Customize your widget by adding URL parameters:

| Parameter | Description | Default | Options |
|-----------|-------------|---------|---------|
| `username` | GitHub username | **Required** | Any valid username |
| `repo` | Repository name | **Required** | Any valid repo name |
| `theme` | Color theme | `light` | `light`, `dark`, `dracula`, `nord`, `monokai`, `gruvbox`, `solarized`, `tokyonight`, `catppuccin`, `ocean` |
| `type` | Widget type | `rank` | `rank`, `analytics`, `graph`, `streak` |

### Advanced Customization Examples

#### Combining Parameters
```markdown
![Custom Stats](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&theme=tokyonight&type=analytics)
```

#### Multiple Widgets
You can stack multiple widget types to show comprehensive repository information:

```markdown
<!-- Ranking -->
![Rank](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&type=rank&theme=dark)

<!-- Analytics -->
![Analytics](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&type=analytics&theme=dark)

<!-- Activity Graph -->
![Activity](https://github-repo-readme-stats.vercel.app/api/?username=YOUR_USERNAME&repo=YOUR_REPO&type=graph&theme=dark)
```

---

## 🚀 Deployment

### Deploy Your Own Instance

#### Prerequisites
- Node.js 14 or higher
- A GitHub Personal Access Token
- Vercel account (for deployment)

#### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/fewinfos/readme-activity-calender.git
   cd readme-activity-calender
   ```

2. **Install dependencies**
   ```bash
   cd api
   npm install
   ```

3. **Create environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   ```

4. **Test locally**
   ```bash
   vercel dev
   ```

5. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

6. **Add environment variables to Vercel**
   
   In your Vercel dashboard, add your `GITHUB_TOKEN` to the environment variables.

### Getting a GitHub Token

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes: `public_repo`, `read:user`
4. Copy the token and add it to your environment variables

---

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Areas for Contribution

- **New themes** - Add more color schemes
- **Widget types** - Create new visualization types
- **Optimizations** - Improve performance and caching
- **Documentation** - Enhance guides and examples
- **Bug fixes** - Help resolve issues

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Thanks to all contributors who have helped improve this project
- Inspired by various GitHub stats projects in the open-source community
- Built with ❤️ for the developer community

---

## 📬 Support

If you encounter any issues or have questions:

- [Open an issue](https://github.com/fewinfos/readme-activity-calender/issues)
- Check existing issues for solutions
- Review the documentation above

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star! ⭐**

Made with ❤️ by [fewinfos](https://github.com/fewinfos)

</div>