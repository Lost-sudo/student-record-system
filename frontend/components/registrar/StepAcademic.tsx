'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { AddStudentFormData } from './add-student-schema';

interface StepAcademicProps {
  register: UseFormRegister<AddStudentFormData>;
  errors: FieldErrors<AddStudentFormData>;
  studentId: string;
}

export default function StepAcademic({ register, errors, studentId }: StepAcademicProps) {
  return (
    <div className="space-y-5">
      {/* Student ID Preview */}
      <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-xs text-slate-400">Auto-generated Student ID</div>
          <div className="text-sm font-mono font-semibold text-indigo-300 mt-0.5">{studentId}</div>
          <p className="text-xs text-slate-500 mt-1">This ID will be assigned upon saving.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Program */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Program <span className="text-red-400">*</span>
          </label>
          <select
            {...register('program')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.program
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          >
            <option value="">Select program</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Engineering">Engineering</option>
            <option value="Medicine">Medicine</option>
            <option value="Arts">Arts</option>
          </select>
          {errors.program && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.program.message}
            </p>
          )}
        </div>

        {/* Enrollment Date */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Enrollment Date <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            {...register('enrollmentDate')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.enrollmentDate
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          />
          {errors.enrollmentDate && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.enrollmentDate.message}
            </p>
          )}
        </div>

        {/* Nationality Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Student Type <span className="text-red-400">*</span>
          </label>
          <select
            {...register('nationality')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.nationality
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          >
            <option value="">Select type</option>
            <option value="local">Local</option>
            <option value="international">International</option>
          </select>
          {errors.nationality && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.nationality.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Initial Status</label>
          <select
            {...register('status')}
            className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>
          <p className="mt-1.5 text-xs text-slate-400">Default is Active</p>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
        <textarea
          rows={3}
          placeholder="Any additional information about the student..."
          {...register('notes')}
          className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200 resize-none"
        />
        <p className="mt-1.5 text-xs text-slate-400">Optional — internal notes for registrar staff</p>
      </div>
    </div>
  );
}
