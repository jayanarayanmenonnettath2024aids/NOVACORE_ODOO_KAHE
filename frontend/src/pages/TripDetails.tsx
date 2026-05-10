import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, DollarSign, Package, FileText,
  ChevronLeft, Plus, Clock, Trash2, CheckCircle2, Circle,
  BarChart3, TrendingDown, AlertCircle, Sparkles,
  Search, X, Edit3, Loader2, Users, Wallet, Heart, Zap, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../api/axios';
import { predictTotalCost, getPackingSuggestions } from '../utils/AIUtility';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
      // Automatically run analysis if trip has metadata
      if (response.data.primaryDestination && !aiAnalysis) {
        runAIAnalysis();
      }
    } catch (err) {
      console.error('Failed to fetch trip', err);
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await api.post(`/trips/${id}/analyze`);
      setAiAnalysis(res.data);
    } catch (err) {
      console.error('AI Analysis failed', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  if (loading) return <div className="text-center py-20 flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div><p className="font-bold text-gray-500">Loading your adventure...</p></div>;
  if (!trip) return <div className="text-center py-20">Trip not found</div>;

  const tabs = [
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'fund', label: 'Travel Fund', icon: Wallet },
    { id: 'packing', label: 'Checklist', icon: Package },
    { id: 'notes', label: 'Journal', icon: FileText },
  ];

  return (
    <div className="space-y-6 pb-20">
      <button
        onClick={() => navigate('/trips')}
        className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to My Trips
      </button>

      <div className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
        <img
          src={trip.coverPhotoUrl || `https://source.unsplash.com/random/1200x400?travel,${trip.name}`}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-8 left-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest shadow-lg ${trip.type === 'International' ? 'bg-purple-600 text-white' : 'bg-purple-600 text-white'}`}>
              {trip.type || 'National'}
            </span>
          </div>
          <h1 className="text-base font-black mb-2 tracking-tight">{trip.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-base font-bold opacity-90 mt-4">
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <Calendar className="w-4 h-4 text-purple-300" /> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <MapPin className="w-4 h-4 text-purple-300" /> {trip.stops?.length || 0} destinations
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                <Users className="w-4 h-4 text-purple-300" /> {trip.companionType}
              </span>
            {trip.mood && (
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 capitalize">
                <TrendingUp className="w-4 h-4 text-amber-300" /> {trip.mood}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-[1.8rem] w-fit shadow-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.4rem] font-bold transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-xl scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="min-h-[500px]"
        >
          {activeTab === 'itinerary' && <ItineraryTab trip={trip} onUpdate={fetchTrip} />}
          {activeTab === 'budget' && <BudgetTab trip={trip} currency={trip.currency || 'INR'} onUpdate={fetchTrip} />}
          {activeTab === 'fund' && <FundTab trip={trip} onUpdate={fetchTrip} />}
          {activeTab === 'packing' && <PackingTab trip={trip} onUpdate={fetchTrip} />}
          {activeTab === 'notes' && <JournalTab trip={trip} onUpdate={fetchTrip} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ItineraryTab = ({ trip, onUpdate }: any) => {
  const [showAddStop, setShowAddStop] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [itineraryView, setItineraryView] = useState<'timeline' | 'grid'>('timeline');
  const [activitySearch, setActivitySearch] = useState('');
  const [selectedActType, setSelectedActType] = useState('All');

  const suggestedActivities = [
    { name: 'Museum Visit', type: 'Culture', cost: 20, duration: '3h', img: 'https://images.unsplash.com/photo-1518998053502-53cc8de79e78' },
    { name: 'Local Food Tour', type: 'Food', cost: 50, duration: '2h', img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' },
    { name: 'City Bike Tour', type: 'Adventure', cost: 35, duration: '4h', img: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182' },
    { name: 'Sunset Cruise', type: 'Sightseeing', cost: 80, duration: '2h', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e' },
  ];

  const filteredSuggested = suggestedActivities.filter(a =>
    (selectedActType === 'All' || a.type === selectedActType) &&
    a.name.toLowerCase().includes(activitySearch.toLowerCase())
  );

  const handleAddStop = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      await api.post(`/trips/${trip.id}/stops`, {
        ...data,
        orderIndex: trip.stops.length
      });
      setShowAddStop(false);
      onUpdate();
    } catch (err) { alert('Failed to add stop'); } finally { setLoading(false); }
  };

  const handleAddActivity = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    try {
      await api.post(`/trips/stops/${showAddActivity}/activities`, data);
      setShowAddActivity(null);
      onUpdate();
    } catch (err) { alert('Failed to add activity'); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Itinerary Builder</h3>
          <p className="text-gray-500 font-medium">Review and construct your full plan.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={runAIAnalysis}
            disabled={isAnalyzing}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isAnalyzing ? 'THINKING...' : 'DEEP THINK AI'}
          </button>
          <button
            onClick={() => setShowAddStop(true)}
            className="flex-1 md:flex-none bg-purple-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-purple-700 transition-all shadow-xl shadow-purple-100"
          >
            <Plus className="w-5 h-5" /> Add Stop
          </button>
        </div>
      </div>

      {/* AI Reasoning Display Section */}
      {aiAnalysis && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 opacity-80">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Model: {aiAnalysis.model}</span>
                </div>
                <h4 className="text-xl font-black mb-2">Discovery Reasoning</h4>
                <p className="text-sm font-medium opacity-90 leading-relaxed">
                  {aiAnalysis.reasoning.budget}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${aiAnalysis.reasoning?.status === 'OPTIMIZED' ? 'bg-green-400/20 text-green-100' : 'bg-amber-400/20 text-amber-100'}`}>
                    {aiAnalysis.reasoning?.status || 'ANALYZING'}
                  </span>
                  <span className="text-xs font-bold">Suggested: ₹{aiAnalysis.reasoning?.suggestedAmount?.toLocaleString() || '---'}</span>
                </div>
             </div>
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-24 h-24" />
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Package className="w-4 h-4 text-purple-600" />
                AI Packing List
             </h4>
             <ul className="space-y-3">
                {aiAnalysis.recommendations.packing.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
             </ul>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Pace Advice
             </h4>
             <p className="text-sm font-bold text-gray-700 leading-relaxed mb-6 italic">
                "{aiAnalysis.recommendations.paceAdvice}"
             </p>
             <div className="p-4 bg-purple-50 rounded-2xl">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-2">Strategy Used</p>
                <p className="text-xs font-bold text-gray-900">{trip.discoveryStrategy || 'Single City Deep Dive'}</p>
             </div>
          </div>
        </motion.div>
      )}

      {/* Suggested Discovery Paths if no stops exist */}
      {aiAnalysis && (!trip.stops || trip.stops.length === 0) && (
        <section className="space-y-6">
           <div className="flex items-center gap-4">
              <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                AI Discovery Paths for {trip.primaryDestination}
              </h2>
              <div className="w-full h-px bg-gray-200/80" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiAnalysis.recommendations.itineraries.map((it: any, idx: number) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-lg relative group cursor-pointer hover:border-purple-200"
                >
                   <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6" />
                   </div>
                   <h4 className="text-base font-black text-gray-900 mb-2">{it.title}</h4>
                   <p className="text-xs font-medium text-gray-500 leading-relaxed mb-6">
                      Recommended: {it.activity}
                   </p>
                   <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all opacity-0 group-hover:opacity-100">
                      IMPORT PATH
                   </button>
                </motion.div>
              ))}
           </div>
        </section>
      )}

      <div className={`relative ${itineraryView === 'timeline' ? 'border-l-4 border-purple-100 ml-8 space-y-12 pb-12' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12'}`}>
        {trip.stops?.length > 0 ? (
          trip.stops.map((stop: any, idx: number) => (
            <div key={stop.id} className={`relative group ${itineraryView === 'timeline' ? 'pl-12' : ''}`}>
              {itineraryView === 'timeline' && <div className="absolute -left-[14px] top-0 w-6 h-6 bg-purple-600 rounded-full border-4 border-white shadow-xl ring-4 ring-purple-50 group-hover:scale-125 transition-transform"></div>}
              <div className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300 ${itineraryView === 'timeline' ? 'p-8' : 'p-6 h-full flex flex-col'}`}>
                <div className={`flex flex-col justify-between items-start gap-4 mb-6 ${itineraryView === 'timeline' ? 'md:flex-row' : ''}`}>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-base shadow-inner">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-gray-900 tracking-tight line-clamp-1">{stop.cityName}</h4>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">{stop.country}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between border-t pt-4">
                    <h5 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Activities</h5>
                    <button
                      onClick={() => setShowAddActivity(stop.id)}
                      className="text-xs font-black text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all"
                    >
                      + ASSIGN
                    </button>
                  </div>
                  <div className="space-y-3">
                    {stop.activities?.map((activity: any) => (
                      <div key={activity.id} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-purple-100 hover:bg-white transition-all shadow-sm group/act">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-sm">{activity.name}</p>
                          <p className="text-xs font-black text-purple-600/30 uppercase tracking-widest">${activity.cost || 0}</p>
                        </div>
                      </div>
                    ))}
                    {(!stop.activities || stop.activities.length === 0) && (
                      <div className="py-6 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-[10px] font-bold text-gray-400 italic">No items yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="pl-12 py-32 text-center bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-200 mx-8">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border border-gray-50">
              <MapPin className="w-12 h-12 text-gray-200" />
            </div>
            <h4 className="text-base font-black text-gray-900 mb-2">Build your path</h4>
            <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">Add your first city stop to begin constructing your daily itinerary.</p>
            <button
              onClick={() => setShowAddStop(true)}
              className="bg-purple-600 text-white px-12 py-5 rounded-[2rem] font-black text-base shadow-2xl shadow-purple-200 hover:bg-purple-700 transition-all active:scale-95"
            >
              Add First Stop
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddStop && (
          <Modal title="Add New Stop" onClose={() => setShowAddStop(false)} onSubmit={handleAddStop} loading={loading}>
            <div className="space-y-4">
              <Input name="cityName" label="City Name" placeholder="e.g. Kyoto" required />
              <Input name="country" label="Country" placeholder="e.g. Japan" required />
              <div className="grid grid-cols-2 gap-4">
                <Input name="startDate" label="From" type="date" />
                <Input name="endDate" label="To" type="date" />
              </div>
            </div>
          </Modal>
        )}
        {showAddActivity && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-hidden flex flex-col">
              <button onClick={() => setShowAddActivity(null)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900"><X className="w-6 h-6" /></button>
              <div className="mb-8">
                <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Activity Search</h3>
                <p className="text-gray-500 font-medium">Browse and select things to do in this stop.</p>
              </div>
              <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} placeholder="Search activities..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-bold" />
                </div>
                <select value={selectedActType} onChange={(e) => setSelectedActType(e.target.value)} className="px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-bold text-gray-500">
                  <option value="All">All Interests</option>
                  <option value="Culture">Culture</option>
                  <option value="Food">Food</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Sightseeing">Sightseeing</option>
                </select>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                {filteredSuggested.map((act, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-[2rem] overflow-hidden border border-transparent hover:border-purple-100 transition-all group flex flex-col">
                    <div className="h-32 relative"><img src={act.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /><div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-black text-purple-600 shadow-sm">${act.cost}</div></div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2"><h4 className="font-black text-gray-900 leading-tight">{act.name}</h4><span className="text-xs font-black text-gray-400 uppercase tracking-widest">{act.duration}</span></div>
                      <button onClick={async () => { setLoading(true); try { await api.post(`/trips/stops/${showAddActivity}/activities`, { name: act.name, cost: act.cost, type: act.type }); setShowAddActivity(null); onUpdate(); } catch (err) { alert('Failed to add activity'); } finally { setLoading(false); } }} className="mt-auto w-full py-3 bg-white text-purple-600 rounded-xl font-black text-xs hover:bg-purple-600 hover:text-white transition-all shadow-sm">ADD TO STOP</button>
                    </div>
                  </div>
                ))}
                <div className="col-span-full border-t pt-8 mt-4">
                  <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Or Add Custom Activity</h5>
                  <form onSubmit={handleAddActivity} className="space-y-4">
                    <Input name="name" label="Custom Activity Name" placeholder="e.g. Secret Rooftop Bar" required />
                    <div className="grid grid-cols-2 gap-4"><Input name="cost" label="Estimated Cost ($)" type="number" defaultValue="0" /><Input name="duration" label="Duration" defaultValue="2h" /></div>
                    <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm">Create Custom Activity</button>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Modal = ({ title, children, onClose, onSubmit, loading }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md">
    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md relative">
      <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900"><X className="w-6 h-6" /></button>
      <h3 className="text-base font-black text-gray-900 mb-8 tracking-tight">{title}</h3>
      <form onSubmit={onSubmit} className="space-y-8">
        {children}
        <button disabled={loading} className="w-full bg-purple-600 text-white py-5 rounded-2xl font-black text-base shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm & Save'}
        </button>
      </form>
    </motion.div>
  </motion.div>
);

const Input = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input {...props} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-bold" />
  </div>
);

const BudgetTab = ({ trip, currency }: any) => {
  const predictedTotal = predictTotalCost(trip, currency);
  const currencySymbols: any = { 'USD': '$', 'EUR': '€', 'INR': '₹', 'GBP': '£', 'JPY': '¥' };
  const symbol = currencySymbols[currency] || '$';

  const COLORS = ['#a855f7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const actualCost = trip.stops?.reduce((acc: number, stop: any) =>
    acc + (stop.activities?.reduce((s: number, a: any) => s + (a.cost || 0), 0) || 0), 0
  ) || 0;

  const data = [
    { name: 'Planned', value: actualCost },
    { name: 'Buffer', value: Math.round(predictedTotal * 0.15) },
    { name: 'Daily Est.', value: Math.round(predictedTotal * 0.25) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center gap-3 text-purple-600 mb-4">
            <DollarSign className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest">AI PREDICTED TOTAL</span>
          </div>
          <h4 className="text-base font-black text-gray-900">{symbol}{predictedTotal.toLocaleString()}</h4>
          <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 w-fit px-3 py-1.5 rounded-xl">
            <TrendingDown className="w-3.5 h-3.5" /> High Accuracy
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between text-xs font-black text-gray-400 mb-3 tracking-widest">
            <span>PLANNING COMPLETION</span>
            <span className="text-purple-600">{Math.round((actualCost / predictedTotal) * 100) || 0}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(actualCost / predictedTotal) * 100}%` }} className="h-full bg-purple-600 rounded-full"></motion.div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <AlertCircle className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest">AI SAVINGS BOT</span>
          </div>
          <p className="font-bold text-base leading-snug">The AI detected potential savings of {symbol}{Math.round(predictedTotal * 0.12)} if you switch to group activities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <h4 className="text-base font-black text-gray-900 mb-8 tracking-tight">Financial Forecast</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
            <BarChart3 className="w-10 h-10 text-purple-600" />
          </div>
          <h4 className="text-base font-black text-gray-900 mb-2">Detailed Analytics</h4>
          <p className="text-gray-500 font-medium max-w-xs mb-8">The AI is currently analyzing your spending patterns across {trip.stops?.length} destinations.</p>
          <button className="px-10 py-4 bg-gray-900 text-white rounded-[1.5rem] font-black text-sm hover:scale-105 transition-all shadow-xl">VIEW FULL REPORT</button>
        </div>
      </div>
    </div>
  );
};

