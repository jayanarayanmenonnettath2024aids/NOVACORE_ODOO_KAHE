import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Globe, Sparkles, Shield, ArrowRight, ArrowUpRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-300" />,
      title: "AI Smart Generator",
      desc: "Instant personalized trip plans customized to your unique travel style and pacing."
    },
    {
      icon: <Globe className="w-6 h-6 text-fuchsia-300" />,
      title: "Global Discovery",
      desc: "Uncover hidden gems, local hotspots, and highly rated restaurants anywhere on earth."
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-300" />,
      title: "Smart Budgeting",
      desc: "Intelligent cost calculations to keep your dreams aligned with your financial parameters."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[url('/landing-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed relative select-none overflow-x-hidden flex flex-col justify-between">
      {/* Ambient Gradient Tint Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60 pointer-events-none" />

      {/* Floating Header */}
      <header className="relative w-full z-20 px-6 py-5 md:px-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white font-black text-xl tracking-wider">
          <span className="p-2 bg-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(147,51,234,0.5)]">
            <Compass className="w-5 h-5 text-white animate-pulse" />
          </span>
          <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Traveloop
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-white/90 font-semibold bg-white/10 backdrop-blur-md border border-white/10 px-8 py-2.5 rounded-full shadow-lg text-sm">
          <a href="#features" className="hover:text-purple-300 transition-colors">Features</a>
          <a href="#explore" className="hover:text-purple-300 transition-colors">Explore</a>
          <a href="#about" className="hover:text-purple-300 transition-colors">About</a>
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <Link to="/login" className="text-white hover:text-purple-300 font-bold transition-all px-4 py-2">
            Log In
          </Link>
          <Link to="/signup" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all cursor-pointer border border-purple-400/20 active:scale-95">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 md:px-16 flex-1 flex flex-col justify-center items-start pt-8 pb-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-black/30 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-white text-xs font-semibold w-fit">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Discover the Future of Trip Planning</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Your Ultimate <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-fuchsia-300 bg-clip-text text-transparent">
              AI Travel Co-Pilot
            </span>
          </h1>

          <p className="text-gray-200 text-sm md:text-base font-medium leading-relaxed max-w-2xl">
            Experience highly tailored, budget-optimized itineraries designed by artificial intelligence. Seamlessly map out destinations, hotels, activities, and manifest your perfect holiday.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-purple-50 text-black rounded-xl font-bold text-sm transition-all shadow-[0_4px_25px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_25px_rgba(147,51,234,0.3)] cursor-pointer active:scale-98"
            >
              <span>Begin Your Journey</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl font-bold text-sm transition-all backdrop-blur-md cursor-pointer active:scale-98"
            >
              <span>Explore Dashboard</span>
              <ArrowUpRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Floating Features Grid at bottom */}
      <section id="features" className="relative z-10 px-6 md:px-16 pb-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
              className="p-5 bg-black/20 backdrop-blur-lg border border-white/5 rounded-xl flex flex-col gap-2.5 hover:border-white/15 hover:bg-black/30 transition-all shadow-md"
            >
              <div className="p-2.5 bg-white/10 rounded-lg w-fit border border-white/10">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-gray-300 text-xs font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
