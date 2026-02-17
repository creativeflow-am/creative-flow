
import React from 'react';
import { ScheduleAssignment } from '../types';

interface ScheduleCardProps {
  item: ScheduleAssignment;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item }) => {
  const priorityColor = {
    Low: 'border-green-500/30 text-green-400',
    Medium: 'border-yellow-500/30 text-yellow-400',
    High: 'border-red-500/30 text-red-400'
  }[item.priority];

  const ambassadorNames = item.ambassadorNames.map(n => n.split(' (')[0]).join(', ');

  return (
    <div className="flex flex-col group relative py-4 border-b border-[#303134]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#a8c7fa]/10 rounded-full flex items-center justify-center text-[#a8c7fa] border border-[#a8c7fa]/20">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div>
            <span className="text-sm font-bold text-[#e3e3e3] block">{item.taskTitle}</span>
            <span className="text-[10px] text-[#c4c7c5] font-black uppercase tracking-widest">PJ: {ambassadorNames}</span>
          </div>
        </div>
        <div className={`text-[9px] font-black uppercase tracking-widest border px-3 py-1 rounded-full ${priorityColor}`}>
          {item.priority} Priority
        </div>
      </div>

      <div className="mb-4">
        <p className="text-2xl md:text-3xl font-light text-[#c4c7c5] leading-tight group-hover:text-white transition-colors">
          {item.description || "Tugas operasional rutin duta kampus."}
        </p>
      </div>

      <div className="flex items-center gap-6 text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest">
         <span className="flex items-center gap-2"><i className="fas fa-clock text-[#a8c7fa]"></i> PELAKSANAAN: {item.date}</span>
         <span className="text-green-400 flex items-center gap-2 px-3 py-1 bg-green-400/5 rounded-full border border-green-400/20"><i className="fas fa-check-double"></i> AKTIF</span>
      </div>
    </div>
  );
};

export default ScheduleCard;
