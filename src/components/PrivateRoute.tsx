import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user';
}

export default function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { currentUser, loading, isAdmin } = useAuth();

  if (loading) {
    // You could render a loading spinner here
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!currentUser) {
    // User is not logged in, redirect to login
    return <Navigate to="/login" />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    // User is not an admin but trying to access admin routes
    return <Navigate to="/" />;
  }

  // User is authenticated (and has required role if specified)
  return <>{children}</>;
}