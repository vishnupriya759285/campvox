'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { GET_NOTIFICATIONS, GET_UNREAD_COUNT } from '@/graphql/queries';
import { MARK_NOTIFICATION_READ_MUTATION, MARK_ALL_NOTIFICATIONS_READ_MUTATION } from '@/graphql/mutations';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Bell,
  CheckCheck,
  Wrench,
  Clock,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
    pollInterval: 8000,
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION, {
    refetchQueries: [{ query: GET_UNREAD_COUNT }],
  });

  const [markAllRead, { loading: markingAll }] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION, {
    refetchQueries: [{ query: GET_UNREAD_COUNT }],
  });

  const allNotifications = data?.notifications || [];
  const unreadNotifications = allNotifications.filter((n: any) => !n.isRead);

  const notifications = tab === 'unread' ? unreadNotifications : allNotifications;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markRead({ variables: { id } });
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
      await refetch();
    } catch (e) {
      console.error(e);
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('assigned')) return <Wrench className="w-4 h-4 text-blue-600" />;
    if (t.includes('progress')) return <Clock className="w-4 h-4 text-purple-600" />;
    if (t.includes('resolved') || t.includes('verified'))
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (t.includes('reopened')) return <RotateCcw className="w-4 h-4 text-rose-600" />;
    if (t.includes('comment')) return <MessageSquare className="w-4 h-4 text-sage-600" />;
    return <Bell className="w-4 h-4 text-sage-700" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E2EEF1] bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#123650]">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Real-time assignment and resolution updates on campus reports.
          </p>
        </div>

        {unreadNotifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            isLoading={markingAll}
            className="self-start sm:self-auto gap-2 text-xs"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 rounded-2xl border border-[#D8E8E9] bg-white/80 p-2 shadow-subtle">
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            tab === 'all'
              ? 'bg-sage-600 text-white shadow-sm'
              : 'text-brand-muted hover:text-sage-900 hover:bg-sage-100/60'
          }`}
        >
          All ({allNotifications.length})
        </button>

        <button
          onClick={() => setTab('unread')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            tab === 'unread'
              ? 'bg-sage-600 text-white shadow-sm'
              : 'text-brand-muted hover:text-sage-900 hover:bg-sage-100/60'
          }`}
        >
          Unread ({unreadNotifications.length})
        </button>
      </div>

      {/* Notifications List Card */}
      <Card className="p-0 overflow-hidden divide-y divide-brand-border/60 shadow-card">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-brand-muted">
            <Bell className="w-8 h-8 text-sage-300 mx-auto mb-3" />
            <p className="text-sm font-medium">No notifications to show.</p>
            <p className="text-xs text-brand-muted mt-1">
              You&apos;ll be notified when maintenance updates are posted.
            </p>
          </div>
        ) : (
          notifications.map((n: any) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors hover:bg-sage-50/40 ${
                !n.isRead ? 'bg-sage-100/30 font-medium' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-brand-border flex items-center justify-center shrink-0 shadow-subtle mt-0.5">
                  {getIcon(n.title)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-sage-900">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-sage-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-brand-text leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-brand-muted block pt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {n.issueId && (
                  <Link
                    href={`/issues/${n.issueId}`}
                    onClick={() => {
                      if (!n.isRead) handleMarkAsRead(n.id);
                    }}
                    className="p-1.5 rounded-lg text-brand-muted hover:text-sage-900 hover:bg-sage-100 transition-colors"
                    title="View issue"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-[11px] font-semibold text-sage-700 hover:text-sage-900 px-2 py-1 rounded-md hover:bg-sage-100 transition-colors"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
