'use client';

import { formatStudentName, useStudentContactDetails, StudentDto } from '@/api/students';

interface ViewStudentModalProps {
  student: StudentDto;
  onClose: () => void;
}

const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

function getInitials(student: StudentDto): string {
  const first = student.firstName.charAt(0);
  const last = student.lastName.charAt(0);
  return `${first}${last}`.toUpperCase();
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-sm text-slate-200 mt-1">{value || '—'}</div>
    </div>
  );
}

export default function ViewStudentModal({ student, onClose }: ViewStudentModalProps) {
  const { data, isLoading } = useStudentContactDetails(student.id);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="modal-backdrop absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
      />
      <div className="modal-panel relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl shadow-indigo-900/40 overflow-hidden z-10">
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-700/50 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-900/50 shrink-0">
              {getInitials(student)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{formatStudentName(student)}</h2>
              {student.studentNumber && (
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{student.studentNumber}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {/* Student Information */}
          <section>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-4">Student Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Student Number" value={student.studentNumber} />
              <DetailItem label="Date of Birth" value={formatDate(student.dateOfBirth)} />
              <DetailItem label="Gender" value={student.gender} />
              <DetailItem label="Nationality" value={student.nationality} />
              <DetailItem label="Date Created" value={formatDate(student.createdAt)} />
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-4">Contact Information</h3>
            {isLoading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-5 h-5 rounded-full border-2 border-slate-600 border-t-indigo-500 animate-spin"></div>
                <span className="text-sm text-slate-400">Loading contact information...</span>
              </div>
            ) : data?.contactInfo ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <DetailItem label="Email" value={data.contactInfo.email} />
                <DetailItem label="Phone" value={data.contactInfo.phone} />
                <DetailItem label="Address Line 1" value={data.contactInfo.addressLine1} />
                <DetailItem label="Address Line 2" value={data.contactInfo.addressLine2} />
                <DetailItem label="City" value={data.contactInfo.city} />
                <DetailItem label="State" value={data.contactInfo.state} />
                <DetailItem label="Postal Code" value={data.contactInfo.postalCode} />
                <DetailItem label="Country" value={data.contactInfo.country} />
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-4">No contact information recorded.</div>
            )}
          </section>

          {/* Emergency Contacts */}
          <section>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-4">Emergency Contact</h3>
            {isLoading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-5 h-5 rounded-full border-2 border-slate-600 border-t-indigo-500 animate-spin"></div>
                <span className="text-sm text-slate-400">Loading emergency contacts...</span>
              </div>
            ) : data?.emergencyContact && data.emergencyContact.length > 0 ? (
              <div className="space-y-3">
                {data.emergencyContact.map((contact) => (
                  <div
                    key={contact.id}
                    className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{contact.name}</span>
                        {contact.isPrimary && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{contact.relationship}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <DetailItem label="Phone" value={contact.phone} />
                      <DetailItem label="Email" value={contact.email} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 py-4">No emergency contact recorded.</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}