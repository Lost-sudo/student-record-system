'use client';

import { useMemo, useState } from 'react';
import { toast as sonnerToast } from 'sonner';
import {
  CourseDto,
  CourseMutationError,
  useCourses,
  useCoursePrerequisites,
  useCreateCoursePrerequisite,
  useDeleteCoursePrerequisite,
} from '@/api/courses';

interface ManagePrerequisitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseDto;
}

export default function ManagePrerequisitesModal({
  isOpen,
  onClose,
  course,
}: ManagePrerequisitesModalProps) {
  const [selectedPrerequisiteId, setSelectedPrerequisiteId] = useState('');
  const coursesQuery = useCourses({ limit: 100 });
  const prerequisitesQuery = useCoursePrerequisites();
  const createPrerequisite = useCreateCoursePrerequisite();
  const deletePrerequisite = useDeleteCoursePrerequisite();

  const coursesById = useMemo(() => {
    const map = new Map<string, CourseDto>();
    (coursesQuery.data?.data ?? []).forEach((item) => map.set(item.id, item));
    return map;
  }, [coursesQuery.data]);

  const coursePrerequisites = useMemo(() => {
    return (prerequisitesQuery.data?.data ?? []).filter((row) => row.courseId === course.id);
  }, [prerequisitesQuery.data, course.id]);

  const existingIds = useMemo(
    () => new Set(coursePrerequisites.map((row) => row.prerequisiteId)),
    [coursePrerequisites],
  );

  const candidates = useMemo(() => {
    return (coursesQuery.data?.data ?? [])
      .filter((item) => item.id !== course.id && !existingIds.has(item.id))
      .sort((a, b) => a.courseCode.localeCompare(b.courseCode));
  }, [coursesQuery.data, course.id, existingIds]);

  if (!isOpen) return null;

  const isMutating = createPrerequisite.isPending || deletePrerequisite.isPending;

  const handleAdd = () => {
    if (!selectedPrerequisiteId) return;
    const target = coursesById.get(selectedPrerequisiteId);
    createPrerequisite.mutate(
      { courseId: course.id, prerequisiteId: selectedPrerequisiteId },
      {
        onSuccess: () => {
          sonnerToast.success('Prerequisite added', {
            description: `${target ? `${target.courseCode} — ${target.title}` : 'Course'} now requires ${course.courseCode}`,
          });
          setSelectedPrerequisiteId('');
        },
        onError: (error) => {
          sonnerToast.error('Unable to add prerequisite', {
            description:
              error instanceof CourseMutationError
                ? error.message
                : 'An unexpected error occurred. Please try again.',
          });
        },
      },
    );
  };

  const handleRemove = (relationId: string) => {
    deletePrerequisite.mutate(relationId, {
      onSuccess: () =>
        sonnerToast.success('Prerequisite removed', {
          description: `${course.courseCode} — ${course.title}`,
        }),
      onError: (error) => {
        sonnerToast.error('Unable to remove prerequisite', {
          description:
            error instanceof CourseMutationError
              ? error.message
              : 'An unexpected error occurred. Please try again.',
        });
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="modal-backdrop absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      <div className="modal-panel relative w-full max-w-xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl shadow-indigo-900/40 overflow-hidden z-10">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-700/50 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/50 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Manage Prerequisites</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {course.courseCode} — {course.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isMutating}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedPrerequisiteId}
              onChange={(e) => setSelectedPrerequisiteId(e.target.value)}
              disabled={isMutating}
              className="flex-1 py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Select a prerequisite course"
            >
              <option value="">Select a required course...</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.courseCode} — {candidate.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selectedPrerequisiteId || isMutating}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {createPrerequisite.isPending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              )}
              Add
            </button>
          </div>

          {prerequisitesQuery.isLoading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-slate-600 border-t-indigo-500 animate-spin"></div>
              <div className="text-sm text-slate-400">Loading prerequisites...</div>
            </div>
          ) : coursePrerequisites.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-slate-400">No prerequisites configured</div>
              <div className="text-xs text-slate-500">
                Students can enroll in {course.courseCode} directly
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {coursePrerequisites.map((row) => {
                const prerequisite = coursesById.get(row.prerequisiteId);
                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {prerequisite ? (
                          <>
                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                              {prerequisite.courseCode}
                            </span>
                            <span className="text-sm font-medium text-white truncate">
                              {prerequisite.title}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-slate-500 font-mono">{row.prerequisiteId}</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(row.id)}
                      disabled={isMutating}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      aria-label="Remove prerequisite"
                    >
                      {deletePrerequisite.isPending && deletePrerequisite.variables === row.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/90 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isMutating}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-600 hover:border-slate-500 hover:bg-slate-800 text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
