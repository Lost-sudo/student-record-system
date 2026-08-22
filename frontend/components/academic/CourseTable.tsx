'use client';

import { CourseDto } from '@/api/courses';

interface CourseTableProps {
  courses: CourseDto[];
  prereqCounts: Map<string, number>;
  currentPage: number;
  totalPages: number;
  start: number;
  end: number;
  total: number;
  onPageChange: (page: number) => void;
  onManagePrerequisites?: (course: CourseDto) => void;
  onEdit?: (course: CourseDto) => void;
  onDelete?: (course: CourseDto) => void;
  isLoading?: boolean;
}

export default function CourseTable({
  courses,
  prereqCounts,
  currentPage,
  totalPages,
  start,
  end,
  total,
  onPageChange,
  onManagePrerequisites,
  onEdit,
  onDelete,
  isLoading,
}: CourseTableProps) {
  return (
    <section className="glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Course Code</th>
              <th className="px-6 py-3 text-left font-semibold">Title</th>
              <th className="px-6 py-3 text-left font-semibold">Credits</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Prerequisites</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-600 border-t-indigo-500 animate-spin"></div>
                    <div className="text-slate-400">Loading courses...</div>
                  </div>
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-slate-400">No courses found</div>
                    <div className="text-xs text-slate-500">Try adjusting your filters</div>
                  </div>
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                      {course.courseCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="font-semibold text-white truncate">{course.title}</div>
                    {course.description && (
                      <div className="text-xs text-slate-500 truncate">{course.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{course.defaultCredits}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                        course.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {course.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {prereqCounts.get(course.id) ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m6.364-6.364l-1.5 1.5a4 4 0 105.656 5.656"
                          />
                        </svg>
                        {prereqCounts.get(course.id)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onManagePrerequisites?.(course)}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Manage prerequisites"
                        title="Manage prerequisites"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m7.5-7.5l-1.5 1.5"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.172 13.828a4 4 0 000-5.656l-3-3a4 4 0 00-5.656 5.656l1.5 1.5m7.5 7.5l-1.5-1.5"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEdit?.(course)}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Edit course"
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
                        onClick={() => onDelete?.(course)}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Delete course"
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
          <span className="text-slate-200 font-semibold">{total.toLocaleString()}</span> courses
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
