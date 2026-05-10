import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, MapPin, DollarSign, Clock, 
  CheckCircle2, Briefcase, Globe, Sun, 
  ChevronRight, Activity, Zap, Star, TrendingUp, ArrowRight,
  AlertCircle, Navigation, Target, Sparkles, Heart, Wallet, Loader2, Search, SlidersHorizontal, ArrowUpDown, Filter
} from 'lucide-react';
import api from '../api/axios';

const bannerSlides = [
  {
    url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
    title: 'Sydney Opera House',
    caption: 'Discovering the Extraordinary'
  },
  {
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    title: 'Eiffel Tower',
    caption: 'Experience Romance & Architecture'
  },
  {
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    title: 'Tokyo Street Lights',
    caption: 'Immerse Yourself in Future & Neon'
  },
  {
    url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    title: 'Tropical Bali Beaches',
    caption: 'Relax on Pristine Sands & Lagoons'
  }
];

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<any>(null);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [goalAmount, setGoalAmount] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Slide Show Banner Index
  const [currentSlide, setCurrentSlide] = useState(0);

  // Interactive Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All'); // 'All' | 'International' | 'National'
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'name' | 'progress'
  const [showGoalsDrawer, setShowGoalsDrawer] = useState(false);

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Slide interval timer for Banner
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  const handleCreateGoal = async () => {
    if (!goalTitle || !goalAmount) return;
    setSubmitting(true);
    try {
      await api.post('/dashboard/manifest', { title: goalTitle, targetAmount: goalAmount });
      setShowAddGoal(false);
      setGoalTitle('');
      setGoalAmount('');
      fetchDashboard();
    } catch (err) {
      alert('Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMoney = async () => {
    if (!addAmount || !selectedGoal) return;
    const remaining = selectedGoal.targetAmount - selectedGoal.savedAmount;
    if (parseFloat(addAmount) > remaining) {
      alert(`Manifestation complete! You only need ${selectedGoal.currency} ${remaining.toLocaleString()} to reach your goal.`);
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/dashboard/manifest/${selectedGoal.id}`, { addAmount });
      setShowAddMoney(false);
      setAddAmount('');
      fetchDashboard();
    } catch (err) {
      alert('Failed to update goal');
    } finally {
      setSubmitting(false);
    }
  };

  // Real-time Countdown Logic
  useEffect(() => {
    if (!data?.upcomingTrips?.[0]) return;
    const target = new Date(data.upcomingTrips[0].startDate).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('ARRIVED');
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  if (loading) return <DashboardSkeleton />;

  const nextTrip = data?.upcomingTrips?.[0];

  // Filter & Sort Logic for Itineraries
  const filteredTrips = (data?.upcomingTrips || [])
    .filter((trip: any) => {
      const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || trip.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') {
        const aProg = a.stops?.length || 0;
        const bProg = b.stops?.length || 0;
        return bProg - aProg;
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

  const curatedRegions = [
    { name: 'East Asia', img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=300&q=80', count: '12 Spots' },
    { name: 'Western Europe', img: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=300&q=80', count: '18 Spots' },
    { name: 'Southeast Asia', img: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=300&q=80', count: '24 Spots' },
    { name: 'North America', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=300&q=80', count: '15 Spots' },
    { name: 'Oceania Islands', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80', count: '10 Spots' }
  ];

  return (
    <div className="dashboard-layout-wireframe space-y-8 pb-24">
      {/* Plus Jakarta Sans professional font and styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');
        
        .dashboard-layout-wireframe {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }
        .dashboard-layout-wireframe * {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        /* Curated Custom Scrollbar for top regions */
        .curated-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .curated-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 10px;
        }
        .curated-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.15);
          border-radius: 10px;
        }
        .curated-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.3);
        }
      `}</style>

      {/* Hero Slideshow Banner Section */}
      <div className="relative w-full h-[360px] rounded-none overflow-hidden shadow-2xl border border-gray-100">
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.img 
              key={currentSlide}
              src={bannerSlides[currentSlide].url} 
              alt={bannerSlides[currentSlide].title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-purple-950/25" />
        </div>
        
        {/* Banner Content Layout */}
        <div className="absolute inset-0 p-10 md:p-14 flex flex-col justify-end pb-20 z-10 text-white">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              {bannerSlides[currentSlide].caption}
            </h1>
            <p className="text-gray-350 text-xs md:text-sm font-medium tracking-wide">
              Currently viewing: <span className="text-purple-300 font-bold">{bannerSlides[currentSlide].title}</span>
            </p>
          </div>
        </div>

        {/* Carousel Slide Indicators Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {bannerSlides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${currentSlide === idx ? 'bg-purple-500 w-6' : 'bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </div>

      {/* Control Actions (Search & Filtering System exactly like the wireframe) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4.5 rounded-[2rem] border border-gray-100 shadow-sm z-30 relative">
        {/* Search Bar (Taking 7 columns on desktop) */}
        <div className="relative md:col-span-7 w-full z-50">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
          <input 
            type="text" 
            placeholder="Search for destinations, trips, or activities..."
            className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-300 text-gray-700 placeholder:text-gray-400 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {/* Dynamic Search Results Dropdown */}
          <AnimatePresence>
            {searchQuery.trim().length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-80 overflow-y-auto no-scrollbar"
              >
                {filteredTrips.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Search Results ({filteredTrips.length})
                    </div>
                    {filteredTrips.map((trip: any) => (
                      <button 
                        key={trip.id}
                        onClick={() => navigate(`/trips/${trip.id}`)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-purple-50 rounded-xl transition-all cursor-pointer text-left group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                          <img 
                            src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=100&q=80'} 
                            alt={trip.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors">{trip.name}</h4>
                          <p className="text-[10px] text-gray-500 font-bold">{new Date(trip.startDate).toLocaleDateString()}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Search className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                    <p className="text-xs font-bold text-gray-500">No trips found for "{searchQuery}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Wireframe Buttons: Group by, Filter, Sort by... (Taking 5 columns on desktop) */}
        <div className="md:col-span-5 flex items-center justify-end gap-2 w-full">
          {/* Group by (manifest savings goals drawer toggle) */}
          <button 
            onClick={() => setShowGoalsDrawer(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <span>Group by</span>
            {data?.manifestGoals?.length > 0 && (
              <span className="ml-1 w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                {data.manifestGoals.length}
              </span>
            )}
          </button>

          {/* Filter */}
          <button 
            onClick={() => setFilterType(prev => prev === 'All' ? 'International' : prev === 'International' ? 'National' : 'All')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              filterType !== 'All' 
                ? 'bg-purple-600 border-purple-600 text-white' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>Filter</span>
            {filterType !== 'All' && <span className="ml-1 text-[10px] opacity-90 font-bold">({filterType})</span>}
          </button>

          {/* Sort by... */}
          <button 
            onClick={() => setSortBy(prev => prev === 'date' ? 'name' : prev === 'name' ? 'progress' : 'date')}
            className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <span className="capitalize">Sort by... ({sortBy})</span>
          </button>
        </div>
      </div>

      {/* Upcoming Trip Timer Card */}
      {timeLeft && nextTrip && (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-purple-200 transition-all">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Upcoming Trip Destination</p>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">{nextTrip.name}</h3>
            </div>
          </div>
          <div className="text-right w-full md:w-auto bg-gray-50 px-8 py-4 rounded-2xl">
            {timeLeft === 'ARRIVED' ? (
              <span className="text-2xl font-black text-purple-600 tracking-tight">ARRIVED</span>
            ) : (
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <span className="text-2xl font-black text-gray-900 leading-none">{timeLeft.days}</span>
                  <span className="text-[9px] font-black text-gray-400 block uppercase tracking-widest mt-1">Days</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-black text-gray-900 leading-none">{timeLeft.hours}</span>
                  <span className="text-[9px] font-black text-gray-400 block uppercase tracking-widest mt-1">Hrs</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-black text-gray-900 leading-none">{timeLeft.minutes}</span>
                  <span className="text-[9px] font-black text-gray-400 block uppercase tracking-widest mt-1">Mins</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-black text-purple-600 leading-none">{timeLeft.seconds}</span>
                  <span className="text-[9px] font-black text-purple-400 block uppercase tracking-widest mt-1">Secs</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 1: Top Regional Selections */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">
            Top Regional Selections
          </h2>
          <div className="w-full h-px bg-gray-200/80" />
        </div>

        {/* Curated Square Cards Row with precise horizontal alignments */}
        <div className="flex gap-5 overflow-x-auto pb-4 curated-scrollbar select-none">
          {curatedRegions.map((region, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4 }}
              className="flex-shrink-0 w-[160px] h-[160px] rounded-[2rem] overflow-hidden relative border border-gray-100 shadow-md cursor-pointer group"
            >
              <img 
                src={region.img} 
                alt={region.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[12px] font-black tracking-wide leading-tight">{region.name}</p>
                <p className="text-[8px] text-purple-300 font-bold uppercase tracking-wider mt-1">{region.count}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Previous Trips */}
      <section className="space-y-6 relative">
        <div className="flex items-center gap-4">
          <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">
            Previous Trips
          </h2>
          <div className="w-full h-px bg-gray-200/80" />
        </div>

        {/* Tall Vertical Itinerary Cards Grid exactly matching wireframe cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6.5">
          {filteredTrips.map((trip: any) => {
            const hasStops = trip.stops?.length > 0;
            return (
              <motion.div 
                key={trip.id}
                whileHover={{ y: -6 }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[410px]"
              >
                {/* Cover Image Block */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={trip.coverPhotoUrl || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80`}
                    alt={trip.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-5.5 left-5.5 right-5.5 text-white">
                    <span className="px-2.5 py-1 bg-purple-600 text-white rounded-md text-[8px] font-black uppercase tracking-wider">
                      {trip.type || 'National'}
                    </span>
                    <h3 className="text-base font-extrabold tracking-tight mt-2.5 line-clamp-1 group-hover:text-purple-300 transition-colors">
                      {trip.name}
                    </h3>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-2.5">
                    <p className="text-xs text-gray-500 font-bold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 font-bold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      {trip.stops?.length || 0} locations planned
                    </p>
                  </div>

                  {/* Planning Milestone Slider */}
                  <div className="space-y-1.5 pt-2.5 border-t border-gray-50">
                    <div className="flex justify-between text-[9px] font-black text-gray-400 tracking-wider uppercase">
                      <span>Planning Progress</span>
                      <span className="text-purple-600">{hasStops ? '70%' : '10%'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: hasStops ? '70%' : '10%' }} />
                    </div>
                  </div>

                  {/* Manage Button */}
                  <button 
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="w-full py-3.5 bg-gray-50 hover:bg-purple-600 text-gray-500 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider border border-gray-100 transition-all cursor-pointer text-center"
                  >
                    Manage Plan
                  </button>
                </div>
              </motion.div>
            );
          })}

          {filteredTrips.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
              <Compass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-bold text-sm">No itineraries found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Floating Plan a Trip Action Button (Bottom Right) */}
        <div className="flex justify-end pt-5">
          <button 
            onClick={() => navigate('/create-trip')}
            className="px-7 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-full font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-xl shadow-purple-500/20 active:scale-95"
          >
            <Plus className="w-4.5 h-4.5 stroke-[3px]" />
            <span>Plan a trip</span>
          </button>
        </div>
      </section>

      {/* Savings Goals Drawer Panel */}
      <AnimatePresence>
        {showGoalsDrawer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex justify-end bg-black/45 backdrop-blur-sm"
          >
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowGoalsDrawer(false)} />

            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 flex flex-col justify-between border-l border-gray-100 z-10"
            >
              <div className="space-y-6 flex-1 overflow-y-auto pr-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h3 className="text-md font-extrabold text-gray-800">Financial Savings Goals</h3>
                  </div>
                  <button onClick={() => setShowGoalsDrawer(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="space-y-4">
                  {data?.manifestGoals?.map((goal: any) => (
                    <div 
                      key={goal.id} 
                      className="bg-gray-55/40 p-4.5 rounded-2xl border border-gray-100 space-y-3 group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-800 text-sm leading-tight">{goal.title}</span>
                        <button 
                          onClick={() => { setSelectedGoal(goal); setShowAddMoney(true); }}
                          className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Contribute
                        </button>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                          <span>{goal.currency} {goal.savedAmount.toLocaleString()} saved</span>
                          <span>{Math.round((goal.savedAmount/goal.targetAmount)*100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-150 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.min(100, (goal.savedAmount/goal.targetAmount)*100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {(!data?.manifestGoals || data.manifestGoals.length === 0) && (
                    <div className="text-center py-12">
                      <p className="text-gray-400 font-semibold text-xs">No active savings targets.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button 
                  onClick={() => { setShowGoalsDrawer(false); setShowAddGoal(true); }}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>Create New Target</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Manifest Goal Dialog */}
      <AnimatePresence>
        {showAddGoal && (
          <Modal title="Create Financial Manifestation" onClose={() => setShowAddGoal(false)} onSubmit={handleCreateGoal} loading={submitting}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Dream Goal Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Kyoto Cherry Blossom 2027"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-base focus:outline-none focus:ring-2 focus:ring-purple-200"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Goal Cost Target (INR)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 150000"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-base focus:outline-none focus:ring-2 focus:ring-purple-200"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                />
              </div>
            </div>
          </Modal>
        )}

        {/* Add Funds Dialog */}
        {showAddMoney && (
          <Modal title={`Contribute: ${selectedGoal?.title}`} onClose={() => setShowAddMoney(false)} onSubmit={handleAddMoney} loading={submitting}>
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mx-auto">
                <Wallet className="w-8 h-8" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Fund Contribution</label>
                <input 
                  type="number" 
                  placeholder="e.g. 10000"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 font-bold text-base text-center focus:outline-none focus:ring-2 focus:ring-purple-200"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  autoFocus
                />
              </div>
              <p className="text-gray-400 text-xs font-medium italic">"Every single step brings your destination closer."</p>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const Modal = ({ title, children, onClose, onSubmit, loading }: any) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md"
  >
    <motion.div 
      initial={{ scale: 0.95, y: 15 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100"
    >
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider">{title}</h2>
        <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all cursor-pointer">
          <Plus className="w-6 h-6 rotate-45 text-gray-400" />
        </button>
      </div>
      <div className="p-8">
        {children}
        <button 
          onClick={onSubmit}
          disabled={loading}
          className="w-full mt-8 bg-purple-600 hover:bg-purple-500 text-white py-5 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Goal Entry'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const Compass = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const DashboardSkeleton = () => (
  <div className="space-y-12 animate-pulse p-4">
    <div className="h-80 bg-gray-100 rounded-[3rem]"></div>
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-[2.5rem]"></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="col-span-2 h-[600px] bg-gray-100 rounded-[3rem]"></div>
      <div className="h-[600px] bg-gray-100 rounded-[3rem]"></div>
    </div>
  </div>
);

export default Dashboard;
