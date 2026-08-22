'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast as sonnerToast } from 'sonner';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import {
  CourseSectionDto,
  CourseSectionMutationError,
  useCreateCourseSection,
  useUpdateCourseSection,
} from '@/api/courseSections';
import { useCourses } from '@/api/courses';
import { useAcademicTerms } from '@/api/academicTerms';

const sectionFormSchema = (minimumCapacity: number | null) =>
  z
    .object({
      courseId: z.string().min(1, 'Please select a course'),
      termId: z.string().min(1, 'Please select an academic term'),
      sectionNumber: z
        .string()
        .trim()
        .toUpperCase()
        .min(1, 'Section number is required')
        .max(10, 'Section number cannot exceed 10 characters')
        .regex(/^[A-Z0-9]+$/, 'Section number may only contain letters and numbers'),
      capacity: z
        .number({ message: 'Capacity is required' })
        .int('Capacity must be a whole number')
        .min(1, 'Capacity must be at least 1')
        .max(1000, 'Capacity cannot exceed 1000'),
    })
    .superRefine((data, ctx) => {
      if (minimumCapacity !== null && data.capacity < minimumCapacity) {
        ctx.addIssue({
          code: 'custom',
          path: ['capacity'],
          message: `Capacity cannot be lower than the current enrolled count (${minimumCapacity})`,
        });
      }
    });

type SectionFormData = {
  courseId: string;
  termId: string;
  sectionNumber: string;
  capacity: number;
};

interface SectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  section?: CourseSectionDto | null;
}

export default function SectionFormModal({ isOpen, onClose, section }: SectionFormModalProps) {
  const createSection = useCreateCourseSection();
  const updateSection = useUpdateCourseSection();
  const isSubmitting = createSection.isPending || updateSection.isPending;
  const isEditing = !!section;

  const coursesQuery = useCourses({ limit: 100 });
  const termsQuery = useAcademicTerms({ limit: 100 });

  const sortedCourses = useMemo(
    () =>
      [...(coursesQuery.data?.data ?? [])].sort((a, b) =>
        a.courseCode.localeCompare(b.courseCode),
      ),
    [coursesQuery.data],
  );

  const sortedTerms = useMemo(
    () =>
      [...(termsQuery.data?.data ?? [])].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      ),
    [termsQuery.data],
  );

  const coursesById = useMemo(() => {
    const map = new Map<string, string>();
    sortedCourses.forEach((course) => map.set(course.id, `${course.courseCode} — ${course.title}`));
    return map;
  }, [sortedCourses]);

  const termsById = useMemo(() => {
    const map = new Map<string, string>();
    sortedTerms.forEach((term) => map.set(term.id, `${term.termCode} — ${term.name}`));
    return map;
  }, [sortedTerms]);

  const minimumCapacity = isEditing && section ? section.enrolledCount : null;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<SectionFormData>({
    resolver: zodResolver(sectionFormSchema(minimumCapacity)),
    mode: 'onChange',
    defaultValues: {
      courseId: '',
      termId: '',
      sectionNumber: '',
      capacity: 30,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (section) {
      reset({
        courseId: section.courseId,
        termId: section.termId,
        sectionNumber: section.sectionNumber,
        capacity: section.capacity,
      });
    } else {
      reset({
        courseId: '',
        termId: '',
        sectionNumber: '',
        capacity: 30,
      });
    }
  }, [isOpen, section, reset]);

  const applyServerErrors = (error: CourseSectionMutationError) => {
    error.fieldErrors.forEach(({ field, message }) => {
      setError(field as Path<SectionFormData>, {
        type: 'server',
        message,
      });
    });
  };

  const onSubmit = (values: SectionFormData) => {
    const onError = (error: unknown) => {
      if (error instanceof CourseSectionMutationError) {
        applyServerErrors(error);
        sonnerToast.error(isEditing ? 'Unable to update section' : 'Unable to create section', {
          description: error.message,
        });
      } else {
        sonnerToast.error('Something went wrong', {
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    };

    const describe = () => {
      const courseLabel = coursesById.get(values.courseId) ?? values.courseId;
      return `${courseLabel} · Section ${values.sectionNumber}`;
    };

    if (isEditing && section) {
      updateSection.mutate(
        {
          id: section.id,
          payload: { sectionNumber: values.sectionNumber, capacity: values.capacity },
        },
        {
          onSuccess: () => {
            sonnerToast.success('Course section updated successfully', {
              description: describe(),
            });
            onClose();
          },
          onError,
        },
      );
    } else {
      createSection.mutate(values, {
        onSuccess: () => {
          sonnerToast.success('Course section created successfully', {
            description: describe(),
          });
          onClose();
        },
        onError,
      });
    }
  };

  if (!isOpen) return null;

  const selectedCourseLabel =
    (isEditing && section && (coursesById.get(section.courseId) ?? section.courseId)) ||
    undefined;
  const selectedTermLabel =
    (isEditing && section && (termsById.get(section.termId) ?? section.termId)) || undefined;

  const selectClass = (hasError?: string) =>
    `w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-slate-700 transition duration-200 ${
      hasError ? 'border-red-400 focus:ring-red-500' : 'border-slate-600 focus:ring-indigo-400'
    }`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="modal-backdrop absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      <div className="modal-panel relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl shadow-indigo-900/40 overflow-hidden z-10">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-700/50 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/50 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isEditing ? 'Edit Course Section' : 'Add Course Section'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing
                  ? `Section ${section?.sectionNumber}`
                  : 'Schedule a course offering within a term'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-slate-300 mb-1.5">Course</span>
                  <div className="px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-400 truncate">
                    {selectedCourseLabel ?? '—'}
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-medium text-slate-300 mb-1.5">Academic Term</span>
                  <div className="px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-400 truncate">
                    {selectedTermLabel ?? '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sectionCourse" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Course *
                  </label>
                  <select
                    id="sectionCourse"
                    {...register('courseId')}
                    className={selectClass(errors.courseId?.message)}
                  >
                    <option value="">Select a course...</option>
                    {sortedCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.courseCode} — {course.title}
                      </option>
                    ))}
                  </select>
                  {errors.courseId?.message && (
                    <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                      {errors.courseId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="sectionTerm" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Academic Term *
                  </label>
                  <select
                    id="sectionTerm"
                    {...register('termId')}
                    className={selectClass(errors.termId?.message)}
                  >
                    <option value="">Select an academic term...</option>
                    {sortedTerms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.termCode} — {term.name}
                      </option>
                    ))}
                  </select>
                  {errors.termId?.message && (
                    <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                      {errors.termId.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="sectionNumber"
                label="Section Number *"
                type="text"
                placeholder="e.g. A"
                hint="Letters and numbers only. Auto-uppercased."
                error={errors.sectionNumber?.message}
                registration={register('sectionNumber')}
              />
              <InputField
                id="sectionCapacity"
                label={`Capacity *${isEditing && section ? ` (currently enrolled: ${section.enrolledCount})` : ''}`}
                type="number"
                placeholder="e.g. 40"
                error={errors.capacity?.message}
                registration={register('capacity', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/90 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-600 hover:border-slate-500 hover:bg-slate-800 text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <Button type="submit" size="sm" fullWidth={false} isLoading={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Create Section'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
