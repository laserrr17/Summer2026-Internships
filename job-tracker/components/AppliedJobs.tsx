'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Job } from '@/lib/parseReadme';
import { signOut, onAuthStateChange, signIn, signUp } from '@/lib/authService';
import { syncJobs, getAppliedJobsDetailed, toggleJobApplication, type AppliedJob } from '@/lib/jobService';
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
import { RefreshCw, Download, ExternalLink, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

const REPO_URL = 'https://github.com/SimplifyJobs/Summer2026-Internships';

// Helper function to format date
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
  
  // Format as MM/DD/YYYY
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}

export default function AppliedJobs() {
  const [user, setUser] = useState<User | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
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
      console.log('Loading applied jobs...');
      const applied = await getAppliedJobsDetailed();
      
      console.log(`Loaded ${applied.length} applied jobs`);
      
      setAppliedJobs(applied);
      // Reset to first page when data refreshes to prevent empty page view
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to load applied jobs:', error);
      alert('Failed to load applied jobs. Please try again later.');
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

  const handleToggleApplied = async (appliedJob: AppliedJob) => {
    // Convert AppliedJob to Job format for the API
    const job: Job = {
      id: appliedJob.job_id,
      company: appliedJob.company,
      role: appliedJob.role,
      location: appliedJob.location,
      category: appliedJob.category,
      age: appliedJob.age,
      applicationUrl: appliedJob.application_url || '',
      applied: true,
    };
    
    // Optimistically remove from list
    setAppliedJobs(appliedJobs.filter(j => j.job_id !== appliedJob.job_id));

    // Persist to backend (currentlyApplied = true means we're removing it)
    const success = await toggleJobApplication(job, true);
    
    if (!success) {
      // Revert on failure
      setAppliedJobs(appliedJobs);
      alert('Failed to update application status. Please try again.');
    }
  };


  const handleExport = () => {
    // Convert AppliedJob[] to Job[] for export
    const jobsForExport: Job[] = appliedJobs.map(aj => ({
      id: aj.job_id,
      company: aj.company,
      role: aj.role,
      location: aj.location,
      category: aj.category,
      age: aj.age,
      applicationUrl: aj.application_url ?? '',
      applied: true,
      appliedAt: aj.applied_at,
    }));
    exportAppliedJobs(jobsForExport);
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
    setAppliedJobs([]);
  };

  const filteredJobs = useMemo(() => {
    return appliedJobs.filter(job => {
      const matchesSearch = 
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [appliedJobs, searchTerm, categoryFilter]);

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
  }, [searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(appliedJobs.map(job => job.category));
    return Array.from(cats).sort();
  }, [appliedJobs]);

  const stats = useMemo(() => {
    return {
      applied: appliedJobs.length,
    };
  }, [appliedJobs]);

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
          <h1 className="text-4xl font-bold mb-2">Applied Jobs</h1>
          <p className="text-muted-foreground">
            Jobs you've marked as applied from {' '}
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Jobs
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.applied}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter applied jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search company, role, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Remove</TableHead>
                  <TableHead className="w-[200px]">Company</TableHead>
                  <TableHead className="w-[250px]">Role</TableHead>
                  <TableHead className="w-[180px]">Location</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead className="w-[120px]">Applied Date</TableHead>
                  <TableHead className="w-[80px]">Age</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No applied jobs found. Start applying from the main page!
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedJobs.map((job) => (
                    <TableRow 
                      key={job.job_id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={(e) => {
                        // Don't navigate if clicking on checkbox or button
                        if ((e.target as HTMLElement).closest('[role="checkbox"]') || 
                            (e.target as HTMLElement).closest('button')) {
                          return;
                        }
                        if (job.application_url) {
                          window.open(job.application_url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => handleToggleApplied(job)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{job.company}</TableCell>
                      <TableCell>{job.role}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {job.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatAppliedDate(job.applied_at)}
                      </TableCell>
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
          {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} applied jobs
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
