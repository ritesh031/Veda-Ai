'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useStore } from '@/store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { GeneratedPaper, Section, Question } from '@/types';
import { Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { current, paper, loading, generating, progress, progressMsg, error, fetchOne, regenerate, setGenerating } = useStore();

  useWebSocket(id);

  useEffect(() => { fetchOne(id); }, [id]);

  useEffect(() => {
    if (!current || current.status === 'completed' || current.status === 'failed') return;
    const t = setInterval(() => fetchOne(id), 5000);
    return () => clearInterval(t);
  }, [current?.status]);

  useEffect(() => { if (paper) setGenerating(false); }, [paper]);

  const handlePDF = async () => {
    try {
      const res = await api.get(`/assignments/${id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `paper-${id}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch { toast.error('Failed to download PDF'); }
  };

  const handleRegen = async () => {
    try { await regenerate(id); await fetchOne(id); toast.success('Regenerating paper...'); }
    catch { toast.error('Failed to regenerate'); }
  };

  const isPending = !paper && (generating || current?.status === 'pending' || current?.status === 'processing');
  const isFailed  = current?.status === 'failed' && !paper;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header with action bar */}
      <header className="h-auto min-h-14 bg-white border-b border-gray-100 sticky top-0 z-20 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:hidden"/>
            <Link href="/assignments" className="text-gray-400 hover:text-gray-700 p-1">←</Link>
            <span className="text-[13px] text-gray-500 truncate max-w-[140px] sm:max-w-xs">
              {current?.subject ? `Quiz on ${current.subject}` : 'View Assignment'}
            </span>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <span className="text-gray-400 text-[17px]">🔔</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"/>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-gray-600">J</span>
              </div>
              <span className="text-[13px] font-medium text-gray-700 hidden sm:block">John Doe</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-4xl mx-auto w-full">
        {loading && !paper && (
          <div className="space-y-4">
            <div className="skeleton h-24 rounded-2xl"/>
            <div className="skeleton h-96 rounded-2xl"/>
          </div>
        )}
        {isPending  && <GeneratingView progress={progress} message={progressMsg}/>}
        {isFailed   && <FailedView error={current?.errorMessage} onRetry={handleRegen}/>}
        {paper      && <PaperOutput paper={paper} onDownload={handlePDF} onRegenerate={handleRegen}/>}
      </main>
    </div>
  );
}