const PackingTab = ({ trip, onUpdate }: any) => {
  const [loading, setLoading] = useState(false);
  const [activeCat, setActiveCat] = useState('All');
  const categories = ['All', 'Clothing', 'Electronics', 'Documents', 'Health', 'AI Suggested'];

  const items = trip.packingItems || [];
  const filteredItems = activeCat === 'All' ? items : items.filter((i: any) => i.category === activeCat);
  const packedCount = items.filter((i: any) => i.isPacked).length;
  const progress = (packedCount / items.length) * 100 || 0;

  const handleToggle = async (itemId: string) => {
    try {
      await api.put(`/trips/packing/${itemId}`);
      onUpdate();
    } catch (err) { alert('Failed to update item'); }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await api.delete(`/trips/packing/${itemId}`);
      onUpdate();
    } catch (err) { alert('Failed to delete item'); }
  };

  const handleReset = async () => {
    try {
      await api.post(`/trips/${trip.id}/packing/reset`);
      onUpdate();
    } catch (err) { alert('Failed to reset'); }
  };

  const addAISuggestions = async () => {
    const aiSuggestions = getPackingSuggestions(trip);
    setLoading(true);
    try {
      // Add multiple items sequentially for simplicity in this demo
      for (const s of aiSuggestions) {
        if (!items.some((i: any) => i.name === s)) {
          await api.post(`/trips/${trip.id}/packing`, { name: s, category: 'AI Suggested' });
        }
      }
      onUpdate();
    } catch (err) { alert('Failed to generate items'); } finally { setLoading(false); }
  };

  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex-1 w-full">
            <div className="flex justify-between font-black text-gray-400 text-[10px] tracking-[0.2em] mb-3">
              <span>PACKING PROGRESS</span>
              <span className="text-purple-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-purple-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></motion.div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleReset} className="px-6 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black text-xs hover:bg-gray-200 transition-all">RESET</button>
            <button onClick={addAISuggestions} className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg text-sm"><TrendingUp className="w-4 h-4" /> AI AUTO-GENERATE</button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-6 mb-8 no-scrollbar border-b">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)} className={`px-6 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all ${activeCat === cat ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>{cat}</button>
          ))}
          <button onClick={() => setShowAdd(true)} className="ml-auto flex items-center gap-2 text-purple-600 font-black text-xs hover:bg-purple-50 px-4 py-2 rounded-xl transition-all">+ ADD ITEM</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item: any) => (
            <div key={item.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${item.isPacked ? 'bg-green-50/50 border-green-100 opacity-60' : 'bg-white border-gray-100 hover:border-purple-200 hover:shadow-md'}`}>
              <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleToggle(item.id)}>
                {item.isPacked ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-gray-200" />}
                <div>
                  <p className={`font-bold ${item.isPacked ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.name}</p>
                  <p className="text-xs font-black text-purple-600/40 uppercase tracking-widest">{item.category}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
              <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold italic text-sm">No items found in this category.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAdd && (
          <Modal title="Add Packing Item" onClose={() => setShowAdd(false)} loading={loading} onSubmit={async (e: any) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            try {
              await api.post(`/trips/${trip.id}/packing`, Object.fromEntries(formData));
              setShowAdd(false);
              onUpdate();
            } catch (err) { alert('Failed to add item'); }
          }}>
            <div className="space-y-4">
              <Input name="name" label="Item Name" placeholder="e.g. Hiking Boots" required />
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                <select name="category" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-bold text-gray-500">
                  <option>Clothing</option>
                  <option>Electronics</option>
                  <option>Documents</option>
                  <option>Health</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const JournalTab = ({ trip, onUpdate }: any) => {
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editNote, setEditNote] = useState<any>(null);

  const notes = trip.notes || [];

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Delete this journal entry?')) {
      try {
        await api.delete(`/notes/${noteId}`);
        onUpdate();
      } catch (err) { alert('Failed to delete note'); }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-purple-50/50">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Trip Journal</h3>
          <p className="text-gray-400 font-bold text-sm mt-1">Capture your favorite moments and important details.</p>
        </div>
        <button
          onClick={() => { setEditNote(null); setShowAdd(true); }}
          className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" /> WRITE ENTRY
        </button>
      </div>

      <div className="space-y-6">
        {notes.map((note: any) => (
          <motion.div
            key={note.id}
            whileHover={{ y: -5 }}
            className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">Memories</span>
                  <span className="text-xs font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(note.timestamp).toLocaleString()}
                  </span>
                </div>
                {note.stopId && (
                  <p className="flex items-center gap-1.5 text-sm font-bold text-purple-400">
                    <MapPin className="w-3.5 h-3.5" /> Tied to {trip.stops.find((s: any) => s.id === note.stopId)?.cityName}
                  </p>
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditNote(note); setShowAdd(true); }}
                  className="p-3 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-base leading-relaxed font-medium whitespace-pre-wrap">{note.content}</p>
          </motion.div>
        ))}

        {notes.length === 0 && (
          <div className="py-24 text-center bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-100">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Edit3 className="w-10 h-10 text-gray-200" />
            </div>
            <h4 className="text-base font-black text-gray-300">No journal entries yet</h4>
            <p className="text-gray-400 font-bold mt-2">Start documenting your journey today!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <Modal
            title={editNote ? "Edit Entry" : "New Journal Entry"}
            onClose={() => setShowAdd(false)}
            loading={loading}
            onSubmit={async (e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData);
              setLoading(true);
              try {
                if (editNote) {
                  await api.put(`/notes/${editNote.id}`, data);
                } else {
                  await api.post(`/notes/${trip.id}`, data);
                }
                setShowAdd(false);
                onUpdate();
              } catch (err) { alert('Failed to save entry'); } finally { setLoading(false); }
            }}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tie to Destination (Optional)</label>
                <select name="stopId" defaultValue={editNote?.stopId || ""} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none font-bold text-gray-600">
                  <option value="">Full Trip Note</option>
                  {trip.stops?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.cityName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Your Note</label>
                <textarea
                  name="content"
                  rows={6}
                  required
                  defaultValue={editNote?.content || ""}
                  placeholder="Describe your day, save a confirmation number, or jot down a memory..."
                  className="w-full px-6 py-4 rounded-[2rem] bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-medium text-gray-700 text-base resize-none"
                />
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

const FundTab = ({ trip, onUpdate }: any) => {
  const [showAddFund, setShowAddFund] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [contributions, setContributions] = useState<any[]>([]);

  useEffect(() => {
    fetchContributions();
  }, [trip.id]);

  const fetchContributions = async () => {
    try {
      const res = await api.get(`/trips/${trip.id}/contributions`);
      setContributions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleContribute = async () => {
    if (!amount) return;
    const remaining = (trip.budgetEstimate || 0) - (trip.currentSavings || 0);
    if (parseFloat(amount) > remaining) {
      alert(`Manifestation successful! You only need ${trip.currency} ${remaining.toLocaleString()} to reach your budget goal.`);
      return;
    }
    setLoading(true);
    try {
      await api.post(`/trips/${trip.id}/contributions`, { amount, message });
      setAmount('');
      setMessage('');
      setShowAddFund(false);
      onUpdate();
      fetchContributions();
    } catch (err) {
      alert('Failed to add funds');
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.min(100, (trip.currentSavings / (trip.budgetEstimate || 1)) * 100);

  return (
    <div className="space-y-10">
      {/* Progress Header */}
      <div className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4 text-purple-400">
              <Wallet className="w-6 h-6" />
              <span className="text-xs font-black uppercase tracking-widest">Travel Fund</span>
            </div>
            <h2 className="text-base font-black mb-2 tracking-tight">{trip.currency} {trip.currentSavings?.toLocaleString()}</h2>
            <p className="text-gray-400 font-bold">manifested towards your {trip.currency} {trip.budgetEstimate?.toLocaleString()} goal</p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-base font-black">{Math.round(progress)}%</span>
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">FUNDED</span>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-purple-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]"
              />
            </div>
            <button
              onClick={() => setShowAddFund(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 py-5 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20"
            >
              <Plus className="w-6 h-6" /> ADD MONEY
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Contribution History</h3>
          <div className="space-y-4">
            {contributions.map((c: any) => (
              <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-base">{c.userName}</p>
                    <p className="text-gray-400 font-bold text-xs italic">"{c.message || 'Saving for the adventure!'}"</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-purple-600">+{trip.currency} {c.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {contributions.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <Wallet className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-black">No contributions yet. Be the first to start the fund!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">AI Financial Tip</h3>
            </div>
            <p className="text-gray-600 font-medium leading-relaxed italic">
              "Based on your current savings rate, you'll reach your goal in approximately {Math.ceil(((trip.budgetEstimate || 1000) - trip.currentSavings) / (contributions.length > 0 ? (contributions[0].amount || 100) : 1000))} weeks. Inviting more collaborators can speed this up by 40%!"
            </p>
          </section>

          <section className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-base font-black mb-4">Collaborative Power</h3>
              <p className="text-purple-100 text-sm font-medium mb-6">Invite your travel buddies to contribute. All funds are tracked transparently for everyone to see.</p>
              <button className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">
                SHARE INVITE LINK <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-0 right-0 -mb-10 -mr-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showAddFund && (
          <Modal title="Manifest Funds" onClose={() => setShowAddFund(false)} onSubmit={handleContribute} loading={loading}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contribution Amount ({trip.currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-black text-base"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Message (Optional)</label>
                <textarea
                  placeholder="Saving for our dream trip!"
                  className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-medium text-gray-600 h-32"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripDetails;
