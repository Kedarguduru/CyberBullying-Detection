import React, { useState } from "react";
import { motion } from "framer-motion";
import "./Analytics.css";

const Icon = ({ name, color = "currentColor", size = 20 }) => {
  const icons = {
    Server: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
    Globe: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    Bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    Terminal: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
    Cpu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
    Shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    Activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  };
  return icons[name] || null;
};

const GlobalSettings = () => {
    const [settings, setSettings] = useState({
        apiEndpoint: "https://api.safesentry.intel/v3",
        region: "IND-WEST-PROXIMA",
        maintenanceMode: false,
        notificationLevel: "High Velocity",
        autoArchive: true,
        hateSpeechFiltering: "Strict",
        encryptionMode: "Quantum-Safe AES-512",
        biometricLock: true
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <motion.div 
            className="analytics-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="analytics-header">
                <div className="header-info">
                    <h3>System Integrity Control</h3>
                    <p>Orchestrate global heuristic parameters and neural network synchronization weights.</p>
                </div>
                <div className="system-status pro">
                    <div className="status-ripple"></div>
                    NODE_01: ONLINE
                </div>
            </div>

            <div className="settings-technical-grid">
                <div className="tech-panel">
                    <div className="panel-inner">
                        <div className="panel-header">
                            <Icon name="Server" color="#6366f1" size={16} />
                            <span>Neural Infrastructure</span>
                        </div>
                        <div className="tech-field">
                            <label>GATEWAY_ADDRESS</label>
                            <div className="tech-input-box">
                                <span className="p-prefix">GET</span>
                                <input type="text" value={settings.apiEndpoint} readOnly />
                            </div>
                        </div>
                        <div className="tech-field">
                            <label>PRIMARY_DEPLOYMENT_ZONE</label>
                            <div className="zone-indicator">
                                <div className="z-circle"></div>
                                {settings.region}
                            </div>
                        </div>
                    </div>

                    <div className="panel-inner primary-border">
                        <div className="panel-header">
                            <Icon name="Shield" color="#7c3aed" size={16} />
                            <span>Hate Speech Classification</span>
                        </div>
                        <div className="tech-field">
                            <label>HEURISTIC_STRICTNESS</label>
                            <div className="custom-select-pro">
                                <select 
                                    className="tech-select"
                                    value={settings.hateSpeechFiltering}
                                    onChange={(e) => setSettings({...settings, hateSpeechFiltering: e.target.value})}
                                >
                                    <option>Lenient (Delta-V1)</option>
                                    <option>Balanced (Sigma-V2)</option>
                                    <option>Strict (Omega-V3)</option>
                                </select>
                            </div>
                        </div>
                        <p className="field-hint">Omega-V3 includes dialect-specific (Telugu/Hindi) toxicity detection clusters.</p>
                    </div>

                    <div className="panel-inner">
                        <div className="panel-header">
                            <Icon name="Terminal" color="#94a3b8" size={16} />
                            <span>Tactical Commands</span>
                        </div>
                        <div className="action-grid">
                            <button className="tech-btn purple">PURGE_INTEL_CACHE</button>
                            <button className="tech-btn crimson">INIT_GLOBAL_REBOOT</button>
                        </div>
                    </div>
                </div>

                <div className="tech-panel">
                    <div className="panel-inner">
                        <div className="panel-header">
                            <Icon name="Globe" color="#14b8a6" size={16} />
                            <span>Network Topology</span>
                        </div>
                        <div className="network-viz">
                            <div className="viz-center">
                                <Icon name="Cpu" size={24} color="#6366f1" />
                            </div>
                            <div className="viz-node n1"></div>
                            <div className="viz-node n2"></div>
                            <div className="viz-node n3"></div>
                            <svg className="viz-lines">
                                <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="rgba(99,102,241,0.2)" />
                                <line x1="50%" y1="50%" x2="80%" y2="25%" stroke="rgba(99,102,241,0.2)" />
                                <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="rgba(99,102,241,0.2)" />
                            </svg>
                        </div>
                        <div className="node-stats">
                            <div className="n-stat"><span>Latency</span> 12ms</div>
                            <div className="n-stat"><span>Nodes</span> 42/42</div>
                        </div>
                    </div>

                    <div className="panel-inner">
                        <div className="panel-header">
                            <Icon name="Bell" color="#f59e0b" size={16} />
                            <span>Signal Autonomy</span>
                        </div>
                        <div className="tech-toggle-row">
                            <div className="t-meta">
                                <strong>Log Persistence</strong>
                                <p>Write metadata to immutable ledger.</p>
                            </div>
                            <label className="switch pro">
                                <input type="checkbox" checked={settings.autoArchive} onChange={() => handleToggle('autoArchive')} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="tech-toggle-row">
                            <div className="t-meta">
                                <strong>Biometric Verification</strong>
                                <p>Require face-id for admin overrides.</p>
                            </div>
                            <label className="switch pro">
                                <input type="checkbox" checked={settings.biometricLock} onChange={() => handleToggle('biometricLock')} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="tech-toggle-row">
                            <div className="t-meta">
                                <strong>Kernel Isolation</strong>
                                <p>Deep-sleep state for neural maintenance.</p>
                            </div>
                            <label className="switch pro">
                                <input type="checkbox" checked={settings.maintenanceMode} onChange={() => handleToggle('maintenanceMode')} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <div className="panel-inner bg-slate-50/30">
                        <div className="panel-header">
                            <Icon name="Activity" color="#ef4444" size={16} />
                            <span>Data Protection Core</span>
                        </div>
                        <div className="encryption-pill">
                            <div className="e-icon">🔒</div>
                            <div className="e-text">
                                <label>PROTOCOL_ACTIVE</label>
                                <span>{settings.encryptionMode}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default GlobalSettings;
