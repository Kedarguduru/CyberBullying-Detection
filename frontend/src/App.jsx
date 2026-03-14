import React, { useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import ThreatAnalytics from "./components/ThreatAnalytics";
import HeuristicEngine from "./components/HeuristicEngine";
import GlobalSettings from "./components/GlobalSettings";
import RealTimeWidget from "./components/RealTimeWidget";
import "./App.css";

const GOOGLE_CLIENT_ID = "629245181061-1rq8t5eskg7bs0la4c2lpv5dp4khtmae.apps.googleusercontent.com";

// Professional SVG Component
const SideIcon = ({ name, color = "currentColor", size = 20 }) => {
  const icons = {
    Dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    Safety: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    User: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Exit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    Analytics: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    Heuristics: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    Settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  };
  return icons[name] || null;
};



function App() {
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState("dashboard");

  const handleUserUpdate = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Login onLogin={handleUserUpdate} />
      </GoogleOAuthProvider>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Bullying Dashboard', icon: 'Dashboard' },
    { id: 'analytics', label: 'Threat Intel', icon: 'Analytics' },
    { id: 'heuristics', label: 'Education Shield', icon: 'Heuristics' },
    { id: 'profile', label: 'Security Profile', icon: 'User' },
    { id: 'settings', label: 'Global Settings', icon: 'Settings' }
  ];

  const getHeaderTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Bullying Detection Status';
      case 'analytics': return 'Toxicity Surveillance Hub';
      case 'heuristics': return 'Education & Guidance Core';
      case 'profile': return 'User Security Passport';
      case 'settings': return 'System Integrity Controls';
      default: return 'Guardian Workspace';
    }
  };

  return (
    <div className="app-container">
      {/* Professional Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box">
             <SideIcon name="Safety" size={24} color="white" />
          </div>
          <h1>SafeSentry PRO</h1>
        </div>
        
        <nav className="nav-menu">
          {navItems.map(item => (
            <button 
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id)}
            >
                <SideIcon name={item.icon} size={18} /> {item.label}
            </button>
          ))}
          
          <div className="nav-spacer"></div>
          
          <button className="nav-item logout-btn-pro" onClick={handleLogout}>
            <SideIcon name="Exit" size={18} /> End Session
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="avatar-small">{user.name.split(' ').map(n => n[0]).join('').toUpperCase()}</div>
            <div className="user-meta">
              <span className="name-bold">{user.name}</span>
              <span className="access-level">Verified Access</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Primary Workspace */}
      <main className="main-content">
        <header className="top-bar">
          <div className="view-title">
            <h2>{getHeaderTitle()}</h2>
            <p className="breadcrumb">System / {currentView.charAt(0).toUpperCase() + currentView.slice(1)} Workspace</p>
          </div>
          
          <div className="top-bar-actions">
            <div className="search-pill">
              <SideIcon name="Search" size={16} color="#64748b" />
              <input type="text" placeholder="Search operational audits..." />
            </div>
          </div>
        </header>

        <div className="page-content">
          {currentView === "dashboard" && <Dashboard user={user} />}
          {currentView === "analytics" && <ThreatAnalytics />}
          {currentView === "heuristics" && <HeuristicEngine />}
          {currentView === "profile" && <Profile user={user} onUpdate={handleUserUpdate} />}
          {currentView === "settings" && <GlobalSettings />}
        </div>
      </main>
      <RealTimeWidget />
    </div>
  );
}

export default App;