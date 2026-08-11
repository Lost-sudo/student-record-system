'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { AddStudentFormData } from './add-student-schema';

interface StepStudentInfoProps {
  register: UseFormRegister<AddStudentFormData>;
  errors: FieldErrors<AddStudentFormData>;
}

export default function StepStudentInfo({ register, errors }: StepStudentInfoProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            First Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. John"
            {...register('studentInfo.firstName')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.studentInfo?.firstName
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          />
          {errors.studentInfo?.firstName && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.studentInfo.firstName.message}
            </p>
          )}
        </div>

        {/* Middle Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Middle Name</label>
          <input
            type="text"
            placeholder="e.g. A."
            {...register('studentInfo.middleName')}
            className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
          />
          <p className="mt-1.5 text-xs text-slate-400">Optional</p>
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Doe"
            {...register('studentInfo.lastName')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.studentInfo?.lastName
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          />
          {errors.studentInfo?.lastName && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.studentInfo.lastName.message}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Date of Birth <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            {...register('studentInfo.dateOfBirth')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.studentInfo?.dateOfBirth
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          />
          {errors.studentInfo?.dateOfBirth && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.studentInfo.dateOfBirth.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
          <select
            {...register('studentInfo.gender')}
            className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="undisclosed">Prefer not to disclose</option>
          </select>
          <p className="mt-1.5 text-xs text-slate-400">Optional</p>
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Nationality</label>
          <input
            type="text"
            placeholder="e.g. Filipino"
            {...register('studentInfo.nationality')}
            className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
          />
          <p className="mt-1.5 text-xs text-slate-400">Optional</p>
        </div>
      </div>
    </div>
  );
}
