# Database Synchronization Guide

## Overview

The job tracker now stores all jobs in a centralized database table. Both the main page and applied jobs page query from the backend instead of fetching directly from GitHub.

## Changes Made

### 1. Database Schema
- Added a new `jobs` table to store all job listings
- Jobs are uniquely identified by their `id` field
- Jobs have an `is_active` flag to track current availability

### 2. Backend API (`/api/jobs`)
- **GET /api/jobs** - Fetches all active jobs from the database
- **POST /api/jobs** - Syncs jobs from GitHub README to the database

### 3. Frontend Components
Both `JobTracker` and `AppliedJobs` components now:
- Fetch jobs from the backend API instead of GitHub
- Include a "Sync" button to update the job database from GitHub
- Automatically reset pagination when refreshing to prevent empty views

## How to Use

### Initial Setup

1. **Run the database migration** - Execute the SQL in `lib/database.sql` in your Supabase SQL editor
2. **Sync jobs** - Click the "Sync" button on either page to populate the database with jobs from GitHub
3. **Refresh** - Click the refresh button to reload jobs from the database

### Regular Usage

- **Sync Button**: Updates the database with the latest jobs from GitHub (marks old jobs as inactive)
- **Refresh Button**: Reloads jobs from the database without syncing from GitHub (faster)
- **Applied/Not Suitable status**: Still stored per user and merged with job data on load

## Benefits

- ✅ **Consistent Data**: Both pages show the same job listings
- ✅ **Better Performance**: Cached in database, no repeated GitHub API calls
- ✅ **Unique Jobs**: Database ensures job IDs are unique
- ✅ **Synchronized Status**: Applied/Not Suitable status properly syncs with job data
- ✅ **Pagination Fixed**: Refresh button now resets to page 1 to prevent empty views

## Technical Details

### Job Sync Process
1. Fetch README from GitHub
2. Parse job listings
3. Mark all existing jobs as `is_active = false`
4. Upsert new jobs with `is_active = true`
5. Frontend only shows jobs where `is_active = true`

### Data Flow
```
GitHub README → POST /api/jobs → jobs table → GET /api/jobs → Frontend
                                      ↓
                            applied_jobs table (per user)
                            not_suitable_jobs table (per user)
```

