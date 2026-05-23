'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useStore } from '@/store';
import Header from '@/components/Header';
import { Search, Filter, MoreVertical, Plus, Loader2, ChevronDown } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', processing: 'Generating', completed: 'Ready', failed: 'Failed',
};

export default function AssignmentsPage() {
  const { assignments, loading, fetchAll, remove } = useStore();
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const menuRef   = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (menuRef.current   && !menuRef.current.contains(e.target as Node))   setMenuOpen(null);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = assignments.filter((a) => {
    const matchSearch = a.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const totalQ    = (a: any) => a.questionTypes?.reduce((s: number, q: any) => s + q.numberOfQuestions, 0) ?? 0;
  const totalM    = (a: any) => a.questionTypes?.reduce((s: number, q: any) => s + q.numberOfQuestions * q.marksPerQuestion, 0) ?? 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Assignment"/>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0"/>
          <h1 className="text-[15px] font-semibold text-gray-900">Assignments</h1>
          {assignments.length > 0 && (
            <span className="ml-1 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {assignments.length}
            </span>
          )}
        </div>
        <p className="text-[12px] text-gray-500 mb-5">Manage and create assignments for your classes.</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 h-32">
                <div className="skeleton h-4 w-2/3 mb-3"/>
                <div className="skeleton h-3 w-1/3 mb-2"/>
                <div className="skeleton h-3 w-1/2"/>
              </div>
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState/>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-3 mb-5" ref={filterRef}>
              {/* Filter dropdown */}
              <div className="relative">
                <button onClick={() => setFilterOpen(v => !v)}
                  className="flex items-center gap-1.5 text-[12px] text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors bg-white">
                  <Filter size={13}/> Filter: {filter === 'all' ? 'All' : STATUS_LABELS[filter]}
                  <ChevronDown size={12} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`}/>
                </button>
                {filterOpen && (
                  <div className="absolute left-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 w-36 animate-in">
                    {['all','pending','processing','completed','failed'].map(f => (
                      <button key={f} onClick={() => { setFilter(f); setFilterOpen(false); }}
                        className={`block w-full text-left px-4 py-2 text-[12px] capitalize hover:bg-gray-50 transition-colors ${filter === f ? 'text-brand font-medium' : 'text-gray-700'}`}>
                        {f === 'all' ? 'All' : STATUS_LABELS[f]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1 xs:max-w-[220px]">
                <Search size={13} className="text-gray-400 shrink-0"/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search Assignment"
                  className="text-[12px] outline-none flex-1 bg-transparent placeholder:text-gray-400"/>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400 text-[13px]">No assignments match your search.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-24" ref={menuRef}>
                {filtered.map(a => {
                  const statusColor = {
                    pending:    'bg-amber-50 text-amber-600',
                    processing: 'bg-blue-50 text-blue-600',
                    completed:  'bg-green-50 text-green-600',
                    failed:     'bg-red-50 text-red-500',
                  }[a.status] ?? 'bg-gray-50 text-gray-500';

                  return (
                    <div key={a._id}
                      className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 relative hover:shadow-sm transition-shadow group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[14px] font-semibold text-gray-900 mb-1.5 truncate">
                            Quiz on {a.subject}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                              {(a.status === 'processing' || a.status === 'pending') && <Loader2 size={9} className="spinning"/>}
                              {STATUS_LABELS[a.status]}
                            </span>
                            <span className="text-[11px] text-gray-400">{totalQ(a)} questions · {totalM(a)} marks</span>
                          </div>
                        </div>

                        <div className="relative shrink-0">
                          <button onClick={() => setMenuOpen(menuOpen === a._id ? null : a._id)}
                            className="p-1 rounded hover:bg-gray-100 transition-colors">
                            <MoreVertical size={15} className="text-gray-400"/>
                          </button>
                          {menuOpen === a._id && (
                            <div className="absolute right-0 top-7 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-10 py-1 animate-in">
                              <Link href={`/assignments/${a._id}`}
                                className="block px-4 py-2 text-[12px] text-gray-700 hover:bg-gray-50"
                                onClick={() => setMenuOpen(null)}>
                                View Assignment
                              </Link>
                              <button onClick={() => { remove(a._id); setMenuOpen(null); }}
                                className="block w-full text-left px-4 py-2 text-[12px] text-red-500 hover:bg-red-50">
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col xs:flex-row xs:items-center justify-between mt-3 pt-3 border-t border-gray-50 gap-1">
                        <p className="text-[11px] text-gray-500">
                          <span className="font-medium text-gray-700">Assigned on</span> : {format(new Date(a.createdAt), 'dd-MM-yyyy')}
                        </p>
                        {a.dueDate && (
                          <p className="text-[11px] text-gray-500">
                            <span className="font-medium text-gray-700">Due</span> : <span className="text-red-500">{format(new Date(a.dueDate), 'dd-MM-yyyy')}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* FAB */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-[calc(50%+105px)] z-30">
              <Link href="/create"
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-lg transition-colors whitespace-nowrap">
                <Plus size={15}/> Create Assignment
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 animate-in">
      <svg width="140" height="110" viewBox="0 0 140 110" fill="none" className="mb-6">
        <rect x="28" y="10" width="70" height="85" rx="6" fill="#F0F0F5"/>
        <rect x="38" y="25" width="50" height="5" rx="2.5" fill="#D0D0E0"/>
        <rect x="38" y="36" width="40" height="4" rx="2" fill="#D0D0E0"/>
        <rect x="38" y="46" width="45" height="4" rx="2" fill="#D0D0E0"/>
        <circle cx="88" cy="68" r="26" fill="#E8E8F0"/>
        <circle cx="88" cy="68" r="19" fill="white"/>
        <line x1="107" y1="87" x2="120" y2="100" stroke="#B0B0C0" strokeWidth="5" strokeLinecap="round"/>
        <circle cx="88" cy="68" r="11" fill="#FEE2E2"/>
        <line x1="82" y1="62" x2="94" y2="74" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="94" y1="62" x2="82" y2="74" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
        <text x="20" y="82" fontSize="12" fill="#A0A0C0">✦</text>
        <text x="108" y="42" fontSize="8" fill="#A0C8E0">●</text>
        <text x="120" y="58" fontSize="14" fill="#C0C0E0">✦</text>
      </svg>
      <h2 className="text-[15px] font-semibold text-gray-900 mb-2">No assignments yet</h2>
      <p className="text-[12px] text-gray-500 text-center max-w-xs leading-relaxed mb-6 px-4">
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <Link href="/create"
        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-semibold px-6 py-3 rounded-full transition-colors">
        <Plus size={14}/> Create Your First Assignment
      </Link>
    </div>
  );
}
