import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const linkClass = ({ isActive }) =>
    `border-b-2 py-1 text-sm font-medium transition-colors duration-200 ${
      isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-950'
    }`;
  const sectionLinkClass = 'border-b-2 border-transparent py-1 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-950 focus:outline-none focus-visible:border-blue-600 focus-visible:text-blue-600';

  const handleSectionNavigate = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-slate-950">
          <ShieldCheck className="text-blue-600" />
          FinShield
        </Link>
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/quick-scan" className={linkClass}>Quick Scan</NavLink>
          <NavLink to="/checker" className={linkClass}>Checker</NavLink>
          <NavLink to="/awareness" className={linkClass}>Awareness</NavLink>
          <NavLink to="/emergency-guide" className={linkClass}>Emergency Guide</NavLink>
          <button type="button" onClick={() => handleSectionNavigate('features')} className={sectionLinkClass}>Features</button>
          <button type="button" onClick={() => handleSectionNavigate('about')} className={sectionLinkClass}>About Us</button>
          {isAuthenticated ? (
            <>
              {user?.name && <span className="hidden text-sm font-medium text-slate-600 md:inline">{user.name}</span>}
              <Link to="/dashboard" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Dashboard</Link>
              <button onClick={() => logout()} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <Link to="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
