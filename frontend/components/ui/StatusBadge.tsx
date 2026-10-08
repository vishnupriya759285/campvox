import React from 'react';

export type IssueStatusType =
  | 'REPORTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'VERIFIED'
  | 'REOPENED';

interface StatusBadgeProps {
  status: IssueStatusType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const normalized = (status || 'REPORTED').toUpperCase() as IssueStatusType;

  const config: Record<
    IssueStatusType,
    { label: string; bg: string; text: string; dot: string; border: string }
  > = {
    REPORTED: {
      label: 'Reported',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      dot: 'bg-amber-500',
      border: 'border-amber-200',
    },
    ASSIGNED: {
      label: 'Assigned',
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      dot: 'bg-slate-500',
      border: 'border-slate-200',
    },
    IN_PROGRESS: {
      label: 'In Progress',
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      dot: 'bg-purple-600',
      border: 'border-purple-200',
    },
    RESOLVED: {
      label: 'Resolved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      dot: 'bg-emerald-600',
      border: 'border-emerald-200',
    },
    VERIFIED: {
      label: 'Verified',
      bg: 'bg-emerald-100/70',
      text: 'text-emerald-950',
      dot: 'bg-emerald-700',
      border: 'border-emerald-300',
    },
    REOPENED: {
      label: 'Reopened',
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      dot: 'bg-rose-600',
      border: 'border-rose-200',
    },
  };

  const current = config[normalized] || config.REPORTED;

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
    lg: 'text-base px-4 py-2 gap-2.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeStyles[size]} transition-colors shadow-subtle ${className}`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${current.dot} shrink-0`} />
      <span>{current.label}</span>
    </span>
  );
}
