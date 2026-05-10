import { Link, useNavigate } from 'react-router-dom';
import { Plane, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Plane className="w-8 h-8" />
          <span>Traveloop</span>
        </Link>

        {token ? (
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
            <Link to="/trips" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">My Trips</Link>
            <Link to="/explore" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Explore</Link>
            <div className="flex items-center gap-3 pl-4 border-l">
              <Link to="/profile" className="text-right hidden sm:block hover:opacity-80 transition-opacity">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </Link>
              <Link to="/profile" className="p-2 bg-gray-50 rounded-full hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all">
                 <UserIcon className="w-5 h-5" />
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium">Login</Link>
            <Link 
              to="/signup" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
