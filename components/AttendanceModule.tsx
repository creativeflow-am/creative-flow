
import React, { useState, useRef } from 'react';
import { ASSIGNEES } from '../constants';
import { AttendanceRecord } from '../types';

interface AttendanceModuleProps {
  onSave: (record: AttendanceRecord) => void;
}

const AttendanceModule: React.FC<AttendanceModuleProps> = ({ onSave }) => {
  const [selectedName, setSelectedName] = useState(ASSIGNEES[0]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [attendanceType, setAttendanceType] = useState<'In' | 'Out'>('In');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const openCameraModal = async () => {
    setIsCameraOpen(true);
    await startCamera(facingMode);
    getLocation();
  };

  const closeCameraModal = () => {
    stopCamera();
    setIsCameraOpen(false);
    setPhoto(null);
  };

  const startCamera = async (mode: 'user' | 'environment') => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      alert("Izin kamera ditolak.");
      closeCameraModal();
    }
  };

  const toggleCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("GPS tidak aktif."),
        { enableHighAccuracy: true }
      );
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.save();
        if (facingMode === 'user') {
          context.scale(-1, 1);
          context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        } else {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        context.restore();
        setPhoto(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const handleFinalSubmit = () => {
    onSave({
      id: Math.random().toString(36).substr(2, 9),
      name: selectedName,
      timestamp: new Date().toLocaleString('id-ID'),
      photo: photo || '',
      location: { lat: location?.lat || 0, lng: location?.lng || 0 },
      type: attendanceType
    });
    setIsCameraOpen(false);
    setPhoto(null);
  };

  return (
    <div className="bg-[#1a1c1e] p-8 rounded-2xl border border-[#303134] shadow-xl">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-12 h-12 bg-[#a8c7fa]/10 rounded-xl flex items-center justify-center text-[#a8c7fa] border border-[#a8c7fa]/20">
          <i className="fas fa-fingerprint text-xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-medium text-white">Presensi Digital</h2>
          <p className="text-xs text-[#c4c7c5] font-bold uppercase tracking-widest mt-0.5">Sistem Duta Kampus</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-[#c4c7c5] uppercase tracking-widest ml-1">Pilih Duta</label>
          <select 
            value={selectedName}
            onChange={(e) => setSelectedName(e.target.value)}
            className="google-input w-full p-4 h-[56px] font-medium"
          >
            {ASSIGNEES.map(name => <option key={name} value={name}>{name.split(' (')[0]}</option>)}
          </select>
        </div>

        <div className="flex bg-[#111314] p-1 rounded-xl border border-[#303134]">
          <button 
            onClick={() => setAttendanceType('In')}
            className={`flex-1 py-3 text-xs font-black transition-all rounded-lg tracking-widest ${attendanceType === 'In' ? 'bg-[#1a1c1e] text-green-400 shadow-lg' : 'text-[#c4c7c5] hover:text-white'}`}
          >
            HADIR
          </button>
          <button 
            onClick={() => setAttendanceType('Out')}
            className={`flex-1 py-3 text-xs font-black transition-all rounded-lg tracking-widest ${attendanceType === 'Out' ? 'bg-[#1a1c1e] text-red-400 shadow-lg' : 'text-[#c4c7c5] hover:text-white'}`}
          >
            PULANG
          </button>
        </div>

        <button 
          onClick={openCameraModal}
          className="w-full py-4 bg-[#a8c7fa] text-black font-bold shadow-xl rounded-xl tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all"
        >
          BUKA KAMERA
        </button>
      </div>

      {isCameraOpen && (
        <div className="fixed inset-0 z-[2000] flex flex-col bg-black">
          <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/90 to-transparent z-10 flex items-center justify-between px-6">
            <div className="text-white">
              <h3 className="font-bold text-base">{selectedName.split(' (')[0]}</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a8c7fa]">
                {attendanceType === 'In' ? 'Presensi Masuk' : 'Presensi Pulang'}
              </p>
            </div>
            <button onClick={closeCameraModal} className="w-10 h-10 bg-white/10 rounded-full text-white flex items-center justify-center"><i className="fas fa-times"></i></button>
          </div>

          <div className="flex-1 relative flex items-center justify-center">
            {!photo ? (
              <>
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="w-[80vw] max-w-[320px] aspect-[3/4] border-2 border-[#a8c7fa]/40 rounded-3xl relative">
                     <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#a8c7fa] rounded-tl-3xl"></div>
                     <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#a8c7fa] rounded-tr-3xl"></div>
                     <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#a8c7fa] rounded-bl-3xl"></div>
                     <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#a8c7fa] rounded-br-3xl"></div>
                   </div>
                </div>

                <div className="absolute bottom-32 px-6 py-2 rounded-full bg-black/60 border border-white/10 flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500 shadow-[0_0_8px_green]' : 'bg-red-500 animate-pulse'}`}></div>
                   <span className="text-[10px] text-white font-bold tracking-widest uppercase">
                    {location ? 'LOKASI TERKONFIRMASI' : 'MENDAPATKAN LOKASI...'}
                   </span>
                </div>

                <div className="absolute bottom-10 inset-x-0 flex items-center justify-center gap-10">
                  <button onClick={toggleCamera} className="w-14 h-14 bg-white/10 rounded-full text-white flex items-center justify-center"><i className="fas fa-sync-alt"></i></button>
                  <button onClick={takePhoto} disabled={!location} className="w-20 h-20 bg-white rounded-full p-1.5 shadow-2xl disabled:opacity-20">
                    <div className="w-full h-full border-4 border-black/10 rounded-full bg-[#a8c7fa] flex items-center justify-center">
                      <i className="fas fa-camera text-black text-2xl"></i>
                    </div>
                  </button>
                  <div className="w-14 h-14"></div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
                <img src={photo} className="w-full max-w-sm aspect-[3/4] rounded-3xl object-cover shadow-2xl border border-white/10 mb-8" />
                <div className="flex gap-4 w-full max-w-sm">
                   <button onClick={() => { setPhoto(null); startCamera(facingMode); }} className="flex-1 py-4 bg-white/10 text-white font-bold rounded-xl tracking-widest">ULANGI</button>
                   <button onClick={handleFinalSubmit} className="flex-1 py-4 bg-[#a8c7fa] text-black font-bold rounded-xl shadow-xl tracking-widest">SUBMIT</button>
                </div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default AttendanceModule;
