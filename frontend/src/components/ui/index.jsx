// Reusable UI components for FineSnap

export function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
  };

  return (
    <div className={`card bg-gradient-to-br border ${colorMap[color]} p-6 animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color].split(' ').slice(0,2).join(' ')}`}>
          <Icon className={`w-6 h-6 ${colorMap[color].split(' ').pop()}`} />
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const statusConfig = {
    paid: { class: 'badge-paid', label: '✓ Paid' },
    unpaid: { class: 'badge-unpaid', label: '✗ Unpaid' },
    pending: { class: 'badge-pending', label: '⏳ Pending' },
  };
  const cfg = statusConfig[status?.toLowerCase()] || { class: 'badge-pending', label: status };
  return <span className={cfg.class}>{cfg.label}</span>;
}

export function RoleBadge({ role }) {
  const roleConfig = {
    admin: { class: 'badge-admin', label: '👑 Admin' },
    police: { class: 'badge-police', label: '🚔 Police' },
    citizen: { class: 'badge-citizen', label: '👤 Citizen' },
  };
  const cfg = roleConfig[role?.toLowerCase()] || { class: 'badge-citizen', label: role };
  return <span className={cfg.class}>{cfg.label}</span>;
}

export function LoadingSpinner({ size = 'md', text }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`spinner ${sizes[size]}`} />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs mb-6">{description}</p>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="section-title">{title}</h1>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10"
      />
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-slate-800 border border-slate-700/50 rounded-2xl w-full ${sizes[size]} shadow-2xl animate-fade-in`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function DataTable({ columns, data, loading, emptyMessage = 'No data found' }) {
  if (loading) return <LoadingSpinner text="Loading data..." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700/50">
            {columns.map((col) => (
              <th key={col.key} className="table-header text-left">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="table-cell">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-lg bg-slate-700/50 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors text-sm"
      >
        ← Prev
      </button>
      <span className="text-slate-400 text-sm">Page {page} of {totalPages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-lg bg-slate-700/50 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors text-sm"
      >
        Next →
      </button>
    </div>
  );
}

export function FormField({ label, error, children, required }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, required, error }) {
  return (
    <div>
      {label && <label className="label">{label} {required && <span className="text-red-400">*</span>}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-field appearance-none"
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
