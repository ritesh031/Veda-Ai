'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import { useStore } from '@/store';
import { Upload, X, Plus, Minus, ChevronDown, Mic, AlertCircle } from 'lucide-react';

const QTYPES = [
  'Multiple Choice Questions', 'Short Questions', 'Long Answer Questions',
  'Diagram/Graph-Based Questions', 'Numerical Problems',
  'True/False Questions', 'Fill in the Blanks', 'Match the Following',
];

interface Row { id: string; type: string; numberOfQuestions: number; marksPerQuestion: number; }

function mkRow(id: string): Row {
  return { id, type: QTYPES[0], numberOfQuestions: 5, marksPerQuestion: 2 };
}

export default function CreatePage() {
  const router = useRouter();
  const { create } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep]                 = useState(1);
  const [file, setFile]                 = useState<File | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  const [dueDate, setDueDate]           = useState('');
  const [subject, setSubject]           = useState('');
  const [additionalInfo, setAdditional] = useState('');
  const [rows, setRows]                 = useState<Row[]>([
    { id: '1', type: 'Multiple Choice Questions',    numberOfQuestions: 4, marksPerQuestion: 1 },
    { id: '2', type: 'Short Questions',              numberOfQuestions: 3, marksPerQuestion: 2 },
    { id: '3', type: 'Diagram/Graph-Based Questions',numberOfQuestions: 5, marksPerQuestion: 5 },
    { id: '4', type: 'Numerical Problems',           numberOfQuestions: 5, marksPerQuestion: 5 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const totalQ = rows.reduce((s, r) => s + r.numberOfQuestions, 0);
  const totalM = rows.reduce((s, r) => s + r.numberOfQuestions * r.marksPerQuestion, 0);

  const adj = (id: string, field: 'numberOfQuestions' | 'marksPerQuestion', d: number) =>
    setRows(p => p.map(r => r.id === id ? { ...r, [field]: Math.max(1, r[field] + d) } : r));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!subject.trim()) e.subject = 'Subject is required';
    if (!dueDate)        e.dueDate = 'Due date is required';
    rows.forEach(r => {
      if (!r.type.trim()) e[`type-${r.id}`] = 'Required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    const ok = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'].includes(f.type);
    if (!ok) { toast.error('Only PDF, TXT, JPG, PNG files accepted'); return; }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!validate()) { toast.error('Please fix the errors first'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('subject', subject);
      fd.append('dueDate', dueDate);
      fd.append('additionalInstructions', additionalInfo);
      fd.append('questionTypes', JSON.stringify(
        rows.map(r => ({ type: r.type, numberOfQuestions: r.numberOfQuestions, marksPerQuestion: r.marksPerQuestion }))
      ));
      if (file) fd.append('file', file);
      const id = await create(fd);
      toast.success('Assignment created! AI is generating your paper...');
      router.push(`/assignments/${id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create');
      setLoading(false);
      setStep(1);
    }
  };

  const inputCls = (k: string) =>
    `w-full border rounded-lg px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-gray-200 transition-all bg-white ${errors[k] ? 'border-red-400' : 'border-gray-200'}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Assignment" showBack backHref="/assignments"/>
      <main className="flex-1 p-4 sm:p-6">
        {/* Page header */}
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full bg-green-500"/>
          <h1 className="text-[15px] font-semibold text-gray-900">Create Assignment</h1>
        </div>
        <p className="text-[12px] text-gray-500 mb-4">Set up a new assignment for your students</p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5 max-w-2xl">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${step >= s ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
              <div className={`h-1 flex-1 rounded-full transition-colors ${s === 1 ? (step >= 2 ? 'bg-gray-900' : 'bg-gray-200') : 'hidden'}`}/>
              <span className={`text-[11px] hidden xs:block ${step >= s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? 'Details' : 'Review'}
              </span>
            </div>
          ))}
        </div>

        {step === 1 ? (
          /* ── STEP 1: Details ── */
          <div className="max-w-2xl space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-0.5">Assignment Details</h2>
              <p className="text-[12px] text-gray-500 mb-5">Basic information about your assignment</p>

              {/* File Upload */}
              <div
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer transition-colors mb-4 ${dragOver ? 'border-brand bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileRef.current?.click()}
              >
                {file ? (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <Upload size={16} className="text-brand"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 truncate max-w-[180px] sm:max-w-none">{file.name}</p>
                      <p className="text-[11px] text-gray-500">{(file.size/1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="ml-1 text-gray-400 hover:text-red-400 shrink-0">
                      <X size={14}/>
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={22} className="text-gray-400 mb-2"/>
                    <p className="text-[13px] font-medium text-gray-700 mb-0.5 text-center">Choose a file or drag & drop it here</p>
                    <p className="text-[11px] text-gray-400 mb-3">JPEG, PNG, PDF, TXT — upto 10MB</p>
                    <button type="button" className="border border-gray-200 text-gray-700 text-[12px] px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      Browse Files
                    </button>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" className="hidden" accept=".pdf,.txt,.jpg,.jpeg,.png"
                onChange={e => handleFile(e.target.files?.[0])}/>
              <p className="text-[11px] text-gray-400 text-center mb-5">Upload reference material for better output</p>

              {/* Subject */}
              <div className="mb-4">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Subject *</label>
                <input value={subject} onChange={e => { setSubject(e.target.value); setErrors(p => ({...p, subject: ''})); }}
                  placeholder="e.g. Physics, Mathematics, English" className={inputCls('subject')}/>
                {errors.subject && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.subject}</p>}
              </div>

              {/* Due Date */}
              <div className="mb-5">
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Due Date *</label>
                <input type="date" value={dueDate} min={new Date().toISOString().split('T')[0]}
                  onChange={e => { setDueDate(e.target.value); setErrors(p => ({...p, dueDate: ''})); }}
                  className={inputCls('dueDate')}/>
                {errors.dueDate && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.dueDate}</p>}
              </div>

              {/* Question Types */}
              <div className="mb-5">
                {/* Header row — hidden on very small screens */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_120px_90px_24px] gap-2 mb-2 px-1">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Question Type</span>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-center">No. of Questions</span>
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide text-center">Marks</span>
                  <span/>
                </div>

                <div className="space-y-3">
                  {rows.map(row => (
                    <div key={row.id} className="flex flex-col sm:grid sm:grid-cols-[1fr_120px_90px_24px] gap-2 sm:items-center bg-gray-50 sm:bg-transparent rounded-xl sm:rounded-none p-3 sm:p-0">
                      {/* Type select */}
                      <div className="relative">
                        <select value={row.type} onChange={e => setRows(p => p.map(r => r.id === row.id ? {...r, type: e.target.value} : r))}
                          className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-[12px] pr-7 outline-none focus:ring-2 focus:ring-gray-200 bg-white">
                          {QTYPES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-0 sm:justify-center">
                        {/* No. of questions stepper */}
                        <div className="flex flex-col xs:flex-row xs:items-center gap-1">
                          <span className="text-[11px] text-gray-500 xs:hidden">Questions:</span>
                          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-1.5 bg-white w-28 justify-between">
                            <button type="button" onClick={() => adj(row.id, 'numberOfQuestions', -1)}
                              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900">
                              <Minus size={11}/>
                            </button>
                            <span className="text-[13px] font-medium w-5 text-center">{row.numberOfQuestions}</span>
                            <button type="button" onClick={() => adj(row.id, 'numberOfQuestions', 1)}
                              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900">
                              <Plus size={11}/>
                            </button>
                          </div>
                        </div>

                        {/* Marks stepper */}
                        <div className="flex flex-col xs:flex-row xs:items-center gap-1">
                          <span className="text-[11px] text-gray-500 xs:hidden">Marks each:</span>
                          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-1.5 bg-white w-20 justify-between">
                            <button type="button" onClick={() => adj(row.id, 'marksPerQuestion', -1)}
                              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900">
                              <Minus size={11}/>
                            </button>
                            <span className="text-[13px] font-medium w-5 text-center">{row.marksPerQuestion}</span>
                            <button type="button" onClick={() => adj(row.id, 'marksPerQuestion', 1)}
                              className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900">
                              <Plus size={11}/>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove */}
                      <button type="button" onClick={() => rows.length > 1 && setRows(p => p.filter(r => r.id !== row.id))}
                        className="hidden sm:flex w-6 h-6 items-center justify-center text-gray-300 hover:text-red-400 transition-colors">
                        <X size={13}/>
                      </button>
                      {/* Mobile remove */}
                      {rows.length > 1 && (
                        <button type="button" onClick={() => setRows(p => p.filter(r => r.id !== row.id))}
                          className="sm:hidden self-end text-[11px] text-red-400 hover:text-red-600">
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add row */}
                <button type="button" onClick={() => setRows(p => [...p, mkRow(Date.now().toString())])}
                  className="flex items-center gap-2 mt-3 text-[12px] text-gray-600 hover:text-gray-900 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                    <Plus size={11} className="text-white"/>
                  </div>
                  Add Question Type
                </button>

                {/* Totals */}
                <div className="flex flex-col items-end mt-3 gap-0.5 border-t border-gray-100 pt-3">
                  <p className="text-[12px] text-gray-600">Total Questions : <span className="font-semibold text-gray-900">{totalQ}</span></p>
                  <p className="text-[12px] text-gray-600">Total Marks : <span className="font-semibold text-gray-900">{totalM}</span></p>
                </div>
              </div>

              {/* Additional info */}
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1.5">Additional Information <span className="text-gray-400 font-normal">(For better output)</span></label>
                <div className="relative">
                  <textarea value={additionalInfo} onChange={e => setAdditional(e.target.value)}
                    placeholder="e.g Generate a question paper for 3 hour exam duration..."
                    rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-gray-200 resize-none pr-10"/>
                  <button className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600">
                    <Mic size={15}/>
                  </button>
                </div>
              </div>
            </div>

            {/* Nav buttons */}
            <div className="flex items-center justify-between">
              <button onClick={() => router.push('/assignments')}
                className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors">
                ← Previous
              </button>
              <button onClick={() => { if (validate()) setStep(2); else toast.error('Please fix errors'); }}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-medium px-6 py-2.5 rounded-full transition-colors">
                Next →
              </button>
            </div>
          </div>
        ) : (
          /* ── STEP 2: Review ── */
          <div className="max-w-2xl space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Review & Generate</h2>

              <div className="space-y-3">
                <ReviewRow label="Subject"   value={subject}/>
                <ReviewRow label="Due Date"  value={new Date(dueDate).toLocaleDateString('en-GB')}/>
                <ReviewRow label="Total Questions" value={`${totalQ}`}/>
                <ReviewRow label="Total Marks"     value={`${totalM}`}/>
                {file && <ReviewRow label="Reference File" value={file.name}/>}
                {additionalInfo && <ReviewRow label="Instructions" value={additionalInfo}/>}
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="text-[12px] font-semibold text-gray-700 mb-2">Question Breakdown</p>
                <div className="space-y-2">
                  {rows.map(r => (
                    <div key={r.id} className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-600">{r.type}</span>
                      <span className="text-gray-900 font-medium">{r.numberOfQuestions} × {r.marksPerQuestion}m = {r.numberOfQuestions * r.marksPerQuestion}m</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={() => setStep(1)}
                className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-[13px] font-medium px-5 py-2.5 rounded-full hover:bg-gray-50 transition-colors">
                ← Previous
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white text-[13px] font-medium px-6 py-2.5 rounded-full transition-colors">
                {loading ? (<><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full spinning"/>Generating...</>) : 'Generate Paper →'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-50">
      <span className="text-[12px] text-gray-500 shrink-0">{label}</span>
      <span className="text-[12px] text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}
