
import React from 'react';
import { MeetingMinute } from '../types';

interface NotulensiCardProps {
  item: MeetingMinute;
}

const NotulensiCard: React.FC<NotulensiCardProps> = ({ item }) => {
  return (
    <div className="flex flex-col group cursor-pointer relative py-2">
      <div className="flex justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-sm font-bold text-[#e3e3e3] group-hover:text-[#a8c7fa] transition-colors">{item.title}</span>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-[#303134] rounded-full hidden sm:block"></span>
            <span className="text-[10px] text-[#c4c7c5] font-black uppercase tracking-widest">
              RECORDED BY {item.author.split(' (')[0]}
            </span>
          </div>
        </div>
        <div className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-[0.2em] bg-[#1a1c1e] px-4 py-1.5 rounded-full border border-[#303134] shrink-0">
          {item.date}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-3xl md:text-5xl font-light text-[#c4c7c5] leading-tight group-hover:text-white transition-colors line-clamp-3">
          {item.summary || "Ringkasan agenda belum diinput oleh pembuat notulen."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest mt-auto">
         {item.fileLink && item.fileLink !== '#' && (
           <a 
             href={item.fileLink} 
             target="_blank" 
             onClick={e => e.stopPropagation()}
             className="text-[#a8c7fa] hover:text-white flex items-center gap-2 py-2 px-4 bg-[#a8c7fa]/10 border border-[#a8c7fa]/30 rounded-2xl shadow-xl shadow-blue-500/5 transition-all"
           >
             <i className="fas fa-file-pdf text-sm"></i> DOWNLOAD PDF NOTULENSI
           </a>
         )}
         <span className="flex items-center gap-2 py-1"><i className="fas fa-users-viewfinder"></i> OFFICIAL RECORD</span>
      </div>
    </div>
  );
};

export default NotulensiCard;
