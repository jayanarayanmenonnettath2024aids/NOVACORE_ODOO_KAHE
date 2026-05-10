import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, Compass } from 'lucide-react';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-start min-h-screen w-screen bg-[url('/auth-bg.png')] bg-cover bg-center bg-no-repeat pl-6 sm:pl-16 md:pl-28 pr-6 relative select-none overflow-hidden">
      {/* Brand Watermark */}
      <Link to="/" className="absolute top-8 left-8 sm:left-16 md:left-28 flex items-center gap-2 text-white/80 hover:text-white font-bold text-xl transition-all cursor-pointer">
        <Compass className="w-6 h-6 text-blue-400" />
        <span>Traveloop</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-black/30 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10"
      >
        <div className="text-left mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Welcome Back</h2>
          <p className="text-gray-300 mt-2 font-medium">Log in to continue your journey</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-300 rounded-xl text-sm font-semibold border border-red-500/20 backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                {...register('email', { required: 'Email is required' })}
                type="email" 
                className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-blue-400 focus:ring-blue-500/20'} text-white placeholder-white/30 rounded-xl focus:outline-none focus:ring-4 focus:bg-white/10 transition-all`}
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
                {...register('password', { required: 'Password is required' })}
                type="password" 
                className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-blue-400 focus:ring-blue-500/20'} text-white placeholder-white/30 rounded-xl focus:outline-none focus:ring-4 focus:bg-white/10 transition-all`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1.5 font-medium">{errors.password.message as string}</p>}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input type="checkbox" id="remember" className="rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/30 cursor-pointer" />
              <label htmlFor="remember" className="text-sm text-gray-300 font-medium cursor-pointer select-none">Remember me</label>
            </div>
            <Link to="/forgot-password" title="Forgot Password?" className="text-sm text-blue-300 font-bold hover:text-blue-200 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/20 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-300 font-medium">
          Don't have an account? <Link to="/signup" className="text-blue-300 font-bold hover:text-blue-200 hover:underline">Sign Up</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
