import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import "./Analytics.css";

const dialetData = [
  { name: 'English (US)', value: 45, color: '#6366f1' },
  { name: 'English (UK)', value: 20, color: '#818cf8' },
  { name: 'Telugu', value: 25, color: '#f59e0b' },
  { name: 'Hindi', value: 10, color: '#10b981' },
];

const HeuristicEngine = () => {
  const [nodes, setNodes] = useState([
    { id: "NODE_ALPHA", status: "PROCESSING", load: 78 },
    { id: "NODE_BETA", status: "OPTIMAL", load: 23 },
    { id: "NODE_GAMMA", status: "IDLE", load: 0 },
    { id: "NODE_DELTA", status: "CRITICAL", load: 92 }
  ]);

  const [logs, setLogs] = useState([
    { id: 1, time: "09:12:04", type: "input", text: "Vectorizing semantic input..." },
    { id: 2, time: "09:12:05", type: "toxic", text: "Pattern Match: [HateSpeech_Racism_099]" },
    { id: 3, time: "09:12:06", type: "action", text: "Flag: High Priority. Dispatched to Global Incident Nexus." },
    { id: 4, time: "09:12:08", type: "input", text: "Analyzing Telugu transliteration clusters..." }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        load: Math.max(10, Math.min(95, node.load + (Math.random() * 10 - 5)))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="analytics-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="analytics-header">
        <div className="header-info">
          <h3>Education Shield & Guidance Core</h3>
          <p>Supervising the synthetic intelligence decision-making matrix and multi-dialect weighting.</p>
        </div>
        <div className="core-speed-box">
           <div className="speed-label">NEURAL SYNC</div>
           <div className="speed-value">12.4ms</div>
        </div>
      </div>

      <div className="heuristics-layout">
        <div className="node-monitor-section">
           <div className="section-tag">Active Neural Clusters</div>
           <div className="node-cards-grid">
              {nodes.map(node => (
                <div key={node.id} className={`node-card-pro ${node.status.toLowerCase()}`}>
                   <div className="node-icon-box">
                      <div className="inner-pulse"></div>
                   </div>
                   <div className="node-meta">
                      <span className="node-name">{node.id}</span>
                      <span className="node-state">{node.status}</span>
                   </div>
                   <div className="load-bar-container">
                      <div className="load-fill" style={{ width: `${node.load}%` }}></div>
                   </div>
                   <div className="load-percentage">{node.load.toFixed(1)}%</div>
                </div>
              ))}
           </div>
        </div>

        <div className="dialect-matrix-section">
           <div className="section-tag">Dialect Weighting Matrix</div>
           <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dialetData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dialetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', background: '#0f172a', color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="dialect-legend">
              {dialetData.map(d => (
                <div key={d.name} className="d-item">
                   <span className="d-dot" style={{background: d.color}}></span>
                   <span className="d-label">{d.name}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="logic-terminal-section">
           <div className="terminal-header">
              <div className="window-dots">
                 <span></span><span></span><span></span>
              </div>
              <span className="terminal-title">HEURISTIC_STREAM_v3.0.LOG</span>
           </div>
           <div className="terminal-body">
              <AnimatePresence mode="popLayout">
                {logs.map(log => (
                  <motion.div 
                    key={log.id} 
                    className={`log-line ${log.type}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="l-time">[{log.time}]</span>
                    <span className="l-prefix">&gt;</span>
                    <span className="l-text">{log.text}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div className="typing-cursor">_</div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeuristicEngine;
