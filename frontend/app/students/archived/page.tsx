'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast as sonnerToast } from 'sonner';
import { useArchivedStudents, formatStudentName } from '@/api/students';
import { ArchivedFilterState, ArchivedStudent } from '@/lib/types';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AmbientBackground from '@/components/ui/AmbientBackground';
import ArchivedStudentFilters from '@/components/students/ArchivedStudentFilters';
import ArchivedStudentTable from '@/components/students/ArchivedStudentTable';

export default function ArchivedStudentsPage() {
  const [filters, setFilters] = useState<ArchivedFilterState>({ search: '', gender: '', program: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const archivedQuery = useArchivedStudents({ limit: 100 });

  useEffect(() => {
    if (archivedQuery.isError) {
      sonnerToast.error('Failed to load archived students', {
        description: 'Please try again later.',
      });
    }
  }, [archivedQuery.isError]);

  const archivedStudents = useMemo<ArchivedStudent[]>(() => {
    return (archivedQuery.data?.data ?? []).map((student) => ({
      id: student.studentNumber ?? student.id,
      name: formatStudentName(student),
      email: student.email ?? '—',
      program: '—',
      gender: student.gender ?? '',
      avatar: `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase(),
      archivedAt: student.deletedAt ?? student.updatedAt,
    }));
  }, [archivedQuery.data]);

  // Memoized filtering for performance
  const filteredStudents = useMemo(() => {
    return archivedStudents.filter(student => {
      const matchesSearch = !filters.search || 
        student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesGender = !filters.gender || student.gender === filters.gender;
      const matchesProgram = !filters.program || student.program === filters.program;

      return matchesSearch && matchesGender && matchesProgram;
    });
  }, [archivedStudents, filters]);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const start = (currentPage - 1) * studentsPerPage;
  const end = Math.min(start + studentsPerPage, filteredStudents.length);
  const pageStudents = filteredStudents.slice(start, end);

  const handleFilterChange = (newFilters: ArchivedFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 on filter change
    setSelectedIds(new Set()); // Clear selection on filter change
  };

  const handleSelect = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelectedIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(pageStudents.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Student Records', href: '/students' },
    { label: 'Archived / Deleted' },
  ];

  return (
    <div className="text-slate-200 min-h-screen">
      <AmbientBackground />
      
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          <Header breadcrumbs={breadcrumbs} />
          
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto w-full">
            {/* Page Header */}
            <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Archived Students</h1>
                <p className="text-slate-400 mt-1.5 text-sm lg:text-base">View and manage students who have been archived or deleted from the system</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => alert('Export functionality would download archived student data as CSV/Excel')}
                  className="px-6 py-3 text-sm font-semibold rounded-xl border border-slate-600 hover:border-slate-500 hover:bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Archive
                </button>
                
                {/* Conditionally render based on selection, matching original HTML behavior */}
                {selectedIds.size > 0 && (
                  <button 
                    onClick={() => alert(`Restore triggered for ${selectedIds.size} students`)}
                    className="px-6 py-3 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 animate-in fade-in slide-in-from-right-4"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Restore Selected
                  </button>
                )}
              </div>
            </section>

            {/* Info Banner */}
            <section className="glass rounded-3xl border border-amber-500/30 bg-amber-500/5 p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-amber-300">Archived Records</div>
                  <div className="text-xs text-amber-200/70 mt-0.5">These student records are no longer active but preserved for historical reference. You can restore them if needed.</div>
                </div>
              </div>
            </section>

            {/* Filters & Batch Actions */}
            <ArchivedStudentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              selectedCount={selectedIds.size}
              onClearSelection={() => setSelectedIds(new Set())}
              onBulkRestore={() => alert(`Bulk restore triggered for ${selectedIds.size} students`)}
              onBulkDelete={() => alert(`Bulk delete triggered for ${selectedIds.size} students`)}
            />

            {/* Data Table */}
            <ArchivedStudentTable
              students={pageStudents}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              currentPage={currentPage}
              totalPages={totalPages}
              start={start}
              end={end}
              total={filteredStudents.length}
              onPageChange={setCurrentPage}
              isLoading={archivedQuery.isLoading}
            />

            {/* Footer */}
            <footer className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div>© 2026 SRS Portal — Student Registrar System</div>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  All systems operational
                </span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}