import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Map, TrendingUp, ArrowUpRight, Search, Filter, Loader2, Globe, ShieldAlert, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api/axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users')
        ]);
        setData(statsRes.data);
        setUsers(usersRes.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
           setError(true);
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>;
  
  if (error) return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
       <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-red-500 shadow-2xl shadow-red-100">
          <ShieldAlert className="w-12 h-12" />
       </div>
       <h2 className="text-4xl font-black text-gray-900 tracking-tight">Access Denied</h2>
       <p className="text-gray-500 font-bold max-w-sm">This area is reserved for Traveloop administrators only. If you believe this is an error, please contact support.</p>
       <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-all">RETURN TO DASHBOARD</button>
    </div>
  );

  const stats = [
    { label: 'Total Users', value: data?.overview.totalUsers, change: '+12%', icon: Users, color: 'blue' },
    { label: 'Active Trips', value: data?.overview.totalTrips, change: '+18%', icon: Map, color: 'green' },
    { label: 'Total Stops', value: data?.overview.totalStops, change: '+7%', icon: Globe, color: 'purple' },
    { label: 'Engagement', value: data?.overview.totalActivities, change: '+2%', icon: TrendingUp, color: 'amber' },
  ];

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-5xl font-black text-gray-900 tracking-tight">Admin Console</h1>
           <p className="text-gray-500 font-bold mt-1 text-lg">Centralized platform intelligence and user control hub.</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-white border border-gray-100 rounded-xl font-black text-xs text-gray-500 hover:bg-gray-50 transition-all">EXPORT CSV</button>
           <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">REFRESH STATS</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-50/20"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className={`p-4 rounded-2xl ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : stat.color === 'green' ? 'bg-green-50 text-green-600' : stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'}`}>
                    <Icon className="w-6 h-6" />
                 </div>
                 <span className="flex items-center gap-1 text-green-500 font-black text-xs bg-green-50 px-3 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> {stat.change}
                 </span>
              </div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</h4>
              <p className="text-4xl font-black text-gray-900 mt-2">{stat.value?.toLocaleString()}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-blue-50/40">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">User Acquisition Trend</h3>
              <select className="bg-gray-50 border-none rounded-xl text-xs font-black px-4 py-2">
                 <option>Last 7 Days</option>
                 <option>Last 30 Days</option>
              </select>
           </div>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.popularCities || []}>
                  <XAxis dataKey="cityName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'black', fill: '#94a3b8' }} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="_count.id" fill="#3b82f6" radius={[10, 10, 0, 0]}>
                     {data?.popularCities.map((entry: any, index: number) => (
                       <Cell key={`cell-${index}`} fill={index === 0 ? '#1d4ed8' : '#3b82f6'} />
                     ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
           <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6">Top destinations by trip volume</p>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-blue-50/40">
           <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Recent Activity</h3>
           <div className="space-y-6">
              {data?.recentUsers.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-blue-50 rounded-2xl transition-all group">
                   <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">
                      {item.name[0]}
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-gray-800 text-sm">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Joined {new Date(item.createdAt).toLocaleDateString()}</p>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                </div>
              ))}
           </div>
           <button className="w-full mt-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs hover:bg-gray-900 hover:text-white transition-all uppercase tracking-widest">View All Logs</button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-blue-50/40 overflow-hidden">
         <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <h3 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h3>
               <p className="text-gray-400 font-bold text-sm">Review, verify, and manage platform participants.</p>
            </div>
            <div className="flex gap-3">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Filter by name..." className="pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 text-sm font-black" />
               </div>
               <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                  <Filter className="w-5 h-5" />
               </button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50/50">
                  <tr>
                     <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User Profile</th>
                     <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Role</th>
                     <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Registration</th>
                     <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {users.map((user: any, idx: number) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black shadow-inner">
                                {user.name[0]}
                             </div>
                             <div>
                                <p className="font-black text-gray-900 text-lg">{user.name}</p>
                                <p className="text-xs text-gray-400 font-bold">{user.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600 border border-indigo-200' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                             {user.role}
                          </span>
                       </td>
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                             <Calendar className="w-4 h-4 text-blue-300" />
                             {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                       </td>
                       <td className="px-10 py-6">
                          <button className="bg-white border border-gray-100 text-blue-600 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm">MANAGE</button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
