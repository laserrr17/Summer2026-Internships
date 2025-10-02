-- Database Schema for Job Tracker
-- Run these commands in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create applied_jobs table
CREATE TABLE IF NOT EXISTS applied_jobs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  age TEXT NOT NULL,
  application_url TEXT,
  notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only apply once per job
  UNIQUE(user_id, job_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_applied_jobs_user_id ON applied_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_applied_jobs_job_id ON applied_jobs(job_id);

-- Enable Row Level Security (RLS)
ALTER TABLE applied_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see/modify their own data
CREATE POLICY "Users can view their own applied jobs"
  ON applied_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applied jobs"
  ON applied_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applied jobs"
  ON applied_jobs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applied jobs"
  ON applied_jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON applied_jobs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE applied_jobs_id_seq TO authenticated;

-- Create not_suitable_jobs table
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
  
  -- Ensure a user can only mark a job as not suitable once
  UNIQUE(user_id, job_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_not_suitable_jobs_user_id ON not_suitable_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_not_suitable_jobs_job_id ON not_suitable_jobs(job_id);

-- Enable Row Level Security (RLS)
ALTER TABLE not_suitable_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see/modify their own data
CREATE POLICY "Users can view their own not suitable jobs"
  ON not_suitable_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own not suitable jobs"
  ON not_suitable_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own not suitable jobs"
  ON not_suitable_jobs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own not suitable jobs"
  ON not_suitable_jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON not_suitable_jobs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE not_suitable_jobs_id_seq TO authenticated;

