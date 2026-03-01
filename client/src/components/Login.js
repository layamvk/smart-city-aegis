import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [role, setRole] = useState('Viewer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // States: 'login', 'register', 'verify'
  const [mode, setMode] = useState('login');

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'register') {
      try {
        await register(username, password, phoneNumber, role);
        setError("");
        setSuccess("Verification code sent! Enter it below.");
        setMode('verify');
      } catch (err) {
        setSuccess("");
        setError(err.response?.data?.message || "Registration failed");
      }
    } else if (mode === 'verify') {
      try {
        // Need to hit the verify endpoint directly since context doesn't expose it
        await api.post('/auth/verify-phone', { username, code: verifyCode });
        setError("");
        setSuccess("Account verified successfully! Please login.");
        setMode('login');
        setPassword('');
        setVerifyCode('');
      } catch (err) {
        setSuccess("");
        setError(err.response?.data?.message || "Verification failed");
      }
    } else {
      try {
        await login(username, password);
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed');
        setPassword('');
      }
    }
  };

  const toggleMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setPassword('');
    setVerifyCode('');
  };

  return (
    <div style={styles.container}>
      {/* Abstract Glowing Orbs Background */}
      <div style={styles.orb1} />
      <div style={styles.orb2} />

      {/* Glass Panel */}
      <div style={styles.glassPanel}>
        <div style={styles.iconContainer}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <h2 style={styles.title}>
          {mode === 'register' ? 'Create Account' : mode === 'verify' ? 'Verify Auto-Code' : 'Secure Login'}
        </h2>

        <p style={styles.subtitle}>
          {mode === 'register' ? 'Join the secure grid.' : mode === 'verify' ? 'Enter the 6-digit code we generated.' : 'Welcome back, Administrator.'}
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode !== 'verify' && (
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Username or Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          )}

          {mode === 'verify' && (
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="6-Digit Verification Code"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                style={styles.input}
                maxLength="6"
                required
              />
            </div>
          )}

          {mode !== 'verify' && (
            <div style={styles.inputGroup}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
              {mode === 'register' && (
                <p style={styles.helperText}>
                  Min 8 characters · Uppercase, lowercase & number
                </p>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div style={styles.inputGroup}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ ...styles.input, WebkitAppearance: 'none' }}
              >
                <option style={{ backgroundColor: '#1a1a24', color: '#ffffff' }} value="Viewer">Viewer (Read-Only)</option>
                <option style={{ backgroundColor: '#1a1a24', color: '#ffffff' }} value="TrafficAdmin">Traffic Administrator</option>
                <option style={{ backgroundColor: '#1a1a24', color: '#ffffff' }} value="ElectricityAdmin">Electricity Administrator</option>
                <option style={{ backgroundColor: '#1a1a24', color: '#ffffff' }} value="WaterAdmin">Water Administrator</option>
                <option style={{ backgroundColor: '#1a1a24', color: '#ffffff' }} value="LightingAdmin">Lighting Administrator</option>
                <option style={{ backgroundColor: '#1a1a24', color: '#ffffff' }} value="CCTVOperator">CCTV Operator</option>
                <option style={{ backgroundColor: '#1a1a24', color: '#ffffff' }} value="SecurityAnalyst">Security Analyst</option>
              </select>
            </div>
          )}

          {mode === 'register' && (
            <div style={styles.inputGroup}>
              <input
                type="text"
                placeholder="Phone Number (10 digits)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          )}

          <div style={styles.restrictedNote}>
            Restricted System: Only authorized government personnel may access or create accounts. Verification required (Development Prototype).
          </div>



          <button type="submit" style={styles.button}>
            {mode === 'register' ? 'Continue' : mode === 'verify' ? 'Verify Account' : 'Authenticate'}
          </button>
        </form>

        <div style={styles.footerLinks}>
          {mode === 'login' ? (
            <p onClick={() => toggleMode('register')} style={styles.link}>
              New user? Request access
            </p>
          ) : (
            <p onClick={() => toggleMode('login')} style={styles.link}>
              Already authorized? Sign in
            </p>
          )}
        </div>
      </div>

      <div style={styles.testCredentials}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', fontWeight: '600' }}>
          Notice for Judges
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
          <div><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Pass for all</span><br /><span style={{ color: '#fff', fontWeight: '500' }}>Password123</span></div>
          <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
          <div><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>SuperAdmin (Username)</span><br /><span style={{ color: '#fff', fontWeight: '500' }}>superadmin</span></div>
          <div><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Traffic (Username)</span><br /><span style={{ color: '#fff', fontWeight: '500' }}>trafficadmin</span></div>
          <div><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Grid (Username)</span><br /><span style={{ color: '#fff', fontWeight: '500' }}>electricityadmin</span></div>
          <div><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Water (Username)</span><br /><span style={{ color: '#fff', fontWeight: '500' }}>wateradmin</span></div>
          <div><span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Security (Username)</span><br /><span style={{ color: '#fff', fontWeight: '500' }}>security</span></div>
          <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.3)', borderRadius: '12px', color: '#fb923c', fontSize: '11px', lineHeight: '1.4' }}>
            <strong>Zero Trust Active:</strong> Repeated wrong login attempts will temporarily block your IP address. Please enter credentials carefully.
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'var(--font-family)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: 'var(--bg)',
    position: 'fixed',
    top: 0,
    left: 0,
    margin: 0,
    padding: 0,
    overflow: 'hidden',
    zIndex: 99999,
  },
  orb1: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(0,0,0,0) 70%)',
    top: '-20%',
    left: '-10%',
    filter: 'blur(80px)',
    zIndex: 0,
  },
  orb2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, rgba(0,0,0,0) 70%)',
    bottom: '-20%',
    right: '-10%',
    filter: 'blur(80px)',
    zIndex: 0,
  },
  glassPanel: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: '420px',
    padding: '48px 40px',
    background: 'var(--panel)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: '32px',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxSizing: 'border-box',
    boxShadow: 'var(--shadow-subtle)',
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'var(--panel-card)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '28px',
    border: '1px solid var(--border)',
  },
  title: {
    color: 'var(--text-bright)',
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 10px 0',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontWeight: '400',
    margin: '0 0 32px 0',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  error: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--critical)',
    color: 'var(--critical)',
    borderRadius: '12px',
    fontSize: '13px',
    marginBottom: '24px',
    textAlign: 'center',
    boxSizing: 'border-box',
    fontWeight: '500'
  },
  success: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid var(--success)',
    color: 'var(--success)',
    borderRadius: '12px',
    fontSize: '13px',
    marginBottom: '24px',
    textAlign: 'center',
    boxSizing: 'border-box',
    fontWeight: '500'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    backgroundColor: 'var(--panel-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    color: 'var(--text-bright)',
    fontSize: '15px',
    fontWeight: '400',
    outline: 'none',
    transition: 'all var(--duration) var(--ease)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  helperText: {
    color: 'var(--text-muted)',
    fontSize: '10px',
    marginTop: '8px',
    marginLeft: '4px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  button: {
    width: '100%',
    padding: '16px',
    marginTop: '12px',
    backgroundColor: 'var(--accent)',
    color: 'var(--text-bright)',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    transition: 'all var(--duration) var(--ease)',
    fontFamily: 'inherit',
    textTransform: 'uppercase',
  },
  footerLinks: {
    marginTop: '32px',
    textAlign: 'center',
  },
  link: {
    color: 'var(--text-muted)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'color var(--duration) var(--ease)',
    margin: 0,
    fontWeight: '500',
  },
  restrictedNote: {
    color: 'var(--text-muted)',
    fontSize: '11px',
    textAlign: 'center',
    margin: '8px 0',
    lineHeight: '1.6',
    padding: '0 10px',
    opacity: 0.7,
  },
  testCredentials: {
    position: 'absolute',
    right: '48px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'var(--panel)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    padding: '32px',
    fontSize: '13px',
    color: 'var(--text-muted)',
    width: '280px',
    zIndex: 10,
    boxSizing: 'border-box',
    boxShadow: 'var(--shadow-subtle)',
  }
};


export default Login;
