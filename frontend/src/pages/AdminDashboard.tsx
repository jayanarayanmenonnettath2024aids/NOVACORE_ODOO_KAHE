import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Map, BarChart3, TrendingUp, ArrowUpRight, Search, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '12,482', change: '+12%', icon: Users, color: 'blue' },
    { label: 'Active Trips', value: '45,201', change: '+18%', icon: Map, color: 'green' },
    { label: 'Revenue (SaaS)', value: '$128,400', change: '+7%', icon: BarChart3, color: 'purple' },
    { label: 'Engagement', value: '94%', change: '+2%', icon: TrendingUp, color: 'amber' },
  ];

  const chartData = [
    { name: 'Mon', users: 400, trips: 240 },
    { name: 'Tue', users: 300, trips: 139 },
    { name: 'Wed', users: 200, trips: 980 },
    { name: 'Thu', users: 278, trips: 390 },
    { name: 'Fri', users: 189, trips: 480 },
    { name: 'Sat', users: 239, trips: 380 },
    { name: 'Sun', users: 349, trips: 430 },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Insights</h1>
        <p className="text-gray-500 font-bold">Monitor platform growth and user engagement metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                 <div className={`p-3 rounded-2xl ${stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : stat.color === 'green' ? 'bg-green-50 text-green-600' : stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'}`}>
                    <Icon className="w-6 h-6" />
                 </div>
                 <span className="flex items-center gap-1 text-green-500 font-black text-xs">
                    <ArrowUpRight className="w-3 h-3" /> {stat.change}
                 </span>
              </div>
              <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">{stat.label}</h4>
              <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <h3 className="text-xl font-black text-gray-900 mb-8">Platform Usage Trend</h3>
           <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                  <YAxis hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="trips" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <h3 className="text-xl font-black text-gray-900 mb-6">Popular Destinations</h3>
           <div className="space-y-4">
              {[
                { name: 'Tokyo, Japan', users: '1,240', trend: 'up' },
                { name: 'Paris, France', users: '980', trend: 'up' },
                { name: 'Bali, Indonesia', users: '850', trend: 'down' },
                { name: 'New York, USA', users: '720', trend: 'up' },
                { name: 'Santorini, Greece', users: '610', trend: 'up' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-blue-50 transition-all cursor-pointer">
                   <div>
                      <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{item.name}</p>
                      <p className="text-xs text-gray-400 font-bold">{item.users} active planners</p>
                   </div>
                   <div className={`p-2 rounded-lg ${item.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      <TrendingUp className={`w-4 h-4 ${item.trend === 'down' ? 'rotate-180' : ''}`} />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-black text-gray-900">User Management</h3>
            <div className="flex gap-2">
               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-100 text-sm font-bold" />
               </div>
               <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all">
                  <Filter className="w-5 h-5" />
               </button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-gray-50/50">
                  <tr>
                     <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                     <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Plan</th>
                     <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                     <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {[
                    { name: 'Sarah Miller', email: 'sarah@example.com', plan: 'Premium', status: 'Active', joined: 'Oct 24, 2023' },
                    { name: 'Mark Wilson', email: 'mark@example.com', plan: 'Free', status: 'Inactive', joined: 'Nov 02, 2023' },
                    { name: 'Elena Rodriguez', email: 'elena@example.com', plan: 'Premium', status: 'Active', joined: 'Dec 15, 2023' },
                  ].map((user, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                                {user.name[0]}
                             </div>
                             <div>
                                <p className="font-bold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-400 font-medium">{user.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-8 py-4">
                          <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${user.plan === 'Premium' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                             {user.plan}
                          </span>
                       </td>
                       <td className="px-8 py-4">
                          <span className={`flex items-center gap-2 text-xs font-bold ${user.status === 'Active' ? 'text-green-500' : 'text-gray-400'}`}>
                             <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                             {user.status}
                          </span>
                       </td>
                       <td className="px-8 py-4 text-sm font-bold text-gray-500">{user.joined}</td>
                       <td className="px-8 py-4 text-right">
                          <button className="text-blue-600 font-black text-xs hover:underline">Edit</button>
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
