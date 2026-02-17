
import React, { useState } from 'react';
import { ContentItem, ContentStatus } from '../types';
import { WORKFLOW } from '../constants';
import { optimizeCaption } from '../services/geminiService';

interface ContentCardProps {
  item: ContentItem;
  onStatusChange?: (id: string, newStatus: ContentStatus) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onStatusChange }) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const statusConfig = WORKFLOW.find(w => w.status === item.status) || WORKFLOW[0];

  const handleAiOptimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOptimizing(true);
    try {
      const result = await optimizeCaption(item.title, item.caption, item.platform);
      setAiResponse(result);
    } catch (err) {
      setAiResponse("Terjadi kesalahan sistem.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onStatusChange) {
      onStatusChange(item.id, e.target.value as ContentStatus);
    }
  };

  return (
    <div className="flex flex-col group cursor-pointer relative">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#e3e3e3]">{item.title}</span>
          <span className="text-xs text-[#c4c7c5]">{item.platform} | {item.assignee.split(' (')[0]}</span>
        </div>
        
        {/* DROPDOWN STATUS ACTION */}
        <div className="relative" onClick={e => e.stopPropagation()}>
           <select 
             value={item.status} 
             onChange={handleDropdownChange}
             className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase border appearance-none outline-none cursor-pointer hover:brightness-110 transition-all ${statusConfig.color.replace('bg-', 'text-').replace('text-', 'border-')}`}
             style={{ backgroundColor: 'transparent' }}
           >
             {Object.values(ContentStatus).map(s => (
               <option key={s} value={s} className="bg-[#1a1c1e] text-white">{s.toUpperCase()}</option>
             ))}
           </select>
        </div>
      </div>

      <div className="relative mb-6">
        <p className="text-4xl md:text-5xl font-light text-[#e3e3e3] leading-tight group-hover:text-[#a8c7fa] transition-colors">
          {item.caption || "Menunggu ide kreatif dari tim produksi untuk dikembangkan lebih lanjut..."}
        </p>
      </div>

      <div className="flex items-center gap-6 text-[10px] font-bold text-[#c4c7c5] uppercase tracking-widest overflow-x-auto no-scrollbar pb-2">
         <span className="flex items-center gap-2 shrink-0"><i className="fas fa-calendar"></i> Deadline: {item.deadline || '-'}</span>
         <a href={item.driveLink} target="_blank" className="flex items-center gap-2 hover:text-[#a8c7fa] shrink-0" onClick={e => e.stopPropagation()}><i className="fas fa-link"></i> Google Drive</a>
         <button 
           onClick={handleAiOptimize}
           disabled={isOptimizing}
           className="text-[#a8c7fa] hover:underline flex items-center gap-2 disabled:opacity-50 shrink-0"
         >
           {isOptimizing ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-magic"></i>}
           Optimasi AI
         </button>
      </div>

      {aiResponse && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setAiResponse(null)}>
           <div className="bg-[#1a1c1e] max-w-2xl w-full p-8 rounded-2xl border border-[#303134] shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#a8c7fa] font-bold flex items-center gap-2"><i className="fas fa-magic"></i> Hasil Optimasi Gemini</h3>
                <button onClick={() => setAiResponse(null)} className="text-[#c4c7c5] hover:text-white"><i className="fas fa-times"></i></button>
              </div>
              <div className="text-[#e3e3e3] text-sm leading-relaxed whitespace-pre-wrap font-mono bg-[#111314] p-6 rounded-xl border border-[#303134]">
                {aiResponse}
              </div>
              <p className="text-[10px] text-[#c4c7c5] italic">*Salin teks untuk digunakan.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ContentCard;
