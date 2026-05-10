import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/layout/Navbar';
import { ToastProvider } from './components/ui/Toast';
import { PageTransition } from './components/ui/PageTransition';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import TripDetail from './pages/TripDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import PublicTrip from './pages/PublicTrip';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && !user?.isAdmin) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <Routes>
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/share/:shareId" element={<PageTransition><PublicTrip /></PageTransition>} />

        <Route
          path="*"
          element={
            <PrivateRoute>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
                    <Route path="/trips" element={<PageTransition><MyTrips /></PageTransition>} />
                    <Route path="/trips/new" element={<PageTransition><CreateTrip /></PageTransition>} />
                    <Route path="/trips/:id" element={<PageTransition><TripDetail /></PageTransition>} />
                    <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
                    <Route path="/admin" element={<PrivateRoute adminOnly><PageTransition><Admin /></PageTransition></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </main>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
