'use client';

import Link from "next/link";
import { monthOverMonthChange, useStudentStats } from "@/api/students";

const formatCount = (value: number | undefined): string =>
  value === undefined ? "—" : value.toLocaleString();

export default function KPICards() {
  const statsQuery = useStudentStats();
  const stats = statsQuery.data;

  const momChange = stats
    ? monthOverMonthChange(stats.newStudentsThisMonth, stats.newStudentsLastMonth)
    : null;
  const weeklyTrend = stats?.newStudentsThisWeek;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5 mb-8">
      {/* Card 1 - Total Active Students */}
      <div className="glass rounded-3xl p-5 border border-slate-700/50 shadow-2xl shadow-indigo-900/20 hover:border-indigo-500/30 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          {weeklyTrend !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +{weeklyTrend}
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-white">{formatCount(stats?.totalActiveStudents)}</div>
        <div className="text-sm text-slate-400 mt-1">Total Active Students</div>
        <div className="text-xs text-slate-500 mt-2">
          Trend: {weeklyTrend !== undefined ? `+${weeklyTrend} this week` : "—"}
        </div>
      </div>

      {/* Card 2 - New Students (This Month) */}
      <div className="glass rounded-3xl p-5 border border-slate-700/50 shadow-2xl shadow-indigo-900/20 hover:border-cyan-500/30 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          {momChange !== null && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                momChange >= 0
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  : "text-red-400 bg-red-500/10 border border-red-500/20"
              }`}
            >
              {momChange >= 0 ? "+" : ""}
              {momChange}%
            </span>
          )}
        </div>
        <div className="text-3xl font-bold text-white">{formatCount(stats?.newStudentsThisMonth)}</div>
        <div className="text-sm text-slate-400 mt-1">New Students (This Month)</div>
        <div className="text-xs text-slate-500 mt-2">
          Trend:{" "}
          {momChange !== null
            ? `${momChange >= 0 ? "+" : ""}${momChange}% vs last month`
            : "No data from last month"}
        </div>
      </div>

      {/* Card 3 - Archived Students */}
      <div className="glass rounded-3xl p-5 border border-slate-700/50 shadow-2xl shadow-indigo-900/20 hover:border-amber-500/30 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-1 rounded-full">Archive</span>
        </div>
        <div className="text-3xl font-bold text-white">{formatCount(stats?.totalArchivedStudents)}</div>
        <div className="text-sm text-slate-400 mt-1">Archived Students</div>
        <Link href="/students/archived" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium mt-2 inline-flex items-center gap-1">View Archive →</Link>
      </div>

      {/* Card 4 */}
      <div className="glass rounded-3xl p-5 border border-slate-700/50 shadow-2xl shadow-indigo-900/20 hover:border-red-500/30 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full pulse-soft">Action</span>
        </div>
        <div className="text-3xl font-bold text-white">18</div>
        <div className="text-sm text-slate-400 mt-1">Incomplete Records</div>
        <a href="#alerts" className="text-xs text-red-400 hover:text-red-300 font-medium mt-2 inline-flex items-center gap-1">Action Required →</a>
      </div>
    </section>
  );
}
