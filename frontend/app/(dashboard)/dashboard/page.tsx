'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  ChevronRight,
  Sun,
  Zap,
  Megaphone,
  BookOpen,
  ClipboardList,
  Bell,
  Sparkles,
  MapPin,
  Calendar,
  User,
  Leaf,
  Wifi,
  Wrench,
  Tv,
} from 'lucide-react';
import { GET_MY_ISSUES } from '@/graphql/queries';
import { useAuth } from '@/lib/auth-context';

type IssueItem = {
  id: string;
  title: string;
  category: string;
  location: string;
  date: string;
  department: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  image: string;
  categoryIcon: string;
};

// Default showcase issues directly matching the CAMPVOX reference mockup
const DEFAULT_ISSUES: IssueItem[] = [
  {
    id: 'issue-1',
    title: 'Broken corridor light',
    category: 'Electrical',
    categoryIcon: '⚡',
    location: 'Block A, 2nd Floor',
    date: 'Oct 7, 2025',
    department: 'Maintenance Department',
    status: 'Open',
    image: '/brand/thumb-corridor-light.png',
  },
  {
    id: 'issue-2',
    title: 'Wi-Fi outage in Block B',
    category: 'Network',
    categoryIcon: '📶',
    location: 'Block B, Computer Lab',
    date: 'Oct 6, 2025',
    department: 'IT Department',
    status: 'In Progress',
    image: '/brand/thumb-wifi.png',
  },
  {
    id: 'issue-3',
    title: 'Hostel water leak',
    category: 'Plumbing',
    categoryIcon: '🔧',
    location: 'Hostel Block, Room 204',
    date: 'Oct 5, 2025',
    department: 'Maintenance Department',
    status: 'In Progress',
    image: '/brand/thumb-water.png',
  },
  {
    id: 'issue-4',
    title: 'Classroom projector not working',
    category: 'AV Equipment',
    categoryIcon: '🖥️',
    location: 'Block C, Room 101',
    date: 'Oct 3, 2025',
    department: 'Maintenance Department',
    status: 'Resolved',
    image: '/brand/thumb-projector.png',
  },
];

const QUICK_ACTIONS = [
  {
    title: 'Report an Issue',
    subtitle: 'Submit a new campus issue',
    href: '/issues/new',
    icon: Plus,
    iconBg: 'bg-[#0B7A55] text-white',
  },
  {
    title: 'My Issues',
    subtitle: 'Track your submitted issues',
    href: '/issues',
    icon: ClipboardList,
    iconBg: 'bg-[#0284C7] text-white',
  },
  {
    title: 'Notifications',
    subtitle: 'View updates & announcements',
    href: '/notifications',
    icon: Bell,
    iconBg: 'bg-[#0284C7] text-white',
  },
  {
    title: 'Campus Guidelines',
    subtitle: 'Read reporting guidelines',
    href: '/issues',
    icon: BookOpen,
    iconBg: 'bg-[#10B981] text-white',
  },
];

const CAMPUS_UPDATES = [
  {
    id: 1,
    title: 'Library will remain open late this week',
    description: 'Extended hours from 8 AM to 10 PM (Oct 6 – Oct 10).',
    date: 'Oct 6',
    dotColor: 'bg-[#10B981]',
  },
  {
    id: 2,
    title: 'Mess menu update',
    description: 'New menu options are now available in the hostel mess.',
    date: 'Oct 5',
    dotColor: 'bg-[#0284C7]',
  },
  {
    id: 3,
    title: 'Maintenance work in Block B',
    description: 'Wi-Fi may be unstable today (Oct 6) from 10 AM – 2 PM.',
    date: 'Oct 5',
    dotColor: 'bg-[#F59E0B]',
  },
];

