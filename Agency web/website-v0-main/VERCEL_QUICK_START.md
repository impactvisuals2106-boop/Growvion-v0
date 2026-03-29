# Vercel Deployment - Quick Start Guide

Your project is now ready to deploy on Vercel! Follow these steps:

## 🚀 Quick Deployment Steps

### Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (or create an account)
2. Click **"Add New Project"**
3. Import your GitHub repository: `impactvisuals2106-boop/website-v0`
4. Vercel will auto-detect Next.js - click **"Deploy"**

### Step 2: Configure Environment Variables

**CRITICAL**: Add these environment variables in Vercel before deployment completes!

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add each variable below (click "Add" for each one):

#### Required Variables:

```
NEXT_PUBLIC_SUPABASE_URL
```
- Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- Environments: ✅ Production, ✅ Preview, ✅ Development

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- Value: Your Supabase anon/public key (starts with `eyJ...`)
- Environments: ✅ Production, ✅ Preview, ✅ Development

```
EMAIL_USER
```
- Value: `impactvisuals2106@gmail.com`
- Environments: ✅ Production, ✅ Preview, ✅ Development

```
EMAIL_PASSWORD
```
- Value: Your Gmail App Password (16 characters, no spaces)
- Environments: ✅ Production, ✅ Preview, ✅ Development

### Step 3: Redeploy

After adding all environment variables:

1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **"Redeploy"**

Or simply push a new commit to trigger automatic deployment.

## ✅ Pre-Deployment Checklist

- [x] `vercel.json` configured
- [x] `next.config.js` optimized for Vercel
- [x] `.gitignore` excludes sensitive files
- [x] Code pushed to GitHub
- [ ] Environment variables added in Vercel dashboard
- [ ] Supabase database table created (`leads` table)
- [ ] Gmail App Password generated

## 🔍 How to Get Your Values

### Supabase Credentials:
1. Go to [supabase.com](https://supabase.com) → Your Project
2. Settings → API
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Gmail App Password:
1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Ensure 2-Step Verification is enabled
3. Generate new App Password for "Mail"
4. Copy the 16-character password → `EMAIL_PASSWORD`

## 🧪 Testing After Deployment

1. Visit your deployed URL: `https://your-project.vercel.app`
2. Test contact form submission
3. Check email inbox for form submissions
4. Visit admin dashboard: `https://your-project.vercel.app/admin`
5. Verify leads appear in Supabase dashboard

## 📝 Important Notes

- **Environment Variables**: Must be added in Vercel dashboard (not in code)
- **Redeploy Required**: After adding env vars, redeploy the app
- **Supabase RLS**: If Row Level Security is enabled, configure policies
- **Email**: Uses Gmail SMTP - ensure App Password is correct

## 🔄 Continuous Deployment

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches (for testing)

## 🆘 Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Ensure Node.js version is compatible (Vercel uses Node 18.x)

### Environment Variables Not Working
- Verify variables are added for all environments
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Email Not Sending
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Check Gmail App Password is valid (16 characters)
- Review Vercel function logs for errors

### Supabase Connection Issues
- Verify Supabase URL and anon key are correct
- Check Supabase dashboard for project status
- Ensure `leads` table exists in Supabase

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Your project is ready! Just add the environment variables and deploy! 🎉**



