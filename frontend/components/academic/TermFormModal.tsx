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
  AcademicTermDto,
  AcademicTermMutationError,
  AcademicTermPayload,
  useCreateAcademicTerm,
  useUpdateAcademicTerm,
} from '@/api/academicTerms';
import { toDateInputValue } from '@/api/students';

const termFormSchema = z
  .object({
    termCode: z
      .string()
      .trim()
      .toUpperCase()
      .min(2, 'Term code must be at least 2 characters')
      .max(20, 'Term code cannot exceed 20 characters')
      .regex(/^[A-Z0-9-]+$/, 'Term code may only contain letters, numbers, and hyphens'),
    name: z
      .string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(255, 'Name cannot exceed 255 characters'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    isActive: z.boolean(),
  })
  .refine(
    (data) => !data.startDate || !data.endDate || new Date(data.endDate) > new Date(data.startDate),
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    },
  );

type TermFormData = z.infer<typeof termFormSchema>;

interface TermFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  term?: AcademicTermDto | null;
}

export default function TermFormModal({ isOpen, onClose, term }: TermFormModalProps) {
  const createTerm = useCreateAcademicTerm();
  const updateTerm = useUpdateAcademicTerm();
  const isSubmitting = createTerm.isPending || updateTerm.isPending;
  const isEditing = !!term;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TermFormData>({
    resolver: zodResolver(termFormSchema),
    mode: 'onChange',
    defaultValues: {
      termCode: '',
      name: '',
      startDate: '',
      endDate: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (term) {
      reset({
        termCode: term.termCode,
        name: term.name,
        startDate: toDateInputValue(term.startDate),
        endDate: toDateInputValue(term.endDate),
        isActive: term.isActive,
      });
    } else {
      reset({
        termCode: '',
        name: '',
        startDate: '',
        endDate: '',
        isActive: true,
      });
    }
  }, [isOpen, term, reset]);

  const applyServerErrors = (error: AcademicTermMutationError) => {
    error.fieldErrors.forEach(({ field, message }) => {
      setError(field as Path<TermFormData>, {
        type: 'server',
        message,
      });
    });
  };

  const onSubmit = (values: TermFormData) => {
    const payload: AcademicTermPayload = {
      termCode: values.termCode,
      name: values.name,
      startDate: values.startDate,
      endDate: values.endDate,
      isActive: values.isActive,
    };

    const onError = (error: unknown) => {
      if (error instanceof AcademicTermMutationError) {
        applyServerErrors(error);
        sonnerToast.error(isEditing ? 'Unable to update academic term' : 'Unable to create academic term', {
          description: error.message,
        });
      } else {
        sonnerToast.error('Something went wrong', {
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    };

    if (isEditing && term) {
      updateTerm.mutate(
        { id: term.id, payload },
        {
          onSuccess: () => {
            sonnerToast.success('Academic term updated successfully', {
              description: `${payload.termCode} — ${values.name}`,
            });
            onClose();
          },
          onError,
        },
      );
    } else {
      createTerm.mutate(payload, {
        onSuccess: () => {
          sonnerToast.success('Academic term created successfully', {
            description: `${payload.termCode} — ${values.name}`,
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isEditing ? 'Edit Academic Term' : 'Add Academic Term'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? `Update details for ${term?.termCode}` : 'Create a new academic term'}
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
                id="termCode"
                label="Term Code *"
                type="text"
                placeholder="e.g. 1ST-SEM-2026"
                hint="Letters, numbers, and hyphens only. Auto-uppercased."
                error={errors.termCode?.message}
                registration={register('termCode')}
              />
              <InputField
                id="name"
                label="Name *"
                type="text"
                placeholder="e.g. First Semester AY 2026-2027"
                error={errors.name?.message}
                registration={register('name')}
              />
              <InputField
                id="startDate"
                label="Start Date *"
                type="date"
                error={errors.startDate?.message}
                registration={register('startDate')}
              />
              <InputField
                id="endDate"
                label="End Date *"
                type="date"
                error={errors.endDate?.message}
                registration={register('endDate')}
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-300 mb-1.5">Status</span>
              <label className="inline-flex items-center gap-3 cursor-pointer select-none px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl w-full md:w-auto">
                <input
                  id="isActive"
                  type="checkbox"
                  {...register('isActive')}
                  className="checkbox-custom w-4 h-4 rounded border-slate-600 bg-slate-800 focus:ring-2 focus:ring-indigo-400"
                />
                <span className="text-sm text-slate-300">Set as active term</span>
              </label>
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
              {isEditing ? 'Save Changes' : 'Create Term'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
