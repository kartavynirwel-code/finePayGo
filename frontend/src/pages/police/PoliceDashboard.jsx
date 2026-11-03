import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, DollarSign, Plus, Eye } from 'lucide-react';
import { dashboardAPI, challansAPI } from '../../services/api';
import { StatCard, LoadingSpinner, StatusBadge, PageHeader } from '../../components/ui';

export default function PoliceDashboard() {
  const [stats, setStats] = useState(null);
  const [recentChallans, setRecentChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, challansRes] = await Promise.all([
          dashboardAPI.police(),
          challansAPI.list({ page: 1, page_size: 5 }),
        ]);
        setStats(dashRes.data);
        setRecentChallans(challansRes.data?.results || challansRes.data || []);
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  if (error)
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Police Dashboard"
        subtitle="Overview of your challan activity"
        action={
          <Link
            to="/dashboard/police/generate"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate New Challan
          </Link>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Issued"
          value={stats?.total_issued ?? 0}
          icon={FileText}
          color="blue"
          subtitle="All time challans"
        />
        <StatCard
          title="Paid"
          value={stats?.total_paid ?? 0}
          icon={CheckCircle}
          color="green"
          subtitle="Cleared challans"
        />
        <StatCard
          title="Unpaid"
          value={stats?.total_unpaid ?? 0}
          icon={XCircle}
          color="red"
          subtitle="Pending challans"
        />
        <StatCard
          title="Total Amount Issued"
          value={`₹${(stats?.total_amount_issued ?? 0).toLocaleString('en-IN')}`}
          icon={DollarSign}
          color="amber"
          subtitle="Cumulative fines"
        />
      </div>

      {/* Recent Challans */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Recent Challans</h2>
          <Link
            to="/dashboard/police/challans"
            className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
          >
            View All →
          </Link>
        </div>

        {recentChallans.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No challans issued yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Challan No', 'Vehicle', 'Violation', 'Amount', 'Status', 'Date', 'Actions'].map(
                    (h) => (
                      <th key={h} className="table-header text-left">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {recentChallans.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="table-cell font-mono text-blue-400">
                      {c.challan_number}
                    </td>
                    <td className="table-cell">{c.vehicle_registration}</td>
                    <td className="table-cell">{c.violation_type}</td>
                    <td className="table-cell text-amber-400">
                      ₹{Number(c.fine_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="table-cell text-slate-400">
                      {c.violation_datetime
                        ? new Date(c.violation_datetime).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td className="table-cell">
                      <a
                        href={`/api/challans/${c.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
