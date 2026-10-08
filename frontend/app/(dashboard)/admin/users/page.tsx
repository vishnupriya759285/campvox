'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, GET_DEPARTMENTS } from '@/graphql/queries';
import { UPDATE_USER_ROLE_MUTATION, UPDATE_USER_DEPARTMENT_MUTATION } from '@/graphql/mutations';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { Users, Shield, Building, AlertCircle, Check, Search } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const { data: usersData, loading: usersLoading, refetch } = useQuery(GET_USERS, {
    variables: { role: roleFilter || undefined },
    pollInterval: 10000,
  });

  const { data: deptData } = useQuery(GET_DEPARTMENTS);
  const departments = deptData?.departments || [];

  const [updateRole, { loading: roleUpdating }] = useMutation(UPDATE_USER_ROLE_MUTATION);
  const [updateDepartment, { loading: deptUpdating }] = useMutation(UPDATE_USER_DEPARTMENT_MUTATION);

  const users = usersData?.users || [];

  const filteredUsers = users.filter((u: any) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentAdmin?.id && newRole !== 'ADMIN') {
      const confirmed = window.confirm(
        'Warning: You are attempting to demote your own administrator account. Are you sure?',
      );
      if (!confirmed) return;
    }

    setActionFeedback(null);
    try {
      await updateRole({
        variables: { userId, role: newRole },
      });
      setActionFeedback({ type: 'success', msg: 'User role updated successfully' });
      await refetch();
    } catch (err: any) {
      setActionFeedback({ type: 'error', msg: err.message || 'Failed to update role' });
    }
  };

  const handleDeptChange = async (userId: string, departmentId: string) => {
    setActionFeedback(null);
    try {
      await updateDepartment({
        variables: { userId, departmentId: departmentId || null },
      });
      setActionFeedback({ type: 'success', msg: 'User department updated' });
      await refetch();
    } catch (err: any) {
      setActionFeedback({ type: 'error', msg: err.message || 'Failed to update department' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2rem] border border-white bg-[linear-gradient(125deg,#ffffff_0%,#e8f7f3_58%,#dceff8_100%)] p-7 shadow-card sm:p-9">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-emerald-600">Campus access</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-sage-900">
          User Management
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Review campus members, update operational roles, and assign departments.
        </p>
      </div>

      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{actionFeedback.msg}</span>
        </div>
      )}

      {/* Toolbar */}
      <Card className="p-4 bg-white/90">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-brand-border rounded-xl text-brand-text focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48 px-3.5 py-2 text-xs sm:text-sm bg-white border border-brand-border rounded-xl text-brand-text focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 outline-none"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="STAFF">Staff</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-sage-50/50 text-[11px] font-bold text-brand-muted uppercase tracking-wider border-b border-[#E2E6DF]">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6DF]/60">
              {usersLoading ? (
                <>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-muted">
                    No users match your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-sage-50/30 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-sage-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-sage-200 text-sage-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={roleUpdating}
                        className="px-2 py-1 text-xs font-semibold bg-white border border-brand-border rounded-lg text-sage-900 focus:ring-1 focus:ring-sage-500"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="FACULTY">Faculty</option>
                        <option value="STAFF">Staff</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.departmentId || ''}
                        onChange={(e) => handleDeptChange(u.id, e.target.value)}
                        disabled={deptUpdating}
                        className="px-2 py-1 text-xs bg-white border border-brand-border rounded-lg text-brand-text focus:ring-1 focus:ring-sage-500"
                      >
                        <option value="">None</option>
                        {departments.map((d: any) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted whitespace-nowrap text-xs">
                      {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : 'Recent'}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
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
