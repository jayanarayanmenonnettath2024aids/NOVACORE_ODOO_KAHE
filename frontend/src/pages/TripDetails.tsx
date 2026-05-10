import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, DollarSign, Package, FileText, 
  Plus, Clock, CheckCircle2, Circle,
  TrendingDown, Search, X, Loader2, Users2, Wallet, Zap, 
  TrendingUp, Plane, Cloud, Thermometer, ChevronRight, Info, Luggage, Map as MapIcon, MoreHorizontal, Send,
  Edit3, Trash2, AlertCircle, BarChart3, Heart, ArrowUpRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';

// Helper functions for AI features
const predictTotalCost = (trip: any, _currency: string) => {
  const baseCost = trip.budgetEstimate || 1500;
  // Simple logic to mock AI prediction
  const stopFactor = (trip.stops?.length || 1) * 200;
  return baseCost + stopFactor;
};

const getPackingSuggestions = (_trip: any) => {
  return [
    'Sunscreen (SPF 50+)', 
    'Comfortable walking shoes', 
    'Portable power bank', 
    'First aid kit', 
    'Travel adapter', 
    'Lightweight rain jacket'
  ];
};

// Fix Leaflet icon issue by using CDN URLs to avoid build-time conflicts
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Mock coordinates for demonstration
const CITY_COORDS: any = {
  'Kathmandu': [27.7172, 85.3240],
  'Pokhara': [28.2096, 83.9856],
  'Chitwan': [27.5333, 84.4500],
  'Everest': [27.9881, 86.9250],
  'Paris': [48.8566, 2.3522],
  'London': [51.5074, -0.1278],
  'Rome': [41.9028, 12.4964],
  'Tokyo': [35.6762, 139.6503],
  'Delhi': [28.6139, 77.2090],
  'Dhaka': [23.8103, 90.4125],
};

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${id}`);
      setTrip(response.data);
      const userStr = localStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
    } catch (err) {
      console.error('Failed to fetch trip', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!trip) return <div className="text-center py-20">Trip not found</div>;

  const totalBudget = trip.budgetEstimate || 1800;
  const currentSpend = trip.stops?.reduce((acc: number, s: any) => 
    acc + (s.activities?.reduce((sum: number, a: any) => sum + (a.cost || 0), 0) || 0), 0
  ) || 450;
  const spendPercentage = Math.round((currentSpend / totalBudget) * 100);

  const daysLeft = Math.ceil((new Date(trip.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const tabs = ['Overview', 'Itinerary', 'Budget', 'Packing', 'Journal', 'Fund'];

  return (
    <div className="space-y-8 pb-20 mt-24">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-white/50 backdrop-blur-md p-2 rounded-[2rem] border border-white/20 w-fit mx-auto mb-8">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${
              activeTab === tab 
                ? 'bg-gray-900 text-white shadow-xl scale-105' 
                : 'text-gray-400 hover:text-gray-900 hover:bg-white'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 h-[280px] rounded-[2.5rem] overflow-hidden relative group shadow-2xl">
           <img 
            src={trip.coverPhotoUrl || `https://images.unsplash.com/photo-1544735749-142dbb77f105?q=80&w=2070&auto=format&fit=crop`} 
            alt={trip.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
             <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">YOUR TRIP</span>
             <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white border border-white/10 cursor-pointer">
                <MapPin className="w-3 h-3 text-red-500" />
                <span>Nepal</span>
                <MoreHorizontal className="w-3 h-3 ml-1" />
             </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
             <p className="text-white/80 font-bold mb-1">Hey {user?.name.split(' ')[0] || 'Traveler'}! 👋</p>
             <h1 className="text-2xl font-black text-white leading-tight mb-2">Welcome To Your {trip.name}!</h1>
             <p className="text-white/50 text-[10px] italic">"The Mountains Are Calling, And I Must Go." – John Muir</p>
          </div>
        </div>

        {/* Budget Widget */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 flex flex-col justify-between group">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                 <Wallet className="w-5 h-5 text-gray-900" />
                 <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">BUDGET</h3>
              </div>
              <button className="text-gray-300 hover:text-gray-900 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
           </div>
           <div className="flex items-center gap-6">
              <div className="w-32 h-32 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie 
                        data={[
                          { name: 'Spend', value: currentSpend },
                          { name: 'Remaining', value: totalBudget - currentSpend }
                        ]} 
                        innerRadius={35} 
                        outerRadius={50} 
                        paddingAngle={5} 
                        dataKey="value"
                        stroke="none"
                       >
                          <Cell fill="#0d9488" />
                          <Cell fill="#fbbf24" />
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-lg font-black text-gray-900">{spendPercentage}%</span>
                 </div>
              </div>
              <div className="space-y-2 flex-1">
                 <div className="flex items-center justify-between text-[10px] font-black">
                    <span className="text-gray-400">TOTAL</span>
                    <span className="text-gray-900">${totalBudget}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-600"></div>
                    <span className="text-[10px] font-bold text-gray-500">Budget</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <span className="text-[10px] font-bold text-gray-500">Spend</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Expenses Widget */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 flex flex-col group">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                 <Luggage className="w-5 h-5 text-gray-900" />
                 <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">EXPENSES</h3>
              </div>
              <button className="text-gray-300 hover:text-gray-900 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
           </div>
           <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
              <ExpenseItem icon="🎟️" label="Air ticket" amount={230} />
              <ExpenseItem icon="🚕" label="Taxi rent" amount={10} />
              <ExpenseItem icon="🍔" label="King burger" amount={12} />
              <ExpenseItem icon="🥾" label="Trekking gear" amount={95} />
           </div>
           <button className="mt-4 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 transition-all rounded-xl text-xs font-black text-gray-900">
              <Plus className="w-4 h-4" /> Record
           </button>
        </div>

        {/* Readiness Widget */}
        <div className="bg-amber-400 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden flex flex-col justify-between group">
           <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-2">
                 <Zap className="w-5 h-5 text-gray-900" />
                 <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">READINESS</h3>
              </div>
              <button className="text-gray-900/40 hover:text-gray-900 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
           </div>
           <div className="relative flex items-center justify-center my-4 z-10">
              <div className="w-32 h-32 rounded-full border-[12px] border-white/20 flex items-center justify-center flex-col">
                 <span className="text-[10px] font-black text-gray-900/60 uppercase tracking-widest">Days left</span>
                 <span className="text-4xl font-black text-gray-900">{daysLeft > 0 ? daysLeft : 0}</span>
              </div>
              <div className="absolute w-32 h-32 rounded-full border-[12px] border-teal-800 border-t-transparent border-l-transparent rotate-45"></div>
           </div>
           <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        </div>
      </div>

      {/* Map and Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map Widget */}
        <div className="lg:col-span-4 bg-white rounded-[3rem] p-8 shadow-xl border border-gray-100 flex flex-col h-[500px]">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                 <MapIcon className="w-5 h-5 text-gray-900" />
                 <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">DESTINATIONS</h3>
              </div>
              <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><Search className="w-4 h-4" /></button>
           </div>
           <div className="flex-1 rounded-[2rem] overflow-hidden relative shadow-inner border border-gray-50">
              <MapContainer center={[27.7172, 85.3240]} zoom={6} scrollWheelZoom={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {trip.stops?.map((stop: any) => {
                  const coords = CITY_COORDS[stop.cityName] || [27.7, 85.3];
                  return (
                    <Marker key={stop.id} position={coords}>
                      <Popup>
                        <div className="font-bold">{stop.cityName}</div>
                        <div className="text-xs text-gray-500">{stop.country}</div>
                      </Popup>
                    </Marker>
                  );
                })}
                {trip.stops?.length > 1 && (
                  <Polyline 
                    positions={trip.stops.map((s: any) => CITY_COORDS[s.cityName] || [27.7, 85.3])} 
                    color="#0d9488" 
                    weight={3} 
                    dashArray="10, 10" 
                  />
                )}
              </MapContainer>
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl z-[1000] border border-white">
                 <div className="space-y-2">
                    {trip.stops?.map((stop: any) => (
                      <div key={stop.id} className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-teal-600 ring-4 ring-teal-50"></div>
                         <span className="text-xs font-black text-gray-800">{stop.cityName}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Middle Column */}
        <div className="lg:col-span-4 space-y-6">
           {/* Weather Widget */}
           <div className="bg-blue-200 rounded-[3rem] p-8 shadow-xl border border-blue-100 flex items-center justify-between group overflow-hidden relative">
              <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-4 h-4 text-gray-900" />
                    <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">KATHMANDU</h3>
                    <button className="text-gray-900/40 hover:text-gray-900"><MoreHorizontal className="w-3 h-3" /></button>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Thermometer className="w-5 h-5 text-red-500" />
                       <div>
                          <p className="text-[10px] font-bold text-gray-500">Temperature</p>
                          <p className="text-xs font-black">H:10° L:14° C</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <Cloud className="w-5 h-5 text-gray-500" />
                       <div>
                          <p className="text-[10px] font-bold text-gray-500">Weather</p>
                          <p className="text-xs font-black">Mostly cloudy</p>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="text-right relative z-10">
                 <span className="text-7xl font-black text-gray-900">13°</span>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform"></div>
           </div>

           {/* Flight Widget */}
           <div className="bg-purple-900 rounded-[3rem] p-8 shadow-xl text-white flex flex-col group overflow-hidden relative">
              <div className="flex justify-between items-center mb-6 relative z-10">
                 <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-white" />
                    <h3 className="font-black text-white/60 uppercase tracking-widest text-[10px]">FLIGHT</h3>
                 </div>
                 <button className="text-white/20 hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="space-y-6 relative z-10">
                 <div>
                    <p className="text-[10px] font-bold text-purple-300">12 May, 2:30PM</p>
                    <div className="flex items-center justify-between">
                       <span className="text-lg font-black tracking-tight">Dhaka</span>
                       <Plane className="w-5 h-5 rotate-90 text-purple-400" />
                       <span className="text-lg font-black tracking-tight">Kathmandu</span>
                    </div>
                 </div>
                 <div className="h-[1px] bg-white/10 w-full"></div>
                 <div>
                    <p className="text-[10px] font-bold text-purple-300">22 May, 9:30AM</p>
                    <div className="flex items-center justify-between">
                       <span className="text-lg font-black tracking-tight">Kathmandu</span>
                       <Plane className="w-5 h-5 rotate-[270deg] text-purple-400" />
                       <span className="text-lg font-black tracking-tight">Delhi</span>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
           </div>

           {/* Days & Activity List */}
           <div className="bg-orange-50 rounded-[3rem] p-8 shadow-xl border border-orange-100 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">DAYS & ACTIVITY</h3>
                 <button className="p-2 bg-gray-200/50 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><MoreHorizontal className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar max-h-[160px]">
                 <ActivityRow day={1} title="Arrival in Kathmandu" desc="Arrive in Kathmandu, the capital city of Nepal. Check into your accommodation and rest after your journey." />
                 <ActivityRow day={2} title="Kathmandu Sightseeing" desc="Explore the ancient temples and markets of the valley." />
                 <ActivityRow day={3} title="Bhaktapur and Nagarkot" desc="Witness the heritage of Bhaktapur and sunset at Nagarkot." />
              </div>
           </div>
        </div>

        {/* Right Column - Packing List */}
        <div className="lg:col-span-4 bg-gray-900 rounded-[3rem] p-8 shadow-2xl text-white flex flex-col h-full min-h-[500px]">
           <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                 <FileText className="w-5 h-5 text-white/60" />
                 <h3 className="font-black text-white uppercase tracking-widest text-xs">PACKING LIST</h3>
              </div>
              <button className="text-white/20 hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
           </div>
           <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar mb-8">
              <PackingItem label="Backpack" note="Add Note" />
              <PackingItem label="Camera & GoPro" />
              <PackingItem label="Laptop & Charger" />
              <PackingItem label="Hot water button" />
              <PackingItem label="Medical Aid" />
              <PackingItem label="Winter Jacket" />
           </div>
           <button className="w-full py-5 bg-teal-800 hover:bg-teal-700 transition-all rounded-[2rem] text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-teal-900/50">
              <Plus className="w-5 h-5 text-orange-500" /> New Reminder
           </button>
        </div>
      </div>
    </motion.div>
  )}

  {activeTab === 'Itinerary' && <ItineraryTab trip={trip} onUpdate={fetchTrip} />}
  {activeTab === 'Budget' && <BudgetTab trip={trip} currency={trip.currency || 'USD'} />}
  {activeTab === 'Packing' && <PackingTab trip={trip} onUpdate={fetchTrip} />}
  {activeTab === 'Journal' && <JournalTab trip={trip} onUpdate={fetchTrip} />}
  {activeTab === 'Fund' && <FundTab trip={trip} onUpdate={fetchTrip} />}
</div>
  );
};

// --- Sub-components for modern UI ---

const ExpenseItem = ({ icon, label, amount }: any) => (
  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-all group cursor-pointer">
    <div className="flex items-center gap-4">
      <span className="text-xl group-hover:scale-125 transition-transform">{icon}</span>
      <span className="text-xs font-bold text-gray-700">{label}</span>
    </div>
    <span className="text-xs font-black text-gray-900">${amount}</span>
  </div>
);

const ActivityRow = ({ day, title, desc }: any) => (
  <div className="flex gap-4 group cursor-pointer">
    <div className="bg-orange-200/50 px-3 py-1 rounded-full h-fit">
      <span className="text-[10px] font-black text-orange-800 whitespace-nowrap">Day {day}</span>
    </div>
    <div className="flex-1 pb-4 border-b border-orange-200/50 group-last:border-none">
       <div className="flex justify-between items-start">
          <h4 className="text-xs font-black text-gray-900 mb-1">{title}</h4>
          <Info className="w-3 h-3 text-gray-300 group-hover:text-gray-900 transition-colors" />
       </div>
       <p className="text-[9px] text-gray-500 font-medium leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">{desc}</p>
    </div>
  </div>
);

const PackingItem = ({ label, note }: any) => (
  <div className="flex items-center justify-between group cursor-pointer">
     <div className="flex items-center gap-4">
        <div className="w-5 h-5 rounded-full border-2 border-white/20 group-hover:border-teal-500 transition-colors flex items-center justify-center">
           <div className="w-2.5 h-2.5 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div>
           <p className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{label}</p>
           {note && <p className="text-[10px] text-white/30 font-medium">{note}</p>}
        </div>
     </div>
     <button className="opacity-0 group-hover:opacity-100 p-2 text-white/40 hover:text-white transition-all"><Info className="w-4 h-4" /></button>
  </div>
);

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
     <div className="relative">
        <div className="w-24 h-24 border-4 border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 w-24 h-24 border-4 border-teal-800 border-t-transparent rounded-full animate-spin"></div>
        <Plane className="absolute inset-0 m-auto w-8 h-8 text-teal-800 animate-pulse" />
     </div>
     <p className="mt-8 text-gray-400 font-black uppercase tracking-[0.3em] text-xs">Preparing Adventure</p>
  </div>
);

