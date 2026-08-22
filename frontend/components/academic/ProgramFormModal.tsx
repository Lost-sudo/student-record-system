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
  AcademicProgramDto,
  AcademicProgramMutationError,
  DEGREE_TYPES,
  useCreateAcademicProgram,
  useUpdateAcademicProgram,
} from '@/api/academicPrograms';

const programFormSchema = z.object({
  programCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Program code must be at least 2 characters')
    .max(20, 'Program code cannot exceed 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Program code may only contain letters, numbers, and hyphens'),
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name cannot exceed 255 characters'),
  degreeType: z.enum(DEGREE_TYPES, { message: 'Please select a degree type' }),
  description: z.string().trim().max(2000, 'Description cannot exceed 2000 characters'),
  isActive: z.boolean(),
});

type ProgramFormData = z.infer<typeof programFormSchema>;

interface ProgramFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  program?: AcademicProgramDto | null;
}

export default function ProgramFormModal({ isOpen, onClose, program }: ProgramFormModalProps) {
  const createProgram = useCreateAcademicProgram();
  const updateProgram = useUpdateAcademicProgram();
  const isSubmitting = createProgram.isPending || updateProgram.isPending;
  const isEditing = !!program;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
    mode: 'onChange',
    defaultValues: {
      programCode: '',
      name: '',
      degreeType: 'BACHELOR',
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (program) {
      reset({
        programCode: program.programCode,
        name: program.name,
        degreeType: program.degreeType,
        description: program.description ?? '',
        isActive: program.isActive,
      });
    } else {
      reset({
        programCode: '',
        name: '',
        degreeType: 'BACHELOR',
        description: '',
        isActive: true,
      });
    }
  }, [isOpen, program, reset]);

  const onSubmit = (values: ProgramFormData) => {
    const payload = {
      ...values,
      description: values.description.trim() === '' ? null : values.description.trim(),
    };

    const onError = (error: unknown) => {
      if (error instanceof AcademicProgramMutationError) {
        error.fieldErrors.forEach(({ field, message }) => {
          setError(field as Path<ProgramFormData>, { type: 'server', message });
        });
        sonnerToast.error(isEditing ? 'Unable to update program' : 'Unable to create program', {
          description: error.message,
        });
      } else {
        sonnerToast.error('Something went wrong', {
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    };

    if (isEditing && program) {
      updateProgram.mutate(
        { id: program.id, payload },
        {
          onSuccess: () => {
            sonnerToast.success('Academic program updated successfully', {
              description: `${payload.programCode} — ${values.name}`,
            });
            onClose();
          },
          onError,
        },
      );
    } else {
      createProgram.mutate(payload, {
        onSuccess: () => {
          sonnerToast.success('Academic program created successfully', {
            description: `${payload.programCode} — ${values.name}`,
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
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-900/50 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isEditing ? 'Edit Academic Program' : 'Add Academic Program'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? `Update details for ${program?.programCode}` : 'Create a new degree program'}
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
                id="programCode"
                label="Program Code *"
                type="text"
                placeholder="e.g. BSIT"
                hint="Letters, numbers, and hyphens only. Auto-uppercased."
                error={errors.programCode?.message}
                registration={register('programCode')}
              />
              <InputField
                id="programName"
                label="Name *"
                type="text"
                placeholder="e.g. Bachelor of Science in IT"
                error={errors.name?.message}
                registration={register('name')}
              />
              <div>
                <label htmlFor="degreeType" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Degree Type *
                </label>
                <select
                  id="degreeType"
                  {...register('degreeType')}
                  className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:border-transparent focus:bg-slate-700 transition duration-200 ${
                    errors.degreeType ? 'border-red-400 focus:ring-red-500' : 'border-slate-600 focus:ring-indigo-400'
                  }`}
                >
                  {DEGREE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
                {errors.degreeType?.message && (
                  <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-400 rounded-full" />
                    {errors.degreeType.message}
                  </p>
                )}
              </div>
              <div className="flex items-end pb-1">
                <label className="inline-flex items-center gap-3 cursor-pointer select-none px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-xl w-full md:w-auto h-[46px]">
                  <input
                    id="isActive"
                    type="checkbox"
                    {...register('isActive')}
                    className="checkbox-custom w-4 h-4 rounded border-slate-600 bg-slate-800 focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-sm text-slate-300">Set as active program</span>
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
                placeholder="Brief overview of the program..."
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
              {isEditing ? 'Save Changes' : 'Create Program'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
