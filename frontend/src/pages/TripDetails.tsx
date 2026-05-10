import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, DollarSign, Package, FileText,
  ChevronLeft, ChevronDown, Plus, Clock, Trash2, CheckCircle2, Circle, Check,
  BarChart3, TrendingDown, AlertCircle,
  Search, X, Edit3, Loader2, Users, Users2, Wallet, Heart, Zap, ArrowUpRight, TrendingUp, Sparkles, Brain, Bot, FileCheck, CheckCircle, Star, RefreshCw
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
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
      // Automatically run analysis if trip has metadata
      if (response.data?.primaryDestination && !aiAnalysis) {
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
          {activeTab === 'itinerary' && <ItineraryTab trip={trip} onUpdate={fetchTrip} aiAnalysis={aiAnalysis} isAnalyzing={isAnalyzing} runAIAnalysis={runAIAnalysis} />}
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

const ItineraryTab = ({ trip, onUpdate, aiAnalysis, isAnalyzing, runAIAnalysis }: any) => {
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
        orderIndex: trip?.stops?.length || 0
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
    <div className="space-y-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .section-card { transition: box-shadow 0.2s, transform 0.2s; }
        .section-card:hover { box-shadow: 0 8px 32px rgba(109,40,217,0.10); transform: translateY(-2px); }
        .pill-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:999px; border:1.5px solid #e5e7eb; background:#fff; font-size:12px; font-weight:700; color:#374151; cursor:pointer; transition:border-color 0.15s,background 0.15s; }
        .pill-btn:hover { border-color:#a855f7; background:#faf5ff; color:#7c3aed; }
        .add-section-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:16px; border-radius:16px; border:2px dashed #d1d5db; background:transparent; font-size:13px; font-weight:800; color:#6b7280; cursor:pointer; letter-spacing:0.03em; transition:border-color 0.15s,color 0.15s,background 0.15s; }
        .add-section-btn:hover { border-color:#a855f7; color:#7c3aed; background:#faf5ff; }
      `}</style>

      {/* Header bar: title + LIST/GRID toggle + Add Stop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Itinerary Builder</h3>
          <p className="text-gray-400 text-sm font-medium mt-0.5">Review and construct your full plan.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="hidden sm:flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setItineraryView('timeline')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                itineraryView === 'timeline' ? 'bg-white shadow text-purple-600' : 'text-gray-400 hover:text-gray-700'
              }`}
            >LIST</button>
            <button
              onClick={() => setItineraryView('grid')}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                itineraryView === 'grid' ? 'bg-white shadow text-purple-600' : 'text-gray-400 hover:text-gray-700'
              }`}
            >GRID</button>
          </div>
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
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Stop
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
                  <span className="text-[10px] font-black uppercase tracking-widest">Model: {aiAnalysis?.model || 'Traveloop-v1'}</span>
                </div>
                <h4 className="text-xl font-black mb-2">Discovery Reasoning</h4>
                <p className="text-sm font-medium opacity-90 leading-relaxed">
                  {aiAnalysis?.reasoning?.budget || 'Calculating optimal budget strategies...'}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${aiAnalysis?.reasoning?.status === 'OPTIMIZED' ? 'bg-green-400/20 text-green-100' : 'bg-amber-400/20 text-amber-100'}`}>
                    {aiAnalysis?.reasoning?.status || 'ANALYZING'}
                  </span>
                  <span className="text-xs font-bold">Suggested: ₹{aiAnalysis?.reasoning?.suggestedAmount?.toLocaleString() || '---'}</span>
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
                {aiAnalysis?.recommendations?.packing?.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                )) || <li className="text-gray-400 italic text-xs">Generating list...</li>}
             </ul>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Pace Advice
             </h4>
             <p className="text-sm font-bold text-gray-700 leading-relaxed mb-6 italic">
                "{aiAnalysis?.recommendations?.paceAdvice || 'Analyzing travel pace...'}"
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
              {aiAnalysis?.recommendations?.itineraries?.map((it: any, idx: number) => (
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

      {trip.stops?.length > 0 ? (
        <div className={`relative ${itineraryView === 'timeline' ? 'border-l-4 border-purple-100 ml-8 space-y-12 pb-12' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12'}`}>
          {trip.stops.map((stop: any, idx: number) => {
            const activityCost = stop.activities?.reduce((s: number, a: any) => s + (a.cost || 0), 0) || 0;
            const hasDateRange = stop.startDate || stop.endDate;
            return (
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
                  {/* Edit/Delete */}
                  <div className="flex gap-1.5 ml-4">
                    <button className="p-2 rounded-lg text-gray-300 hover:text-purple-600 hover:bg-purple-50 transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Pill buttons row */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button className="pill-btn">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    {hasDateRange
                      ? `${stop.startDate ? new Date(stop.startDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : '—'} to ${stop.endDate ? new Date(stop.endDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : '—'}`
                      : 'Date Range: Set dates'}
                  </button>
                  <button
                    className="pill-btn"
                    onClick={() => setShowAddActivity(stop.id)}
                  >
                    <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                    {activityCost > 0 ? `Budget: ${trip.currency || '₹'} ${activityCost.toLocaleString()}` : 'Budget of this section'}
                  </button>
                  <button
                    onClick={() => setShowAddActivity(stop.id)}
                    className="pill-btn"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                    Add Activity
                  </button>
                </div>
                </div>
              </div>
            );
          })}

          {/* Add another Section button */}
          <button className="add-section-btn" onClick={() => setShowAddStop(true)}>
            <Plus className="w-4 h-4" />
            Add another Section
          </button>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-24 bg-gray-50/60 rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg border border-gray-100">
            <MapPin className="w-10 h-10 text-gray-200" />
          </div>
          <h4 className="text-base font-black text-gray-800 mb-2">Build your path</h4>
          <p className="text-gray-400 font-medium text-sm max-w-xs text-center mb-8">
            Add your first city stop to begin constructing your <span className="text-purple-600 font-bold">daily itinerary</span>.
          </p>
          <button
            onClick={() => setShowAddStop(true)}
            className="bg-purple-600 text-white px-10 py-4 rounded-full font-black text-sm shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all active:scale-95"
          >
            Add First Stop
          </button>
        </div>
      )}

      {/* Modals */}
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
                <h3 className="text-2xl font-black text-gray-900 mb-1">Activity Search</h3>
                <p className="text-gray-400 font-medium text-sm">Browse and select things to do in this stop.</p>
              </div>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} placeholder="Search activities..." className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-bold text-sm" />
                </div>
                <select value={selectedActType} onChange={(e) => setSelectedActType(e.target.value)} className="px-5 py-3.5 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-bold text-gray-500 text-sm">
                  <option value="All">All Types</option>
                  <option value="Culture">Culture</option>
                  <option value="Food">Food</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Sightseeing">Sightseeing</option>
                </select>
              </div>
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
                {filteredSuggested.map((act, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-transparent hover:border-purple-100 transition-all group flex flex-col">
                    <div className="h-28 relative"><img src={act.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={act.name} /><div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-black text-purple-600">${act.cost}</div></div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2"><h4 className="font-black text-gray-900 text-sm leading-tight">{act.name}</h4><span className="text-xs font-bold text-gray-400">{act.duration}</span></div>
                      <button onClick={async () => { setLoading(true); try { await api.post(`/trips/stops/${showAddActivity}/activities`, { name: act.name, cost: Number(act.cost) || 0, type: act.type }); setShowAddActivity(null); onUpdate(); } catch (err) { alert('Failed'); } finally { setLoading(false); } }} className="mt-auto w-full py-2.5 bg-white text-purple-600 rounded-xl font-black text-xs hover:bg-purple-600 hover:text-white transition-all border border-purple-100">ADD TO STOP</button>
                    </div>
                  </div>
                ))}
                <div className="col-span-full border-t pt-6 mt-2">
                  <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Or Add Custom Activity</h5>
                  <form onSubmit={handleAddActivity} className="space-y-4">
                    <Input name="name" label="Activity Name" placeholder="e.g. Secret Rooftop Bar" required />
                    <div className="grid grid-cols-2 gap-4"><Input name="cost" label="Cost (₹)" type="number" defaultValue="0" /><Input name="duration" label="Duration (mins)" type="number" defaultValue="60" /></div>
                    <button className="w-full py-3.5 bg-gray-900 text-white rounded-2xl font-black text-sm">Create Custom Activity</button>
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
  const predictedTotal = predictTotalCost(trip, currency) || trip.budgetEstimate || 0;
  const currencySymbols: any = { 'USD': '$', 'EUR': '€', 'INR': '₹', 'GBP': '£', 'JPY': '¥' };
  const symbol = currencySymbols[currency] || '₹';
  const [search, setSearch] = useState('');

  const stops = (trip.stops || []).filter((s: any) =>
    s.cityName?.toLowerCase().includes(search.toLowerCase()) ||
    s.activities?.some((a: any) => a.name?.toLowerCase().includes(search.toLowerCase()))
  );

  const grandTotal = (trip.stops || []).reduce((acc: number, stop: any) =>
    acc + (stop.activities?.reduce((s: number, a: any) => s + (Number(a.cost) || 0), 0) || 0), 0
  );

  const stopTotal = (stop: any) =>
    (stop.activities || []).reduce((s: number, a: any) => s + (Number(a.cost) || 0), 0);

  const actualCost = grandTotal;


  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .budget-arrow { display:flex; justify-content:center; padding:2px 0; }
        .budget-row { transition: background 0.15s; }
        .budget-row:hover { background: #faf5ff; }
        .cost-chip { display:inline-flex; align-items:center; justify-content:center; min-width:80px; padding:6px 14px; border-radius:999px; font-size:13px; font-weight:700; background:#f3f0ff; color:#7c3aed; border:1.5px solid #ede9fe; }
        .day-label { display:inline-flex; align-items:center; gap:6px; padding:5px 16px; border-radius:999px; border:1.5px solid #e5e7eb; font-size:12px; font-weight:800; color:#374151; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.06); }
        .budget-table-head { display:grid; grid-template-columns:1fr 140px; gap:12px; padding:10px 16px; border-bottom:2px solid #f3f4f6; }
        .budget-table-row { display:grid; grid-template-columns:1fr 140px; gap:12px; padding:12px 16px; align-items:center; }
        .total-row { display:grid; grid-template-columns:1fr 140px; gap:12px; padding:14px 16px; background:linear-gradient(90deg,#faf5ff,#f5f3ff); border-top:2px solid #e9d5ff; }
      `}</style>


      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bar ......"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex justify-between text-xs font-black text-gray-400 mb-3 tracking-widest">
            <span>PLANNING COMPLETION</span>
            <span className="text-purple-600">{Math.round((actualCost / predictedTotal) * 100) || 0}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${Math.min(100, (actualCost / (predictedTotal || 1)) * 100)}%` }} 
              className="h-full bg-purple-600 rounded-full"
            ></motion.div>
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

      {/* Grand Total Summary Strip */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Budget</p>
            <p className="text-lg font-black text-gray-900">{symbol}{grandTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stops</p>
            <p className="font-black text-gray-900">{(trip.stops || []).length}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activities</p>
            <p className="font-black text-gray-900">{(trip.stops || []).reduce((a: number, s: any) => a + (s.activities?.length || 0), 0)}</p>
          </div>
          <div className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> AI Optimized
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

      {/* Day-by-Day Budget Table */}
      {stops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/60 rounded-2xl border-2 border-dashed border-gray-200">
          <DollarSign className="w-10 h-10 text-gray-200 mb-3" />
          <p className="text-gray-400 font-bold text-sm">No stops found. Add stops in the Itinerary tab to track expenses.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {stops.map((stop: any, stopIdx: number) => {
            const acts = stop.activities || [];
            const total = stopTotal(stop);
            return (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stopIdx * 0.06 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Stop header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="day-label">
                      <MapPin className="w-3.5 h-3.5 text-purple-500" />
                      Day {stopIdx + 1}
                    </span>
                    <div>
                      <h4 className="font-black text-gray-900 text-sm leading-tight">{stop.cityName}</h4>
                      {stop.country && <p className="text-xs text-gray-400 font-semibold">{stop.country}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stop Total</p>
                    <p className="font-black text-purple-700 text-base">{symbol}{total.toLocaleString()}</p>
                  </div>
                </div>

                {/* Column header */}
                <div className="budget-table-head">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Physical Activity</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Expense</span>
                </div>

                {/* Activity rows */}
                {acts.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs font-semibold text-gray-400 italic">No activities added yet.</p>
                  </div>
                ) : (
                  <div>
                    {acts.map((act: any, actIdx: number) => (
                      <div key={act.id}>
                        <div className="budget-table-row budget-row">
                          {/* Activity name */}
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                              <Clock className="w-3.5 h-3.5 text-purple-500" />
                            </div>
                            <span className="text-sm font-semibold text-gray-800 leading-tight">{act.name}</span>
                          </div>
                          {/* Cost chip — display only */}
                          <div className="flex justify-end">
                            <span className="cost-chip">
                              {symbol}{(act.cost || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {/* Arrow connector between activities */}
                        {actIdx < acts.length - 1 && (
                          <div className="budget-arrow">
                            <div className="flex flex-col items-center">
                              <div className="w-px h-3 bg-gray-200" />
                              <ChevronDown className="w-3.5 h-3.5 text-gray-300 -mt-1" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Stop subtotal row */}
                    <div className="total-row">
                      <span className="text-xs font-black text-purple-700 uppercase tracking-widest">Stop Subtotal</span>
                      <span className="text-sm font-black text-purple-700 text-right">{symbol}{total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Grand Total Footer */}
          <div className="flex items-center justify-between bg-gray-900 text-white px-6 py-5 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</p>
                <p className="text-xl font-black text-white">{symbol}{grandTotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">vs AI Estimate</p>
              <p className="text-sm font-black text-purple-300">
                {grandTotal === 0 ? '—' : grandTotal > 0 ? `${symbol}${grandTotal.toLocaleString()} logged` : 'On track'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PackingTab = ({ trip, onUpdate }: any) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const items = trip.packingItems || [];
  
  // Filter by search
  const searchedItems = items.filter((i: any) => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const groupedItems = searchedItems.reduce((acc: any, item: any) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const packedCount = items.filter((i: any) => i.isPacked).length;
  const progress = items.length > 0 ? (packedCount / items.length) * 100 : 0;

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

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out my packing list for ${trip.name}!`);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bar ......"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['Group by','Filter','Sort by...'].map(label => (
            <button key={label} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-purple-300 transition-all">{label}</button>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
        
        {/* Header section */}
        <div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Packing checklist</h3>
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 mb-8 shadow-sm">
            <span>Trip: {trip.name}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-3">
            <span>Progress: {packedCount}/{items.length} items packed</span>
            <span className="text-purple-600 font-black">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-purple-600 rounded-full"></motion.div>
          </div>
        </div>

        {/* Categories and Items */}
        <div className="space-y-8">
          {Object.keys(groupedItems).length === 0 ? (
             <div className="py-12 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
               <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400 font-bold italic text-sm">No items found.</p>
             </div>
          ) : (
            Object.entries(groupedItems).map(([category, catItems]: any) => {
              const catPackedCount = catItems.filter((i: any) => i.isPacked).length;
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-gray-100">
                    <h4 className="text-sm font-black text-gray-800">{category}</h4>
                    <span className="text-xs font-bold text-gray-400">{catPackedCount}/{catItems.length}</span>
                  </div>
                  <div className="space-y-3">
                    {catItems.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleToggle(item.id)}>
                          <div className={`w-5 h-5 rounded-[6px] border-[2px] flex items-center justify-center transition-all ${item.isPacked ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white group-hover:border-purple-400'}`}>
                            {item.isPacked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                          <span className={`text-sm font-semibold transition-all ${item.isPacked ? 'line-through text-gray-400' : 'text-gray-700 group-hover:text-gray-900'}`}>{item.name}</span>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-8 mt-4">
          <button onClick={() => setShowAdd(true)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-xs hover:bg-gray-50 transition-all text-center">
            + add item to checklist
          </button>
          <button onClick={handleReset} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-xs hover:bg-gray-50 transition-all text-center">
            Reset all
          </button>
          <button onClick={handleShare} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 font-bold text-xs hover:bg-gray-50 transition-all text-center">
            Share Checklist
          </button>
          <button onClick={addAISuggestions} className="flex-1 py-3 px-4 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 transition-all text-center flex items-center justify-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> AI Auto-Generate
          </button>
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
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');

  const notes = trip.notes || [];

  const filteredNotes = notes.filter((n: any) => 
    n.content?.toLowerCase().includes(search.toLowerCase()) &&
    (filterType === 'All' || 
     (filterType === 'by stop' && n.stopId) ||
     (filterType === 'by Day'))
  );

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Delete this journal entry?')) {
      try {
        await api.delete(`/notes/${noteId}`);
        onUpdate();
      } catch (err) { alert('Failed to delete note'); }
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bar ......"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-semibold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['Group by','Filter','Sort by...'].map(label => (
            <button key={label} className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-purple-300 transition-all">{label}</button>
          ))}
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
        {/* Header section */}
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-4">Trip notes</h3>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 shadow-sm">
              <span>Trip: {trip.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={() => { setEditNote(null); setShowAdd(true); }}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Add Note
            </button>
          </div>

          <div className="flex gap-2 mt-6">
            {['All', 'by Day', 'by stop'].map(filter => (
              <button 
                key={filter} 
                onClick={() => setFilterType(filter)}
                className={`px-5 py-2 rounded-xl font-bold text-xs transition-all ${filterType === filter ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {filteredNotes.map((note: any) => {
            const stop = trip.stops?.find((s: any) => s.id === note.stopId);
            const contentLines = note.content.split('\n');
            const titleSnippet = contentLines[0].substring(0, 40) + (contentLines[0].length > 40 ? '...' : '');
            const displayTitle = stop ? `${titleSnippet} - ${stop.cityName} stop` : titleSnippet;
            
            return (
              <motion.div
                key={note.id}
                whileHover={{ y: -2 }}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-purple-200 transition-all relative group"
              >
                <div className="pr-16">
                  <h4 className="text-sm font-black text-gray-800 mb-2">{displayTitle}</h4>
                  <p className="text-gray-600 text-xs font-medium leading-relaxed whitespace-pre-wrap line-clamp-2 mb-3">
                    {note.content}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {new Date(note.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditNote(note); setShowAdd(true); }}
                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all border border-gray-100 hover:border-purple-100 bg-white"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-gray-100 hover:border-red-100 bg-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}

          {filteredNotes.length === 0 && (
            <div className="py-16 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className="w-5 h-5 text-gray-300" />
              </div>
              <h4 className="text-sm font-black text-gray-400">No notes found</h4>
            </div>
          )}
        </div>
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
              if (!data.stopId) delete data.stopId;
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
      alert("You only need " + trip.currency + " " + remaining.toLocaleString() + " more to reach your goal!");
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

  const progress = Math.min(100, ((trip.currentSavings || 0) / (trip.budgetEstimate || 1)) * 100);
  const currencySymbol = trip.currency || 'INR';

  return (
    <div className="space-y-6">

      {/* ── Fund Goal Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* accent top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 to-violet-400" />
        <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">

          {/* Left: label + amount */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Travel Fund</span>
            </div>
            <p className="text-2xl font-black text-gray-900 mb-1">
              {currencySymbol} {(trip.currentSavings || 0).toLocaleString()}
            </p>
            <p className="text-sm font-semibold text-gray-400">
              manifested towards your {currencySymbol} {(trip.budgetEstimate || 0).toLocaleString()} goal
            </p>
          </div>

          {/* Right: progress + CTA */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-widest">
              <span>{Math.round(progress)}%</span>
              <span className="text-purple-600">Funded</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-purple-600 rounded-full"
              />
            </div>
            <button
              onClick={() => setShowAddFund(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> ADD MONEY
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Goal', value: `${currencySymbol} ${(trip.budgetEstimate || 0).toLocaleString()}` },
          { label: 'Saved', value: `${currencySymbol} ${(trip.currentSavings || 0).toLocaleString()}` },
          { label: 'Remaining', value: `${currencySymbol} ${Math.max(0, (trip.budgetEstimate || 0) - (trip.currentSavings || 0)).toLocaleString()}` },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-base font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Main content: history + sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Contribution History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="text-sm font-black text-gray-900">Contribution History</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{contributions.length} entries</span>
          </div>

          {contributions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-bold text-gray-400">No contributions yet.</p>
              <p className="text-xs text-gray-300 font-semibold mt-1">Be the first to start the fund!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {contributions.map((c: any, idx: number) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800">{c.userName}</p>
                      {c.message && (
                        <p className="text-xs text-gray-400 font-medium italic">"{c.message}"</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-purple-600">+{currencySymbol} {Number(c.amount).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-gray-300 mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI Financial Tip */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <h4 className="text-sm font-black text-gray-900">AI Financial Tip</h4>
            </div>
            <p className="text-sm text-gray-500 font-medium leading-relaxed italic">
              "Based on your current savings rate, you'll reach your goal in approximately{' '}
              {Math.ceil(((trip.budgetEstimate || 1000) - (trip.currentSavings || 0)) / (contributions.length > 0 ? (contributions[0].amount || 100) : 1000))}{' '}
              weeks. Inviting more collaborators can speed this up by 40%!"
            </p>
          </div>

          {/* Collaborative Power */}
          <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users2 className="w-4 h-4 text-purple-600" />
              </div>
              <h4 className="text-sm font-black text-gray-900">Collaborative Power</h4>
            </div>
            <p className="text-xs text-gray-400 font-semibold leading-relaxed mb-4">
              Invite your travel buddies to contribute. All funds are tracked transparently.
            </p>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black transition-all active:scale-95">
              SHARE INVITE LINK <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      <AnimatePresence>
        {showAddFund && (
          <Modal title="Manifest Funds" onClose={() => setShowAddFund(false)} onSubmit={(e:any)=>{e.preventDefault(); handleContribute();}} loading={loading}>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 font-black text-base transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  Message (Optional)
                </label>
                <textarea
                  placeholder="Saving for our dream trip!"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 font-medium text-gray-600 h-28 transition-all"
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
