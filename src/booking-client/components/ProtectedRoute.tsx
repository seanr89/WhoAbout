import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, staffMember, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/welcome" replace />;
  }

  // Force users to complete the first-time setup if missing profile or first login date
  if (!staffMember || !staffMember.firstLoginDate) {
    return <Navigate to="/first-time-setup" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
