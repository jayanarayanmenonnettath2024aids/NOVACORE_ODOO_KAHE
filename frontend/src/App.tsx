import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import Explore from './pages/Explore';
import PublicTrip from './pages/PublicTrip';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import InvoiceDetails from './pages/InvoiceDetails';
import { SimpleHeader } from '@/components/ui/simple-header';
import IntroVideo from './pages/IntroVideo';
import { Chatbot } from './components/Chatbot';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function AppContent() {
  const location = useLocation();
  const isImmersivePage = ['/', '/login', '/signup'].includes(location.pathname);

  if (isImmersivePage) {
    return (
      <Routes>
        <Route path="/" element={<IntroVideo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {location.pathname !== '/admin-dashboard' && <SimpleHeader />}
      <main className={`flex-1 w-full ${location.pathname === '/admin-dashboard' ? 'p-0' : 'max-w-7xl mx-auto px-6 py-8'}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips" 
            element={
              <ProtectedRoute>
                <MyTrips />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-trip" 
            element={
              <ProtectedRoute>
                <CreateTrip />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trips/:id" 
            element={
              <ProtectedRoute>
                <TripDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute>
                <Explore />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/billing/:id" 
            element={
              <ProtectedRoute>
                <InvoiceDetails />
              </ProtectedRoute>
            } 
          />
          <Route path="/public/trips/:id" element={<PublicTrip />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Chatbot />
    </Router>
  );
}

export default App;
