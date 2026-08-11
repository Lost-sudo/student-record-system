'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { AddStudentFormData } from './add-student-schema';

interface StepContactInfoProps {
  register: UseFormRegister<AddStudentFormData>;
  errors: FieldErrors<AddStudentFormData>;
}

export default function StepContactInfo({ register, errors }: StepContactInfoProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {...register('contactInfo.email')}
              className={`w-full py-2.5 pl-10 pr-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
                errors.contactInfo?.email
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
              }`}
            />
          </div>
          {errors.contactInfo?.email && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.contactInfo.email.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <input
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('contactInfo.phone')}
              className={`w-full py-2.5 pl-10 pr-4 bg-slate-800 border rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-slate-700 transition duration-200 ${
                errors.contactInfo?.phone
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-600 focus:ring-indigo-400 focus:border-transparent'
              }`}
            />
          </div>
          {errors.contactInfo?.phone && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-red-400"></span>
              {errors.contactInfo.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Address Line 1"
              {...register('contactInfo.addressLine1')}
              className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
            />
          </div>
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Address Line 2 (optional)"
              {...register('contactInfo.addressLine2')}
              className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="City"
              {...register('contactInfo.city')}
              className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="State / Province"
              {...register('contactInfo.state')}
              className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Postal Code"
              {...register('contactInfo.postalCode')}
              className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Country"
              {...register('contactInfo.country')}
              className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
            />
          </div>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">Address fields are optional — can be added later.</p>
      </div>
    </div>
  );
}
