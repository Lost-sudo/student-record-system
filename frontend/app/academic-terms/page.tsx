'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast as sonnerToast } from 'sonner';
import {
  AcademicTermDto,
  AcademicTermMutationError,
  useAcademicTerms,
  useDeleteAcademicTerm,
  useUpdateAcademicTerm,
} from '@/api/academicTerms';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import AmbientBackground from '@/components/ui/AmbientBackground';
import ConfirmModal from '@/components/ui/ConfirmModal';
import TermFormModal from '@/components/academic/TermFormModal';
import TermTable from '@/components/academic/TermTable';

interface PendingDelete {
  id: string;
  label: string;
}

export default function AcademicTermsPage() {
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<AcademicTermDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const termsPerPage = 10;

  const termsQuery = useAcademicTerms({ limit: 100 });
  const deleteTerm = useDeleteAcademicTerm();
  const updateTerm = useUpdateAcademicTerm();

  useEffect(() => {
    if (termsQuery.isError) {
      sonnerToast.error('Failed to load academic terms', {
        description: 'Please try again later.',
      });
    }
  }, [termsQuery.isError]);

  const terms = useMemo(() => termsQuery.data?.data ?? [], [termsQuery.data]);

  const filteredTerms = useMemo(() => {
    return terms.filter((term) => {
      const matchesSearch =
        !filters.search ||
        term.termCode.toLowerCase().includes(filters.search.toLowerCase()) ||
        term.name.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus =
        !filters.status ||
        (filters.status === 'active' ? term.isActive : !term.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [terms, filters]);

  const totalPages = Math.ceil(filteredTerms.length / termsPerPage);
  const start = (currentPage - 1) * termsPerPage;
  const end = Math.min(start + termsPerPage, filteredTerms.length);
  const pageTerms = filteredTerms.slice(start, end);

  const handleFilterChange = (key: 'search' | 'status', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleToggleActive = (term: AcademicTermDto) => {
    updateTerm.mutate(
      { id: term.id, payload: { isActive: !term.isActive } },
      {
        onSuccess: () =>
          sonnerToast.success(!term.isActive ? 'Term activated' : 'Term deactivated', {
            description: `${term.termCode} — ${term.name}`,
          }),
        onError: () =>
          sonnerToast.error('Failed to update term status', {
            description: 'An unexpected error occurred. Please try again.',
          }),
      },
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteTerm.mutate(pendingDelete.id, {
      onSuccess: () => {
        sonnerToast.success('Academic term deleted successfully', {
          description: pendingDelete.label,
        });
      },
      onError: (error) => {
        const message =
          error instanceof AcademicTermMutationError
            ? error.message
            : 'An unexpected error occurred. Please try again.';
        sonnerToast.error('Failed to delete academic term', {
          description:
            message === 'Failed to delete academic term.'
              ? 'This term may be referenced by course sections or curricula and cannot be deleted.'
              : message,
        });
      },
    });
    setPendingDelete(null);
  };

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Academic Management', href: '/academic-terms' },
    { label: 'Academic Terms' },
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
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">Academic Terms</h1>
                <p className="text-slate-400 mt-1.5 text-sm lg:text-base">Manage academic terms and their schedules</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-6 py-3 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                  Add New Term
                </button>
              </div>
            </section>

            <section className="glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 p-5 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="termSearch" className="block text-sm font-medium text-slate-300 mb-2">Search Terms</label>
                  <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      id="termSearch"
                      type="text"
                      placeholder="Search by term code or name..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full py-2.5 pl-10 pr-4 bg-slate-800 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-slate-700 transition duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="termStatusFilter" className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    id="termStatusFilter"
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

            <TermTable
              terms={pageTerms}
              currentPage={currentPage}
              totalPages={totalPages}
              start={start}
              end={end}
              total={filteredTerms.length}
              onPageChange={setCurrentPage}
              onToggleActive={handleToggleActive}
              onEdit={(term) => setEditingTerm(term)}
              onDelete={(term) =>
                setPendingDelete({ id: term.id, label: `${term.termCode} — ${term.name}` })
              }
              isLoading={termsQuery.isLoading || updateTerm.isPending}
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

      <TermFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingTerm && (
        <TermFormModal
          isOpen={true}
          term={editingTerm}
          onClose={() => setEditingTerm(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!pendingDelete}
        title="Delete academic term"
        description={
          pendingDelete
            ? `${pendingDelete.label} will be permanently deleted. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        isConfirming={deleteTerm.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
