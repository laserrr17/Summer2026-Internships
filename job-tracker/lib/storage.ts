import { Job } from './parseReadme';

const STORAGE_KEY = 'job-applications-status';

export function saveAppliedJobs(jobIds: Set<string>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(jobIds)));
}

export function loadAppliedJobs(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return new Set();
  
  try {
    const array = JSON.parse(stored);
    return new Set(array);
  } catch {
    return new Set();
  }
}

export function toggleJobApplied(jobId: string): Set<string> {
  const appliedJobs = loadAppliedJobs();
  
  if (appliedJobs.has(jobId)) {
    appliedJobs.delete(jobId);
  } else {
    appliedJobs.add(jobId);
  }
  
  saveAppliedJobs(appliedJobs);
  return appliedJobs;
}

export function exportAppliedJobs(jobs: Job[]): void {
  const appliedJobs = jobs.filter(job => job.applied);
  const dataStr = JSON.stringify(appliedJobs, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `applied-jobs-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

