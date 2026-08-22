'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast as sonnerToast } from 'sonner';
import {
  CourseSectionDto,
  CourseSectionMutationError,
  useCourseSections,
  useDeleteCourseSection,
} from '@/api/courseSections';
import { useCourses } from '@/api/courses';
import { useAcademicTerms } from '@/api/academicTerms';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AmbientBackground from '@/components/ui/AmbientBackground';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SectionFormModal from '@/components/academic/SectionFormModal';
import SectionTable, { ResolvedSection } from '@/components/academic/SectionTable';

interface PendingDelete {
  id: string;
  label: string;
}

export default function CourseSectionsPage() {
  const [filters, setFilters] = useState({ search: '', courseId: '', termId: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CourseSectionDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const sectionsPerPage = 10;

  const sectionsQuery = useCourseSections({ limit: 100 });
  const coursesQuery = useCourses({ limit: 100 });
  const termsQuery = useAcademicTerms({ limit: 100 });
  const deleteSection = useDeleteCourseSection();

  useEffect(() => {
    if (sectionsQuery.isError) {
      sonnerToast.error('Failed to load course sections', {
        description: 'Please try again later.',
      });
    }
  }, [sectionsQuery.isError]);

  const courses = useMemo(() => coursesQuery.data?.data ?? [], [coursesQuery.data]);
  const terms = useMemo(() => termsQuery.data?.data ?? [], [termsQuery.data]);

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => a.courseCode.localeCompare(b.courseCode)),
    [courses],
  );

  const sortedTerms = useMemo(
    () =>
      [...terms].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      ),
    [terms],
  );

  const courseById = useMemo(() => {
    const map = new Map<string, (typeof courses)[number]>();
    courses.forEach((course) => map.set(course.id, course));
    return map;
  }, [courses]);

  const termById = useMemo(() => {
    const map = new Map<string, (typeof terms)[number]>();
    terms.forEach((term) => map.set(term.id, term));
    return map;
  }, [terms]);

  const sections = useMemo(() => sectionsQuery.data?.data ?? [], [sectionsQuery.data]);

  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      const course = courseById.get(section.courseId);
      const term = termById.get(section.termId);
      const search = filters.search.toLowerCase();

      const matchesSearch =
        !search ||
        section.sectionNumber.toLowerCase().includes(search) ||
        course?.courseCode.toLowerCase().includes(search) ||
        course?.title.toLowerCase().includes(search) ||
        term?.termCode.toLowerCase().includes(search) ||
        term?.name.toLowerCase().includes(search);

      const matchesCourse = !filters.courseId || section.courseId === filters.courseId;
      const matchesTerm = !filters.termId || section.termId === filters.termId;

      return matchesSearch && matchesCourse && matchesTerm;
    });
  }, [sections, filters, courseById, termById]);

  const resolvedSections: ResolvedSection[] = useMemo(() => {
    return filteredSections.map((section) => {
      const course = courseById.get(section.courseId);
      const term = termById.get(section.termId);
      return {
        section,
        courseCode: course?.courseCode ?? 'Unknown',
        courseTitle: course?.title ?? 'Unknown course',
        termLabel: term ? `${term.termCode} — ${term.name}` : 'Unknown term',
      };
    });
  }, [filteredSections, courseById, termById]);

  const totalPages = Math.ceil(resolvedSections.length / sectionsPerPage);
  const start = (currentPage - 1) * sectionsPerPage;
  const end = Math.min(start + sectionsPerPage, resolvedSections.length);
  const pageSections = resolvedSections.slice(start, end);

  const handleFilterChange = (
    key: 'search' | 'courseId' | 'termId',
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteSection.mutate(pendingDelete.id, {
      onSuccess: () => {
        sonnerToast.success('Course section deleted successfully', {
          description: pendingDelete.label,
        });
      },
      onError: (error) => {
        const message =
          error instanceof CourseSectionMutationError
            ? error.message
            : 'An unexpected error occurred. Please try again.';
        sonnerToast.error('Failed to delete course section', {
          description:
            message === 'Failed to delete course section.'
              ? 'This section may have student enrollments and cannot be deleted.'
              : message,
        });
      },
    });
    setPendingDelete(null);
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Academic Management', href: '/academic-terms' },
    { label: 'Course Sections' },
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
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Course Sections</h1>
                <p className="text-slate-400 mt-1.5 text-sm lg:text-base">Schedule course offerings within academic terms</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                  Add New Section
                </button>
              </div>
            </section>

            <section className="glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 p-5 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-1">
                  <label htmlFor="sectionSearch" className="block text-sm font-medium text-slate-300 mb-2">Search Sections</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      id="sectionSearch"
                      type="text"
                      placeholder="Search by course, section, or term..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full py-2.5 pl-10 pr-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="sectionTermFilter" className="block text-sm font-medium text-slate-300 mb-2">Term</label>
                  <select
                    id="sectionTermFilter"
                    value={filters.termId}
                    onChange={(e) => handleFilterChange('termId', e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
                  >
                    <option value="">All Terms</option>
                    {sortedTerms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.termCode} — {term.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sectionCourseFilter" className="block text-sm font-medium text-slate-300 mb-2">Course</label>
                  <select
                    id="sectionCourseFilter"
                    value={filters.courseId}
                    onChange={(e) => handleFilterChange('courseId', e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
                  >
                    <option value="">All Courses</option>
                    {sortedCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.courseCode} — {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <SectionTable
              sections={pageSections}
              currentPage={currentPage}
              totalPages={totalPages}
              start={start}
              end={end}
              total={resolvedSections.length}
              onPageChange={setCurrentPage}
              onEdit={(section) => setEditingSection(section)}
              onDelete={(section) => setPendingDelete({ id: section.id, label: `Section ${section.sectionNumber}` })}
              isLoading={sectionsQuery.isLoading || deleteSection.isPending}
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

      <SectionFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingSection && (
        <SectionFormModal
          isOpen={true}
          section={editingSection}
          onClose={() => setEditingSection(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!pendingDelete}
        title="Delete course section"
        description={
          pendingDelete
            ? `${pendingDelete.label} will be permanently deleted. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        isConfirming={deleteSection.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
