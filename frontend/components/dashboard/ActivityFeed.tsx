'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import { activities } from '@/lib/data';
import { StudentActivity } from '@/lib/types';

type FilterType = 'all' | 'created' | 'updated' | 'archived';

export default function ActivityFeed() {
  const [activeTab, setActiveTab] = useState<FilterType>('all');

  const filteredActivities = activeTab === 'all' 
    ? activities 
    : activities.filter(a => a.type === activeTab);

  const getBadgeStyles = (type: StudentActivity['type']) => {
    switch (type) {
      case 'created':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'updated':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'archived':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return '';
    }
  };

  const tabs: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Created', value: 'created' },
    { label: 'Updated', value: 'updated' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <section className="glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" /> Recent Activity
          </h2>
          <p className="text-xs text-slate-400 mt-1">Chronological log of system events</p>
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-800/60 border border-slate-700/50 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === tab.value
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/40 text-xs text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Student</th>
              <th className="px-6 py-3 text-left font-semibold">Action</th>
              <th className="px-6 py-3 text-left font-semibold">Performed By</th>
              <th className="px-6 py-3 text-left font-semibold">Timestamp</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm">
                  No activities found for this filter.
                </td>
              </tr>
            ) : (
              filteredActivities.map((activity, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`w-2.5 h-2.5 rounded-full ${activity.color} pulse-soft inline-block`}></span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{activity.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{activity.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg ${getBadgeStyles(activity.type)}`}>
                      {activity.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{activity.by}</td>
                  <td className="px-6 py-4 text-slate-400">{activity.time}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" aria-label="View">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
        <span>
          Showing <span className="text-slate-200 font-semibold">{filteredActivities.length}</span> of{' '}
          <span className="text-slate-200 font-semibold">128</span> activities
        </span>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            Previous
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white font-semibold">1</button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            2
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            3
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            Next
          </button>
        </div>
      </div>
    </section>
  );
}