'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import ToastNotification from '@/components/ui/ToastNotification';
import Button from '@/components/ui/Button';

interface StudentFormProps {
  onSubmit: (data: AddStudentFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<AddStudentFormData>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export default function StudentForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
  submitLabel = 'Create Student',
}: StudentFormProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; title: string; message: string } | null>(null);
  const [localSubmitting, setLocalSubmitting] = useState<boolean>(false);

  const steps = ['student', 'contact', 'emergency'];

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    getValues,
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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToast({ type, title, message });
  };

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
      showToast('error', 'Please fix the errors', 'Complete all required fields before continuing.');
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
        showToast('error', 'Please fix the errors', 'Complete all required fields before continuing.');
      }
    } else {
      showToast('info', 'Complete current step', 'Please fill the current step first.');
    }
  };

  const handleFormSubmit = (data: AddStudentFormData) => {
    setLocalSubmitting(true);
    setTimeout(() => {
      setLocalSubmitting(false);
      onSubmit(data);
    }, 900);
  };

  const handleFormInvalid = () => {
    showToast('error', 'Please fix the errors', 'Complete all required fields before submitting.');
  };

  const handleCancel = () => {
    reset();
    setCurrentStep(0);
    if (onCancel) {
      onCancel();
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const isLoading = isSubmitting || localSubmitting;

  return (
    <>
      {/* Form Tabs */}
      <div className="px-6 pt-4 bg-slate-900/90">
        <div className="flex items-center gap-1 p-1 bg-slate-800/60 border border-slate-700/50 rounded-xl">
          <button
            type="button"
            onClick={() => handleTabClick(0)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              currentStep === 0
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Student Info</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabClick(1)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              currentStep === 1
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Contact Info</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabClick(2)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              currentStep === 2
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>Emergency Contact</span>
          </button>
        </div>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit(handleFormSubmit, handleFormInvalid)} className="flex-1 overflow-y-auto" noValidate>
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
                type="submit"
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

      {/* Toast Notification */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
    </>
  );
}