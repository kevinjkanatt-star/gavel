import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Scale, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Footer from '../components/Footer';

function formatApiErrorDetail(detail) {
  if (detail == null) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(' ');
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const performLogin = async (loginEmail, loginPassword) => {
    setError('');
    setLoading(true);
    try {
      const user = await login(loginEmail, loginPassword);
      if (user.role === 'client') {
        navigate('/client/dashboard');
      } else if (user.role === 'lawyer') {
        navigate('/lawyer/dashboard');
      } else if (user.role === 'legal_writer') {
        navigate('/writer/dashboard');
      }
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleDemoLogin = async (role) => {
    const creds = {
      lawyer: { email: 'lawyer@test.com', password: 'password123' },
      client: { email: 'client@test.com', password: 'password123' },
    }[role];
    if (!creds) return;
    setEmail(creds.email);
    setPassword(creds.password);
    await performLogin(creds.email, creds.password);
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <Scale className="w-16 h-16 text-amber-400 mb-8" />
          <h1 className="font-heading text-5xl font-bold mb-6 leading-tight">
            Welcome to
            <span className="text-amber-400"> Gavel & Brief</span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed mb-8">
            India's most trusted legal services platform. Connect with expert lawyers and get AI-powered case analysis.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-slate-200">500+ Verified Lawyers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-slate-200">10,000+ Cases Resolved</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-slate-200">98% Client Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="font-heading text-4xl font-bold text-slate-900 mb-3" data-testid="login-heading">
              Welcome Back
            </h2>
            <p className="text-slate-600 text-lg">Sign in to continue to Gavel & Brief</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg" data-testid="login-error">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors text-slate-900"
                placeholder="you@example.com"
                required
                data-testid="login-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-lg focus:border-slate-900 focus:outline-none transition-colors text-slate-900"
                  placeholder="••••••••"
                  required
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-500 font-medium uppercase tracking-wider">
                  Or try a demo account
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('lawyer')}
                disabled={loading}
                className="px-4 py-3 border-2 border-slate-200 hover:border-slate-900 rounded-lg text-sm font-semibold text-slate-700 transition-colors disabled:opacity-50"
                data-testid="demo-lawyer-login"
              >
                <Scale className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Demo Lawyer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('client')}
                disabled={loading}
                className="px-4 py-3 border-2 border-slate-200 hover:border-slate-900 rounded-lg text-sm font-semibold text-slate-700 transition-colors disabled:opacity-50"
                data-testid="demo-client-login"
              >
                <ArrowRight className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                Demo Client
              </button>
            </div>
            <p className="mt-3 text-xs text-center text-slate-500">
              One-click login with seeded data — perfect for testing the platform
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-600 hover:text-amber-700 font-semibold" data-testid="login-register-link">
                Create one here
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <Link to="/" className="text-slate-600 hover:text-slate-900 text-sm flex items-center justify-center gap-2">
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
