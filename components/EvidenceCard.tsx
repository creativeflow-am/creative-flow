
import React from 'react';
import { WeeklyReport } from '../types';

interface EvidenceCardProps {
  evidence: WeeklyReport;
}

const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence }) => {
  return (
    <div className="flex flex-col group cursor-pointer py-2">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#e3e3e3] group-hover:text-[#a8c7fa] transition-colors">{evidence.activityTitle}</span>
          <span className="text-xs text-[#c4c7c5]">{evidence.category} | {evidence.ambassadorName.split(' ')[0]}</span>
        </div>
        <div className="text-[10px] font-bold text-[#c4c7c5] uppercase tracking-widest px-3 py-1 bg-[#1a1c1e] rounded-full border border-[#303134]">
          {evidence.date}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-3xl md:text-4xl font-light text-[#c4c7c5] leading-snug italic group-hover:text-white transition-colors">
          "{evidence.description}"
        </p>
      </div>

      <div className="flex items-center gap-6 text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest">
         {evidence.pdfUrl && (
           <a 
             href={evidence.pdfUrl} 
             target="_blank" 
             onClick={e => e.stopPropagation()}
             className="text-red-400 hover:text-red-300 flex items-center gap-2 p-2 bg-red-400/10 rounded-xl border border-red-400/20 shadow-lg shadow-red-500/5 transition-all"
           >
             <i className="fas fa-file-pdf text-base"></i> LIHAT DOKUMEN PDF
           </a>
         )}
         <span className="flex items-center gap-2"><i className="fas fa-map-marker-alt"></i> {evidence.location || 'Lokasi Kampus'}</span>
         <span className="text-[#a8c7fa] flex items-center gap-2 bg-[#a8c7fa]/5 px-3 py-1 rounded-full border border-[#a8c7fa]/20"><i className="fas fa-check-circle"></i> TERVALIDASI</span>
      </div>
    </div>
  );
};

export default EvidenceCard;
