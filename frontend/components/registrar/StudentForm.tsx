'use client';

import React from 'react';
import { toast as sonnerToast } from 'sonner';
import StudentWizardForm from './StudentWizardForm';
import {
  useCreateStudent,
  formatStudentName,
  CreateStudentResult,
} from '@/api/students';
import { AddStudentFormData } from './add-student-schema';

interface StudentFormProps {
  onCancel?: () => void;
  onSuccess?: (result: CreateStudentResult) => void;
  initialData?: Partial<AddStudentFormData>;
  submitLabel?: string;
}

export default function StudentForm({
  onCancel,
  onSuccess,
  initialData,
  submitLabel = 'Create Student',
}: StudentFormProps) {
  const createStudent = useCreateStudent();

  const handleSubmit = async (data: AddStudentFormData) => {
    const result = await createStudent.mutateAsync(data);
    sonnerToast.success('Student created successfully!', {
      description: result.student.studentNumber
        ? `${formatStudentName(result.student)} (${result.student.studentNumber})`
        : formatStudentName(result.student),
    });
    if (onSuccess) {
      onSuccess(result);
    }
  };

  return (
    <StudentWizardForm
      defaultFormData={initialData}
      submitLabel={submitLabel}
      submittingLabel="Creating..."
      isSubmitting={createStudent.isPending}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}