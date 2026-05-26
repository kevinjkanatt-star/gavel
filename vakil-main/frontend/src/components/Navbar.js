import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Scale, User, LogOut, FileText, BookOpen, ChevronDown, Globe } from 'lucide-react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, languages, setLanguage, currentLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const langRef = useRef(null);

  useEffect(() => {
    return scrollY.on('change', (latest) => setScrolled(latest > 50));
  }, [scrollY]);

  useEffect(() => {
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/');
  };

  const quickLinks =
    user?.role === 'client' ? [
      { to: '/client/dashboard', icon: Scale, label: 'Intelligence' },
      { to: '/client/affidavit', icon: FileText, label: 'Affidavit' },
      { to: '/client/cases', icon: BookOpen, label: 'My Cases' },
    ] :
    user?.role === 'lawyer' ? [
      { to: '/lawyer/dashboard', icon: Scale, label: 'Dashboard' },
    ] :
    user?.role === 'legal_writer' ? [
      { to: '/writer/dashboard', icon: Scale, label: 'Dashboard' },
    ] : [];

  const isActive = (to) => location.pathname === to;

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 md:px-12 py-4 flex items-center justify-between ${
        scrolled ? 'bg-white/80 backdrop-blur-md border-b shadow-sm' : 'bg-transparent'
      }`}
      style={{ borderColor: scrolled ? 'rgba(229,229,229,0.5)' : 'transparent' }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      data-testid="navbar"
    >
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')} data-testid="navbar-logo">
        <Scale className="w-6 h-6" style={{ color: '#7C1D2B' }} />
        <span className="font-serif text-lg font-bold tracking-tight text-foreground">Gavel &amp; Brief</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <Link
          to="/services"
          className={`text-sm font-medium transition-colors duration-200 ${
            isActive('/services') ? 'font-bold' : 'text-foreground/70 hover:text-foreground'
          }`}
          style={isActive('/services') ? { color: '#7C1D2B' } : {}}
          data-testid="navbar-services"
        >
          Services
        </Link>
        {user && quickLinks.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
              isActive(to) ? 'font-bold' : 'text-foreground/70 hover:text-foreground'
            }`}
            style={isActive(to) ? { color: '#7C1D2B' } : { color: '#111111' }}>
            <Icon className="w-3.5 h-3.5" style={isActive(to) ? { color: '#7C1D2B' } : { color: '#111111' }} />
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-white hover:border-slate-400 transition-all text-sm"
            style={{ color: '#111111' }}
            title="Select Language"
          >
            <Globe className="w-4 h-4" style={{ color: '#111111' }} />
            <span className="hidden sm:block font-medium text-xs max-w-[80px] truncate">
              {currentLang.nativeLabel}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-12 w-56 bg-white rounded-2xl border border-border z-50 overflow-hidden"
                style={{ boxShadow: '0 25px 50px rgba(124,29,43,0.15)' }}
              >
                <div className="px-4 py-2.5 border-b border-border bg-background">
                  <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">Select Language</p>
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                        language === lang.code ? 'font-semibold' : 'text-foreground/70'
                      }`}
                      style={language === lang.code ? { color: '#7C1D2B' } : {}}
                    >
                      <span>{lang.label}</span>
                      <span className="text-xs text-foreground/40">{lang.nativeLabel}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {langOpen && <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />}
        </div>

        {user && <NotificationBell />}
        {!user ? (
          <Link to="/login" data-testid="navbar-login-button">
            <button className="text-white px-5 py-2 rounded-sm font-medium text-sm transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ background: '#7C1D2B' }}>
              Login
            </button>
          </Link>
        ) : (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 h-9 px-3 rounded-xl border border-border bg-white hover:border-accent transition-all text-sm text-foreground/70"
              data-testid="navbar-user-menu"
            >
              <User className="w-4 h-4" style={{ color: '#7C1D2B' }} />
              <span className="hidden sm:block font-medium max-w-[120px] truncate">{user.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 top-12 w-52 bg-white rounded-2xl border border-border z-50 overflow-hidden"
                  style={{ boxShadow: '0 25px 50px rgba(124,29,43,0.15)' }}
                >
                  <div className="px-4 py-3 bg-background border-b border-border">
                    <p className="text-xs text-foreground/50 uppercase tracking-wider font-semibold mb-0.5">Signed in as</p>
                    <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-foreground/40 capitalize">{user.role?.replace('_', ' ')}</p>
                  </div>
                  {quickLinks.length > 0 && (
                    <div className="py-1.5 md:hidden border-b border-border">
                      {quickLinks.map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/70 hover:bg-background transition-colors"
                          style={isActive(to) ? { color: '#7C1D2B' } : {}}>
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: isActive(to) ? 'rgba(124,29,43,0.1)' : 'rgba(0,0,0,0.04)' }}>
                            <Icon className="w-3.5 h-3.5" style={isActive(to) ? { color: '#7C1D2B' } : { color: '#333' }} />
                          </span>{label}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="py-1.5">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                      data-testid="navbar-logout-button">
                      <span className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center flex-shrink-0">
                        <LogOut className="w-3.5 h-3.5" />
                      </span>Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {profileOpen && <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />}
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
