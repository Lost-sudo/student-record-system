"use client";

import { useState } from "react";
import Link from "next/link";
import { NavItem } from "@/lib/types";
import { navItems, adminNavItems } from "@/lib/data";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

interface NavButtonProps {
  item: NavItem;
}

function NavButton({ item }: NavButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = item.href
    ? pathname === item.href || pathname.startsWith(item.href + '/')
    : item.submenu?.some(
        (sub) => pathname === sub.href || pathname.startsWith(sub.href + '/')
      );

  if (item.href && !item.submenu) {
    return (
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive
            ? "bg-indigo-500/10 border border-indigo-500/20 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive
            ? "bg-indigo-500/10 border border-indigo-500/20 text-white"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <span className="flex items-center gap-3">
          {item.icon}
          <span>{item.label}</span>
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-rotate ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      {item.submenu && (
        <div
          className={`submenu mt-1 ml-4 pl-4 border-l border-slate-700/50 space-y-1 ${isOpen || isActive ? "open" : ""}`}
        >
          {item.submenu.map((sub, idx) => {
            const isSubActive =
              pathname === sub.href || pathname.startsWith(sub.href + '/');

            return (
              <Link
                key={idx}
                href={sub.href}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isSubActive
                    ? "bg-slate-800/60 text-white font-medium"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 fixed inset-y-0 left-0 z-40 border-r border-slate-700/50 bg-slate-900/70 backdrop-blur-xl">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-700/50">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-900/50">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
          </svg>
        </div>
        <div>
          <div className="text-white font-bold tracking-tight">SRS Portal</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">
            Registrar System
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Main
        </div>

        {navItems.map((item, idx) => (
          <NavButton key={idx} item={item} />
        ))}

        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          System
        </div>

        {adminNavItems.map((item, idx) => (
          <NavButton key={idx} item={item} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700/50">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 text-sm font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
