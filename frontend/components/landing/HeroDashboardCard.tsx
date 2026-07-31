import { TrendingUp } from "lucide-react";

export default function HeroDashboardCard() {
  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-400">Current GPA</p>
          <p className="text-3xl font-bold text-slate-200">3.85</p>
        </div>
        <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-green-400" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-slate-700 rounded-full w-full" />
        <div className="h-3 bg-indigo-900/50 rounded-full w-3/4" />
        <div className="h-3 bg-purple-900/50 rounded-full w-5/6" />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-slate-700/50 p-3 rounded-xl text-center">
          <p className="text-xs text-slate-400">Credits</p>
          <p className="text-sm font-bold text-slate-300">92</p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-xl text-center">
          <p className="text-xs text-slate-400">Courses</p>
          <p className="text-sm font-bold text-slate-300">5</p>
        </div>
        <div className="bg-slate-700/50 p-3 rounded-xl text-center">
          <p className="text-xs text-slate-400">Alerts</p>
          <p className="text-sm font-bold text-red-400">1</p>
        </div>
      </div>
    </div>
  );
}