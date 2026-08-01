import { Sidebar, Header, KPICards, AlertsPanel, DemographicsPanel, ActivityFeed } from '@/components/dashboard';
import { AmbientBackground } from '@/components/ui';

export default function DashboardPage() {
  return (
    <div className="text-slate-200 min-h-screen">
      <AmbientBackground />
      
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        
        <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
          <Header />
          
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto w-full">
            {/* Welcome Section */}
            <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                  Good morning, <span className="text-gradient">Alex</span>.
                </h1>
                <p className="text-slate-400 mt-1.5 text-sm lg:text-base">
                  Here is the overview for today,{' '}
                  <span className="text-slate-300 font-medium">Friday, July 31, 2026</span>.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button className="px-6 py-3 text-sm font-semibold rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Add New Student
                </button>
                <button className="px-6 py-3 text-sm font-semibold rounded-xl border border-slate-600 hover:border-slate-500 hover:bg-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 active:scale-[0.98] transition-all duration-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Students
                </button>
              </div>
            </section>

            {/* KPI Cards */}
            <KPICards />

            {/* Middle Row: Alerts + Demographics */}
            <section className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-8">
              <AlertsPanel />
              <DemographicsPanel />
            </section>

            {/* Activity Feed */}
            <ActivityFeed />

            {/* Footer */}
            <footer className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <div>© 2026 SRS Portal — Student Registrar System</div>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
                <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-soft"></span>
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