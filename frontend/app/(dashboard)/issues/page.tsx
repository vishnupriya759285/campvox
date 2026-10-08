'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_ISSUES, GET_DEPARTMENTS } from '@/graphql/queries';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Card } from '@/components/ui/Card';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function IssuesListContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [priority, setPriority] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const { data: deptData } = useQuery(GET_DEPARTMENTS);
  const departments = deptData?.departments || [];

  const { data, loading, refetch } = useQuery(GET_ISSUES, {
    variables: {
      filter: {
        status: status || undefined,
        category: category || undefined,
        priority: priority || undefined,
        departmentId: departmentId || undefined,
        search: search || undefined,
      },
    },
    pollInterval: 10000,
  });

  const remoteIssues = data?.issues || [];
  const [localIssues, setLocalIssues] = useState<any[]>([]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('campvox_custom_issues') || '[]');
        setLocalIssues(stored);
      } catch {
        // ignore
      }
    }
  }, []);

  const issues = React.useMemo(() => {
    const existingIds = new Set(remoteIssues.map((i: any) => i.id));
    const extra = localIssues.filter((i) => !existingIds.has(i.id));
    return [...extra, ...remoteIssues];
  }, [remoteIssues, localIssues]);

  // Client-side pagination
  const totalItems = issues.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedIssues = issues.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => {
    setSearch('');
    setStatus('');
    setCategory('');
    setPriority('');
    setDepartmentId('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2EEF1] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#123650]">
            Campus Issues
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 font-normal">
            Search, filter, and track reported maintenance requests.
          </p>
        </div>

        <Link
          href="/issues/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#0B7A55] hover:bg-[#086143] shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Campus Zones Quick Filter / Sort Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
        <span className="text-slate-400 text-xs uppercase tracking-wider shrink-0 mr-1">Zones:</span>
        {[
          { label: 'All Campus', query: '' },
          { label: 'Institution', query: 'Institution' },
          { label: 'Hostel', query: 'Hostel' },
          { label: 'Staff Quarters', query: 'Quarters' },
          { label: 'Guest House', query: 'Guest House' },
        ].map((zone) => {
          const isSelected = zone.query === '' ? !search : search.toLowerCase().includes(zone.query.toLowerCase());
          return (
            <button
              key={zone.label}
              onClick={() => {
                setSearch(zone.query);
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all shrink-0 border text-xs sm:text-sm ${
                isSelected
                  ? 'bg-[#0B7A55] text-white border-[#0B7A55] shadow-sm'
                  : 'bg-white text-[#475569] border-[#E2EEF1] hover:bg-[#F0F7F4] hover:text-[#0B7A55]'
              }`}
            >
              {zone.label}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <Card className="p-5 border border-[#D8E8E9] bg-white/90">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
          {/* Keyword Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-800/60" />
            <input
              type="text"
              placeholder="Search title, ID, location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 text-sm sm:text-base bg-white border border-[#DDE7E1] rounded-xl text-emerald-950 placeholder:text-emerald-900/40 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium shadow-subtle"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border border-[#DDE7E1] rounded-xl text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium shadow-subtle"
          >
            <option value="">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="VERIFIED">Verified</option>
            <option value="REOPENED">Reopened</option>
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border border-[#DDE7E1] rounded-xl text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium shadow-subtle"
          >
            <option value="">All Categories</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="WIFI">Wi-Fi</option>
            <option value="FURNITURE">Furniture</option>
            <option value="CLEANING">Cleaning</option>
            <option value="CLASSROOM">Classroom</option>
            <option value="LABORATORY">Laboratory</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-white border border-[#DDE7E1] rounded-xl text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium shadow-subtle"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        {(search || status || category || priority || departmentId) && (
          <div className="mt-4 pt-3.5 border-t border-[#DDE7E1] flex items-center justify-between">
            <span className="text-sm text-brand-muted font-medium">
              Filtered results: <strong className="text-emerald-950">{totalItems} issues</strong>
            </span>
            <button
              onClick={resetFilters}
              className="text-sm text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset filters
            </button>
          </div>
        )}
      </Card>

      {/* Issues Table */}
      <Card className="overflow-hidden p-0 border border-[#D8E8E9] shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50/70 text-xs sm:text-sm font-extrabold text-emerald-950 uppercase tracking-wider border-b border-[#DDE7E1]">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-5">Issue</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Location</th>
                <th className="py-4 px-5">Priority</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Created</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE7E1]/80 text-sm sm:text-base">
              {loading ? (
                <>
                  <TableRowSkeleton cols={8} />
                  <TableRowSkeleton cols={8} />
                  <TableRowSkeleton cols={8} />
                </>
              ) : paginatedIssues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-brand-muted">
                    <p className="text-base font-semibold">No issues match your current filters.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-3 text-sm font-bold text-emerald-700 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedIssues.map((issue: any) => (
                  <tr key={issue.id} className="hover:bg-emerald-50/40 transition-colors group">
                    <td className="py-4 px-6 font-mono text-sm sm:text-base font-bold text-emerald-800">
                      #{issue.id}
                    </td>
                    <td className="py-4 px-5 font-bold text-emerald-950">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="group-hover:text-emerald-700 transition-colors hover:underline"
                      >
                        {issue.title}
                      </Link>
                    </td>
                    <td className="py-4 px-5 text-emerald-900 font-medium capitalize">
                      {issue.category.toLowerCase()}
                    </td>
                    <td className="py-4 px-5 text-brand-muted font-medium">{issue.location}</td>
                    <td className="py-4 px-5">
                      <PriorityBadge priority={issue.priority} size="md" />
                    </td>
                    <td className="py-4 px-5">
                      <StatusBadge status={issue.status} size="md" />
                    </td>
                    <td className="py-4 px-5 text-brand-muted text-xs sm:text-sm whitespace-nowrap font-medium">
                      {issue.createdAt
                        ? formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })
                        : 'Recently'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs sm:text-sm bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-950 transition-colors"
                        title="View details"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-[#DDE7E1] flex items-center justify-between text-sm text-brand-muted font-medium bg-[#F8FAF9]">
          <span>
            Page <strong className="text-emerald-950">{currentPage}</strong> of <strong className="text-emerald-950">{totalPages}</strong> ({totalItems} total issues)
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-[#DDE7E1] bg-white disabled:opacity-30 hover:bg-emerald-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-950" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-[#DDE7E1] bg-white disabled:opacity-30 hover:bg-emerald-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-emerald-950" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function IssuesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-base font-semibold text-emerald-900">Loading campus issues...</div>}>
      <IssuesListContent />
    </Suspense>
  );
}
