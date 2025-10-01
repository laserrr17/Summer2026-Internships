# Deploying to Vercel

This guide will help you deploy your Summer 2026 Internship Tracker to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free)
- Git repository (optional but recommended)

## Method 1: Deploy with Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to your project:
```bash
cd /Users/chengyuhao/Developer/Summer2026-Internships/job-tracker
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Login to your Vercel account
   - Select or create a project
   - Accept the default settings

5. Your app will be deployed! You'll get a URL like: `https://your-app.vercel.app`

## Method 2: Deploy via Vercel Dashboard

1. Push your code to GitHub:
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub and push
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New Project"

4. Import your GitHub repository

5. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `job-tracker` (if deploying from parent folder)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

6. Click "Deploy"

## Environment Variables

This app doesn't require any environment variables! Everything runs client-side with localStorage.

## Post-Deployment

After deployment:

1. Visit your deployed URL
2. Set up your password (first time only)
3. Your data is stored in your browser's localStorage
4. The app will automatically fetch the latest jobs from GitHub

## Automatic Updates

- **Job Listings**: The app fetches fresh data from GitHub on every page load and when you click refresh
- **Code Updates**: 
  - With Vercel CLI: Run `vercel --prod` to deploy updates
  - With GitHub: Push to your main branch for automatic deployment

## Custom Domain (Optional)

1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Issue: Jobs not loading
- Check the browser console for errors
- Verify GitHub API is accessible
- Try clearing browser cache

### Issue: Password not working
- Your password is stored in browser localStorage
- Each browser/device has its own password
- Reset using browser console if needed

### Issue: Build fails
- Ensure all dependencies are in `package.json`
- Check Vercel build logs for specific errors
- Run `npm run build` locally to test

## Performance

The app includes:
- API route caching (1 hour)
- Next.js optimizations
- Vercel Edge Network for fast global access

## Support

For issues:
1. Check the browser console for errors
2. Review Vercel deployment logs
3. Ensure you're using the latest Next.js version

Enjoy your deployed job tracker! 🚀

