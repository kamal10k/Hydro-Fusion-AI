import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Droplets, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Building
} from 'lucide-react';

export const LoginPage = ({ onSuccess }) => {
  const { login, register, verifyOtp, resendOtp, verifyRegistrationEmail, resendRegistrationEmail, forgotPassword, resetPassword } = useContext(AuthContext);

  // Auth Modes: 'login' | 'register' | 'forgot' | 'otp' | 'verify_registration' | 'reset_password'
  const [mode, setMode] = useState('login');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Operator');
  const [facilityName, setFacilityName] = useState('Facility Alpha');

  // Login OTP Verification Fields
  const [otp, setOtp] = useState('');
  const [loginAttemptId, setLoginAttemptId] = useState('');
  const [emailMasked, setEmailMasked] = useState('');
  const [cooldown, setCooldown] = useState(0);

  // Registration Email Verification Fields
  const [registrationToken, setRegistrationToken] = useState('');
  const [regCode, setRegCode] = useState('');

  // Password Reset Fields
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if password reset token is present in URL
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('reset_token') || params.get('token');
    if (tokenParam) {
      setResetToken(tokenParam);
      setMode('reset_password');
    }
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);


  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode) => {
    clearMessages();
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtp('');
    setRegCode('');
  };


  // ----------------------------------------------------
  // Handler: Login (Triggers OTP Email)
  // ----------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);

    if (res.success) {
      if (res.requiresOtp) {
        setLoginAttemptId(res.loginAttemptId);
        setEmailMasked(res.emailMasked);
        setMode('otp');
        setSuccess(`Verification code sent to ${res.emailMasked}.`);
        setCooldown(60);
      } else if (onSuccess) {
        onSuccess();
      }
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  // ----------------------------------------------------
  // Handler: Verify OTP Code
  // ----------------------------------------------------
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await verifyOtp(loginAttemptId, otp.trim());
    setLoading(false);

    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Invalid verification code.');
    }
  };

  // ----------------------------------------------------
  // Handler: Resend OTP Code
  // ----------------------------------------------------
  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    clearMessages();
    setLoading(true);
    const res = await resendOtp(loginAttemptId);
    setLoading(false);

    if (res.success) {
      if (res.loginAttemptId) setLoginAttemptId(res.loginAttemptId);
      if (res.emailMasked) setEmailMasked(res.emailMasked);
      setSuccess(res.message || `A new code has been sent to ${emailMasked}.`);
      setCooldown(60);
      setOtp('');
    } else {
      setError(res.error || 'Failed to resend code.');
    }
  };


  // ----------------------------------------------------
  // Handler: Registration (Triggers Registration Email Verification)
  // ----------------------------------------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    const res = await register(name.trim(), email.trim(), password, confirmPassword, role, facilityName);
    setLoading(false);

    if (res.success) {
      if (res.requiresVerification) {
        setRegistrationToken(res.registrationToken);
        setEmailMasked(res.emailMasked);
        setMode('verify_registration');
        setSuccess(`Account created! A verification code was sent to ${res.emailMasked}.`);
        setCooldown(60);
      } else {
        setSuccess('Account created successfully! Please sign in with your credentials.');
        switchMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      setError(res.error || 'Registration failed. Please check your details.');
    }
  };

  // ----------------------------------------------------
  // Handler: Verify Registration Email Code
  // ----------------------------------------------------
  const handleVerifyRegistrationEmail = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!regCode.trim() || regCode.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await verifyRegistrationEmail(registrationToken, regCode.trim(), email);
    setLoading(false);

    if (res.success) {
      setSuccess('Email address verified successfully! You may now sign in.');
      setMode('login');
      setRegCode('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(res.error || 'Invalid verification code.');
    }
  };

  // ----------------------------------------------------
  // Handler: Resend Registration Verification Code
  // ----------------------------------------------------
  const handleResendRegistrationCode = async () => {
    if (cooldown > 0) return;
    clearMessages();
    setLoading(true);
    const res = await resendRegistrationEmail(registrationToken, email);
    setLoading(false);

    if (res.success) {
      if (res.registrationToken) setRegistrationToken(res.registrationToken);
      if (res.emailMasked) setEmailMasked(res.emailMasked);
      setSuccess(res.message || `A new verification code was sent to ${emailMasked || email}.`);
      setCooldown(60);
      setRegCode('');
    } else {
      setError(res.error || 'Failed to resend verification code.');
    }
  };



  // ----------------------------------------------------
  // Handler: Forgot Password (Send Reset Email)
  // ----------------------------------------------------
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const res = await forgotPassword(email.trim());
    setLoading(false);

    if (res.success) {
      setSuccess(res.message || 'If an account with this email exists, a password reset link has been sent.');
    } else {
      setError(res.error || 'Failed to process password reset request.');
    }
  };

  // ----------------------------------------------------
  // Handler: Reset Password (Save New Password)
  // ----------------------------------------------------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!newPassword || !confirmNewPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(resetToken, newPassword, confirmNewPassword);
    setLoading(false);

    if (res.success) {
      setSuccess('Your password has been reset successfully. Please log in with your new password.');
      setMode('login');
      setNewPassword('');
      setConfirmNewPassword('');
      setPassword('');
      setConfirmPassword('');
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      setError(res.error || 'Password reset failed. Please request a new link.');
    }
  };



  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--bg-dark)'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem', position: 'relative' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 0 30px rgba(0, 242, 254, 0.4)'
          }}>
            <Droplets size={30} color="#070a12" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
            HydroFusion <span style={{ color: '#00f2fe' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {mode === 'login' && 'Data Center Cooling & Water Management System'}
            {mode === 'otp' && 'Two-Factor Email Security Verification'}
            {mode === 'verify_registration' && 'New Account Email Verification'}
            {mode === 'register' && 'Create Operator / Engineer Account'}
            {mode === 'forgot' && 'Reset Your HydroFusion AI Account Password'}
            {mode === 'reset_password' && 'Create New Secure Account Password'}
          </p>
        </div>

        {/* Global Feedback Banners */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#f43f5e',
            padding: '0.85rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#10b981',
            padding: '0.85rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* VIEW 1: SIGN IN                                                  */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="operator@hydrofusion.ai"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  style={{ background: 'none', border: 'none', color: '#00f2fe', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="pulse-active" /> Signing in...
                </>
              ) : (
                'Sign In to HydroFusion AI'
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Don't have an account? </span>
              <button
                type="button"
                onClick={() => switchMode('register')}
                style={{ background: 'none', border: 'none', color: '#00f2fe', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Create Account
              </button>
            </div>

            {/* Quick Demo Logins Bar */}
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Preset Sign-In:
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleDemoLogin('Admin')}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  Dr. Alex Vance (Admin)
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleDemoLogin('Engineer')}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  Engineer Profile
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* VIEW 2: LOGIN OTP VERIFICATION                                   */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                Verify Your Email
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                We sent a 6-digit verification code to:<br />
                <strong style={{ color: '#00f2fe' }}>{emailMasked || email}</strong>
              </p>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                6-Digit Verification Code
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', letterSpacing: '0.35em', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || otp.length !== 6}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="pulse-active" /> Verifying Code...
                </>
              ) : (
                'Verify Code'
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || cooldown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: cooldown > 0 ? 'var(--text-dim)' : '#00f2fe',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* VIEW 2.5: REGISTRATION EMAIL VERIFICATION                        */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'verify_registration' && (
          <form onSubmit={handleVerifyRegistrationEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                Verify Your Email Address
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                We sent a 6-digit verification code to:<br />
                <strong style={{ color: '#00f2fe' }}>{emailMasked || email}</strong>
              </p>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                6-Digit Verification Code
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', letterSpacing: '0.35em', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || regCode.length !== 6}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="pulse-active" /> Verifying Email...
                </>
              ) : (
                'Verify Email'
              )}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>

              <button
                type="button"
                onClick={handleResendRegistrationCode}
                disabled={loading || cooldown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: cooldown > 0 ? 'var(--text-dim)' : '#00f2fe',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: cooldown > 0 ? 'not-allowed' : 'pointer'
                }}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}


        {/* ---------------------------------------------------------------- */}
        {/* VIEW 3: REGISTRATION                                             */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Sarah Chen, PE"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@hydrofusion.ai"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Password (min. 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Facility Role
              </label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field">
                <option value="Operator">Data Center Operator</option>
                <option value="Engineer">Data Center Engineer</option>
                <option value="Facility Manager">Facility Manager</option>
                <option value="Maintenance">Maintenance Team</option>
                <option value="Admin">System Administrator</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Already registered? </span>
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', color: '#00f2fe', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* VIEW 4: FORGOT PASSWORD                                          */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                Forgot Password
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Enter your registered email address to receive a secure password reset link.
              </p>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="operator@hydrofusion.ai"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="pulse-active" /> Sending Email...
                </>
              ) : (
                'Send Verification Email'
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', margin: '0 auto' }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* VIEW 5: RESET PASSWORD (CREATE NEW PASSWORD)                     */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'reset_password' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                Create New Password
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Please enter your new password below.
              </p>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                New Password (min. 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem', fontWeight: 600 }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-field"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="pulse-active" /> Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', margin: '0 auto' }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>
          </form>
        )}


      </div>
    </div>
  );
};

