'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Job } from '@/lib/parseReadme';
import { signIn, signUp, signOut, onAuthStateChange } from '@/lib/authService';
import { fetchJobs, syncJobs, getAppliedJobs, toggleJobApplication, getNotSuitableJobs, toggleJobNotSuitable, getAppliedJobsCount, getNotSuitableJobsCount } from '@/lib/jobService';
import { exportAppliedJobs } from '@/lib/storage';
import AuthForm from '@/components/AuthForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Download, ExternalLink, LogOut, CheckCircle2, XCircle, Home } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

const REPO_URL = 'https://github.com/SimplifyJobs/Summer2026-Internships';
const SOFTWARE_ENGINEERING_CATEGORY = 'Software Engineering';

const isUSJob = (location: string) => {
  if (!location) return false;
  const usLocationRegex = /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|USA|US|NYC|SF|DC)\b/;
  const usStateNamesRegex = /\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming|united states|remote)\b/i;
  
  const nonUSKeywords = ['canada', 'uk', 'london', 'india', 'ireland', 'australia', 'germany', 'france', 'netherlands', 'spain', 'switzerland', 'poland', 'singapore', 'israel', 'japan', 'china', 'taiwan', 'mexico', 'brazil', 'colombia', 'argentina', 'chile', 'costa rica', 'peru', 'belgium', 'denmark', 'sweden', 'finland', 'norway', 'portugal', 'italy', 'austria', 'greece', 'czech', 'romania', 'bulgaria', 'hungary', 'south korea', 'hong kong', 'malaysia', 'indonesia', 'philippines', 'vietnam', 'thailand', 'new zealand', 'south africa', 'egypt', 'nigeria', 'kenya', 'uae', 'dubai', '🇨🇦', '🇬🇧', '🇮🇳', '🇩🇪', '🇫🇷', '🇳🇱', '🇪🇸', '🇨🇭', '🇵🇱', '🇸🇬', '🇮🇱', '🇯🇵', '🇨🇳', '🇹🇼', '🇲🇽', '🇧🇷', '🇦🇷', '🇨🇴', '🇨🇱', '🇨🇷', '🇵🇪', '🇧🇪', '🇩🇰', '🇸🇪', '🇫🇮', '🇳🇴', '🇵🇹', '🇮🇹', '🇦🇹', '🇬🇷', '🇨🇿', '🇷🇴', '🇧🇬', '🇭🇺', '🇰🇷', '🇭🇰', '🇲🇾', '🇮🇩', '🇵🇭', '🇻🇳', '🇹🇭', '🇦🇺', '🇳🇿', '🇿🇦', '🇪🇬', '🇳🇬', '🇰🇪', '🇦🇪'];
  
  const isUS = usLocationRegex.test(location) || usStateNamesRegex.test(location);
  const isNonUSByKeyword = nonUSKeywords.some(keyword => location.toLowerCase().includes(keyword.toLowerCase()));
  
  return isUS && !isNonUSByKeyword;
};

