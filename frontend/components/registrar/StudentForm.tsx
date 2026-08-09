'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import type { Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast as sonnerToast } from 'sonner';
import {
  addStudentSchema,
  studentInfoSchema,
  contactInfoSchema,
  emergencyContactSchema,
  AddStudentFormData,
} from './add-student-schema';
import StepStudentInfo from './StepStudentInfo';
import StepContactInfo from './StepContactInfo';
import StepEmergency from './StepEmergency';
import Button from '@/components/ui/Button';
import {
  useCreateStudent,
  formatStudentName,
  CreateStudentResult,
  StudentCreationError,
} from '@/api/students';

interface StudentFormProps {
  onCancel?: () => void;
  onSuccess?: (result: CreateStudentResult) => void;
  initialData?: Partial<AddStudentFormData>;
  submitLabel?: string;
}

const STEP_PREFIXES = ['studentInfo', 'contactInfo', 'emergencyContact'] as const;

export default function StudentForm({
  onCancel,
  onSuccess,
  initialData,
  submitLabel = 'Create Student',
}: StudentFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [errorSteps, setErrorSteps] = useState<number[]>([]);

  const steps = ['student', 'contact', 'emergency'];

  const {
    register,
    trigger,
    reset,
    getValues,
    setError,
    formState: { errors },
  } = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    mode: 'onChange',
    defaultValues: {
      studentInfo: {
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
      },
      contactInfo: {
        email: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: '',
        isPrimary: false,
      },
      ...initialData,
    },
  });

  const createStudent = useCreateStudent();

  const validateCurrentStep = useCallback(async (stepIdx: number): Promise<boolean> => {
    const values = getValues();
    if (stepIdx === 0) {
      const result = studentInfoSchema.safeParse(values.studentInfo);
      if (!result.success) {
        await trigger('studentInfo');
        return false;
      }
    } else if (stepIdx === 1) {
      const result = contactInfoSchema.safeParse(values.contactInfo);
      if (!result.success) {
        await trigger('contactInfo');
        return false;
      }
    } else if (stepIdx === 2) {
      const result = emergencyContactSchema.safeParse(values.emergencyContact);
      if (!result.success) {
        await trigger('emergencyContact');
        return false;
      }
    }
    return true;
  }, [getValues, trigger]);

  const handleNext = async () => {
    const isValid = await validateCurrentStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      sonnerToast.error('Please fix the errors', {
        description: 'Complete all required fields before continuing.',
      });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleTabClick = async (idx: number) => {
    if (idx <= currentStep) {
      setCurrentStep(idx);
    } else if (idx === currentStep + 1) {
      const isValid = await validateCurrentStep(currentStep);
      if (isValid) {
        setCurrentStep(idx);
      } else {
        sonnerToast.error('Please fix the errors', {
          description: 'Complete all required fields before continuing.',
        });
      }
    } else {
      sonnerToast('Complete current step', {
        description: 'Please fill the current step first.',
      });
    }
  };

  const handleCancel = () => {
    reset();
    setCurrentStep(0);
    setErrorSteps([]);
    if (onCancel) {
      onCancel();
    }
  };

  const handleFormSubmit = (data: AddStudentFormData) => {
    setErrorSteps([]);
    createStudent.mutate(data, {
      onSuccess: (result) => {
        sonnerToast.success('Student created successfully!', {
          description: result.student.studentNumber
            ? `${formatStudentName(result.student)} (${result.student.studentNumber})`
            : formatStudentName(result.student),
        });
        if (onSuccess) {
          onSuccess(result);
        }
        handleCancel();
      },
      onError: (error) => {
        if (error instanceof StudentCreationError) {
          setErrorSteps((prev) =>
            prev.includes(error.stepIndex) ? prev : [...prev, error.stepIndex],
          );
          setCurrentStep(error.stepIndex);

          error.fieldErrors.forEach(({ field, message }) => {
            setError(`${STEP_PREFIXES[error.stepIndex]}.${field}` as Path<AddStudentFormData>, {
              type: 'server',
              message,
            });
          });

          sonnerToast.error('Unable to create student', {
            description: error.message,
          });
        } else {
          sonnerToast.error('Failed to create student', {
            description: 'An unexpected error occurred. Please try again.',
          });
        }
      },
    });
  };

  const handleFormInvalid = () => {
    sonnerToast.error('Please fix the errors', {
      description: 'Complete all required fields before submitting.',
    });
  };

  const onFinalSubmit = async () => {
    const isValid = await trigger();
    if (!isValid) {
      handleFormInvalid();
      return;
    }
    handleFormSubmit(getValues());
  };

  const isLastStep = currentStep === steps.length - 1;
  const isLoading = createStudent.isPending;

  const tabClass = (idx: number) =>
    `flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
      currentStep === idx
        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
        : 'text-slate-400 hover:text-white'
    } ${errorSteps.includes(idx) ? 'ring-2 ring-red-500/70 ring-offset-1 ring-offset-slate-800/60' : ''}`;

  const errorIcon = (idx: number) =>
    errorSteps.includes(idx) ? (
      <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ) : null;

  return (
    <>
      {/* Form Tabs */}
      <div className="px-6 pt-4 bg-slate-900/90">
        <div className="flex items-center gap-1 p-1 bg-slate-800/60 border border-slate-700/50 rounded-xl">
          <button
            type="button"
            onClick={() => handleTabClick(0)}
            className={tabClass(0)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Student Info</span>
            {errorIcon(0)}
          </button>
          <button
            type="button"
            onClick={() => handleTabClick(1)}
            className={tabClass(1)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Contact Info</span>
            {errorIcon(1)}
          </button>
          <button
            type="button"
            onClick={() => handleTabClick(2)}
            className={tabClass(2)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Emergency Contact</span>
            {errorIcon(2)}
          </button>
        </div>
      </div>

      {/* Form Body */}
      <form
        onSubmit={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            if (currentStep === steps.length - 1) {
              onFinalSubmit();
            } else {
              handleNext();
            }
          }
        }}
        className="flex-1 overflow-y-auto"
        noValidate
      >
        <div className="p-6 space-y-6">
          {currentStep === 0 && <StepStudentInfo register={register} errors={errors} />}
          {currentStep === 1 && <StepContactInfo register={register} errors={errors} />}
          {currentStep === 2 && <StepEmergency register={register} errors={errors} />}
        </div>

        {/* Footer Controls */}
        <div className="sticky bottom-0 px-6 py-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50 flex items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <span className={`w-2 h-2 rounded-full ${currentStep >= 0 ? 'bg-indigo-500' : 'bg-slate-600'}`}></span>
            <span className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-indigo-500' : 'bg-slate-600'}`}></span>
            <span className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-indigo-500' : 'bg-slate-600'}`}></span>
            <span className="ml-2">Step <span className="text-slate-300 font-semibold">{currentStep + 1}</span> of 3</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            {currentStep > 0 && (
              <Button
                type="button"
                onClick={handlePrev}
                variant="outline"
                size="sm"
                fullWidth={false}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>
            )}
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              size="sm"
              fullWidth={false}
            >
              Cancel
            </Button>
            {isLastStep ? (
              <Button
                type="button"
                onClick={onFinalSubmit}
                disabled={isLoading}
                variant="primary"
                size="sm"
                fullWidth={false}
                isLoading={isLoading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{isLoading ? 'Creating...' : submitLabel}</span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                variant="primary"
                size="sm"
                fullWidth={false}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
