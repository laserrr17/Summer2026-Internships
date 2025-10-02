# Vercel Environment Variables Setup

## Required Environment Variables

To deploy this application to Vercel, you **must** add the following environment variables in your Vercel project settings.

### Steps to Add Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Required Variables

| Variable Name | Description | Where to Find |
|--------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | [Supabase Dashboard](https://app.supabase.com) → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | [Supabase Dashboard](https://app.supabase.com) → Project Settings → API |

### Optional Variables

| Variable Name | Description | Where to Find |
|--------------|-------------|---------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for server operations | [Supabase Dashboard](https://app.supabase.com) → Project Settings → API (use with caution) |

## Important Notes

⚠️ **Without these environment variables, the build will succeed but the app will not function properly.**

The app is designed to:
- ✅ Build successfully even without env vars (prevents deployment failures)
- ❌ Show authentication errors at runtime if env vars are missing
- ✅ Work normally once env vars are properly configured

## Environment Scopes

Make sure to add environment variables to **all environments**:
- ✅ Production
- ✅ Preview
- ✅ Development

## After Adding Environment Variables

1. **Redeploy** your application from the Vercel dashboard
2. Or push a new commit to trigger automatic deployment
3. The app should now work correctly with database features enabled

## Testing

After deployment, verify:
1. Login/signup works
2. Jobs can be loaded
3. Applied jobs are saved
4. Refresh button works without losing data

## Troubleshooting

### Build fails with "supabaseUrl is required"
- ✅ **Fixed**: The latest code handles missing env vars gracefully during build
- Make sure you've pulled the latest changes

### App loads but shows "Authentication Required"
- ❌ Environment variables not set in Vercel
- Go to Vercel project settings and add the required variables
- Redeploy after adding variables

### Jobs not loading
- Check that you've run the database schema (`lib/database.sql`)
- Click the "Sync" button to populate jobs from GitHub
- Check browser console for errors

