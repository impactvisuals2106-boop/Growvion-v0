# Vercel Deployment Guide

This guide will help you deploy your Impact Visuals website to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Supabase project set up (already done)
4. Gmail App Password configured (already done)

## Step 1: Push Code to Git Repository

If you haven't already, initialize a Git repository and push to GitHub/GitLab/Bitbucket:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Impact Visuals website"

# Add your remote repository
git remote add origin https://github.com/yourusername/impact-visuals.git

# Push to repository
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect Next.js
5. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

**CRITICAL**: You must add environment variables in Vercel dashboard!

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add the following variables:

### Required Environment Variables:

```
EMAIL_USER=impactvisuals2106@gmail.com
EMAIL_PASSWORD=your-gmail-app-password-here
NEXT_PUBLIC_SUPABASE_URL=https://adfukbefpealopyxidal.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### How to Add:

1. Click **"Add New"**
2. Enter the **Name** (e.g., `EMAIL_USER`)
3. Enter the **Value** (e.g., `impactvisuals2106@gmail.com`)
4. Select environments: **Production**, **Preview**, and **Development**
5. Click **"Save"**
6. Repeat for all 4 variables

### Important Notes:

- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for Supabase anon key)
- `EMAIL_PASSWORD` should be kept secret (not exposed to browser)
- After adding variables, **redeploy** your application

## Step 4: Redeploy After Adding Environment Variables

1. Go to **Deployments** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger automatic deployment

## Step 5: Verify Deployment

1. Visit your deployed URL (e.g., `https://your-project.vercel.app`)
2. Test the contact form
3. Check admin dashboard at `https://your-project.vercel.app/admin`
4. Verify emails are being sent
5. Check Supabase dashboard to confirm data is being saved

## Step 6: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically configure SSL

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)

### Environment Variables Not Working

- Make sure variables are added for all environments (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### 404 Errors

- Ensure `next.config.js` is correct
- Check that all routes are properly set up
- Verify build completed successfully

### Email Not Sending

- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set correctly
- Check Gmail App Password is valid
- Look at Vercel function logs for errors

### Supabase Connection Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase dashboard for any restrictions
- Ensure the `leads` table exists in Supabase

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Site loads correctly
- [ ] Contact form submits successfully
- [ ] Emails are being sent
- [ ] Data is saved to Supabase
- [ ] Admin dashboard accessible
- [ ] Admin dashboard shows leads from Supabase
- [ ] Custom domain configured (if applicable)

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- Every push to `main` → Production deployment
- Every push to other branches → Preview deployment

## Useful Vercel Features

- **Analytics**: Enable in project settings
- **Speed Insights**: Monitor performance
- **Logs**: View serverless function logs
- **Preview Deployments**: Test changes before production

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Check deployment logs in Vercel dashboard for specific errors




