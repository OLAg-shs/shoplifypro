import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const location = useLocation();

  if (!token || !userStr) {
    // Not logged in, redirect to buyer login as default
    return <Navigate to="/login/buyer" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Check if role is allowed
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User doesn't have permission for this route
      return <Navigate to="/" replace />;
    }
    
    // Authorized
    return children;
  } catch (error) {
    // Invalid user object in storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login/buyer" replace />;
  }
};

export default ProtectedRoute;
