
import React from 'react';
import { AmbassadorProfile } from '../types';

interface MemberCardProps {
  member: AmbassadorProfile;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!member.whatsapp) return;
    const cleanPhone = member.whatsapp.startsWith('0') ? '62' + member.whatsapp.slice(1) : member.whatsapp;
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!member.email) return;
    window.open(`mailto:${member.email}`, '_blank');
  };

  return (
    <div className="bg-[#1a1c1e] p-6 rounded-2xl border border-[#303134] hover:border-[#a8c7fa]/40 transition-all group shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#a8c7fa]/10 rounded-2xl flex items-center justify-center text-[#a8c7fa] border border-[#a8c7fa]/20 shadow-inner">
            <i className="fas fa-user-graduate text-xl"></i>
          </div>
          <div>
            <h4 className="text-white font-bold text-base leading-tight group-hover:text-[#a8c7fa] transition-colors">{member.name}</h4>
            <p className="text-[10px] text-[#c4c7c5] font-black uppercase tracking-widest mt-1">NIM: {member.nim || '-'}</p>
          </div>
        </div>
        <div className="bg-[#a8c7fa]/10 px-3 py-1 rounded-full border border-[#a8c7fa]/20">
          <span className="text-[9px] font-black text-[#a8c7fa] uppercase tracking-widest">SMT {member.semester}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <p className="text-[8px] font-black text-[#c4c7c5] uppercase tracking-[0.2em]">Fakultas</p>
          <p className="text-xs text-[#e3e3e3] font-medium truncate">{member.faculty}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[8px] font-black text-[#c4c7c5] uppercase tracking-[0.2em]">Program Studi</p>
          <p className="text-xs text-[#e3e3e3] font-medium truncate">{member.major}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={handleWhatsApp}
          disabled={!member.whatsapp}
          className="flex-1 py-3 bg-[#111314] hover:bg-green-500/10 border border-[#303134] hover:border-green-500/30 rounded-xl text-green-400 flex items-center justify-center gap-2 transition-all disabled:opacity-20"
        >
          <i className="fab fa-whatsapp text-sm"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
        </button>
        <button 
          onClick={handleEmail}
          disabled={!member.email}
          className="flex-1 py-3 bg-[#111314] hover:bg-[#a8c7fa]/10 border border-[#303134] hover:border-[#a8c7fa]/30 rounded-xl text-[#a8c7fa] flex items-center justify-center gap-2 transition-all disabled:opacity-20"
        >
          <i className="fas fa-envelope text-sm"></i>
          <span className="text-[9px] font-black uppercase tracking-widest">Email</span>
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
