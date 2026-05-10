import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, LogOut, User as UserIcon, Bell, Mail as MailIcon, Plus } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { label: 'Discover', path: '/explore' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Your Trips', path: '/trips' },
    { label: 'Archive', path: '#' },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-[2rem] px-6 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3 text-gray-900 font-black text-xl hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-md">
            <Plane className="w-5 h-5 rotate-45" />
          </div>
          <span className="tracking-tight text-gray-900">Traveloop</span>
        </Link>

        {token ? (
          <>
            <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl">
              {navItems.map((item) => (
                <Link 
                  key={item.label}
                  to={item.path} 
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                    location.pathname === item.path 
                      ? 'bg-teal-800 text-white shadow-lg' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link 
                to="/create-trip" 
                className="px-6 py-2 rounded-xl text-sm font-bold text-gray-900 hover:bg-white transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-orange-500" /> New Trip
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2.5 bg-gray-50 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2.5 bg-gray-50 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all">
                <MailIcon className="w-5 h-5" />
              </button>
              <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
              <Link to="/profile" className="flex items-center gap-3 pl-1 group">
                <img 
                  src={user?.photoUrl || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`} 
                  alt={user?.name} 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover:scale-105 transition-transform"
                />
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2.5 text-gray-400 hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-bold">Login</Link>
            <Link 
              to="/signup" 
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
