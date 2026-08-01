'use client';

import { useState, useRef, useEffect } from 'react';
import { notifications } from '@/lib/data';

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('globalSearch')?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/70 backdrop-blur-xl border-b border-slate-700/50">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors">Home</a>
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-200 font-medium">Dashboard</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="globalSearch"
              type="text"
              placeholder="Search students by ID, name, or email..."
              className="w-72 lg:w-80 py-2 pl-10 pr-4 bg-slate-800 border border-slate-600 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
            />
            <kbd className="hidden lg:inline absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-600">
              ⌘K
            </kbd>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 min-w-[5 h-5 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-slate-900">
                15
              </span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass rounded-2xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">Notifications</div>
                  <span className="text-xs text-slate-400">15 alerts</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-700/50">
                  {notifications.map((notif, idx) => (
                    <a key={idx} href="#" className="flex gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors">
                      <span className="text-lg">{notif.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm text-slate-200">{notif.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{notif.description} • {notif.timestamp}</div>
                      </div>
                    </a>
                  ))}
                </div>
                <a href="#" className="block px-4 py-3 text-center text-sm text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/50 transition-colors border-t border-slate-700/50">
                  View all alerts →
                </a>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1 pr-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                AR
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-tight">Alex Rivera</div>
                <div className="text-[10px] text-slate-400 leading-tight">Registrar</div>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 glass rounded-2xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 overflow-hidden">
                <div className="px-4 py-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      AR
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Alex Rivera</div>
                      <div className="text-xs text-slate-400">alex.rivera@srs.edu</div>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        REGISTRAR
                      </span>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <a href="#" className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </a>
                  <a href="#" className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </a>
                </div>
                <div className="border-t border-slate-700/50 py-1">
                  <a href="#" className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}