import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, Cell
} from 'recharts';
import { motion } from "framer-motion";
import "./Analytics.css";

const Icon = ({ name, color = "currentColor", size = 20 }) => {
  const icons = {
    TrendingUp: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    PieChart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
    Map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
    Activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    Shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  };
  return icons[name] || null;
};

const ThreatAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const resp = await axios.get("http://localhost:5000/get-analytics");
        setData(resp.data);
      } catch (err) {
        console.error("ANALYSIS_FETCH_ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="analytics-loading">
        <div className="loader-ring"></div>
        <p>SYNCHRONIZING THREAT INTELLIGENCE CORE...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="analytics-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="analytics-header">
        <div className="header-info">
          <h3>Threat Surveillance Intel</h3>
          <p>Real-time pattern recognition and cross-channel behavioral telemetry.</p>
        </div>
        <div className={`risk-badge ${data.risk_level.toLowerCase()}`}>
          SYSTEM RISK: {data.risk_level}
        </div>
      </div>

      <div className="analytics-stats-row">
        <div className="a-stat-card">
          <div className="s-label">Total Detections</div>
          <div className="s-value">{data.total_incidents}</div>
          <div className="s-tag">Global Registry</div>
        </div>
        <div className="a-stat-card">
          <div className="s-label">Unique Targets</div>
          <div className="s-value">{data.unique_targets}</div>
          <div className="s-tag">Verified Usernets</div>
        </div>
        <div className="a-stat-card premium-enc">
          <div className="s-label">Encryption Suite</div>
          <div className="s-value">SHA-512</div>
          <div className="s-tag">Active Cipher: AES-256GCM</div>
          <div className="enc-glow"></div>
        </div>
      </div>

      <div className="encryption-telemetry-strip">
         <div className="t-item"><Icon name="Shield" size={14} color="#6366f1" /> PGP_HANDSHAKE: SUCCESS</div>
         <div className="t-item"><Icon name="Activity" size={14} color="#10b981" /> RSA_BITS: 4096</div>
         <div className="t-item"><Icon name="Lock" size={14} color="#8b5cf6" /> SSL_CIPHER: TLS_1.3</div>
         <div className="t-item"><Icon name="TrendingUp" size={14} color="#f59e0b" /> KEY_ROTATION: 14m ago</div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card main-chart">
          <div className="card-header">
            <Icon name="TrendingUp" color="#6366f1" />
            <span>Volatility Index (7-Day Telemetry)</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.volatility}>
                <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                     <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', background: '#0f172a', color: 'white' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card distribution premium-glass encryption-tunnel">
          <div className="card-header justify-between">
            <div className="flex items-center gap-2">
               <Icon name="Shield" color="#6366f1" />
               <span>Encryption Tunneling Status</span>
            </div>
            <div className="tunnel-status">SECURE</div>
          </div>
          <div className="tunnel-viz">
             <div className="tunnel-path">
                <div className="data-packet p1"></div>
                <div className="data-packet p2"></div>
                <div className="data-packet p3"></div>
             </div>
             <div className="tunnel-metadata">
                <div className="m-row"><span>PROTOCOL:</span> <strong>TLS 1.3 / QUIC</strong></div>
                <div className="m-row"><span>HANDSHAKE:</span> <strong>ECDHE_RSA</strong></div>
                <div className="m-row"><span>ENTROPY:</span> <strong>7.99 bits/char</strong></div>
             </div>
          </div>
        </div>

        <div className="analytics-card top-categories premium-glass enc-matrix">
          <div className="card-header">
            <Icon name="Lock" color="#8b5cf6" />
            <span>Active Cipher Cluster</span>
          </div>
          <div className="cipher-list">
             <div className="c-item">
                <div className="c-name">AES-256-CTR</div>
                <div className="c-progress"><div className="c-fill" style={{width: '94%'}}></div></div>
                <div className="c-val">ACTIVE</div>
             </div>
             <div className="c-item">
                <div className="c-name">ChaCha20</div>
                <div className="c-progress"><div className="c-fill" style={{width: '88%'}}></div></div>
                <div className="c-val">STANDBY</div>
             </div>
             <div className="c-item">
                <div className="c-name">Poly1305</div>
                <div className="c-progress"><div className="c-fill" style={{width: '100%'}}></div></div>
                <div className="c-val">VERIFIED</div>
             </div>
          </div>
        </div>

        <div className="analytics-card full-width">
          <div className="card-header justify-between">
            <div className="flex items-center gap-2">
               <Icon name="Activity" color="#ef4444" />
               <span>Live Intelligence Feed</span>
            </div>
            <div className="live-status-pill">
               <span className="live-dot"></span>
               RECEPTOR_ACTIVE
            </div>
          </div>
          <div className="live-feed-grid">
             {data.recent_incidents?.map((inc, idx) => (
                <motion.div 
                   key={idx} 
                   className="feed-item-pro"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.1 }}
                >
                   <div className="feed-top">
                      <div className="f-user-hex">
                         <div className="hex-avatar">{inc.email[0].toUpperCase()}</div>
                         <div className="hex-info">
                            <span className="f-user-name">{inc.email}</span>
                            <span className="f-ts">{inc.timestamp}</span>
                         </div>
                      </div>
                      <span className={`f-tag-pro ${inc.classification.includes('Detected') ? 'danger' : 'safe'}`}>
                         {inc.classification.toUpperCase()}
                      </span>
                   </div>
                   <div className="f-body-pro">
                      <div className="quote-mark">"</div>
                      <p>{inc.content?.substring(0, 120)}{inc.content?.length > 120 ? '...' : ''}</p>
                   </div>
                   <div className="f-footer-pro">
                      <div className="f-intel-chip">CONFIDENCE: {inc.confidence}</div>
                      <div className="f-intel-chip">SOURCE: ENDPOINT_TX_0{idx + 1}</div>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThreatAnalytics;
