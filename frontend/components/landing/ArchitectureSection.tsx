import ComparisonCard from "./ComparisonCard";

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">The end of siloed data</h2>
          <p className="mt-4 text-lg text-slate-400">Stop forcing your admin staff to copy-paste between five different systems.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ComparisonCard
            title="Legacy Monolith"
            icon={<svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
            iconBg="bg-red-500/20"
            borderClass="bg-slate-800/50 border border-slate-700"
            isNegative
            items={[
              "Crashes during peak registration week",
              "Academic and Financial data don't talk",
              "Clunky, text-heavy interfaces",
              "Overnight batch processing for grades",
            ]}
          />

          <ComparisonCard
            title="Nexus Microservices"
            icon={<svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
            iconBg="bg-indigo-500/20"
            borderClass="bg-white/5 border border-indigo-500/30"
            shadowClass="shadow-xl shadow-indigo-500/10"
            isDark
            items={[
              "Auto-scales to handle any traffic spikes",
              "Unified API connects LMS, Billing, & ID cards",
              "Mobile-first, consumer-grade UI/UX",
              "Real-time data synchronization instantly",
            ]}
          />
        </div>
      </div>
    </section>
  );
}