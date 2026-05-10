import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, MapPin, DollarSign, Clock, 
  CheckCircle2, Briefcase, Globe, Sun, 
  ChevronRight, Activity, Zap, Star, TrendingUp, ArrowRight,
  AlertCircle, Navigation, Target, Sparkles, Heart, Wallet, Loader2,
  Brain, Fingerprint, SearchCode, ShieldCheck, Cpu
} from 'lucide-react';
import api from '../api/axios';

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
  const [aiInsights, setAiInsights] = useState<any>(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const [dashRes, aiRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/api/ai/reasoning')
      ]);
      setData(dashRes.data);
      setAiInsights(aiRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
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

  return (
    <>
      <div className="space-y-12 pb-20">
        {/* AI Smart Hub Header */}
        <div className="bg-gray-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                   <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">AI SMART HUB</span>
              </div>
              <h1 className="text-6xl font-black mb-6 tracking-tight leading-none">Welcome back,<br/><span className="text-blue-500">Explorer!</span></h1>
              <p className="text-gray-400 text-xl font-medium max-w-md">Your AI travel assistant has analyzed your upcoming plans and found new optimizations.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all group cursor-pointer" onClick={() => nextTrip && navigate(`/trips/${nextTrip.id}`)}>
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform"><Calendar className="w-6 h-6" /></div>
                     <span className="text-[10px] font-black text-blue-400">NEXT TRIP</span>
                  </div>
                  <p className="text-2xl font-black mb-1 line-clamp-1">{nextTrip?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Planning Ready</p>
               </div>
               <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400 group-hover:scale-110 transition-transform"><TrendingUp className="w-6 h-6" /></div>
                     <span className="text-[10px] font-black text-purple-400">HEALTH</span>
                  </div>
                  <p className="text-2xl font-black mb-1">85%</p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Efficiency</p>
               </div>
               <div className="col-span-2 bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/20 p-6 rounded-[2rem] flex items-center justify-between">
                  <div>
                     <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">AI INSIGHT</p>
                     <p className="font-bold text-gray-300 italic">"Save up to 12% by booking your next stay on a weekday."</p>
                  </div>
                  <button className="p-4 bg-blue-600 rounded-2xl text-white hover:scale-110 transition-all shadow-xl shadow-blue-500/50"><ChevronRight className="w-6 h-6" /></button>
               </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard icon={MapPin} label="Total Trips" value={data?.userStats?.totalTrips || 0} color="blue" />
          <StatCard icon={Calendar} label="Destinations" value={data?.userStats?.countriesPlanned || 0} color="purple" />
          <StatCard icon={CheckCircle2} label="Packed Items" value={`${data?.userStats?.itemsPacked || 0}/${data?.userStats?.totalItems || 0}`} color="emerald" />
          <StatCard icon={TrendingUp} label="Memory Score" value="A+" color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {nextTrip && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-50 border border-gray-50 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative"
              >
                <div className="flex-1 relative z-10">
                  <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-2">
                    <Zap className="w-4 h-4" />
                    <span>ADVENTURE COUNTDOWN</span>
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">{nextTrip.name}</h3>
                  <p className="text-gray-500 font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-300" />
                    Departure: {new Date(nextTrip.startDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  {timeLeft === 'ARRIVED' ? (
                    <div className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black animate-bounce shadow-xl">
                      LAUNCH TIME! 🚀
                    </div>
                  ) : timeLeft && (
                    <div className="flex gap-2">
                      <CountdownBlock value={timeLeft.days} label="DAYS" />
                      <CountdownBlock value={timeLeft.hours} label="HRS" />
                      <CountdownBlock value={timeLeft.minutes} label="MIN" />
                      <CountdownBlock value={timeLeft.seconds} label="SEC" color="blue" />
                    </div>
                  )}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-50/30 -skew-x-12 translate-x-20"></div>
              </motion.div>
            )}

            {/* Dream Manifestation Section */}
            <section className="space-y-8">
               <div className="flex justify-between items-end">
                  <div>
                     <div className="flex items-center gap-2 text-purple-600 font-black text-[10px] uppercase tracking-widest mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>MANIFEST YOUR DREAMS</span>
                     </div>
                     <h3 className="text-3xl font-black text-gray-900 tracking-tight">Travel Goals</h3>
                  </div>
                  <button 
                    onClick={() => setShowAddGoal(true)}
                    className="bg-purple-50 text-purple-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center gap-2"
                  >
                     <Plus className="w-4 h-4" /> New Goal
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data?.manifestGoals?.map((goal: any) => (
                    <motion.div 
                      key={goal.id}
                      whileHover={{ y: -5 }}
                      className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 group relative overflow-hidden"
                    >
                       <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                             <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                                <Target className="w-6 h-6" />
                             </div>
                             <button 
                               onClick={() => { setSelectedGoal(goal); setShowAddMoney(true); }}
                               className="opacity-0 group-hover:opacity-100 bg-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                             >
                                ADD FUNDS
                             </button>
                          </div>
                          <h4 className="text-xl font-black text-gray-900 mb-1">{goal.title}</h4>
                          <div className="flex justify-between items-end mb-4">
                             <p className="text-sm font-bold text-gray-400">
                                {goal.currency} {goal.savedAmount.toLocaleString()} <span className="text-xs font-medium">/ {goal.targetAmount.toLocaleString()}</span>
                             </p>
                             <span className="text-xs font-black text-purple-600">{Math.round((goal.savedAmount/goal.targetAmount)*100)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${Math.min(100, (goal.savedAmount/goal.targetAmount)*100)}%` }}
                               className={`h-full ${goal.isCompleted ? 'bg-emerald-500' : 'bg-purple-600'} rounded-full`}
                             />
                          </div>
                          {goal.isCompleted && (
                             <div className="mt-4 flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>GOAL REACHED! READY TO TRAVEL</span>
                             </div>
                          )}
                       </div>
                       <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </motion.div>
                  ))}
                  {(!data?.manifestGoals || data.manifestGoals.length === 0) && (
                     <div className="col-span-2 text-center py-16 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <Sparkles className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-black">No manifestation goals yet. What's your dream destination?</p>
                     </div>
                  )}
               </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Your Itineraries</h3>
                <Link to="/trips" className="text-blue-600 font-black text-sm flex items-center gap-1 hover:gap-2 transition-all">VIEW ALL <ChevronRight className="w-4 h-4" /></Link>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {data?.upcomingTrips?.map((trip: any) => (
                  <div key={trip.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                          <MapPin className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{trip.name}</h4>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{trip.type || 'National'}</p>
                        </div>
                      </div>
                      <Link to={`/trips/${trip.id}`} className="w-full md:w-auto px-6 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm text-center">
                        MANAGE PLAN
                      </Link>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-gray-400 tracking-widest">
                        <span>PLANNING PROGRESS</span>
                        <span className="text-blue-600">{trip.stops?.length > 0 ? '70%' : '10%'}</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: trip.stops?.length > 0 ? '70%' : '10%' }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-10">
          {/* AI Deep Reasoning Engine */}
          {aiInsights && (
             <section className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-gray-100 relative overflow-hidden group">
                <div className="relative z-10">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Brain className="w-6 h-6" />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-gray-900 tracking-tight">AI Smart Hub</h3>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Reasoning Engine v2.0</p>
                         </div>
                      </div>
                      <Cpu className="w-6 h-6 text-gray-200 group-hover:text-blue-200 transition-colors" />
                   </div>

                   <div className="space-y-8">
                      {aiInsights.insights.map((insight: any) => (
                        <div key={insight.id} className="space-y-4">
                           <div className="flex items-center gap-2">
                              <Fingerprint className="w-4 h-4 text-gray-300" />
                              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{insight.title}</p>
                           </div>
                           <div className="pl-6 border-l-2 border-gray-100 space-y-3">
                              {insight.reasoning.map((step: string, i: number) => (
                                <p key={i} className="text-sm text-gray-500 font-medium leading-relaxed italic">• {step}</p>
                              ))}
                           </div>
                           <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                              <div className="flex items-center gap-2 mb-2">
                                 <ShieldCheck className="w-4 h-4 text-blue-600" />
                                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Recommendation</span>
                              </div>
                              <p className="text-sm font-bold text-gray-800 leading-relaxed">{insight.recommendation}</p>
                              <div className="mt-4 flex items-center justify-between">
                                 <div className="flex -space-x-2">
                                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white" />)}
                                 </div>
                                 <span className="text-[10px] font-black text-gray-400">CONFIDENCE: {insight.confidence}%</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>

                   <button className="w-full mt-10 py-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl">
                      REGENERATE ANALYSIS
                   </button>
                </div>
                <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl"></div>
             </section>
          )}

          {/* AI Smart Reminders */}
            {data?.aiReminders?.length > 0 && (
              <section className="bg-blue-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">AI SMART REMINDER</span>
                    </div>
                    {data.aiReminders.map((r: any) => (
                      <div key={r.id} className="mb-6 last:mb-0">
                         <p className="text-xl font-black mb-2">{r.title}</p>
                         <p className="text-blue-100 text-sm font-medium leading-relaxed">{r.message}</p>
                      </div>
                    ))}
                 </div>
                 <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </section>
            )}

            <section className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50">
              <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <QuickAction icon={Plus} label="New Trip" to="/create-trip" color="blue" />
                <QuickAction icon={Star} label="Saved" to="/explore" color="amber" />
                <QuickAction icon={Briefcase} label="Packing" to="/trips" color="emerald" />
                <QuickAction icon={AlertCircle} label="Help" to="#" color="purple" />
              </div>
            </section>

            <section className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h3>
              </div>
              <div className="space-y-8">
                {data?.notifications?.length > 0 ? data.notifications.map((notif: any) => (
                  <div key={notif.id} className="flex gap-4 relative">
                    <div className="mt-1.5 z-10">
                      <div className={`w-2.5 h-2.5 rounded-full ${notif.type === 'alert' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]'}`}></div>
                    </div>
                    <div className="pb-2 border-b border-gray-50 w-full">
                      <p className="text-sm font-bold text-gray-800 leading-snug">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <p className="text-gray-400 text-sm font-bold italic">No new notifications.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
         {showAddGoal && (
           <Modal title="Create Manifestation Goal" onClose={() => setShowAddGoal(false)} onSubmit={handleCreateGoal} loading={submitting}>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dream Destination / Goal</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Europe 2027 Summer"
                      className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-black text-xl"
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Amount (INR)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 500000"
                      className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-black text-xl"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                    />
                 </div>
              </div>
           </Modal>
         )}

         {showAddMoney && (
           <Modal title={`Add Funds: ${selectedGoal?.title}`} onClose={() => setShowAddMoney(false)} onSubmit={handleAddMoney} loading={submitting}>
              <div className="space-y-6 text-center">
                 <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-600 mx-auto mb-4">
                    <Wallet className="w-10 h-10" />
                 </div>
                 <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contribution Amount</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 5000"
                      className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-black text-3xl text-center"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      autoFocus
                    />
                 </div>
                 <p className="text-gray-400 text-xs font-medium italic">"Manifesting your dreams, one coin at a time."</p>
              </div>
           </Modal>
         )}
      </AnimatePresence>
    </>
  );
};

const Modal = ({ title, children, onClose, onSubmit, loading }: any) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md"
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="bg-white rounded-[3.5rem] w-full max-w-xl overflow-hidden shadow-2xl"
    >
      <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h2>
        <button onClick={onClose} className="p-4 hover:bg-gray-200 rounded-2xl transition-all">
          <Plus className="w-6 h-6 rotate-45" />
        </button>
      </div>
      <div className="p-10">
        {children}
        <button 
          onClick={onSubmit}
          disabled={loading}
          className="w-full mt-10 bg-gray-900 hover:bg-black text-white py-6 rounded-[2rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'CONFIRM MANIFESTATION'}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const StatCard = ({ icon: Icon, label, value, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-600 shadow-blue-100',
    green: 'bg-green-600 shadow-green-100',
    purple: 'bg-purple-600 shadow-purple-100',
    emerald: 'bg-emerald-600 shadow-emerald-100',
    amber: 'bg-amber-600 shadow-amber-100'
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
      <div className={`p-4 rounded-2xl mb-4 text-white shadow-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
        <Icon className="w-8 h-8" />
      </div>
      <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2">{label}</p>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, to, color }: any) => {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50 hover:bg-blue-600',
    amber: 'text-amber-600 bg-amber-50 hover:bg-amber-600',
    emerald: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600',
    purple: 'text-purple-600 bg-purple-50 hover:bg-purple-600',
  };
  return (
    <Link to={to} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all group border border-transparent hover:shadow-xl active:scale-95 ${colors[color]}`}>
      <Icon className="w-8 h-8 mb-3 group-hover:text-white transition-colors" />
      <span className="text-[10px] font-black group-hover:text-white uppercase tracking-widest transition-colors">{label}</span>
    </Link>
  );
};

const CountdownBlock = ({ value, label, color }: any) => (
  <div className="flex flex-col items-center">
    <div className={`w-14 h-16 ${color === 'blue' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm`}>
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-[8px] font-black text-gray-400 mt-2 tracking-widest">{label}</span>
  </div>
);

const DashboardSkeleton = () => (
  <div className="space-y-12 animate-pulse p-4">
    <div className="h-80 bg-gray-100 rounded-[3rem]"></div>
    <div className="grid grid-cols-4 gap-8">
      {[1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-[2.5rem]"></div>)}
    </div>
    <div className="grid grid-cols-3 gap-10">
      <div className="col-span-2 h-[600px] bg-gray-100 rounded-[3rem]"></div>
      <div className="h-[600px] bg-gray-100 rounded-[3rem]"></div>
    </div>
  </div>
);

export default Dashboard;
