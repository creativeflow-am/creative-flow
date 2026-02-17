
import React, { useState, useMemo } from 'react';
import { ContentStatus, Platform, ContentItem, ViewMode, MeetingMinute, AttendanceRecord, WeeklyReport, Notification, ActivityCategory, SocialMetric, ScheduleAssignment, AmbassadorProfile } from './types';
import { MOCK_DATA, MOCK_MINUTES, MOCK_REPORTS, WORKFLOW, ASSIGNEES, MOCK_SOCIAL_METRICS, AMBASSADOR_PROFILES } from './constants';
import ContentCard from './components/ContentCard';
import NotulensiCard from './components/NotulensiCard';
import AttendanceModule from './components/AttendanceModule';
import EvidenceCard from './components/EvidenceCard';
import SocialMetricCard from './components/SocialMetricCard';
import ScheduleCard from './components/ScheduleCard';
import MemberCard from './components/MemberCard';
import DashboardView from './components/DashboardView';
import Toast from './components/Toast';
import { optimizeCaption } from './services/geminiService';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('Dashboard');
  const [contentItems, setContentItems] = useState<ContentItem[]>(MOCK_DATA);
  const [minutesItems, setMinutesItems] = useState<MeetingMinute[]>(MOCK_MINUTES);
  const [reportItems, setReportItems] = useState<WeeklyReport[]>(MOCK_REPORTS);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<SocialMetric[]>(MOCK_SOCIAL_METRICS);
  const [scheduleItems, setScheduleItems] = useState<ScheduleAssignment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [activeTab, setActiveTab] = useState<ContentStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');

  // Modals state
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isAddingReport, setIsAddingReport] = useState(false);
  const [isAddingMinutes, setIsAddingMinutes] = useState(false);
  const [isAddingPerformance, setIsAddingPerformance] = useState(false);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);

  // Feature Modals
  const [isAiToolOpen, setIsAiToolOpen] = useState(false);
  const [isProdFlowOpen, setIsProdFlowOpen] = useState(false);
  const [isProofOfWorkOpen, setIsProofOfWorkOpen] = useState(false);

  // AI Studio State
  const [aiForm, setAiForm] = useState({ title: '', draft: '', platform: 'Instagram' });
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form Temp States
  const initialContentState: Partial<ContentItem> = { platform: 'Instagram', assignee: ASSIGNEES[0], title: '', caption: '', deadline: '' };
  const initialReportState: Partial<WeeklyReport> = { category: 'Sosialisasi', ambassadorName: ASSIGNEES[0], activityTitle: '', description: '', pdfUrl: '' };
  const initialMinuteState: Partial<MeetingMinute> = { author: ASSIGNEES[0], title: '', summary: '', attendees: [], fileLink: '' };
  const initialPerformanceState: SocialMetric = { month: 'Jan', likes: 0, comments: 0, views: 0, shares: 0 };
  const initialScheduleState: Partial<ScheduleAssignment> = { ambassadorNames: [], taskTitle: '', description: '', date: new Date().toISOString().split('T')[0], priority: 'Medium' };

  const [newContent, setNewContent] = useState<Partial<ContentItem>>(initialContentState);
  const [newReport, setNewReport] = useState<Partial<WeeklyReport>>(initialReportState);
  const [newMinute, setNewMinute] = useState<Partial<MeetingMinute>>(initialMinuteState);
  const [newMetric, setNewMetric] = useState<SocialMetric>(initialPerformanceState);
  const [newSchedule, setNewSchedule] = useState<Partial<ScheduleAssignment>>(initialScheduleState);

  const notify = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  // --- LOGIC: CONSOLIDATED TREND DATA FOR DASHBOARD ---
  const dashboardTrendData = useMemo(() => {
    const dataByMonth = new Array(12).fill(0);
    const allItems = [...contentItems, ...reportItems, ...minutesItems, ...scheduleItems];

    allItems.forEach(item => {
      const dateStr = (item as any).postDate || (item as any).date || '';
      if (!dateStr) return;

      let month = -1;
      if (dateStr.includes('-')) {
        month = new Date(dateStr).getMonth();
      } else if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        month = parseInt(parts[1]) - 1;
      }

      if (month >= 0 && month < 12) {
        dataByMonth[month]++;
      }
    });

    return dataByMonth;
  }, [contentItems, reportItems, minutesItems, scheduleItems]);

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (viewMode === 'Content') {
      return contentItems.filter(item => {
        const matchesStatus = activeTab === 'All' || item.status === activeTab;
        const matchesSearch = item.title.toLowerCase().includes(query) || item.caption.toLowerCase().includes(query);
        return matchesStatus && matchesSearch;
      });
    } else if (viewMode === 'Evidence') {
      return reportItems.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.activityTitle.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      });
    } else if (viewMode === 'Notulensi') {
      return minutesItems.filter(item => item.title.toLowerCase().includes(query));
    } else if (viewMode === 'Absensi') {
      return attendanceLogs.filter(log => log.name.toLowerCase().includes(query));
    } else if (viewMode === 'Jadwal') {
      return scheduleItems.filter(item =>
        item.ambassadorNames.some(name => name.toLowerCase().includes(query)) ||
        item.taskTitle.toLowerCase().includes(query)
      );
    } else if (viewMode === 'Members') {
      return AMBASSADOR_PROFILES.filter(member =>
        member.name.toLowerCase().includes(query) ||
        member.major.toLowerCase().includes(query)
      );
    }
    return [];
  }, [viewMode, contentItems, reportItems, minutesItems, attendanceLogs, scheduleItems, activeTab, searchQuery, selectedCategory]);

  const handleStatusChange = (id: string, newStatus: ContentStatus) => {
    setContentItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    notify(`Status: ${newStatus}`, "info");
  };

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    const item: ContentItem = {
      id: Date.now().toString(),
      title: newContent.title || 'Untitled',
      platform: (newContent.platform as Platform) || 'Instagram',
      status: ContentStatus.IDEATION,
      assignee: newContent.assignee || ASSIGNEES[0],
      postDate: new Date().toISOString().split('T')[0],
      deadline: newContent.deadline || new Date().toISOString().split('T')[0],
      caption: '', driveLink: '#', thumbnailLink: `https://picsum.photos/seed/${Math.random()}/400/225`, notes: ''
    };
    setContentItems([item, ...contentItems]);
    setIsAddingContent(false);
    setNewContent(initialContentState);
    notify("Konten dijadwalkan", "success");
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    const item: WeeklyReport = {
      id: Date.now().toString(),
      activityTitle: newReport.activityTitle || 'Kegiatan',
      category: (newReport.category as ActivityCategory) || 'Sosialisasi',
      description: newReport.description || '',
      ambassadorName: newReport.ambassadorName || ASSIGNEES[0],
      date: new Date().toISOString().split('T')[0],
      proofUrl: `https://picsum.photos/seed/${Math.random()}/800/600`,
      pdfUrl: newReport.pdfUrl || ''
    };
    setReportItems([item, ...reportItems]);
    setIsAddingReport(false);
    setNewReport(initialReportState);
    notify("Laporan progres tersimpan", "success");
  };

  const handleAddMinute = (e: React.FormEvent) => {
    e.preventDefault();
    const item: MeetingMinute = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      title: newMinute.title || 'Rapat',
      summary: newMinute.summary || '',
      attendees: [],
      fileLink: newMinute.fileLink || '#',
      author: newMinute.author || ASSIGNEES[0]
    };
    setMinutesItems([item, ...minutesItems]);
    setIsAddingMinutes(false);
    setNewMinute(initialMinuteState);
    notify("Notulensi disimpan", "success");
  };

  const handleAddPerformance = (e: React.FormEvent) => {
    e.preventDefault();
    const exists = performanceMetrics.find(m => m.month === newMetric.month);
    if (exists) {
      setPerformanceMetrics(prev => prev.map(m => m.month === newMetric.month ? { ...newMetric } : m));
      notify(`Update performa ${newMetric.month} berhasil`, "success");
    } else {
      setPerformanceMetrics(prev => {
        const updated = [...prev, newMetric];
        return updated.sort((a, b) => MONTH_LABELS.indexOf(a.month) - MONTH_LABELS.indexOf(b.month));
      });
      notify(`Data performa ${newMetric.month} ditambahkan`, "success");
    }
    setIsAddingPerformance(false);
    setNewMetric(initialPerformanceState);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.ambassadorNames || newSchedule.ambassadorNames.length === 0) {
      notify("Pilih minimal satu duta", "warning");
      return;
    }
    const item: ScheduleAssignment = {
      id: Date.now().toString(),
      ambassadorNames: newSchedule.ambassadorNames,
      taskTitle: newSchedule.taskTitle || 'Untitled Task',
      description: newSchedule.description || '',
      date: newSchedule.date || new Date().toISOString().split('T')[0],
      priority: (newSchedule.priority as any) || 'Medium'
    };
    setScheduleItems([item, ...scheduleItems]);
    setIsAddingSchedule(false);
    setNewSchedule(initialScheduleState);
    notify("Jadwal penugasan berhasil dibuat", "success");
  };

  const runAiStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiLoading(true);
    try {
      const result = await optimizeCaption(aiForm.title, aiForm.draft, aiForm.platform);
      setAiResult(result);
    } catch (err) {
      notify("AI Processing Error", "warning");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Fixed order based on operational urgency
  const NavItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: 'fa-house' },
    { id: 'Jadwal', label: 'Jadwal', icon: 'fa-calendar-check' },
    { id: 'Absensi', label: 'Absensi', icon: 'fa-fingerprint' },
    { id: 'Content', label: 'Konten', icon: 'fa-clapperboard' },
    { id: 'Evidence', label: 'Laporan', icon: 'fa-file-signature' },
    { id: 'Notulensi', label: 'Notulen', icon: 'fa-book' },
    { id: 'Performance', label: 'Performa', icon: 'fa-chart-line' },
    { id: 'Members', label: 'Anggota', icon: 'fa-users' },
  ];

  const PromoCards = [
    { title: 'AI Copywriting', desc: 'Optimasi Gemini', icon: 'fa-magic', color: 'bg-blue-500/20', action: () => setIsAiToolOpen(true) },
    { title: 'Production Flow', desc: 'Status Produksi', icon: 'fa-tasks', color: 'bg-indigo-500/20', action: () => setIsProdFlowOpen(true) },
    { title: 'Proof of Work', desc: 'Validasi Laporan', icon: 'fa-check-double', color: 'bg-cyan-500/20', action: () => setIsProofOfWorkOpen(true) },
  ];

  return (
    <div className="min-h-screen flex bg-[#111314]">
      {/* Sidebar Rail (Desktop) */}
      <aside className="sidebar-rail hidden md:flex">
        <div className="w-10 h-10 bg-[#a8c7fa] rounded-full flex items-center justify-center text-black mb-8 shadow-lg">
          <i className="fas fa-cubes"></i>
        </div>
        {NavItems.map(item => (
          <div
            key={item.id}
            onClick={() => { setViewMode(item.id as ViewMode); setActiveTab('All'); setSelectedCategory('All'); setSearchQuery(''); }}
            className={`sidebar-item ${viewMode === item.id ? 'active' : ''}`}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </div>
        ))}
      </aside>

      {/* Main Container */}
      <div className="flex-1 main-content-wrapper md:pl-[72px] flex flex-col min-w-0 pb-24 md:pb-0">
        <header className="top-bar">
          <div className="hidden sm:flex items-center gap-4 min-w-[150px]">
            <span className="text-lg font-medium text-[#e3e3e3]">Creative <span className="text-[#a8c7fa] font-bold">Flow</span></span>
          </div>
          <div className="search-pill flex-1 max-w-[720px]">
            <i className="fas fa-search text-[#c4c7c5] ml-1"></i>
            <input
              type="text"
              placeholder={`Cari di ${viewMode.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4 justify-end min-w-[50px]">
            <div className="w-8 h-8 rounded-full bg-[#a8c7fa] text-black flex items-center justify-center font-bold text-xs">AD</div>
          </div>
        </header>

        <main className="px-4 sm:px-12 py-6 max-w-[1600px] mx-auto w-full">
          {/* Action Bar */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
            {viewMode === 'Content' && ['All', ...Object.values(ContentStatus)].map(stat => (
              <button key={stat} onClick={() => setActiveTab(stat as any)} className={`px-4 py-2 border rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeTab === stat ? 'bg-[#a8c7fa] text-black border-transparent shadow-lg' : 'border-[#303134] text-[#c4c7c5] hover:border-white/20'}`}>
                {stat === 'All' ? 'Semua' : stat}
              </button>
            ))}
            {viewMode === 'Evidence' && ['All', 'Sosialisasi', 'Pelayanan Admisi', 'Produksi Konten', 'Event Kampus'].map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 border rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#a8c7fa] text-black border-transparent' : 'border-[#303134] text-[#c4c7c5] hover:border-white/20'}`}>
                {cat}
              </button>
            ))}
            {viewMode !== 'Absensi' && viewMode !== 'Dashboard' && viewMode !== 'Members' && (
              <button
                onClick={() => {
                  if (viewMode === 'Content') setIsAddingContent(true);
                  if (viewMode === 'Evidence') setIsAddingReport(true);
                  if (viewMode === 'Notulensi') setIsAddingMinutes(true);
                  if (viewMode === 'Performance') setIsAddingPerformance(true);
                  if (viewMode === 'Jadwal') setIsAddingSchedule(true);
                }}
                className="ml-auto flex items-center gap-2 bg-[#a8c7fa] text-black px-6 py-2.5 rounded-full font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all shrink-0"
              >
                <i className="fas fa-plus"></i> TAMBAH
              </button>
            )}
          </div>

          {/* Dashboard Focus Section */}
          {viewMode === 'Dashboard' && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar mb-8">
              {PromoCards.map((card, idx) => (
                <div key={idx} className="promo-card group shrink-0 hover:bg-[#282a2c] transition-all" onClick={card.action}>
                  <div className="max-w-[180px]">
                    <h4 className="font-semibold text-[#e3e3e3] text-sm mb-1">{card.title}</h4>
                    <p className="text-[10px] text-[#c4c7c5] leading-tight">{card.desc}</p>
                  </div>
                  <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-[#a8c7fa] group-hover:scale-110 transition-transform ml-6`}>
                    <i className={`fas ${card.icon} text-sm`}></i>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Data List Section */}
          <div className="space-y-0">
            {viewMode === 'Dashboard' && (
              <DashboardView
                stats={{
                  content: contentItems.length,
                  evidence: reportItems.length,
                  minutes: minutesItems.length,
                  schedule: scheduleItems.length
                }}
                trendData={dashboardTrendData}
                performance={performanceMetrics}
              />
            )}
            {viewMode === 'Members' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500 pb-12">
                {filteredData.map((member, idx) => (
                  <MemberCard key={idx} member={member as AmbassadorProfile} />
                ))}
              </div>
            )}
            {viewMode === 'Content' && filteredData.map(item => (
              <div key={item.id} className="font-entry"><ContentCard item={item as ContentItem} onStatusChange={handleStatusChange} /></div>
            ))}
            {viewMode === 'Evidence' && filteredData.map(report => (
              <div key={report.id} className="font-entry"><EvidenceCard evidence={report as WeeklyReport} /></div>
            ))}
            {viewMode === 'Notulensi' && filteredData.map(item => (
              <div key={item.id} className="font-entry"><NotulensiCard item={item as MeetingMinute} /></div>
            ))}
            {viewMode === 'Jadwal' && filteredData.map(item => (
              <div key={item.id} className="font-entry"><ScheduleCard item={item as ScheduleAssignment} /></div>
            ))}
            {viewMode === 'Performance' && (
              <div className="space-y-12 pb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-[#1a1c1e] rounded-2xl border border-[#303134] shadow-xl">
                    <p className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest mb-2">Total Yearly Views</p>
                    <p className="text-4xl font-light text-[#a8c7fa]">{(performanceMetrics.reduce((a, b) => a + b.views, 0) / 1000).toFixed(1)}K</p>
                  </div>
                  <div className="p-6 bg-[#1a1c1e] rounded-2xl border border-[#303134] shadow-xl">
                    <p className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest mb-2">Total Engagement</p>
                    <p className="text-4xl font-light text-[#c6a8fa]">{(performanceMetrics.reduce((a, b) => a + b.likes + b.comments, 0) / 1000).toFixed(1)}K</p>
                  </div>
                  <div className="p-6 bg-[#1a1c1e] rounded-2xl border border-[#303134] shadow-xl">
                    <p className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest mb-2">Total Shares</p>
                    <p className="text-4xl font-light text-[#fae2a8]">{performanceMetrics.reduce((a, b) => a + b.shares, 0)}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-[#e3e3e3] uppercase tracking-[0.2em] border-l-4 border-[#a8c7fa] pl-4">Monthly Social Analytics Breakdown</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {performanceMetrics.map(m => (
                      <SocialMetricCard key={m.month} metric={m} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {viewMode === 'Absensi' && (
              <div className="py-4 max-w-4xl mx-auto">
                <AttendanceModule onSave={(rec) => setAttendanceLogs([rec, ...attendanceLogs])} />
              </div>
            )}
            {filteredData.length === 0 && viewMode !== 'Absensi' && viewMode !== 'Performance' && viewMode !== 'Dashboard' && (
              <div className="py-24 text-center">
                <div className="w-16 h-16 bg-[#1a1c1e] rounded-full flex items-center justify-center text-[#303134] mx-auto mb-4 border border-[#303134]">
                  <i className="fas fa-ghost text-xl"></i>
                </div>
                <p className="text-[#c4c7c5] text-sm font-medium">Data belum tersedia untuk filter ini.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Nav */}
      <nav className="bottom-nav md:hidden">
        {NavItems.map(item => (
          <div
            key={item.id}
            onClick={() => { setViewMode(item.id as ViewMode); setActiveTab('All'); setSelectedCategory('All'); setSearchQuery(''); }}
            className={`bottom-nav-item ${viewMode === item.id ? 'active' : ''}`}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Shared Modals Container */}
      {(isAddingContent || isAddingReport || isAddingMinutes || isAddingPerformance || isAddingSchedule || isAiToolOpen || isProdFlowOpen || isProofOfWorkOpen) && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => {
            setIsAddingContent(false); setIsAddingReport(false); setIsAddingMinutes(false);
            setIsAddingPerformance(false); setIsAddingSchedule(false); setIsAiToolOpen(false); setIsProdFlowOpen(false); setIsProofOfWorkOpen(false);
          }}></div>
          <div className="bg-[#1a1c1e] w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl border-t sm:border border-[#303134] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-bottom-5 duration-300">
            <div className="px-6 py-5 border-b border-[#303134] flex justify-between items-center bg-[#1a1c1e] sticky top-0">
              <h2 className="text-lg font-bold text-white">
                {isAddingContent ? '✨ Tambah Konten' : isAddingReport ? '📋 Laporan Progres' : isAddingMinutes ? '📝 Catat Notulensi' : isAddingPerformance ? '📊 Input Performa' : isAddingSchedule ? '📅 Buat Penugasan' : 'Insight Panel'}
              </h2>
              <button onClick={() => {
                setIsAddingContent(false); setIsAddingReport(false); setIsAddingMinutes(false);
                setIsAddingPerformance(false); setIsAddingSchedule(false); setIsAiToolOpen(false); setIsProdFlowOpen(false); setIsProofOfWorkOpen(false);
              }} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-[#c4c7c5] transition-colors"><i className="fas fa-times"></i></button>
            </div>

            <div className="p-6 overflow-y-auto no-scrollbar bg-[#1a1c1e]">

              {isAddingContent && (
                <form onSubmit={handleAddContent} className="space-y-5 pb-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest ml-1">Nama Konten</label>
                    <input required className="google-input w-full p-4 text-sm" placeholder="Judul..." onChange={e => setNewContent({ ...newContent, title: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <select className="google-input w-full p-4 text-sm" onChange={e => setNewContent({ ...newContent, platform: e.target.value as any })}>
                      <option>Instagram</option><option>TikTok</option><option>YouTube</option>
                    </select>
                    <input type="date" className="google-input w-full p-4 text-sm" onChange={e => setNewContent({ ...newContent, deadline: e.target.value })} />
                  </div>
                  <select className="google-input w-full p-4 text-sm" onChange={e => setNewContent({ ...newContent, assignee: e.target.value })}>
                    {ASSIGNEES.map(a => <option key={a} value={a}>{a.split(' (')[0]}</option>)}
                  </select>
                  <button type="submit" className="w-full bg-[#a8c7fa] text-black py-4 rounded-2xl font-black text-sm shadow-xl transition-all">SIMPAN DATA</button>
                </form>
              )}

              {isAddingReport && (
                <form onSubmit={handleAddReport} className="space-y-5 pb-8">
                  <input required className="google-input w-full p-4 text-sm" placeholder="Nama Kegiatan..." onChange={e => setNewReport({ ...newReport, activityTitle: e.target.value })} />
                  <select className="google-input w-full p-4 text-sm" onChange={e => setNewReport({ ...newReport, category: e.target.value as any })}>
                    <option>Sosialisasi</option><option>Pelayanan Admisi</option><option>Produksi Konten</option><option>Event Kampus</option>
                  </select>
                  <textarea required className="google-input w-full p-4 text-sm" rows={4} placeholder="Deskripsi progres..." onChange={e => setNewReport({ ...newReport, description: e.target.value })}></textarea>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest ml-1">Lampiran Laporan (PDF)</label>
                    <div className="flex items-center gap-4 p-4 bg-[#111314] rounded-2xl border border-[#303134] hover:border-[#a8c7fa]/50 transition-colors cursor-pointer">
                      <i className="fas fa-file-pdf text-red-400 text-xl"></i>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="text-[11px] text-[#c4c7c5] file:hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setNewReport({ ...newReport, pdfUrl: URL.createObjectURL(e.target.files[0]) });
                          }
                        }}
                      />
                      <span className="text-[11px] font-bold text-[#c4c7c5]">Klik untuk upload PDF Formal</span>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#a8c7fa] text-black py-4 rounded-2xl font-black text-sm shadow-xl transition-all">SUBMIT LAPORAN</button>
                </form>
              )}

              {isAddingSchedule && (
                <form onSubmit={handleAddSchedule} className="space-y-5 pb-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest ml-1">Pilih Duta (Tim Penanggung Jawab)</label>
                    <div className="max-h-48 overflow-y-auto bg-[#111314] rounded-xl border border-[#303134] p-2 space-y-1 no-scrollbar">
                      {ASSIGNEES.map(a => (
                        <label key={a} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                          <input
                            type="checkbox"
                            checked={newSchedule.ambassadorNames?.includes(a)}
                            onChange={(e) => {
                              const names = newSchedule.ambassadorNames || [];
                              if (e.target.checked) {
                                setNewSchedule({ ...newSchedule, ambassadorNames: [...names, a] });
                              } else {
                                setNewSchedule({ ...newSchedule, ambassadorNames: names.filter(n => n !== a) });
                              }
                            }}
                            className="w-4 h-4 rounded border-[#303134] bg-transparent text-[#a8c7fa] focus:ring-[#a8c7fa] focus:ring-offset-0"
                          />
                          <span className="text-xs text-[#c4c7c5] group-hover:text-white transition-colors">{a.split(' (')[0]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <input required className="google-input w-full p-4 text-sm" placeholder="Judul Tugas/Jadwal..." onChange={e => setNewSchedule({ ...newSchedule, taskTitle: e.target.value })} />
                  <textarea className="google-input w-full p-4 text-sm" rows={3} placeholder="Detail penugasan (opsional)..." onChange={e => setNewSchedule({ ...newSchedule, description: e.target.value })}></textarea>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest ml-1">Tanggal Pelaksanaan</label>
                      <input type="date" required className="google-input w-full p-4 text-sm" value={newSchedule.date} onChange={e => setNewSchedule({ ...newSchedule, date: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest ml-1">Prioritas</label>
                      <select className="google-input w-full p-4 text-sm" onChange={e => setNewSchedule({ ...newSchedule, priority: e.target.value as any })}>
                        <option>Low</option><option selected>Medium</option><option>High</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#a8c7fa] text-black py-4 rounded-2xl font-black text-sm shadow-xl transition-all">BUAT JADWAL</button>
                </form>
              )}

              {isAddingPerformance && (
                <form onSubmit={handleAddPerformance} className="space-y-5 pb-8">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#c4c7c5] uppercase tracking-widest ml-1">Pilih Bulan</label>
                    <select required className="google-input w-full p-4 text-sm" value={newMetric.month} onChange={e => setNewMetric({ ...newMetric, month: e.target.value })}>
                      {MONTH_LABELS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" required className="google-input w-full p-4 text-sm" placeholder="Views" onChange={e => setNewMetric({ ...newMetric, views: parseInt(e.target.value) || 0 })} />
                    <input type="number" required className="google-input w-full p-4 text-sm" placeholder="Likes" onChange={e => setNewMetric({ ...newMetric, likes: parseInt(e.target.value) || 0 })} />
                  </div>
                  <button type="submit" className="w-full bg-[#a8c7fa] text-black py-4 rounded-2xl font-black text-sm shadow-xl transition-all">SIMPAN PERFORMA</button>
                </form>
              )}

              {isAiToolOpen && (
                <div className="space-y-6">
                  {!aiResult ? (
                    <form onSubmit={runAiStudio} className="space-y-4">
                      <input required className="google-input w-full p-4 text-sm" placeholder="Judul Konten" onChange={e => setAiForm({ ...aiForm, title: e.target.value })} />
                      <textarea required className="google-input w-full p-4 text-sm" rows={3} placeholder="Apa inti pesan konten Anda?" onChange={e => setAiForm({ ...aiForm, draft: e.target.value })}></textarea>
                      <button disabled={isAiLoading} type="submit" className="w-full bg-[#a8c7fa] text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2">
                        {isAiLoading ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-sparkles"></i>}
                        OPTIMASI DENGAN GEMINI
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="p-6 bg-[#111314] rounded-2xl border border-[#303134] text-sm leading-relaxed text-[#e3e3e3] whitespace-pre-wrap font-mono max-h-80 overflow-y-auto">
                        {aiResult}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setAiResult(null)} className="flex-1 py-4 border border-[#303134] rounded-2xl text-[#c4c7c5] font-black text-xs">ULANGI</button>
                        <button onClick={() => { navigator.clipboard.writeText(aiResult); notify("Salin berhasil!", "success"); }} className="flex-1 py-4 bg-[#a8c7fa] text-black rounded-2xl font-black text-xs shadow-xl">SALIN HASIL</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isProdFlowOpen && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-[#a8c7fa] uppercase tracking-widest mb-4">Statistik Alur Produksi</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {WORKFLOW.map(w => (
                      <div key={w.status} className="p-5 bg-[#111314] rounded-2xl border border-[#303134]">
                        <p className="text-[9px] text-[#c4c7c5] font-black uppercase tracking-widest mb-1">{w.label}</p>
                        <p className="text-3xl font-light text-white">{contentItems.filter(i => i.status === w.status).length}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isProofOfWorkOpen && (
                <div className="space-y-8 text-center pb-8">
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mx-auto border border-green-500/20 shadow-xl">
                    <i className="fas fa-shield-check text-5xl"></i>
                  </div>
                  <div>
                    <h3 className="text-3xl font-light text-white mb-2">{reportItems.length} Laporan Valid</h3>
                    <p className="text-xs text-[#c4c7c5] font-black uppercase tracking-[0.3em]">Validated System Activity</p>
                  </div>
                  <button onClick={() => setIsProofOfWorkOpen(false)} className="w-full py-5 bg-[#a8c7fa] text-black rounded-2xl font-black text-sm shadow-xl uppercase tracking-widest">KEMBALI</button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Notifications Overlay */}
      <div className="fixed bottom-28 md:bottom-10 right-4 sm:right-10 z-[3000] pointer-events-none flex flex-col gap-3">
        {notifications.map(n => <Toast key={n.id} notification={n} onClose={removeNotification} />)}
      </div>
    </div>
  );
};

export default App;
