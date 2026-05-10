import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, TrendingUp, Navigation, 
  ChevronRight, Globe, Camera, Users, DollarSign,
  Zap, Briefcase, Smile, Shield, ArrowRight,
  ArrowLeft, CheckCircle2, AlertCircle, Plane,
  Users2, Heart, Coffee, Bike, Car, Train, Clock, Star
} from 'lucide-react';
import api from '../api/axios';

// Missing Icons in Lucide-react shim
const Home = (props: any) => <Users2 {...props} />;
const Leaf = (props: any) => <Globe {...props} />;
const Landmark = (props: any) => <MapPin {...props} />;

const CreateTrip = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    startDate: '',
    endDate: '',
    type: 'National',
    companionType: 'Solo',
    currency: 'INR',
    budgetEstimate: '',
    travelPace: 'Moderate',
    mood: 'Culture',
    transportType: 'Flight',
    visibility: 'Private',
    invitees: '',
    coverPhotoUrl: ''
  });

  // Slug Auto-generation
  useEffect(() => {
    if (formData.name && step === 1) {
      const generatedSlug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name]);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await api.post('/trips', formData);
      setShowSuccess(true);
      setTimeout(() => {
        navigate(`/trips/${response.data.id}`);
      }, 2500);
    } catch (err) {
      alert('Failed to create trip. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1: return <Step1 formData={formData} setFormData={setFormData} />;
      case 2: return <Step2 formData={formData} setFormData={setFormData} />;
      case 3: return <Step3 formData={formData} setFormData={setFormData} />;
      case 4: return <Step4 formData={formData} setFormData={setFormData} />;
      default: return null;
    }
  };

  if (showSuccess) return <SuccessAnimation />;

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Left Column: Progress & Form */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                   <Plane className="w-6 h-6" />
                </div>
                <div>
                   <h1 className="text-4xl font-black text-gray-900 tracking-tight">Initialize Journey</h1>
                   <p className="text-gray-400 font-bold text-sm uppercase tracking-widest mt-1">Step {step} of 4</p>
                </div>
             </div>
             <div className="flex gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1.5 w-12 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-gray-100'}`} />
                ))}
             </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-blue-50/50 border border-gray-50 min-h-[500px] flex flex-col"
            >
              <div className="flex-1">
                {renderStep()}
              </div>

              <div className="flex justify-between items-center mt-12 pt-12 border-t border-gray-50">
                 <button 
                   onClick={handleBack}
                   disabled={step === 1}
                   className="flex items-center gap-2 text-gray-400 font-black hover:text-gray-900 transition-colors disabled:opacity-0"
                 >
                   <ArrowLeft className="w-5 h-5" /> PREVIOUS
                 </button>
                 
                 {step < 4 ? (
                   <button 
                     onClick={handleNext}
                     disabled={!formData.name || (step === 2 && (!formData.startDate || !formData.endDate))}
                     className="bg-gray-900 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                   >
                     CONTINUE <ArrowRight className="w-5 h-5" />
                   </button>
                 ) : (
                   <button 
                     onClick={handleSubmit}
                     disabled={loading}
                     className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                   >
                     {loading ? <Clock className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> FINALIZE & LAUNCH</>}
                   </button>
                 )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-4">
           <div className="sticky top-32 space-y-8">
              <div className="bg-gray-900 rounded-[3.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                       <span className="bg-blue-600/30 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">LIVE PREVIEW</span>
                       <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                          <Zap className="w-5 h-5 text-amber-400" />
                       </div>
                    </div>
                    
                    <h3 className="text-3xl font-black mb-2 line-clamp-1">{formData.name || 'Untitled Trip'}</h3>
                    <p className="text-gray-400 font-bold flex items-center gap-2 text-sm mb-8">
                       <Globe className="w-4 h-4" /> /trip/{formData.slug || 'slug'}
                    </p>

                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"><Calendar className="w-6 h-6 text-blue-400" /></div>
                          <div>
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">DURATION</p>
                             <p className="font-bold">{formData.startDate ? `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}` : 'Dates not set'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"><Users2 className="w-6 h-6 text-purple-400" /></div>
                          <div>
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">TRAVELING AS</p>
                             <p className="font-bold">{formData.companionType}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center"><DollarSign className="w-6 h-6 text-emerald-400" /></div>
                          <div>
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">EST. BUDGET</p>
                             <p className="font-bold">{formData.budgetEstimate ? `${formData.currency} ${formData.budgetEstimate}` : 'Not specified'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 {/* Abstract Decor */}
                 <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-colors"></div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[2.5rem] flex items-start gap-4">
                 <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
                 <p className="text-sm font-bold text-blue-900 leading-relaxed italic">
                    "Setting your travel mood to '{formData.mood}' will prioritize {formData.mood.toLowerCase()} activities in your AI recommendations."
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const Step1 = ({ formData, setFormData }: any) => (
  <div className="space-y-10">
    <div>
       <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">The Basics</h2>
       <p className="text-gray-400 font-bold">Start with a name and destination.</p>
    </div>

    <div className="space-y-8">
       <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trip Name</label>
          <input 
            required
            className="w-full px-8 py-6 rounded-3xl bg-gray-50 border-none focus:ring-4 focus:ring-blue-100 transition-all font-black text-2xl"
            placeholder="e.g. Summer in Tokyo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
       </div>

       <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trip Slug (Custom URL)</label>
          <div className="flex items-center gap-2 bg-gray-50 px-8 py-4 rounded-2xl">
             <span className="text-gray-400 font-bold text-sm tracking-tight">traveloop.com/trip/</span>
             <input 
               className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-blue-600"
               value={formData.slug}
               onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
             />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trip Type</label>
             <div className="flex gap-2">
                {['National', 'International'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setFormData({ ...formData, type: t })}
                    className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${formData.type === t ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
             </div>
          </div>
          <div className="space-y-3">
             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visibility</label>
             <div className="flex gap-2">
                {['Private', 'Public'].map(v => (
                  <button 
                    key={v}
                    onClick={() => setFormData({ ...formData, visibility: v })}
                    className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all ${formData.visibility === v ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                  >
                    {v.toUpperCase()}
                  </button>
                ))}
             </div>
          </div>
       </div>
    </div>
  </div>
);

const Step2 = ({ formData, setFormData }: any) => {
  const today = new Date().toISOString().split('T')[0];
  const companions = [
    { id: 'Solo', icon: Smile },
    { id: 'Couple', icon: Heart },
    { id: 'Friends', icon: Users2 },
    { id: 'Family', icon: Home },
    { id: 'Colleague', icon: Briefcase }
  ];

  return (
    <div className="space-y-10">
      <div>
         <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">When & Who</h2>
         <p className="text-gray-400 font-bold">Define your timeline and travel party.</p>
      </div>

      <div className="space-y-8">
         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
               <input 
                 type="date"
                 min={today}
                 required
                 className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700"
                 value={formData.startDate}
                 onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
               <input 
                 type="date"
                 min={formData.startDate || today}
                 required
                 className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-bold text-gray-700"
                 value={formData.endDate}
                 onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
               />
            </div>
         </div>

         <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Traveling As</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
               {companions.map(comp => (
                 <button
                   key={comp.id}
                   onClick={() => setFormData({ ...formData, companionType: comp.id })}
                   className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${formData.companionType === comp.id ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-xl shadow-blue-100/50 scale-105' : 'border-gray-100 text-gray-400 hover:border-blue-200'}`}
                 >
                    <comp.icon className="w-8 h-8" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{comp.id}</span>
                 </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

const Step3 = ({ formData, setFormData }: any) => {
  const moods = [
    { id: 'Adventure', icon: Bike },
    { id: 'Food', icon: Coffee },
    { id: 'Luxury', icon: Star },
    { id: 'Nature', icon: Leaf },
    { id: 'Culture', icon: Landmark }
  ];

  return (
    <div className="space-y-10">
      <div>
         <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Preferences</h2>
         <p className="text-gray-400 font-bold">Personalize your AI recommendations.</p>
      </div>

      <div className="space-y-8">
         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Est. Budget</label>
               <input 
                 type="number"
                 placeholder="50,000"
                 className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-bold"
                 value={formData.budgetEstimate}
                 onChange={(e) => setFormData({ ...formData, budgetEstimate: e.target.value })}
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Currency</label>
               <select 
                 className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none font-bold text-gray-600"
                 value={formData.currency}
                 onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
               >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
               </select>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Travel Pace</label>
               <div className="flex bg-gray-50 p-2 rounded-2xl">
                  {['Relaxed', 'Moderate', 'Packed'].map(p => (
                    <button 
                      key={p}
                      onClick={() => setFormData({ ...formData, travelPace: p })}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${formData.travelPace === p ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transport</label>
               <div className="grid grid-cols-4 gap-2">
                  {[{id:'Flight', icon:Plane}, {id:'Train', icon:Train}, {id:'Bus', icon:Car}, {id:'Road', icon:Car}].map(tr => (
                    <button 
                      key={tr.id}
                      onClick={() => setFormData({ ...formData, transportType: tr.id })}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center ${formData.transportType === tr.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-50 text-gray-300'}`}
                    >
                       <tr.icon className="w-5 h-5" />
                    </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Trip Mood</label>
            <div className="grid grid-cols-5 gap-3">
               {moods.map(m => (
                 <button
                   key={m.id}
                   onClick={() => setFormData({ ...formData, mood: m.id })}
                   className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.mood === m.id ? 'border-gray-900 bg-gray-900 text-white shadow-xl' : 'border-gray-100 text-gray-400 hover:border-blue-200'}`}
                 >
                    <m.icon className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase">{m.id}</span>
                 </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

const Step4 = ({ formData, setFormData }: any) => (
  <div className="space-y-10">
    <div>
       <h2 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Final Touches</h2>
       <p className="text-gray-400 font-bold">Invite friends and review your setup.</p>
    </div>

    <div className="space-y-8">
       <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Invite Collaborators (Emails)</label>
          <div className="relative group">
             <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
             <input 
               placeholder="friend@example.com, buddy@travel.com"
               className="w-full pl-16 pr-6 py-5 rounded-2xl bg-gray-50 border-none font-bold text-gray-600"
               value={formData.invitees}
               onChange={(e) => setFormData({ ...formData, invitees: e.target.value })}
             />
          </div>
          <p className="text-[10px] text-gray-400 font-bold ml-1 italic">Separate multiple emails with commas.</p>
       </div>

       <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
             <div className="space-y-4">
                <div className="bg-white/20 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Confirmation Ready</div>
                <h3 className="text-3xl font-black">All systems go!</h3>
                <p className="text-blue-100 font-medium max-w-xs">Your personalized itinerary will be initialized with smart packing lists and destination advice.</p>
             </div>
             <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-xl">
                <Navigation className="w-12 h-12 text-white animate-pulse" />
             </div>
          </div>
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
       </div>
    </div>
  </div>
);

const SuccessAnimation = () => (
  <div className="h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
      className="w-40 h-40 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-blue-200"
    >
       <Plane className="w-20 h-20" />
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
       <h2 className="text-6xl font-black text-gray-900 tracking-tight mb-2">Safe Travels!</h2>
       <p className="text-xl text-gray-400 font-bold">Your adventure is being calculated and prepared...</p>
    </motion.div>
  </div>
);

export default CreateTrip;
