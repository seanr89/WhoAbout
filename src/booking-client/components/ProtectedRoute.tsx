import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // Or a proper loading spinner
    }

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