// export default TripDetails; (Removed duplicate export)

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
          <div className="flex bg-gray-100 p-1 rounded-xl">
             <button onClick={() => setItineraryView('timeline')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${itineraryView === 'timeline' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>LIST</button>
             <button onClick={() => setItineraryView('grid')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${itineraryView === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>GRID</button>
          </div>
          <button 
            onClick={() => setShowAddStop(true)}
            className="flex-1 md:flex-none bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
          >
            <Plus className="w-5 h-5" /> Add Stop
          </button>
        </div>
      </div>

      <div className={`relative ${itineraryView === 'timeline' ? 'border-l-4 border-blue-100 ml-8 space-y-12 pb-12' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12'}`}>
        {trip.stops?.length > 0 ? (
          trip.stops.map((stop: any, idx: number) => (
            <div key={stop.id} className={`relative group ${itineraryView === 'timeline' ? 'pl-12' : ''}`}>
              {itineraryView === 'timeline' && <div className="absolute -left-[14px] top-0 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-xl ring-4 ring-blue-50 group-hover:scale-125 transition-transform"></div>}
              <div className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-300 ${itineraryView === 'timeline' ? 'p-8' : 'p-6 h-full flex flex-col'}`}>
                <div className={`flex flex-col justify-between items-start gap-4 mb-6 ${itineraryView === 'timeline' ? 'md:flex-row' : ''}`}>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shadow-inner">
                       {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900 tracking-tight line-clamp-1">{stop.cityName}</h4>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">{stop.country}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                   <div className="flex items-center justify-between border-t pt-4">
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activities</h5>
                      <button 
                        onClick={() => setShowAddActivity(stop.id)}
                        className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                      >
                        + ASSIGN
                      </button>
                   </div>
                   <div className="space-y-3">
                     {stop.activities?.map((activity: any) => (
                       <div key={activity.id} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all shadow-sm group/act">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <div className="flex-1">
                             <p className="font-bold text-gray-800 text-sm">{activity.name}</p>
                             <p className="text-[10px] font-black text-blue-600/30 uppercase tracking-widest">${activity.cost || 0}</p>
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
            <h4 className="text-2xl font-black text-gray-900 mb-2">Build your path</h4>
            <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto">Add your first city stop to begin constructing your daily itinerary.</p>
            <button 
              onClick={() => setShowAddStop(true)}
              className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
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
                  <input value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} placeholder="Search activities..." className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-bold" />
                </div>
                <select value={selectedActType} onChange={(e) => setSelectedActType(e.target.value)} className="px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-500">
                  <option value="All">All Interests</option>
                  <option value="Culture">Culture</option>
                  <option value="Food">Food</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Sightseeing">Sightseeing</option>
                </select>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                 {filteredSuggested.map((act, idx) => (
                   <div key={idx} className="bg-gray-50 rounded-[2rem] overflow-hidden border border-transparent hover:border-blue-100 transition-all group flex flex-col">
                      <div className="h-32 relative"><img src={act.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /><div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-black text-blue-600 shadow-sm">${act.cost}</div></div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2"><h4 className="font-black text-gray-900 leading-tight">{act.name}</h4><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{act.duration}</span></div>
                        <button onClick={async () => { setLoading(true); try { await api.post(`/trips/stops/${showAddActivity}/activities`, { name: act.name, cost: act.cost, type: act.type }); setShowAddActivity(null); onUpdate(); } catch (err) { alert('Failed to add activity'); } finally { setLoading(false); } }} className="mt-auto w-full py-3 bg-white text-blue-600 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm">ADD TO STOP</button>
                      </div>
                   </div>
                 ))}
                 <div className="col-span-full border-t pt-8 mt-4">
                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Or Add Custom Activity</h5>
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
      <h3 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">{title}</h3>
      <form onSubmit={onSubmit} className="space-y-8">
        {children}
        <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm & Save'}
        </button>
      </form>
    </motion.div>
  </motion.div>
);

const Input = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input {...props} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-bold" />
  </div>
);

const BudgetTab = ({ trip, currency }: any) => {
  const predictedTotal = predictTotalCost(trip, currency);
  const currencySymbols: any = { 'USD': '$', 'EUR': '€', 'INR': '₹', 'GBP': '£', 'JPY': '¥' };
  const symbol = currencySymbols[currency] || '$';

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
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
           <div className="flex items-center gap-3 text-blue-600 mb-4">
              <DollarSign className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">AI PREDICTED TOTAL</span>
           </div>
           <h4 className="text-5xl font-black text-gray-900">{symbol}{predictedTotal.toLocaleString()}</h4>
           <div className="mt-4 flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 w-fit px-3 py-1.5 rounded-xl">
              <TrendingDown className="w-3.5 h-3.5" /> High Accuracy
           </div>
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-16 h-16 text-blue-600" />
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
           <div className="flex justify-between text-[10px] font-black text-gray-400 mb-3 tracking-widest">
              <span>PLANNING COMPLETION</span>
              <span className="text-blue-600">{Math.round((actualCost / predictedTotal) * 100) || 0}%</span>
           </div>
           <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(actualCost / predictedTotal) * 100}%` }} className="h-full bg-blue-600 rounded-full"></motion.div>
           </div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl text-white">
           <div className="flex items-center gap-3 mb-4 opacity-80">
              <AlertCircle className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">AI SAVINGS BOT</span>
           </div>
           <p className="font-bold text-lg leading-snug">The AI detected potential savings of {symbol}{Math.round(predictedTotal * 0.12)} if you switch to group activities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
           <h4 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Financial Forecast</h4>
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
           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-blue-600" />
           </div>
           <h4 className="text-2xl font-black text-gray-900 mb-2">Detailed Analytics</h4>
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
                 <span className="text-blue-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                 <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></motion.div>
              </div>
           </div>
           <div className="flex gap-3">
             <button onClick={handleReset} className="px-6 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black text-xs hover:bg-gray-200 transition-all">RESET</button>
             <button onClick={addAISuggestions} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg text-sm"><TrendingUp className="w-4 h-4" /> AI AUTO-GENERATE</button>
           </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-6 mb-8 no-scrollbar border-b">
           {categories.map(cat => (
             <button key={cat} onClick={() => setActiveCat(cat)} className={`px-6 py-2.5 rounded-full font-bold text-xs whitespace-nowrap transition-all ${activeCat === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}>{cat}</button>
           ))}
           <button onClick={() => setShowAdd(true)} className="ml-auto flex items-center gap-2 text-blue-600 font-black text-xs hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">+ ADD ITEM</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredItems.map((item: any) => (
             <div key={item.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${item.isPacked ? 'bg-green-50/50 border-green-100 opacity-60' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'}`}>
                <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => handleToggle(item.id)}>
                   {item.isPacked ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-gray-200" />}
                   <div>
                      <p className={`font-bold ${item.isPacked ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.name}</p>
                      <p className="text-[10px] font-black text-blue-600/40 uppercase tracking-widest">{item.category}</p>
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
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                <select name="category" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-500">
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
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-50/50">
         <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Trip Journal</h3>
            <p className="text-gray-400 font-bold text-sm mt-1">Capture your favorite moments and important details.</p>
         </div>
         <button 
           onClick={() => { setEditNote(null); setShowAdd(true); }}
           className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg active:scale-95"
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
                       <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Memories</span>
                       <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(note.timestamp).toLocaleString()}
                       </span>
                    </div>
                    {note.stopId && (
                       <p className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                          <MapPin className="w-3.5 h-3.5" /> Tied to {trip.stops.find((s: any) => s.id === note.stopId)?.cityName}
                       </p>
                    )}
                 </div>
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditNote(note); setShowAdd(true); }}
                      className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
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
              <p className="text-gray-600 text-lg leading-relaxed font-medium whitespace-pre-wrap">{note.content}</p>
           </motion.div>
         ))}

         {notes.length === 0 && (
           <div className="py-24 text-center bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                 <Edit3 className="w-10 h-10 text-gray-200" />
              </div>
              <h4 className="text-2xl font-black text-gray-300">No journal entries yet</h4>
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tie to Destination (Optional)</label>
                  <select name="stopId" defaultValue={editNote?.stopId || ""} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none font-bold text-gray-600">
                     <option value="">Full Trip Note</option>
                     {trip.stops?.map((s: any) => (
                       <option key={s.id} value={s.id}>{s.cityName}</option>
                     ))}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Note</label>
                  <textarea 
                    name="content" 
                    rows={6}
                    required
                    defaultValue={editNote?.content || ""}
                    placeholder="Describe your day, save a confirmation number, or jot down a memory..."
                    className="w-full px-6 py-4 rounded-[2rem] bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-700 text-lg resize-none"
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
             <div className="flex items-center gap-2 mb-4 text-blue-400">
                <Wallet className="w-6 h-6" />
                <span className="text-[10px] font-black uppercase tracking-widest">Travel Fund</span>
             </div>
             <h2 className="text-5xl font-black mb-2 tracking-tight">{trip.currency} {trip.currentSavings?.toLocaleString()}</h2>
             <p className="text-gray-400 font-bold">manifested towards your {trip.currency} {trip.budgetEstimate?.toLocaleString()} goal</p>
          </div>
          
          <div className="space-y-6">
             <div className="flex justify-between items-end">
                <span className="text-3xl font-black">{Math.round(progress)}%</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">FUNDED</span>
             </div>
             <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)]"
                />
             </div>
             <button 
               onClick={() => setShowAddFund(true)}
               className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
             >
                <Plus className="w-6 h-6" /> ADD MONEY
             </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Contribution History</h3>
            <div className="space-y-4">
               {contributions.map((c: any) => (
                 <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center justify-between group hover:shadow-xl transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                          <Heart className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="font-black text-gray-900 text-lg">{c.userName}</p>
                          <p className="text-gray-400 font-bold text-xs italic">"{c.message || 'Saving for the adventure!'}"</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-blue-600">+{trip.currency} {c.amount.toLocaleString()}</p>
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
            
            <section className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-4">Collaborative Power</h3>
                  <p className="text-blue-100 text-sm font-medium mb-6">Invite your travel buddies to contribute. All funds are tracked transparently for everyone to see.</p>
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contribution Amount ({trip.currency})</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000"
                    className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-black text-2xl"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message (Optional)</label>
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
