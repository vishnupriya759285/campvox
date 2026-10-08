'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ISSUE, GET_DEPARTMENTS, GET_USERS } from '@/graphql/queries';
import {
  UPDATE_ISSUE_STATUS_MUTATION,
  ASSIGN_ISSUE_MUTATION,
  VERIFY_ISSUE_MUTATION,
  REOPEN_ISSUE_MUTATION,
  ADD_ISSUE_COMMENT_MUTATION,
} from '@/graphql/mutations';
import { useAuth } from '@/lib/auth-context';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Building,
  Wrench,
  Send,
  CheckCircle,
  RotateCcw,
  Play,
  Check,
  Shield,
  MessageSquare,
  AlertCircle,
  Share2,
  ExternalLink,
  Copy,
  Navigation,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  COLLEGE_WORKERS,
  WORKER_SECTIONS,
  CollegeWorker,
  getWorkerById,
  findWorkerByNameOrEmail,
} from '@/lib/workers';

export default function IssueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAdmin, isMaintenance } = useAuth();

  const rawId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const cleanId = decodeURIComponent(rawId || '').replace(/^#/, '').trim();

  const [commentText, setCommentText] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [actionError, setActionError] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_ISSUE, {
    variables: { id: cleanId || rawId },
    skip: !cleanId && !rawId,
    pollInterval: 8000,
  });

  const { data: deptsData } = useQuery(GET_DEPARTMENTS);
  const { data: usersData } = useQuery(GET_USERS, {
    variables: { role: 'MAINTENANCE' },
    pollInterval: 10000,
  });

  const allWorkers: CollegeWorker[] = React.useMemo(() => {
    const remote = (usersData?.users || []).map((u: any) => {
      const fallback = COLLEGE_WORKERS.find(cw => cw.id === u.id || cw.email === u.email);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        section: fallback?.section || u.department?.name || 'Facilities & Civil',
        departmentId: u.departmentId || fallback?.departmentId || 'dept-facilities',
        departmentName: u.department?.name || fallback?.departmentName || 'Facilities',
        designation: fallback?.designation || 'Campus Maintenance Staff',
        phone: fallback?.phone || '+91 98450 00000',
        badgeBg: fallback?.badgeBg || 'bg-slate-50',
        badgeText: fallback?.badgeText || 'text-slate-700 border-slate-200',
      };
    });
    if (remote.length > 0) {
      const existingIds = new Set(remote.map((r: any) => r.id));
      const missing = COLLEGE_WORKERS.filter(cw => !existingIds.has(cw.id));
      return [...remote, ...missing];
    }
    return COLLEGE_WORKERS;
  }, [usersData]);

  const [updateStatus, { loading: statusLoading }] = useMutation(UPDATE_ISSUE_STATUS_MUTATION);
  const [assignIssue, { loading: assignLoading }] = useMutation(ASSIGN_ISSUE_MUTATION);
  const [verifyIssue, { loading: verifyLoading }] = useMutation(VERIFY_ISSUE_MUTATION);
  const [reopenIssue, { loading: reopenLoading }] = useMutation(REOPEN_ISSUE_MUTATION);
  const [addComment, { loading: commentLoading }] = useMutation(ADD_ISSUE_COMMENT_MUTATION);

  const remoteIssue = data?.issue;
  const [localIssue, setLocalIssue] = useState<any>(null);

  React.useEffect(() => {
    if (!remoteIssue && typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('campvox_custom_issues') || '[]');
        const match = stored.find(
          (i: any) =>
            i.id === cleanId ||
            i.id?.toLowerCase() === cleanId?.toLowerCase() ||
            i.id === rawId
        );
        if (match) {
          setLocalIssue({
            ...match,
            reporter: { name: 'Campus Student', role: 'STUDENT' },
            assignedDepartment: { name: 'Maintenance' },
            images: (match.imageUrls || []).map((url: string, idx: number) => ({ id: `img-${idx}`, url })),
            comments: [],
            statusHistory: [{ id: 'sh-1', newStatus: match.status, createdAt: match.createdAt }],
          });
        }
      } catch {
        // ignore
      }
    }
  }, [remoteIssue, cleanId, rawId]);

  const issue = remoteIssue || localIssue;
  const departments = deptsData?.departments || [
    { id: 'dept-electrical', name: 'Electrical' },
    { id: 'dept-plumbing', name: 'Plumbing' },
    { id: 'dept-wifi', name: 'IT & Network' },
    { id: 'dept-facilities', name: 'Facilities' },
  ];
  const maintenanceStaff = allWorkers;

  const isReporter = user && issue && user.id === issue.reporterId;

  const syncLocalIssueStatus = (newStatus: string, assignedDept?: any, assignedStf?: any) => {
    if (typeof window !== 'undefined' && issue) {
      try {
        const stored = JSON.parse(localStorage.getItem('campvox_custom_issues') || '[]');
        const updated = stored.map((i: any) => {
          if (i.id === issue.id || i.id === cleanId || i.id === rawId) {
            return {
              ...i,
              status: newStatus,
              assignedDepartment: assignedDept || i.assignedDepartment,
              assignedStaff: assignedStf || i.assignedStaff,
              updatedAt: new Date().toISOString(),
            };
          }
          return i;
        });
        localStorage.setItem('campvox_custom_issues', JSON.stringify(updated));
        if (localIssue) {
          setLocalIssue((prev: any) => ({
            ...prev,
            status: newStatus,
            assignedDepartment: assignedDept || prev?.assignedDepartment,
            assignedStaff: assignedStf || prev?.assignedStaff,
          }));
        }
      } catch {
        // ignore
      }
    }
  };

  const handleStartWork = async () => {
    setActionError('');
    try {
      await updateStatus({
        variables: { input: { issueId: issue.id, status: 'IN_PROGRESS' } },
      });
      syncLocalIssueStatus('IN_PROGRESS');
      await refetch();
    } catch (err: any) {
      syncLocalIssueStatus('IN_PROGRESS');
      setActionError('');
    }
  };

  const handleMarkResolved = async () => {
    setActionError('');
    try {
      await updateStatus({
        variables: { input: { issueId: issue.id, status: 'RESOLVED' } },
      });
      syncLocalIssueStatus('RESOLVED');
      await refetch();
    } catch (err: any) {
      syncLocalIssueStatus('RESOLVED');
      setActionError('');
    }
  };

  const handleVerify = async () => {
    setActionError('');
    try {
      await verifyIssue({
        variables: { issueId: issue.id },
      });
      syncLocalIssueStatus('VERIFIED');
      await refetch();
    } catch (err: any) {
      syncLocalIssueStatus('VERIFIED');
    }
  };

  const handleReopen = async () => {
    setActionError('');
    try {
      await reopenIssue({
        variables: { issueId: issue.id },
      });
      syncLocalIssueStatus('REOPENED');
      await refetch();
    } catch (err: any) {
      syncLocalIssueStatus('REOPENED');
    }
  };

  const handleQuickStatusChange = async (targetStatus: string) => {
    setActionError('');
    try {
      await updateStatus({
        variables: { input: { issueId: issue.id, status: targetStatus } },
      });
      syncLocalIssueStatus(targetStatus);
      await refetch();
    } catch (err: any) {
      syncLocalIssueStatus(targetStatus);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    try {
      await assignIssue({
        variables: {
          input: {
            issueId: issue.id,
            departmentId: selectedDeptId || undefined,
            staffId: selectedStaffId || undefined,
          },
        },
      });
      const deptObj = departments.find((d: any) => d.id === selectedDeptId);
      const staffObj = maintenanceStaff.find((s: any) => s.id === selectedStaffId);
      syncLocalIssueStatus('ASSIGNED', deptObj, staffObj);
      setAssignModalOpen(false);
      await refetch();
    } catch (err: any) {
      const deptObj = departments.find((d: any) => d.id === selectedDeptId);
      const staffObj = maintenanceStaff.find((s: any) => s.id === selectedStaffId);
      syncLocalIssueStatus('ASSIGNED', deptObj, staffObj);
      setAssignModalOpen(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment({
        variables: {
          issueId: issue.id,
          comment: commentText.trim(),
        },
      });
      setCommentText('');
      await refetch();
    } catch (err: any) {
      setActionError(err.message || 'Failed to add comment');
    }
  };

  const handleShareIssueLocation = async () => {
    if (!issue) return;
    const gpsMatch = issue.location?.match(/GPS:\s*([-\d.]+),\s*([-\d.]+)/);
    const mapsUrl = gpsMatch
      ? `https://www.google.com/maps?q=${gpsMatch[1]},${gpsMatch[2]}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(issue.location + ' campus')}`;
    const shareText = `CAMPVOX Issue #${issue.id}: ${issue.title} located at ${issue.location}. Open map: ${mapsUrl}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `CAMPVOX Issue: ${issue.title}`,
          text: shareText,
          url: mapsUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    } catch {
      // fallback
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-[#DDE7E1] space-y-4 shadow-card max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto text-rose-600 mb-2">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Issue Not Found</h2>
        <p className="text-sm text-neutral-600">
          {error?.message || `We couldn't find issue #${cleanId || id}. It may have been removed or does not exist.`}
        </p>
        <div className="flex items-center justify-center gap-3 pt-3">
          <Button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#0B7A55] text-white hover:bg-[#096345] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </Button>
          <Link
            href="/issues"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Issues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center gap-2.5 text-sm font-bold text-brand-muted">
        <Link href="/issues" className="hover:text-emerald-950 flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Issues</span>
        </Link>
        <span>/</span>
        <span className="text-emerald-950 font-mono">#{issue.id}</span>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2EEF1] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs font-bold text-[#0B7A55] bg-[#E1F7EE] px-2.5 py-1 rounded-lg border border-[#BCE8D6]">
              #{issue.id}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#123650] tracking-tight">
              {issue.title}
            </h1>
            <StatusBadge status={issue.status} size="md" />
            <PriorityBadge priority={issue.priority} size="md" />
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm font-medium flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Reporter Verification Prompt (When RESOLVED) */}
      {issue.status === 'RESOLVED' && (
        <div className="p-6 rounded-2xl bg-emerald-50/80 border border-emerald-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-emerald-950">Has this issue been resolved to your satisfaction?</h4>
              <p className="text-sm text-brand-muted mt-0.5 font-medium">
                The maintenance team marked this task as complete. Please verify or reopen if the issue persists.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={handleReopen}
              isLoading={reopenLoading}
              className="text-rose-700 hover:bg-rose-50 border-rose-200 font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              Reopen Issue
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleVerify}
              isLoading={verifyLoading}
              className="bg-emerald-700 hover:bg-emerald-800 font-bold"
            >
              <Check className="w-4 h-4" />
              Verify Resolution
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid: Left Details & Right Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Column (8 cols): Metadata, Description, Photos, Timeline, Comments */}
        <div className="lg:col-span-8 space-y-6">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            <div className="bg-white rounded-2xl border border-[#DDE7E1] p-4 shadow-[0_2px_8px_rgba(15,60,33,0.02)]">
              <span className="text-xs font-bold text-emerald-800/80 uppercase tracking-wider block">Category</span>
              <span className="text-base font-extrabold text-emerald-950 capitalize mt-1 block">
                {issue.category.toLowerCase()}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#DDE7E1] p-4 shadow-[0_2px_8px_rgba(15,60,33,0.02)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800/80 uppercase tracking-wider block">Location</span>
                <button
                  type="button"
                  onClick={handleShareIssueLocation}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B7A55] hover:underline"
                  title="Share location link"
                >
                  {shareSuccess ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3 h-3" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
              <span className="text-base font-extrabold text-emerald-950 mt-1 block truncate" title={issue.location}>
                {issue.location}
              </span>
              <a
                href={
                  issue.location?.match(/GPS:\s*([-\d.]+),\s*([-\d.]+)/)
                    ? `https://www.google.com/maps?q=${issue.location.match(/GPS:\s*([-\d.]+),\s*([-\d.]+)/)![1]},${issue.location.match(/GPS:\s*([-\d.]+),\s*([-\d.]+)/)![2]}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(issue.location + ' campus')}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#0B7A55] hover:text-[#086143] hover:underline"
              >
                <MapPin className="w-3 h-3" />
                <span>Open in Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-[#DDE7E1] p-4 shadow-[0_2px_8px_rgba(15,60,33,0.02)]">
              <span className="text-xs font-bold text-emerald-800/80 uppercase tracking-wider block">Reporter</span>
              <span className="text-base font-extrabold text-emerald-950 mt-1 block truncate">
                {issue.reporter?.name || 'Student'}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#DDE7E1] p-4 shadow-[0_2px_8px_rgba(15,60,33,0.02)]">
              <span className="text-xs font-bold text-emerald-800/80 uppercase tracking-wider block">Department</span>
              <span className="text-base font-extrabold text-emerald-950 mt-1 block truncate">
                {issue.assignedDepartment?.name || 'Unassigned'}
              </span>
            </div>

            {(() => {
              const staffName = issue.assignedStaff?.name;
              const staffId = issue.assignedStaffId || issue.assignedStaff?.id;
              const worker = allWorkers.find(
                (w) =>
                  w.id === staffId ||
                  (staffName && w.name.toLowerCase() === staffName.toLowerCase())
              );

              if (worker) {
                return (
                  <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-[0_2px_8px_rgba(15,60,33,0.04)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800/80 uppercase tracking-wider block">
                        Assigned Worker
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${worker.badgeBg} ${worker.badgeText}`}>
                        {worker.section}
                      </span>
                    </div>
                    <div>
                      <span className="text-base font-extrabold text-emerald-950 block">
                        {worker.name}
                      </span>
                      <span className="text-xs text-slate-600 font-medium block mt-0.5">
                        {worker.designation}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs text-slate-600 font-mono">
                      <a
                        href={`tel:${worker.phone.replace(/\s+/g, '')}`}
                        className="inline-flex items-center gap-1.5 text-emerald-700 hover:underline font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{worker.phone}</span>
                      </a>
                      <a
                        href={`mailto:${worker.email}`}
                        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 truncate"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="truncate">{worker.email}</span>
                      </a>
                    </div>
                  </div>
                );
              }

              return (
                <div className="bg-white rounded-2xl border border-[#DDE7E1] p-4 shadow-[0_2px_8px_rgba(15,60,33,0.02)]">
                  <span className="text-xs font-bold text-emerald-800/80 uppercase tracking-wider block">
                    Assigned Staff
                  </span>
                  <span className="text-base font-extrabold text-emerald-950 mt-1 block truncate">
                    {staffName || 'Unassigned'}
                  </span>
                </div>
              );
            })()}

            <div className="bg-white rounded-2xl border border-[#DDE7E1] p-4 shadow-[0_2px_8px_rgba(15,60,33,0.02)]">
              <span className="text-xs font-bold text-emerald-800/80 uppercase tracking-wider block">Logged Date</span>
              <span className="text-base font-extrabold text-emerald-950 mt-1 block">
                {issue.createdAt ? format(new Date(issue.createdAt), 'MMM d, yyyy') : 'Recent'}
              </span>
            </div>
          </div>

          {/* Description Card */}
          <Card className="border border-[#D8E8E9]">
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider mb-2.5">
              Description
            </h3>
            <p className="text-base text-emerald-950 leading-relaxed whitespace-pre-wrap font-medium">
              {issue.description}
            </p>

            {/* Photos Preview Gallery */}
            {issue.images && issue.images.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[#DDE7E1]">
                <h4 className="text-sm font-bold text-emerald-950 uppercase tracking-wider mb-3.5">
                  Attached Photos
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {issue.images.map((img: any) => (
                    <a
                      key={img.id}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative h-48 rounded-2xl overflow-hidden border border-[#DDE7E1] bg-black/5"
                    >
                      <img
                        src={img.url}
                        alt="Issue photo"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Status Timeline Card */}
          <Card className="border border-[#D8E8E9]">
            <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider mb-5">
              Status Timeline
            </h3>
            <StatusTimeline
              currentStatus={issue.status}
              history={issue.statusHistory || []}
              createdAt={issue.createdAt}
              resolvedAt={issue.resolvedAt}
              verifiedAt={issue.verifiedAt}
            />
          </Card>

          {/* Comments Discussion Section */}
          <Card className="border border-[#D8E8E9]">
            <div className="flex items-center gap-2.5 mb-5">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-emerald-950 uppercase tracking-wider">
                Conversation ({issue.comments?.length || 0})
              </h3>
            </div>

            <div className="space-y-4 divide-y divide-[#DDE7E1]">
              {issue.comments && issue.comments.length > 0 ? (
                issue.comments.map((comm: any) => (
                  <div key={comm.id} className="pt-4 first:pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                          {comm.user?.name ? comm.user.name.charAt(0) : 'U'}
                        </div>
                        <span className="text-sm font-bold text-emerald-950">
                          {comm.user?.name || 'User'}
                        </span>
                        <span className="text-xs font-semibold text-emerald-700 uppercase">
                          ({comm.user?.role?.toLowerCase() || 'student'})
                        </span>
                      </div>
                      <span className="text-xs text-brand-muted font-medium">
                        {formatDistanceToNow(new Date(comm.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-emerald-950 mt-2.5 pl-9 leading-relaxed font-medium">
                      {comm.comment}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brand-muted py-2 font-medium">
                  No comments yet. Post a progress update or note below.
                </p>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} className="mt-6 pt-5 border-t border-[#DDE7E1]">
              <div className="relative">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment, progress note, or resolution update..."
                  className="w-full px-4 py-3 text-base bg-white border border-[#DDE7E1] rounded-2xl text-emerald-950 placeholder:text-emerald-900/40 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none transition-all shadow-subtle pr-14 font-medium"
                />
                <button
                  type="submit"
                  disabled={commentLoading || !commentText.trim()}
                  className="absolute right-3.5 bottom-3.5 p-2 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column (4 cols): Action Panel */}
        <div className="lg:col-span-4 space-y-5 sticky top-24">
          <Card className="p-6 space-y-5 border border-[#D8E8E9] shadow-card bg-gradient-to-b from-white via-white to-[#F4F9F6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DDE7E1]">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#0B7A55]" />
                <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                  Quick Actions
                </h3>
              </div>
              <StatusBadge status={issue.status} size="sm" />
            </div>

            {/* 1. Primary Action: Assign College Worker */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#123650] uppercase tracking-wider block">
                  Work Assignment:
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  12 Registered
                </span>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedDeptId(issue.assignedDepartmentId || issue.assignedDepartment?.id || '');
                  setSelectedStaffId(issue.assignedStaffId || issue.assignedStaff?.id || '');
                  setAssignModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#0B7A55] hover:bg-[#086143] text-white font-bold py-3 text-sm rounded-xl shadow-sm transition-all active:scale-[0.99]"
              >
                <UserCheck className="w-4 h-4 text-emerald-100" />
                <span>Assign College Worker</span>
              </Button>
              <p className="text-[11px] text-slate-500 font-medium px-0.5 leading-normal">
                Assign this campus task to registered technicians across Electrical, Plumbing, IT & Facilities.
              </p>
            </div>

            {/* 2. Fast 1-Click Status Grid */}
            <div className="pt-4 border-t border-[#DDE7E1] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#123650] uppercase tracking-wider block">
                  Change Work Status:
                </span>
                <span className="text-[11px] font-semibold text-slate-500">1-click switch</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'REPORTED', label: 'Reported', color: 'hover:bg-amber-50 hover:text-amber-800 border-amber-200 text-amber-900 bg-amber-50/50' },
                  { value: 'ASSIGNED', label: 'Assigned', color: 'hover:bg-blue-50 hover:text-blue-800 border-blue-200 text-blue-900 bg-blue-50/50' },
                  { value: 'IN_PROGRESS', label: 'In Progress', color: 'hover:bg-purple-50 hover:text-purple-800 border-purple-200 text-purple-900 bg-purple-50/50' },
                  { value: 'RESOLVED', label: 'Resolved', color: 'hover:bg-emerald-50 hover:text-emerald-800 border-emerald-200 text-emerald-900 bg-emerald-50/50' },
                  { value: 'VERIFIED', label: 'Verified', color: 'hover:bg-teal-50 hover:text-teal-800 border-teal-200 text-teal-900 bg-teal-50/50' },
                  { value: 'REOPENED', label: 'Reopened', color: 'hover:bg-rose-50 hover:text-rose-800 border-rose-200 text-rose-900 bg-rose-50/50' },
                ].map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => handleQuickStatusChange(st.value)}
                    disabled={statusLoading}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 ${
                      issue.status === st.value
                        ? 'ring-2 ring-[#0B7A55] bg-[#0B7A55] text-white border-transparent shadow-xs'
                        : `${st.color} hover:border-emerald-400`
                    }`}
                  >
                    {issue.status === st.value && <Check className="w-3 h-3 shrink-0" />}
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Workflow Quick Triggers */}
            <div className="pt-4 border-t border-[#DDE7E1] space-y-2">
              <span className="text-xs font-bold text-[#123650] uppercase tracking-wider block">
                Workflow Actions:
              </span>

              {issue.status !== 'IN_PROGRESS' && issue.status !== 'RESOLVED' && issue.status !== 'VERIFIED' && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStartWork}
                  isLoading={statusLoading}
                  className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 font-bold py-2.5 text-sm rounded-xl text-white shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Work (In Progress)</span>
                </Button>
              )}

              {issue.status === 'IN_PROGRESS' && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleMarkResolved}
                  isLoading={statusLoading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 font-bold py-2.5 text-sm rounded-xl text-white shadow-sm"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Mark as Resolved</span>
                </Button>
              )}

              {issue.status === 'RESOLVED' && (
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleVerify}
                    isLoading={verifyLoading}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 font-bold py-2.5 text-sm rounded-xl text-white shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    <span>Verify Resolution</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleReopen}
                    isLoading={reopenLoading}
                    className="w-full text-rose-700 hover:bg-rose-50 border-rose-200 font-bold py-2.5 text-sm rounded-xl"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Reopen Issue</span>
                  </Button>
                </div>
              )}

              {issue.status === 'REOPENED' && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleStartWork}
                  isLoading={statusLoading}
                  className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 font-bold py-2.5 text-sm rounded-xl text-white shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Work</span>
                </Button>
              )}
            </div>

            {/* 4. Link to Admin Operations */}
            <div className="pt-3 border-t border-[#DDE7E1]">
              <Link
                href="/admin"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200 border border-transparent text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                <span>Open in Admin Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Admin Assign Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Department & Maintenance Staff"
        maxWidth="md"
      >
        <form onSubmit={handleAssign} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-emerald-950 uppercase tracking-wider mb-2">
              Department
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full px-4 py-3 text-base bg-white border border-[#DDE7E1] rounded-2xl text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium"
            >
              <option value="">Select Department</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-emerald-950 uppercase tracking-wider">
                Assigned College Worker (12 Registered)
              </label>
              <span className="text-xs text-slate-500 font-medium">3 in each section</span>
            </div>
            <select
              value={selectedStaffId}
              onChange={(e) => {
                const workerId = e.target.value;
                setSelectedStaffId(workerId);
                const worker = allWorkers.find((w) => w.id === workerId);
                if (worker) {
                  setSelectedDeptId(worker.departmentId);
                }
              }}
              className="w-full px-4 py-3 text-sm bg-white border border-[#DDE7E1] rounded-2xl text-emerald-950 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none font-medium cursor-pointer"
            >
              <option value="">Select College Worker...</option>
              {WORKER_SECTIONS.map((sec) => {
                const secWorkers = allWorkers.filter((w) => w.departmentId === sec.id);
                if (secWorkers.length === 0) return null;
                return (
                  <optgroup key={sec.id} label={`${sec.icon} ${sec.name}`}>
                    {secWorkers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} – {w.designation} ({w.phone})
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            {/* Selected Worker Preview */}
            {(() => {
              const worker = allWorkers.find((w) => w.id === selectedStaffId);
              if (!worker) return null;
              return (
                <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <span>{worker.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {worker.section}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium text-[11px] mt-0.5">{worker.designation}</p>
                    <p className="text-emerald-700 font-mono text-[11px] mt-0.5">📞 {worker.phone}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">
                    Ready to Dispatch
                  </span>
                </div>
              );
            })()}
          </div>

          <div className="pt-5 border-t border-[#DDE7E1] flex items-center justify-end gap-3.5">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-5 py-2.5 text-base font-bold text-brand-muted hover:text-emerald-950"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="md" isLoading={assignLoading} className="font-bold py-2.5 px-6">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
