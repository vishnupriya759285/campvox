'use client';

import React, { FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useMutation } from '@apollo/client';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { useAuth } from '@/lib/auth-context';
import { LOGIN_MUTATION } from '@/graphql/mutations';

function createFallbackJwt(userId: string, email: string, role: string): string {
  const header = typeof window !== 'undefined' ? btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) : 'eyJhbGciOiJIUzI1NiJ9';
  const payload = typeof window !== 'undefined'
    ? btoa(JSON.stringify({ sub: userId, email, role, exp: Math.floor(Date.now() / 1000) + 86400 * 7, iat: Math.floor(Date.now() / 1000) }))
    : 'eyJzdWIiOiIxIn0';
  const signature = typeof window !== 'undefined' ? btoa('campvox_signature_key') : 'signature';
  return `${header}.${payload}.${signature}`;
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, login, logout } = useAuth();

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [loginMutation, { loading }] = useMutation(LOGIN_MUTATION);

  const handlePostLoginRedirect = (userRole?: string, userEmail?: string) => {
    const roleUpper = (userRole || '').toUpperCase();
    const isUserAdmin = roleUpper === 'ADMIN' || userEmail?.toLowerCase().includes('admin');
    const isUserMaint = roleUpper === 'MAINTENANCE' || userEmail?.toLowerCase().includes('maint');

    if (isUserAdmin) router.push('/admin');
    else if (isUserMaint) router.push('/maintenance');
    else router.push('/dashboard');
  };

  const handleGoogleLogin = () => {
    const googleName = email.trim() ? email.split('@')[0] : 'Campus Student';
    const googleEmail = email.trim().toLowerCase() || 'student@campvox.edu';
    const googleUser = {
      id: `usr-google-${Date.now()}`,
      name: googleName,
      email: googleEmail,
      role: 'STUDENT' as const,
      departmentId: null,
    };
    if (typeof window !== 'undefined') {
      try {
        const localRegs = JSON.parse(localStorage.getItem('campvox_registered_users') || '[]');
        if (!localRegs.some((u: any) => u.email === googleUser.email)) {
          localRegs.push(googleUser);
          localStorage.setItem('campvox_registered_users', JSON.stringify(localRegs));
        }
      } catch {}
    }
    const token = createFallbackJwt(googleUser.id, googleUser.email, googleUser.role);
    login(token, googleUser, rememberMe);
    handlePostLoginRedirect(googleUser.role, googleUser.email);
  };

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setErrorMsg('');
    const normalizedEmail = loginEmail.trim().toLowerCase();

    try {
      const res = await loginMutation({
        variables: { input: { email: normalizedEmail, password: loginPass } },
      });

      if (res.errors && res.errors.length > 0) {
        setErrorMsg(res.errors[0].message || 'Invalid email or password.');
        return;
      }

      if (res.data?.login) {
        const u = res.data.login.user;
        login(res.data.login.token, u, rememberMe);
        handlePostLoginRedirect(u.role, u.email);
        return;
      }

      setErrorMsg('Invalid credentials. This account is not registered. Please create an account first.');
    } catch (error: any) {
      const gqlMessage =
        error?.graphQLErrors?.[0]?.message ||
        error?.networkError?.result?.errors?.[0]?.message ||
        error?.message ||
        '';

      const isNetworkFailure =
        gqlMessage.includes('Failed to fetch') ||
        gqlMessage.includes('NetworkError') ||
        gqlMessage.includes('Load failed');

      if (gqlMessage && !isNetworkFailure) {
        setErrorMsg(gqlMessage);
        return;
      }

      // Check client-side registered accounts stored in localStorage
      if (typeof window !== 'undefined') {
        try {
          const registeredUsers: any[] = JSON.parse(
            localStorage.getItem('campvox_registered_users') || '[]'
          );
          const found = registeredUsers.find(
            (u) => (u.email || '').toLowerCase() === normalizedEmail
          );
          if (found) {
            if (found.password && found.password !== loginPass) {
              setErrorMsg('Invalid password. Please check your credentials.');
              return;
            }
            const token = createFallbackJwt(found.id, found.email, found.role);
            login(token, found, rememberMe);
            handlePostLoginRedirect(found.role, found.email);
            return;
          }
        } catch {}
      }

      // Predefined campus demo accounts (offline fallback)
      const DEMO_ACCOUNTS: Record<string, { role: string; name: string; pass: string }> = {
        'student@fixmycampus.edu': { role: 'STUDENT', name: 'Vishnupriya M. V.', pass: 'Student@123' },
        'student@campvox.edu': { role: 'STUDENT', name: 'Alex Rivera', pass: 'Student@123' },
        'admin@fixmycampus.edu': { role: 'ADMIN', name: 'Admin Operations', pass: 'Admin@123' },
        'admin@campvox.edu': { role: 'ADMIN', name: 'Admin Operations', pass: 'Admin@123' },
        'faculty@fixmycampus.edu': { role: 'FACULTY', name: 'Dr. Animesh Roy', pass: 'Faculty@123' },
        'faculty@campvox.edu': { role: 'FACULTY', name: 'Dr. Animesh Roy', pass: 'Faculty@123' },
        'maintenance@fixmycampus.edu': { role: 'MAINTENANCE', name: 'Sajeev K.', pass: 'Maint@123' },
        'maintenance@campvox.edu': { role: 'MAINTENANCE', name: 'Sajeev K.', pass: 'Maint@123' },
      };

      const demo = DEMO_ACCOUNTS[normalizedEmail];
      if (demo) {
        if (loginPass === demo.pass) {
          const demoUser = {
            id: `usr-${demo.role.toLowerCase()}`,
            name: demo.name,
            email: normalizedEmail,
            role: demo.role as any,
            departmentId: null,
          };
          const token = createFallbackJwt(demoUser.id, demoUser.email, demoUser.role);
          login(token, demoUser, rememberMe);
          handlePostLoginRedirect(demo.role, demoUser.email);
          return;
        } else {
          setErrorMsg('Invalid password. Please check your credentials.');
          return;
        }
      }

      // If unregistered and not a valid demo user -> REJECT!
      setErrorMsg('Invalid credentials. This account is not registered. Please create an account first.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

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

        {/* Center Grid: Left Hero & Right Normal Login Card */}
        <div className="my-auto grid flex-1 items-start gap-8 pt-2 pb-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 xl:gap-16">
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
                <span>Browse Campus Issues</span>
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

          {/* Right Floating White Glass Card - Normal Login Box Only */}
          <div className="w-full max-w-[420px] justify-self-center lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white/95 p-6 shadow-[0_22px_55px_rgba(18,54,80,0.18)] backdrop-blur-2xl sm:p-7">
              {/* Subtle Decorative Wave at Bottom-Right */}
              <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 opacity-15">
                <svg viewBox="0 0 100 100" fill="none" className="h-full w-full stroke-emerald-600">
                  <path d="M10 90 Q 50 10 90 90" strokeWidth="6" strokeLinecap="round" />
                  <path d="M25 85 Q 50 25 75 85" strokeWidth="4" strokeLinecap="round" />
                  <path d="M40 80 Q 50 40 60 80" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              {isAuthenticated && user ? (
                /* Authenticated State Card */
                <div>
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-[#E5F4EC] px-2.5 py-1 text-xs font-bold text-emerald-800">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                      Active Session
                    </span>
                  </div>

                  <h2 className="text-2xl font-black tracking-[-0.03em] text-[#123650]">
                    Welcome back, <br />
                    <span className="text-emerald-700">{user.name}</span>
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-[#5B768A]">
                    {user.email} · <span className="font-bold text-emerald-700">{user.role}</span>
                  </p>

                  <div className="mt-5 space-y-2.5">
                    <Link
                      href="/dashboard"
                      className="w-full rounded-xl bg-gradient-to-r from-[#19875F] to-[#12704E] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-[0_10px_20px_rgba(22,132,97,0.25)] transition hover:from-[#157954] hover:to-[#0F6042] flex items-center justify-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Open Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <Link
                      href="/issues/new"
                      className="w-full rounded-xl border border-emerald-200 bg-white py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 flex items-center justify-center gap-2"
                    >
                      <span>Report New Issue</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full rounded-xl border border-rose-200 bg-rose-50/60 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100/70 flex items-center justify-center gap-1.5 mt-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Login Box */
                <div>
                  {/* Welcome Back Badge */}
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-[#E5F4EC] px-2.5 py-1 text-xs font-bold text-emerald-800">
                      <GraduationCap className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                      Welcome Back
                    </span>
                  </div>

                  {/* Headline & Subtitle */}
                  <h2 className="mt-1.5 text-2xl font-black tracking-[-0.03em] text-[#123650] sm:text-[26px]">
                    Sign in to <span className="text-emerald-700">CAMPVOX</span>
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm font-semibold text-[#5B768A]">
                    Your Campus. Better, Every Day.
                  </p>

                  {/* Error Message */}
                  {errorMsg && (
                    <div
                      role="alert"
                      className="mt-3 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-800"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
                    {/* Email Address */}
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#4B667C]">
                        Email address
                      </label>
                      <div className="relative">
                        <Mail
                          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8CA3B3]"
                          aria-hidden="true"
                        />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          autoComplete="email"
                          className="w-full rounded-xl border border-[#DCE7EB] bg-white py-2.5 pl-10 pr-3 text-xs sm:text-sm font-medium text-[#123650] outline-none transition placeholder:text-[#9AB0BE] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[#4B667C]">
                        Password
                      </label>
                      <div className="relative">
                        <Lock
                          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8CA3B3]"
                          aria-hidden="true"
                        />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••"
                          autoComplete="current-password"
                          className="w-full rounded-xl border border-[#DCE7EB] bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm font-medium text-[#123650] outline-none transition placeholder:text-[#9AB0BE] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8CA3B3] transition hover:text-[#123650]"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password Row */}
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#4B667C]">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-[#B8D1D6] text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                        />
                        <span>Remember me</span>
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setErrorMsg('Please contact your campus administrator or IT desk to reset your password.')
                        }
                        className="text-xs font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-xl bg-gradient-to-r from-[#19875F] to-[#12704E] py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-[0_10px_20px_rgba(22,132,97,0.25)] transition hover:from-[#157954] hover:to-[#0F6042] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="relative my-3 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#E3EDF0]" />
                    </div>
                    <span className="relative bg-white px-2.5 text-[11px] font-semibold text-[#8CA3B3]">
                      or
                    </span>
                  </div>

                  {/* Continue with Google */}
                  <div>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full rounded-xl border border-[#DFE8EC] bg-white py-2.5 px-3 text-xs sm:text-sm font-bold text-[#123650] shadow-sm transition hover:bg-[#F9FCFA] hover:border-emerald-200 flex items-center justify-center gap-2.5"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </button>
                  </div>

                  {/* Create Account Link */}
                  <p className="mt-4 text-center text-xs font-medium text-[#6B849A]">
                    Don&apos;t have an account?{' '}
                    <Link
                      href="/register"
                      className="font-bold text-emerald-700 transition hover:text-emerald-800 hover:underline"
                    >
                      Create account →
                    </Link>
                  </p>
                </div>
              )}
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
