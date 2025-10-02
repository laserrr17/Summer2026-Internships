# Deploying to Vercel with Supabase

Complete guide for deploying your Job Tracker to Vercel with database backend.

---

## Prerequisites

1. ✅ Supabase project created and configured
2. ✅ Database schema deployed (ran `lib/database.sql`)
3. ✅ Vercel account (free tier is fine)
4. ✅ Your Supabase URL and anon key ready

---

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

```bash
cd job-tracker
git add .
git commit -m "Add backend and date tracking"
git push origin main  # or your branch name
```

### 2. Import Project to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository
4. **Root Directory**: Set to `job-tracker` (important!)
5. Click "Deploy" (it will fail initially - that's OK)

**Option B: Via Vercel CLI**
```bash
cd job-tracker
npm i -g vercel  # Install CLI if needed
vercel  # Follow prompts
```

### 3. Add Environment Variables

**Go to your Vercel project dashboard:**

1. Click **Settings** tab
2. Click **Environment Variables** (left sidebar)
3. Add these two variables:

#### Variable 1:
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
Environments: ✓ Production  ✓ Preview  ✓ Development
```

#### Variable 2:
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGc...your-long-key-here
Environments: ✓ Production  ✓ Preview  ✓ Development
```

**Where to find these values:**
- Supabase Dashboard → Settings → API
- Project URL = `NEXT_PUBLIC_SUPABASE_URL`
- anon/public key = `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Redeploy

After adding environment variables:

**Option A: Via Dashboard**
1. Go to **Deployments** tab
2. Click the three dots (...) on latest deployment
3. Click **Redeploy**
4. Check "Use existing Build Cache" (faster)
5. Click "Redeploy"

**Option B: Via CLI**
```bash
vercel --prod
```

**Option C: Push to GitHub**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

### 5. Verify Deployment

1. Visit your deployed URL (e.g., `your-app.vercel.app`)
2. You should see the login/signup page
3. Create an account
4. Start tracking jobs!

---

## Configuration Files

Vercel automatically detects Next.js and uses these settings:

**Build Command:** `npm run build` (automatic)  
**Output Directory:** `.next` (automatic)  
**Install Command:** `npm install` (automatic)  
**Root Directory:** `job-tracker` ⚠️ **Important: Set this!**

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGc...` (long string) |

### Why `NEXT_PUBLIC_`?

Next.js requires the `NEXT_PUBLIC_` prefix for variables that need to be accessible in the browser. These variables are:
- ✅ Safe to expose (anon key has limited permissions)
- ✅ Protected by Row Level Security in Supabase
- ✅ Required for client-side authentication

---

## Troubleshooting

### ❌ "Supabase environment variables not set"

**Solution:**
1. Check that variables are added in Vercel dashboard
2. Verify variable names are EXACTLY: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Make sure you **redeployed** after adding variables
4. Check deployment logs for any errors

### ❌ "Failed to fetch job listings"

**Possible causes:**
1. GitHub API rate limit (wait a bit)
2. Network issue (temporary)
3. README format changed (rare)

**Solution:** Use the refresh button to retry

### ❌ "Authentication failed"

**Check:**
1. Supabase database migration was run (`lib/database.sql`)
2. Email confirmation is disabled (Supabase → Auth → Providers → Email)
3. Password is at least 6 characters
4. Your Supabase project is active (not paused)

### ❌ Build fails with "Module not found"

**Solution:**
```bash
cd job-tracker
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

### ❌ "CORS error" or "Blocked by CORS policy"

**This shouldn't happen, but if it does:**
1. Check your Supabase URL is correct
2. Verify anon key is correct
3. In Supabase: Settings → API → Allowed origins
4. Add your Vercel domain (e.g., `https://your-app.vercel.app`)

---

## Custom Domain (Optional)

### Add Your Own Domain

1. Vercel Dashboard → **Domains**
2. Click "Add"
3. Enter your domain (e.g., `jobs.yourdomain.com`)
4. Follow DNS configuration instructions
5. Wait for DNS to propagate (5-30 minutes)

### Update Supabase (if needed)

If you have email confirmation enabled:
1. Supabase → Authentication → URL Configuration
2. Add your custom domain to "Site URL"
3. Add to "Redirect URLs"

---

## Environment Best Practices

### ✅ Do:
- Use separate Supabase projects for production and development
- Keep your service role key secret (we don't use it in this app)
- Enable Supabase's built-in monitoring
- Set up Vercel's monitoring and analytics

### ❌ Don't:
- Commit `.env.local` to Git (it's in `.gitignore`)
- Share your environment variables publicly
- Use the same database for testing and production
- Disable Row Level Security in production

---

## Updating Environment Variables

### To Update a Variable:

1. Vercel Dashboard → Settings → Environment Variables
2. Find the variable you want to update
3. Click the three dots (...) → **Edit**
4. Update the value
5. Save
6. **Important:** Redeploy for changes to take effect

### To Delete a Variable:

1. Vercel Dashboard → Settings → Environment Variables
2. Find the variable
3. Click the three dots (...) → **Remove**
4. Confirm deletion
5. Redeploy if needed

---

## CLI Quick Reference

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME

# Pull environment variables to local .env
vercel env pull

# View deployment logs
vercel logs

# View project info
vercel inspect
```

---

## Multiple Environments

You can have different values for different environments:

| Environment | When Used |
|-------------|-----------|
| **Production** | Your main site (e.g., `your-app.vercel.app`) |
| **Preview** | Pull request previews |
| **Development** | Local development with `vercel dev` |

**Example setup:**
- Production → Production Supabase project
- Preview/Development → Development Supabase project

---

## Performance Tips

### Enable Vercel Analytics (Free)

1. Vercel Dashboard → Analytics
2. Click "Enable"
3. Monitor page loads, Core Web Vitals

### Enable Edge Caching

The API route already has caching:
```typescript
// In app/api/jobs/route.ts
next: { revalidate: 3600 } // Cache for 1 hour
```

### Monitor Supabase Usage

1. Supabase Dashboard → Settings → Usage
2. Watch your API requests
3. Free tier: 500MB database, 2GB bandwidth

---

## Cost Breakdown

### Free Tier (Plenty for Personal Use)

**Vercel:**
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN

**Supabase:**
- ✅ 500MB database storage
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Automatic backups (limited)

**Total Cost:** $0 🎉

### When You Might Need to Upgrade

- Heavy usage (thousands of users)
- Need more than 500MB database
- Want point-in-time recovery backups
- Need dedicated support

---

## Security Checklist

Before going live:

- ✅ Row Level Security enabled on all tables
- ✅ Environment variables set correctly
- ✅ Email confirmation configured (optional but recommended)
- ✅ Supabase project not in paused state
- ✅ Strong password for your admin account
- ✅ `.env.local` in `.gitignore`
- ✅ No service role keys in frontend code

---

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **This Project**: [SETUP.md](./SETUP.md), [README.md](./README.md)

---

## Quick Deploy Checklist

- [ ] Supabase project created
- [ ] Database migration run (`lib/database.sql`)
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Root directory set to `job-tracker`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] Redeployed after adding env vars
- [ ] Tested login/signup
- [ ] Tested job tracking
- [ ] Verified dates are showing

---

**You're all set! Your job tracker is now live on Vercel!** 🚀