export default function SoftwareEngineeringJobs() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Map<string, string>>(new Map()); // job_id -> applied_at
  const [notSuitableJobs, setNotSuitableJobs] = useState<Set<string>>(new Set());
  const [appliedCount, setAppliedCount] = useState(0);
  const [notSuitableCount, setNotSuitableCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    // Listen to auth state changes
    const subscription = onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        loadJobs();
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      console.log('Loading jobs and user data...');
      const [jobsList, applied, notSuitable, appliedCnt, notSuitableCnt] = await Promise.all([
        fetchJobs(),
        getAppliedJobs(),
        getNotSuitableJobs(),
        getAppliedJobsCount(),
        getNotSuitableJobsCount()
      ]);
      
      console.log(`Loaded: ${jobsList.length} jobs, ${appliedCnt} applied, ${notSuitableCnt} not suitable`);
      
      // Merge applied status and timestamp
      // Check both by job_id and by application_url to handle cases where job_id changes
      const jobsWithStatus = jobsList.map(job => {
        const appliedById = applied.has(job.id);
        const appliedByUrl = job.applicationUrl && job.applicationUrl.trim() !== '' 
          ? applied.has(`url:${job.applicationUrl.trim()}`) 
          : false;
        const isApplied = appliedById || appliedByUrl;
        const appliedAt = applied.get(job.id) || (job.applicationUrl && job.applicationUrl.trim() !== '' 
          ? applied.get(`url:${job.applicationUrl.trim()}`) 
          : undefined);
        
        // Check not suitable by both job_id and application_url
        const notSuitableById = notSuitable.has(job.id);
        const notSuitableByUrl = job.applicationUrl && job.applicationUrl.trim() !== '' 
          ? notSuitable.has(`url:${job.applicationUrl.trim()}`) 
          : false;
        const isNotSuitable = notSuitableById || notSuitableByUrl;
        
        return {
          ...job,
          applied: isApplied,
          appliedAt: appliedAt,
          notSuitable: isNotSuitable,
        };
      });
      
      setJobs(jobsWithStatus);
      setAppliedJobs(applied);
      setNotSuitableJobs(notSuitable);
      setAppliedCount(appliedCnt);
      setNotSuitableCount(notSuitableCnt);
      // Reset to first page when data refreshes to prevent empty page view
      setCurrentPage(1);
      
      console.log(`Jobs loaded successfully. Total: ${jobsWithStatus.length}`);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      alert('Failed to load job listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncJobs = async () => {
    setLoading(true);
    try {
      const result = await syncJobs();
      if (result.success) {
        alert(`Successfully synced ${result.count} jobs from GitHub!`);
        await loadJobs();
      } else {
        const errorMsg = result.error || 'Failed to sync jobs. Please try again.';
        console.error('Sync error:', errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Failed to sync jobs:', error);
      alert('Failed to sync jobs. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApplied = async (job: Job) => {
    // Check both by job_id and by application_url
    const appliedById = appliedJobs.has(job.id);
    const appliedByUrl = job.applicationUrl && job.applicationUrl.trim() !== '' 
      ? appliedJobs.has(`url:${job.applicationUrl.trim()}`) 
      : false;
    const currentlyApplied = appliedById || appliedByUrl;
    
    // Optimistic update
    const newAppliedJobs = new Map(appliedJobs);
    if (currentlyApplied) {
      newAppliedJobs.delete(job.id);
      setAppliedCount(prev => Math.max(0, prev - 1));
    } else {
      newAppliedJobs.set(job.id, new Date().toISOString());
      setAppliedCount(prev => prev + 1);
    }
    
    setAppliedJobs(newAppliedJobs);
    setJobs(jobs.map(j => 
      j.id === job.id ? { ...j, applied: !currentlyApplied, appliedAt: newAppliedJobs.get(job.id) } : j
    ));

    // Persist to backend
    const success = await toggleJobApplication(job, currentlyApplied);
    
    if (!success) {
      // Revert on failure
      setAppliedJobs(appliedJobs);
      setAppliedCount(currentlyApplied ? appliedCount + 1 : appliedCount - 1);
      setJobs(jobs.map(j => 
        j.id === job.id ? { ...j, applied: currentlyApplied, appliedAt: appliedJobs.get(job.id) } : j
      ));
      alert('Failed to update application status. Please try again.');
    }
  };

  const handleToggleNotSuitable = async (job: Job) => {
    // Check both by job_id and by application_url
    const notSuitableById = notSuitableJobs.has(job.id);
    const notSuitableByUrl = job.applicationUrl && job.applicationUrl.trim() !== '' 
      ? notSuitableJobs.has(`url:${job.applicationUrl.trim()}`) 
      : false;
    const currentlyNotSuitable = notSuitableById || notSuitableByUrl;
    
    // Optimistic update
    const newNotSuitableJobs = new Set(notSuitableJobs);
    if (currentlyNotSuitable) {
      // Remove both job_id and application_url entries
      newNotSuitableJobs.delete(job.id);
      if (job.applicationUrl && job.applicationUrl.trim() !== '') {
        newNotSuitableJobs.delete(`url:${job.applicationUrl.trim()}`);
      }
      setNotSuitableCount(prev => Math.max(0, prev - 1));
    } else {
      // Add both job_id and application_url entries
      newNotSuitableJobs.add(job.id);
      if (job.applicationUrl && job.applicationUrl.trim() !== '') {
        newNotSuitableJobs.add(`url:${job.applicationUrl.trim()}`);
      }
      setNotSuitableCount(prev => prev + 1);
    }
    
    setNotSuitableJobs(newNotSuitableJobs);
    setJobs(jobs.map(j => 
      j.id === job.id ? { ...j, notSuitable: !currentlyNotSuitable } : j
    ));

    // Persist to backend
    const success = await toggleJobNotSuitable(job, currentlyNotSuitable);
    
    if (!success) {
      // Revert on failure
      setNotSuitableJobs(notSuitableJobs);
      setNotSuitableCount(currentlyNotSuitable ? notSuitableCount + 1 : notSuitableCount - 1);
      setJobs(jobs.map(j => 
        j.id === job.id ? { ...j, notSuitable: currentlyNotSuitable } : j
      ));
      alert('Failed to update not suitable status. Please try again.');
    }
  };

  const handleExport = () => {
    // Export only Software Engineering applied jobs
    const seJobs = jobs.filter(job => job.category === SOFTWARE_ENGINEERING_CATEGORY);
    exportAppliedJobs(seJobs);
  };

  const handleAuth = async (email: string, password: string, isSignUp: boolean) => {
    if (isSignUp) {
      return await signUp(email, password);
    } else {
      return await signIn(email, password);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setJobs([]);
    setAppliedJobs(new Map());
    setNotSuitableJobs(new Set());
    setAppliedCount(0);
    setNotSuitableCount(0);
  };

  // Filter jobs to only show Software Engineering jobs and sort by age ascending
  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter(job => {
      // Only show Software Engineering jobs
      if (job.category !== SOFTWARE_ENGINEERING_CATEGORY) return false;
      
      // Filter out non-US jobs
      if (!isUSJob(job.location)) return false;
      
      // Hide applied jobs from main list
      if (job.applied) return false;
      
      // Always hide not suitable jobs from main list
      if (job.notSuitable) return false;
      
      const matchesSearch = 
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort by age in ascending order
    return filtered.sort((a, b) => {
      // Helper function to extract numeric age value
      const getAgeValue = (age: string): number => {
        if (age === 'N/A' || age === '🔒') {
          return Infinity; // Put N/A and 🔒 at the end
        }
        const match = age.match(/(\d+)d/);
        return match ? parseInt(match[1], 10) : Infinity;
      };

      return getAgeValue(a.age) - getAgeValue(b.age);
    });
  }, [jobs, searchTerm]);

  // Paginated jobs
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const stats = useMemo(() => {
    // Calculate stats for Software Engineering jobs only, filtered for US
    const seJobs = jobs.filter(job => job.category === SOFTWARE_ENGINEERING_CATEGORY && isUSJob(job.location));
    const seApplied = seJobs.filter(job => job.applied).length;
    const seNotSuitable = seJobs.filter(job => job.notSuitable).length;
    
    return {
      total: seJobs.length,
      applied: seApplied,
      notSuitable: seNotSuitable,
      remaining: seJobs.length - seApplied - seNotSuitable,
    };
  }, [jobs]);

  if (!user) {
    return <AuthForm onAuth={handleAuth} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">💻 Software Engineering Internships</h1>
          <p className="text-muted-foreground">
            Track Software Engineering applications from {' '}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              SimplifyJobs/Summer2026-Internships
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Logged in as: {user.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              All Jobs
            </Button>
          </Link>
          <Link href="/applied">
            <Button variant="outline" size="sm">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Applied Jobs ({appliedCount})
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total SWE Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.applied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Suitable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.notSuitable}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.remaining}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter Software Engineering job listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search company, role, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={loadJobs} 
                  variant="outline" 
                  size="icon"
                  title="Refresh job list"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleSyncJobs} 
                  variant="outline" 
                  size="sm"
                  title="Sync jobs from GitHub"
                >
                  Sync
                </Button>
                <Button 
                  onClick={handleExport} 
                  variant="outline" 
                  size="icon"
                  title="Export applied jobs"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Applied</TableHead>
                  <TableHead className="w-[100px]">Not Suitable</TableHead>
                  <TableHead className="w-[200px]">Company</TableHead>
                  <TableHead className="w-[250px]">Role</TableHead>
                  <TableHead className="w-[180px]">Location</TableHead>
                  <TableHead className="w-[80px]">Age</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <p className="text-lg font-medium">No jobs in database</p>
                        <p className="text-sm text-muted-foreground">Click the "Sync" button above to load jobs from GitHub</p>
                        <Button onClick={handleSyncJobs} variant="default">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Jobs from GitHub
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No Software Engineering jobs found matching your filters. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedJobs.map((job) => (
                    <TableRow 
                      key={job.id} 
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${job.notSuitable ? 'opacity-50' : ''}`}
                      onClick={(e) => {
                        // Don't navigate if clicking on checkbox or button
                        if ((e.target as HTMLElement).closest('[role="checkbox"]') || 
                            (e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        if (job.applicationUrl) {
                          window.open(job.applicationUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={job.applied}
                          onCheckedChange={() => handleToggleApplied(job)}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant={job.notSuitable ? "destructive" : "ghost"}
                          size="sm"
                          onClick={() => handleToggleNotSuitable(job)}
                          className="h-8 w-8 p-0"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{job.company}</TableCell>
                      <TableCell>{job.role}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{job.age}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}

