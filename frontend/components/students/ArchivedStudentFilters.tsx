'use client';

import { ArchivedFilterState } from '@/lib/types';

interface ArchivedStudentFiltersProps {
  filters: ArchivedFilterState;
  onFilterChange: (filters: ArchivedFilterState) => void;
  selectedCount: number;
  onClearSelection: () => void;
  onBulkRestore: () => void;
  onBulkDelete: () => void;
}

export default function ArchivedStudentFilters({
  filters,
  onFilterChange,
  selectedCount,
  onClearSelection,
  onBulkRestore,
  onBulkDelete,
}: ArchivedStudentFiltersProps) {
  const handleChange = (key: keyof ArchivedFilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <section className="glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 p-5 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">Search Archived Students</label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="w-full py-2.5 pl-10 pr-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
            />
          </div>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
          <select
            value={filters.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="undisclosed">Prefer not to disclose</option>
          </select>
        </div>

        {/* Program Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Program</label>
          <select
            value={filters.program}
            onChange={(e) => handleChange('program', e.target.value)}
            className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
          >
            <option value="">All Programs</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Business Administration">Business Administration</option>
            <option value="Engineering">Engineering</option>
            <option value="Medicine">Medicine</option>
            <option value="Arts">Arts</option>
          </select>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-sm text-slate-300">
            <span className="font-semibold text-white">{selectedCount}</span> students selected
            <button 
              onClick={onClearSelection}
              className="ml-3 text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              Clear selection
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onBulkRestore}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
            >
              Restore Selected
            </button>
            <button 
              onClick={onBulkDelete}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-red-500/50 hover:bg-red-500/10 text-red-400 transition-colors"
            >
              Permanently Delete
            </button>
          </div>
        </div>
      )}
    </section>
  );
}