function getStatusBadge(status: IssueItem['status']) {
  switch (status) {
    case 'Open':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FEE2E2] text-[#EF4444] tracking-normal">
          Open
        </span>
      );
    case 'In Progress':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E0F2FE] text-[#0284C7] tracking-normal whitespace-nowrap">
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#16A34A] tracking-normal">
          Resolved
        </span>
      );
  }
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { data } = useQuery(GET_MY_ISSUES, { pollInterval: 12000 });

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

  const formattedLocalIssues: IssueItem[] = React.useMemo(() => {
    return localIssues.map((issue: any) => {
      const getCategoryIcon = (cat: string) => {
        const upper = (cat || '').toUpperCase();
        if (upper.includes('ELEC')) return '⚡';
        if (upper.includes('PLUMB')) return '🔧';
        if (upper.includes('WIFI') || upper.includes('NET')) return '📶';
        return '📋';
      };

      const getStatusDisplay = (st: string): 'Open' | 'In Progress' | 'Resolved' => {
        const upper = (st || '').toUpperCase();
        if (upper === 'IN_PROGRESS') return 'In Progress';
        if (upper === 'RESOLVED' || upper === 'VERIFIED') return 'Resolved';
        return 'Open';
      };

      return {
        id: issue.id,
        title: issue.title,
        category: issue.category ? issue.category.charAt(0) + issue.category.slice(1).toLowerCase() : 'General',
        categoryIcon: getCategoryIcon(issue.category),
        location: issue.location || 'Campus',
        date: 'Today',
        department: issue.assignedDepartment?.name || 'Campus Operations',
        status: getStatusDisplay(issue.status),
        image: issue.images?.[0]?.url || issue.imageUrls?.[0] || '/brand/thumb-corridor-light.png',
      };
    });
  }, [localIssues]);

  const displayedIssues = React.useMemo(() => {
    const existingIds = new Set(formattedLocalIssues.map(i => i.id));
    const extraDefaults = DEFAULT_ISSUES.filter(i => !existingIds.has(i.id));
    return [...formattedLocalIssues, ...extraDefaults];
  }, [formattedLocalIssues]);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Alex';

  // Calculate dynamic stats from API or fallback to reference defaults
  const userIssues = data?.myIssues || [];
  const totalCount = userIssues.length > 0 ? userIssues.length + formattedLocalIssues.length : 12 + formattedLocalIssues.length;
  const openCount = userIssues.length > 0
    ? userIssues.filter((i: any) => ['REPORTED', 'ASSIGNED', 'REOPENED'].includes(i.status)).length + formattedLocalIssues.filter(i => i.status === 'Open').length
    : 3 + formattedLocalIssues.filter(i => i.status === 'Open').length;
  const inProgressCount = userIssues.length > 0
    ? userIssues.filter((i: any) => i.status === 'IN_PROGRESS').length + formattedLocalIssues.filter(i => i.status === 'In Progress').length
    : 4 + formattedLocalIssues.filter(i => i.status === 'In Progress').length;
  const resolvedCount = userIssues.length > 0
    ? userIssues.filter((i: any) => ['RESOLVED', 'VERIFIED'].includes(i.status)).length + formattedLocalIssues.filter(i => i.status === 'Resolved').length
    : 5 + formattedLocalIssues.filter(i => i.status === 'Resolved').length;

  return (
    <div className="space-y-6 pb-8">
      {/* 1. TOP HERO BANNER */}
      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#E4F4FC_0%,#EDF9F8_45%,#EBF6F9_100%)] border border-[#D5EBF0] p-6 sm:p-7 shadow-[0_2px_12px_rgba(18,54,80,0.03)]">
        {/* Right side panoramic campus building photo with "Better Campus Together" */}
        <div className="absolute right-0 top-0 bottom-0 h-full w-[54%] max-w-[660px] pointer-events-none hidden md:block">
          <Image
            src="/brand/hero-campus-panoramic-fade.png"
            alt="CAMPVOX Campus"
            fill
            className="object-cover object-left"
            priority
          />
        </div>

        {/* Left side greeting content */}
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-[#0B7A55]">
            <Sun className="w-5 h-5 text-[#0B7A55]" />
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#0D5C43] tracking-tight">
              Good morning, {displayName}
            </h1>
          </div>

          <p className="mt-2 text-xs sm:text-sm text-[#475569] font-normal leading-relaxed max-w-md">
            Your campus, your voice. Report issues, track progress and help make your campus a better place.
          </p>

          <Link
            href="/issues/new"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-[#0B7A55] hover:bg-[#086143] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Report an Issue</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </section>

      {/* 2. STATS ROW (4 CARDS) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Issues */}
        <div className="bg-white rounded-2xl border border-[#E6EFF2] p-4 sm:p-5 shadow-[0_1px_4px_rgba(18,54,80,0.02)] flex items-start gap-3.5 hover:border-[#CDE5DC] transition-all">
          <div className="w-10 h-10 rounded-full bg-[#E1F7EE] text-[#0B7A55] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#64748B]">Total Issues</span>
            <span className="text-2xl font-bold text-[#123650] mt-0.5 leading-none">{totalCount}</span>
            <span className="text-[11px] font-medium text-[#0B7A55] mt-1.5 flex items-center gap-0.5">
              <span>↑</span> +2 from last month
            </span>
          </div>
        </div>

        {/* Open */}
        <div className="bg-white rounded-2xl border border-[#E6EFF2] p-4 sm:p-5 shadow-[0_1px_4px_rgba(18,54,80,0.02)] flex items-start gap-3.5 hover:border-[#FCE7BA] transition-all">
          <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#64748B]">Open</span>
            <span className="text-2xl font-bold text-[#123650] mt-0.5 leading-none">{openCount}</span>
            <span className="text-[11px] font-medium text-[#DC2626] mt-1.5 flex items-center gap-0.5">
              <span>↓</span> -1 from last month
            </span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl border border-[#E6EFF2] p-4 sm:p-5 shadow-[0_1px_4px_rgba(18,54,80,0.02)] flex items-start gap-3.5 hover:border-[#BAE6FD] transition-all">
          <div className="w-10 h-10 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#64748B]">In Progress</span>
            <span className="text-2xl font-bold text-[#123650] mt-0.5 leading-none">{inProgressCount}</span>
            <span className="text-[11px] font-medium text-[#0284C7] mt-1.5 flex items-center gap-0.5">
              <span>↑</span> +1 from last month
            </span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-2xl border border-[#E6EFF2] p-4 sm:p-5 shadow-[0_1px_4px_rgba(18,54,80,0.02)] flex items-start gap-3.5 hover:border-[#BBF7D0] transition-all">
          <div className="w-10 h-10 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#64748B]">Resolved</span>
            <span className="text-2xl font-bold text-[#123650] mt-0.5 leading-none">{resolvedCount}</span>
            <span className="text-[11px] font-medium text-[#16A34A] mt-1.5 flex items-center gap-0.5">
              <span>↑</span> +2 from last month
            </span>
          </div>
        </div>
      </section>

      {/* 3. TWO-COLUMN MAIN SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT COLUMN: Recent Issues & Impact Banner (Cols 7 or 8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* Recent Issues Card */}
          <div className="bg-white rounded-2xl border border-[#E6EFF2] p-5 sm:p-6 shadow-[0_1px_4px_rgba(18,54,80,0.02)]">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDF4F6]">
              <h2 className="text-base sm:text-lg font-bold text-[#123650]">Recent Issues</h2>
              <Link
                href="/issues"
                className="text-xs sm:text-sm font-semibold text-[#0B7A55] hover:text-[#086143] hover:underline flex items-center gap-1"
              >
                <span>View all issues</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* List of issues */}
            <div className="divide-y divide-[#EDF4F6]">
              {displayedIssues.slice(0, 5).map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className="py-3.5 flex items-center justify-between gap-3 group hover:bg-[#F8FCFA] px-2 -mx-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail Image */}
                    <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-[#E2EEF1]">
                      <Image
                        src={issue.image}
                        alt={issue.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-[#123650] group-hover:text-[#0B7A55] truncate transition-colors">
                        {issue.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#64748B] mt-1">
                        <span className="flex items-center gap-1">
                          <span>{issue.categoryIcon}</span>
                          <span>{issue.category}</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#94A3B8]" />
                          <span>{issue.location}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#64748B] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#94A3B8]" />
                          <span>{issue.date}</span>
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[#94A3B8]" />
                          <span>{issue.department}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Status Badge and Chevron */}
                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(issue.status)}
                    <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#0B7A55] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Small issues. Big impact banner */}
          <div className="relative overflow-hidden rounded-2xl bg-[#EDF8F4] border border-[#D5EFE3] p-4 sm:p-4.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/90 text-[#0B7A55] flex items-center justify-center shrink-0 shadow-[0_2px_6px_rgba(11,122,85,0.08)]">
                <Leaf className="w-5 h-5 text-[#0B7A55]" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-xs sm:text-sm font-bold text-[#0D5C43]">
                  Small issues. Big impact.
                </h4>
                <p className="text-[11px] sm:text-xs text-[#526B7A] mt-0.5">
                  Your report helps keep our campus safe, clean and running smoothly.
                </p>
              </div>
            </div>

            {/* Cityscape illustration watermark on the right */}
            <div className="relative h-10 w-44 opacity-80 pointer-events-none hidden sm:block shrink-0">
              <Image
                src="/brand/tip-skyline-illustration.png"
                alt=""
                fill
                className="object-contain object-right"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Actions & Campus Updates (Cols 5 or 4) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-[#E6EFF2] p-5 shadow-[0_1px_4px_rgba(18,54,80,0.02)]">
            <div className="flex items-center gap-2 pb-3.5 border-b border-[#EDF4F6]">
              <Zap className="w-4 h-4 text-[#0B7A55]" />
              <h2 className="text-sm sm:text-base font-bold text-[#123650]">Quick Actions</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5 mt-3.5">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#E8EFF2] hover:border-[#BCE8D6] hover:bg-[#F7FCFA] transition-all group shadow-[0_1px_2px_rgba(18,54,80,0.02)]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${action.iconBg}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-[#123650] group-hover:text-[#0B7A55] transition-colors truncate">
                          {action.title}
                        </span>
                        <span className="text-[10px] text-[#64748B] truncate">
                          {action.subtitle}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#0B7A55] group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Campus Updates Card */}
          <div className="bg-white rounded-2xl border border-[#E6EFF2] p-5 shadow-[0_1px_4px_rgba(18,54,80,0.02)]">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#EDF4F6]">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#0B7A55]" />
                <h2 className="text-sm sm:text-base font-bold text-[#123650]">Campus Updates</h2>
              </div>
              <Link
                href="/notifications"
                className="text-xs font-semibold text-[#0B7A55] hover:text-[#086143] hover:underline flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-[#EDF4F6] mt-1">
              {CAMPUS_UPDATES.map((update) => (
                <div key={update.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${update.dotColor}`} />
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-xs font-bold text-[#123650] leading-snug">
                        {update.title}
                      </h4>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">
                        {update.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-[#94A3B8] shrink-0 whitespace-nowrap">
                    {update.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
