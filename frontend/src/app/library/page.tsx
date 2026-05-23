'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import { Search, Filter, BookOpen, FileText, Download, Star, Clock, Tag, Plus } from 'lucide-react';

const CATEGORIES = ['All', 'Science', 'Maths', 'English', 'History', 'Geography'];

const RESOURCES = [
  { id:'1', title:'NCERT Science Grade 8 — Chapter 14 Summary', type:'PDF', subject:'Science', size:'2.4 MB', starred:true,  date:'2025-05-10', tags:['Grade 8','NCERT'] },
  { id:'2', title:'Algebra Formulae Sheet',                     type:'DOC', subject:'Maths',   size:'0.8 MB', starred:true,  date:'2025-05-08', tags:['Grade 10','Formulae'] },
  { id:'3', title:'English Grammar Quick Reference',            type:'PDF', subject:'English', size:'1.2 MB', starred:false, date:'2025-05-06', tags:['Grammar','Reference'] },
  { id:'4', title:'Periodic Table — Colour Chart',             type:'IMG', subject:'Science', size:'0.5 MB', starred:false, date:'2025-05-03', tags:['Chemistry','Grade 9'] },
  { id:'5', title:'Trigonometry Practice Problems',            type:'PDF', subject:'Maths',   size:'1.7 MB', starred:true,  date:'2025-04-28', tags:['Grade 11','Practice'] },
  { id:'6', title:'World History Timeline 1900–2000',          type:'PDF', subject:'History', size:'3.1 MB', starred:false, date:'2025-04-20', tags:['Grade 12','Timeline'] },
];

const typeColor: Record<string, string> = {
  PDF: 'bg-red-50 text-red-500',
  DOC: 'bg-blue-50 text-blue-500',
  IMG: 'bg-green-50 text-green-600',
};

export default function LibraryPage() {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [resources, setResources] = useState(RESOURCES);

  const filtered = resources.filter(r => {
    const s = r.title.toLowerCase().includes(search.toLowerCase());
    const c = category === 'All' || r.subject === category;
    return s && c;
  });

  const toggleStar = (id: string) =>
    setResources(p => p.map(r => r.id === id ? { ...r, starred: !r.starred } : r));

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="My Library"/>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"/>
            <h1 className="text-[15px] font-semibold text-gray-900">My Library</h1>
          </div>
          <button className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={13}/> Upload
          </button>
        </div>
        <p className="text-[12px] text-gray-500 mb-5">Your saved resources, templates, and reference materials.</p>

        {/* Search + filter */}
        <div className="flex flex-col xs:flex-row gap-3 mb-4">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1">
            <Search size={13} className="text-gray-400 shrink-0"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search resources..." className="text-[12px] outline-none flex-1 bg-transparent placeholder:text-gray-400"/>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`shrink-0 text-[12px] px-3 py-1.5 rounded-full border transition-colors font-medium ${category === c ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label:'Total Files',  value: resources.length },
            { label:'Starred',      value: resources.filter(r=>r.starred).length },
            { label:'This Month',   value: 3 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-3 border border-gray-100 text-center">
              <p className="text-lg font-bold text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Resource list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-[13px]">No resources found.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 hover:shadow-sm transition-shadow group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColor[r.type] || 'bg-gray-100 text-gray-500'}`}>
                  <FileText size={15}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 truncate">{r.title}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock size={9}/> {r.date}</span>
                    <span className="text-[10px] text-gray-400">{r.size}</span>
                    {r.tags.slice(0,2).map(t => (
                      <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Tag size={8}/>{t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleStar(r.id)}
                    className={`p-1.5 rounded-lg transition-colors ${r.starred ? 'text-amber-400 bg-amber-50' : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'}`}>
                    <Star size={14} fill={r.starred ? 'currentColor' : 'none'}/>
                  </button>
                  <button className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                    <Download size={14}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
