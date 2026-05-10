import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Shield, Bell, Moon, Trash2, Camera, 
  MapPin, Globe, Save, Loader2, Heart, ExternalLink 
} from 'lucide-react';
import api from '../api/axios';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [savedDests, setSavedDests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const [formData, setFormData] = useState({
    name: '',
    photoUrl: '',
    language: 'English (US)'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, savedRes] = await Promise.all([
          api.get('/user/profile'),
          api.get('/user/saved-destinations')
        ]);
        setUser(profileRes.data);
        setSavedDests(savedRes.data);
        setFormData({
          name: profileRes.data.name,
          photoUrl: profileRes.data.photoUrl || '',
          language: profileRes.data.language || 'English (US)'
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/user/profile', formData);
      setUser(response.data);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('ARE YOU SURE? This will permanently delete your account and all your trips.')) {
      try {
        await api.delete('/user/account');
        localStorage.clear();
        navigate('/signup');
      } catch (err) {
        alert('Failed to delete account');
      }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 text-purple-600 animate-spin" /></div>;

  const menuItems = [
    { id: 'profile', label: 'Public Profile', icon: User },
    { id: 'saved', label: 'Saved Places', icon: Heart },
    { id: 'account', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        
        <aside className="w-full lg:w-80 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] font-black transition-all ${
                  activeSection === item.id 
                    ? 'bg-purple-600 text-white shadow-2xl shadow-purple-200 scale-[1.02]' 
                    : 'text-gray-400 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="flex-1 bg-white p-12 rounded-[4rem] border border-gray-100 shadow-xl shadow-purple-50/50">
          {activeSection === 'profile' && (
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-10 pb-12 border-b border-gray-50">
                 <div className="relative group">
                    <div className="w-40 h-40 rounded-[3rem] bg-purple-50 flex items-center justify-center border-8 border-white shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                       {formData.photoUrl ? (
                         <img src={formData.photoUrl} className="w-full h-full object-cover" />
                       ) : (
                         <User className="w-20 h-20 text-purple-600" />
                       )}
                    </div>
                    <button className="absolute bottom-2 right-2 p-3 bg-purple-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all border-4 border-white">
                       <Camera className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="text-center md:text-left space-y-2">
                    <h2 className="text-base font-black text-gray-900 tracking-tight">{user.name}</h2>
                    <p className="text-gray-400 font-bold flex items-center justify-center md:justify-start gap-2 text-base">
                       <Mail className="w-5 h-5 text-purple-300" /> {user.email}
                    </p>
                    <div className="flex gap-3 mt-6">
                       <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-100">PLATINUM TIER</span>
                       <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100">BETA TESTER</span>
                    </div>
                 </div>
              </div>

              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Display Name</label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-8 py-5 rounded-3xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-black text-base"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Avatar Image URL</label>
                    <input 
                      value={formData.photoUrl}
                      placeholder="https://..."
                      onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                      className="w-full px-8 py-5 rounded-3xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-bold text-gray-600"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Interface Language</label>
                    <select 
                      value={formData.language}
                      onChange={(e) => setFormData({...formData, language: e.target.value})}
                      className="w-full px-8 py-5 rounded-3xl bg-gray-50 border-none focus:ring-4 focus:ring-purple-100 transition-all font-black appearance-none"
                    >
                       <option>English (US)</option>
                       <option>Spanish (ES)</option>
                       <option>French (FR)</option>
                       <option>German (DE)</option>
                       <option>Hindi (IN)</option>
                    </select>
                 </div>

                 <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6 md:col-span-2 border-t border-gray-50 mt-4">
                    <button 
                      type="button"
                      onClick={handleDelete}
                      className="text-red-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 px-8 py-4 rounded-2xl transition-all"
                    >
                       <Trash2 className="w-5 h-5" /> DEACTIVATE ACCOUNT
                    </button>
                    <button 
                      disabled={saving}
                      className="w-full md:w-auto bg-purple-600 text-white px-16 py-5 rounded-[2rem] font-black shadow-2xl shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                       {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> SAVE PROFILE</>}
                    </button>
                 </div>
              </form>
            </div>
          )}

          {activeSection === 'saved' && (
            <div className="space-y-10">
               <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-gray-900 tracking-tight">Saved Places</h3>
                  <span className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black">{savedDests.length} SAVED</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedDests.map((dest: any) => (
                    <div key={dest.id} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all group relative overflow-hidden">
                       <div className="relative z-10">
                          <h4 className="text-base font-black text-gray-900">{dest.cityName}</h4>
                          <p className="text-purple-600 font-black text-xs uppercase tracking-widest mt-1">{dest.country}</p>
                          <button className="mt-6 flex items-center gap-2 text-xs font-black text-gray-400 group-hover:text-purple-600 transition-colors">
                             <ExternalLink className="w-4 h-4" /> EXPLORE NOW
                          </button>
                       </div>
                       <Heart className="absolute -bottom-6 -right-6 w-32 h-32 text-purple-100 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  ))}
                  {savedDests.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
                       <Heart className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                       <p className="text-base font-black text-gray-300 italic">No saved destinations yet.</p>
                       <button onClick={() => navigate('/explore')} className="mt-6 text-purple-600 font-black text-sm hover:underline">Go explore cities</button>
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="py-20 text-center space-y-6">
               <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto text-gray-300">
                  <Shield className="w-12 h-12" />
               </div>
               <h3 className="text-base font-black text-gray-900 tracking-tight">Security & Privacy</h3>
               <p className="text-gray-500 max-w-sm mx-auto font-medium">Enhanced encryption and two-factor authentication are coming soon in the next major update.</p>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-10">
               <h3 className="text-base font-black text-gray-900 tracking-tight">Notifications</h3>
               <div className="space-y-6">
                 {[
                   { label: 'Trip Reminders', desc: 'Alerts 24h before travel events.' },
                   { label: 'Collaborator Sync', desc: 'Real-time updates from trip partners.' },
                   { label: 'AI Optimization', desc: 'Insights on cost-saving opportunities.' }
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-gray-100 transition-all">
                      <div>
                         <p className="text-base font-black text-gray-800">{item.label}</p>
                         <p className="text-sm text-gray-500 font-bold mt-1">{item.desc}</p>
                      </div>
                      <div className="w-14 h-8 bg-purple-600 rounded-full relative p-1.5 cursor-pointer shadow-lg shadow-purple-100">
                         <div className="w-5 h-5 bg-white rounded-full ml-auto shadow-sm"></div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
