import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, TrendingUp, Navigation, 
  ChevronRight, Globe, Camera
} from 'lucide-react';
import api from '../api/axios';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: 'National',
    coverPhotoUrl: ''
  });

  // AI Logic: Auto-detect trip type based on destination
  const handleDestinationChange = (name: string) => {
    const internationalKeywords = ['Japan', 'USA', 'UK', 'France', 'Italy', 'Europe', 'Tokyo', 'Paris', 'London', 'International', 'Abroad'];
    const isInternational = internationalKeywords.some(kw => name.toLowerCase().includes(kw.toLowerCase()));
    
    setFormData(prev => ({ 
      ...prev, 
      name, 
      type: isInternational ? 'International' : 'National' 
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/trips', formData);
      navigate(`/trips/${response.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create trip. Please ensure start date is before end date.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-10"
        >
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse shadow-lg shadow-blue-200">
                   <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">AI ASSISTED PLANNING</span>
             </div>
             <h1 className="text-6xl font-black text-gray-900 leading-tight tracking-tight">Design your<br/><span className="text-blue-600">Perfect Path.</span></h1>
             <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-md">Our AI automatically optimizes your budget, packing list, and travel efficiency as you plan.</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="relative z-10">
                <h4 className="text-lg font-black text-blue-900 mb-2">Smart Prediction</h4>
                <p className="text-blue-700 font-medium leading-relaxed italic">"Planning a trip to {formData.name || 'a new city'}? We'll suggest the best cultural activities based on your history."</p>
             </div>
             <Globe className="absolute -bottom-10 -right-10 w-32 h-32 text-blue-100 rotate-12" />
          </div>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit} 
          className="space-y-8 bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-100 border border-blue-50"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destination / Trip Name</label>
            <div className="relative group">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
              <input 
                required
                placeholder="e.g. Summer in Kyoto"
                className="w-full pl-16 pr-6 py-6 rounded-3xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-xl placeholder:text-gray-300"
                value={formData.name}
                onChange={(e) => handleDestinationChange(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
              <div className="relative group">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  required
                  type="date"
                  className="w-full pl-16 pr-6 py-5 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
              <div className="relative group">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  required
                  type="date"
                  className="w-full pl-16 pr-6 py-5 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cover Photo URL (Optional)</label>
            <div className="relative group">
              <Camera className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
              <input 
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-16 pr-6 py-5 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                value={formData.coverPhotoUrl}
                onChange={(e) => setFormData({ ...formData, coverPhotoUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Trip Type {formData.type && <span className="text-blue-600 ml-2 animate-pulse">(AI DETECTED)</span>}
            </label>
            <div className="flex gap-4">
              {['National', 'International'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all border-2 ${
                    formData.type === type 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-100' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> : (
              <>
                <Navigation className="w-6 h-6" />
                <span>INITIALIZE TRIP</span>
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateTrip;
