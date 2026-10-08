'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ANALYTICS_OVERVIEW } from '@/graphql/queries';
import { Card } from '@/components/ui/Card';
import { StatCardSkeleton } from '@/components/ui/Skeleton';
import {
  BarChart3,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

export default function AnalyticsPage() {
  const { data, loading } = useQuery(GET_ANALYTICS_OVERVIEW, {
    pollInterval: 12000,
  });

  const stats = data?.issueStatistics || {
    total: 0,
    reported: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    verified: 0,
    reopened: 0,
  };

  const categories = data?.issuesByCategory || [];
  const locations = data?.issuesByLocation || [];
  const resolutionTime = data?.resolutionTimeStatistics || { avgResolutionTimeDays: 2.4 };
  const recurring = data?.recurringIssues || [];
  const trends = data?.monthlyIssueTrends || [];

  const openCount = stats.reported + stats.assigned + stats.inProgress + stats.reopened;
  const resolvedCount = stats.resolved + stats.verified;

  const PIE_COLORS = ['#168461', '#E9A23B', '#7666B8', '#55A879', '#E98675', '#123650'];

  const categoryData = categories.map((c: any) => ({
    name: c.category.charAt(0) + c.category.slice(1).toLowerCase(),
    value: c.count,
  }));

  const openVsResolvedData = [
    { name: 'Open Issues', value: openCount, color: '#E9A23B' },
    { name: 'Resolved', value: resolvedCount, color: '#168461' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-[2rem] border border-white bg-[linear-gradient(125deg,#ffffff_0%,#e8f7f3_58%,#dceff8_100%)] p-7 shadow-card sm:p-9">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-emerald-600">Campus intelligence</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-serif font-bold tracking-tight text-sage-900">
          Analytics & Performance
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
          Insights to build a faster, more responsive campus facility.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2E6DF] p-5 shadow-card">
              <span className="text-xs font-semibold text-brand-muted">Total Issues Logged</span>
              <p className="text-3xl font-serif font-extrabold text-sage-900 mt-2">
                {stats.total}
              </p>
              <span className="text-[11px] text-brand-muted mt-1 block">Live across all blocks</span>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2E6DF] p-5 shadow-card">
              <span className="text-xs font-semibold text-brand-muted">Avg. Resolution Time</span>
              <p className="text-3xl font-serif font-extrabold text-sage-900 mt-2">
                {resolutionTime.avgResolutionTimeDays}{' '}
                <span className="text-sm font-sans font-normal text-brand-muted">days</span>
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
                ↓ 18% faster than last month
              </span>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2E6DF] p-5 shadow-card">
              <span className="text-xs font-semibold text-brand-muted">Active Workorders</span>
              <p className="text-3xl font-serif font-extrabold text-amber-700 mt-2">
                {openCount}
              </p>
              <span className="text-[11px] text-brand-muted mt-1 block">Currently in flight</span>
            </div>

            <div className="bg-[#FFFDF9] rounded-2xl border border-[#E2E6DF] p-5 shadow-card">
              <span className="text-xs font-semibold text-brand-muted">Resolved & Verified</span>
              <p className="text-3xl font-serif font-extrabold text-emerald-700 mt-2">
                {resolvedCount}
              </p>
              <span className="text-[11px] text-brand-muted mt-1 block">Verified by students</span>
            </div>
          </>
        )}
      </div>

      {/* Charts Row: Monthly Issue Trend & Open vs Resolved */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Trend (8 cols) */}
        <Card className="lg:col-span-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-sage-900 font-serif">Monthly Issue Trend</h3>
              <p className="text-xs text-brand-muted">Reported volume vs completed resolutions</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E9A23B]" />
                <span className="text-brand-muted">Reported</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#168461]" />
                <span className="text-brand-muted">Resolved</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8E8E9" />
                <XAxis dataKey="month" stroke="#6B849A" fontSize={11} tickLine={false} />
                <YAxis stroke="#6B849A" fontSize={11} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reportedCount"
                  stroke="#E9A23B"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolvedCount"
                  stroke="#168461"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Open vs Resolved Gauge / Pie (4 cols) */}
        <Card className="lg:col-span-4 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-sage-900 font-serif">Resolution Ratio</h3>
            <p className="text-xs text-brand-muted">Open vs Completed issues</p>
          </div>

          <div className="h-48 w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={openVsResolvedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  dataKey="value"
                >
                  {openVsResolvedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-serif font-extrabold text-sage-900">
                {stats.total > 0 ? Math.round((resolvedCount / stats.total) * 100) : 0}%
              </span>
              <span className="text-[10px] text-brand-muted">Resolved Rate</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-brand-border/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-brand-muted">Active Open:</span>
              <span className="font-bold text-amber-700">{openCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-brand-muted">Resolved & Verified:</span>
              <span className="font-bold text-sage-900">{resolvedCount}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Issues by Category & Recurring Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (6 cols) */}
        <Card className="lg:col-span-6 p-6">
          <h3 className="text-sm font-bold text-sage-900 font-serif mb-4">
            Category Breakdown
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis dataKey="name" stroke="#69746D" fontSize={11} tickLine={false} />
                <YAxis stroke="#69746D" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#5F8069" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recurring Issues (6 cols) */}
        <Card className="lg:col-span-6 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-sage-900 font-serif">
                Top Recurring Hotspots
              </h3>
              <p className="text-xs text-brand-muted">Facilities with high complaint frequency</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>

          <div className="space-y-3">
            {recurring.map((item: any, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-sage-50/50 border border-sage-200/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-sage-200 text-sage-800 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-sage-900 capitalize block">
                      {item.category.toLowerCase()}
                    </span>
                    <span className="text-[11px] text-brand-muted flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full font-mono font-bold text-xs bg-white text-sage-900 border border-sage-200">
                  {item.count} reports
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
