'use client';

import { useEffect, useMemo, useRef } from 'react';
import Chart, { TooltipItem } from 'chart.js/auto';
import { ChartPie } from 'lucide-react';
import { useStudentStats } from '@/api/students';

const GENDER_COLORS = ['#6366f1', '#06b6d4', '#64748b'];

export default function DemographicsPanel() {
  const statsQuery = useStudentStats();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const genderCounts = useMemo(() => {
    let male = 0;
    let female = 0;
    let undisclosed = 0;

    for (const entry of statsQuery.data?.genderDistribution ?? []) {
      const key = entry.gender?.trim().toLowerCase();
      if (key === 'male') {
        male += entry.count;
      } else if (key === 'female') {
        female += entry.count;
      } else {
        undisclosed += entry.count;
      }
    }

    return { male, female, undisclosed };
  }, [statsQuery.data]);

  const totalActive = statsQuery.data?.totalActiveStudents ?? 0;

  const nationalityCounts = useMemo(() => {
    let local = 0;
    let international = 0;
    let undisclosed = 0;

    for (const entry of statsQuery.data?.nationalityDistribution ?? []) {
      const key = entry.nationality?.trim().toLowerCase();
      if (key === 'filipino') {
        local += entry.count;
      } else if (!key) {
        undisclosed += entry.count;
      } else {
        international += entry.count;
      }
    }

    return { local, international, undisclosed };
  }, [statsQuery.data]);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Male', 'Female', 'Undisclosed'],
        datasets: [{
          data: [genderCounts.male, genderCounts.female, genderCounts.undisclosed],
          backgroundColor: GENDER_COLORS,
          borderColor: '#1e293b',
          borderWidth: 3,
          hoverOffset: 6,
        }]
      },
      options: {
        cutout: '68%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            borderWidth: 1,
            titleColor: '#e2e8f0',
            bodyColor: '#cbd5e1',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (ctx: TooltipItem<'doughnut'>) => ` ${ctx.label}: ${ctx.parsed}`
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [genderCounts]);

  const toPercent = (value: number): number =>
    totalActive > 0 ? Math.round((value / totalActive) * 100) : 0;

  return (
    <div className="xl:col-span-2 glass rounded-3xl border border-slate-700/50 shadow-2xl shadow-indigo-900/20 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ChartPie className="w-5 h-5 text-indigo-400" /> Student Demographics
        </h2>
        <p className="text-xs text-slate-400 mt-1">Quick snapshot of the student body composition</p>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-300">Gender Distribution</div>
            <span className="text-xs text-slate-500">Total: {totalActive.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative w-28 h-28 shrink-0">
              <canvas ref={chartRef}></canvas>
              {totalActive === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500">No data</div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>Male
                </span>
                <span className="font-semibold text-white">{toPercent(genderCounts.male)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>Female
                </span>
                <span className="font-semibold text-white">{toPercent(genderCounts.female)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>Undisclosed
                </span>
                <span className="font-semibold text-white">{toPercent(genderCounts.undisclosed)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/50 pt-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-300">Top Nationalities</div>
            <span className="text-xs text-slate-500">Local vs International</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-slate-300">Local</span>
                <span className="font-semibold text-white">{nationalityCounts.local.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-indigo-500 to-indigo-400 rounded-full" style={{ width: `${toPercent(nationalityCounts.local)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-slate-300">International</span>
                <span className="font-semibold text-white">{nationalityCounts.international.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-cyan-500 to-cyan-400 rounded-full" style={{ width: `${toPercent(nationalityCounts.international)}%` }}></div>
              </div>
            </div>
            {nationalityCounts.undisclosed > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-300">Undisclosed</span>
                  <span className="font-semibold text-white">{nationalityCounts.undisclosed.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-slate-500 to-slate-400 rounded-full" style={{ width: `${toPercent(nationalityCounts.undisclosed)}%` }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
