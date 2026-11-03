import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { PageHeader, LoadingSpinner, FormField } from '../../components/ui';
import { User, Mail, Phone, Shield, Save, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refetchUser } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', badge_number: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', badge_number: user.badge_number || '' });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersAPI.update(user.id, { name: form.name, phone: form.phone, badge_number: form.badge_number });
      await refetchUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const roleConfig = {
    admin: { label: 'Administrator', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
    police: { label: 'Traffic Police Officer', color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
    citizen: { label: 'Citizen', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/30' },
  };
  const rc = roleConfig[user?.role] || roleConfig.citizen;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      {/* Profile Header Card */}
      <div className="card mb-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-3xl">{user?.name?.charAt(0)?.toUpperCase()}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mt-2 ${rc.bg} ${rc.color}`}>
            <Shield className="w-3 h-3 mr-1" /> {rc.label}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['profile', 'security'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            {t === 'profile' ? '👤 Profile Info' : '🔒 Security'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSave} className="card space-y-5">
          <h3 className="text-white font-semibold text-lg mb-4">Personal Information</h3>
          
          <FormField label="Full Name" required>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="input-field pl-10"
                placeholder="Your full name"
                required
              />
            </div>
          </FormField>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field pl-10 opacity-50 cursor-not-allowed"
              />
            </div>
            <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
          </div>

          <FormField label="Phone Number">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="input-field pl-10"
                placeholder="+91 98765 43210"
              />
            </div>
          </FormField>

          {user?.role === 'police' && (
            <FormField label="Badge Number">
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={form.badge_number}
                  onChange={e => setForm(p => ({ ...p, badge_number: e.target.value }))}
                  className="input-field pl-10"
                  placeholder="e.g. DL-2024-001"
                />
              </div>
            </FormField>
          )}

          <div>
            <label className="label">Account Type</label>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${rc.bg} ${rc.color}`}>
              <Shield className="w-4 h-4" />
              <span className="font-medium">{rc.label}</span>
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'security' && (
        <div className="card space-y-5">
          <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-400" />
            Change Password
          </h3>
          <p className="text-slate-400 text-sm">To change your password, please contact the administrator or use the password reset flow.</p>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <p className="text-blue-400 text-sm font-medium">🔒 Account Security</p>
            <p className="text-slate-400 text-xs mt-1">Your account is protected with JWT-based authentication and bcrypt password hashing.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30">
            <p className="text-white text-sm font-medium">Account Details</p>
            <div className="mt-2 space-y-1 text-xs text-slate-400">
              <p>User ID: <span className="text-slate-300 font-mono text-xs">{user?.id}</span></p>
              <p>Member since: <span className="text-slate-300">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</span></p>
              <p>Status: <span className="text-emerald-400 font-medium">✓ Active</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
