import React from 'react';
import { format } from 'date-fns';
import { Check, Clock, AlertTriangle } from 'lucide-react';

interface StatusHistoryItem {
  id: string;
  oldStatus?: string | null;
  newStatus: string;
  createdAt: string | Date;
  changer?: {
    name: string;
    role: string;
  } | null;
}

interface StatusTimelineProps {
  currentStatus: string;
  history?: StatusHistoryItem[];
  createdAt?: string | Date;
  resolvedAt?: string | Date | null;
  verifiedAt?: string | Date | null;
}

export function StatusTimeline({
  currentStatus,
  history = [],
  createdAt,
  resolvedAt,
  verifiedAt,
}: StatusTimelineProps) {
  const steps = [
    { key: 'REPORTED', label: 'Reported' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'VERIFIED', label: 'Verified' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'REPORTED':
        return 0;
      case 'ASSIGNED':
        return 1;
      case 'IN_PROGRESS':
        return 2;
      case 'RESOLVED':
        return 3;
      case 'VERIFIED':
        return 4;
      case 'REOPENED':
        return 2; // in-progress loop
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isReopened = currentStatus === 'REOPENED';

  // Find date for each step
  const getStepDate = (key: string) => {
    if (key === 'REPORTED' && createdAt) {
      return format(new Date(createdAt), 'MMM d, h:mm a');
    }
    if (key === 'RESOLVED' && resolvedAt) {
      return format(new Date(resolvedAt), 'MMM d, h:mm a');
    }
    if (key === 'VERIFIED' && verifiedAt) {
      return format(new Date(verifiedAt), 'MMM d, h:mm a');
    }
    const match = history.find((h) => h.newStatus === key);
    if (match) {
      return format(new Date(match.createdAt), 'MMM d, h:mm a');
    }
    return null;
  };

  return (
    <div className="w-full py-4">
      {isReopened && (
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          This issue has been Reopened by the reporter and is awaiting further action.
        </div>
      )}

      <div className="relative flex items-center justify-between">
        {/* Connecting Background Line */}
        <div className="absolute left-6 right-6 top-4 h-0.5 bg-brand-border -translate-y-1/2 z-0" />

        {/* Dynamic Progress Line */}
        <div
          className="absolute left-6 top-4 h-0.5 bg-sage-500 -translate-y-1/2 transition-all duration-500 z-0"
          style={{
            width: `${(Math.min(currentIndex, steps.length - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || (idx === currentIndex && currentStatus === 'VERIFIED');
          const isCurrent = idx === currentIndex && currentStatus !== 'VERIFIED';
          const stepDate = getStepDate(step.key);

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isCompleted
                    ? 'bg-sage-600 border-sage-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-white border-sage-600 text-sage-700 shadow-md ring-4 ring-sage-100'
                    : 'bg-white border-brand-border text-brand-muted'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-sage-600" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-brand-border" />
                )}
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-xs font-semibold tracking-tight text-center ${
                  isCompleted || isCurrent ? 'text-sage-900 font-bold' : 'text-brand-muted'
                }`}
              >
                {step.label}
              </span>

              {/* Timestamp */}
              <span className="text-[10px] text-brand-muted mt-0.5 text-center min-h-[14px]">
                {stepDate || (isCurrent ? 'Active' : '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
