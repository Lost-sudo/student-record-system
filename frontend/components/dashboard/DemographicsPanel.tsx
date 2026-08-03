'use client';

import { useEffect, useRef } from 'react';
import Chart, { TooltipItem } from 'chart.js/auto';
import { ChartPie } from 'lucide-react';

export default function DemographicsPanel() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

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
          data: [45, 53, 2],
          backgroundColor: ['#6366f1', '#06b6d4', '#64748b'],
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
              label: (ctx: TooltipItem<'doughnut'>) => ` ${ctx.label}: ${ctx.parsed}%`
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
  }, []);

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
            <span className="text-xs text-slate-500">Total: 1,245</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative w-28 h-28 shrink-0">
              <canvas ref={chartRef}></canvas>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>Male
                </span>
                <span className="font-semibold text-white">45%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>Female
                </span>
                <span className="font-semibold text-white">53%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>Undisclosed
                </span>
                <span className="font-semibold text-white">2%</span>
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
                <span className="font-semibold text-white">850</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-indigo-500 to-indigo-400 rounded-full" style={{ width: '68.2%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-slate-300">International</span>
                <span className="font-semibold text-white">395</span>
              </div>
              <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-cyan-500 to-cyan-400 rounded-full" style={{ width: '31.8%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}