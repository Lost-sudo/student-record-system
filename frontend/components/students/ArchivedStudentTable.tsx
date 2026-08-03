'use client';

import { ArchivedStudent } from '@/lib/types';

interface ArchivedStudentTableProps {
  students: ArchivedStudent[];
  selectedIds: Set<string>;
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  currentPage: number;
  totalPages: number;
  start: number;
  end: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function ArchivedStudentTable({
  students,
  selectedIds,
  onSelect,
  onSelectAll,
  currentPage,
  totalPages,
  start,
  end,
  total,
  onPageChange,
}: ArchivedStudentTableProps) {
  const getReasonBadge = (reason: ArchivedStudent['reason']) => {
    const badges = {
      graduated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      transferred: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      withdrawn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      deleted: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return badges[reason] || badges.withdrawn;
  };

  const isAllSelected = students.length > 0 && students.every((s) => selectedIds.has(s.id));

  return (
    <section className="glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="checkbox-custom w-4 h-4 rounded border-slate-600 bg-slate-800 focus:ring-2 focus:ring-indigo-400"
                />
              </th>
              <th className="px-6 py-3 text-left font-semibold">Student</th>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Program</th>
              <th className="px-6 py-3 text-left font-semibold">Archive Reason</th>
              <th className="px-6 py-3 text-left font-semibold">Archived Date</th>
              <th className="px-6 py-3 text-left font-semibold">Archived By</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {students.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <div className="text-slate-400">No archived students found</div>
                    <div className="text-xs text-slate-500">Try adjusting your filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(student.id)}
                      onChange={(e) => onSelect(student.id, e.target.checked)}
                      className="checkbox-custom w-4 h-4 rounded border-slate-600 bg-slate-800 focus:ring-2 focus:ring-indigo-400"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-sm font-bold shrink-0 opacity-60">
                        {student.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-300">{student.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{student.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{student.email}</td>
                  <td className="px-6 py-4 text-slate-400">{student.program}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg border ${getReasonBadge(student.reason)}`}>
                      {student.reason.charAt(0).toUpperCase() + student.reason.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(student.archivedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{student.archivedBy}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" aria-label="View student">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-colors" aria-label="Restore student">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors" aria-label="Permanently delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Showing <span className="text-slate-200 font-semibold">{total > 0 ? start + 1 : 0}</span> to{' '}
          <span className="text-slate-200 font-semibold">{end}</span> of{' '}
          <span className="text-slate-200 font-semibold">{total.toLocaleString()}</span> archived students
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  page === currentPage
                    ? 'bg-indigo-500 text-white'
                    : 'border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}