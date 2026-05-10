import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Globe, Share2, Copy, 
  Clock, Activity, Star, 
  MessageCircle, Send
} from 'lucide-react';
import api from '../api/axios';

const PublicTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicTrip = async () => {
      try {
        // Match the backend route: router.get('/public/:id', getPublicTrip);
        const response = await api.get(`/trips/public/${id}`);
        setTrip(response.data);
      } catch (err) {
        console.error('Failed to fetch public trip', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicTrip();
  }, [id]);

  const handleClone = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to copy this trip!');
      navigate('/login');
      return;
    }
    try {
      const response = await api.post(`/trips/${id}/clone`);
      alert('Trip copied to your itineraries!');
      navigate(`/trips/${response.data.id}`);
    } catch (err) {
      alert('Failed to copy trip. Make sure you are logged in.');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!trip) return <div className="h-screen flex items-center justify-center text-gray-500 font-bold">Trip not found or is private.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 -mt-8">
      {/* Hero Header */}
      <div className="h-[60vh] relative overflow-hidden">
        <img 
          src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'} 
          className="w-full h-full object-cover" 
          alt={trip.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12 max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
             <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Shared Itinerary</span>
                <span className="flex items-center gap-1.5 text-white/80 text-xs font-bold"><Globe className="w-4 h-4" /> Public View</span>
             </div>
             <h1 className="text-7xl font-black text-white tracking-tight">{trip.name}</h1>
             <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2 font-bold"><Calendar className="w-5 h-5 text-blue-400" /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</div>
                <div className="flex items-center gap-2 font-bold"><MapPin className="w-5 h-5 text-blue-400" /> {trip.stops?.length} Destinations</div>
                <div className="flex items-center gap-2 font-bold">
                   <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-black">
                      {trip.user?.name?.[0] || 'T'}
                   </div>
                   By {trip.user?.name || 'Traveloop Explorer'}
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
               <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                  <h3 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Trip Journey</h3>
                  <div className="space-y-12">
                     {trip.stops?.map((stop: any, idx: number) => (
                       <div key={stop.id} className="relative pl-12 border-l-2 border-dashed border-gray-100 last:border-0 pb-12 last:pb-0">
                          <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center text-white text-[8px] font-black">
                             {idx + 1}
                          </div>
                          <div className="flex justify-between items-start mb-6">
                             <div>
                                <h4 className="text-3xl font-black text-gray-900 tracking-tight">{stop.cityName}</h4>
                                <p className="text-blue-600 font-black text-xs uppercase tracking-widest mt-1">{stop.country}</p>
                             </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {stop.activities?.map((act: any) => (
                               <div key={act.id} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 hover:border-blue-200 transition-all group">
                                  <div className="flex items-center gap-4 mb-3">
                                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                                        <Activity className="w-5 h-5" />
                                     </div>
                                     <div>
                                        <p className="font-black text-gray-900">{act.name}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{act.type}</p>
                                     </div>
                                  </div>
                                  <p className="text-sm text-gray-500 font-medium line-clamp-2">{act.description}</p>
                               </div>
                             ))}
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
               <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                     <Copy className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-gray-900 mb-2">Like this trip?</h4>
                  <p className="text-gray-500 font-medium mb-8">Copy this itinerary to your profile and start customizing it for your own journey.</p>
                  <button 
                    onClick={handleClone}
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                     <Copy className="w-5 h-5" /> COPY TO MY TRIPS
                  </button>
               </div>

               <div className="bg-gray-900 p-8 rounded-[3rem] shadow-xl text-white">
                  <h4 className="text-xl font-black mb-6 flex items-center gap-2"><Share2 className="w-5 h-5 text-blue-400" /> Share Journey</h4>
                  <div className="grid grid-cols-3 gap-4">
                      <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                         <MessageCircle className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Chat</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                         <Send className="w-6 h-6 text-sky-400 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Send</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                         <Globe className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Web</span>
                      </button>
                  </div>
                  <div className="mt-8 pt-8 border-t border-white/10 text-center">
                     <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em] mb-4">PUBLIC URL</p>
                     <div className="bg-white/5 p-3 rounded-xl flex items-center gap-2 border border-white/10 group cursor-pointer" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('URL copied!');
                     }}>
                        <p className="text-[10px] font-medium text-white/60 truncate flex-1">{window.location.href}</p>
                        <Copy className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PublicTrip;
