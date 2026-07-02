# The Wandering Lens — Claude Code Handover Package

## What's in this package
```
CLAUDE.md              ← Agent brain. Copy to repo root.
.github/workflows/     ← CI/CD pipeline. Copy to repo.
issues/all-issues.md   ← 10 GitHub Issues. Paste one by one.
```

## Setup in 6 steps

### Step 1 — Create GitHub repo
```bash
gh repo create wandering-lens --public
cd wandering-lens
git init
```

### Step 2 — Copy this package into the repo
Copy CLAUDE.md and .github/ folder into your repo root.
```bash
git add .
git commit -m "chore: add CLAUDE.md and CI/CD pipeline"
git push origin main
```

### Step 3 — Enable GitHub Pages
Go to: Settings → Pages → Source → GitHub Actions
(Not gh-pages branch — use the Actions deploy workflow)

### Step 4 — Add your Anthropic API key
Go to: Settings → Secrets → Actions → New secret
Name: `ANTHROPIC_API_KEY`
Value: your API key from console.anthropic.com

### Step 5 — Install Claude Code GitHub App
In your terminal (with Claude Code installed):
```bash
claude
/install-github-app
```
Follow the prompts. This lets Claude respond to @claude mentions.

### Step 6 — Start posting issues
Open issues/all-issues.md.
Paste Issue 1 into GitHub Issues.
Assign it to @claude.
The agent picks it up, builds Phase 1, opens a PR.
You review, merge. Then post Issue 2. Repeat.

## The pipeline flow
```
You post Issue → @claude assigned
       ↓
Claude Code agent reads CLAUDE.md
       ↓
Agent writes code, runs npm run build
       ↓
Agent opens Pull Request
       ↓
You review and merge
       ↓
GitHub Actions auto-deploys to GitHub Pages
       ↓
Live URL: https://[your-username].github.io/wandering-lens
```

## Cost estimate
Each phase runs approximately 30–50 Claude Code turns.
At Sonnet 4.6 pricing: roughly $2–5 per phase.
All 10 phases: approximately $30–40 total API cost.
Consider Claude Max subscription if you expect heavy iteration.

## If the agent gets stuck
Comment on the PR:
`@claude the build is failing because [paste error]. Fix it.`
The agent re-reads the error and tries again.

## Questions
Refer to: https://docs.anthropic.com/en/docs/claude-code/github-actions
