# Performance Optimization - Count Queries

## Overview
Optimized the job tracker to use dedicated count queries instead of fetching entire datasets just to count records.

## Changes Made

### New Functions in `lib/jobService.ts`

#### 1. `getAppliedJobsCount()`
- **Before:** Fetching all applied jobs to count them
- **After:** Uses Supabase's `count` option with `head: true` to get count without fetching data
- **SQL:** `SELECT COUNT(*) FROM applied_jobs WHERE user_id = $1`
- **Performance:** O(1) vs O(n) - only returns count, not full records

#### 2. `getNotSuitableJobsCount()`
- **Before:** Fetching all not suitable jobs to count them
- **After:** Uses Supabase's `count` option with `head: true` to get count without fetching data
- **SQL:** `SELECT COUNT(*) FROM not_suitable_jobs WHERE user_id = $1`
- **Performance:** O(1) vs O(n) - only returns count, not full records

### Updated Components

#### `JobTracker.tsx`
- Added state variables: `appliedCount` and `notSuitableCount`
- Fetch counts in parallel with other data using `Promise.all()`
- Optimistically update counts when user toggles applied/not suitable status
- Revert counts on failure
- Use counts directly in stats display instead of computing from arrays

## Performance Impact

### Before
```typescript
// Fetching ALL applied jobs just to count them
const applied = await getAppliedJobs(); // Returns Map with all records
const count = applied.size; // Count on client side
```

**Data transferred:** Full records (id, user_id, job_id, company, role, location, category, age, url, applied_at, notes) × N jobs

### After
```typescript
// Fetching only the count
const count = await getAppliedJobsCount(); // Returns number
```

**Data transferred:** Single integer

## Scalability

- **10 applied jobs:** ~5 KB saved
- **100 applied jobs:** ~50 KB saved
- **1000 applied jobs:** ~500 KB saved

As users apply to more jobs over time, this optimization becomes increasingly important.

## Implementation Details

### Supabase Count Query
```typescript
const { count, error } = await supabase
  .from('applied_jobs')
  .select('*', { count: 'exact', head: true });
```

- `count: 'exact'` - Get accurate count (vs 'planned' which is estimate)
- `head: true` - Don't return row data, only count
- Returns count in metadata, not in data array

### Optimistic Updates
When user toggles a checkbox, we:
1. Immediately update count in UI (+1 or -1)
2. Send request to backend
3. Revert if backend fails

This provides instant feedback while maintaining data consistency.

## Future Improvements

Could extend this pattern to:
- Total jobs count (if fetching from paginated API)
- Category-specific counts
- Status breakdowns (pending, rejected, interview, etc.)


