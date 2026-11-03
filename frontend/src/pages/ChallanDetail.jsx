import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challansAPI, paymentsAPI } from '../../services/api';
import { StatusBadge, LoadingSpinner } from '../../components/ui';
import { FileText, MapPin, Calendar, Car, AlertTriangle, User, Download, CreditCard, ArrowLeft, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function ChallanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challan, setChallan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    challansAPI.get(id)
      .then(r => setChallan(r.data))
      .catch(() => toast.error('Challan not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Razorpay SDK failed to load');

      const { data: order } = await paymentsAPI.createOrder({ challan_id: challan.id });

      const options = {
        key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'FineSnap — Traffic Fine Payment',
        description: `Challan: ${challan.challan_number}`,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            await paymentsAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              challan_id: challan.id,
            });
            toast.success('Payment successful! Challan marked as paid.');
            setChallan(prev => ({ ...prev, payment_status: 'paid' }));
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: challan.vehicle?.owner_name },
        theme: { color: '#2563eb' },
        modal: { ondismiss: () => setPaying(false) },
      };
      new window.Razorpay(options).open();
    } catch (e) {
      toast.error(e.message || 'Payment failed');
      setPaying(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await challansAPI.pdf(challan.id);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `challan_${challan.challan_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading challan details..." />;
  if (!challan) return (
    <div className="text-center py-16">
      <p className="text-slate-400">Challan not found.</p>
      <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Header Card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400 text-sm">Challan Number</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{challan.challan_number}</h1>
            <div className="mt-2">
              <StatusBadge status={challan.payment_status} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Fine Amount</p>
            <p className="text-3xl font-bold text-white">₹{challan.fine_amount?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Vehicle Information</h3>
          <div className="space-y-3">
            <InfoRow icon={Car} label="Registration" value={challan.vehicle?.registration_number} />
            <InfoRow icon={Car} label="Type" value={challan.vehicle?.vehicle_type?.replace('_', ' ').toUpperCase()} />
            <InfoRow icon={User} label="Owner" value={challan.vehicle?.owner_name} />
            {challan.vehicle?.make && <InfoRow icon={Car} label="Make/Model" value={`${challan.vehicle.make} ${challan.vehicle.model || ''}`} />}
          </div>
        </div>

        <div className="card">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Violation Details</h3>
          <div className="space-y-3">
            <InfoRow icon={AlertTriangle} label="Violation" value={challan.violation?.name} highlight />
            <InfoRow icon={MapPin} label="Location" value={challan.location} />
            <InfoRow icon={Calendar} label="Date/Time" value={challan.violation_datetime ? format(new Date(challan.violation_datetime), 'dd MMM yyyy, hh:mm a') : '-'} />
            <InfoRow icon={User} label="Officer" value={challan.police_officer?.name} />
          </div>
        </div>
      </div>

      {/* Remarks */}
      {challan.remarks && (
        <div className="card mb-6">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Remarks</h3>
          <p className="text-slate-300 text-sm">{challan.remarks}</p>
        </div>
      )}

      {/* Evidence */}
      {challan.evidence_url && (
        <div className="card mb-6">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Image className="w-4 h-4" /> Evidence Photo
          </h3>
          <img
            src={challan.evidence_url}
            alt="Violation evidence"
            className="rounded-xl w-full max-h-80 object-cover border border-slate-700/50"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {challan.payment_status === 'unpaid' && (
          <button
            onClick={handlePay}
            disabled={paying}
            className="btn-success flex-1"
          >
            <CreditCard className="w-5 h-5" />
            {paying ? 'Processing...' : `Pay ₹${challan.fine_amount?.toLocaleString()}`}
          </button>
        )}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-secondary flex-1"
        >
          <Download className="w-5 h-5" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-slate-500 text-xs">{label}</p>
        <p className={`text-sm font-medium ${highlight ? 'text-amber-400' : 'text-white'}`}>{value || '—'}</p>
      </div>
    </div>
  );
}
