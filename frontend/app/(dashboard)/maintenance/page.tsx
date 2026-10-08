'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ASSIGNED_ISSUES } from '@/graphql/queries';
import { UPDATE_ISSUE_STATUS_MUTATION } from '@/graphql/mutations';
import { useAuth } from '@/lib/auth-context';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TableRowSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  ExternalLink,
  RotateCcw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function MaintenanceDashboardPage() {
  const { user } = useAuth();
  const [actionError, setActionError] = useState('');

  const { data, loading, refetch } = useQuery(GET_ASSIGNED_ISSUES, {
    pollInterval: 8000,
  });

  const [updateStatus, { loading: updating }] = useMutation(UPDATE_ISSUE_STATUS_MUTATION);

  const issues = data?.assignedIssues || [];

  const assignedToMe = issues.length;
  const pending = issues.filter((i: any) => i.status === 'ASSIGNED' || i.status === 'REPORTED').length;
  const inProgress = issues.filter((i: any) => i.status === 'IN_PROGRESS' || i.status === 'REOPENED').length;
  const resolved = issues.filter((i: any) => i.status === 'RESOLVED' || i.status === 'VERIFIED').length;

  const handleStartWork = async (issueId: string) => {
    setActionError('');
    try {
      await updateStatus({
        variables: { input: { issueId, status: 'IN_PROGRESS' } },
      });
      await refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to start work');
    }
  };

  const handleMarkResolved = async (issueId: string) => {
    setActionError('');
    try {
      await updateStatus({
        variables: { input: { issueId, status: 'RESOLVED' } },
      });
      await refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to mark as resolved');
    }
  };

  const statCards = [
    { title: 'Assigned to Me', value: assignedToMe, icon: Wrench, color: 'bg-sage-100 text-sage-800' },
    { title: 'Pending Work', value: pending, icon: AlertCircle, color: 'bg-amber-100 text-amber-800' },
    { title: 'In Progress', value: inProgress, icon: Clock, color: 'bg-purple-100 text-purple-800' },
    { title: 'Resolved', value: resolved, icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="rounded-[2rem] border border-white bg-[linear-gradient(125deg,#ffffff_0%,#e8f7f3_58%,#dceff8_100%)] p-7 shadow-card sm:p-9">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-emerald-600">Operations workspace</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-sage-900">
          Maintenance Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Welcome back, {user?.name || 'Technician'}. Manage your assigned repairs and operational tasks.
        </p>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          statCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl border border-[#D8E8E9] p-5 shadow-card hover:-translate-y-0.5 hover:shadow-hover transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-muted">{c.title}</span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-serif font-extrabold text-sage-900 mt-3">{c.value}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Assigned Issues Table */}
      <Card className="overflow-hidden p-0">
        <div className="px-6 py-5 border-b border-[#D8E8E9] flex items-center justify-between bg-[#F9FDFD]">
          <div>
            <h3 className="text-base font-bold text-sage-900 font-serif">Assigned Issues</h3>
            <p className="text-xs text-brand-muted">Active repair orders awaiting your dispatch.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg text-brand-muted hover:text-sage-900 hover:bg-sage-100 transition-colors"
            title="Refresh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sage-50/50 text-[11px] font-bold text-brand-muted uppercase tracking-wider border-b border-[#E2E6DF]">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-4">Issue</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reported</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6DF]/60 text-xs sm:text-sm">
              {loading ? (
                <>
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                  <TableRowSkeleton cols={7} />
                </>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-muted">
                    <p className="text-sm font-medium">No assigned tasks right now.</p>
                    <p className="text-xs text-brand-muted mt-1">
                      New maintenance requests dispatched to you will show up here.
                    </p>
                  </td>
                </tr>
              ) : (
                issues.map((issue: any) => (
                  <tr key={issue.id} className="hover:bg-sage-50/40 transition-colors group">
                    <td className="py-3.5 px-6 font-mono text-xs font-bold text-brand-muted">
                      #{issue.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-sage-900">
                      <Link
                        href={`/issues/${issue.id}`}
                        className="group-hover:text-sage-700 transition-colors"
                      >
                        {issue.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted text-xs">{issue.location}</td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={issue.priority} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={issue.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted text-xs whitespace-nowrap">
                      {issue.createdAt
                        ? formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })
                        : 'Recently'}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {issue.status !== 'IN_PROGRESS' &&
                          issue.status !== 'RESOLVED' &&
                          issue.status !== 'VERIFIED' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleStartWork(issue.id)}
                              disabled={updating}
                              className="text-xs py-1 px-2.5 gap-1 bg-sage-100 hover:bg-sage-200 text-sage-900"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Start Work
                            </Button>
                          )}

                        {issue.status === 'IN_PROGRESS' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleMarkResolved(issue.id)}
                            disabled={updating}
                            className="text-xs py-1 px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark Resolved
                          </Button>
                        )}

                        <Link
                          href={`/issues/${issue.id}`}
                          className="p-1.5 rounded-lg text-brand-muted hover:text-sage-900 hover:bg-sage-100 transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
