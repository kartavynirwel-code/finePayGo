import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, Car, AlertTriangle, Users,
  CreditCard, History, LogOut, Menu, X, Shield,
  ChevronRight, Bell, Settings, UserCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const navConfig = {
  admin: [
    { path: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/admin/challans', label: 'All Challans', icon: FileText },
    { path: '/dashboard/admin/users', label: 'Users', icon: Users },
    { path: '/dashboard/admin/violations', label: 'Violations', icon: AlertTriangle },
    { path: '/dashboard/admin/vehicles', label: 'Vehicles', icon: Car },
  ],
  police: [
    { path: '/dashboard/police', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/police/generate', label: 'Generate Challan', icon: FileText },
    { path: '/dashboard/police/challans', label: 'My Challans', icon: History },
  ],
  citizen: [
    { path: '/dashboard/citizen', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/citizen/vehicles', label: 'My Vehicles', icon: Car },
    { path: '/dashboard/citizen/challans', label: 'My Challans', icon: FileText },
    { path: '/dashboard/citizen/payments', label: 'Pay Fines', icon: CreditCard },
    { path: '/dashboard/citizen/history', label: 'Payment History', icon: History },
  ],
};

const roleColors = {
  admin: 'bg-purple-600/20 text-purple-400 border-purple-500/30',
  police: 'bg-blue-600/20 text-blue-400 border-blue-500/30',
  citizen: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
};

const roleLabels = {
  admin: 'Administrator',
  police: 'Traffic Police',
  citizen: 'Citizen',
};

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = navConfig[user?.role] || [];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">FineSnap</h1>
            <p className="text-slate-400 text-xs mt-0.5">E-Challan System</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">{user?.name}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${roleColors[user?.role]}`}>
              {roleLabels[user?.role]}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path.split('/').length === 3}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
          </NavLink>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-700/50 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
        >
          <UserCircle className="w-5 h-5" />
          <span>Profile</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-800/50 border-r border-slate-700/50 fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700/50 transform transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/50 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-slate-300 text-sm">
                Welcome back, <span className="text-white font-semibold">{user?.name}</span>
              </h2>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-right hidden sm:block">
                <p className="text-white text-sm font-medium">{user?.name}</p>
                <p className="text-slate-400 text-xs">{user?.email}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
