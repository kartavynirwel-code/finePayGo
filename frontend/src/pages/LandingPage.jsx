import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  CreditCard,
  MapPin,
  Camera,
  Users,
  Download,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Zap,
  Globe,
  Lock,
  TrendingUp,
} from 'lucide-react';

// ─── Nav ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FineSnap</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Features', 'About'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-slate-300 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-slate-300 hover:text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="btn-primary !py-2 !px-5 text-sm"
            >
              Register
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-xl border-b border-slate-700/50 px-4 pb-4">
          <div className="flex flex-col gap-2 pt-2">
            {['Home', 'Features', 'About'].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="text-slate-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
              >
                {link}
              </a>
            ))}
            <div className="flex gap-2 pt-2 border-t border-slate-700/50">
              <Link to="/login" className="flex-1 btn-secondary !justify-center text-sm !py-2">
                Login
              </Link>
              <Link to="/register" className="flex-1 btn-primary !justify-center text-sm !py-2">
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />

      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <Zap className="w-3.5 h-3.5" />
          Powered by Digital India Initiative
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
          Smart Digital{' '}
          <span className="gradient-text">E-Challan</span>
          <br />
          Management System
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Digitizing traffic violations for a safer, transparent, and efficient
          road enforcement ecosystem — empowering officers, citizens, and
          administrators alike.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/register" className="btn-primary text-base !px-8 !py-4 shadow-2xl shadow-blue-500/30">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#features" className="btn-secondary text-base !px-8 !py-4">
            Learn More
            <ChevronRight className="w-5 h-5" />
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-xs font-medium">
          {[
            { icon: Lock, text: 'Secure & Encrypted' },
            { icon: Globe, text: 'Pan-India Ready' },
            { icon: CheckCircle, text: 'Govt. Compliant' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="w-4 h-4 text-blue-500" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FileText,
    color: 'blue',
    title: 'Digital Challans',
    desc: 'Issue and manage traffic challans fully digitally — no paperwork, no hassle.',
  },
  {
    icon: CreditCard,
    color: 'emerald',
    title: 'Online Payment',
    desc: 'Citizens can pay fines instantly through integrated secure payment gateways.',
  },
  {
    icon: MapPin,
    color: 'amber',
    title: 'Real-time Tracking',
    desc: 'Track challan status live — from issuance to payment — at every step.',
  },
  {
    icon: Camera,
    color: 'purple',
    title: 'Evidence Upload',
    desc: 'Attach photos and videos as violation evidence directly from the field.',
  },
  {
    icon: Users,
    color: 'cyan',
    title: 'Role-based Access',
    desc: 'Separate portals for Admins, Police Officers, and Citizens with tailored permissions.',
  },
  {
    icon: Download,
    color: 'rose',
    title: 'PDF Generation',
    desc: 'Instantly generate and download official challan receipts as PDF documents.',
  },
];

const colorMap = {
  blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20', glow: 'group-hover:shadow-blue-500/20' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'group-hover:shadow-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20', glow: 'group-hover:shadow-amber-500/20' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20', glow: 'group-hover:shadow-purple-500/20' },
  cyan: { bg: 'bg-cyan-500/10', icon: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'group-hover:shadow-cyan-500/20' },
  rose: { bg: 'bg-rose-500/10', icon: 'text-rose-400', border: 'border-rose-500/20', glow: 'group-hover:shadow-rose-500/20' },
};

function Features() {
  return (
    <section id="features" className="py-24 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Why FineSnap?
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Everything you need in one place
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A comprehensive suite of tools built for modern traffic enforcement
            and citizen convenience.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => {
            const c = colorMap[color];
            return (
              <div
                key={title}
                className={`group card border ${c.border} hover:bg-slate-800/90 hover:shadow-xl ${c.glow} transition-all duration-300 cursor-default`}
              >
                <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ───────────────────────────────────────────────────────────────────
const STATS = [
  { value: '10K+', label: 'Challans Issued', icon: FileText, color: 'text-blue-400' },
  { value: '5K+', label: 'Citizens Enrolled', icon: Users, color: 'text-emerald-400' },
  { value: '98%', label: 'Collection Rate', icon: TrendingUp, color: 'text-amber-400' },
  { value: '100%', label: 'Digital Process', icon: Zap, color: 'text-cyan-400' },
];

function Stats() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-950/50 to-slate-900 border-y border-slate-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon, color }) => (
            <div key={label} className="text-center group">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Icon className={`w-7 h-7 ${color}`} />
              </div>
              <div className={`text-4xl font-extrabold ${color} mb-1`}>{value}</div>
              <div className="text-slate-400 text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    step: '01',
    title: 'Officer Issues Challan',
    desc: 'Traffic officers capture violation details, upload photo/video evidence, and issue an e-challan instantly from the field.',
    icon: Camera,
  },
  {
    step: '02',
    title: 'Citizen Gets Notified',
    desc: 'The citizen receives an instant notification with all challan details, violation type, and the exact fine amount payable.',
    icon: FileText,
  },
  {
    step: '03',
    title: 'Pay & Close Online',
    desc: 'Citizens pay the fine securely online, download the receipt as PDF, and the challan is automatically marked as resolved.',
    icon: CreditCard,
  },
];

function HowItWorks() {
  return (
    <section id="about" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-900/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            How FineSnap works
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Three effortless steps from violation to resolution — fully digital,
            fully transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

          {STEPS.map(({ step, title, desc, icon: Icon }, idx) => (
            <div key={step} className="relative flex flex-col items-center text-center">
              {/* Step bubble */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/30 to-cyan-600/20 border border-blue-500/30 flex items-center justify-center shadow-xl shadow-blue-500/10">
                  <Icon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{idx + 1}</span>
                </div>
              </div>

              <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link to="/register" className="btn-primary text-base !px-10 !py-4 shadow-2xl shadow-blue-500/30">
            Start Using FineSnap
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">FineSnap</span>
            <span className="text-slate-500 text-sm">— Digital E-Challan System</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-slate-500 text-sm">
            {['Privacy Policy', 'Terms of Use', 'Contact'].map((l) => (
              <a key={l} href="#" className="hover:text-slate-300 transition-colors">
                {l}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} FineSnap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <HowItWorks />
      <Footer />
    </div>
  );
}
