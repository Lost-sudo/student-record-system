'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { AddStudentFormData } from './add-student-schema';

interface StepPersonalInfoProps {
  register: UseFormRegister<AddStudentFormData>;
  errors: FieldErrors<AddStudentFormData>;
}

export default function StepPersonalInfo({ register, errors }: StepPersonalInfoProps) {
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
            {...register('firstName')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.firstName
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          />
          {errors.firstName && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Last Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Doe"
            {...register('lastName')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.lastName
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          />
          {errors.lastName && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              type="email"
              placeholder="student@srs.edu"
              {...register('email')}
              className={`w-full py-2.5 pl-10 pr-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
                errors.email
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Phone Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
              className={`w-full py-2.5 pl-10 pr-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
                errors.phone
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.phone.message}
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
            {...register('dob')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.dob
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          />
          {errors.dob && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.dob.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Gender <span className="text-red-400">*</span>
          </label>
          <select
            {...register('gender')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.gender
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="undisclosed">Prefer not to disclose</option>
          </select>
          {errors.gender && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.gender.message}
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Residential Address</label>
        <input
          type="text"
          placeholder="Street address, City, Country"
          {...register('address')}
          className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
        />
        <p className="mt-1.5 text-xs text-slate-400">Optional — can be added later</p>
      </div>
    </div>
  );
}
