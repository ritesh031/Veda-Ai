'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, Users, FileText, Wrench, BookOpen,
  Settings, Menu, X, Plus
} from 'lucide-react';
import clsx from 'clsx';

const nav = [
  { label: 'Home',               icon: LayoutGrid, href: '/'           },
  { label: 'My Groups',          icon: Users,       href: '/groups'     },
  { label: 'Assignments',        icon: FileText,    href: '/assignments'},
  { label: "AI Teacher's Toolkit", icon: Wrench,   href: '/toolkit'    },
  { label: 'My Library',         icon: BookOpen,    href: '/library'    },
];

export default function Sidebar() {
  const path    = usePathname();
  const [open, setOpen] = useState(false);

  // close on route change
  useEffect(() => { setOpen(false); }, [path]);
  // prevent body scroll when open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo row */}
      <div className="px-5 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 14L9 4L15 14H3Z" fill="white"/>
            </svg>
          </div>
          <span className="font-bold text-[17px] text-gray-900 tracking-tight">VedaAI</span>
        </div>
        <button className="lg:hidden text-gray-400 hover:text-gray-700 p-1"
          onClick={() => setOpen(false)}>
          <X size={18}/>
        </button>
      </div>

      {/* Create button */}
      <div className="px-4 mb-5">
        <Link href="/create"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-semibold transition-colors">
          <Plus size={14}/> Create Assignment
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {nav.map(({ label, icon: Icon, href }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <Link key={label} href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium mb-0.5 transition-colors',
                active ? 'bg-orange-50 text-brand' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8}/>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3 mt-auto">
        <Link href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors mb-2">
          <Settings size={16} strokeWidth={1.8}/> Settings
        </Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <span className="text-brand text-xs font-bold">D</span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-gray-900 leading-tight truncate">Delhi Public School</p>
            <p className="text-[11px] text-gray-500 leading-tight truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow border border-gray-100"
        aria-label="Open menu">
        <Menu size={16} className="text-gray-600"/>
      </button>

      {/* Backdrop */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}/>
      )}

      {/* Sidebar panel */}
      <aside className={clsx(
        'fixed left-0 top-0 h-screen w-[210px] bg-white border-r border-gray-100 z-50 flex flex-col',
        'transition-transform duration-300 ease-in-out',
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent/>
      </aside>
    </>
  );
}
