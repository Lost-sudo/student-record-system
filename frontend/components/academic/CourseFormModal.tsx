'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast as sonnerToast } from 'sonner';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import {
  CourseDto,
  CourseMutationError,
  CoursePayload,
  useCreateCourse,
  useUpdateCourse,
} from '@/api/courses';

const courseFormSchema = z.object({
  courseCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Course code must be at least 2 characters')
    .max(20, 'Course code cannot exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Course code may only contain letters, numbers, and hyphens'),
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z.string().trim().max(3000, 'Description cannot exceed 3000 characters'),
  defaultCredits: z
    .number({ message: 'Default credits are required' })
    .int('Credits must be a whole number')
    .min(1, 'Credits must be at least 1')
    .max(12, 'Credits cannot exceed 12'),
  isActive: z.boolean(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: CourseDto | null;
}

export default function CourseFormModal({ isOpen, onClose, course }: CourseFormModalProps) {
  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const isSubmitting = createCourse.isPending || updateCourse.isPending;
  const isEditing = !!course;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    mode: 'onChange',
    defaultValues: {
      courseCode: '',
      title: '',
      description: '',
      defaultCredits: 3,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (course) {
      reset({
        courseCode: course.courseCode,
        title: course.title,
        description: course.description ?? '',
        defaultCredits: course.defaultCredits,
        isActive: course.isActive,
      });
    } else {
      reset({
        courseCode: '',
        title: '',
        description: '',
        defaultCredits: 3,
        isActive: true,
      });
    }
  }, [isOpen, course, reset]);

  const applyServerErrors = (error: CourseMutationError) => {
    error.fieldErrors.forEach(({ field, message }) => {
      setError(field as Path<CourseFormData>, {
        type: 'server',
        message,
      });
    });
  };

  const onSubmit = (values: CourseFormData) => {
    const payload: CoursePayload = {
      courseCode: values.courseCode,
      title: values.title,
      description: values.description.trim() ? values.description : null,
      defaultCredits: values.defaultCredits,
      isActive: values.isActive,
    };

    const onError = (error: unknown) => {
      if (error instanceof CourseMutationError) {
        applyServerErrors(error);
        sonnerToast.error(isEditing ? 'Unable to update course' : 'Unable to create course', {
          description: error.message,
        });
      } else {
        sonnerToast.error('Something went wrong', {
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    };

    if (isEditing && course) {
      updateCourse.mutate(
        { id: course.id, payload },
        {
          onSuccess: () => {
            sonnerToast.success('Course updated successfully', {
              description: `${payload.courseCode} — ${values.title}`,
            });
            onClose();
          },
          onError,
        },
      );
    } else {
      createCourse.mutate(payload, {
        onSuccess: () => {
          sonnerToast.success('Course created successfully', {
            description: `${payload.courseCode} — ${values.title}`,
          });
          onClose();
        },
        onError,
      });
    }
  };

  if (!isOpen) return null;

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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.247m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.247"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isEditing ? 'Edit Course' : 'Add Course'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? `Update details for ${course?.courseCode}` : 'Create a new course offering'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="courseCode"
                label="Course Code *"
                type="text"
                placeholder="e.g. CS-101"
                hint="Letters, numbers, and hyphens only. Auto-uppercased."
                error={errors.courseCode?.message}
                registration={register('courseCode')}
              />
              <InputField
                id="title"
                label="Title *"
                type="text"
                placeholder="e.g. Introduction to Programming"
                error={errors.title?.message}
                registration={register('title')}
              />
              <InputField
                id="defaultCredits"
                label="Default Credits *"
                type="number"
                placeholder="e.g. 3"
                error={errors.defaultCredits?.message}
                registration={register('defaultCredits', { valueAsNumber: true })}
              />
              <div className="flex items-end pb-1">
                <label className="inline-flex items-center gap-3 cursor-pointer select-none px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl w-full md:w-auto h-[46px]">
                  <input
                    id="isActive"
                    type="checkbox"
                    {...register('isActive')}
                    className="checkbox-custom w-4 h-4 rounded border-slate-600 bg-slate-800 focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-sm text-slate-300">Set as active course</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Brief overview of the course content and objectives..."
                {...register('description')}
                className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-slate-700 transition duration-200 resize-y min-h-[96px] ${
                  errors.description ? 'border-red-400 focus:ring-red-500' : 'border-slate-600 focus:ring-indigo-400'
                }`}
              />
              {errors.description && (
                <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                  {errors.description.message}
                </p>
              )}
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
              {isEditing ? 'Save Changes' : 'Create Course'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
