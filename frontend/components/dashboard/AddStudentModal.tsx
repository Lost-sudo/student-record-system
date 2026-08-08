'use client';

import React, { useState } from 'react';
import StudentForm from '@/components/registrar/StudentForm';
import { AddStudentFormData } from '@/components/registrar/add-student-schema';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (student: { name: string; id: string }) => void;
}

export default function AddStudentModal({ isOpen, onClose, onSuccess }: AddStudentModalProps) {
  const [studentId] = useState<string>(() => {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
    return `STU-${year}-${num}`;
  });

  if (!isOpen) return null;

  const handleSubmit = (data: AddStudentFormData) => {
    const { firstName, middleName, lastName } = data.studentInfo;
    const fullName = `${firstName.trim()}${middleName ? ` ${middleName.trim()}` : ''} ${lastName.trim()}`.replace(/\s+/g, ' ');
    if (onSuccess) {
      onSuccess({ name: fullName, id: studentId });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="modal-backdrop absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />
      <div className="modal-panel relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl shadow-indigo-900/40 overflow-hidden z-10">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-700/50 bg-slate-900/90">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-900/50 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Add New Student</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Fill in the student&apos;s information. Fields marked with <span className="text-red-400">*</span> are required.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <StudentForm onSubmit={handleSubmit} onCancel={onClose} />
      </div>
    </div>
  );
}