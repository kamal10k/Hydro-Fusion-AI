import React, { useState, useContext } from 'react';
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
  RefreshCw 
} from 'lucide-react';

export const LoginPage = ({ onSuccess }) => {
  const { login, register } = useContext(AuthContext);

  // Auth Modes: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Operator');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode) => {
    clearMessages();
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // ----------------------------------------------------
  // Handler: Login
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
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Invalid email or password.');
    }
  };

  // ----------------------------------------------------
  // Handler: Registration
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
    const res = await register(name.trim(), email.trim(), password, confirmPassword, role);
    setLoading(false);

    if (res.success) {
      setSuccess('Account created successfully! Please sign in with your credentials.');
      switchMode('login');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(res.error || 'Registration failed. Please check your details.');
    }
  };

  // ----------------------------------------------------
  // Quick Demo Logins
  // ----------------------------------------------------
  const handleDemoLogin = (demoRole) => {
    clearMessages();
    if (demoRole === 'Engineer') {
      setEmail('engineer@hydrofusion.ai');
      setPassword('admin123');
    } else {
      setEmail('alex.vance@hydrofusion.ai');
      setPassword('admin123');
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
            {mode === 'register' && 'Create Operator / Engineer Account'}
            {mode === 'forgot' && 'Account Recovery & Administrator Support'}
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
        {/* VIEW 2: REGISTRATION                                             */}
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
        {/* VIEW 3: FORGOT PASSWORD (ORIGINAL BEHAVIOR)                      */}
        {/* ---------------------------------------------------------------- */}
        {mode === 'forgot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              borderRadius: '12px',
              padding: '1.25rem',
              lineHeight: 1.6,
              fontSize: '0.85rem',
              color: '#cbd5e1'
            }}>
              <p style={{ marginBottom: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>
                Account Security & Password Recovery
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                For data center operational safety and access control compliance, direct automated password resets are managed through facility administrators.
              </p>
              <p>
                Please contact your lead administrator at: <strong style={{ color: '#00f2fe' }}>alex.vance@hydrofusion.ai</strong> or reach out to internal IT support to reset your credentials.
              </p>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => switchMode('login')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <ArrowLeft size={16} /> Return to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
