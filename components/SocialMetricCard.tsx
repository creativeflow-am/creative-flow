
import React from 'react';
import { SocialMetric } from '../types';

interface SocialMetricCardProps {
  metric: SocialMetric;
}

const SocialMetricCard: React.FC<SocialMetricCardProps> = ({ metric }) => {
  const maxViews = 100000;
  const viewWidth = Math.min((metric.views / maxViews) * 100, 100);

  return (
    <div className="bg-[#1a1c1e] p-6 rounded-2xl border border-[#303134] hover:border-[#a8c7fa]/50 transition-all group">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#a8c7fa]/10 rounded-xl flex items-center justify-center text-[#a8c7fa] font-black text-lg border border-[#a8c7fa]/20">
            {metric.month}
          </div>
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Laporan Performa Bulanan</h4>
            <p className="text-[10px] text-[#c4c7c5] font-bold uppercase tracking-widest">Tahun Anggaran 2024</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-[9px] font-black text-[#c4c7c5] uppercase tracking-widest mb-1">Views</p>
            <p className="text-xl font-light text-[#e3e3e3]">{(metric.views / 1000).toFixed(1)}K</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-[#c4c7c5] uppercase tracking-widest mb-1">Likes</p>
            <p className="text-xl font-light text-[#a8c7fa]">{metric.likes}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-[#c4c7c5] uppercase tracking-widest mb-1">Comm.</p>
            <p className="text-xl font-light text-[#c6a8fa]">{metric.comments}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[9px] font-black text-[#c4c7c5] uppercase tracking-[0.2em]">Traffic Volume</span>
          <span className="text-[10px] text-[#a8c7fa] font-black">{(metric.views/1000).toFixed(0)}% OF GOAL</span>
        </div>
        <div className="h-2 w-full bg-[#111314] rounded-full overflow-hidden border border-[#303134]">
           <div 
             className="h-full bg-gradient-to-r from-[#a8c7fa] to-[#c6a8fa] transition-all duration-1000 shadow-[0_0_10px_#a8c7fa40]"
             style={{ width: `${viewWidth}%` }}
           ></div>
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-4 border-t border-[#303134] pt-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-[#111314] rounded-full text-[9px] font-black text-[#c4c7c5] tracking-widest">
          <i className="fas fa-share-nodes text-[#fae2a8]"></i> {metric.shares} SHARES
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#111314] rounded-full text-[9px] font-black text-green-400 tracking-widest">
          <i className="fas fa-arrow-trend-up"></i> +{(metric.likes / 10).toFixed(0)}% TREND
        </div>
      </div>
    </div>
  );
};

export default SocialMetricCard;
