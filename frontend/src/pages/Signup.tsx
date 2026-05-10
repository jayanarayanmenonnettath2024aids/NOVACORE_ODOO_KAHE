import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, Plane, Phone, MapPin, Globe, Info, Camera } from 'lucide-react';
import api from '../api/axios';

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    
    // Combine first and last name for the DB
    const payload = {
      ...data,
      name: `${data.firstName} ${data.lastName}`
    };

    try {
      await api.post('/auth/signup', payload);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: 'url("/Login page image.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      <div className="flex-1 flex items-center justify-center relative z-10 px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 lg:p-14 shadow-2xl overflow-hidden"
        >
          {/* Logo Box */}
          <div className="flex justify-center mb-8">
             <div className="w-16 h-16 bg-[#6b21a8] rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                <Plane className="w-7 h-7 mb-0.5" />
                <span className="text-[9px] font-black tracking-widest leading-none uppercase">traveloop</span>
             </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Create Identity</h2>
            <p className="text-gray-500 font-medium text-xs">Join the elite network of global travelers</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Photo Section */}
            <div className="flex flex-col items-center gap-4">
               <div className="w-24 h-24 bg-purple-50 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-inner relative group cursor-pointer overflow-hidden">
                  <Camera className="w-8 h-8 text-purple-200 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/5 transition-colors" />
               </div>
               <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Upload Profile Identity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">First Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('firstName', { required: 'Required' })}
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-sm"
                    placeholder="John"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">Last Name</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('lastName', { required: 'Required' })}
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-sm"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('email', { required: 'Required' })}
                    type="email"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('city')}
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-sm"
                    placeholder="San Francisco"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">Country</label>
                <div className="relative">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...register('country')}
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-sm"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register('password', { required: 'Required', minLength: 6 })}
                  type="password"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-gray-700 uppercase tracking-widest ml-1">Additional Information</label>
              <div className="relative">
                <Info className="absolute left-5 top-5 w-4 h-4 text-gray-400" />
                <textarea
                  {...register('bio')}
                  rows={2}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-sm resize-none"
                  placeholder="Internal notes or biography..."
                />
              </div>
            </div>

            <div className="pt-4 space-y-6 text-center">
              <button
                disabled={loading}
                type="submit"
                className="w-full py-4.5 bg-[#6b21a8] text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-200 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Identity'}
              </button>
              <p className="text-[11px] font-bold text-gray-400">
                Already verified? <Link to="/login" className="text-purple-600 hover:underline">Sign In Instead</Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
