import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Activity, X, ChevronUp, ChevronDown, Mic, Radio } from 'lucide-react';
import axios from 'axios';

const RealTimeWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [stats, setStats] = useState({
      total: 0,
      threats: 0,
      safety_ratio: 100
    });
    const [notifications, setNotifications] = useState([]);
    const mediaRecorderRef = React.useRef(null);
    const chunksRef = React.useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/get-incidents');
        const incidents = response.data;
        const threats = incidents.filter(inc => !inc.classification.includes('Safe')).length;
        
        setStats({
          total: incidents.length,
          threats: threats,
          safety_ratio: incidents.length > 0 ? ((incidents.length - threats) / incidents.length * 100).toFixed(1) : 100
        });

        // If new threat detected, add notification
        if (incidents.length > 0 && !incidents[0].classification.includes('Safe')) {
          const lastIncident = incidents[0];
          setNotifications(prev => {
            if (prev.find(n => n.id === lastIncident._id)) return prev;
            return [{
              id: lastIncident._id,
              text: `Warning: ${lastIncident.classification} detected`,
              time: lastIncident.timestamp
            }, ...prev].slice(0, 3);
          });
        }
      } catch (err) {
        console.error("Widget fetch error", err);
      }
    };

    const interval = setInterval(fetchData, 5000);
    fetchData();
    return () => clearInterval(interval);
  }, []);

  const toggleMonitoring = async () => {
    if (isMonitoring) {
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
        setIsMonitoring(false);
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMonitoring(true);
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            chunksRef.current = [];
            
            if (isMonitoring) {
                // Send to backend
                const formData = new FormData();
                formData.append('audio', blob, 'chunk.webm');
                
                try {
                    const response = await axios.post('http://localhost:5000/predict-audio-chunk', formData);
                    if (response.data.prediction && response.data.prediction.includes('Detected')) {
                        setNotifications(prev => [{
                            id: Date.now(),
                            text: `Live Threat: "${response.data.text.substring(0, 30)}..."`,
                            time: new Date().toLocaleTimeString()
                        }, ...prev].slice(0, 3));
                    }
                } catch (err) {
                    console.error("Audio chunk upload failed", err);
                }
                
                // Start next chunk
                if (isMonitoring) mediaRecorder.start();
            }
        };

        // Record in 5-second segments
        mediaRecorder.start();
        const chunkInterval = setInterval(() => {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            } else {
                clearInterval(chunkInterval);
            }
        }, 5000);

    } catch (err) {
        alert("Microphone/Background Audio access denied. Please enable it to monitor videos.");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
        {!isMinimized && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto bg-[#0f172a]/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-5 w-72 overflow-hidden relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                  <Activity size={18} className="text-indigo-400" />
                </div>
                <span className="text-slate-200 font-semibold text-sm">Live Guardian</span>
              </div>
              <button 
                onClick={() => setIsMinimized(true)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/50 mb-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        {isMonitoring ? (
                           <div className="flex items-end gap-0.5 h-4 w-6">
                              <motion.div animate={{ height: [4, 12, 6, 14, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-rose-500 rounded-full" />
                              <motion.div animate={{ height: [8, 4, 14, 6, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-rose-500 rounded-full" />
                              <motion.div animate={{ height: [6, 14, 4, 12, 6] }} transition={{ repeat: Infinity, duration: 1.0 }} className="w-1 bg-rose-500 rounded-full" />
                              <motion.div animate={{ height: [12, 6, 10, 4, 12] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-rose-500 rounded-full" />
                           </div>
                        ) : (
                           <Mic size={16} className="text-slate-400" />
                        )}
                     </div>
                     <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                        {isMonitoring ? "Guardian Active" : "Shield Offline"}
                     </span>
                  </div>
                  <button 
                    onClick={toggleMonitoring}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-tight transition-all active:scale-95 ${isMonitoring ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-600'}`}
                  >
                    {isMonitoring ? "Disable" : "Engage"}
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/50">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Safety Score</span>
                <span className="text-xl font-bold text-emerald-400">{stats.safety_ratio}%</span>
              </div>
              <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800/50">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">Threats Blocked</span>
                <span className="text-xl font-bold text-rose-400">{stats.threats}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block ml-1">Recent Activity</span>
              {notifications.length > 0 ? notifications.map(notif => (
                <div key={notif.id} className="flex gap-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 items-start">
                  <AlertTriangle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-rose-200 leading-tight">{notif.text}</p>
                    <span className="text-[9px] text-rose-400/70">{notif.time}</span>
                  </div>
                </div>
              )) : (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-2 items-center">
                  <Shield size={14} className="text-emerald-400" />
                  <span className="text-[11px] text-emerald-200">System Monitoring Active</span>
                </div>
              )}
            </div>
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsMinimized(!isMinimized)}
        className="pointer-events-auto w-14 h-14 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isMinimized ? <Shield size={24} /> : <X size={24} />}
        
        {stats.threats > 0 && isMinimized && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 border-2 border-white rounded-full text-[10px] flex items-center justify-center font-bold">
            {stats.threats}
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default RealTimeWidget;
