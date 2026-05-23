'use client';
import Link from 'next/link';
import Header from '@/components/Header';
import { Brain, Zap, FileText, Users, BookOpen, ArrowRight, Sparkles, Clock, CheckCircle } from 'lucide-react';

const stats = [
  { label: 'Papers Generated', value: '2,400+', icon: FileText },
  { label: 'Active Teachers', value: '320+',   icon: Users    },
  { label: 'Avg. Generation Time', value: '25s', icon: Clock  },
  { label: 'Accuracy Score', value: '98%',     icon: CheckCircle },
];

const features = [
  {
    icon: Brain,
    color: 'bg-orange-50 text-brand',
    title: 'AI-Powered Generation',
    desc: 'Claude AI crafts curriculum-aligned questions with correct difficulty distribution across sections.',
  },
  {
    icon: Zap,
    color: 'bg-blue-50 text-blue-500',
    title: 'Real-Time Progress',
    desc: 'WebSocket updates show live generation progress — no page refresh, no waiting in the dark.',
  },
  {
    icon: FileText,
    color: 'bg-green-50 text-green-600',
    title: 'PDF Export',
    desc: 'Download a print-ready question paper with answer key, formatted like a real exam sheet.',
  },
];

const quickLinks = [
  { label: 'Create Assignment', href: '/create',      desc: 'Generate a new question paper',   color: 'bg-brand text-white hover:bg-brand-dark' },
  { label: 'My Assignments',    href: '/assignments', desc: 'View all generated papers',       color: 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200' },
  { label: 'AI Toolkit',        href: '/toolkit',     desc: 'Extra AI teaching tools',         color: 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200' },
  { label: 'My Library',        href: '/library',     desc: 'Saved resources & templates',    color: 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Home"/>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {/* Welcome banner */}
        <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand -translate-y-1/2 translate-x-1/4"/>
            <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-orange-300"/>
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-[11px] px-3 py-1 rounded-full mb-3">
              <Sparkles size={11}/> AI-Powered Assessment Platform
            </div>
            <h1 className="text-white font-bold text-xl sm:text-2xl lg:text-3xl mb-2">
              Welcome back, <span className="text-orange-400">John Doe</span> 👋
            </h1>
            <p className="text-white/60 text-[13px] mb-5 max-w-lg">
              Create AI-generated question papers for your students in seconds. Just set the subject, question types, and marks — VedaAI handles the rest.
            </p>
            <Link href="/create"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-[13px] font-semibold px-5 py-2.5 rounded-full transition-colors">
              + Create Assignment <ArrowRight size={14}/>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mb-3">
                <Icon size={15} className="text-brand"/>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="mb-6">
          <h2 className="text-[14px] font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickLinks.map(({ label, href, desc, color }) => (
              <Link key={label} href={href}
                className={`rounded-xl p-4 transition-all shadow-sm ${color}`}>
                <p className="text-[13px] font-semibold mb-0.5">{label}</p>
                <p className="text-[11px] opacity-70">{desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-[14px] font-semibold text-gray-900 mb-3">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={16}/>
                </div>
                <p className="text-[13px] font-semibold text-gray-900 mb-1">{title}</p>
                <p className="text-[12px] text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
