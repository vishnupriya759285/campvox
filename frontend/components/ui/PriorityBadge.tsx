import React from 'react';

export type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface PriorityBadgeProps {
  priority: PriorityType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriorityBadge({ priority, size = 'md', className = '' }: PriorityBadgeProps) {
  const normalized = (priority || 'MEDIUM').toUpperCase() as PriorityType;

  const config: Record<PriorityType, { label: string; bg: string; text: string; border: string }> = {
    LOW: {
      label: 'Low',
      bg: 'bg-slate-100',
      text: 'text-slate-800',
      border: 'border-slate-200',
    },
    MEDIUM: {
      label: 'Medium',
      bg: 'bg-amber-100/70',
      text: 'text-amber-900',
      border: 'border-amber-300',
    },
    HIGH: {
      label: 'High',
      bg: 'bg-orange-100/80',
      text: 'text-orange-950',
      border: 'border-orange-300',
    },
    CRITICAL: {
      label: 'Critical',
      bg: 'bg-rose-100',
      text: 'text-rose-950',
      border: 'border-rose-300',
    },
  };

  const current = config[normalized] || config.MEDIUM;

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs font-semibold',
    md: 'px-3 py-1.5 text-sm font-bold',
    lg: 'px-4 py-2 text-base font-extrabold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border ${current.bg} ${current.text} ${current.border} ${sizeStyles[size]} ${className}`}
    >
      {current.label}
    </span>
  );
}
