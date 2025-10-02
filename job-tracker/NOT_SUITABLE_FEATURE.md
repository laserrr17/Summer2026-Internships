# Not Suitable Jobs Feature

## Overview

This feature allows users to mark jobs as "not suitable" for them. Jobs marked as not suitable will be visually distinguished and can be filtered from the main job list.

## Database Changes

A new table `not_suitable_jobs` has been added to track jobs that users mark as not suitable.

### Table Schema

```sql
CREATE TABLE IF NOT EXISTS not_suitable_jobs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  age TEXT NOT NULL,
  application_url TEXT,
  reason TEXT,
  marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, job_id)
);
```

### Setup Instructions

1. **Run the SQL Migration**
   - Open your Supabase SQL editor
   - Navigate to `job-tracker/lib/database.sql`
   - Copy the SQL commands for the `not_suitable_jobs` table (lines 58-107)
   - Execute them in your Supabase SQL editor

2. **Verify the Setup**
   - Check that the table was created successfully
   - Verify that Row Level Security (RLS) is enabled
   - Confirm that policies are in place

## Features

### Main Job List (JobTracker)
- **Not Suitable Button**: Each job row has an X icon button to mark it as not suitable
- **Visual Feedback**: 
  - When marked, the button turns red (destructive variant)
  - The entire row becomes semi-transparent (opacity-50)
- **Filter Toggle**: A checkbox in the filters section allows showing/hiding not suitable jobs
- **Statistics**: A new "Not Suitable" card shows the count of jobs marked as not suitable
- **Updated Remaining Count**: The "Remaining" stat now excludes both applied and not suitable jobs

### Applied Jobs Page
- **Not Suitable Column**: Same functionality as the main list
- **Consistent UI**: Jobs marked as not suitable appear with reduced opacity
- **Toggle Support**: Users can mark/unmark jobs even after applying

## UI Components Modified

1. **JobTracker.tsx**
   - Added `notSuitableJobs` state
   - Added `showNotSuitable` filter state
   - Added `handleToggleNotSuitable` function
   - Updated stats to include not suitable count
   - Added 4th card for stats (Total, Applied, Not Suitable, Remaining)
   - Added filter checkbox to show/hide not suitable jobs
   - Added "Not Suitable" column with X button

2. **AppliedJobs.tsx**
   - Added `notSuitableJobs` state
   - Added `handleToggleNotSuitable` function
   - Added "Not Suitable" column with X button
   - Jobs marked as not suitable appear with reduced opacity

3. **jobService.ts**
   - Added `getNotSuitableJobs()` - Fetches all not suitable jobs for current user
   - Added `markJobAsNotSuitable()` - Marks a job as not suitable
   - Added `unmarkJobAsNotSuitable()` - Removes not suitable mark
   - Added `toggleJobNotSuitable()` - Toggles not suitable status

4. **parseReadme.ts**
   - Added `notSuitable?: boolean` to Job interface

## User Flow

1. **Marking a Job as Not Suitable**
   - User clicks the X icon button in the "Not Suitable" column
   - The button turns red and the row becomes semi-transparent
   - The change is immediately saved to the database
   - The "Not Suitable" stat increments
   - The "Remaining" stat decrements

2. **Unmarking a Job**
   - User clicks the red X icon button again
   - The button returns to ghost variant (gray)
   - The row opacity returns to normal
   - The stats update accordingly

3. **Filtering Not Suitable Jobs**
   - By default, not suitable jobs are hidden from the main list
   - Users can check "Show jobs marked as not suitable" to view them
   - The filter persists while browsing but resets on page refresh

## Benefits

1. **Better Job Management**: Users can hide jobs they're not interested in
2. **Cleaner Interface**: Reduces visual clutter by hiding unsuitable jobs
3. **Data Preservation**: Unlike deleting, users can always unmark jobs
4. **Personal Curation**: Each user maintains their own list of unsuitable jobs
5. **Better Metrics**: More accurate "Remaining" count shows truly relevant jobs

## Technical Details

### Optimistic Updates
- UI updates immediately when user clicks the button
- If the database operation fails, the UI reverts to the previous state
- Error messages alert the user if something goes wrong

### Row Level Security
- Users can only see and modify their own not suitable jobs
- All database operations are secured with RLS policies
- User authentication is verified before any database operation

### Performance
- Not suitable jobs are fetched in parallel with applied jobs
- Uses Set data structure for O(1) lookup performance
- Indexes on `user_id` and `job_id` for fast queries

## Future Enhancements

Potential improvements for this feature:
- Add a "reason" field for why a job is not suitable
- Create a dedicated page to view all not suitable jobs
- Add bulk operations (mark multiple jobs at once)
- Export not suitable jobs list
- Add categories/tags for why jobs aren't suitable
- Analytics on which types of jobs are marked as not suitable

