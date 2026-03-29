# Git Push Instructions - Fix Permission Error

## Problem
You're authenticated as `Raahul-bale` but trying to push to `impactvisuals2106-boop/website-v0`.

## Solution Options

### Option 1: Use Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: "Website Deployment"
   - Select scope: `repo` (Full control of private repositories)
   - Click "Generate token"
   - **COPY THE TOKEN** (you won't see it again!)

2. **Update the remote URL with token:**
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/impactvisuals2106-boop/website-v0.git
   ```
   Replace `YOUR_TOKEN` with the token you just created.

3. **Push:**
   ```bash
   git push -u origin main
   ```

### Option 2: Use GitHub Desktop or GitHub CLI

If you have GitHub Desktop installed:
1. Open GitHub Desktop
2. Add the repository
3. Push from there (it will handle authentication)

Or use GitHub CLI:
```bash
gh auth login
git push -u origin main
```

### Option 3: Change Remote to Your Account

If you want to push to your own account instead:

```bash
# Change remote to your account
git remote set-url origin https://github.com/Raahul-bale/website-v0.git

# Create the repository on GitHub first, then push
git push -u origin main
```

### Option 4: Use SSH (If you have SSH keys set up)

```bash
# Change to SSH URL
git remote set-url origin git@github.com:impactvisuals2106-boop/website-v0.git

# Push
git push -u origin main
```

## Quick Fix Command

Run this in your terminal (replace YOUR_TOKEN with your Personal Access Token):

```bash
cd "C:\Users\raahu\Downloads\iv Website"
git remote set-url origin https://YOUR_TOKEN@github.com/impactvisuals2106-boop/website-v0.git
git push -u origin main
```

## Verify Repository Exists

Make sure the repository exists on GitHub:
- Go to: https://github.com/impactvisuals2106-boop/website-v0
- If it doesn't exist, create it first on GitHub




