'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_DEPARTMENTS } from '@/graphql/queries';
import { CREATE_DEPARTMENT_MUTATION } from '@/graphql/mutations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import { Building2, Plus, AlertCircle, Check, Trash2 } from 'lucide-react';

export default function AdminDepartmentsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const { data, loading, refetch } = useQuery(GET_DEPARTMENTS, {
    pollInterval: 10000,
  });

  const [createDepartment, { loading: creating }] = useMutation(CREATE_DEPARTMENT_MUTATION);

  const departments = data?.departments || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await createDepartment({
        variables: { input: { name, description } },
      });
      setName('');
      setDescription('');
      setCreateModalOpen(false);
      setFeedback({ type: 'success', msg: 'Department created successfully' });
      await refetch();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message || 'Failed to create department' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white bg-[linear-gradient(125deg,#ffffff_0%,#e8f7f3_58%,#dceff8_100%)] p-7 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-9">
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-emerald-600">Campus operations</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-sage-900">
            Departments
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Maintain campus facilities departments and monitor their issue queues.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setCreateModalOpen(true)}
          className="self-start sm:self-auto gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Department</span>
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Departments Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-sage-50/50 text-[11px] font-bold text-brand-muted uppercase tracking-wider border-b border-[#E2E6DF]">
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Open Issues</th>
                <th className="py-3 px-4">In Progress</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E6DF]/60">
              {loading ? (
                <>
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                  <TableRowSkeleton cols={6} />
                </>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-brand-muted">
                    No departments configured.
                  </td>
                </tr>
              ) : (
                departments.map((dept: any) => (
                  <tr key={dept.id} className="hover:bg-sage-50/30 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-sage-900">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-sage-700" />
                        <span>{dept.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-brand-muted max-w-xs truncate">
                      {dept.description || 'General maintenance and repairs'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-amber-700">
                      {dept.openIssuesCount ?? 0}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-purple-700">
                      {dept.inProgressCount ?? 0}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                      {dept.resolvedCount ?? 0}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sage-100 text-sage-800 border border-sage-200">
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

      {/* Create Department Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Campus Department"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-sage-900 uppercase tracking-wider mb-1.5">
              Department Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Civil & Carpentry"
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-xl text-brand-text focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sage-900 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Responsibilities and repair scope..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-brand-border rounded-xl text-brand-text focus:ring-2 focus:ring-sage-500/20 focus:border-sage-500 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-brand-muted hover:text-sage-900"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="md" isLoading={creating}>
              Create Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
