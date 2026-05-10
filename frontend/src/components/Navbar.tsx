import { Link, useNavigate } from 'react-router-dom';
import { Plane, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  if (userStr && userStr !== 'undefined') {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-purple-600 font-bold text-lg">
          <Plane className="w-6 h-6" />
          <span>Traveloop</span>
        </Link>

        {token ? (
          <div className="flex items-center gap-5 text-sm">
            <Link to="/dashboard" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Dashboard</Link>
            <Link to="/trips" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">My Trips</Link>
            <Link to="/explore" className="text-gray-600 hover:text-purple-600 font-medium transition-colors">Explore</Link>
            <div className="flex items-center gap-2.5 pl-3 border-l">
              <Link to="/profile" className="text-right hidden sm:block hover:opacity-80 transition-opacity">
                <p className="text-xs font-semibold">{user?.name}</p>
                <p className="text-[10px] text-gray-500">{user?.email}</p>
              </Link>
              <Link to="/profile" className="p-1.5 bg-gray-50 rounded-full hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition-all">
                 <UserIcon className="w-4.5 h-4.5" />
              </Link>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3.5 text-sm">
            <Link to="/login" className="text-gray-600 hover:text-purple-600 font-medium">Login</Link>
            <Link 
              to="/signup" 
              className="bg-purple-600 text-white px-3.5 py-1.5 rounded-lg font-medium hover:bg-purple-700 transition-colors"
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
