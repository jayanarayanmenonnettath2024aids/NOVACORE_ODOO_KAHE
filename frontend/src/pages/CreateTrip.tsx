import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Search, Compass, ChevronRight, 
  Sparkles, CheckCircle2, Loader2, Plus, Star, Map, Plane, Eye, ArrowRight,
  Lock, Globe, X, Edit3, Users, Wallet, Heart, Zap, ArrowUpRight, TrendingUp
} from 'lucide-react';
import api from '../api/axios';

const suggestionBank = [
  { place: 'Tiruppur, Tamil Nadu', type: 'National', cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', description: 'The Knitwear Capital of India, a major textile and export hub.', highlights: 'Avinashi Temple, Tiruppur Tirupathi, Noyyal River', mood: 'Culture' },
  { place: 'Coimbatore, Tamil Nadu', type: 'National', cover: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&q=80', description: 'The Manchester of South India, known for its engineering and textiles.', highlights: 'Marudhamalai Temple, Adiyogi Shiva Statue, Isha Yoga Center', mood: 'Divine' },
  { place: 'Madurai, Tamil Nadu', type: 'National', cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', description: 'The Athens of the East, centered around the historic Meenakshi Amman Temple.', highlights: 'Meenakshi Temple, Thirumalai Nayakkar Mahal, Gandhi Memorial Museum', mood: 'Culture' },
  { place: 'Chennai, Tamil Nadu', type: 'National', cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', description: 'The Gateway to South India, known for its beaches and classical arts.', highlights: 'Marina Beach, Kapaleeshwarar Temple, Fort St. George', mood: 'Culture' },
  { place: 'Trichy, Tamil Nadu', type: 'National', cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', description: 'A city known for its historic temples and educational institutions.', highlights: 'Rockfort Temple, Sri Ranganathaswamy Temple, Cauvery River', mood: 'Divine' },
  { place: 'Salem, Tamil Nadu', type: 'National', cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', description: 'Known for its steel industry and mangoes.', highlights: 'Yercaud Hill Station, Mettur Dam, Kottai Mariamman Temple', mood: 'Nature' },
  { place: 'Erode, Tamil Nadu', type: 'National', cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', description: 'The Turmeric City of India.', highlights: 'Bhavani Kooduthurai, Chennimalai Murugan Temple', mood: 'Culture' },
  { place: 'Bangalore, Karnataka', type: 'National', cover: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&w=400&q=80', description: 'The Silicon Valley of India, famous for its parks and nightlife.', highlights: 'Lalbagh Garden, Cubbon Park, Bangalore Palace', mood: 'Food' },
  { place: 'Hyderabad, Telangana', type: 'National', cover: 'https://images.unsplash.com/photo-1559139225-3327fbc75dd4?auto=format&fit=crop&w=400&q=80', description: 'The City of Pearls, famous for its history and biryani.', highlights: 'Charminar, Golconda Fort, Ramoji Film City', mood: 'Food' },
  { place: 'Kochi, Kerala', type: 'National', cover: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80', description: 'Queen of the Arabian Sea, a blend of colonial and modern culture.', highlights: 'Fort Kochi, Chinese Fishing Nets, Marine Drive', mood: 'Nature' },
  { place: 'Thiruvananthapuram, Kerala', type: 'National', cover: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80', description: 'Capital of Kerala, known for its beaches and temples.', highlights: 'Padmanabhaswamy Temple, Kovalam Beach, Shangumugham Beach', mood: 'Divine' },
  { place: 'Varanasi, Uttar Pradesh', type: 'National', cover: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=400&q=80', description: 'The spiritual capital of India.', highlights: 'Ganga Aarti, Kashi Temple, Ghats', mood: 'Divine' },
  { place: 'Pune, Maharashtra', type: 'National', cover: 'https://images.unsplash.com/photo-1566375638495-95048a39c94c?auto=format&fit=crop&w=400&q=80', description: 'The Oxford of the East, known for its educational institutions.', highlights: 'Shaniwar Wada, Aga Khan Palace, Sinhagad Fort', mood: 'Culture' },
  { place: 'Ahmedabad, Gujarat', type: 'National', cover: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&w=400&q=80', description: 'India’s first UNESCO World Heritage City.', highlights: 'Sabarmati Ashram, Adalaj Stepwell, Akshardham', mood: 'Culture' },
  { place: 'Lucknow, Uttar Pradesh', type: 'National', cover: 'https://images.unsplash.com/photo-1588096344316-f70ca36ee391?auto=format&fit=crop&w=400&q=80', description: 'The City of Nawabs, famous for its manners and kababs.', highlights: 'Bara Imambara, Rumi Darwaza, Hazratganj', mood: 'Food' },
  { place: 'Visakhapatnam, Andhra Pradesh', type: 'National', cover: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80', description: 'The Jewel of the East Coast, a beautiful port city.', highlights: 'RK Beach, Kailasagiri, Araku Valley', mood: 'Nature' },
  { place: 'Bhubaneswar, Odisha', type: 'National', cover: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?auto=format&fit=crop&w=400&q=80', description: 'The Temple City of India.', highlights: 'Lingaraj Temple, Udayagiri Caves, Nandankanan Zoo', mood: 'Culture' },
  { place: 'Chandigarh, Punjab/Haryana', type: 'National', cover: 'https://images.unsplash.com/photo-1580974852861-f30a9107f45a?auto=format&fit=crop&w=400&q=80', description: 'India’s first planned city, known for its architecture.', highlights: 'Rock Garden, Sukhna Lake, Rose Garden', mood: 'Nature' },
  { place: 'Guwahati, Assam', type: 'National', cover: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=400&q=80', description: 'Gateway to Northeast India.', highlights: 'Kamakhya Temple, Brahmaputra River, Umananda Island', mood: 'Nature' },
  { place: 'Indore, Madhya Pradesh', type: 'National', cover: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&w=400&q=80', description: 'Cleanest city in India, famous for its street food.', highlights: 'Rajwada, Sarafa Bazaar, Lal Bagh Palace', mood: 'Food' },
  { place: 'Surat, Gujarat', type: 'National', cover: 'https://images.unsplash.com/photo-1596422846543-75c6fc18a593?auto=format&fit=crop&w=400&q=80', description: 'The Diamond City of India.', highlights: 'Dumas Beach, Surat Castle, Dutch Garden', mood: 'Luxury' },
  { place: 'Kanpur, Uttar Pradesh', type: 'National', cover: 'https://images.unsplash.com/photo-1588096344316-f70ca36ee391?auto=format&fit=crop&w=400&q=80', description: 'The Leather City of the World.', highlights: 'JK Temple, Moti Jheel, Blue World Theme Park', mood: 'Culture' },
  { place: 'Nagpur, Maharashtra', type: 'National', cover: 'https://images.unsplash.com/photo-1566375638495-95048a39c94c?auto=format&fit=crop&w=400&q=80', description: 'The Orange City and the geographical center of India.', highlights: 'Deekshabhoomi, Futala Lake, Sitabuldi Fort', mood: 'Nature' },
  { place: 'Patna, Bihar', type: 'National', cover: 'https://images.unsplash.com/photo-1588096344316-f70ca36ee391?auto=format&fit=crop&w=400&q=80', description: 'One of the oldest continuously inhabited places in the world.', highlights: 'Golghar, Patna Museum, Takht Sri Patna Sahib', mood: 'Culture' },
  { place: 'Vijayawada, Andhra Pradesh', type: 'National', cover: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80', description: 'A major trade and business center on the banks of Krishna River.', highlights: 'Kanakadurga Temple, Undavalli Caves, Bhavani Island', mood: 'Divine' },
  { place: 'Vellore, Tamil Nadu', type: 'National', cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', description: 'Famous for the Vellore Fort and the Golden Temple.', highlights: 'Vellore Fort, Golden Temple (Sripuram), Jalakandeswarar Temple', mood: 'Divine' },
  { place: 'Tirunelveli, Tamil Nadu', type: 'National', cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', description: 'City of Temples and Halwa.', highlights: 'Nellaiappar Temple, Courtallam Falls, Papanasam', mood: 'Divine' },
  { place: 'Thanjavur, Tamil Nadu', type: 'National', cover: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80', description: 'Center for South Indian religion, art, and architecture.', highlights: 'Brihadeeswarar Temple, Thanjavur Royal Palace, Saraswathi Mahal Library', mood: 'Culture' }
];

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [multiCities, setMultiCities] = useState<string[]>(['']);
  const [activeCityIndex, setActiveCityIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);

  // Primary Form fields mapped to wireframe & schemas
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    startDate: '',
    endDate: '',
    type: 'National',
    companionType: 'Solo',
    currency: 'INR',
    budgetEstimate: '75000',
    travelPace: 'Moderate',
    mood: 'Culture',
    transportType: 'Flight',
    visibility: 'Private',
    invitees: '',
    coverPhotoUrl: '',
    primaryDestination: '',
    discoveryStrategy: 'Single City'
  });

  // Auto-slug generation
  useEffect(() => {
    if (formData.name) {
      const generatedSlug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name]);

  // Handle selective autofill when a suggestion card is clicked
  const handleSelectSuggestion = (item: any) => {
    const updatedCities = [...multiCities];
    updatedCities[activeCityIndex] = item.place;
    setMultiCities(updatedCities);
    
    setFormData(prev => ({
      ...prev,
      name: prev.name || `Epic Voyage to ${item.place.split(',')[0]}`,
      type: item.type,
      mood: item.mood,
      coverPhotoUrl: item.cover
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const citiesToSubmit = multiCities.filter(c => c.trim() !== '');
    if (!formData.name || citiesToSubmit.length === 0 || !formData.startDate || !formData.endDate) {
      alert('Please fill out all wireframe form fields!');
      return;
    }
    setLoading(true);
    try {
      // Send the complete high-fidelity payload to the discovery engine
      const payload = {
        ...formData,
        budgetEstimate: parseFloat(formData.budgetEstimate as string) || 0,
        primaryDestination: citiesToSubmit.join(' -> '),
        isPublic: formData.visibility === 'Public'
      };

      const response = await api.post('/trips', payload);
      setCreatedTripId(response.data.id);
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Create trip error:', error.response?.data || error);
      const msg = error.response?.data?.error || error.response?.data?.details?.[0]?.message || 'Failed to initialize journey.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedNext = () => {
    if (createdTripId) {
      navigate(`/trips/${createdTripId}`);
    } else {
      navigate('/trips');
    }
  };

  // Filter suggestion list dynamically in real-time as they type
  const currentCityValue = multiCities[activeCityIndex] || '';
  const filteredSuggestions = suggestionBank.filter(item => 
    item.place.toLowerCase().includes(currentCityValue.toLowerCase()) ||
    item.highlights.toLowerCase().includes(currentCityValue.toLowerCase())
  );

  if (showSuccess) return <SuccessAnimation onProceed={handleProceedNext} />;

  return (
    <div className="trip-planner-wireframe space-y-10 pb-24">
      {/* Plus Jakarta Sans fonts and custom design layout stylesheet */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        
        .trip-planner-wireframe {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }
        .trip-planner-wireframe * {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }
      `}</style>

      {/* Header bar aligned with simple-header wireframe layout */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Plan a new trip</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Traveloop Co-Pilot Integration</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full border border-purple-100 font-bold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>AI Assisted Planner</span>
        </div>
      </div>

      {/* Structured Wireframe Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Trip Name input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trip Name:</label>
            <input 
              required
              type="text"
              placeholder="e.g. Summer in Tokyo"
              className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Select a Place input with dynamic search filtering */}
          <div className="space-y-3 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              {formData.discoveryStrategy === 'Multi-City' ? 'Route Destinations:' : 'Target City & State:'}
            </label>
            <div className="space-y-3">
              {multiCities.map((city, idx) => (
                <div key={idx} className="relative group">
                  <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 ${activeCityIndex === idx ? 'text-purple-500' : 'text-gray-300'}`} />
                  <input 
                    type="text"
                    placeholder={idx === 0 ? "e.g. Kyoto, Japan or Varanasi, UP" : "Add next city..."}
                    className={`w-full pl-11 pr-12 py-4 rounded-xl bg-gray-50 border-none font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700 transition-all ${activeCityIndex === idx ? 'ring-2 ring-purple-100 bg-white shadow-sm' : ''}`}
                    value={city}
                    onFocus={() => {
                      setActiveCityIndex(idx);
                      setShowDropdown(true);
                    }}
                    onBlur={() => {
                      // Small delay to allow clicking suggestions
                      setTimeout(() => setShowDropdown(false), 200);
                    }}
                    onChange={(e) => {
                      const updated = [...multiCities];
                      updated[idx] = e.target.value;
                      setMultiCities(updated);
                      setShowDropdown(true);
                    }}
                  />
                  
                  {/* Inline Autocomplete Dropdown */}
                  {showDropdown && activeCityIndex === idx && currentCityValue.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] max-h-60 overflow-y-auto p-2"
                    >
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const updated = [...multiCities];
                              updated[idx] = suggestion.place;
                              
                              if (formData.discoveryStrategy === 'Multi-City') {
                                // Add to queue and open next slot
                                updated.push('');
                                setMultiCities(updated);
                                setActiveCityIndex(updated.length - 1);
                              } else {
                                setMultiCities(updated);
                              }
                              
                              setShowDropdown(false);
                              
                              if (idx === 0) {
                                setFormData(prev => ({
                                  ...prev,
                                  name: prev.name || `Epic Voyage to ${suggestion.place.split(',')[0]}`,
                                  type: suggestion.type,
                                  mood: suggestion.mood,
                                  coverPhotoUrl: suggestion.cover
                                }));
                              }
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-purple-50 rounded-xl transition-all text-left group"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={suggestion.cover} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-800 group-hover:text-purple-600">{suggestion.place}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{suggestion.mood} • {suggestion.type}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (formData.discoveryStrategy === 'Multi-City') {
                               const updated = [...multiCities];
                               updated[idx] = currentCityValue;
                               updated.push('');
                               setMultiCities(updated);
                               setActiveCityIndex(updated.length - 1);
                            }
                            setShowDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 p-4 hover:bg-purple-50 rounded-xl transition-all text-left group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 group-hover:text-purple-600">Plan for "{currentCityValue}"</p>
                            <p className="text-[10px] text-gray-400 font-medium italic">AI will generate a custom path for this location.</p>
                          </div>
                        </button>
                      )}
                    </motion.div>
                  )}

                  {formData.discoveryStrategy === 'Multi-City' && multiCities.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => {
                        const updated = multiCities.filter((_, i) => i !== idx);
                        setMultiCities(updated);
                        if (activeCityIndex >= updated.length) setActiveCityIndex(Math.max(0, updated.length - 1));
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </button>
                  )}
                </div>
              ))}
              
              {formData.discoveryStrategy === 'Multi-City' && (
                <button 
                  type="button"
                  onClick={() => {
                    setMultiCities([...multiCities, '']);
                    setActiveCityIndex(multiCities.length);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Another City
                </button>
              )}
            </div>
          </div>

          {/* Trip Strategy selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Planning Strategy:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Single City', label: 'Single City Deep Dive', icon: MapPin },
                { id: 'Multi-City', label: 'Multi-City Adventure', icon: Plane }
              ].map(strategy => (
                <button
                  key={strategy.id}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, discoveryStrategy: strategy.id });
                    if (strategy.id === 'Single City') {
                      setMultiCities([multiCities[0] || '']);
                      setActiveCityIndex(0);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-3.5 rounded-xl font-bold text-[10px] transition-all border-2 ${formData.discoveryStrategy === strategy.id ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200' : 'bg-gray-50 text-gray-400 border-transparent hover:border-purple-100'}`}
                >
                  <strategy.icon className="w-4 h-4" />
                  {strategy.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Date range grid row */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date:</label>
              <input 
                required
                type="date"
                className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date:</label>
              <input 
                required
                type="date"
                min={formData.startDate}
                className="w-full px-6 py-4 rounded-xl bg-gray-50 border-none font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Trip Mood selection */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trip Mood / Vibe:</label>
            <div className="flex flex-wrap gap-2">
              {['Divine', 'Food', 'Culture', 'Nature', 'Adventure', 'Luxury'].map(mood => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood })}
                  className={`px-6 py-2.5 rounded-full font-bold text-[10px] transition-all border-2 ${formData.mood === mood ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100' : 'bg-gray-50 text-gray-400 border-transparent hover:border-amber-100'}`}
                >
                  {mood.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Visibility selection */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trip Visibility:</label>
            <div className="flex gap-4">
              {[
                { id: 'Private', label: 'Private', icon: Lock, desc: 'Only you can see this trip' },
                { id: 'Public', label: 'Public', icon: Globe, desc: 'Visible to the Traveloop community' }
              ].map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: option.id })}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${formData.visibility === option.id ? 'bg-purple-600 text-white border-purple-600 shadow-xl' : 'bg-gray-50 text-gray-400 border-transparent hover:border-purple-100'}`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{option.label}</span>
                  <span className={`text-[8px] font-medium opacity-60 ${formData.visibility === option.id ? 'text-white' : 'text-gray-400'}`}>{option.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-widest">
               <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {formData.companionType}</span>
               <span className="w-1 h-1 bg-gray-300 rounded-full" />
               <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> Visibility: {formData.visibility}</span>
               <span className="w-1 h-1 bg-gray-300 rounded-full" />
               <span>Est. Budget: {formData.currency} {formData.budgetEstimate}</span>
             </div>
             <p className="text-[10px] text-gray-300 font-medium">Final cost may vary based on chosen stops.</p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-12 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 active:scale-95 disabled:opacity-50 group"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
            <span>Initialize Journey</span>
          </button>
        </div>
      </form>

      {/* SECTION: Suggestion for Places to Visit / Activities to Perform */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">
            Suggestion for Places to Visit/Activities to perform
          </h2>
          <div className="w-full h-px bg-gray-200/80" />
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredSuggestions.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-md overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all duration-300 min-h-[380px]"
            >
              {/* Photo cover */}
              <div className="relative h-44 overflow-hidden">
                <img 
                  src={item.cover} 
                  alt={item.place} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="px-2 py-0.5 bg-purple-600/90 text-white rounded-md text-[8px] font-black uppercase tracking-wider">
                    {item.mood}
                  </span>
                  <h4 className="text-sm font-extrabold tracking-tight mt-1.5">{item.place}</h4>
                </div>
              </div>

              {/* Suggestions activities description */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">PLACES TO VISIT:</p>
                  <p className="text-xs text-gray-700 font-extrabold leading-snug">
                    {item.highlights}
                  </p>
                  <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic">
                    "{item.description}"
                  </p>
                </div>

                {/* Fill form Action CTA */}
                <button 
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full py-3 bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Auto-fill Destination
                </button>
              </div>
            </motion.div>
          ))}

          {filteredSuggestions.length === 0 && (
            <div className="col-span-full text-center py-16 bg-gray-55/40 rounded-3xl border border-dashed border-gray-200">
              <Compass className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 font-bold text-xs">No places matching "{currentCityValue}" found in suggestions database.</p>
            </div>
          )}
        </div>
      </section>

      {/* Main Submit Action Button (Plan a Trip Aligned Bottom Right) */}
    </div>
  );
};

const SuccessAnimation = ({ onProceed }: { onProceed: () => void }) => (
  <div className="h-[75vh] flex flex-col items-center justify-center text-center space-y-10">
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
      className="w-36 h-36 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-purple-200"
    >
       <Plane className="w-18 h-18 animate-pulse" />
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
       <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Adventure Initialized!</h2>
       <p className="text-sm md:text-base text-gray-400 font-bold max-w-md mx-auto">
         Your Traveloop companion calculations are complete. You are ready to start planning your stops!
       </p>
    </motion.div>

    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      onClick={onProceed}
      className="px-10 py-5 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-xl shadow-purple-500/20 active:scale-95"
    >
      <span>Move on to Next</span>
      <ArrowRight className="w-5 h-5 stroke-[3px]" />
    </motion.button>
  </div>
);

export default CreateTrip;
