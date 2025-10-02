# Changelog - Not Suitable Jobs Feature

## Date: October 2, 2025

### Summary
Added a new feature that allows users to mark jobs as "not suitable" for them. This helps users filter out jobs they're not interested in while keeping a record of their decisions.

## Files Modified

### 1. Database Schema (`lib/database.sql`)
**Changes:**
- Added new table `not_suitable_jobs` with columns:
  - `id`, `user_id`, `job_id`, `company`, `role`, `location`, `category`, `age`, `application_url`
  - `reason` (TEXT, optional - for future use)
  - `marked_at` (timestamp)
- Added indexes on `user_id` and `job_id` for performance
- Enabled Row Level Security (RLS)
- Created 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)
- Granted permissions to authenticated users

**Action Required:**
- Run the new SQL commands in Supabase SQL editor (lines 58-107 of database.sql)

### 2. Job Service (`lib/jobService.ts`)
**New Functions:**
- `getNotSuitableJobs()`: Fetches all not suitable jobs for current user (returns Set<string>)
- `markJobAsNotSuitable(job, reason?)`: Marks a job as not suitable
- `unmarkJobAsNotSuitable(jobId)`: Removes not suitable mark from a job
- `toggleJobNotSuitable(job, currentlyNotSuitable, reason?)`: Toggles not suitable status

**Lines:** Added ~100 lines of code (lines 175-280)

### 3. Job Interface (`lib/parseReadme.ts`)
**Changes:**
- Added `notSuitable?: boolean` property to Job interface (line 11)

### 4. Job Tracker Component (`components/JobTracker.tsx`)
**New State:**
- `notSuitableJobs: Set<string>` - Tracks jobs marked as not suitable
- `showNotSuitable: boolean` - Controls filter to show/hide not suitable jobs

**New Functions:**
- `handleToggleNotSuitable(job)`: Handles marking/unmarking jobs with optimistic updates

**UI Changes:**
- Added 4th statistics card for "Not Suitable" count (red color)
- Updated "Remaining" stat to exclude both applied and not suitable jobs
- Changed stats grid from 3 columns to 4 columns
- Added "Show jobs marked as not suitable" checkbox filter
- Added "Not Suitable" column to table with X icon button
- Jobs marked as not suitable appear with reduced opacity (opacity-50)
- Button shows red (destructive) when job is marked, gray (ghost) when not

**Lines Modified:** ~70 lines across multiple sections

### 5. Applied Jobs Component (`components/AppliedJobs.tsx`)
**New State:**
- `notSuitableJobs: Set<string>` - Tracks jobs marked as not suitable

**New Functions:**
- `handleToggleNotSuitable(job)`: Handles marking/unmarking jobs with optimistic updates

**UI Changes:**
- Added "Not Suitable" column to table with X icon button
- Jobs marked as not suitable appear with reduced opacity
- Updated colSpan from 7 to 8 for empty state message

**Lines Modified:** ~60 lines across multiple sections

## New Documentation

### 1. Feature Documentation (`NOT_SUITABLE_FEATURE.md`)
- Comprehensive guide for the new feature
- Database schema and setup instructions
- Feature descriptions for both pages
- User flow documentation
- Technical details and future enhancements

### 2. This Changelog (`CHANGELOG_NOT_SUITABLE.md`)
- Summary of all changes
- Migration instructions
- Testing guidelines

## Migration Steps

### For Existing Deployments:

1. **Database Migration (Required)**
   ```sql
   -- Run in Supabase SQL Editor
   -- Copy lines 58-107 from lib/database.sql
   ```

2. **Code Deployment**
   - Pull the latest code
   - No environment variable changes needed
   - No package.json changes needed

3. **Verification**
   ```sql
   -- Verify table exists
   SELECT * FROM not_suitable_jobs LIMIT 1;
   
   -- Verify RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'not_suitable_jobs';
   ```

4. **Testing**
   - Log into the application
   - Try marking a job as not suitable
   - Verify the button turns red
   - Check the stats update correctly
   - Toggle the "Show jobs marked as not suitable" checkbox
   - Verify jobs filter correctly

## Breaking Changes
**None** - This is a purely additive feature. All existing functionality remains unchanged.

## Backward Compatibility
- ✅ Existing users will automatically have access to the new feature
- ✅ Existing data is not affected
- ✅ Jobs without the `notSuitable` property default to `false`
- ✅ Old API calls continue to work

## Performance Impact
- **Database**: Added 2 new indexes (minimal impact)
- **API**: One additional parallel fetch on page load (getNotSuitableJobs)
- **Frontend**: Uses Set data structure for O(1) lookups (optimal)
- **Overall**: Negligible performance impact

## Testing Checklist

- [ ] Database table created successfully
- [ ] RLS policies are active
- [ ] Mark job as not suitable from main list
- [ ] Unmark job as not suitable
- [ ] Job row shows reduced opacity when marked
- [ ] Button changes color (gray → red)
- [ ] Stats update correctly
- [ ] "Show not suitable jobs" filter works
- [ ] Not suitable jobs hidden by default
- [ ] Feature works on Applied Jobs page
- [ ] Multiple users can mark different jobs
- [ ] Jobs persist after page refresh
- [ ] Error handling works (try when offline)
- [ ] Optimistic updates revert on failure

## Known Issues
None at this time.

## Dependencies
No new dependencies added.

## Rollback Plan
If needed, to rollback this feature:

1. **Database Rollback** (Optional - data preservation)
   ```sql
   -- Only if you want to remove the table
   DROP TABLE IF EXISTS not_suitable_jobs CASCADE;
   ```

2. **Code Rollback**
   - Revert to previous commit
   - Or remove the "Not Suitable" column from both components
   - Data will remain in database for future use

## Support
For issues or questions:
1. Check `NOT_SUITABLE_FEATURE.md` for detailed documentation
2. Review the code comments in modified files
3. Verify database table and policies are set up correctly

