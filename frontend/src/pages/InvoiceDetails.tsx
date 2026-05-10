import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, FileText, CheckCircle2, 
  Search, Filter, SortAsc, PieChart as PieChartIcon,
  CreditCard, Calendar, User, Tag, Info, ChevronRight,
  Loader2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/axios';

interface InvoiceItem {
  id: number;
  category: string;
  description: string;
  qtyDetails: string;
  unitCost: number;
  amount: number;
}

interface InvoiceData {
  invoiceId: string;
  generatedDate: string;
  travelerDetails: string[];
  paymentStatus: 'pending' | 'paid' | 'overdue' | 'completed';
  tripName: string;
  tripDates: string;
  tripCreator: string;
  totalBudget: number;
  totalSpent: number;
  items: InvoiceItem[];
}

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actualTripId, setActualTripId] = useState<string | null>(null);

  const fetchInvoiceData = async (tripIdParam: string | undefined) => {
    try {
      setLoading(true);
      let tripId = tripIdParam;
      
      // If ID is 'default' or we are searching for a new one
      if (tripId === 'default' || !tripId) {
        const tripsRes = await api.get('/trips');
        if (tripsRes.data && tripsRes.data.length > 0) {
          tripId = tripsRes.data[0].id || tripsRes.data[0]._id;
        } else {
          setLoading(false);
          return;
        }
      }

      const response = await api.get(`/trips/${tripId}`);
      const trip = response.data;
      setActualTripId(tripId!);
      
      // Flatten stops and activities into invoice items
      const invoiceItems: InvoiceItem[] = [];
      let counter = 1;
      
      (trip.stops || []).forEach((stop: any) => {
        (stop.activities || []).forEach((activity: any) => {
          invoiceItems.push({
            id: counter++,
            category: stop.cityName || 'Activity',
            description: activity.name || 'Travel Activity',
            qtyDetails: activity.time || 'Scheduled',
            unitCost: Number(activity.cost) || 0,
            amount: Number(activity.cost) || 0
          });
        });
      });

      setInvoice({
        invoiceId: `INV-${tripId?.slice(-6).toUpperCase() || '30290'}`,
        generatedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        travelerDetails: trip.companionType ? [trip.companionType] : ['Solo Traveler'],
        paymentStatus: trip.paymentStatus || 'pending',
        tripName: trip.name || 'Unnamed Trip',
        tripDates: trip.startDate ? `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}` : 'Dates TBD',
        tripCreator: trip.createdBy?.name || 'User',
        totalBudget: trip.budgetEstimate || 0,
        totalSpent: invoiceItems.reduce((sum, item) => sum + item.amount, 0),
        items: invoiceItems
      });
    } catch (error) {
      console.error('Failed to fetch original invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData(id);
  }, [id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const res = await api.get('/trips');
      const match = res.data.find((t: any) => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (match) {
        navigate(`/billing/${match.id || match._id}`);
      } else {
        alert('No trip found with that name');
        setLoading(false);
      }
    } catch (err) {
      console.error('Search failed', err);
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!actualTripId || isUpdating) return;
    setIsUpdating(true);
    try {
      await api.patch(`/trips/${actualTripId}`, { paymentStatus: 'completed' });
      setInvoice(prev => prev ? { ...prev, paymentStatus: 'completed' } : null);
    } catch (err) {
      console.error('Update status failed', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
        />
        <p className="text-gray-500 font-bold animate-pulse">Loading Original Data...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
        <div className="p-6 bg-red-50 rounded-full">
          <Info className="w-12 h-12 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">No Trip Data Found</h2>
          <p className="text-gray-500 font-medium">Create a trip first to see billing details.</p>
        </div>
        <Link to="/create-trip" className="px-8 py-3 bg-purple-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-purple-100">
          Create New Trip
        </Link>
      </div>
    );
  }

  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.05;
  const discount = 50;
  const grandTotal = subtotal + tax - discount;

  const chartData = [
    { name: 'Spent', value: invoice.totalSpent, color: '#9333ea' },
    { name: 'Remaining', value: Math.max(0, invoice.totalBudget - invoice.totalSpent), color: '#f3f4f6' },
  ];

  return (
    <div className="space-y-8 pb-12 print:p-0 print:space-y-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-border { border: 1px solid #eee !important; border-radius: 0 !important; }
          .max-w-7xl { max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm no-print">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-gray-50 rounded-2xl transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trip name..." 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-100 transition-all font-medium"
            />
          </form>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-sm font-bold text-gray-600 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-sm font-bold text-gray-600 transition-all">
            <SortAsc className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Invoice Card */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
          <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center text-center space-y-4 min-w-[240px]">
            <div className="w-32 h-32 bg-white rounded-[2rem] shadow-sm flex items-center justify-center border border-gray-100 overflow-hidden">
               <img 
                src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80" 
                alt="Trip" 
                className="w-full h-full object-cover"
               />
            </div>
            <div>
              <h2 className="font-black text-gray-900 leading-tight">{invoice.tripName}</h2>
              <p className="text-xs font-bold text-gray-400 mt-1">{invoice.tripDates}</p>
              <p className="text-[10px] uppercase tracking-widest font-black text-purple-600 mt-2">Created by {invoice.tripCreator}</p>
            </div>
          </div>
          
          <div className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoice ID</p>
                <p className="text-sm font-bold text-gray-900">{invoice.invoiceId}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Traveler Details</p>
                <div className="flex flex-wrap gap-1">
                  {invoice.travelerDetails.map((name, i) => (
                    <span key={i} className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                      {name}{i < invoice.travelerDetails.length - 1 ? '' : ''}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Generated Date</p>
                <p className="text-sm font-bold text-gray-900">{invoice.generatedDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${invoice.paymentStatus === 'completed' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]'} animate-pulse`} />
                  <p className={`text-sm font-black tracking-tight ${invoice.paymentStatus === 'completed' ? 'text-green-600' : 'text-gray-900'}`}>
                    {invoice.paymentStatus === 'completed' ? 'COMPLETED' : 'PENDING'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Insights */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">Budget Insights</h3>
            <PieChartIcon className="w-4 h-4 text-purple-600" />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-gray-400 leading-none">Total Budget</p>
                <p className="text-lg font-black text-gray-900">${invoice.totalBudget}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-purple-600 leading-none">Total Spent</p>
                <p className="text-lg font-black text-purple-600">${invoice.totalSpent}</p>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 leading-none">Remaining</p>
                <p className={`text-sm font-black ${invoice.totalBudget - invoice.totalSpent < 0 ? 'text-red-500' : 'text-green-500'}`}>
                  ${invoice.totalBudget - invoice.totalSpent}
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate(`/trips/${actualTripId}`)}
            className="w-full mt-6 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group no-print"
          >
            View Full Budget
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">#</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty/Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit Cost</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoice.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6 text-sm font-bold text-gray-400">{idx + 1}</td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-900">{item.description}</td>
                  <td className="px-8 py-6 text-sm font-medium text-gray-500">{item.qtyDetails}</td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-900">${item.unitCost}</td>
                  <td className="px-8 py-6 text-sm font-black text-gray-900 text-right">${item.amount}</td>
                </tr>
              ))}
              {/* Empty rows to match wireframe style */}
              {[1, 2].map(i => (
                <tr key={`empty-${i}`} className="h-16">
                  <td colSpan={6}></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50/50 border-t border-gray-100">
                <td colSpan={4} className="px-8 py-8"></td>
                <td className="px-8 py-8 space-y-3 text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase">Subtotal</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">Tax(5%)</p>
                  <p className="text-xs font-bold text-gray-400 uppercase">Discount</p>
                  <p className="text-sm font-black text-gray-900 uppercase pt-2">Grand Total</p>
                </td>
                <td className="px-8 py-8 space-y-3 text-right">
                  <p className="text-xs font-black text-gray-900">${subtotal}</p>
                  <p className="text-xs font-black text-gray-900">${tax.toFixed(2)}</p>
                  <p className="text-xs font-black text-red-500">-${discount}</p>
                  <p className="text-xl font-black text-purple-600 pt-2">${grandTotal.toFixed(2)}</p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-xs font-black uppercase tracking-widest text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
        </div>
        <button 
          onClick={handleMarkAsPaid}
          disabled={isUpdating || invoice.paymentStatus === 'completed'}
          className="flex items-center gap-2 px-10 py-4 bg-purple-600 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {invoice.paymentStatus === 'completed' ? 'Completed' : 'Mark as Done'}
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetails;
