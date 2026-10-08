'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@apollo/client';
import { GET_UNREAD_COUNT } from '@/graphql/queries';

interface TopNavbarProps {
  onToggleMobileMenu?: () => void;
}

export function TopNavbar({ onToggleMobileMenu }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { data } = useQuery(GET_UNREAD_COUNT, {
    pollInterval: 15000,
  });
  const unreadCount = data?.unreadNotificationCount ?? 2;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/issues?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Determine user display names and academic info matching the reference mockup
  const displayName = user?.name ? user.name.split(' ')[0] : 'Alex';
  const roleOrYear = user?.role === 'ADMIN'
    ? 'Campus Administrator'
    : user?.role === 'MAINTENANCE'
    ? 'Facility Operations'
    : 'B.Tech CSE • 3rd Year';

  return (
    <header className="h-16 bg-white border-b border-[#E6EFF2] px-4 sm:px-7 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-[#475569] hover:text-[#0B7A55] hover:bg-[#E1F7EE] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <h1 className="text-base sm:text-lg font-bold text-[#123650] tracking-tight whitespace-nowrap">
          Student Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="relative hidden md:block w-72 lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search issues, locations, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-white border border-[#E2EEF1] rounded-full text-[#123650] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#0B7A55]/20 focus:border-[#0B7A55] transition-all shadow-[0_1px_2px_rgba(18,54,80,0.03)]"
          />
        </form>

        {/* Notification Bell with Red Badge */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-full text-[#475569] hover:text-[#123650] hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-[#475569]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Chip */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-[#E2EEF1]"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 ring-1 ring-[#D8E8E9]">
              <Image
                src="/brand/alex-avatar.png"
                alt={displayName}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to text initials if image fails
                  const target = e.target as HTMLElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#123650] leading-tight">
                {displayName}
              </span>
              <span className="text-[11px] font-medium text-[#64748B] leading-tight">
                {roleOrYear}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-card border border-[#E2EEF1] py-1 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3.5 py-2 border-b border-[#EDF4F6]">
                <p className="text-xs font-bold text-[#123650] truncate">{user?.name || displayName}</p>
                <p className="text-[11px] text-[#64748B] truncate">{user?.email || 'alex@campus.edu'}</p>
              </div>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#EF4444] hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
