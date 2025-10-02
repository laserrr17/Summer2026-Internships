'use client';

import { useState, useEffect, useMemo } from 'react';
import { Job, fetchReadmeFromGitHub, parseReadme } from '@/lib/parseReadme';
import { signIn, signUp, signOut, onAuthStateChange } from '@/lib/authService';
import { getAppliedJobs, toggleJobApplication } from '@/lib/jobService';
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
import { RefreshCw, Download, ExternalLink, LogOut, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';

const REPO_URL = 'https://github.com/SimplifyJobs/Summer2026-Internships';

export default function JobTracker() {
  const [user, setUser] = useState<User | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Map<string, string>>(new Map()); // job_id -> applied_at
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

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
      const [readme, applied] = await Promise.all([
        fetchReadmeFromGitHub(),
        getAppliedJobs()
      ]);
      
      const parsedJobs = parseReadme(readme);
      
      // Merge applied status and timestamp
      const jobsWithStatus = parsedJobs.map(job => ({
        ...job,
        applied: applied.has(job.id),
        appliedAt: applied.get(job.id),
      }));
      
      setJobs(jobsWithStatus);
      setAppliedJobs(applied);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      alert('Failed to load job listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApplied = async (job: Job) => {
    const currentlyApplied = appliedJobs.has(job.id);
    
    // Optimistic update
    const newAppliedJobs = new Map(appliedJobs);
    if (currentlyApplied) {
      newAppliedJobs.delete(job.id);
    } else {
      newAppliedJobs.set(job.id, new Date().toISOString());
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
      setJobs(jobs.map(j => 
        j.id === job.id ? { ...j, applied: currentlyApplied, appliedAt: appliedJobs.get(job.id) } : j
      ));
      alert('Failed to update application status. Please try again.');
    }
  };

  const handleExport = () => {
    exportAppliedJobs(jobs);
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
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Hide applied jobs from main list
      if (job.applied) return false;
      
      const matchesSearch = 
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [jobs, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(jobs.map(job => job.category));
    return Array.from(cats).sort();
  }, [jobs]);

  const stats = useMemo(() => {
    const applied = jobs.filter(j => j.applied).length;
    return {
      total: jobs.length,
      applied,
      remaining: jobs.length - applied,
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
          <h1 className="text-4xl font-bold mb-2">Summer 2026 Internship Tracker</h1>
          <p className="text-muted-foreground">
            Track your applications from {' '}
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
          <Link href="/applied">
            <Button variant="outline" size="sm">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Applied Jobs ({stats.applied})
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.remaining}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter job listings</CardDescription>
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
              <Button onClick={loadJobs} variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={handleExport} variant="outline" size="icon">
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
                  <TableHead className="w-[80px]">Applied</TableHead>
                  <TableHead className="w-[200px]">Company</TableHead>
                  <TableHead className="w-[250px]">Role</TableHead>
                  <TableHead className="w-[180px]">Location</TableHead>
                  <TableHead className="w-[120px]">Category</TableHead>
                  <TableHead className="w-[80px]">Age</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No jobs found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job) => (
                    <TableRow 
                      key={job.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={(e) => {
                        // Don't navigate if clicking on checkbox
                        if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
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
                      <TableCell className="font-medium">{job.company}</TableCell>
                      <TableCell>{job.role}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="whitespace-nowrap">
                          {job.category}
                        </Badge>
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

      <div className="mt-4 text-sm text-muted-foreground text-center">
        Showing {filteredJobs.length} of {stats.remaining} available jobs
      </div>
    </div>
  );
}
