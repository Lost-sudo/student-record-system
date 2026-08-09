'use client';

import React, { useMemo } from 'react';
import { toast as sonnerToast } from 'sonner';
import {
  StudentDto,
  useStudentContactDetails,
  useUpdateStudent,
  formatStudentName,
  toDateInputValue,
  areSectionsEqual,
  UpdateStudentPayload,
  UpdateStudentResult,
} from '@/api/students';
import StudentWizardForm from './StudentWizardForm';
import { AddStudentFormData } from './add-student-schema';

interface StudentEditFormProps {
  student: StudentDto;
  onCancel?: () => void;
  onSuccess?: (result: UpdateStudentResult) => void;
  submitLabel?: string;
}

const EMPTY_EDIT_EMERGENCY_CONTACT = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
  isPrimary: false,
};

export default function StudentEditForm({
  student,
  onCancel,
  onSuccess,
  submitLabel = 'Save Changes',
}: StudentEditFormProps) {
  const updateStudent = useUpdateStudent();
  const detailsQuery = useStudentContactDetails(student.id);

  const snapshot = useMemo<AddStudentFormData | null>(() => {
    if (!detailsQuery.data) return null;

    const { contactInfo, emergencyContact } = detailsQuery.data;
    const primaryEmergency = emergencyContact[0];

    return {
      studentInfo: {
        firstName: student.firstName,
        middleName: student.middleName ?? '',
        lastName: student.lastName,
        dateOfBirth: toDateInputValue(student.dateOfBirth),
        gender: student.gender ?? '',
        nationality: student.nationality ?? '',
      },
      contactInfo: {
        email: contactInfo?.email ?? '',
        phone: contactInfo?.phone ?? '',
        addressLine1: contactInfo?.addressLine1 ?? '',
        addressLine2: contactInfo?.addressLine2 ?? '',
        city: contactInfo?.city ?? '',
        state: contactInfo?.state ?? '',
        postalCode: contactInfo?.postalCode ?? '',
        country: contactInfo?.country ?? '',
      },
      emergencyContact: primaryEmergency
        ? {
            name: primaryEmergency.name,
            relationship: primaryEmergency.relationship,
            phone: primaryEmergency.phone,
            email: primaryEmergency.email ?? '',
            isPrimary: primaryEmergency.isPrimary,
          }
        : EMPTY_EDIT_EMERGENCY_CONTACT,
    };
  }, [student, detailsQuery.data]);

  const contactInfoExisted = !!detailsQuery.data?.contactInfo;
  const existingEmergencyContactId = detailsQuery.data?.emergencyContact[0]?.id ?? null;

  const handleSubmit = async (data: AddStudentFormData) => {
    if (!snapshot) return;

    const changed = {
      studentInfo: !areSectionsEqual(data.studentInfo, snapshot.studentInfo),
      contactInfo: !areSectionsEqual(data.contactInfo, snapshot.contactInfo),
      emergencyContact: !areSectionsEqual(data.emergencyContact, snapshot.emergencyContact),
    };

    if (!changed.studentInfo && !changed.contactInfo && !changed.emergencyContact) {
      sonnerToast('No changes detected', {
        description: 'The student details were not modified.',
      });
      return;
    }

    const sections: UpdateStudentPayload = {};
    if (changed.studentInfo) {
      sections.studentInfo = data.studentInfo;
    }
    if (changed.contactInfo) {
      sections.contactInfo = { ...data.contactInfo, contactInfoExisted };
    }
    if (changed.emergencyContact) {
      sections.emergencyContact = { ...data.emergencyContact, existingEmergencyContactId };
    }

    const result = await updateStudent.mutateAsync({
      studentId: student.id,
      sections,
    });

    sonnerToast.success('Student updated successfully!', {
      description: formatStudentName(student),
    });

    if (onSuccess) {
      onSuccess(result);
    }
  };

  if (!snapshot || detailsQuery.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-12">
        <div className="w-10 h-10 rounded-full border-2 border-slate-600 border-t-indigo-500 animate-spin"></div>
        <div className="text-sm text-slate-400">Loading student details...</div>
      </div>
    );
  }

  return (
    <StudentWizardForm
      defaultFormData={snapshot}
      submitLabel={submitLabel}
      submittingLabel="Saving..."
      isSubmitting={updateStudent.isPending}
      onSubmit={handleSubmit}
      onCancel={onCancel}
    />
  );
}