import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { staffMember, loading, isAdmin } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!staffMember) {
    // Not logged in or staff profile not found, redirect to login
    return <Navigate to="/welcome" replace />;
  }

  const hasRequiredRole = allowedRoles.includes(staffMember.role);
  const hasRequiredClaim = (allowedRoles.includes(Role.Admin) || allowedRoles.includes(Role.Owner)) && isAdmin;

  if (!hasRequiredRole && !hasRequiredClaim) {
    // Logged in but insufficient permissions, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;
