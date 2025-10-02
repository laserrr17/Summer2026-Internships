# Quick Fix for "Failed to sync jobs" Error

## The Issue
The database `jobs` table either doesn't exist or lacks proper permissions for the API to write data.

## Solution: Run This SQL in Supabase

### Step 1: Go to Supabase SQL Editor
1. Open your Supabase project: https://app.supabase.com
2. Click on "SQL Editor" in the left sidebar
3. Click "+ New query"

### Step 2: Run This SQL Command

```sql
-- Drop and recreate the jobs table with proper permissions
DROP TABLE IF EXISTS jobs CASCADE;

CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  age TEXT NOT NULL,
  application_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for faster queries
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_company ON jobs(company);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to READ active jobs
CREATE POLICY "Authenticated users can view active jobs"
  ON jobs
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow service role to do everything (for API sync)
CREATE POLICY "Service role can manage all jobs"
  ON jobs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON jobs TO authenticated;
GRANT ALL ON jobs TO service_role;
```

### Step 3: Verify Environment Variables in Vercel

Make sure you have set in Vercel (Settings → Environment Variables):

1. **NEXT_PUBLIC_SUPABASE_URL** = `https://xxxxx.supabase.co`
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY** = `eyJhbGc...` (anon/public key)
3. **SUPABASE_SERVICE_ROLE_KEY** = `eyJhbGc...` (service role key) ⚠️ **REQUIRED!**

**Where to find these:**
- Supabase Dashboard → Project Settings → API
- Project URL = `NEXT_PUBLIC_SUPABASE_URL`
- anon/public key = `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role key = `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### Step 4: Redeploy on Vercel

After adding the environment variables:
1. Go to Vercel Dashboard → Deployments
2. Click "..." on latest deployment → Redeploy
3. Or push a commit to trigger auto-deploy

### Step 5: Test the Sync

1. Visit your app: https://job.yuhaoc7.com
2. Click the "Sync Jobs" or refresh button
3. Check browser console and network tab for detailed error messages
4. If still failing, check Vercel logs for the actual error

## What Was Wrong?

The original schema only allowed **reading** jobs, but not **writing** them. The API needs to:
- ✅ Mark old jobs as inactive (UPDATE)
- ✅ Insert new jobs (INSERT)
- ✅ Update existing jobs (UPDATE via UPSERT)

The service role key bypasses RLS restrictions and allows these operations.

## Verification

After setup, you should see in Supabase:
1. SQL Editor → Run: `SELECT COUNT(*) FROM jobs;`
2. Should return ~2000+ jobs after first sync
3. Table Editor → `jobs` table should have data

