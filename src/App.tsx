import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ApiProvider } from './contexts/ApiContext';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import AlumniPage from './pages/AlumniPage';
import AlumniDetailPage from './pages/AlumniDetailPage';
import AddAlumniPage from './pages/AddAlumniPage';
import FeedbackPage from './pages/FeedbackPage';
import FundraisingPage from './pages/FundraisingPage';
import FundraisingDetailPage from './pages/FundraisingDetailPage';
import DonationPage from './pages/DonationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAlumniPage from './pages/admin/AdminAlumniPage';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage';
import AdminFundraisingPage from './pages/admin/AdminFundraisingPage';
import ScraperPage from './pages/admin/ScraperPage';

// Private Routes Component
import PrivateRoute from './components/PrivateRoute';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ApiProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              {/* Public Routes with MainLayout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="alumni" element={<AlumniPage />} />
                <Route path="alumni/:id" element={<AlumniDetailPage />} />
                <Route path="alumni/add" element={<AddAlumniPage />} />
                <Route path="feedback" element={<FeedbackPage />} />
                <Route path="fundraising" element={<FundraisingPage />} />
                <Route path="fundraising/:id" element={<FundraisingDetailPage />} />
                <Route path="fundraising/:id/donate" element={<DonationPage />} />
              </Route>
              
              {/* Auth Pages */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Admin Routes with AdminLayout (Protected) */}
              <Route 
                path="/admin" 
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="alumni" element={<AdminAlumniPage />} />
                <Route path="feedback" element={<AdminFeedbackPage />} />
                <Route path="fundraising" element={<AdminFundraisingPage />} />
                <Route path="scraper" element={<ScraperPage />} />
              </Route>
              
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ApiProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;