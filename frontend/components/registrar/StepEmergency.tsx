'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { AddStudentFormData } from './add-student-schema';

interface StepEmergencyProps {
  register: UseFormRegister<AddStudentFormData>;
  errors: FieldErrors<AddStudentFormData>;
}

export default function StepEmergency({ register, errors }: StepEmergencyProps) {
  return (
    <div className="space-y-5">
      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-amber-300">Important Notice</div>
          <p className="text-xs text-amber-200/70 mt-0.5">
            Emergency contact information is required for enrollment compliance. Please fill in at least the contact name and one method of contact (phone or email).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contact Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Jane Doe"
            {...register('ecName')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.ecName
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          />
          {errors.ecName && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.ecName.message}
            </p>
          )}
        </div>

        {/* Relationship */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Relationship <span className="text-red-400">*</span>
          </label>
          <select
            {...register('ecRelationship')}
            className={`w-full py-2.5 px-4 bg-slate-800 border rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
              errors.ecRelationship
                ? 'border-red-400 focus:ring-red-500'
                : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
            }`}
          >
            <option value="">Select relationship</option>
            <option value="parent">Parent</option>
            <option value="guardian">Guardian</option>
            <option value="spouse">Spouse</option>
            <option value="sibling">Sibling</option>
            <option value="other">Other</option>
          </select>
          {errors.ecRelationship && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.ecRelationship.message}
            </p>
          )}
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contact Phone <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <input
              type="tel"
              placeholder="+1 (555) 987-6543"
              {...register('ecPhone')}
              className={`w-full py-2.5 pl-10 pr-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
                errors.ecPhone
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
              }`}
            />
          </div>
          {errors.ecPhone && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.ecPhone.message}
            </p>
          )}
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Contact Email</label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              type="email"
              placeholder="contact@example.com"
              {...register('ecEmail')}
              className="w-full py-2.5 pl-10 pr-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">Optional but recommended</p>
        </div>
      </div>

      {/* Contact Address */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Contact Address</label>
        <input
          type="text"
          placeholder="Street address, City, Country"
          {...register('ecAddress')}
          className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
        />
      </div>
    </div>
  );
}
