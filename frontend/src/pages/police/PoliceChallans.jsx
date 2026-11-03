import { useState, useEffect, useCallback } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { challansAPI } from '../../services/api';
import {
  LoadingSpinner,
  StatusBadge,
  PageHeader,
  SearchInput,
  Pagination,
} from '../../components/ui';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
];

export default function PoliceChallans() {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);

  const PAGE_SIZE = 10;

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await challansAPI.list(params);
      const data = res.data;
      if (data?.results) {
        setChallans(data.results);
        setTotalCount(data.count ?? data.results.length);
        setTotalPages(Math.ceil((data.count ?? data.results.length) / PAGE_SIZE));
      } else {
        const arr = Array.isArray(data) ? data : [];
        setChallans(arr);
        setTotalCount(arr.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch challans:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(fetchChallans, 400);
    return () => clearTimeout(timeout);
  }, [fetchChallans]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleDownloadPDF = async (challan) => {
    setDownloadingId(challan.id);
    try {
      const res = await challansAPI.pdf(challan.id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `challan-${challan.challan_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="My Issued Challans"
        subtitle={`${totalCount} challan${totalCount !== 1 ? 's' : ''} found`}
        action={
          <button
            onClick={fetchChallans}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(v) => setSearch(v)}
            placeholder="Search by challan no, vehicle, violation..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:w-44 appearance-none"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner text="Loading challans..." />
          </div>
        ) : challans.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No challans found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  {[
                    'Challan No',
                    'Vehicle',
                    'Violation',
                    'Amount',
                    'Status',
                    'Date',
                    'Actions',
                  ].map((h) => (
                    <th key={h} className="table-header text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="table-cell font-mono text-blue-400 text-sm">
                      {c.challan_number}
                    </td>
                    <td className="table-cell font-medium">{c.vehicle_registration}</td>
                    <td className="table-cell text-slate-300">{c.violation_type}</td>
                    <td className="table-cell text-amber-400 font-medium">
                      ₹{Number(c.fine_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="table-cell">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="table-cell text-slate-400 text-sm">
                      {c.violation_datetime
                        ? new Date(c.violation_datetime).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleDownloadPDF(c)}
                        disabled={downloadingId === c.id}
                        className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {downloadingId === c.id ? (
                          <div className="spinner w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        View PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
