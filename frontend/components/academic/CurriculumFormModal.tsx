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
  CurriculumVersionDto,
  CurriculumVersionMutationError,
  useCreateCurriculumVersion,
  useUpdateCurriculumVersion,
} from '@/api/curriculumVersions';
import { useAcademicPrograms } from '@/api/academicPrograms';
import { useAcademicTerms } from '@/api/academicTerms';

const curriculumFormSchema = (minimumVersion: number) =>
  z.object({
    programId: z.string().min(1, 'Please select a program'),
    effectiveTermId: z.string().min(1, 'Please select an effective term'),
    versionNumber: z
      .number({ message: 'Version number is required' })
      .int('Version number must be a whole number')
      .min(minimumVersion, `Version number must be at least ${minimumVersion}`),
    totalCredits: z
      .number({ message: 'Total credits are required' })
      .int('Total credits must be a whole number')
      .min(1, 'Total credits must be at least 1'),
    description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters'),
    isActive: z.boolean(),
  });

type CurriculumFormData = {
  programId: string;
  effectiveTermId: string;
  versionNumber: number;
  totalCredits: number;
  description: string;
  isActive: boolean;
};

interface CurriculumFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum?: CurriculumVersionDto | null;
}

export default function CurriculumFormModal({
  isOpen,
  onClose,
  curriculum,
}: CurriculumFormModalProps) {
  const createCurriculum = useCreateCurriculumVersion();
  const updateCurriculum = useUpdateCurriculumVersion();
  const isSubmitting = createCurriculum.isPending || updateCurriculum.isPending;
  const isEditing = !!curriculum;

  const programsQuery = useAcademicPrograms({ limit: 100 });
  const termsQuery = useAcademicTerms({ limit: 100 });

  const sortedPrograms = useMemo(
    () =>
      [...(programsQuery.data?.data ?? [])].sort((a, b) =>
        a.programCode.localeCompare(b.programCode),
      ),
    [programsQuery.data],
  );

  const sortedTerms = useMemo(
    () =>
      [...(termsQuery.data?.data ?? [])].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      ),
    [termsQuery.data],
  );

  const programsById = useMemo(() => {
    const map = new Map<string, string>();
    sortedPrograms.forEach((program) => map.set(program.id, `${program.programCode} — ${program.name}`));
    return map;
  }, [sortedPrograms]);

  const termsById = useMemo(() => {
    const map = new Map<string, string>();
    sortedTerms.forEach((term) => map.set(term.id, `${term.termCode} — ${term.name}`));
    return map;
  }, [sortedTerms]);

  const minimumVersion =
    isEditing && curriculum ? Math.max(1, curriculum.versionNumber) : 1;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CurriculumFormData>({
    resolver: zodResolver(curriculumFormSchema(minimumVersion)),
    mode: 'onChange',
    defaultValues: {
      programId: '',
      effectiveTermId: '',
      versionNumber: 1,
      totalCredits: 120,
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (curriculum) {
      reset({
        programId: curriculum.programId,
        effectiveTermId: curriculum.effectiveTermId,
        versionNumber: curriculum.versionNumber,
        totalCredits: curriculum.totalCredits,
        description: curriculum.description ?? '',
        isActive: curriculum.isActive,
      });
    } else {
      reset({
        programId: '',
        effectiveTermId: '',
        versionNumber: 1,
        totalCredits: 120,
        description: '',
        isActive: true,
      });
    }
  }, [isOpen, curriculum, reset]);

  const onSubmit = (values: CurriculumFormData) => {
    const payload = {
      ...values,
      description: values.description.trim() === '' ? null : values.description.trim(),
    };

    const onError = (error: unknown) => {
      if (error instanceof CurriculumVersionMutationError) {
        error.fieldErrors.forEach(({ field, message }) => {
          setError(field as Path<CurriculumFormData>, { type: 'server', message });
        });
        sonnerToast.error(
          isEditing ? 'Unable to update curriculum' : 'Unable to create curriculum',
          {
            description: error.message,
          },
        );
      } else {
        sonnerToast.error('Something went wrong', {
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    };

    const describe = () => {
      const programLabel = programsById.get(values.programId) ?? values.programId;
      return `${programLabel} · v${values.versionNumber}`;
    };

    if (isEditing && curriculum) {
      updateCurriculum.mutate(
        {
          id: curriculum.id,
          payload: {
            versionNumber: values.versionNumber,
            totalCredits: values.totalCredits,
            description: payload.description,
            isActive: values.isActive,
          },
        },
        {
          onSuccess: () => {
            sonnerToast.success('Curriculum version updated successfully', {
              description: describe(),
            });
            onClose();
          },
          onError,
        },
      );
    } else {
      createCurriculum.mutate(payload, {
        onSuccess: () => {
          sonnerToast.success('Curriculum version created successfully', {
            description: describe(),
          });
          onClose();
        },
        onError,
      });
    }
  };

  if (!isOpen) return null;

  const selectedProgramLabel =
    (isEditing && curriculum && (programsById.get(curriculum.programId) ?? curriculum.programId)) ||
    undefined;
  const selectedTermLabel =
    (isEditing &&
      curriculum &&
      (termsById.get(curriculum.effectiveTermId) ?? curriculum.effectiveTermId)) ||
    undefined;

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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-violet-900/50 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isEditing ? 'Edit Curriculum Version' : 'Add Curriculum Version'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing
                  ? `${selectedProgramLabel ?? ''} · v${curriculum?.versionNumber}`
                  : 'Define a program curriculum effective from a term'}
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
                  <span className="block text-sm font-medium text-slate-300 mb-1.5">Program</span>
                  <div className="px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-400 truncate">
                    {selectedProgramLabel ?? '—'}
                  </div>
                </div>
                <div>
                  <span className="block text-sm font-medium text-slate-300 mb-1.5">Effective Term</span>
                  <div className="px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-400 truncate">
                    {selectedTermLabel ?? '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="curriculumProgram" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Program *
                  </label>
                  <select
                    id="curriculumProgram"
                    {...register('programId')}
                    className={selectClass(errors.programId?.message)}
                  >
                    <option value="">Select a program...</option>
                    {sortedPrograms.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.programCode} — {program.name}
                      </option>
                    ))}
                  </select>
                  {errors.programId?.message && (
                    <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                      {errors.programId.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="curriculumTerm" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Effective Term *
                  </label>
                  <select
                    id="curriculumTerm"
                    {...register('effectiveTermId')}
                    className={selectClass(errors.effectiveTermId?.message)}
                  >
                    <option value="">Select an academic term...</option>
                    {sortedTerms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.termCode} — {term.name}
                      </option>
                    ))}
                  </select>
                  {errors.effectiveTermId?.message && (
                    <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                      {errors.effectiveTermId.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="versionNumber"
                label={
                  isEditing && curriculum
                    ? `Version Number * (locked at v${curriculum.versionNumber} or higher)`
                    : 'Version Number *'
                }
                type="number"
                placeholder="e.g. 1"
                error={errors.versionNumber?.message}
                registration={register('versionNumber', { valueAsNumber: true })}
              />
              <InputField
                id="totalCredits"
                label="Total Credits *"
                type="number"
                placeholder="e.g. 120"
                error={errors.totalCredits?.message}
                registration={register('totalCredits', { valueAsNumber: true })}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Notes about this curriculum revision..."
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

            <div className="flex items-center">
              <label className="inline-flex items-center gap-3 cursor-pointer select-none px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl">
                <input
                  id="isActive"
                  type="checkbox"
                  {...register('isActive')}
                  className="checkbox-custom w-4 h-4 rounded border-slate-600 bg-slate-800 focus:ring-2 focus:ring-indigo-400"
                />
                <span className="text-sm text-slate-300">Set as active curriculum</span>
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
              {isEditing ? 'Save Changes' : 'Create Curriculum'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
