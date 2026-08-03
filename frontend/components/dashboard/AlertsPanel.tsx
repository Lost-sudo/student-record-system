import { AlertTriangle } from "lucide-react";

interface AlertItem {
  color: string;
  dotColor: string;
  title: string;
  priority: string;
  description: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
}

const alerts: AlertItem[] = [
  {
    color: 'bg-red-500/10',
    dotColor: 'bg-red-400',
    title: '23 Students missing Emergency Contacts',
    priority: 'High priority',
    description: 'Required for enrollment compliance',
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-400',
  },
  {
    color: 'bg-amber-500/10',
    dotColor: 'bg-amber-400',
    title: '15 Students missing Personal Contact Info',
    priority: 'Medium priority',
    description: 'Phone or email required',
    borderColor: 'border-amber-500/50',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
  },
  {
    color: 'bg-orange-500/10',
    dotColor: 'bg-orange-400',
    title: '8 Emergency Contacts have missing phone numbers or emails',
    priority: 'Medium priority',
    description: 'Contact details incomplete',
    borderColor: 'border-orange-500/50',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-400',
  },
];

export default function AlertsPanel() {
  return (
    <div id="alerts" className="xl:col-span-3 glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-700/50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Action Required: Incomplete Records
          </h2>
          <p className="text-xs text-slate-400 mt-1">Records that need your immediate attention</p>
        </div>
        <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">View all →</a>
      </div>
      <div className="divide-y divide-slate-700/50">
        {alerts.map((alert, idx) => (
          <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/40 transition-colors">
            <div className={`w-10 h-10 rounded-xl ${alert.color} border border-slate-700/50 flex items-center justify-center shrink-0`}>
              <span className={`w-2.5 h-2.5 rounded-full ${alert.dotColor} ${idx === 0 ? 'pulse-soft' : ''}`}></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{alert.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">{alert.priority} • {alert.description}</div>
            </div>
            <button className={`shrink-0 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-600 hover:${alert.borderColor} hover:${alert.bgColor} hover:${alert.textColor} text-slate-300 transition-colors`}>
              Review List
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}