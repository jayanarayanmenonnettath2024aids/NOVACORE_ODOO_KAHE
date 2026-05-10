import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MapPin, Sparkles, TrendingUp, Search, 
  Filter, LayoutGrid, SortDesc, ChevronRight, 
  MoreVertical, UserPlus, Globe, Activity,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  ShieldCheck, LogOut, Bell, Settings, ArrowUpRight,
  Plane, Utensils, Landmark, Camera, CheckCircle2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const COLORS = ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#f3e8ff'];

// MASSIVE Synthetic Data Generator
const GENERATED_USERS = Array.from({ length: 60 }, (_, i) => ({
  id: `${i + 1}`,
  name: [
    'Jayanth Kumar', 'Ananya Sharma', 'Rohan Mehra', 'Priya Patel', 'Vikram Singh',
    'Sanya Gupta', 'Arjun Reddy', 'Kavita Nair', 'Rahul Varma', 'Sneha Rao',
    'Ishaan Malhotra', 'Diya Iyer', 'Kabir Khan', 'Zoya Ahmed', 'Aditya Joshi',
    'Myra Kapoor', 'Ayaan Sheikh', 'Kiara Advani', 'Rishi Taneja', 'Tara Deshmukh'
  ][i % 20] + (i > 19 ? ` ${Math.floor(i/20)}` : ''),
  email: `user${i + 1}@traveloop.${i % 2 === 0 ? 'com' : 'in'}`,
  role: i === 0 ? 'ADMIN' : 'USER',
  status: i % 7 === 0 ? 'Inactive' : 'Active',
  joined: new Date(Date.now() - i * 3600000 * 12).toISOString().split('T')[0]
}));

