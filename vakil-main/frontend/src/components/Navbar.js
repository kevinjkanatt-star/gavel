import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Scale, User, LogOut, FileText, BookOpen, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useScroll } from 'framer-motion';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on('change', (latest) => setScrolled(latest > 50));
  }, [scrollY]);

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
      {/* Logo */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')} data-testid="navbar-logo">
        <Scale className="w-6 h-6 text-primary" />
        <span className="font-serif text-lg font-bold tracking-tight text-foreground">Gavel &amp; Brief</span>
      </div>

      {/* Centre — Services always shown */}
      <div className="hidden md:flex items-center gap-8">
        <Link
          to="/services"
          className={`text-sm font-medium transition-colors duration-200 ${
            location.pathname === '/services' ? 'text-primary' : 'text-foreground/70 hover:text-primary'
          }`}
          data-testid="navbar-services"
        >
          Services
        </Link>
        {user && quickLinks.map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
              location.pathname === to ? 'text-primary' : 'text-foreground/70 hover:text-primary'
            }`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </Link>
        ))}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {user && <NotificationBell />}
        {!user ? (
          <Link to="/login" data-testid="navbar-login-button">
            <button className="bg-primary text-primary-foreground px-5 py-2 rounded-sm font-medium text-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20">
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
              <User className="w-4 h-4 text-primary" />
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
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/70 hover:bg-background hover:text-primary transition-colors">
                          <span className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5 text-primary" />
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
