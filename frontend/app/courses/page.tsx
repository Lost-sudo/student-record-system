'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast as sonnerToast } from 'sonner';
import {
  CourseDto,
  CourseMutationError,
  useCourses,
  useCoursePrerequisites,
  useDeleteCourse,
} from '@/api/courses';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AmbientBackground from '@/components/ui/AmbientBackground';
import ConfirmModal from '@/components/ui/ConfirmModal';
import CourseFormModal from '@/components/academic/CourseFormModal';
import CourseTable from '@/components/academic/CourseTable';
import ManagePrerequisitesModal from '@/components/academic/ManagePrerequisitesModal';

interface PendingDelete {
  id: string;
  label: string;
}

export default function CoursesPage() {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDto | null>(null);
  const [managingPrereqsFor, setManagingPrereqsFor] = useState<CourseDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const coursesPerPage = 10;

  const coursesQuery = useCourses({ limit: 100 });
  const prerequisitesQuery = useCoursePrerequisites();
  const deleteCourse = useDeleteCourse();

  useEffect(() => {
    if (coursesQuery.isError) {
      sonnerToast.error('Failed to load courses', {
        description: 'Please try again later.',
      });
    }
  }, [coursesQuery.isError]);

  const courses = useMemo(() => coursesQuery.data?.data ?? [], [coursesQuery.data]);

  const prereqCounts = useMemo(() => {
    const counts = new Map<string, number>();
    (prerequisitesQuery.data?.data ?? []).forEach((row) => {
      counts.set(row.courseId, (counts.get(row.courseId) ?? 0) + 1);
    });
    return counts;
  }, [prerequisitesQuery.data]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        !filters.search ||
        course.courseCode.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.title.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        !filters.status ||
        (filters.status === 'active' ? course.isActive : !course.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [courses, filters]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const start = (currentPage - 1) * coursesPerPage;
  const end = Math.min(start + coursesPerPage, filteredCourses.length);
  const pageCourses = filteredCourses.slice(start, end);

  const handleFilterChange = (key: 'search' | 'status', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteCourse.mutate(pendingDelete.id, {
      onSuccess: () => {
        sonnerToast.success('Course deleted successfully', {
          description: pendingDelete.label,
        });
      },
      onError: (error) => {
        sonnerToast.error('Failed to delete course', {
          description:
            error instanceof CourseMutationError
              ? error.message === 'Failed to delete course.'
                ? 'This course may be referenced by course sections or degree requirements and cannot be deleted.'
                : error.message
              : 'An unexpected error occurred. Please try again.',
        });
      },
    });
    setPendingDelete(null);
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Academic Management', href: '/courses' },
    { label: 'Courses' },
  ];

  return (
    <div className="text-slate-200 min-h-screen">
      <AmbientBackground />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          <Header breadcrumbs={breadcrumbs} />

          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto w-full">
            <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Courses</h1>
                <p className="text-slate-400 mt-1.5 text-sm lg:text-base">Manage the course catalog and prerequisites</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                  Add New Course
                </button>
              </div>
            </section>

            <section className="glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 p-5 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="courseSearch" className="block text-sm font-medium text-slate-300 mb-2">Search Courses</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      id="courseSearch"
                      type="text"
                      placeholder="Search by course code or title..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full py-2.5 pl-10 pr-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="courseStatusFilter" className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    id="courseStatusFilter"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </section>

            <CourseTable
              courses={pageCourses}
              prereqCounts={prereqCounts}
              currentPage={currentPage}
              totalPages={totalPages}
              start={start}
              end={end}
              total={filteredCourses.length}
              onPageChange={setCurrentPage}
              onManagePrerequisites={(course) => setManagingPrereqsFor(course)}
              onEdit={(course) => setEditingCourse(course)}
              onDelete={(course) =>
                setPendingDelete({ id: course.id, label: `${course.courseCode} — ${course.title}` })
              }
              isLoading={coursesQuery.isLoading}
            />

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

      <CourseFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingCourse && (
        <CourseFormModal
          isOpen={true}
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
        />
      )}

      {managingPrereqsFor && (
        <ManagePrerequisitesModal
          isOpen={true}
          course={managingPrereqsFor}
          onClose={() => setManagingPrereqsFor(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!pendingDelete}
        title="Delete course"
        description={
          pendingDelete
            ? `${pendingDelete.label} will be permanently deleted. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        isConfirming={deleteCourse.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
