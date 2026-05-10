import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, DollarSign, Package, FileText,
  ChevronLeft, Plus, Clock, Trash2, CheckCircle2, Circle,
  BarChart3, TrendingDown, AlertCircle,
  Search, X, Edit3, Loader2, Users2, Wallet, Heart, Zap, ArrowUpRight, TrendingUp, Sparkles, Brain, Bot, FileCheck, CheckCircle, Star, RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../api/axios';
import aiApi from '../api/aiAxios';
import { predictTotalCost, getPackingSuggestions } from '../utils/AIUtility';

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [loading, setLoading] = useState(true);
  const [aiData, setAiData] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
    } catch (err) {
      console.error('Failed to fetch trip', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchAI = async () => {
    if (!trip) return;
    setIsAnalyzing(true);
    try {
      const days = Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24))) || 7;
      const res = await aiApi.post('/intelligence/analyze-trip', {
        destination: trip.destination || trip.name || 'Unknown',
        trip_duration_days: days,
        total_budget_usd: parseInt(trip.budgetEstimate) || 5000,
        group_type: trip.companionType?.toLowerCase() || 'solo',
        group_size: 1,
        personality_type: trip.mood || 'Explorer',
        pace_preference: trip.travelPace?.toLowerCase() || 'moderate',
        luxury_preference: "mid_range",
        preferred_activities: ["sightseeing"],
        travel_constraints: [],
        itinerary: trip.stops?.map((s: any) => ({
          day: 1, location: s.cityName, activities: s.activities?.map((a: any) => a.name) || [], estimated_spend: s.activities?.reduce((acc: any, a: any) => acc + (a.cost || 0), 0) || 0
        })) || [],
        activities: [],
        weather_conditions: [],
        disruptions: [],
        existing_recommendations: aiData?.recommendations,
        existing_budget_analysis: aiData?.budget_analysis,
        existing_adaptations: aiData?.adaptations,
        existing_optimization_results: aiData?.optimization_results,
        existing_travel_insights: aiData?.travel_insights,
        existing_reasoning_summary: aiData?.reasoning_summary
      });
      setAiData(res.data);
    } catch (err) {
      console.error('AI Analysis failed', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchAI();
  }, [trip?.id]); // Only refetch if the trip ID changes

  if (loading) return <div className="text-center py-20 flex flex-col items-center gap-4"><div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div><p className="font-bold text-gray-500">Loading your adventure...</p></div>;
  if (!trip) return <div className="text-center py-20">Trip not found</div>;

  const tabs = [
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'fund', label: 'Travel Fund', icon: Wallet },
    { id: 'packing', label: 'Checklist', icon: Package },
    { id: 'notes', label: 'Journal', icon: FileText },
    { id: 'ai', label: '✨ AI Co-Pilot', icon: Sparkles },
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
              <Calendar className="w-4 h-4 text-purple-300" /> 
              {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'TBA'} - 
              {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'TBA'}
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <MapPin className="w-4 h-4 text-purple-300" /> {trip.stops?.length || 0} destinations
            </span>
            {trip.companionType && (
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                <Users2 className="w-4 h-4 text-purple-300" /> {trip.companionType}
              </span>
            )}
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
          {activeTab === 'budget' && <BudgetTab trip={trip} currency={trip.currency || 'INR'} onUpdate={fetchTrip} aiData={aiData} isAnalyzing={isAnalyzing} />}
          {activeTab === 'fund' && <FundTab trip={trip} onUpdate={fetchTrip} />}
          {activeTab === 'packing' && <PackingTab trip={trip} onUpdate={fetchTrip} />}
          {activeTab === 'notes' && <JournalTab trip={trip} onUpdate={fetchTrip} />}
          {activeTab === 'ai' && <AICoPilotTab trip={trip} aiData={aiData} isAnalyzing={isAnalyzing} onRetry={fetchAI} />}
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
    const data = Object.fromEntries(formData as any);
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
    const data = Object.fromEntries(formData as any);
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
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => setItineraryView('timeline')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${itineraryView === 'timeline' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400'}`}>LIST</button>
            <button onClick={() => setItineraryView('grid')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${itineraryView === 'grid' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400'}`}>GRID</button>
          </div>
          <button
            onClick={() => setShowAddStop(true)}
            className="flex-1 md:flex-none bg-purple-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-purple-700 transition-all shadow-xl shadow-purple-100"
          >
            <Plus className="w-5 h-5" /> Add Stop
          </button>
        </div>
      </div>

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

const BudgetTab = ({ trip, currency, aiData, isAnalyzing }: any) => {

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
          <p className="text-gray-500 font-medium max-w-xs mb-8">
            {isAnalyzing ? "The AI is currently analyzing your spending patterns..." : 
             aiData ? `AI Risk Score: ${aiData.budget_analysis?.risk_score}/100 (${aiData.budget_analysis?.risk_level}). ${aiData.budget_analysis?.alerts?.[0] || 'Looking good!'}` 
             : `The AI is currently analyzing your spending patterns across ${trip.stops?.length} destinations.`}
          </p>
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
              await api.post(`/trips/${trip.id}/packing`, Object.fromEntries(formData as any));
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
              const data = Object.fromEntries(formData as any);
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
          <Modal title="Manifest Funds" onClose={() => setShowAddFund(false)} onSubmit={(e:any)=>{e.preventDefault(); handleContribute();}} loading={loading}>
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

const AICoPilotTab = ({ trip, aiData, isAnalyzing, onRetry }: any) => {
  const [story, setStory] = useState<any>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

  const steps = [
    "Initializing Personality Engine...",
    "Querying Recommendation AI...",
    "Running Reasoning Engine...",
    "Predicting Budget Risks...",
    "Calculating Dynamic Adaptations...",
    "Optimizing Travel Routes...",
    "Scanning for Hidden Gems...",
    "Orchestrating Strategic Insights...",
    "Finalizing Summary Service..."
  ];

  useEffect(() => {
    let interval: any;
    let timeout: any;

    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % steps.length);
      }, 3000);

      // Show a message if it takes more than 45 seconds
      timeout = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, 45000);
    } else {
      setShowTimeoutMessage(false);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [isAnalyzing]);

  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    try {
      const res = await aiApi.post('/summary/generate', {
        destination: trip.destination || trip.name || 'Unknown',
        trip_duration_days: 7,
        total_budget_usd: parseInt(trip.budgetEstimate) || 5000,
        highlights: aiData?.recommendations?.map((r: any) => r.activity) || [],
        personality_type: trip.mood || 'Explorer',
        group_type: trip.companionType?.toLowerCase() || 'solo',
        trip_health_score: aiData?.trip_health_score || 85,
        budget_risk_score: aiData?.budget_analysis?.risk_score || 30
      });
      setStory(res.data);
    } catch (err) {
      console.error('Story Gen Failed', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  if (isAnalyzing) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="relative mb-12">
        <div className="w-24 h-24 border-4 border-purple-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-24 h-24 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-purple-600 animate-pulse" />
      </div>
      <h3 className="text-2xl font-black text-gray-900 mb-2">Adaptive Intelligence Active</h3>
      <p className="text-gray-400 font-bold tracking-widest text-xs uppercase mb-8">Running 9 Core Engines in Parallel</p>
      
      <div className="max-w-xs w-full bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
        <div className="flex items-center gap-4 text-left">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-ping"></div>
          <span className="text-sm font-black text-gray-600">{steps[loadingStep]}</span>
        </div>
      </div>

      {showTimeoutMessage && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <p className="text-xs text-amber-600 font-bold bg-amber-50 px-6 py-3 rounded-full border border-amber-100">
            Engine is being thorough! Large datasets take about 90-120 seconds.
          </p>
          <button 
            onClick={onRetry}
            className="flex items-center gap-2 mx-auto text-purple-600 font-black text-xs hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Force Restart Analysis
          </button>
        </motion.div>
      )}

      <p className="mt-8 text-xs text-gray-400 font-medium italic">Processing millions of travel data points for your {trip.name}...</p>
    </div>
  );

  if (!aiData) return (
    <div className="p-20 text-center space-y-6">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
        <AlertCircle className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-black text-gray-900">Intelligence Link Disrupted</h3>
      <p className="text-gray-500 max-w-sm mx-auto">The engine couldn't synthesize the final report. This usually happens due to rate limits on the AI provider.</p>
      <button onClick={onRetry} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl">RETRY ANALYSIS</button>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden border-4 border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-inner">
                <Sparkles className="w-8 h-8 text-purple-300" />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-purple-300">Traveloop Intelligence Hub</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight mb-4">AI Co-Pilot Dashboard</h2>
            <p className="text-purple-100 font-medium max-w-2xl text-lg leading-relaxed opacity-80">
              Your personalized journey strategy, optimized by 9 specialized AI engines.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/20 text-center min-w-[200px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-300 mb-2">Trip Health Score</p>
            <div className="text-5xl font-black">{aiData.trip_health_score || 85}%</div>
            <p className="text-[10px] font-bold text-green-400 mt-2 uppercase">Optimized & Ready</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 1. Personality Engine */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Travel Personality</h3>
          </div>
          <p className="text-3xl font-black text-gray-900 mb-4">{aiData.personality_type || trip.mood || 'Explorer'}</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-medium leading-relaxed italic border-l-4 border-purple-100 pl-4">
              "{aiData.description || 'Custom intelligence matching your relaxed yet adventurous travel style.'}"
            </p>
          </div>
        </div>

        {/* 4. Budget Prediction Engine */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Budget Prediction</h3>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <p className="text-4xl font-black text-gray-900">{aiData.budget_analysis?.risk_score || 30}</p>
            <p className="text-xs font-black text-gray-400 uppercase mb-2">Risk Score</p>
          </div>
          <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl w-fit">
            {aiData.budget_analysis?.risk_level || 'Low Risk'}
          </p>
        </div>

        {/* 9. AI Story Generator */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all group bg-gradient-to-br from-white to-indigo-50/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">AI Story Generator</h3>
          </div>
          <button onClick={handleGenerateStory} disabled={isGeneratingStory} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-xl">
            {isGeneratingStory ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 text-amber-300" />} {story ? 'REGENERATE STORY' : 'CREATE TRIP NARRATIVE'}
          </button>
          {story && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-white rounded-2xl border border-indigo-100 shadow-inner">
               <h4 className="text-sm font-black text-indigo-600 mb-2">{story.headline}</h4>
               <p className="text-xs text-gray-500 font-medium leading-relaxed italic line-clamp-3">"{story.executive_summary}"</p>
             </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2 & 3 & 7. Recommendation Engine + Reasoning Engine + Hidden Gems */}
        <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xs font-black text-pink-600 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center"><Star className="w-4 h-4"/></div>
              Recommendation & Reasoning
            </h3>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Personalized Discovery</span>
          </div>
          <div className="space-y-6">
            {aiData.recommendations?.map((rec:any, i:number) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 hover:border-pink-200 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1 block">Activity Recommendation</span>
                    <h4 className="font-black text-gray-900 text-xl tracking-tight">{rec.activity}</h4>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black bg-pink-100 text-pink-600 px-3 py-1 rounded-full uppercase mb-2">
                      {Math.round((rec.confidence || 0.9) * 100)}% Match
                    </span>
                    {rec.is_hidden_gem && <span className="text-[9px] font-black text-amber-600 uppercase flex items-center gap-1"><Sparkles className="w-3 h-3"/> Hidden Gem</span>}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                   <p className="text-sm text-gray-600 font-medium italic leading-relaxed border-l-2 border-pink-400 pl-4">
                     <span className="text-pink-400 font-black not-italic uppercase text-[10px] tracking-widest block mb-1">AI Reasoning</span>
                     {rec.reason}
                   </p>
                </div>
              </motion.div>
            ))}
            {(!aiData.recommendations || aiData.recommendations.length === 0) && (
               <div className="py-20 text-center opacity-40">
                 <Package className="w-16 h-16 mx-auto mb-4" />
                 <p className="font-bold">No active recommendations</p>
               </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* 5 & 6. Adaptation & Optimization Engines */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black text-amber-600 uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center"><Zap className="w-4 h-4"/></div>
              Dynamic Adaptation & Route Optimization
            </h3>
            <div className="space-y-8">
              <div className="bg-amber-50/50 p-8 rounded-3xl border border-amber-100 relative overflow-hidden">
                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">Environment Adaptations</h4>
                {aiData.adaptations?.length > 0 ? aiData.adaptations.map((ad:any, i:number) => (
                  <div key={i} className="text-sm font-bold text-gray-800 bg-white p-4 rounded-2xl mb-3 flex items-start gap-4 shadow-sm border border-amber-200/50">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"/>
                    <span>{typeof ad === 'string' ? ad : ad.adaptation || 'Adaptation active'}</span>
                  </div>
                )) : <p className="text-sm text-gray-400 font-medium italic">No dynamic environment changes detected. Monitoring weather and traffic...</p>}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl"></div>
              </div>
              
              <div className="bg-emerald-50/50 p-8 rounded-3xl border border-emerald-100 relative overflow-hidden">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Route Efficiency Engine</h4>
                {aiData.optimization_results?.length > 0 ? aiData.optimization_results.map((op:any, i:number) => (
                  <div key={i} className="text-sm font-bold text-gray-800 bg-white p-4 rounded-2xl mb-3 flex items-start gap-4 shadow-sm border border-emerald-200/50">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5"/>
                    <span>{typeof op === 'string' ? op : op.suggestion || 'Optimization applied'}</span>
                  </div>
                )) : <p className="text-sm text-gray-400 font-medium italic">Current route is mathematically optimized for distance and time.</p>}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>

          {/* 8. Travel Insights (Orchestrator) */}
          <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center"><FileCheck className="w-4 h-4"/></div>
              Strategic Insights
            </h3>
            <div className="space-y-4 relative z-10">
              {aiData.travel_insights?.map((insight:any, i:number) => (
                <div key={i} className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-sm font-medium text-purple-100 flex items-start gap-4 group hover:bg-white/10 transition-all">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 shrink-0 group-hover:scale-150 transition-all"></div>
                  {typeof insight === 'string' ? insight : insight.insight || 'Contextual Insight'}
                </div>
              ))}
              {(!aiData.travel_insights || aiData.travel_insights.length === 0) && <p className="text-xs text-gray-500 italic text-center py-10">Synthesizing strategic trip observations...</p>}
            </div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
