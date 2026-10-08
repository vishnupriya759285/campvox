'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  Bell,
  Shield,
  ChevronDown,
  LogOut,
  ChevronRight,
  Settings,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@apollo/client';
import { GET_UNREAD_COUNT } from '@/graphql/queries';

interface AppSidebarProps {
  onCloseMobile?: () => void;
}

export function AppSidebar({ onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin, isMaintenance } = useAuth();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const { data } = useQuery(GET_UNREAD_COUNT, {
    pollInterval: 15000,
  });
  const unreadCount = data?.unreadNotificationCount ?? 2;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Issues', href: '/issues', icon: ClipboardList },
    { label: 'Report an Issue', href: '/issues/new', icon: PlusCircle },
    { label: 'Notifications', href: '/notifications', icon: Bell, badge: unreadCount },
  ];

  return (
    <aside className="relative w-64 h-screen bg-white text-[#123650] border-r border-[#E6EFF2] flex flex-col justify-between p-5 select-none shrink-0 shadow-[2px_0_12px_rgba(18,54,80,0.02)] overflow-hidden">
      {/* Decorative leaf watermark in bottom-left corner */}
      <div className="pointer-events-none absolute bottom-0 left-0 w-36 h-48 opacity-25 z-0">
        <Image
          src="/brand/sidebar-leaf-watermark.png"
          alt=""
          width={160}
          height={220}
          className="object-contain object-bottom-left"
        />
      </div>

      <div className="relative z-10">
        {/* Brand Logo Header */}
        <div className="pt-1 pb-6 px-1">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <Image
              src="/brand/campvox-emblem.png"
              alt="CAMPVOX Logo"
              width={34}
              height={34}
              className="w-8 h-8 object-contain shrink-0 group-hover:scale-105 transition-transform"
              priority
            />
            <span className="font-sans font-black tracking-[-0.03em] text-lg text-[#0D5C43]">
              CAMP<span className="text-[#107A55]">VOX</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#E1F7EE] text-[#0B7A55] shadow-sm'
                    : 'text-[#475569] hover:bg-[#F6FAF9] hover:text-[#0B7A55]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-[#0B7A55]' : 'text-[#64748B]'}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[11px] font-bold rounded-full bg-[#EF4444] text-white min-w-[18px] text-center leading-none">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Staff/Admin Dropdown Section */}
          <div className="pt-2">
            <button
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#475569] hover:bg-[#F6FAF9] hover:text-[#0B7A55] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-[#64748B]" />
                <span className="font-semibold">Staff/Admin</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                  adminMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {adminMenuOpen && (
              <div className="mt-1 ml-4 pl-3 border-l-2 border-[#E2EEF1] space-y-1 py-1">
                <Link
                  href="/admin"
                  onClick={onCloseMobile}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#0B7A55] hover:bg-[#E1F7EE]/50 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
                <Link
                  href="/maintenance"
                  onClick={onCloseMobile}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#0B7A55] hover:bg-[#E1F7EE]/50 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Maintenance Portal</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Sidebar Footer with CAMPVOX Tagline Seal */}
      <div className="relative z-10 pt-4 border-t border-[#EDF4F6]">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <Image
              src="/brand/campvox-emblem.png"
              alt=""
              width={24}
              height={24}
              className="w-6 h-6 object-contain shrink-0 opacity-90"
            />
            <div className="flex flex-col text-[11px] leading-snug font-medium text-[#64748B]">
              <span>Making Everyday</span>
              <span>Campus Life Easier</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-rose-50 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
