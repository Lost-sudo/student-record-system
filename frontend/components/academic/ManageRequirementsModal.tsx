'use client';

import { useMemo, useState } from 'react';
import { toast as sonnerToast } from 'sonner';
import {
  DegreeRequirementDto,
  DegreeRequirementMutationError,
  REQUIREMENT_TYPES,
  RequirementType,
  useCreateDegreeRequirement,
  useDeleteDegreeRequirement,
  useDegreeRequirements,
  useUpdateDegreeRequirement,
} from '@/api/degreeRequirements';
import { CourseDto, useCourses } from '@/api/courses';

const TYPE_BADGES: Record<RequirementType, string> = {
  CORE: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
  ELECTIVE: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  GENERAL_EDUCATION: 'border-sky-500/20 bg-sky-500/10 text-sky-400',
  MAJOR: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
};

const TYPE_LABELS: Record<RequirementType, string> = {
  CORE: 'Core',
  ELECTIVE: 'Elective',
  GENERAL_EDUCATION: 'Gen. Ed.',
  MAJOR: 'Major',
};

interface DraftState {
  requirementType: RequirementType;
  minCredits: string;
  courseId: string;
}

interface ManageRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculumId: string;
  versionNumber: number;
  totalCredits: number;
  programLabel: string;
}

export default function ManageRequirementsModal({
  isOpen,
  onClose,
  curriculumId,
  versionNumber,
  totalCredits,
  programLabel,
}: ManageRequirementsModalProps) {
  const [addDraft, setAddDraft] = useState<DraftState>({
    requirementType: 'CORE',
    minCredits: '3',
    courseId: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftState>({
    requirementType: 'CORE',
    minCredits: '0',
    courseId: '',
  });

  const requirementsQuery = useDegreeRequirements({ curriculumId, limit: 100 });
  const coursesQuery = useCourses({ limit: 100 });
  const createRequirement = useCreateDegreeRequirement();
  const updateRequirement = useUpdateDegreeRequirement();
  const deleteRequirement = useDeleteDegreeRequirement();

  const requirements = useMemo(() => requirementsQuery.data?.data ?? [], [requirementsQuery.data]);

  const sortedCourses = useMemo(
    () =>
      [...(coursesQuery.data?.data ?? [])].sort((a, b) =>
        a.courseCode.localeCompare(b.courseCode),
      ),
    [coursesQuery.data],
  );

  const coursesById = useMemo(() => {
    const map = new Map<string, CourseDto>();
    sortedCourses.forEach((course) => map.set(course.id, course));
    return map;
  }, [sortedCourses]);

  const pinnedCourseIds = useMemo(
    () => new Set(requirements.filter((row) => row.courseId).map((row) => row.courseId as string)),
    [requirements],
  );

  const totalAssignedCredits = useMemo(
    () => requirements.reduce((sum, row) => sum + row.minCredits, 0),
    [requirements],
  );

  if (!isOpen) return null;

  const isMutating =
    createRequirement.isPending || updateRequirement.isPending || deleteRequirement.isPending;

  const describeRequirement = (draft: DraftState): string => {
    const course = draft.courseId ? coursesById.get(draft.courseId) : undefined;
    return course
      ? `${TYPE_LABELS[draft.requirementType]} · ${course.courseCode}`
      : `${TYPE_LABELS[draft.requirementType]} bucket`;
  };

  const parseMinCredits = (value: string): number | null => {
    if (!Number.isInteger(Number(value)) || Number(value) < 0) return null;
    return Number(value);
  };

  const startEditing = (row: DegreeRequirementDto) => {
    setEditingId(row.id);
    setEditDraft({
      requirementType: row.requirementType,
      minCredits: String(row.minCredits),
      courseId: row.courseId ?? '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDraft({ requirementType: 'CORE', minCredits: '0', courseId: '' });
  };

  const onErrorToast = (error: unknown, title: string) => {
    sonnerToast.error(title, {
      description:
        error instanceof DegreeRequirementMutationError
          ? error.message
          : 'An unexpected error occurred. Please try again.',
    });
  };

  const handleAdd = () => {
    const minCredits = parseMinCredits(addDraft.minCredits);
    if (minCredits === null) {
      sonnerToast.error('Invalid minimum credits', {
        description: 'Minimum credits must be a whole number of 0 or more.',
      });
      return;
    }

    createRequirement.mutate(
      {
        curriculumId,
        requirementType: addDraft.requirementType,
        minCredits,
        courseId: addDraft.courseId || null,
      },
      {
        onSuccess: () => {
          sonnerToast.success('Requirement added', {
            description: describeRequirement(addDraft),
          });
          setAddDraft({
            requirementType: 'CORE',
            minCredits: '3',
            courseId: '',
          });
        },
        onError: (error) => onErrorToast(error, 'Unable to add requirement'),
      },
    );
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const minCredits = parseMinCredits(editDraft.minCredits);
    if (minCredits === null) {
      sonnerToast.error('Invalid minimum credits', {
        description: 'Minimum credits must be a whole number of 0 or more.',
      });
      return;
    }

    updateRequirement.mutate(
      {
        id: editingId,
        payload: {
          requirementType: editDraft.requirementType,
          minCredits,
          courseId: editDraft.courseId || null,
        },
      },
      {
        onSuccess: () => {
          sonnerToast.success('Requirement updated', {
            description: describeRequirement(editDraft),
          });
          cancelEditing();
        },
        onError: (error) => onErrorToast(error, 'Unable to update requirement'),
      },
    );
  };

  const handleRemove = (row: DegreeRequirementDto) => {
    const course = row.courseId ? coursesById.get(row.courseId) : undefined;
    deleteRequirement.mutate(row.id, {
      onSuccess: () =>
        sonnerToast.success('Requirement removed', {
          description: course ? course.courseCode : TYPE_LABELS[row.requirementType],
        }),
      onError: (error) => onErrorToast(error, 'Unable to remove requirement'),
    });
  };

  const renderSelects = (
    draft: DraftState,
    setDraft: (next: DraftState) => void,
    excludeCourseIds?: Set<string>,
  ) => (
    <>
      <select
        value={draft.requirementType}
        onChange={(e) => setDraft({ ...draft, requirementType: e.target.value as RequirementType })}
        disabled={isMutating}
        className="py-2 px-3 bg-slate-800 border border-slate-600 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Requirement type"
      >
        {REQUIREMENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {TYPE_LABELS[type]}
          </option>
        ))}
      </select>
      <input
        type="number"
        min={0}
        step={1}
        value={draft.minCredits}
        onChange={(e) => setDraft({ ...draft, minCredits: e.target.value })}
        disabled={isMutating}
        className="w-20 py-2 px-3 bg-slate-800 border border-slate-600 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Minimum credits"
        placeholder="0"
      />
      <select
        value={draft.courseId}
        onChange={(e) => setDraft({ ...draft, courseId: e.target.value })}
        disabled={isMutating}
        className="flex-1 min-w-[180px] py-2 px-3 bg-slate-800 border border-slate-600 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Pinned course"
      >
        <option value="">Credit bucket (no specific course)</option>
        {sortedCourses.map((course) => {
          const takenByOther = excludeCourseIds?.has(course.id);
          return (
            <option key={course.id} value={course.id} disabled={takenByOther}>
              {course.courseCode} — {course.title}
              {takenByOther ? ' (already required)' : ''}
            </option>
          );
        })}
      </select>
    </>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="modal-backdrop absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      <div className="modal-panel relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl shadow-indigo-900/40 overflow-hidden z-10">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-700/50 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-900/50 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Manage Requirements</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {programLabel} · v{versionNumber} · {totalAssignedCredits} of {totalCredits.toLocaleString()} credits assigned
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
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
            {renderSelects(addDraft, setAddDraft)}
            <button
              type="button"
              onClick={handleAdd}
              disabled={isMutating}
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {createRequirement.isPending ? (
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

          {requirementsQuery.isLoading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-slate-600 border-t-indigo-500 animate-spin"></div>
              <div className="text-sm text-slate-400">Loading requirements...</div>
            </div>
          ) : requirements.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-slate-400">No requirements configured</div>
              <div className="text-xs text-slate-500">
                Add credit buckets or pin specific courses above
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {requirements.map((row) => {
                const course = row.courseId ? coursesById.get(row.courseId) : undefined;
                const isEditingRow = editingId === row.id;

                if (isEditingRow) {
                  return (
                    <li
                      key={row.id}
                      className="flex flex-col lg:flex-row lg:items-center gap-3 px-4 py-3 bg-slate-800 border border-indigo-500/30 rounded-xl"
                    >
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        {renderSelects(editDraft, setEditDraft, pinnedCourseIds)}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          disabled={isMutating}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={isMutating}
                          className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-slate-600 hover:border-slate-500 hover:bg-slate-800 text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={row.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl"
                  >
                    <div className="min-w-0 flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg border ${TYPE_BADGES[row.requirementType]}`}
                      >
                        {TYPE_LABELS[row.requirementType]}
                      </span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        min {row.minCredits} {row.minCredits === 1 ? 'credit' : 'credits'}
                      </span>
                      {course ? (
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
                          {course.courseCode}
                        </span>
                      ) : (
                        <span className="text-xs italic text-slate-500">credit bucket</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditing(row)}
                        disabled={isMutating}
                        className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Edit requirement"
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
                        type="button"
                        onClick={() => handleRemove(row)}
                        disabled={isMutating}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Remove requirement"
                      >
                        {deleteRequirement.isPending && deleteRequirement.variables === row.id ? (
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
                    </div>
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
