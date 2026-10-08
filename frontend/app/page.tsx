import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Droplets,
  FilePlus2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';

const services = [
  { label: 'Facilities', detail: 'Repairs and equipment', icon: Wrench, category: 'EQUIPMENT' },
  { label: 'Electrical', detail: 'Power and lighting', icon: Zap, category: 'ELECTRICAL' },
  { label: 'Water & hygiene', detail: 'Plumbing and cleaning', icon: Droplets, category: 'PLUMBING' },
  { label: 'Campus Wi-Fi', detail: 'Network support', icon: Wifi, category: 'WIFI' },
];

const steps = [
  {
    title: 'Share what needs attention',
    description: 'Add the location, details, and a photo so the right team understands the issue quickly.',
    icon: FilePlus2,
  },
  {
    title: 'Follow every update',
    description: 'Know when your request is assigned, in progress, and ready to verify.',
    icon: BellRing,
  },
  {
    title: 'Help improve campus life',
    description: 'One clear record helps students, staff, and campus teams solve problems together.',
    icon: ClipboardCheck,
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7FCFC] text-[#123650]">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo size="md" />

          <nav className="hidden items-center gap-8 text-sm font-bold text-[#526F89] md:flex" aria-label="Main navigation">
            <Link href="/" className="border-b-2 border-emerald-600 py-2 text-[#123650]">Home</Link>
            <a href="#how-it-works" className="transition-colors hover:text-emerald-700">How it works</a>
            <a href="#services" className="transition-colors hover:text-emerald-700">Campus services</a>
            <a href="#support" className="transition-colors hover:text-emerald-700">Support</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className="rounded-full bg-[#E7F6EF] px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 sm:px-5">
              Student login
            </Link>
            <Link href="/issues/new" className="hidden rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(22,132,97,0.22)] transition hover:bg-emerald-700 sm:inline-flex">
              Report a concern
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_18%_18%,#ffffff_0%,#e8f7f3_28%,transparent_52%),linear-gradient(135deg,#f7fcfc_0%,#d9f0fb_55%,#c7e7f6_100%)] pb-20 pt-16 sm:pb-28 sm:pt-24">
        <div className="absolute -right-20 top-8 -z-10 h-80 w-80 rounded-full bg-[#BDE6D6]/50 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 -z-10 h-72 w-72 rounded-full bg-[#F6B0A2]/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white/75 px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              One connected campus experience
            </div>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.08] tracking-[-0.035em] text-[#123650] sm:text-5xl lg:text-6xl">
              Making everyday campus life <span className="text-emerald-600">easier.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-[#526F89] sm:text-lg">
              CAMPVOX gives students, faculty, and campus teams one clear place to report concerns, stay informed, and make every shared space better.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/issues/new" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-[0_10px_20px_rgba(22,132,97,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-700">
                Report a concern <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-2xl border border-[#CFE2E7] bg-white/80 px-5 py-3 text-sm font-bold text-[#123650] shadow-sm transition hover:border-emerald-300 hover:bg-white">
                Sign in to CAMPVOX
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-[#526F89]">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Clear request tracking</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Built for every campus role</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Real-time updates</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="rounded-[2rem] border border-white/80 bg-white/75 p-4 shadow-[0_24px_70px_rgba(18,54,80,0.16)] backdrop-blur-xl sm:p-6">
              <div className="rounded-[1.5rem] bg-[linear-gradient(150deg,#123650_0%,#1f6d67_48%,#8bc6df_100%)] p-5 text-white sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white/70">CAMPVOX</p>
                    <h2 className="mt-1 text-2xl font-extrabold">Campus pulse</h2>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25"><Building2 className="h-6 w-6" /></div>
                </div>
                <div className="mt-7 rounded-2xl bg-white p-4 text-[#123650] shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7F6EF] text-emerald-700"><MapPin className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6B849A]">New campus report</p>
                      <p className="mt-1 font-bold">Classroom lighting needs attention</p>
                      <p className="mt-1 text-sm text-[#6B849A]">Science Block · Room 204</p>
                    </div>
                    <span className="rounded-full bg-[#EEF9F4] px-3 py-1 text-xs font-bold text-emerald-700">Assigned</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/15"><p className="text-2xl font-extrabold">3 steps</p><p className="mt-1 text-sm text-white/75">Report to resolution</p></div>
                  <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/15"><p className="text-2xl font-extrabold">One voice</p><p className="mt-1 text-sm text-white/75">For the whole campus</p></div>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#D8E8E9] bg-white px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF1EE] text-[#E98675]"><ShieldCheck className="h-5 w-5" /></div>
                <p className="text-sm font-semibold text-[#526F89]"><span className="block text-[#123650]">Every update is visible.</span>Clear ownership. Better outcomes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl"><p className="text-sm font-extrabold uppercase tracking-[0.16em] text-emerald-600">How it works</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-[#123650] sm:text-4xl">A simple path from concern to solution.</h2></div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return <article key={step.title} className="rounded-3xl border border-[#D8E8E9] bg-[#F7FCFC] p-7 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_16px_35px_rgba(18,54,80,0.08)]"><div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F6EF] text-emerald-700"><Icon className="h-6 w-6" /></div><span className="text-sm font-extrabold text-[#9AB0BE]">0{index + 1}</span></div><h3 className="mt-6 text-xl font-extrabold text-[#123650]">{step.title}</h3><p className="mt-3 leading-relaxed text-[#637C92]">{step.description}</p></article>;
            })}
          </div>
        </div>
      </section>

      <section id="services" className="bg-[#EEF8FB] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div className="max-w-2xl"><p className="text-sm font-extrabold uppercase tracking-[0.16em] text-emerald-600">Campus services</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-[#123650] sm:text-4xl">Support for the spaces you use every day.</h2></div><Link href="/issues/new" className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800">View all reporting options <ChevronRight className="h-5 w-5" /></Link></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;
              return <Link key={service.label} href={`/issues/new?category=${service.category}`} className="group rounded-3xl border border-white bg-white p-6 shadow-[0_8px_24px_rgba(18,54,80,0.05)] transition hover:-translate-y-1 hover:border-emerald-200"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F6EF] text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white"><Icon className="h-6 w-6" /></div><h3 className="mt-5 text-lg font-extrabold text-[#123650]">{service.label}</h3><p className="mt-1 text-sm font-medium text-[#6B849A]">{service.detail}</p></Link>;
            })}
          </div>
        </div>
      </section>

      <section id="support" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#123650] px-7 py-12 text-white shadow-[0_24px_60px_rgba(18,54,80,0.24)] sm:px-12 sm:py-16">
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#A7DCC8]">Better together</p><h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-5xl">A campus that listens gets better every day.</h2><p className="mt-5 max-w-xl text-lg leading-relaxed text-[#D4E6EC]">Whether it is a broken chair, unreliable Wi-Fi, or a safety concern, CAMPVOX helps the right people respond with clarity and care.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/register" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-[#123650] transition hover:bg-[#E7F6EF]">Create an account <ArrowRight className="h-5 w-5" /></Link><Link href="/login" className="rounded-2xl border border-white/25 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">Sign in</Link></div></div>
        </div>
      </section>

      <footer className="border-t border-[#D8E8E9] bg-white py-9">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 sm:flex-row sm:px-8"><BrandLogo size="sm" showTagline /><p className="text-sm font-medium text-[#6B849A]">© 2026 CAMPVOX. Making Everyday Campus Life Easier.</p><div className="flex gap-5 text-sm font-bold text-[#526F89]"><Link href="/login" className="hover:text-emerald-700">Sign in</Link><Link href="/register" className="hover:text-emerald-700">Create account</Link></div></div>
      </footer>
    </main>
  );
}
