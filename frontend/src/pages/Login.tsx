import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Loader2, Plane } from 'lucide-react';
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
      setError(err.response?.data?.error || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: 'url("/login-bg.png")', // Using the local user-provided image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      {/* Solid White Login Card Container */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6 mt-20">
        <div className="bg-white rounded-[2rem] w-full max-w-[420px] p-10 shadow-2xl">
          
          {/* Logo Box */}
          <div className="flex justify-center mb-6">
             <div className="w-20 h-20 bg-[#6b21a8] rounded-2xl flex flex-col items-center justify-center text-white shadow-lg">
                <Plane className="w-8 h-8 mb-1" />
                <span className="text-[10px] font-black tracking-widest leading-none">traveloop</span>
             </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-gray-500 font-medium text-xs">Log in to your Traveloop account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 border border-red-100 text-xs font-bold p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="you@example.com"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-sm"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.email.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-gray-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    {...register('password', { required: 'Password is required' })}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-semibold text-sm"
                  />
                </div>
                {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.password.message as string}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-[11px] font-bold text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[11px] font-black text-blue-600 hover:text-blue-700 transition-colors">
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#2563eb] hover:bg-blue-700 text-white py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[11px] font-bold text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 font-black hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
