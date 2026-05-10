import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Search, Compass, ChevronRight, 
  Sparkles, CheckCircle2, Loader2, Plus, Star, Map, Plane, Eye, ArrowRight
} from 'lucide-react';
import api from '../api/axios';

const suggestionBank = [
  {
    place: 'Kyoto, Japan',
    type: 'International',
    cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80',
    description: 'Serene ancient temples, bamboo forests, and traditional tea ceremonies.',
    highlights: 'Fushimi Inari, Kinkaku-ji, Arashiyama Bamboo Path',
    mood: 'Culture'
  },
  {
    place: 'Paris, France',
    type: 'International',
    cover: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
    description: 'Iconic architecture, romantic cafes, and classical masterpieces at the Louvre.',
    highlights: 'Eiffel Tower, Louvre Museum, Seine River Cruises',
    mood: 'Culture'
  },
  {
    place: 'Rome, Italy',
    type: 'International',
    cover: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80',
    description: 'Stunning Colosseum, rich history, Vatican city, and premier culinary pasta walks.',
    highlights: 'The Colosseum, Trevi Fountain, Vatican Museums',
    mood: 'Culture'
  },
  {
    place: 'Bali, Indonesia',
    type: 'International',
    cover: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=80',
    description: 'Pristine sand beaches, volcanic mountains, and lush emerald green rice terraces.',
    highlights: 'Uluwatu Temple, Ubud Monkey Forest, Tegallalang Terraces',
    mood: 'Nature'
  },
  {
    place: 'Sydney, Australia',
    type: 'International',
    cover: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=400&q=80',
    description: 'Harbor cruises, iconic Opera House views, and golden surfing coastlines.',
    highlights: 'Sydney Opera House, Bondi Beach, Darling Harbour',
    mood: 'Adventure'
  },
  {
    place: 'New York City, USA',
    type: 'International',
    cover: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80',
    description: 'Broadway spectacles, sprawling Central Park walks, and high-energy city skylines.',
    highlights: 'Empire State Building, Times Square, Central Park',
    mood: 'Luxury'
  }
];

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [typedPlace, setTypedPlace] = useState('');
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
    coverPhotoUrl: ''
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
    setTypedPlace(item.place);
    setFormData(prev => ({
      ...prev,
      name: `Epic Voyage to ${item.place.split(',')[0]}`,
      type: item.type,
      mood: item.mood,
      coverPhotoUrl: item.cover
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !typedPlace || !formData.startDate || !formData.endDate) {
      alert('Please fill out all wireframe form fields!');
      return;
    }
    setLoading(true);
    try {
      // Destructure and omit slug so that the backend can generate a unique timestamped slug!
      const { slug, ...cleanData } = formData;
      const response = await api.post('/trips', {
        ...cleanData,
        destination: typedPlace
      });
      setCreatedTripId(response.data.id);
      setShowSuccess(true);
    } catch (err) {
      alert('Failed to initialize journey. Let’s try again.');
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
  const filteredSuggestions = suggestionBank.filter(item => 
    item.place.toLowerCase().includes(typedPlace.toLowerCase()) ||
    item.highlights.toLowerCase().includes(typedPlace.toLowerCase())
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
      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
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
          <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select a Place:</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-purple-500" />
              <input 
                required
                type="text"
                placeholder="Type to search places... (e.g. Paris)"
                className="w-full pl-11 pr-4 py-4 rounded-xl bg-gray-50 border-none font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700"
                value={typedPlace}
                onChange={(e) => setTypedPlace(e.target.value)}
              />
            </div>
          </div>

          {/* Start Date input */}
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

          {/* End Date input */}
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

        <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400 font-bold">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-gray-400"><Eye className="w-4 h-4 text-purple-400" /> Visibility: {formData.visibility}</span>
            <span>Est. Budget: {formData.currency} {formData.budgetEstimate}</span>
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-xl shadow-purple-500/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4.5 h-4.5 stroke-[3px]" />}
            <span>Plan a trip</span>
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
              <p className="text-gray-400 font-bold text-xs">No places matching "{typedPlace}" found in suggestions database.</p>
            </div>
          )}
        </div>
      </section>

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
