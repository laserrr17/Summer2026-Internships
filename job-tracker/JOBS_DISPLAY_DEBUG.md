# Jobs Display - How It Works & Debugging

## 📊 Current Architecture

The job tracker uses a **three-table system**:

1. **`jobs`** table - Stores all available jobs from GitHub
2. **`applied_jobs`** table - Stores which jobs each user has applied to
3. **`not_suitable_jobs`** table - Stores which jobs each user marked as not suitable

### Data Flow

```
GitHub README
     ↓ (Sync button)
jobs table (database)
     ↓ (Fetch on load)
Frontend (with applied status merged)
     ↓
Display to user
```

## 🔍 How Jobs Are Displayed

### Step 1: Sync Jobs from GitHub

When you click "Sync":
1. Fetches README from GitHub
2. Parses job listings
3. Inserts/updates into `jobs` table
4. Returns count of synced jobs

**Required:** `SUPABASE_SERVICE_ROLE_KEY` environment variable

### Step 2: Load Jobs in Frontend

When page loads:
1. **Fetch jobs** from `/api/jobs` → Gets all active jobs from `jobs` table
2. **Get applied jobs** → Queries `applied_jobs` table for current user
3. **Get not suitable jobs** → Queries `not_suitable_jobs` table for current user
4. **Merge data** → Combines all three into one array with status flags

### Step 3: Display Jobs

Main page (`/`):
- Shows jobs that are **NOT applied**
- Option to show/hide "not suitable" jobs
- Filters by search term and category

Applied page (`/applied`):
- Shows **ONLY applied** jobs
- Sorted by application date (newest first)
- Shows when you applied

## 🐛 Debugging Steps

### Check 1: Are jobs in the database?

Open browser console (F12) and check the logs after logging in:

```
Fetching jobs from /api/jobs...
Fetched X jobs from database
```

**If X = 0:** Jobs table is empty → Click "Sync" button

**If fetch fails:** Check environment variables and Supabase connection

### Check 2: Check Network Tab

1. Open DevTools (F12) → **Network** tab
2. Refresh the page
3. Look for request to `/api/jobs`
4. Click on it → Check **Response** tab

You should see:
```json
{
  "jobs": [ /* array of jobs */ ],
  "count": 1234
}
```

**If empty array:** Database is empty, need to sync
**If error:** Check the error message for details

### Check 3: Check Console Logs

After I added debugging, you'll see detailed logs:

```
Loading jobs and user data...
Loaded: 1234 jobs, 5 applied, 2 not suitable
Jobs loaded successfully. Total: 1234
```

This tells you:
- Total jobs fetched from database
- How many you've applied to
- How many you marked as not suitable

### Check 4: Verify Database Tables

Go to Supabase Dashboard → Table Editor:

1. **jobs** table:
   - Should have rows with job listings
   - Check `is_active` column (should be `true`)
   - If empty → Click "Sync" in the app

2. **applied_jobs** table:
   - Shows jobs you've marked as applied
   - Each row has `user_id`, `job_id`, etc.

3. **not_suitable_jobs** table:
   - Shows jobs you've marked as not suitable

## ✅ Expected Behavior

### First Time Setup

1. **Login** → See empty state with message "No jobs in database"
2. **Click Sync** → Loads ~1000+ jobs from GitHub
3. **Jobs appear** in the table with filters

### Normal Operation

**Main Page (`/`):**
- Shows all jobs you **haven't applied to yet**
- Can filter by category, search
- Click checkbox to mark as applied
- Click X button to mark as not suitable

**Applied Page (`/applied`):**
- Shows **only** jobs you've applied to
- Sorted by application date
- Can uncheck to remove from applied list

### Filtering Logic

```javascript
// Main page filters OUT applied jobs
jobs.filter(job => !job.applied)

// Applied page filters FOR applied jobs
jobs.filter(job => job.applied)
```

## 🚨 Common Issues

### Issue 1: "No jobs in database"

**Cause:** Jobs table is empty

**Solution:**
1. Make sure `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`
2. Restart dev server
3. Click "Sync Jobs from GitHub" button
4. Wait for success message
5. Refresh page

### Issue 2: Jobs appear then disappear

**Cause:** Jobs marked as applied are hidden on main page

**Solution:**
- This is expected! Applied jobs move to `/applied` page
- Click "Applied Jobs (X)" button to see them

### Issue 3: "Failed to fetch jobs"

**Causes:**
- Missing environment variables
- Supabase project paused
- Network issue
- RLS policy blocking reads

**Solutions:**
1. Check `.env.local` has all required vars
2. Check Supabase project is active
3. Check browser console for specific error
4. Verify database.sql was run to create tables

### Issue 4: Can't mark jobs as applied

**Cause:** Authentication or RLS policy issue

**Solutions:**
1. Verify you're logged in (check email in header)
2. Check `applied_jobs` table exists in Supabase
3. Verify RLS policies allow insert for authenticated users
4. Check browser console for error details

## 🔧 Manual Database Check

If jobs aren't showing, check manually in Supabase:

```sql
-- Count jobs in database
SELECT COUNT(*) FROM jobs WHERE is_active = true;

-- See first 10 jobs
SELECT * FROM jobs WHERE is_active = true LIMIT 10;

-- Check your applied jobs (replace with your user ID)
SELECT * FROM applied_jobs WHERE user_id = 'your-user-id';

-- Count by category
SELECT category, COUNT(*) 
FROM jobs 
WHERE is_active = true 
GROUP BY category;
```

## 📝 Console Commands for Debugging

Open browser console and run:

```javascript
// Check how many jobs are loaded
console.log('Jobs in state:', document.querySelector('[data-jobs-count]')?.textContent);

// Force reload jobs
window.location.reload();

// Check localStorage (not used in this app, but good to clear)
localStorage.clear();
```

## 🎯 Quick Checklist

Before reporting issues, verify:

- [ ] Logged in successfully
- [ ] `.env.local` has all 3 environment variables
- [ ] Dev server restarted after adding env vars
- [ ] Database tables created (ran `lib/database.sql`)
- [ ] Clicked "Sync" button at least once
- [ ] Checked browser console for errors
- [ ] Checked Network tab for failed requests
- [ ] Supabase project is active (not paused)

## 📖 Understanding the Code

### fetchJobs() - Gets jobs from database

```typescript
// Calls GET /api/jobs
// Returns jobs from 'jobs' table where is_active = true
const jobs = await fetchJobs();
```

### getAppliedJobs() - Gets your applied status

```typescript
// Queries 'applied_jobs' table for current user
// Returns Map of job_id → applied_at timestamp
const applied = await getAppliedJobs();
```

### Merging Data

```typescript
// Combines jobs with your personal status
const jobsWithStatus = jobsList.map(job => ({
  ...job,
  applied: applied.has(job.id),
  appliedAt: applied.get(job.id),
  notSuitable: notSuitable.has(job.id)
}));
```

## 💡 Tips

1. **Use the console logs** - I added detailed logging to help debug
2. **Check the stats cards** - They show total, applied, not suitable, remaining
3. **Use filters** - If too many jobs, filter by category or search
4. **Pagination** - Jobs are paginated (50 per page by default)
5. **Sync regularly** - Click sync weekly to get new job postings

---

**Still having issues?** Share the console logs and I can help debug!



