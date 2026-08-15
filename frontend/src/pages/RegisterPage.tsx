import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building, Briefcase, ArrowRight, AlertCircle, Target } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Field component OUTSIDE the render function — prevents re-creation on every state change
const Field = ({ icon: Icon, label, type = 'text', value, onChange, placeholder, required = true }: any) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', letterSpacing: '-0.01em' }}>
      {label}{required && <span style={{ color: 'var(--danger)' }}> *</span>}
    </label>
    <div className="relative">
      <Icon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: 'var(--text-tertiary)' }} />
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-glass w-full rounded-xl"
        style={{ paddingLeft: '36px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', fontSize: '13px' }}
      />
    </div>
  </div>
);

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await api.post('/auth/signup', { fullName, email, password, companyName, jobTitle });
      login(res.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-8"
      style={{ background: isDark ? 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(10,132,255,0.15) 0%, var(--bg-base) 60%)' : 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,122,255,0.08) 0%, #f5f5f7 60%)' }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-6">
          <div
            className="inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-4"
            style={{ background: 'var(--accent)', boxShadow: '0 8px 24px var(--accent-glow)' }}
          >
            <Target style={{ width: '22px', height: '22px', color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Create your workspace
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', letterSpacing: '-0.01em' }}>
            Start closing deals with Clinch CRM.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-7">
          {error && (
            <div
              className="flex items-start gap-3 rounded-xl p-3 mb-5"
              style={{ background: 'rgba(255,59,48,0.08)', border: '1px solid rgba(255,59,48,0.2)' }}
            >
              <AlertCircle style={{ width: '14px', height: '14px', color: 'var(--danger)', flexShrink: 0, marginTop: '1px' }} />
              <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field icon={Building} label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Acme Technologies" />
            <Field icon={User} label="Your Full Name" value={fullName} onChange={setFullName} placeholder="Jane Smith" />
            <Field icon={Mail} label="Work Email" type="email" value={email} onChange={setEmail} placeholder="jane@acme.com" />
            <Field icon={Briefcase} label="Job Title" value={jobTitle} onChange={setJobTitle} placeholder="VP of Sales" required={false} />
            <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" />

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{ marginTop: '4px', height: '42px', borderRadius: '12px', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <div className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
              ) : (
                <>
                  <span>Create Workspace</span>
                  <ArrowRight style={{ width: '14px', height: '14px' }} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
