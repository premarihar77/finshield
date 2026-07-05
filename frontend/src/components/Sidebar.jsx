import { NavLink } from 'react-router-dom';
import { AlertTriangle, BarChart3, FileImage, History, Link2, LogOut, Megaphone, MessageSquareText, ShieldCheck, Siren, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/analyze-text', label: 'Analyze Text', icon: MessageSquareText },
  { to: '/analyze-image', label: 'Analyze Image', icon: FileImage },
  { to: '/history', label: 'History', icon: History },
  { to: '/report-scam', label: 'Report Scam', icon: Siren },
  { to: '/checker', label: 'Checker', icon: Link2 },
  { to: '/awareness', label: 'Awareness', icon: Megaphone },
  { to: '/emergency-guide', label: 'Emergency', icon: AlertTriangle },
  { to: '/profile', label: 'Profile', icon: User }
];

export default function Sidebar() {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-2 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur md:inset-y-0 md:left-0 md:w-64 md:border-r md:border-t-0 md:p-5 md:shadow-none">
      <div className="mb-8 hidden items-center gap-2 text-xl font-bold text-slate-950 md:flex">
        <ShieldCheck className="text-blue-600" />
        FinShield
      </div>
      <nav className="grid grid-cols-4 gap-1 md:block md:space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-center gap-3 rounded-lg px-3 py-3 text-xs font-medium transition-all duration-200 md:justify-start md:text-sm ${
                isActive
                  ? 'border border-blue-100 bg-blue-50 text-blue-600 md:border-l-4 md:border-l-blue-600'
                  : 'text-slate-600 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 md:hover:translate-x-0.5 md:hover:translate-y-0'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="hidden md:inline">{label}</span>
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex items-center justify-center gap-3 rounded-lg px-3 py-3 text-xs font-medium text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 md:w-full md:justify-start md:text-sm md:hover:translate-x-0.5 md:hover:translate-y-0">
          <LogOut className="h-5 w-5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </nav>
    </aside>
  );
}
