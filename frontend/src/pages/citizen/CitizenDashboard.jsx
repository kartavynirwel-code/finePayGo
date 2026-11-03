import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Car, FileText, XCircle, CheckCircle, CreditCard, AlertCircle } from 'lucide-react';
import { dashboardAPI, challansAPI } from '../../services/api';
import { StatCard, LoadingSpinner, StatusBadge, PageHeader } from '../../components/ui';

export default function CitizenDashboard() {
  const [stats, setStats] = useState(null);
  const [recentChallans, setRecentChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, challansRes] = await Promise.all([
          dashboardAPI.citizen(),
          challansAPI.myChallans({ page: 1, page_size: 5 }),
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
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="My Dashboard"
        subtitle="Overview of your vehicles and challans"
        action={
          <Link to="/dashboard/citizen/challans" className="btn-primary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            View All Challans
          </Link>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard
          title="My Vehicles"
          value={stats?.total_vehicles ?? 0}
          icon={Car}
          color="blue"
          subtitle="Registered vehicles"
        />
        <StatCard
          title="Total Challans"
          value={stats?.total_challans ?? 0}
          icon={FileText}
          color="purple"
          subtitle="All challans issued"
        />
        <StatCard
          title="Unpaid Fines"
          value={stats?.unpaid_challans ?? 0}
          icon={XCircle}
          color="red"
          subtitle="Action required"
        />
        <StatCard
          title="Total Paid"
          value={stats?.paid_challans ?? 0}
          icon={CheckCircle}
          color="green"
          subtitle="Cleared challans"
        />
        <StatCard
          title="Pending Amount"
          value={`₹${(stats?.pending_amount ?? 0).toLocaleString('en-IN')}`}
          icon={CreditCard}
          color="amber"
          subtitle="Outstanding dues"
        />
      </div>

      {/* Recent Challans */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Recent Challans</h2>
          <Link
            to="/dashboard/citizen/challans"
            className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
          >
            View All →
          </Link>
        </div>

        {recentChallans.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No challans found. Drive safe! 🚗
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {['Challan No', 'Vehicle', 'Violation', 'Amount', 'Status', 'Date', 'Action'].map(
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
                    <td className="table-cell font-mono text-blue-400">{c.challan_number}</td>
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
                      {c.status?.toLowerCase() === 'unpaid' ? (
                        <Link
                          to="/dashboard/citizen/challans"
                          className="inline-flex items-center gap-1 text-xs text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CreditCard className="w-3 h-3" />
                          Pay Now
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
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
