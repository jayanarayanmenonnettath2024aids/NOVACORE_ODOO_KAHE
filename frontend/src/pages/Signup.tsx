import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, Compass } from 'lucide-react';
import api from '../api/axios';

const Signup = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/signup', data);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-start min-h-screen w-full bg-[url('/auth-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed pl-6 sm:pl-16 md:pl-28 pr-6 relative select-none overflow-hidden">
      {/* Brand Watermark */}
      <Link to="/" className="absolute top-8 left-8 sm:left-16 md:left-28 flex items-center gap-2 text-white/80 hover:text-white font-bold text-base transition-all cursor-pointer">
        <Compass className="w-6 h-6 text-purple-400" />
        <span>Traveloop</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-black/30 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10"
      >
        <div className="text-left mb-8">
          <h2 className="text-base font-extrabold text-white tracking-tight drop-shadow-md">Join Traveloop</h2>
          <p className="text-gray-300 mt-2 font-medium">Start your travel planning journey today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-300 rounded-xl text-sm font-semibold border border-red-500/20 backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-purple-400 focus:ring-purple-500/20'} text-white placeholder-white/30 rounded-xl focus:outline-none focus:ring-4 focus:bg-white/10 transition-all`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-purple-400 focus:ring-purple-500/20'} text-white placeholder-white/30 rounded-xl focus:outline-none focus:ring-4 focus:bg-white/10 transition-all`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.email.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                type="password"
                className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-purple-400 focus:ring-purple-500/20'} text-white placeholder-white/30 rounded-xl focus:outline-none focus:ring-4 focus:bg-white/10 transition-all`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.password.message as string}</p>}
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3.5 rounded-xl font-bold active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-purple-400/20 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-300 font-medium">
          Already have an account? <Link to="/login" className="text-purple-300 font-bold hover:text-purple-200 hover:underline">Log In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