/* ── Generating ─────────────────────────────────────────────────────────── */
function GeneratingView({ progress, message }: { progress: number; message: string }) {
  const steps = [
    { label: 'Received',       pct: 10  },
    { label: 'Building prompt',pct: 35  },
    { label: 'AI generating',  pct: 60  },
    { label: 'Formatting',     pct: 85  },
    { label: 'Done',           pct: 100 },
  ];
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-10 text-center animate-in">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
        <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full spinning"/>
      </div>
      <h2 className="text-[16px] font-semibold text-gray-900 mb-1">Generating Your Paper</h2>
      <p className="text-[12px] text-gray-500 mb-7">{message || 'AI is crafting your question paper — usually 15–40 seconds.'}</p>
      <div className="max-w-sm mx-auto mb-5">
        <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
          <span>Progress</span>
          <span className="font-mono text-brand">{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand rounded-full transition-all duration-700" style={{ width: `${Math.max(progress, 4)}%` }}/>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1 flex-wrap">
        {steps.map((s, i) => (
          <span key={i} className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full border transition-all ${progress >= s.pct ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
            {progress >= s.pct && '✓ '}{s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Failed ──────────────────────────────────────────────────────────────── */
function FailedView({ error, onRetry }: { error?: string; onRetry: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center animate-in">
      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3"/>
      <h3 className="font-semibold text-gray-900 mb-1">Generation Failed</h3>
      <p className="text-[12px] text-gray-500 mb-4">{error || 'Something went wrong during generation.'}</p>
      <button onClick={onRetry}
        className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2 rounded-full text-[13px] hover:bg-gray-800 transition-colors">
        <RefreshCw size={13}/> Try Again
      </button>
    </div>
  );
}

/* ── Paper Output ────────────────────────────────────────────────────────── */
function PaperOutput({ paper, onDownload, onRegenerate }: { paper: GeneratedPaper; onDownload: () => void; onRegenerate: () => void }) {
  let qNum = 1;
  return (
    <div className="space-y-4 animate-in">
      {/* AI intro / action bar */}
      <div className="bg-gray-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3">
        <p className="text-[13px] leading-relaxed flex-1">
          Certainly! Here is a customized Question Paper for your <strong>{paper.subject}</strong> class{paper.className !== 'General' ? ` (${paper.className})` : ''}:
        </p>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button onClick={onRegenerate}
            className="flex items-center gap-1.5 border border-white/20 text-white text-[12px] px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <RefreshCw size={12}/> Regenerate
          </button>
          <button onClick={onDownload}
            className="flex items-center gap-1.5 bg-white text-gray-900 text-[12px] font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <Download size={12}/> Download as PDF
          </button>
        </div>
      </div>

      {/* Exam paper card */}
      <div className="bg-white rounded-2xl border border-gray-100 px-4 sm:px-8 lg:px-10 py-6 sm:py-8 shadow-sm">
        {/* School header */}
        <div className="text-center mb-2">
          <h1 className="text-[15px] sm:text-[17px] font-bold text-gray-900">{paper.schoolName}</h1>
          <p className="text-[12px] sm:text-[13px] text-gray-700 mt-0.5">Subject: {paper.subject}</p>
          <p className="text-[12px] sm:text-[13px] text-gray-700">Class: {paper.className}</p>
        </div>
        <div className="border-t border-gray-300 my-3"/>
        <div className="flex flex-col xs:flex-row xs:justify-between text-[12px] text-gray-700 mb-2 gap-1">
          <span>Time Allowed: {paper.timeAllowed}</span>
          <span>Maximum Marks: {paper.totalMarks}</span>
        </div>
        <p className="text-[12px] italic text-gray-700 mb-3">All questions are compulsory unless stated otherwise.</p>

        {/* Student info */}
        <div className="mb-5 space-y-1.5">
          {[
            { l: 'Name', w: 'w-32 sm:w-48' },
            { l: 'Roll Number', w: 'w-24 sm:w-36' },
          ].map(({ l, w }) => (
            <p key={l} className="text-[12px] text-gray-700 flex items-end gap-2">
              {l}: <span className={`border-b border-gray-400 ${w} inline-block`}/>
            </p>
          ))}
          <p className="text-[12px] text-gray-700 flex items-end gap-4 flex-wrap">
            <span className="flex items-end gap-2">Class: <span className="border-b border-gray-400 w-12 inline-block"/></span>
            <span className="flex items-end gap-2">Section: <span className="border-b border-gray-400 w-14 inline-block"/></span>
          </p>
        </div>

        {/* Sections */}
        {paper.sections.map((section, si) => {
          const sectionStart = qNum;
          return (
            <div key={section.id} className="mb-6 sm:mb-8">
              <h2 className="text-[14px] font-bold text-center text-gray-900">{section.title}</h2>
              <p className="text-[11px] italic text-center text-gray-500 mb-1">{section.questionType}</p>
              <p className="text-[11px] italic text-center text-gray-400 mb-3">{section.instruction}</p>
              <div className="space-y-2.5">
                {section.questions.map((q) => {
                  const n   = qNum++;
                  const tag = q.difficulty === 'easy' ? 'Easy' : q.difficulty === 'hard' ? 'Challenging' : 'Moderate';
                  const tagCls = q.difficulty === 'easy'
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : q.difficulty === 'hard'
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200';
                  return (
                    <div key={q.id} className="flex gap-2.5 text-[12px] sm:text-[13px] text-gray-800 leading-relaxed">
                      <span className="shrink-0 font-medium text-gray-600 w-6">{n}.</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start gap-1.5 mb-0.5">
                          <span className={`inline-flex shrink-0 items-center text-[10px] font-medium px-1.5 py-0.5 rounded border ${tagCls}`}>{tag}</span>
                          <span className="leading-relaxed">{q.text}</span>
                        </div>
                        <span className="text-[11px] text-gray-400">[{q.marks} Mark{q.marks !== 1 ? 's' : ''}]</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <p className="text-[12px] font-bold text-gray-900 mt-2 border-t border-gray-200 pt-4">End of Question Paper</p>

        {/* Answer Key */}
        {paper.answerKey?.length > 0 && (
          <>
            <div className="border-t border-gray-200 mt-8 mb-5"/>
            <h2 className="text-[14px] font-bold text-gray-900 mb-3">Answer Key:</h2>
            <ol className="space-y-2 list-decimal list-outside pl-5">
              {paper.answerKey.map((ak) => (
                <li key={ak.questionNumber} className="text-[12px] sm:text-[13px] text-gray-700 leading-relaxed">
                  {ak.answer}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
