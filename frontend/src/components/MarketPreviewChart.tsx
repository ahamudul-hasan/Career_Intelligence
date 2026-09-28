import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import { BarChart3 } from 'lucide-react';

const SAMPLE_MARKET_DATA = [
  { skill: 'Python', percentage: 78, category: 'Language', fill: '#06b6d4' },
  { skill: 'SQL / MySQL', percentage: 65, category: 'Database', fill: '#3b82f6' },
  { skill: 'Docker', percentage: 54, category: 'Infrastructure', fill: '#6366f1' },
  { skill: 'FastAPI / Flask', percentage: 48, category: 'Framework', fill: '#8b5cf6' },
  { skill: 'Git / CI/CD', percentage: 42, category: 'Tool', fill: '#a855f7' },
  { skill: 'AWS / Cloud', percentage: 39, category: 'Cloud', fill: '#ec4899' },
];

export const MarketPreviewChart: React.FC = () => {
  return (
    <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Deterministic Market Analytics Engine (Preview)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactive visualization of real-time skill demand frequencies
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <span>Recharts + Vite Active</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={SAMPLE_MARKET_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="skill" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              unit="%" 
              domain={[0, 100]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-slate-950 p-3 shadow-xl border border-slate-700 text-xs">
                      <p className="font-bold text-white">{data.skill}</p>
                      <p className="text-cyan-400 mt-1">
                        Demand: <span className="font-mono font-semibold">{data.percentage}%</span> of jobs
                      </p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Category: {data.category}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
              {SAMPLE_MARKET_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[11px] text-slate-500 mt-4 text-center">
        * Market percentages will be computed deterministically in Python/SQL without LLM invention.
      </p>
    </div>
  );
};
