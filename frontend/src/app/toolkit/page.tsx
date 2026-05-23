'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import {
  Brain, Sparkles, FileText, MessageSquare, BarChart2,
  BookOpen, PenTool, Zap, ChevronRight, ArrowRight
} from 'lucide-react';

const TOOLS = [
  {
    icon: Brain,      color: 'bg-orange-50 text-brand',
    title: 'Question Paper Generator',
    desc:  'Generate full question papers with sections, difficulty tags, and marks using AI.',
    badge: 'Popular', badgeColor: 'bg-orange-100 text-brand',
    href:  '/create',
  },
  {
    icon: MessageSquare, color: 'bg-blue-50 text-blue-500',
    title: 'Essay Grader',
    desc:  'Upload student essays and get instant AI grading with detailed feedback and rubric scoring.',
    badge: 'New', badgeColor: 'bg-blue-100 text-blue-600',
    href:  '#',
  },
  {
    icon: FileText,   color: 'bg-green-50 text-green-600',
    title: 'Lesson Plan Creator',
    desc:  'Create detailed lesson plans aligned with curriculum standards in minutes.',
    badge: null, badgeColor: '',
    href:  '#',
  },
  {
    icon: BarChart2,  color: 'bg-purple-50 text-purple-500',
    title: 'Student Progress Analyser',
    desc:  'Analyse student performance data and identify areas needing improvement.',
    badge: 'Beta', badgeColor: 'bg-purple-100 text-purple-600',
    href:  '#',
  },
  {
    icon: BookOpen,   color: 'bg-teal-50 text-teal-500',
    title: 'Rubric Builder',
    desc:  'Build grading rubrics for any assignment type with customisable criteria.',
    badge: null, badgeColor: '',
    href:  '#',
  },
  {
    icon: PenTool,    color: 'bg-rose-50 text-rose-500',
    title: 'Feedback Generator',
    desc:  'Generate personalised, constructive feedback for individual students automatically.',
    badge: null, badgeColor: '',
    href:  '#',
  },
];

export default function ToolkitPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="AI Teacher's Toolkit"/>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full bg-green-500"/>
          <h1 className="text-[15px] font-semibold text-gray-900">AI Teacher's Toolkit</h1>
        </div>
        <p className="text-[12px] text-gray-500 mb-6">Powerful AI tools to help you teach smarter, not harder.</p>

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 sm:p-7 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-brand/20 -translate-y-1/2 translate-x-1/4 pointer-events-none"/>
          <div className="relative">
            <div className="flex items-center gap-1.5 text-white/60 text-[11px] mb-2">
              <Sparkles size={11}/> Powered by Claude AI
            </div>
            <h2 className="text-white font-bold text-lg sm:text-xl mb-1">Teaching Tools, Reimagined</h2>
            <p className="text-white/60 text-[12px] mb-4 max-w-md">
              From generating question papers to analysing student progress — all your teaching needs, supercharged by AI.
            </p>
            <Link href="/create"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-[13px] font-semibold px-4 py-2 rounded-full transition-colors">
              Start with Question Generator <ArrowRight size={13}/>
            </Link>
          </div>
        </div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map(({ icon: Icon, color, title, desc, badge, badgeColor, href }) => (
            <div key={title}
              className={`bg-white rounded-xl border p-5 transition-all cursor-pointer group ${active === title ? 'border-gray-300 shadow-md' : 'border-gray-100 hover:shadow-sm hover:border-gray-200'}`}
              onClick={() => setActive(active === title ? null : title)}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18}/>
                </div>
                {badge && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                )}
              </div>
              <h3 className="text-[13px] font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-3">{desc}</p>
              {href !== '#' ? (
                <Link href={href}
                  className="inline-flex items-center gap-1 text-[12px] text-brand font-medium hover:gap-2 transition-all"
                  onClick={e => e.stopPropagation()}>
                  Open tool <ChevronRight size={12}/>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 text-[12px] text-gray-400">
                  Coming soon <Zap size={11}/>
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="mt-6 bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
          <Sparkles size={15} className="text-brand mt-0.5 shrink-0"/>
          <div>
            <p className="text-[13px] font-medium text-gray-900 mb-0.5">Pro Tip</p>
            <p className="text-[12px] text-gray-600">Upload reference material (PDF/image) when creating assignments for more curriculum-aligned questions.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
