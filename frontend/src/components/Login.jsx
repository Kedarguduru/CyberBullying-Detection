import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Professional SVG Icons
  const Icons = {
    Shield: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    ),
    Mail: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    ),
    User: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
    Lock: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    ),
    ArrowLeft: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
    )
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = isRegistering ? { name, email } : { email };
      const resp = await axios.post("http://localhost:5000/register", payload);
      setStep(2);
      console.log("OTP SENT:", resp.data.otp_debug);
    } catch (err) {
      const msg = err.response?.data?.error || "Connection to secure gateway failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await axios.post("http://localhost:5000/verify-otp", { email, otp });
      if (resp.data.success) {
        onLogin(resp.data.user);
      }
    } catch (err) {
      setError("Authorization code is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const resp = await axios.post("http://localhost:5000/google-login", {
        token: credentialResponse.credential
      });
      if (resp.data.success) {
        onLogin(resp.data.user);
      }
    } catch (err) {
      const isTimeError = err.response?.data?.error?.includes("Token verification failed") || false;
      setError(`Shield verification failed. ${isTimeError ? "Check System Date/Time (Synchronize with Internet)." : "Check Cloud console origins."}`);
    } finally {
      setLoading(false);
    }
  };

  const resetToStepOne = () => {
    setStep(1);
    setLoading(false);
    setError("");
    setOtp("");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Icons.Shield />
          </div>
          <h2>SafeSentry PRO</h2>
          <div className="login-badge">
            {step === 1 ? (isRegistering ? "ACCOUNT CREATION" : "AUTHENTICATE") : "IDENTITY VERIFICATION"}
          </div>
          <p className="login-subtitle">
            {step === 1 ? "Secure your professional access" : `Authorized code sent to ${email}`}
          </p>
        </div>

        {error && <div className="login-error-toast">{error}</div>}

        {step === 1 ? (
          <form className="login-form" onSubmit={handleRequestOTP}>
            {isRegistering && (
              <div className="form-group">
                <label>Professional Name</label>
                <div className="input-with-icon">
                  <Icons.User />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
            <div className="form-group">
              <label>Work Email</label>
              <div className="input-with-icon">
                <Icons.Mail />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-btn primary" disabled={loading}>
              {loading ? <span className="loader-dots">Processing</span> : (isRegistering ? "Create Secure Account" : "Request Authorization")}
            </button>

            <div className="login-mode-switch">
              {isRegistering ? (
                <p>Already have an account? <span onClick={() => setIsRegistering(false)}>Log In</span></p>
              ) : (
                <p>New to SafeSentry? <span onClick={() => setIsRegistering(true)}>Register</span></p>
              )}
            </div>

            <div className="login-divider">
              <span>SECURE SOCIAL GATEWAY</span>
            </div>

            <div className="google-btn-wrapper">
              <GoogleLogin 
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Identity Verification failed.")}
                theme="outline"
                size="large"
                shape="pill"
                width="100%"
              />
            </div>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleVerifyOTP}>
            <div className="form-group code-group">
              <label>Verification Code</label>
              <div className="input-with-icon">
                <Icons.Lock />
                <input
                  type="text"
                  placeholder="0 0 0 0 0 0"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  className="otp-input-large"
                  required
                />
              </div>
            </div>
            <button type="submit" className="login-btn primary" disabled={loading}>
              {loading ? "Verifying..." : "Confirm Identity"}
            </button>
            <button 
              type="button" 
              onClick={resetToStepOne} 
              className="login-btn ghost"
            >
              <Icons.ArrowLeft /> Back to Entry
            </button>
          </form>
        )}


        <div className="login-footer">
          <p>© 2024 SafeSentry Systems • <span className="version-tag">CORPUS v2.4.1</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
