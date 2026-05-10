import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Star, Filter, ArrowRight, Plus, 
  TrendingUp, DollarSign, Globe, Navigation, Heart,
  X, CheckCircle2, ChevronRight
} from 'lucide-react';
import api from '../api/axios';

const Explore = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [trips, setTrips] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock city data with meta info
  const cities = [
    { id: '1', name: 'Tokyo', country: 'Japan', region: 'Asia', rating: 4.9, cost: 'High', popularity: 'Trending', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf' },
    { id: '2', name: 'Paris', country: 'France', region: 'Europe', rating: 4.8, cost: 'High', popularity: 'Classic', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34' },
    { id: '3', name: 'Kyoto', country: 'Japan', region: 'Asia', rating: 4.9, cost: 'Medium', popularity: 'Top Rated', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e' },
    { id: '4', name: 'New York', country: 'USA', region: 'Americas', rating: 4.7, cost: 'Very High', popularity: 'Busy', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' },
    { id: '5', name: 'Bali', country: 'Indonesia', region: 'Asia', rating: 4.6, cost: 'Low', popularity: 'Relaxing', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4' },
    { id: '6', name: 'Rome', country: 'Italy', region: 'Europe', rating: 4.8, cost: 'Medium', popularity: 'Historical', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5' },
    { id: '7', name: 'London', country: 'UK', region: 'Europe', rating: 4.7, cost: 'High', popularity: 'Popular', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad' },
    { id: '8', name: 'Seoul', country: 'South Korea', region: 'Asia', rating: 4.7, cost: 'Medium', popularity: 'Techy', img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc' },
    { id: '9', name: 'Sydney', country: 'Australia', region: 'Oceania', rating: 4.8, cost: 'High', popularity: 'Sunny', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9' },
  ];

  const regions = ['All', 'Asia', 'Europe', 'Americas', 'Oceania'];

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await api.get('/trips');
        setTrips(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrips();
  }, []);

  const filteredCities = cities.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          city.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || city.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const handleAddToTrip = async (tripId: string) => {
    setLoading(true);
    const city = cities.find(c => c.id === showAddModal);
    try {
      await api.post(`/trips/${tripId}/stops`, {
        cityName: city?.name,
        country: city?.country,
        orderIndex: 0
      });
      setShowAddModal(null);
      alert(`Added ${city?.name} to your trip!`);
    } catch (err) {
      alert('Failed to add city to trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Search Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-500 p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-base font-black mb-4 tracking-tight leading-tight">Where to next?</h1>
          <p className="text-purple-100 font-medium text-base mb-10">Discover your next destination and add it directly to your itinerary.</p>
          
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search cities, countries, or regions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-6 rounded-3xl bg-white text-gray-900 border-none shadow-2xl focus:ring-4 focus:ring-purple-400/50 transition-all font-bold text-base"
            />
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 -mb-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 mr-2">
           <Filter className="w-5 h-5 text-purple-600" />
           <span className="text-sm font-black text-gray-400 uppercase tracking-widest">Regions</span>
        </div>
        {regions.map(region => (
          <button 
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap ${selectedRegion === region ? 'bg-purple-600 text-white shadow-xl shadow-purple-100' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredCities.map((city) => (
            <motion.div 
              layout
              key={city.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all group"
            >
              <div className="h-64 relative">
                <img src={city.img} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                   <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-purple-600 shadow-sm flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5" /> {Math.floor(80 + Math.random() * 15)}% AI MATCH
                   </span>
                   <span className="bg-gray-900/80 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white shadow-sm">
                      {city.popularity}
                   </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                   <div className="text-white">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{city.region}</p>
                      <h4 className="text-base font-black">{city.name}</h4>
                   </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-base font-black text-gray-900 group-hover:text-purple-600 transition-colors">{city.name}</h3>
                    <p className="text-gray-400 font-bold flex items-center gap-1.5 mt-1">
                      <Globe className="w-4 h-4" /> {city.country}
                    </p>
                  </div>
                  <button className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
                <button 
                  onClick={() => setShowAddModal(city.id)}
                  className="w-full bg-purple-50 text-purple-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white transition-all group/btn"
                >
                  <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" /> 
                  <span>Add to Trip</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add to Trip Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md relative"
            >
              <button onClick={() => setShowAddModal(null)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900"><X className="w-6 h-6" /></button>
              <h3 className="text-base font-black text-gray-900 mb-2 tracking-tight">Select Trip</h3>
              <p className="text-gray-500 font-medium mb-8">Which trip should we add this destination to?</p>
              
              <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar pr-2">
                 {trips.map(trip => (
                   <button 
                    key={trip.id}
                    disabled={loading}
                    onClick={() => handleAddToTrip(trip.id)}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-gray-50 hover:bg-purple-50 border-2 border-transparent hover:border-purple-200 transition-all group/trip text-left"
                   >
                     <div>
                        <p className="font-black text-gray-800">{trip.name}</p>
                        <p className="text-xs font-bold text-gray-400">{new Date(trip.startDate).toLocaleDateString()}</p>
                     </div>
                     <ChevronRight className="w-5 h-5 text-gray-300 group-hover/trip:text-purple-600 group-hover/trip:translate-x-1 transition-all" />
                   </button>
                 ))}
                 {trips.length === 0 && (
                   <div className="text-center py-10">
                      <Navigation className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-500 font-bold">No active trips found.</p>
                      <button onClick={() => navigate('/create-trip')} className="mt-4 text-purple-600 font-black text-sm">CREATE NEW TRIP</button>
                   </div>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Explore;
