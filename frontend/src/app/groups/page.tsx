'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import { Users, Plus, Search, MoreVertical, BookOpen, ChevronRight } from 'lucide-react';

const SAMPLE_GROUPS = [
  { id:'1', name:'Class 8 - Science',   students:32, assignments:5, color:'bg-blue-500'   },
  { id:'2', name:'Class 9 - Maths',     students:28, assignments:3, color:'bg-purple-500' },
  { id:'3', name:'Class 10 - Physics',  students:35, assignments:7, color:'bg-green-500'  },
  { id:'4', name:'Class 10 - Chemistry',students:30, assignments:4, color:'bg-orange-500' },
  { id:'5', name:'Class 11 - Biology',  students:25, assignments:6, color:'bg-red-500'    },
  { id:'6', name:'Class 12 - English',  students:38, assignments:2, color:'bg-teal-500'   },
];

export default function GroupsPage() {
  const [search, setSearch]   = useState('');
  const [showModal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [groups, setGroups]   = useState(SAMPLE_GROUPS);

  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  const addGroup = () => {
    if (!newName.trim()) return;
    const colors = ['bg-blue-500','bg-purple-500','bg-green-500','bg-orange-500','bg-red-500','bg-teal-500'];
    setGroups(p => [...p, { id: Date.now().toString(), name: newName, students: 0, assignments: 0, color: colors[p.length % colors.length] }]);
    setNewName(''); setModal(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="My Groups"/>
      <main className="flex-1 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full bg-green-500"/>
          <h1 className="text-[15px] font-semibold text-gray-900">My Groups</h1>
        </div>
        <p className="text-[12px] text-gray-500 mb-5">Manage your classes and student groups.</p>

        {/* Toolbar */}
        <div className="flex flex-col xs:flex-row gap-3 mb-5">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white flex-1">
            <Search size={13} className="text-gray-400 shrink-0"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search groups..." className="text-[12px] outline-none flex-1 bg-transparent placeholder:text-gray-400"/>
          </div>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
            <Plus size={14}/> New Group
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label:'Total Groups',   value: groups.length },
            { label:'Total Students', value: groups.reduce((s,g)=>s+g.students,0) },
            { label:'Active Classes', value: groups.length },
            { label:'Assignments',    value: groups.reduce((s,g)=>s+g.assignments,0) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Group cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => (
            <div key={g.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${g.color} flex items-center justify-center`}>
                  <Users size={18} className="text-white"/>
                </div>
                <button className="p-1 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical size={14} className="text-gray-400"/>
                </button>
              </div>
              <h3 className="text-[13px] font-semibold text-gray-900 mb-1">{g.name}</h3>
              <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
                <span className="flex items-center gap-1"><Users size={10}/> {g.students} students</span>
                <span className="flex items-center gap-1"><BookOpen size={10}/> {g.assignments} assignments</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                  {Array.from({ length: Math.min(4, g.students) }).map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                      <span className="text-[8px] text-gray-500 font-medium">{String.fromCharCode(65+i)}</span>
                    </div>
                  ))}
                  {g.students > 4 && <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center"><span className="text-[8px] text-gray-500">+{g.students-4}</span></div>}
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-brand transition-colors"/>
              </div>
            </div>
          ))}

          {/* Add group card */}
          <button onClick={() => setModal(true)}
            className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center hover:border-gray-300 hover:bg-gray-50 transition-colors group min-h-[160px]">
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center mb-2 transition-colors">
              <Plus size={18} className="text-gray-400"/>
            </div>
            <p className="text-[12px] text-gray-500 font-medium">Create New Group</p>
          </button>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-[15px] font-semibold text-gray-900 mb-1">Create New Group</h3>
            <p className="text-[12px] text-gray-500 mb-4">Add a new class or student group.</p>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Class 10 - Physics"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-gray-200 mb-4"
              onKeyDown={e => e.key === 'Enter' && addGroup()}/>
            <div className="flex gap-2">
              <button onClick={() => setModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 text-[13px] py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={addGroup}
                className="flex-1 bg-gray-900 text-white text-[13px] py-2.5 rounded-lg hover:bg-gray-800 transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
