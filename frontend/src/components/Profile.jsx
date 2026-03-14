import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./Profile.css";

const API_URL = process.env.REACT_APP_API_URL || '${API_URL}';

const Profile = ({ user, onUpdate }) => {
  const [profile, setProfile] = useState({
    name: user?.name || "Professional Admin",
    email: user?.email || "admin@safesentry.pro",
    role: "Senior Safety Lead",
    bio: "Passionate about building safer digital environments using AI and ML technologies.",
    notifications: true,
    twoFactor: true,
    accessLevel: "LEVEL_4_CLEARANCE"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await axios.post("${API_URL}/update-profile", profile);
      setMessage("Identity synchronized with global registry.");
      if (onUpdate) onUpdate({ name: profile.name, email: profile.email });
    } catch (err) {
      setMessage("Sync failed. Registry connection timeout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="profile-container"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="profile-passport-header">
        <div className="passport-badge">OFFICIAL SECURE ID</div>
        <h2>Security Personnel Passport</h2>
        <p>Managed cryptographic identity for the CyberGuard ecosystem.</p>
      </div>

      <div className="passport-layout">
        <div className="passport-left">
           <div className="id-photo-container">
              <div className="avatar-shield">
                {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="scan-line"></div>
           </div>
           
           <div className="clearance-level">
              <label>Field Clearance</label>
              <div className="level-chip">{profile.accessLevel.replace(/_/g, ' ')}</div>
           </div>

           <div className="metadata-registry">
              <div className="m-item"><strong>REGISTRY:</strong> GUARD-882-QX</div>
              <div className="m-item"><strong>ISSUED:</strong> MAR-2024</div>
              <div className="m-item"><strong>STATUS:</strong> <span className="text-success">ACTIVE</span></div>
           </div>
        </div>

        <div className="passport-right">
           <div className="form-grid">
              <div className="p-field">
                 <label>Identity Name</label>
                 <input name="name" value={profile.name} onChange={handleChange} />
              </div>
              <div className="p-field">
                 <label>Access Identifier (Email)</label>
                 <input name="email" value={profile.email} onChange={handleChange} style={{ color: '#6366f1'}} />
              </div>
              <div className="p-field full">
                 <label>Operational Designation</label>
                 <input name="role" value={profile.role} onChange={handleChange} />
              </div>
              <div className="p-field full">
                 <label>Tactical Background</label>
                 <textarea name="bio" value={profile.bio} onChange={handleChange} rows="3" />
              </div>
           </div>

           <div className="security-toggles">
              <h3>Active Security Protocols</h3>
              <div className="toggle-box">
                 <div className="t-info">
                   <strong>Neural Notifications</strong>
                   <p>Direct priority data stream for classification triggers.</p>
                 </div>
                 <label className="switch">
                    <input type="checkbox" name="notifications" checked={profile.notifications} onChange={handleChange} />
                    <span className="slider round"></span>
                 </label>
              </div>
              <div className="toggle-box">
                 <div className="t-info">
                   <strong>Biometric 2FA Protocol</strong>
                   <p>Enhanced authentication for administrative nodes.</p>
                 </div>
                 <label className="switch">
                    <input type="checkbox" name="twoFactor" checked={profile.twoFactor} onChange={handleChange} />
                    <span className="slider round"></span>
                 </label>
              </div>
           </div>

           {message && <div className={`status-toast ${message.includes('failed') ? 'error' : 'success'}`}>{message}</div>}

           <div className="passport-actions">
              <button className="btn-primary" onClick={handleSave} disabled={loading}>
                 {loading ? "SYNCHRONIZING..." : "PUBLISH TO REGISTRY"}
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
