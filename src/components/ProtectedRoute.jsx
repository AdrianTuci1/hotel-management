import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingFallback from './LoadingFallback'; // Import a loading indicator

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show loading indicator while checking auth state
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Optional: Redirect to an unauthorized page or home if role is not allowed
    // For now, redirecting to home
    console.warn(`User with role '${role}' tried to access restricted route.`);
    return <Navigate to="/" replace />;
  }

  // Render the child component (Outlet for nested routes)
  return <Outlet />;
};

export default ProtectedRoute; 