'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast as sonnerToast } from 'sonner';
import { useStudents, useDeleteStudent, formatStudentName, StudentDto } from '@/api/students';
import { FilterState, Student } from '@/lib/types';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { AddStudentModal } from '@/components/dashboard';
import AmbientBackground from '@/components/ui/AmbientBackground';
import ConfirmModal from '@/components/ui/ConfirmModal';
import StudentFilters from '@/components/students/StudentFilters';
import StudentTable from '@/components/students/StudentTable';
import ViewStudentModal from '@/components/students/ViewStudentModal';
import EditStudentModal from '@/components/students/EditStudentModal';

interface PendingDelete {
  ids: string[];
  label: string;
}

export default function StudentsPage() {
  const [filters, setFilters] = useState<FilterState>({ search: '', status: '', program: '' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<StudentDto | null>(null);
  const [editingStudent, setEditingStudent] = useState<StudentDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const studentsPerPage = 10;

  const studentsQuery = useStudents({ limit: 100 });
  const deleteStudent = useDeleteStudent();

  useEffect(() => {
    if (studentsQuery.isError) {
      sonnerToast.error('Failed to load students', {
        description: 'Please try again later.',
      });
    }
  }, [studentsQuery.isError]);

  const { students, studentById } = useMemo(() => {
    const dtos = studentsQuery.data?.data ?? [];
    const mapped: Student[] = dtos.map((student) => ({
      id: student.studentNumber ?? student.id,
      name: formatStudentName(student),
      email: student.email ?? '—',
      program: '—',
      status: 'active',
      enrolled: student.createdAt,
      avatar: `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase(),
    }));

    const byId = new Map<string, StudentDto>();
    dtos.forEach((student) => byId.set(student.studentNumber ?? student.id, student));

    return { students: mapped, studentById: byId };
  }, [studentsQuery.data]);

  // Memoized filtering for performance
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !filters.search || 
        student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || student.status === filters.status;
      const matchesProgram = !filters.program || student.program === filters.program;

      return matchesSearch && matchesStatus && matchesProgram;
    });
  }, [students, filters]);

  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const start = (currentPage - 1) * studentsPerPage;
  const end = Math.min(start + studentsPerPage, filteredStudents.length);
  const pageStudents = filteredStudents.slice(start, end);

  const handleFilterChange = (newFilters: FilterState) => {
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

  const handleView = (id: string) => {
    const dto = studentById.get(id);
    if (dto) setViewingStudent(dto);
  };

  const handleEdit = (id: string) => {
    const dto = studentById.get(id);
    if (dto) setEditingStudent(dto);
  };

  const handleDelete = (id: string) => {
    const dto = studentById.get(id);
    if (!dto) return;
    setPendingDelete({ ids: [dto.id], label: formatStudentName(dto) });
  };

  const handleArchiveSelected = () => {
    if (selectedIds.size === 0) return;
    const ids: string[] = [];
    selectedIds.forEach((displayId) => {
      const dto = studentById.get(displayId);
      if (dto) ids.push(dto.id);
    });
    setPendingDelete({ ids, label: `${ids.length} selected students` });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    pendingDelete.ids.forEach((id) => {
      deleteStudent.mutate(id, {
        onError: () =>
          sonnerToast.error('Failed to archive student', {
            description: 'An unexpected error occurred. Please try again.',
          }),
      });
    });
    sonnerToast.success(pendingDelete.ids.length > 1 ? 'Students archived successfully' : 'Student archived successfully', {
      description: pendingDelete.label,
    });
    setSelectedIds(new Set());
    setPendingDelete(null);
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Student Records', href: '/students' },
    { label: 'All Active Students' },
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
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">All Active Students</h1>
                <p className="text-slate-400 mt-1.5 text-sm lg:text-base">Manage and view all currently registered students</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                  Add New Student
                </button>
                <button className="px-6 py-3 text-sm font-semibold rounded-xl border border-slate-600 hover:border-slate-500 hover:bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                  Import
                </button>
                <button 
                  onClick={() => alert('Export functionality would download student data as CSV/Excel')}
                  className="px-6 py-3 text-sm font-semibold rounded-xl border border-slate-600 hover:border-slate-500 hover:bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12"/></svg>
                  Export
                </button>
              </div>
            </section>

            {/* Filters & Batch Actions */}
            <StudentFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              selectedCount={selectedIds.size}
              onClearSelection={() => setSelectedIds(new Set())}
              onBulkUpdate={() => alert(`Bulk update triggered for ${selectedIds.size} students`)}
              onArchiveSelected={handleArchiveSelected}
            />

            {/* Data Table */}
            <StudentTable
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
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={studentsQuery.isLoading}
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

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {viewingStudent && (
        <ViewStudentModal
          student={viewingStudent}
          onClose={() => setViewingStudent(null)}
        />
      )}

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!pendingDelete}
        title={pendingDelete && pendingDelete.ids.length > 1 ? 'Archive students' : 'Archive student'}
        description={
          pendingDelete
            ? pendingDelete.ids.length > 1
              ? `${pendingDelete.label} will be removed from the Active Students list. You can restore them from the Archived page later.`
              : `${pendingDelete.label} will be removed from the Active Students list. You can restore them later from the Archived page.`
            : ''
        }
        confirmLabel="Archive"
        isConfirming={deleteStudent.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}