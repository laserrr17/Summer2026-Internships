'use client';

import { useState, useEffect, useMemo } from 'react';
import { Job, fetchReadmeFromGitHub, parseReadme } from '@/lib/parseReadme';
import { loadAppliedJobs, toggleJobApplied, exportAppliedJobs } from '@/lib/storage';
import { isAuthenticated, login, logout, hasPassword } from '@/lib/auth';
import LoginForm from '@/components/LoginForm';
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

const REPO_URL = 'https://github.com/SimplifyJobs/Summer2026-Internships';

export default function AppliedJobs() {
  const [authenticated, setAuthenticated] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    // Check authentication on mount
    const isAuth = isAuthenticated();
    const hasPass = hasPassword();
    setAuthenticated(isAuth);
    setIsFirstTime(!hasPass);
    
    if (isAuth) {
      loadJobs();
    } else {
      setLoading(false);
    }
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const readme = await fetchReadmeFromGitHub();
      const parsedJobs = parseReadme(readme);
      const applied = loadAppliedJobs();
      
      // Merge applied status
      const jobsWithStatus = parsedJobs.map(job => ({
        ...job,
        applied: applied.has(job.id),
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

  const handleToggleApplied = (jobId: string) => {
    const newAppliedJobs = toggleJobApplied(jobId);
    setAppliedJobs(newAppliedJobs);
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, applied: newAppliedJobs.has(jobId) } : job
    ));
  };

  const handleExport = () => {
    exportAppliedJobs(jobs);
  };

  const handleLogin = (password: string): boolean => {
    const success = login(password);
    if (success) {
      setAuthenticated(true);
      loadJobs();
    }
    return success;
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Only show applied jobs
      if (!job.applied) return false;
      
      const matchesSearch = 
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [jobs, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(jobs.filter(j => j.applied).map(job => job.category));
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

  if (!authenticated) {
    return <LoginForm onLogin={handleLogin} isFirstTime={isFirstTime} />;
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Applied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.applied}</div>
          </CardContent>
        </Card>
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
                  <TableHead className="w-[80px]">Remove</TableHead>
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
                      No applied jobs found. Start applying from the main page!
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
                          onCheckedChange={() => handleToggleApplied(job.id)}
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
        Showing {filteredJobs.length} applied job{filteredJobs.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

