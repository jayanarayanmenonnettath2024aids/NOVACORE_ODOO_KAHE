import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, MapPin, Calendar, Trash2, Edit3, 
  Eye, MoreHorizontal, Filter, Grid, List as ListIcon, 
  ArrowUpRight, Clock, Globe
} from 'lucide-react';
import api from '../api/axios';

const MyTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      setTrips(response.data);
    } catch (err) {
      console.error('Failed to fetch trips', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        await api.delete(`/trips/${id}`);
        setTrips(trips.filter(t => t.id !== id));
      } catch (err) {
        alert('Failed to delete trip');
      }
    }
  };

  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [newTitle, setNewTitle] = useState('');

  const handleEdit = (trip: any) => {
    setEditingTrip(trip);
    setNewTitle(trip.name);
  };

  const saveEdit = async () => {
    try {
      await api.put(`/trips/${editingTrip.id}`, { name: newTitle });
      setTrips(trips.map(t => t.id === editingTrip.id ? { ...t, name: newTitle } : t));
      setEditingTrip(null);
    } catch (err) {
      alert('Failed to update trip');
    }
  };

  const filteredTrips = trips.filter(trip => 
    trip.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 font-bold text-gray-400 animate-pulse text-xl">Discovering your memories...</div>;

  return (
    <div className="space-y-10 pb-20">
      <AnimatePresence>
        {editingTrip && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md"
            >
              <h3 className="text-2xl font-black text-gray-900 mb-6">Rename Trip</h3>
              <input 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-bold mb-8"
              />
              <div className="flex gap-4">
                <button onClick={() => setEditingTrip(null)} className="flex-1 py-4 rounded-xl font-bold text-gray-400 hover:bg-gray-100 transition-all">Cancel</button>
                <button onClick={saveEdit} className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-200">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Trips</h1>
          <p className="text-gray-500 font-medium">You have {trips.length} active itineraries planned.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><Grid className="w-5 h-5" /></button>
             <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><ListIcon className="w-5 h-5" /></button>
          </div>
          <Link 
            to="/create-trip" 
            className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Adventure</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search your trips by name or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-4 focus:ring-blue-50 transition-all font-bold text-gray-700"
          />
        </div>
        <button className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-gray-500 hover:text-blue-600 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4"}>
        <AnimatePresence>
          {filteredTrips.map((trip) => (
            <motion.div 
              layout
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 group transition-all duration-500 ${viewMode === 'grid' ? 'shadow-sm hover:shadow-2xl' : 'flex items-center p-4 gap-6 hover:shadow-xl'}`}
            >
              {/* Image Section */}
              <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'h-56' : 'w-48 h-32 rounded-2xl'}`}>
                <img 
                  src={trip.coverPhotoUrl || `https://source.unsplash.com/random/800x600?travel,${trip.name}`} 
                  alt={trip.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className={`w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border border-white/20 ${trip.type === 'International' ? 'bg-purple-600/80 text-white' : 'bg-blue-600/80 text-white'}`}>
                    {trip.type || 'National'}
                  </span>
                  {(() => {
                    const now = new Date();
                    const start = new Date(trip.startDate);
                    const end = new Date(trip.endDate);
                    if (now < start) return <span className="w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-500 text-white shadow-lg">Upcoming</span>;
                    if (now >= start && now <= end) return <span className="w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-green-500 text-white shadow-lg animate-pulse">Live Now</span>;
                    return <span className="w-fit px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-500 text-white shadow-lg">Completed</span>;
                  })()}
                </div>
              </div>

              {/* Content Section */}
              <div className={`flex-1 ${viewMode === 'grid' ? 'p-8' : 'p-2'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                       {trip.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                       <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                       <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {trip._count?.stops || 0} stops</span>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-2 mt-8 ${viewMode === 'list' ? 'justify-end' : ''}`}>
                   <Link 
                     to={`/trips/${trip.id}`} 
                     className="flex-1 bg-gray-50 text-gray-900 py-3.5 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                   >
                     <Eye className="w-4 h-4" /> VIEW
                   </Link>
                   <button 
                     onClick={() => handleEdit(trip)}
                     className="p-3.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-amber-50 hover:text-amber-600 transition-all"
                   >
                     <Edit3 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => handleDelete(trip.id)}
                     className="p-3.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTrips.length === 0 && (
        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <Globe className="w-16 h-16 text-gray-200 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">Try a different search term or start fresh by planning a brand new adventure.</p>
          <Link to="/create-trip" className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold">Plan New Trip</Link>
        </div>
      )}
    </div>
  );
};

export default MyTrips;