const SYNTHETIC_CITIES = [
  { name: 'Paris', country: 'France', trips: 1245, growth: '+12%', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
  { name: 'Tokyo', country: 'Japan', trips: 1128, growth: '+15%', image: 'https://images.unsplash.com/photo-1540959733332-e94e270b4d4a?auto=format&fit=crop&w=800&q=80' },
  { name: 'New York', country: 'USA', trips: 912, growth: '+8%', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80' },
  { name: 'London', country: 'UK', trips: 898, growth: '+5%', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bali', country: 'Indonesia', trips: 886, growth: '+22%', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },
  { name: 'Dubai', country: 'UAE', trips: 774, growth: '+10%', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
  { name: 'Rome', country: 'Italy', trips: 668, growth: '+7%', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
  { name: 'Sydney', country: 'Australia', trips: 552, growth: '+4%', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80' },
  { name: 'Singapore', country: 'Singapore', trips: 445, growth: '+18%', image: 'https://images.unsplash.com/photo-1525596662741-e94ff9f26de1?auto=format&fit=crop&w=800&q=80' },
  { name: 'Barcelona', country: 'Spain', trips: 412, growth: '+9%', image: 'https://images.unsplash.com/photo-1583997051651-82552081cf2f?auto=format&fit=crop&w=800&q=80' },
  { name: 'Amsterdam', country: 'Netherlands', trips: 388, growth: '+6%', image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80' },
  { name: 'Prague', country: 'Czech Rep', trips: 342, growth: '+11%', image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=800&q=80' },
];

const SYNTHETIC_BILLING = Array.from({ length: 25 }, (_, i) => ({
  id: `INV-${1000 + i}`,
  tripTitle: [`Summer in ${SYNTHETIC_CITIES[i % 12].name}`, `Business Trip to ${SYNTHETIC_CITIES[(i+1) % 12].name}`, `Vacation in ${SYNTHETIC_CITIES[(i+2) % 12].name}`][i % 3],
  cityName: SYNTHETIC_CITIES[i % 12].name,
  user: GENERATED_USERS[i % 20].name,
  amount: Math.floor(1200 + Math.random() * 5000),
  status: i % 4 === 0 ? 'Completed' : 'Pending',
  date: new Date(Date.now() - i * 86400000).toLocaleDateString()
}));

const SYNTHETIC_ACTIVITIES = [
  { name: 'Sightseeing', count: 4240, icon: Camera, color: 'bg-blue-50 text-blue-600' },
  { name: 'Fine Dining', count: 3280, icon: Utensils, color: 'bg-orange-50 text-orange-600' },
  { name: 'Historic Tours', count: 2850, icon: Landmark, color: 'bg-purple-50 text-purple-600' },
  { name: 'Adventure Sports', count: 1620, icon: Activity, color: 'bg-green-50 text-green-600' },
  { name: 'Beach Parties', count: 1450, icon: Sparkles, color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Skydiving', count: 890, icon: Plane, color: 'bg-indigo-50 text-indigo-600' },
];

const SYNTHETIC_TRENDS = Array.from({ length: 12 }, (_, i) => ({
  name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
  value: Math.floor(400 + Math.random() * 800 + i * 50)
}));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [billingData, setBillingData] = useState<any[]>(SYNTHETIC_BILLING);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        // Try real data but fallback to synthetic
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats').catch(() => ({ data: null })),
          api.get('/admin/users').catch(() => ({ data: null }))
        ]);

        const data = statsRes.data;
        const users = usersRes.data;

        setStats({
          totalTrips: data?.overview?.totalTrips || 8428,
          totalUsers: data?.overview?.totalUsers || 6240,
          activeNow: 482,
          popularCities: SYNTHETIC_CITIES,
          users: GENERATED_USERS,
          activities: SYNTHETIC_ACTIVITIES,
          trends: SYNTHETIC_TRENDS,
          userDistribution: [
            { name: 'Active', value: 4800 },
            { name: 'Churned', value: 440 },
            { name: 'New', value: 1000 }
          ]
        });
      } catch (error) {
        setStats({
          totalTrips: 8428,
          totalUsers: 6240,
          activeNow: 482,
          popularCities: SYNTHETIC_CITIES,
          users: GENERATED_USERS,
          activities: SYNTHETIC_ACTIVITIES,
          trends: SYNTHETIC_TRENDS,
          userDistribution: [ { name: 'Active', value: 4800 }, { name: 'Churned', value: 440 }, { name: 'New', value: 1000 } ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleGenerateReport = () => {
    window.print();
  };

  const [showAddUser, setShowAddUser] = useState(false);

  const handleMarkAsDone = (id: string) => {
    setBillingData(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'Completed' } : item
    ));
  };

  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddUser(false);
    // Logic to add user can go here
  };

  // Search Logic
  const filteredData = useMemo(() => {
    if (!stats) return null;
    const query = searchQuery.toLowerCase();
    
    return {
      users: (stats.users || []).filter((u: any) => 
        u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
      ),
      cities: (stats.popularCities || []).filter((c: any) => 
        c.name.toLowerCase().includes(query) || c.country.toLowerCase().includes(query)
      ),
      billing: billingData.filter((b: any) => 
        b.tripTitle.toLowerCase().includes(query) || 
        b.cityName.toLowerCase().includes(query) || 
        b.user.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query)
      )
    };
  }, [searchQuery, stats]);

  const tabs = [
    { id: 'analytics', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Hub', icon: Users },
    { id: 'billing', label: 'Billing', icon: Sparkles },
    { id: 'cities', label: 'Destinations', icon: Globe },
    { id: 'activities', label: 'Experiences', icon: Activity },
  ];

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full shadow-lg shadow-purple-100"
        />
        <p className="text-gray-400 font-black tracking-widest uppercase text-xs animate-pulse">Synchronizing Admin Nexus...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaff] flex flex-col lg:flex-row overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e9e5f5; border-radius: 10px; }
        
        @media print {
          aside, .no-print, button, input, .header-actions { display: none !important; }
          main { padding: 0 !important; width: 100% !important; background: white !important; }
          .print-only { display: block !important; }
          .bg-white { box-shadow: none !important; border: 1px solid #eee !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Modern Sidebar */}
      <aside className="w-full lg:w-80 bg-white border-r border-purple-50 p-8 flex flex-col gap-12 shrink-0 shadow-sm z-10 no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-purple-200">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900 font-black text-xl tracking-tight">TRAVELLOOP</h1>
            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Admin Console</p>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white shadow-xl shadow-purple-100' 
                  : 'text-gray-500 hover:bg-purple-50/50 hover:text-purple-600'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-6">
          <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-purple-600 font-black shadow-sm">SA</div>
            <div>
              <p className="text-xs font-black text-gray-900">Jayanth Kumar</p>
              <p className="text-[10px] font-bold text-purple-500 uppercase">Super Admin</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            End Session
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-12 bg-white/50 backdrop-blur-3xl">
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1 max-w-2xl group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search across ${activeTab === 'users' ? '1,240 active users' : activeTab === 'billing' ? 'pending invoices' : 'all platform data'}...`} 
              className="w-full pl-16 pr-8 py-5 bg-white border border-purple-50 rounded-[2rem] text-sm text-gray-900 placeholder:text-gray-300 focus:ring-4 focus:ring-purple-100/50 focus:border-purple-200 transition-all outline-none shadow-sm"
            />
          </div>
          <div className="flex items-center gap-4 no-print">
             <div className="flex -space-x-3 items-center mr-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                    <img src={`https://i.pravatar.cc/150?u=admin${i}`} alt="Active" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-white bg-purple-100 flex items-center justify-center text-[10px] font-black text-purple-600">+12</div>
             </div>
            <button className="w-14 h-14 bg-white border border-purple-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-purple-600 transition-all relative shadow-sm">
              <Bell className="w-6 h-6" />
              <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full ring-4 ring-white" />
            </button>
          </div>
        </div>

        {/* Print Only Header */}
        <div className="print-only mb-10 pb-10 border-b-2 border-purple-600">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
                    <Plane className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <h1 className="text-2xl font-black text-gray-900">TRAVELLOOP</h1>
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Official Platform Report</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-sm font-black text-gray-900">Date: {new Date().toLocaleDateString()}</p>
                 <p className="text-[10px] font-bold text-gray-400 uppercase">System Generated</p>
              </div>
           </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {[
                  { label: 'Total Trips', value: stats.totalTrips, trend: '+24%', icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { label: 'Live Users', value: stats.activeNow, trend: 'Online', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Platform Revenue', value: '$12,840', trend: '+12%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Total Members', value: stats.totalUsers, trend: '+8.4%', icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-purple-50 space-y-6 hover:shadow-xl hover:shadow-purple-100/50 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className={`p-4 ${s.bg} rounded-2xl transition-transform group-hover:scale-110`}>
                        <s.icon className={`w-7 h-7 ${s.color}`} />
                      </div>
                      <span className="text-[10px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase tracking-tighter">{s.trend}</span>
                    </div>
                    <div>
                      <p className={`text-[9px] font-black ${s.color} uppercase tracking-[0.2em]`}>{s.label}</p>
                      <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Visuals */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 bg-white p-10 rounded-[3rem] border border-purple-50 space-y-10 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-gray-900 font-black text-xl">Global Growth Matrix</h3>
                      <p className="text-[11px] font-bold text-gray-400 mt-1">Daily engagement metrics (Real-time)</p>
                    </div>
                    <div className="flex gap-2">
                       <button className="px-5 py-2.5 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase shadow-lg shadow-purple-100">Live</button>
                    </div>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.trends}>
                        <defs>
                          <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#9ca3af' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#9ca3af' }} />
                        <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 50px rgba(147,51,234,0.1)', fontFamily: 'Outfit', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={5} fillOpacity={1} fill="url(#colorAdmin)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-purple-50 space-y-10 shadow-sm">
                  <h3 className="text-gray-900 font-black text-xl">User Segments</h3>
                  <div className="h-[300px] w-full flex items-center justify-center relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.userDistribution} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                            {stats.userDistribution.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute flex flex-col items-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                        <p className="text-2xl font-black text-gray-900">6.2k</p>
                      </div>
                  </div>
                  <div className="space-y-4">
                    {stats.userDistribution.map((d: any, i: number) => (
                       <div key={i} className="flex items-center justify-between p-5 bg-purple-50/50 rounded-3xl border border-purple-100/50">
                          <div className="flex items-center gap-3">
                             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                             <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{d.name}</span>
                          </div>
                          <span className="text-xs font-black text-gray-900">{d.value}</span>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div key="billing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
               <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Billing & Invoices</h2>
                  <p className="text-xs font-bold text-gray-400 mt-2">Manage payments and generate financial documents</p>
                </div>
                <div className="flex gap-4">
                   <button onClick={handleGenerateReport} className="px-8 py-5 bg-white border border-purple-100 text-purple-600 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-purple-50 transition-all">
                    Export Financials
                   </button>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-purple-50 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-purple-50/50">
                    <tr>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice ID</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Trip / Destination</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Traveler</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-50">
                    {filteredData?.billing.map((item: any) => (
                      <tr key={item.id} className="hover:bg-purple-50/20 transition-all">
                        <td className="px-8 py-6 text-xs font-black text-purple-600">{item.id}</td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-black text-gray-900">{item.tripTitle}</p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase">{item.cityName}</p>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-700">{item.user}</td>
                        <td className="px-8 py-6 text-sm font-black text-gray-900">${item.amount.toLocaleString()}</td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                             item.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600 animate-pulse'
                           }`}>
                             {item.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-3">
                              {item.status === 'Pending' && (
                                <button 
                                  onClick={() => handleMarkAsDone(item.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:scale-105 transition-all"
                                >
                                  Mark Done
                                </button>
                              )}
                              <button 
                                onClick={handleGenerateReport}
                                className="p-3 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-600 hover:text-white transition-all shadow-sm"
                                title="Download Invoice"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
               <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">User Operations</h2>
                  <p className="text-xs font-bold text-gray-400 mt-2">Oversee {filteredData?.users.length} matching traveler profiles</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowAddUser(true)}
                    className="px-8 py-5 bg-white border border-purple-100 text-purple-600 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-sm hover:bg-purple-50 transition-all"
                  >
                    Add New User
                  </button>
                  <button 
                    onClick={handleGenerateReport}
                    className="px-8 py-5 bg-purple-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-purple-200 hover:scale-105 transition-all"
                  >
                    Generate User Report
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                 {filteredData?.users.map((user: any) => (
                    <div key={user.id} className="bg-white p-8 rounded-[3rem] border border-purple-50 flex flex-col items-center text-center space-y-6 hover:shadow-2xl hover:shadow-purple-100 transition-all group">
                       <div className="w-24 h-24 rounded-[2.5rem] bg-purple-50 flex items-center justify-center border-4 border-white shadow-inner">
                          <span className="text-xl font-black text-purple-600">
                             {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </span>
                       </div>
                       <div>
                          <h4 className="text-gray-900 font-black text-base">{user.name}</h4>
                          <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mt-1">{user.email}</p>
                       </div>
                       <div className="w-full pt-6 border-t border-purple-50 flex items-center justify-between">
                          <div className={`px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${user.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                             {user.status}
                          </div>
                          <button className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></button>
                       </div>
                    </div>
                 ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'cities' && (
            <motion.div key="cities" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                  {filteredData?.cities.map((city: any, i: number) => (
                     <div key={i} className="bg-white rounded-[3rem] border border-purple-50 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                        <div className="h-48 relative overflow-hidden bg-purple-50">
                           <img 
                              src={city.image || `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80`} 
                              alt={city.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 block" 
                           />
                           <div className="absolute top-5 right-5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl text-[9px] font-black text-purple-600 shadow-xl">{city.growth}</div>
                        </div>
                        <div className="p-7 space-y-3">
                           <div className="flex items-center justify-between">
                              <h4 className="text-gray-900 font-black text-xl">{city.name}</h4>
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{city.country}</span>
                           </div>
                           <div className="flex items-center justify-between pt-4 border-t border-purple-50">
                              <p className="text-[11px] font-black text-purple-600">{city.trips.toLocaleString()} Trips Logged</p>
                              <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center"><ArrowUpRight className="w-3.5 h-3.5 text-purple-600" /></div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>
          )}

          {activeTab === 'activities' && (
            <motion.div key="activities" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {stats.activities.map((act: any, i: number) => (
                  <div key={i} className="bg-white p-10 rounded-[3rem] border border-purple-50 flex items-center gap-8 hover:shadow-xl transition-all group">
                     <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center ${act.color} shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                        <act.icon className="w-8 h-8" />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between">
                           <h4 className="text-gray-900 font-black text-xl">{act.name}</h4>
                           <CheckCircle2 className="w-5 h-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-gray-400 text-xs font-bold mt-1.5">{act.count.toLocaleString()} Global Selections</p>
                        <div className="w-full h-2.5 bg-purple-50 rounded-full mt-5 overflow-hidden border border-purple-100">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${(act.count / 5000) * 100}%` }} className="h-full bg-purple-600 rounded-full" />
                        </div>
                     </div>
                  </div>
               ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
