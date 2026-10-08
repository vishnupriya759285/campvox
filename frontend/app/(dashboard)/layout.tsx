'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { X } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F8FA]">
      {/* Desktop Left Sidebar */}
      <div className="hidden lg:block shrink-0">
        <AppSidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 h-full flex flex-col bg-white">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-3 z-20 p-2 rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <AppSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#F4F8FA]">
        <TopNavbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-7 py-5">
          <div className="max-w-[1360px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
