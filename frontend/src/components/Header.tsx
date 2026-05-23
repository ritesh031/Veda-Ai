'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutGrid, Bell, ChevronDown } from 'lucide-react';

interface Props { title?: string; showBack?: boolean; backHref?: string; }

export default function Header({ title = 'Assignment', showBack = false, backHref }: Props) {
  const router = useRouter();
  const goBack = () => backHref ? router.push(backHref) : router.back();

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger spacer */}
        <div className="w-8 h-8 lg:hidden" />
        {showBack ? (
          <button onClick={goBack} className="text-gray-400 hover:text-gray-700 transition-colors p-1">
            <ArrowLeft size={17}/>
          </button>
        ) : (
          <LayoutGrid size={15} className="text-gray-400 hidden sm:block"/>
        )}
        <span className="text-[13px] text-gray-500 truncate max-w-[160px] sm:max-w-none">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative cursor-pointer">
          <Bell size={17} className="text-gray-500"/>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"/>
        </div>
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-gray-600">J</span>
          </div>
          <span className="text-[13px] font-medium text-gray-700 hidden sm:block">John Doe</span>
          <ChevronDown size={13} className="text-gray-400 hidden sm:block"/>
        </div>
      </div>
    </header>
  );
}
