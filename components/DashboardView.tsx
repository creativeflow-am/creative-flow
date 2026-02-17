
import React from 'react';
import { SocialMetric } from '../types';

interface DashboardViewProps {
  stats: {
    content: number;
    evidence: number;
    minutes: number;
    schedule: number;
  };
  trendData: number[];
  performance: SocialMetric[];
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const DashboardView: React.FC<DashboardViewProps> = ({ stats, trendData, performance }) => {
  const maxTrend = Math.max(...trendData, 5);
  const height = 160;
  const width = 800;
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);

  const points = trendData.map((val, i) => {
    const x = padding + (i * (chartWidth / 11));
    const y = (height - padding) - (val / maxTrend * chartHeight);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Konten', val: stats.content, color: 'text-[#a8c7fa]', icon: 'fa-clapperboard' },
          { label: 'Laporan Progres', val: stats.evidence, color: 'text-[#c6a8fa]', icon: 'fa-file-signature' },
          { label: 'Notulensi Rapat', val: stats.minutes, color: 'text-[#fae2a8]', icon: 'fa-book' },
          { label: 'Penugasan Aktif', val: stats.schedule, color: 'text-[#ff9e9e]', icon: 'fa-calendar-check' },
        ].map((item, i) => (
          <div key={i} className="p-5 bg-[#1a1c1e] border border-[#303134] rounded-2xl shadow-lg">
            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${item.color} mb-3`}>
              <i className={`fas ${item.icon} text-xs`}></i>
            </div>
            <p className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest mb-1">{item.label}</p>
            <p className={`text-3xl font-light ${item.color}`}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* Main Activity Trend */}
      <div className="p-8 bg-[#1a1c1e] rounded-3xl border border-[#303134] shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#a8c7fa]/5 rounded-full blur-3xl"></div>
        <div className="mb-10">
          <h3 className="text-xs font-black text-[#a8c7fa] uppercase tracking-[0.3em] mb-1">Combined Team Activity Trend</h3>
          <p className="text-[11px] text-[#c4c7c5] font-medium tracking-tight">Akumulasi seluruh aktivitas (Konten, Laporan, Rapat, Jadwal) 2024</p>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar py-4">
          <div className="min-w-[700px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-xl">
              <defs>
                <linearGradient id="dashGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a8c7fa" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#a8c7fa" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#303134" strokeWidth="1" />
              <polyline points={areaPoints} fill="url(#dashGradient)" />
              <polyline points={points} fill="none" stroke="#a8c7fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              {trendData.map((val, i) => {
                const x = padding + (i * (chartWidth / 11));
                const y = (height - padding) - (val / maxTrend * chartHeight);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="4" fill="#1a1c1e" stroke="#a8c7fa" strokeWidth="2" />
                    <text x={x} y={height - 10} fill="#c4c7c5" fontSize="10" fontWeight="bold" textAnchor="middle" className="uppercase tracking-tighter">
                      {MONTH_LABELS[i]}
                    </text>
                    {val > 0 && <text x={x} y={y - 12} fill="#e3e3e3" fontSize="10" fontWeight="black" textAnchor="middle">{val}</text>}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Social Media Pulse Mini */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-[#1a1c1e] rounded-2xl border border-[#303134]">
          <h4 className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest mb-6">Social Media Impact</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#e3e3e3]">Total Reach</span>
              <span className="text-xl font-light text-[#a8c7fa]">{(performance.reduce((a,b) => a + b.views, 0) / 1000).toFixed(1)}K</span>
            </div>
            <div className="h-1.5 w-full bg-[#111314] rounded-full overflow-hidden">
              <div className="h-full bg-[#a8c7fa] w-[70%]"></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#e3e3e3]">Avg. Engagement</span>
              <span className="text-xl font-light text-[#c6a8fa]">{(performance.reduce((a,b) => a + b.likes, 0) / performance.length).toFixed(0)}</span>
            </div>
            <div className="h-1.5 w-full bg-[#111314] rounded-full overflow-hidden">
              <div className="h-full bg-[#c6a8fa] w-[55%]"></div>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-[#1a1c1e] rounded-2xl border border-[#303134] flex flex-col justify-center items-center text-center">
           <i className="fas fa-shield-heart text-3xl text-green-400/40 mb-3"></i>
           <p className="text-xs text-[#c4c7c5] font-medium max-w-[200px]">Sistem CreativeFlow berjalan optimal. Seluruh data terenkripsi dan tervalidasi.</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
