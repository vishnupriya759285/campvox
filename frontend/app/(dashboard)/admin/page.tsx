'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ANALYTICS_OVERVIEW, GET_ISSUES, GET_DEPARTMENTS, GET_USERS } from '@/graphql/queries';
import { UPDATE_ISSUE_STATUS_MUTATION, ASSIGN_ISSUE_MUTATION } from '@/graphql/mutations';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatCardSkeleton, TableRowSkeleton } from '@/components/ui/Skeleton';
import {
  FileText,
  AlertCircle,
  Wrench,
  Clock,
  CheckCircle2,
  Check,
  CheckCircle,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Users,
  Building,
  Edit3,
  Play,
  Shield,
  Phone,
  Mail,
  Zap,
  Droplets,
  Wifi,
  Hammer,
  UserCheck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  COLLEGE_WORKERS,
  WORKER_SECTIONS,
  CollegeWorker,
  getWorkerById,
  findWorkerByNameOrEmail,
} from '@/lib/workers';

export default function AdminDashboardPage() {
  const { data: analyticsData, loading: analyticsLoading, refetch: refetchAnalytics } = useQuery(GET_ANALYTICS_OVERVIEW, {
    pollInterval: 10000,
  });

  const { data: issuesData, loading: issuesLoading, refetch: refetchIssues } = useQuery(GET_ISSUES, {
    variables: { filter: {} },
    pollInterval: 10000,
  });

  const { data: deptData } = useQuery(GET_DEPARTMENTS);
  const departments = deptData?.departments || [
    { id: 'dept-electrical', name: 'Electrical' },
    { id: 'dept-plumbing', name: 'Plumbing' },
    { id: 'dept-wifi', name: 'IT & Network' },
    { id: 'dept-facilities', name: 'Facilities' },
  ];

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

  const [updateIssueStatus] = useMutation(UPDATE_ISSUE_STATUS_MUTATION);
  const [assignIssue] = useMutation(ASSIGN_ISSUE_MUTATION);

  // Edit Modal State
  const [editingIssue, setEditingIssue] = React.useState<any | null>(null);
  const [editStatus, setEditStatus] = React.useState<string>('REPORTED');
  const [editPriority, setEditPriority] = React.useState<string>('HIGH');
  const [editDeptId, setEditDeptId] = React.useState<string>('');
  const [editStaffId, setEditStaffId] = React.useState<string>('');
  const [editStaffName, setEditStaffName] = React.useState<string>('');
  const [workerFilterSection, setWorkerFilterSection] = React.useState<string>('ALL');
  const [isSavingAction, setIsSavingAction] = React.useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = React.useState<string>('');
  const [actionErrorMsg, setActionErrorMsg] = React.useState<string>('');

  const [localIssues, setLocalIssues] = React.useState<any[]>([]);

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

  const remoteIssues = issuesData?.issues || [];

  const allIssues = React.useMemo(() => {
    const existingIds = new Set(remoteIssues.map((i: any) => i.id));
    const extra = localIssues.filter((i) => !existingIds.has(i.id));
    return [...extra, ...remoteIssues];
  }, [remoteIssues, localIssues]);

  const recentIssues = allIssues;

  const rawStats = analyticsData?.issueStatistics || {
    total: 12,
    reported: 4,
    assigned: 2,
    inProgress: 3,
    resolved: 3,
    verified: 0,
    reopened: 0,
  };

  const extraIssues = React.useMemo(() => {
    const existingIds = new Set(remoteIssues.map((i: any) => i.id));
    return localIssues.filter((i) => !existingIds.has(i.id));
  }, [remoteIssues, localIssues]);

  const extraReported = extraIssues.filter(i => (i.status || 'REPORTED') === 'REPORTED').length;

  const stats = {
    ...rawStats,
    total: rawStats.total + extraIssues.length,
    reported: rawStats.reported + extraReported,
  };

  const categories = analyticsData?.issuesByCategory || [];
  const locations = analyticsData?.issuesByLocation || [];
  const workloads = analyticsData?.issuesByDepartment || [];

  // Colors matching the CAMPVOX design system
  const PIE_COLORS = [
    '#168461', '#E9A23B', '#7666B8', '#55A879', '#5E90AA', '#E98675', '#123650', '#9AB0BE', '#A7DCC8',
  ];

  const statusCards = [
    { label: 'Total Issues', count: stats.total, color: 'text-[#123650]', border: 'border-slate-200' },
    { label: 'Reported', count: stats.reported, color: 'text-[#8C662B]', border: 'border-[#EBDBC6]' },
    { label: 'Assigned', count: stats.assigned, color: 'text-[#485968]', border: 'border-[#D9E1E7]' },
    { label: 'In Progress', count: stats.inProgress, color: 'text-[#5B4972]', border: 'border-[#E0D8EB]' },
    { label: 'Resolved', count: stats.resolved, color: 'text-[#46664F]', border: 'border-[#D2E2D6]' },
    { label: 'Verified', count: stats.verified, color: 'text-[#294438]', border: 'border-[#C5D7C8]' },
    { label: 'Reopened', count: stats.reopened, color: 'text-[#923C31]', border: 'border-[#F4D1CD]' },
  ];

  const categoryChartData = categories
    .filter((c: any) => c.count > 0)
    .map((c: any) => ({
      name: c.category.charAt(0) + c.category.slice(1).toLowerCase(),
      value: c.count,
    }));

  const locationChartData = locations.map((l: any) => ({
    name: l.location,
    count: l.count,
  }));

  const handleOpenEdit = (issue: any) => {
    setEditingIssue(issue);
    setEditStatus(issue.status || 'REPORTED');
    setEditPriority(issue.priority || 'HIGH');

    // Auto-detect department if empty
    let defaultDept = issue.assignedDepartmentId || issue.assignedDepartment?.id || '';
    if (!defaultDept && issue.category) {
      const cat = (issue.category || '').toUpperCase();
      if (cat === 'ELECTRICAL') defaultDept = 'dept-electrical';
      else if (cat === 'PLUMBING') defaultDept = 'dept-plumbing';
      else if (cat === 'WIFI') defaultDept = 'dept-wifi';
      else defaultDept = 'dept-facilities';
    }
    setEditDeptId(defaultDept);

    // Auto-match assigned worker
    const assignedId = issue.assignedStaffId || issue.assignedStaff?.id || '';
    const assignedName = issue.assignedStaff?.name || '';
    const matchedWorker = allWorkers.find(
      (w) => w.id === assignedId || (assignedName && w.name.toLowerCase() === assignedName.toLowerCase())
    );

    if (matchedWorker) {
      setEditStaffId(matchedWorker.id);
      setEditStaffName(matchedWorker.name);
      if (!issue.assignedDepartmentId && !issue.assignedDepartment?.id) {
        setEditDeptId(matchedWorker.departmentId);
      }
    } else {
      setEditStaffId(assignedId);
      setEditStaffName(assignedName);
    }

    setWorkerFilterSection('ALL');
    setActionErrorMsg('');
    setActionSuccessMsg('');
  };

  const handleSelectWorker = (workerId: string) => {
    if (!workerId) {
      setEditStaffId('');
      setEditStaffName('');
      return;
    }
    const worker = allWorkers.find((w) => w.id === workerId);
    if (worker) {
      setEditStaffId(worker.id);
      setEditStaffName(worker.name);
      setEditDeptId(worker.departmentId);
      if (editStatus === 'REPORTED') {
        setEditStatus('ASSIGNED');
      }
    }
  };

  const selectedActiveWorker = React.useMemo(() => {
    return allWorkers.find((w) => w.id === editStaffId) || null;
  }, [allWorkers, editStaffId]);

  const handleSaveAction = async (overrideStatus?: string) => {
    if (!editingIssue) return;
    setIsSavingAction(true);
    setActionErrorMsg('');

    // Auto-elevate to ASSIGNED if worker is chosen while in REPORTED state
    let targetStatus = overrideStatus || editStatus;
    if (!overrideStatus && targetStatus === 'REPORTED' && editStaffId) {
      targetStatus = 'ASSIGNED';
    }

    try {
      await updateIssueStatus({
        variables: {
          input: {
            issueId: editingIssue.id,
            status: targetStatus,
          },
        },
      });

      if (editDeptId || editStaffId || editStaffName) {
        await assignIssue({
          variables: {
            input: {
              issueId: editingIssue.id,
              departmentId: editDeptId || null,
              staffId: editStaffId || (editStaffName ? `staff-${Date.now()}` : null),
            },
          },
        });
      }

      const selectedDeptObj = departments.find((d: any) => d.id === editDeptId);
      const selectedWorker = allWorkers.find((w) => w.id === editStaffId);

      const updatedIssue = {
        ...editingIssue,
        status: targetStatus,
        priority: editPriority,
        assignedDepartmentId: editDeptId || null,
        assignedDepartment: selectedDeptObj
          ? { id: selectedDeptObj.id, name: selectedDeptObj.name }
          : editingIssue.assignedDepartment,
        assignedStaffId: editStaffId || null,
        assignedStaff: selectedWorker
          ? { id: selectedWorker.id, name: selectedWorker.name }
          : (editStaffName ? { id: editStaffId || 'staff-assigned', name: editStaffName } : editingIssue.assignedStaff),
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('campvox_custom_issues') || '[]');
          const filtered = stored.filter((i: any) => i.id !== editingIssue.id);
          localStorage.setItem('campvox_custom_issues', JSON.stringify([updatedIssue, ...filtered]));
          setLocalIssues([updatedIssue, ...filtered]);
        } catch {
          // ignore
        }
      }

      refetchIssues();
      refetchAnalytics();

      const workerNotice = selectedWorker ? ` & assigned to ${selectedWorker.name} (${selectedWorker.section})` : '';
      setActionSuccessMsg(`Issue #${editingIssue.id} updated to ${targetStatus}${workerNotice}!`);
      setTimeout(() => {
        setEditingIssue(null);
        setActionSuccessMsg('');
      }, 900);
    } catch (err: any) {
      console.warn('Action save fallback triggered:', err);
      const selectedDeptObj = departments.find((d: any) => d.id === editDeptId);
      const updatedIssue = {
        ...editingIssue,
        status: targetStatus,
        priority: editPriority,
        assignedDepartmentId: editDeptId || null,
        assignedDepartment: selectedDeptObj ? { id: selectedDeptObj.id, name: selectedDeptObj.name } : editingIssue.assignedDepartment,
        assignedStaff: editStaffName ? { id: 'staff-assigned', name: editStaffName } : editingIssue.assignedStaff,
        updatedAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        try {
          const stored = JSON.parse(localStorage.getItem('campvox_custom_issues') || '[]');
          const filtered = stored.filter((i: any) => i.id !== editingIssue.id);
          localStorage.setItem('campvox_custom_issues', JSON.stringify([updatedIssue, ...filtered]));
          setLocalIssues([updatedIssue, ...filtered]);
        } catch {
          // ignore
        }
      }

      setActionSuccessMsg(`Issue #${editingIssue.id} updated!`);
      setTimeout(() => {
        setEditingIssue(null);
        setActionSuccessMsg('');
      }, 900);
    } finally {
      setIsSavingAction(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white bg-[linear-gradient(125deg,#ffffff_0%,#e8f7f3_58%,#dceff8_100%)] p-7 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-9">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-emerald-600">Campus command centre</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-sans font-bold tracking-tight text-[#123650]">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Overview of campus issues, assignments, and facilities performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-[#E2E6DF] rounded-xl hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            Manage Users
          </Link>
          <Link
            href="/admin/departments"
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-[#E2E6DF] rounded-xl hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <Building className="w-3.5 h-3.5" />
            Departments
          </Link>
        </div>
      </div>

      {/* 7 Status Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {analyticsLoading ? (
          Array.from({ length: 7 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          statusCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl border ${card.border} p-4 shadow-card flex flex-col justify-between hover:-translate-y-0.5 transition-transform`}
            >
              <span className="text-[11px] font-semibold text-brand-muted truncate">
                {card.label}
              </span>
              <span className={`text-2xl font-sans font-extrabold ${card.color} mt-2`}>
                {card.count}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Charts Grid: Issues by Category & Issues by Location */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Donut Chart (6 cols) */}
        <Card className="lg:col-span-6 p-6">
          <h3 className="text-sm font-bold text-[#123650] mb-4">
            Issues by Category
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-48 h-48 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData.length > 0 ? categoryChartData : [{ name: 'None', value: 1 }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-sans text-[#123650]">{stats.total}</span>
                <span className="text-[10px] text-brand-muted">Total</span>
              </div>
            </div>

            {/* Category Breakdown Legend */}
            <div className="flex-1 grid grid-cols-1 gap-2 w-full max-h-48 overflow-y-auto text-xs">
              {categories.map((cat: any, idx: number) => (
                <div key={cat.category} className="flex items-center justify-between py-1 border-b border-brand-border/40">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="capitalize text-slate-800 font-medium">
                      {cat.category.toLowerCase()}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-[#123650]">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Location Bar Chart (6 cols) */}
        <Card className="lg:col-span-6 p-6">
          <h3 className="text-sm font-bold text-[#123650] mb-4">
            Issues by Location
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationChartData}>
                <XAxis dataKey="name" stroke="#69746D" fontSize={11} tickLine={false} />
                <YAxis stroke="#69746D" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#5F8069" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Department Workload Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E6DF] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#123650]">Department Workload</h3>
            <p className="text-xs text-brand-muted">Active ticket distribution per maintenance team.</p>
          </div>
          <Link
            href="/admin/departments"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Manage Departments
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/70 text-[11px] font-bold text-brand-muted uppercase tracking-wider border-b border-[#E2E6DF]">
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-4">Open</th>
                <th className="py-3 px-4">In Progress</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6DF]/60">
              {workloads.map((dept: any) => (
                <tr key={dept.departmentId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-[#123650]">{dept.departmentName}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-amber-700">
                    {dept.openCount}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-purple-700">
                    {dept.inProgressCount}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                    {dept.resolvedCount}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Operational
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Issues Table with Quick Detail link */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#123650]">Recent Campus Issues</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Live Dispatch Ready
              </span>
            </div>
            <p className="text-xs text-brand-muted mt-0.5">
              Click <strong className="text-[#0B7A55]">"Quick Actions"</strong> or <strong className="text-[#0B7A55]">"+ Assign Worker"</strong> on any row below to assign college workers & switch statuses.
            </p>
          </div>
          <Link
            href="/issues"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-center"
          >
            View all issues
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/70 text-[11px] font-bold text-brand-muted uppercase tracking-wider border-b border-[#E2E6DF]">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-4">Issue</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-6 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6DF]/60">
              {recentIssues.slice(0, 10).map((issue: any) => (
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
                  <td className="py-3.5 px-4 text-brand-text capitalize text-xs">
                    {issue.category.toLowerCase()}
                  </td>
                  <td className="py-3.5 px-4 text-brand-muted text-xs">{issue.location}</td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={issue.priority} size="sm" />
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(issue)}
                      className="hover:opacity-80 transition-opacity text-left"
                      title="Click to change status"
                    >
                      <StatusBadge status={issue.status} size="sm" />
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-brand-text text-xs">
                    {issue.assignedDepartment?.name || 'Unassigned'}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
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
                          <div
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[#123650]"
                            title={`${worker.name} • ${worker.designation} • ${worker.phone}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span className="font-bold text-xs text-emerald-950">{worker.name}</span>
                            <span className="text-[10px] font-semibold text-slate-500">
                              ({worker.section})
                            </span>
                          </div>
                        );
                      }
                      if (staffName) {
                        return (
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {staffName}
                          </span>
                        );
                      }
                      return (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(issue)}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50/70 hover:bg-emerald-100 border border-dashed border-emerald-300 px-2 py-0.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <span>+ Assign Worker</span>
                        </button>
                      );
                    })()}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(issue)}
                        className="px-3 py-1.5 text-xs font-bold text-[#0B7A55] bg-[#E1F7EE] hover:bg-[#0B7A55] hover:text-white rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95"
                        title="Quick Actions (Assign worker, update status)"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Quick Actions</span>
                      </button>
                      <Link
                        href={`/issues/${issue.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="View Full Details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Admin Action & Quick Edit Modal */}
      <Modal
        isOpen={!!editingIssue}
        onClose={() => setEditingIssue(null)}
        title={`Admin Actions: #${editingIssue?.id}`}
        maxWidth="lg"
      >
        {editingIssue && (
          <div className="space-y-5">
            {actionSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {actionErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionErrorMsg}</span>
              </div>
            )}

            {/* Issue Brief */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0B7A55]">#{editingIssue.id}</span>
                <span className="text-xs font-medium text-slate-500">{editingIssue.location}</span>
              </div>
              <h4 className="text-sm font-bold text-[#123650] leading-snug">{editingIssue.title}</h4>
            </div>

            {/* Quick Status Buttons */}
            <div>
              <label className="block text-xs font-bold text-[#123650] uppercase tracking-wider mb-2">
                Update Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { value: 'REPORTED', label: 'Reported', color: 'bg-amber-50 text-amber-800 border-amber-200' },
                  { value: 'ASSIGNED', label: 'Assigned', color: 'bg-blue-50 text-blue-800 border-blue-200' },
                  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-purple-50 text-purple-800 border-purple-200' },
                  { value: 'RESOLVED', label: 'Resolved', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                  { value: 'VERIFIED', label: 'Verified', color: 'bg-teal-50 text-teal-800 border-teal-200' },
                  { value: 'REOPENED', label: 'Reopened', color: 'bg-rose-50 text-rose-800 border-rose-200' },
                ].map((st) => (
                  <button
                    key={st.value}
                    type="button"
                    onClick={() => setEditStatus(st.value)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      editStatus === st.value
                        ? 'ring-2 ring-[#0B7A55] bg-[#0B7A55] text-white border-transparent shadow-sm'
                        : `${st.color} hover:opacity-80`
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority & Department Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123650] uppercase tracking-wider mb-1.5">
                  Priority Level
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-[#123650] focus:ring-2 focus:ring-[#0B7A55]/20 focus:border-[#0B7A55] outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123650] uppercase tracking-wider mb-1.5">
                  Assigned Department
                </label>
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-[#123650] focus:ring-2 focus:ring-[#0B7A55]/20 focus:border-[#0B7A55] outline-none"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* College Worker Assignment Section */}
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 p-4 space-y-3.5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0B7A55] text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#123650] uppercase tracking-wider block">
                      Assign College Worker (12 Registered)
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Select official maintenance staff from the respective campus section
                    </p>
                  </div>
                </div>

                {/* Section Filter Pills */}
                <div className="flex flex-wrap items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl text-[10px] font-bold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setWorkerFilterSection('ALL')}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      workerFilterSection === 'ALL'
                        ? 'bg-[#0B7A55] text-white shadow-xs'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    All (12)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkerFilterSection('dept-electrical')}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      workerFilterSection === 'dept-electrical'
                        ? 'bg-[#0B7A55] text-white shadow-xs'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    ⚡ Electrical
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkerFilterSection('dept-plumbing')}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      workerFilterSection === 'dept-plumbing'
                        ? 'bg-[#0B7A55] text-white shadow-xs'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    🚰 Plumbing
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkerFilterSection('dept-wifi')}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      workerFilterSection === 'dept-wifi'
                        ? 'bg-[#0B7A55] text-white shadow-xs'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    📶 IT
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkerFilterSection('dept-facilities')}
                    className={`px-2 py-0.5 rounded-lg transition-all ${
                      workerFilterSection === 'dept-facilities'
                        ? 'bg-[#0B7A55] text-white shadow-xs'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    🏢 Facilities
                  </button>
                </div>
              </div>

              {/* Worker Dropdown Selector */}
              <div>
                <select
                  value={editStaffId}
                  onChange={(e) => handleSelectWorker(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-emerald-300 rounded-xl text-[#123650] focus:ring-2 focus:ring-[#0B7A55]/20 focus:border-[#0B7A55] outline-none shadow-sm cursor-pointer"
                >
                  <option value="">-- Choose Registered College Worker --</option>
                  {WORKER_SECTIONS.filter(
                    (s) => workerFilterSection === 'ALL' || s.id === workerFilterSection
                  ).map((sec) => {
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
              </div>

              {/* Selected Worker Profile Card */}
              {selectedActiveWorker ? (
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-300">
                      {selectedActiveWorker.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#123650]">
                          {selectedActiveWorker.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${selectedActiveWorker.badgeBg} ${selectedActiveWorker.badgeText}`}
                        >
                          {selectedActiveWorker.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        {selectedActiveWorker.designation}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          {selectedActiveWorker.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {selectedActiveWorker.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      On-Duty Dispatch
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditStaffId('');
                        setEditStaffName('');
                      }}
                      className="text-[11px] font-bold text-slate-400 hover:text-rose-600 px-2 py-1 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic flex items-center gap-1.5 px-1">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Select any of the 12 registered workers above to assign work directly to their queue.
                  </span>
                </div>
              )}

              {/* Optional Custom Team Note */}
              <div className="pt-2 border-t border-emerald-100">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Assignment Note / Shift Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={editStaffName && !selectedActiveWorker ? editStaffName : ''}
                  onChange={(e) => {
                    if (!selectedActiveWorker) {
                      setEditStaffName(e.target.value);
                    }
                  }}
                  placeholder={
                    selectedActiveWorker
                      ? `Task assigned to ${selectedActiveWorker.name}`
                      : 'e.g. Bring replacement capacitor, check valve'
                  }
                  disabled={!!selectedActiveWorker}
                  className="w-full px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-[#123650] placeholder:text-slate-400 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveAction('IN_PROGRESS')}
                  disabled={isSavingAction}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Work</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAction('RESOLVED')}
                  disabled={isSavingAction}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingIssue(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveAction()}
                  isLoading={isSavingAction}
                  className="bg-[#0B7A55] hover:bg-[#086143] text-white font-bold"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
