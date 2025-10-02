# Date Tracking Feature

## Overview

The job tracker now automatically tracks **when you applied** to each job!

## Features

✅ **Automatic Timestamps** - When you check a job as "applied", the current date and time is saved  
✅ **Smart Display** - Shows relative dates (e.g., "Today", "2 days ago", "3 weeks ago")  
✅ **Database Storage** - Dates are stored in the `applied_at` column in the database  
✅ **Sort by Date** - Applied jobs are automatically sorted with most recent first  
✅ **Export with Dates** - Exported JSON includes application dates

---

## How It Works

### When You Mark a Job as Applied

1. You check the checkbox next to a job
2. The system records the current timestamp (ISO format)
3. Data is saved to the database in the `applied_at` column
4. The date appears in your Applied Jobs page

### Date Display Format

The system uses smart formatting to make dates easy to read:

| Time Since Applied | Display |
|-------------------|---------|
| Same day | "Today" |
| 1 day ago | "Yesterday" |
| 2-6 days ago | "X days ago" |
| 1-4 weeks ago | "X weeks ago" |
| Older | "Dec 15" or "Dec 15, 2024" |

---

## Database Schema

The `applied_at` field in the `applied_jobs` table:

```sql
applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

- Type: `TIMESTAMP WITH TIME ZONE`
- Default: Current timestamp when record is created
- Format: ISO 8601 (e.g., "2024-12-20T15:30:00.000Z")
- Timezone: UTC

---

## Code Example

### Accessing the Date

```typescript
// Job interface includes appliedAt
interface Job {
  id: string;
  company: string;
  role: string;
  appliedAt?: string; // ISO timestamp
  // ... other fields
}

// Example value
job.appliedAt = "2024-12-20T15:30:00.000Z"
```

### Formatting for Display

```typescript
function formatAppliedDate(isoDate: string | undefined): string {
  if (!isoDate) return 'N/A';
  
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}
```

---

## Sorting

Applied jobs are sorted by date (most recent first):

```typescript
const filteredJobs = jobs
  .filter(job => job.applied)
  .sort((a, b) => {
    if (!a.appliedAt) return 1;
    if (!b.appliedAt) return -1;
    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
  });
```

---

## Export Feature

When you export your applied jobs, the JSON includes the date:

```json
[
  {
    "company": "Google",
    "role": "Software Engineer Intern",
    "location": "Mountain View, CA",
    "category": "🛠️ Software Engineering",
    "applicationUrl": "https://...",
    "appliedAt": "2024-12-20T15:30:00.000Z",
    "age": "↳ 5 days ago"
  }
]
```

---

## Future Enhancements

Possible future features using this date data:

- 📊 **Analytics**: Chart applications over time
- ⏰ **Reminders**: Alert you to follow up after X days
- 🎯 **Goals**: Set daily/weekly application targets
- 📈 **Trends**: See your application patterns
- 🔔 **Notifications**: Email summaries of weekly applications

---

## Migration Notes

- Jobs applied **before** this feature was added will not have dates
- These will show as "N/A" in the Applied Date column
- New applications going forward will have dates tracked automatically
- No action needed from users - it works automatically!

---

## Technical Details

### API Flow

1. User checks job checkbox
2. Frontend calls `toggleJobApplication(job, isApplied)`
3. Backend inserts row with `applied_at: NOW()`
4. Database returns the timestamp
5. Frontend updates UI with formatted date

### Database Query

```typescript
// Get applied jobs with timestamps
const { data } = await supabase
  .from('applied_jobs')
  .select('job_id, applied_at')
  .order('applied_at', { ascending: false });
```

### Performance

- ✅ Indexed on `user_id` for fast queries
- ✅ Timestamps are efficient to store and query
- ✅ Formatted on frontend (no database overhead)
- ✅ Cached in component state for instant display

---

Enjoy tracking your job applications with dates! 🎉

