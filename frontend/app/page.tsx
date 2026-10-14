'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  GraduationCap,
  Home,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const zones = [
    {
      title: 'Institution',
      subtitle: 'Academic blocks, classrooms & laboratories',
      href: '/issues?search=Institution',
      icon: GraduationCap,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Hostel',
      subtitle: 'Student residential halls, mess & recreation',
      href: '/issues?search=Hostel',
      icon: Home,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Staff Quarters',
      subtitle: 'Faculty & staff campus residences',
      href: '/issues?search=Quarters',
      icon: Users,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      title: 'Guest House',
      subtitle: 'Visitor suites, executive amenities & dining',
      href: '/issues?search=Guest+House',
      icon: MapPin,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#E9F4F8] text-[#123650] flex flex-col justify-between">
      {/* Background: Ultra-Clarity 8K Restored Campus Photograph */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/brand/campus-login-hero.png"
          alt="CAMPVOX Pink Campus Landscape"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center scale-[1.01]"
        />
        {/* Subtle natural contrast layer - pristine clarity with zero foggy washout */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10 pointer-events-none" />
      </div>

      {/* Main Single-Viewport Content Wrapper */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1480px] flex-col justify-between px-5 py-4 sm:px-8 sm:py-5 lg:px-12">
        {/* Header / Navbar */}
        <header className="flex items-center justify-between gap-4">
          <BrandLogo size="md" href="/" />

          <nav
            className="hidden items-center gap-6 text-xs sm:text-sm font-semibold text-[#486377] md:flex"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className="relative text-[#123650] font-bold hover:text-emerald-700 transition-colors"
            >
              Home
              <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-emerald-600 rounded-full" />
            </Link>
            <Link
              href="/issues?search=Institution"
              className="hover:text-emerald-700 transition-colors"
            >
              Institution
            </Link>
            <Link
              href="/issues?search=Hostel"
              className="hover:text-emerald-700 transition-colors"
            >
              Hostel
            </Link>
            <Link
              href="/issues?search=Quarters"
              className="hover:text-emerald-700 transition-colors"
            >
              Staff Quarters
            </Link>
            <Link
              href="/issues?search=Guest+House"
              className="hover:text-emerald-700 transition-colors"
            >
              Guest House
            </Link>
          </nav>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-600 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-md transition hover:bg-emerald-700"
            >
              <User className="h-3.5 w-3.5 text-white" aria-hidden="true" />
              <span>{user?.name ? user.name.split(' ')[0] : 'Dashboard'}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-[#E5F4EC]/95 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur-md transition hover:bg-emerald-100"
            >
              <User className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
              <span>Student Login</span>
            </Link>
          )}
        </header>

        {/* Center Grid: Left Hero & Right Zone Card */}
        <div className="my-auto grid flex-1 items-start gap-8 pt-4 pb-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 xl:gap-16">
          {/* Left Hero Section */}
          <div className="max-w-xl self-start pt-2 lg:pt-4 xl:pt-6">
            {/* Primary Slogan */}
            <h1 className="text-3xl font-black tracking-[-0.035em] text-[#0A2540] sm:text-4xl lg:text-[44px] leading-[1.12] drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)]">
              Your Campus. <br />
              <span className="text-emerald-700">Better, Every Day.</span>
            </h1>

            {/* Sub-slogan */}
            <p className="mt-3 text-sm sm:text-base font-semibold leading-relaxed text-[#1D3D54] max-w-md drop-shadow-[0_1px_8px_rgba(255,255,255,0.95)]">
              Report maintenance issues, track real-time resolution, and keep every campus facility running at its best.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={isAuthenticated ? '/issues/new' : '/login?redirect=/issues/new'}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#19875F] to-[#12704E] px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-[0_10px_20px_rgba(22,132,97,0.25)] transition hover:from-[#157954] hover:to-[#0F6042] active:scale-[0.99]"
              >
                <span>Report an Issue</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                href="/issues"
                className="inline-flex items-center gap-2 rounded-xl border border-white/90 bg-white/85 px-5 py-3 text-xs sm:text-sm font-bold text-[#123650] shadow-sm backdrop-blur-md transition hover:bg-white"
              >
                <Building2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                <span>Explore Campus Zones</span>
              </Link>
            </div>

            {/* Feature Trust Pills */}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2.5 text-xs font-bold text-[#1D3D54]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 shadow-sm backdrop-blur-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> Clear request tracking
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 shadow-sm backdrop-blur-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" /> Built for all campus roles
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 shadow-sm backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5 text-emerald-700" /> Real-time status updates
              </span>
            </div>
          </div>

          {/* Right Floating White Glass Card - Campus Zones Showcase */}
          <div className="w-full max-w-[440px] justify-self-center lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white/95 p-6 shadow-[0_22px_55px_rgba(18,54,80,0.18)] backdrop-blur-2xl sm:p-7">
              {/* Subtle Decorative Wave at Bottom-Right */}
              <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 opacity-15">
                <svg viewBox="0 0 100 100" fill="none" className="h-full w-full stroke-emerald-600">
                  <path d="M10 90 Q 50 10 90 90" strokeWidth="6" strokeLinecap="round" />
                  <path d="M25 85 Q 50 25 75 85" strokeWidth="4" strokeLinecap="round" />
                  <path d="M40 80 Q 50 40 60 80" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              {/* Campus Zones Badge */}
              <div className="mb-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-[#E5F4EC] px-2.5 py-1 text-xs font-bold text-emerald-800">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                  Public Campus Hub
                </span>
              </div>

              {/* Headline & Subtitle */}
              <h2 className="mt-1.5 text-2xl font-black tracking-[-0.03em] text-[#123650] sm:text-[26px]">
                Campus Facility <span className="text-emerald-700">Zones</span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-[#5B768A]">
                Select any facility to check active maintenance requests:
              </p>

              {/* 4 Zone Links Grid */}
              <div className="mt-4 space-y-2.5">
                {zones.map((zone) => {
                  const Icon = zone.icon;
                  return (
                    <Link
                      key={zone.title}
                      href={zone.href}
                      className="group flex items-center justify-between rounded-2xl border border-[#DCE7EB] bg-white p-3 shadow-xs transition hover:border-emerald-300 hover:bg-[#F6FAF8] hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${zone.color} shadow-xs transition group-hover:scale-105`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs sm:text-sm font-bold text-[#123650] group-hover:text-emerald-800 transition">
                            {zone.title}
                          </p>
                          <p className="text-[11px] font-medium text-[#64748B] line-clamp-1">
                            {zone.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 p-1 text-[#8CA3B3] group-hover:text-emerald-700 group-hover:translate-x-0.5 transition">
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Login / Dashboard CTA */}
              <div className="mt-5 pt-3.5 border-t border-[#E3EDF0]">
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="w-full rounded-xl bg-gradient-to-r from-[#19875F] to-[#12704E] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-[0_10px_20px_rgba(22,132,97,0.25)] transition hover:from-[#157954] hover:to-[#0F6042] flex items-center justify-center gap-2"
                  >
                    <span>Go to Student Dashboard</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      className="w-full rounded-xl bg-gradient-to-r from-[#19875F] to-[#12704E] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-[0_10px_20px_rgba(22,132,97,0.25)] transition hover:from-[#157954] hover:to-[#0F6042] flex items-center justify-center gap-2"
                    >
                      <User className="h-4 w-4" aria-hidden="true" />
                      <span>Student Sign In</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <p className="text-center text-[11px] font-semibold text-[#64748B]">
                      Sign in to submit complaints or track personal requests
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Clean Brandline */}
        <footer className="pt-2 pb-2 text-center sm:text-left">
          <p className="text-xs font-semibold text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
            CAMPVOX · Your Campus. Better, Every Day.
          </p>
        </footer>
      </div>
    </main>
  );
}
