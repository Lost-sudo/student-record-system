'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast as sonnerToast } from 'sonner';
import {
  CurriculumVersionDto,
  CurriculumVersionMutationError,
  useCurriculumVersions,
  useDeleteCurriculumVersion,
  useUpdateCurriculumVersion,
} from '@/api/curriculumVersions';
import { useAcademicPrograms } from '@/api/academicPrograms';
import { useAcademicTerms } from '@/api/academicTerms';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AmbientBackground from '@/components/ui/AmbientBackground';
import ConfirmModal from '@/components/ui/ConfirmModal';
import CurriculumFormModal from '@/components/academic/CurriculumFormModal';
import CurriculumTable, { ResolvedCurriculum } from '@/components/academic/CurriculumTable';
import ManageRequirementsModal from '@/components/academic/ManageRequirementsModal';

interface PendingDelete {
  id: string;
  label: string;
}

export default function CurriculaPage() {
  const [filters, setFilters] = useState({ programId: '', termId: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<CurriculumVersionDto | null>(null);
  const [managingRequirementsFor, setManagingRequirementsFor] = useState<CurriculumVersionDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const curriculaPerPage = 10;

  const curriculaQuery = useCurriculumVersions({ limit: 100 });
  const programsQuery = useAcademicPrograms({ limit: 100 });
  const termsQuery = useAcademicTerms({ limit: 100 });
  const deleteCurriculum = useDeleteCurriculumVersion();
  const updateCurriculum = useUpdateCurriculumVersion();

  useEffect(() => {
    if (curriculaQuery.isError) {
      sonnerToast.error('Failed to load curriculum versions', {
        description: 'Please try again later.',
      });
    }
  }, [curriculaQuery.isError]);

  const curricula = useMemo(() => curriculaQuery.data?.data ?? [], [curriculaQuery.data]);
  const programs = useMemo(() => programsQuery.data?.data ?? [], [programsQuery.data]);
  const terms = useMemo(() => termsQuery.data?.data ?? [], [termsQuery.data]);

  const sortedPrograms = useMemo(
    () =>
      [...programs].sort((a, b) => a.programCode.localeCompare(b.programCode)),
    [programs],
  );

  const sortedTerms = useMemo(
    () =>
      [...terms].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      ),
    [terms],
  );

  const programById = useMemo(() => {
    const map = new Map<string, (typeof programs)[number]>();
    programs.forEach((program) => map.set(program.id, program));
    return map;
  }, [programs]);

  const termById = useMemo(() => {
    const map = new Map<string, (typeof terms)[number]>();
    terms.forEach((term) => map.set(term.id, term));
    return map;
  }, [terms]);

  const filteredCurricula = useMemo(() => {
    return curricula.filter((curriculum) => {
      const matchesProgram = !filters.programId || curriculum.programId === filters.programId;
      const matchesTerm =
        !filters.termId || curriculum.effectiveTermId === filters.termId;
      const matchesStatus =
        !filters.status ||
        (filters.status === 'active' ? curriculum.isActive : !curriculum.isActive);
      return matchesProgram && matchesTerm && matchesStatus;
    });
  }, [curricula, filters]);

  const resolvedCurricula: ResolvedCurriculum[] = useMemo(() => {
    return filteredCurricula.map((curriculum) => {
      const program = programById.get(curriculum.programId);
      const term = termById.get(curriculum.effectiveTermId);
      return {
        curriculum,
        programLabel: program ? `${program.programCode} — ${program.name}` : 'Unknown program',
        termLabel: term ? `${term.termCode} — ${term.name}` : 'Unknown term',
      };
    });
  }, [filteredCurricula, programById, termById]);

  const totalPages = Math.ceil(resolvedCurricula.length / curriculaPerPage);
  const start = (currentPage - 1) * curriculaPerPage;
  const end = Math.min(start + curriculaPerPage, resolvedCurricula.length);
  const pageCurricula = resolvedCurricula.slice(start, end);

  const handleFilterChange = (key: 'programId' | 'termId' | 'status', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleToggleActive = (curriculum: CurriculumVersionDto) => {
    updateCurriculum.mutate(
      { id: curriculum.id, payload: { isActive: !curriculum.isActive } },
      {
        onSuccess: () =>
          sonnerToast.success(!curriculum.isActive ? 'Curriculum activated' : 'Curriculum deactivated', {
            description: `v${curriculum.versionNumber}`,
          }),
        onError: () =>
          sonnerToast.error('Failed to update curriculum status', {
            description: 'An unexpected error occurred. Please try again.',
          }),
      },
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteCurriculum.mutate(pendingDelete.id, {
      onSuccess: () => {
        sonnerToast.success('Curriculum version deleted successfully', {
          description: pendingDelete.label,
        });
      },
      onError: (error) => {
        const message =
          error instanceof CurriculumVersionMutationError
            ? error.message
            : 'An unexpected error occurred. Please try again.';
        sonnerToast.error('Failed to delete curriculum version', {
          description:
            message === 'Failed to delete curriculum version.'
              ? 'This curriculum may be referenced by degree requirements or academic records and cannot be deleted.'
              : message,
        });
      },
    });
    setPendingDelete(null);
  };

  const managingProgramLabel = managingRequirementsFor
    ? (() => {
        const program = programById.get(managingRequirementsFor.programId);
        return program ? `${program.programCode} — ${program.name}` : 'Unknown program';
      })()
    : '';

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Academic Management', href: '/academic-terms' },
    { label: 'Curricula' },
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
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Curricula</h1>
                <p className="text-slate-400 mt-1.5 text-sm lg:text-base">Manage program curriculum versions and their requirements</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                  Add New Curriculum
                </button>
              </div>
            </section>

            <section className="glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 p-5 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="curriculumProgramFilter" className="block text-sm font-medium text-slate-300 mb-2">Program</label>
                  <select
                    id="curriculumProgramFilter"
                    value={filters.programId}
                    onChange={(e) => handleFilterChange('programId', e.target.value)}
                    className="w-full py-2.5 px-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
                  >
                    <option value="">All Programs</option>
                    {sortedPrograms.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.programCode} — {program.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="curriculumTermFilter" className="block text-sm font-medium text-slate-300 mb-2">Effective Term</label>
                  <select
                    id="curriculumTermFilter"
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
                  <label htmlFor="curriculumStatusFilter" className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    id="curriculumStatusFilter"
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

            <CurriculumTable
              curricula={pageCurricula}
              currentPage={currentPage}
              totalPages={totalPages}
              start={start}
              end={end}
              total={resolvedCurricula.length}
              onPageChange={setCurrentPage}
              onToggleActive={handleToggleActive}
              onEdit={(curriculum) => setEditingCurriculum(curriculum)}
              onManageRequirements={(curriculum) => setManagingRequirementsFor(curriculum)}
              onDelete={(curriculum) =>
                setPendingDelete({
                  id: curriculum.id,
                  label: `v${curriculum.versionNumber}`,
                })
              }
              isLoading={
                curriculaQuery.isLoading || updateCurriculum.isPending || deleteCurriculum.isPending
              }
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

      <CurriculumFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingCurriculum && (
        <CurriculumFormModal
          isOpen={true}
          curriculum={editingCurriculum}
          onClose={() => setEditingCurriculum(null)}
        />
      )}

      {managingRequirementsFor && (
        <ManageRequirementsModal
          isOpen={true}
          onClose={() => setManagingRequirementsFor(null)}
          curriculumId={managingRequirementsFor.id}
          versionNumber={managingRequirementsFor.versionNumber}
          totalCredits={managingRequirementsFor.totalCredits}
          programLabel={managingProgramLabel}
        />
      )}

      <ConfirmModal
        isOpen={!!pendingDelete}
        title="Delete curriculum version"
        description={
          pendingDelete
            ? `${pendingDelete.label} will be permanently deleted, including all of its degree requirements. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        isConfirming={deleteCurriculum.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
