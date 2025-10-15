import { supabase } from './supabase';
import type { Job } from './parseReadme';

export interface AppliedJob {
  id: number;
  user_id: string;
  job_id: string;
  company: string;
  role: string;
  location: string;
  category: string;
  age: string;
  application_url: string | null;
  applied_at: string;
  notes: string | null;
}

/**
 * Fetch all jobs from the backend API
 */
export async function fetchJobs(): Promise<Job[]> {
  console.log('Fetching jobs from /api/jobs...');
  const response = await fetch('/api/jobs');
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Failed to fetch jobs:', response.status, errorData);
    throw new Error(`Failed to fetch jobs: ${response.status} - ${errorData.error || 'Unknown error'}`);
  }
  
  const data = await response.json();
  console.log(`Fetched ${data.count || 0} jobs from database:`, data);
  
  // Transform database jobs to Job format
  const jobs = (data.jobs || []).map((job: any) => ({
    id: job.id,
    company: job.company,
    role: job.role,
    location: job.location,
    category: job.category,
    age: job.age,
    applicationUrl: job.application_url,
    applied: false,
    notSuitable: false
  }));
  
  console.log(`Transformed ${jobs.length} jobs for display`);
  return jobs;
}

/**
 * Sync jobs from GitHub to database
 */
export async function syncJobs(): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const response = await fetch('/api/jobs', {
      method: 'POST',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Sync failed:', data);
      return { 
        success: false, 
        error: data.error || `Failed to sync jobs: ${response.status}` 
      };
    }
    
    return { success: true, count: data.count };
  } catch (error) {
    console.error('Failed to sync jobs:', error);
    return { success: false, error: 'Failed to sync jobs. Please check your network connection.' };
  }
}

/**
 * Get all applied jobs for the current user
 * Returns a Map of job_id -> applied_at timestamp
 */
export async function getAppliedJobs(): Promise<Map<string, string>> {
  try {
    const { data, error } = await supabase
      .from('applied_jobs')
      .select('job_id, applied_at');

    if (error) {
      console.error('Failed to fetch applied jobs:', error);
      return new Map();
    }

    return new Map(data?.map(job => [job.job_id, job.applied_at]) || []);
  } catch (error) {
    console.error('Failed to fetch applied jobs:', error);
    return new Map();
  }
}

/**
 * Get count of applied jobs for the current user
 */
export async function getAppliedJobsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('applied_jobs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Failed to fetch applied jobs count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Failed to fetch applied jobs count:', error);
    return 0;
  }
}

/**
 * Get detailed applied jobs for the current user
 */
export async function getAppliedJobsDetailed(): Promise<AppliedJob[]> {
  const { data, error } = await supabase
    .from('applied_jobs')
    .select('*')
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch applied jobs:', error);
    throw new Error(`Failed to fetch applied jobs: ${error.message}`);
  }

  return data || [];
}

/**
 * Mark a job as applied
 */
export async function markJobAsApplied(job: Job): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('applied_jobs')
      .insert({
        user_id: user.id,
        job_id: job.id,
        company: job.company,
        role: job.role,
        location: job.location,
        category: job.category,
        age: job.age,
        application_url: job.applicationUrl || null,
      });

    if (error) {
      // If it's a duplicate, that's okay
      if (error.code === '23505') {
        console.log('Job already marked as applied');
        return true;
      }
      console.error('Failed to mark job as applied:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to mark job as applied:', error);
    return false;
  }
}

/**
 * Unmark a job as applied
 */
export async function unmarkJobAsApplied(jobId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('applied_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', jobId);

    if (error) {
      console.error('Failed to unmark job:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to unmark job:', error);
    return false;
  }
}

/**
 * Toggle job application status
 */
export async function toggleJobApplication(job: Job, currentlyApplied: boolean): Promise<boolean> {
  if (currentlyApplied) {
    return await unmarkJobAsApplied(job.id);
  } else {
    return await markJobAsApplied(job);
  }
}

/**
 * Update notes for an applied job
 */
export async function updateJobNotes(jobId: string, notes: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('applied_jobs')
      .update({ notes })
      .eq('user_id', user.id)
      .eq('job_id', jobId);

    if (error) {
      console.error('Failed to update notes:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update notes:', error);
    return false;
  }
}

/**
 * Get all not suitable jobs for the current user
 * Returns a Set of job_ids
 */
export async function getNotSuitableJobs(): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('not_suitable_jobs')
      .select('job_id');

    if (error) {
      console.error('Failed to fetch not suitable jobs:', error);
      return new Set();
    }

    return new Set(data?.map(job => job.job_id) || []);
  } catch (error) {
    console.error('Failed to fetch not suitable jobs:', error);
    return new Set();
  }
}

/**
 * Get count of not suitable jobs for the current user
 */
export async function getNotSuitableJobsCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('not_suitable_jobs')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Failed to fetch not suitable jobs count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Failed to fetch not suitable jobs count:', error);
    return 0;
  }
}

/**
 * Mark a job as not suitable
 */
export async function markJobAsNotSuitable(job: Job, reason?: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('not_suitable_jobs')
      .insert({
        user_id: user.id,
        job_id: job.id,
        company: job.company,
        role: job.role,
        location: job.location,
        category: job.category,
        age: job.age,
        application_url: job.applicationUrl || null,
        reason: reason || null,
      });

    if (error) {
      // If it's a duplicate, that's okay
      if (error.code === '23505') {
        console.log('Job already marked as not suitable');
        return true;
      }
      console.error('Failed to mark job as not suitable:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to mark job as not suitable:', error);
    return false;
  }
}

/**
 * Unmark a job as not suitable
 */
export async function unmarkJobAsNotSuitable(jobId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('not_suitable_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', jobId);

    if (error) {
      console.error('Failed to unmark job as not suitable:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to unmark job as not suitable:', error);
    return false;
  }
}

/**
 * Toggle job not suitable status
 */
export async function toggleJobNotSuitable(job: Job, currentlyNotSuitable: boolean, reason?: string): Promise<boolean> {
  if (currentlyNotSuitable) {
    return await unmarkJobAsNotSuitable(job.id);
  } else {
    return await markJobAsNotSuitable(job, reason);
  }
}

