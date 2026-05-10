import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Camera, Save, Loader2, Compass, MapPin, Calendar, ArrowRight
} from 'lucide-react';
import api from '../api/axios';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    photoUrl: '',
    language: 'English (US)'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, tripsRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/trips')
        ]);
        setUser(profileRes.data);
        setTrips(tripsRes.data);
        setFormData({
          name: profileRes.data.name,
          photoUrl: profileRes.data.photoUrl || '',
          language: profileRes.data.language || 'English (US)'
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/user/profile', formData);
      setUser(response.data);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-purple-600 animate-spin" /></div>;

  const now = new Date().getTime();
  const preplannedTrips = trips.filter(trip => new Date(trip.endDate).getTime() >= now || new Date(trip.startDate).getTime() > now);
  const previousTrips = trips.filter(trip => new Date(trip.endDate).getTime() < now);

  const renderTripCard = (trip: any) => (
    <motion.div 
      key={trip.id}
      whileHover={{ y: -5 }}
      className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[320px] group transition-all duration-300"
    >
      <div className="h-3/5 relative overflow-hidden">
        <img 
          src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'} 
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-black text-lg tracking-tight line-clamp-1">{trip.name}</h3>
        </div>
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between bg-white">
        <p className="text-[11px] text-gray-500 font-bold flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-purple-400" />
          {new Date(trip.startDate).toLocaleDateString()}
        </p>
        <button 
          onClick={() => navigate(`/trips/${trip.id}`)}
          className="w-full py-2.5 bg-gray-50 hover:bg-purple-600 text-gray-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest border border-gray-100 transition-all flex items-center justify-center gap-2 mt-auto"
        >
          View Trip <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top Traveloop Header simulation (optional, but fits wireframe) */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
         <Compass className="w-8 h-8 text-purple-600" />
         <h1 className="text-2xl font-black text-gray-900 tracking-tight">Traveloop Profile</h1>
      </div>

      {/* User Details Header Section */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left: Avatar */}
        <div className="shrink-0 flex justify-center md:justify-start">
          <div className="relative group">
            <div className="w-48 h-48 rounded-full bg-purple-50 border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform duration-500 group-hover:scale-105">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} className="w-full h-full object-cover" />
              ) : (
                <User className="w-24 h-24 text-purple-600" />
              )}
            </div>
            <button className="absolute bottom-2 right-2 p-3.5 bg-purple-600 text-white rounded-full shadow-xl hover:bg-purple-500 hover:scale-110 transition-all border-4 border-white">
               <Camera className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: User Details Form */}
        <div className="flex-1 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">User Details & Settings</h2>
            <form id="profileForm" onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all font-bold text-sm text-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Read Only)</label>
                <input 
                  disabled
                  value={user.email}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-100 border border-transparent font-bold text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Avatar Image URL</label>
                <input 
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                  placeholder="https://..."
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all font-bold text-sm text-gray-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Interface Language</label>
                <select 
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-4 focus:ring-purple-100 focus:border-purple-300 transition-all font-bold text-sm text-gray-800 appearance-none"
                >
                   <option>English (US)</option>
                   <option>Spanish (ES)</option>
                   <option>French (FR)</option>
                   <option>German (DE)</option>
                </select>
              </div>
            </form>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              form="profileForm"
              type="submit"
              disabled={saving}
              className="bg-purple-600 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </div>
        </div>
      </div>

      {/* Preplanned Trips Section */}
      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight pl-2">Preplanned Trips</h2>
        {preplannedTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {preplannedTrips.map(renderTripCard)}
          </div>
        ) : (
          <div className="bg-gray-50 py-12 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
             <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-bold text-sm">No preplanned trips found.</p>
          </div>
        )}
      </div>

      {/* Previous Trips Section */}
      <div className="space-y-6 pt-6">
        <h2 className="text-xl font-black text-gray-900 tracking-tight pl-2">Previous Trips</h2>
        {previousTrips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {previousTrips.map(renderTripCard)}
          </div>
        ) : (
          <div className="bg-gray-50 py-12 rounded-[2rem] border-2 border-dashed border-gray-200 text-center">
             <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-bold text-sm">No previous trips found.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
