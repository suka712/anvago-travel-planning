import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

// Pages
import Landing from '@/pages/Landing';
import Discover from '@/pages/Discover';
import Results from '@/pages/Results';
import Itinerary from '@/pages/Itinerary';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Plan from '@/pages/Plan';
import Trip from '@/pages/Trip';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import AuthCallback from '@/pages/AuthCallback';

// Route guards
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminRoute from '@/components/auth/AdminRoute';

function App() {
  const { loadUser, isInitialized } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Show loading while checking auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4FC3F7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Anvago...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - no layout wrapper, pages handle their own layout */}
      <Route path="/" element={<Landing />} />
      <Route path="/discover" element={<Discover />} />
      <Route path="/results" element={<Results />} />
      <Route path="/itinerary/:id" element={<Itinerary />} />

      {/* Auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plan/:id" element={<Plan />} />
        <Route path="/trip/:id" element={<Trip />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
