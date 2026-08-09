'use client';

import React from 'react';
import StudentEditForm from '@/components/registrar/StudentEditForm';
import { formatStudentName, StudentDto } from '@/api/students';

interface EditStudentModalProps {
  student: StudentDto;
  onClose: () => void;
}

function getInitials(student: StudentDto): string {
  const first = student.firstName.charAt(0);
  const last = student.lastName.charAt(0);
  return `${first}${last}`.toUpperCase();
}

export default function EditStudentModal({ student, onClose }: EditStudentModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="modal-backdrop absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />
      <div className="modal-panel relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl shadow-indigo-900/40 overflow-hidden z-10">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-700/50 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-900/50 shrink-0">
              {getInitials(student)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Edit Student</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatStudentName(student)}
                {student.studentNumber ? ` (${student.studentNumber})` : ''}
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
        <StudentEditForm
          student={student}
          onCancel={onClose}
          onSuccess={() => onClose()}
        />
      </div>
    </div>
  );
}