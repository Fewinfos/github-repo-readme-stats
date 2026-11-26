## 🙌 Contribution Guide

We welcome community contributions!

1. **Fork** this repository
2. **Clone** it locally
   ```bash
   git clone https://github.com/fewinfos/github-repo-readme-stats.git
   ```
3. **Create a feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature
   ```
4. Make changes, **run the tests** and **commit**
   ```bash
   npm test
   git commit -m "Add: new feature"
   git push origin feature/your-feature
   ```
5. **Open a Pull Request targeting develop branch**

---

**How to run locally in your system**

You do not need a Vercel account.

1. Install Node.js 18 or newer
2. Optional but recommended: `cd api && npm install` (installs `dotenv` so `.env` is loaded)
3. Create a `.env` file in the project root with a GitHub token (no scopes needed for public repos):
   ```
   GITHUB_TOKEN=ghp_yourtoken
   ```
4. Start the local server
   ```bash
   npm run dev              # real GitHub data
   npm run dev -- --mock    # built-in sample data, no token required
   ```
   Then open http://localhost:3000

**Useful commands**

| Command | What it does |
|---------|--------------|
| `npm test` | Runs the unit and handler tests (no network or token needed). |
| `npm run preview` | Renders sample cards for every fixture scenario to `./previews` (light + dark). |
| `npm run preview:all` | Same, in every theme. |
| `node scripts/preview.js --live owner/repo` | Renders a real repository to `./previews`. |
| `node scripts/sync-landing-themes.js` | Copies theme swatches into the landing page after you add a theme. |

**Guidelines**

- Keep calculation (`calculation.js`) and rendering (`svg.js`) separate; calculations must stay pure so they can be tested.
- Anything that ends up inside the SVG must go through `escapeXml`, and user supplied colors through `normalizeColor`.
- Add a fixture scenario in `test/fixtures.js` when you add a state the card can be in, and look at the result with `npm run preview`.

## 📜 License

This project is licensed under the **MIT License**.  
Feel free to use, modify, and distribute it with attribution.


## 💬 Contact

**Maintainer:** FEWINFOS 
**GitHub:** https://github.com/Fewinfos/  
**Email:** fewinfos@gmail.com

