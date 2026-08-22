'use client';

import { CurriculumVersionDto } from '@/api/curriculumVersions';

export interface ResolvedCurriculum {
  curriculum: CurriculumVersionDto;
  programLabel: string;
  termLabel: string;
}

interface CurriculumTableProps {
  curricula: ResolvedCurriculum[];
  currentPage: number;
  totalPages: number;
  start: number;
  end: number;
  total: number;
  onPageChange: (page: number) => void;
  onToggleActive?: (curriculum: CurriculumVersionDto) => void;
  onEdit?: (curriculum: CurriculumVersionDto) => void;
  onDelete?: (curriculum: CurriculumVersionDto) => void;
  onManageRequirements?: (curriculum: CurriculumVersionDto) => void;
  isLoading?: boolean;
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function CurriculumTable({
  curricula,
  currentPage,
  totalPages,
  start,
  end,
  total,
  onPageChange,
  onToggleActive,
  onEdit,
  onDelete,
  onManageRequirements,
  isLoading,
}: CurriculumTableProps) {
  return (
    <section className="glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Program</th>
              <th className="px-6 py-3 text-left font-semibold">Version</th>
              <th className="px-6 py-3 text-left font-semibold">Effective Term</th>
              <th className="px-6 py-3 text-left font-semibold">Total Credits</th>
              <th className="px-6 py-3 text-left font-semibold">Created</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-600 border-t-indigo-500 animate-spin"></div>
                    <div className="text-slate-400">Loading curriculum versions...</div>
                  </div>
                </td>
              </tr>
            ) : curricula.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-slate-400">No curriculum versions found</div>
                    <div className="text-xs text-slate-500">
                      Create an academic program and term first if the list is empty
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              curricula.map(({ curriculum, programLabel, termLabel }) => (
                <tr key={curriculum.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 max-w-[240px]">
                    <span className="inline-block px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-300">
                      {programLabel.split(' — ')[0]}
                    </span>
                    <div className="text-sm text-slate-300 mt-1 truncate">{programLabel}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center justify-center min-w-[36px] px-2.5 py-1 text-xs font-bold rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                      v{curriculum.versionNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{termLabel}</td>
                  <td className="px-6 py-4 text-slate-300">{curriculum.totalCredits.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-400">{formatDate(curriculum.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                        curriculum.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {curriculum.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onToggleActive?.(curriculum)}
                        disabled={isLoading}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          curriculum.isActive
                            ? 'hover:bg-amber-500/10 text-slate-400 hover:text-amber-400'
                            : 'hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400'
                        }`}
                        aria-label={curriculum.isActive ? 'Deactivate curriculum' : 'Activate curriculum'}
                        title={curriculum.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              curriculum.isActive
                                ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                                : 'M13 10V3L4 14h7v7l9-11h-7z'
                            }
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onManageRequirements?.(curriculum)}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Manage requirements"
                        title="Manage requirements"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEdit?.(curriculum)}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Edit curriculum"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete?.(curriculum)}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete curriculum"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
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

      <div className="px-6 py-4 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Showing <span className="text-slate-200 font-semibold">{total > 0 ? start + 1 : 0}</span> to{' '}
          <span className="text-slate-200 font-semibold">{end}</span> of{' '}
          <span className="text-slate-200 font-semibold">{total.toLocaleString()}</span> curriculum versions
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
